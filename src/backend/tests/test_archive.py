"""アーカイブ解凍のテスト"""

import subprocess
from pathlib import Path

import pytest

from app.infra.archive import extract_archive


class TestExtractArchive:
    def test_calls_archiver_with_correct_args(self, tmp_path, monkeypatch) -> None:
        """アーカイバに正しいコマンドライン引数を渡す"""
        archive = tmp_path / "entry001.gz"
        archive.write_bytes(b"fake archive")
        dst = tmp_path / "entry001"
        archiver = "/path/to/archiver"

        calls = []

        def fake_run(cmd, **kwargs):
            calls.append(cmd)
            # 解凍先ディレクトリを作成してアーカイバの動作をシミュレート
            (tmp_path / "entry001.tmp").mkdir()
            return subprocess.CompletedProcess(cmd, 0)

        monkeypatch.setattr(subprocess, "run", fake_run)
        extract_archive(archiver_path=archiver, archive=archive, dst=dst)

        assert len(calls) == 1
        assert calls[0][0] == archiver
        assert str(archive) in calls[0]

    def test_renames_tmp_to_dst_on_success(self, tmp_path, monkeypatch) -> None:
        """解凍成功後に .tmp/ を正式名にリネームする"""
        archive = tmp_path / "entry001.gz"
        archive.write_bytes(b"fake archive")
        dst = tmp_path / "entry001"

        def fake_run(cmd, **kwargs):
            (tmp_path / "entry001.tmp").mkdir()
            return subprocess.CompletedProcess(cmd, 0)

        monkeypatch.setattr(subprocess, "run", fake_run)
        extract_archive(archiver_path="/archiver", archive=archive, dst=dst)

        assert dst.exists()
        assert not (tmp_path / "entry001.tmp").exists()

    def test_archive_file_is_kept(self, tmp_path, monkeypatch) -> None:
        """解凍後もアーカイブファイルを保持する"""
        archive = tmp_path / "entry001.gz"
        archive.write_bytes(b"fake archive")
        dst = tmp_path / "entry001"

        def fake_run(cmd, **kwargs):
            (tmp_path / "entry001.tmp").mkdir()
            return subprocess.CompletedProcess(cmd, 0)

        monkeypatch.setattr(subprocess, "run", fake_run)
        extract_archive(archiver_path="/archiver", archive=archive, dst=dst)

        assert archive.exists()

    def test_cleans_tmp_on_archiver_failure(self, tmp_path, monkeypatch) -> None:
        """アーカイバ失敗時に .tmp/ を削除して例外を送出する"""
        archive = tmp_path / "entry001.gz"
        archive.write_bytes(b"fake archive")
        dst = tmp_path / "entry001"

        def fake_run(cmd, **kwargs):
            tmp_dir = tmp_path / "entry001.tmp"
            tmp_dir.mkdir()
            raise subprocess.CalledProcessError(1, cmd)

        monkeypatch.setattr(subprocess, "run", fake_run)

        with pytest.raises(subprocess.CalledProcessError):
            extract_archive(archiver_path="/archiver", archive=archive, dst=dst)

        assert not (tmp_path / "entry001.tmp").exists()
        assert not dst.exists()

    def test_skips_if_dst_exists(self, tmp_path, monkeypatch) -> None:
        """宛先ディレクトリが既に存在する場合はスキップする"""
        archive = tmp_path / "entry001.gz"
        archive.write_bytes(b"fake archive")
        dst = tmp_path / "entry001"
        dst.mkdir()

        calls = []
        monkeypatch.setattr(
            subprocess, "run", lambda cmd, **kw: calls.append(cmd)
        )

        extract_archive(archiver_path="/archiver", archive=archive, dst=dst)

        assert len(calls) == 0
