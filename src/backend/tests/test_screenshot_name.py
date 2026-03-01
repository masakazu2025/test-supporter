"""スクリーンショットリネーム規則のテスト"""

from datetime import datetime, timezone

from app.infra.screenshot_name import build_screenshot_name


class TestBuildScreenshotName:
    def test_basic_rename(self) -> None:
        """IPとmtimeから正規のファイル名を生成する"""
        mtime = datetime(2024, 3, 15, 9, 30, 5, tzinfo=timezone.utc)
        result = build_screenshot_name(
            terminal="192.168.1.10",
            mtime=mtime,
            ext="jpg",
        )
        assert result == "192168001010_20240315093005.jpg"

    def test_ip_zero_padding(self) -> None:
        """各オクテットを3桁ゼロ埋めする"""
        mtime = datetime(2024, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
        result = build_screenshot_name(
            terminal="10.0.0.1",
            mtime=mtime,
            ext="png",
        )
        assert result == "010000000001_20240101000000.png"

    def test_ext_without_dot(self) -> None:
        """拡張子はドットなしで渡す"""
        mtime = datetime(2024, 6, 1, 12, 0, 0, tzinfo=timezone.utc)
        result = build_screenshot_name(
            terminal="192.168.100.200",
            mtime=mtime,
            ext="bmp",
        )
        assert result == "192168100200_20240601120000.bmp"

    def test_three_digit_octets(self) -> None:
        """全オクテットが3桁の場合はそのまま"""
        mtime = datetime(2024, 12, 31, 23, 59, 59, tzinfo=timezone.utc)
        result = build_screenshot_name(
            terminal="192.168.001.002",
            mtime=mtime,
            ext="jpg",
        )
        assert result == "192168001002_20241231235959.jpg"
