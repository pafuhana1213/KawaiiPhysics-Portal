---
sidebar_position: 2
title: "Collision Setup"
---

# Collision Setup

Set up collisions to prevent bones from penetrating through the body.

:::note
This page is a setup **guide**. For all properties and default values of each collision shape, see [Collision Parameters](/docs/parameters/collision).
:::

![Collision system overview](/img/generated/collision-system-overview.svg)

*Examples of collision placement and the purpose of each shape (diagram labels are in Japanese).*

## Collision Types

### Sphere

Suitable for spherical parts like head and shoulders.

![Sphere collision example](/img/collision-example.webp)

### Capsule

Suitable for cylindrical parts like arms and legs.

![Capsule collision example](/img/collision-example.webp)

### Plane

Used for flat surface restrictions like ground and walls.

### Box {#box}

:::tip Version Info
Added in v1.17.0
:::

Box-shaped collision. Suitable for rectangular shapes like body and buildings.

```cpp
UPROPERTY()
TArray<FBoxLimit> BoxLimits;
```

**FBoxLimit Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| DrivingBone | FBoneReference | - | Bone that collision follows |
| OffsetLocation | FVector | (0, 0, 0) | Location offset from the Driving Bone |
| OffsetRotation | FRotator | (0, 0, 0) | Rotation offset from the Driving Bone (range -360 to 360) |
| Extent | FVector | (5, 5, 5) | Box half-extents (size in each axis direction) |

:::note
`DrivingBone` / `OffsetLocation` / `OffsetRotation` are common to all collision shapes (`FCollisionLimitBase`). `FSphericalLimit` adds `Radius` (default 5) and `LimitType` (Inner/Outer); `FCapsuleLimit` adds `Radius` (default 5) and `Length` (default 10).
:::

## Collision Generation from PhysicsAsset {#physicsasset}

:::tip Version Info
Added in v1.17.0
:::

You can auto-generate collision shapes from existing PhysicsAssets. Collision bodies defined in PhysicsAsset are converted to KawaiiPhysics collisions.

### Usage

1. Select KawaiiPhysics node
2. Set existing PhysicsAsset to **Physics Asset** property
3. Collision shapes are automatically generated

### Benefits

- Reuse existing PhysicsAssets
- Reduces manual collision setup work
- Consistent collision settings

## Adding Collision

1. Select the KawaiiPhysics node
2. Add elements to **Spherical Limits** / **Capsule Limits** / **Box Limits** / **Planar Limits** array
3. Set **Driving Bone** (bone that collision follows)
4. Adjust offset and size

## Driving Bone

Collision follows and moves with the Driving Bone.

```
upperarm_r (Driving Bone)
    ↓ Follows
[Capsule Collision] → Hair stops here
```

## Inside vs Outside

### Inside (Inner Limit)

Limits bones to **inside** the sphere.

- Use case: Following head shape

### Outside (Outer Limit)

Limits bones to **outside** the sphere.

- Use case: Preventing penetration into shoulders

## Performance Considerations

More collisions increase processing load.

:::tip
- Use the minimum necessary collisions
- Approximate complex shapes with multiple simple shapes
:::

For more details, see [Performance](/docs/advanced/performance).
