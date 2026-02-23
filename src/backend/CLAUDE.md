# Backend CLAUDE.md

## スタック
- Python 3.12+
- FastAPI（APIサーバー）
- SQLModel + aiosqlite（ORM・非同期SQLite）
- Alembic（DBマイグレーション）
- pandas（データ処理）
- Ruff（Lint・フォーマット）、mypy（型チェック）、pytest（テスト）

## コマンド
| コマンド | 内容 |
|---------|------|
| `uvicorn app.main:app --reload` | 開発サーバー起動（localhost:8000） |
| `python -m pytest` | テスト実行 |
| `ruff check .` | Lint |
| `ruff format .` | フォーマット |
| `mypy .` | 型チェック |
| `alembic upgrade head` | DBマイグレーション適用 |
| `alembic revision --autogenerate -m "説明"` | マイグレーションファイル生成 |

## ディレクトリ構成
```
src/backend/
├── app/
│   ├── main.py          # FastAPIアプリ初期化・ルーター登録
│   ├── api/             # ルーター（エンドポイント定義）
│   ├── services/        # ビジネスロジック
│   ├── repositories/    # DBアクセス
│   ├── infra/           # 外部接続（SSH・ファイルシステム）
│   ├── models/          # SQLModelモデル（DBテーブル定義）
│   ├── schemas/         # リクエスト・レスポンスのPydanticスキーマ
│   └── core/            # DB接続・設定・依存性注入
├── alembic/             # マイグレーションファイル
├── tests/               # pytestテスト
├── pyproject.toml
└── .env                 # 環境変数
```

## アーキテクチャ方針

依存の方向性: `api → services → infra / repositories`

| 層 | 役割 | 置き場所 |
|----|------|---------|
| API | エンドポイント定義・リクエスト受付のみ | `app/api/` |
| サービス | ビジネスロジック・ユースケースの実行 | `app/services/` |
| リポジトリ | DBアクセス | `app/repositories/` |
| インフラ | SSH・ファイルシステムなど外部I/O | `app/infra/` |
| モデル | DBテーブル定義（SQLModel） | `app/models/` |
| スキーマ | 入出力の型定義（Pydantic） | `app/schemas/` |
| コア | DB接続・設定・共通処理 | `app/core/` |

**守るべきルール:**
- `app/api/` はリクエストの受付とレスポンスの返却のみ。ビジネスロジックを書かない
- `app/services/` は `app/infra/` や `app/repositories/` を直接インスタンス化しない。依存性注入で受け取る
- `app/models/` と `app/schemas/` は分離する。SQLModelのDBモデルをそのままAPIレスポンスに使わない
- DBセッションは `Depends` で受け取る。直接インポートしない

## コーディング規約
- 型アノテーションを必ず付ける（mypy strict相当）
- `Any` は使用禁止
- 非同期処理は `async/await` を使う（同期的なDB操作禁止）
- 環境変数は `python-dotenv` 経由で `.env` から読み込む

## テスト方針
- `tests/` 以下に pytest でテストを書く
- サービス層の単体テストを優先する
- `infra/` や `repositories/` はモックに差し替えてテストする
- APIのテストは `httpx` + FastAPIの `TestClient` を使う
- DBはテスト用インメモリSQLiteを使う

## 環境変数（.env）
```
DATABASE_URL=sqlite+aiosqlite:///./db.sqlite3
```
