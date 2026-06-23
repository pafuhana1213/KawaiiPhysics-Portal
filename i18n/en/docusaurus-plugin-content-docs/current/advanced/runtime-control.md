---
sidebar_position: 4
title: "Runtime Control"
---

# Runtime Control

This guide explains how to dynamically control KawaiiPhysics during gameplay.

Runtime control is done through the Blueprint functions provided by **[UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library)**. They are marked `BlueprintThreadSafe`, so they can be safely called from the Animation Blueprint worker thread (AnimGraph node functions or `On Update Animation`).

![Runtime control flow](/img/generated/runtime-control-flow.svg)

*Overview: get a node reference, then call parameter changes, enable/disable, external forces, and reset (labels in Japanese)*

## Getting the Node Reference

The parameter functions all take an `FKawaiiPhysicsReference` (node reference). Get it from an AnimGraph node handle with `Convert to Kawaii Physics`.

```cpp
// Convert FAnimNodeReference to a KawaiiPhysics node reference
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics",
    meta = (BlueprintThreadSafe, ExpandEnumAsExecs = "Result"))
static FKawaiiPhysicsReference ConvertToKawaiiPhysics(const FAnimNodeReference& Node,
                                                      EAnimNodeReferenceConversionResult& Result);

// Pure version (receives success/failure as a bool)
static void ConvertToKawaiiPhysicsPure(const FAnimNodeReference& Node,
                                       FKawaiiPhysicsReference& KawaiiPhysics, bool& Result);
```

:::tip
In Blueprint, the basic pattern is to assign an **Anim Node Function** (a bound function) to the KawaiiPhysics node in the AnimGraph, and inside it call `Convert to Kawaii Physics` followed by the setters.
:::

## Dynamic Parameter Changes

Each setter returns an `FKawaiiPhysicsReference`, so you can chain several parameter changes in a row.

```cpp
// Change gravity, wind, and physics settings dynamically
KawaiiPhysics = UKawaiiPhysicsLibrary::SetGravity(KawaiiPhysics, FVector(0, 0, -980.0f));
KawaiiPhysics = UKawaiiPhysicsLibrary::SetWindScale(KawaiiPhysics, 2.0f);
KawaiiPhysics = UKawaiiPhysicsLibrary::SetEnableWind(KawaiiPhysics, true);
```

Physics parameters (Damping / Stiffness, etc.) are swapped in as a whole.

```cpp
FKawaiiPhysicsSettings Settings = UKawaiiPhysicsLibrary::GetPhysicsSettings(KawaiiPhysics);
Settings.Damping = 0.2f;
Settings.Stiffness = 0.1f;
KawaiiPhysics = UKawaiiPhysicsLibrary::SetPhysicsSettings(KawaiiPhysics, Settings);
```

:::note
Parameter changes such as `SetPhysicsSettings` are reflected every frame when the node's `bUpdatePhysicsSettingsInGame` (default `true`) is enabled. Disabling it improves performance but stops runtime parameter changes from taking effect.
:::

Main parameter functions (selection):

| Function | Description |
|----------|-------------|
| `SetGravity` / `GetGravity` | Gravity vector |
| `SetEnableWind` / `SetWindScale` | Enable wind / wind scale |
| `SetPhysicsSettings` / `GetPhysicsSettings` | Batch set Damping / Stiffness / Radius, etc. |
| `SetDummyBoneLength` | End dummy-bone length (auto-schedules re-init) |
| `SetBoneSubdivisionCount` | Bone subdivision count (auto-schedules re-init) |
| `SetTeleportDistanceThreshold` / `SetTeleportRotationThreshold` | Teleport thresholds |
| `SetAllowWorldCollision` | Enable world collision |
| `SetLimitsDataAsset` | Swap the collision Data Asset |

For all functions, see [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library).

## Enable/Disable Toggle

There is no per-node enable/disable property. Use one of the following.

### Control via Alpha (Recommended)

`SetAlphaToComponent` sets the blend ratio (input Alpha) of all KawaiiPhysics nodes in the component at once. `0.0` means physics OFF (original animation) and `1.0` means physics ON.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static bool SetAlphaToComponent(USkeletalMeshComponent* MeshComp, float Alpha,
                                UPARAM(ref) FGameplayTagContainer& FilterTags,
                                bool bFilterExactMatch = false);
