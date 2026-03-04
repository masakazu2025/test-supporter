"""resolver のテスト"""

import pytest

from app.infra.resolver import resolve


class TestResolve:
    def test_resolves_ipaddress(self) -> None:
        """{ipaddress} を terminal IP に置換する"""
        result = resolve("{ipaddress}", {"ipaddress": "192.168.1.10"})
        assert result == "192.168.1.10"

    def test_resolves_ipaddress12(self) -> None:
        """{ipaddress12} を12桁IPに置換する"""
        result = resolve("{ipaddress12}", {"ipaddress12": "192168001010"})
        assert result == "192168001010"

    def test_resolves_yyyymmdd(self) -> None:
        """{yyyymmdd} を日付に置換する"""
        result = resolve("{yyyymmdd}", {"yyyymmdd": "20240315"})
        assert result == "20240315"

    def test_resolves_timestamp(self) -> None:
        """{timestamp} をタイムスタンプに置換する"""
        result = resolve("{timestamp}", {"timestamp": "20240315093005"})
        assert result == "20240315093005"

    def test_resolves_ext(self) -> None:
        """{ext} を拡張子に置換する"""
        result = resolve("{ext}", {"ext": "gz"})
        assert result == "gz"

    def test_resolves_stem(self) -> None:
        """{stem} をファイル名（拡張子なし）に置換する"""
        result = resolve("{stem}", {"stem": "entry001"})
        assert result == "entry001"

    def test_resolves_user_defined_field(self) -> None:
        """fields定義で抽出したカスタムフィールドを置換する"""
        result = resolve("{entry_id}", {"entry_id": "001"})
        assert result == "001"

    def test_resolves_full_path_template(self) -> None:
        """複数変数を含むパステンプレートを一括置換する"""
        template = "D:\\pool\\entries\\{ipaddress}\\{yyyymmdd}"
        metadata = {
            "ipaddress": "192.168.1.10",
            "yyyymmdd": "20240315",
        }
        result = resolve(template, metadata)
        assert result == "D:\\pool\\entries\\192.168.1.10\\20240315"

    def test_resolves_rename_template(self) -> None:
        """リネームテンプレートを置換する"""
        template = "{ipaddress12}_{timestamp}.{ext}"
        metadata = {
            "ipaddress12": "192168001010",
            "timestamp": "20240315093005",
            "ext": "jpg",
        }
        result = resolve(template, metadata)
        assert result == "192168001010_20240315093005.jpg"

    def test_no_placeholders_returns_as_is(self) -> None:
        """プレースホルダーがなければそのまま返す"""
        result = resolve("static_value", {})
        assert result == "static_value"

    def test_unknown_placeholder_raises(self) -> None:
        """未定義の変数があると KeyError"""
        with pytest.raises(KeyError):
            resolve("{undefined_var}", {})
