---
sidebar_position: 4
title: "シミュレーション"
description: "KawaiiPhysics の1ステップの物理計算、固定サブステップ、シミュレーション空間、結果の出力を実装に沿って説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# シミュレーション

このページでは `SimulateModifyBones` 以下の処理を説明します。

## このページの要点

**概要**

各ボーンを質点として扱い、「速度で位置を進める」「制約で位置を直す」を1ステップとして繰り返します。回転は計算せず、最後に質点の位置の差から求めます。

**設計**

物理は Verlet 型の積分と、位置を直接補正する制約の組み合わせです。速度は保存せず、`Location` と `PrevLocation` の差から毎ステップ作り直します。そのため、積分する点では、コリジョンや拘束の補正のうち最終位置に残った分が、次のステップの速度にも反映されます。時間は既定で固定幅のステップに分割し、フレームレートの影響を抑えます。

**理解のポイント**

- 処理にはフレーム、ステップ、ボーンの3つの単位があります。各処理がどの単位で何回走るかを意識すると、順序を追いやすくなります。
- 位置を変更する処理は順に積み重なり、最後の長さ復元が位置を確定します。順序を変えると結果も変わります。
- 速度に作用する処理と位置に作用する処理は別です。外力の `ApplyToVelocity` と `Apply` もこの違いで分かれています。
- `Location` などの座標はシミュレーション空間の値です。空間によって、Component の移動の扱いが変わります。

## 関連ファイル

