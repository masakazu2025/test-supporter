# システム全体アーキテクチャ

## 概要

ウォーターフォール開発の結合テスト・総合テスト業務を効率化するツール。
リモート端末上のテスト成果物を採取・閲覧・仕訳する。

## 主要機能

| 機能 | 概要 |
|------|------|
| **採取** | リモート端末からファイル・SS・ログをローカルプールに取得する |
| **閲覧** | 採取データの表示・フォーマット。リモート直接閲覧も可能 |
| **仕訳** | テスト仕様書と紐づけてフォルダ分けし再保存する |
| **設定** | 顧客プロファイルごとの接続先・仕様書などを管理する |

## システム構成

```mermaid
graph TB
    subgraph Remote["リモート端末群"]
        T1["端末A\n192.168.1.10"]
        T2["端末B\n192.168.1.11"]
    end

    subgraph App["test-supporter"]
        subgraph Collection["採取"]
            AW["AutoWatcher\n（自動）"]
            MA["手動採取API"]
            JM["JobManager\n（キュー・Worker）"]
        end

        Pool[("ローカルプール\n（共通キャッシュ）")]

        Viewing["閲覧"]
        Sorting["仕訳"]
        Incident["不具合採取"]
    end

    T1 -- "UNC (C$)" --> Collection
    T2 -- "UNC (C$)" --> Collection
    AW --> JM
    MA --> JM
    JM --> Pool
    Pool --> Viewing
    Pool --> Sorting
    Pool --> Incident
    T1 -. "フォールバック" .-> Sorting
    T1 -. "フォールバック" .-> Incident
```

## プール＝キャッシュ思想

```mermaid
graph LR
    Remote["リモート端末"]
    Pool[("ローカルプール")]
    Features["仕訳 / 閲覧 / 不具合採取"]

    Remote -- "採取（自動 or 手動）" --> Pool
    Pool -- "優先して参照" --> Features
    Remote -. "プールに不足があればフォールバック" .-> Features
```

- **採取**はプールに貯めるだけ
- **仕訳・閲覧・不具合採取**はプールから読む。プールにない場合のみリモートへ
- 不具合採取だけ例外：ログの直採取（リアルタイムキャプチャ）が追加される

## 技術スタック

| 層 | 技術 |
|----|------|
| バックエンド | FastAPI（Python） |
| フロントエンド | React + Vite（TypeScript） |
| リモートアクセス | Windows 管理共有（UNC: `\\IP\C$\...`） |
| ローカルDB | SQLite（採取完了記録・検索用） |

## ドキュメント構成

```
docs/
  architecture.md              ← このファイル（全体俯瞰）
  features/
    collection/                ← 採取機能
      requirements.md          ← 要件
      design.md                ← 設計
      schema.md                ← CopyJob・metadata等
      decisions.md             ← 設計の意思決定
    sorting/                   ← 仕訳機能（未作成）
    viewing/                   ← 閲覧機能（未作成）
  schema/
    config.md                  ← 設定ファイルスキーマ
    db.md                      ← DBスキーマ（未作成）
    api.md                     ← APIスキーマ（未作成）
```