```

Passing a [KawaiiPhysicsTag](/docs/parameters/external-forces) in `FilterTags` lets you narrow the target nodes. For automatic control during animation, you can also use [AnimNotifyState: Set Alpha](#animnotifystate-setalpha).

### Bulk Stop via Console Variable

For debugging, `a.AnimNode.KawaiiPhysics.Enable 0` stops the simulation of all KawaiiPhysics nodes ([Console Variables](/docs/advanced/console-variables)).

**Use Cases:**

- Set Alpha to 0 during cutscenes
- Stop during pause menu
- Lower Alpha based on LOD

## Dynamic External Force Application

External forces are added as `FInstancedStruct` (force presets). There is no API that takes a plain vector directly. For details on presets, see [External Force Presets](/docs/features/external-force-presets).

### Add to a Node Reference

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static bool AddExternalForce(const FKawaiiPhysicsReference& KawaiiPhysics,
                             FInstancedStruct& ExternalForce, UObject* Owner, bool bIsOneShot = false);
```

Setting `bIsOneShot = true` applies the force only once (handy for impacts).

### Add to a Component in Bulk

From outside the AnimGraph (game thread), adding forces per component is simpler. `FilterTags` lets you narrow the target nodes.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static bool AddExternalForcesToComponent(USkeletalMeshComponent* MeshComp,
                                         UPARAM(ref) TArray<FInstancedStruct>& ExternalForces, UObject* Owner,
                                         UPARAM(ref) FGameplayTagContainer& FilterTags,
                                         bool bFilterExactMatch = false,
                                         bool bIsOneShot = false);

// Remove added forces (by Owner)
static bool RemoveExternalForcesFromComponent(USkeletalMeshComponent* MeshComp, UObject* Owner,
                                              UPARAM(ref) FGameplayTagContainer& FilterTags,
                                              bool bFilterExactMatch = false);
```

:::tip
For explosion or damage impacts, add an `FKawaiiPhysics_ExternalForce_Basic` preset (which carries a force direction and magnitude) with `bIsOneShot = true`. For continuous forces, do not use OneShot, and remove them with `RemoveExternalForcesFromComponent` when no longer needed.
:::

## Reset

Returns the physics state to its initial state. Use after teleports or on respawn.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference ResetDynamics(const FKawaiiPhysicsReference& KawaiiPhysics);
```

```cpp
// Get the node reference and reset
bool bOk = false;
FKawaiiPhysicsReference Ref;
UKawaiiPhysicsLibrary::ConvertToKawaiiPhysicsPure(Node, Ref, bOk);
if (bOk)
{
    UKawaiiPhysicsLibrary::ResetDynamics(Ref);
}
```

:::note
When the node's `bUseWarmUpWhenResetDynamics` (default `true`) is enabled, the reset runs `WarmUpFrames` of warm-up so physics resumes from a settled state.
:::

**Use Cases:**

- After teleport (movement beyond the threshold is treated as a teleport automatically, but an explicit reset is also possible)
- During animation transitions
- On respawn

## Event Integration

### AnimNotify / AnimNotifyState {#animnotify}

:::tip Version Info
External-force Notifies added in v1.17.0; the Set Alpha NotifyState added in v1.20.0
:::

KawaiiPhysics-specific AnimNotify / AnimNotifyState are provided. See [AnimNotify](/docs/features/animnotify) for details.

| Class | Type | Description |
|-------|------|-------------|
| `AnimNotify_KawaiiPhysicsAddExternalForce` | AnimNotify | Applies an external force once at that instant (OneShot) |
| `AnimNotifyState_KawaiiPhysicsAddExternalForce` | AnimNotifyState | Applies an external force continuously over the interval (added on Begin, removed on End) |
| `AnimNotifyState_KawaiiPhysicsSetAlpha` | AnimNotifyState | Controls the physics blend ratio (Alpha) over the interval |

### AnimNotifyState: Set Alpha {#animnotifystate-setalpha}

An AnimNotifyState that dynamically changes the physics blend ratio during animation. Internally it calls `SetAlphaToComponent`.

```
Animation Timeline:
[=======================================]
     [--Set Alpha: 0.0 -> 1.0--]
     ↑                        ↑
     Start (Physics OFF)      End (Physics ON)
```

**Use Cases:**

- Disable physics only during specific animations
- Smooth blending during animation transitions
- Control during cutscenes

### Applying from Gameplay Events

```cpp
// On damage, apply the impact as an external force preset
void AMyCharacter::OnDamageReceived(float Damage, FVector HitDirection)
{
    // Build an FKawaiiPhysics_ExternalForce_Basic, wrap it in an FInstancedStruct,
    // and apply with AddExternalForcesToComponent( ..., bIsOneShot = true )
}
```

For more details, see [API Reference](/docs/api/kawaiiphysics-library).
