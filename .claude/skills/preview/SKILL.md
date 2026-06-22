---
name: preview
description: KawaiiPhysicsDocs のローカルプレビューを起動する。Docusaurus dev サーバー (npm start) を必要なら立ち上げ、ブラウザで http://localhost:3000/KawaiiPhysics-Portal/ を開く。「プレビュー」「ローカルで確認」「dev サーバー起動」「サイトを開いて」等の依頼で使用する。
---

# Docs ローカルプレビュー

KawaiiPhysics ドキュメントサイトのローカルプレビューを起動するスキル。

以前は Edit/Write のたびに自動でサーバー・ブラウザが立ち上がる PostToolUse フックがあったが、
煩雑なため削除し、このスキルで**必要なときだけ手動起動**する方式に変更した。

## 重要: baseUrl

このサイトは `docusaurus.config.ts` で `baseUrl: '/KawaiiPhysics-Portal/'` が設定されている。
そのためルート (`http://localhost:3000/`) では表示できず、必ず以下を開くこと:

```
http://localhost:3000/KawaiiPhysics-Portal/
```

## 動作

1. ポート3000が既に LISTENING かを確認する。
2. 起動していなければ Docusaurus dev サーバーを起動する（`npm start`、ホットリロード有効）。
3. サーバーが LISTENING になるまで待つ（初回コンパイルは10〜20秒かかる）。
4. ブラウザで `http://localhost:3000/KawaiiPhysics-Portal/` を開く。

## 実行手順

### 1. 既に起動済みか確認

```bash
netstat -ano 2>/dev/null | grep ':3000 .*LISTENING' && echo '[Preview] 起動済み' || echo '[Preview] 未起動'
```

### 2. 未起動なら dev サーバーを起動

**Bash ツールの `run_in_background: true` で `npm start` を起動する**（`start cmd /c` は cwd やウィンドウ制御が不安定で起動失敗することがあるため使わない）。出力ファイルのパスが返るので、ログ確認やエラー診断に使える。

```bash
npm start
```

### 3. LISTENING になるまで待つ

```bash
for i in $(seq 1 20); do
  if netstat -ano 2>/dev/null | grep -q ':3000 .*LISTENING'; then echo "[OK] LISTENING"; break; fi
  sleep 3
done
```

### 4. ブラウザを開く

```bash
start "http://localhost:3000/KawaiiPhysics-Portal/"
```

## トラブルシュート

- **`Cannot read properties of undefined (reading 'id')` 等の実行時エラー / 真っ白な画面**:
  `.docusaurus` キャッシュの不整合が原因のことが多い（特に直前に `npm run build` を実行した後）。
  サーバーを停止 → キャッシュクリア → 再起動で直る:
  ```bash
  npx docusaurus clear   # .docusaurus / build / node_modules/.cache を削除
  npm start              # run_in_background: true で再起動
  ```
- **ページが見れない**: URL に baseUrl `/KawaiiPhysics-Portal/` が付いているか確認する。
- **ポート競合 / 多重起動**: docusaurus プロセスを特定して停止する:
  ```bash
  powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { \$_.CommandLine -like '*docusaurus*' } | Select-Object ProcessId, CommandLine | Format-List"
  taskkill //PID <該当PID> //F
  ```
- **dev サーバーが英語(en)だけ表示する / ja の `/docs/...` が見れない**:
  `docusaurus start` がロケール不整合状態になることがある（`.docusaurus/routes.js` を見ると `/en/` ルートだけが生成され `/KawaiiPhysics-Portal/docs/` が無い）。
  まず `npx docusaurus clear` → 再起動。直らなければ後述の **build + serve フォールバック**を使う。
  ロケール明示起動も可: `npm start -- --locale ja`

## フォールバック: build + serve（最も確実）

dev サーバー (`npm start`) が不調なときは、本番ビルドをそのままローカル配信するのが確実。
ja/en 両ロケールが正しいパスで生成され、静的HTMLなのでクライアント側の実行時エラーも起きない（ホットリロードは無い）。

```bash
npm run build              # ja/en 両方をビルド
npm run serve -- --no-open # build/ を http://localhost:3000/KawaiiPhysics-Portal/ で配信 (run_in_background: true)
```

確認URL例:
- 🇯🇵 `http://localhost:3000/KawaiiPhysics-Portal/docs`（docsトップ。`/docs/intro` は404＝intro は slug `/` のため注意）
- 🇬🇧 `http://localhost:3000/KawaiiPhysics-Portal/en/docs`

## 補足

- `run_in_background` で起動した dev サーバーは、終了するまで動き続ける（コンパイルログは出力ファイルで確認できる）。
- 本番ビルドの検証だけしたい場合（ブラウザを開かない）は `npm run build` を使う。
- ビルドエラーやリンク切れの確認が目的なら、プレビューではなく `npm run build` を推奨する（`onBrokenLinks: 'throw'` で検出）。
