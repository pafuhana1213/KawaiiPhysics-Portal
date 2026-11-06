---
sidebar_position: 3
title: "風と外部力"
---

import DocVideo from '@site/src/components/DocVideo';

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

`Force|External Force` カテゴリの `SimpleExternalForce`（FVector）に値を入れると、毎フレームその方向へボーンを押します。速度を経由せずに位置をずらすため、揺れずに押された形のまま止まります。`bUseWorldSpaceSimpleExternalForce`（既定 true）でワールド/コンポーネント座標系を切り替えます。

![SimpleExternalForceを(0, 15, 0)にした鎖が、右へ押されて傾いたまま止まっている画面](/img/sample/simple-external-force.webp)

*開発版サンプル展示4.2の実機画面。`SimpleExternalForce = (0, 15, 0)` で押された形のまま止まっています。揺れを伴う力を加えたい場合は、外部力プリセットを使います。*

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

<DocVideo src="/video/sample/gravity.mp4" poster="/video/sample/gravity.jpg" alt="同じ走りのキャラクター2体のうち、Gravity 0のツインテールは横に広がって揺れ、Gravity (0, 0, -980)のツインテールは下に垂れて揺れる録画" caption="開発版サンプル展示4.1の実機録画。左のGravity 0（既定値）では、髪の形はStiffnessで保たれ、ツインテールが横に広がります。右の(0, 0, -980)では、ツインテールが下に垂れます。" />

`bUseLegacyGravity` は重力の足し方を切り替えます。既定の `false` は速度に `Gravity * dt` を足すAnimDynamics互換の方式で、`true` は位置に `0.5 * Gravity * dt^2` を足す旧方式です。同じ値でも垂れ方が変わるので、旧バージョンから移行するときは注意してください。

![水平の参照ポーズの鎖2本に同じGravityを加え、bUseLegacyGravityがtrueの鎖は少し垂れ、falseの鎖は大きく垂れている画面](/img/sample/legacy-gravity.webp)

*開発版サンプル展示4.10の実機画面。水平の鎖に `Gravity (0, 0, -980)`、`Stiffness = 0.01` を設定しています。左の `true`（旧方式）より、右の `false`（既定値）の方が大きく垂れます。*

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
