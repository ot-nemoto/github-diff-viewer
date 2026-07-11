# CLAUDE.md

開発の共通規約は `.claude/common-rules.md`（dev-commons から同期）に集約している。本ファイルはそれをインポートし、**このリポジトリ固有の情報のみ**を記載する。

@.claude/common-rules.md

---

## 作業開始時のチェックリスト

1. `docs/product.md` を読みプロダクトの目的・対象ユーザーを理解する
2. `docs/architecture.md` で実装方針・設計判断・バージョン gotcha を確認する
3. `docs/ui.md` で画面仕様・UI 規約を確認する
4. `docs/development.md` で開発・デプロイ手順を確認する
5. タスクの状態は [GitHub Issues](https://github.com/ot-nemoto/github-diff-viewer/issues) で確認する

## 本リポジトリのドキュメント採否

- **必須ドキュメントのみ**（`product` / `architecture` / `ui` / `development`）。
- **条件付き必須ドキュメントは該当なし**。GitHub Pages への静的エクスポート（クライアント完結の SPA）で、外部 REST API / Server Actions / 永続化 DB / 認証フロー / 外部サービス連携 / デプロイ専用構成のいずれも持たないため、`api.md` / `actions.md` / `schema.md` / `auth.md` / `integrations.md` / `infra.md` はいずれも不要。デプロイ手順は `development.md` に集約する。

## テスト対象（このリポジトリ固有）

- ユニットテスト対象: `src/lib/`（ユーティリティ関数）, `src/hooks/`（カスタムフック。`renderHook` で検証）
- API ルートは持たない（クライアント完結の静的エクスポート）
- UI コンポーネント（`src/components/`）のユニットテストは必須としない（動作確認は Issue の動作確認チェックリストで行う）
- CI: PR 作成時に `ci.yml` が lint / test を自動実行する（実コマンドは `package.json` を正とする）
