---
title: "Collision Setup"
---

import DocFigure from '@site/src/components/DocFigure';
import LegacyReference from '@site/src/components/LegacyReference';

# Collision Setup

Set up collisions to prevent bones from penetrating through the body.

:::note
This page is a setup **guide**. For all properties and default values of each collision shape, see [Collision Parameters](/docs/parameters/collision).
:::

![Collision system overview](/img/generated/collision-system-overview.svg)

*Examples of collision placement and the purpose of each shape (diagram labels are in Japanese).*

## Collision Types {#collision-types}

### Sphere {#sphere}

Suitable for spherical parts like head and shoulders.

![Sphere collision example](/img/collision-example.webp)

### Capsule {#capsule}

Suitable for cylindrical parts like arms and legs.

![Capsule collision example](/img/collision-example.webp)

### Tapered Capsule Collision (planned for v1.22) {#tapered-capsule}

:::warning Not officially released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

An equal-radius capsule fitted to one end of a tapered limb can leave too much space at the other end. Tapered Capsule lets you set the endpoint radii independently, representing the width change with one shape.

1. Add an entry under `Collision > Tapered Capsule Collision`.
2. Select its `Driving Bone`.
3. Adjust one endpoint width with `Radius0`.
4. Adjust the other endpoint width with `Radius1`.
5. Adjust the center-to-center distance with `Length`.

<DocFigure src="/img/generated/preview-tapered-shape-en.svg" alt="Separate endpoint radii and center-to-center Length" caption="Concept: Radius0 is at shape-local +Z, Radius1 at −Z. Length measures between endpoint centers." maxWidth={420} />

Strong tapers should not assume identical contacts to Chaos geometry. A length that makes one endpoint sphere contain the other collapses the shape to the larger sphere. See the [shape reference](/docs/parameters/collision#tapered-capsule) for the exact rule.

### Plane {#plane}

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

### Usage {#usage}

1. Select KawaiiPhysics node
2. Set existing PhysicsAsset to **Physics Asset** property
3. Collision shapes are automatically generated

### Benefits {#benefits}

- Reuse existing PhysicsAssets
- Reduces manual collision setup work
- Consistent collision settings

## Adding Collision {#adding-collision}

1. Select the KawaiiPhysics node
2. Add elements to **Spherical Limits** / **Capsule Limits** / **Box Limits** / **Planar Limits** array
3. Set **Driving Bone** (bone that collision follows)
4. Adjust offset and size

## Driving Bone {#driving-bone}

Collision follows and moves with the Driving Bone.

```
upperarm_r (Driving Bone)
    ↓ Follows
[Capsule Collision] → Hair stops here
```

## Inside vs Outside {#inside-vs-outside}

### Inside (Inner Limit) {#inside-inner-limit}

Limits bones to **inside** the sphere.

- Use case: Following head shape

### Outside (Outer Limit) {#outside-outer-limit}

Limits bones to **outside** the sphere.

- Use case: Preventing penetration into shoulders

## Combining Multiple Shapes {#combining-multiple-shapes}

In actual characters, multiple collision shapes are used in combination.

![Combining multiple collision shapes](/img/generated/collision-multi-shape-setup.svg)

*Practical collision placement example for the upper body and skirt*

## Performance Considerations {#performance-considerations}

More collisions increase processing load.

:::tip
- Use the minimum necessary collisions
- Approximate complex shapes with multiple simple shapes
:::

For more details, see [Performance](/docs/advanced/performance).

<LegacyReference redirect targets={{"mirror-data-table-for-collision": "/en/docs/features/collision-mirroring", "mirror-prerequisites": "/en/docs/features/collision-mirroring#mirror-prerequisites", "mirror-setup": "/en/docs/features/collision-mirroring#mirror-setup", "mirror-check-result": "/en/docs/features/collision-mirroring#mirror-check-result", "mirror-adjust": "/en/docs/features/collision-mirroring#mirror-adjust", "mirror-troubleshooting": "/en/docs/features/collision-mirroring#mirror-troubleshooting", "mirror-details-configuration": "/en/docs/features/collision-mirroring#mirror-details-configuration", "mirror-details-existing-collisions": "/en/docs/features/collision-mirroring#mirror-details-existing-collisions", "mirror-details-shape-notes": "/en/docs/features/collision-mirroring#mirror-details-shape-notes"}} to="/en/docs/features/collision-mirroring" label="Mirror Data Table for Collision" />

## Related UE documentation {#ue-docs}

- [Physics Asset Editor](https://dev.epicgames.com/documentation/en-us/unreal-engine/physics-asset-editor-in-unreal-engine) — Understand PhysicsAssets and the editor used to author their shapes. (UE 5.8)

- [Mirroring Animation](https://dev.epicgames.com/documentation/en-us/unreal-engine/mirroring-animation-in-unreal-engine) — Create a Mirror Data Table and inspect paired bones and Mirror Axis; KawaiiPhysics uses the table for collision generation. (UE 5.8)
