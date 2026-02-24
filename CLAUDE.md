# 印鑑証明システム

## 実装のルール

- `docs/spec/` ディレクトリ下にある仕様書を元に実装してください

## プロジェクト構成

```
hanko/
├── src/
│   ├── user-front/   # React Router v7 + Tailwind CSS (port 5173)
│   └── api/          # Hono + Zod バックエンド (port 8787)
├── docs/
│   ├── spec/         # 仕様書（docx/xlsx/pptx）
│   └── diary/        # 日報
└── .github/workflows/ci.yml
```

## 開発コマンド

```bash
# 開発サーバー起動（別々のターミナルで）
pnpm dev:front   # フロントエンド
pnpm dev:api     # バックエンドAPI

# ビルド
pnpm build       # フロントエンドのみ

# 品質チェック（CIと同じ内容）
pnpm lint        # Biome lint + format check
pnpm lint:fix    # 自動修正
pnpm format      # フォーマットのみ修正
pnpm typecheck   # TypeScript型チェック（全パッケージ）
pnpm ci          # lint + typecheck（CIと同等）
```

## コード品質ツール

### Biome

- リンター兼フォーマッター。ESLint + Prettier の代替
- 設定ファイル: `biome.json`（プロジェクトルート）
- コミット前に必ず `pnpm lint` を実行すること
- 自動修正: `pnpm lint:fix`（unsafe修正が必要な場合は `--unsafe` オプションを追加）

## CI（GitHub Actions）

`.github/workflows/ci.yml` で以下を自動実行:

1. `pnpm lint` — Biome lint & format check
2. `pnpm typecheck` — TypeScript 型チェック（全パッケージ）

PRとmain/masterへのpushで発火。

## 技術スタック

| 層 | 技術 |
|---|---|
| フロントエンド | React Router v7, TypeScript, Tailwind CSS v4 |
| バックエンド | Hono, Zod, @hono/zod-validator |
| パッケージ管理 | pnpm workspace |
| リンター/フォーマッター | Biome |
| CI | GitHub Actions |

## APIエンドポイント

Base URL: `http://localhost:8787`

| メソッド | パス | 説明 |
|---|---|---|
| GET | /api/registrations | 一覧取得（クエリ: id, name, address） |
| GET | /api/registrations/:id | 詳細取得 |
| POST | /api/registrations | 新規登録（multipart/form-data） |
| PATCH | /api/registrations/:id/status | ステータス更新 |
