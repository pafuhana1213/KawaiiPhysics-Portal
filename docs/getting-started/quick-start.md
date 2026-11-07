---
sidebar_position: 3
title: "クイックスタート"
description: "KawaiiPhysicsを5分で始める。AnimGraphノードの追加からプレビューまでの基本セットアップ。"
---

# クイックスタート

5分でKawaiiPhysicsを使い始めましょう。

## 前提条件

- KawaiiPhysicsがインストール済み
- Skeletal Meshを持つキャラクター
- Animation Blueprint

## 基本的なセットアップ

### Step 1: Animation Blueprintを開く

物理を適用したいキャラクターのAnimation Blueprintを開きます。

### Step 2: KawaiiPhysicsノードを追加

AnimGraphで右クリックし、**Kawaii Physics** ノードを追加します。

![AnimGraphでのKawaiiPhysicsノード](/img/animgraph-example.jpg)

### Step 3: Root Boneを設定

1. KawaiiPhysicsノードを選択
2. Detailsの検索欄に `Root Bone` と入力
3. **Root Bone** に物理を適用したいボーンチェーンの**親ボーン**を設定

![Detailsの検索欄にRoot Boneと入力した状態。ボーンカテゴリのRoot BoneにTorus001が設定され、その下に追加Root Boneがある](/img/editor/root-bone-details-ja.webp)

*開発版サンプル展示1.1のDetails。鎖のRoot BoneにTorus001を設定しています。*

:::tip
例えば髪の毛を揺らしたい場合、髪の根元のボーン（head等）をRoot Boneに設定します。
:::

### Step 4: パラメータ調整

基本的なパラメータ:

| パラメータ | 説明 | 推奨値 |
|-----------|------|--------|
| Damping | 減衰（動きの収束速度） | 0.1 - 0.3 |
| Stiffness | 剛性（元の形への復元力） | 0.05 - 0.2 |
| World Damping Location | ワールド座標での位置減衰 | 0.5 - 0.8 |

これらは **Physics Settings** の中にあります。Detailsの検索欄に `Physics Settings` と入力すると、まとめて表示できます。

![Detailsの検索欄にPhysics Settingsと入力した状態。物理設定カテゴリのPhysics Settingsの中に、Damping 0.1、Stiffness 0.05、World Damping Location 0.8、World Damping Rotation 0.8、Collision Radius 3.0 cm、角度制限モード Cone、Limit Angle 0.0度が並んでいる](/img/editor/physics-settings-details-ja.webp)

*既定値の状態。開発版の画面のため、v1.22予定の **角度制限モード** も表示されています。*

各パラメータの効果は [揺れ方の調整](/docs/features/physics-setup) の録画で確認できます。

### Step 5: プレビュー

Animation Blueprintのプレビューウィンドウでキャラクターを動かし、物理の動作を確認します。

![KawaiiPhysicsのプレビュー](/img/intro-demo.webp)

## 次のステップ

- [基本概念](/docs/getting-started/basic-concepts) - 仕組みを理解する
- [パラメータリファレンス](/docs/parameters/overview) - 詳細なパラメータ設定
- [コリジョン設定](/docs/features/collision-setup) - 体との貫通を防ぐ
