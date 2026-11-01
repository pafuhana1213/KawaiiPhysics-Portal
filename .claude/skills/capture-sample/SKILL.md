---
name: capture-sample
description: KawaiiPhysics公式サンプルをUEエディタで動かし、ドキュメント用の動画とスクリーンショットを撮影する。「サンプルを撮影」「動画を撮り直す」「実画面のスクショ」「図解を実映像に置き換える」等の依頼で使用する。
argument-hint: "[展示番号や撮りたい内容]"
---

# サンプルの撮影

公式サンプルを実際に動かして、ドキュメント用の素材を作る: $ARGUMENTS

掲載の基準は `.claude/rules/media.md` に従う。

## 前提

- Python はエンジン同梱版を使う。`PATH` の `python` は Store のスタブで動かない。
  ```bash
  PY=/d/EpicGames/UE_5.8/Engine/Binaries/ThirdParty/Python3/Win64/python.exe
  CAP=.claude/skills/capture-sample/scripts/ue_capture.py
  OUT=/d/GitHub/KawaiiPhysics-DocCapture/Captures
  ```
- 撮影は `D:\GitHub\KawaiiPhysics-DocCapture`（サンプルの worktree）で行う。ユーザーの作業用チェックアウト `D:\GitHub\KawaiiPhysics` には触らない。素材は `Captures/` に置く。
- プロジェクトの `Source/` は Git 管理外で、worktree 側は UE 5.8 向けに `BuildSettingsVersion.V7` へ修正済み。サンプルをコミットするときは `Content` だけをステージする。

## 手順

### 1. サンプルを最新にしてビルド

```bash
git -C /d/GitHub/KawaiiPhysics-DocCapture fetch origin
git -C /d/GitHub/KawaiiPhysics-DocCapture switch --detach origin/master
```

バイナリがソースと一致していないと、古い挙動や未リリースのUIを撮ってしまう。ソースが変わっていたらビルドする。

```bash
cmd //c "D:\EpicGames\UE_5.8\Engine\Build\BatchFiles\Build.bat KawaiiPhysicsSampleEditor Win64 Development -Project=D:\GitHub\KawaiiPhysics-DocCapture\KawaiiPhysicsSample.uproject -WaitMutex -NoHotReloadFromIDE" > build.log 2>&1
```

成否は `build.log` の `Result: Succeeded` で判断する。`| tail` を挟むと終了コードは `tail` のものになる。

### 2. エディタを起動（`run_in_background`）

```bash
"/d/EpicGames/UE_5.8/Engine/Binaries/Win64/UnrealEditor.exe" "D:\GitHub\KawaiiPhysics-DocCapture\KawaiiPhysicsSample.uproject" -ModelContextProtocolStartServer -ModelContextProtocolPort=8000 -log -nosplash
```

英語UIは `-culture=en` を足す。`http://127.0.0.1:8000/mcp` が応答したら、起動のたびに撮影設定を適用する。

```bash
"$PY" "$CAP" setup
"$PY" "$CAP" exhibits "$OUT/exhibits.json"   # 展示の位置・看板の説明・Docsリンクの一覧
```

### 3. 録画

展示は `y = 700 * n` に並ぶ。標準のカメラは `x=-660, z=150, pitch=-4`。

```bash
"$PY" "$CAP" record 02_PhysicsSettings/L_KPS_02_PhysicsSettings 0 "$OUT/v2/ex_2_1.mp4"
```

スカートや髪など差が小さい展示は、カメラを寄せる（例: `--x -360 --z 125 --pitch -6`）。寄ると値ラベルが画角から外れるので、編集で重ねる。

録画中はPIEウィンドウを最前面に固定する。画面そのものを取得するので、PCのスリープや画面ロックは避ける。

### 4. 素材の確認

- 実効fpsが低いと `record` は失敗する。`4.2`、`4.3`、`4.9`、`4.10` は静止する展示なので、フレームを確認して `--allow-static` を付ける。動画ではなく静止画を使う。
- 説明文を書く前に、原寸のフレームを見る。効果の判断、特に貫通の有無はサムネイルでは判断しない。動きの山を含むよう、走りの周期全体から複数のフレームを見る。
- 看板の記述だけで説明文を書かない。実際に映っている内容に合わせる。

### 5. Web用に圧縮

看板の文字を切り落として、言語に依存しない素材にする。値ラベルは英語固定。`9.x` のラベルだけ日本語固定なので注意する。

```bash
ffmpeg -y -ss 1 -t 8 -i "$OUT/v2/ex_2_1.mp4" -vf "crop=1280:424:0:186" -an \
  -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart static/video/sample/damping.mp4
ffmpeg -y -ss 4 -i "$OUT/v2/ex_2_1.mp4" -frames:v 1 -vf "crop=1280:424:0:186" -q:v 4 static/video/sample/damping.jpg
```

ラベルを重ねるときは `drawtext` に `fontfile='C\:/Windows/Fonts/arialbd.ttf'` を指定し、足元など比較に必要な部分を隠さない位置に置く。ポスターは差が最も分かるフレームを選ぶ。

### 6. UIのスクリーンショット

MCP の `SlateInspectorToolset.Screenshot` は 2560px 級で撮れる。`CaptureEditorImage` は 1280px に縮小される。ウィンドウ単位で撮れるので、言語別に `-culture=en` で起動して撮る。

### 7. 終了

```bash
"$PY" "$CAP" quit
```

未保存のアセットがあると、終了時に確認ダイアログで止まる。検証で値を変えたアセットは、元の値に戻して保存し、終了後に `git checkout` で戻す。

### 8. 再生の確認

ビルドとプレビューの起動後に、新しい動画を載せたページで確認する。

```bash
node .claude/skills/capture-sample/scripts/check_video.mjs "http://localhost:3000/KawaiiPhysics-Portal/docs/features/physics-setup"
```

Claude in Chrome は、接続先によって、このPCの `localhost` に届かないことがある。その場合もこのスクリプトで確認できる。

## 落とし穴

| 症状 | 原因 | 対処 |
|---|---|---|
| 30fpsと表示されるのに、ほぼ静止画 | `gdigrab` はD3D12のウィンドウを正しく読めない | `ddagrab` を使う。フレーム数やサイズではなく、フレーム間の差分で判断する |
| 映像が90度回転する、別の領域が写る | 2560x1600のデスクトップが縦向きパネルに表示されている | 座標はパネル基準の `(1600 - top - 720, left)`、サイズ `720x1280`、`transpose=2`。`ue_capture.py` が処理する |
| 非フォアグラウンドで描画が落ちる | `bThrottleCPUWhenNotForeground` | `setup` で無効にする |
| 左上に操作ガイドが出る | オンスクリーンメッセージ | `setup` の `DisableAllScreenMessages` で消える |
| PIEでキー入力が効かない | Slate の `PressKey` はゲーム入力に届かない | `StartPIE` の `startTransform` でカメラ位置を指定する |
| ラベルの板の幅が変わらない | 幅は `placardWidth` ではなく `placardMesh` で決まる | `SM_KPS_Placard_176` などに差し替える |
| Project Settings の Kawaii Physics まで移動できない | 左の一覧をスクロールできず、検索にも当たらない | 未解決。ユーザーに手動のスクショを依頼する |
| 複合コマンドでコミット前ビルドが走る | フックの `if` が複合コマンドで誤判定する | 長い処理はスクリプトファイルに分ける |
