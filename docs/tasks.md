# Tasks

## フェーズ構成

| フェーズ | 内容 | Milestone |
|---------|------|-----------|
| Phase 1 | プロジェクト初期設定・基盤構築 | - |
| Phase 2 | GitHub API 層・lib 実装 | - |
| Phase 3 | UI コンポーネント実装 | - |
| Phase 4 | 比較画面の組み立て・URL 共有 | - |
| Phase 5 | GitHub Pages デプロイ設定 | - |

## タスク一覧

タスクの状態は GitHub Issues で管理する。

| T番号 | フェーズ | タスク |
|-------|---------|--------|
| T1 | Phase 1 | Next.js プロジェクト初期化・依存関係インストール |
| T2 | Phase 1 | Tailwind CSS・静的エクスポート設定 |
| T3 | Phase 2 | `lib/storage.ts` 実装（PAT の localStorage 読み書き）+ テスト |
| T4 | Phase 2 | `lib/github.ts` 実装（ファイル取得・エラーハンドリング）+ テスト |
| T5 | Phase 3 | `TokenSettings` コンポーネント実装 |
| T6 | Phase 3 | `FileSelector` コンポーネント実装 |
| T7 | Phase 3 | `DiffViewer` コンポーネント実装（Split / Unified 切替） |
| T8 | Phase 4 | 比較画面（`app/page.tsx`）組み立て・URL クエリ連携 |
| T9 | Phase 5 | GitHub Pages デプロイ設定・`npm run deploy` 整備 |
| T16 | - | GitHub Actions の Node.js 20 非推奨警告を解消 |
| T17 | - | ソースディレクトリを `src/` 配下に移動 |
| T18 | - | UI リデザイン（GitHub 風ダークヘッダー・カードレイアウト） |
| T19 | - | ドキュメントを T16〜T18 の実装内容に合わせて更新 |
