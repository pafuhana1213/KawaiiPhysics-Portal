---
sidebar_position: 5
title: "拘束と制限"
description: "Bone Constraint の XPBD、Bridge ダミーのコリジョンフィードバック、角度制限、平面制約、長さ復元を実装の式に沿って説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# 拘束と制限

このページでは各補正の式と、補正どうしの関係を説明します。コリジョンの押し出しの計算は[ローカルコリジョン](/docs/internals/collision)を、ステップ全体の順序は[シミュレーション](/docs/internals/simulation)を参照してください。

## このページの要点

**概要**

物理計算の後に、KawaiiPhysics は `Location` を直接動かす補正を順に適用します。列どうしの距離を保つ Bone Constraint、列の隙間の押し出しを返す Bridge フィードバック、親との角度と距離を決める角度制限、平面制約、長さ復元です。

**設計**

どの補正も `Location` を書き換える形で、順序は `SimulateOnce` で固定されています。後の補正が前の補正の結果を上書きし、最後の長さ復元が親からの距離を決めます。`PrevLocation` は補正で更新されないので、積分する点では、最終位置に残った補正が次のステップの速度の再構成にも使われます。Bone Constraint は、2つの点の距離を目標の長さへ近づける XPBD の距離拘束で、Compliance によって柔らかさが変わります。

**理解のポイント**

- どの補正が最後に勝つかを意識して読みます。コリジョンの押し出しや Bone Constraint の距離は、後の補正で崩れる場合があります。
- 補正ごとに対象の点が異なります。ルートやダミーが各補正に参加するか、受けた変位が実ボーンへ残るかを確認します。
- 構築時に決まる値と毎ステップ読む値を区別します。拘束の一覧と `Length` は `ModifyBones` の構築時に決まり、反復回数や全体の Compliance は毎ステップ読みます。
- 角度制限の円錐モードと PerAxis モードは別の計算で、0 の意味も逆です。円錐モードの 0 は制限なし、PerAxis モードの 0 はロックです。

<DocFigure src="/img/generated/internals-constraint-flow-ja.svg" alt="拘束、コリジョン、Bridge フィードバック、角度・平面・長さ補正の実行順" caption="上段から下段へ補正順をたどると、対象点の最終位置は長さ復元で決まり、Collision Only の Inter-Bone はその後に再配置されます。" maxWidth={960} />

## 関連ファイル

| ファイル | 役割 |
|---|---|
| [`Private/AnimNode_KawaiiPhysicsCollision.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsCollision.cpp) | `AdjustByBoneConstraints`、`InitBoneConstraints`、`InsertBridgeDummiesForConstraints`、`AdjustByAngleLimit`、`AdjustByPlanarConstraint` |
| [`Private/AnimNode_KawaiiPhysicsSimulation.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsSimulation.cpp) | `ApplyBridgeDummyCollisionFeedback`、`RestoreBoneLengthsAndLimits` |
| [`Public/KawaiiPhysicsAngleLimit.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsAngleLimit.h)、[`Private/KawaiiPhysicsAngleLimit.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsAngleLimit.cpp) | PerAxis モードの計算。ソルバーとエディタのプレビューが共有する |
| [`Public/KawaiiPhysicsBoneConstraintTypes.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsBoneConstraintTypes.h) | `FModifyBoneConstraint`、`EXPBDComplianceType` |
| [`Public/KawaiiPhysicsBoneConstraintsDataAsset.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsBoneConstraintsDataAsset.h) | `UKawaiiPhysicsBoneConstraintsDataAsset` |

## 設計の要点

補正の順序は `SimulateOnce` で固定されています。

```text
Bone Constraint（コリジョン前） → コリジョン → Bridge フィードバック
    → Bone Constraint（コリジョン後） → RestoreBoneLengthsAndLimits
```

