---
sidebar_position: 3
title: "ボーンモデル"
description: "FKawaiiPhysicsModifyBone のデータモデルと ModifyBones の構築、3種類のダミーボーン、Subdivision、ポーズ更新、LOD の扱いを説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# ボーンモデル

このページでは、配列の構築と並びの保証、ダミーの種類と違い、毎フレームのポーズ更新、LOD の扱いを説明します。計算の順序は[シミュレーション](/docs/internals/simulation)を参照してください。

## このページの要点

**概要**

KawaiiPhysics はスケルトンの階層を直接たどらず、制御対象のボーンを `FKawaiiPhysicsModifyBone` の配列 `ModifyBones` に展開してから計算します。配列にはスケルトンに存在しないダミーの点も含まれ、物理計算、コリジョン、Sync Bone、出力はこの配列を基準に動きます。

**設計**

配列の1要素は質点で、シミュレーションの位置、ポーズ目標、サブステップ補間の値を同じ要素に持ちます。配列はノードが持ち、アセットには保存せず、評価中に構築と更新を行います。親を子より先に追加するので、先頭から1回走査するだけで根から先端へ処理できます。木に属さない Bridge ダミーは配列の末尾に置きます。

**理解のポイント**

- 点には実ボーン、末端ダミー、Inter-Bone ダミー、Bridge ダミーの4種類があり、処理ごとに参加の有無が異なります。各処理がどの種類の点を対象にするかを確認しながら読みます。
- フィールドの名前と実際の参照先を区別します。`ParentIndex` はスケルトン上の親とは限らず、`InterBone...` の値は実ボーンを指すとは限りません。
- Inter-Bone ダミーの扱いは、既定のコリジョン専用モードとフル物理モードで変わります。押し出しや親の参照がどちらのモードの話かに注意します。
- 配列の構成は構築時に決まり、LOD の変化や Teleport では再構築されません。毎フレーム更新される値と、再構築まで変わらない値を分けて読みます。

<DocFigure src="/img/generated/internals-bone-kinds-ja.svg" alt="2本の縦チェーン上の実ボーン、Inter-Boneダミー、末端ダミーと、横のBone Constraint上のBridgeダミーの配置" caption="縦の親子関係と横の拘束をたどり、4種類の点を形と色で見分けます。" maxWidth={960} />

## 関連ファイル

| ファイル | 役割 |
|---|---|
| [`Public/KawaiiPhysicsTypes.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsTypes.h) | `FKawaiiPhysicsModifyBone`、`FKawaiiPhysicsRootBoneSetting` |
| [`Private/AnimNode_KawaiiPhysicsModifyBones.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsModifyBones.cpp) | `InitModifyBones`、`AddModifyBone`、Inter-Bone ダミーの挿入、`CalcBoneLength`、`UpdateModifyBonesPoseTransform` |
| [`Private/AnimNode_KawaiiPhysicsCollision.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsCollision.cpp) | `InsertBridgeDummiesForConstraints`（Bridge ダミーの生成） |
| [`Private/AnimNode_KawaiiPhysicsSimulation.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsSimulation.cpp) | ダミーの配置、`ApplySimulateResult` |

## 設計の要点

### データの持ち主

`ModifyBones` は `FAnimNode_KawaiiPhysics` のメンバで、`UPROPERTY(Transient)` です。アセットには保存されず、評価中（Worker または Game Thread）に構築と更新を行います。

配列の1要素は「質点」です。1要素に次の3系統の状態が同居します。

| 系統 | フィールド | 内容 |
|---|---|---|
| シミュレーション | `Location`、`PrevLocation` | 物理計算の結果。差分を前ステップの時間で割って速度を再構成する |
| ポーズ目標 | `PoseLocation`、`PoseRotation`、`PoseScale` | 物理の目標。実ボーンはアニメーションポーズから毎フレーム取得する |
| サブステップ補間 | `PrevPoseLocation`、`CurrentPoseLocation` など | ポーズ目標の補間の始点と終点 |

座標は `SimulationSpace` の値です。実行中に `SimulationSpace` が変わると、評価の冒頭で `ConvertSimulationSpace` が `Location`、`PrevLocation`、`PrevRotation` を新しい空間へ変換します。`PrevPoseLocation` と `PrevPoseRotation` は変換せず、`bSubstepPoseInitialized` も変更しないので、その評価の固定サブステップでは補間の始点だけが変更前の空間の値になります。

