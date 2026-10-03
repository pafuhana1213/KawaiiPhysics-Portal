---
title: "Mirror Data Table for Collision"
---

import LegacyReference from '@site/src/components/LegacyReference';

import DocFigure from '@site/src/components/DocFigure';

# Mirror Data Table for Collision {#mirror-data-table-for-collision}

:::warning Not Officially Released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

When both arms or legs need matching collisions, changing a radius or placement on one side means adjusting the other side too. If left and right bones have different orientations, copying the same offset values may not put the shapes in matching positions.

**Collision mirroring** uses a MirrorDataTable's bone mapping and the reference pose to generate counterparts from one authored side. It helps artists tuning characters that need matching left/right collisions. An intentionally different, hand-tuned opposite side can be preserved.

<DocFigure src="/img/generated/artist-authoring-mirror-flat.svg" alt="Before and after diagram: orange spheres and capsules authored on one bone chain, with teal counterparts generated on the mapped chain" caption="Schematic, not UE UI. Orange is authored collision; teal is generated collision. The dashed line represents the mirror plane. Actual offsets use the Skeleton reference pose." />

## Configuring Mirror Data Table for Collision {#mirror-setup}

Use a MirrorDataTable configured with the target Skeleton left/right bone mappings and Mirror Axis.

1. Select the intended Kawaii Physics node.
2. Assign the table to `Collision > Mirror Data Table for Collision`.
3. Keep the option that skips bones with existing collisions enabled.
4. Compile the Animation Blueprint.
5. Play the motion.

## Shape Adjustment and Existing Collision {#mirror-adjust}

Adjust the original radius, size, position, or rotation offset while checking the generated side. Deriving the counterpart from the original settings reduces repeated manual edits. Generated shapes are not added and saved into the source asset.

If the opposite side needs a different shape, author it manually and keep the default skip option. Skipping is per shape type: an existing Sphere suppresses another Sphere, but does not also suppress a Capsule.

## Settings and Generation Conditions {#mirror-details-configuration}

| Setting | Condition or behavior |
|---|---|
| `Mirror Data Table for Collision` | Uses the target Skeleton's left/right mappings and `MirrorAxis` |
| `bSkipMirroredBoneWithExistingCollision` | Defaults to true; skips a mapped target with a non-Mirror shape of the same type |
| Authored shape | Configure its `Driving Bone`, shape, and position/rotation offsets |
| No generation | No table, MirrorAxis None, no Skeleton information, no valid mapping, or a bone mapped to itself |

## Offsets and Existing Shapes {#mirror-details-existing-collisions}

Position and rotation offsets are converted into the opposite bone's local space using component-space reference-pose bone rotations. This is more than replacing bone names or flipping one offset coordinate.

Skipping checks whether the target bone already has a **non-Mirror collision of the same shape type**. A manually authored Sphere prevents generating another Sphere there; it does not also suppress Capsules. Shapes need not have identical positions or radii for this check. Setting the option to false permits generation alongside manual shapes, which can cause duplicate push-out.

Generated shapes have `Source Type` set to `Mirror`. Previous Mirror-sourced shapes are removed before regeneration. This operation does not write the generated opposite-side shapes back into the source asset.

## Supported Shapes and Tapered Capsule {#mirror-details-shape-notes}

For Tapered Capsules, `Radius0` belongs to the +Z endpoint and `Radius1` to the −Z endpoint. If the generated rotation reverses endpoint meaning, mirroring swaps the radii to keep the thickness associated with the original physical endpoints.

The implementation generates Sphere, Capsule, Tapered Capsule, Box, and Plane shapes. This setting does not arbitrarily mirror gathered Simple World Collision shapes or Convex shapes.

[Official Release Collision Setup](/docs/features/collision-setup) · [v1.22 Preview Overview](/docs/preview)

## Related UE documentation {#ue-docs}

- [Mirroring Animation](https://dev.epicgames.com/documentation/en-us/unreal-engine/mirroring-animation-in-unreal-engine) — Create a Mirror Data Table and inspect paired bones and Mirror Axis; KawaiiPhysics uses the table for collision generation. (UE 5.8)

<span id="mirror-prerequisites" hidden />
<span id="mirror-check-result" hidden />
<span id="mirror-troubleshooting" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"mirror-prerequisites": "/en/docs/features/collision-mirroring#mirror-setup", "mirror-check-result": "/en/docs/features/collision-mirroring#mirror-details-existing-collisions", "mirror-troubleshooting": "/en/docs/features/collision-mirroring#mirror-details-configuration"}} to="/en/docs/features/collision-mirroring#mirror-setup" label="Related specifications and usage" />