すべて `Location` を直接書き換えるので、後の補正が前の補正の結果を上書きします。最後に走る `RestoreBoneLengthsAndLimits` が親からの距離を決めるため、コリジョンの押し出しと Bone Constraint の距離は完全には保証されません。長さ復元の対象の点は、親子の方向が定まる限り、ステップの終わりに親との距離がポーズの距離に揃います。

`PrevLocation` はこれらの補正で更新されません。補正の量は次のステップの `ComputeVerletStepVelocity` で速度として再構成されます。

## Bone Constraint

Bone Constraint は、2つの点の距離を目標の長さへ近づける XPBD の距離拘束です。

### データの流れ

<DocFigure src="/img/generated/internals-constraint-sources-ja.svg" alt="ノードと Data Asset の拘束が InitBoneConstraints に集まり、統合拘束と Bridge ダミーに分かれるデータ経路" caption="左の2つの入力から InitBoneConstraints へ集まり、統合拘束の毎ステップ処理と Bridge の追加へ分岐します。" maxWidth={960} />

`ApplyBoneConstraintDataAsset` は Data Asset の `GenerateBoneConstraints` の結果を `BoneConstraintsData` へコピーし、ボーン参照を初期化します。呼び出し元は `Initialize_AnyThread` と、エディタビルドの評価ループの2箇所です。

`InitBoneConstraints` は `ModifyBones` の構築と同時に1回だけ走ります。`MergedBoneConstraints` の並びは次のとおりです。

1. ノードの `BoneConstraints`
2. Data Asset 由来の `BoneConstraintsData`
3. 自動生成のダミー拘束（`bIsDummy = true`）

重複の除去は行いません。ノードと Data Asset に同じペアがあれば、両方が解かれます。ランタイム情報の `SourceType` は、この並びと `bIsDummy` から種別を判定します。

### InitBoneConstraints の処理

各拘束について次の処理を行います。

1. `Bone1` と `Bone2` に一致する `BoneRef` を `ModifyBones` から線形探索し、最初に一致した要素を `ModifyBoneIndex1` と `ModifyBoneIndex2` に設定します。見つからない場合は処理を打ち切ります。この拘束の `Length` は初期値の -1 のままなので、`IsValid()` が偽になり、解かれません。
2. 構築時の `Location` の距離を `Length` に保存します。アニメーションで距離が変わっても `Length` は更新されません。
3. `bAutoAddChildDummyBoneConstraint` が有効なら、ダミー拘束を生成します。

ダミー拘束には2種類あります。

| 種類 | 生成条件 | 端点 |
|---|---|---|
| 末端ダミーの拘束 | 両端点の `ChildIndices` に直接の末端ダミーがある | 2つの末端ダミー |
| Inter-Bone ダミーの拘束 | 両端点の下に Inter-Bone ダミーの列がある | 列の同じ順番の点どうし |

Inter-Bone ダミーの列は `CollectInterBoneDummies` が集めます。最初に見つかった Inter-Bone の子から列をたどり、列の末尾に分割された末端ダミーがあれば、それも列に加えます。ペアは `Min(列1の長さ, 列2の長さ)` 個で、順番のみで対応付けます。`bBoneSubdivisionDensifyByRadius` で区間ごとに本数が異なる場合は、端点の補間率が揃わないペアができます。

ダミー拘束が継承するのは `bExcludeFromSubdivision` だけです。ソースコメントのとおり、Compliance は既存の挙動を変えないため継承しません。ダミー拘束は常に `BoneConstraintGlobalComplianceType` を使います。

### 解法

`AdjustByBoneConstraints` は `MergedBoneConstraints` を順に1回ずつ解きます。各拘束は前の拘束の結果を読む Gauss-Seidel の形です。端点が完全に重なっている拘束（`DeltaLength <= 0`）は方向が定まらないのでスキップします。`Length` が正でも、重なった端点をこの関数で引き離すことはありません。

