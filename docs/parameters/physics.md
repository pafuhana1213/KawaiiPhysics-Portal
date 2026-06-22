---
sidebar_position: 2
title: "物理パラメータ"
---

# 物理パラメータ

<!-- AUTO-GENERATED: このページはソースコードから自動生成されます -->

物理シミュレーションの基本動作を制御するパラメータです。

[ソースを見る](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNode_KawaiiPhysics.h)

## FKawaiiPhysicsSettings

物理制御の基本設定を定義する構造体です。

### Damping

**減衰係数** - 揺れの強さを制御します。値が小さいほど、加速度を物理挙動に反映します。

| プロパティ | 値 |
|-----------|-----|
| 型 | float |
| デフォルト | 0.1 |
| 範囲 | 0.0 以上 |
| カテゴリ | KawaiiPhysics |

### Stiffness

**剛性** - 値が大きいほど、元の形状を維持します。

| プロパティ | 値 |
|-----------|-----|
| 型 | float |
| デフォルト | 0.05 |
| 範囲 | 0.0 以上 |
| カテゴリ | KawaiiPhysics |

### WorldDampingLocation

**ワールド座標系におけるSkeletal Mesh Componentの移動量の反映度**

| プロパティ | 値 |
|-----------|-----|
| 型 | float |
| デフォルト | 0.8 |
| 範囲 | 0.0 以上 |
| カテゴリ | KawaiiPhysics |

### WorldDampingRotation

**ワールド座標系におけるSkeletal Mesh Componentの回転量の反映度**

| プロパティ | 値 |
|-----------|-----|
| 型 | float |
| デフォルト | 0.8 |
| 範囲 | 0.0 以上 |
| カテゴリ | KawaiiPhysics |

### Radius

**各ボーンのコリジョン半径**

| プロパティ | 値 |
|-----------|-----|
| 型 | float |
| デフォルト | 3.0 |
| 範囲 | 0.0 以上 |
| カテゴリ | KawaiiPhysics |

### LimitAngle

**物理挙動による回転制限** - 適切に設定することで荒ぶりを抑制できます。

| プロパティ | 値 |
|-----------|-----|
| 型 | float |
| デフォルト | 0.0 |
| 範囲 | 0.0 以上 |
| カテゴリ | KawaiiPhysics |

## シミュレーション設定

### SimulationSpace

**シミュレーション空間** - 物理制御を行う座標系を指定します。

| プロパティ | 値 |
|-----------|-----|
| 型 | EKawaiiPhysicsSimulationSpace |
| デフォルト | ComponentSpace |

| 値 | 説明 |
|-----|------|
| ComponentSpace | コンポーネント空間でシミュレーション |
| WorldSpace | ワールド空間でシミュレーション。Rootボーンの急激な移動・回転の影響を回避可能 |
| BaseBoneSpace | 指定したボーン空間でシミュレーション |

![SimulationSpaceの比較](/img/generated/simulation-space-comparison.svg)

*各SimulationSpaceの違いを示す概念図*

:::note
ComponentSpace以外を使用すると微小のパフォーマンス低下が発生しますが、急激なRootボーンの移動・回転の影響を回避できます。
:::

### SimulationBaseBone

**シミュレーション基準ボーン** - BaseBone座標系時の基準となるボーン。

| プロパティ | 値 |
|-----------|-----|
| 型 | FBoneReference |
| カテゴリ | Physics Settings |

:::note
SimulationSpaceがBaseBoneSpaceの場合のみ有効です。
:::

### TargetFramerate

**ターゲットフレームレート** - 物理シミュレーションのターゲットとなるフレームレート。

| プロパティ | 値 |
|-----------|-----|
| 型 | int32 |
| デフォルト | 60 |
| カテゴリ | Physics Settings |

### OverrideTargetFramerate

**フレームレートオーバーライド** - TargetFramerateを使用するかどうかのフラグ。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | false |
| カテゴリ | Physics Settings |

### TeleportDistanceThreshold

**テレポート距離しきい値** - 1フレームにおけるSkeletalMeshComponentの移動量が設定値を超えた場合、その移動量を物理制御に反映しません。

