import os
import shutil
import subprocess
import zipfile
from PIL import Image

print("==================================================")
print("  OX NEON - ULTRA-OPTIMIZED APK (VERSION 3 - UPDATE)")
print("==================================================")

tools_dir = os.path.dirname(os.path.abspath(__file__))
base_dir = os.path.dirname(tools_dir)
src_dir = os.path.join(base_dir, "src")
icons_dir = os.path.join(base_dir, "icons")
release_android_dir = os.path.join(base_dir, "release", "android")
os.makedirs(release_android_dir, exist_ok=True)

native_dir = os.path.join(tools_dir, "native_build_temp")
if os.path.exists(native_dir):
    shutil.rmtree(native_dir)
os.makedirs(native_dir, exist_ok=True)

# 1. Create AndroidManifest.xml with versionCode="3" and versionName="1.2.0" for direct in-place update!
manifest_content = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.oxneon.game"
    android:versionCode="3"
    android:versionName="1.2.0">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:label="OX Neon"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:hardwareAccelerated="true"
        android:largeHeap="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">

        <activity
            android:name="com.oxneon.game.MainActivity"
            android:label="OX Neon"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:screenOrientation="portrait"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"""

manifest_file = os.path.join(native_dir, "AndroidManifest.xml")
with open(manifest_file, "w", encoding="utf-8") as f:
    f.write(manifest_content)
print("1. AndroidManifest.xml (v3 / update ready) created.")

# 2. Res folder and icons
res_dir = os.path.join(native_dir, "res")
values_dir = os.path.join(res_dir, "values")
os.makedirs(values_dir, exist_ok=True)

with open(os.path.join(values_dir, "strings.xml"), "w", encoding="utf-8") as f:
    f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <string name="app_name">OX Neon</string>\n</resources>\n')

densities = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
}

master_sq = Image.open(os.path.join(icons_dir, 'icon_square_512.png'))
master_rd = Image.open(os.path.join(icons_dir, 'icon_round_512.png'))

for folder, size in densities.items():
    folder_path = os.path.join(res_dir, folder)
    os.makedirs(folder_path, exist_ok=True)
    master_sq.resize((size, size), Image.Resampling.LANCZOS).save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
    master_rd.resize((size, size), Image.Resampling.LANCZOS).save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")

print("2. Res folder and density launcher icons created.")

# 3. Compile resources using aapt2
aapt2_exe = os.path.join(tools_dir, "aapt2_bin", "aapt2.exe")
android_jar = os.path.join(tools_dir, "android.jar")
r8_jar = os.path.join(tools_dir, "r8.jar")
apksig_jar = os.path.join(tools_dir, "apksig.jar")
keystore_file = os.path.join(tools_dir, "ox_neon.keystore")

compiled_res_zip = os.path.join(native_dir, "compiled_res.zip")
cmd_compile = [
    aapt2_exe,
    "compile",
    "--dir", res_dir,
    "-o", compiled_res_zip
]
res = subprocess.run(cmd_compile, capture_output=True, text=True)
if res.returncode != 0:
    print("aapt2 compile error:", res.stderr)
    raise RuntimeError("aapt2 compile failed")
print("3. Resources compiled by aapt2.")

# Link resources using aapt2
base_apk = os.path.join(native_dir, "base_linked.apk")
cmd_link = [
    aapt2_exe,
    "link",
    "-I", android_jar,
    "--manifest", manifest_file,
    "-o", base_apk,
    compiled_res_zip,
    "--auto-add-overlay"
]
res = subprocess.run(cmd_link, capture_output=True, text=True)
if res.returncode != 0:
    print("aapt2 link error:", res.stderr)
    raise RuntimeError("aapt2 link failed")
print("4. Resources linked by aapt2 into base APK.")

# 5. Create High-Performance MainActivity.java with Native Exit Bridge and Hardware GPU Layer
src_code_dir = os.path.join(native_dir, "src", "com", "oxneon", "game")
os.makedirs(src_code_dir, exist_ok=True)

java_code = """package com.oxneon.game;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView webView;

    public class AndroidBridge {
        @JavascriptInterface
        public void exitApp() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    finishAffinity();
                    System.exit(0);
                }
            });
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            requestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(
                WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN
            );
        } catch (Exception e) {}

        webView = new WebView(this);
        setContentView(webView);

        // Hardware GPU acceleration for ultra-smooth rendering on budget phones (Realme C55 / Helio G88)
        try {
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        } catch (Exception e) {}

        try {
            WebSettings ws = webView.getSettings();
            ws.setJavaScriptEnabled(true);
            ws.setDomStorageEnabled(true);
            ws.setAllowFileAccess(true);
            ws.setAllowFileAccessFromFileURLs(true);
            ws.setAllowUniversalAccessFromFileURLs(true);
            ws.setDatabaseEnabled(true);
            ws.setLoadWithOverviewMode(true);
            ws.setUseWideViewPort(true);
            ws.setRenderPriority(WebSettings.RenderPriority.HIGH);
            ws.setCacheMode(WebSettings.LOAD_DEFAULT);
        } catch (Exception e) {}

        // Add Bridge for instantaneous exit
        webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient());

        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            webView.evaluateJavascript("if (window.handleHardwareBack) { window.handleHardwareBack(); } else { 'default'; }", new ValueCallback<String>() {
                @Override
                public void onReceiveValue(String value) {
                    if ("\\"exit\\"".equals(value)) {
                        finishAffinity();
                        System.exit(0);
                    } else if (!"\\"handled\\"".equals(value)) {
                        if (webView.canGoBack()) {
                            webView.goBack();
                        } else {
                            finishAffinity();
                        }
                    }
                }
            });
        } else {
            super.onBackPressed();
        }
    }
}
"""

java_file = os.path.join(src_code_dir, "MainActivity.java")
with open(java_file, "w", encoding="utf-8") as f:
    f.write(java_code)
print("5. High-Performance MainActivity.java created.")

# 6. Compile Java with javac
bin_dir = os.path.join(native_dir, "bin")
os.makedirs(bin_dir, exist_ok=True)

cmd_javac = [
    "javac",
    "-cp", android_jar,
    "-d", bin_dir,
    java_file
]
res = subprocess.run(cmd_javac, capture_output=True, text=True)
if res.returncode != 0:
    print("javac error:", res.stderr)
    raise RuntimeError("javac failed")
print("6. Java code compiled to .class files.")

# 7. Convert .class to classes.dex using D8
dex_output_dir = os.path.join(native_dir, "dex")
os.makedirs(dex_output_dir, exist_ok=True)

class_files = [
    os.path.join(bin_dir, "com", "oxneon", "game", "MainActivity.class"),
    os.path.join(bin_dir, "com", "oxneon", "game", "MainActivity$1.class"),
    os.path.join(bin_dir, "com", "oxneon", "game", "MainActivity$2.class"),
    os.path.join(bin_dir, "com", "oxneon", "game", "MainActivity$AndroidBridge.class"),
    os.path.join(bin_dir, "com", "oxneon", "game", "MainActivity$AndroidBridge$1.class")
]

cmd_d8 = [
    "java",
    "-cp", r8_jar,
    "com.android.tools.r8.D8"
] + class_files + [
    "--lib", android_jar,
    "--min-api", "21",
    "--output", dex_output_dir
]
res = subprocess.run(cmd_d8, capture_output=True, text=True)
if res.returncode != 0:
    print("D8 error:", res.stderr)
    raise RuntimeError("D8 failed")
print("7. Compiled to native classes.dex via D8.")

# 8. Assemble Full Unsigned APK directly from src/ (Ultra-optimized GPU code)
print("8. Packaging assets and dex into APK from src/...")
dex_file = os.path.join(dex_output_dir, "classes.dex")
unsigned_apk = os.path.join(native_dir, "ox_neon_unsigned.apk")

shutil.copy(base_apk, unsigned_apk)

with zipfile.ZipFile(unsigned_apk, 'a', zipfile.ZIP_DEFLATED) as z:
    z.write(dex_file, "classes.dex")
    z.write(os.path.join(src_dir, "index.html"), "assets/index.html")
    z.write(os.path.join(src_dir, "css", "style.css"), "assets/css/style.css")
    for js_f in ["audio.js", "ai.js", "multiplayer.js", "game.js", "app.js"]:
        z.write(os.path.join(src_dir, "js", js_f), f"assets/js/{js_f}")
    vendor_dir = os.path.join(src_dir, "js", "vendor")
    for v_f in os.listdir(vendor_dir):
        z.write(os.path.join(vendor_dir, v_f), f"assets/js/vendor/{v_f}")

print("9. Unsigned APK assembled with src/ assets.")

# 9. 4-Byte ZipAlign
import sys
sys.path.insert(0, tools_dir)
import align_zip
aligned_apk = os.path.join(native_dir, "ox_neon_aligned.apk")
align_zip.zipalign(unsigned_apk, aligned_apk, alignment=4)
print("10. APK 4-byte aligned.")

# 10. Sign with Scheme v1, v2, v3 using SAME keystore for seamless updates
final_apk_path = os.path.join(release_android_dir, "OX_Neon_Game.apk")
if os.path.exists(final_apk_path):
    os.remove(final_apk_path)

cmd_sign = [
    "java",
    "-cp", f"{apksig_jar};{tools_dir}",
    "ApkSignerHelper",
    aligned_apk,
    final_apk_path,
    keystore_file,
    "oxneon123",
    "oxneon"
]
res = subprocess.run(cmd_sign, capture_output=True, text=True)
print(res.stdout)
if res.returncode != 0:
    print("Signing error:", res.stderr)
    raise RuntimeError("Signing failed")

# Verify badging
cmd_badge = [aapt2_exe, "dump", "badging", final_apk_path]
res = subprocess.run(cmd_badge, capture_output=True, text=True)
print("\n--- Final APK Badging ---")
for line in res.stdout.splitlines():
    if any(k in line for k in ['package:', 'sdkVersion:', 'targetSdkVersion:', 'application-label:', 'application-icon-160:', 'application:']):
        print(" ", line)

# Also make root copy for user convenience
root_apk = os.path.join(base_dir, "OX_Neon_Game.apk")
shutil.copy(final_apk_path, root_apk)

if os.path.exists(native_dir):
    shutil.rmtree(native_dir)

print(f"\n🎉 UPDATE BUILD COMPLETE: {final_apk_path} ({os.path.getsize(final_apk_path):,} bytes)")
