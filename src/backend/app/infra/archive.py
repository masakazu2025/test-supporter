"""subprocessによる解凍（I/O）"""

import subprocess
from pathlib import Path


def extract_archive(archiver_path: str, archive: Path, dst: Path) -> None:
    """
    専用アーカイバを使って .gz アーカイブを解凍する。

    解凍先ディレクトリを .tmp/ 経由でアトミックに確定する。
    解凍後もアーカイブファイルは保持する。

    宛先ディレクトリが既に存在する場合はスキップする（採取完了の証明）。

    Args:
        archiver_path: アーカイバ実行ファイルのパス
        archive: 解凍するアーカイブファイルのパス（.gz）
        dst: 解凍先ディレクトリのパス

    Raises:
        subprocess.CalledProcessError: アーカイバが失敗した場合
    """
    if dst.exists():
        return

    tmp = dst.parent / (dst.name + ".tmp")
    try:
        subprocess.run(
            [archiver_path, str(archive), str(tmp)],
            check=True,
        )
        tmp.rename(dst)
    except Exception:
        if tmp.exists():
            import shutil
            shutil.rmtree(tmp)
        raise
