"""field_extractor のテスト"""

import os
import time
from pathlib import Path

import pytest

from app.infra.field_extractor import extract_fields
from app.schemas.collection import FieldDef, FieldSource


class TestExtractFieldsFilename:
    def test_extracts_entry_id_from_filename(self, tmp_path) -> None:
        """ファイル名の正規表現から entry_id を抽出する"""
        f = tmp_path / "00123.gz"
        f.write_bytes(b"")

        fields = [FieldDef(name="entry_id", source=FieldSource.filename, regex=r"^(\d+)\.gz$", group=1)]
        result = extract_fields(f, terminal="192.168.1.10", field_defs=fields)

        assert result["entry_id"] == "00123"

    def test_extracts_multiple_groups(self, tmp_path) -> None:
        """異なるグループ番号で複数フィールドを抽出できる"""
        f = tmp_path / "20240315_001.gz"
        f.write_bytes(b"")

        fields = [
            FieldDef(name="date_part", source=FieldSource.filename, regex=r"^(\d{8})_(\d+)\.gz$", group=1),
            FieldDef(name="seq", source=FieldSource.filename, regex=r"^(\d{8})_(\d+)\.gz$", group=2),
        ]
        result = extract_fields(f, terminal="192.168.1.10", field_defs=fields)

        assert result["date_part"] == "20240315"
        assert result["seq"] == "001"

    def test_regex_no_match_raises(self, tmp_path) -> None:
        """正規表現がマッチしないとき ValueError"""
        f = tmp_path / "noMatch.txt"
        f.write_bytes(b"")

        fields = [FieldDef(name="entry_id", source=FieldSource.filename, regex=r"^(\d+)\.gz$", group=1)]
        with pytest.raises(ValueError, match="regex"):
            extract_fields(f, terminal="192.168.1.10", field_defs=fields)


class TestExtractFieldsMtime:
    def test_extracts_date_from_mtime(self, tmp_path) -> None:
        """mtime から yyyymmdd フォーマットで日付を抽出する"""
        f = tmp_path / "entry.gz"
        f.write_bytes(b"")
        # mtime を固定値に設定（2024-03-15 09:30:05 UTC）
        import datetime
        dt = datetime.datetime(2024, 3, 15, 9, 30, 5, tzinfo=datetime.timezone.utc)
        os.utime(f, (dt.timestamp(), dt.timestamp()))

        fields = [FieldDef(name="date", source=FieldSource.mtime, format="yyyymmdd")]
        result = extract_fields(f, terminal="192.168.1.10", field_defs=fields)

        assert result["date"] == "20240315"

    def test_extracts_timestamp_from_mtime(self, tmp_path) -> None:
        """mtime から yyyymmddHHMMSS フォーマットでタイムスタンプを抽出する"""
        import datetime
        f = tmp_path / "entry.gz"
        f.write_bytes(b"")
        dt = datetime.datetime(2024, 3, 15, 9, 30, 5, tzinfo=datetime.timezone.utc)
        os.utime(f, (dt.timestamp(), dt.timestamp()))

        fields = [FieldDef(name="timestamp", source=FieldSource.mtime, format="yyyymmddHHMMSS")]
        result = extract_fields(f, terminal="192.168.1.10", field_defs=fields)

        assert result["timestamp"] == "20240315093005"

    def test_unknown_format_raises(self, tmp_path) -> None:
        """未知の format は ValueError"""
        f = tmp_path / "entry.gz"
        f.write_bytes(b"")

        fields = [FieldDef(name="x", source=FieldSource.mtime, format="unknown")]
        with pytest.raises(ValueError, match="format"):
            extract_fields(f, terminal="192.168.1.10", field_defs=fields)


class TestExtractFieldsTerminal:
    def test_extracts_12digit_from_terminal(self, tmp_path) -> None:
        """terminal から 12digit フォーマットで IP を抽出する"""
        f = tmp_path / "entry.gz"
        f.write_bytes(b"")

        fields = [FieldDef(name="ip12", source=FieldSource.terminal, format="12digit")]
        result = extract_fields(f, terminal="192.168.1.10", field_defs=fields)

        assert result["ip12"] == "192168001010"

    def test_12digit_zero_pads_each_octet(self, tmp_path) -> None:
        """各オクテットを3桁ゼロ埋めする"""
        f = tmp_path / "entry.gz"
        f.write_bytes(b"")

        fields = [FieldDef(name="ip12", source=FieldSource.terminal, format="12digit")]
        result = extract_fields(f, terminal="10.0.0.1", field_defs=fields)

        assert result["ip12"] == "010000000001"


class TestExtractFieldsBuiltins:
    def test_always_includes_ipaddress(self, tmp_path) -> None:
        """fields 定義なしでも ipaddress は常に含まれる"""
        f = tmp_path / "entry.gz"
        f.write_bytes(b"")

        result = extract_fields(f, terminal="192.168.1.10", field_defs=[])

        assert result["ipaddress"] == "192.168.1.10"

    def test_always_includes_ipaddress12(self, tmp_path) -> None:
        """ipaddress12 は常に含まれる"""
        f = tmp_path / "entry.gz"
        f.write_bytes(b"")

        result = extract_fields(f, terminal="192.168.1.10", field_defs=[])

        assert result["ipaddress12"] == "192168001010"

    def test_always_includes_ext(self, tmp_path) -> None:
        """ext（拡張子）は常に含まれる"""
        f = tmp_path / "entry.gz"
        f.write_bytes(b"")

        result = extract_fields(f, terminal="192.168.1.10", field_defs=[])

        assert result["ext"] == "gz"

    def test_always_includes_stem(self, tmp_path) -> None:
        """stem（拡張子なしファイル名）は常に含まれる"""
        f = tmp_path / "entry001.gz"
        f.write_bytes(b"")

        result = extract_fields(f, terminal="192.168.1.10", field_defs=[])

        assert result["stem"] == "entry001"

    def test_always_includes_yyyymmdd(self, tmp_path) -> None:
        """yyyymmdd（mtime日付）は常に含まれる"""
        import datetime
        f = tmp_path / "entry.gz"
        f.write_bytes(b"")
        dt = datetime.datetime(2024, 3, 15, tzinfo=datetime.timezone.utc)
        os.utime(f, (dt.timestamp(), dt.timestamp()))

        result = extract_fields(f, terminal="192.168.1.10", field_defs=[])

        assert result["yyyymmdd"] == "20240315"

    def test_always_includes_timestamp(self, tmp_path) -> None:
        """timestamp（mtime全体）は常に含まれる"""
        import datetime
        f = tmp_path / "entry.gz"
        f.write_bytes(b"")
        dt = datetime.datetime(2024, 3, 15, 9, 30, 5, tzinfo=datetime.timezone.utc)
        os.utime(f, (dt.timestamp(), dt.timestamp()))

        result = extract_fields(f, terminal="192.168.1.10", field_defs=[])

        assert result["timestamp"] == "20240315093005"
