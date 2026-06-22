---
sidebar_position: 3
title: "風と外部力"
---

# 風と外部力

KawaiiPhysicsでの風と外部力の設定方法を説明します。

KawaiiPhysics の外力には、AnimNode の直接プロパティ（`Force` カテゴリ）で設定する方式と、より柔軟な [外部力プリセット](/docs/features/external-force-presets)（`ExternalForces` 配列）の2系統があります。本ページは前者を中心に、両者の使い分けを説明します。

## 風システム

Unreal Engine の **Wind Directional Source** と連携できます。

### 有効化

ノードの `Force` カテゴリにある `bEnableWind` を有効にすると、レベルに配置した Wind Directional Source の影響を受けます。

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| bEnableWind | bool | false | 風（WindDirectionalSource）の影響を受ける |
| WindScale | float | 1.0 | 風の影響度（`bEnableWind` 有効時） |
| WindDirectionNoiseAngle | float | 0.0 | 風方向に与えるノイズ（度、`bEnableWind` 有効時） |

### Wind Directional Source対応 {#wind-directional-source}

:::tip バージョン情報
v1.17.0で追加（`WindDirectionNoiseAngle` は v1.21.0 で追加）
:::

**設定方法:**

1. レベルに Wind Directional Source を配置
2. KawaiiPhysics ノードで `bEnableWind` を有効化
3. `WindScale` で影響度を調整
4. 必要に応じて `WindDirectionNoiseAngle` で風向きにゆらぎを加える

Wind Directional Source の強度と方向が KawaiiPhysics の物理ボーンに反映されます。Cloth や SpeedTree と同じ風源を共有できるため、見た目を揃えやすくなります。

![Wind ノイズ OFF](/img/features/wind-noise-off.webp)

*WindDirectionNoiseAngle = 0（ノイズなし）*

:::note プリセット版の Wind
`ExternalForces` 配列に追加できる `FKawaiiPhysics_ExternalForce_Wind` プリセットでも風を扱えます。プリセット版はボーン長比による補正カーブ（`ForceRateByBoneLengthRate`）を持ち、より細かい制御が可能です。詳細は [外部力プリセット](/docs/features/external-force-presets) を参照してください。
:::

## カスタム外部力

任意の方向に力を適用するには、以下の方法があります。

### SimpleExternalForce（直接プロパティ）

`Force|External Force` カテゴリの `SimpleExternalForce`（FVector）に値を入れると、その力が継続的に適用されます。`bUseWorldSpaceSimpleExternalForce`（既定 true）でワールド/コンポーネント座標系を切り替えます。

```cpp
// AnimNode のプロパティ（C++ からのアクセス例）
Node->SimpleExternalForce = FVector(100, 0, 0);  // X方向への一定の力
Node->bUseWorldSpaceSimpleExternalForce = true;
```

### 外部力プリセット（推奨）

向きや時間変化、ボーンごとの補正が必要な場合は [外部力プリセット](/docs/features/external-force-presets) を使います。Basic（方向力）/ Curve（時間変化）/ Gravity / Wind などが用意され、C++ で独自プリセットも追加できます。

### 使用例

- ジャンプ時の風圧表現
- 爆発による吹き飛ばし（`FKawaiiPhysics_ExternalForce_Basic` を OneShot 適用）
- 水中での抵抗

## 重力

### デフォルト重力

`Force` カテゴリの `Gravity`（FVector）でボーンに重力を適用します。既定は `(0, 0, 0)`（無重力）です。

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| Gravity | FVector | (0, 0, 0) | 重力ベクトル |
| bUseLegacyGravity | bool | false | 適用方式（false=AnimDynamics互換、true=従来互換） |
| bUseDefaultGravityZProjectSetting | bool | false | プロジェクト設定の DefaultGravityZ を乗算 |
| bUseWorldSpaceGravity | bool | true | 重力をワールド座標系で扱う |

```cpp
// 下向きの重力
Node->Gravity = FVector(0, 0, -980.0f);
```

### カスタム重力

重力方向を自由に変える、あるいは Character の重力方向に追従させるなどの高度な制御は、[カスタム重力](/docs/advanced/custom-gravity) と `FKawaiiPhysics_ExternalForce_Gravity` プリセットを参照してください。

## 力の合成

複数の力は加算されて適用されます。

```
最終的な力 = Gravity + Wind + SimpleExternalForce + 各 ExternalForce プリセット
```

![力の合成](/img/generated/external-forces-composition.svg)

*Gravity、Wind、ExternalForceが合成されて物理ボーンに適用される様子*

## 動的な制御

ゲーム中に力をリアルタイムで変更するには [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library) を使います（`BlueprintThreadSafe`）。

```cpp
// 風のスケールをサイン波で変化させる（ノード参照経由）
float WindStrength = 1.0f + FMath::Sin(GetWorld()->GetTimeSeconds()) * 0.5f;
KawaiiPhysics = UKawaiiPhysicsLibrary::SetWindScale(KawaiiPhysics, WindStrength);

// 重力方向を変更
KawaiiPhysics = UKawaiiPhysicsLibrary::SetGravity(KawaiiPhysics, FVector(0, 0, -980.0f));
```

衝撃などの一時的な力は、外力プリセットを `AddExternalForcesToComponent(..., bIsOneShot = true)` で追加します。

詳しくは [ランタイム制御](/docs/advanced/runtime-control) を参照してください。
