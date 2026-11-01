# Docusaurus Rules

## ビルド検証
- 変更後は必ず `npm run build` を実行
- ja/en 両言語でビルドが通ることを確認

## 公開
- `main` へのPushで GitHub Pages に即公開される
- 公開のタイミングを調整したい変更はブランチに置く

## URL
- `trailingSlash: false` のため、末尾 `/` 付きのURLは404になる
- リンクや動作確認のURLは末尾 `/` なしで書く

## サイドバー
- `sidebars.ts` でドキュメント構造を定義
- 新規ページ追加時はサイドバーも更新

## 多言語対応
- デフォルト: 日本語 (ja)
- 英語版は `i18n/en/` に配置

## Admonitions
```md
:::tip
ヒント内容
:::

:::warning
警告内容
:::

:::note
補足情報
:::
```
