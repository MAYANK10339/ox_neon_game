/**
 * OX NEON - Core Game Engine (Version 2.0)
 * Supports dynamic grid sizes: 3x3 (3 in a row), 5x5 (4 in a row), 10x10 (5 in a row).
 * Ultra-fast O(K) ray win checking with 0 lag.
 */

class GameEngine {
  constructor() {
    this.gridSize = 3; // 3, 5, or 10
    this.winLength = 3; // 3, 4, or 5
    this.board = Array(9).fill(null);
    this.currentTurn = 'X';
    this.gameMode = 'local'; // 'local', 'ai', 'online'
    this.aiDifficulty = 'impossible';
    this.playerXName = 'Player X';
    this.playerOName = 'Player O';
    this.humanSymbol = 'X';
    this.aiSymbol = 'O';
    this.isGameOver = false;
    this.winningPattern = null;
    this.scores = { X: 0, O: 0, ties: 0 };
    this.roundsPlayed = 0;
    this.firstPlayer = 'X';

    this.loadScores();
  }

  loadScores() {
    try {
      const saved = localStorage.getItem('ox_scores_v2');
      if (saved) {
        this.scores = JSON.parse(saved);
      }
    } catch (e) {}
  }

  saveScores() {
    try {
      localStorage.setItem('ox_scores_v2', JSON.stringify(this.scores));
    } catch (e) {}
  }

  resetScores() {
    this.scores = { X: 0, O: 0, ties: 0 };
    this.saveScores();
  }

  setGridSize(size) {
    this.gridSize = parseInt(size, 10) || 3;
    if (this.gridSize === 10) {
      this.winLength = 5;
    } else if (this.gridSize === 5) {
      this.winLength = 4;
    } else {
      this.gridSize = 3;
      this.winLength = 3;
    }
    this.board = Array(this.gridSize * this.gridSize).fill(null);
  }

  startNewGame({ mode, aiDifficulty, humanSymbol, isOnlineHost, gridSize }) {
    this.gameMode = mode;
    this.setGridSize(gridSize || 3);
    this.isGameOver = false;
    this.winningPattern = null;

    if (mode === 'ai') {
      this.aiDifficulty = aiDifficulty || 'impossible';
      this.humanSymbol = humanSymbol || 'X';
      this.aiSymbol = this.humanSymbol === 'X' ? 'O' : 'X';
      this.playerXName = this.humanSymbol === 'X' ? 'You' : 'AI Bot';
      this.playerOName = this.humanSymbol === 'O' ? 'You' : 'AI Bot';
      this.currentTurn = 'X';
    } else if (mode === 'online') {
      if (isOnlineHost) {
        this.playerXName = 'You (Host)';
        this.playerOName = 'Opponent';
      } else {
        this.playerXName = 'Host';
        this.playerOName = 'You';
      }
      this.currentTurn = 'X';
    } else {
      // Local 2-Player Pass & Play
      this.playerXName = 'Player X';
      this.playerOName = 'Player O';
      this.currentTurn = 'X';
    }
  }

  // Handle cell click / move execution
  makeMove(index) {
    if (this.isGameOver) return { success: false, reason: 'game_over' };
    if (index < 0 || index >= this.board.length) return { success: false, reason: 'out_of_bounds' };
    if (this.board[index] !== null) return { success: false, reason: 'cell_occupied' };

    const symbol = this.currentTurn;
    this.board[index] = symbol;

    // Check Win from this move in O(K) time
    const winningComb = this.checkWinFromMove(index, symbol);
    if (winningComb) {
      this.isGameOver = true;
      this.winningPattern = winningComb;
      this.scores[symbol]++;
      this.roundsPlayed++;
      this.saveScores();

      return {
        success: true,
        move: { index, symbol },
        result: 'win',
        winner: symbol,
        winningPattern: winningComb
      };
    }

    // Check Tie
    if (this.isBoardFull()) {
      this.isGameOver = true;
      this.scores.ties++;
      this.roundsPlayed++;
      this.saveScores();

      return {
        success: true,
        move: { index, symbol },
        result: 'tie'
      };
    }

    // Toggle Turn
    this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';

    return {
      success: true,
      move: { index, symbol },
      result: 'continue',
      nextTurn: this.currentTurn
    };
  }

  // Ray-based Win Checker centered on last move (Ultra fast O(K))
  checkWinFromMove(moveIndex, symbol) {
    const N = this.gridSize;
    const K = this.winLength;
    const r = Math.floor(moveIndex / N);
    const c = moveIndex % N;

    // 4 Axes: Horizontal, Vertical, Diagonal (\), Anti-Diagonal (/)
    const directions = [
      { dr: 0, dc: 1 },  // Horizontal
      { dr: 1, dc: 0 },  // Vertical
      { dr: 1, dc: 1 },  // Diagonal \
      { dr: 1, dc: -1 }  // Diagonal /
    ];

    for (const { dr, dc } of directions) {
      const line = [moveIndex];

      // Positive ray
      let step = 1;
      while (true) {
        const nr = r + step * dr;
        const nc = c + step * dc;
        if (nr < 0 || nr >= N || nc < 0 || nc >= N) break;
        const idx = nr * N + nc;
        if (this.board[idx] === symbol) {
          line.push(idx);
          step++;
        } else {
          break;
        }
      }

      // Negative ray
      step = 1;
      while (true) {
        const nr = r - step * dr;
        const nc = c - step * dc;
        if (nr < 0 || nr >= N || nc < 0 || nc >= N) break;
        const idx = nr * N + nc;
        if (this.board[idx] === symbol) {
          line.unshift(idx);
          step++;
        } else {
          break;
        }
      }

      if (line.length >= K) {
        // Return exactly K consecutive winning cells
        return line.slice(0, K);
      }
    }

    return null;
  }

  // Check board-wide winner (used for AI evaluations)
  checkBoardWinner(symbol) {
    const N = this.gridSize;
    const K = this.winLength;
    const directions = [
      { dr: 0, dc: 1 },
      { dr: 1, dc: 0 },
      { dr: 1, dc: 1 },
      { dr: 1, dc: -1 }
    ];

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const startIdx = r * N + c;
        if (this.board[startIdx] !== symbol) continue;

        for (const { dr, dc } of directions) {
          // Check if K-length sequence fits within board boundary
          const endR = r + (K - 1) * dr;
          const endC = c + (K - 1) * dc;
          if (endR < 0 || endR >= N || endC < 0 || endC >= N) continue;

          let match = true;
          const pattern = [];
          for (let step = 0; step < K; step++) {
            const idx = (r + step * dr) * N + (c + step * dc);
            if (this.board[idx] !== symbol) {
              match = false;
              break;
            }
            pattern.push(idx);
          }
          if (match) return pattern;
        }
      }
    }
    return null;
  }

  isBoardFull() {
    return this.board.every(cell => cell !== null);
  }

  resetRound() {
    this.board = Array(this.gridSize * this.gridSize).fill(null);
    this.isGameOver = false;
    this.winningPattern = null;
    // Alternate starting player for fair rounds
    this.firstPlayer = this.firstPlayer === 'X' ? 'O' : 'X';
    this.currentTurn = this.firstPlayer;
    return this.currentTurn;
  }
}

window.gameEngine = new GameEngine();