`PhysicsSettings` は各ボーンの実効値で、ノードの設定とカーブ、倍率から計算されます。

### 配列の並びの保証

`AddModifyBone` は親を配列へ追加してから子を再帰で追加します。そのため、木に属する点では**親のインデックスは常に子より小さく**なります。`ModifyBones` を先頭から1回走査するだけで根から先端へ処理でき、物理計算、長さ復元、ポーズ更新はこの前提に依存します。

Bridge ダミーだけは木に属しません。`InitBoneConstraints` の末尾で配列の後ろに追加されるため、すべての縦の点より大きいインデックスを持ちます。`SimulateOnce` は Bridge ダミーを別ループで配置しており、ソースコメントのとおり、大きいインデックスにあることで端点が配置済みになります。

### 配列の例

<DocFigure src="/img/generated/internals-bone-array-ja.svg" alt="ルートごとの配列に0と7のオフセットを加えて連結したModifyBonesと、Inter-BoneおよびBridgeのインデックス参照先" caption="上段の一時配列から連結後のインデックスを追い、下段で親と補間端点の参照先を確認します。" maxWidth={960} />

同じ構成の2本のチェーンの実ボーン 3 と 10 を `BoneConstraints` の1要素でつなぎ、`BoneSubdivisionCount = 2`、`DummyBoneLength > 0`、`BoneConstraintSubdivisionCount = 1` とした場合の並びです。`bBoneSubdivisionDensifyByRadius` は無効、`bAutoAddChildDummyBoneConstraint` は既定の有効で、端点の球は重ならないものとします。

| Index | 種類 | `ParentIndex` | `InterBoneRealParentIndex` | `InterBoneRealChildIndex` | `InterBoneAlpha` |
|---|---|---|---|---|---|
| 0 | 実ボーン（ルート） | -1 | -1 | -1 | 0 |
| 1 | Inter-Bone | 0 | 0 | 3 | 1/3 |
| 2 | Inter-Bone | 1 | 0 | 3 | 2/3 |
| 3 | 実ボーン | 2 | -1 | -1 | 0 |
| 4 | Inter-Bone | 3 | 3 | 6 | 1/3 |
| 5 | Inter-Bone | 4 | 3 | 6 | 2/3 |
| 6 | 末端ダミー | 5 | 3 | -1 | 0 |
| 7〜13 | 2本目のチェーン | | | | |
| 14 | Bridge | -1 | 3（端点1） | 10（端点2） | 1/2 |
| 15〜17 | Bridge | -1 | 4、5、6 | 11、12、13 | 1/2 |

15〜17 は、自動生成された 4-11、5-12、6-13 のダミー拘束に載る Bridge ダミーです。`bAutoAddChildDummyBoneConstraint` が無効なら作られません。端点の球が重なる拘束にも作られないので、以降のインデックスは詰まります。

実ボーン 3 の親は実ボーン 0 ではなく、直前の Inter-Bone ダミー 2 です。`ParentIndex` は「スケルトン上の親」を指しません。

## インデックスとフラグの意味

| フィールド | 実ボーン | 末端ダミー | Inter-Bone ダミー | Bridge ダミー |
|---|---|---|---|---|
| `BoneRef` | 有効 | 空 | 空 | 空 |
| `bDummy` | false | true | true | true |
| `bInterBoneDummy` | false | false | true | false |
| `bBridgeDummy` | false | false | false | true |
| `ParentIndex` | 木の上で直前の点。ルートは -1 | 木の上で直前の点 | 木の上で直前の点 | 常に -1 |
| `ChildIndices` | 木の上で直後の点。分岐では複数 | 空 | 次の点 | 空 |
| `InterBoneRealParentIndex` | -1 | 区間を分割したときだけ実ボーン | 補間元の実ボーン | 拘束の端点1 |
| `InterBoneRealChildIndex` | -1 | -1 | 補間先の点 | 拘束の端点2 |
| `InterBoneAlpha` | 0 | 0 | 補間率 | 補間率 |

名前に反して、次の点に注意が必要です。

