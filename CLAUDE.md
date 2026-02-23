# CLAUDE.md

## プロジェクト概要

ウォーターフォール開発における結合テスト・総合テストのテスト業務効率化ツール。

リモート端末上で実施されたテストの成果物（ファイル・スクリーンショット・ログ）を
採取・閲覧・仕訳することで、テスト証跡の管理コストを削減する。

### 主要機能

| 機能 | 概要 |
|------|------|
| **採取** | リモート端末からファイル・SS・ログを取得する |
| **閲覧** | 採取データの表示・フォーマット。リモート端末上の直接閲覧も可能 |
| **仕訳** | テスト仕様書（Excel）と紐づけてフォルダ分けし再保存する |
| **設定** | ユーザーごとの接続先・仕様書などの設定を管理する |

## リポジトリ構成

```
test-supporter/
├── CLAUDE.md
├── docs/                  # 仕様ドキュメント
└── src/
    ├── backend/           # FastAPI（Python）→ backend/CLAUDE.md 参照
    └── frontend/          # React + Vite（TypeScript）→ frontend/CLAUDE.md 参照
```

## 開発サーバーの起動

```bash
# バックエンド（localhost:8000）
cd src/backend
uvicorn app.main:app --reload

# フロントエンド（localhost:5173）
cd src/frontend
npm run dev
```

## コミット規約

[Conventional Commits](https://www.conventionalcommits.org/) に従う。

```
<type>: <概要（日本語可）>
```

| type | 用途 |
|------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `refactor` | 動作を変えないコード変更 |
| `test` | テストの追加・修正 |
| `chore` | ビルド・設定・依存関係の変更 |
| `docs` | ドキュメントのみの変更 |

## 詳細ガイドライン

- フロントエンド: [src/frontend/CLAUDE.md](src/frontend/CLAUDE.md)
- バックエンド: [src/backend/CLAUDE.md](src/backend/CLAUDE.md)
