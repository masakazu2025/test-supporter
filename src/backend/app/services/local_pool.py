"""ローカルプールのパス解決ロジック"""

from pathlib import Path

from app.schemas.collection import PoolStructure, SyncTarget, SyncTargetType


class LocalPoolResolver:
    def __init__(self, root: Path, pool_structure: PoolStructure) -> None:
        self._root = root
        self._pool_structure = pool_structure

    def target_dir(self, target: SyncTarget, terminal: str, date: str) -> Path:
        """対象ターゲットのローカルディレクトリを返す"""
        if self._pool_structure == PoolStructure.type_first:
            return self._root / target.local_name / terminal / date
        else:
            return self._root / terminal / date / target.local_name

    def entry_path(
        self,
        target: SyncTarget,
        terminal: str,
        date: str,
        entry_no: str,
    ) -> Path:
        """type=entries のエントリフォルダパスを返す"""
        assert target.type == SyncTargetType.entries, (
            "entry_path は type=entries のターゲットにのみ使用できます"
        )
        return self.target_dir(target, terminal, date) / entry_no