- `InterBoneRealChildIndex` の先は実ボーンとは限りません。末端の区間を分割した場合は末端ダミーを指します。
- Bridge ダミーは `InterBone...` の3フィールドを端点と補間率の格納先として流用します。端点は Inter-Bone ダミーや末端ダミーの場合があります。
- `bDummy` は3種類すべてで真です。末端ダミーかどうかは `bDummy` だけでは判定できません。

## ModifyBones の構築

`EvaluateSkeletalControl_AnyThread` は `ModifyBones` が空のとき、`InitModifyBones`、`InitSyncBones`、`InitBoneConstraints` をこの順に実行します。

### InitModifyBones

`RootBone` と `AdditionalRootBones` の各要素について、ローカル関数 `InitRootBone` を実行します。

1. `AddModifyBone` で一時配列にボーンを集めます。
2. `CalcBoneLength` で `BoneLength` と `LengthFromRoot` を計算します。
3. `LengthRateFromRoot` を計算します。
4. `Index`、`ParentIndex`、`ChildIndices`、`InterBoneRealParentIndex`、`InterBoneRealChildIndex` に、既存の `ModifyBones.Num()` を足して `ModifyBones` へ連結します。

ルートごとに一時配列を分けるため、`LengthRateFromRoot` はルートの木ごとに 0〜1 へ正規化されます。除外ボーンは、`AdditionalRootBones` の要素で `bUseOverrideExcludeBones` が有効なら `OverrideExcludeBones`、それ以外はノードの `ExcludeBones` を使います。

ルートの木どうしの重なりは確認しません。複数のルートの木が同じボーンを含むと、`ModifyBones` に同じ `BoneRef` の要素が複数入ります。`InitSyncBone` と `InitBoneConstraints` の検索は最初に一致した要素を選び、`ApplySimulateResult` の `OutBoneTransforms` には同じ Compact Pose インデックスが複数入ります。

ボーン名の解決に使う参照スケルトンは CVar `a.AnimNode.KawaiiPhysics.UseBoneContainerRefSkeletonWhenInit` で切り替わります。既定の true では `BoneContainer` の参照スケルトンを使います。false では Skeleton アセットを使い、アセットが null なら `BoneContainer` へフォールバックします。ソースコメントによると、このフォールバックはクック失敗や参照切れでのクラッシュを避けるものです（issue #174）。

### AddModifyBone

<DocFigure src="/img/generated/internals-add-modify-bone-flow-ja.svg" alt="AddModifyBone の除外判定、子ごとに繰り返す挿入・再帰・接続または巻き戻し、子が0本の場合の経路と末端ダミーの判定" caption="手順3～5を子ごとに繰り返し、全ての子を処理後、追加できた実子が0本か判定します。子が0本の場合もこの判定へ進みます。" maxWidth={960} />

初期値の `Location`、`PrevLocation`、`PoseLocation` はいずれも評価中のポーズから取ります。ローカル変数の名前は `RefBonePoseTransform` ですが、値は `Output` の現在のポーズです。

**ExcludeBones** に一致したボーンは `INDEX_NONE` を返すため、再帰が止まり、その子孫もすべて対象外になります。Compact Pose にないボーンも同じ経路をたどります。末端ダミーの条件は、そのボーンの子を1本も追加できなかったことです。除外した子に兄弟があって追加できた場合は、親に末端ダミーは付きません。すべての子が除外され、`DummyBoneLength` が正なら、除外の手前に末端ダミーが付きます。

子の追加に失敗すると、`RollbackInterBoneDummyBones` が挿入済みの Inter-Bone ダミーを取り除きます。失敗した `AddModifyBone` は配列に何も追加しないので、ダミーは配列の末尾に連続しています。

### 末端ダミー

末端ダミーは、実子を持たないボーンの先に `DummyBoneLength` だけ前方へ延ばした点です。前方は `BoneForwardAxis` で決まります。実子がないボーンは回転を計算する相手がないため、末端ダミーを置くと末端ボーンの回転が計算されます。

`InterBoneRealParentIndex` の値で2つの形に分かれます。

| 形 | `ParentIndex` | `InterBoneRealParentIndex` | `BoneLength` |
|---|---|---|---|
| 直接の末端ダミー | 実ボーン | -1 | `DummyBoneLength` |
| 分割された末端ダミー | 最後の Inter-Bone ダミー | 実ボーン | `DummyBoneLength / (N + 1)` |

