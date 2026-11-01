---
sidebar_position: 19
title: "調査ガイド"
description: "KawaiiPhysics の不具合を、使える道具、切り分けの順序、症状別の確認箇所から調査する手順を説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# 調査ガイド

このページはコードを読みながら原因を絞り込むための資料です。設定に関するよくある問題は[デバッグ](/docs/advanced/debugging)を参照してください。

## このページの要点

**概要**

KawaiiPhysics の不具合を調べるときの手順をまとめたページです。症状が分かっていれば症状別の確認箇所から読み、原因が絞れないときは切り分けの順序に沿って確認します。調査に使う道具は最初の表から選びます。

**設計**

切り分けは、処理の前段から順に確認します。評価が走っているか、`ModifyBones` が期待どおりか、実行時の設定値が期待どおりか、どの段階が結果を変えているかを見て、最後に環境の差を確認します。不一致のある段階が見つかったら、その段階の道具や比較項目へ進みます。

**理解のポイント**

- 見ている値が、ノードの設定か実行時の値かを区別します。実効値は `Bone.PhysicsSettings` にあり、Node Audit と Preset Diff は実行時の値を読みません。
- 評価が走っていても、ステップが走らないフレームがあります。`NumSteps` が 0 のフレームでは `Location` が更新されず、一時外力の寿命のようなフレーム単位の処理だけが進みます。
- 押し出しの結果は、最終的な位置と一致するとは限りません。コリジョンの後に Bone Constraint と長さ復元が位置を変更し、再判定はありません。
- PIE で再現しない問題は、環境の差を確認します。`WITH_EDITOR` のビルドは Limits と Bone Constraints のアセットを毎評価取り込むため、PIE では見えない問題があります。

## 調査に使う道具

| 道具 | 分かること | 使い方 |
|---|---|---|
| `a.AnimNode.KawaiiPhysics.Enable` | ノードが原因かどうか。`0` で全ノードの評価を止める | `ENABLE_ANIM_DEBUG` のビルドのみ |
| `a.AnimNode.KawaiiPhysics.Debug` | ボーンと形状の描画 | `ENABLE_ANIM_DEBUG` のビルドのみ |
| `stat anim` | `KawaiiPhysics_Eval` などのサイクル統計とカウンタ | `STATGROUP_Anim` に登録されている |
| `LogKawaiiPhysics` | 接続の失敗、キャップ超過、再初期化の警告 | `Log LogKawaiiPhysics Verbose` で Verbose まで表示する |
| `GetRuntimeNodeInfosOnComponent` | ボーン構成と位置、ボーンごとの実効半径、有効なコリジョン。その他の実効値は `Bone.PhysicsSettings` をデバッガで確認する | [ランタイム診断](/docs/api/runtime-diagnostics) |
| Wind Scope | 風の波形と実行中の値 | [エディタツール](/docs/internals/editor-tools) |
| Node Audit、Preset Diff | グラフノードの設定の差分。未コンパイルの編集を含み、コンパイル結果と実行時の値は読まない | [エディタツール](/docs/internals/editor-tools) |
| `a.AnimNode.KawaiiPhysics.SimpleWorldCollision.DebugDraw`、`a.AnimNode.KawaiiPhysics.SharedPublisher.DebugDraw` | 収集範囲、収集した形状、地面 Box、Publisher のラベル | Subsystem の Tick で描画される |

CVar の説明は、[Subsystem と Shared Collision](/docs/internals/shared-collision)、[Simple World Collision](/docs/internals/simple-world-collision)、[Shared Publisher](/docs/internals/shared-publisher) の各ページにあります。定義は `AnimNode_KawaiiPhysics.cpp` の先頭にまとまっています。以降の本文では、共通の接頭辞 `a.AnimNode.KawaiiPhysics.` と機能名の接頭辞を省略して CVar 名を書く場合があります。

## 切り分けの順序

<DocFigure src="/img/generated/internals-triage-ja.svg" alt="評価、ボーン構成、実効値、処理段階、環境差を順に確認し、各段階の調査先へ進む判断フロー" caption="上から順に確認し、不一致のある段階から右側の道具や比較項目へ進みます。" maxWidth={960} />

原因が絞れないときは、次の順に確認します。

