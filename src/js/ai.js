/**
 * OX NEON - Smart AI Engine
 * Includes Easy, Medium, and Mathematically Unbeatable (Minimax) levels.
 */

class TicTacToeAI {
  constructor() {
    this.winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
  }

  // Get available cell indices
  getEmptyIndices(board) {
    const indices = [];
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) indices.push(i);
    }
    return indices;
  }

  // Check if a player won on the board
  checkWinner(board, player) {
    return this.winPatterns.some(pattern => {
      return pattern.every(idx => board[idx] === player);
    });
  }

  // Main decision method based on difficulty
  getBestMove(board, aiSymbol, humanSymbol, difficulty = 'impossible') {
    const emptyIndices = this.getEmptyIndices(board);
    if (emptyIndices.length === 0) return null;

    if (difficulty === 'easy') {
      return this.getRandomMove(emptyIndices);
    }

    if (difficulty === 'medium') {
      // 60% chance to play optimal/smart, 40% random
      if (Math.random() < 0.35) {
        return this.getRandomMove(emptyIndices);
      }
      // Check if AI can win immediately
      const winMove = this.findWinningMove(board, aiSymbol, emptyIndices);
      if (winMove !== null) return winMove;

      // Check if Human can win immediately and block it
      const blockMove = this.findWinningMove(board, humanSymbol, emptyIndices);
      if (blockMove !== null) return blockMove;

      // Otherwise take center if free
      if (emptyIndices.includes(4) && Math.random() < 0.6) return 4;

      return this.getRandomMove(emptyIndices);
    }

    // IMPOSSIBLE (Minimax)
    return this.getMinimaxMove(board, aiSymbol, humanSymbol);
  }

  getRandomMove(emptyIndices) {
    const randomIndex = Math.floor(Math.random() * emptyIndices.length);
    return emptyIndices[randomIndex];
  }

  findWinningMove(board, symbol, emptyIndices) {
    for (const idx of emptyIndices) {
      board[idx] = symbol;
      const isWin = this.checkWinner(board, symbol);
      board[idx] = null;
      if (isWin) return idx;
    }
    return null;
  }

  // Minimax Algorithm with terminal score heuristics
  getMinimaxMove(board, aiSymbol, humanSymbol) {
    const emptyIndices = this.getEmptyIndices(board);

    // Opening move optimization for speed & variety
    if (emptyIndices.length === 9) {
      const openings = [0, 2, 4, 6, 8]; // Corners or center
      return openings[Math.floor(Math.random() * openings.length)];
    }
    if (emptyIndices.length === 8 && emptyIndices.includes(4)) {
      return 4; // Always take center if available on turn 2
    }

    let bestScore = -Infinity;
    let bestMove = emptyIndices[0];

    for (const idx of emptyIndices) {
      board[idx] = aiSymbol;
      const score = this.minimax(board, 0, false, aiSymbol, humanSymbol, -Infinity, Infinity);
      board[idx] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = idx;
      }
    }

    return bestMove;
  }

  minimax(board, depth, isMaximizing, aiSymbol, humanSymbol, alpha, beta) {
    if (this.checkWinner(board, aiSymbol)) {
      return 10 - depth;
    }
    if (this.checkWinner(board, humanSymbol)) {
      return depth - 10;
    }

    const empty = this.getEmptyIndices(board);
    if (empty.length === 0) {
      return 0; // Tie
    }

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const idx of empty) {
        board[idx] = aiSymbol;
        const score = this.minimax(board, depth + 1, false, aiSymbol, humanSymbol, alpha, beta);
        board[idx] = null;
        maxScore = Math.max(score, maxScore);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const idx of empty) {
        board[idx] = humanSymbol;
        const score = this.minimax(board, depth + 1, true, aiSymbol, humanSymbol, alpha, beta);
        board[idx] = null;
        minScore = Math.min(score, minScore);
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return minScore;
    }
  }
}

window.aiEngine = new TicTacToeAI();