分割された形は `BoneSubdivisionCount` が正のときに作られます。実ボーンと末端ダミーの間の区間も、実ボーンどうしの区間と同様に分割されます。

### Inter-Bone ダミー

`InsertInterBoneDummyBones` は子の位置を取得し、`InsertInterBoneDummyBonesCore` に処理を渡します。末端ダミーの区間はコア関数を直接呼びます。ダミーの本数は次のように決まります。

```text
EffectiveCount = Clamp(BoneSubdivisionCount, 0, 10)      区間長 Distance が KINDA_SMALL_NUMBER 以下なら 0

bBoneSubdivisionDensifyByRadius が有効なら
    AvgRadius      = PhysicsSettings.Radius * Max(RadiusCurve の最小値, 0)
    CoverageCount  = Max(Ceil(Distance / (2 * AvgRadius)) - 1, 0)
                     Distance か AvgRadius が KINDA_SMALL_NUMBER 以下なら 0
    EffectiveCount = Max(EffectiveCount, CoverageCount)

EffectiveCount = Min(EffectiveCount, 50)
```

`BoneSubdivisionCount` が 0 以下の場合は関数の冒頭で return するため、`bBoneSubdivisionDensifyByRadius` だけを有効にしてもダミーは増えません。座標が重なる区間にはダミーを置きません。

`RadiusCurve` の最小値は、時刻 0、時刻 1、0〜1 の範囲にある全キーの値から求めます。ソースコメントによると、挿入の時点では `LengthRateFromRoot` が未確定で、被覆漏れを防ぐために保守的に見積もっています。半径はノードの `PhysicsSettings.Radius` を使うため、Settings Multiplier の倍率は本数に影響しません。

各ダミーの補間率は `(j + 1) / (N + 1)` です。位置とスケールは Lerp、回転は Slerp で作ります。補間先は子を追加するまで確定しないため、`FinalizeInterBoneDummyBones` が `InterBoneRealChildIndex` を後から設定します。

### Bridge ダミー

Bridge ダミーは `InitBoneConstraints` の末尾で呼ばれる `InsertBridgeDummiesForConstraints` が、拘束の線上に作ります。縦の階層に属さず、`ParentIndex` は常に -1 です。生成条件は[拘束と制限](/docs/internals/constraints-and-limits)を参照してください。

`InitSyncBones` より後に追加されるので、Sync Bone のインデックスを無効にしません。`ChildIndices` からも参照されないため、木をたどる処理には現れません。

### 長さの計算

`CalcBoneLength` は `ChildIndices` を再帰でたどります。

| 点 | `BoneLength` |
|---|---|
| ルート | 0 |
| 親が Inter-Bone ダミーの実ボーン | 親の `BoneLength`（最後のセグメント長） |
| それ以外の実ボーン | 参照ポーズのローカル移動量の長さ |
| 直接の末端ダミー | `DummyBoneLength` |
| 分割された末端ダミー | `AddModifyBone` が設定した値 |
| Inter-Bone ダミー | `Distance / (N + 1)` |

`LengthFromRoot` は親の値に `BoneLength` を足した値です。ソースコメントのとおり、分割した区間で実ボーンに元の全長を入れると `LengthFromRoot` が二重に計上されるため、最後のセグメント長を使います。

`LengthRateFromRoot` は `LengthFromRoot / TotalBoneLength` で、`TotalBoneLength` はその木の `LengthFromRoot` の最大値です。ダミーも最大値の計算に入ります。末端ダミーを付けたチェーンでは、値が 1 になるのは末端ダミーで、最後の実ボーンは 1 未満です。Bridge ダミーは木に属さないので、`LengthFromRoot` は 0 のままで、`LengthRateFromRoot` に両端点の平均が入ります。

`BoneLength` が使われるのは `LengthFromRoot` の計算と Sync Bone の長さ維持です。物理の長さ復元は `BoneLength` を読まず、毎ステップのポーズから長さを求めます。

## 毎フレームのポーズ更新

`UpdateModifyBonesPoseTransform` は2パスで処理します。ソースコメントのとおり、Inter-Bone ダミーは両端の確定を必要とするためです。

| パス | 対象 | 処理 |
|---|---|---|
| 1 | 実ボーン | `GetBoneTransformInSimSpace` で現在のポーズを取得 |
| 1 | 末端ダミー | `UpdateTipDummyPose` で実祖先から計算 |
| 1 | Bridge ダミー | 何もしない |
| 2 | Inter-Bone ダミー | `UpdateInterBoneDummyPose` で両端を補間 |

