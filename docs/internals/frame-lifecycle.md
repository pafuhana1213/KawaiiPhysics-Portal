---
sidebar_position: 2
title: "ノードのライフサイクルと1フレームの処理順"
description: "FAnimNode_KawaiiPhysics がいつ、どのスレッドで、どの順序で処理を行うかを、評価ループとリセット条件を中心に説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# ノードのライフサイクルと1フレームの処理順

このページでは、ノードの各コールバックが走るスレッド、評価ループの全手順、リセット系イベントで何が失われるかを説明します。物理計算の中身は[シミュレーション](/docs/internals/simulation)を参照してください。

## このページの要点

**概要**

`FAnimNode_KawaiiPhysics` の評価処理は、`EvaluateSkeletalControl_AnyThread` の1関数を入口にまとまっています。1回の評価の中で、リセットの判定、ボーンの構築、物理設定と形状の更新、ポーズの取得、シミュレーション、出力を順に行います。

**設計**

設定、実行時状態、要求キューはノードが保持します。Game Thread のコールバックが Subsystem などの参照をキャッシュし、Worker で実行される場合がある評価はそれを読みます。多くの機能はこの関数の処理順に依存しているので、順序を把握すると各機能の前提が読み取れます。`ResetDynamics` や再初期化の要求はボーン配列をその場で破棄せず、次の評価の冒頭で反映します。

**理解のポイント**

- 処理の単位を区別します。要求の取り込みと形状の追従は評価単位、`SimulateOnce` の中はステップ単位で走ります。
- 各手順の前提を確認しながら読みます。途中で確定する値（閾値による Teleport）や、後続の処理を飛ばす分岐（無効なルート、`WorldSpace` の Teleport）があります。
- リセット系のイベントは、イベントごとに消える状態と残る状態が異なります。調査では、どのイベントが起きたかを先に切り分け、比較表で残る状態を確認します。
- 評価が呼ばれないフレームと、呼ばれても `DeltaTime` が 0 以下の評価は別の状態です。前者は評価内の処理が走らず、後者はポーズの取得と出力が走ります。

## 関連ファイル

