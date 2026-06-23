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