`UpdateTipDummyPose` は `InterBoneRealParentIndex` があればそれを、なければ `ParentIndex` を実祖先として使います。

```cpp
Bone.PoseLocation = RealAncestor.PoseLocation +
    GetBoneForwardVector(RealAncestor.PoseRotation) * DummyBoneLength;
```

分割された末端ダミーの直接の親はパス2で確定する Inter-Bone ダミーなので、実祖先を読むことで循環を避けています。

パス1のループでは `bBridgeDummy` の判定を最初に行います。ソースコメントのとおり、この判定がないと末端ダミーの分岐に入り、誤った位置が計算されます。Bridge ダミーの `PoseLocation` は `SimulateOnce` が毎ステップ、配置した位置で上書きし、押し出し量の基準として使います。

## ダミーの種類ごとの比較

処理ごとの参加の有無を示します。コリジョン専用モードは `bBoneSubdivisionCollisionOnly` が true の場合で、これが既定です。

| 点 | 積分（`Simulate`） | コリジョン | Bone Constraint | 角度制限・長さ復元 | 出力 |
|---|---|---|---|---|---|
| ルート | しない。ポーズへ追従 | しない | 指定すれば参加 | しない | 回転のみ。位置はポーズのまま |
| 実ボーン | する | する | 指定すれば参加 | する | 位置と回転 |
| 末端ダミー | する | する | 自動拘束で参加 | する | しない |
| Inter-Bone（コリジョン専用） | しない。実端点の間へ Lerp で配置 | する。押し出しは実ボーンへ転送されない | 自動拘束で参加 | しない。最後に実端点の間へ置き直す | しない |
| Inter-Bone（フル物理） | する | する。長さ復元を通じて子へ伝わる | 自動拘束で参加 | する | しない |
| Bridge | しない。端点の間へ Lerp で配置 | する。押し出しを端点へ転送する | 参加しない | しない | しない |

判定の実体は次の箇所です。

- 積分の除外は `SimulateOnce` のループ内の分岐です。
- コリジョンの除外はループ内の `bSkipSimulate` の判定です。押し出しの計算自体は、ダミーの種類で変わりません。
- 角度制限と長さ復元の対象は `IsAngleLimitTargetBone` が決めます。
- 出力の除外は、`BoneRef` が空のダミーで Compact Pose インデックスが負になることによります。

### コリジョン専用モードの押し出し

コリジョン専用モードの Inter-Bone ダミーは、`SimulateOnce` の中でコリジョンの押し出しを受けます。ただし、`RestoreBoneLengthsAndLimits` は `GetAngleLimitParentIndex` で親を実ボーンまでたどるので、実ボーンの長さ復元はダミーの位置を読みません。さらに同じ関数の最後で、ダミーの `Location` を復元後の実端点の間へ置き直すため、押し出しの結果はステップの終わりに消えます。

コリジョン専用モードの Inter-Bone ダミーから実ボーンへ変位を返す処理は、`ApplyBridgeDummyCollisionFeedback` の Bridge 経由の経路だけです。Bridge ダミーの押し出しの端点が Inter-Bone ダミーの場合、その分は実端点へ `InterBoneAlpha` で配分されます。

フル物理モードでは、実ボーンの長さ復元の親が Inter-Bone ダミーになるので、ダミーの押し出しは木をたどって子へ伝わります。

### 出力への影響

ダミーは `OutBoneTransforms` から除去されますが、親の回転には影響します。`ApplySimulateResult` は、ボーンの子が1本以下で親の `BoneRef` が有効なとき、親から子へのベクトルで親の回転を計算します。

- 区間を分割した実ボーンの回転は、最初の Inter-Bone ダミーへのベクトルで決まります。
- コリジョン専用モードではダミーが実端点の線上に置き直されるので、結果は実子へのベクトルと同じ向きです。
- 親が Inter-Bone ダミーの場合は `BoneRef` が無効なので、回転の計算を行いません。

## 状態とライフサイクル

