---
sidebar_position: 4
title: "リミットパラメータ"
---

# リミットパラメータ

<!-- AUTO-GENERATED: このページはソースコードから自動生成されます -->

ボーンの移動・回転を制限するパラメータです。

[ソースを見る](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNode_KawaiiPhysics.h)

## Bone Constraint

ボーン間の距離を維持するための制約設定です。スカートのように、ボーン間の距離を一定に保ちたい場合に使用します。

![Bone Constraintの仕組み](/img/generated/bone-constraint-concept.svg)

*Bone Constraintによるボーン間距離の維持*

### BoneConstraintGlobalComplianceType

**剛性タイプ** - Bone Constraintで用いる剛性タイプを指定します。

| プロパティ | 値 |
|-----------|-----|
| 型 | EXPBDComplianceType |
| デフォルト | Leather |
| カテゴリ | Bone Constraint |

[XPBD Stiffnessについて](http://blog.mmacklin.com/2016/10/12/xpbd-slides-and-stiffness/)

### EXPBDComplianceType

| 値 | 説明 |
|-----|------|
| Concrete | コンクリート（最も硬い） |
| Wood | 木材 |
| Leather | 革 |
| Tendon | 腱 |
| Rubber | ゴム |
| Muscle | 筋肉 |
| Fat | 脂肪（最も柔らかい） |

![剛性タイプの比較](/img/generated/compliance-type-comparison.svg)

*各剛性タイプの硬さの違いと使用イメージ*

### BoneConstraintIterationCountBeforeCollision

**コリジョン前処理回数** - Bone Constraintの処理回数（コリジョン処理前）。

| プロパティ | 値 |
|-----------|-----|
| 型 | int32 |
| デフォルト | 1 |
| カテゴリ | Bone Constraint |

### BoneConstraintIterationCountAfterCollision

**コリジョン後処理回数** - Bone Constraintの処理回数（コリジョン処理後）。

| プロパティ | 値 |
|-----------|-----|
| 型 | int32 |
| デフォルト | 1 |
| カテゴリ | Bone Constraint |

![反復処理の効果](/img/generated/bone-constraint-iteration.svg)

*反復回数による収束の違い。回数が多いほどボーン間距離が均等になる*

### bAutoAddChildDummyBoneConstraint

**ダミーボーン自動追加** - 末端ボーンをBoneConstraint処理の対象にした場合、自動的にダミーボーンも処理対象にするフラグ。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | true |
| カテゴリ | Bone Constraint |

### BoneConstraints

**ボーン制約リスト** - BoneConstraint処理の対象となるボーンのペアを設定します。

```cpp
UPROPERTY(EditAnywhere, Category = "Bone Constraint")
TArray<FModifyBoneConstraint> BoneConstraints;
```

### FModifyBoneConstraint

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| Bone1 | FBoneReference | 制約の1つ目のボーン |
| Bone2 | FBoneReference | 制約の2つ目のボーン |
| bOverrideCompliance | bool | 剛性タイプをオーバーライドするか |
| ComplianceType | EXPBDComplianceType | オーバーライド時の剛性タイプ |
| bExcludeFromSubdivision | bool | この制約を BoneConstraint Subdivision（bridge dummy）の対象から除外するか |

### BoneConstraintsDataAsset

**ボーン制約Data Asset** - BoneConstraint処理の対象となるボーンのペアをData Assetから設定します。別のAnimNodeやAnimation Blueprintで設定を流用したい場合に推奨されます。

```cpp
UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Bone Constraint")
TObjectPtr<UKawaiiPhysicsBoneConstraintsDataAsset> BoneConstraintsDataAsset;
```

## Sync Bone

同期元のボーンの移動・回転を物理制御下のボーンに適用します。スカートが足などを貫通するのを防ぐのに役立ちます。v1.21.0で適用方向・距離減衰・スケールカーブが追加されました。

### SyncBones

**同期ボーンリスト** - 同期元のボーン（`Bone`）と同期先（`TargetRoots`）を設定します。

```cpp
UPROPERTY(EditAnywhere, Category = "Force|Sync Bone")
TArray<FKawaiiPhysicsSyncBone> SyncBones;
```

#### FKawaiiPhysicsSyncBone の主なプロパティ

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| Bone | FBoneReference | 同期元のボーン |
| TargetRoots | TArray\<FKawaiiPhysicsSyncTargetRoot\> | 同期先のボーン/チェーン（`bIncludeChildBones` で子も対象化） |
| GlobalScale | FVector | 全体の適用度（0.0〜1.0、既定 (1,1,1)） |
| ScaleCurveByDeltaDistance | FRuntimeFloatCurve | 同期元の移動距離に応じた補正スケール |
| ApplyDirectionX / Y / Z | ESyncBoneDirection | 各軸の適用方向（Both/Positive/Negative/None） |
| bEnableDistanceAttenuation | bool | 距離に応じた適用量の減衰 |
| AttenuationInnerRadius / OuterRadius | float | 減衰の内半径 / 外半径（cm） |
| MaxAttenuationRate | float | 最大減衰量（0〜1） |

詳しくは [Sync Bone](/docs/features/sync-bone) を参照してください。

## 角度制限

### LimitAngle

物理挙動による回転制限です。適切に設定することで荒ぶりを抑制できます。

| プロパティ | 値 |
|-----------|-----|
| 型 | float |
| デフォルト | 0.0（制限なし） |
| 範囲 | 0.0 以上 |
| カテゴリ | KawaiiPhysics |

:::tip
LimitAngleは各ボーンの親ボーンからの角度を制限します。値を大きくすると自由度が下がり、小さくすると荒ぶりやすくなります。
:::

## Data Assetからの読み込み

制限パラメータは以下のData Assetから読み込むことができます：

### UKawaiiPhysicsLimitsDataAsset

コリジョン設定を管理するData Assetです。

```cpp
UCLASS(Blueprintable)
class KAWAIIPHYSICS_API UKawaiiPhysicsLimitsDataAsset : public UDataAsset
```

#### プロパティ

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| SphericalLimits | TArray\<FSphericalLimit\> | 球体コリジョンリスト |
| CapsuleLimits | TArray\<FCapsuleLimit\> | カプセルコリジョンリスト |
| BoxLimits | TArray\<FBoxLimit\> | ボックスコリジョンリスト |
| PlanarLimits | TArray\<FPlanarLimit\> | 平面コリジョンリスト |

エディタでは、Skeletonを設定することでボーンプレビューが可能です。

詳しくは [Data Assets](/docs/features/data-assets) を参照してください。
