---
sidebar_position: 6
title: "コンソールコマンド / 変数"
---

# コンソールコマンド / 変数

KawaiiPhysics が提供するコンソール変数（CVar）と、デバッグに役立つ統計コマンドの一覧です。すべて `a.AnimNode.KawaiiPhysics.` プレフィックスを持ち、ランタイムの挙動調整やデバッグ表示の切り替えに使用します。

:::note
KawaiiPhysics には独自の「コンソールコマンド」（関数を実行するタイプ）はありません。すべてコンソール**変数**（値を読み書きするタイプ）です。統計表示には UE 標準の `stat` コマンドを利用します。
:::

## 使い方

コンソール変数は以下のいずれかの方法で設定できます。

```bash
# エディタ / ゲーム内コンソール（@ または ~ キーで開く）
a.AnimNode.KawaiiPhysics.Debug 1

# 現在値の確認（値を省略すると現在値とヘルプが表示される）
a.AnimNode.KawaiiPhysics.Debug
```

起動時に固定したい場合は `DefaultEngine.ini` に記述します。

```ini
[ConsoleVariables]
a.AnimNode.KawaiiPhysics.SharedCollision.ReadMaxAge=15
```

コマンドライン引数からも指定できます。

```bash
YourGame.exe -ExecCmds="a.AnimNode.KawaiiPhysics.Debug 1"
```

## デバッグ系 CVar

:::warning ビルド構成に注意
以下の3つは `ENABLE_ANIM_DEBUG` が有効なビルド（Editor / Development / DebugGame）でのみ登録されます。**Shipping / Test ビルドでは存在しません。**
:::

| CVar | 型 | デフォルト | 説明 |
|------|----|----------|------|
| `a.AnimNode.KawaiiPhysics.Enable` | bool | `true` | KawaiiPhysics の有効 / 無効を切り替える。`0` で全 KawaiiPhysics ノードのシミュレーションを停止 |
| `a.AnimNode.KawaiiPhysics.Debug` | bool | `false` | ボーンチェーンや外力などのビジュアルデバッグ描画を有効化 |
| `a.AnimNode.KawaiiPhysics.DebugDrawThickness` | float | `1.0` | デバッグ描画の線の太さを上書きする。`0` 以下にすると各描画呼び出し側の太さを使用 |

```bash
# シミュレーションを一時停止して元アニメーションと比較する
a.AnimNode.KawaiiPhysics.Enable 0

# デバッグ描画を有効化し、線を太くして見やすくする
a.AnimNode.KawaiiPhysics.Debug 1
a.AnimNode.KawaiiPhysics.DebugDrawThickness 2.0
```

:::tip
デバッグ描画の対象は GameplayTag で絞り込めます。詳しくは [デバッグ](/docs/advanced/debugging#gameplaytag-filtering) を参照してください。
:::

## 初期化系 CVar

| CVar | 型 | デフォルト | 説明 |
|------|----|----------|------|
| `a.AnimNode.KawaiiPhysics.UseBoneContainerRefSkeletonWhenInit` | bool | `true` | `InitModifyBones` で参照する RefSkeleton の取得元を切り替える。`true` は BoneContainer 側の RefSkeleton を使用（[Issue #174](https://github.com/pafuhana1213/KawaiiPhysics/issues/174) 対応）。旧来の挙動に戻したい場合は `false` |

## Shared Collision 系 CVar

[Shared Collision](/docs/features/shared-collision) の共有データの鮮度管理・クリーンアップ挙動を調整します。プレフィックスは `a.AnimNode.KawaiiPhysics.SharedCollision.` です。

| CVar | 型 | デフォルト | 説明 |
|------|----|----------|------|
| `a.AnimNode.KawaiiPhysics.SharedCollision.ReadMaxAge` | int32 | `10` | `ReadMerged` での鮮度判定フレーム数。これより古い公開データは読み取り対象外。URO / LOD によるスキップを見込んだ値にする |
| `a.AnimNode.KawaiiPhysics.SharedCollision.CleanupMaxAge` | int32 | `60` | Tick でのスロット除去猶予フレーム数。未使用スロットを物理削除するまでの猶予 |
| `a.AnimNode.KawaiiPhysics.SharedCollision.InitRetryThreshold` | int32 | `60` | Target 初期化のリトライが続いたときに警告ログを出すまでの回数 |
| `a.AnimNode.KawaiiPhysics.SharedCollision.CleanupInterval` | float | `1.0` | クリーンアップ処理を走らせる間隔（秒） |

:::tip
URO（Update Rate Optimization）や LOD で評価が間引かれると、Source の公開間隔が空きます。間引き中でも直近データを使い続けたい場合は `ReadMaxAge` を大きめに設定してください。
:::

## 統計コマンド（stat）

UE 標準の `stat` コマンドで KawaiiPhysics の処理負荷を計測できます。

```bash
# KawaiiPhysics 専用の統計グループ
stat KawaiiPhysics

# アニメーション全般の統計（KawaiiPhysics も STATGROUP_Anim に含まれる）
stat Anim
```

`stat KawaiiPhysics` では、シミュレーション時間・コリジョン処理・ボーン数などの内訳を確認できます。パフォーマンス調査の詳細は [パフォーマンス最適化](/docs/advanced/performance) を参照してください。

## ソースコード

CVar の定義は以下のファイルにあります。

- [`AnimNode_KawaiiPhysics.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysics.cpp) — 全 CVar の定義
- [`AnimNode_KawaiiPhysics.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNode_KawaiiPhysics.h) — デバッグ CVar の宣言
