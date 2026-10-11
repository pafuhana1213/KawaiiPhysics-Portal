---
sidebar_position: 2
title: "デバッグ"
---

# デバッグ

KawaiiPhysicsの問題を調査・解決する方法を説明します。

## デバッグ表示

### コリジョンの可視化

エディタ上でコリジョン形状を表示できます。

![コリジョンデバッグ表示](/img/collision-example.webp)

*デバッグ表示を有効にすると、コリジョン形状がワイヤーフレームで可視化されます。*

### 対応コリジョン形状

| 形状 | デバッグ表示 | バージョン |
|-----|-------------|----------|
| Sphere | ワイヤーフレーム球 | - |
| Capsule | ワイヤーフレームカプセル | - |
| Plane | 平面グリッド | v1.20.0で改善 |
| Box | ワイヤーフレームボックス | v1.20.0で追加 |

![Debug Draw改善](/img/features/debug-draw-box-plane.png)

*Box LimitとPlanar Limitのデバッグ表示（v1.20.0）*

### ボーンチェーンの確認

物理が適用されているボーンを視覚的に確認できます。

### GameplayTagによるフィルタリング {#gameplaytag-filtering}

:::tip バージョン情報
v1.17.0で追加、v1.20.0で強化
:::

GameplayTagを使用してデバッグ表示の対象をフィルタリングできます。多数のキャラクターがいる場合に、特定のキャラクターだけをデバッグ表示したい場合に便利です。

![Filter Tag](/img/features/filter-tag.png)

*GameplayTagによるフィルタリング設定*

## よくある問題

### ボーンが動かない

**原因1**: Root Boneの設定ミス

- Root Bone自体には物理が適用されない
- 子ボーンが存在するか確認

**原因2**: パラメータが極端

```cpp
// Stiffnessが高すぎる
Stiffness = 1.0f; // ほぼ動かない

// 適切な値
Stiffness = 0.05f;
```

### ボーンが暴れる

**原因**: Dampingが低すぎる

```cpp
// 収束しない
Damping = 0.0f;

// 適切な値
Damping = 0.1f;
```

### 体を貫通する

**原因**: コリジョンが設定されていない、または小さすぎる

- コリジョンのサイズを確認
- Driving Boneが正しいか確認

### パフォーマンス低下

- ボーン数を確認
- コリジョン数を確認
- [パフォーマンス](/docs/advanced/performance) を参照

## コンソールコマンド

```bash
stat Anim
```

KawaiiPhysicsの統計は `STATGROUP_Anim` に含まれます。表示された一覧で `KawaiiPhysics_` から始まる項目を確認してください。

## ログ出力

```cpp
// 詳細ログを有効化
UE_LOG(LogKawaiiPhysics, Verbose, TEXT("Debug info"));
```

## 問題報告

解決しない場合は [GitHub Issues](https://github.com/pafuhana1213/KawaiiPhysics/issues) で報告してください。

報告時に含める情報：
- UEバージョン
- KawaiiPhysicsバージョン
- 再現手順
- スクリーンショット/動画
