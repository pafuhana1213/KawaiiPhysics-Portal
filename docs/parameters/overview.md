---
sidebar_position: 1
title: "パラメータ概要"
description: "KawaiiPhysicsの全パラメータ一覧。物理、コリジョン、リミット、外部力の設定リファレンス。"
---

# パラメータ概要

<!-- AUTO-GENERATED: このページはソースコードから自動生成されます -->

KawaiiPhysicsノードで設定可能なパラメータの概要です。

![パラメータカテゴリ全体像](/img/generated/parameter-categories-map.svg)

*主要パラメータを Physics / Collision / Limits / External Forces の4カテゴリで整理した全体像。*

## パラメータカテゴリ

| カテゴリ | 説明 |
|---------|------|
| [Physics](/docs/parameters/physics) | 物理演算の基本パラメータ |
| [Collision](/docs/parameters/collision) | コリジョン設定 |
| [Limits](/docs/parameters/limits) | 角度・移動制限 |
| [External Forces](/docs/parameters/external-forces) | 風・重力などの外部力 |

## クイックリファレンス

### よく使うパラメータ

| パラメータ | カテゴリ | 説明 |
|-----------|---------|------|
| Root Bone | Basic | 物理を適用するボーンチェーンの親 |
| Damping | Physics | 減衰係数 |
| Stiffness | Physics | 剛性 |
| Radius | Physics | ボーン半径 |
| Gravity | External Forces | 重力方向と強度 |

### デフォルト値

```cpp
// AnimNode_KawaiiPhysics.h より
Damping = 0.1f;
Stiffness = 0.05f;
Radius = 3.0f;  // 表示名: Collision Radius
```

## Data Assetによる管理

パラメータは **KawaiiPhysicsLimitsDataAsset** に保存して再利用できます。

詳しくは [Data Assets](/docs/features/data-assets) を参照してください。