```text
Delta       = Location2 - Location1
C           = |Delta| - Length
Compliance  = XPBDComplianceValues[Type] / (StepDt * StepDt)
DeltaLambda = (C - Compliance * Lambda) / (2 + Compliance)
Correction  = (Delta / |Delta|) * DeltaLambda

Location1 += Correction
Location2 -= Correction
Lambda    += DeltaLambda
```

分母の `2` は逆質量の和です。両端を質量1として扱います。`Type` は `bOverrideCompliance` が有効な拘束では `ComplianceType`、それ以外は `BoneConstraintGlobalComplianceType` です。`StepDt` は `GetStepDeltaTime()` で、`KINDA_SMALL_NUMBER` を下限にします。距離は cm のまま使い、単位の変換は行いません。

`Compliance` の値と、`StepDt = 1/60`、`Lambda = 0` のときの結果を示します。補正率は、1回の反復で解消する距離の違反の割合で、`2 / (2 + Compliance)` です。

| Type | 配列の値 | `Compliance / StepDt²` | 補正率 |
|---|---|---|---|
| Concrete | 0.00000000004 | 1.44e-7 | ほぼ 1 |
| Wood | 0.00000000016 | 5.76e-7 | ほぼ 1 |
| Leather | 0.000000001 | 3.6e-6 | ほぼ 1 |
| Tendon | 0.000000002 | 7.2e-6 | ほぼ 1 |
| Rubber | 0.0000001 | 3.6e-4 | 0.9998 |
| Muscle | 0.00002 | 0.072 | 0.965 |
| Fat | 0.0001 | 0.36 | 0.847 |

### 反復と Lambda

`SimulateOnce` は2つのブロックで `AdjustByBoneConstraints` を呼びます。

| ブロック | 回数 | 既定 |
|---|---|---|
| コリジョン前 | `BoneConstraintIterationCountBeforeCollision` | 1 |
| コリジョン後 | `BoneConstraintIterationCountAfterCollision` | 1 |

各ブロックの開始時に全拘束の `Lambda` を 0 に戻すので、`Lambda` が累積するのはブロック内の反復の間だけです。ステップをまたいで保持しません。回数が 0 以下のブロックは実行しません。

### 解くときに確認しないこと

`AdjustByBoneConstraints` が確認するのは `IsValid()`、インデックスの範囲、端点間の距離です。`bSkipSimulate` は見ないため、ルートボーンも質量1の点として動きます。Golden テストの `Constraint` シナリオの期待値では、チェーンの間隔 15cm に対して `Length` 12cm を与えると、ルートの X 座標も 0 から 1.5 へ動きます。

ルートの `Location` は次のステップの冒頭で `PoseLocation` へ戻り、出力の位置もポーズのままです。ただし、同じステップの長さ復元では、子は動いた後のルートの `Location` を基準に置かれます。

LOD で端点が Compact Pose から外れた場合の分岐もありません。

## Bridge ダミーのコリジョンフィードバック

Bone Constraint の線は点の間をつなぐだけで、線の途中にコリジョンがありません。`BoneConstraintSubdivisionCount` が正の場合、線の上に Bridge ダミーを置いてコリジョンのセンサーにし、受けた押し出しを端点へ返します。ソースコメントによると、元の拘束は列の間隔の剛性を保つために置き換えず残します。

### 生成

`InsertBridgeDummiesForConstraints` は `MergedBoneConstraints` の全要素を走査します。自動生成のダミー拘束も対象です。次の拘束には Bridge ダミーを置きません。

- `bExcludeFromSubdivision` が有効
- `ModifyBoneIndex1` または `ModifyBoneIndex2` が無効
- 端点の球が重なっている（`Dist <= Max(R1 + R2, KINDA_SMALL_NUMBER)`）

`R1` と `R2` は `PhysicsSettings.Radius * Max(RadiusCurve(端点の LengthRateFromRoot), 0)` です。Settings Multiplier の倍率は含みません。

