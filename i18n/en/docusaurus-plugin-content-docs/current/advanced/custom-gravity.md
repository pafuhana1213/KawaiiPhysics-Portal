---
sidebar_position: 3
title: "Custom Gravity"
---

# Custom Gravity

This guide explains how to customize gravity direction.

![Custom gravity directions](/img/generated/custom-gravity-directions.svg)

*Changing the Gravity vector changes how bones swing: default (down), wall-walking (sideways), zero-G (0), and underwater/buoyancy (up). (Diagram labels are in Japanese.)*

There are two ways to handle gravity in KawaiiPhysics:

1. **The AnimNode `Gravity` property** (`Force` category) — a simple vector
2. **The `FKawaiiPhysics_ExternalForce_Gravity` preset** (`ExternalForces` array) — can integrate with the Character's gravity direction and GravityScale

## Basic Gravity Settings (Gravity Property)

`Gravity` is an FVector, and **its default is `(0, 0, 0)` (no gravity)**. To apply downward gravity, set it explicitly.

```cpp
// Downward gravity (magnitude in world units)
Node->Gravity = FVector(0, 0, -980.0f);
```

:::tip
Enabling `bUseDefaultGravityZProjectSetting` multiplies the `Gravity` vector by the project setting's `DefaultGravityZ` (absolute value). In that case you only need to specify a normalized direction such as `Gravity = FVector(0, 0, -1.0f)` to get gravity of the appropriate magnitude.
:::

## Changing Gravity Direction

### World Coordinate Specification

When `bUseWorldSpaceGravity` (default `true`) is enabled, `Gravity` is interpreted in world space.

```cpp
// Downward
Node->Gravity = FVector(0, 0, -980.0f);

// Forward
Node->Gravity = FVector(980.0f, 0, 0);

// Diagonal down
Node->Gravity = FVector(0.5f, 0, -0.5f).GetSafeNormal() * 980.0f;
```

### Changing It at Runtime

To change gravity at runtime, use `SetGravity` from [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library) (`BlueprintThreadSafe`).

```cpp
// Use the character's down direction as gravity (e.g. wall-walking)
FVector CharacterDown = -Character->GetActorUpVector();
KawaiiPhysics = UKawaiiPhysicsLibrary::SetGravity(KawaiiPhysics, CharacterDown * 980.0f);
```

### Following the Character's Gravity Direction (Preset)

To automatically follow the Character Movement gravity direction (UE5.3+ custom gravity), use the `FKawaiiPhysics_ExternalForce_Gravity` preset instead of the `Gravity` property.

```cpp
FKawaiiPhysics_ExternalForce_Gravity GravityForce;
GravityForce.bUseCharacterGravityDirection = true;  // follow the Character's gravity direction
GravityForce.bUseCharacterGravityScale = true;      // use the Character's GravityScale
```

See [External Force Presets](/docs/features/external-force-presets) for details.

## Use Cases

### Wall-Walking Character

When a character walks on walls, align gravity with the opposite of the wall normal.

```cpp
void UpdateGravity(FVector WallNormal)
{
    // Set the opposite of the wall normal as gravity
    KawaiiPhysics = UKawaiiPhysicsLibrary::SetGravity(KawaiiPhysics, -WallNormal * 980.0f);
}
```

### Outer Space (Zero Gravity)

```cpp
Node->Gravity = FVector::ZeroVector;  // same as default (no gravity)
```

### Underwater (Buoyancy)

```cpp
// A weak upward force expresses buoyancy
Node->Gravity = FVector(0, 0, 300.0f);
```

## Gravity Per Body Part

To apply different gravity to different parts, use multiple KawaiiPhysics nodes.

```
AnimGraph
├── KawaiiPhysics (Hair: normal gravity)
│   Gravity = (0, 0, -980)
│
└── KawaiiPhysics (Wings: upward buoyancy)
    Gravity = (0, 0, 200)
```

## Dynamic Gravity Changes

To change gravity during gameplay, call `SetGravity` from Blueprint / C++.

```cpp
// Example: update gravity from a Blueprint-callable function
void AMyCharacter::SetHairGravity(FVector NewGravity)
{
    // Reference the KawaiiPhysics node in the AnimGraph via ConvertToKawaiiPhysics,
    // then call UKawaiiPhysicsLibrary::SetGravity(Ref, NewGravity)
}
```

For more details, see [Runtime Control](/docs/advanced/runtime-control).
