"""ファイルからメタデータを抽出する（Worker専用）"""

import re
from datetime import datetime, timezone
from pathlib import Path

from app.schemas.collection import FieldDef, FieldSource


def _ip_to_12digit(ip: str) -> str:
    """IPアドレスの各オクテットを3桁ゼロ埋めして連結する"""
    return "".join(octet.zfill(3) for octet in ip.split("."))


def _format_mtime(mtime: datetime, fmt: str) -> str:
    if fmt == "yyyymmdd":
        return mtime.strftime("%Y%m%d")
    elif fmt == "yyyymmddHHMMSS":
        return mtime.strftime("%Y%m%d%H%M%S")
    else:
        raise ValueError(f"未知の mtime format: {fmt!r}")


def extract_fields(
    local_file: Path,
    terminal: str,
    field_defs: list[FieldDef],
    original_name: str | None = None,
) -> dict[str, str]:
    """
    ローカルファイルとターミナルIPからメタデータ辞書を生成する。

    組み込みキー（ipaddress, ipaddress12, ext, stem, yyyymmdd, timestamp）は
    常に含まれる。field_defs で追加フィールドを定義できる。

    Args:
        local_file: ローカルファイルパス（mtime の取得元）
        terminal: 端末IP
        field_defs: フィールド抽出定義
        original_name: 元ファイル名（staging tmp ファイル使用時に指定）。
                       省略時は local_file.name を使用する。
    """
    name = original_name if original_name is not None else local_file.name
    name_path = Path(name)

    mtime_ts = local_file.stat().st_mtime
    mtime = datetime.fromtimestamp(mtime_ts, tz=timezone.utc)

    metadata: dict[str, str] = {
        "ipaddress": terminal,
        "ipaddress12": _ip_to_12digit(terminal),
        "ext": name_path.suffix.lstrip("."),
        "stem": name_path.stem,
        "yyyymmdd": _format_mtime(mtime, "yyyymmdd"),
        "timestamp": _format_mtime(mtime, "yyyymmddHHMMSS"),
    }

    for field in field_defs:
        if field.source == FieldSource.filename:
            assert field.regex is not None and field.group is not None
            m = re.match(field.regex, name)
            if m is None:
                raise ValueError(
                    f"regex {field.regex!r} が {name!r} にマッチしません"
                )
            metadata[field.name] = m.group(field.group)

        elif field.source == FieldSource.mtime:
            assert field.format is not None
            metadata[field.name] = _format_mtime(mtime, field.format)

        elif field.source == FieldSource.terminal:
            assert field.format is not None
            if field.format == "12digit":
                metadata[field.name] = _ip_to_12digit(terminal)
            else:
                raise ValueError(f"未知の terminal format: {field.format!r}")

    return metadata
