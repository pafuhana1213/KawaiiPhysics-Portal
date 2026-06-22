---
sidebar_position: 3
title: "Wind and External Forces"
---

# Wind and External Forces

This guide explains how to set up wind and external forces in KawaiiPhysics.

External forces in KawaiiPhysics come in two flavors: direct AnimNode properties (the `Force` category) and the more flexible [External Force Presets](/docs/features/external-force-presets) (the `ExternalForces` array). This page focuses on the former and explains how to use both together.

## Wind System

You can integrate with Unreal Engine's **Wind Directional Source**.

### Enabling

Enabling `bEnableWind` in the node's `Force` category makes the bones respond to Wind Directional Sources placed in the level.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| bEnableWind | bool | false | Receive influence from WindDirectionalSource |
| WindScale | float | 1.0 | Wind influence (when `bEnableWind` is enabled) |
| WindDirectionNoiseAngle | float | 0.0 | Noise added to the wind direction (degrees, when `bEnableWind` is enabled) |

### Wind Directional Source Support {#wind-directional-source}

:::tip Version Info
Added in v1.17.0 (`WindDirectionNoiseAngle` added in v1.21.0)
:::

**Setup:**

1. Place a Wind Directional Source in the level
2. Enable `bEnableWind` on the KawaiiPhysics node
3. Adjust the influence with `WindScale`
4. Optionally add variation to the wind direction with `WindDirectionNoiseAngle`

The strength and direction of the Wind Directional Source are reflected on the KawaiiPhysics bones. Because the same wind source can be shared with Cloth and SpeedTree, it is easy to keep the look consistent.

![Wind noise OFF](/img/features/wind-noise-off.webp)

*WindDirectionNoiseAngle = 0 (no noise)*

:::note Preset-based Wind
The `FKawaiiPhysics_ExternalForce_Wind` preset you can add to the `ExternalForces` array can also drive wind. The preset version has a bone-length-ratio correction curve (`ForceRateByBoneLengthRate`) for finer control. See [External Force Presets](/docs/features/external-force-presets) for details.
:::

## Custom External Forces

To apply force in an arbitrary direction, you have the following options.

### SimpleExternalForce (Direct Property)

Setting `SimpleExternalForce` (FVector) in the `Force|External Force` category applies that force continuously. `bUseWorldSpaceSimpleExternalForce` (default true) switches between world and component space.

```cpp
// AnimNode property (C++ access example)
Node->SimpleExternalForce = FVector(100, 0, 0);  // constant force along X
Node->bUseWorldSpaceSimpleExternalForce = true;
```

### External Force Presets (Recommended)

When you need direction, time variation, or per-bone modulation, use [External Force Presets](/docs/features/external-force-presets). Basic (directional force) / Curve (time variation) / Gravity / Wind are provided, and you can add your own presets in C++.

### Use Cases

- Wind pressure when jumping
- Knockback from explosions (apply `FKawaiiPhysics_ExternalForce_Basic` as a one-shot)
- Resistance underwater

## Gravity

### Default Gravity

`Gravity` (FVector) in the `Force` category applies gravity to the bones. The default is `(0, 0, 0)` (no gravity).

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| Gravity | FVector | (0, 0, 0) | Gravity vector |
| bUseLegacyGravity | bool | false | Application method (false = AnimDynamics compatible, true = legacy compatible) |
| bUseDefaultGravityZProjectSetting | bool | false | Multiply by the project setting's DefaultGravityZ |
| bUseWorldSpaceGravity | bool | true | Treat gravity in world space |

```cpp
// Downward gravity
Node->Gravity = FVector(0, 0, -980.0f);
```

### Custom Gravity

For advanced control such as freely changing the gravity direction or following the Character's gravity direction, see [Custom Gravity](/docs/advanced/custom-gravity) and the `FKawaiiPhysics_ExternalForce_Gravity` preset.

## Force Composition

Multiple forces are added together.

```
Final force = Gravity + Wind + SimpleExternalForce + each ExternalForce preset
```

![Force composition](/img/generated/external-forces-composition.svg)

*Gravity, Wind, and ExternalForce combined and applied to the physics bones*

## Dynamic Control

To change forces in real time during gameplay, use [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library) (`BlueprintThreadSafe`).

```cpp
// Vary wind scale with a sine wave (via the node reference)
float WindStrength = 1.0f + FMath::Sin(GetWorld()->GetTimeSeconds()) * 0.5f;
KawaiiPhysics = UKawaiiPhysicsLibrary::SetWindScale(KawaiiPhysics, WindStrength);

// Change gravity direction
KawaiiPhysics = UKawaiiPhysicsLibrary::SetGravity(KawaiiPhysics, FVector(0, 0, -980.0f));
```

For transient forces such as impacts, add an external force preset with `AddExternalForcesToComponent(..., bIsOneShot = true)`.

For more details, see [Runtime Control](/docs/advanced/runtime-control).