1つの拘束に `BoneConstraintSubdivisionCount` 個のダミーを、補間率 `(k + 1) / (N + 1)` で作ります。`InterBoneRealParentIndex` と `InterBoneRealChildIndex` に端点を、`LengthRateFromRoot` に両端点の平均を入れます。半径は `UpdatePhysicsSettingsOfModifyBones` が、この平均の `LengthRateFromRoot` で再計算します。

### 配置とフィードバック

<DocFigure src="/img/generated/internals-bridge-feedback-ja.svg" alt="Bridge ダミーの押し出しを InterBoneAlpha に応じて両端点へ配分し、端点ごとに集計・正規化する図" caption="Bridge の押し出しを端点1へ 1−α、端点2へ α の重みで集計し、max(1, 重みの合計) で正規化してスケールを掛けます。" maxWidth={960} />

`SimulateOnce` は `Simulate` のループの後に Bridge ダミーを両端点の間へ Lerp で置き、同じ値を `PoseLocation` に保存します。`PoseLocation` は押し出し量の基準です。

コリジョンの後、`ApplyBridgeDummyCollisionFeedback` が押し出しを端点へ返します。

```text
Bridge ダミーごとに
    Push = Location - PoseLocation
    端点1 へ重み (1 - Alpha)、端点2 へ重み Alpha で集計する
        PushSum[端点] += Push * 重み
        Weight[端点]  += 重み

端点ごとに、Weight が正なら
    Location += (PushSum / Max(1, Weight)) * BoneConstraintSubdivisionFeedbackScale
```

ソースコメントのとおり、端点ごとに集計するのは、同じ端点への過剰な押し出しを防ぐためです。重みの合計が 1 未満の端点は `Max(1, Weight)` により割り増しされません。

`bBoneSubdivisionCollisionOnly` が有効で端点が Inter-Bone ダミーの場合は、変位が再配置で消えるため、その重みをダミーの `InterBoneAlpha` で実端点へ分けます。

```text
実親への重み = 重み * (1 - InterBoneAlpha)
実子への重み = 重み * InterBoneAlpha
```

`BoneConstraintSubdivisionCount` が 0 以下、または `BoneConstraintSubdivisionFeedbackScale` が 0 以下の場合、関数は何もしません。実行時のスケールは評価の冒頭で 0〜2 にクランプされます。

### 実行順による制約

- コリジョン前の Bone Constraint は Bridge ダミーの配置の後に走ります。この反復で端点が動いても Bridge ダミーは置き直されず、コリジョンは配置時の位置で判定します。
- 外力の `PostApply` も配置の後に走ります。`PostApply` が Bridge ダミーの `Location` を動かすと、その変位も `Push` に含まれます。
- フィードバックはコリジョンの後、コリジョン後の Bone Constraint の前に走ります。端点の変位は、続く Bone Constraint と長さ復元で修正されます。
- 実ボーンの端点が LOD で外れると、その Bridge ダミーは `bSkipSimulate` が true になり、コリジョンとフィードバックの両方から外れます。

## 角度制限

<DocFigure src="/img/generated/internals-angle-modes-ja.svg" alt="回転ベクトルの角度空間で比較した円錐の円形領域と PerAxis の象限別の楕円領域" caption="橙の制限前の点から緑の制限後の点への補正と、円錐では制限なし、PerAxis では軸ロックとなる 0 の違いを示します。" maxWidth={960} />

`RestoreBoneLengthsAndLimits` から呼ばれる `AdjustByAngleLimit` は、親から見た子の方向をポーズの方向の近くへ戻します。基準は親の `PoseLocation` から子の `PoseLocation` への方向です。親の `Location` は回転の中心です。距離は変えません。

モードは `Bone.PhysicsSettings.LimitAngleMode` で分岐します。値は `UpdatePhysicsSettingsOfModifyBones` がノードの設定からコピーします。

### 円錐モード

`LimitAngle` が 0 の場合は何もしません。`Cone` の 0 は「制限なし」の意味です。