| ファイル | 役割 |
|---|---|
| [`Private/AnimNode_KawaiiPhysicsSimulation.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsSimulation.cpp) | 物理設定の計算、サブステップ、1ステップの処理、WarmUp、結果の出力、空間変換 |
| [`Public/KawaiiPhysicsTypes.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsTypes.h) | `FKawaiiPhysicsModifyBone`、`FKawaiiPhysicsSettings`、`EKawaiiPhysicsSimulationSpace` |
| [`Public/KawaiiPhysicsDeveloperSettings.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsDeveloperSettings.h) | `bUseFixedSubstepping`（既定 true）、`MaxSubsteps`（既定 4） |

## 呼び出しの階層

```text
SimulateModifyBones          フレーム単位の準備とサブステップの制御
└─ SimulateOnce              1ステップ。全ボーンを処理する
   ├─ Simulate               ボーン1本の積分と外力
   │  ├─ ComputeVerletStepVelocity
   │  ├─ IntegrateVerletStepPosition
   │  ├─ ApplySimpleExternalForce
   │  ├─ ApplyWorldMoveFollowNonBaseBone
   │  └─ ApplyStiffnessPull
   ├─ AdjustBy...Collision   コリジョン
   ├─ AdjustByBoneConstraints
   └─ RestoreBoneLengthsAndLimits
```

## フレーム単位の準備

`SimulateModifyBones` は、`DeltaTime <= 0` なら何もせず return します。それ以外はサブステップに入る前に次を行います。

1. `FrameDeltaTime` に実フレーム時間を保存します。
2. `bAllowWorldCollision` が有効なら `PrepareWorldCollisionQueryCaches` でクエリ設定を1回だけ構築します。
3. 各ボーンの `bSkipSimulate` を決めます。Bridge ダミーは false、BoneRef が無効な非ダミーは true、親を持たないルートは true です。
4. `Gravity` を `GravityInSimSpace` に変換します。`bUseWorldSpaceGravity`（既定 true）なら World 基準、`bUseDefaultGravityZProjectSetting` なら Project Settings の `DefaultGravityZ` の絶対値を掛けます。
5. `SimpleExternalForce` を `SimpleExternalForceInSimSpace` に変換します。
6. 外力の `PreApply` を `CustomExternalForces`、`ExternalForces`、一時外力の順に呼びます。
7. 現在のポーズを `CurrentPoseLocation` と `CurrentPoseRotation` に退避します。`bSubstepPoseInitialized` が false の場合は、`PrevPoseLocation` と `PrevPoseRotation` も現在の値で初期化します。

## 固定サブステップ

`bUseFixedSubstepping` が無効な場合は、`DeltaTime` で `SimulateOnce` を1回実行します（以下、レガシー経路）。有効な場合は固定時間ステップのアキュムレータで回数を決めます。

<DocFigure src="/img/generated/internals-substep-timeline-ja.svg" alt="MaxSubstepsを2とした3フレームの時間配分例で、固定ステップ、端数の繰り越し、超過時間の破棄、実行回数ゼロとポーズ目標の補間を示す図" caption="青の端数を次フレームへ繰り越し、緑のFixedDtを消費し、橙の超過分を破棄する流れとポーズ目標の補間を読みます。" maxWidth={960} />

`FixedDt` は `1 / GetEffectiveTargetFramerate()` です。`GetEffectiveTargetFramerate()` は `Max(1, TargetFramerate)` を返します（`TargetFramerate` の既定は 60）。`TargetFramerate` はノードごとの設定なので、ノードごとにステップ幅が変わります。

サブステップの間、`SimulateModifyBones` は次の値を差し替えます。

| 値 | サブステップ中の値 | 説明 |
|---|---|---|
| `PoseLocation` / `PoseRotation` | 前フレームのポーズから現在のポーズへの補間 | `SubstepAlpha = (i + 1) / NumSteps` |
| `SkelCompMoveVector` | 全移動量 × `MoveFrac` | `MoveFrac = FixedDt / RawElapsed` |
| `SkelCompMoveRotation` | Identity から全回転へ `MoveFrac` で Slerp | |
| `GetStepDeltaTime()` | `FixedDt` | `bInSubstep` が真の間 |
| `DeltaTimeOld` | `FixedDt` | 速度の再構成に使う |

ループの後に、`PoseLocation`、`PoseRotation`、`SkelCompMoveVector`、`SkelCompMoveRotation` を現在の値へ戻します。

Component の移動のうち消費していない分は繰り越します。`PreSkelCompTransformConsumeFraction` は「消費した時間と破棄した時間の合計」を `RawElapsed` で割った値で、`AdvancePreSkelCompTransform` は `PreSkelCompTransform` をこの割合だけ現在の Transform へ進めます。`NumSteps` が 0 のフレームは割合が 0 になり、移動は次にステップが走るフレームへ持ち越されます。

`NumSteps` が 0 のフレームでは `SimulateOnce` が走らず、`Location` は前回のステップの値のままです。`ApplySimulateResult` はこの値から出力するため、ステップ間の補間は行われません。

## 1ステップの処理順

<DocFigure src="/img/generated/internals-step-order-ja.svg" alt="SimulateOnceのルート追従から積分、ダミー配置、外力、形状キャッシュ、拘束、コリジョン、Bridgeフィードバック、制限と長さ復元までの11段階" caption="番号を上段から下段へ、各段では左から右へ追うと1ステップの処理順が分かります。" maxWidth={960} />

`SimulateOnce` の処理順を示します。

| # | 処理 | 備考 |
|---|---|---|
| 1 | ルートの追従 | `ParentIndex < 0` のボーンは `Location = PoseLocation`。`PrevLocation` も更新する |
| 2 | `Simulate` | `bSkipSimulate`、コリジョン専用モードの Inter-Bone ダミー、Bridge ダミーを除く全ボーン |
| 3 | コリジョン専用ダミーの配置 | `bBoneSubdivisionCollisionOnly` のときのみ。実ボーンの間へ Lerp |
| 4 | Bridge ダミーの配置 | 常に実行。Lerp の結果を `PoseLocation` にも保存し、押し出し量の基準にする |
| 5 | 外力の `PostApply` | `FKawaiiPhysicsExternalForcePostApply::Apply` と一時外力 |
| 6 | `PrepareCollisionShapeCaches` | `PostApply` がコリジョンを書き換える場合があるため、毎ステップ計算する |
| 7 | Bone Constraint（コリジョン前） | `BoneConstraintIterationCountBeforeCollision` 回。開始時に `Lambda` を 0 に戻す |
| 8 | コリジョン | ボーンごとに全形状を処理する |
| 9 | `ApplyBridgeDummyCollisionFeedback` | Bridge ダミーの押し出しを端点へ返す |
| 10 | Bone Constraint（コリジョン後） | `BoneConstraintIterationCountAfterCollision` 回。開始時に `Lambda` を 0 に戻すため、コリジョン前の蓄積は引き継がない |
| 11 | `RestoreBoneLengthsAndLimits` | 角度制限、平面制約、長さ復元 |

8 のコリジョンの後に再判定はありません。10 と 11 が位置を変更するため、最終位置が再び形状の内側に入る場合があります。

8 のコリジョンは、形状ごとにループを分けず、ボーンの外側ループ1回で全形状を処理します。ソースコメントによれば、形状ごとに `ModifyBones` を走査するとキャッシュ効率が落ちるためです。形状は次の順に適用されます。

1. ノード直持ちと Data Asset 由来（Sphere、Capsule、TaperedCapsule、Box、Planar）
2. Shared Collision（`bUseSharedCollision` が有効で `bSharedCollisionSource` が無効のとき）
3. Simple World Collision（Sphere、Capsule、TaperedCapsule、Box、地面 Box、Convex）
4. World Collision（`bAllowWorldCollision`）

後の形状は前の形状の押し出し結果から処理を始めるため、この順序は結果に影響します。

各段階の詳細は[ローカルコリジョン](/docs/internals/collision)と[拘束と制限](/docs/internals/constraints-and-limits)を参照してください。

## ボーン1本の積分

<DocFigure src="/img/generated/internals-integrate-order-ja.svg" alt="Simulateの8手順を速度と位置の2レーンで示し、レガシー重力による位置加算を添えた図" caption="上段の風と速度への外力から下段の位置積分、単純外力、World移動、位置への外力、剛性へ番号順に進みます。" maxWidth={960} />

`Simulate` の処理順は次のとおりです。

```text
1. WindVelocity を計算（bEnableWind）
2. ComputeVerletStepVelocity
     Velocity = (Location - PrevLocation) / Max(DeltaTimeOld, KINDA_SMALL_NUMBER)
     PrevLocation = Location
     Velocity *= 1 - Damping
     Velocity += WindVelocity
     Velocity += GravityInSimSpace * StepDt      （レガシー重力は Location へ 0.5 * g * dt^2）
3. 外力の ApplyToVelocity
4. IntegrateVerletStepPosition
     Location += Velocity * StepDt
5. ApplySimpleExternalForce
     Location += SimpleExternalForceInSimSpace * StepDt
6. World 移動の追従
7. 外力の Apply（CustomExternalForces、ExternalForces、一時外力の順）
8. ApplyStiffnessPull
```

速度はメンバとして保存していません。毎ステップ、`Location` と `PrevLocation` の差から再構成します。そのため、`Location` を直接動かす処理（コリジョン、制約、`Apply` 系の外力）はすべて次のステップの速度に反映されます。押し出しで速度が生まれるのはこの仕組みによるものです。

### Damping

`Velocity *= 1 - Damping` はステップごとに適用され、`dt` で正規化しません。固定サブステップでは `dt` が一定なのでフレームレートに依存しません。レガシー経路は、ソースコメントのとおり後方互換のためこの形を維持しており、フレームレート依存が残ります。

### 風

`GetWindVelocity` は `Scene->GetWindParameters` で UE の風を取得します。結果に `GetEffectiveTargetFramerate()` を掛けて、減衰の後の速度へ足します。Gust の倍率と方向ノイズは、同じ `GFrameCounter` の中で最初に風を計算するときに決めて `CachedWindGustFactor` と `CachedWindNoiseRotation` に保存し、以降のサブステップでは同じ値を使います。

### World 移動の追従

`UpdateSkelCompMove` が計算する `SkelCompMoveVector` は、現在の Component から見た `PreSkelCompTransform` の位置に `SkelCompMoveScale` を掛けた値です。これをボーンへ足すと、Component の移動を打ち消してボーンをワールド上の位置に残す向きに働きます。

```cpp
Bone.Location += SkelCompMoveVector * (1.0f - Bone.PhysicsSettings.WorldDampingLocation);
```

`WorldDampingLocation` が 0 ならボーンは慣性でワールドに残ろうとし、1 なら Component と一緒に動きます。回転も同じ構造で、`SkelCompMoveRotation` を `PrevLocation` に適用した差分を足します。

この処理は `SimulationSpace` と Teleport の状態で分岐します。

| SimulationSpace | 追従 |
|---|---|
| `ComponentSpace` | `ApplyWorldMoveFollowNonBaseBone` で適用 |
| `WorldSpace` | 適用しない。位置がワールド座標なので不要 |
| `BaseBoneSpace` | `Simulate` 内で Base Bone 空間へ変換して適用 |

いずれの場合も、`TeleportType` が `TeleportPhysics` のフレームでは適用しません。

### Stiffness

```cpp
const FVector BaseLocation = ParentBone.Location + (Bone.PoseLocation - ParentBone.PoseLocation);
Bone.Location += (BaseLocation - Bone.Location) *
    (1.0f - FMath::Pow(1.0f - Bone.PhysicsSettings.Stiffness, Exponent));
```

目標はアニメーションポーズの絶対位置ではなく、**シミュレーション後の親の位置にポーズの親子オフセットを足した位置**です。`Exponent` は `GetEffectiveTargetFramerate() * GetStepDeltaTime()` で、サブステップでは 1 になります。

`ParentBone.Location` を読むため、親が子より先に処理されている必要があります。この並びの保証は[ボーンモデル](/docs/internals/bone-model)を参照してください。

## 物理設定の計算

各ボーンの `PhysicsSettings` は、ノードの値、カーブ、倍率の積です。

```text
Damping = Clamp(PhysicsSettings.Damping * Curve(LengthRateFromRoot) * Multiplier.Damping, 0, 1)
```

`WorldDampingLocation`、`WorldDampingRotation`、`Stiffness` も同じ形で、`Radius` は 0 以上にクランプします。`LimitAngle` は 0 が「制限なし」を意味するため、制限のあるボーンが倍率で 0 へ落ちて無制限に反転しないよう、`KINDA_SMALL_NUMBER` を下限にします。PerAxis モードでは 0 がロックを意味するため、この下限はありません。

## WarmUp

`WarmUp` は `SimulateModifyBones` を `WarmUpFrames` 回呼びます。固定サブステップが有効なら、各反復がちょうど1ステップになるよう `DeltaTime` を `FixedDt` に差し替え、`SubstepAccumulator` を退避します。

`WarmUp` の間は `IsWarmingUp()` が真を返します。Procedural Wind の共有クロックを `dt` で外挿する経路は、これを見て時間を進めません。Local の時計は WarmUp の間も進みます。

## 結果の出力

<DocFigure src="/img/generated/internals-output-rotation-ja.svg" alt="ModifyBones上の子が1本なら親の回転を2つのベクトルから更新し、子が複数なら親の回転をポーズのまま保ち子の位置を更新する比較図" caption="左はポーズと計算後のベクトル差による親の回転更新、右は親の回転を保った子の位置更新を示します。" maxWidth={960} />

`ApplySimulateResult` はシミュレーション結果を `OutBoneTransforms` に変換します。

1. 全 `ModifyBones` について、`PoseRotation`、`PoseLocation`、`PoseScale` から Component 空間の Transform を作り、同じインデックスで `OutBoneTransforms` に追加します。
2. 親を持つボーンごとに、親の `ChildIndices` が1本以下で親の `BoneRef` が有効なら、ポーズのベクトルとシミュレーション後のベクトルの差から親の回転を計算します。これを `ParentBone.PrevRotation` に保存し、親の出力回転に設定します。2つのベクトルの方向が完全に一致する場合は、このボーンの残りの処理（手順3）を飛ばします。
3. ダミーでない有効なボーンは、`Location` を Component 空間に変換して出力位置に設定します。手順2で飛ばしたボーンは、手順1のポーズの位置のままです。
4. `BoneIndex < 0` の項目（ダミーと LOD で外れたボーン）を除去し、ボーンインデックスでソートします。ソートは `LocalBlendCSBoneTransforms` の要件です。

回転の計算は次の式です。

```cpp
FQuat SimulateRotation = FQuat::FindBetweenVectors(PoseVector, SimulateVector) * ParentBone.PoseRotation;
```

この実装から、出力について次のことが分かります。

- `ModifyBones` 上で複数の子を持つボーンは回転が変わりません。ポーズの回転のままで、子の位置だけが動きます。判定はスケルトンの子の数ではなく `ChildIndices.Num()` です。除外によって子が1本になれば回転の対象になります。
- ボーン軸まわりのねじれはシミュレーションされません。
- ルートボーンは位置が設定されず、ポーズのまま出力されます。回転は子のベクトルから計算されます。
- 末端ボーン自身の回転は、計算に使う子がないためポーズのままです。`DummyBoneLength` のダミーを追加すると、末端ボーンが親となって回転が計算されます。

## シミュレーション空間

`Location`、`PrevLocation`、`PoseLocation`、`PrevRotation`、形状の `Location` と `Rotation` は、すべて `SimulationSpace` の座標です。

| SimulationSpace | 基準 | 用途 |
|---|---|---|
| `ComponentSpace` | Component 空間 | 既定 |
| `WorldSpace` | ワールド空間 | enum のコメントでは、ルートボーンの急な移動の問題を解消するとされている |
| `BaseBoneSpace` | `SimulationBaseBone` の空間 | 指定ボーン基準で揺らす |

空間変換は `FSimulationSpaceCache` が持つ `ComponentToTargetSpace` と `TargetSpaceToComponent` の組を使い、常に Component 空間を経由します。`ConvertSimulationSpaceTransform` などの関数は、評価の冒頭で作ったキャッシュを `GetSimulationSpaceCacheFor` で取得します。キャッシュがない空間の場合は `BuildSimulationSpaceCache` で作り、ログを出力します。

`BaseBoneSpace` では Base Bone が動くと空間自体が動きます。そのため、`Simulate` の回転の追従は前回の空間行列 `PrevBaseBoneSpace2ComponentSpace` を使って計算します。

LOD で `SimulationBaseBone` が Compact Pose から外れた場合は Identity のまま処理を続けます。

## 他機能との関係

- **Inter-Bone ダミーのコリジョン専用モード:** 積分から外れ、実ボーンの間へ Lerp で置かれます。コリジョンの押し出しは、長さ復元の後に再配置されるため、ダミー自身には残りません。
- **Bridge ダミー:** `Simulate` を呼びません。縦の親を持たないため、`ModifyBones[Bone.ParentIndex]` を読むとクラッシュします。
- **一時外力:** 評価につき1回取り込まれ、`Simulate` と `PostApply` に参加します。
- **Sync Bone:** ポーズ取得の直後に `PoseLocation` を変更するため、ポーズ目標の補間の入力になります。

## 変更するときの注意

- **`DeltaTime` を直接読まない。** ステップ内の処理は `GetStepDeltaTime()` を使います。外力も同じです。
- **速度項と位置項を区別する。** `ApplyToVelocity` は減衰と重力の後の速度に作用し、`Apply` は位置を直接変更します。どちらも次のステップの速度に反映されます。
- **`ComputeVerletStepVelocity` を変更したら `Simulate` の呼び出し順も確認する。** 風と `ApplyToVelocity` の位置はこの関数の前提に依存します。
- **ボーンを走査するループでは親が先という前提を維持する。** Bridge ダミーは配列の後方にあり、`ParentIndex` が負です。`Bone.ParentIndex` を読む前に `bBridgeDummy` を確認してください。
- **`Golden` テストと `Simulation` テストを実行する。** 積分順序の変更はほとんどの場合、挙動の変更になります。[テスト](/docs/internals/testing)を参照してください。

## 関連ページ

- [ノードのライフサイクルと1フレームの処理順](/docs/internals/frame-lifecycle)
- [ボーンモデル](/docs/internals/bone-model)
- [拘束と制限](/docs/internals/constraints-and-limits)
- [外力](/docs/internals/external-forces)
- [Fixed Substepping](/docs/advanced/fixed-substepping)
