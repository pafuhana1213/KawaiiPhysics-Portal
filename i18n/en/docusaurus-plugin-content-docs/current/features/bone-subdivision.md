---
sidebar_position: 9
title: "Bone Subdivision"
---

# Bone Subdivision

:::tip Version Info
Added in v1.21.0
:::

**Bone Subdivision** inserts virtual "inter-bone dummies" between real bones, entirely inside the KawaiiPhysics simulation and without modifying the real skeleton, to raise the resolution of collision detection.

## The Problem It Solves

When physics-simulated bones are far apart, no collision is detected **in the gap between them**, so shapes can pass through (a typical example: a skirt made of long bones penetrating the legs).

Bone Subdivision inserts dummy bones between real bones so that collision and constraints act at a finer resolution, preventing this penetration.

![Concept of penetration prevention via Bone Subdivision](/img/generated/bone-subdivision-concept.svg)

*Dummy bones are inserted between real bones to raise collision resolution and prevent penetration. Horizontal (Bridge) subdivision also fills the gaps between columns. (Diagram labels are in Japanese.)*

:::note Under the Hood
The inserted dummies do not exist in the real skeleton (their `BoneIndex` is negative) and are automatically removed from the final output. Results are applied only to real bones, so rigs and animation are unaffected. The number of insertions is auto-corrected from the bone distance and collision radius, clamped so segments do not overlap.
:::

## Vertical Subdivision (Bone Subdivision)

Configure these under the `Bones > Bone Subdivision` category. Their AnimGraph pins are hidden by default (set them from the details panel).

### BoneSubdivisionCount

**Dummy Subdivision Count** - The minimum number of dummy bones to insert between adjacent bones. Improves collision detection. 0 to disable.

| Property | Value |
|----------|-------|
| Type | int32 |
| Default | 0 (disabled) |
| Range | 0 - 10 |
| Category | Bones&#124;Bone Subdivision |

### bBoneSubdivisionCollisionOnly

**Collision Only** - When enabled, skips velocity integration (gravity/wind/etc.) for inter-bone dummies and lets them participate only in collision/constraints from positions interpolated between real bones. Lightweight, and sufficient for most penetration cases. Does not affect the dummy count.

| Property | Value |
|----------|-------|
| Type | bool |
| Default | true |
| Edit Condition | `BoneSubdivisionCount > 0` |
| Category | Bones&#124;Bone Subdivision |

- **true (collision-only, default)**: Places dummies by interpolating the real bones' simulation results and lets them participate in collision, BoneConstraint, and angle/plane constraints. Lightweight.
- **false (full physics)**: Dummies also participate in the simulation including velocity, gravity, wind, and stiffness. Most natural, but higher cost.

### bBoneSubdivisionDensifyByRadius

**Densify By Radius** - Adds dummies based on radius so collision spheres roughly cover the gaps between bones. Uses `BoneSubdivisionCount` as a minimum and places more in segments where bones are far apart relative to their radius (close segments keep the minimum; up to 50 per segment).

| Property | Value |
|----------|-------|
| Type | bool |
| Default | false |
| Edit Condition | `BoneSubdivisionCount > 0` |
| Category | Bones&#124;Bone Subdivision |

:::warning
If you change `Radius` / `RadiusCurve` while this is enabled, recomputing the dummy count may require a re-initialization (such as recompiling the Animation Blueprint).
:::

## Horizontal Subdivision (BoneConstraint Subdivision / Bridge)

In addition to the vertical direction, this fills the **gaps between adjacent bone chains (columns)**. For setups where multiple vertical chains line up like a skirt, it prevents penetration through the gaps between columns. Combining `BoneConstraintSubdivisionCount` with `BoneSubdivisionCount` arranges a 2D grid of collision points across the cloth surface.

### BoneConstraintSubdivisionCount

**Horizontal Subdivision Count** - The number of collision-proxy dummies (bridge dummies) inserted along each horizontal BoneConstraint. Fills gaps between adjacent chains with collision points to prevent penetration. 0 to disable.

| Property | Value |
|----------|-------|
| Type | int32 |
| Default | 0 (disabled) |
| Range | 0 - 10 |
| Category | Bones&#124;Bone Subdivision |

No dummies are inserted on connections where the endpoint collisions already overlap (spacing ≤ 2×radius). It works independently of `BoneSubdivisionCount`.

### BoneConstraintSubdivisionFeedbackScale

**Feedback Scale** - The strength with which a bridge dummy's collision displacement is transferred to its endpoint bones (0 = none, 1 = standard). This is what lets a collider moving between columns push the real bones (the core of penetration-prevention feedback). Lower it if the result is too stiff.

| Property | Value |
|----------|-------|
| Type | float |
| Default | 1.0 |
| Range | 0.0 - 2.0 |
| Edit Condition | `BoneConstraintSubdivisionCount > 0` |
| Category | Bones&#124;Bone Subdivision |

### bExcludeFromSubdivision (on BoneConstraint)

Each individual `FModifyBoneConstraint` has a `bExcludeFromSubdivision` flag, which lets you exclude specific constraints from bridge subdivision.

## Debug Display

In the editor's debug drawing, bone types are color-coded.

| Type | Color |
|------|-------|
| Inter-bone dummy | Cyan |
| Tip dummy | Red |
| Real bone | Yellow |

## Performance Notes

:::warning
The more dummy bones there are, the higher the cost of collision and constraints. If too many are generated, a warning log is output (the thresholds can be adjusted under **Project Settings > Plugins > Kawaii Physics** with `Inter-Bone Dummy Warning Threshold` (default 100) / `Bridge Dummy Warning Threshold` (default 200); 0 disables them).

First try `BoneSubdivisionCount` from a small value (1 to 2), and enable `bBoneSubdivisionDensifyByRadius` as needed.
:::

## Control from Blueprint

You can change the settings at runtime from the following Blueprint functions.

| Function | Description |
|----------|-------------|
| `Set/Get Bone Subdivision Count` | Vertical dummy subdivision count (re-initializes on change) |
| `Set/Get Bone Subdivision Collision Only` | Toggles collision-only |
| `Set/Get Bone Constraint Subdivision Count` | Horizontal dummy subdivision count (re-initializes on change) |
| `Set/Get Bone Constraint Subdivision Feedback Scale` | Feedback strength (applied immediately) |

For details, see [KawaiiPhysics Library](/docs/api/kawaiiphysics-library).

## Related Pages

- [Collision Setup](/docs/features/collision-setup)
- [Sync Bone](/docs/features/sync-bone)
- [Limit Parameters](/docs/parameters/limits)
- [Performance Optimization](/docs/advanced/performance)
