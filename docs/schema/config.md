# 設定ファイル スキーマ

顧客プロファイルの設定ファイル（JSON）のスキーマ定義。

## CustomerProfile

```json
{
  "archiver_path": "C:\\Tools\\myarchiver.exe",
  "sync_targets": [ ... ]
}
```

| フィールド | 必須 | 型 | 説明 |
|-----------|------|-----|------|
| `archiver_path` | ○ | string | エントリ解凍用の専用アーカイバのパス |
| `sync_targets` | ○ | array | 採取ターゲット定義の配列（1件以上） |

---

## SyncTarget

```json
{
  "type": "entries",
  "src_dir": "C:\\TestApp\\entries",
  "pattern": ".*\\.gz$",
  "dst_dir": "D:\\pool\\entries\\{ipaddress}\\{date}",
  "rename": null,
  "action": "copy",
  "post_process": { "decompress": "gz" },
  "watch": "realtime",
  "schedule": null,
  "fields": [
    { "name": "entry_id",  "source": "filename", "regex": "^(\\d+)\\.gz$", "group": 1 },
    { "name": "date",      "source": "mtime",    "format": "yyyymmdd" },
    { "name": "timestamp", "source": "mtime",    "format": "yyyymmddHHMMSS" }
  ]
}
```

### フィールド定義

| フィールド | 必須 | 型 | 説明 |
|-----------|------|-----|------|
| `type` | ○ | string | 種別（`entries` / `screenshots` / `files`） |
| `src_dir` | ○ | string | リモート端末上のWindowsパス（アクセス時にUNCへ自動変換） |
| `pattern` | ○ | string | 採取対象ファイルの正規表現 |
| `dst_dir` | ○ | string | 保存先パス（テンプレート・フルパス）。`\\` 始まりはUNC（リモート操作） |
| `rename` | - | string \| null | リネームテンプレート。`null` は元ファイル名を使用 |
| `action` | ○ | string | `copy`（元ファイル保持）/ `move`（元ファイル削除） |
| `post_process` | - | object \| null | 後処理定義 |
| `watch` | △ | string | `realtime`（毎ループ）/ `interval`（N分ごと）。`schedule` と排他 |
| `interval_minutes` | △ | number | `watch=interval` のときのみ必須 |
| `schedule` | △ | string \| null | 時刻指定トリガー（例: `"Friday 19:00"`）。`watch` と排他 |
| `fields` | - | array | ファイルからの情報抽出定義（→ 後述） |

### post_process

| フィールド | 説明 |
|-----------|------|
| `decompress` | `"gz"` = 専用アーカイバで解凍（subprocess）。`null` = なし |

### UNCパス変換（src_dir）

`src_dir` はリモート端末上のWindowsパス。アクセス時に自動でUNCパスへ変換する。

```
C:\TestApp\entries  +  terminal=192.168.1.10
    →  \\192.168.1.10\C$\TestApp\entries
```

---

## fields 定義

```json
[
  { "name": "entry_id",  "source": "filename", "regex": "^(\\d+)\\.gz$", "group": 1 },
  { "name": "date",      "source": "mtime",    "format": "yyyymmdd" },
  { "name": "timestamp", "source": "mtime",    "format": "yyyymmddHHMMSS" }
]
```

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `name` | ○ | 抽出結果のキー名（templateで `{name}` として使用） |
| `source` | ○ | 抽出元（`filename` / `mtime` / `terminal`） |
| `regex` | △ | `source=filename` のとき必須。Pythonの正規表現 |
| `group` | △ | `source=filename` のとき必須。正規表現のキャプチャグループ番号 |
| `format` | △ | `source=mtime` / `source=terminal` のとき必須 |

### source と format の組み合わせ

| source | format | 出力例 |
|--------|--------|--------|
| `filename` | （なし、regexで指定） | `"001"` |
| `mtime` | `yyyymmdd` | `"20240315"` |
| `mtime` | `yyyymmddHHMMSS` | `"20240315093005"` |
| `terminal` | `12digit` | `"192168001010"` |

---

## テンプレート変数

`dst_dir` と `rename` のテンプレートで使える変数。

| 変数 | 値の例 | 解決元 |
|------|--------|--------|
| `{ipaddress}` | `192.168.1.10` | terminal（そのまま） |
| `{ipaddress12}` | `192168001010` | terminal（各オクテット3桁ゼロ埋め） |
| `{yyyymmdd}` | `20240315` | mtime |
| `{timestamp}` | `20240315093005` | mtime |
| `{ext}` | `gz` | ファイル名の拡張子 |
| `{stem}` | `entry001` | ファイル名（拡張子なし） |
| `{entry_id}` | `001` | fields 定義で抽出した値 |

---

## 設定例（全体）

```json
{
  "archiver_path": "C:\\Tools\\myarchiver.exe",
  "sync_targets": [
    {
      "type": "entries",
      "action": "copy",
      "src_dir": "C:\\TestApp\\entries",
      "pattern": ".*\\.gz$",
      "dst_dir": "D:\\pool\\entries\\{ipaddress}\\{yyyymmdd}",
      "rename": null,
      "watch": "realtime",
      "post_process": { "decompress": "gz" },
      "fields": [
        { "name": "entry_id", "source": "filename", "regex": "^(\\d+)\\.gz$", "group": 1 },
        { "name": "date",     "source": "mtime",    "format": "yyyymmdd" }
      ]
    },
    {
      "type": "screenshots",
      "action": "copy",
      "src_dir": "C:\\TestApp\\screenshots",
      "pattern": ".*\\.(png|jpg|bmp)$",
      "dst_dir": "D:\\pool\\screenshots\\{ipaddress}\\{yyyymmdd}",
      "rename": "{ipaddress12}_{timestamp}.{ext}",
      "watch": "realtime",
      "post_process": null,
      "fields": [
        { "name": "date",      "source": "mtime", "format": "yyyymmdd" },
        { "name": "timestamp", "source": "mtime", "format": "yyyymmddHHMMSS" }
      ]
    },
    {
      "type": "files",
      "action": "move",
      "src_dir": "C:\\TestApp\\screenshots",
      "pattern": ".*\\.png$",
      "dst_dir": "\\\\{ipaddress}\\C$\\TestApp\\archive\\{yyyymmdd}",
      "rename": "{ipaddress12}_{timestamp}.{ext}",
      "schedule": "Friday 19:00",
      "post_process": null,
      "fields": [
        { "name": "date",      "source": "mtime", "format": "yyyymmdd" },
        { "name": "timestamp", "source": "mtime", "format": "yyyymmddHHMMSS" }
      ]
    }
  ]
}
```
