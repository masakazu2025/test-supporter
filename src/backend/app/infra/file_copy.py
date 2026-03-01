"""アトミックコピー（I/O）"""

import shutil
from pathlib import Path


def atomic_copy(src: Path, dst: Path) -> None:
    """
    ファイルを .tmp 経由でアトミックにコピーする。

    既に宛先ファイルが存在する場合はスキップする。
    コピー失敗時は .tmp ファイルを削除する。

    Args:
        src: コピー元ファイルパス
        dst: コピー先ファイルパス（親ディレクトリは事前に作成済みであること）
    """
    if dst.exists():
        return

    tmp = dst.parent / (dst.name + ".tmp")
    try:
        shutil.copy2(src, tmp)
        tmp.rename(dst)
    except Exception:
        if tmp.exists():
            tmp.unlink()
        raise
