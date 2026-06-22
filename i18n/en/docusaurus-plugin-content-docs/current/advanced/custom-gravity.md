---
sidebar_position: 3
title: "Custom Gravity"
---

# Custom Gravity

This guide explains how to customize gravity direction.

![Custom gravity directions](/img/generated/custom-gravity-directions.svg)

*Changing the Gravity vector changes how bones swing: default (down), wall-walking (sideways), zero-G (0), and underwater/buoyancy (up). (Diagram labels are in Japanese.)*

## Basic Gravity Settings

```cpp
UPROPERTY()
FVector Gravity = FVector(0, 0, -1.0f);
```

Default is downward (-Z direction) gravity.

## Changing Gravity Direction

### World Coordinate Specification

```cpp
// Downward (default)
Gravity = FVector(0, 0, -1.0f);

// Forward direction
Gravity = FVector(1.0f, 0, 0);

// Diagonal down
Gravity = FVector(0.5f, 0, -0.5f).GetSafeNormal();
```

### Character-Relative Specification

Set dynamically in Blueprint:

```cpp
// Use character's downward direction
FVector CharacterDown = -Character->GetActorUpVector();
KawaiiPhysicsNode->Gravity = CharacterDown;
```

## Use Cases

### Wall-Walking Character

When a character walks on walls, align gravity direction with the wall normal.

```cpp
void UpdateGravity(FVector WallNormal)
{
    // Set opposite of wall normal as gravity
    Gravity = -WallNormal;
}
```

### Outer Space

Zero gravity environment:

```cpp
Gravity = FVector::ZeroVector;
```

### Underwater

Express buoyancy:

```cpp
// Upward buoyancy
Gravity = FVector(0, 0, 0.3f);
```

## Gravity Per Body Part

To apply different gravity to different parts, use multiple KawaiiPhysics nodes.

```
AnimGraph
├── KawaiiPhysics (Hair: normal gravity)
│   Gravity = (0, 0, -1)
│
└── KawaiiPhysics (Wings: upward buoyancy)
    Gravity = (0, 0, 0.2)
```

## Dynamic Gravity Changes

Gravity can be changed during gameplay.

```cpp
// Blueprint callable function
UFUNCTION(BlueprintCallable)
void SetCustomGravity(FVector NewGravity)
{
    KawaiiPhysicsNode->Gravity = NewGravity;
}
```

For more details, see [Runtime Control](/docs/advanced/runtime-control).
