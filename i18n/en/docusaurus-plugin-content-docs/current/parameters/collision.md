---
sidebar_position: 3
title: "Collision Parameters"
---

# Collision Parameters

<!-- AUTO-GENERATED: This page is auto-generated from source code -->

Parameters related to collision detection.

:::tip About This Page
This is the **complete reference** for collision parameters. For the actual setup steps and how to choose shapes, see the [Collision Setup guide](/docs/features/collision-setup); for sharing collision across multiple meshes, see [Shared Collision](/docs/features/shared-collision).
:::

## Collision Types

KawaiiPhysics supports the following 4 collision shapes.

| Type | Description |
|------|-------------|
| Spherical | Sphere collision |
| Capsule | Capsule collision |
| Box | Box collision |
| Planar | Plane collision |

## FCollisionLimitBase (Common Properties)

Base properties common to all collision types.

| Property | Type | Description |
|----------|------|-------------|
| DrivingBone | FBoneReference | Bone that the collision follows |
| OffsetLocation | FVector | Offset position from bone (Default: ZeroVector) |
| OffsetRotation | FRotator | Offset rotation from bone (Default: ZeroRotator, Range: -360 to 360) |

## FSphericalLimit (Sphere Collision)

Adds spherical collision detection.

```cpp
UPROPERTY(EditAnywhere, Category = "Limits")
TArray<FSphericalLimit> SphericalLimits;
```

### Properties

| Name | Type | Default | Description |
|------|------|---------|-------------|
| Radius | float | 5.0 | Sphere radius (0 or higher) |
| LimitType | ESphericalLimitType | Outer | Inner/outer limit type |

### ESphericalLimitType

| Value | Description |
|-------|-------------|
| Inner | Limit to inside the sphere (push bone inside the sphere) |
| Outer | Limit to outside the sphere (push bone out of the sphere) |

## FCapsuleLimit (Capsule Collision)

Adds capsule-shaped collision detection.

```cpp
UPROPERTY(EditAnywhere, Category = "Limits")
TArray<FCapsuleLimit> CapsuleLimits;
```

### Properties

| Name | Type | Default | Description |
|------|------|---------|-------------|
| Radius | float | 5.0 | Capsule radius (0 or higher) |
| Length | float | 10.0 | Capsule length (0 or higher) |

## FTaperedCapsuleLimit (Tapered Capsule) {#tapered-capsule}

:::warning Not officially released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

`FTaperedCapsuleLimit` represents a collision shape with a different radius at each end. In addition to Simple World Collision gathering, it is supported by the node's `Collision > Tapered Capsule Collision`, Limits DataAssets, and shapes read from PhysicsAssets. Ordinary Capsules existed before v1.22; separate endpoint-radius support is the addition described here.

| Setting | Default | Meaning |
|---|---|---|
| Radius0 | 5 cm | Radius at the shape-local +Z endpoint |
| Radius1 | 5 cm | Radius at the shape-local −Z endpoint |
| Length | 10 cm | Distance between endpoint sphere centers, not overall length |

Position it with `Driving Bone` and location/rotation offsets. Equal endpoint radii give an equal-radius capsule. Radii and length are clamped to nonnegative values. When `Length <= abs(Radius0 - Radius1)` (with a small tolerance in the implementation), the smaller endpoint sphere is contained in the larger one, and the shape collapses to that larger sphere. Collision, editing, and debug drawing use the same condition.

In the normal case, push-out linearly interpolates the radius at the closest point on the axis segment. This does not guarantee identical contacts to Chaos geometry, so test strong tapers and narrow parts in practice. Simple World Collision conversion uses query-enabled shapes and does not use cloth Width or one-sided collision attributes. [Mirror Data Table for Collision](/docs/features/collision-mirroring) swaps radii when needed to preserve endpoint meaning.

