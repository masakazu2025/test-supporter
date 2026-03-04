# 採取 設計

## アーキテクチャ

```mermaid
graph TB
    subgraph Sources["採取ソース"]
        AW["AutoWatcher<br>（自動・NORMAL優先度）"]
        SL["Selector<br>（手動採取・HIGH優先度）"]
    end

    subgraph JobManager["JobManager（端末ごと）"]
        QA["端末A deque"]
        QB["端末B deque"]
    end

    subgraph Workers["Worker（端末スレッド）"]
        WA["Worker A"]
        WB["Worker B"]
    end

    subgraph Infra["infra 層"]
        FT["file_transfer<br>(atomic_copy/move)"]
        FE["field_extractor<br>(file→metadata)"]
        RV["resolver<br>(template→string)"]
        AR["archive<br>(subprocess解凍)"]
    end

    Pool[("ローカルプール")]
    DB[("SQLite DB")]

    AW -- "enqueue(append)" --> QA
    AW -- "enqueue(append)" --> QB
    SL -. "①DB検索" .-> DB
    SL -- "②ミス時: enqueue(appendleft)" --> QA
    QA --> WA
    QB --> WB
    WA --> FT
    WA --> FE
    WA --> RV
    WA --> AR
    WB --> FT
    FT --> Pool
    AR --> Pool
    FE --> DB
```

## データフロー

```mermaid
sequenceDiagram
    participant Src as 採取ソース
    participant JM as JobManager
    participant W as Worker
    participant FT as file_transfer
    participant FE as field_extractor
    participant RV as resolver
    participant AR as archive
    participant DB as SQLite

    Src->>JM: enqueue(CopyJob)
    JM->>W: dequeue
    W->>FT: atomic_copy(src_file, tmp)
    FT-->>W: 完了
    W->>FE: extract(file, fields_def, terminal)
    FE-->>W: metadata
    W->>RV: resolve(dst_dir_template, metadata)
    RV-->>W: dst_path
    W->>FT: rename(tmp → dst_path)
    opt type=entries
        W->>AR: extract_archive(archiver, archive, dst)
    end
    W->>DB: insert(metadata)
```

## CopyJob

```python
@dataclass
class CopyJob:
    terminal: str    # 端末IP
    src_file: Path   # 採取ソースが解決済みのUNCパス
    target: CollectionTarget
    # statusフィールドなし（FSが状態を管理する）
```

## 採取ソースの責務

### AutoWatcher（自動採取）

```
① CollectionTarget.pattern で新着ファイル一覧取得（拡張子フィルタ等）
② ローカルプールと差分計算
③ 新着ファイルを enqueue（priority=NORMAL → 末尾）
```

speed優先のため、field_extractor は使わない。

### 手動採取（Selector）

```
① UI から検索条件（entry_id・日時範囲など）を受け取る
② DBを検索（poolのmetadata）
③ ヒット → poolのファイルパスを返却（採取不要）
   ミス  → リモートの該当ファイルを特定 → enqueue（priority=HIGH → 先頭）
```

- DBがpoolのインデックスとして機能する（pool=キャッシュ思想）
- field_extractor は使わない（Workerがコピー時に使う）

## Worker の処理

```
① atomic_copy(src_file → pool/.staging/{terminal}/original.tmp)  ← file_transfer（ネットワーク操作はここだけ）
② field_extractor(pool/.staging/{terminal}/original.tmp, fields_def, terminal) → metadata
③ resolver(target.dst_dir, metadata)      → dst_path
④ resolver(target.rename, metadata)       → dst_filename（renameある場合）
⑤ move(pool/.staging/original.tmp → dst_path)         ← ローカルrename（ネットワーク不要）
⑥ extract_archive(...)                    ← archive（type=entriesのみ）
⑦ DB insert(metadata)
```

> **原則**: リモート端末へのネットワーク操作は①のコピー1回のみ。
> mtimeはローカルコピーから読む（`shutil.copy2`でmtime保持）。
>
> **staging のディレクトリ構造**: `pool/.staging/{terminal}/` と端末ごとに分離する。
> Worker は端末ごとに1スレッド（順次処理）なので、同一端末内の衝突はなく、端末間の衝突はディレクトリ分離で防ぐ。

## アトミックリネームによる完了管理

```mermaid
stateDiagram-v2
    [*] --> コピー中: atomic_copy開始
    コピー中: {filename}.tmp
    コピー中 --> コピー完了: リネーム
    コピー完了: {filename}
    コピー完了 --> 解凍中: type=entriesのみ
    解凍中: {entry_no}.tmp/
    解凍中 --> 採取完了: リネーム
    採取完了: {entry_no}/
    採取完了 --> [*]
```

### リトライ判定（FSのみで完結）

| ファイルシステムの状態 | 次の動作 |
|---|---|
| 完了済みファイル / ディレクトリが存在 | スキップ |
| `.tmp` あり | .tmp削除 → 再実行 |
| 何もない | 新規実行 |

## infra 層の構成

```
app/infra/
  unc_path.py        - Windowsパス → UNCパス変換（純粋関数）
  file_io.py         - 読み取り系（一覧・メタデータ・内容取得）
  file_transfer.py   - 転送系（atomic_copy・atomic_move）
  archive.py         - subprocess解凍
  field_extractor.py - ファイル → metadata dict（Worker専用）
  resolver.py        - template + metadata → 文字列
```

| ファイル | 採取 | 閲覧 | 仕訳 |
|---------|:----:|:----:|:----:|
| `file_io.py` | ○ | ○ | ○ |
| `file_transfer.py` | ○ | - | ○ |
| `field_extractor.py` | ○ | - | - |
| `resolver.py` | ○ | - | - |
| `unc_path.py` | ○ | △ | - |
| `archive.py` | ○ | - | - |

## services 層の構成

```
app/services/
  job_manager.py   - CopyJobキュー管理・端末ごとのWorkerスレッド
  copy_runner.py   - run_copy(job)：Worker実処理
  auto_watcher.py  - 自動監視（pattern→新着→enqueue）
  selector.py      - 手動採取（DB検索→ヒット返却 / ミス時→リモートenqueue）
```

## エラー処理方針

- 設定ファイルのバリデーションは厳しくしない（開発者向け設定）
- エラー時はログをちゃんと吐く（担当者がログを見て修正できるレベル）
- DB はジョブ管理に使わない（FS状態で管理）
