---
sidebar_position: 1
title: "FAnimNode_KawaiiPhysics"
---

# FAnimNode_KawaiiPhysics

<!-- AUTO-GENERATED: このページはソースコードから自動生成されます -->

KawaiiPhysicsのメインAnimGraphノードのAPIリファレンスです。

[ソースを見る](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNode_KawaiiPhysics.h)

## クラス定義

```cpp
USTRUCT(BlueprintType)
struct KAWAIIPHYSICS_API FAnimNode_KawaiiPhysics : public FAnimNode_SkeletalControlBase
```

## ボーン設定

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| RootBone | FBoneReference | - | 制御対象のルートボーン |
| ExcludeBones | TArray\<FBoneReference\> | - | 制御から除外するボーン |
| AdditionalRootBones | TArray\<FKawaiiPhysicsRootBoneSetting\> | - | 追加のルートボーン設定 |
| DummyBoneLength | float | 0.0 | ダミーボーンの長さ |
| BoneSubdivisionCount | int32 | 0 | ボーン間ダミー分割数（0-10、0で無効） |
| bBoneSubdivisionCollisionOnly | bool | true | ボーン間ダミーをコリジョン専用にする |
| bBoneSubdivisionDensifyByRadius | bool | false | 半径に応じてダミーを追加配置 |
| BoneConstraintSubdivisionCount | int32 | 0 | 横方向bridgeダミー分割数（0-10、0で無効） |
| BoneConstraintSubdivisionFeedbackScale | float | 1.0 | bridgeフィードバック強度（0-2） |
| BoneForwardAxis | EBoneForwardAxis | X_Positive | ボーンの前方向軸 |

## Physics Settings

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| PhysicsSettings | FKawaiiPhysicsSettings | - | 物理制御の基本設定 |
| SimulationSpace | EKawaiiPhysicsSimulationSpace | ComponentSpace | シミュレーション空間 |
| SimulationBaseBone | FBoneReference | - | BaseBone空間時の基準ボーン |
| TargetFramerate | int32 | 60 | ターゲットフレームレート |
| OverrideTargetFramerate | bool | false | フレームレートのオーバーライド |
| TeleportDistanceThreshold | float | 300.0 | テレポート距離しきい値 |
| TeleportRotationThreshold | float | 10.0 | テレポート回転しきい値 |
| PlanarConstraint | EPlanarConstraint | None | 平面制約 |
| SkelCompMoveScale | FVector | (1, 1, 1) | コンポーネント移動スケール |

## ウォームアップ設定

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| WarmUpFrames | int32 | 0 | ウォームアップフレーム数 |
| bNeedWarmUp | bool | false | ウォームアップ有効化 |
| bUseWarmUpWhenResetDynamics | bool | true | リセット時ウォームアップ |

## カーブ

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| DampingCurveData | FRuntimeFloatCurve | 減衰カーブ |
| StiffnessCurveData | FRuntimeFloatCurve | 剛性カーブ |
| WorldDampingLocationCurveData | FRuntimeFloatCurve | ワールド位置減衰カーブ |
| WorldDampingRotationCurveData | FRuntimeFloatCurve | ワールド回転減衰カーブ |
| RadiusCurveData | FRuntimeFloatCurve | 半径カーブ |
| LimitAngleCurveData | FRuntimeFloatCurve | 角度制限カーブ |

## コリジョン（Limits）

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| SphericalLimits | TArray\<FSphericalLimit\> | 球体コリジョン |
| CapsuleLimits | TArray\<FCapsuleLimit\> | カプセルコリジョン |
| BoxLimits | TArray\<FBoxLimit\> | ボックスコリジョン |
| PlanarLimits | TArray\<FPlanarLimit\> | 平面コリジョン |
| LimitsDataAsset | UKawaiiPhysicsLimitsDataAsset* | コリジョンData Asset |
| PhysicsAssetForLimits | UPhysicsAsset* | コリジョン用Physics Asset |

## Shared Collision

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| bSharedCollisionSource | bool | false | コリジョンを公開する（Source） |
| bUseSharedCollision | bool | false | 共有コリジョンを使用する（Target） |
| SharedCollisionGroupTag | FGameplayTag | - | 共有グループの識別タグ |

## Bone Constraint

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| BoneConstraintGlobalComplianceType | EXPBDComplianceType | Leather | 剛性タイプ |
| BoneConstraintIterationCountBeforeCollision | int32 | 1 | コリジョン前処理回数 |
| BoneConstraintIterationCountAfterCollision | int32 | 1 | コリジョン後処理回数 |
| bAutoAddChildDummyBoneConstraint | bool | true | ダミーボーン自動追加 |
| BoneConstraints | TArray\<FModifyBoneConstraint\> | - | ボーン制約リスト |
| BoneConstraintsDataAsset | UKawaiiPhysicsBoneConstraintsDataAsset* | - | 制約Data Asset |

