# Architecture

## 技術スタック

| 用途 | 技術 |
|------|------|
| フレームワーク | Next.js 15（App Router） |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| Formatter / Linter | Biome |
| diff UI | `react-diff-viewer-continued` |
| GitHub API クライアント | `@octokit/rest` |
| デプロイ | GitHub Pages（`gh-pages` ブランチ） |

## ディレクトリ構成

```
/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── DiffViewer.tsx
│   ├── DiffViewer.test.tsx
│   ├── FileSelector.tsx
│   ├── FileSelector.test.tsx
│   ├── TokenSettings.tsx
│   └── TokenSettings.test.tsx
├── hooks/
│   ├── useFileContent.ts
│   ├── useFileContent.test.ts
│   ├── useQueryParams.ts
│   └── useQueryParams.test.ts
├── lib/
│   ├── github.ts
│   ├── github.test.ts
│   ├── storage.ts
│   └── storage.test.ts
├── docs/
├── public/
├── next.config.ts
└── package.json
```

## 実装方針：ロジックとレンダリングの分離

テスタビリティを高めるため、ロジックはカスタムフックに集約し、コンポーネントはレンダリングに専念させる。

```
lib/         純粋関数（APIアクセス・ストレージ操作）
  ↓
hooks/       状態管理・副作用（lib を呼び出す）
  ↓
components/  レンダリングのみ（hooks/props を受け取って表示）
  ↓
app/page.tsx 画面組み立て
```

### hooks の責務

| フック | 責務 |
|--------|------|
| `useFileContent` | `lib/github.ts` を呼び出してファイル取得・ローディング・エラー状態を管理 |
| `useQueryParams` | URL クエリパラメータの読み取りと書き込み（比較状態の共有 URL 化） |

## 静的エクスポート設定

`BUILD_MODE=static` のときのみ静的エクスポート設定を適用する。
`npm run dev` は通常の Next.js として動作し、静的制約を受けない。

```ts
// next.config.ts
const isStatic = process.env.BUILD_MODE === "static";

const nextConfig = {
  ...(isStatic && {
    output: "export",
    basePath: "/github-diff",
    assetPrefix: "/github-diff",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};
```

## npm スクリプト

| スクリプト | 用途 |
|-----------|------|
| `npm run dev` | 開発サーバー起動（通常の Next.js） |
| `npm run build` | 通常ビルド |
| `npm run build:static` | `BUILD_MODE=static next build`（GitHub Pages 向け静的エクスポート） |

## 環境変数

| 変数 | 用途 |
|------|------|
| `BUILD_MODE=static` | 静的エクスポートを有効化（CI のみ使用） |

PAT はユーザーがブラウザ上で入力し `localStorage` に保存する。ビルド時の環境変数には含まれない。

## GitHub API アクセス方針

- `GET /repos/{owner}/{repo}/contents/{path}?ref={ref}` でファイル内容を取得
- レスポンスの `content`（Base64）を `TextDecoder` を使った UTF-8 対応デコードで表示
- `GET /repos/{owner}/{repo}/branches` + `GET /repos/{owner}/{repo}/tags`：ブランチ・タグ一覧取得（`fetchRefs`）
- `GET /repos/{owner}/{repo}/git/trees/{ref}?recursive=1`：ファイルツリー取得（`fetchTree`）
- トークンなし: パブリックリポジトリのみ、60 req/時
- トークンあり: パブリック + プライベート、5000 req/時

## URL クエリパラメータ仕様

```
/?left=octocat/Hello-World/blob/main/README.md&right=owner2/repo2/blob/main/README.md
```

形式は `{owner}/{repo}/blob/{ref}/{path}`。`/blob/` の後を `refPath` とし、最初の `/` で ref と path に分割する。そのため **ref（ブランチ名・タグ名）に `/` を含む場合はパースが正しく動作しない制約がある**。フィールドが不完全な場合はパラメータを省略する。

モード（Split / Unified）はコンポーネント内部の state で管理し、URL には含めない。
