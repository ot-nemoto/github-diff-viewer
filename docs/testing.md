# Testing

## テスト種別

| 種別 | 対象 | ツール |
|------|------|--------|
| ユニットテスト | `lib/` 配下のユーティリティ関数 | Vitest |
| フックテスト | `hooks/` 配下のカスタムフック | Vitest + `@testing-library/react` (`renderHook`) |
| コンポーネントテスト | `components/` 配下の UI コンポーネント | Vitest + `@testing-library/react` |
| 手動テスト | 画面全体の統合動作 | ブラウザ確認 |

## テスト配置方針

テストファイルはソースファイルと同一ディレクトリに配置する（co-located）。

```
components/FileSelector.tsx
components/FileSelector.test.tsx   ← 同一ディレクトリ
lib/github.ts
lib/github.test.ts                 ← 同一ディレクトリ
```

## 完了条件

| 対象 | 完了条件 |
|------|---------|
| `lib/storage.ts` | ユニットテスト作成 |
| `lib/github.ts` | ユニットテスト作成 |
| `hooks/useFileContent.ts` | フックテスト作成 |
| `hooks/useQueryParams.ts` | フックテスト作成 |
| `components/FileSelector.tsx` | コンポーネントテスト作成 |
| `components/TokenSettings.tsx` | コンポーネントテスト作成 |
| `components/DiffViewer.tsx` | コンポーネントテスト作成 |
| `app/page.tsx` | 手動動作確認（e2e-scenarios.md に従う） |

## カバレッジ方針

### lib/

- `storage.ts`: getToken / setToken / clearToken の正常系・境界値
- `github.ts`: 正常取得・404・401・403・Rate Limit の各エラーケースをモックでテスト
  - `fetchRefs`: ブランチ・タグ取得成功、API エラー時に空配列返却、片方失敗時の個別ハンドリング
  - `fetchTree`: ファイル一覧取得成功（blob のみ抽出）、API エラー時に空配列返却

### hooks/

- `useFileContent`: fetch 成功・ローディング中・各エラー状態の遷移
- `useQueryParams`: クエリ読み取り・書き込み・デフォルト値

### components/

- `FileSelector`: 入力値変更 → コールバック呼び出しの確認、GitHub URL 貼り付けによる全フィールド自動補完
- `TokenSettings`: トークン保存・クリア操作の確認
- `DiffViewer`: Split / Unified 切替・差分レンダリングの確認

## テスト設計の原則

- コンポーネントはレンダリングのみ担当し、ロジックはフックに分離する
- フックテストは `renderHook` を使い、DOM に依存せずロジックを検証する
- 外部依存（GitHub API・localStorage）はモックで差し替えてテストする

## 実行手順

```bash
npm test              # 全テスト実行
npm run test:watch    # ウォッチモード
npm run test:coverage # カバレッジレポート出力
```
