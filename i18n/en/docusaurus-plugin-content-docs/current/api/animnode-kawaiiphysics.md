---
sidebar_position: 1
title: "FAnimNode_KawaiiPhysics"
---

# FAnimNode_KawaiiPhysics

<!-- AUTO-GENERATED: This page is auto-generated from source code -->

API reference for the main KawaiiPhysics AnimGraph node.

[View Source](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNode_KawaiiPhysics.h)

## Class Definition

```cpp
USTRUCT(BlueprintType)
struct KAWAIIPHYSICS_API FAnimNode_KawaiiPhysics : public FAnimNode_SkeletalControlBase
```

## Bones (Bone Settings)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| RootBone | FBoneReference | - | Root bone to control (descendant bones are included) |
| ExcludeBones | TArray\<FBoneReference\> | - | Bones to exclude from control (the bone and its descendants) |
| AdditionalRootBones | TArray\<FKawaiiPhysicsRootBoneSetting\> | - | Additional root bone settings |
| DummyBoneLength | float | 0.0 | Length of the tip dummy bone that improves end-bone rotation (0 to disable, ClampMin=0) |
| BoneForwardAxis | [EBoneForwardAxis](#eboneforwardaxis) | X_Positive | Bone forward axis (affects dummy bone placement) |
| ModifyBones | TArray\<FKawaiiPhysicsModifyBone\> | - | (Runtime / Transient) cache of the physics-controlled bones |

### Bones \| Bone Subdivision

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| BoneSubdivisionCount | int32 | 0 | Inter-bone dummy count (ClampMin=0, ClampMax=10, 0 to disable) |
| bBoneSubdivisionCollisionOnly | bool | true | Exclude inter-bone dummies from velocity integration (collision/constraint only) |
| bBoneSubdivisionDensifyByRadius | bool | false | Using `BoneSubdivisionCount` as the minimum, places more dummies where bones are far apart relative to their radius (up to 50 per segment). Changing Radius / RadiusCurve while enabled may require a re-init (e.g. recompiling the ABP) to recompute the dummy count |
| BoneConstraintSubdivisionCount | int32 | 0 | Collision-proxy dummy count along horizontal BoneConstraints (ClampMin=0, ClampMax=10, 0 to disable) |
| BoneConstraintSubdivisionFeedbackScale | float | 1.0 | Strength of transferring bridge-dummy collision displacement to endpoint bones (ClampMin=0.0, ClampMax=2.0) |

## Physics Settings

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| PhysicsSettings | [FKawaiiPhysicsSettings](#fkawaiiphysicssettings) | - | Basic physics control settings (Damping / Stiffness / Radius, etc.) |
| SimulationSpace | [EKawaiiPhysicsSimulationSpace](#ekawaiiphysicssimulationspace) | ComponentSpace | Simulation space |
| SimulationBaseBone | FBoneReference | - | Reference bone when `BaseBoneSpace` is selected |
| TargetFramerate | int32 | 60 | Target framerate for physics stepping (ClampMin=1) |
| TeleportDistanceThreshold | float | 300.0 | Movement beyond this distance is treated as a teleport |
| TeleportRotationThreshold | float | 10.0 | Rotation beyond this angle is treated as a teleport |
| PlanarConstraint | [EPlanarConstraint](#eplanarconstraint) | None | Constrains each bone onto a plane |
| SkelCompMoveScale | FVector | (1, 1, 1) | Scale applied to component movement before reflecting in physics |
| WarmUpFrames | int32 | 0 | Warm-up frame count (when bNeedWarmUp is enabled) |
| bNeedWarmUp | bool | false | Enable warm-up |
| bUseWarmUpWhenResetDynamics | bool | true | Perform warm-up on ResetDynamics |
| bUpdatePhysicsSettingsInGame | bool | true | Update per-bone physics params each frame (AdvancedDisplay; disable for minor perf gain) |
| ResetBoneTransformWhenBoneNotFound | bool | false | Reset transform when a controlled bone is not found (AdvancedDisplay) |

### Physics Settings \| Curves

| Property | Type | Editor Display Name | Description |
|----------|------|------|-------------|
| DampingCurveData | FRuntimeFloatCurve | Damping Rate by Bone Length Rate | Damping curve |
| StiffnessCurveData | FRuntimeFloatCurve | Stiffness Rate by Bone Length Rate | Stiffness curve |
| WorldDampingLocationCurveData | FRuntimeFloatCurve | World Damping Location Rate by Bone Length Rate | World location damping curve |
| WorldDampingRotationCurveData | FRuntimeFloatCurve | World Damping Rotation Rate by Bone Length Rate | World rotation damping curve |
| RadiusCurveData | FRuntimeFloatCurve | Radius Rate by Bone Length Rate | Radius curve |
| LimitAngleCurveData | FRuntimeFloatCurve | LimitAngle Rate by Bone Length Rate | Angle limit curve |

All are multiplied into their parameter by the bone-length ratio (0.0–1.0) from the RootBone (AdvancedDisplay).

## Limits (Collision)

| Property | Type | Description |
|----------|------|-------------|
| SphericalLimits | TArray\<FSphericalLimit\> | Sphere collision |
| CapsuleLimits | TArray\<FCapsuleLimit\> | Capsule collision |
| BoxLimits | TArray\<FBoxLimit\> | Box collision |
| PlanarLimits | TArray\<FPlanarLimit\> | Plane collision |
| LimitsDataAsset | UKawaiiPhysicsLimitsDataAsset* | Collision Data Asset (shareable) |
| PhysicsAssetForLimits | UPhysicsAsset* | Physics Asset used as a collision source |

:::note
`SphericalLimitsData` / `CapsuleLimitsData` / `BoxLimitsData` / `PlanarLimitsData` are **read-only (Transient / VisibleAnywhere)** arrays that preview the collisions imported from `LimitsDataAsset` or `PhysicsAssetForLimits`. They cannot be edited directly.
:::

### Limits \| Shared Collision

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| bSharedCollisionSource | bool | false | Publish collision (Source) |
| bUseSharedCollision | bool | false | Use shared collision (Target) |
| SharedCollisionGroupTag | FGameplayTag | - | Group tag identifying the shared set |

### Limits \| Bone Constraint

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| BoneConstraintGlobalComplianceType | [EXPBDComplianceType](#expbdcompliancetype) | Leather | Compliance type |
| BoneConstraintIterationCountBeforeCollision | int32 | 1 | Pre-collision iteration count |
| BoneConstraintIterationCountAfterCollision | int32 | 1 | Post-collision iteration count |
| bAutoAddChildDummyBoneConstraint | bool | true | Auto-add dummy bone |
| BoneConstraints | TArray\<FModifyBoneConstraint\> | - | Bone constraint list |
| BoneConstraintsDataAsset | UKawaiiPhysicsBoneConstraintsDataAsset* | - | Constraints Data Asset |

### Limits \| World Collision

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| bAllowWorldCollision | bool | false | Enable world collision (significantly increases physics cost when enabled) |
| bOverrideCollisionParams | bool | false | Use custom collision settings (inline toggle for `CollisionChannelSettings`) |
| CollisionChannelSettings | FBodyInstance | - | Custom collision settings (display name: Override SkelComp Collision Params; only when `bOverrideCollisionParams` is enabled) |
| bIgnoreSelfComponent | bool | true | Ignore self collision (PhysicsAsset); edit condition: `bAllowWorldCollision` |
| IgnoreBones | TArray\<FBoneReference\> | - | Ignore bones list (edit condition: `!bIgnoreSelfComponent`) |
| IgnoreBoneNamePrefix | TArray\<FName\> | - | Ignore bone name prefix (edit condition: `!bIgnoreSelfComponent`) |

## Force (External Forces)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| Gravity | FVector | ZeroVector | Gravity vector |
| bUseLegacyGravity | bool | false | Legacy gravity method |
| bUseDefaultGravityZProjectSetting | bool | false | Use project setting gravity |
| bUseWorldSpaceGravity | bool | true | World space gravity |
| bEnableWind | bool | false | Enable wind (receive WindDirectionalSource influence) |
| WindScale | float | 1.0 | Wind scale (edit condition: `bEnableWind`) |
| WindDirectionNoiseAngle | float | 0.0 | Wind direction noise (degrees, edit condition: `bEnableWind`) |

### Force \| External Force

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| SimpleExternalForce | FVector | ZeroVector | Simple external force |
| bUseWorldSpaceSimpleExternalForce | bool | true | World space external force |
| ExternalForces | TArray\<FInstancedStruct\> | - | External force presets (Instanced Struct, extensible in C++) |
| CustomExternalForces | TArray\<UKawaiiPhysics_CustomExternalForce*\> | - | BP/C++ object-based external force presets (**experimental**) |

### Force \| Sync Bone

| Property | Type | Description |
|----------|------|-------------|
| SyncBones | TArray\<FKawaiiPhysicsSyncBone\> | Sync bone list. See [Sync Bone](/docs/features/sync-bone) for details |

## Tag

| Property | Type | Description |
|----------|------|-------------|
| KawaiiPhysicsTag | FGameplayTag | Filtering tag |

## KawaiiPhysics (Runtime)

| Property | Type | Description |
|----------|------|-------------|
| DeltaTime | float | Frame delta time (BlueprintReadOnly) |

## Key Methods

### Initialize_AnyThread

```cpp
virtual void Initialize_AnyThread(const FAnimationInitializeContext& Context) override;
```

Node initialization. Builds bone chain and initializes parameters.

### CacheBones_AnyThread

```cpp
virtual void CacheBones_AnyThread(const FAnimationCacheBonesContext& Context) override;
```

Bone reference caching.

### UpdateInternal

```cpp
virtual void UpdateInternal(const FAnimationUpdateContext& Context) override;
```

Per-frame update processing.

### EvaluateSkeletalControl_AnyThread

```cpp
virtual void EvaluateSkeletalControl_AnyThread(
    FComponentSpacePoseContext& Output,
    TArray<FBoneTransform>& OutBoneTransforms
) override;
```

Physics simulation evaluation and bone transform output.

### ResetDynamics

```cpp
virtual void ResetDynamics(ETeleportType InTeleportType) override;
```

Physics state reset. Used for teleportation, etc.

### HasPreUpdate / PreUpdate

```cpp
virtual bool HasPreUpdate() const override;
virtual void PreUpdate(const UAnimInstance* InAnimInstance) override;
```

Pre-processing that runs on the GameThread. Work that cannot safely touch UObjects from the worker thread is handled here.

- **Shared collision initialization** (`InitializeSharedCollision`): registering with the Subsystem mutates a `TMap`, so it runs on the thread-safe GameThread side.
- Collects warning-log identifier names (AnimInstance class name, component name, owner Actor name) once on the first call (avoids UObject access from the worker thread).

:::note
Only nodes whose `HasPreUpdate()` returns `true` have `PreUpdate()` called. The physics simulation itself runs in `EvaluateSkeletalControl_AnyThread` on the worker thread; `PreUpdate` is dedicated to GameThread-only initialization and cache collection.
:::

### IsValidToEvaluate

```cpp
virtual bool IsValidToEvaluate(
    const USkeleton* Skeleton,
    const FBoneContainer& RequiredBones
) override;
```

Determines whether the node can be evaluated.

### GatherDebugData

```cpp
virtual void GatherDebugData(FNodeDebugData& DebugData) override;
```

Collects debug information.

### NeedsDynamicReset

```cpp
virtual bool NeedsDynamicReset() const override { return true; }
```

Always returns `true` so that `ResetDynamics` (teleport handling) is called.

## Runtime Re-initialization

### RequestModifyBonesReinit / RequestSharedCollisionReinit

```cpp
void RequestModifyBonesReinit();      // Rebuild the bone chain on the next Evaluate
void RequestSharedCollisionReinit();  // Re-initialize shared collision on the next Evaluate
```

Schedules a safe re-initialization when you change settings at runtime that affect topology or collision configuration (sets a flag, runs on the next Evaluate). Called internally by the setters of [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library).

## Coordinate Transform Helpers

### GetBoneTransformInSimSpace

```cpp
FTransform GetBoneTransformInSimSpace(
    FComponentSpacePoseContext& Output,
    const FCompactPoseBoneIndex& BoneIndex
) const;
```

Gets bone Transform in simulation space.

### ConvertSimulationSpaceTransform

```cpp
FTransform ConvertSimulationSpaceTransform(
    FComponentSpacePoseContext& Output,
    EKawaiiPhysicsSimulationSpace From,
    EKawaiiPhysicsSimulationSpace To,
    const FTransform& InTransform
) const;
```

Converts Transform between simulation spaces. Per-type variants are available:

```cpp
FVector ConvertSimulationSpaceVector(...) const;     // Convert a direction vector
FVector ConvertSimulationSpaceLocation(...) const;   // Convert a position
FQuat   ConvertSimulationSpaceRotation(...) const;   // Convert a rotation
void    ConvertSimulationSpace(FComponentSpacePoseContext& Output,
            EKawaiiPhysicsSimulationSpace From, EKawaiiPhysicsSimulationSpace To); // Convert all bones at once
```

## Type Reference (Enum / Struct)

Definitions of the key enums and structs referenced by the properties.

### FKawaiiPhysicsSettings

The core physics settings struct (`PhysicsSettings` property). The balance between `Damping` (how easily it sways) and `Stiffness` (how strongly it returns) determines the overall softness. Each member can be modulated by bone-length ratio via curves (`DampingCurveData`, etc.).

| Member | Type | Default | Range | Description |
|--------|------|---------|-------|-------------|
| Damping | float | 0.1 | ≥ 0 | Damping; **smaller** values reflect more acceleration, so it sways more |
| Stiffness | float | 0.05 | ≥ 0 | Stiffness; **larger** values maintain the original (animated) pose more strongly |
| WorldDampingLocation | float | 0.8 | ≥ 0 | Suppresses reflection of component **movement**. `0` = full reflection (max sway) / `1` = follow (no sway). Reflection = `1 - value` |
| WorldDampingRotation | float | 0.8 | ≥ 0 | Suppresses reflection of component **rotation** (same as above; reflection = `1 - value`) |
| Radius | float | 3.0 | ≥ 0 | Collision radius of each bone (editor display name: Collision Radius) |
| LimitAngle | float | 0.0 | ≥ 0 | Max rotation angle (degrees) per step from physics. `0` = unlimited; helps suppress jitter |

:::note
Contrary to their names, **higher** `WorldDampingLocation` / `WorldDampingRotation` values mean **less** sway (`1` follows the component exactly = no sway).
:::

For detailed explanations and diagrams of each member, see [Physics Parameters](/docs/parameters/physics).

### EKawaiiPhysicsSimulationSpace

| Value | Description |
|-------|-------------|
| ComponentSpace | Relative to the skeletal mesh component (default) |
| WorldSpace | World-based; avoids issues from sudden root-bone movement |
| BaseBoneSpace | Relative to a reference bone (`SimulationBaseBone`) |

### EPlanarConstraint

| Value | Description |
|-------|-------------|
| None | No constraint (default) |
| X | Constrain to the X-axis plane |
| Y | Constrain to the Y-axis plane |
| Z | Constrain to the Z-axis plane |

### EBoneForwardAxis

`X_Positive` (default) / `X_Negative` / `Y_Positive` / `Y_Negative` / `Z_Positive` / `Z_Negative`

### EXPBDComplianceType

Stiffness material type for Bone Constraints (`BoneConstraintGlobalComplianceType`).

`Concrete` / `Wood` / `Leather` (default) / `Tendon` / `Rubber` / `Muscle` / `Fat`

:::tip
For member details of collision shapes (`FSphericalLimit`, etc.), Sync Bone (`FKawaiiPhysicsSyncBone`), and Bone Constraint (`FModifyBoneConstraint`), see the feature-specific pages.
:::

## Usage Example

Basic usage in Animation Blueprint:

1. Add KawaiiPhysics node to AnimGraph
2. Set RootBone
3. Adjust Damping/Stiffness in PhysicsSettings
4. Add collision as needed

```cpp
// Example accessing from C++
FAnimNode_KawaiiPhysics* Node = ...;
Node->PhysicsSettings.Damping = 0.2f;
Node->PhysicsSettings.Stiffness = 0.1f;
Node->Gravity = FVector(0, 0, -980.0f);
```

## Related

- [Parameter Reference](/docs/parameters/overview)
- [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library)
- [Physics Parameters](/docs/parameters/physics)
- [Collision Parameters](/docs/parameters/collision)
