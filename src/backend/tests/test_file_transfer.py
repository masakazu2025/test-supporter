"""ファイル転送（atomic_copy / atomic_move）のテスト"""

import shutil

import pytest

from app.infra.file_transfer import atomic_copy, atomic_move


class TestAtomicCopy:
    def test_copies_file_to_destination(self, tmp_path) -> None:
        """ファイルを宛先にコピーする"""
        src = tmp_path / "source.gz"
        src.write_bytes(b"archive data")
        dst = tmp_path / "dest" / "output.gz"
        dst.parent.mkdir()

        atomic_copy(src, dst)

        assert dst.exists()
        assert dst.read_bytes() == b"archive data"

    def test_source_remains_after_copy(self, tmp_path) -> None:
        """コピー後もソースファイルが残る"""
        src = tmp_path / "source.gz"
        src.write_bytes(b"data")
        dst = tmp_path / "output.gz"

        atomic_copy(src, dst)

        assert src.exists()

    def test_no_tmp_file_remains(self, tmp_path) -> None:
        """コピー完了後に .tmp ファイルが残らない"""
        src = tmp_path / "source.gz"
        src.write_bytes(b"data")
        dst = tmp_path / "output.gz"

        atomic_copy(src, dst)

        assert not (dst.parent / (dst.name + ".tmp")).exists()

    def test_tmp_file_used_during_copy(self, tmp_path, monkeypatch) -> None:
        """コピー中は .tmp ファイルが使われる"""
        src = tmp_path / "source.gz"
        src.write_bytes(b"data")
        dst = tmp_path / "output.gz"

        observed_tmp = []
        original_copy2 = shutil.copy2

        def spy_copy2(s, d, **kwargs):
            observed_tmp.append(str(d))
            return original_copy2(s, d, **kwargs)

        monkeypatch.setattr(shutil, "copy2", spy_copy2)
        atomic_copy(src, dst)

        assert len(observed_tmp) == 1
        assert observed_tmp[0].endswith(".tmp")

    def test_cleans_tmp_on_error(self, tmp_path, monkeypatch) -> None:
        """コピー失敗時に .tmp ファイルを削除する"""
        src = tmp_path / "source.gz"
        src.write_bytes(b"data")
        dst = tmp_path / "output.gz"
        tmp = tmp_path / "output.gz.tmp"

        def fail_copy2(s, d, **kwargs):
            (tmp_path / "output.gz.tmp").write_bytes(b"partial")
            raise OSError("コピー失敗")

        monkeypatch.setattr(shutil, "copy2", fail_copy2)

        with pytest.raises(OSError):
            atomic_copy(src, dst)

        assert not tmp.exists()
        assert not dst.exists()

    def test_destination_already_exists_skips(self, tmp_path) -> None:
        """宛先ファイルが既に存在する場合はスキップ（上書きしない）"""
        src = tmp_path / "source.gz"
        src.write_bytes(b"new data")
        dst = tmp_path / "output.gz"
        dst.write_bytes(b"existing data")

        atomic_copy(src, dst)

        assert dst.read_bytes() == b"existing data"

    def test_preserves_mtime(self, tmp_path) -> None:
        """shutil.copy2 によりソースの mtime が保持される"""
        import os
        import time

        src = tmp_path / "source.gz"
        src.write_bytes(b"data")
        # mtime を過去に設定
        past = time.time() - 3600
        os.utime(src, (past, past))
        dst = tmp_path / "output.gz"

        atomic_copy(src, dst)

        assert abs(dst.stat().st_mtime - src.stat().st_mtime) < 1.0


class TestAtomicMove:
    def test_moves_file_to_destination(self, tmp_path) -> None:
        """ファイルを宛先に移動する"""
        src = tmp_path / "source.gz"
        src.write_bytes(b"data")
        dst = tmp_path / "dest" / "output.gz"
        dst.parent.mkdir()

        atomic_move(src, dst)

        assert dst.exists()
        assert dst.read_bytes() == b"data"

    def test_source_removed_after_move(self, tmp_path) -> None:
        """移動後はソースファイルが消える"""
        src = tmp_path / "source.gz"
        src.write_bytes(b"data")
        dst = tmp_path / "output.gz"

        atomic_move(src, dst)

        assert not src.exists()

    def test_no_tmp_file_remains(self, tmp_path) -> None:
        """移動完了後に .tmp ファイルが残らない"""
        src = tmp_path / "source.gz"
        src.write_bytes(b"data")
        dst = tmp_path / "output.gz"

        atomic_move(src, dst)

        assert not (dst.parent / (dst.name + ".tmp")).exists()

    def test_cleans_tmp_on_error(self, tmp_path, monkeypatch) -> None:
        """移動失敗時に .tmp ファイルを削除し元ファイルも残す"""
        src = tmp_path / "source.gz"
        src.write_bytes(b"data")
        dst = tmp_path / "output.gz"
        tmp = tmp_path / "output.gz.tmp"

        def fail_copy2(s, d, **kwargs):
            (tmp_path / "output.gz.tmp").write_bytes(b"partial")
            raise OSError("コピー失敗")

        monkeypatch.setattr(shutil, "copy2", fail_copy2)

        with pytest.raises(OSError):
            atomic_move(src, dst)

        assert not tmp.exists()
        assert src.exists()
        assert not dst.exists()
