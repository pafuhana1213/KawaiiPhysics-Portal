---
sidebar_position: 6
title: "Sync Bone"
---

# Sync Bone

:::tip Version Info
Added in v1.20.0. Significantly enhanced in v1.21.0 with apply direction, distance attenuation, scale curves, and more.
:::

The Sync Bone feature applies the movement and rotation of a specified bone (the sync source) to physics-controlled bones. It is effective for preventing skirts from penetrating through legs.

## Overview

Previously, collisions were used to prevent penetration of skirts and similar meshes, but it could be difficult to handle complex shapes and movements. With the Sync Bone feature, you can reflect the movement of bones such as legs onto physics bones without using collisions.

![Sync Bone Demo](/img/features/syncbone-demo.webp)

## How It Works

```
Leg Bone (Sync Source = Bone)
    ↓ Get position/rotation
[Sync Bone Processing]
    ↓ Apply to physics bones (considering apply direction, scale, and distance attenuation)
Skirt Bone (Sync Target = TargetRoots)
```

When the source bone moves or rotates, that movement is reflected onto the physics bones, preventing penetration.

![Sync Bone Processing Flow](/img/generated/sync-bone-concept.svg)

*How Sync Bone prevents penetration*

## Setup

1. Select the KawaiiPhysics node
2. Add elements to the **Sync Bones** array (`Force` category)
3. Set the sync source bone (`Bone`) and the sync targets (`TargetRoots`)

### FKawaiiPhysicsSyncBone

| Property | Type | Description |
|----------|------|-------------|
| Bone | FBoneReference | Sync source bone (e.g., a leg bone) |
| TargetRoots | TArray\<FKawaiiPhysicsSyncTargetRoot\> | Sync target bones/chains (see below) |
| GlobalScale | FVector | Overall amount of movement applied (0.0-1.0, default (1,1,1)) |
| ScaleCurveByDeltaDistance | FRuntimeFloatCurve | Curve that scales the correction amount based on the source's movement distance (X: movement distance, Y: scale) |
| ApplyDirectionX / Y / Z | ESyncBoneDirection | Direction in which movement is applied for each axis (default Both) |

### FKawaiiPhysicsSyncTargetRoot (Specifying Sync Targets)

Each element of `TargetRoots` configures the sync target bone and how the influence is applied to the chain below it.

| Property | Type | Description |
|----------|------|-------------|
| Bone | FBoneReference | Bone to apply the sync to |
| bIncludeChildBones | bool | Whether to also target all child bones of this bone (default true) |
| ScaleCurveByBoneLengthRate | FRuntimeFloatCurve | Applies a scale to the influence based on the length ratio from the TargetRoot (X: LengthRate, Y: Scale) |

When `bIncludeChildBones` is enabled, the child bones of the specified bone are automatically expanded as sync targets (`ChildTargets`). Using `ScaleCurveByBoneLengthRate`, you can apply the influence gradually, for example stronger on bones closer to the TargetRoot and weaker toward the tip.

### ESyncBoneDirection (Apply Direction)

For each axis, you can specify which direction of movement is applied.

| Value | Description |
|-------|-------------|
| Both | Apply movement in both directions (default) |
| Positive | Apply only positive-direction movement |
| Negative | Apply only negative-direction movement |
| None | Do not apply movement |

For example, when you only want to push out the skirt when the leg moves outward, you can limit the axis and direction.

## Distance Attenuation

This setting attenuates the apply amount (Alpha) based on the distance between the sync source bone and the sync target. It helps suppress excessive influence on distant bones.

| Property | Type | Description |
|----------|------|-------------|
| bEnableDistanceAttenuation | bool | Enable distance attenuation (default false) |
| AttenuationInnerRadius | float (cm) | No attenuation within this distance |
| AttenuationOuterRadius | float (cm) | Maximum attenuation is applied beyond this distance |
| MaxAttenuationRate | float | Maximum attenuation amount (0 = no attenuation, 1 = apply amount becomes 0) |

```
Distance ≤ Inner          : No attenuation (full apply)
Inner < Distance < Outer  : Interpolated based on distance
Distance ≥ Outer          : Maximum attenuation (MaxAttenuationRate)
```

## Usage Example: Preventing Skirt Leg Penetration

Set the leg bones as the sync source (`Bone`) and nearby skirt bones as the sync targets (`TargetRoots`).

```
Sync Source: thigh_l / thigh_r (leg bones)
Sync Target: skirt_front_l_01, skirt_side_l_01 ... (skirt bones)
```

- First set `GlobalScale` to a low value (0.3-0.5), then gradually increase it to fine-tune.
- Enabling `bIncludeChildBones` lets you apply the sync to the entire skirt chain at once.
- If you only want to reflect the movement when the leg moves toward the body, limit the `ApplyDirection`.

## Combining with Collision

By combining the Sync Bone feature with Collision, more reliable penetration prevention is possible.

![SyncBone + Collision Comparison](/img/features/syncbone-collision-compare.webp)

*Penetration prevention effect of combining SyncBone and Collision*

## Combining with BoneConstraint

By combining the Sync Bone feature with the BoneConstraint feature, more natural skirt expression is possible.

![SyncBone + BoneConstraint + Collision](/img/features/syncbone-full-demo.webp)

*A complete demo combining SyncBone, BoneConstraint, and Collision*

- **Sync Bone**: Prevents penetration with the legs
- **BoneConstraint**: Maintains the distance between skirt bones

```
[BoneConstraint] ← Maintains distance between bones
       ↓
Skirt Bones
       ↑
   [Sync Bone] ← Reflects leg movement
```

## Notes

:::warning
- If `GlobalScale` is too high, physics movement may become unnatural. Start with low values (0.3-0.5) and adjust from there.
- Using distance attenuation together helps suppress excessive influence on distant bones.
:::

## Comparison with Collisions

| Method | Benefits | Drawbacks |
|--------|----------|-----------|
| Collision | Physically accurate | Complex setup, high computational cost |
| Sync Bone | Lightweight, easy setup | Less physically accurate |

In many cases, combining Sync Bone and collisions achieves the best results. Combining it with Bone Subdivision enables even finer penetration prevention.

## Related Pages

- [Collision Setup](/docs/features/collision-setup)
- [Bone Subdivision](/docs/features/bone-subdivision)
- [Limits Parameters](/docs/parameters/limits)
- [Data Assets](/docs/features/data-assets)
