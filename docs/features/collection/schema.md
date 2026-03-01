# 採取 スキーマ定義

## CopyJob

採取キューに積まれる1件の採取指示。

```python
@dataclass
class CopyJob:
    terminal: str    # 端末IP（例: "192.168.1.10"）
    src_file: Path   # 採取ソースが解決済みのUNCパス
    target: SyncTarget
```

- `status` フィールドなし（ファイルシステムが状態を管理する）
- `src_file` は採取ソース（AutoWatcher / 手動採取API）が解決済みのUNCパスを渡す

---

## metadata

`field_extractor` がファイルから抽出する情報の辞書。Worker がコピー後に生成する。

```python
metadata = {
    "entry_id":    "001",            # filename regex から
    "date":        "20240315",       # mtime から
    "timestamp":   "20240315093005", # mtime から
    "ipaddress":   "192.168.1.10",   # terminal から
    "ipaddress12": "192168001010",   # terminal を変換（3桁ゼロ埋め）
    "ext":         "gz",             # filename から
    "stem":        "entry001",       # filename から（拡張子なし）
}
```

**用途：**

| 用途 | 説明 |
|------|------|
| `resolver` への入力 | コピー先パス・ファイル名の決定 |
| DB登録 | 採取完了後にそのまま保存（検索キーになる） |

---

## fields 定義

`SyncTarget.fields` に記述する。ファイルから情報を抽出するルールを定義する。

```json
[
  { "name": "entry_id",  "source": "filename", "regex": "^(\\d+)\\.gz$", "group": 1 },
  { "name": "date",      "source": "mtime",    "format": "yyyymmdd" },
  { "name": "timestamp", "source": "mtime",    "format": "yyyymmddHHMMSS" }
]
```

### source の種類

| source | 説明 | 必要パラメータ |
|--------|------|--------------|
| `filename` | ファイル名に正規表現を適用 | `regex`, `group` |
| `mtime` | OS から取得したファイルの更新日時 | `format` |
| `terminal` | CopyJob の `terminal`（IP） | `format` |

### format の種類

| format | 出力例 | 対象source |
|--------|--------|-----------|
| `yyyymmdd` | `20240315` | mtime |
| `yyyymmddHHMMSS` | `20240315093005` | mtime |
| `12digit` | `192168001010` | terminal |

---

## template 変数

`dst_dir` や `rename` のテンプレート文字列で使える変数。

| 変数 | 値の例 | 解決元 |
|------|--------|--------|
| `{ipaddress}` | `192.168.1.10` | terminal |
| `{ipaddress12}` | `192168001010` | terminal（3桁ゼロ埋め） |
| `{yyyymmdd}` | `20240315` | mtime |
| `{timestamp}` | `20240315093005` | mtime |
| `{ext}` | `gz` | filename |
| `{stem}` | `entry001` | filename（拡張子なし） |
| `{entry_id}` | `001` | fields定義で抽出した値 |

`resolver.resolve(template, metadata)` が解決する。パスとファイル名は同じ関数で処理する。
