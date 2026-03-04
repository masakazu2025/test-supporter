"""copy_runner のテスト（FakeRepository使用）"""

import os
import datetime
from dataclasses import dataclass
from pathlib import Path

import pytest

from app.schemas.collection import (
    ActionMode,
    CollectionTarget,
    CollectionType,
    FieldDef,
    FieldSource,
    PostProcess,
    WatchMode,
)
from app.services.copy_runner import CopyJob, run_copy
from app.services.repository import CollectedFileRecord, CollectedFileRepository


class FakeRepository:
    """テスト用のインメモリリポジトリ"""

    def __init__(self) -> None:
        self.saved: list[CollectedFileRecord] = []

    def save(self, record: CollectedFileRecord) -> None:
        self.saved.append(record)


@pytest.fixture
def staging_dir(tmp_path) -> Path:
    d = tmp_path / ".staging" / "192.168.1.10"
    d.mkdir(parents=True)
    return d


@pytest.fixture
def dst_root(tmp_path) -> Path:
    d = tmp_path / "pool"
    d.mkdir()
    return d


@pytest.fixture
def entries_target(dst_root) -> CollectionTarget:
    return CollectionTarget(
        type=CollectionType.entries,
        src_dir="C:\\TestApp\\entries",
        pattern=r".*\.gz$",
        dst_dir=str(dst_root / "{ipaddress}" / "{yyyymmdd}"),
        action=ActionMode.copy,
        watch=WatchMode.realtime,
        fields=[
            FieldDef(name="entry_id", source=FieldSource.filename, regex=r"^(\d+)\.gz$", group=1),
        ],
    )


@pytest.fixture
def src_file(tmp_path) -> Path:
    """採取元ファイル（UNCパスに見立てたローカルパス）"""
    f = tmp_path / "src" / "00123.gz"
    f.parent.mkdir()
    f.write_bytes(b"entry data")
    # mtime を固定
    dt = datetime.datetime(2024, 3, 15, 9, 30, 5, tzinfo=datetime.timezone.utc)
    os.utime(f, (dt.timestamp(), dt.timestamp()))
    return f


class TestRunCopy:
    def test_file_is_copied_to_resolved_dst(
        self,
        tmp_path,
        src_file,
        entries_target,
        staging_dir,
    ) -> None:
        """コピー後にファイルが dst_dir に存在する"""
        repo = FakeRepository()
        job = CopyJob(
            terminal="192.168.1.10",
            src_file=src_file,
            target=entries_target,
        )

        run_copy(job, staging_dir=staging_dir, repo=repo)

        # dst_dir テンプレートが解決された先にファイルが存在する
        expected_dir = entries_target.dst_dir.format(
            ipaddress="192.168.1.10", yyyymmdd="20240315"
        )
        expected_file = Path(expected_dir) / "00123.gz"
        assert expected_file.exists()
        assert expected_file.read_bytes() == b"entry data"

    def test_src_file_remains_for_copy_action(
        self,
        tmp_path,
        src_file,
        entries_target,
        staging_dir,
    ) -> None:
        """action=copy のとき元ファイルが残る"""
        repo = FakeRepository()
        job = CopyJob(terminal="192.168.1.10", src_file=src_file, target=entries_target)

        run_copy(job, staging_dir=staging_dir, repo=repo)

        assert src_file.exists()

    def test_src_file_removed_for_move_action(
        self,
        tmp_path,
        src_file,
        dst_root,
        staging_dir,
    ) -> None:
        """action=move のとき元ファイルが削除される"""
        target = CollectionTarget(
            type=CollectionType.files,
            src_dir="C:\\TestApp\\files",
            pattern=r".*\.gz$",
            dst_dir=str(dst_root / "{ipaddress}" / "{yyyymmdd}"),
            action=ActionMode.move,
        )
        repo = FakeRepository()
        job = CopyJob(terminal="192.168.1.10", src_file=src_file, target=target)

        run_copy(job, staging_dir=staging_dir, repo=repo)

        assert not src_file.exists()

    def test_repo_save_called_with_metadata(
        self,
        tmp_path,
        src_file,
        entries_target,
        staging_dir,
    ) -> None:
        """コピー後に repo.save が呼ばれ、metadata が保存される"""
        repo = FakeRepository()
        job = CopyJob(terminal="192.168.1.10", src_file=src_file, target=entries_target)

        run_copy(job, staging_dir=staging_dir, repo=repo)

        assert len(repo.saved) == 1
        record = repo.saved[0]
        assert record.terminal == "192.168.1.10"
        assert record.metadata["entry_id"] == "00123"
        assert record.metadata["yyyymmdd"] == "20240315"
        assert record.metadata["ipaddress"] == "192.168.1.10"

    def test_no_tmp_files_in_staging_after_run(
        self,
        tmp_path,
        src_file,
        entries_target,
        staging_dir,
    ) -> None:
        """実行後にstagingに .tmp ファイルが残らない"""
        repo = FakeRepository()
        job = CopyJob(terminal="192.168.1.10", src_file=src_file, target=entries_target)

        run_copy(job, staging_dir=staging_dir, repo=repo)

        tmp_files = list(staging_dir.glob("*.tmp"))
        assert tmp_files == []

    def test_rename_template_applied(
        self,
        tmp_path,
        src_file,
        dst_root,
        staging_dir,
    ) -> None:
        """rename テンプレートが適用される"""
        target = CollectionTarget(
            type=CollectionType.screenshots,
            src_dir="C:\\TestApp\\ss",
            pattern=r".*\.gz$",
            dst_dir=str(dst_root / "{ipaddress}"),
            rename="{ipaddress12}_{timestamp}.{ext}",
            action=ActionMode.copy,
        )
        repo = FakeRepository()
        job = CopyJob(terminal="192.168.1.10", src_file=src_file, target=target)

        run_copy(job, staging_dir=staging_dir, repo=repo)

        expected_dir = dst_root / "192.168.1.10"
        renamed_file = expected_dir / "192168001010_20240315093005.gz"
        assert renamed_file.exists()

    def test_dst_path_saved_in_record(
        self,
        tmp_path,
        src_file,
        entries_target,
        staging_dir,
    ) -> None:
        """保存された record に dst_path が含まれる"""
        repo = FakeRepository()
        job = CopyJob(terminal="192.168.1.10", src_file=src_file, target=entries_target)

        run_copy(job, staging_dir=staging_dir, repo=repo)

        record = repo.saved[0]
        assert record.dst_path.exists()
        assert record.dst_path.name == "00123.gz"
