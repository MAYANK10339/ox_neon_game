# ⚡ OX NEON v2.0 — Modern Clean Multi-Grid Tic-Tac-Toe

A high-performance, gradient-infused **O, X Game** engineered with butter-smooth 60-120 FPS hardware GPU acceleration for budget Android phones (e.g. Realme C55 / Helio G88) and Windows laptops/PCs.

### 🌟 What's New in v2.0:
- 🎙️ **Push-to-Talk Voice Chat**: Hold the mic button at the bottom during multiplayer matches to record and send voice notes! Opponents hear your voice automatically with animated soundwave visualizers.
- 💬 **Live In-Game Text Chat**: Real-time sliding chat drawer with unread message badges and floating notification toasts.
- 📐 **Multiple Board Grids**:
  - **3x3 (Classic)**: 3 in a row to win (Default).
  - **5x5 (Pro)**: 4 in a row to win.
  - **10x10 (Master)**: 5 in a row to win (Gomoku style).
  - Playable across **Offline Pass & Play**, **Unbeatable AI**, and **Online Multiplayer**!

---

## 📁 Project Structure

```
ox game/
│
├── release/
│   ├── android/
│   │   ├── OX_Neon_Game_v2.apk     <-- Brand New v2.0 APK (Voice Chat + 3x3/5x5/10x10, ~231 KB)
│   │   ├── OX_Neon_Game_v1.apk     <-- Classic v1.0 APK (Preserved)
│   │   └── INSTALL_GUIDE.txt       <-- Easy step-by-step mobile guide
│   └── windows/
│       ├── OX_Neon_Game_v2.exe     <-- Brand New v2.0 Windows PC game (~13 MB)
│       ├── OX_Neon_Game_v1.exe     <-- Classic v1.0 Windows PC game (Preserved)
│       └── README_WINDOWS.txt      <-- PC guide & shortcuts
│
├── src/                            <-- 100% GPU-Optimized Game Source Code
│   ├── index.html                  <-- Main game UI
│   ├── css/
│   │   └── style.css               <-- 0 software filters, pure GPU compositor styling
│   └── js/
│       ├── audio.js                <-- Web Audio procedural synth & safe storage
│       ├── ai.js                   <-- Minimax (3x3) & High-Speed Threat Heuristic (5x5, 10x10)
│       ├── multiplayer.js          <-- WebRTC P2P + Push-to-Talk Voice & Text Engine
│       ├── game.js                 <-- Dynamic grid state & O(K) ray win checking
│       ├── app.js                  <-- UI controller & dual-stroke neon SVG engine
│       └── vendor/                 <-- 100% offline-bundled libraries
│           ├── peerjs.min.js
│           ├── confetti.browser.min.js
│           └── qrcode.min.js
│
├── icons/                          <-- Game Icons & Branding
│   ├── app_icon.ico                <-- Windows Icon (16x16 to 256x256)
│   ├── icon_square_512.png         <-- 512x512 Master Square Icon
│   ├── icon_round_512.png          <-- 512x512 Master Round Icon
│   └── android/                    <-- Android mipmap density icons (mdpi to xxxhdpi)
│
├── build-tools/                    <-- Automated Build & Packaging Tools
│   ├── build_apk.py                <-- 1-Click Android APK Builder (Scheme v1, v2, v3)
│   ├── build_exe.py                <-- 1-Click Windows EXE Builder (PyInstaller + EdgeChromium)
│   ├── windows_main.py             <-- Windows native launcher with GPU rasterization & audio flags
│   ├── align_zip.py                <-- 4-Byte ZIP aligner
│   ├── ApkSignerHelper.java        <-- Google apksig v1, v2, v3 helper
│   ├── apksig.jar                  <-- Google apksig engine
│   ├── android.jar                 <-- Android API 30 stub
│   ├── r8.jar                      <-- Google D8 compiler
│   ├── aapt2_bin/                  <-- Google aapt2 Windows binary
│   └── ox_neon.keystore            <-- Release signing keystore
│
└── README.md                       <-- Master documentation
```

---

## 🎮 Cross-Platform Multiplayer (Android ⇄ Windows PC)

The 4-digit room code works seamlessly across any device combination over WebRTC:
* **Android to Android**: Both players on phones.
* **Android to Windows**: Player 1 on mobile, Player 2 on PC/laptop.
* **Windows to Android**: Player 1 on PC/laptop, Player 2 on mobile.
* **Windows to Windows**: Both players on PC/laptops.

### How to Play Multiplayer:
1. Player 1 opens the game (on Phone or PC), selects grid size (3x3, 5x5, or 10x10) and clicks **MULTIPLAYER** -> **Host Room**.
2. A **4-digit code** is generated (e.g. `7429`).
3. Player 2 opens the game (on Phone or PC), clicks **MULTIPLAYER** -> **Join with Code**.
4. Enter or paste `7429` and click **Join Match**.
5. The game connects in real-time instantly!
6. **Voice Chat**: Hold the mic button at the bottom to send voice notes!
7. **Text Chat**: Click the Chat button to type messages and see chat history!

---

## 📲 Android Installation
- File: [release/android/OX_Neon_Game_v2.apk](file:///c:/Users/PC/Desktop/xer's%20projects/ox%20game/release/android/OX_Neon_Game_v2.apk)
- Transfer to your phone and tap to install (or update).
- **Version 2.0 (Update Ready)**: Automatically updates over existing installations without uninstalling!
- **Microphone Permission**: Handled natively for push-to-talk voice chat.

## 💻 Windows PC
- File: [release/windows/OX_Neon_Game_v2.exe](file:///c:/Users/PC/Desktop/xer's%20projects/ox%20game/release/windows/OX_Neon_Game_v2.exe)
- Double-click to launch immediately. No setup or terminal needed!
- Uses Microsoft Edge Chromium with hardware GPU acceleration.
