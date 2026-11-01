---
name: translate
description: ドキュメントを英語に翻訳する
disable-model-invocation: true
---

# ドキュメント翻訳

日本語ドキュメントを英語に翻訳: $ARGUMENTS

## 手順

### 1. 対象ファイル確認
- `docs/[path].md` から読み込み

### 2. 翻訳ルール

#### 保持するもの
- frontmatter構造
- コードブロック内のコード
- ファイルパス・コマンド
- 技術用語（UPROPERTY, Blueprintなど）

#### 翻訳するもの
- 日本語の説明文
- コメント内の日本語
- 見出し

### 3. 出力先
- `i18n/en/docusaurus-plugin-content-docs/current/[path].md`

### 4. 品質チェック
- 原文の意味が保持されているか
- 技術的な正確性
- 自然な英語表現か

### 5. ビルド検証
```bash
npm run build
```

## 注意点

- 直訳ではなく、英語として自然な表現にする
- コード例のコメントも翻訳する
- IMAGE_NEEDED/VIDEO_NEEDED プレースホルダーは英語で書き直す
- `DocVideo` と `DocFigure` の `alt`、`caption` も翻訳する
- エディタの実画面は `-ja` / `-en` の画像を使い分ける
