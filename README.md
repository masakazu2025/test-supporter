# test-supporter

> 社内業務改善ツールのコアロジック（ドメイン情報なし）の実装。ポートフォリオ用。

ウォーターフォール開発の結合テスト・総合テスト業務を効率化するツール。
リモート端末上のテスト成果物（ファイル・スクリーンショット・ログ）を採取・閲覧・仕訳する。

## 主要機能

| 機能 | 概要 |
|------|------|
| **採取** | リモート端末からファイル・SS・ログをローカルプールに自動/手動取得 |
| **閲覧** | 採取データの表示・フォーマット |
| **仕訳** | テスト仕様書と紐づけてフォルダ分けし再保存 |
| **設定** | 顧客プロファイルごとの接続先・仕様書などを管理 |

## 技術スタック

| 層 | 技術 |
|----|------|
| バックエンド | Python / FastAPI |
| フロントエンド | TypeScript / React / Vite |
| リモートアクセス | Windows 管理共有（UNC パス） |
| DB | SQLite |

## 開発サーバーの起動

```bash
# バックエンド（localhost:8000）
cd src/backend
uvicorn app.main:app --reload

# フロントエンド（localhost:5173）
cd src/frontend
npm run dev
```

## テスト実行

```bash
cd src/backend
poetry run pytest
```

## ドキュメント

- [システム全体アーキテクチャ](docs/architecture.md)
- [採取 要件](docs/features/collection/requirements.md)
- [採取 設計](docs/features/collection/design.md)
- [設定ファイル スキーマ](docs/schema/config.md)

## リポジトリ構成

```
test-supporter/
├── docs/
│   ├── architecture.md        # システム全体アーキテクチャ
│   ├── features/              # 機能ごとの要件・設計
│   └── schema/                # 設定ファイル・DBスキーマ
└── src/
    ├── backend/               # FastAPI（Python）
    └── frontend/              # React + Vite（TypeScript）
```
