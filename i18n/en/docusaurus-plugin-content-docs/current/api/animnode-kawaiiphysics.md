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

## Bone Settings

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| RootBone | FBoneReference | - | Root bone for control target |
| ExcludeBones | TArray\<FBoneReference\> | - | Bones to exclude from control |
| AdditionalRootBones | TArray\<FKawaiiPhysicsRootBoneSetting\> | - | Additional root bone settings |
| DummyBoneLength | float | 0.0 | Dummy bone length |
| BoneSubdivisionCount | int32 | 0 | Inter-bone dummy count (0-10, 0 to disable) |
| bBoneSubdivisionCollisionOnly | bool | true | Use inter-bone dummies for collision only |
| bBoneSubdivisionDensifyByRadius | bool | false | Add dummies based on radius |
| BoneConstraintSubdivisionCount | int32 | 0 | Horizontal bridge dummy count (0-10, 0 to disable) |
| BoneConstraintSubdivisionFeedbackScale | float | 1.0 | Bridge feedback strength (0-2) |
| BoneForwardAxis | EBoneForwardAxis | X_Positive | Bone forward axis |

## Physics Settings

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| PhysicsSettings | FKawaiiPhysicsSettings | - | Basic physics control settings |
| SimulationSpace | EKawaiiPhysicsSimulationSpace | ComponentSpace | Simulation space |
| SimulationBaseBone | FBoneReference | - | Base bone for BaseBone space |
| TargetFramerate | int32 | 60 | Target framerate |
| OverrideTargetFramerate | bool | false | Override framerate |
| TeleportDistanceThreshold | float | 300.0 | Teleport distance threshold |
| TeleportRotationThreshold | float | 10.0 | Teleport rotation threshold |
| PlanarConstraint | EPlanarConstraint | None | Planar constraint |
| SkelCompMoveScale | FVector | (1, 1, 1) | Component move scale |

## Warm-up Settings

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| WarmUpFrames | int32 | 0 | Warm-up frame count |
| bNeedWarmUp | bool | false | Enable warm-up |
| bUseWarmUpWhenResetDynamics | bool | true | Warm-up on reset |

## Curves

| Property | Type | Description |
|----------|------|-------------|
| DampingCurveData | FRuntimeFloatCurve | Damping curve |
| StiffnessCurveData | FRuntimeFloatCurve | Stiffness curve |
| WorldDampingLocationCurveData | FRuntimeFloatCurve | World location damping curve |
| WorldDampingRotationCurveData | FRuntimeFloatCurve | World rotation damping curve |
| RadiusCurveData | FRuntimeFloatCurve | Radius curve |
| LimitAngleCurveData | FRuntimeFloatCurve | Angle limit curve |

## Collision (Limits)

| Property | Type | Description |
|----------|------|-------------|
| SphericalLimits | TArray\<FSphericalLimit\> | Sphere collision |
| CapsuleLimits | TArray\<FCapsuleLimit\> | Capsule collision |
| BoxLimits | TArray\<FBoxLimit\> | Box collision |
| PlanarLimits | TArray\<FPlanarLimit\> | Plane collision |
| LimitsDataAsset | UKawaiiPhysicsLimitsDataAsset* | Collision Data Asset |
| PhysicsAssetForLimits | UPhysicsAsset* | Physics Asset for collision |

## Shared Collision

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| bSharedCollisionSource | bool | false | Publish collision (Source) |
| bUseSharedCollision | bool | false | Use shared collision (Target) |
| SharedCollisionGroupTag | FGameplayTag | - | Group tag identifying the shared set |

## Bone Constraint

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| BoneConstraintGlobalComplianceType | EXPBDComplianceType | Leather | Compliance type |
| BoneConstraintIterationCountBeforeCollision | int32 | 1 | Pre-collision iteration count |
| BoneConstraintIterationCountAfterCollision | int32 | 1 | Post-collision iteration count |
| bAutoAddChildDummyBoneConstraint | bool | true | Auto-add dummy bone |
| BoneConstraints | TArray\<FModifyBoneConstraint\> | - | Bone constraint list |
| BoneConstraintsDataAsset | UKawaiiPhysicsBoneConstraintsDataAsset* | - | Constraints Data Asset |

## Sync Bone

| Property | Type | Description |
|----------|------|-------------|
| SyncBones | TArray\<FKawaiiPhysicsSyncBone\> | Sync bone list |

## External Forces

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| Gravity | FVector | ZeroVector | Gravity vector |
| bUseLegacyGravity | bool | false | Legacy gravity method |
| bUseDefaultGravityZProjectSetting | bool | false | Use project setting gravity |
| bUseWorldSpaceGravity | bool | true | World space gravity |
| bEnableWind | bool | false | Enable wind |
| WindScale | float | 1.0 | Wind scale |
| WindDirectionNoiseAngle | float | 0.0 | Wind direction noise (degrees) |
| SimpleExternalForce | FVector | ZeroVector | Simple external force |
| bUseWorldSpaceSimpleExternalForce | bool | true | World space external force |
| ExternalForces | TArray\<FInstancedStruct\> | - | External force presets |
| CustomExternalForces | TArray\<UKawaiiPhysics_CustomExternalForce*\> | - | Custom external forces |

## World Collision

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| bAllowWorldCollision | bool | false | Enable world collision |
| bOverrideCollisionParams | bool | false | Override collision parameters |
| CollisionChannelSettings | FBodyInstance | - | Collision settings |
| bIgnoreSelfComponent | bool | true | Ignore self collision |
| IgnoreBones | TArray\<FBoneReference\> | - | Ignore bones list |
| IgnoreBoneNamePrefix | TArray\<FName\> | - | Ignore bone name prefix |

## Tag

| Property | Type | Description |
|----------|------|-------------|
| KawaiiPhysicsTag | FGameplayTag | Filtering tag |

## Runtime Data

| Property | Type | Description |
|----------|------|-------------|
| ModifyBones | TArray\<FKawaiiPhysicsModifyBone\> | Physics-controlled bones |
| DeltaTime | float | Frame delta time |

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

### PreUpdate

```cpp
virtual void PreUpdate(const UAnimInstance* InAnimInstance) override;
```

Pre-update processing. Retrieves scene information, etc.

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

Converts Transform between simulation spaces.

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
