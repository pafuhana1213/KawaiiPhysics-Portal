---
sidebar_position: 100
title: "FAQ"
description: "Frequently asked questions about KawaiiPhysics. Troubleshooting, performance, compatibility, and the latest features like Fixed Substepping, Sync Bone, and Shared Collision."
---

# FAQ

Frequently asked questions and answers. Based on the latest version (v1.21.0, supporting UE 5.3–5.8).

## General

### Q: Is KawaiiPhysics free? Can I use it commercially?

**A:** Yes, it's free to use under the MIT license, and it can be used in commercial projects. Just include the license (copyright) notice.

### Q: What's the difference from PhysX or Chaos?

**A:** KawaiiPhysics uses its own lightweight algorithm without relying on a physics engine like PhysX/Chaos. Because it preserves bone lengths while animating, bones never stretch or shrink even if the simulation breaks down. It has excellent compatibility with animation and runs lightly, making it ideal for "swaying" elements like hair, skirts, and chests.

### Q: Where can I get it?

**A:** You can get it from any of the following (the contents are identical):

- **[GitHub Releases](https://github.com/pafuhana1213/KawaiiPhysics/releases/)** — Prebuilt binaries that work without a C++ build environment
- **[Fab](https://www.fab.com/ja/listings/f870c07e-0a02-4a78-a888-e52a22794572)** — Distributed since v1.19.0
- **[Booth](https://pafuhana1213.booth.pm/items/5943534)** — Follow the store to receive update notifications

See [Installation](/docs/getting-started/installation) for setup instructions.

### Q: Which UE versions are supported?

**A:** Each KawaiiPhysics version supports multiple UE versions. The latest is v1.21.x.

| KawaiiPhysics | Supported UE Versions |
|---------------|----------------------|
| v1.21.x       | 5.3, 5.4, 5.5, 5.6, 5.7, 5.8 |
| v1.20.x       | 5.3, 5.4, 5.5, 5.6, 5.7 |
| v1.19.x       | 5.3, 5.4, 5.5, 5.6 |
| v1.18.x       | 5.3, 5.4, 5.5 |
| v1.17.x       | 5.3, 5.4, 5.5 |
| v1.16.x       | 5.3, 5.4 |
| v1.14.x       | 5.0, 5.1, 5.2 |
| v1.11.1       | 4.27 (final UE4 support) |

## Setup

### Q: What should I set as Root Bone?

**A:** Set the **parent bone** of the bone chain you want physics applied to. For example, if you want to animate hair, set a bone like `head` or `spine_03` that is the parent of the hair bones. The Root Bone itself doesn't move; its child bones sway with physics.

### Q: How do I apply physics to multiple parts?

**A:** There are two main approaches:

1. Use a separate KawaiiPhysics node for each part (best when you want different parameters per part)
2. Use [Additional Root Bones](/docs/features/bone-chain#additional-root-bones) on a single node to control multiple root bones with the same parameters (v1.17.0+, convenient when you want consistent motion)

### Q: I don't want certain bones to sway

**A:** Specify the bones to exclude in `ExcludeBones`. **The specified bone itself and all of its descendants** are excluded from the simulation. When using Additional Root Bones, you can set an individual exclude list for each root.

## Troubleshooting

### Q: Bones don't move

**A:** Check the following:

1. Does the Root Bone have child bones?
2. Is Stiffness too high? (Start around `0.05`)
3. Is the node connected correctly in the Animation Blueprint and is Alpha not 0?
4. Is the console variable `a.AnimNode.KawaiiPhysics.Enable` set to `0`?

### Q: It's penetrating through the body

**A:** First, set up collision (Limits). Add Spherical / Capsule / Box Limits and adjust them to match the body shape. If it still penetrates through gaps, the following also help:

- [Bone Subdivision](/docs/features/bone-subdivision) (v1.21.0) inserts dummies between bones to increase collision detection resolution
- [Sync Bone](/docs/features/sync-bone) syncs the motion of bones such as legs to the swaying element to reduce penetration
- [Bone Constraint](/docs/parameters/limits#bone-constraint) maintains the distance between cloth bones

### Q: The skirt penetrates through the legs

**A:** Cloth such as a skirt tends to let legs slip through gaps when relying on collision alone, so combining several features is effective:

1. [Sync Bone](/docs/features/sync-bone) (v1.20.0+, enhanced in v1.21.0) reflects leg bone motion onto the skirt so it follows along
2. [Bone Constraint](/docs/parameters/limits#bone-constraint) maintains the distance between adjacent bones, preventing the cloth from tearing or stretching
3. The `BoneConstraintSubdivisionCount` of [Bone Subdivision](/docs/features/bone-subdivision) inserts proxy collision dummies between columns (chains) to prevent penetration through the gaps between columns

### Q: Movement is too intense / it sways too much

**A:** Increase the `Damping` value. Around `0.1`–`0.3` is typical. Raising `Stiffness` as well makes it return more easily to the original animation pose.

### Q: The motion changes depending on frame rate

**A:** [Fixed Substepping](/docs/advanced/fixed-substepping), added in v1.21.0, is **enabled by default**, which produces stable, frame-rate-independent behavior. If the motion still changes with frame rate, check that `Use Fixed Substepping` is enabled under **Project Settings > Plugins > Kawaii Physics**. Runaway at low fps or during hitches can be capped with `Max Substeps` (default 4).

### Q: The motion changed after updating to v1.21

**A:** In v1.21.0, [Fixed Substepping](/docs/advanced/fixed-substepping) was enabled by default, so the motion may change slightly compared to previous versions. If you need the previous behavior, set `Use Fixed Substepping` to **OFF** under **Project Settings > Plugins > Kawaii Physics**.

### Q: Physics goes wild when I teleport the character

**A:** Prevent sudden movement/rotation from being reflected in the physics:

- Set `TeleportDistanceThreshold` (default `300`) / `TeleportRotationThreshold` (default `10` degrees) so that movement/rotation exceeding these values in one frame is not reflected in the physics ([parameter details](/docs/parameters/physics#teleportdistancethreshold))
- Call `ResetDynamics` from Blueprint right after teleporting, or call `SetWorldLocation` with `ETeleportType::ResetPhysics` to reset the physics
- To stabilize the appearance after a reset, combine with Warm Up (described below)

### Q: The simulation breaks when the Root bone moves a lot

**A:** Change [Simulation Space](/docs/parameters/physics#simulationspace) from `ComponentSpace` (default) to `WorldSpace` or `BaseBoneSpace` (v1.19.0+). This avoids the effects of sudden movement/rotation of the component or Root bone. For `BaseBoneSpace`, specify the reference bone with `SimulationBaseBone`. A slight performance cost occurs for anything other than `ComponentSpace`.

### Q: The motion isn't settled right after spawning or at the start of playback

**A:** Use Warm Up (running the physics idle) to start the display from a steady state. Enable `bNeedWarmUp` and set `WarmUpFrames` (the number of idle iterations) ([parameter details](/docs/parameters/physics#warmupframes)). Enabling `bUseWarmUpWhenResetDynamics` automatically runs Warm Up after `ResetDynamics` as well. More frames make it more stable but increase the computational cost accordingly.

### Q: Performance is poor

**A:** Consider the following (see [Performance Optimization](/docs/advanced/performance) for details):

1. Reduce the number of simulated bones and collisions
2. Lower Alpha or disable based on distance / LOD
3. Don't raise `Bone Subdivision` or `Max Substeps` too high (they increase the number of dummies / iterations)
4. Use a `Simulation Space` other than `ComponentSpace` only when necessary
5. Make sure you haven't left debug drawing on via the console variable `a.AnimNode.KawaiiPhysics.Debug`

## Features

### Q: I want wind to affect it

**A:** Enable `bEnableWind` and place a **Wind Directional Source** in the level. Adjust the influence with `WindScale`, and add fluctuation to the wind direction with `WindDirectionNoiseAngle` (v1.21.0). For staging-purpose external forces, see [Wind and Forces](/docs/features/wind-and-forces).

### Q: I want to change the direction of gravity

**A:** You can set the gravity direction freely with Gravity Direction (made more flexible in v1.20.0). Lateral gravity or zero-gravity-like effects are possible. See [Custom Gravity](/docs/advanced/custom-gravity) for details.

### Q: I want to strengthen the sway only during an animation / temporarily stop it

**A:** Use [AnimNotify](/docs/features/animnotify):

- `AnimNotify / AnimNotifyState KawaiiPhysics AddExternalForce` applies an external force only during a specific interval (e.g., to lift the hair during an attack motion)
- [AnimNotifyState SetAlpha](/docs/advanced/runtime-control#animnotifystate-setalpha) smoothly changes the physics blend rate along the animation timeline

### Q: Can I change parameters at runtime?

**A:** Yes. Use functions from `UKawaiiPhysicsLibrary` (`SetPhysicsSettings`, `SetGravity`, `SetWindScale`, `ResetDynamics`, etc.) or change them through Animation Blueprint variables. See [Runtime Control](/docs/advanced/runtime-control) for details.

### Q: Can I share settings with a Data Asset?

**A:** Yes. Create a `KawaiiPhysicsLimitsDataAsset` (collision) or `KawaiiPhysicsBoneConstraintsDataAsset` (bone constraints) and share it across multiple characters or nodes. There is also a button to export a node's settings to a Data Asset. See [Data Assets](/docs/features/data-assets) for details.

### Q: I want to share collision across multiple meshes or equipment

**A:** Use [Shared Collision](/docs/features/shared-collision) added in v1.21.0. A node with `bSharedCollisionSource` becomes the source of collision shapes, and nodes with `bUseSharedCollision` enabled (Targets) receive them via the same `SharedCollisionGroupTag`. You can share a single collision set even across different SkeletalMeshComponents or ChildActors (such as a body and its equipment).

## Other

### Q: I found a bug / I have a feature request

**A:** Please report it on [GitHub Issues](https://github.com/pafuhana1213/KawaiiPhysics/issues) or [Discussions](https://github.com/pafuhana1213/KawaiiPhysics/discussions).

### Q: Where can I find more detailed information?

**A:** See the individual pages on this site for feature details, and refer to [GitHub Releases](https://github.com/pafuhana1213/KawaiiPhysics/releases) and the [Changelog](/docs/changelog) for the latest release information.
