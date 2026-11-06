---
title: "コリジョン設定"
---

import DocFigure from '@site/src/components/DocFigure';
import LegacyReference from '@site/src/components/LegacyReference';
import DocVideo from '@site/src/components/DocVideo';

# コリジョン設定

ボーンが体を貫通しないようにコリジョンを設定します。

:::note
このページは設定の**ガイド**です。各コリジョン形状の全プロパティ・デフォルト値は [コリジョンパラメータ](/docs/parameters/collision) を参照してください。
:::

![コリジョンシステム概要](/img/generated/collision-system-overview.svg)

*コリジョンの配置例と各形状の用途*

## コリジョンの種類 {#コリジョンの種類}

<DocVideo src="/video/sample/collision-shapes.mp4" poster="/video/sample/collision-shapes.jpg" alt="鎖が球、カプセル、箱、平面のコリジョンに押される4分割の録画" caption="開発版サンプル展示3.1、3.2、3.4、3.5の実機録画。上段は左からSphere、Capsule、下段は左からBox、Planeです。Tapered Capsuleは後述します。" />

### Sphere（球体） {#sphere球体}

頭や肩など、球形に近い部位に適しています。

![コリジョンの例](/img/collision-example.webp)

### Capsule（カプセル） {#capsuleカプセル}

腕や脚など、円柱形に近い部位に適しています。上記のGIFでカプセルコリジョンの動作例も確認できます。

### Tapered Capsule Collision（v1.22予定） {#tapered-capsule}

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

脚など、付け根と先端で太さが違う部位に等半径のカプセルを置くと、片側に合わせたときにもう片側の余白が大きくなりがちです。Tapered Capsuleは両端の半径を別々に指定でき、1つの形で太さの変化を表せます。

1. `Collision > Tapered Capsule Collision` に要素を追加します。
2. `Driving Bone` に対象ボーンを選びます。
3. `Radius0` で片側の太さを変えます。
4. `Radius1` で反対側の太さを変えます。
5. `Length` で端の中心間の長さを変えます。

<DocFigure src="/img/generated/preview-tapered-shape-ja.svg" alt="両端の半径と、端の中心間のLengthを比較する模式図" caption="模式図。Radius0は形状ローカル+Z側、Radius1は−Z側です。Lengthは端の中心間の距離です。" maxWidth={420} />

<DocVideo src="/video/sample/tapered-capsule.mp4" poster="/video/sample/tapered-capsule.jpg" alt="横向きの先細りの青いカプセルが左右に動き、垂れた鎖がカプセルの表面に沿って押し出される録画" caption="開発版サンプル展示3.3の実機録画。青いメッシュは実際のコリジョンと同じ形のTapered Capsuleで、左右に動きながら鎖を押し出します。太い側に当たるときほど、鎖が大きく押し出されます。" />