[Setup steps and diagram](/docs/features/collision-setup#tapered-capsule)

## FBoxLimit (Box Collision)

Adds box-shaped collision detection.

```cpp
UPROPERTY(EditAnywhere, Category = "Limits")
TArray<FBoxLimit> BoxLimits;
```

### Properties

| Name | Type | Default | Description |
|------|------|---------|-------------|
| Extent | FVector | (5.0, 5.0, 5.0) | Box extent (half size for each axis) |

## FPlanarLimit (Plane Collision)

Adds planar collision detection.

```cpp
UPROPERTY(EditAnywhere, Category = "Limits")
TArray<FPlanarLimit> PlanarLimits;
```

### Properties

| Name | Type | Default | Description |
|------|------|---------|-------------|
| Plane | FPlane | (0, 0, 0, 0) | Plane definition |

## Loading from Data Asset

### LimitsDataAsset

Collision settings can be loaded from a Data Asset. Recommended when you want to reuse settings across different AnimNodes or Animation Blueprints.

```cpp
UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Limits")
TObjectPtr<UKawaiiPhysicsLimitsDataAsset> LimitsDataAsset;
```

### PhysicsAssetForLimits

Collision settings can also be loaded from a Physics Asset.

```cpp
UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Limits")
TObjectPtr<UPhysicsAsset> PhysicsAssetForLimits;
```

## World Collision

### bAllowWorldCollision

**World Collision** - Flag to perform collision detection with collisions in the level.

| Property | Value |
|----------|-------|
| Type | bool |
| Default | false |

:::warning
Enabling this significantly increases physics processing load.
:::

### bIgnoreSelfComponent

**Ignore Self Collision** - Flag to ignore collisions (PhysicsAsset) owned by the SkeletalMeshComponent in WorldCollision.

| Property | Value |
|----------|-------|
| Type | bool |
| Default | true |
| Edit Condition | `bAllowWorldCollision == true` |

### IgnoreBones

**Ignore Bones** - Setting to ignore collisions (PhysicsAsset) owned by the SkeletalMeshComponent in WorldCollision (specified by bones).

| Property | Value |
|----------|-------|
| Type | TArray\<FBoneReference\> |
| Edit Condition | `bIgnoreSelfComponent == false` |

### IgnoreBoneNamePrefix

**Ignore Bone Name Prefix** - Setting to ignore collisions (PhysicsAsset) owned by the SkeletalMeshComponent in WorldCollision (specified by bone name prefix).

| Property | Value |
|----------|-------|
| Type | TArray\<FName\> |
| Edit Condition | `bIgnoreSelfComponent == false` |

### bOverrideCollisionParams

**Override Collision Parameters** - Set when using custom collision settings instead of SkeletalMeshComponent's collision settings for WorldCollision.

| Property | Value |
|----------|-------|
| Type | bool |
| Default | false |

## Shared Collision

Settings that let multiple KawaiiPhysics nodes share a single set of collision shapes. Collision can be shared across different meshes within the same Actor/ChildActor family. See [Shared Collision](/docs/features/shared-collision) for details.

### bSharedCollisionSource

**Publish Collision** - Provides this node's collision to KawaiiPhysics nodes in the same attached Actor/ChildActor family (acts as a Source).

| Property | Value |
|----------|-------|
| Type | bool |
| Default | false |
| Category | Limits&#124;Shared Collision |

### bUseSharedCollision

**Use Shared Collision** - Uses collision published by Source nodes in the same family (acts as a Target). Mutually exclusive with Source.

| Property | Value |
|----------|-------|
| Type | bool |
| Default | false |
| Edit Condition | `!bSharedCollisionSource` |
| Category | Limits&#124;Shared Collision |

### SharedCollisionGroupTag

**Group Tag** - A GameplayTag identifying the shared collision group. Both Source and Target use the same tag.

| Property | Value |
|----------|-------|
| Type | FGameplayTag |
| Edit Condition | `bSharedCollisionSource &#124;&#124; bUseSharedCollision` |
| Category | Limits&#124;Shared Collision |

:::tip
To use same-frame collision within one AnimGraph, place the Source node so it evaluates before the Target node.
:::

## Collision Source Type

Enum indicating the source of collision settings.

```cpp
UENUM()
enum class ECollisionSourceType : uint8
{
    AnimNode,      // Use values set in AnimNode
    DataAsset,     // Use values set in DataAsset
    PhysicsAsset,  // Use values set in PhysicsAsset
};
```

:::tip
Using Data Assets allows sharing collision settings across multiple AnimNodes and Animation Blueprints.
:::

For more details, see [Data Assets](/docs/features/data-assets).

## Related UE documentation {#ue-docs}

- [Physics Asset Editor](https://dev.epicgames.com/documentation/en-us/unreal-engine/physics-asset-editor-in-unreal-engine) — Understand PhysicsAssets and the editor used to author their shapes. (UE 5.8)