1. **評価が走っているか。** `IsValidToEvaluate` は `CVarAnimNodeKawaiiPhysicsEnable`、`RootBone`、`AdditionalRootBones` の名前を確認します。`EvaluateSkeletalControl_AnyThread` はさらに `IsValidToEvaluate(BoneContainer)` を確認し、無効なら以降をすべて飛ばします。
2. **`ModifyBones` が期待どおりか。** 実ボーン、ダミー、`bSkipSimulate` を確認します。
3. **実行時の設定値が期待どおりか。** ノードの `PhysicsSettings` ではなく `Bone.PhysicsSettings` を見ます。
4. **どの段階が結果を変えているか。** `SimulateOnce` の順に確認します。コリジョンの後に Bone Constraint と長さ復元が位置を変更します。
5. **環境の差か。** PIE、パッケージ、Persona のプレビューで動作が異なる場合は、次の節を確認します。

### 環境による差

PIE、パッケージ、プレビューの違いは、調査で見落としやすい点です。

| 項目 | パッケージ | PIE | Persona のプレビュー |
|---|---|---|---|
| Data Asset の取り込み（`ApplyLimitsDataAsset` など） | `Initialize_AnyThread` のみ | 毎評価 | 毎評価 |
| `InitializeBoneReferences` の毎評価の実行 | なし | なし | あり |
| `bEditing` による毎評価の設定更新 | なし | なし | あり |
| `ENABLE_ANIM_DEBUG` の CVar と描画 | 構成による | あり | あり |

`WITH_EDITOR` のビルドは Limits と Bone Constraints のアセットを毎評価取り込むため、PIE で問題が見えません。パッケージでは `SetLimitsDataAsset` などで Data Asset を差し替えても、次の `Initialize_AnyThread` まで `XxxLimitsData` は変わりません。`ModifyBones` の再構築は Data Asset を取り込み直しません。

## 症状別の確認箇所

### ボーンがまったく動かない

- `RootBone` や `AdditionalRootBones` が現在の LOD の `BoneContainer` で有効か確認します。無効だと評価全体が止まります。
- `DeltaTime <= 0` の評価では `SimulateModifyBones` が処理を行いません。
- 固定サブステップで `NumSteps` が 0 のフレームは計算が走りません。`TargetFramerate` がフレームレートより低いと発生します。
- ルートボーン自身の位置は積分しません。実の子か末端ダミーがあれば、そのベクトルから回転を計算します。どちらもなければ、物理による変化は出力に現れません。

### 倍率や一時外力の時間が止まる

ルートボーンが無効な評価は、`ConsumeAndAdvancePhysicsSettingsMultipliers` と `ConsumeAndRemoveExpiredTransientExternalForces` に到達しません。倍率と一時外力の時間が止まり、待機中の要求は上限の範囲でキューにたまります。

### 高フレームレートで動きが粗い、低フレームレートで遅い

- フレームレートが `TargetFramerate` より高いと、`NumSteps` が 0 のフレームが発生します。この間 `Location` は更新されず、ステップ間の補間もありません。
- フレームレートが低いと、`MaxSubsteps * FixedDt` を超える時間が破棄されます。外力の `PreApply` は破棄の前に走るため、Procedural Wind の時計はフレーム時間のぶん進み、物理の進みと一致しません。

### 移動やワープで暴れる

- `UpdateSkelCompMove` の Teleport 判定は `SkelCompMoveScale` の適用後の値を使います。閾値を 0 以下にするとその判定は無効です。
- 閾値による Teleport は `UpdateSkelCompMove` で確定します。それより前の処理（Simple World Collision の再収集の要求など）は、外部から要求された Teleport だけを見ます。
- `ResetDynamics` は `ResetPhysics` でボーンを作り直し、`TeleportPhysics` ではボーンを保持します。[リセット系イベントの比較](/docs/internals/frame-lifecycle)を参照してください。
- `WorldSpace` の Teleport では `Location` と `PrevLocation` が等しくなり、速度が 0 になります。

### コリジョンをすり抜ける、貫通が戻る

