"""顧客プロファイル設定のテスト"""

from pathlib import Path

import pytest
from pydantic import ValidationError

from app.core.config import CustomerProfile
from app.schemas.collection import PoolStructure, SyncTarget, SyncTargetType, WatchMode


@pytest.fixture
def realtime_target() -> SyncTarget:
    return SyncTarget(
        type=SyncTargetType.entries,
        remote_path="/remote/entries",
        local_name="entries",
        watch=WatchMode.realtime,
    )


@pytest.fixture
def interval_target() -> SyncTarget:
    return SyncTarget(
        type=SyncTargetType.screenshots,
        remote_path="/remote/ss",
        local_name="screenshots",
        watch=WatchMode.interval,
        interval_minutes=5,
    )


class TestCustomerProfile:
    def test_pool_structure_defaults_to_type_first(
        self, realtime_target: SyncTarget
    ) -> None:
        """pool_structure を省略すると type_first になる"""
        profile = CustomerProfile(
            pool_root=Path("/pool"),
            sync_targets=[realtime_target],
        )
        assert profile.pool_structure == PoolStructure.type_first

    def test_pool_root_stored_as_path(self, realtime_target: SyncTarget) -> None:
        """pool_root は Path として保持される"""
        profile = CustomerProfile(
            pool_root=Path("/pool"),
            sync_targets=[realtime_target],
        )
        assert profile.pool_root == Path("/pool")

    def test_sync_targets_stored(
        self, realtime_target: SyncTarget, interval_target: SyncTarget
    ) -> None:
        """sync_targets が正しく保持される"""
        profile = CustomerProfile(
            pool_root=Path("/pool"),
            sync_targets=[realtime_target, interval_target],
        )
        assert len(profile.sync_targets) == 2
        assert profile.sync_targets[0].type == SyncTargetType.entries
        assert profile.sync_targets[1].type == SyncTargetType.screenshots

    def test_pool_structure_terminal_first(self, realtime_target: SyncTarget) -> None:
        """pool_structure=terminal_first を指定できる"""
        profile = CustomerProfile(
            pool_root=Path("/pool"),
            pool_structure=PoolStructure.terminal_first,
            sync_targets=[realtime_target],
        )
        assert profile.pool_structure == PoolStructure.terminal_first

    def test_sync_targets_must_not_be_empty(self) -> None:
        """sync_targets が空リストのときはエラー"""
        with pytest.raises(ValidationError):
            CustomerProfile(
                pool_root=Path("/pool"),
                sync_targets=[],
            )

    def test_create_from_dict(self, realtime_target: SyncTarget) -> None:
        """辞書から生成できる（JSON設定ファイルからの読み込みを想定）"""
        data = {
            "pool_root": "/pool",
            "sync_targets": [
                {
                    "type": "entries",
                    "remote_path": "/remote/entries",
                    "local_name": "entries",
                    "watch": "realtime",
                }
            ],
        }
        profile = CustomerProfile.model_validate(data)
        assert profile.pool_root == Path("/pool")
        assert profile.pool_structure == PoolStructure.type_first
