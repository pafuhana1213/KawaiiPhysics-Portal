---
sidebar_position: 101
title: "Changelog"
---

# Changelog

<!-- AUTO-GENERATED: This page is auto-generated from release notes -->

Changelog for KawaiiPhysics.

For the latest release information, see [GitHub Releases](https://github.com/pafuhana1213/KawaiiPhysics/releases).

## v1.21.x (UE 5.3 - 5.8 Support)

### v1.21.0

**Fixed Substepping (Frame-rate Independence)**

Added a feature that runs the whole simulation with fixed-timestep substepping (`FixedDt = 1 / TargetFramerate`) for stable, frame-rate-independent physics. It is **enabled (ON) by default**.

- Controlled via `Use Fixed Substepping` / `Max Substeps` under **Project Settings > Plugins > Kawaii Physics**
- **[Behavior change] Because it defaults to ON, the way bones sway may change slightly compared to previous versions. Turn it OFF if you need the legacy behavior.**

See [Fixed Substepping](/docs/advanced/fixed-substepping) for details.

**Bone Subdivision**

Added a feature that inserts virtual dummies between real bones — without modifying the real skeleton — to raise collision resolution.

- `BoneSubdivisionCount` / `bBoneSubdivisionCollisionOnly` / `bBoneSubdivisionDensifyByRadius` (densify by radius)
- Horizontal **BoneConstraint Subdivision (bridge dummies)**: `BoneConstraintSubdivisionCount` / `BoneConstraintSubdivisionFeedbackScale` prevent penetration between columns
- Combined with `BoneSubdivisionCount`, collision points form a 2D grid across the cloth surface

See [Bone Subdivision](/docs/features/bone-subdivision) for details.

**Shared Collision**

Added a feature that lets multiple KawaiiPhysics nodes (including separate SkeletalMeshComponents and ChildActors) share a single set of collision shapes.

- Source / Target roles grouped by `SharedCollisionGroupTag`
- Shared within the same Actor/ChildActor family
- Source/Target/tag can be switched at runtime via the Blueprint API

See [Shared Collision](/docs/features/shared-collision) for details.

**Sync Bone Enhancements**

- Per-axis apply direction (`ApplyDirectionX/Y/Z`: Both/Positive/Negative/None)
- Distance attenuation (`bEnableDistanceAttenuation`, etc.)
- Automatic child expansion (`bIncludeChildBones`) and scale curves by length rate / movement distance

**Other Improvements**

- Added `WindDirectionNoiseAngle` (wind direction noise) to Wind
- Added the project-wide `KawaiiPhysicsDeveloperSettings` (fixed substepping / dummy-generation warning thresholds)
- Added an automated physics-core test suite (UE Automation) to strengthen regression detection
- Various build error fixes and performance optimizations (supported engine versions: UE 5.3-5.8)

For the latest release information, see [GitHub Releases](https://github.com/pafuhana1213/KawaiiPhysics/releases).

## v1.20.x (UE 5.7 Support)

### v1.20.0

**Sync Bone Feature**

Added a feature that applies the movement and rotation of a specified bone to physics-controlled bones. Effective for preventing skirt penetration through legs.

![SyncBone + Collision comparison](/img/features/syncbone-collision-compare.webp)

*Preventing penetration with SyncBone and Collision combined*

![SyncBone + BoneConstraint + Collision](/img/features/syncbone-full-demo.webp)

*Full demo combining SyncBone, BoneConstraint, and Collision*

- Reflects source bone position/rotation to physics bones
- Prevents penetration without using collisions
- Lightweight processing with excellent performance

**Gravity System Improvements**

- Added Gravity Direction parameter
- More flexible gravity control available

**AnimNotifyState: Set Alpha**

Added AnimNotifyState that can dynamically change physics blend ratio during animation.

- Control physics influence on animation timeline
- Smooth blend in/out

**Debug Feature Enhancements**

- Added Box Limit debug display
- Improved Planar Limit debug display
- Debug filtering with GameplayTag

See [GitHub Discussion #165](https://github.com/pafuhana1213/KawaiiPhysics/discussions/165) for details.

## v1.19.x (UE 5.6 Support)

### v1.19.0

**Simulation Space Feature**

You can now select the coordinate space for physics simulation.

![Simulation Space Comparison](https://github.com/user-attachments/assets/c4a679b8-2651-473d-ba30-6d98fc293c5c)

*ComponentSpace vs WorldSpace comparison*

| Value | Description |
|-----|------|
| ComponentSpace | Component space (default) |
| WorldSpace | World space |
| BaseBoneSpace | Specified bone space |

Using WorldSpace or BaseBoneSpace can avoid the effects of sudden Root bone movement/rotation.

![WorldSpace Example](https://github.com/user-attachments/assets/0e03868e-6dbf-47bf-bdb7-ca2214b1b715)

*WorldSpace behavior*

**Sample Project Refresh**

- Updated all samples to latest best practices
- Added demos for new features

**BoneConstraint Feature Stabilization**

The BoneConstraint feature introduced experimentally in v1.14.0 is now official.

**Fab Distribution Started**

Distribution started on the Fab store.

- [Fab](https://www.fab.com/ja/listings/f870c07e-0a02-4a78-a888-e52a22794572)

See [GitHub Discussion #155](https://github.com/pafuhana1213/KawaiiPhysics/discussions/155) for details.

## v1.18.x (UE 5.5 Support)

### v1.18.0

**Copyright Notice Added**

- Added MIT license copyright notices to all source files

**Packaging Error Fix**

- Fixed packaging failures in some environments

**Other Improvements**

- Official UE 5.5 support
- Minor bug fixes

See [GitHub Discussion #145](https://github.com/pafuhana1213/KawaiiPhysics/discussions/145) for details.

## v1.17.x (UE 5.3-5.5 Support)

### v1.17.0

**Multiple RootBone Support**

You can now set multiple RootBones in a single AnimNode.

- Specify additional RootBones with `AdditionalRootBones` parameter
- Individual ExcludeBones list available for each RootBone
- Control multiple bone chains with the same parameters

**Box Collision**

Added box-shaped collision.

- Optimal for rectangular shapes like body and buildings
- Offset and rotation adjustable

**PhysicsAsset Integration**

You can now auto-generate collision shapes from existing PhysicsAssets.

- Just specify the PhysicsAsset for automatic conversion
- Reduces manual collision setup work

**AnimNotify Support**

You can now control physics parameters from animation notifies.

- AnimNotify_KawaiiPhysics_ResetDynamics
- AnimNotify_KawaiiPhysics_SetExternalForce

**GameplayTag Support**

Debug targets can be filtered using GameplayTags.

**Wind Directional Source Support**

Now supports Unreal Engine's Wind Directional Source.

- Automatically affected by wind placed in level
- Adjust influence with WindScale

See [GitHub Discussion #138](https://github.com/pafuhana1213/KawaiiPhysics/discussions/138) for details.

## v1.16.x (UE 5.3-5.5 Support)

### v1.16.0

**New External Force System**

Significant improvements to the process of applying external forces. Multiple external force presets have been added that allow you to apply force at regular intervals only to certain bones in the bone's local coordinate system.

- Multiple presets can be combined
- Custom presets can be implemented in C++

**Details Panel Reorganization**

- Property names and categories reorganized
- Debug features converted to buttons
- Tooltips added for all properties

**Console Variables for Debugging**

New console variables added for level debugging:

- `a.AnimNode.KawaiiPhysics.Enable`
- `a.AnimNode.KawaiiPhysics.Debug`
- `a.AnimNode.KawaiiPhysics.Debug.LengthRate`

**DataAsset Improvements**

- Bone selection now available through hierarchy picker
- Export button added to save AnimNode Limits settings to DataAssets

See [GitHub Discussion #128](https://github.com/pafuhana1213/KawaiiPhysics/discussions/128) for details.

## v1.15.x

### v1.15.0

- UE 5.4 support
- Performance improvements

See [GitHub Discussion #117](https://github.com/pafuhana1213/KawaiiPhysics/discussions/117) for details.

## v1.14.x (UE 5.0-5.2 Support)

### v1.14.0

**BoneConstraint Feature (Experimental)**

Added BoneConstraint feature for distance constraints between bones.

![BoneConstraint Demo](/img/features/boneconstraint-demo.webp)

*Effective for cloth simulation like skirts*

![BoneConstraint Parameters](/img/features/boneconstraint-params.png)

- Maintains distance between specified bones (BoneConstraints/Bone1, 2) using XPBD
- `Bone Constraint Iteration Count Before/After Collision` to specify number of constraint iterations
- Can also be configured in DataAssets
- Bone sets can be specified using regular expressions

![DataAsset Regex](/img/features/dataasset-regex.png)

**Other Improvements**

- DataAssets owned by KawaiiPhysics AnimNode can now be pin-exposed
- Planar Limit processing optimized
- Physics processing code refactored

See [GitHub Discussion #112](https://github.com/pafuhana1213/KawaiiPhysics/discussions/112) for details.

## v1.13.x

### v1.13.0

**Warm Up Feature**

Added physics warm-up feature.

<div style={{textAlign: 'left', margin: '20px 0'}}>
  <iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/stIOjZQh3Qw"
    title="Warm Up Feature Demo"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen>
  </iframe>
</div>

![Warm Up Parameters](/img/features/warmup-params.png)

- When **Need Warm Up** is `true` and **Warm Up Frame** is 1 or higher, Warm Up processing is executed
- After execution, Need Warm Up becomes `false`
- Larger Warm Up Frame values lead to more stability but increase computational load

![AnimNode Functions](/img/features/animnode-functions.png)

Warm Up can also be enabled via AnimNode functions added in v1.12.0.

See [GitHub Discussion #104](https://github.com/pafuhana1213/KawaiiPhysics/discussions/104) for details.

## v1.12.x

### v1.12.0

- Added AnimNode functions
- KawaiiPhysics node state can now be dynamically changed from Blueprints

See [GitHub Discussion #103](https://github.com/pafuhana1213/KawaiiPhysics/discussions/103) for details.

## v1.11.x (UE 4.27 Support)

### v1.11.1

- Final version supporting UE 4.27

---

:::note
For all changes, see [GitHub Releases](https://github.com/pafuhana1213/KawaiiPhysics/releases).
:::
