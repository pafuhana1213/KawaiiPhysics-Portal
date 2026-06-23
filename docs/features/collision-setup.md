---
sidebar_position: 2
title: "コリジョン設定"
---

# コリジョン設定

ボーンが体を貫通しないようにコリジョンを設定します。

:::note
このページは設定の**ガイド**です。各コリジョン形状の全プロパティ・デフォルト値は [コリジョンパラメータ](/docs/parameters/collision) を参照してください。
:::

![コリジョンシステム概要](/img/generated/collision-system-overview.svg)

*コリジョンの配置例と各形状の用途*

## コリジョンの種類

### Sphere（球体）

頭や肩など、球形に近い部位に適しています。

![コリジョンの例](/img/collision-example.webp)

### Capsule（カプセル）

腕や脚など、円柱形に近い部位に適しています。上記のGIFでカプセルコリジョンの動作例も確認できます。

### Plane（平面）

地面や壁など、平らな面での制限に使用します。

### Box（ボックス） {#box}

:::tip バージョン情報
v1.17.0で追加
:::

直方体形状のコリジョンです。体や建物など、矩形に近い形状に適しています。

![Box Limits](/img/features/box-limits.webp)

*Box Limitsによる直方体形状の制限*

```cpp
UPROPERTY()
TArray<FBoxLimit> BoxLimits;
```

**FBoxLimitの設定項目:**

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| DrivingBone | FBoneReference | - | コリジョンが追従するボーン |
| OffsetLocation | FVector | (0, 0, 0) | Driving Boneからの位置オフセット |
| OffsetRotation | FRotator | (0, 0, 0) | Driving Boneからの回転オフセット（範囲 -360〜360） |
| Extent | FVector | (5, 5, 5) | ボックスの半径（各軸方向の半サイズ） |

:::note
`DrivingBone` / `OffsetLocation` / `OffsetRotation` は全コリジョン形状共通（`FCollisionLimitBase`）のプロパティです。`FSphericalLimit` は `Radius`（既定 5）と `LimitType`（Inner/Outer）、`FCapsuleLimit` は `Radius`（既定 5）と `Length`（既定 10）を追加で持ちます。
:::

## PhysicsAssetからのコリジョン生成 {#physicsasset}

:::tip バージョン情報
v1.17.0で追加
:::

既存のPhysicsAssetからコリジョン形状を自動生成できます。PhysicsAssetで定義されているコリジョンボディを、KawaiiPhysicsのコリジョンに変換します。

![PhysicsAsset for Limits](/img/features/physicsasset-limits.png)

*PhysicsAssetからLimitsを自動生成*

### 使用方法

1. KawaiiPhysicsノードを選択
2. **Physics Asset** プロパティに既存のPhysicsAssetを設定
3. 自動的にコリジョン形状が生成される

### メリット

- 既存のPhysicsAssetを再利用可能
- 手動でのコリジョン設定作業を削減
- 一貫性のあるコリジョン設定

## コリジョンの追加

1. KawaiiPhysicsノードを選択
2. **Spherical Limits** / **Capsule Limits** / **Box Limits** / **Planar Limits** 配列に要素を追加
3. **Driving Bone** を設定（コリジョンが追従するボーン）
4. オフセットとサイズを調整

## Driving Bone

コリジョンはDriving Boneに追従して移動します。

```
upperarm_r (Driving Bone)
    ↓ 追従
[Capsule Collision] → 髪の毛がここで止まる
```

## Inside vs Outside

### Inside（内側制限）

ボーンを球の **内側** に制限します。

- 使用例: 頭の形状に沿わせる

### Outside（外側制限）

ボーンを球の **外側** に制限します。

- 使用例: 肩にめり込まないようにする

![Limit Typeの比較](/img/generated/collision-limit-type.svg)

*Inner（内側制限）とOuter（外側制限）の違いを示す概念図*

## 複数形状の組み合わせ

実際のキャラクターでは、複数のコリジョン形状を組み合わせて使用します。

![複数コリジョン形状の組み合わせ](/img/generated/collision-multi-shape-setup.svg)

*上半身とスカートでの実践的なコリジョン配置例*

## パフォーマンス考慮

コリジョンの数が多いと処理負荷が増加します。

:::tip
- 必要最小限のコリジョンを使用する
- 複雑な形状は複数のシンプルな形状で近似する
:::

詳しくは [パフォーマンス](/docs/advanced/performance) を参照してください。
