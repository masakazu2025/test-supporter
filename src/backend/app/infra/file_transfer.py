"""ファイル転送（アトミックコピー・アトミック移動）"""

import shutil
from pathlib import Path


def atomic_copy(src: Path, dst: Path) -> None:
    """
    ファイルを .tmp 経由でアトミックにコピーする。

    既に宛先ファイルが存在する場合はスキップする。
    コピー失敗時は .tmp ファイルを削除する。
    shutil.copy2 により mtime が保持される。
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


def atomic_move(src: Path, dst: Path) -> None:
    """
    ファイルを .tmp 経由でアトミックに移動する。

    コピー後にソースを削除する。
    コピー失敗時は .tmp ファイルを削除し、ソースを保持する。
    """
    tmp = dst.parent / (dst.name + ".tmp")
    try:
        shutil.copy2(src, tmp)
        tmp.rename(dst)
        src.unlink()
    except Exception:
        if tmp.exists():
            tmp.unlink()
        raise
