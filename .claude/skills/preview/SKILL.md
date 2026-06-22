---
name: preview
description: KawaiiPhysicsDocs のローカルプレビューを起動する。Docusaurus dev サーバー (npm start) を必要なら立ち上げ、ブラウザで http://localhost:3000 を開く。「プレビュー」「ローカルで確認」「dev サーバー起動」「サイトを開いて」等の依頼で使用する。
---

# Docs ローカルプレビュー

KawaiiPhysics ドキュメントサイトのローカルプレビューを起動するスキル。

以前は Edit/Write のたびに自動でサーバー・ブラウザが立ち上がる PostToolUse フックがあったが、
煩雑なため削除し、このスキルで**必要なときだけ手動起動**する方式に変更した。

## 動作

1. ポート3000が既に LISTENING かを確認する。
2. 起動していなければ Docusaurus dev サーバーを別ウィンドウで起動する（`npm start`、ホットリロード有効）。
3. ブラウザで `http://localhost:3000` を開く。

## 実行コマンド

以下を Bash ツールで実行する（Git Bash 上で動作。`start` は cmd 経由で別ウィンドウ／既定ブラウザを開く）:

```bash
cd /f/Github/KawaiiPhysicsDocs && \
if netstat -ano 2>/dev/null | grep -q ':3000.*LISTENING'; then \
  echo '[Preview] dev サーバーは既に起動中。ホットリロードで反映されます。'; \
else \
  echo '[Preview] dev サーバーを起動します...'; \
  start cmd /c "npm start"; \
  sleep 4; \
fi
start http://localhost:3000
```

## 補足

- dev サーバーは別の cmd ウィンドウで動作するため、Claude のセッションを終了しても起動し続ける。停止したいときはその cmd ウィンドウを閉じるか、`taskkill` で node プロセスを終了する。
- 本番ビルドの検証だけしたい場合（ブラウザを開かない）は `npm run build` を使う。
- ビルドエラーやリンク切れの確認が目的なら、プレビューではなく `npm run build` を推奨する。
