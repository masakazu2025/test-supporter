"""採取スキーマのバリデーションテスト"""

import pytest
from pydantic import ValidationError

from app.schemas.collection import SyncTarget, SyncTargetType, WatchMode


class TestSyncTargetValidation:
    def test_interval_watch_requires_interval_minutes(self) -> None:
        """watch=interval のとき interval_minutes が未指定ならエラー"""
        with pytest.raises(ValidationError):
            SyncTarget(
                type=SyncTargetType.entries,
                remote_path="/remote/entries",
                local_name="entries",
                watch=WatchMode.interval,
                # interval_minutes を意図的に省略
            )

    def test_interval_watch_with_interval_minutes_ok(self) -> None:
        """watch=interval のとき interval_minutes を指定すれば正常生成"""
        target = SyncTarget(
            type=SyncTargetType.entries,
            remote_path="/remote/entries",
            local_name="entries",
            watch=WatchMode.interval,
            interval_minutes=10,
        )
        assert target.interval_minutes == 10

    def test_realtime_watch_without_interval_minutes_ok(self) -> None:
        """watch=realtime のとき interval_minutes は不要"""
        target = SyncTarget(
            type=SyncTargetType.screenshots,
            remote_path="/remote/ss",
            local_name="screenshots",
            watch=WatchMode.realtime,
        )
        assert target.interval_minutes is None

    def test_interval_minutes_not_allowed_for_realtime(self) -> None:
        """watch=realtime のとき interval_minutes を指定してもエラーにならない（無視される）"""
        # 明示的に指定しても構わない（将来の警告は別途）
        target = SyncTarget(
            type=SyncTargetType.files,
            remote_path="/remote/files",
            local_name="files",
            watch=WatchMode.realtime,
            interval_minutes=60,
        )
        assert target.interval_minutes == 60
