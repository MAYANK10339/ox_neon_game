/**
 * OX NEON - Main UI Controller & Flow Manager (Version 2.0)
 * Handles:
 * - Dynamic Grid Sizes (3x3, 5x5, 10x10)
 * - Push-to-Talk Voice Chat with Live Recording Visuals & Instant Opponent Playback
 * - Real-Time In-Game Text Chat with Notifications & Audio Waveforms
 * - Unbeatable AI & Offline Pass & Play
 * - Seamless WebRTC P2P Multiplayer
 * - Android & Windows Native Exit Bridges
 */

document.addEventListener('DOMContentLoaded', () => {
  // Engines & Utilities
  const sound = window.sound;
  const game = window.gameEngine;
  const ai = window.aiEngine;
  const mp = window.multiplayerEngine;
  const economy = window.economy;

  // DOM Screens
  const screens = {
    menu: document.getElementById('screen-menu'),
    game: document.getElementById('screen-game')
  };

  // Modals
  const modals = {
    play: document.getElementById('modal-play-select'),
    multiplayer: document.getElementById('modal-multiplayer'),
    gameover: document.getElementById('modal-gameover'),
    exit: document.getElementById('modal-exit'),
    shop: document.getElementById('modal-shop')
  };

  // Navigation & Economy Buttons
  const btnSound = document.getElementById('btn-sound');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnCoinPill = document.getElementById('btn-coin-pill');
  const navCoinCount = document.getElementById('nav-coin-count');
  const headerUserBadge = document.getElementById('header-user-badge');
  const btnMenuPlay = document.getElementById('btn-menu-play');
  const btnMenuMultiplayer = document.getElementById('btn-menu-multiplayer');
  const btnMenuShop = document.getElementById('btn-menu-shop');
  const btnMenuExit = document.getElementById('btn-menu-exit');

  // Vault & Badges Shop Elements
  const vaultCoinAmount = document.getElementById('vault-coin-amount');
  const secretCodeInput = document.getElementById('secret-code-input');
  const btnRedeemCode = document.getElementById('btn-redeem-code');
  const redeemFeedback = document.getElementById('redeem-feedback');
  const badgeCards = document.querySelectorAll('.badge-shop-card');
  const badgePlayerX = document.getElementById('badge-player-x');
  const badgePlayerO = document.getElementById('badge-player-o');
  const gameoverCoinReward = document.getElementById('gameover-coin-reward');
  const rewardCoinText = document.getElementById('reward-coin-text');

  // Play Mode Selection & Grid Pills
  const btnModeLocal = document.getElementById('btn-mode-local');
  const btnModeAi = document.getElementById('btn-mode-ai');
  const aiConfigPanel = document.getElementById('ai-config-panel');
  const playGridPills = document.querySelectorAll('#play-grid-pills .grid-size-pill');
  const diffPills = document.querySelectorAll('.diff-pill');
  const symbolCards = document.querySelectorAll('.symbol-pick-card');
  const btnStartAiGame = document.getElementById('btn-start-ai-game');

  // Multiplayer Hub Elements
  const tabBtnHost = document.getElementById('tab-btn-host');
  const tabBtnJoin = document.getElementById('tab-btn-join');
  const tabPaneHost = document.getElementById('tab-pane-host');
  const tabPaneJoin = document.getElementById('tab-pane-join');
  const hostGridPills = document.querySelectorAll('#host-grid-pills .grid-size-pill');
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
  const boardWrapper = document.getElementById('board-wrapper');
  const gameBoard = document.getElementById('game-board');
  const strikeOverlay = document.getElementById('strike-overlay');

  // Communication & Voice Chat Elements
  const mpCommBar = document.getElementById('mp-comm-bar');
  const btnToggleChat = document.getElementById('btn-toggle-chat');
  const unreadChatBadge = document.getElementById('unread-chat-badge');
  const btnPushToTalk = document.getElementById('btn-push-to-talk');
  const pttLabel = document.getElementById('ptt-label');
  const recordingToast = document.getElementById('recording-toast');
  const recDuration = document.getElementById('rec-duration');
  const btnMicCancel = document.getElementById('btn-mic-cancel');

  // Chat Drawer Elements
  const chatDrawer = document.getElementById('chat-drawer');
  const btnCloseChat = document.getElementById('btn-close-chat');
  const chatMessagesList = document.getElementById('chat-messages-list');
  const chatInputForm = document.getElementById('chat-input-form');
  const chatInputText = document.getElementById('chat-input-text');

  // Floating Notification Banner Elements
  const floatingCommBanner = document.getElementById('floating-comm-banner');
  const bannerIconBubble = document.getElementById('banner-icon-bubble');
  const bannerAuthor = document.getElementById('banner-author');
  const bannerContent = document.getElementById('banner-content');
  const bannerAudioWaves = document.getElementById('banner-audio-waves');

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
  let selectedPlayGridSize = 3;
  let selectedHostGridSize = 3;
  let selectedAiDiff = 'impossible';
  let selectedHumanSymbol = 'X';
  let qrInstance = null;
  let isAiThinking = false;
  let onlineRematchRequestedByMe = false;
  let unreadCount = 0;
  let isRecordingVoice = false;
  let recTimerInterval = null;
  let bannerTimer = null;

  /* ==========================================================================
     AUDIO SETUP & SOUND TOGGLE
     ========================================================================== */
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

  // Modal Helpers
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

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        sound.playClick();
        closeModal(modal);
      }
    });
  });

  function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
  }

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
     MAIN MENU NAVIGATION
     ========================================================================== */
  btnMenuPlay.addEventListener('click', () => {
    openModal(modals.play);
  });

  btnMenuMultiplayer.addEventListener('click', () => {
    openModal(modals.multiplayer);
    initializeHostTab();
  });

  if (btnMenuShop) {
    btnMenuShop.addEventListener('click', () => {
      openModal(modals.shop);
      updateShopUI();
    });
  }

  if (btnCoinPill) {
    btnCoinPill.addEventListener('click', () => {
      openModal(modals.shop);
      updateShopUI();
    });
  }

  /* ==========================================================================
     OX VAULT & BADGE SHOP (ECONOMY SYSTEM & SECRET CODES)
     ========================================================================== */
  function updateEconomyUI() {
    if (!economy) return;
    const coins = economy.getCoins();
    if (navCoinCount) navCoinCount.textContent = coins.toLocaleString();
    if (vaultCoinAmount) vaultCoinAmount.textContent = coins.toLocaleString();

    const equipped = economy.getEquippedBadge();
    if (headerUserBadge) {
      if (equipped) {
        headerUserBadge.innerHTML = economy.renderBadgeHtml(equipped);
        headerUserBadge.style.display = 'inline-flex';
      } else {
        headerUserBadge.innerHTML = '';
        headerUserBadge.style.display = 'none';
      }
    }

    if (mp) {
      mp.setMyBadge(equipped);
    }

    updateShopUI();
  }

  function updateShopUI() {
    if (!economy) return;
    const coins = economy.getCoins();
    const equipped = economy.getEquippedBadge();

    badgeCards.forEach(card => {
      const badgeId = card.dataset.badgeId;
      const btn = card.querySelector('.btn-badge-action');
      if (!btn || !badgeId) return;

      const badge = economy.BADGES[badgeId];
      if (!badge) return;

      const owned = economy.hasBadge(badgeId);

      btn.className = 'btn-badge-action';
      if (!owned) {
        const canAfford = coins >= badge.cost;
        if (badgeId === 'xer_verified') {
          btn.classList.add('state-buy-xer');
        } else {
          btn.classList.add('state-buy');
        }

        if (canAfford) {
          btn.textContent = `Unlock for ${badge.cost.toLocaleString()} Coins`;
          btn.disabled = false;
        } else {
          const needed = badge.cost - coins;
          btn.textContent = `Need ${needed.toLocaleString()} more Coins`;
          btn.disabled = true;
        }
      } else {
        btn.disabled = false;
        if (equipped === badgeId) {
          btn.classList.add('state-equipped');
          btn.textContent = 'Equipped (Tap to Unequip)';
        } else {
          btn.classList.add('state-equip');
          btn.textContent = 'Equip Badge';
        }
      }
    });
  }

  // Secret Code "xerpro" Redeem Action (+10,000 Coins every time)
  if (btnRedeemCode && secretCodeInput) {
    function handleRedeemCode() {
      const code = secretCodeInput.value;
      if (!code) return;
      const res = economy.redeemSecretCode(code);

      if (redeemFeedback) {
        redeemFeedback.className = `redeem-feedback ${res.success ? 'success' : 'error'}`;
        redeemFeedback.textContent = res.message;
        redeemFeedback.style.display = 'block';

        clearTimeout(redeemFeedback.timer);
        redeemFeedback.timer = setTimeout(() => {
          redeemFeedback.style.display = 'none';
        }, 4500);
      }

      if (res.success) {
        showToast('+10,000 Coins Added!');
        secretCodeInput.value = '';
      } else {
        showToast('Invalid Secret Code');
      }
    }

    btnRedeemCode.addEventListener('click', handleRedeemCode);
    secretCodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleRedeemCode();
      }
    });
  }

  // Badge Buy & Equip Click Listeners
  badgeCards.forEach(card => {
    const btn = card.querySelector('.btn-badge-action');
    const badgeId = card.dataset.badgeId;
    if (btn && badgeId) {
      btn.addEventListener('click', () => {
        if (!economy.hasBadge(badgeId)) {
          const res = economy.buyBadge(badgeId);
          showToast(res.message);
        } else {
          const res = economy.equipBadge(badgeId);
          showToast(res.message);
        }
      });
    }
  });

  function updatePlayerBadges() {
    if (!economy) return;
    const myBadge = economy.getEquippedBadge();
    if (game.gameMode === 'local') {
      if (badgePlayerX) badgePlayerX.innerHTML = myBadge ? economy.renderBadgeHtml(myBadge) : '';
      if (badgePlayerO) badgePlayerO.innerHTML = '';
    } else if (game.gameMode === 'ai') {
      if (game.humanSymbol === 'X') {
        if (badgePlayerX) badgePlayerX.innerHTML = myBadge ? economy.renderBadgeHtml(myBadge) : '';
        if (badgePlayerO) badgePlayerO.innerHTML = '';
      } else {
        if (badgePlayerO) badgePlayerO.innerHTML = myBadge ? economy.renderBadgeHtml(myBadge) : '';
        if (badgePlayerX) badgePlayerX.innerHTML = '';
      }
    } else if (game.gameMode === 'online') {
      if (mp.mySymbol === 'X') {
        if (badgePlayerX) badgePlayerX.innerHTML = myBadge ? economy.renderBadgeHtml(myBadge) : '';
        if (badgePlayerO) badgePlayerO.innerHTML = mp.opponentBadge ? economy.renderBadgeHtml(mp.opponentBadge) : '';
      } else {
        if (badgePlayerO) badgePlayerO.innerHTML = myBadge ? economy.renderBadgeHtml(myBadge) : '';
        if (badgePlayerX) badgePlayerX.innerHTML = mp.opponentBadge ? economy.renderBadgeHtml(mp.opponentBadge) : '';
      }
    }
  }

  window.addEventListener('ox_economy_updated', () => {
    updateEconomyUI();
    updatePlayerBadges();
  });

  // Initial Economy UI load
  updateEconomyUI();

  btnMenuExit.addEventListener('click', () => {
    openModal(modals.exit);
  });

  btnCancelExit.addEventListener('click', () => {
    closeModal(modals.exit);
    sound.playClick();
  });

  btnConfirmExit.addEventListener('click', () => {
    sound.playClick();
    closeModal(modals.exit);
    
    // Call Native Android Bridge
    if (window.AndroidBridge && typeof window.AndroidBridge.exitApp === 'function') {
      window.AndroidBridge.exitApp();
      return;
    }

    // Call Native Windows desktop bridge
    if (window.pywebview && window.pywebview.api && typeof window.pywebview.api.exitApp === 'function') {
      window.pywebview.api.exitApp();
      return;
    }

    try {
      window.close();
    } catch (e) {}

    document.body.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; text-align:center; padding:20px; font-family:'Outfit', sans-serif;">
        <h1 style="font-size:2rem; font-weight:800; color:#fff; margin-bottom:8px;">Session Closed</h1>
        <p style="color:#94a3b8; max-width:320px; margin-bottom:24px;">Thanks for playing OX Neon!</p>
        <button onclick="location.reload()" style="padding:12px 28px; border-radius:12px; background:linear-gradient(135deg, #6366f1, #a855f7); color:#fff; font-weight:700; border:none; cursor:pointer;">Return to Game</button>
      </div>
    `;
  });

  // Global Hardware Back Button Handler for Android
  window.handleHardwareBack = function() {
    if (chatDrawer.classList.contains('active')) {
      chatDrawer.classList.remove('active');
      return 'handled';
    }

    const activeModals = document.querySelectorAll('.modal-overlay.active');
    if (activeModals.length > 0) {
      activeModals.forEach(m => m.classList.remove('active'));
      return 'handled';
    }

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

    if (screens.menu && screens.menu.classList.contains('active')) {
      if (modals.exit && modals.exit.classList.contains('active')) {
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
     GRID SIZE & MODE SELECTION
     ========================================================================== */
  // Play Modal Grid Pills
  playGridPills.forEach(pill => {
    pill.addEventListener('click', () => {
      sound.playClick();
      playGridPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedPlayGridSize = parseInt(pill.dataset.grid, 10) || 3;
    });
  });

  // Local Pass & Play
  btnModeLocal.addEventListener('click', () => {
    sound.playClick();
    closeModal(modals.play);
    startMatch('local', { gridSize: selectedPlayGridSize });
  });

  // vs AI Button - Toggles config panel
  btnModeAi.addEventListener('click', () => {
    sound.playClick();
    aiConfigPanel.classList.toggle('active');
  });

  // AI Difficulty Selection
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
      humanSymbol: selectedHumanSymbol,
      gridSize: selectedPlayGridSize
    });
  });

  /* ==========================================================================
     MULTIPLAYER HUB (4-Digit Room Code Host & Join)
     ========================================================================== */
  // Host Grid Pills
  hostGridPills.forEach(pill => {
    pill.addEventListener('click', () => {
      sound.playClick();
      hostGridPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedHostGridSize = parseInt(pill.dataset.hostGrid, 10) || 3;
      initializeHostTab();
    });
  });

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

  function initializeHostTab() {
    hostStatusText.textContent = `Generating ${selectedHostGridSize}x${selectedHostGridSize} room code...`;
    mp.hostRoom(selectedHostGridSize)
      .then(code => {
        displayHostCode(code);
        hostStatusText.textContent = `Room ready (${selectedHostGridSize}x${selectedHostGridSize})! Waiting for opponent...`;
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

  btnRegenCode.addEventListener('click', () => {
    sound.playClick();
    initializeHostTab();
  });

  btnCopyCode.addEventListener('click', () => {
    sound.playClick();
    if (mp.roomCode) {
      navigator.clipboard.writeText(mp.roomCode).then(() => {
        showToast(`Code ${mp.roomCode} copied!`);
      }).catch(() => {
        showToast(`Code: ${mp.roomCode}`);
      });
    }
  });

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

  // Join Inputs
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

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
      const digits = pasteData.replace(/\D/g, '').slice(0, 4).split('');
      if (digits.length > 0) {
        digits.forEach((d, i) => {
          if (joinDigits[i]) joinDigits[i].value = d;
        });
        checkJoinInputComplete();
      }
    });
  });

  function checkJoinInputComplete() {
    const code = Array.from(joinDigits).map(i => i.value).join('');
    btnJoinRoom.disabled = code.length !== 4;
  }

  btnPasteCode.addEventListener('click', async () => {
    sound.playClick();
    try {
      const text = await navigator.clipboard.readText();
      const digits = text.replace(/\D/g, '').slice(0, 4).split('');
      if (digits.length === 4) {
        digits.forEach((d, i) => {
          if (joinDigits[i]) joinDigits[i].value = d;
        });
        checkJoinInputComplete();
        showToast('Code pasted!');
      } else {
        showToast('No 4-digit code found in clipboard');
      }
    } catch (e) {
      showToast('Could not access clipboard');
    }
  });

  btnJoinRoom.addEventListener('click', () => {
    const code = Array.from(joinDigits).map(i => i.value).join('');
    if (code.length !== 4) return;

    sound.playClick();
    btnJoinRoom.disabled = true;
    joinStatusPill.style.display = 'flex';
    joinStatusPill.className = 'status-pill';
    joinStatusPill.textContent = 'Connecting to room #' + code + '...';

    mp.joinRoom(code)
      .then(() => {
        joinStatusPill.className = 'status-pill success';
        joinStatusPill.textContent = 'Connected! Starting...';
      })
      .catch((err) => {
        btnJoinRoom.disabled = false;
        joinStatusPill.className = 'status-pill error';
        joinStatusPill.textContent = err.message || 'Room not found. Check code.';
      });
  });

  // URL Query Auto-Join
  const urlParams = new URLSearchParams(window.location.search);
  const autoJoinCode = urlParams.get('join');
  if (autoJoinCode && autoJoinCode.length === 4) {
    openModal(modals.multiplayer);
    tabBtnJoin.click();
    autoJoinCode.split('').forEach((d, i) => {
      if (joinDigits[i]) joinDigits[i].value = d;
    });
    checkJoinInputComplete();
    setTimeout(() => {
      btnJoinRoom.click();
    }, 400);
  }

  /* ==========================================================================
     MULTIPLAYER PROTOCOL EVENTS
     ========================================================================== */
  mp.on('game_ready', (data) => {
    closeModal(modals.multiplayer);
    showToast(`Online Match Ready! (${data.gridSize || 3}x${data.gridSize || 3})`);
    startMatch('online', {
      isOnlineHost: mp.isHost,
      gridSize: data.gridSize || 3
    });
    updatePlayerBadges();
  });

  mp.on('opponent_badge_updated', () => {
    updatePlayerBadges();
  });

  mp.on('opponent_move', (data) => {
    handleOpponentMove(data.index);
  });

  mp.on('opponent_disconnected', () => {
    showToast('Opponent disconnected!');
    if (screens.game.classList.contains('active')) {
      gameoverIcon.className = 'winner-icon-bubble alert';
      gameoverIcon.innerHTML = `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      gameoverTitle.textContent = 'Opponent Left';
      gameoverDesc.textContent = 'Your opponent disconnected from the match.';
      btnRematch.style.display = 'none';
      openModal(modals.gameover);
    }
  });

  mp.on('rematch_requested', () => {
    showToast('Opponent wants a rematch!');
    if (onlineRematchRequestedByMe) {
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

  // Incoming Opponent Voice Note
  mp.on('opponent_voice_note', (data) => {
    sound.vibrate([40, 30, 40]);
    addVoiceNoteToChat(data.audio, data.duration, false, data.badge);

    // Auto-play opponent's voice note
    mp.playAudioDataUrl(data.audio);

    // If chat drawer is closed, show floating player banner
    if (!chatDrawer.classList.contains('active')) {
      unreadCount++;
      unreadChatBadge.textContent = unreadCount;
      unreadChatBadge.style.display = 'flex';
      showFloatingCommBanner('voice', `Voice Note from Opponent (${data.duration}s)`, (data.duration || 3) * 1000 + 500);
    }
  });

  // Incoming Opponent Text Message
  mp.on('opponent_chat_text', (data) => {
    sound.playClick();
    sound.vibrate(30);
    addTextToChat(data.text, false, data.badge);

    if (!chatDrawer.classList.contains('active')) {
      unreadCount++;
      unreadChatBadge.textContent = unreadCount;
      unreadChatBadge.style.display = 'flex';
      showFloatingCommBanner('chat', `${data.sender}: ${data.text}`, 3500);
    }
  });

  /* ==========================================================================
     1-CLICK TOGGLE VOICE CHAT CONTROLLER
     1st Click = Start Recording
     2nd Click = Stop & Send Instantly
     Cancel Button = Discard Recording
     ========================================================================== */
  async function startVoiceRecording() {
    if (isRecordingVoice) return;
    if (game.gameMode !== 'online' || !mp.isConnected) {
      showToast('Voice chat is available in online multiplayer!');
      return;
    }

    const ok = await mp.startVoiceRecording();
    if (!ok) {
      showToast('Microphone access needed for Voice Chat');
      return;
    }

    isRecordingVoice = true;
    sound.vibrate(30);
    btnPushToTalk.classList.add('recording');
    pttLabel.textContent = 'Tap to Send';
    if (btnMicCancel) btnMicCancel.style.display = 'flex';
    recordingToast.style.display = 'flex';
    recDuration.textContent = '0:00';

    const startT = Date.now();
    clearInterval(recTimerInterval);
    recTimerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startT) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      recDuration.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
      if (elapsed >= 15) { // Auto-stop and send at 15s max
        stopAndSendVoiceRecording();
      }
    }, 250);
  }

  async function stopAndSendVoiceRecording() {
    if (!isRecordingVoice) return;
    isRecordingVoice = false;
    clearInterval(recTimerInterval);
    btnPushToTalk.classList.remove('recording');
    pttLabel.textContent = 'Voice Note';
    if (btnMicCancel) btnMicCancel.style.display = 'none';
    recordingToast.style.display = 'none';

    const voiceNote = await mp.stopVoiceRecording();
    if (voiceNote && voiceNote.dataUrl) {
      sound.vibrate(25);
      mp.sendVoiceNote(voiceNote.dataUrl, voiceNote.duration);
      addVoiceNoteToChat(voiceNote.dataUrl, voiceNote.duration, true);
      showToast('Voice note sent!');
    }
  }

  async function cancelVoiceRecording() {
    if (!isRecordingVoice) return;
    isRecordingVoice = false;
    clearInterval(recTimerInterval);
    btnPushToTalk.classList.remove('recording');
    pttLabel.textContent = 'Voice Note';
    if (btnMicCancel) btnMicCancel.style.display = 'none';
    recordingToast.style.display = 'none';

    await mp.stopVoiceRecording(); // Discards audio without sending
    sound.playClick();
    showToast('Voice note cancelled');
  }

  // 1-Click Toggle: 1st Click = Record, 2nd Click = Send
  btnPushToTalk.addEventListener('click', (e) => {
    e.preventDefault();
    if (!isRecordingVoice) {
      startVoiceRecording();
    } else {
      stopAndSendVoiceRecording();
    }
  });

  if (btnMicCancel) {
    btnMicCancel.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      cancelVoiceRecording();
    });
  }

  /* ==========================================================================
     TEXT CHAT DRAWER CONTROLLER
     ========================================================================== */
  btnToggleChat.addEventListener('click', () => {
    sound.playClick();
    chatDrawer.classList.toggle('active');
    if (chatDrawer.classList.contains('active')) {
      unreadCount = 0;
      unreadChatBadge.style.display = 'none';
      setTimeout(() => chatInputText.focus(), 150);
    }
  });

  btnCloseChat.addEventListener('click', () => {
    sound.playClick();
    chatDrawer.classList.remove('active');
  });

  chatInputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const txt = chatInputText.value.trim();
    if (!txt) return;

    const sent = mp.sendChatText(txt);
    if (sent) {
      addTextToChat(sent.text, true);
      chatInputText.value = '';
    }
  });

  function addTextToChat(text, isMine, badgeId = null) {
    const row = document.createElement('div');
    row.className = `chat-msg-row ${isMine ? 'mine' : 'opponent'}`;

    const safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const effectiveBadge = isMine ? (economy ? economy.getEquippedBadge() : null) : (badgeId || mp.opponentBadge);
    const badgeHtml = effectiveBadge && economy ? ` ${economy.renderBadgeHtml(effectiveBadge)}` : '';

    row.innerHTML = `
      <div class="chat-msg-bubble">${safeText}</div>
      <span class="chat-msg-meta">${isMine ? 'You' : 'Opponent'}${badgeHtml}</span>
    `;

    chatMessagesList.appendChild(row);
    chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
  }

  function addVoiceNoteToChat(dataUrl, durationSec, isMine, badgeId = null) {
    const row = document.createElement('div');
    row.className = `chat-msg-row ${isMine ? 'mine' : 'opponent'}`;

    const durFormatted = `0:${durationSec < 10 ? '0' : ''}${durationSec}`;
    const effectiveBadge = isMine ? (economy ? economy.getEquippedBadge() : null) : (badgeId || mp.opponentBadge);
    const badgeHtml = effectiveBadge && economy ? ` ${economy.renderBadgeHtml(effectiveBadge)}` : '';

    row.innerHTML = `
      <div class="voice-note-bubble">
        <button type="button" class="voice-play-btn" aria-label="Play Voice Note">
          <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
        <div class="voice-wave-bars">
          <span></span><span></span><span></span><span></span>
        </div>
        <span class="voice-duration-text">${durFormatted}</span>
      </div>
      <span class="chat-msg-meta">${isMine ? 'You' : 'Opponent'}${badgeHtml} • Voice Note</span>
    `;

    const playBtn = row.querySelector('.voice-play-btn');
    const bubble = row.querySelector('.voice-note-bubble');
    let audioInstance = null;

    playBtn.addEventListener('click', () => {
      sound.playClick();
      if (audioInstance && !audioInstance.paused) {
        audioInstance.pause();
        audioInstance.currentTime = 0;
        bubble.classList.remove('playing');
        playBtn.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
      } else {
        bubble.classList.add('playing');
        playBtn.innerHTML = `<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
        audioInstance = new Audio(dataUrl);
        audioInstance.play().catch(() => {});
        audioInstance.onended = () => {
          bubble.classList.remove('playing');
          playBtn.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        };
      }
    });

    chatMessagesList.appendChild(row);
    chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
  }

  function showFloatingCommBanner(type, contentText, durationMs = 3500) {
    const isAudio = (type === 'voice');
    if (isAudio) {
      bannerIconBubble.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
      bannerAuthor.textContent = 'Voice Note';
      bannerAudioWaves.style.display = 'flex';
    } else {
      bannerIconBubble.innerHTML = `<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
      bannerAuthor.textContent = 'Chat Message';
      bannerAudioWaves.style.display = 'none';
    }
    bannerContent.textContent = contentText;
    floatingCommBanner.style.display = 'flex';

    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => {
      floatingCommBanner.style.display = 'none';
    }, durationMs);
  }

  floatingCommBanner.addEventListener('click', () => {
    sound.playClick();
    floatingCommBanner.style.display = 'none';
    chatDrawer.classList.add('active');
    unreadCount = 0;
    unreadChatBadge.style.display = 'none';
  });

  /* ==========================================================================
     GAME ARENA LOGIC & DYNAMIC BOARD RENDERING
     ========================================================================== */
  function startMatch(mode, options = {}) {
    game.startNewGame({
      mode,
      aiDifficulty: options.aiDifficulty,
      humanSymbol: options.humanSymbol,
      isOnlineHost: options.isOnlineHost,
      gridSize: options.gridSize || selectedPlayGridSize
    });

    // Update Mode Badge
    const gridLabel = `${game.gridSize}x${game.gridSize}`;
    const winTarget = `${game.winLength} in a row`;
    if (mode === 'local') {
      modeBadge.textContent = `Pass & Play • ${gridLabel} (${winTarget})`;
      mpCommBar.style.display = 'none';
    } else if (mode === 'ai') {
      modeBadge.textContent = `VS AI (${options.aiDifficulty.toUpperCase()}) • ${gridLabel}`;
      mpCommBar.style.display = 'none';
    } else if (mode === 'online') {
      modeBadge.textContent = `Room #${mp.roomCode} • ${gridLabel}`;
      mpCommBar.style.display = 'flex';
    }

    // Reset Chat State
    unreadCount = 0;
    unreadChatBadge.style.display = 'none';
    chatMessagesList.innerHTML = `
      <div class="chat-system-bubble">
        Match started! ${gridLabel} grid (${winTarget} to win).
      </div>
    `;

    // Update Player Names
    playerXNameEl.textContent = game.playerXName;
    playerONameEl.textContent = game.playerOName;

    // Reset score indicators
    scoreXEl.textContent = game.scores.X;
    scoreOEl.textContent = game.scores.O;
    scoreTiesEl.textContent = game.scores.ties;

    // Build & Render Board
    buildBoardDom();
    renderBoard();
    updateTurnDisplay();
    updatePlayerBadges();

    showScreen('game');

    // If AI goes first
    if (game.gameMode === 'ai' && game.currentTurn === game.aiSymbol) {
      triggerAiMove();
    }
  }

  function buildBoardDom() {
    gameBoard.innerHTML = '';
    boardWrapper.className = `board-wrapper grid-size-${game.gridSize}`;
    const total = game.gridSize * game.gridSize;

    for (let i = 0; i < total; i++) {
      const cell = document.createElement('button');
      cell.className = 'board-cell';
      cell.dataset.cell = i;
      cell.setAttribute('aria-label', `Cell ${i + 1}`);
      cell.addEventListener('click', () => handleCellClick(i));
      gameBoard.appendChild(cell);
    }
  }

  function renderBoard() {
    strikeOverlay.innerHTML = '';
    const cells = gameBoard.querySelectorAll('.board-cell');
    cells.forEach((cell, idx) => {
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
        turnBanner.textContent = `Your Turn (${game.humanSymbol})`;
      } else {
        turnBanner.textContent = "AI is calculating...";
      }
    } else if (game.gameMode === 'online') {
      if (game.currentTurn === mp.mySymbol) {
        turnBanner.textContent = `Your Turn (${mp.mySymbol})`;
      } else {
        turnBanner.textContent = `Opponent's Turn (${mp.opponentSymbol})`;
      }
    } else {
      turnBanner.textContent = `Player ${game.currentTurn}'s Turn`;
    }
  }

  function handleCellClick(index) {
    if (game.isGameOver) return;
    if (game.board[index] !== null) return;

    if (game.gameMode === 'ai' && (game.currentTurn !== game.humanSymbol || isAiThinking)) {
      return;
    }

    if (game.gameMode === 'online' && game.currentTurn !== mp.mySymbol) {
      showToast("Wait for opponent's move!");
      return;
    }

    executeMove(index);

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

    // Sound & Haptic
    sound.vibrate(25);
    if (symbol === 'X') sound.playXMove();
    else sound.playOMove();

    // Render tile with GPU spring pop
    const cells = gameBoard.querySelectorAll('.board-cell');
    const cell = cells[index];
    if (cell) {
      cell.classList.remove('cell-placed');
      void cell.offsetWidth;
      cell.classList.add('taken', 'cell-placed');
      cell.appendChild(createSymbolSvg(symbol));
    }

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
      if (game.gameMode === 'ai' && game.currentTurn === game.aiSymbol) {
        triggerAiMove();
      }
    }
  }

  function triggerAiMove() {
    isAiThinking = true;
    updateTurnDisplay();

    const delay = Math.floor(300 + Math.random() * 200);
    setTimeout(() => {
      if (game.isGameOver) {
        isAiThinking = false;
        return;
      }

      const bestMove = ai.getBestMove(
        game.board,
        game.aiSymbol,
        game.humanSymbol,
        game.aiDifficulty,
        game.gridSize,
        game.winLength
      );

      isAiThinking = false;
      if (bestMove !== null && game.board[bestMove] === null) {
        executeMove(bestMove);
      }
    }, delay);
  }

  function drawStrikeLine(pattern, winner) {
    const cells = gameBoard.querySelectorAll('.board-cell');
    const cellA = cells[pattern[0]];
    const cellC = cells[pattern[pattern.length - 1]];
    const boardRect = gameBoard.getBoundingClientRect();

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
      if (cells[idx]) cells[idx].classList.add('winning-cell');
    });
  }

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
      let desc = `Connected ${game.winLength} in a row!`;
      let coinsEarned = 100;
      let rewardLabel = '+100 Coins (Victory!)';

      if (game.gameMode === 'ai') {
        if (winner === game.humanSymbol) {
          title = 'You Won!';
          desc = `Spectacular victory on ${game.gridSize}x${game.gridSize}!`;
          coinsEarned = 100;
          rewardLabel = '+100 Coins (Victory!)';
        } else {
          title = 'AI Won!';
          desc = 'Better luck next round!';
          coinsEarned = 10;
          rewardLabel = '+10 Coins (Match Reward)';
        }
      } else if (game.gameMode === 'online') {
        if (winner === mp.mySymbol) {
          title = 'Victory!';
          desc = 'You defeated your online opponent!';
          coinsEarned = 100;
          rewardLabel = '+100 Coins (Online Victory!)';
        } else {
          title = 'Defeat';
          desc = 'Opponent connected in a row.';
          coinsEarned = 10;
          rewardLabel = '+10 Coins (Match Reward)';
        }
      } else {
        coinsEarned = 100;
        rewardLabel = '+100 Coins (Local Win!)';
      }

      if (economy) {
        economy.addCoins(coinsEarned);
      }
      if (rewardCoinText) {
        rewardCoinText.textContent = rewardLabel;
      }
      if (gameoverCoinReward) {
        gameoverCoinReward.style.display = 'inline-flex';
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
      gameoverDesc.textContent = `A hard-fought stalemate on ${game.gridSize}x${game.gridSize}.`;

      const tieCoins = 25;
      if (economy) {
        economy.addCoins(tieCoins);
      }
      if (rewardCoinText) {
        rewardCoinText.textContent = `+${tieCoins} Coins (Stalemate Reward)`;
      }
      if (gameoverCoinReward) {
        gameoverCoinReward.style.display = 'inline-flex';
      }

      btnRematch.style.display = 'block';
      btnRematch.textContent = 'Play Again';
      btnRematch.classList.remove('pulse');
      onlineRematchRequestedByMe = false;

      openModal(modals.gameover);
    }, 1000);
  }

  function resetRoundForNewGame() {
    game.resetRound();
    renderBoard();
    updateTurnDisplay();
    updatePlayerBadges();
    closeModal(modals.gameover);
    showToast(`New Round Started! (${game.gridSize}x${game.gridSize})`);

    if (game.gameMode === 'ai' && game.currentTurn === game.aiSymbol) {
      triggerAiMove();
    }
  }

  btnRematch.addEventListener('click', () => {
    sound.playClick();
    if (game.gameMode === 'online') {
      onlineRematchRequestedByMe = true;
      btnRematch.textContent = 'Waiting for opponent...';
      mp.sendRematchRequest();
      showToast('Rematch request sent to opponent!');
    } else {
      resetRoundForNewGame();
    }
  });

  btnGameoverMenu.addEventListener('click', () => {
    sound.playClick();
    cancelVoiceRecording();
    closeModal(modals.gameover);
    if (game.gameMode === 'online') {
      mp.cleanup();
    }
    showScreen('menu');
  });

  btnBackMenu.addEventListener('click', () => {
    sound.playClick();
    if (game.gameMode === 'online') {
      if (confirm('Leave online match?')) {
        cancelVoiceRecording();
        mp.cleanup();
        showScreen('menu');
      }
    } else {
      cancelVoiceRecording();
      showScreen('menu');
    }
  });

  btnRestartGame.addEventListener('click', () => {
    sound.playClick();
    if (game.gameMode === 'online') {
      showToast('Click Rematch after the round ends');
    } else {
      resetRoundForNewGame();
    }
  });

  btnLeaveGame.addEventListener('click', () => {
    btnBackMenu.click();
  });
});
