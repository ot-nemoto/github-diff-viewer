# Development

## ローカルセットアップ

```bash
git clone https://github.com/<owner>/github-diff.git
cd github-diff
npm install
npm run dev
```

開発サーバーは `http://localhost:3000` で起動。

## 環境変数

静的サイトのため `.env` ファイルは不要。PAT はユーザーがブラウザ上で入力する。

## ビルド・静的エクスポート

通常ビルド（開発・検証用）:

```bash
npm run build
```

GitHub Pages 向け静的エクスポート（`out/` を生成）:

```bash
npm run build:static
```

## デプロイ手順（GitHub Pages）

デプロイは GitHub Actions（`.github/workflows/deploy-github-pages.yml`）が自動で行う。`master` ブランチへのマージをトリガーに `npm run build:static` を実行し、生成した `out/` を GitHub Pages へ配置する。

手動デプロイは不要。

## ローカルで静的ビルドを確認

```bash
npm run build:static
npx serve out
```