```text
BoneDir = Normalize(Bone.Location - Parent.Location)
PoseDir = Normalize(Bone.PoseLocation - Parent.PoseLocation)
Axis    = Cross(PoseDir, BoneDir)
Angle   = Atan2(|Axis|, Dot(PoseDir, BoneDir))
Over    = Degrees(Angle) - LimitAngle

Over が正なら
    BoneDir       = BoneDir を Normalize(Axis) まわりに -Over 度回転
    Bone.Location = Parent.Location + BoneDir * |Bone.Location - Parent.Location|
```

`Axis` がほぼ 0 になる場合（`PoseDir` と `BoneDir` が反平行）は、回転軸に `ParentBone.PoseRotation.GetAxisX()` を使います。これは `BoneForwardAxis` によらず X 軸です。この軸が `BoneDir` と平行な配置では、回転しても方向は変わりません。たとえば親の回転が Identity、`PoseDir` が +X、`BoneDir` が -X の場合です。

### PerAxis モード

`AdjustByPerAxisAngleLimit` は、方向を親の軸まわりの2つの回転角に分解して制限します。`LimitAngle` は使わず、`PerAxisLimitAngle` の X、Y、Z の範囲を使います。ここでの 0 は「その方向をロック」の意味で、円錐モードと逆です。計算は `KawaiiPhysics::AngleLimit` 名前空間にまとまっています。

**1. 有効な2軸の選択。** `BoneForwardAxis` と同じ軸はツイストにあたり、KawaiiPhysics はツイストを生成しないので無視します。残りの2軸を A、B とします。

| `BoneForwardAxis` | ツイスト軸 | A | B |
|---|---|---|---|
| `X_Positive`、`X_Negative` | X | Y | Z |
| `Y_Positive`、`Y_Negative` | Y | X | Z |
| `Z_Positive`、`Z_Negative` | Z | X | Y |

`MakeSwingLimit` がこの2軸の範囲を `FSwingLimit` の `MinA`、`MaxA`、`MinB`、`MaxB` に取り出します。

**2. 回転軸の組の作成。** `MakeSwingFrame` は親の `PoseRotation` のツイスト軸を `PoseDirection` へ重ねる回転を求め、A と B の軸に同じ回転を適用します。結果の `AxisA` と `AxisB` は `PoseDirection` に直交します。ツイスト軸が `PoseDirection` と逆向きの場合は符号を反転してから重ねるので、ヘッダのコメントのとおり、軸の符号は結果に影響しません。

**3. クランプ。** `ClampDirection` は、片方の軸だけがロックされているかどうかで分岐します。ロックの判定は `Max` と `-Min` がどちらも `LockedExtentDegrees`（0.01度）以下です。

片方だけがロックならヒンジとして、`ClampHingeDirection` がロックされていない軸のまわりの面内の角度で判定します。

```text
Tangent  = Cross(HingeAxis, PoseDirection)
Angle    = Degrees(Atan2(Dot(BoneDir, Tangent), Dot(BoneDir, PoseDirection)))
Angle が Min〜Max の外なら、円周上で近いほうの端へ
BoneDir  = PoseDirection * Cos(Angle) + Tangent * Sin(Angle)
```

ヒンジ面の外の成分はここで消えるので、角度が範囲内でも方向は面の上へ投影されます。ソースコメントによると、回転ベクトルに分解しない形にすることで、ポーズの真逆付近でも回転軸の向きに左右されません。

それ以外は `DecomposeSwing` で回転ベクトルの2成分 (A, B) へ分解し、`ClampSwing` で制限し、`ComposeSwing` で方向へ戻します。

```text
Cross          = Cross(PoseDirection, BoneDir)
AngleDegrees   = Degrees(Atan2(|Cross|, Dot(PoseDirection, BoneDir)))
RotationVector = (Cross / |Cross|) * AngleDegrees
A = Dot(RotationVector, AxisA)
B = Dot(RotationVector, AxisB)
```

`ClampSwing` は符号で使う範囲を選びます。A が 0 以上なら `MaxA`、負なら `-MinA` です。B も同じです。

