---
sidebar_position: 8
title: "外力"
description: "外力の3系統の違い、仮想関数の呼び出しタイミングとサブステップ時の回数、組み込み外力の実装、カスタム外力の作り方を説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# 外力

このページでは3系統の外力の違い、各仮想関数がいつ何回呼ばれるか、組み込み外力の実装を説明します。`Simulate` 全体の処理順は[シミュレーション](/docs/internals/simulation)、一時外力の要求側は[ランタイム制御と要求キュー](/docs/internals/runtime-control)を参照してください。

## このページの要点

**概要**

外力は、ボーンの速度や位置へ力を足す処理をノードの外から差し込む拡張点です。ノードに組み込まれた重力や風とは別に、型を追加できる仕組みが3系統あります。C++ の構造体や Blueprint で独自の外力を作ることもできます。

**設計**

3系統は、構造体で持つ外力、UObject で持つ外力、ノードの設定に残らない一時外力で、追加と削除の経路や GC の扱いが異なります。組み込み外力は、時刻の前進と力の計算を `PreApply` に、`dt` を掛ける適用を `Apply` 系の関数に置きます。そのため力はフレームの間固定され、適用だけがステップごとに行われます。これらの関数は Worker で動く場合があるため、必要な値は事前にキャッシュして読むだけにします。

**理解のポイント**

- 仮想関数ごとに、呼ばれる単位と回数が異なります。`dt` の意味も変わり、`PreApply` では通常は実フレーム時間、`Apply` ではステップ幅です。
- 回数はフレームの種類でも変わります。ステップ数が 0 のフレーム、WarmUp、`WorldSpace` の Teleport で何が呼ばれるかを確認してください。
- `ApplyToVelocity` は速度へ、`Apply` は位置へ足すので、同じ力の値でも効き方が異なります。位置へ足した移動は次のステップの速度にも入ります。
- 一時外力と実行時に追加した外力には `Initialize` が呼ばれません。同じ構造体でも、追加の経路によって使える機能が変わります。

<DocFigure src="/img/generated/internals-force-families-ja.svg" alt="CustomExternalForces、ExternalForces、一時外力の追加経路と保持形式、削除条件を並べた比較図" caption="左から3系統の外力を並べ、各列を上から追加経路、保持形式、削除条件の順に読みます。" maxWidth={960} />

## 関連ファイル

