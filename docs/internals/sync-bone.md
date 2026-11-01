---
sidebar_position: 7
title: "Sync Bone"
description: "Sync Bone のデータ構造、初期化、移動量の計算、ポーズ目標への適用と、他の処理との実行順序の関係を説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# Sync Bone

このページでは、Sync Bone が書き換えるデータと、その変更が後続の処理へどう伝わるかを説明します。設定方法は [Sync Bone](/docs/features/sync-bone) を参照してください。

## このページの要点

**概要**

Sync Bone は、同期元のボーンが参照ポーズからどれだけ動いたかを計算し、その移動量を物理ボーンのポーズ目標へ加えます。脚の動きに合わせてスカートの目標形状をずらすことで、物理ボーンを脚の動く方向へ誘導します。

**設計**

ターゲットへの適用で書き換えるのは `PoseLocation` だけで、物理ボーンの `Location` は動かしません。物理の目標を動かす処理なので、移動は Stiffness、角度制限、長さ復元を通じて間接的に現れます。適用は評価ごとに1回、ポーズ取得の直後に行い、サブステップの補間の終点にも結果が入ります。ターゲットは `ModifyBones` の構築時に解決し、インデックスで参照します。

**理解のポイント**

- 目標の変更と実際の動きを分けて読みます。後続の処理が `PoseLocation` をどう読むかで、移動の現れ方が決まります。
- 移動量は参照ポーズからの位置の差分で、同期元の回転は読みません。ポーズは毎フレーム取り直されるので、通常は全量を適用しても累積しません。
- 親を持つターゲットは、通常は親からの距離を保って動きます。子を自動展開した範囲では親から子の順に適用し、子は親の更新後のポーズを読みます。同期元や手動で設定したターゲットの間の順序は、それぞれの配列の順です。
- Bone Subdivision で作られるダミーはターゲットになりません。適用の後に、実端点からポーズを再計算します。

<DocFigure src="/img/generated/internals-sync-bone-flow-ja.svg" alt="同期元の移動量から PoseLocation を更新し、Stiffness、角度制限、長さ復元、出力へ伝わる流れ" caption="同期元の参照ポーズからの移動量を調整してターゲットへ適用し、同期後のポーズが下段の4処理の基準になります。" maxWidth={960} />

## 関連ファイル