- 1ステップの押し出しは終点の位置で判定します。ステップ内の移動を検出できるのは Planar と World だけです。
- コリジョンの後に Bone Constraint と `RestoreBoneLengthsAndLimits` が位置を変更し、再判定はありません。
- 形状の追従は評価ごとに1回で、サブステップの間は補間されません。
- `bBoneSubdivisionCollisionOnly` が有効な Inter-Bone ダミーは再配置されるため、押し出しがダミー自身に残りません。実ボーンへ返るのは Bridge ダミーのフィードバックだけです。[ボーンモデル](/docs/internals/bone-model)を参照してください。
- `DrivingBone` に同じノードが揺らすボーンを指定しても、形状が追従するのは入力ポーズです。
- `bEnable` は毎評価 `DrivingBone` の有効性などから上書きされるため、外部から設定しても残りません。`AnimDrawDebug` は `bEnable` を見ないので、描画されていても無効な形状の場合があります。

### Limit やプリセットが反映されない

- 環境差の表を確認します。パッケージでは Data Asset の差し替えがすぐに反映されません。
- `ApplyPresetDataAsset` のランタイム適用は `ExternalForces` と `CustomExternalForces` を変更しません。
- タグから対象を選ぶ処理では、Preset の `TargetTags` が空なら対象なしです。ノード参照を渡して直接適用する場合は、この制限を受けません。
- `bUpdatePhysicsSettingsInGame` が false の場合、初期化済みの通常の状態ではノードの設定を変更してもボーンへ伝わりません。例外は、倍率が有効な間と終了直後の1回、およびプレビューでの編集中です。これらの更新では現在のノードの設定から計算し直します。

### 外力が効かない、強さが想定と違う

- `ApplyToVelocity` と `Apply` は、同じ値でも速度への影響が約 `1 / dt` 倍異なります。
- `bEnableWind` と Wind 外力は加算されます。
- 単発の外力はサブステップ数によらず1ステップ分だけ効きます。`NumSteps` が 0 のフレームは次へ持ち越されます。
- `AddExternalForce` で実行時に追加した外力には `Initialize` が呼ばれません。
- `bIsEnabled` が false でも `PreApply` と `PostApply` は呼ばれます。ボーンフィルタは外力の実装が `CanApply` を呼ぶことで効きます。
- 一時外力の寿命はフレーム時間で減ります。`NumSteps` が 0 のフレームや `WorldSpace` の Teleport でステップが走らなくても、寿命は減ります。
- 一時 Gust は別インスタンスなので、元の風の `ScopeBuffer` と Edit Mode の矢印に現れません。

### Shared Collision がつながらない

- Source と Target は同じ Actor ファミリーで同じタグが必要です。ファミリーの解決は接続の初期化時だけです。
- 接続できないまま `InitRetryThreshold` を超えると警告が出ます。以降の再試行は `InitRetryThrottleInterval` に間引かれます。
- Target は物理計算の前に読み、Source は後に書きます。ノードの評価順によっては、Target の読む形状が1フレーム遅れます。

### Simple World Collision や Shared Publisher が効かない

- Dedicated Server では `ForceEnableOnServer` を有効にしない限り収集しません。
- `ResetPhysics` は再収集を要求しません。要求するのは `TeleportPhysics` だけです。
- 公開処理は Publisher の `Update_AnyThread` で行います。weight 0 の枝などで Update が呼ばれなくなると公開が止まり、`ReaderReleaseMaxAge` の経過後に Reader が Provider を見失います。`Auto` は Local に戻り、`Shared` は押し出しのない状態になります。
- `Enabled=false` と Publisher の不在は別の状態で、`Enabled=false` では `Auto` は Local に戻りません。
- 別の AnimBlueprint の風は評価順が定まらず、外挿でそろえています。

### Persona のプレビューと PIE で違う

- `CopyNodeDataToPreviewNode` はプロパティを手書きで列挙しています。列挙されていないプロパティは、コンパイルするまでプレビューに届きません。
- プレビューでは `bEditing` により、`bUpdatePhysicsSettingsInGame` が false でも毎評価更新されます。
- Details の編集は `ModifyBones` を空にしますが、Gizmo の編集は空にしません。

## 関連ページ

- [ノードのライフサイクルと1フレームの処理順](/docs/internals/frame-lifecycle)
- [改造ガイド](/docs/internals/modification-guide)
- [テスト](/docs/internals/testing)
- [デバッグ](/docs/advanced/debugging)
- [コンソール変数](/docs/advanced/console-variables)
