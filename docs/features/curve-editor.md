---
sidebar_position: 4
title: "カーブエディタ"
---

# カーブエディタ

ボーンチェーンに沿ってパラメータを変化させるカーブ機能を説明します。

:::note
このページは使い方の**ガイド**です。各カーブプロパティ（`DampingCurveData` ほか）のリファレンスは [物理パラメータ](/docs/parameters/physics) を参照してください。
:::

## 概要

カーブを使うことで、ボーンチェーンの根元から先端にかけてパラメータを滑らかに変化させることができます。

```
根元 ←―――――――――――→ 先端
[====] 硬い    柔らかい [  ]
```

## 対応パラメータ

以下のパラメータがカーブに対応しています（`Physics Settings | Curves` カテゴリ、AdvancedDisplay）。いずれも RootBone からのボーン長比（0.0〜1.0）に応じて各パラメータへ乗算されます。

- **Damping Curve** - 減衰（エディタ表示名: Damping Rate by Bone Length Rate）
- **Stiffness Curve** - 剛性（Stiffness Rate by Bone Length Rate）
- **World Damping Location Curve** - ワールド位置減衰（World Damping Location Rate by Bone Length Rate）
- **World Damping Rotation Curve** - ワールド回転減衰（World Damping Rotation Rate by Bone Length Rate）
- **Radius Curve** - 半径（Radius Rate by Bone Length Rate）
- **LimitAngle Curve** - 角度制限（LimitAngle Rate by Bone Length Rate）

## カーブの設定

1. KawaiiPhysicsノードを選択
2. 対象のCurveプロパティを展開
3. カーブエディタでキーを追加・編集

![カーブエディタUI](/img/generated/curve-editor-mock.svg)

*※この図は自動生成されたイメージです。実際のUE5画面とは異なる場合があります。*

## カーブの読み方

| 軸 | 意味 |
|---|------|
| X軸 | ボーンチェーンの位置（0=根元, 1=先端） |
| Y軸 | パラメータ値 |

## 設定例

![カーブ設定例と効果](/img/generated/curve-effect-comparison.svg)

*髪の毛、尻尾、スカートでのカーブ設定例と視覚的効果*

### 髪の毛

根元は硬く、先端は柔らかく:

```
Stiffness Curve:
  (0.0, 0.5)  ← 根元: 硬め
  (1.0, 0.05) ← 先端: 柔らかめ
```

### 尻尾

均一な動き:

```
Damping Curve:
  (0.0, 0.2)
  (1.0, 0.2)  ← 全体で同じ値
```

### スカート

裾に向かって広がる:

```
Radius Curve:
  (0.0, 5.0)  ← 腰回り
  (1.0, 15.0) ← 裾
```

## カーブ vs 固定値

| 状況 | 推奨 |
|-----|------|
| 全体で同じ動きにしたい | 固定値 |
| 根元と先端で違う動きにしたい | カーブ |
| 中間部分だけ特殊な動きにしたい | カーブ |

:::tip
最初は固定値で調整し、必要に応じてカーブに切り替えると効率的です。
:::