| プロパティ | 値 |
|-----------|-----|
| 型 | float |
| デフォルト | 300.0 |

### TeleportRotationThreshold

**テレポート回転しきい値** - 1フレームにおけるSkeletalMeshComponentの回転量が設定値を超えた場合、その回転量を物理制御に反映しません。

| プロパティ | 値 |
|-----------|-----|
| 型 | float |
| デフォルト | 10.0 |

![Teleport Thresholdの動作](/img/generated/teleport-threshold-concept.svg)

*しきい値を超える移動があった場合、物理に反映されずテレポート扱いになる*

### PlanarConstraint

**平面制約** - 指定した軸に応じた平面上に各ボーンを固定します。

| プロパティ | 値 |
|-----------|-----|
| 型 | EPlanarConstraint |
| デフォルト | None |

| 値 | 説明 |
|-----|------|
| None | 平面制約なし |
| X | X軸に制約 |
| Y | Y軸に制約 |
| Z | Z軸に制約 |

![PlanarConstraintの効果](/img/generated/planar-constraint-effect.svg)

*各軸での平面制約の効果*

### SkelCompMoveScale

**コンポーネント移動スケール** - SkeletalMeshComponentの移動量を物理挙動に反映する際に適用されるスケール。

| プロパティ | 値 |
|-----------|-----|
| 型 | FVector |
| デフォルト | (1, 1, 1) |

## ボーン設定

### RootBone

**制御ルートボーン** - 指定ボーンとそれ以下のボーンを制御対象にします。

| プロパティ | 値 |
|-----------|-----|
| 型 | FBoneReference |
| カテゴリ | Bones |

### ExcludeBones

**除外ボーン** - 指定したボーンとそれ以下のボーンを制御対象から除去します。

| プロパティ | 値 |
|-----------|-----|
| 型 | TArray\<FBoneReference\> |
| カテゴリ | Bones |

### AdditionalRootBones

**追加ルートボーン** - 指定ボーンとそれ以下のボーンを制御対象に追加します（複数追加用）。

| プロパティ | 値 |
|-----------|-----|
| 型 | TArray\<FKawaiiPhysicsRootBoneSetting\> |
| カテゴリ | Bones |

各要素には以下のプロパティがあります：
- `RootBone`: 制御対象のルートボーン
- `OverrideExcludeBones`: このルートボーン専用の除外ボーンリスト
- `bUseOverrideExcludeBones`: 除外ボーンオーバーライドの有効化

### DummyBoneLength

**ダミーボーン長** - 0より大きい場合は、制御ボーンの末端にダミーボーンを追加します。ダミーボーンを追加することで、末端のボーンの物理制御を改善します。

| プロパティ | 値 |
|-----------|-----|
| 型 | float |
| デフォルト | 0.0 |
| 範囲 | 0.0 以上 |

![DummyBoneの効果](/img/generated/dummybone-effect.svg)

*DummyBoneを追加することで末端ボーンの動きが安定する*

### BoneForwardAxis

**ボーン前方向** - ボーンの前方向。物理制御やダミーボーンの配置位置に影響します。

| プロパティ | 値 |
|-----------|-----|
| 型 | EBoneForwardAxis |
| デフォルト | X_Positive |

| 値 | 説明 |
|-----|------|
| X_Positive | +X方向 |
| X_Negative | -X方向 |
| Y_Positive | +Y方向 |
| Y_Negative | -Y方向 |
| Z_Positive | +Z方向 |
| Z_Negative | -Z方向 |

## ボーン細分化（Bone Subdivision）

実スケルトンを変更せずに、シミュレーション内部で実ボーンの間に仮想ダミーを挿入し、コリジョン判定の解像度を上げる設定です。詳しくは [Bone Subdivision](/docs/features/bone-subdivision) を参照してください。

### BoneSubdivisionCount

**ダミー分割数** - 隣接するボーン間に挿入するダミーボーンの最小分割数。コリジョン検出の精度を向上させます（例: スカートの足貫通防止）。0で無効。

