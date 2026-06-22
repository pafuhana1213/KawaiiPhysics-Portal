---
sidebar_position: 10
title: "Shared Collision（共有コリジョン）"
---

# Shared Collision（共有コリジョン）

:::tip バージョン情報
v1.21.0で追加
:::

**Shared Collision** は、複数の KawaiiPhysics ノードが、1つのコリジョン形状セットを共有できるようにする仕組みです。同一 Actor 上の別々の SkeletalMeshComponent や、ChildActor 側の AnimInstance 間でも共有できます。

## 解決する課題

従来は各ノードが自前の `SphericalLimit` / `CapsuleLimit` / `BoxLimit` / `PlanarLimit` を持つ必要がありました。そのため、たとえば「キャラ本体（髪・胸など）が計算したコリジョン形状」を「衣装スカートの物理ノード」が参照する、といったケースに対応できませんでした。

Shared Collision を使うと、複数メッシュ間でコリジョンを一元化でき、設定の重複や手作業の同期を減らせます。

![Shared Collisionの共有イメージ](/img/generated/shared-collision-concept.svg)

*本体メッシュ（Source）が計算したコリジョンを共有サブシステム経由で公開し、衣装メッシュ（Target）が同じGroupTagで読み取って使用する。*

## 仕組み（Source / Target）

Shared Collision は Publisher/Subscriber 型の構成です。各ノードは **Source（公開側）** か **Target（参照側）** のいずれかになり、`SharedCollisionGroupTag` でグループ化されます。

```
[Source ノード]
  自分の計算済みコリジョンをワールド空間で公開（publish）
        ↓  （同じグループタグ）
[Target ノード]
  公開されたコリジョンを読み取り、自分のシミュレーション空間で判定に使用
```

Source / Target はアタッチ階層の最上位 Actor（Actorファミリー）をキーに共有されるため、親→子、子→親、同じActor上の別AnimInstance間で共有できます。

## 設定方法

`Limits > Shared Collision` カテゴリで設定します。

### bSharedCollisionSource

**コリジョンの公開** - このノードのコリジョンを、同じActor/ChildActorファミリー内の KawaiiPhysics に共有します（Source として動作）。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | false |
| カテゴリ | Limits&#124;Shared Collision |

### bUseSharedCollision

**共有コリジョンの使用** - 同じファミリー内の Source ノードが公開したコリジョンを使用します（Target として動作）。`bSharedCollisionSource` が無効なときのみ設定できます（Source と Target は排他）。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | false |
| 編集条件 | `!bSharedCollisionSource` |
| カテゴリ | Limits&#124;Shared Collision |

### SharedCollisionGroupTag

**グループタグ** - 共有コリジョンのグループを識別する GameplayTag。同じファミリー内の Source / Target 両方で同じタグを使用します。

| プロパティ | 値 |
|-----------|-----|
| 型 | FGameplayTag |
| 編集条件 | `bSharedCollisionSource &#124;&#124; bUseSharedCollision` |
| カテゴリ | Limits&#124;Shared Collision |

## 評価順に関する注意

:::warning
同じAnimGraph内で同一フレームの結果を使いたい場合は、**Source ノードを Target ノードより先に評価される位置**へ配置してください。

Target が先に評価された場合や別 AnimInstance 間では、Tick・評価順により直近フレームのコリジョンデータを読むことがあります（1フレーム遅延）。多くの場合は問題になりませんが、厳密な同期が必要な場合は評価順を意識してください。
:::

:::note 内部的な動作
共有データは `UKawaiiPhysicsSharedCollisionSubsystem`（World単位の Subsystem）が `(Actorファミリーroot, グループタグ)` 単位で管理します。Source はロックフリーのダブルバッファでワールド空間に公開し、Target は読み取り時に同一グループの全 Source をマージして自分のシミュレーション空間へ変換します。初期化は GameThread（PreUpdate）で行われ、ワーカースレッドの並列評価でも安全です。
:::

## CVar によるチューニング

コンソール変数（プレフィックス `a.AnimNode.KawaiiPhysics.SharedCollision.`）で挙動を調整できます。

| CVar | 既定値 | 意味 |
|------|-------|------|
| `ReadMaxAge` | 10（フレーム） | これより古い公開データは読み取り対象外。URO / LOD によるスキップを見込んだ値にします |
| `CleanupMaxAge` | 60（フレーム） | 未使用スロットを物理削除するまでの猶予 |
| `InitRetryThreshold` | 60（回） | Target 初期化リトライが続いたときに警告ログを出すまでの回数 |
| `CleanupInterval` | 1.0（秒） | 掃除処理を走らせる間隔 |

:::tip
URO（Update Rate Optimization）や LOD で評価が間引かれると Source の公開間隔が空きます。間引き中でも直近データを使い続けたい場合は `ReadMaxAge` を大きめにしてください。
:::

## Blueprintからの制御

ランタイムで Source / Target / グループタグを切り替えられます（変更は次フレームに安全に再初期化されます）。

| 関数 | 説明 |
|------|------|
| `Set/Get Shared Collision Source` | このノードを Source にするか |
| `Set/Get Use Shared Collision` | このノードを Target にするか |
| `Set/Get Shared Collision Group Tag` | グループタグの設定・取得 |

詳しくは [KawaiiPhysics Library](/docs/api/kawaiiphysics-library) を参照してください。

## サンプル

サンプルプロジェクトの `Content/KawaiiPhysicsSample/Samples/4-Advanced/4-9/` に、Source / Target を使ったデモが含まれています。

## 関連ページ

- [コリジョン設定](/docs/features/collision-setup)
- [コリジョンパラメータ](/docs/parameters/collision)
- [Data Assets](/docs/features/data-assets)
