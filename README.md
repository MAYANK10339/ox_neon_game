# ⚡ OX NEON — Modern Clean Tic-Tac-Toe Game (60-120 FPS Edition)

A high-performance, gradient-infused **O, X Game** engineered with butter-smooth 60-120 FPS hardware GPU acceleration for budget Android phones (e.g. Realme C55 / Helio G88) and Windows laptops/PCs. Features unbeatable Minimax AI, Pass & Play, and **Real-Time 4-Digit Code Cross-Platform Multiplayer** between **Android and Windows PC**!

---

## 📁 Project Structure

```
ox game/
│
├── release/
│   ├── android/
│   │   ├── OX_Neon_Game.apk        <-- Ultra-smooth signed Android APK (Version 3 Update Ready, ~223 KB)
│   │   └── INSTALL_GUIDE.txt       <-- Easy step-by-step mobile guide
│   └── windows/
│       ├── OX_Neon_Game.exe        <-- Standalone portable Windows PC game (~13 MB)
│       └── README_WINDOWS.txt      <-- PC guide & shortcuts
│
├── src/                            <-- 100% GPU-Optimized Game Source Code
│   ├── index.html                  <-- Main game UI
│   ├── css/
│   │   └── style.css               <-- 0 software filters, pure GPU compositor styling
│   └── js/
│       ├── audio.js                <-- Web Audio procedural synth & safe storage
│       ├── ai.js                   <-- Unbeatable Minimax AI (Easy, Medium, Impossible)
│       ├── multiplayer.js          <-- Cross-platform WebRTC P2P (PC <-> Mobile)
│       ├── game.js                 <-- Core game logic & state
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
│   ├── windows_main.py             <-- Windows native launcher with GPU rasterization flags
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
1. Player 1 opens the game (on Phone or PC) and clicks **MULTIPLAYER** -> **Host Room**.
2. A **4-digit code** is generated (e.g. `7429`).
3. Player 2 opens the game (on Phone or PC), clicks **MULTIPLAYER** -> **Join with Code**.
4. Enter or paste `7429` and click **Join Match**.
5. The game connects in real-time instantly!

---

## 📲 Android Installation
- File: [release/android/OX_Neon_Game.apk](file:///c:/Users/PC/Downloads/ox%20game/release/android/OX_Neon_Game.apk)
- Transfer to your phone and tap to install (or update).
- **Version 3 (Update Ready)**: Automatically updates over existing installations without uninstalling!
- **Smooth Performance**: Runs at 60-120 FPS on MediaTek Helio G88 (Realme C55) and budget phones.

## 💻 Windows PC
- File: [release/windows/OX_Neon_Game.exe](file:///c:/Users/PC/Downloads/ox%20game/release/windows/OX_Neon_Game.exe)
- Double-click to launch immediately. No setup or terminal needed!
- Uses Microsoft Edge Chromium with `--enable-gpu-rasterization` and `--enable-zero-copy` for buttery smooth performance.
- Exit button cleanly closes the window and frees memory.
