"""アトミックコピーのテスト"""

import pytest

from app.infra.file_copy import atomic_copy


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

    def test_no_tmp_file_remains(self, tmp_path) -> None:
        """コピー完了後に .tmp ファイルが残らない"""
        src = tmp_path / "source.gz"
        src.write_bytes(b"data")
        dst = tmp_path / "output.gz"

        atomic_copy(src, dst)

        tmp = dst.with_suffix(".gz.tmp")
        assert not tmp.exists()

    def test_tmp_file_used_during_copy(self, tmp_path, monkeypatch) -> None:
        """コピー中は .tmp ファイルが使われる（中間状態の確認）"""
        import shutil

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
        import shutil

        src = tmp_path / "source.gz"
        src.write_bytes(b"data")
        dst = tmp_path / "output.gz"
        tmp = tmp_path / "output.gz.tmp"

        def fail_copy2(s, d, **kwargs):
            # .tmp だけ作成してからエラーを送出
            (tmp_path / "output.gz.tmp").write_bytes(b"partial")
            raise OSError("コピー失敗")

        monkeypatch.setattr(shutil, "copy2", fail_copy2)

        with pytest.raises(OSError):
            atomic_copy(src, dst)

        assert not tmp.exists()
        assert not dst.exists()

    def test_destination_already_exists(self, tmp_path) -> None:
        """宛先ファイルが既に存在する場合は上書きしない（スキップ）"""
        src = tmp_path / "source.gz"
        src.write_bytes(b"new data")
        dst = tmp_path / "output.gz"
        dst.write_bytes(b"existing data")

        atomic_copy(src, dst)

        assert dst.read_bytes() == b"existing data"
