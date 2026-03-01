"""UNCパス変換のテスト"""

import pytest

from app.infra.unc_path import to_unc_path


class TestToUncPath:
    def test_c_drive_root(self) -> None:
        """Cドライブのルートパスを変換する"""
        result = to_unc_path("192.168.1.10", "C:\\TestApp\\entries")
        assert result == "\\\\192.168.1.10\\C$\\TestApp\\entries"

    def test_d_drive(self) -> None:
        """Dドライブのパスを変換する"""
        result = to_unc_path("192.168.1.10", "D:\\data\\logs")
        assert result == "\\\\192.168.1.10\\D$\\data\\logs"

    def test_lowercase_drive(self) -> None:
        """小文字ドライブ文字も大文字に統一する"""
        result = to_unc_path("192.168.1.10", "c:\\TestApp\\entries")
        assert result == "\\\\192.168.1.10\\C$\\TestApp\\entries"

    def test_forward_slash_path(self) -> None:
        """スラッシュ区切りのパスも受け付ける"""
        result = to_unc_path("192.168.1.10", "C:/TestApp/entries")
        assert result == "\\\\192.168.1.10\\C$\\TestApp\\entries"

    def test_invalid_path_no_drive(self) -> None:
        """ドライブ文字がない場合は ValueError を送出する"""
        with pytest.raises(ValueError, match="ドライブ文字"):
            to_unc_path("192.168.1.10", "\\TestApp\\entries")
