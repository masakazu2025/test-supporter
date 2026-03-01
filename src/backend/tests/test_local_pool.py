"""ローカルプールのパス解決ロジックのテスト"""

from pathlib import Path

import pytest

from app.schemas.collection import PoolStructure, SyncTarget, SyncTargetType, WatchMode
from app.services.local_pool import LocalPoolResolver


@pytest.fixture
def entries_target() -> SyncTarget:
    return SyncTarget(
        type=SyncTargetType.entries,
        remote_path="/remote/entries",
        local_name="entries",
        watch=WatchMode.realtime,
    )


@pytest.fixture
def screenshots_target() -> SyncTarget:
    return SyncTarget(
        type=SyncTargetType.screenshots,
        remote_path="/remote/ss",
        local_name="screenshots",
        watch=WatchMode.realtime,
    )


class TestLocalPoolResolver:
    """type_first構造のパス解決"""

    def test_entry_path_type_first(self, entries_target: SyncTarget) -> None:
        resolver = LocalPoolResolver(
            root=Path("/pool"),
            pool_structure=PoolStructure.type_first,
        )
        path = resolver.entry_path(
            target=entries_target,
            terminal="192.168.1.10",
            date="2026-02-28",
            entry_no="00001",
        )
        assert path == Path("/pool/entries/192.168.1.10/2026-02-28/00001")

    def test_target_dir_type_first(self, screenshots_target: SyncTarget) -> None:
        resolver = LocalPoolResolver(
            root=Path("/pool"),
            pool_structure=PoolStructure.type_first,
        )
        path = resolver.target_dir(
            target=screenshots_target,
            terminal="192.168.1.10",
            date="2026-02-28",
        )
        assert path == Path("/pool/screenshots/192.168.1.10/2026-02-28")

    def test_entry_path_terminal_first(self, entries_target: SyncTarget) -> None:
        resolver = LocalPoolResolver(
            root=Path("/pool"),
            pool_structure=PoolStructure.terminal_first,
        )
        path = resolver.entry_path(
            target=entries_target,
            terminal="192.168.1.10",
            date="2026-02-28",
            entry_no="00001",
        )
        assert path == Path("/pool/192.168.1.10/2026-02-28/entries/00001")

    def test_target_dir_terminal_first(self, screenshots_target: SyncTarget) -> None:
        resolver = LocalPoolResolver(
            root=Path("/pool"),
            pool_structure=PoolStructure.terminal_first,
        )
        path = resolver.target_dir(
            target=screenshots_target,
            terminal="192.168.1.10",
            date="2026-02-28",
        )
        assert path == Path("/pool/192.168.1.10/2026-02-28/screenshots")

    def test_local_name_used_as_folder_name(self) -> None:
        """local_nameがフォルダ名として使われること（セキュリティ上の名称変更対応）"""
        target = SyncTarget(
            type=SyncTargetType.entries,
            remote_path="/remote/secret_entries",
            local_name="records",  # リモートと異なる名称
            watch=WatchMode.realtime,
        )
        resolver = LocalPoolResolver(
            root=Path("/pool"),
            pool_structure=PoolStructure.type_first,
        )
        path = resolver.entry_path(
            target=target,
            terminal="192.168.1.10",
            date="2026-02-28",
            entry_no="00001",
        )
        assert path == Path("/pool/records/192.168.1.10/2026-02-28/00001")
        assert "secret_entries" not in str(path)

    def test_interval_target_has_no_entry_no(self, screenshots_target: SyncTarget) -> None:
        """screenshots/filesはentry_no構造を持たない"""
        resolver = LocalPoolResolver(
            root=Path("/pool"),
            pool_structure=PoolStructure.type_first,
        )
        path = resolver.target_dir(
            target=screenshots_target,
            terminal="192.168.1.10",
            date="2026-02-28",
        )
        # entry_noのサブディレクトリがないこと
        assert path == Path("/pool/screenshots/192.168.1.10/2026-02-28")