強いテーパーではChaos形状との完全な接触一致を前提にしません。片側の球がもう片側を含む長さでは、大きい球へ縮退します。正確な条件は[形状リファレンス](/docs/parameters/collision#tapered-capsule)にまとめています。

### Plane（平面） {#plane平面}

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

### 使用方法 {#使用方法}

1. KawaiiPhysicsノードを選択
2. **コリジョン用Physics Asset**（英語UIでは Physics Asset for Collision、`PhysicsAssetForLimits`）に既存のPhysicsAssetを設定
3. 自動的にコリジョン形状が生成される

![Detailsの検索欄にコリジョン用と入力した状態。コリジョンカテゴリのコリジョン用Physics AssetにGrayChan_PhysicsAssetが設定されている](/img/editor/physics-asset-for-limits-details-ja.webp)

<DocVideo src="/video/sample/physics-asset-limits.mp4" poster="/video/sample/physics-asset-limits.jpg" alt="走るキャラクターを2体並べ、コリジョンなしでは太ももがスカートの前に突き抜け、PhysicsAssetForLimitsを設定した方はスカートが脚に押されて広がる録画" caption="開発版サンプル展示3.7の実機録画を、スカートが見える距離まで寄せて2体を並べたもの。左はコリジョンなしで、持ち上げた太ももがスカートの前に突き抜けます。右はGrayChan_PhysicsAssetを設定しており、脚のボディがスカートを押し出します。2体の走りの位相は揃っていません。" />

### メリット {#メリット}

- 既存のPhysicsAssetを再利用可能
- 手動でのコリジョン設定作業を削減
- 一貫性のあるコリジョン設定

## World Collision（レベルのメッシュとの当たり） {#world-collision}

`bAllowWorldCollision`（日本語UIでは **World Collisionを許可**）を有効にすると、レベルに置いたメッシュとの当たりをスイープで判定します。正確ですが、物理処理の負荷が大きく上がります。

<DocVideo src="/video/sample/world-collision.mp4" poster="/video/sample/world-collision.jpg" alt="同じ動きで揺れる2本の鎖のうち、World Collisionが無効の鎖はオレンジの箱をすり抜け、有効の鎖は箱に掛かって止まる録画" caption="開発版サンプル展示3.8の実機録画。2本とも吊り下げ位置を往復させています。左の無効の鎖はオレンジの箱をすり抜け、右の有効の鎖は箱に当たって止まります。" />

トレースを使わない軽量な方法として、v1.22予定の [Simple World Collision](/docs/features/simple-world-collision) もあります。各項目の詳細は [コリジョンパラメータ](/docs/parameters/collision#world-collision) を参照してください。

## コリジョンの追加 {#コリジョンの追加}

1. KawaiiPhysicsノードを選択
2. **Spherical Limits** / **Capsule Limits** / **Box Limits** / **Planar Limits** 配列に要素を追加
3. **Driving Bone** を設定（コリジョンが追従するボーン）
4. オフセットとサイズを調整

## Driving Bone {#driving-bone}

コリジョンはDriving Boneに追従して移動します。

```
upperarm_r (Driving Bone)
    ↓ 追従
[Capsule Collision] → 髪の毛がここで止まる
```

## Inside vs Outside {#inside-vs-outside}

### Inside（内側制限） {#inside内側制限}

ボーンを球の **内側** に制限します。

- 使用例: 頭の形状に沿わせる

### Outside（外側制限） {#outside外側制限}

ボーンを球の **外側** に制限します。

- 使用例: 肩にめり込まないようにする

![Limit Typeの比較](/img/generated/collision-limit-type.svg)

*Inner（内側制限）とOuter（外側制限）の違いを示す概念図*

## 複数形状の組み合わせ {#複数形状の組み合わせ}

実際のキャラクターでは、複数のコリジョン形状を組み合わせて使用します。

![複数コリジョン形状の組み合わせ](/img/generated/collision-multi-shape-setup.svg)

*上半身とスカートでの実践的なコリジョン配置例*

## パフォーマンス考慮 {#パフォーマンス考慮}

コリジョンの数が多いと処理負荷が増加します。

:::tip
- 必要最小限のコリジョンを使用する
- 複雑な形状は複数のシンプルな形状で近似する
:::

詳しくは [パフォーマンス](/docs/advanced/performance) を参照してください。

<LegacyReference redirect targets={{"mirror-data-table-for-collision": "/docs/features/collision-mirroring", "mirror-prerequisites": "/docs/features/collision-mirroring#mirror-prerequisites", "mirror-setup": "/docs/features/collision-mirroring#mirror-setup", "mirror-check-result": "/docs/features/collision-mirroring#mirror-check-result", "mirror-adjust": "/docs/features/collision-mirroring#mirror-adjust", "mirror-troubleshooting": "/docs/features/collision-mirroring#mirror-troubleshooting", "mirror-details-configuration": "/docs/features/collision-mirroring#mirror-details-configuration", "mirror-details-existing-collisions": "/docs/features/collision-mirroring#mirror-details-existing-collisions", "mirror-details-shape-notes": "/docs/features/collision-mirroring#mirror-details-shape-notes"}} to="/docs/features/collision-mirroring" label="Mirror Data Table for Collision" />

## 関連するUE公式ドキュメント {#ue-docs}

- [Physics Asset Editor](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/physics-asset-editor-in-unreal-engine) — Skeletal Meshに使うPhysicsAssetと形状編集の入口を確認できます。 (UE 5.8)

- [アニメーションのミラーリング](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/mirroring-animation-in-unreal-engine) — Mirror Data Tableの作成、左右ボーンの対応、Mirror Axisを確認できます。KawaiiPhysicsでは形状生成にテーブルを使います。 (UE 5.7)
  [UE5.8版（英語）](https://dev.epicgames.com/documentation/en-us/unreal-engine/mirroring-animation-in-unreal-engine)も参照できます。日本語ページの表示版は5.7です。