| 条件 | 結果 |
|---|---|
| A 側の範囲が 0.01度以下 | A = 0、B は範囲で切り詰める |
| B 側の範囲が 0.01度以下 | B = 0、A は範囲で切り詰める |
| `(A / ExtentA)² + (B / ExtentB)² <= 1` | そのまま |
| それ以外 | 楕円上の最近傍点 |

範囲が等しければ楕円は円になり、円錐モードと同じ形です（テスト `MatchesCone`）。ソースコメントによると、中心へ縮める方法だと細い楕円で大きく引き戻されるため、最近傍点を使います。象限ごとに異なる範囲は軸の上でつながるので、象限をまたいでも飛びません。

最近傍点は `FindClosestPointOnEllipse` が Eberly の根関数を Newton 法で解いて求めます。ソースコメントのとおり、単精度では軸すれすれの点で桁落ちするので倍精度で計算します。反復は最大 12 回、許容誤差は 1.0e-9 で、最後に残差を除いて境界上へ載せます。

`BoneDir` が `PoseDirection` の真逆付近（`Cos` が負で `Sin` が 1.0e-4 以下）の場合は回転軸が定まらないので、`DecomposeSwing` は制限で最も広く動ける軸の向きを選びます。

倍率とカーブは `ScalePerAxisLimitAngle` が各軸の `Min` と `Max` に掛け、-180〜0、0〜180 にクランプします。倍率が 0 なら全軸がロックされます。

### 前方軸の不一致の検出

`MakeSwingFrame` は親のツイスト軸と `PoseDirection` のずれを補正するので、`BoneForwardAxis` が実際のボーンの方向と大きくずれていると、X、Y、Z の対応が意図と変わります。

`CountAngleLimitForwardAxisMismatches` は、PerAxis モードでずれが 45度を超える実ボーンを数えます。判定は `IsForwardAxisAligned` で、内積の絶対値が 0.70710678 以上なら揃っているとします。ダミーと、親がルートのボーンは数えません。ソースコメントによると、スカートや髪のように root から放射状に伸びる構成では、root 直下は前方軸と揃わないのが普通だからです。

Shipping 以外のビルドでは構築時に警告ログを1回出します。エディタのビューポートにも同じ内容を表示します。

### エディタのプレビュー

エディタの `DrawPerAxisLimitShape` は `MakeSwingFrame`、`MakeSwingLimit`、`EvaluateLimitBoundary`、`ComposeSwing` をソルバーと共有します。`IsAngleLimitTargetBone` もソルバーとプレビューで同じ判定です。

## 平面制約

`AdjustByPlanarConstraint` は、`PlanarConstraint` が `None` 以外のとき、子の `Location` を平面へ投影します。

| `PlanarConstraint` | 平面 |
|---|---|
| `X` | `ParentBone.Location` を通り、`ParentBone.PoseRotation` の X 軸を法線とする |
| `Y` | 同じ点を通り、Y 軸を法線とする |
| `Z` | 同じ点を通り、Z 軸を法線とする |

指定した軸は平面の法線です。指定した軸の方向の動きが消えます。軸は `BoneForwardAxis` に関係なく、親のポーズの回転の軸をそのまま使います。

投影で距離は変わりますが、この後の長さ復元で戻ります。子が親の位置へ投影された場合は方向が定まらないので、距離は 0 のままです。

平面制約は角度制限の後に走り、角度を再度判定しません。ポーズの方向が平面の外にある場合など、投影後の方向が角度の範囲を外れることがあります。

## 長さ復元

`RestoreBoneLengthsAndLimits` は配列を先頭から走査し、対象の点について次の3つを順に実行します。

```cpp
const FKawaiiPhysicsModifyBone& ParentBone = ModifyBones[GetAngleLimitParentIndex(Bone)];
AdjustByAngleLimit(Bone, ParentBone);
AdjustByPlanarConstraint(Bone, ParentBone);
const float BoneLength = (Bone.PoseLocation - ParentBone.PoseLocation).Size();
Bone.Location = (Bone.Location - ParentBone.Location).GetSafeNormal() * BoneLength + ParentBone.Location;
```

