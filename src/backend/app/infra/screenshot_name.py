"""スクリーンショットのリネーム規則（純粋関数）"""

from datetime import datetime


def build_screenshot_name(terminal: str, mtime: datetime, ext: str) -> str:
    """
    スクリーンショットの正規ファイル名を生成する。

    形式: {12桁IP}_{yyyymmddHHMMSS}.{ext}

    Args:
        terminal: リモート端末のIPアドレス（例: 192.168.1.10）
        mtime: リモートファイルの更新日時
        ext: 拡張子（ドットなし、例: jpg）

    Returns:
        リネーム後のファイル名（例: 192168001010_20240315093005.jpg）
    """
    ip12 = "".join(f"{int(octet):03d}" for octet in terminal.split("."))
    timestamp = mtime.strftime("%Y%m%d%H%M%S")
    return f"{ip12}_{timestamp}.{ext}"
