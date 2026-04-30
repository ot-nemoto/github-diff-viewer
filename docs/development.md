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

```bash
npm run build
```

`out/` ディレクトリに静的ファイルが生成される。

## デプロイ手順（GitHub Pages）

1. リポジトリの Settings → Pages → Source を `gh-pages` ブランチに設定
2. 以下のコマンドでデプロイ

```bash
npm run deploy
```

`package.json` の `deploy` スクリプト:

```json
"deploy": "next build && touch out/.nojekyll && gh-pages -d out"
```

## ローカルで静的ビルドを確認

```bash
npm run build
npx serve out
```
