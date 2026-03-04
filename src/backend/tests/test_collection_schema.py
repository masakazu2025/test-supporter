"""採取スキーマのバリデーションテスト"""

import pytest
from pydantic import ValidationError

from app.schemas.collection import (
    ActionMode,
    CollectionTarget,
    CollectionType,
    FieldDef,
    FieldSource,
    WatchMode,
)


class TestCollectionTarget:
    def test_minimal_creation(self) -> None:
        """必須フィールドのみで生成できる"""
        target = CollectionTarget(
            type=CollectionType.entries,
            src_dir="C:\\TestApp\\entries",
            pattern=".*\\.gz$",
            dst_dir="D:\\pool\\entries",
            action=ActionMode.copy,
        )
        assert target.type == CollectionType.entries
        assert target.rename is None
        assert target.post_process is None
        assert target.watch is None
        assert target.schedule is None
        assert target.fields == []

    def test_action_defaults_to_copy(self) -> None:
        """action のデフォルトは copy"""
        target = CollectionTarget(
            type=CollectionType.entries,
            src_dir="C:\\TestApp\\entries",
            pattern=".*\\.gz$",
            dst_dir="D:\\pool\\entries",
        )
        assert target.action == ActionMode.copy

    def test_interval_watch_requires_interval_minutes(self) -> None:
        """watch=interval のとき interval_minutes が未指定ならエラー"""
        with pytest.raises(ValidationError):
            CollectionTarget(
                type=CollectionType.entries,
                src_dir="C:\\TestApp\\entries",
                pattern=".*\\.gz$",
                dst_dir="D:\\pool\\entries",
                watch=WatchMode.interval,
            )

    def test_interval_watch_with_interval_minutes_ok(self) -> None:
        """watch=interval のとき interval_minutes を指定すれば正常生成"""
        target = CollectionTarget(
            type=CollectionType.entries,
            src_dir="C:\\TestApp\\entries",
            pattern=".*\\.gz$",
            dst_dir="D:\\pool\\entries",
            watch=WatchMode.interval,
            interval_minutes=10,
        )
        assert target.interval_minutes == 10

    def test_watch_and_schedule_are_mutually_exclusive(self) -> None:
        """watch と schedule を同時に指定するとエラー"""
        with pytest.raises(ValidationError):
            CollectionTarget(
                type=CollectionType.entries,
                src_dir="C:\\TestApp\\entries",
                pattern=".*\\.gz$",
                dst_dir="D:\\pool\\entries",
                watch=WatchMode.realtime,
                schedule="Friday 19:00",
            )

    def test_schedule_without_watch_ok(self) -> None:
        """schedule だけ指定（watch=None）は正常"""
        target = CollectionTarget(
            type=CollectionType.screenshots,
            src_dir="C:\\TestApp\\ss",
            pattern=".*\\.png$",
            dst_dir="D:\\pool\\ss",
            schedule="Friday 19:00",
        )
        assert target.schedule == "Friday 19:00"
        assert target.watch is None

    def test_fields_accepts_list(self) -> None:
        """fields リストを設定できる"""
        target = CollectionTarget(
            type=CollectionType.entries,
            src_dir="C:\\TestApp\\entries",
            pattern=".*\\.gz$",
            dst_dir="D:\\pool\\entries",
            fields=[
                {"name": "entry_id", "source": "filename", "regex": "^(\\d+)\\.gz$", "group": 1},
                {"name": "date", "source": "mtime", "format": "yyyymmdd"},
            ],
        )
        assert len(target.fields) == 2
        assert target.fields[0].name == "entry_id"
        assert target.fields[1].source == FieldSource.mtime


class TestFieldDef:
    def test_filename_source_ok(self) -> None:
        """source=filename は regex と group が必要"""
        field = FieldDef(
            name="entry_id",
            source=FieldSource.filename,
            regex="^(\\d+)\\.gz$",
            group=1,
        )
        assert field.name == "entry_id"

    def test_filename_source_requires_regex(self) -> None:
        """source=filename のとき regex がなければエラー"""
        with pytest.raises(ValidationError):
            FieldDef(name="entry_id", source=FieldSource.filename, group=1)

    def test_filename_source_requires_group(self) -> None:
        """source=filename のとき group がなければエラー"""
        with pytest.raises(ValidationError):
            FieldDef(name="entry_id", source=FieldSource.filename, regex="^(\\d+)\\.gz$")

    def test_mtime_source_requires_format(self) -> None:
        """source=mtime のとき format がなければエラー"""
        with pytest.raises(ValidationError):
            FieldDef(name="date", source=FieldSource.mtime)

    def test_mtime_source_ok(self) -> None:
        """source=mtime は format が必要"""
        field = FieldDef(name="date", source=FieldSource.mtime, format="yyyymmdd")
        assert field.format == "yyyymmdd"

    def test_terminal_source_requires_format(self) -> None:
        """source=terminal のとき format がなければエラー"""
        with pytest.raises(ValidationError):
            FieldDef(name="ip12", source=FieldSource.terminal)

    def test_terminal_source_ok(self) -> None:
        """source=terminal は format が必要"""
        field = FieldDef(name="ip12", source=FieldSource.terminal, format="12digit")
        assert field.format == "12digit"
