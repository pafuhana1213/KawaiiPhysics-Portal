---
sidebar_position: 3
title: "コリジョンパラメータ"
---

# コリジョンパラメータ

<!-- AUTO-GENERATED: このページはソースコードから自動生成されます -->

コリジョン（衝突判定）に関するパラメータです。

[ソースを見る](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNode_KawaiiPhysics.h)

## コリジョンタイプ

KawaiiPhysicsでは以下の4種類のコリジョン形状をサポートしています。

| タイプ | 説明 |
|-------|------|
| Spherical | 球体コリジョン |
| Capsule | カプセルコリジョン |
| Box | ボックスコリジョン |
| Planar | 平面コリジョン |

![コリジョン形状の比較](/img/generated/collision-shapes-comparison.svg)

*各コリジョン形状の特徴と使用例*

## FCollisionLimitBase（共通プロパティ）

すべてのコリジョンタイプに共通する基本プロパティです。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| DrivingBone | FBoneReference | コリジョンを追従させるボーン |
| OffsetLocation | FVector | ボーンからのオフセット位置（デフォルト: ZeroVector） |
| OffsetRotation | FRotator | ボーンからのオフセット回転（デフォルト: ZeroRotator、範囲: -360 ~ 360） |

## FSphericalLimit（球体コリジョン）

球形の衝突判定を追加します。

```cpp
UPROPERTY(EditAnywhere, Category = "Limits")
TArray<FSphericalLimit> SphericalLimits;
```

### プロパティ

| 名前 | 型 | デフォルト | 説明 |
|-----|-----|-----------|------|
| Radius | float | 5.0 | 球の半径（0以上） |
| LimitType | ESphericalLimitType | Outer | 内側/外側の制限タイプ |

### ESphericalLimitType

| 値 | 説明 |
|-----|------|
| Inner | 球の内側に制限（ボーンを球の内側に押し込む） |
| Outer | 球の外側に制限（ボーンを球から押し出す） |

![Limit Typeの比較](/img/generated/collision-limit-type.svg)

*Inner（内側制限）とOuter（外側制限）の違い*

## FCapsuleLimit（カプセルコリジョン）

カプセル形状の衝突判定を追加します。

```cpp
UPROPERTY(EditAnywhere, Category = "Limits")
TArray<FCapsuleLimit> CapsuleLimits;
```

### プロパティ

| 名前 | 型 | デフォルト | 説明 |
|-----|-----|-----------|------|
| Radius | float | 5.0 | カプセルの半径（0以上） |
| Length | float | 10.0 | カプセルの長さ（0以上） |

## FBoxLimit（ボックスコリジョン）

ボックス形状の衝突判定を追加します。

```cpp
UPROPERTY(EditAnywhere, Category = "Limits")
TArray<FBoxLimit> BoxLimits;
```

### プロパティ

| 名前 | 型 | デフォルト | 説明 |
|-----|-----|-----------|------|
| Extent | FVector | (5.0, 5.0, 5.0) | ボックスのエクステント（各軸の半分のサイズ） |

## FPlanarLimit（平面コリジョン）

平面による衝突判定を追加します。

```cpp
UPROPERTY(EditAnywhere, Category = "Limits")
TArray<FPlanarLimit> PlanarLimits;
```

### プロパティ

| 名前 | 型 | デフォルト | 説明 |
|-----|-----|-----------|------|
| Plane | FPlane | (0, 0, 0, 0) | 平面の定義 |

## Data Assetからの読み込み

### LimitsDataAsset

コリジョン設定をData Assetから読み込むことができます。別のAnimNodeやAnimation Blueprintで設定を流用したい場合に推奨されます。

```cpp
UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Limits")
TObjectPtr<UKawaiiPhysicsLimitsDataAsset> LimitsDataAsset;
```

### PhysicsAssetForLimits

Physics Assetからコリジョン設定を読み込むこともできます。

```cpp
UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Limits")
TObjectPtr<UPhysicsAsset> PhysicsAssetForLimits;
```

## World Collision

### bAllowWorldCollision

**ワールドコリジョン** - レベル上の各コリジョンとの判定を行うフラグ。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | false |

:::warning
有効にすると物理処理の負荷が大幅に上がります。
:::

### bIgnoreSelfComponent

**自己コリジョン無視** - WorldCollisionにて、SkeletalMeshComponentが持つコリジョン(PhysicsAsset)を無視するフラグ。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | true |

### IgnoreBones

**無視ボーン** - WorldCollisionにて、SkeletalMeshComponentが持つコリジョン(PhysicsAsset)を無視する設定（ボーン指定）。

| プロパティ | 値 |
|-----------|-----|
| 型 | TArray\<FBoneReference\> |

### IgnoreBoneNamePrefix

**無視ボーン名プリフィックス** - WorldCollisionにて、SkeletalMeshComponentが持つコリジョン(PhysicsAsset)を無視する設定（ボーン名のプリフィックス指定）。

| プロパティ | 値 |
|-----------|-----|
| 型 | TArray\<FName\> |

### bOverrideCollisionParams

**コリジョンパラメータオーバーライド** - SkeletalMeshComponentが持つコリジョン設定ではなく、独自のコリジョン設定をWorldCollisionで使用する際に設定。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | false |

## Shared Collision（共有コリジョン）

複数の KawaiiPhysics ノードが、1つのコリジョン形状セットを共有するための設定です。同一 Actor/ChildActor ファミリー内の別メッシュ間でコリジョンを共有できます。詳しくは [Shared Collision](/docs/features/shared-collision) を参照してください。

### bSharedCollisionSource

**コリジョンの公開** - このノードのコリジョンを同じActor/ChildActorファミリー内の KawaiiPhysics に共有します（Source として動作）。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | false |
| カテゴリ | Limits&#124;Shared Collision |

### bUseSharedCollision

**共有コリジョンの使用** - 同じファミリー内の Source ノードが公開したコリジョンを使用します（Target として動作）。Source とは排他です。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | false |
| 編集条件 | `!bSharedCollisionSource` |
| カテゴリ | Limits&#124;Shared Collision |

### SharedCollisionGroupTag

**グループタグ** - 共有コリジョンのグループを識別する GameplayTag。Source / Target 両方で同じタグを使用します。

| プロパティ | 値 |
|-----------|-----|
| 型 | FGameplayTag |
| 編集条件 | `bSharedCollisionSource &#124;&#124; bUseSharedCollision` |
| カテゴリ | Limits&#124;Shared Collision |

:::tip
同じAnimGraph内で同一フレームのコリジョンを使うには、Source ノードを Target ノードより先に評価される位置へ配置してください。
:::

## コリジョンソースタイプ

コリジョンの設定元を示す列挙型です。

```cpp
UENUM()
enum class ECollisionSourceType : uint8
{
    AnimNode,      // AnimNodeで設定された値を使用
    DataAsset,     // DataAssetで設定された値を使用
    PhysicsAsset,  // PhysicsAssetで設定された値を使用
};
```

:::tip
Data Assetを使用することで、複数のAnimNodeやAnimation Blueprint間でコリジョン設定を共有できます。
:::

詳しくは [Data Assets](/docs/features/data-assets) を参照してください。
