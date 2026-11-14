/**
 * OX NEON - Core Game Engine
 * Manages game state, winning combinations, dynamic strike lines, and scoring.
 */

class GameEngine {
  constructor() {
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

    this.winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    this.loadScores();
  }

  loadScores() {
    try {
      const saved = localStorage.getItem('ox_scores');
      if (saved) {
        this.scores = JSON.parse(saved);
      }
    } catch (e) {}
  }

  saveScores() {
    try {
      localStorage.setItem('ox_scores', JSON.stringify(this.scores));
    } catch (e) {}
  }

  resetScores() {
    this.scores = { X: 0, O: 0, ties: 0 };
    this.saveScores();
  }

  startNewGame({ mode, aiDifficulty, humanSymbol, isOnlineHost }) {
    this.gameMode = mode;
    this.board = Array(9).fill(null);
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
    if (this.board[index] !== null) return { success: false, reason: 'cell_occupied' };

    const symbol = this.currentTurn;
    this.board[index] = symbol;

    // Check Win
    const winningComb = this.checkWin(symbol);
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

  checkWin(symbol) {
    for (const pattern of this.winPatterns) {
      if (pattern.every(idx => this.board[idx] === symbol)) {
        return pattern;
      }
    }
    return null;
  }

  isBoardFull() {
    return this.board.every(cell => cell !== null);
  }

  resetRound() {
    this.board = Array(9).fill(null);
    this.isGameOver = false;
    this.winningPattern = null;
    // Alternate starting player for fair rounds
    this.firstPlayer = this.firstPlayer === 'X' ? 'O' : 'X';
    this.currentTurn = this.firstPlayer;
    return this.currentTurn;
  }
}

window.gameEngine = new GameEngine();
