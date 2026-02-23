# Frontend CLAUDE.md

## スタック
- React 19 + TypeScript（strict）
- Vite 6（ビルド・開発サーバー）
- React Router v7（SPA ルーティング）
- Tailwind CSS v4（スタイル）
- Vitest + Testing Library（単体テスト）
- Playwright（E2Eテスト）

## コマンド
| コマンド | 内容 |
|---------|------|
| `npm run dev` | 開発サーバー起動（localhost:5173） |
| `npm run build` | プロダクションビルド |
| `npm run typecheck` | 型チェックのみ |
| `npm run test` | 単体テスト（Vitest） |
| `npm run test:e2e` | E2Eテスト（Playwright） |

## ディレクトリ構成
```
src/
├── components/      # 再利用可能なUIコンポーネント（ボタン、フォームなど）
├── pages/           # ルートに対応するページコンポーネント
├── hooks/           # カスタムフック（ロジックをコンポーネントから分離）
├── lib/
│   ├── api/         # FastAPIとの通信処理
│   └── domain/      # 型定義・バリデーション
├── test/            # テスト共通設定（setup.ts）
└── App.tsx          # ルート定義

e2e/                 # Playwright E2Eテスト
```

## アーキテクチャ方針

関心の分離を基本とし、以下の層構造を守る。

| 層 | 役割 | 置き場所 |
|----|------|---------|
| UI | 描画のみ。ロジックを持たない | `components/`, `pages/` |
| アプリケーション | 画面の状態管理・ユーザー操作の処理 | `hooks/` |
| データアクセス | APIとのやりとり | `lib/api/` |
| ドメイン | 業務上の型定義・バリデーション | `lib/domain/` |

**守るべきルール:**
- コンポーネントは `lib/api/` を直接呼び出さない。必ず `hooks/` を経由する
- `pages/` はルーティングと `hooks/` の呼び出しに専念し、UIの細部は `components/` に委ねる
- `lib/domain/` の型はフロントエンド全体で共有する唯一の真実（single source of truth）

## コーディング規約
- コンポーネントは関数コンポーネントのみ（クラスコンポーネント禁止）
- `import type` を使って型のみのインポートを明示する（verbatimModuleSyntax）
- `any` は使用禁止。`unknown` で受けて型を絞る
- props は inline 型定義より `type Props = {...}` を先に定義する

## Tailwind CSS v4
- 設定ファイル（tailwind.config.js）は存在しない。CSS-first アプローチ
- `src/index.css` の `@import "tailwindcss"` が起点
- カスタムテーマは `@theme` ブロックで定義する

## React Router v7
- ルート定義は `App.tsx` に集約する
- ページコンポーネントは `src/pages/` に配置する

## テスト方針
- **単体テスト（Vitest）**: コンポーネント・hooks・ユーティリティ
  - ファイル名: `*.test.tsx` / `*.test.ts`
  - `src/components/Foo/Foo.test.tsx` のようにコンポーネントと同階層に置く
- **E2Eテスト（Playwright）**: ユーザーフロー全体
  - ファイル名: `e2e/*.test.ts`

## バックエンドとの連携
- APIのベースURLは環境変数 `VITE_API_BASE_URL` で管理する
- `.env` / `.env.local` で設定する（`.env.local` は gitignore 済み）