長さは `FKawaiiPhysicsModifyBone::BoneLength` を読まず、そのステップのポーズから計算します。サブステップではポーズが補間されるので、長さも補間後の値です。親が先に処理されるので、子は親の確定した `Location` を基準に置かれます。

方向は `GetSafeNormal()` で作ります。親子が同じ位置にあると方向は 0 になり、子は親の位置に置かれます。ポーズの長さが正でも距離は 0 のままです。

対象は `IsAngleLimitTargetBone` が決めます。`bSkipSimulate`、Bridge ダミー、コリジョン専用モードの Inter-Bone ダミーは対象外です。

`GetAngleLimitParentIndex` は、コリジョン専用モードのとき親が Inter-Bone ダミーの間 `ParentIndex` をたどり、実ボーンまで上がります。分割された末端ダミーも同じです。

`bBoneSubdivisionCollisionOnly` が有効な場合、ループの後に全 Inter-Bone ダミーの `Location` を、復元後の実端点の間へ Lerp で置き直します。ソースコメントのとおり、出力の回転と次のステップが参照する位置を実端点に合わせるためです。この再配置で、ダミーがコリジョンと Bone Constraint で受けた変位は消えます。詳細は[ボーンモデル](/docs/internals/bone-model)の比較表を参照してください。

## 状態とライフサイクル

| データ | 作成 | 破棄・更新 |
|---|---|---|
| `BoneConstraintsData` | `Initialize_AnyThread`、エディタの評価ごと | `ApplyBoneConstraintDataAsset` の先頭で空にする |
| `MergedBoneConstraints` | `ModifyBones` の構築時 | 次の構築で作り直す |
| `Length` | `InitBoneConstraints` | 次の構築まで固定 |
| `Lambda` | ブロックの開始時に 0 | ブロックの間だけ累積 |
| Bridge ダミー | `InitBoneConstraints` の末尾 | `ModifyBones` と同時 |

Teleport は `MergedBoneConstraints` に影響しません。`ModifyBones` を再構築するイベントでは `Length` がそのときのポーズで測り直されます。

`BoneConstraintsDataAsset` を実行中に変更すると、`UKawaiiPhysicsLibrary` は `RequestModifyBonesReinit` で再構築を要求します。ただし、`ApplyBoneConstraintDataAsset` の呼び出し元は前述の2箇所なので、エディタビルド以外の評価ループでは `BoneConstraintsData` を読み直しません。`bAutoAddChildDummyBoneConstraint` と `bExcludeFromSubdivision` の変更も、次の `InitBoneConstraints` で反映されます。

`BoneConstraintIterationCount...`、`BoneConstraintGlobalComplianceType`、`BoneConstraintSubdivisionFeedbackScale` は毎ステップ読むので、再構築なしで反映されます。

## 他機能との関係

**ボーンモデル:** `InitBoneConstraints` は `ModifyBones` の完成を前提にします。Bridge ダミーの追加は `MergedBoneConstraints` を変更しないため、走査の途中で配列が変わる問題はありません。

**コリジョン専用モード:** Inter-Bone ダミーの自動拘束は実行されますが、ダミーの変位は再配置で消えます。そのため、`bBoneSubdivisionCollisionOnly` が有効な場合、Inter-Bone ダミーどうしの拘束は実ボーンの位置を動かしません。この拘束に載る Bridge ダミーの押し出しは、実端点へ分配されます。

**コリジョン:** 長さ復元はコリジョンの後に走るので、復元の結果がコライダーの中へ戻る場合があります。次のステップのコリジョンで再び押し出されます。

**固定サブステップ:** Compliance は `GetStepDeltaTime()` で割るので、サブステップでは `FixedDt` が使われ、補正の強さは実フレーム時間に依存しません。レガシー経路では実フレーム時間が使われるため、拘束の柔らかさがフレームレートで変わります。