## Sync Bone

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| SyncBones | TArray\<FKawaiiPhysicsSyncBone\> | 同期ボーンリスト |

## 外部力

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| Gravity | FVector | ZeroVector | 重力ベクトル |
| bUseLegacyGravity | bool | false | レガシー重力方式 |
| bUseDefaultGravityZProjectSetting | bool | false | プロジェクト設定の重力使用 |
| bUseWorldSpaceGravity | bool | true | ワールド空間重力 |
| bEnableWind | bool | false | 風の有効化 |
| WindScale | float | 1.0 | 風のスケール |
| WindDirectionNoiseAngle | float | 0.0 | 風方向ノイズ（度） |
| SimpleExternalForce | FVector | ZeroVector | 単純な外力 |
| bUseWorldSpaceSimpleExternalForce | bool | true | ワールド空間外力 |
| ExternalForces | TArray\<FInstancedStruct\> | - | 外力プリセット |
| CustomExternalForces | TArray\<UKawaiiPhysics_CustomExternalForce*\> | - | カスタム外力 |

## World Collision

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| bAllowWorldCollision | bool | false | ワールドコリジョン有効化 |
| bOverrideCollisionParams | bool | false | コリジョンパラメータオーバーライド |
| CollisionChannelSettings | FBodyInstance | - | コリジョン設定 |
| bIgnoreSelfComponent | bool | true | 自己コリジョン無視 |
| IgnoreBones | TArray\<FBoneReference\> | - | 無視ボーンリスト |
| IgnoreBoneNamePrefix | TArray\<FName\> | - | 無視ボーン名プリフィックス |

## タグ

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| KawaiiPhysicsTag | FGameplayTag | フィルタリング用タグ |

## ランタイムデータ

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| ModifyBones | TArray\<FKawaiiPhysicsModifyBone\> | 物理制御対象のボーン |
| DeltaTime | float | フレームのデルタタイム |

## 主要メソッド

### Initialize_AnyThread

```cpp
virtual void Initialize_AnyThread(const FAnimationInitializeContext& Context) override;
```

ノードの初期化処理。ボーンチェーンの構築やパラメータの初期化を行います。

### CacheBones_AnyThread

```cpp
virtual void CacheBones_AnyThread(const FAnimationCacheBonesContext& Context) override;
```

ボーン参照のキャッシュ処理。

### UpdateInternal

```cpp
virtual void UpdateInternal(const FAnimationUpdateContext& Context) override;
```

フレームごとの更新処理。

### EvaluateSkeletalControl_AnyThread

```cpp
virtual void EvaluateSkeletalControl_AnyThread(
    FComponentSpacePoseContext& Output,
    TArray<FBoneTransform>& OutBoneTransforms
) override;
```

物理シミュレーションの評価とボーン変換の出力。

### ResetDynamics

```cpp
virtual void ResetDynamics(ETeleportType InTeleportType) override;
```

物理状態のリセット。テレポート時などに使用します。

### PreUpdate

```cpp
virtual void PreUpdate(const UAnimInstance* InAnimInstance) override;
```

更新前の処理。シーン情報の取得などを行います。

## 座標変換ヘルパー

### GetBoneTransformInSimSpace

```cpp
FTransform GetBoneTransformInSimSpace(
    FComponentSpacePoseContext& Output,
    const FCompactPoseBoneIndex& BoneIndex
) const;
```

ボーンのTransformをシミュレーション空間で取得します。

### ConvertSimulationSpaceTransform

```cpp
FTransform ConvertSimulationSpaceTransform(
    FComponentSpacePoseContext& Output,
    EKawaiiPhysicsSimulationSpace From,
    EKawaiiPhysicsSimulationSpace To,
    const FTransform& InTransform
) const;
```

シミュレーション空間間でTransformを変換します。

## 使用例

Animation Blueprintでの基本的な使用方法:

1. AnimGraphにKawaiiPhysicsノードを追加
2. RootBoneを設定
3. PhysicsSettingsでDamping/Stiffnessを調整
4. 必要に応じてコリジョンを追加

```cpp
// C++からのアクセス例
FAnimNode_KawaiiPhysics* Node = ...;
Node->PhysicsSettings.Damping = 0.2f;
Node->PhysicsSettings.Stiffness = 0.1f;
Node->Gravity = FVector(0, 0, -980.0f);
```

## 関連

- [パラメータリファレンス](/docs/parameters/overview)
- [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library)
- [Physics パラメータ](/docs/parameters/physics)
- [Collision パラメータ](/docs/parameters/collision)
