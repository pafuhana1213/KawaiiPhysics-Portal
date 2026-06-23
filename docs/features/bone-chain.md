---
sidebar_position: 1
title: "ボーンチェーン設定"
---

# ボーンチェーン設定

KawaiiPhysicsでボーンチェーンを設定する方法を説明します。

:::note
このページは設定の**ガイド**です。`RootBone` / `ExcludeBones` / `AdditionalRootBones` / `DummyBoneLength` の全プロパティ詳細は [物理パラメータ](/docs/parameters/physics) を参照してください。
:::

## Root Boneの選択

**Root Bone** は物理を適用するボーンチェーンの **親ボーン** を指定します。

:::warning
Root Bone自体には物理が適用されません。その子ボーン以下に物理が適用されます。
:::

![ボーンチェーン構造図](/img/generated/bone-chain-diagram.svg)

*※自動生成された概念図です。実際のボーン名やスケルトン構造はアセットにより異なります。*

## 自動検出

KawaiiPhysicsはRoot Boneから自動的に子ボーンを検出し、チェーンを構築します。

```
spine_03 (Root Bone - 物理なし)
├── hair_front_01  ← 物理適用
│   └── hair_front_02  ← 物理適用
└── hair_back_01   ← 物理適用
    └── hair_back_02   ← 物理適用
```

## DummyBoneLength（末端ボーンの揺れ改善）

チェーンの**末端ボーン**は、子ボーンを持たないため回転の基準が定まらず、物理制御が不安定になりがちです。`DummyBoneLength` に 0 より大きい値を設定すると、末端に**見えないダミーボーン**を1本追加し、末端ボーンに「子」を与えて回転・揺れを安定させます。揺れ方に直結する重要なパラメータです。

![DummyBoneの効果](/img/generated/dummybone-effect.svg)

*DummyBoneLength = 0（左）では末端ボーンが不安定。0 より大きくする（右）と末端に見えないダミーが追加され、末端ボーンが安定して自然に揺れる。*

| プロパティ | 値 |
|-----------|-----|
| 型 | float |
| デフォルト | 0.0（無効） |
| 範囲 | 0 以上 |
| カテゴリ | Bones |

**使い方のポイント:**

- 末端ボーンの揺れが弱い・カクつく・不自然なときに有効
- 値はダミーボーンの長さ（末端ボーンからの距離）。まずは末端ボーンの長さと同程度から試すとよい
- ランタイムでは `UKawaiiPhysicsLibrary::SetDummyBoneLength` で変更可能（変更時はボーン構成が再構築されます）

:::note
これはチェーン**末端**に1本だけ追加するダミーです。隣接ボーン**間**にダミーを挿入してコリジョン解像度を上げる `BoneSubdivisionCount` とは別物です（[ボーン細分化](/docs/features/bone-subdivision) を参照）。
:::

## Exclude Bones

特定のボーンを物理計算から除外できます。

```cpp
UPROPERTY(EditAnywhere, Category = "Bones")
TArray<FBoneReference> ExcludeBones;
```

:::warning
`ExcludeBones` に指定したボーンは、**そのボーン自身とその子孫ボーンすべて** が制御対象から外れます。チェーンの途中のボーンを指定すると、それ以降の末端まで物理が適用されなくなる点に注意してください。
:::

![ボーンチェーンとExclude Bone](/img/generated/bone-chain-exclude.svg)

*Root Bone から始まるチェーンに物理が適用されます。Exclude Bone に指定したボーン自身と、それ以下（子孫）のボーンはすべて物理計算から除外されます。*

### 使用例

- リボンの結び目など、動かしたくない部分
- 別のKawaiiPhysicsノードで制御したいボーン

:::tip
`Additional Root Bones` ごとに専用の除外リストを設定したい場合は、各 `FKawaiiPhysicsRootBoneSetting` の `OverrideExcludeBones`（`bUseOverrideExcludeBones` 有効時）を使用します。
:::

## 複数のボーンチェーン

1つのキャラクターに複数のKawaiiPhysicsノードを使用できます。

```
AnimGraph
├── KawaiiPhysics (髪の毛用)
├── KawaiiPhysics (尻尾用)
└── KawaiiPhysics (服用)
```

:::tip
パラメータが異なる部位は、別々のノードで管理すると調整しやすくなります。
:::

## Additional Root Bones（追加ルートボーン） {#additional-root-bones}

:::tip バージョン情報
v1.17.0で追加
:::

1つのKawaiiPhysicsノードで複数のRootBoneを設定できます。同じパラメータで複数のボーンチェーンを制御したい場合に便利です。

### 設定方法

1. KawaiiPhysicsノードを選択
2. **Additional Root Bones** 配列に要素を追加
3. 各要素に追加のRootBoneを設定

### FKawaiiPhysicsRootBoneSetting

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| RootBone | FBoneReference | 追加の制御ルートボーン |
| OverrideExcludeBones | TArray\<FBoneReference\> | このルートボーン専用の除外ボーンリスト |
| bUseOverrideExcludeBones | bool | 除外ボーンオーバーライドの有効化 |

### 使用例

```
// 1つのノードで髪の前後を制御
RootBone: hair_front_root
AdditionalRootBones:
  - RootBone: hair_back_root
  - RootBone: hair_side_l_root
  - RootBone: hair_side_r_root
```

### メリット

- **ノード数の削減**: 同じパラメータなら1つのノードでまとめられる
- **パフォーマンス**: 複数ノードより僅かに効率的
- **管理のしやすさ**: パラメータ変更が一括で反映

### 従来の方法との比較

| 方式 | メリット | デメリット |
|-----|---------|----------|
| 複数ノード | 部位ごとに異なるパラメータ設定可能 | ノード数が増える |
| Additional Root Bones | 同じパラメータで一括管理 | 部位ごとの微調整が難しい |

:::tip
髪の毛のように同じパラメータで揺らしたい部位はAdditional Root Bonesを使用し、スカートと尻尾のように異なるパラメータが必要な部位は別ノードにすることを推奨します。
:::

## ボーンの長さと半径

各ボーンの長さは自動計算されます。半径は手動で設定するか、カーブで制御します。

詳しくは [カーブエディタ](/docs/features/curve-editor) を参照してください。
