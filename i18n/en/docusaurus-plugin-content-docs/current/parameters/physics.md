---
sidebar_position: 2
title: "Physics Parameters"
---

# Physics Parameters

<!-- AUTO-GENERATED: This page is auto-generated from source code -->

Parameters that control the basic behavior of physics simulation.

[View Source](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNode_KawaiiPhysics.h)

:::tip About This Page
This is the **complete reference** for physics parameters. For how to tune the sway, see [Adjusting the Sway](/docs/features/physics-setup); to learn the concepts first, see [Basic Concepts](/docs/getting-started/basic-concepts); for other task-oriented usage, see [Bone Chain Setup](/docs/features/bone-chain) / [Curve Editor](/docs/features/curve-editor) / [Bone Subdivision](/docs/features/bone-subdivision).
:::

## FKawaiiPhysicsSettings

A struct that defines the basic physics control settings. It is assigned to the node via the `PhysicsSettings` property. `Damping` (how easily it sways) and `Stiffness` (how strongly it returns) are the core of the physics behavior — the balance between the two determines the overall "softness." Each member can be modulated by bone-length ratio using the [curves](#curve-control) described later.

```cpp
USTRUCT(BlueprintType)
struct KAWAIIPHYSICS_API FKawaiiPhysicsSettings
{
    float Damping = 0.1f;               // Damping
    float Stiffness = 0.05f;            // Stiffness
    float WorldDampingLocation = 0.8f;  // Suppression of movement reflection
    float WorldDampingRotation = 0.8f;  // Suppression of rotation reflection
    float Radius = 3.0f;                // Collision radius
    float LimitAngle = 0.0f;            // Rotation limit angle
};
```

### Damping

**Damping Coefficient** - Controls the intensity of swaying. **Smaller** values reflect more acceleration in the physics behavior, so it sways more. Larger values make the motion duller and heavier.

| Property | Value |
|----------|-------|
| Type | float |
| Default | 0.1 |
| Range | 0.0 or higher |
| Category | KawaiiPhysics |

### Stiffness

**Stiffness** - **Higher** values maintain the original shape (the animated pose) more strongly and return to it quickly. Lower values let it sway more freely.

| Property | Value |
|----------|-------|
| Type | float |
| Default | 0.05 |
| Range | 0.0 or higher |
| Category | KawaiiPhysics |

### WorldDampingLocation

**Suppression of component movement reflection** - Controls how much of the Skeletal Mesh Component's world-space **movement** is reflected into the sway.

- `0` = movement fully reflected (maximum sway)
- `1` = follows the component exactly (not reflected into sway)
- Actual reflection factor = `1 - WorldDampingLocation`

| Property | Value |
|----------|-------|
| Type | float |
| Default | 0.8 |
| Range | 0.0 or higher |
| Category | KawaiiPhysics |

### WorldDampingRotation

**Suppression of component rotation reflection** - The rotation counterpart of the above. Controls the Skeletal Mesh Component's world-space **rotation** in the same way (actual reflection factor = `1 - WorldDampingRotation`).

| Property | Value |
|----------|-------|
| Type | float |
| Default | 0.8 |
| Range | 0.0 or higher |
| Category | KawaiiPhysics |

:::note
Because they are named "Damping (suppression)," `WorldDampingLocation` / `WorldDampingRotation` are counter-intuitive: **higher values mean less sway** (`1` follows the component exactly = no sway). Set them lower when you want the hair/cloth to trail behind character movement and rotation.
:::

### Radius

**Collision radius for each bone** - The radius of the collision sphere each bone carries. Used in the push-out calculation against colliders (SphericalLimit, etc.). Its editor display name is **Collision Radius**.

| Property | Value |
|----------|-------|
| Type | float |
| Default | 3.0 |
| Range | 0.0 or higher |
| Display Name | Collision Radius |
| Category | KawaiiPhysics |

### LimitAngle

**Rotation limit angle** - The maximum rotation angle (in degrees) per step caused by the physics behavior. `0` means unlimited. Setting it appropriately suppresses erratic, jittery behavior.

| Property | Value |
|----------|-------|
| Type | float |
| Default | 0.0 (unlimited) |
| Range | 0.0 or higher |
| Category | KawaiiPhysics |

## Simulation Settings

### SimulationSpace

**Simulation Space** - Specifies the coordinate system for physics control.

| Property | Value |
|----------|-------|
| Type | EKawaiiPhysicsSimulationSpace |
| Default | ComponentSpace |

| Value | Description |
|-------|-------------|
| ComponentSpace | Simulate in component space |
| WorldSpace | Simulate in world space. Can avoid influence from sudden Root bone movement/rotation |
| BaseBoneSpace | Simulate in specified bone space |

:::note
Using anything other than ComponentSpace causes minor performance degradation, but can avoid influence from sudden Root bone movement/rotation.
:::

### SimulationBaseBone

**Simulation Base Bone** - The bone used as the reference in the BaseBone coordinate system.

| Property | Value |
|----------|-------|
| Type | FBoneReference |
| Category | Physics Settings |

:::note
Only enabled when SimulationSpace is BaseBoneSpace.
:::

### TargetFramerate

**Target Framerate** - Target framerate for the physics simulation.

| Property | Value |
|----------|-------|
| Type | int32 |
| Default | 60 |
| Category | Physics Settings |

### TeleportDistanceThreshold

**Teleport Distance Threshold** - If the SkeletalMeshComponent movement per frame exceeds this value, that movement won't be reflected in physics control.

| Property | Value |
|----------|-------|
| Type | float |
| Default | 300.0 |

### TeleportRotationThreshold

**Teleport Rotation Threshold** - If the SkeletalMeshComponent rotation per frame exceeds this value, that rotation won't be reflected in physics control.

| Property | Value |
|----------|-------|
| Type | float |
| Default | 10.0 |

### PlanarConstraint

**Planar Constraint** - Fixes each bone on a plane according to the specified axis.

| Property | Value |
|----------|-------|
| Type | EPlanarConstraint |
| Default | None |

| Value | Description |
|-------|-------------|
| None | No planar constraint |
| X | Constrain to X axis |
| Y | Constrain to Y axis |
| Z | Constrain to Z axis |

### SkelCompMoveScale

**Component Move Scale** - Scale applied when reflecting SkeletalMeshComponent movement in physics behavior.

| Property | Value |
|----------|-------|
| Type | FVector |
| Default | (1, 1, 1) |

## Bone Settings

### RootBone

**Control Root Bone** - The specified bone and all bones below it become control targets.

| Property | Value |
|----------|-------|
| Type | FBoneReference |
| Category | Bones |

### ExcludeBones

**Exclude Bones** - Removes the specified bones and all bones below them from control targets.

| Property | Value |
|----------|-------|
| Type | TArray\<FBoneReference\> |
| Category | Bones |

### AdditionalRootBones

**Additional Root Bones** - Adds the specified bones and all bones below them to the control targets (for adding multiple roots).

| Property | Value |
|----------|-------|
| Type | TArray\<FKawaiiPhysicsRootBoneSetting\> |
| Category | Bones |

Each element has the following properties:
- `RootBone`: Root bone to control
- `OverrideExcludeBones`: Exclude bone list dedicated to this root bone
- `bUseOverrideExcludeBones`: Enables the exclude bone override

### DummyBoneLength

**Dummy Bone Length** - If greater than 0, adds a dummy bone at the end of control bones. Adding dummy bones improves physics control of terminal bones.

| Property | Value |
|----------|-------|
| Type | float |
| Default | 0.0 |
| Range | 0.0 or higher |

### BoneForwardAxis

**Bone Forward Direction** - Forward direction of bones. Affects physics control and dummy bone placement position.

| Property | Value |
|----------|-------|
| Type | EBoneForwardAxis |
| Default | X_Positive |

| Value | Description |
|-------|-------------|
| X_Positive | +X direction |
| X_Negative | -X direction |
| Y_Positive | +Y direction |
| Y_Negative | -Y direction |
| Z_Positive | +Z direction |
| Z_Negative | -Z direction |

## Bone Subdivision

Inserts virtual dummies between real bones inside the simulation (without modifying the real skeleton) to raise collision resolution. See [Bone Subdivision](/docs/features/bone-subdivision) for details.

### BoneSubdivisionCount

**Dummy Subdivision Count** - Minimum number of dummy bones to insert between adjacent bones. Improves collision detection (e.g. prevents skirts from penetrating legs). 0 to disable.

| Property | Value |
|----------|-------|
| Type | int32 |
| Default | 0 |
| Range | 0 - 10 |
| Category | Bones&#124;Bone Subdivision |

### bBoneSubdivisionCollisionOnly

**Collision Only** - Skips velocity integration (gravity/wind/etc.) for inter-bone dummies and lets them participate only in collision/constraints from interpolated positions (lightweight). Does not affect the dummy count.

| Property | Value |
|----------|-------|
| Type | bool |
| Default | true |
| Edit Condition | `BoneSubdivisionCount > 0` |
| Category | Bones&#124;Bone Subdivision |

### bBoneSubdivisionDensifyByRadius

**Densify By Radius** - Adds dummies based on radius so collision spheres roughly cover the gap between bones. Uses `BoneSubdivisionCount` as a minimum and places more where bones are far apart (up to 50 per segment).

| Property | Value |
|----------|-------|
| Type | bool |
| Default | false |
| Edit Condition | `BoneSubdivisionCount > 0` |
| Category | Bones&#124;Bone Subdivision |

### BoneConstraintSubdivisionCount

**Horizontal Subdivision Count** - Number of collision-proxy dummies (bridge dummies) inserted along each horizontal BoneConstraint. Fills gaps between adjacent chains (columns) to prevent penetration. 0 to disable. Independent of `BoneSubdivisionCount`.

| Property | Value |
|----------|-------|
| Type | int32 |
| Default | 0 |
| Range | 0 - 10 |
| Category | Bones&#124;Bone Subdivision |

### BoneConstraintSubdivisionFeedbackScale

**Feedback Scale** - Strength of transferring a bridge dummy's collision displacement to its endpoint bones (0 = none, 1 = standard). Lower it if the result is too stiff.

| Property | Value |
|----------|-------|
| Type | float |
| Default | 1.0 |
| Range | 0.0 - 2.0 |
| Edit Condition | `BoneConstraintSubdivisionCount > 0` |
| Category | Bones&#124;Bone Subdivision |

## Warm-up Settings

### WarmUpFrames

**Warm-up Frame Count** - Number of physics idle runs. Used when you want to start/display after physics processing settles.

| Property | Value |
|----------|-------|
| Type | int32 |
| Default | 0 |
| Range | 0 or higher |

### bNeedWarmUp

**Enable Warm-up** - Flag to enable warm-up.

| Property | Value |
|----------|-------|
| Type | bool |
| Default | false |

### bUseWarmUpWhenResetDynamics

**Warm-up on Reset** - Flag to run physics idle during ResetDynamics.

| Property | Value |
|----------|-------|
| Type | bool |
| Default | true |

## Curve Control

The following parameters can be controlled by curves. The curve value at "length from RootBone to specific bone / length from RootBone to terminal bone" (0.0-1.0) is multiplied to each parameter.

| Curve | Description |
|-------|-------------|
| DampingCurveData | Adjusts Damping parameter |
| StiffnessCurveData | Adjusts Stiffness parameter |
| WorldDampingLocationCurveData | Adjusts WorldDampingLocation parameter |
| WorldDampingRotationCurveData | Adjusts WorldDampingRotation parameter |
| RadiusCurveData | Adjusts Radius parameter |
| LimitAngleCurveData | Adjusts LimitAngle parameter |

:::tip
Using curves allows settings like making the root stiff and the tip soft.
:::

## Advanced Settings

### bUpdatePhysicsSettingsInGame

**Update Parameters During Game** - Flag to update physics parameters for each bone every frame. Disabling slightly improves performance, but makes it impossible to change physics parameters during runtime.

| Property | Value |
|----------|-------|
| Type | bool |
| Default | true |

### ResetBoneTransformWhenBoneNotFound

**Reset When Bone Not Found** - Flag to reset Transform when control target bone is not found. Generally recommended to keep disabled.

| Property | Value |
|----------|-------|
| Type | bool |
| Default | false |
