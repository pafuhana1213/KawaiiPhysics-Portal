---
sidebar_position: 8
title: "Bone Constraint（ボーン間拘束）"
---

# Bone Constraint（ボーン間拘束）

:::tip バージョン情報
v1.14.0で実験的機能として追加、v1.19.0で正式化
:::

**Bone Constraint** は、指定した2ボーン間の距離を一定に保つ拘束機能です。XPBDベースで、スカートのように複数の縦ボーンチェーンが並ぶ構成で隣接チェーン同士を横方向につなぎ、チェーン間の広がり・ばらつき・すり抜けを抑えます。

## 解決する課題

スカートのように複数の縦ボーンチェーンが並ぶ構成では、各チェーンが独立して揺れることで、隣接チェーンの間に隙間ができたり、チェーン同士が交差したりすることがあります。

Bone Constraint で同じ段のボーン同士に横方向の距離拘束を入れると、列同士の距離が保たれ、布のようなまとまりが生まれます。これにより、広がりすぎ、ばらつき、チェーン間のすり抜けを抑えやすくなります。

![Bone Constraintの仕組み](/img/generated/bone-constraint-concept.svg)

*隣接するボーンチェーンを横方向に拘束し、ボーン間距離を維持する。*

![BoneConstraint Demo](/img/features/boneconstraint-demo.webp)

## 設定方法

AnimNode の `Limits|Bone Constraint` カテゴリで設定します。`BoneConstraints` 配列に `FModifyBoneConstraint` を追加し、`Bone1` と `Bone2` に拘束したい2つのボーンを指定します。

スカートでは、隣接する縦チェーンの同じ段をペアにします。たとえば `skirt_01_01` と `skirt_02_01`、`skirt_01_02` と `skirt_02_02` のように、横方向に同じ高さのボーンをつないでいきます。最後の列は最初の列に戻してつなぐと、輪を閉じた状態になり、全周で距離を保てます。

```cpp
UPROPERTY(EditAnywhere, Category = "Limits|Bone Constraint")
TArray<FModifyBoneConstraint> BoneConstraints;
```

| プロパティ | 値 |
|-----------|-----|
| 構造体 | FModifyBoneConstraint |
| ボーン1 | Bone1 |
| ボーン2 | Bone2 |
| カテゴリ | Limits&#124;Bone Constraint |

## 剛性（Compliance Type）

`BoneConstraintGlobalComplianceType` は、Bone Constraint 全体で使用する剛性タイプです。値が硬いほど2ボーン間の距離を強く保ち、柔らかいほど動きに余裕が出ます。デフォルトは `Leather` です。

| プロパティ | 値 |
|-----------|-----|
| 型 | EXPBDComplianceType |
| デフォルト | Leather |
| カテゴリ | Limits&#124;Bone Constraint |

| 値 | 説明 |
|-----|------|
| Concrete | コンクリート（最も硬い） |
| Wood | 木材 |
| Leather | 革（デフォルト） |
| Tendon | 腱 |
| Rubber | ゴム |
| Muscle | 筋肉 |
| Fat | 脂肪（最も柔らかい） |

![剛性タイプの比較](/img/generated/compliance-type-comparison.svg)

個々の `FModifyBoneConstraint` では `bOverrideCompliance` を有効にすると、`ComplianceType` で制約ごとに剛性タイプを上書きできます。XPBDの剛性については [XPBD Stiffnessについて](http://blog.mmacklin.com/2016/10/12/xpbd-slides-and-stiffness/) も参照してください。

## 反復回数

Bone Constraint はコリジョン処理の前後で反復処理されます。`BoneConstraintIterationCountBeforeCollision` はコリジョン前、`BoneConstraintIterationCountAfterCollision` はコリジョン後の処理回数です。どちらもデフォルトは `1` です。

| プロパティ | 値 |
|-----------|-----|
| BoneConstraintIterationCountBeforeCollision | デフォルト: 1 |
| BoneConstraintIterationCountAfterCollision | デフォルト: 1 |
| カテゴリ | Limits&#124;Bone Constraint |

![反復処理の効果](/img/generated/bone-constraint-iteration.svg)

反復回数を増やすと収束しやすくなり、ボーン間距離をより保ちやすくなります。一方で、回数に応じて処理コストも増えるため、必要な範囲で調整してください。

## 末端ダミーボーン

`bAutoAddChildDummyBoneConstraint` は、末端ボーンを Bone Constraint の対象にした場合に、末端ダミーボーンも自動的に処理対象へ追加するフラグです。デフォルトは `true` です。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | true |
| カテゴリ | Limits&#124;Bone Constraint |

末端まで横方向のつながりを保ちたい場合は、通常は有効のままで問題ありません。

## Data Assetでの一括設定

`BoneConstraintsDataAsset` を使うと、Bone Constraint の設定を専用の Data Asset として管理できます。複数の AnimNode や Animation Blueprint で同じ拘束設定を共有したい場合に便利です。

Data Asset では `ApplyRegex` を使い、正規表現から制約ペアを一括生成できます。たとえば `skirt_01_.*` と `skirt_02_.*` を指定すると、隣接する2列の同じ段をまとめて接続できます。

```cpp
// FRegexPatternBoneSet
RegexPatternBone1 = "skirt_01_.*";
RegexPatternBone2 = "skirt_02_.*";
```

詳しくは [Data Assets](/docs/features/data-assets) を参照してください。

![Export BoneConstraint](/img/features/export-boneconstraint.png)

*AnimNodeからBoneConstraint設定をエクスポート*

## Bone Constraint Subdivision との連携

Bone Constraint Subdivision は、Bone Constraint の線上にコリジョン点を挿入し、隣接チェーンの間の隙間や貫通を防ぐ機能です。Bone Constraint で列同士をつなぎ、その拘束線に沿って細分化することで、スカートのような面状の構成でコリジョンをより細かく扱えます。

詳しくは [ボーン細分化](/docs/features/bone-subdivision) を参照してください。

## 関連ページ

- [リミットパラメータ](/docs/parameters/limits)
- [Data Assets](/docs/features/data-assets)
- [ボーン細分化](/docs/features/bone-subdivision)
- [Sync Bone](/docs/features/sync-bone)

[ソースを見る](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNode_KawaiiPhysics.h)