`ModifyBones` は次の場合に空になります。再構築は、`RootBone` と `AdditionalRootBones` がすべて評価可能な評価で行います。ルートの検証で return した評価では再構築しません。`Initialize_AnyThread` は配列を空にするだけで、構築は最初の評価で行います。すべての点が現在のポーズの位置から始まるので、速度は 0 に戻ります。

| 契機 | 発生箇所 |
|---|---|
| ノードの初期化 | `Initialize_AnyThread` |
| `ResetDynamics(ETeleportType::ResetPhysics)` | 次の評価の冒頭 |
| `ShouldReinitModifyBones()` が真 | 評価の冒頭 |

`ShouldReinitModifyBones` が前回の構築時の値と比較するのは、`BoneSubdivisionCount`、`BoneConstraintSubdivisionCount`、`bBoneSubdivisionDensifyByRadius`、`DummyBoneLength` と、Densify が有効な場合の `PhysicsSettings.Radius` です。

`bBoneSubdivisionCollisionOnly`、`BoneForwardAxis`、`RadiusCurveData`、`RootBone`、`ExcludeBones` などの変更は比較の対象外です。これらは `UKawaiiPhysicsLibrary` の setter やプロパティアクセス経由で変更した場合に、`RequestModifyBonesReinit` で再構築を要求します。リセット系イベントの比較は[ノードのライフサイクルと1フレームの処理順](/docs/internals/frame-lifecycle)を参照してください。

Teleport では `ModifyBones` を再構築しません。WorldSpace で Teleport した場合の位置の補正は全要素に対して行われます。

ルートボーンが評価可能でも、ルートが除外対象になっていると `ModifyBones` は0件のままです。この場合は空の判定が毎回真になるので、評価のたびに構築が走ります。

ダミーの数は Stat の `STAT_KawaiiPhysics_NumInterBoneDummyBones` と `STAT_KawaiiPhysics_NumBridgeDummyBones` で確認できます。エディタビルドでは、構築時に Inter-Bone ダミーが `InterBoneDummyWarningThreshold`（既定 100）、Bridge ダミーが `BridgeDummyWarningThreshold`（既定 200）を超えると警告を出します。

## LOD でボーンが外れたとき

`ModifyBones` は LOD の変化では再構築しません。`CacheBones_AnyThread` 経由の `InitializeBoneReferences` が各要素の `BoneRef` を更新するだけで、配列の構成は構築時のままです。つまり、構築時の Compact Pose に含まれなかったボーンは、その後 LOD が変わっても次の再構築まで配列に入りません。

Compact Pose から外れたボーンの扱いは処理ごとに異なります。

| 処理 | 挙動 |
|---|---|
| `UpdateModifyBonesPoseTransform` | 既定では `Pose...` を更新せず前回の値を保つ |
| 同上、`ResetBoneTransformWhenBoneNotFound` が有効 | 位置 0、回転 Identity、スケール 1 にする |
| `UpdateInterBoneDummyPose` | 実子が外れていれば `ParentIndex` の親のポーズをコピーする。実子が末端ダミーなら通常どおり補間する |
| `SimulateModifyBones` | `bSkipSimulate` の判定は `BoneRef.BoneIndex` を見る。Compact Pose からの脱落は判定に入らない |
| Bridge ダミーの配置 | 実ボーンの端点が外れていれば `bSkipSimulate` を true にして、配置、コリジョン、フィードバックから除外する。次のフレームの冒頭で false に戻り、再度判定する |
| `ResolveExternalForceBoneTransform` | Compact Pose インデックスが無効なら Identity を返す |
| `ApplySimulateResult` | Compact Pose インデックスが負の項目を `OutBoneTransforms` から除去する |

`ResetBoneTransformWhenBoneNotFound` の既定は false です。ソースコメントによると、ボーンの位置と回転をリセットすると LOD の切り替え時に問題が起きる場合があり（issue #44）、ヘッダでも無効を推奨しています。

`RootBone` または `AdditionalRootBones` のいずれかが評価できない場合は、評価が冒頭で return します。

## 他機能との関係

**物理設定のカーブ:** `UpdatePhysicsSettingsOfModifyBones` は全要素に対して動き、`LengthRateFromRoot` でカーブを評価します。ダミーを追加すると `TotalBoneLength` が変わるので、`DummyBoneLength` の変更は実ボーンのカーブ評価位置も動かします。この更新が走るのは `ShouldUpdatePhysicsSettings` が真のときです。`bUpdatePhysicsSettingsInGame` が無効なら、構築の直後、倍率が有効な間、倍率が終わった直後の更新を除き、各ボーンの値は変わりません。`bEditing` が真の間は毎評価更新します。

