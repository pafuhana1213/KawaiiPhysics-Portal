---
sidebar_position: 4
title: "基本概念"
description: "KawaiiPhysicsの仕組み。ボーンチェーン、Damping、Stiffness、コリジョンなどの基本概念を解説。"
---

# 基本概念

KawaiiPhysicsの仕組みを理解しましょう。

## アーキテクチャ

KawaiiPhysicsはPhysXを使用せず、独自の軽量アルゴリズムでボーン物理を実現します。

![アーキテクチャとデータフロー](/img/generated/architecture-dataflow.svg)

*AnimGraph内でのKawaiiPhysicsノードの位置と内部処理フロー*

## ボーンチェーン

KawaiiPhysicsは **Root Bone** から始まるボーンチェーン全体に物理を適用します。

```
head (Root Bone)
├── hair_01
│   ├── hair_02
│   └── hair_03  ← 物理が適用される範囲
└── ponytail_01
    └── ponytail_02
```

### Exclude Bones

特定のボーンを物理計算から除外できます。

![ボーンチェーンとExclude Bone](/img/generated/bone-chain-exclude.svg)

*Root Bone から始まるチェーンに物理が適用されます。Exclude Bone に指定したボーン自身と、それ以下（子孫）のボーンはすべて物理計算から除外されます。*

## 物理パラメータ

### Damping（減衰）

ボーンの動きを徐々に収束させます。値が大きいほど早く止まります。

![Damping値の比較](/img/generated/damping-comparison.svg)

*※自動生成された概念図です。実際の動作はパラメータや環境により異なります。*

### Stiffness（剛性）

元のアニメーションポーズに戻ろうとする力です。値が大きいほど硬くなります。

![Stiffness値の比較](/img/generated/stiffness-comparison.svg)

*※自動生成された概念図です。実際の動作はパラメータや環境により異なります。*

### Radius（半径）

各ボーンの物理的なサイズを定義します。コリジョン判定に使用されます。

![Radius値の比較](/img/generated/radius-concept.svg)

*※自動生成された概念図です。実際の動作はパラメータや環境により異なります。*

## コリジョンシステム

KawaiiPhysicsは4種類のコリジョンをサポートします：

| 種類 | 用途 |
|-----|------|
| Sphere | 球体（頭、肩など） |
| Capsule | カプセル（腕、脚など） |
| Box | ボックス（体、障害物など） |
| Plane | 平面（地面、壁など） |

![コリジョンシステム概要](/img/generated/collision-system-overview.svg)

*コリジョンの配置例と各形状の用途*

## カーブによる制御

ボーンチェーンに沿ってパラメータを変化させることができます。

```
根元 ←――――――――――――→ 先端
  硬い              柔らかい
```

詳しくは [カーブエディタ](/docs/features/curve-editor) を参照してください。
