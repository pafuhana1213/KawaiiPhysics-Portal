# KawaiiPhysics Documentation

UE向け軽量ボーン物理プラグイン [KawaiiPhysics](https://github.com/pafuhana1213/KawaiiPhysics) のドキュメントサイト。

## Commands

```bash
npm start      # Dev server (http://localhost:3000)
npm run build  # Production build - MUST pass before commit
```

## IMPORTANT

- **ビルドエラー修正必須**: コミット前に必ず `npm run build` を実行
- **リンク切れ検出**: `onBrokenLinks: 'throw'` により自動検出
- **日本語メイン**: 日本語で記述、技術用語は英語OK
- **複数選択デフォルト**: AskUserQuestion で選択肢を提示する際は `multiSelect: true` を使用

## Workflow

1. ソース解析 → 2. ドキュメント更新 → 3. `src/data/docUpdates.ts` に更新履歴を追加 → 4. `npm run build` → 5. コミット

## Skills

- `/sync-docs` - ソースからドキュメント同期
- `/add-page [path] [title]` - 新規ページ追加
- `/verify-build` - ビルド検証
- `/preview` - ローカルプレビュー
- `/capture-sample [内容]` - 公式サンプルをUEエディタで動かして動画・スクショを撮影

## Directory

| Path | 内容 |
|------|------|
| `docs/` | Markdownドキュメント |
| `blog/` | 更新アナウンス |
| `i18n/en/` | 英語翻訳 |
| `static/video/sample/` | サンプルの録画とポスター |
| `static/img/editor/` | エディタの実画面（言語別） |

## Rules

詳細ルールは以下を参照:
@.claude/rules/markdown-style.md
@.claude/rules/docusaurus.md
@.claude/rules/ue-docs.md
@.claude/rules/media.md
@.claude/rules/doc-updates.md

## Source Mapping

@docs/source-mapping.md
