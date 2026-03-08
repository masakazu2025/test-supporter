# 採取機能 ロードマップ

## 現在地

**Phase2完了** → 次は Phase3（JobManager・自動監視）

---

## フェーズ一覧

### Phase 1: infra層 ✅

Worker が使う基礎部品。ネットワーク・ファイルシステム操作の純粋関数群。

| ファイル | 内容 | 状態 |
|---------|------|------|
| `app/infra/unc_path.py` | Windowsパス → UNCパス変換 | ✅ |
| `app/infra/file_transfer.py` | `atomic_copy` / `atomic_move` | ✅ |
| `app/infra/archive.py` | subprocess 解凍 | ✅ |
| `app/infra/field_extractor.py` | staging ファイル → metadata | ✅ |
| `app/infra/resolver.py` | template + metadata → パス文字列 | ✅ |

---

### Phase 2: Worker処理 ✅

1ジョブを受け取り、コピー〜DB登録まで実行する単位。

| ファイル | 内容 | 状態 |
|---------|------|------|
| `app/schemas/collection.py` | `CollectionTarget` / `CopyJob` スキーマ | ✅ |
| `app/core/config.py` | `CustomerProfile` 設定読み込み | ✅ |
| `app/services/copy_runner.py` | `run_copy(job, staging_dir, repo)` | ✅ |
| `app/services/repository.py` | `CollectedFileRepository` Protocol + Record | ✅ |

Worker の処理順：
```
① atomic_copy(UNC → pool/.staging/{terminal}/uuid.tmp)
② field_extractor(staging_tmp, fields_def, terminal, original_name=src_file.name)
③ resolver(dst_dir_template, metadata) → dst_path
④ atomic_move(staging_tmp → dst_path)
⑤ src_file 削除（action=move の場合）
⑥ DB insert(metadata)
```

---

### Phase 3: JobManager・自動監視 🔲

複数端末の並列処理と、新着ファイルの自動検出。

| ファイル | 内容 | 状態 |
|---------|------|------|
| `app/services/job_manager.py` | 端末ごとの deque + Worker スレッド管理 | 🔲 |
| `app/services/auto_watcher.py` | 監視ループ → 新着 → enqueue | 🔲 |
| `app/services/selector.py` | 手動採取（DB検索 → ヒット返却 / ミス→enqueue） | 🔲 |

前提：Phase 4（DB設計）を先に確定してから着手する。

---

### Phase 4: DB設計・永続化 🔲

採取記録の検索・差分管理のための SQLite スキーマ。

| 成果物 | 内容 | 状態 |
|--------|------|------|
| `docs/schema/db.md` | DBスキーマ定義 | 🔲 |
| `app/infra/db.py`（仮） | SQLite 操作 | 🔲 |
| `app/services/repository.py` の実装クラス | Protocol の具象実装 | 🔲 |

設計方針（検討中）：
- `pending` / `completed` の2ステータスで管理
- AutoWatcher は `SELECT src_filename WHERE pending OR completed` で既知ファイルを取得

---

### Phase 5: API層 🔲

フロントエンドから採取を操作するエンドポイント。

| ファイル | 内容 | 状態 |
|---------|------|------|
| `app/api/collection.py` | 採取開始・手動採取・進捗確認 | 🔲 |

---

### Phase 6: フロントエンド 🔲

採取の操作UIと進捗表示。

---

## 未決定事項

| 項目 | 状態 |
|------|------|
| DBステータス設計（pending/completed vs FSのみ） | Phase3着手前に確定要 |
| `file_io.py`（一覧・メタデータ読み取り）の採取への組み込み | 設計済み・未実装 |
| ログ採取（log_stream / log_snapshot） | 後回し |
| LAN切断・復帰時の自動再開 | 未設計 |