**積分と長さ復元で参照する親の違い:** `Simulate` の Stiffness は `ModifyBones[Bone.ParentIndex]` を読むので、コリジョン専用モードでも親は Inter-Bone ダミーです。このときダミーの `Location` は、前のステップの終わりに置き直した値です。長さ復元と角度制限は `GetAngleLimitParentIndex` で実親までたどります。

**Sync Bone:** ターゲットは `ChildIndices` をたどって収集しますが、Inter-Bone ダミーと分割された末端ダミーは `IsExcludedFromSyncBoneChildTarget` で除外します。直接の末端ダミーはターゲットに含まれます。詳細は [Sync Bone](/docs/internals/sync-bone) を参照してください。

**外力:** `Apply` と `ApplyToVelocity` は `Simulate` の中で呼ばれるので、コリジョン専用モードの Inter-Bone ダミーと Bridge ダミーには作用しません。ダミーの Bone Space 外力は `ResolveExternalForceBoneTransform` が `InterBoneRealParentIndex` の実ボーン、なければ親の Transform を使います。

**ランタイム情報:** `UKawaiiPhysicsLibrary` のランタイム情報は、ダミーの種類を `EKawaiiPhysicsDummyBoneType` の `Tip`、`InterBone`、`Bridge` で返します。ダミーの `BoneName` は `NAME_None` です。

**デバッグ表示:** `a.AnimNode.KawaiiPhysics.Debug` の球は、実ボーンが黄、末端ダミーが赤、Inter-Bone ダミーがシアン、Bridge ダミーが緑です。

## 変更するときの注意

- **親が子より前という並びを崩さない。** 配列を前から走査する処理はすべてこの前提に依存します。木に属さない点を追加する場合は Bridge ダミーと同様に末尾へ追加してください。既存の要素の順序を変えると、`SyncBones` と `MergedBoneConstraints` が持つインデックスが無効になります。
- **インデックスのフィールドを追加したら `InitRootBone` の加算処理にも足す。** ルートごとの一時配列から連結するときに、既存の要素数を足しています。
- **`bDummy` だけで末端ダミーを判定しない。** Bridge ダミーも真になります。`UpdateModifyBonesPoseTransform` のように `bBridgeDummy` を先に確認してください。
- **`ParentIndex` を読む前に `bBridgeDummy` を確認する。** Bridge ダミーの `ParentIndex` は -1 です。
- **`InterBone...` の値を実ボーンと決めつけない。** Inter-Bone の補間先は末端ダミーの場合があり、Bridge の端点はダミーの場合があります。
- **ダミーの数を変える設定を足すときは `ShouldReinitModifyBones` にも足す。** `LastInitialized...` のメンバと評価ループでの記録も必要です。
- **`InitModifyBones` はテストで実行されない。** `Output` に依存するためです。ハーネスの `StepFrame` もダミー、Bridge、LOD には対応していません。関数単位のテストが個別の不変条件を守っています。

| テスト | 守っている内容 |
|---|---|
| `KawaiiPhysics.Simulation.SyncBoneSubdivisionLength` | 分割時の `BoneLength`、`LengthFromRoot`、`LengthRateFromRoot` |
| `KawaiiPhysics.Simulation.SyncBoneSubdivisionPoseRefresh` | 末端ダミーと Inter-Bone ダミーのポーズの再計算 |
| `KawaiiPhysics.Simulation.SubdivisionCollisionOnlyRestore` | コリジョン専用モードとフル物理モードの長さ復元と再配置 |
| `KawaiiPhysics.AngleLimit.PerAxis.Chain` | ダミーを飛ばして実親を基準に制限する経路 |

## 関連ページ

- [ノードのライフサイクルと1フレームの処理順](/docs/internals/frame-lifecycle)
- [シミュレーション](/docs/internals/simulation)
- [拘束と制限](/docs/internals/constraints-and-limits)
- [Sync Bone](/docs/internals/sync-bone)
- [改造ガイド](/docs/internals/modification-guide)
- [ボーンチェーン](/docs/features/bone-chain)
- [ボーン細分化](/docs/features/bone-subdivision)
