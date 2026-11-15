/**
 * OX NEON - Smart Multi-Grid AI Engine (Version 2.0)
 * 3x3: Classic Minimax (Unbeatable)
 * 5x5 & 10x10: High-Speed Positional Threat Heuristic (Connect 4 & Connect 5 Gomoku Engine)
 */

class TicTacToeAI {
  constructor() {
    this.winPatterns3x3 = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
  }

  getEmptyIndices(board) {
    const indices = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) indices.push(i);
    }
    return indices;
  }

  getBestMove(board, aiSymbol, humanSymbol, difficulty = 'impossible', gridSize = 3, winLength = 3) {
    const emptyIndices = this.getEmptyIndices(board);
    if (emptyIndices.length === 0) return null;

    // 1. If 3x3, use Minimax
    if (gridSize === 3) {
      return this.get3x3Move(board, aiSymbol, humanSymbol, difficulty);
    }

    // 2. If 5x5 or 10x10, use High-Speed Threat Heuristic Engine
    return this.getGomokuMove(board, aiSymbol, humanSymbol, difficulty, gridSize, winLength);
  }

  /* ==========================================================================
     3x3 MINIMAX LOGIC
     ========================================================================== */
  get3x3Move(board, aiSymbol, humanSymbol, difficulty) {
    const emptyIndices = this.getEmptyIndices(board);
    if (emptyIndices.length === 0) return null;

    if (difficulty === 'easy') {
      return this.getRandomMove(emptyIndices);
    }

    if (difficulty === 'medium') {
      if (Math.random() < 0.35) return this.getRandomMove(emptyIndices);

      const winMove = this.find3x3WinMove(board, aiSymbol, emptyIndices);
      if (winMove !== null) return winMove;

      const blockMove = this.find3x3WinMove(board, humanSymbol, emptyIndices);
      if (blockMove !== null) return blockMove;

      if (emptyIndices.includes(4) && Math.random() < 0.6) return 4;
      return this.getRandomMove(emptyIndices);
    }

    // Impossible Minimax
    if (emptyIndices.length === 9) {
      const openings = [0, 2, 4, 6, 8];
      return openings[Math.floor(Math.random() * openings.length)];
    }
    if (emptyIndices.length === 8 && emptyIndices.includes(4)) return 4;

    let bestScore = -Infinity;
    let bestMove = emptyIndices[0];

    for (const idx of emptyIndices) {
      board[idx] = aiSymbol;
      const score = this.minimax3x3(board, 0, false, aiSymbol, humanSymbol, -Infinity, Infinity);
      board[idx] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = idx;
      }
    }
    return bestMove;
  }

  find3x3WinMove(board, symbol, emptyIndices) {
    for (const idx of emptyIndices) {
      board[idx] = symbol;
      const won = this.check3x3Win(board, symbol);
      board[idx] = null;
      if (won) return idx;
    }
    return null;
  }

  check3x3Win(board, symbol) {
    for (const pat of this.winPatterns3x3) {
      if (board[pat[0]] === symbol && board[pat[1]] === symbol && board[pat[2]] === symbol) {
        return true;
      }
    }
    return false;
  }

  minimax3x3(board, depth, isMaximizing, aiSymbol, humanSymbol, alpha, beta) {
    if (this.check3x3Win(board, aiSymbol)) return 10 - depth;
    if (this.check3x3Win(board, humanSymbol)) return depth - 10;

    const empty = this.getEmptyIndices(board);
    if (empty.length === 0 || depth >= 6) return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const idx of empty) {
        board[idx] = aiSymbol;
        const ev = this.minimax3x3(board, depth + 1, false, aiSymbol, humanSymbol, alpha, beta);
        board[idx] = null;
        maxEval = Math.max(maxEval, ev);
        alpha = Math.max(alpha, ev);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const idx of empty) {
        board[idx] = humanSymbol;
        const ev = this.minimax3x3(board, depth + 1, true, aiSymbol, humanSymbol, alpha, beta);
        board[idx] = null;
        minEval = Math.min(minEval, ev);
        beta = Math.min(beta, ev);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  /* ==========================================================================
     5x5 & 10x10 GOMOKU / TACTICAL THREAT ENGINE (<20ms execution)
     ========================================================================== */
  getGomokuMove(board, aiSymbol, humanSymbol, difficulty, N, K) {
    const emptyIndices = this.getEmptyIndices(board);
    if (emptyIndices.length === 0) return null;

    // If completely empty, play dead center
    if (emptyIndices.length === N * N) {
      const centerR = Math.floor(N / 2);
      return centerR * N + centerR;
    }

    // Filter relevant tactical candidates (only cells within distance 2 of existing moves)
    const candidates = this.getCandidates(board, emptyIndices, N);
    if (candidates.length === 0) return emptyIndices[0];

    // Easy mode: casual with basic block
    if (difficulty === 'easy') {
      const immediateWin = this.findImmediateGomokuWin(board, aiSymbol, candidates, N, K);
      if (immediateWin !== null && Math.random() < 0.4) return immediateWin;
      const immediateBlock = this.findImmediateGomokuWin(board, humanSymbol, candidates, N, K);
      if (immediateBlock !== null && Math.random() < 0.5) return immediateBlock;
      return this.getRandomMove(candidates);
    }

    // Medium & Impossible: Tactical Evaluation
    let bestScore = -Infinity;
    let bestMoves = [];

    for (const idx of candidates) {
      const score = this.evaluateCandidateMove(board, idx, aiSymbol, humanSymbol, N, K);

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [idx];
      } else if (score === bestScore) {
        bestMoves.push(idx);
      }
    }

    if (difficulty === 'medium' && Math.random() < 0.25 && candidates.length > 2) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  getCandidates(board, emptyIndices, N) {
    const candidateSet = new Set();
    const radius = 2;

    for (let i = 0; i < board.length; i++) {
      if (board[i] !== null) {
        const r = Math.floor(i / N);
        const c = i % N;

        for (let dr = -radius; dr <= radius; dr++) {
          for (let dc = -radius; dc <= radius; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
              const idx = nr * N + nc;
              if (board[idx] === null) {
                candidateSet.add(idx);
              }
            }
          }
        }
      }
    }

    return candidateSet.size > 0 ? Array.from(candidateSet) : emptyIndices;
  }

  evaluateCandidateMove(board, idx, aiSymbol, humanSymbol, N, K) {
    let score = 0;

    // 1. Check if AI wins immediately
    board[idx] = aiSymbol;
    if (this.checkWinFromRay(board, idx, aiSymbol, N, K)) {
      board[idx] = null;
      return 1000000; // Immediate win
    }
    const aiThreat = this.countThreatPatterns(board, idx, aiSymbol, N, K);
    board[idx] = null;

    // 2. Check if Human would win immediately (Block Priority)
    board[idx] = humanSymbol;
    if (this.checkWinFromRay(board, idx, humanSymbol, N, K)) {
      board[idx] = null;
      return 500000; // Immediate must-block
    }
    const humanThreat = this.countThreatPatterns(board, idx, humanSymbol, N, K);
    board[idx] = null;

    // Center proximity bonus
    const r = Math.floor(idx / N);
    const c = idx % N;
    const centerDist = Math.abs(r - N / 2) + Math.abs(c - N / 2);
    const centerBonus = Math.max(0, 50 - centerDist * 5);

    score = (aiThreat * 1.2) + (humanThreat * 1.0) + centerBonus;
    return score;
  }

  countThreatPatterns(board, idx, symbol, N, K) {
    let totalScore = 0;
    const r = Math.floor(idx / N);
    const c = idx % N;

    const directions = [
      { dr: 0, dc: 1 },
      { dr: 1, dc: 0 },
      { dr: 1, dc: 1 },
      { dr: 1, dc: -1 }
    ];

    for (const { dr, dc } of directions) {
      let consecutive = 1;
      let openEnds = 0;

      // Positive ray
      let step = 1;
      while (true) {
        const nr = r + step * dr;
        const nc = c + step * dc;
        if (nr < 0 || nr >= N || nc < 0 || nc >= N) break;
        const cell = board[nr * N + nc];
        if (cell === symbol) {
          consecutive++;
          step++;
        } else if (cell === null) {
          openEnds++;
          break;
        } else {
          break; // Blocked by opponent
        }
      }

      // Negative ray
      step = 1;
      while (true) {
        const nr = r - step * dr;
        const nc = c - step * dc;
        if (nr < 0 || nr >= N || nc < 0 || nc >= N) break;
        const cell = board[nr * N + nc];
        if (cell === symbol) {
          consecutive++;
          step++;
        } else if (cell === null) {
          openEnds++;
          break;
        } else {
          break;
        }
      }

      if (consecutive >= K) totalScore += 100000;
      else if (consecutive === K - 1) {
        totalScore += openEnds === 2 ? 20000 : 5000;
      } else if (consecutive === K - 2) {
        totalScore += openEnds === 2 ? 3000 : 800;
      } else if (consecutive >= 2) {
        totalScore += openEnds * 150;
      }
    }

    return totalScore;
  }

  checkWinFromRay(board, moveIndex, symbol, N, K) {
    const r = Math.floor(moveIndex / N);
    const c = moveIndex % N;
    const directions = [
      { dr: 0, dc: 1 },
      { dr: 1, dc: 0 },
      { dr: 1, dc: 1 },
      { dr: 1, dc: -1 }
    ];

    for (const { dr, dc } of directions) {
      let count = 1;
      // forward
      let step = 1;
      while (true) {
        const nr = r + step * dr;
        const nc = c + step * dc;
        if (nr < 0 || nr >= N || nc < 0 || nc >= N) break;
        if (board[nr * N + nc] === symbol) { count++; step++; }
        else break;
      }
      // backward
      step = 1;
      while (true) {
        const nr = r - step * dr;
        const nc = c - step * dc;
        if (nr < 0 || nr >= N || nc < 0 || nc >= N) break;
        if (board[nr * N + nc] === symbol) { count++; step++; }
        else break;
      }
      if (count >= K) return true;
    }
    return false;
  }

  findImmediateGomokuWin(board, symbol, candidates, N, K) {
    for (const idx of candidates) {
      board[idx] = symbol;
      const win = this.checkWinFromRay(board, idx, symbol, N, K);
      board[idx] = null;
      if (win) return idx;
    }
    return null;
  }

  getRandomMove(emptyIndices) {
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }
}

window.aiEngine = new TicTacToeAI();
