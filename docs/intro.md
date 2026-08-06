---
sidebar_position: 1
slug: /
title: "はじめに"
description: "KawaiiPhysics - Unreal Engine向け軽量ボーン物理プラグイン。髪・服・アクセサリーに物理挙動を簡単に適用できます。"
---

import YouTubeThumbnail from '@site/src/components/YouTubeThumbnail';

# はじめに

**KawaiiPhysics** は、Unreal Engine向けの軽量なボーン物理シミュレーションプラグインです。

<YouTubeThumbnail videoId="t6ihqMIdWWg" title="KawaiiPhysics デモ" />

<YouTubeThumbnail videoId="0f-l-SP07Mo" title="KawaiiPhysics デモ" />

![Comparison Demo](/img/comparison-demo.png)

## 特徴

- **シンプルなセットアップ**: AnimGraph内で1つのノードを追加するだけ
- **軽量な処理**: PhysXに依存しない独自アルゴリズム
- **豊富なコリジョン**: 球・カプセル・ボックス・平面のコリジョンをサポート
- **スケルトン保護**: ボーンの伸縮を防ぐ安定した物理演算
- **外部力の適用**: 風、重力、カスタムフォースに対応

## 対応バージョン {#supported-versions}

| KawaiiPhysics | 対応UEバージョン |
|---------------|-----------------|
| 1.21.x        | 5.3, 5.4, 5.5, 5.6, 5.7, 5.8 |
| 1.20.x        | 5.3, 5.4, 5.5, 5.6, 5.7 |
| 1.19.x        | 5.3, 5.4, 5.5, 5.6 |
| 1.18.x        | 5.3, 5.4, 5.5 |
| 1.17.x        | 5.3, 5.4, 5.5 |
| 1.16.x        | 5.3, 5.4 |
| 1.14.x        | 5.0, 5.1, 5.2 |
| 1.11.1        | 4.27 |

## クイックスタート

```cpp
// Animation Blueprintで KawaiiPhysics ノードを追加
// Root Bone を設定し、物理を適用したいボーンチェーンを指定
```

1. Animation Blueprintを開く
2. AnimGraphに **Kawaii Physics** ノードを追加
3. **Root Bone** に揺らしたいボーンの親を設定
4. パラメータを調整してプレビュー

詳しくは [インストール](/docs/getting-started/installation) と [クイックスタート](/docs/getting-started/quick-start) をご覧ください。

## 採用実績

KawaiiPhysicsは数多くのタイトルで採用されています。詳しくは [採用実績](/adoption) をご覧ください。

## リンク

- [GitHub リポジトリ](https://github.com/pafuhana1213/KawaiiPhysics)
- [Fab](https://www.fab.com/ja/listings/f870c07e-0a02-4a78-a888-e52a22794572)
- [GitHub Discussions](https://github.com/pafuhana1213/KawaiiPhysics/discussions)
