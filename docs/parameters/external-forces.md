---
sidebar_position: 5
title: "外部力パラメータ"
---

# 外部力パラメータ

<!-- AUTO-GENERATED: このページはソースコードから自動生成されます -->

外部から適用される力に関するパラメータです。

[ソースを見る](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNode_KawaiiPhysics.h)

## Gravity

### Gravity

**重力** - ボーンに適用される重力ベクトル。

| プロパティ | 値 |
|-----------|-----|
| 型 | FVector |
| デフォルト | (0, 0, 0) |
| カテゴリ | Force |

```cpp
// 下向きの重力を適用
Gravity = FVector(0, 0, -1.0f);
```

### bUseLegacyGravity

**レガシー重力方式** - Gravityの適用方式を指定します。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | false |
| カテゴリ | Force |

| 値 | 説明 |
|-----|------|
| true | 従来互換（位置に 0.5 * Gravity * dt^2 を加算） |
| false | AnimDynamics互換（速度に Gravity * dt を加算してから位置更新） |

### bUseDefaultGravityZProjectSetting

**プロジェクト設定の重力使用** - Gravityベクトルにプロジェクト設定の DefaultGravityZ（絶対値）を乗算するフラグ。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | false |
| カテゴリ | Force |

### bUseWorldSpaceGravity

**ワールド空間重力** - 重力をワールド座標系で扱うかどうかのフラグ。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | true |
| カテゴリ | Force |

## Wind

### bEnableWind

**風の有効化** - 外力としてWindDirectionalSourceの影響を受けるかどうかのフラグ。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | false |
| カテゴリ | Force |

### WindScale

**風のスケール** - WindDirectionalSourceによる風の影響度。ClothやSpeedTreeとの併用目的で使用します。

| プロパティ | 値 |
|-----------|-----|
| 型 | float |
| デフォルト | 1.0 |
| 編集条件 | `bEnableWind == true` |
| カテゴリ | Force |

![Wind External Force](/img/features/wind-externalforce.png)

*Wind Directional Sourceとの連携*

:::note
WindScaleはbEnableWindがtrueの場合のみ有効です。
:::

### WindDirectionNoiseAngle

**風方向ノイズ** - WindDirectionalSourceによる風方向に与えるノイズ（角度）。風向きにランダムなゆらぎを与え、機械的な揺れを和らげます。

| プロパティ | 値 |
|-----------|-----|
| 型 | float |
| デフォルト | 0.0 |
| 単位 | 度 |
| 範囲 | 0 以上 |
| 編集条件 | `bEnableWind == true` |
| カテゴリ | Force |

## Simple External Force

### SimpleExternalForce

**単純な外力ベクトル** - 任意の方向に力を適用できます。

| プロパティ | 値 |
|-----------|-----|
| 型 | FVector |
| デフォルト | (0, 0, 0) |
| カテゴリ | Force\|External Force |

### bUseWorldSpaceSimpleExternalForce

**ワールド空間外力** - 単純な外力をワールド座標系で扱うかどうかのフラグ。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | true |
| カテゴリ | Force\|External Force |

## External Force プリセット

:::tip バージョン情報
v1.16.0で追加
:::

![External Forceプリセットシステム](/img/generated/external-force-presets.svg)

*プリセットの種類と適用フロー*

![External Force設定1](/img/features/externalforce-settings1.png)

![External Force設定2](/img/features/externalforce-settings2.png)

![External Forceデモ](/img/features/externalforce-demo.webp)

*External Forceプリセットによる揺れの制御*

### ExternalForces

**外力プリセット（Instanced Struct）** - 外力のプリセット。C++で独自のプリセットを追加可能です。

```cpp
UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Force|External Force",
    meta = (BaseStruct = "/Script/KawaiiPhysics.KawaiiPhysics_ExternalForce", ExcludeBaseStruct))
TArray<FInstancedStruct> ExternalForces;
```

### CustomExternalForces（実験的機能）

**カスタム外力（Instanced Property）** - BP・C++で独自のプリセットを追加可能です。

```cpp
UPROPERTY(EditAnywhere, BlueprintReadWrite, Instanced, Category = "Force|External Force",
    meta=(DisplayName="CustomExternalForces(EXPERIMENTAL)"))
TArray<TObjectPtr<UKawaiiPhysics_CustomExternalForce>> CustomExternalForces;
```

:::warning
この機能は非常に実験的です。AnimNodeをクリックするか、Animation Blueprintをコンパイルしないと正常に動作しない場合があります。
:::

## タグ

### KawaiiPhysicsTag

**フィルタリング用タグ** - ExternalForceなどで使用するフィルタリング用のGameplayTag。

| プロパティ | 値 |
|-----------|-----|
| 型 | FGameplayTag |
| カテゴリ | Tag |

![Filter Tag](/img/features/filter-tag.png)

*GameplayTagによるフィルタリング設定*

```cpp
// タグを使用した外力の適用
FGameplayTagContainer FilterTags;
FilterTags.AddTag(FGameplayTag::RequestGameplayTag("KawaiiPhysics.Hair"));
UKawaiiPhysicsLibrary::AddExternalForcesToComponent(MeshComp, ExternalForces, Owner, FilterTags);
```

## AnimNotifyによる外力制御

:::tip バージョン情報
v1.17.0で追加
:::

AnimNotifyを使用してアニメーション中に外力を制御できます。

![AnimNotifyState External Force](/img/features/animnotify-externalforce.webp)

*AnimNotifyStateによる外力の適用*

## ランタイム制御・Blueprint API

外力はBlueprintから動的に追加・除去できます（`AddExternalForce` / `AddExternalForcesToComponent` / `RemoveExternalForcesFromComponent`）。

![Blueprint Nodes](/img/features/bp-externalforce-nodes.png)

*Blueprint用の外力制御ノード*

手順とシグネチャは以下を参照してください。

- 使い方の流れ: [ランタイム制御](/docs/advanced/runtime-control)
- 全関数の一覧: [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library#external-force-api)

## 関連ページ

このページは外部力パラメータの**リファレンス**です。実際の使い方は以下のガイドを参照してください。

- [風と外部力](/docs/features/wind-and-forces) — 風・重力・外部力の基本的な使い方（入門）
- [外部力プリセット](/docs/features/external-force-presets) — Basic / Curve / Gravity / Wind プリセットの詳細
- [カスタム重力](/docs/advanced/custom-gravity) — 重力方向のカスタマイズ
- [AnimNotify](/docs/features/animnotify) — アニメーション中の外力制御
