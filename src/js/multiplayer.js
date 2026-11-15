/**
 * OX NEON - Real-Time P2P WebRTC Multiplayer & Communication Engine (Version 2.0)
 * Features:
 * - 4-Digit Room Codes (PeerJS)
 * - Dynamic Grid Size Sync (3x3, 5x5, 10x10)
 * - Real-Time Push-To-Talk Voice Chat
 * - Real-Time Text Chat with Unread Notifications
 */

class MultiplayerEngine {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.isHost = false;
    this.roomCode = null;
    this.mySymbol = 'X';
    this.opponentSymbol = 'O';
    this.gridSize = 3;
    this.winLength = 3;
    this.isConnected = false;
    this.handlers = {};

    // Profile & verification badge states
    this.myBadge = null;
    this.opponentBadge = null;

    // Voice recording states
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordingStartTime = 0;
    this.isRecording = false;
    this.audioStream = null;

    // Backup BroadcastChannel for instant same-browser testing
    this.bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('ox_multiplayer_channel_v2') : null;
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

  generateCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  getPeerIdFromCode(code) {
    return `oxneonv2-${code}`;
  }

  // Host starts a room with selected grid size
  hostRoom(gridSize = 3, customCode = null) {
    return new Promise((resolve, reject) => {
      this.cleanup();
      this.isHost = true;
      this.mySymbol = 'X';
      this.opponentSymbol = 'O';
      this.gridSize = parseInt(gridSize, 10) || 3;
      this.winLength = this.gridSize === 10 ? 5 : (this.gridSize === 5 ? 4 : 3);
      this.roomCode = customCode || this.generateCode();

      const hostPeerId = this.getPeerIdFromCode(this.roomCode);

      try {
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
          this.emit('room_created', { code: this.roomCode, peerId: id, gridSize: this.gridSize });
          resolve(this.roomCode);
        });

        this.peer.on('connection', (connection) => {
          this.setupConnection(connection);
          this.emit('status', 'Opponent connected! Starting game...');
        });

        this.peer.on('error', (err) => {
          console.warn('Peer error:', err);
          if (err.type === 'unavailable-id') {
            const newCode = this.generateCode();
            this.hostRoom(gridSize, newCode).then(resolve).catch(reject);
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
            this.send({ type: 'guest_joined', code: this.roomCode, guestBadge: this.myBadge });
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

  setupConnection(connection) {
    this.conn = connection;
    this.isConnected = true;

    this.conn.on('open', () => {
      this.isConnected = true;
      if (this.isHost) {
        this.send({
          type: 'init_game',
          hostSymbol: 'X',
          guestSymbol: 'O',
          currentTurn: 'X',
          gridSize: this.gridSize,
          winLength: this.winLength,
          hostBadge: this.myBadge
        });
      }
      this.emit('connected', { isHost: this.isHost, symbol: this.mySymbol, gridSize: this.gridSize });
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

  setMyBadge(badgeId) {
    this.myBadge = badgeId;
    if (this.isConnected) {
      this.send({ type: 'badge_update', badge: badgeId });
    }
  }

  handleBroadcastMessage(data) {
    if (!data || data.roomCode !== this.roomCode) return;
    if (data.fromHost === this.isHost) return;
    this.handleIncomingData(data.payload);
  }

  handleIncomingData(data) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'init_game':
        this.mySymbol = 'O';
        this.opponentSymbol = 'X';
        this.gridSize = data.gridSize || 3;
        this.winLength = data.winLength || 3;
        this.opponentBadge = data.hostBadge || null;
        this.emit('game_ready', {
          mySymbol: this.mySymbol,
          currentTurn: data.currentTurn,
          gridSize: this.gridSize,
          winLength: this.winLength,
          opponentBadge: this.opponentBadge
        });
        if (this.myBadge) {
          this.send({ type: 'badge_update', badge: this.myBadge });
        }
        break;

      case 'guest_joined':
        this.opponentBadge = data.guestBadge || null;
        this.emit('game_ready', {
          mySymbol: 'X',
          currentTurn: 'X',
          gridSize: this.gridSize,
          winLength: this.winLength,
          opponentBadge: this.opponentBadge
        });
        if (this.myBadge) {
          this.send({ type: 'badge_update', badge: this.myBadge });
        }
        break;

      case 'badge_update':
        this.opponentBadge = data.badge || null;
        this.emit('opponent_badge_updated', { badge: this.opponentBadge });
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

      case 'chat_text':
        this.emit('opponent_chat_text', {
          text: data.text,
          sender: data.sender || this.opponentSymbol,
          badge: data.badge || this.opponentBadge || null,
          timestamp: data.timestamp || Date.now()
        });
        break;

      case 'voice_note':
        this.emit('opponent_voice_note', {
          audio: data.audio,
          duration: data.duration,
          sender: data.sender || this.opponentSymbol,
          badge: data.badge || this.opponentBadge || null
        });
        break;
    }
  }

  send(payload) {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(payload);
      } catch (e) {
        console.error('Send error:', e);
      }
    }
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

  sendChatText(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const msg = {
      type: 'chat_text',
      text: trimmed,
      sender: this.mySymbol,
      badge: this.myBadge,
      timestamp: Date.now()
    };
    this.send(msg);
    return msg;
  }

  /* ==========================================================================
     PUSH-TO-TALK VOICE RECORDING & PLAYBACK ENGINE
     ========================================================================== */
  async startVoiceRecording() {
    if (this.isRecording) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioStream = stream;
      this.audioChunks = [];
      this.recordingStartTime = Date.now();

      // Check supported mime types
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') ? 'audio/ogg;codecs=opus' : '';
      }

      const options = mimeType ? { mimeType } : {};
      this.mediaRecorder = new MediaRecorder(stream, options);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100); // 100ms slices
      this.isRecording = true;
      return true;
    } catch (err) {
      console.warn('Microphone error:', err);
      this.emit('mic_error', err.message || 'Microphone access denied.');
      return false;
    }
  }

  stopVoiceRecording() {
    return new Promise((resolve) => {
      if (!this.isRecording || !this.mediaRecorder) {
        resolve(null);
        return;
      }

      const duration = Math.max(1, Math.round((Date.now() - this.recordingStartTime) / 1000));

      this.mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType || 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result;
            // Stop mic tracks to release hardware
            if (this.audioStream) {
              this.audioStream.getTracks().forEach(t => t.stop());
              this.audioStream = null;
            }
            this.isRecording = false;

            if (duration < 0.4) {
              // Too short, disregard click
              resolve(null);
            } else {
              resolve({
                dataUrl: base64Data,
                duration: duration
              });
            }
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          this.isRecording = false;
          resolve(null);
        }
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        this.isRecording = false;
        resolve(null);
      }
    });
  }

  sendVoiceNote(dataUrl, duration) {
    if (!dataUrl) return;
    const packet = {
      type: 'voice_note',
      audio: dataUrl,
      duration: duration,
      sender: this.mySymbol,
      badge: this.myBadge
    };
    this.send(packet);
    return packet;
  }

  playAudioDataUrl(dataUrl) {
    try {
      const audio = new Audio(dataUrl);
      audio.play().catch(e => console.warn('Audio play prevented:', e));
      return audio;
    } catch (e) {
      return null;
    }
  }

  cleanup() {
    if (this.mediaRecorder && this.isRecording) {
      try { this.mediaRecorder.stop(); } catch (e) {}
    }
    if (this.audioStream) {
      try { this.audioStream.getTracks().forEach(t => t.stop()); } catch (e) {}
      this.audioStream = null;
    }
    this.isRecording = false;

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