| ファイル | 役割 |
|---|---|
| [`Public/AnimNode_KawaiiPhysics.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNode_KawaiiPhysics.h) | ノードの宣言。設定、実行時状態、要求キューをすべて保持する |
| [`Private/AnimNode_KawaiiPhysics.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysics.cpp) | ライフサイクル、評価ループ本体、要求の受付、CVar と Stat の定義 |
| [`Private/AnimNode_KawaiiPhysicsModifyBones.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsModifyBones.cpp) | `InitializeBoneReferences`、`InitModifyBones`、`UpdateSkelCompMove`、`AdvancePreSkelCompTransform` |

## コールバックとスレッド

<DocFigure src="/img/generated/internals-threads-ja.svg" alt="Game Thread と評価スレッドの2レーンに配置した6つのコールバックと、初期化・参照更新とフレーム更新・評価の2つの流れ" caption="各列の番号と矢印をたどると、初期化と参照更新、フレーム更新と評価の順序をスレッド別に確認できます。" maxWidth={960} />

| コールバック | スレッド | 主な処理 |
|---|---|---|
| `OnInitializeAnimInstance` | Game | Subsystem、オーナー Actor、SkeletalMeshComponent をキャッシュする。警告ログ用の名前を取得し、Editor / EditorPreview ワールドなら `bEditing` を立てる |
| `PreUpdate` | Game | ワールド、ゲーム時刻、Subsystem、SkeletalMeshComponent を毎フレーム取り直す。ワールドの変更や時刻の巻き戻りで `SharedWindClockGeneration` を進め、ワールドかコンポーネントが変わったら Simple World Collision の再初期化を要求する |
| `Initialize_AnyThread` | Worker または Game | 実行時状態を破棄して Data Asset を取り込む |
| `CacheBones_AnyThread` | Worker または Game | 基底クラスの処理のみ。基底クラス経由で `InitializeBoneReferences` が呼ばれる |
| `UpdateInternal` | Worker または Game | 基底クラスの処理の後、`DeltaTime` に `Context.GetDeltaTime()` を保存する |
| `EvaluateSkeletalControl_AnyThread` | Worker または Game | 処理の本体 |

`HasPreUpdate()` と `NeedsOnInitializeAnimInstance()` が `true` を返すことで、Game Thread のコールバックが有効になります。`NeedsDynamicReset()` も `true` を返すため、エンジンの `ResetDynamics` がノードに届きます。

Subsystem、オーナー Actor、SkeletalMeshComponent の参照は、`PreUpdate` と `OnInitializeAnimInstance` でメンバにキャッシュし、評価側はそれを読みます。Shared Collision のファミリーのルート Actor は、`InitializeSharedCollision` がオーナー Actor から解決します。解決は接続の初期化時だけで、毎フレームは行いません。

評価中の UObject へのアクセスがなくなるわけではありません。`SimulateModifyBones` は `SkelComp->GetWorld()`、`GetDefault<UKawaiiPhysicsDeveloperSettings>()`、`UPhysicsSettings::Get()` を呼びます。`CustomExternalForces` の UObject も評価中に実行されます。

一時外力、Gust、設定倍率の要求は、mutex で保護されたキューを経由します。`AddExternalForce` や `SetAlphaOnComponent` のように、ノードを直接変更する API もあります。詳細は[ランタイム制御と要求キュー](/docs/internals/runtime-control)を参照してください。

## 評価ループ

`EvaluateSkeletalControl_AnyThread` の処理を順に示します。

<DocFigure src="/img/generated/internals-frame-pipeline-ja.svg" alt="EvaluateSkeletalControl_AnyThread の8段階の処理順と、ルートが無効なときの return、WorldSpace かつ TeleportPhysics のときのスキップの分岐" caption="番号の順に処理が進みます。3 でルートが無効なら以降を行わず、7 では WorldSpace かつ TeleportPhysics のとき通常のシミュレーションをスキップします。" maxWidth={960} />

### 1. 前処理

1. `bSharedCollisionNeedsReinit` が立っていれば、Source Slot を期限切れにして共有コリジョンのキャッシュと配列を破棄します。無効なルートボーンで早期 return するより前に実行します。
2. `SimulationSpace` が `BaseBoneSpace` の場合、`SimulationBaseBone` が有効なら前回の `CurrentEvalSimSpaceCache.TargetSpaceToComponent` を `PrevBaseBoneSpace2ComponentSpace` へ退避し、無効なら Identity を設定して警告を1回出力します。
3. `CurrentEvalSimSpaceCache` と `CurrentEvalWorldSpaceCache` を構築します。以降の空間変換はこのキャッシュを読みます。
4. `BoneSubdivisionCount` と `BoneConstraintSubdivisionCount` を 0〜10、`BoneConstraintSubdivisionFeedbackScale` を 0〜2、`DummyBoneLength` を 0 以上にクランプします。Blueprint やピンから範囲外の値が入る場合があるため、評価時にも行います。

### 2. リセットと再初期化の判定

1. `TeleportType == ETeleportType::ResetPhysics` なら `ModifyBones` を空にして `bInitPhysicsSettings` を倒します。
2. `SimulationSpace != LastSimulationSpace` なら `ConvertSimulationSpace` で、全ボーンの `Location`、`PrevLocation`、`PrevRotation` を新しい空間へ変換します。`PrevPoseLocation` と `PrevPoseRotation` は変換の対象外で、`bSubstepPoseInitialized` も変更しません。
3. `ModifyBones` が空でなく `ShouldReinitModifyBones()` が真なら、`ModifyBones` を空にします。判定対象は `bModifyBonesNeedsReinit`、`BoneSubdivisionCount`、`BoneConstraintSubdivisionCount`、`bBoneSubdivisionDensifyByRadius`、`bBoneSubdivisionDensifyByRadius` が有効な場合の `PhysicsSettings.Radius`、`DummyBoneLength` です。`bBoneSubdivisionCollisionOnly` や Radius カーブの変更は、この判定では検出しません。
4. エディタビルドでは `ApplyLimitsDataAsset`、`ApplyPhysicsAsset`、`ApplyMirrorLimits`、`ApplyBoneConstraintDataAsset` を毎評価実行し、他ノードでの編集を同期します。PIE 外では `InitializeBoneReferences` も実行します。

### 3. ボーンの検証と構築

`RootBone` と `AdditionalRootBones` のいずれかが `IsValidToEvaluate` を満たさなければ、ここで return します。この検証自体は `ModifyBones` を破棄しませんが、前段のリセットで空になっている場合はあります。return した評価では、以降の処理（要求の取り込み、形状の更新、シミュレーション、出力）がすべて行われません。

`ModifyBones` が空なら、`InitModifyBones`、`InitSyncBones`、`InitBoneConstraints` を実行し、再初期化の判定に使う `LastInitialized...` の各値を記録して、`PreSkelCompTransform` を現在の Component Transform で初期化します。ボーンの構築は[ボーンモデル](/docs/internals/bone-model)を参照してください。

### 4. 物理設定の更新

`ConsumeAndAdvancePhysicsSettingsMultipliers(DeltaTime)` で倍率の要求を取り込み、`ShouldUpdatePhysicsSettings` が真なら `UpdatePhysicsSettingsOfModifyBones` で各ボーンの `PhysicsSettings` を計算します。

`ShouldUpdatePhysicsSettings` は、未初期化、`bUpdatePhysicsSettingsInGame` が有効、倍率が有効、または前回の更新で倍率が適用されていた場合に真を返します。最後の条件によって、`bUpdatePhysicsSettingsInGame` が無効でも倍率の終了直後に1回更新され、値がベースへ戻ります。`bEditing` が真の間は `bInitPhysicsSettings` を立てないため、エディタでは毎評価更新されます。

カーブがすべて空の場合は、ボーンごとの `Eval` を省略して1回の計算結果を全ボーンへ書き込みます。

### 5. コリジョン形状の更新

ローカル形状は `UpdateSphericalLimits` などの関数で、ノード直持ちの `XxxLimits` と Data Asset 由来の `XxxLimitsData` を順に更新します。続けて次の処理を行います。

- `bSharedCollisionSource` か `bUseSharedCollision` が有効でタグが有効なら `UpdateSharedCollisionRegistration` を実行します。Target で Entry が有効なら、`UpdateSharedCollisionLimits` で Source の形状をマージします。
- `bUseSimpleWorldCollision` が有効で CVar `a.AnimNode.KawaiiPhysics.SimpleWorldCollision.Enable` が非0の場合、未初期化なら `InitializeSimpleWorldCollision` を実行します（Reader は再試行の間引きに従います）。Entry が有効か Reader モードなら `UpdateSimpleWorldCollisionLimits` を実行します。無効化された場合は、Entry の解放と配列のクリアを行います。

ボーンへの形状の追従はこの位置で**評価ごとに1回**だけ行います。サブステップ間で補間されるのはボーンのポーズ目標だけで、`UpdateSphericalLimits` などの追従処理はステップごとに走りません。形状の派生値のキャッシュ（`PrepareCollisionShapeCaches`）はステップごとに再計算します。

### 6. ポーズと移動量

1. `UpdateModifyBonesPoseTransform` が現在のアニメーションポーズをシミュレーション空間で取得し、各ボーンの `PoseLocation`、`PoseRotation`、`PoseScale` を更新します。
2. `ApplySyncBones` が[Sync Bone](/docs/internals/sync-bone)の移動を反映します。
3. `UpdateSkelCompMove` が `PreSkelCompTransform` からの Component の移動を `SkelCompMoveVector` と `SkelCompMoveRotation` に計算します。`SkelCompMoveVector` には軸ごとの `SkelCompMoveScale` を掛けます。スケール適用後の移動量が `TeleportDistanceThreshold`（既定 300cm）、回転量が `TeleportRotationThreshold`（既定 10度）を超えると、`TeleportType` が `TeleportPhysics` になります。閾値が 0 以下ならその判定は行いません。固定サブステップでは `PreSkelCompTransform` が部分的にしか進まないため、この移動量に未消費の分が含まれる場合があります。
4. `ConsumeAndRemoveExpiredTransientExternalForces(DeltaTime)` が一時外力の寿命を減らし、キューの要求を取り込みます。WarmUp の反復や Teleport によるスキップに影響されないよう、評価ごとに1回だけここで実行します。

### 7. シミュレーション

1. `bNeedWarmUp && WarmUpFrames > 0` なら `WarmUp` を実行し、`bNeedWarmUp` を倒します。
2. `SimulationSpace` が `WorldSpace` で `TeleportType` が `TeleportPhysics` なら、通常のシミュレーションをスキップします（WarmUp はこの判定より先に走ります）。各ボーンの `PrevLocation` を `PreSkelCompTransform` で Component 空間へ戻してから現在の World へ変換し、`Location` と `PrevLocation` の両方へ書き込みます。Component との相対位置は保たれ、`Location` と `PrevLocation` が等しくなるため速度は 0 になります。
3. それ以外は `SimulateModifyBones` を実行します。

### 8. 出力と後処理

1. `bSharedCollisionSource` でタグと Source Slot が有効なら、`WriteSharedCollisionToSubsystem` で計算済みの形状を書き込みます。
2. `ApplySimulateResult` で結果を `OutBoneTransforms` へ出力します。
3. `TeleportType` を `None` に戻し、`AdvancePreSkelCompTransform` で `PreSkelCompTransform` を進めます。Teleport のフレームは未消費の移動を残さず全量破棄します。
4. `ENABLE_ANIM_DEBUG` のビルドでは `AnimDrawDebug` を実行します。

## リセット系イベントの比較

<DocFigure src="/img/generated/internals-reset-matrix-ja.svg" alt="9つの状態と5つのリセット系イベントについて、破棄・初期化、保持、一部・条件付き、対象外を色分けした比較表" caption="列のイベントと行の状態が交わるセルを読み、条件付きの変化は下の注記で確認します。" maxWidth={960} />

イベントごとに、消える状態と残る状態が異なります。不具合の調査では、この差が原因になる場合があります。`ResetDynamics` が即座に変更するのは `TeleportType`、`bNeedWarmUp`、`SubstepAccumulator`、`bSubstepPoseInitialized` だけで、`ModifyBones` の破棄や追従の停止は次の評価で行われます。

| 状態 | `Initialize_AnyThread` | `ResetDynamics(ResetPhysics)` | `ResetDynamics(TeleportPhysics)` | 閾値による Teleport | `ShouldReinitModifyBones` |
|---|---|---|---|---|---|
| `ModifyBones`（位置と速度） | 破棄 | 破棄 | 配列は保持。`WorldSpace` は位置を補正して速度が 0 になる | 同左 | 破棄 |
| `bInitPhysicsSettings` | 変更なし | false | 変更なし | 変更なし | false |
| `MergedBoneConstraints` | 次の構築で再生成 | 次の構築で再生成 | 保持 | 保持 | 次の構築で再生成 |
| `SubstepAccumulator` | 0 | 0 | 0 | WorldSpace のみ 0 | 保持 |
| `bSubstepPoseInitialized` | false | false | false | WorldSpace のみ false | false |
| 一時外力と設定倍率 | 破棄 | 保持 | 保持 | 保持 | 保持 |
| 共有コリジョンの接続 | 破棄 | 保持 | 保持 | 保持 | 保持 |
| `bNeedWarmUp` | 変更なし | `bUseWarmUpWhenResetDynamics` なら true | 同左 | 変更なし | 変更なし |
| World 移動の追従 | ― | ― | そのフレームのみ停止 | そのフレームのみ停止 | ― |

`ResetDynamics` を `ETeleportType::None` で呼んだ場合も、`SubstepAccumulator` のクリアと `bNeedWarmUp` の設定は行われます。

`UKawaiiPhysicsLibrary::ResetDynamics` は `ETeleportType::ResetPhysics` でノードの `ResetDynamics` を呼びます。

## 評価されないフレーム

`DeltaTime` が 0 以下の評価では `SimulateModifyBones` が即座に return します。この場合も、ポーズの取得、Component 移動量の計算、`ApplySimulateResult` は実行されます。例外として、固定サブステップが有効な場合の `WarmUp` は `DeltaTime` を `FixedDt` に差し替えるため、計算が実行されます。

LOD やアニメーションの更新停止で `EvaluateSkeletalControl_AnyThread` が呼ばれないフレームでは、評価内の処理は走りません。次に評価されたとき、`PreSkelCompTransform` は前回の値のままです。Component の移動量が閾値を超えていれば Teleport として扱われます。Subsystem 側のデータはノードの評価と関係なくフレーム数で失効するため、接続の張り直しが `UpdateSharedCollisionRegistration` と Simple World Collision の Reader 処理に実装されています。

## 変更するときの注意

- **Game Thread の API を評価に持ち込まない。** 評価は Worker で実行される場合があります。必要な値は `PreUpdate` でキャッシュしてください。
- **処理の単位を区別する。** 要求の取り込みと形状の追従は評価単位、`SimulateOnce` の中はステップ単位です。外力の `PreApply` は `SimulateModifyBones` の呼び出し単位なので、WarmUp がある評価では `WarmUpFrames` 回の分が加わります。`WorldSpace` の Teleport で通常のシミュレーションがスキップされる場合や、`DeltaTime` が 0 以下の場合は、通常の分は走りません。WarmUp と区別が必要な処理は `IsWarmingUp()` で判定してください。
- **`TeleportType` を読む位置に注意する。** 閾値による Teleport は `UpdateSkelCompMove` で確定するため、それより前の処理は外部から要求された Teleport しか見えません。
- **状態を追加したら上の比較表を確認する。** `Initialize_AnyThread` と `ResetTransientRuntimeState`、`ResetDynamics` の各経路で、リセットするかどうかを決めてください。
- **新しいトポロジ設定を足すときは `ShouldReinitModifyBones` にも足す。** ダミーの数を左右する設定は、`LastInitialized...` のメンバと評価ループの記録処理も合わせて追加します。

## 関連ページ

- [内部設計の全体像](/docs/internals/overview)
- [シミュレーション](/docs/internals/simulation)
- [ボーンモデル](/docs/internals/bone-model)
- [ランタイム制御と要求キュー](/docs/internals/runtime-control)
- [改造ガイド](/docs/internals/modification-guide)
