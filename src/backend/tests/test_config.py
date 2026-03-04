"""顧客プロファイル設定のテスト"""

import pytest
from pydantic import ValidationError

from app.core.config import CustomerProfile
from app.schemas.collection import CollectionTarget, CollectionType, WatchMode


@pytest.fixture
def realtime_target() -> CollectionTarget:
    return CollectionTarget(
        type=CollectionType.entries,
        src_dir="C:\\TestApp\\entries",
        pattern=".*\\.gz$",
        dst_dir="D:\\pool\\entries\\{ipaddress}\\{yyyymmdd}",
        watch=WatchMode.realtime,
    )


class TestCustomerProfile:
    def test_create_with_required_fields(self, realtime_target: CollectionTarget) -> None:
        """必須フィールドで生成できる"""
        profile = CustomerProfile(
            archiver_path="C:\\Tools\\myarchiver.exe",
            collection_targets=[realtime_target],
        )
        assert profile.archiver_path == "C:\\Tools\\myarchiver.exe"
        assert len(profile.collection_targets) == 1

    def test_collection_targets_stored(self, realtime_target: CollectionTarget) -> None:
        """collection_targets が正しく保持される"""
        target2 = CollectionTarget(
            type=CollectionType.screenshots,
            src_dir="C:\\TestApp\\ss",
            pattern=".*\\.png$",
            dst_dir="D:\\pool\\ss\\{ipaddress}\\{yyyymmdd}",
            watch=WatchMode.realtime,
        )
        profile = CustomerProfile(
            archiver_path="C:\\Tools\\myarchiver.exe",
            collection_targets=[realtime_target, target2],
        )
        assert len(profile.collection_targets) == 2
        assert profile.collection_targets[0].type == CollectionType.entries
        assert profile.collection_targets[1].type == CollectionType.screenshots

    def test_collection_targets_must_not_be_empty(self) -> None:
        """collection_targets が空リストのときはエラー"""
        with pytest.raises(ValidationError):
            CustomerProfile(
                archiver_path="C:\\Tools\\myarchiver.exe",
                collection_targets=[],
            )

    def test_create_from_dict(self) -> None:
        """辞書から生成できる（JSON設定ファイルからの読み込みを想定）"""
        data = {
            "archiver_path": "C:\\Tools\\myarchiver.exe",
            "collection_targets": [
                {
                    "type": "entries",
                    "src_dir": "C:\\TestApp\\entries",
                    "pattern": ".*\\.gz$",
                    "dst_dir": "D:\\pool\\entries\\{ipaddress}\\{yyyymmdd}",
                    "watch": "realtime",
                }
            ],
        }
        profile = CustomerProfile.model_validate(data)
        assert profile.archiver_path == "C:\\Tools\\myarchiver.exe"
        assert len(profile.collection_targets) == 1
        assert profile.collection_targets[0].type == CollectionType.entries
