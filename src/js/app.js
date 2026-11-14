/**
 * OX NEON - Main UI Controller & Flow Manager
 */

document.addEventListener('DOMContentLoaded', () => {
  // Sound & Engines
  const sound = window.sound;
  const game = window.gameEngine;
  const ai = window.aiEngine;
  const mp = window.multiplayerEngine;

  // DOM Elements
  const screens = {
    menu: document.getElementById('screen-menu'),
    game: document.getElementById('screen-game')
  };

  const modals = {
    play: document.getElementById('modal-play-select'),
    multiplayer: document.getElementById('modal-multiplayer'),
    gameover: document.getElementById('modal-gameover'),
    exit: document.getElementById('modal-exit')
  };

  // Nav Buttons
  const btnSound = document.getElementById('btn-sound');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnMenuPlay = document.getElementById('btn-menu-play');
  const btnMenuMultiplayer = document.getElementById('btn-menu-multiplayer');
  const btnMenuExit = document.getElementById('btn-menu-exit');

  // Play Mode Selection
  const btnModeLocal = document.getElementById('btn-mode-local');
  const btnModeAi = document.getElementById('btn-mode-ai');
  const aiConfigPanel = document.getElementById('ai-config-panel');
  const diffPills = document.querySelectorAll('.diff-pill');
  const symbolCards = document.querySelectorAll('.symbol-pick-card');
  const btnStartAiGame = document.getElementById('btn-start-ai-game');

  // Multiplayer Hub Elements
  const tabBtnHost = document.getElementById('tab-btn-host');
  const tabBtnJoin = document.getElementById('tab-btn-join');
  const tabPaneHost = document.getElementById('tab-pane-host');
  const tabPaneJoin = document.getElementById('tab-pane-join');
  const hostDigitBoxes = document.querySelectorAll('.host-digit');
  const btnRegenCode = document.getElementById('btn-regen-code');
  const btnCopyCode = document.getElementById('btn-copy-code');
  const btnShareLink = document.getElementById('btn-share-link');
  const btnToggleQr = document.getElementById('btn-toggle-qr');
  const qrContainer = document.getElementById('qr-container');
  const qrcodeDiv = document.getElementById('qrcode');
  const hostStatusText = document.getElementById('host-status-text');

  // Join Inputs
  const joinDigits = document.querySelectorAll('.join-digit');
  const btnPasteCode = document.getElementById('btn-paste-code');
  const btnJoinRoom = document.getElementById('btn-join-room');
  const joinStatusPill = document.getElementById('join-status-pill');

  // In-Game Elements
  const btnBackMenu = document.getElementById('btn-back-menu');
  const btnRestartGame = document.getElementById('btn-restart-game');
  const btnLeaveGame = document.getElementById('btn-leave-game');
  const modeBadge = document.getElementById('mode-badge');
  const cardPlayerX = document.getElementById('card-player-x');
  const cardPlayerO = document.getElementById('card-player-o');
  const playerXNameEl = document.getElementById('name-player-x');
  const playerONameEl = document.getElementById('name-player-o');
  const scoreXEl = document.getElementById('score-x');
  const scoreOEl = document.getElementById('score-o');
  const scoreTiesEl = document.getElementById('score-ties');
  const turnBanner = document.getElementById('turn-banner');
  const boardCells = document.querySelectorAll('.board-cell');
  const strikeOverlay = document.getElementById('strike-overlay');
  const reactionBar = document.getElementById('reaction-bar');
  const reactionButtons = document.querySelectorAll('.reaction-btn');
  const floatingEmojisContainer = document.getElementById('floating-emojis');

  // Game Over Elements
  const gameoverIcon = document.getElementById('gameover-icon');
  const gameoverTitle = document.getElementById('gameover-title');
  const gameoverDesc = document.getElementById('gameover-desc');
  const btnRematch = document.getElementById('btn-rematch');
  const btnGameoverMenu = document.getElementById('btn-gameover-menu');

  // Exit Modal Elements
  const btnCancelExit = document.getElementById('btn-cancel-exit');
  const btnConfirmExit = document.getElementById('btn-confirm-exit');

  // State Variables
  let selectedAiDiff = 'impossible';
  let selectedHumanSymbol = 'X';
  let qrInstance = null;
  let isAiThinking = false;
  let onlineRematchRequestedByMe = false;

  // Sound & Mute Setup
  function updateSoundIcon() {
    const isMuted = sound.isMuted();
    btnSound.innerHTML = isMuted 
      ? `<svg viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`
      : `<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
  }
  updateSoundIcon();

  btnSound.addEventListener('click', () => {
    sound.toggleMute();
    updateSoundIcon();
    sound.playClick();
    showToast(sound.isMuted() ? 'Sound Muted' : 'Sound Enabled');
  });

  // Fullscreen Toggle
  btnFullscreen.addEventListener('click', () => {
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Toast System
  function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('active');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      toast.classList.remove('active');
    }, 2400);
  }

  // Modal Open / Close Helpers
  function openModal(modal) {
    sound.playClick();
    modal.classList.add('active');
  }

  function closeModal(modal) {
    modal.classList.remove('active');
  }

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const modal = btn.closest('.modal-overlay');
      if (modal) closeModal(modal);
    });
  });

  // Close modal when tapping backdrop
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        sound.playClick();
        closeModal(modal);
      }
    });
  });

  // Screen Switching
  function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
  }

  // Quick Stats Update on Menu
  function updateMenuStats() {
    const totalWins = game.scores.X + game.scores.O;
    const winsEl = document.getElementById('stat-total-wins');
    const tiesEl = document.getElementById('stat-total-ties');
    const matchesEl = document.getElementById('stat-total-matches');

    if (winsEl) winsEl.textContent = totalWins;
    if (tiesEl) tiesEl.textContent = game.scores.ties;
    if (matchesEl) matchesEl.textContent = totalWins + game.scores.ties;
  }
  updateMenuStats();

  /* ==========================================================================
     MAIN MENU BUTTONS (Play, Multiplayer, Exit)
     ========================================================================== */

  // 1. PLAY BUTTON
  btnMenuPlay.addEventListener('click', () => {
    openModal(modals.play);
  });

  // 2. MULTIPLAYER BUTTON
  btnMenuMultiplayer.addEventListener('click', () => {
    openModal(modals.multiplayer);
    initializeHostTab();
  });

  // 3. EXIT BUTTON
  btnMenuExit.addEventListener('click', () => {
    openModal(modals.exit);
  });

  // Exit Modal Cancel & Confirm
  btnCancelExit.addEventListener('click', () => {
    closeModal(modals.exit);
    sound.playClick();
  });

  btnConfirmExit.addEventListener('click', () => {
    sound.playClick();
    closeModal(modals.exit);
    
    // Call Native Android Bridge to completely exit the app
    if (window.AndroidBridge && typeof window.AndroidBridge.exitApp === 'function') {
      window.AndroidBridge.exitApp();
      return;
    }

    // Call Native Windows desktop bridge to completely exit the app
    if (window.pywebview && window.pywebview.api && typeof window.pywebview.api.exitApp === 'function') {
      window.pywebview.api.exitApp();
      return;
    }

    // Fallback for desktop / standard browser tabs
    try {
      window.close();
    } catch (e) {}

    document.body.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; text-align:center; padding:20px; font-family:'Outfit', sans-serif;">
        <div style="width:72px; height:72px; border-radius:50%; background:rgba(99,102,241,0.2); display:flex; align-items:center; justify-content:center; margin-bottom:16px;">
          <svg style="width:36px; height:36px; stroke:#6366f1; fill:none; stroke-width:2;" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
        </div>
        <h1 style="font-size:2rem; font-weight:800; color:#fff; margin-bottom:8px;">Thanks for playing!</h1>
        <p style="color:#94a3b8; max-width:320px; margin-bottom:24px;">You have exited the session.</p>
        <button onclick="location.reload()" style="padding:12px 28px; border-radius:12px; background:linear-gradient(135deg, #6366f1, #a855f7); color:#fff; font-weight:700; border:none; cursor:pointer;">Return to Game</button>
      </div>
    `;
  });

  // Global Hardware / Gesture Back Button Handler for Android
  window.handleHardwareBack = function() {
    // 1. If any modal is open, close it
    const activeModals = document.querySelectorAll('.modal-overlay.active');
    if (activeModals.length > 0) {
      activeModals.forEach(m => m.classList.remove('active'));
      return 'handled';
    }

    // 2. If in Game Arena, go back to Main Menu
    if (screens.game && screens.game.classList.contains('active')) {
      if (game.gameMode === 'online') {
        if (confirm('Leave online match?')) {
          mp.cleanup();
          showScreen('menu');
        }
      } else {
        showScreen('menu');
      }
      return 'handled';
    }

    // 3. If on Main Menu, open Exit confirmation modal
    if (screens.menu && screens.menu.classList.contains('active')) {
      if (modals.exit && modals.exit.classList.contains('active')) {
        // Double back exits app
        if (window.AndroidBridge && typeof window.AndroidBridge.exitApp === 'function') {
          window.AndroidBridge.exitApp();
        }
        return 'exit';
      } else {
        openModal(modals.exit);
        return 'handled';
      }
    }

    return 'default';
  };

  /* ==========================================================================
     PLAY SELECTION (Local 2P or vs AI)
     ========================================================================== */

  // Local Pass & Play
  btnModeLocal.addEventListener('click', () => {
    sound.playClick();
    closeModal(modals.play);
    startMatch('local');
  });

  // vs AI Button - Toggles config panel
  btnModeAi.addEventListener('click', () => {
    sound.playClick();
    aiConfigPanel.classList.toggle('active');
  });

  // Difficulty selection
  diffPills.forEach(pill => {
    pill.addEventListener('click', () => {
      sound.playClick();
      diffPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedAiDiff = pill.dataset.diff;
    });
  });

  // Symbol selection (X or O)
  symbolCards.forEach(card => {
    card.addEventListener('click', () => {
      sound.playClick();
      symbolCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedHumanSymbol = card.dataset.symbol;
    });
  });

  // Start AI Game
  btnStartAiGame.addEventListener('click', () => {
    sound.playClick();
    closeModal(modals.play);
    startMatch('ai', {
      aiDifficulty: selectedAiDiff,
      humanSymbol: selectedHumanSymbol
    });
  });

  /* ==========================================================================
     MULTIPLAYER HUB (4-Digit Room Code Host & Join)
     ========================================================================== */

  // Switch between Host & Join Tabs
  tabBtnHost.addEventListener('click', () => {
    sound.playClick();
    tabBtnHost.classList.add('active');
    tabBtnJoin.classList.remove('active');
    tabPaneHost.classList.add('active');
    tabPaneJoin.classList.remove('active');
    initializeHostTab();
  });

  tabBtnJoin.addEventListener('click', () => {
    sound.playClick();
    tabBtnJoin.classList.add('active');
    tabBtnHost.classList.remove('active');
    tabPaneJoin.classList.add('active');
    tabPaneHost.classList.remove('active');
    joinDigits[0].focus();
  });

  // Initialize Host Room
  function initializeHostTab() {
    hostStatusText.textContent = 'Generating 4-digit room code...';
    mp.hostRoom()
      .then(code => {
        displayHostCode(code);
        hostStatusText.textContent = 'Waiting for opponent to connect...';
        setupQrCode(code);
      })
      .catch(err => {
        hostStatusText.textContent = 'Failed to create room. Click refresh.';
      });
  }

  function displayHostCode(code) {
    const chars = code.toString().split('');
    hostDigitBoxes.forEach((box, i) => {
      box.textContent = chars[i] || '-';
      box.classList.add('pulse');
    });
  }

  // Regenerate Code
  btnRegenCode.addEventListener('click', () => {
    sound.playClick();
    initializeHostTab();
  });

  // Copy Code to Clipboard
  btnCopyCode.addEventListener('click', () => {
    sound.playClick();
    if (mp.roomCode) {
      navigator.clipboard.writeText(mp.roomCode).then(() => {
        showToast(`Code ${mp.roomCode} copied!`);
      }).catch(() => {
        showToast(`Code is: ${mp.roomCode}`);
      });
    }
  });

  // Copy Direct Link with 4-Digit Code
  btnShareLink.addEventListener('click', () => {
    sound.playClick();
    if (mp.roomCode) {
      const shareUrl = `${window.location.origin}${window.location.pathname}?join=${mp.roomCode}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Invite link copied!');
      }).catch(() => {
        showToast('Share link copied to clipboard');
      });
    }
  });

  // QR Code Generation
  function setupQrCode(code) {
    if (typeof QRCode !== 'undefined' && qrcodeDiv) {
      qrcodeDiv.innerHTML = '';
      const shareUrl = `${window.location.origin}${window.location.pathname}?join=${code}`;
      qrInstance = new QRCode(qrcodeDiv, {
        text: shareUrl,
        width: 160,
        height: 160,
        colorDark: '#0a0d14',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  }

  btnToggleQr.addEventListener('click', () => {
    sound.playClick();
    qrContainer.classList.toggle('active');
  });

  // Join Tab 4-Digit Input Auto-Advance & Paste
  joinDigits.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      input.value = val ? val[val.length - 1] : '';

      if (input.value && index < joinDigits.length - 1) {
        joinDigits[index + 1].focus();
      }

      checkJoinInputComplete();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        joinDigits[index - 1].focus();
      }
    });

    // Auto-paste on first input
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
      fillJoinCode(pasteData);
    });
  });

  function fillJoinCode(str) {
    const digits = str.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 4) {
      digits.split('').forEach((d, idx) => {
        if (joinDigits[idx]) joinDigits[idx].value = d;
      });
      joinDigits[3].focus();
      checkJoinInputComplete();
    }
  }

  function getEnteredJoinCode() {
    return Array.from(joinDigits).map(input => input.value).join('');
  }

  function checkJoinInputComplete() {
    const code = getEnteredJoinCode();
    btnJoinRoom.disabled = code.length !== 4;
  }

  btnPasteCode.addEventListener('click', async () => {
    sound.playClick();
    try {
      const text = await navigator.clipboard.readText();
      fillJoinCode(text);
      showToast('Code pasted!');
    } catch (err) {
      showToast('Could not access clipboard');
    }
  });

  // Join Room Action
  btnJoinRoom.addEventListener('click', () => {
    sound.playClick();
    const code = getEnteredJoinCode();
    if (code.length !== 4) return;

    btnJoinRoom.disabled = true;
    joinStatusPill.className = 'status-pill';
    joinStatusPill.textContent = 'Connecting to room ' + code + '...';

    mp.joinRoom(code)
      .then(() => {
        joinStatusPill.className = 'status-pill success';
        joinStatusPill.textContent = 'Connected! Entering game...';
      })
      .catch(err => {
        btnJoinRoom.disabled = false;
        joinStatusPill.className = 'status-pill error';
        joinStatusPill.textContent = err.message || 'Room not found. Check 4-digit code.';
      });
  });

  // Check URL Params for instant join (e.g., opened via QR code or shared link)
  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode && joinCode.length === 4) {
      openModal(modals.multiplayer);
      tabBtnJoin.click();
      fillJoinCode(joinCode);
      setTimeout(() => {
        btnJoinRoom.click();
      }, 500);
    }
  }
  checkUrlParams();

  // Multiplayer Engine Event Listeners
  mp.on('game_ready', (data) => {
    closeModal(modals.multiplayer);
    showToast('Match connected! Good luck!');
    startMatch('online', {
      isOnlineHost: mp.isHost
    });
  });

  mp.on('opponent_move', (data) => {
    handleOpponentMove(data.index);
  });

  mp.on('opponent_disconnected', () => {
    showToast('Opponent disconnected from room');
    if (game.gameMode === 'online' && !game.isGameOver) {
      gameoverIcon.className = 'winner-icon-bubble draw';
      gameoverIcon.textContent = '⚠️';
      gameoverTitle.textContent = 'Opponent Left';
      gameoverDesc.textContent = 'Your opponent disconnected from the match.';
      btnRematch.style.display = 'none';
      openModal(modals.gameover);
    }
  });

  mp.on('rematch_requested', () => {
    showToast('Opponent wants a rematch!');
    if (onlineRematchRequestedByMe) {
      // Both clicked rematch!
      mp.sendRematchAccept('X');
      resetRoundForNewGame();
    } else {
      btnRematch.textContent = 'Accept Rematch';
      btnRematch.classList.add('pulse');
    }
  });

  mp.on('rematch_accepted', () => {
    resetRoundForNewGame();
  });

  mp.on('opponent_reaction', (data) => {
    triggerFloatingEmoji(data.emoji, false);
  });

  /* ==========================================================================
     GAME ARENA LOGIC & RENDERING
     ========================================================================== */

  function startMatch(mode, options = {}) {
    game.startNewGame({
      mode,
      aiDifficulty: options.aiDifficulty,
      humanSymbol: options.humanSymbol,
      isOnlineHost: options.isOnlineHost
    });

    // Update Mode Badge
    if (mode === 'local') {
      modeBadge.textContent = 'Pass & Play';
      reactionBar.style.display = 'none';
    } else if (mode === 'ai') {
      modeBadge.textContent = `VS AI (${options.aiDifficulty.toUpperCase()})`;
      reactionBar.style.display = 'none';
    } else if (mode === 'online') {
      modeBadge.textContent = `Online Room #${mp.roomCode}`;
      reactionBar.style.display = 'flex';
    }

    // Update Names
    playerXNameEl.textContent = game.playerXName;
    playerONameEl.textContent = game.playerOName;

    // Reset scores display
    scoreXEl.textContent = game.scores.X;
    scoreOEl.textContent = game.scores.O;
    scoreTiesEl.textContent = game.scores.ties;

    // Clear board UI
    renderBoard();
    updateTurnDisplay();

    showScreen('game');

    // If AI goes first
    if (game.gameMode === 'ai' && game.currentTurn === game.aiSymbol) {
      triggerAiMove();
    }
  }

  function renderBoard() {
    strikeOverlay.innerHTML = '';
    boardCells.forEach((cell, idx) => {
      cell.className = 'board-cell';
      cell.innerHTML = '';
      const val = game.board[idx];
      if (val) {
        cell.classList.add('taken');
        cell.appendChild(createSymbolSvg(val));
      }
    });
  }

  function createSymbolSvg(symbol) {
    const wrap = document.createElement('div');
    wrap.className = 'cell-symbol';

    if (symbol === 'X') {
      wrap.innerHTML = `
        <svg class="svg-x" viewBox="0 0 100 100">
          <line class="glow-stroke" x1="22" y1="22" x2="78" y2="78" />
          <line class="core-stroke" x1="22" y1="22" x2="78" y2="78" />
          <line class="glow-stroke" x1="78" y1="22" x2="22" y2="78" />
          <line class="core-stroke" x1="78" y1="22" x2="22" y2="78" />
        </svg>
      `;
    } else {
      wrap.innerHTML = `
        <svg class="svg-o" viewBox="0 0 100 100">
          <circle class="glow-stroke" cx="50" cy="50" r="32" />
          <circle class="core-stroke" cx="50" cy="50" r="32" />
        </svg>
      `;
    }
    return wrap;
  }

  function updateTurnDisplay() {
    cardPlayerX.classList.toggle('active-turn', game.currentTurn === 'X');
    cardPlayerO.classList.toggle('active-turn', game.currentTurn === 'O');

    turnBanner.className = `turn-banner ${game.currentTurn.toLowerCase()}-turn`;

    if (game.gameMode === 'ai') {
      if (game.currentTurn === game.humanSymbol) {
        turnBanner.textContent = "Your Turn (" + game.humanSymbol + ")";
      } else {
        turnBanner.textContent = "AI is thinking...";
      }
    } else if (game.gameMode === 'online') {
      if (game.currentTurn === mp.mySymbol) {
        turnBanner.textContent = "Your Turn (" + mp.mySymbol + ")";
      } else {
        turnBanner.textContent = "Opponent's Turn (" + mp.opponentSymbol + ")";
      }
    } else {
      turnBanner.textContent = `Player ${game.currentTurn}'s Turn`;
    }
  }

  // Handle cell click
  boardCells.forEach((cell, idx) => {
    cell.addEventListener('click', () => {
      handleCellClick(idx);
    });
  });

  function handleCellClick(index) {
    if (game.isGameOver) return;
    if (game.board[index] !== null) return;

    // In AI mode, ignore click if it's AI's turn or AI is calculating
    if (game.gameMode === 'ai' && (game.currentTurn !== game.humanSymbol || isAiThinking)) {
      return;
    }

    // In Online mode, ignore click if it's not our turn
    if (game.gameMode === 'online' && game.currentTurn !== mp.mySymbol) {
      showToast("Wait for opponent's move!");
      return;
    }

    // Execute Move
    executeMove(index);

    // If online, broadcast to opponent
    if (game.gameMode === 'online') {
      mp.sendMove(index, mp.mySymbol);
    }
  }

  function handleOpponentMove(index) {
    if (game.isGameOver) return;
    executeMove(index);
  }

  function executeMove(index) {
    const symbol = game.currentTurn;
    const result = game.makeMove(index);
    if (!result.success) return;

    // Haptic & Sound
    sound.vibrate(25);
    if (symbol === 'X') sound.playXMove();
    else sound.playOMove();

    // Render tile with GPU spring pop
    const cell = boardCells[index];
    cell.classList.remove('cell-placed');
    void cell.offsetWidth;
    cell.classList.add('taken', 'cell-placed');
    cell.appendChild(createSymbolSvg(symbol));

    // Update Scores
    scoreXEl.textContent = game.scores.X;
    scoreOEl.textContent = game.scores.O;
    scoreTiesEl.textContent = game.scores.ties;
    updateMenuStats();

    if (result.result === 'win') {
      const winScoreEl = result.winner === 'X' ? scoreXEl : scoreOEl;
      if (winScoreEl) {
        winScoreEl.classList.remove('score-pop');
        void winScoreEl.offsetWidth;
        winScoreEl.classList.add('score-pop');
      }
      handleGameWin(result.winner, result.winningPattern);
    } else if (result.result === 'tie') {
      handleGameTie();
    } else {
      updateTurnDisplay();
      // If AI mode and it's now AI's turn
      if (game.gameMode === 'ai' && game.currentTurn === game.aiSymbol) {
        triggerAiMove();
      }
    }
  }

  function triggerAiMove() {
    isAiThinking = true;
    updateTurnDisplay();

    // Subtle natural reaction delay
    const delay = Math.floor(350 + Math.random() * 250);
    setTimeout(() => {
      if (game.isGameOver) {
        isAiThinking = false;
        return;
      }
      const bestMove = ai.getBestMove(game.board, game.aiSymbol, game.humanSymbol, game.aiDifficulty);
      isAiThinking = false;
      if (bestMove !== null && game.board[bestMove] === null) {
        executeMove(bestMove);
      }
    }, delay);
  }

  // Draw Dynamic Winning Strike Line
  function drawStrikeLine(pattern, winner) {
    const cellA = boardCells[pattern[0]];
    const cellC = boardCells[pattern[2]];
    const boardRect = document.querySelector('.game-board').getBoundingClientRect();

    const rectA = cellA.getBoundingClientRect();
    const rectC = cellC.getBoundingClientRect();

    const x1 = rectA.left + rectA.width / 2 - boardRect.left;
    const y1 = rectA.top + rectA.height / 2 - boardRect.top;
    const x2 = rectC.left + rectC.width / 2 - boardRect.left;
    const y2 = rectC.top + rectC.height / 2 - boardRect.top;

    strikeOverlay.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 ${boardRect.width} ${boardRect.height}">
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="winning-strike-glow line-${winner.toLowerCase()}" />
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="winning-strike-core line-${winner.toLowerCase()}" />
      </svg>
    `;

    pattern.forEach(idx => {
      boardCells[idx].classList.add('winning-cell');
    });
  }

  // Celebratory Confetti Burst
  function fireConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f2fe', '#ff0844', '#6366f1', '#a855f7', '#f59e0b']
      });
    }
  }

  function handleGameWin(winner, pattern) {
    sound.playWin();
    sound.vibrate([60, 50, 120]);
    drawStrikeLine(pattern, winner);
    fireConfetti();

    setTimeout(() => {
      gameoverIcon.className = `winner-icon-bubble ${winner.toLowerCase()}-won`;
      gameoverIcon.textContent = winner;

      let title = `Player ${winner} Wins!`;
      let desc = `Connected 3 in a row!`;

      if (game.gameMode === 'ai') {
        if (winner === game.humanSymbol) {
          title = 'You Won! 🎉';
          desc = 'Spectacular victory against AI!';
        } else {
          title = 'AI Won!';
          desc = 'Better luck next round!';
        }
      } else if (game.gameMode === 'online') {
        if (winner === mp.mySymbol) {
          title = 'Victory! 🏆';
          desc = 'You defeated your online opponent!';
        } else {
          title = 'Defeat';
          desc = 'Opponent connected 3 in a row.';
        }
      }

      gameoverTitle.textContent = title;
      gameoverDesc.textContent = desc;
      btnRematch.style.display = 'block';
      btnRematch.textContent = 'Play Again (Rematch)';
      btnRematch.classList.remove('pulse');
      onlineRematchRequestedByMe = false;

      openModal(modals.gameover);
    }, 1100);
  }

  function handleGameTie() {
    sound.playDraw();
    sound.vibrate(40);

    setTimeout(() => {
      gameoverIcon.className = 'winner-icon-bubble draw';
      gameoverIcon.textContent = '=';
      gameoverTitle.textContent = "It's a Draw!";
      gameoverDesc.textContent = 'A hard-fought stalemate with no open moves.';
      btnRematch.style.display = 'block';
      btnRematch.textContent = 'Play Again';
      btnRematch.classList.remove('pulse');
      onlineRematchRequestedByMe = false;

      openModal(modals.gameover);
    }, 800);
  }

  // Rematch / Next Round
  function resetRoundForNewGame() {
    closeModal(modals.gameover);
    game.resetRound();
    renderBoard();
    updateTurnDisplay();

    if (game.gameMode === 'ai' && game.currentTurn === game.aiSymbol) {
      triggerAiMove();
    }
  }

  btnRematch.addEventListener('click', () => {
    sound.playClick();
    if (game.gameMode === 'online') {
      onlineRematchRequestedByMe = true;
      btnRematch.textContent = 'Waiting for opponent...';
      btnRematch.disabled = true;
      mp.sendRematchRequest();
      showToast('Rematch request sent to opponent!');
    } else {
      resetRoundForNewGame();
    }
  });

  btnGameoverMenu.addEventListener('click', () => {
    sound.playClick();
    closeModal(modals.gameover);
    if (game.gameMode === 'online') {
      mp.cleanup();
    }
    showScreen('menu');
  });

  // Game Arena Controls (Back / Reset / Leave)
  btnBackMenu.addEventListener('click', () => {
    sound.playClick();
    if (game.gameMode === 'online') {
      if (confirm('Leave online match?')) {
        mp.cleanup();
        showScreen('menu');
      }
    } else {
      showScreen('menu');
    }
  });

  btnRestartGame.addEventListener('click', () => {
    sound.playClick();
    if (game.gameMode === 'online') {
      showToast('Click Rematch to sync with opponent');
    } else {
      resetRoundForNewGame();
    }
  });

  btnLeaveGame.addEventListener('click', () => {
    btnBackMenu.click();
  });

  // Emoji Reactions (Online mode)
  reactionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.dataset.emoji || btn.textContent.trim();
      sound.playReaction();
      triggerFloatingEmoji(emoji, true);

      if (game.gameMode === 'online') {
        mp.sendReaction(emoji);
      }
    });
  });

  function triggerFloatingEmoji(emoji, isMine) {
    const el = document.createElement('div');
    el.className = 'floating-emoji';
    el.textContent = emoji;

    // Stagger horizontal position
    const minLeft = isMine ? 25 : 55;
    const maxLeft = isMine ? 45 : 75;
    const leftPercent = Math.floor(minLeft + Math.random() * (maxLeft - minLeft));
    el.style.left = `${leftPercent}%`;

    floatingEmojisContainer.appendChild(el);
    setTimeout(() => {
      el.remove();
    }, 2300);
  }
});