| ファイル | 役割 |
|---|---|
| [`Public/KawaiiPhysicsSyncBone.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsSyncBone.h) | `FKawaiiPhysicsSyncBone`、`FKawaiiPhysicsSyncTargetRoot`、`FKawaiiPhysicsSyncTarget`、`ESyncBoneDirection` |
| [`Private/KawaiiPhysicsSyncBone.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsSyncBone.cpp) | `FKawaiiPhysicsSyncTarget::Apply`、`UpdateScaleByLengthRate`、デバッグ描画 |
| [`Private/AnimNode_KawaiiPhysicsSyncBone.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsSyncBone.cpp) | `InitSyncBones`、`CollectSyncBoneChildTargets`、`ApplySyncBones`、`UpdateSubdivisionDummyPoseAfterSyncBones` |

## 設計の要点

### ターゲットへの適用は PoseLocation だけ

`FKawaiiPhysicsSyncTarget::Apply` が変更するデータは `FKawaiiPhysicsModifyBone::PoseLocation` だけです。`Location`、`PrevLocation`、`PoseRotation` は変更しません。物理ボーンを直接動かす処理ではなく、物理の目標を動かす処理です。そのため、移動は Stiffness、角度制限、長さ復元を通じて間接的に現れます。

適用の後で走る `UpdateSubdivisionDummyPoseAfterSyncBones` は、ダミーの `PoseLocation`、`PoseRotation`、`PoseScale` を再設定します。実ボーンの回転とスケールは変わりません。

同期元の回転は読みません。適用するのは、同期元の位置の差分による並進だけです。

### 実行タイミング

`ApplySyncBones` は評価ごとに1回、`UpdateModifyBonesPoseTransform` の直後に走ります。

<DocFigure src="/img/generated/internals-sync-bone-timing-ja.svg" alt="ポーズ取得から Sync Bone 適用、ダミーポーズ更新、Component 移動量、WarmUp、同期後ポーズの退避とサブステップ補間までの実行順序" caption="番号順に上段から下段へ読み、ダミーポーズ更新は ApplySyncBones 内、目標の退避と補間は SimulateModifyBones 内にあることを示します。通常シミュレーションを行う経路で、WorldSpace の Teleport 時は手順6以降をスキップします。" maxWidth={960} />

`SimulateModifyBones` が `CurrentPoseLocation` へ退避する値は Sync Bone の適用後です。サブステップのポーズ補間の終点にも Sync Bone の結果が入ります。サブステップごとに再計算はしません。

### データ構造

```text
FAnimNode_KawaiiPhysics::SyncBones
└─ FKawaiiPhysicsSyncBone            同期元1本。Bone、GlobalScale、方向、距離減衰
   └─ TargetRoots
      └─ FKawaiiPhysicsSyncTargetRoot    適用先のルート。Bone、bIncludeChildBones、カーブ
         └─ ChildTargets
            └─ FKawaiiPhysicsSyncTarget  展開された子。ModifyBoneIndex のみで参照
```

`FKawaiiPhysicsSyncTargetRoot` は `FKawaiiPhysicsSyncTarget` の派生です。どちらも `ModifyBones` のインデックス `ModifyBoneIndex` を持ち、`Apply` で同じ処理を行います。

## 初期化

`InitSyncBones` は `ModifyBones` の構築直後に呼ばれます。`InitBoneConstraints` より前なので、Bridge ダミーはまだ存在しません。

`InitSyncBone` は同期元ごとに次の処理を行います。

1. `Bone` を初期化します。評価できない場合は `InitialPoseLocation` を 0 にして終了します。ターゲットの解決も行いません。
2. 参照ポーズでの Component 空間の位置を `InitialPoseLocation` に保存します。
3. `IsValid` が偽のターゲットを `TargetRoots` から削除します。
4. 残りのターゲットについて、`BoneRef` が一致する `ModifyBones` の要素を探し、最初に一致した要素を `ModifyBoneIndex` に設定します。
5. 見つかって `bIncludeChildBones` が有効なら、`CollectSyncBoneChildTargets` で子を展開します。

手順 3 はノードの `TargetRoots` 配列そのものを変更します。

### 子ターゲットの展開

`CollectSyncBoneChildTargets` は `ChildIndices` をスタックでたどります。親が取り出された後に子が積まれるので、`ChildTargets` の中では親が子より先に並びます。`Apply` はこの順序で親の更新後の位置を読みます。

`IsExcludedFromSyncBoneChildTarget` が真の点は、たどりますがターゲットに入れません。

| 点 | ターゲット |
|---|---|
| 実ボーン | なる |
| 直接の末端ダミー | なる |
| Inter-Bone ダミー | ならない |
| 分割された末端ダミー | ならない |
| Bridge ダミー | `ChildIndices` に現れないので到達しない |

ソースコメントのとおり、`BoneSubdivision` のダミーは内部計算用の点なので、ターゲットやエディタのプレビューとして公開しません。

`LengthRateFromSyncTargetRoot` は、ターゲットのルートからの長さの割合です。

```text
LengthRate = (LengthFromRoot - StartLength) / (MaxLength - StartLength)
```

`MaxLength` はターゲットになった点の `LengthFromRoot` の最大値です。分母が `KINDA_SMALL_NUMBER` 以下なら 0 です。`ScaleCurveByBoneLengthRate` が空でなければ、`UpdateScaleByLengthRate` がこの割合でカーブを評価し、`ScaleByLengthRateCurve` に保存します。

## ApplySyncBones

### 移動量の計算

同期元ごとに、次の順で移動量を作ります。

```text
Delta = SyncBone の現在の Component 空間の位置 - InitialPoseLocation
Delta *= ScaleCurveByDeltaDistance(|Delta|)     カーブが空でないとき
Delta *= GlobalScale                            成分ごと
Filtered = ApplyDirectionX、ApplyDirectionY、ApplyDirectionZ で Delta の成分を選別
```

`Delta` は前のフレームからの差分ではなく、参照ポーズからの差分です。通常のボーンの `PoseLocation` は毎フレーム、アニメーションポーズから取り直されるので、差分の全量を毎フレーム適用しても累積しません。

方向の選別は Component 空間で、ローカルラムダ `CheckDirection` が行います。`ESyncBoneDirection` が `Positive` なら正の値だけ、`Negative` なら負の値だけ、`Both` なら両方を通し、`None` は常に 0 です。

`Filtered` がほぼ 0 ならこの同期元の処理を終えます。それ以外は `SimulationSpace` のベクトルへ変換し、同期元の位置も同じ空間へ変換します。

### 距離減衰

`bEnableDistanceAttenuation` が有効な場合、ターゲットごとに `Filtered` へ `AlphaMul` を掛けます。

```text
Distance = |同期元の位置 - ModifyBones[Index].Location|
EffectiveOuter = Max(AttenuationOuterRadius, AttenuationInnerRadius)

Distance <= AttenuationInnerRadius   : AttenAmount = 0
Distance >= EffectiveOuter           : AttenAmount = MaxAttenuationRate
それ以外                              : AttenAmount = T * MaxAttenuationRate

T = (Distance - AttenuationInnerRadius) / (EffectiveOuter - AttenuationInnerRadius)
    分母が KINDA_SMALL_NUMBER 以下なら T = 1

AlphaMul = Max(0, 1 - AttenAmount)
```

距離の計算には `Location` を使います。この時点の `Location` は前回のシミュレーションの結果です。`Apply` は `Location` を変更しないので、同じ評価の中で距離は変わりません。

### Apply

`FKawaiiPhysicsSyncTarget::Apply` は最終的な移動量を次の式で作ります。

```text
ScaledTranslation = Filtered * AlphaMul * ScaleByLengthRateCurve
NewPoseLocation   = Bone.PoseLocation + ScaledTranslation
```

`ModifyBoneIndex` が無効な場合と `Bone.bSkipSimulate` が真の場合は、何もせず return します。適用は親の種類で3つに分岐します。

| 条件 | 新しい `PoseLocation` |
|---|---|
| 親がない | `NewPoseLocation` |
| 親が Inter-Bone ダミー | 実親を中心に、距離 `BoneLength / (1 - InterBoneAlpha)` |
| 親が Inter-Bone ダミー以外 | 親を中心に、距離 `BoneLength` |

親がある場合は、方向だけを新しい位置から取り、親からの距離を保ちます。つまり、子のポーズは親を中心とする球面の上を動きます。

親が Inter-Bone ダミーの場合、ダミーのポーズはこの時点では同期前の値です。ソースコメントによると、これを基準に長さを拘束すると伸縮が起きるため、ダミーを飛ばして実親を基準にします。`BoneLength` は最後のセグメント長なので、`1 - InterBoneAlpha` で割ると実親からの全長に戻ります。

方向が 0 になる場合（新しい位置が中心と一致）は、更新前の方向を使います。それも 0 なら長さの維持を行わず、`NewPoseLocation` をそのまま使います。`1 - InterBoneAlpha` が `KINDA_SMALL_NUMBER` 以下の場合や実親が無効な場合も、並進のみです。

各 `TargetRoots` の要素では、ルートのターゲットを先に、次に `ChildTargets` を順に適用します。

### ダミーのポーズの再計算

全同期元の処理の後、`UpdateSubdivisionDummyPoseAfterSyncBones` が2パスでポーズを更新します。

| パス | 対象 | 処理 |
|---|---|---|
| 1 | `bDummy` かつ `bInterBoneDummy` が偽で、`InterBoneRealParentIndex` が 0 以上 | `UpdateTipDummyPose` |
| 2 | Inter-Bone ダミー | `UpdateInterBoneDummyPose` |

パス1の条件には Bridge ダミーも一致し、端点1を実祖先として `PoseLocation`、`PoseRotation`、`PoseScale` が計算されます。`PoseLocation` は `SimulateOnce` が配置時に上書きするので、押し出し量の基準には影響しません。`UpdateInterBoneDummyPose` は `UpdateModifyBonesPoseTransform` と同じ関数で、LOD のフォールバックも同じです。

直接の末端ダミーはパス1の対象外です。ターゲットとして `Apply` で動いた位置がそのまま残ります。

`SyncBones` が空の場合は `ApplySyncBones` の冒頭で return するので、この再計算は走りません。

## 状態とライフサイクル

| データ | 更新のタイミング |
|---|---|
| `InitialPoseLocation` | `InitSyncBone` |
| `ModifyBoneIndex`、`ChildTargets` | `InitSyncBone` |
| `LengthRateFromSyncTargetRoot` | `CollectSyncBoneChildTargets` |
| `ScaleByLengthRateCurve` | `CollectSyncBoneChildTargets`。エディタビルドは `ApplySyncBones` でも更新 |
| `DeltaDistance`、`ScaledDeltaDistance`、`TranslationBySyncBone` | `ApplySyncBones`。`WITH_EDITORONLY_DATA` のみ |

`ApplySyncBones` での `ScaleByLengthRateCurve` の更新は、カーブが空でないときだけです。同期元が評価できない場合と `Filtered` がほぼ 0 の場合は、更新の手前でその同期元の処理を終えます。カーブを空にしても、既存のターゲットの値は 1 へ戻りません。

`bIncludeChildBones` が無効なターゲットでは `CollectSyncBoneChildTargets` が走らないので、エディタビルド以外では `ScaleByLengthRateCurve` は更新されません。

`InitSyncBones` は `ModifyBones` の構築時にしか走らないので、`ModifyBones` の再構築を伴うイベントでターゲットが作り直されます。`SyncBones` の変更を検知する処理はありません。`UKawaiiPhysicsLibrary` の setter とプロパティアクセスの再初期化対象にも入っていません。プリセットの適用は再構築を要求します。

Teleport のフレームでも、`ApplySyncBones` はシミュレーションのスキップより前に実行されます。`DeltaTime` が 0 以下の評価でも、ポーズの更新、`ApplySyncBones`、`ApplySimulateResult` は実行されます。`SimulateModifyBones` は return するので `Location` は動きません。ルート以外の実ボーンの出力位置は、通常は保持された `Location` です。ポーズとシミュレーションの方向が完全に一致する分岐では `Location` の設定を飛ばすので、`PoseLocation` が出力位置になります。

エディタでは、`FKawaiiPhysicsEditMode::EnterMode` が実行中のノードの `SyncBones` をグラフノードへコピーします。`ChildTargets` は詳細パネルに `ChildTargets(Preview)` として表示されるプロパティです。

### LOD

| 状況 | 挙動 |
|---|---|
| 同期元が評価できない | `ApplySyncBones` はその同期元を飛ばす |
| 初期化時に同期元が評価できなかった | `InitSyncBone` は再試行しない。次の再構築まで `InitialPoseLocation` は 0 のままで、`ModifyBoneIndex` と `ChildTargets` は前の値のまま。後で評価できるようになると、`Delta` は同期元の現在の位置そのものになる |
| 初期化時にターゲットのルートが評価できない | `TargetRoots` から削除される |
| ターゲットが `ModifyBones` にない | `ModifyBoneIndex` が `INDEX_NONE` になり、`Apply` は何もしない |
| 初期化後にターゲットが Compact Pose から外れた | `ModifyBoneIndex` は有効なままで、`Apply` は通常どおり走る。`ResetBoneTransformWhenBoneNotFound` が無効（既定）なら `PoseLocation` が取り直されないので、移動は評価ごとに同じポーズへ累積する。有効なら `PoseLocation` は毎評価 0 に戻ってから加算される。どちらも親からの距離は維持される |

## 他機能との関係

**Stiffness:** 目標は `ParentBone.Location + (Bone.PoseLocation - ParentBone.PoseLocation)` です。親と子の `PoseLocation` の差が変わることで、目標が動きます。差が変わらない移動では、この目標は動きません。

**ルートボーン:** `bSkipSimulate` は `SimulateModifyBones` が設定するので、`ApplySyncBones` が読むのは前回の評価の値です。ルートは `bSkipSimulate` が真なので、`Apply` は通常 return します。ルートのポーズは動かず、ルート直下の子は固定されたルートを中心に回ることになります。`ModifyBones` の構築後、`SimulateModifyBones` の判定を初めて通過するまでは `bSkipSimulate` が既定の false で、ルートの `PoseLocation` にも移動量が加わります。構築直後の評価に加えて、`DeltaTime` が 0 以下で判定の前に return した場合や、WorldSpace の Teleport で `SimulateModifyBones` を呼ばなかった場合は、次の評価でもこの状態が続きます。

**角度制限と長さ復元:** どちらも `PoseLocation` を読むので、角度制限の基準方向は同期後の方向です。長さ復元も同期後のポーズから長さを求めます。

**長さの基準:** `Apply` の長さには構築時の `BoneLength` を使います。実ボーンの値は参照ポーズのローカル移動量の長さ（親が Inter-Bone ダミーの場合は構築時のセグメント長）で、現在のアニメーションポーズの長さとは異なる場合があります。Sync Bone が適用されたボーンでは、ポーズの親子間の距離がこの値に置き換わるので、長さ復元の結果も変わります。

**出力:** `ApplySimulateResult` の回転の計算は同期後の `PoseLocation` を使い、実ボーンの `PoseRotation` は同期前のままです。

```cpp
FQuat SimulateRotation = FQuat::FindBetweenVectors(PoseVector, SimulateVector) * ParentBone.PoseRotation;
```

`PoseVector` は同期後のベクトルなので、シミュレーションが同期後のポーズに一致すると、回転は同期前の `PoseRotation` のままになります。

**Bone Constraint:** `Location` を動かさないため、拘束の違反を直接は生みません。`Length` は構築時に固定されているので、Sync Bone の移動で変わりません。

**コリジョン:** コリジョン形状には影響しません。`Location` へ移動が伝わった後で、通常どおり押し出しを受けます。

**Bone Subdivision:** Inter-Bone ダミーのポーズは再計算で実端点へ追従します。コリジョン専用モードとフル物理モードで Sync Bone の処理に違いはありません。

**複数の同期元:** `SyncBones` の配列順に処理し、`PoseLocation` への変更は累積します。後の同期元の `Apply` は、前の同期元の適用後のポーズを読みます。

**固定サブステップと WarmUp:** 適用は評価ごとに1回です。`WarmUp` の反復の間は同じ `PoseLocation` を使います。

## 変更するときの注意

- **`ApplySyncBones` を `UpdateModifyBonesPoseTransform` より前に動かさない。** ポーズの取得で上書きされます。`SimulateModifyBones` の `CurrentPoseLocation` の退避より後に動かすと、サブステップに反映されません。
- **`PoseLocation` を動かす処理を足したら、ダミーのポーズも更新する。** Inter-Bone ダミーと分割された末端ダミーは実端点から決まります。`UpdateSubdivisionDummyPoseAfterSyncBones` と同じ2パスの順序が必要です。
- **`ChildTargets` の順序を変えない。** 親が先に適用される前提で、子は親の更新後の `PoseLocation` を読みます。
- **`ModifyBones` の順序を変えない。** `ModifyBoneIndex` は再構築まで保持されます。Bridge ダミーのように末尾へ追加する分には影響しません。
- **Bridge ダミーの条件を確認する。** Bridge ダミーは `InterBoneRealParentIndex` が 0 以上で、`bDummy` が真です。末端ダミーを判定する条件には `bBridgeDummy` の確認が必要です。

| テスト | 守っている内容 |
|---|---|
| `KawaiiPhysics.Simulation.SyncBoneSubdivisionTargets` | 内部ダミーがターゲットに入らないこと |
| `KawaiiPhysics.Simulation.SyncBoneSubdivisionPoseRefresh` | 適用後のダミーのポーズの再計算 |
| `KawaiiPhysics.Simulation.SyncBoneSubdivisionApply` | 親が Inter-Bone ダミーの子の移動と、実親からの距離の維持 |
| `KawaiiPhysics.Simulation.SyncBoneSubdivisionLength` | 分割時の `BoneLength` と Sync Bone 適用後の区間長 |

これらのテストは `ModifyBones` を直接組み立て、適用部分だけを実行します。`InitSyncBones` と `ApplySyncBones` の全体は `Output` に依存するので、テストでは実行しません。ハーネスの点は `bSkipSimulate` が false なので、ルートへの適用の結果は実行時とは異なります。

## 関連ページ

- [ノードのライフサイクルと1フレームの処理順](/docs/internals/frame-lifecycle)
- [ボーンモデル](/docs/internals/bone-model)
- [シミュレーション](/docs/internals/simulation)
- [拘束と制限](/docs/internals/constraints-and-limits)
- [Sync Bone](/docs/features/sync-bone)
- [ボーン細分化](/docs/features/bone-subdivision)
