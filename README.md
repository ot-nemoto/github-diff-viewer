# GitHub Diff Viewer

![CI](https://github.com/ot-nemoto/github-diff-viewer/actions/workflows/ci.yml/badge.svg)
![Version](https://img.shields.io/github/package-json/v/ot-nemoto/github-diff-viewer)
![Next.js](https://img.shields.io/github/package-json/dependency-version/ot-nemoto/github-diff-viewer/next?logo=next.js&label=Next.js&color=black)
![TypeScript](https://img.shields.io/github/package-json/dependency-version/ot-nemoto/github-diff-viewer/dev/typescript?logo=typescript&logoColor=white&label=TypeScript&color=3178C6)
![Tailwind CSS](https://img.shields.io/github/package-json/dependency-version/ot-nemoto/github-diff-viewer/dev/tailwindcss?logo=tailwindcss&logoColor=white&label=Tailwind%20CSS&color=06B6D4)
![License](https://img.shields.io/github/license/ot-nemoto/github-diff-viewer)

異なる GitHub リポジトリ間でファイルを自由に比較できる Web ツール。

## 機能

- 任意の2ファイルをリポジトリ・ブランチ・パスで個別指定して比較
- サイドバイサイド / ユニファイドの差分表示切り替え
- パブリックリポジトリは認証不要で利用可能
- GitHub PAT を入力することでプライベートリポジトリも比較可能
- 比較状態を URL で共有可能

## ドキュメント

| ドキュメント | 内容 |
|------------|------|
| [docs/product.md](docs/product.md) | 目的・対象ユーザー・成功指標 |
| [docs/requirements.md](docs/requirements.md) | 機能要件・非機能要件 |
| [docs/architecture.md](docs/architecture.md) | 技術スタック・構成・実装方針 |
| [docs/ui.md](docs/ui.md) | 画面仕様・コンポーネント一覧 |
| [docs/development.md](docs/development.md) | セットアップ・ビルド・デプロイ手順 |
| [docs/testing.md](docs/testing.md) | テスト方針・完了条件 |
| [docs/e2e-scenarios.md](docs/e2e-scenarios.md) | E2E テストシナリオ |
| [docs/tasks.md](docs/tasks.md) | フェーズ構成・タスク一覧 |

## クイックスタート

```bash
npm install
npm run dev
```

詳細は [docs/development.md](docs/development.md) を参照。
