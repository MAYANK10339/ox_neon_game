/**
 * OX NEON - Real-Time P2P WebRTC Multiplayer Engine via PeerJS
 * Connects 2 players across phones or browsers via a 4-digit room code.
 */

class MultiplayerEngine {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.isHost = false;
    this.roomCode = null;
    this.mySymbol = 'X';
    this.opponentSymbol = 'O';
    this.isConnected = false;
    this.handlers = {};

    // Backup BroadcastChannel for instant same-browser testing
    this.bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('ox_multiplayer_channel') : null;
    if (this.bc) {
      this.bc.onmessage = (event) => this.handleBroadcastMessage(event.data);
    }
  }

  on(event, callback) {
    this.handlers[event] = callback;
  }

  emit(event, data) {
    if (this.handlers[event]) {
      this.handlers[event](data);
    }
  }

  // Generate a random 4-digit numeric code
  generateCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Convert 4-digit code to PeerJS ID
  getPeerIdFromCode(code) {
    return `oxgame2026-${code}`;
  }

  // Host starts a room with a 4-digit code
  hostRoom(customCode = null) {
    return new Promise((resolve, reject) => {
      this.cleanup();
      this.isHost = true;
      this.mySymbol = 'X';
      this.opponentSymbol = 'O';
      this.roomCode = customCode || this.generateCode();

      const hostPeerId = this.getPeerIdFromCode(this.roomCode);

      try {
        // Initialize PeerJS with public broker
        this.peer = new Peer(hostPeerId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });

        this.peer.on('open', (id) => {
          this.emit('room_created', { code: this.roomCode, peerId: id });
          resolve(this.roomCode);
        });

        this.peer.on('connection', (connection) => {
          this.setupConnection(connection);
          this.emit('status', 'Opponent connected! Starting game...');
        });

        this.peer.on('error', (err) => {
          console.warn('Peer error:', err);
          if (err.type === 'unavailable-id') {
            // Code already active, retry with new 4-digit code
            const newCode = this.generateCode();
            this.hostRoom(newCode).then(resolve).catch(reject);
          } else {
            this.emit('error', err.message || 'Connection error. Check internet.');
            reject(err);
          }
        });

      } catch (e) {
        this.emit('error', 'PeerJS could not be initialized.');
        reject(e);
      }
    });
  }

  // Guest joins using a 4-digit code
  joinRoom(code) {
    return new Promise((resolve, reject) => {
      this.cleanup();
      this.isHost = false;
      this.mySymbol = 'O';
      this.opponentSymbol = 'X';
      this.roomCode = code.toString().trim();

      const hostPeerId = this.getPeerIdFromCode(this.roomCode);

      try {
        // Create an ephemeral peer ID for the guest
        this.peer = new Peer({
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });

        this.peer.on('open', () => {
          this.emit('status', 'Connecting to host...');
          const connection = this.peer.connect(hostPeerId, { reliable: true });

          const timeout = setTimeout(() => {
            if (!this.isConnected) {
              this.emit('error', 'Connection timed out. Check code or host status.');
              reject(new Error('Connection timeout'));
            }
          }, 12000);

          connection.on('open', () => {
            clearTimeout(timeout);
            this.setupConnection(connection);
            // Send join notification to host
            this.send({ type: 'guest_joined', code: this.roomCode });
            resolve();
          });

          connection.on('error', (err) => {
            clearTimeout(timeout);
            this.emit('error', 'Could not connect to host with code ' + code);
            reject(err);
          });
        });

        this.peer.on('error', (err) => {
          this.emit('error', 'Network error while joining.');
          reject(err);
        });

      } catch (e) {
        this.emit('error', 'Failed to connect.');
        reject(e);
      }
    });
  }

  // Setup connection event listeners
  setupConnection(connection) {
    this.conn = connection;
    this.isConnected = true;

    this.conn.on('open', () => {
      this.isConnected = true;
      if (this.isHost) {
        // Send initial handshake
        this.send({
          type: 'init_game',
          hostSymbol: 'X',
          guestSymbol: 'O',
          currentTurn: 'X'
        });
      }
      this.emit('connected', { isHost: this.isHost, symbol: this.mySymbol });
    });

    this.conn.on('data', (data) => {
      this.handleIncomingData(data);
    });

    this.conn.on('close', () => {
      this.isConnected = false;
      this.emit('opponent_disconnected');
    });

    this.conn.on('error', (err) => {
      console.warn('Connection error:', err);
    });
  }

  // Broadcast channel backup for testing between tabs in same browser
  handleBroadcastMessage(data) {
    if (!data || data.roomCode !== this.roomCode) return;
    if (data.fromHost === this.isHost) return; // Ignore own messages
    this.handleIncomingData(data.payload);
  }

  // Handle incoming protocol messages
  handleIncomingData(data) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'init_game':
        this.mySymbol = 'O';
        this.opponentSymbol = 'X';
        this.emit('game_ready', { mySymbol: this.mySymbol, currentTurn: data.currentTurn });
        break;

      case 'guest_joined':
        this.emit('game_ready', { mySymbol: 'X', currentTurn: 'X' });
        break;

      case 'move':
        this.emit('opponent_move', { index: data.index, symbol: data.symbol });
        break;

      case 'rematch_request':
        this.emit('rematch_requested');
        break;

      case 'rematch_accept':
        this.emit('rematch_accepted', { nextFirstTurn: data.nextFirstTurn });
        break;

      case 'reaction':
        this.emit('opponent_reaction', { emoji: data.emoji });
        break;

      case 'chat':
        this.emit('opponent_chat', { text: data.text });
        break;
    }
  }

  // Send packet to opponent
  send(payload) {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(payload);
      } catch (e) {
        console.error('Send error:', e);
      }
    }
    // Also broadcast on local channel if active
    if (this.bc && this.roomCode) {
      this.bc.postMessage({
        roomCode: this.roomCode,
        fromHost: this.isHost,
        payload: payload
      });
    }
  }

  sendMove(index, symbol) {
    this.send({ type: 'move', index, symbol });
  }

  sendRematchRequest() {
    this.send({ type: 'rematch_request' });
  }

  sendRematchAccept(nextFirstTurn) {
    this.send({ type: 'rematch_accept', nextFirstTurn });
  }

  sendReaction(emoji) {
    this.send({ type: 'reaction', emoji });
  }

  cleanup() {
    if (this.conn) {
      try { this.conn.close(); } catch (e) {}
      this.conn = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
    }
    this.isConnected = false;
    this.roomCode = null;
  }
}

window.multiplayerEngine = new MultiplayerEngine();