| プロパティ | 値 |
|-----------|-----|
| 型 | int32 |
| デフォルト | 0 |
| 範囲 | 0 - 10 |
| カテゴリ | Bones&#124;Bone Subdivision |

### bBoneSubdivisionCollisionOnly

**コリジョン専用** - ボーン間ダミーの速度積分（重力・風など）をスキップし、実ボーン間の補間位置からコリジョン・制約にのみ参加させます（軽量）。配置数には影響しません。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | true |
| 編集条件 | `BoneSubdivisionCount > 0` |
| カテゴリ | Bones&#124;Bone Subdivision |

### bBoneSubdivisionDensifyByRadius

**半径による密度補正** - 半径に応じてダミーを追加配置し、コリジョン球でボーン間を概ね隙間なく被覆します。`BoneSubdivisionCount` を最小として、離れた区間ほど多く配置します（1区間あたり最大50本）。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | false |
| 編集条件 | `BoneSubdivisionCount > 0` |
| カテゴリ | Bones&#124;Bone Subdivision |

### BoneConstraintSubdivisionCount

**横方向分割数** - 横方向のBoneConstraintに沿って挿入するコリジョン代理ダミー（bridge dummy）の分割数。隣接チェーン（列）間の隙間を埋めて貫通を防ぎます。0で無効。`BoneSubdivisionCount` とは独立。

| プロパティ | 値 |
|-----------|-----|
| 型 | int32 |
| デフォルト | 0 |
| 範囲 | 0 - 10 |
| カテゴリ | Bones&#124;Bone Subdivision |

### BoneConstraintSubdivisionFeedbackScale

**フィードバック強度** - bridge dummy が受けたコリジョンの押し出しを端点ボーンに伝える強さ（0=伝えない、1=標準）。剛性が強すぎる場合は下げます。

| プロパティ | 値 |
|-----------|-----|
| 型 | float |
| デフォルト | 1.0 |
| 範囲 | 0.0 - 2.0 |
| 編集条件 | `BoneConstraintSubdivisionCount > 0` |
| カテゴリ | Bones&#124;Bone Subdivision |

## ウォームアップ設定

### WarmUpFrames

**ウォームアップフレーム数** - 物理の空回し回数。物理処理が落ち着いてから開始・表示したい際に使用します。

| プロパティ | 値 |
|-----------|-----|
| 型 | int32 |
| デフォルト | 0 |
| 範囲 | 0 以上 |

### bNeedWarmUp

**ウォームアップ有効化** - ウォームアップを有効にするフラグ。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | false |

### bUseWarmUpWhenResetDynamics

**リセット時ウォームアップ** - ResetDynamics時に物理の空回しを行うフラグ。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | true |

## カーブによる制御

以下のパラメータはカーブで制御可能です。「RootBoneから特定のボーンまでの長さ / RootBoneから末端のボーンまでの長さ」(0.0~1.0)の値におけるカーブの値を各パラメータに乗算します。

| カーブ | 説明 |
|-------|------|
| DampingCurveData | Dampingパラメータを補正 |
| StiffnessCurveData | Stiffnessパラメータを補正 |
| WorldDampingLocationCurveData | WorldDampingLocationパラメータを補正 |
| WorldDampingRotationCurveData | WorldDampingRotationパラメータを補正 |
| RadiusCurveData | Radiusパラメータを補正 |
| LimitAngleCurveData | LimitAngleパラメータを補正 |

:::tip
カーブを使用することで、根元は硬く先端は柔らかくといった設定が可能です。
:::

## 高度な設定

### bUpdatePhysicsSettingsInGame

**ゲーム中パラメータ更新** - 各ボーンの物理パラメータを毎フレーム更新するフラグ。無効にするとパフォーマンスが僅かに改善しますが、実行中に物理パラメータを変更することが不可能になります。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | true |

### ResetBoneTransformWhenBoneNotFound

**ボーン未検出時リセット** - 制御対象のボーンが見つからない場合にTransformをリセットするフラグ。基本的には無効を推奨。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | false |
