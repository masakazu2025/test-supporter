"""Windowsパス → UNCパス変換（純粋関数）"""

import re


def to_unc_path(terminal: str, windows_path: str) -> str:
    """
    Windowsパスをリモート端末のUNCパスに変換する。

    変換ルール: {drive}:\\{path} → \\\\{terminal}\\{drive}$\\{path}

    Args:
        terminal: リモート端末のIPアドレス
        windows_path: リモート端末上のWindowsパス（例: C:\\TestApp\\entries）

    Returns:
        UNCパス（例: \\\\192.168.1.10\\C$\\TestApp\\entries）

    Raises:
        ValueError: ドライブ文字が含まれていない場合
    """
    normalized = windows_path.replace("/", "\\")
    match = re.match(r"^([A-Za-z]):\\(.*)", normalized)
    if not match:
        raise ValueError(f"ドライブ文字が見つかりません: {windows_path!r}")

    drive = match.group(1).upper()
    rest = match.group(2)
    return f"\\\\{terminal}\\{drive}$\\{rest}"
