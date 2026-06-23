---
sidebar_position: 7
title: "External Force Presets"
---

# External Force Presets

:::tip Version Info
Added in v1.16.0
:::

The External Force preset system allows you to apply various external forces in a modular way. Multiple presets are available that inherit from the base struct, and you can also add custom presets in C++.

## Overview

![External Force Preset System](/img/generated/external-force-presets.svg)

*Types of presets and application flow*

### Architecture

```
FKawaiiPhysics_ExternalForce (Base)
├─ FKawaiiPhysics_ExternalForce_Basic (Generic directional force)
├─ FKawaiiPhysics_ExternalForce_Curve (Time-based curve force)
├─ FKawaiiPhysics_ExternalForce_Gravity (Gravity)
└─ FKawaiiPhysics_ExternalForce_Wind (Wind)
```

[View Source](https://github.com/pafuhana1213/KawaiiPhysics/tree/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/ExternalForces)

## Base Class: FKawaiiPhysics_ExternalForce

The base struct for all external force presets.

### Common Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| bIsEnabled | bool | true | Enable/disable the force |
| bDrawDebug | bool | false | Enable/disable debug drawing |
| ApplyBoneFilter | TArray\<FBoneReference\> | Empty | Bones to apply force to (all if empty) |
| IgnoreBoneFilter | TArray\<FBoneReference\> | Empty | Bones to exclude from force |
| ExternalForceSpace | EExternalForceSpace | WorldSpace | Simulation space |
| RandomForceScaleRange | FFloatInterval | (1.0, 1.0) | Random scale range for force |

### Simulation Space (EExternalForceSpace)

| Value | Description |
|-------|-------------|
| ComponentSpace | Simulate in component space. Mesh movement doesn't affect velocity |
| WorldSpace | Simulate in world space. Mesh movement affects velocity |
| BoneSpace | Simulate in another bone's space |

### Bone Filter Usage Example

```cpp
// Apply force only to specific bones
ApplyBoneFilter.Add(FBoneReference("hair_01"));
ApplyBoneFilter.Add(FBoneReference("hair_02"));

// Exclude specific bones
IgnoreBoneFilter.Add(FBoneReference("hair_root"));
```

---

## Basic: Simple Directional Force

Applies a constant directional force continuously or at intervals.

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| ForceDir | FVector | (0, 0, 0) | Force direction |
| ForceRateByBoneLengthRate | FRuntimeFloatCurve | - | Force correction curve by bone length ratio |
| Interval | float | 0.0 | Interval between force applications (seconds). 0 = every frame |

### Usage Example

```cpp
// Constant force to the right
FKawaiiPhysics_ExternalForce_Basic BasicForce;
BasicForce.ForceDir = FVector(100, 0, 0);
BasicForce.Interval = 0.0f; // Apply every frame
```

---

## Curve: Curve-Based Force

External force that changes over time according to a curve. Ideal for animation and timeline-based effects.

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| ForceCurve | FRuntimeVectorCurve | - | Force curve over time (X: time, Y: force) |
| CurveEvaluateType | EExternalForceCurveEvaluateType | Single | Curve evaluation method |
| SubstepCount | int | 10 | Number of time subdivisions (for non-Single modes) |
| TimeScale | float | 1.0 | Time scale factor |
| ForceRateByBoneLengthRate | FRuntimeFloatCurve | - | Force correction curve by bone length ratio |

### Curve Evaluation Type (EExternalForceCurveEvaluateType)

| Value | Description |
|-------|-------------|
| Single | Evaluate at a single point |
| Average | Average of multiple points |
| Max | Maximum of multiple points |
| Min | Minimum of multiple points |

### Usage Example

```cpp
// Oscillating force
FKawaiiPhysics_ExternalForce_Curve CurveForce;
CurveForce.TimeScale = 2.0f; // Play at 2x speed
CurveForce.CurveEvaluateType = EExternalForceCurveEvaluateType::Average;
```

---

## Gravity: Gravity Force

Simulates gravity. Can integrate with Character settings.

:::note
Gravity is always fixed to WorldSpace. Space selection is not available.
:::

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| ForceRateByBoneLengthRate | FRuntimeFloatCurve | - | Force correction curve by bone length ratio |
| bUseCharacterGravityDirection | bool | false | Use Character's gravity direction (CustomGravityDirection); effective on UE5.3+ |
| bUseCharacterGravityScale | bool | false | Use Character's GravityScale |
| bUseOverrideGravityDirection | bool | false | Whether to override gravity direction |
| OverrideGravityDirection | FVector | (0, 0, 0) | Override gravity direction value |

### Integration with Character

In UE5.3 and later, you can automatically integrate with Character's gravity settings (gravity direction and GravityScale).

```cpp
// Use Character's gravity settings
FKawaiiPhysics_ExternalForce_Gravity GravityForce;
GravityForce.bUseCharacterGravityDirection = true;
GravityForce.bUseCharacterGravityScale = true;
```

### Overriding Gravity Direction

```cpp
// Horizontal gravity (e.g., space station)
FKawaiiPhysics_ExternalForce_Gravity GravityForce;
GravityForce.bUseOverrideGravityDirection = true;
GravityForce.OverrideGravityDirection = FVector(1, 0, 0);
```

---

## Wind: Wind Force

Uses wind from WindDirectionalSource. Designed to work with Cloth and SpeedTree.

:::note
Wind is always fixed to WorldSpace. Space selection is not available.
:::

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| ForceRateByBoneLengthRate | FRuntimeFloatCurve | - | Force correction curve by bone length ratio |
| WindDirectionNoiseAngle | float | 0.0 | Noise angle for wind direction from WindDirectionalSource (degrees) |

### WindDirectionalSource Setup

1. Place a WindDirectionalSource in the level
2. Configure wind strength and direction
3. Add Wind preset to KawaiiPhysics node

```cpp
FKawaiiPhysics_ExternalForce_Wind WindForce;
WindForce.WindDirectionNoiseAngle = 15.0f; // 15 degree random variation
```

---

## Custom External Forces (CustomExternalForces)

:::warning Experimental Feature
This feature is experimental. It may not work properly unless you click on the AnimNode or compile the Animation Blueprint.
:::

You can implement custom force logic in Blueprint or C++.

### Base Class: UKawaiiPhysics_CustomExternalForce

```cpp
UCLASS(Abstract, Blueprintable, EditInlineNew, CollapseCategories)
class UKawaiiPhysics_CustomExternalForce : public UObject
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| bIsEnabled | bool | true | Whether this custom force is enabled |
| bDrawDebug | bool | false | Whether to draw debug visualization |

### Overridable Functions

| Function | Description |
|----------|-------------|
| PreApply | Pre-apply processing (called once for all bones) |
| Apply | Apply force to each bone (called per bone) |

### C++ Implementation Example

```cpp
UCLASS()
class UMyCustomForce : public UKawaiiPhysics_CustomExternalForce
{
    GENERATED_BODY()

public:
    virtual void Apply_Implementation(FAnimNode_KawaiiPhysics& Node,
        int32 ModifyBoneIndex, const USkeletalMeshComponent* SkelComp,
        const FTransform& BoneTransform) override
    {
        // Custom logic
    }
};
```

### Blueprint Implementation

1. Create a Blueprint class inheriting from `UKawaiiPhysics_CustomExternalForce`
2. Override `PreApply` and `Apply` events
3. Add to KawaiiPhysics node's `CustomExternalForces`

---

## Common Features

### ForceRateByBoneLengthRate

A force correction curve based on distance from root, available in all presets.

- X-axis: Position in bone chain (0.0 = root, 1.0 = tip)
- Y-axis: Force scale factor

```cpp
// Example: Increase force toward the tip
ForceRateByBoneLengthRate.GetRichCurve()->AddKey(0.0f, 0.5f);
ForceRateByBoneLengthRate.GetRichCurve()->AddKey(1.0f, 1.5f);
```

### Debug Drawing

Set `bDrawDebug = true` to visualize force vectors in the viewport.

---

## Adding / Removing at Runtime

Presets can be added and removed at runtime from Blueprint / C++ (`AddExternalForce` / `AddExternalForcesToComponent`). For the how-to flow see [Runtime Control](/docs/advanced/runtime-control), and for full function signatures see [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library#external-force-api).

---

## Related Pages

- [External Forces Parameters](/docs/parameters/external-forces) - AnimNode external force parameters
- [AnimNotify](/docs/features/animnotify) - External force control during animation
- [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library) - Blueprint API
