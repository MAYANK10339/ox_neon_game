import os
import sys
import webview

class WindowApi:
    def __init__(self):
        self._window = None

    def set_window(self, window):
        self._window = window

    def exitApp(self):
        try:
            if self._window:
                self._window.destroy()
        except Exception:
            pass
        sys.exit(0)

def main():
    # Resolve base resource path when packed by PyInstaller
    if getattr(sys, 'frozen', False):
        base_dir = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
    else:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # Look for index.html in src/ or root
    index_html = os.path.join(base_dir, 'src', 'index.html')
    if not os.path.exists(index_html):
        index_html = os.path.join(base_dir, 'index.html')

    # Force Edge Chromium GPU acceleration and Microphone WebRTC flags
    os.environ['WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS'] = (
        '--enable-gpu-rasterization '
        '--enable-zero-copy '
        '--ignore-gpu-blocklist '
        '--disable-background-timer-throttling '
        '--enable-accelerated-2d-canvas '
        '--use-fake-ui-for-media-stream '
        '--enable-media-stream'
    )

    api = WindowApi()
    window = webview.create_window(
        title='OX Ultimate - The Ultimate Tic-Tac-Toe Arena',
        url=index_html,
        width=460,
        height=760,
        resizable=True,
        min_size=(380, 600),
        background_color='#070a12',
        js_api=api
    )
    api.set_window(window)
    webview.start(gui='edgechromium', debug=False)

if __name__ == '__main__':
    main()
