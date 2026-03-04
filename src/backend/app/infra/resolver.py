"""テンプレート文字列をメタデータで解決する"""


def resolve(template: str, metadata: dict[str, str]) -> str:
    """
    テンプレート文字列の {key} プレースホルダーを metadata で置換する。

    パス（dst_dir）とファイル名（rename）の両方に使用する。
    未定義のキーがある場合は KeyError を送出する。
    """
    return template.format_map(metadata)
