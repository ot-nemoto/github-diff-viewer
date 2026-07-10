# Architecture

## 技術スタック

| 用途 | 技術 |
|------|------|
| フレームワーク | Next.js（App Router） |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| Formatter / Linter | Biome |
| diff UI | `react-diff-viewer-continued` |
| GitHub API クライアント | `@octokit/rest` |
| テスト | Vitest + Testing Library |
| デプロイ | GitHub Pages（GitHub Actions で静的サイトを配信） |

> 各ライブラリの具体バージョンは `package.json` を正とする（[バージョン準拠ルール](../CLAUDE.md#バージョン準拠ルール)）。

## 実装方針：ロジックとレンダリングの分離

テスタビリティを高めるため、ロジックはカスタムフックに集約し、コンポーネントはレンダリングに専念させる（「フロントは薄く、ロジックは lib へ」）。

```
lib/         純粋関数（API アクセス・ストレージ操作）
  ↓
hooks/       状態管理・副作用（lib を呼び出す）
  ↓
components/  レンダリングのみ（hooks / props を受け取って表示）
  ↓
app/page.tsx 画面組み立て
```

- `lib/` … GitHub API アクセス・PAT の localStorage 操作などの純粋関数
- `hooks/` … ファイル取得やローディング・エラー状態の管理、URL クエリの読み書き
- `components/` … 表示専任。非自明なロジックは持たせず hooks / lib に切り出す

## 静的エクスポート設定

`BUILD_MODE=static` のときのみ `next.config.ts` が静的エクスポート設定（`output: "export"`・`basePath`・`assetPrefix` など）を適用する。`npm run dev` は通常の Next.js として動作し、静的制約を受けない。設定本体は `next.config.ts` を正とする。

## 環境変数

| 変数 | 用途 |
|------|------|
| `BUILD_MODE=static` | 静的エクスポートを有効化（CI のデプロイ時のみ使用） |

`.env` ファイルは不要。PAT はユーザーがブラウザ上で入力し `localStorage` に保存するため、ビルド時の環境変数には含まれない。

## 非機能要件

- GitHub Pages に静的サイトとしてデプロイできること（`output: 'export'` による静的エクスポート）
- GitHub API レート制限に対して適切なエラーメッセージを表示すること（未認証: 60 req/時、認証時: 5000 req/時）
- モバイルブラウザでも基本的に閲覧できること（レスポンシブ対応）

## GitHub API アクセス方針

- `GET /repos/{owner}/{repo}/contents/{path}?ref={ref}` でファイル内容を取得。レスポンスの `content`（Base64）は `TextDecoder` を使った UTF-8 対応デコードで表示する
- `GET /repos/{owner}/{repo}/branches` + `GET /repos/{owner}/{repo}/tags`：ブランチ・タグ一覧取得（`fetchRefs`）。Octokit の `paginate` で全ページを取得し、100 件超のリポジトリにも対応する
- `GET /repos/{owner}/{repo}/git/trees/{ref}?recursive=1`：ファイルツリー取得（`fetchTree`）
- トークンなし: パブリックリポジトリのみ。トークンあり: パブリック + プライベート

## URL クエリパラメータ仕様

比較状態を URL で共有できるよう、left / right の各フィールドを個別のパラメータで表現する。

```
/?lo=octocat&lr=Hello-World&lref=main&lp=README.md&ro=owner2&rr=repo2&rref=main&rp=README.md
```

| パラメータ | 内容 |
|------------|------|
| `lo` / `ro` | owner（left / right） |
| `lr` / `rr` | repo |
| `lref` / `rref` | ref（ブランチ / タグ / コミット SHA） |
| `lp` / `rp` | ファイルパス |

- フィールドが 1 つでも欠けている側（left / right）は、そのパラメータを一切セットしない
- ref にブランチ名など `/` を含む値も正しく扱える
- パラメータが揃った状態でページを開いた場合、初回マウント時に自動でファイル取得・差分表示を行う
- 表示モード（Split / Unified）は URL に含めず、`app/page.tsx` の state で管理して `DiffViewer` に `splitView` prop として渡す

## Biome 既知の制約と対応パターン

| ルール | 制約 | 対応方針 |
|--------|------|---------|
| `noAutofocus` | `autoFocus` 属性は使用不可 | `useRef` + `useEffect` でマウント後にフォーカスを当てる |
| `noStaticElementInteractions` | `div` 等の非インタラクティブ要素に `onClick` は不可 | クリック可能な要素は `<button>` に変更し `aria-label` を付与する |
| `$schema` 追従 | Biome 更新時に `biome.json` のスキーマ版が古いままだと lint が失敗 | `prepare` スクリプトの `biome migrate --write` で `npm install` 時に自動同期 |
