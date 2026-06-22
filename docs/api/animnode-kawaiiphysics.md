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

## Bones（ボーン設定）

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| RootBone | FBoneReference | - | 制御対象のルートボーン（子孫ボーンも対象） |
| ExcludeBones | TArray\<FBoneReference\> | - | 制御から除外するボーン（指定ボーンとその子孫） |
| AdditionalRootBones | TArray\<FKawaiiPhysicsRootBoneSetting\> | - | 追加のルートボーン設定 |
| DummyBoneLength | float | 0.0 | 末端ボーンの回転を改善するための末端ダミーボーン長（0で無効、ClampMin=0） |
| BoneForwardAxis | [EBoneForwardAxis](#eboneforwardaxis) | X_Positive | ボーンの前方向軸（ダミーボーン配置に影響） |
| ModifyBones | TArray\<FKawaiiPhysicsModifyBone\> | - | （ランタイム / Transient）物理制御対象ボーンのキャッシュ |

### Bones \| Bone Subdivision（ボーン分割）

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| BoneSubdivisionCount | int32 | 0 | ボーン間ダミー分割数（ClampMin=0, ClampMax=10、0で無効） |
| bBoneSubdivisionCollisionOnly | bool | true | ボーン間ダミーを速度積分から除外しコリジョン/制約専用にする |
| bBoneSubdivisionDensifyByRadius | bool | false | 半径に応じてダミーを追加配置しコリジョン球の隙間を埋める |
| BoneConstraintSubdivisionCount | int32 | 0 | 横方向BoneConstraintに沿ったコリジョンプロキシダミー数（ClampMin=0, ClampMax=10、0で無効） |
| BoneConstraintSubdivisionFeedbackScale | float | 1.0 | bridgeダミーのコリジョン変位を端点ボーンへ伝える強度（ClampMin=0.0, ClampMax=2.0） |

## Physics Settings（物理設定）

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| PhysicsSettings | [FKawaiiPhysicsSettings](#fkawaiiphysicssettings) | - | 物理制御の基本設定（Damping / Stiffness / Radius など） |
| SimulationSpace | [EKawaiiPhysicsSimulationSpace](#ekawaiiphysicssimulationspace) | ComponentSpace | シミュレーション空間 |
| SimulationBaseBone | FBoneReference | - | `BaseBoneSpace` 選択時の基準ボーン |
| TargetFramerate | int32 | 60 | 物理ステップのターゲットフレームレート（ClampMin=1） |
| TeleportDistanceThreshold | float | 300.0 | この距離以上の移動でテレポート扱いにする |
| TeleportRotationThreshold | float | 10.0 | この角度以上の回転でテレポート扱いにする |
| PlanarConstraint | [EPlanarConstraint](#eplanarconstraint) | None | 各ボーンを平面上に拘束する |
| SkelCompMoveScale | FVector | (1, 1, 1) | コンポーネント移動を物理へ反映する際のスケール |
| WarmUpFrames | int32 | 0 | ウォームアップフレーム数（bNeedWarmUp有効時） |
| bNeedWarmUp | bool | false | ウォームアップの有効化 |
| bUseWarmUpWhenResetDynamics | bool | true | ResetDynamics時にウォームアップを行う |
| bUpdatePhysicsSettingsInGame | bool | true | 毎フレーム各ボーンの物理パラメータを更新（AdvancedDisplay、無効化で軽量化） |
| ResetBoneTransformWhenBoneNotFound | bool | false | 制御対象ボーンが見つからない場合にTransformをリセット（AdvancedDisplay） |

### Physics Settings \| Curves（カーブ）

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| DampingCurveData | FRuntimeFloatCurve | 減衰カーブ |
| StiffnessCurveData | FRuntimeFloatCurve | 剛性カーブ |
| WorldDampingLocationCurveData | FRuntimeFloatCurve | ワールド位置減衰カーブ |
| WorldDampingRotationCurveData | FRuntimeFloatCurve | ワールド回転減衰カーブ |
| RadiusCurveData | FRuntimeFloatCurve | 半径カーブ |
| LimitAngleCurveData | FRuntimeFloatCurve | 角度制限カーブ |

すべて RootBone からのボーン長比（0.0〜1.0）に応じて各パラメータへ乗算されます（AdvancedDisplay）。

## Limits（コリジョン）

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| SphericalLimits | TArray\<FSphericalLimit\> | 球体コリジョン |
| CapsuleLimits | TArray\<FCapsuleLimit\> | カプセルコリジョン |
| BoxLimits | TArray\<FBoxLimit\> | ボックスコリジョン |
| PlanarLimits | TArray\<FPlanarLimit\> | 平面コリジョン |
| LimitsDataAsset | UKawaiiPhysicsLimitsDataAsset* | コリジョンData Asset（共有可能） |
| PhysicsAssetForLimits | UPhysicsAsset* | コリジョンソースとして使うPhysics Asset |

:::note
`SphericalLimitsData` / `CapsuleLimitsData` / `BoxLimitsData` / `PlanarLimitsData` は、`LimitsDataAsset` や `PhysicsAssetForLimits` から取り込んだコリジョンをプレビュー表示する **読み取り専用（Transient / VisibleAnywhere）** の配列です。直接編集はできません。
:::

### Limits \| Shared Collision（共有コリジョン）

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| bSharedCollisionSource | bool | false | コリジョンを公開する（Source） |
| bUseSharedCollision | bool | false | 共有コリジョンを使用する（Target） |
| SharedCollisionGroupTag | FGameplayTag | - | 共有グループの識別タグ |

### Limits \| Bone Constraint（ボーン制約）

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| BoneConstraintGlobalComplianceType | [EXPBDComplianceType](#expbdcompliancetype) | Leather | 剛性タイプ |
| BoneConstraintIterationCountBeforeCollision | int32 | 1 | コリジョン前処理回数 |
| BoneConstraintIterationCountAfterCollision | int32 | 1 | コリジョン後処理回数 |
| bAutoAddChildDummyBoneConstraint | bool | true | ダミーボーン自動追加 |
| BoneConstraints | TArray\<FModifyBoneConstraint\> | - | ボーン制約リスト |
| BoneConstraintsDataAsset | UKawaiiPhysicsBoneConstraintsDataAsset* | - | 制約Data Asset |

### Limits \| World Collision（ワールドコリジョン）

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| bAllowWorldCollision | bool | false | ワールドコリジョン有効化 |
| bOverrideCollisionParams | bool | false | コリジョンパラメータオーバーライド |
| CollisionChannelSettings | FBodyInstance | - | コリジョン設定 |
| bIgnoreSelfComponent | bool | true | 自己コリジョン無視 |
| IgnoreBones | TArray\<FBoneReference\> | - | 無視ボーンリスト |
| IgnoreBoneNamePrefix | TArray\<FName\> | - | 無視ボーン名プリフィックス |

## Force（外部力）

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| Gravity | FVector | ZeroVector | 重力ベクトル |
| bUseLegacyGravity | bool | false | レガシー重力方式 |
| bUseDefaultGravityZProjectSetting | bool | false | プロジェクト設定の重力使用 |
| bUseWorldSpaceGravity | bool | true | ワールド空間重力 |
| bEnableWind | bool | false | 風の有効化 |
| WindScale | float | 1.0 | 風のスケール |
| WindDirectionNoiseAngle | float | 0.0 | 風方向ノイズ（度） |

### Force \| External Force（外力プリセット）

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| SimpleExternalForce | FVector | ZeroVector | 単純な外力 |
| bUseWorldSpaceSimpleExternalForce | bool | true | ワールド空間外力 |
| ExternalForces | TArray\<FInstancedStruct\> | - | 外力プリセット（Instanced Struct、C++で拡張可能） |
| CustomExternalForces | TArray\<UKawaiiPhysics_CustomExternalForce*\> | - | BP/C++オブジェクト型の外力プリセット（**実験的**） |

### Force \| Sync Bone（同期ボーン）

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| SyncBones | TArray\<FKawaiiPhysicsSyncBone\> | 同期ボーンリスト |

## Tag（タグ）

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| KawaiiPhysicsTag | FGameplayTag | フィルタリング用タグ |

## KawaiiPhysics（ランタイム）

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| DeltaTime | float | フレームのデルタタイム（BlueprintReadOnly） |

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

### OnInitializeAnimInstance

```cpp
virtual bool NeedsOnInitializeAnimInstance() const override { return true; }
virtual void OnInitializeAnimInstance(
    const FAnimInstanceProxy* InProxy,
    const UAnimInstance* InAnimInstance
) override;
```

GameThreadで1回だけ呼ばれる初期化。警告ログ用の識別名収集や編集状態の判定を行います。

:::note
旧バージョンに存在した `PreUpdate` オーバーライドは廃止されました。毎フレームの GameThread 処理を避けるため、初期化時の処理は `OnInitializeAnimInstance`（1回のみ）へ集約され、共有コリジョンの再初期化はワーカースレッド上の `EvaluateSkeletalControl_AnyThread` 内で行われます。
:::

### IsValidToEvaluate

```cpp
virtual bool IsValidToEvaluate(
    const USkeleton* Skeleton,
    const FBoneContainer& RequiredBones
) override;
```

ノードが評価可能かを判定します。

### GatherDebugData

```cpp
virtual void GatherDebugData(FNodeDebugData& DebugData) override;
```

デバッグ情報の収集。

### NeedsDynamicReset

```cpp
virtual bool NeedsDynamicReset() const override { return true; }
```

`ResetDynamics`（テレポート対応）が呼ばれるよう常に `true` を返します。

## ランタイム再初期化

### RequestModifyBonesReinit / RequestSharedCollisionReinit

```cpp
void RequestModifyBonesReinit();      // 次回Evaluateでボーンチェーンを再構築
void RequestSharedCollisionReinit();  // 次回Evaluateで共有コリジョンを再初期化
```

ランタイムでトポロジやコリジョン構成に影響する設定を変更した際に、安全な再初期化を予約します（フラグを立て、次回の Evaluate で実行）。[UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library) の各 Setter から内部的に呼ばれます。

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

シミュレーション空間間でTransformを変換します。型ごとに以下のバリエーションがあります。

```cpp
FVector ConvertSimulationSpaceVector(...) const;     // 方向ベクトルの変換
FVector ConvertSimulationSpaceLocation(...) const;   // 位置の変換
FQuat   ConvertSimulationSpaceRotation(...) const;   // 回転の変換
void    ConvertSimulationSpace(FComponentSpacePoseContext& Output,
            EKawaiiPhysicsSimulationSpace From, EKawaiiPhysicsSimulationSpace To); // 全ボーンを一括変換
```

## 型リファレンス（Enum / Struct）

主要なプロパティが参照する列挙型・構造体の定義です。

### FKawaiiPhysicsSettings

物理制御の中心となる設定構造体です（`PhysicsSettings` プロパティ）。`Damping`（揺れやすさ）と `Stiffness`（戻りやすさ）のバランスで全体の柔らかさが決まります。各メンバーはボーン長比に応じてカーブ（`DampingCurveData` 等）で補正できます。

| メンバー | 型 | デフォルト | 範囲 | 説明 |
|---------|-----|-----------|------|------|
| Damping | float | 0.1 | 0以上 | 減衰度。**小さいほど**加速度が強く反映され、よく揺れる |
| Stiffness | float | 0.05 | 0以上 | 剛性度。**大きいほど**元のポーズ（アニメーション）を強く維持する |
| WorldDampingLocation | float | 0.8 | 0以上 | コンポーネント**移動**の反映抑制。`0`=フル反映（最大に揺れる）／`1`=追従（揺れなし）。反映率 = `1 - 値` |
| WorldDampingRotation | float | 0.8 | 0以上 | コンポーネント**回転**の反映抑制（上と同様、反映率 = `1 - 値`） |
| Radius | float | 3.0 | 0以上 | 各ボーンのコリジョン半径（エディタ表示名: Collision Radius） |
| LimitAngle | float | 0.0 | 0以上 | 物理挙動による1ステップあたりの回転角度の上限（度）。`0`で無制限、荒ぶり抑制に有効 |

:::note
`WorldDampingLocation` / `WorldDampingRotation` は名前に反して **値が大きいほど揺れは小さく** なります（`1` でコンポーネントに完全追従＝揺れなし）。
:::

各メンバーの詳しい解説と図解は [物理パラメータ](/docs/parameters/physics) を参照してください。

### EKawaiiPhysicsSimulationSpace

| 値 | 説明 |
|----|------|
| ComponentSpace | スケルタルメッシュコンポーネント基準（デフォルト） |
| WorldSpace | ワールド基準。ルートボーンの急激な移動による問題を回避 |
| BaseBoneSpace | 指定した基準ボーン（`SimulationBaseBone`）基準 |

### EPlanarConstraint

| 値 | 説明 |
|----|------|
| None | 制約なし（デフォルト） |
| X | X軸平面に拘束 |
| Y | Y軸平面に拘束 |
| Z | Z軸平面に拘束 |

### EBoneForwardAxis

`X_Positive`（デフォルト）/ `X_Negative` / `Y_Positive` / `Y_Negative` / `Z_Positive` / `Z_Negative`

### EXPBDComplianceType

Bone Constraint の剛性マテリアルタイプ（`BoneConstraintGlobalComplianceType`）。

`Concrete` / `Wood` / `Leather`（デフォルト）/ `Tendon` / `Rubber` / `Muscle` / `Fat`

:::tip
コリジョン形状（`FSphericalLimit` 等）や Sync Bone（`FKawaiiPhysicsSyncBone`）、Bone Constraint（`FModifyBoneConstraint`）の各メンバー詳細は、機能別ページを参照してください。
:::

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