| ファイル | 役割 |
|---|---|
| [`Public/ExternalForces/KawaiiPhysicsExternalForce.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/ExternalForces/KawaiiPhysicsExternalForce.h) | 基底 `FKawaiiPhysics_ExternalForce`、`EExternalForceSpace` |
| [`Private/ExternalForces/KawaiiPhysicsExternalForce.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/ExternalForces/KawaiiPhysicsExternalForce.cpp) | 基底の実装。空間変換、`CanApply`、デバッグ描画 |
| [`Private/ExternalForces/KawaiiPhysicsExternalForce_Basic.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/ExternalForces/KawaiiPhysicsExternalForce_Basic.cpp) | 一定方向の力。間隔を指定できる |
| [`Private/ExternalForces/KawaiiPhysicsExternalForce_Curve.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/ExternalForces/KawaiiPhysicsExternalForce_Curve.cpp) | 時間カーブから求める力 |
| [`Private/ExternalForces/KawaiiPhysicsExternalForce_Gravity.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/ExternalForces/KawaiiPhysicsExternalForce_Gravity.cpp) | 重力。組み込みで唯一 `ApplyToVelocity` を実装する |
| [`Private/ExternalForces/KawaiiPhysicsExternalForce_Wind.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/ExternalForces/KawaiiPhysicsExternalForce_Wind.cpp) | Scene の風を読む外力 |
| [`Public/KawaiiPhysicsCustomExternalForce.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsCustomExternalForce.h) | UObject ベースの `UKawaiiPhysics_CustomExternalForce` |
| [`Private/KawaiiPhysicsExternalForcePostApply.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsExternalForcePostApply.h) | `PostApply` の走査と one-shot の削除 |
| [`Private/AnimNode_KawaiiPhysicsSimulation.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsSimulation.cpp) | 各仮想関数の呼び出し元と、一時外力の取り込み |

Procedural Wind も外力の1つですが、規模が大きいため[専用のページ](/docs/internals/procedural-wind)で説明します。

## 設計の要点

### 3つの系統

| | `CustomExternalForces` | `ExternalForces` | `TransientForceStore.Items` |
|---|---|---|---|
| 要素 | `UKawaiiPhysics_CustomExternalForce`（`Instanced` の UObject） | `FInstancedStruct`（`FKawaiiPhysics_ExternalForce` の派生） | `FKawaiiPhysicsTransientExternalForce`（`FInstancedStruct`、寿命、ハンドル） |
| 実装の手段 | Blueprint または C++ | C++ | C++（`ExternalForces` と同じ構造体） |
| 追加の経路 | ノードの設定 | ノードの設定、`AddExternalForce`、AnimNotify | 要求キューから Worker が取り込む |
| 削除の経路 | ノードの設定 | `RemoveExternalForcesOnComponent`、one-shot | 寿命、ハンドルでの停止、上限超過 |
| 呼ばれる関数 | `PreApply`、`Apply` | `Initialize`、`PreApply`、`ApplyToVelocity`、`Apply`、`PostApply` | `PreApply`、`ApplyToVelocity`、`Apply`、`PostApply` |
| 空間とボーンフィルタ | 実装側で処理する | 基底クラスの機能を使える | `ExternalForces` と同じ |
| GC | `UPROPERTY` で追跡される | `UPROPERTY` で追跡される | 追跡されない |

`CustomExternalForces` はヘッダで EXPERIMENTAL とされています。`Apply` は `FKawaiiPhysicsModifyBone` を受け取らず、`ModifyBoneIndex` からノードの `ModifyBones` を読み書きします。`UKawaiiPhysics_CustomExternalForce` は `FKawaiiPhysics_ExternalForce` を継承しないため、`ExternalForceSpace`、`ApplyBoneFilter`、`bIsOneShot` はありません。

`ExternalForces` は `meta=(BaseStruct="/Script/KawaiiPhysics.KawaiiPhysics_ExternalForce", ExcludeBaseStruct)` を持つので、派生構造体はエディタの型選択に現れ、基底そのものは選べません。

一時外力は `ExternalForces` と同じ構造体を、ノードの設定に残らない別の配列で持ちます。Worker 専用の `Items` と任意スレッド用のキューに分かれており、`Items` へ直接書き込むのは Worker だけです。一方、`UKawaiiPhysicsLibrary::AddExternalForce` はキューを使わず `ExternalForces` へ直接 `Add` します。

### スレッド

`Initialize` は `Initialize_AnyThread` から、それ以外の仮想関数は `EvaluateSkeletalControl_AnyThread` の中から呼ばれます。どちらもアニメーションの Worker で動く場合があります。`UKawaiiPhysics_CustomExternalForce` のヘッダは、Blueprint の実装でもアクターのスポーンや破棄、レイキャスト、UObject のライフサイクルに触れないよう求めています。必要な値は事前にキャッシュして読むだけにします。

## 処理の流れ

<DocFigure src="/img/generated/internals-force-eval-flow-ja.svg" alt="一時外力の取り込み、WarmUp と Teleport の分岐、ステップとボーンごとの外力フックの順序" caption="WarmUp と Teleport の分岐を経て外力フックをたどります。PostApply 後は Constraint（衝突前）、コリジョン、Bridge の変位転送、Constraint（衝突後）、制限・長さ復元の順です。各 Constraint は設定された反復回数だけ処理します。" maxWidth={960} />

3系統の順序はどの呼び出しでも同じです。`CustomExternalForces`、`ExternalForces`、一時外力の順に呼びます（Custom に対応する関数がない場合は省きます）。

### 関数ごとの呼び出し回数

| 関数 | 呼び出し元 | 回数 | `bIsEnabled` の判定 | 対象 |
|---|---|---|---|---|
| `Initialize` | `Initialize_AnyThread` | ノード初期化につき1回 | なし | `ExternalForces` のみ |
| `PreApply` | `SimulateModifyBones` | `SimulateModifyBones` 1回につき1回 | なし | 3系統すべて |
| `ApplyToVelocity` | `Simulate` | ステップごと、ボーンごと | あり | `ExternalForces`、一時外力 |
| `Apply` | `Simulate` | ステップごと、ボーンごと | あり | 3系統すべて |
| `PostApply` | `SimulateOnce` | ステップごとに1回 | なし | `ExternalForces`、一時外力 |

`PreApply` と `PostApply` は無効な外力にも呼ばれます。Procedural Wind は無効の間も `PreApply` で要求の取り込みと時刻の更新を続けます。無効な one-shot は `Apply` を通らないまま、最初の `PostApply` で削除されます。

ステップ内の対象ボーンは `Simulate` が呼ばれるボーンだけです。`bSkipSimulate` のボーン（ルートを含む）、コリジョン専用モードの Inter-Bone ダミー、Bridge ダミーは含みません。

### フレームごとの呼び出し回数

<DocFigure src="/img/generated/internals-force-timing-ja.svg" alt="有効な継続外力について、3サブステップと0ステップのフレームでのフック呼び出しを比較したタイムライン" caption="上段はPreApplyが1回、適用が対象ボーンごとに3回、PostApplyが3回で、下段の0ステップではPreApplyだけが呼ばれます。" maxWidth={960} />

`NumSteps` は固定サブステップのアキュムレータが決める 0 以上 `MaxSubsteps` 以下の値です。次の表は WarmUp を除いた通常処理の回数です。

| フレームの種類 | `PreApply` | `ApplyToVelocity` / `Apply`（1ボーンあたり） | `PostApply` |
|---|---|---|---|
| レガシー経路 | 1 | 1 | 1 |
| 固定サブステップ | 1 | `NumSteps` | `NumSteps` |
| 固定サブステップで `NumSteps` が 0 | 1 | 0 | 0 |
| `SimulationSpace` が `WorldSpace` の Teleport | 0 | 0 | 0 |
| `DeltaTime <= 0` | 0 | 0 | 0 |

WarmUp が走るフレームでは、通常処理の前に `SimulateModifyBones` が `WarmUpFrames` 回呼ばれ、表の回数に次の分が加わります。各反復は1ステップなので、`PreApply`、`ApplyToVelocity` / `Apply`、`PostApply` がそれぞれ `WarmUpFrames` 回増えます。

| 条件 | WarmUp の追加分 |
|---|---|
| `WorldSpace` の Teleport | 走る。Teleport の分岐は WarmUp のあとにある |
| `DeltaTime <= 0`、固定サブステップ | 走る。`WarmUp` が `DeltaTime` を `FixedDt` へ差し替える。通常処理は元の `DeltaTime` で早期 return する |
| `DeltaTime <= 0`、レガシー経路 | 走らない。各反復が `SimulateModifyBones` の先頭で return する |

`PreApply` はサブステップの外で呼ばれるため、`bInSubstep` は false で `GetStepDeltaTime()` は `DeltaTime` を返します。したがって `PreApply` の中の `dt` は実フレーム時間（WarmUp の固定サブステップでは `FixedDt`）で、`Apply` の中の `dt` はステップ幅です。組み込み外力はこの差に沿って、時刻の前進と `Force` の計算を `PreApply` に、`dt` を掛ける適用を `Apply` に置いています。`Force` はフレームの間固定されるので、サブステップ間で変わりません。

`NumSteps` が 0 のフレームでは、時刻だけが進み力は掛かりません。Basic の `Interval` は `Time > Interval` を満たしたフレームだけ `Force` を非ゼロにするため、そのフレームの `NumSteps` が 0 だとその回の力は適用されません。one-shot は `PostApply` が走らないので配列に残り、次のフレームに持ち越されます。

`PreApply` は `MaxSubsteps` による時間のクランプより前に走ります。`MaxSubsteps * FixedDt` を超える長いフレームでは、物理はクランプ後の時間しか進みませんが、外力の時刻は実フレーム時間ぶん進みます。一時外力の `RemainingLifetime` も同じく評価時の `DeltaTime` で減ります。

### 速度項と位置項

`Simulate` の中で `ApplyToVelocity` は減衰、風、重力のあと、位置の積分の前に呼ばれます。`Apply` は位置の積分、`SimpleExternalForce`、World 移動の追従のあと、Stiffness の前に呼ばれます。

`ApplyToVelocity` の `InOutVelocity` は、減衰と風と重力を含む実際の速度です。ただし `bUseLegacyGravity` のときは、重力が `ComputeVerletStepVelocity` の中で `Bone.Location` へ足されるので、速度には重力が含まれません。`KawaiiPhysics.Simulation.IntegrationCore` が両方の場合の戻り値を固定しています。

`Apply` が動かした `Location` も、速度は `(Location - PrevLocation) / DeltaTimeOld` で再構成されるため、次のステップの速度に入ります。そのため同じ `Force` の値でも効き方が異なります。

```text
ApplyToVelocity  Velocity += Force * dt
Apply            Location += Force * dt
```

`DeltaTimeOld` と `dt` が等しい固定サブステップでは、ステップあたりの速度の増分は `ApplyToVelocity` が `Force * dt`、`Apply` が `Force` です。組み込みでは Gravity だけが `ApplyToVelocity` を実装し、`Apply` を空にしています。

## 基底クラスの共通処理

### 空間

`EExternalForceSpace` は力のベクトルの座標系を表します。変換は `ConvertExternalForceToSimulationSpace` が `PreApply` の中で行います。

| `ExternalForceSpace` | `PreApply` でキャッシュする値 | `Apply` での扱い |
|---|---|---|
| `WorldSpace`（既定） | `SimulationSpace` へ変換した値 | そのまま使う |
| `ComponentSpace` | `SimulationSpace` へ変換した値 | そのまま使う |
| `BoneSpace` | ボーンローカルのままの値 | `BoneTM.TransformVector` で1回だけ変換する |

`Simulate` は `BoneSpace` の外力にだけ `ResolveExternalForceBoneTransform` の結果を渡します。それ以外の外力の `BoneTM` は既定値の `FTransform::Identity` です。`CustomExternalForces` には空間の概念がないので、常に計算して渡します。

`ResolveExternalForceBoneTransform` は、ダミーボーンでは実親（`InterBoneRealParentIndex`、無効なら `ParentBone`）の Transform を使い、LOD などで Compact Pose から外れたボーンでは Identity を返します。`TransformVector` なのでボーンのスケールも力に乗ります。

Gravity と Wind はコンストラクタで `bCanSelectForceSpace = false` にして `WorldSpace` に固定します。

### ボーンフィルタ

`CanApply` は `ApplyBoneFilter` が空でなければ含まれるボーンだけを通し、`IgnoreBoneFilter` に含まれるボーンを除きます。ノードはこの判定を行わないので、派生クラスが自分で呼びます。Basic、Curve、Gravity、Procedural Wind は適用の先頭で、Wind は `PreApply` のキャッシュ作成時に呼びます。

### 乱数スケール

基底の `PreApply` は `ComponentTransform` を保存し、`RandomForceScaleRange` から `RandomizedForceScale` を決めます。値は `PreApply` のたびに `FMath::RandRange` で引き直し、グローバルの乱数列を消費します。`bSupportsRandomForceScaleRange` が false の外力は乱数を使わず 1 に固定します。

## 組み込み外力の実装

| 構造体 | 適用先 | `PreApply` で決める値 |
|---|---|---|
| `FKawaiiPhysics_ExternalForce_Basic` | `Apply` | `Force` |
| `FKawaiiPhysics_ExternalForce_Curve` | `Apply` | `Force` |
| `FKawaiiPhysics_ExternalForce_Gravity` | `ApplyToVelocity` | `Force` |
| `FKawaiiPhysics_ExternalForce_Wind` | `Apply` | ボーンごとの `CachedWindDirection`、`CachedWindSpeed` |

4種とも `ForceRateByBoneLengthRate` を持ち、`Bone.LengthRateFromRoot` で評価した値を力に掛けます。カーブが空なら 1.0 です。

**Basic** は `ForceDir * RandomizedForceScale` を `Force` にします。`Interval` が正のときは `Time` に実フレーム時間を足し、`Time > Interval` を満たしたフレームだけ力を出して `Time` を `Fmod` で巻き戻します。それ以外のフレームの `Force` はゼロです。

**Curve** は `Time` を `dt * TimeScale` で進め、`ForceCurve` を評価します。`MaxCurveTime` が正なら `Time` をその範囲に巻き戻します。`InitMaxCurveTime` は、現在の `MaxCurveTime` と X、Y、Z カーブの最終キーの時刻の最大値で `MaxCurveTime` を更新します。事前に値を戻さないので、カーブの終端を短くしても `MaxCurveTime` は縮みません。この関数は `Initialize` の中で呼ばれ、`WITH_EDITOR` のビルドでは `PreApply` のたびにも呼ばれます。`CurveEvaluateType` が `Single` 以外のときは、フレーム時間を `SubstepCount`（最低1）で分割して評価し、平均、最大、最小を取ります。この `SubstepCount` はカーブ評価の分割数で、ノードのサブステップとは関係ありません。

**Gravity** の `Force` の基準は長さ1の方向です。既定は `(0, 0, -1)` で、`bUseOverrideGravityDirection` なら `OverrideGravityDirection.GetSafeNormal()` を使います。`Initialize` で `OwnerCharacter` が取得できていれば、UE 5.3 以降の `bUseCharacterGravityDirection` は `GetGravityDirection()` で方向を上書きし、`bUseCharacterGravityScale` は `GetCharacterMovement()->GetGravityZ()` を掛けます。最後に `RandomizedForceScale` を掛けて `SimulationSpace` へ変換します。

**Wind** は `PreApply` で全ボーンを走査し、`Scene->GetWindParameters` の結果を `ModifyBones` のインデックスをキーにしてキャッシュします。問い合わせ位置は `Bone.PoseLocation` を `ConvertSimulationSpaceVector` で World へ変換した値です。この関数は `TransformVector` を使うので平行移動を含まず、`SimulationSpace` が `WorldSpace` なら変換しません。ノード組み込みの `GetWindVelocity` は `ConvertSimulationSpaceLocation` を使います。`CanApply` を通らないボーンの `CachedWindSpeed` は負の値のままで、`Apply` はこれをスキップします。

Wind のキャッシュはソースコメントに理由があります。Scene の問い合わせをフレーム1回にするのは、固定サブステップ時に Worker から毎ステップ Scene を触らないためです。`WindDirectionNoiseAngle` の `VRandCone` も `PreApply` で1回だけ適用し、ノイズの分散がステップ数に依存しないようにしています。キーがボーン名でないのは、ダミーボーンの `BoneRef` が空で `NAME_None` が衝突するためです。

## PostApply と one-shot

`bIsOneShot` が立った外力は、最初の `PostApply` のあとに `ExternalForces` から削除されます。`UAnimNotify_KawaiiPhysicsAddExternalForce` はこの形で外力を追加します。削除は最初のステップの直後なので、one-shot の力はフレームのサブステップ数に関係なく1ステップ分だけ掛かります（`NumSteps` が 0 のフレームでは残ります）。

基底の `FKawaiiPhysics_ExternalForce::PostApply` は、`bIsOneShot` のとき private の `bRemovalRequestedAfterPostApply` を立てるだけです。実際の削除は `FKawaiiPhysicsExternalForcePostApply::Apply` が、仮想関数から戻ったあとに行います。ヘッダのコメントとテストのとおり、派生クラスが基底の `PostApply` を呼んだあとも自分のメンバを読めるようにするためです。

走査の手順は次のとおりです。

1. 要素の `FKawaiiPhysics_ExternalForce*` を取得します。無効な要素は飛ばします。
2. `bRemovalRequestedAfterPostApply` を false に戻して `PostApply` を呼びます。
3. 配列の同じ位置に同じ外力がなければ、配列全体から探し直します。コールバックが自分や前の要素を消したり、配列を動かしたりする場合に備えた処理です。
4. 外力が見つかり削除要求が立っていれば `RemoveAt` し、削除した位置から走査を再開します。

コールバック中に配列の末尾へ追加された要素は、通常は同じ走査で処理されます。ヘッダのコメントは、コールバックが作業リストを無限に増やさないことを呼び出し側に求めています。

インデックスを補正するのは、この走査が削除を行ったときだけです。コールバックが削除要求を使わず、自分や前の要素を配列から直接消すと、後ろの要素が前へ詰まったままインデックスが進みます。その要素は今回の走査で処理されません。

`Apply` がテンプレートなのは、テストが `FInstancedStruct` を使わず、`TUniquePtr` の配列で同じ走査を確かめるためです（ヘッダのコメントより）。一時外力の `PostApply` はこの経路を通らず、`SimulateOnce` のループから直接呼ばれます。一時外力の `bIsOneShot` は取り込み時に false へ書き換えられるため、削除要求は発生しません。

## 一時外力の適用

要求側の処理は[ランタイム制御と要求キュー](/docs/internals/runtime-control)が扱います。ここでは `Items` へ入ったあとの扱いを説明します。

`ConsumeAndRemoveExpiredTransientExternalForces` は、ルートボーンの検証を通過した評価につき1回、WarmUp と Teleport の分岐より前に呼ばれます。ソースコメントのとおり、WarmUp の反復や Teleport による `SimulateModifyBones` のスキップに左右されないようにするためです。`RootBone` か `AdditionalRootBones` が `IsValidToEvaluate` を満たさない評価は、この関数より前に return するので、取り込みも寿命の消費も行われません。この関数はまず既存の要素の `RemainingLifetime` から `DeltaTime` を引いて寿命切れを消し、そのあとでキューの要素を取り込みます。取り込んだフレームの寿命は減りません。

`Items` に入った外力は、`ExternalForces` と同じ関数を同じ順序のループで呼ばれます。Gust も `FKawaiiPhysics_ExternalForce_ProceduralWind` の要素として `Items` に入るので、適用の経路は他の一時外力と同じです。空間の扱いと `CanApply` も変わりません。`ExternalForces` との違いは次の点です。

- **`Initialize` が呼ばれません。** Gravity の `OwnerCharacter` は null のままなので、`bUseCharacterGravityDirection` と `bUseCharacterGravityScale` は効きません。Curve の `MaxCurveTime` は `WITH_EDITOR` でないビルドでは 0 のままで、`Time` は巻き戻りません。ヘッダのコメントもこの制限に触れており、Procedural Wind は `PreApply` で `RuntimeState` を確保するため安全としています。
- **UObject の強参照を持てません。** `Items` は GC に追跡されないため、Library の API は受け付け時に `CanQueueTransientExternalForce` で外力を検査します。`UPROPERTY` を配列、Set、Map、入れ子の構造体、`FInstancedStruct` まで再帰的に調べ、`ExternalOwner` やカーブアセットのような非 null の Object 参照と Interface 参照を拒否します。Soft、Weak、Lazy 参照は通します。`UPROPERTY` でないメンバは検査しません。`RequestTransientExternalForce` を直接呼ぶ場合は検査がなく、ヘッダのコメントが参照の生存の保証を呼び出し側に求めています。
- **上限があります。** `Items` が `MaxTransientExternalForces`（8）を超えると、古い順に破棄します。
- **エディタの矢印に出ません。** `FKawaiiPhysicsEditMode::RenderExternalForces` は `ExternalForces` だけを走査します。

`ExternalForces` への追加でも `Initialize` は呼ばれません。`Initialize` を呼ぶのは `Initialize_AnyThread` のループだけなので、`AddExternalForce` や AnimNotify で実行中に追加した外力にも上の1項目めと同じ制限があります。

## 組み込み風、SimpleExternalForce との関係

ノードには、外力の仕組みを通らない入力もあります。`Gravity`、`bEnableWind`、`SimpleExternalForce` です。いずれもフィルタと `ForceRateByBoneLengthRate` の対象外で、`ExternalForces` とは独立に加算されます。たとえば `bEnableWind` と Wind 外力を同時に有効にすると、両方の力が掛かります。

風に関わる経路を並べると次のとおりです。`bEnableWind` の詳細は[シミュレーション](/docs/internals/simulation)を参照してください。

| | `bEnableWind` | `SimpleExternalForce` | Wind 外力 | Procedural Wind |
|---|---|---|---|---|
| 入力 | Scene の風 | ノードのベクトル | Scene の風 | パラメータからの合成 |
| 適用先 | 減衰後の速度 | 積分直後の位置 | `Apply` で位置 | `Apply` で位置 |
| Scene の問い合わせ | ボーンごと、ステップごと | なし | ボーンごと、フレーム1回 | なし |
| 方向のノイズ | フレーム1回の回転を全ボーンで共有 | なし | ボーンごとに `VRandCone` | Seed から求める滑らかなノイズ |
| 強さの揺らぎ | `FRandRange(0, 2)` をフレーム1回 | なし | `RandomForceScaleRange` | Random、Gust など |

`bEnableWind` の速度の寄与は `WindDirection * WindSpeed * WindScale * Gust * TargetFramerate` です。Wind 外力は `TargetFramerate` を掛けず、`WindDirection * WindSpeed * ForceRate * RandomizedForceScale * dt` を位置へ足します。同じ風でも大きさが揃わないので、片方からもう片方へ置き換えるときは値の調整が必要です。

`SimpleExternalForce` は `SimulateModifyBones` で `SimulationSpace` のベクトルへ1回だけ変換し、`ApplySimpleExternalForce` が `dt` を掛けて位置へ足します。ソースコメントでは World 移動や Stiffness と同じ位置空間の後処理と位置づけられています。

## 状態とライフサイクル

| イベント | `ExternalForces` | 一時外力 | 外力の内部時刻 |
|---|---|---|---|
| `Initialize_AnyThread` | 要素は残り、`Initialize` が呼ばれる | `ResetTransientRuntimeState` が `Items` とキューを破棄する | Procedural Wind は `ResetRuntimeState` で初期化する。Basic と Curve の `Time` は戻さない |
| `ResetDynamics` | 変更なし | 変更なし | 変更なし。`bUseWarmUpWhenResetDynamics` なら WarmUp が予約される |
| `ETeleportType::ResetPhysics` | 変更なし | 変更なし | 変更なし。`ModifyBones` だけが作り直される |
| `WorldSpace` の Teleport | WarmUp の分を除き `PreApply` が走らない | 取り込みと寿命の消費は走る | WarmUp の分を除き進まない |
| 評価されないフレーム、ルート検証で return する評価 | 何も呼ばれない | 取り込みも寿命の消費も止まる。キューは上限まで溜まる | 進まない |
| LOD でボーンが外れる | `BoneTM` が Identity になる | 同左 | 影響なし |

`FKawaiiPhysicsTransientForceStore` のコピーコンストラクタは独立した空のストアを作ります（`KawaiiPhysics.TransientForce.StoreCopyIsIndependent`）。コピー代入は何も変更せず、代入先の `Items` とキューを保持します。どちらの場合も一時外力は複製されません。

Wind 外力のキャッシュは `PreApply` のたびに作り直すので、`ModifyBones` の再構築の影響を受けません。

## 他機能との関係

- **Bone Subdivision とダミーボーン:** ダミーも `Simulate` が呼ばれる限り `Apply` の対象で、`LengthRateFromRoot` を持ちます。`BoneRef` が空なので、ボーン名をキーにする処理は衝突します。デバッグ用の `BoneForceMap` はボーン名がキーのため、ダミーの値は1つにまとまります。
- **固定サブステップ:** 上の回数の表のとおりです。`Force` はフレームで固定され、適用だけがステップごとに行われます。
- **Stiffness:** `Apply` の直後に `ApplyStiffnessPull` が走るので、`Stiffness` が正なら `Apply` の移動量の一部はそのステップのうちに引き戻されます。
- **コリジョンと Bone Constraint:** どちらも `Simulate` の全ボーン処理と `PostApply` のあとです。外力でコリジョンの内側へ入ったボーンは同じステップで押し出されます。ソースコメントのとおり `PostApply` はコリジョンの limit を書き換えてよく、`PrepareCollisionShapeCaches` はそのあと毎ステップ計算します。
- **AnimNotify:** `UAnimNotify_KawaiiPhysicsAddExternalForce` は one-shot として追加します。`UAnimNotifyState_KawaiiPhysicsAddExternalForce` は開始時に自身を `ExternalOwner` として追加し、終了時に `RemoveExternalForcesOnComponent` で削除します。
- **プロパティアクセス API:** `SetExternalForceWildcardProperty` などは `ExternalForces` のインデックスを指定します。one-shot の削除や `RemoveExternalForcesOnComponent` で要素が詰まるので、インデックスを長く保持する場合は位置がずれます。
- **Preset Data Asset:** `ExternalForces` と `CustomExternalForces` はプリセットのコピー対象で、`CustomExternalForces` は `DuplicateObject` で複製されます。適用するのは `ApplyToNode` に `TargetOuter` を渡す経路（エディタのグラフノードへの適用）だけです。ランタイムの `UKawaiiPhysicsLibrary::ApplyPresetDataAsset` は `TargetOuter` が null なので、両方の配列を飛ばします。詳細は[Data Asset とプリセット](/docs/internals/presets-and-data-assets)を参照してください。

## カスタム外力を自作する

C++ で作る場合は `FKawaiiPhysics_ExternalForce` の派生 `USTRUCT` を定義します。これだけで `ExternalForces` の型選択に現れ、Library の API からも扱えます。

1. `USTRUCT(BlueprintType)` で派生構造体を定義します。空間を固定する場合は、コンストラクタで `bCanSelectForceSpace = false` にします。
2. `PreApply` をオーバーライドして `Super::PreApply` を呼び、フレーム単位の値を計算します。
3. 位置へ作用させるなら `Apply`、速度へ作用させるなら `ApplyToVelocity` をオーバーライドします。先頭で `CanApply` を呼びます。
4. 終了時の処理が必要なら `PostApply` をオーバーライドし、`Super::PostApply` を呼びます。

```cpp
USTRUCT(BlueprintType, DisplayName = "My Force")
struct FMyExternalForce : public FKawaiiPhysics_ExternalForce
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "My Force")
	FVector Direction = FVector::ForwardVector;

	virtual void PreApply(FAnimNode_KawaiiPhysics& Node, FComponentSpacePoseContext& PoseContext) override
	{
		Super::PreApply(Node, PoseContext);
		Force = ConvertExternalForceToSimulationSpace(Node, PoseContext, Direction * RandomizedForceScale);
	}

	virtual void Apply(FKawaiiPhysicsModifyBone& Bone, FAnimNode_KawaiiPhysics& Node,
	                   FComponentSpacePoseContext& PoseContext,
	                   const FTransform& BoneTM = FTransform::Identity) override
	{
		if (!CanApply(Bone))
		{
			return;
		}

		const FVector BoneForce = ExternalForceSpace == EExternalForceSpace::BoneSpace
			? BoneTM.TransformVector(Force)
			: Force;
		Bone.Location += BoneForce * Node.GetStepDeltaTime();
	}
};
```

実装するときは次の点に注意してください。

- **`Super::PreApply` を呼びます。** 呼ばないと `RandomizedForceScale` は既定値の 0 のままです。
- **`Super::PostApply` を呼びます。** 呼ばないと one-shot が削除されません（`KawaiiPhysics.ExternalForce.OneShot.DerivedLifetimeAndOrder`）。
- **`dt` は `GetStepDeltaTime()` から取ります。** `DeltaTime` を直接使わないでください。ただし `PreApply` の中では実フレーム時間になります。
- **`Force` を `PreApply` で決めます。** `Apply` はステップごと、ボーンごとに呼ばれます。乱数や Scene の問い合わせを `Apply` に置くと、結果がステップ数に依存します。
- **`BoneTM` は `BoneSpace` のときだけ使います。** それ以外では Identity が渡されます。
- **`Initialize` に頼りません。** 実行時の追加と一時外力では呼ばれません。必要な準備は `PreApply` で遅延して行います。
- **ボーンごとのキャッシュは `Bone.Index` で引きます。** ダミーボーンの `BoneRef` は空です。
- **一時外力として使うなら UObject の強参照を null にします。** 非 null の `UPROPERTY` は `CanQueueTransientExternalForce` に拒否されます。

Blueprint で作る場合は `UKawaiiPhysics_CustomExternalForce` を継承します。`PreApply_Implementation` は `PURE_VIRTUAL`、`Apply_Implementation` は空の実装なので、`PreApply` は必ず実装してください。

## 変更するときの注意

- **外力の配列はインデックスで走査します。** ソースコメントのとおり、ループ中に配列が変化する場合があるため ranged-for を使いません。
- **`PreApply` の回数を前提にしたコードを増やさないでください。** WarmUp では1回の評価で複数回走り、`WorldSpace` の Teleport では WarmUp の分を除いて走りません。永続的な時刻を持つ外力は `Node.IsWarmingUp()` を確認できます。
- **`BoneSpace` の変換は1回だけです。** `PreApply` でも変換すると二重になります。`KawaiiPhysics.ExternalForce.BasicBoneSpaceSingleTransform` と `KawaiiPhysics.ExternalForce.CurveBoneSpaceSingleTransform` が守っています。
- **`Simulate` の呼び出し位置は `ComputeVerletStepVelocity` の前提に依存します。** ソースコメントも、この関数を変更したら `wind` と `ApplyToVelocity` の位置を確認するよう求めています。`KawaiiPhysics.Simulation.IntegrationCore` を実行してください。
- **削除は仮想関数から戻ったあとに行います。** `FKawaiiPhysicsExternalForcePostApply` を変更する場合は `KawaiiPhysics.ExternalForce.OneShot.AdjacentInstances`、`DerivedLifetimeAndOrder`、`CallbackMutation`、`PreviousRemoval` を実行してください。
- **一時外力の取り込みは評価につき1回までです。** ヘッダのコメントも Worker 専用で評価ごとに1回と定めています。寿命と上限は `KawaiiPhysics.TransientForce.GustLifetime` と `KawaiiPhysics.TransientForce.CapDropsOldest` が守っています。

## 関連ページ

- [シミュレーション](/docs/internals/simulation)
- [ノードのライフサイクルと1フレームの処理順](/docs/internals/frame-lifecycle)
- [Procedural Wind](/docs/internals/procedural-wind)
- [ランタイム制御と要求キュー](/docs/internals/runtime-control)
- [ボーンモデル](/docs/internals/bone-model)
- [外部力プリセット](/docs/features/external-force-presets)
- [風と外部力](/docs/features/wind-and-forces)
- [外部力パラメータ](/docs/parameters/external-forces)
- [Fixed Substepping](/docs/advanced/fixed-substepping)