**Sync Bone:** Sync Bone は `PoseLocation` を動かすので、角度制限の基準方向と長さ復元の長さの両方が変わります。`Location` は直接動かしません。

**Settings Multiplier:** `LimitAngle` の倍率は `UpdatePhysicsSettingsOfModifyBones` で各ボーンの値に反映されます。Bone Constraint に倍率はありません。角度制限が読むのは各ボーンの `PhysicsSettings` です。`bUpdatePhysicsSettingsInGame` が無効なら、`ShouldUpdatePhysicsSettings` が真になるまで、ノードの設定を変えても角度制限には反映されません。

**ランタイム情報:** ランタイム情報の拘束一覧は `MergedBoneConstraints` を読みます。`IsValid()` が偽の拘束と端点が無効な拘束は含みません。

## 変更するときの注意

- **補正の順序は挙動そのもの。** `SimulateOnce` の順序を入れ替えると、どの補正が最後に勝つかが変わります。`Golden` テストの `Constraint` と `Collision` の期待値が変わります。
- **`MergedBoneConstraints` の並びを変えない。** ランタイム情報の `SourceType` は、`BoneConstraints.Num()` との比較で種別を判定します。
- **Compliance の値を変えると既存のアセットの見た目が変わる。** `XPBDComplianceValues` は enum の順に対応します。enum の値を増やすときは配列も増やしてください。範囲外の値は末尾にクランプされます。
- **`bSkipSimulate` の点を動かす処理を足す場合は、ルートの扱いを確認する。** Bone Constraint と Bridge フィードバックはルートの `Location` を動かします。ルートは出力で位置を使わず、次のステップの冒頭でポーズへ戻ります。
- **`Location` を置き直す処理と再配置の順序に注意する。** コリジョン専用モードの Inter-Bone ダミーの `Location` は `RestoreBoneLengthsAndLimits` の最後に上書きされます。ダミーの変位を実ボーンへ返す処理を足す場合は、この上書きより前に行う必要があります。
- **角度制限の新しい形状は `KawaiiPhysicsAngleLimit` に置く。** ヘッダのコメントのとおり、ソルバーとプレビューが同じ計算を使う設計です。
- **`InitBoneConstraints` と `InsertBridgeDummiesForConstraints`、`AdjustByPlanarConstraint` を直接実行するテストはない。** 変更した場合はエディタで確認してください。

| テスト | 守っている内容 |
|---|---|
| `KawaiiPhysics.Simulation.GoldenPositions` | `Constraint` シナリオの全ボーンの最終位置（ビット一致） |
| `KawaiiPhysics.Simulation.BoneConstraintStepDeltaTime` | XPBD の式と `StepDt` の使用 |
| `KawaiiPhysics.Simulation.BridgeDummyCollisionFeedback` | フィードバックの重み付けと実端点への分配 |
| `KawaiiPhysics.Simulation.SubdivisionCollisionOnlyRestore` | 長さ復元と Inter-Bone ダミーの再配置 |
| `KawaiiPhysics.Collision.AngleLimit` | 円錐モードの制限と距離の保存 |
| `KawaiiPhysics.AngleLimit.PerAxis.*` | ヒンジ、片側の範囲、円錐との一致、細い楕円、真逆、軸の組、倍率、チェーン |

## 関連ページ

- [シミュレーション](/docs/internals/simulation)
- [ボーンモデル](/docs/internals/bone-model)
- [ローカルコリジョン](/docs/internals/collision)
- [Sync Bone](/docs/internals/sync-bone)
- [Data Asset とプリセット](/docs/internals/presets-and-data-assets)
- [Bone Constraint（ボーン間拘束）](/docs/features/bone-constraint)
- [ボーン細分化](/docs/features/bone-subdivision)
- [リミットパラメータ](/docs/parameters/limits)
