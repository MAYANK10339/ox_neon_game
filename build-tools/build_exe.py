import subprocess
import os

print("=== REBUILDING WINDOWS STANDALONE EXECUTABLE ===")
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
icon_path = os.path.join(base_dir, "icons", "app_icon.ico")
main_py = os.path.join(base_dir, "build-tools", "windows_main.py")
src_dir = os.path.join(base_dir, "src")
dist_dir = os.path.join(base_dir, "release", "windows")

cmd = [
    "pyinstaller",
    "--noconsole",
    "--onefile",
    f"--icon={icon_path}",
    "--name=OX_Neon_Game",
    f"--distpath={dist_dir}",
    f"--add-data={os.path.join(src_dir, 'index.html')};src",
    f"--add-data={os.path.join(src_dir, 'css')};src/css",
    f"--add-data={os.path.join(src_dir, 'js')};src/js",
    main_py
]

res = subprocess.run(cmd)
if res.returncode == 0:
    print(f"SUCCESS: Windows EXE built at {os.path.join(dist_dir, 'OX_Neon_Game.exe')}")
else:
    print("Build failed!")
