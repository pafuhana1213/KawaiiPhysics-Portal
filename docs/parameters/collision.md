---
sidebar_position: 3
title: "コリジョンパラメータ"
---

# コリジョンパラメータ

<!-- AUTO-GENERATED: このページはソースコードから自動生成されます -->

コリジョン（衝突判定）に関するパラメータです。

:::tip このページについて
ここは**コリジョンパラメータの網羅的なリファレンス**です。実際の設定手順や形状の選び方は [コリジョン設定ガイド](/docs/features/collision-setup)、複数メッシュ間での共有は [共有コリジョン](/docs/features/shared-collision) を参照してください。
:::

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

## FTaperedCapsuleLimit（テーパードカプセル） {#tapered-capsule}

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

`FTaperedCapsuleLimit` は両端で半径が異なるコリジョンです。Simple World Collisionの取り込みに加え、ノードの `Collision > Tapered Capsule Collision`、Limits DataAsset、PhysicsAsset由来の設定でも使えます。通常のCapsuleはv1.21以前からありますが、この端別半径の対応は追加機能です。

| 設定 | 既定値 | 意味 |
|---|---|---|
| Radius0 | 5cm | 形状ローカル+Z端の半径 |
| Radius1 | 5cm | 形状ローカル−Z端の半径 |
| Length | 10cm | 端球の中心間距離。全長ではない |

`Driving Bone` と位置・回転Offsetで配置します。`Radius0=Radius1` なら等半径のカプセルとして扱えます。半径・長さは非負へクランプされ、`Length <= abs(Radius0 - Radius1)`（実装では微小許容差を加算）では小さい端球が包含されるため、大きい端球1つへ縮退します。衝突・編集表示・デバッグ表示はこの同じ条件を使います。

通常ケースの押し出し判定は軸線分上の最近点で半径を線形補間します。Chaosの形状との完全な接触一致は保証する説明ではないため、強いテーパーや細い部位では実際の接触を確認してください。Simple World Collisionへの変換ではQuery対応形状を使い、Cloth用のWidth／片面衝突属性は扱いません。[Mirror Data Table for Collision](/docs/features/collision-mirroring)では端点の意味に合わせて半径が必要に応じて交換されます。

[配置手順と図](/docs/features/collision-setup#tapered-capsule)

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
| 編集条件 | `bAllowWorldCollision == true` |

### IgnoreBones

**無視ボーン** - WorldCollisionにて、SkeletalMeshComponentが持つコリジョン(PhysicsAsset)を無視する設定（ボーン指定）。

| プロパティ | 値 |
|-----------|-----|
| 型 | TArray\<FBoneReference\> |
| 編集条件 | `bIgnoreSelfComponent == false` |

### IgnoreBoneNamePrefix

**無視ボーン名プリフィックス** - WorldCollisionにて、SkeletalMeshComponentが持つコリジョン(PhysicsAsset)を無視する設定（ボーン名のプリフィックス指定）。

| プロパティ | 値 |
|-----------|-----|
| 型 | TArray\<FName\> |
| 編集条件 | `bIgnoreSelfComponent == false` |

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

## 関連するUE公式ドキュメント {#ue-docs}

- [Physics Asset Editor](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/physics-asset-editor-in-unreal-engine) — Skeletal Meshに使うPhysicsAssetと形状編集の入口を確認できます。 (UE 5.8)
