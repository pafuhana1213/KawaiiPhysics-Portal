---
sidebar_position: 5
title: "External Forces Parameters"
---

# External Forces Parameters

<!-- AUTO-GENERATED: This page is auto-generated from source code -->

Parameters related to externally applied forces.

[View Source](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNode_KawaiiPhysics.h)

## Gravity

### Gravity

**Gravity** - Gravity vector applied to bones.

| Property | Value |
|----------|-------|
| Type | FVector |
| Default | (0, 0, 0) |
| Category | Force |

```cpp
// Apply downward gravity
Gravity = FVector(0, 0, -1.0f);
```

### bUseLegacyGravity

**Legacy Gravity Method** - Specifies the Gravity application method.

| Property | Value |
|----------|-------|
| Type | bool |
| Default | false |
| Category | Force |

| Value | Description |
|-------|-------------|
| true | Legacy compatible (adds 0.5 * Gravity * dt^2 to position) |
| false | AnimDynamics compatible (adds Gravity * dt to velocity, then updates position) |

### bUseDefaultGravityZProjectSetting

**Use Project Setting Gravity** - Flag to multiply Gravity vector by the project setting's DefaultGravityZ (absolute value).

| Property | Value |
|----------|-------|
| Type | bool |
| Default | false |
| Category | Force |

### bUseWorldSpaceGravity

**World Space Gravity** - Flag for whether to handle gravity in world coordinate system.

| Property | Value |
|----------|-------|
| Type | bool |
| Default | true |
| Category | Force |

## Wind

### bEnableWind

**Enable Wind** - Flag for whether to receive influence from WindDirectionalSource as external force.

| Property | Value |
|----------|-------|
| Type | bool |
| Default | false |
| Category | Force |

### WindScale

**Wind Scale** - Influence degree of wind from WindDirectionalSource. Used for compatibility with Cloth and SpeedTree.

| Property | Value |
|----------|-------|
| Type | float |
| Default | 1.0 |
| Edit Condition | `bEnableWind == true` |
| Category | Force |

:::note
WindScale is only effective when bEnableWind is true.
:::

### WindDirectionNoiseAngle

**Wind Direction Noise** - Noise (angle) applied to wind direction from WindDirectionalSource. Adds randomness to the wind direction to soften mechanical-looking sway.

| Property | Value |
|----------|-------|
| Type | float |
| Default | 0.0 |
| Unit | Degrees |
| Range | 0 or higher |
| Edit Condition | `bEnableWind == true` |
| Category | Force |

## Simple External Force

### SimpleExternalForce

**Simple External Force Vector** - Allows applying force in any direction.

| Property | Value |
|----------|-------|
| Type | FVector |
| Default | (0, 0, 0) |
| Category | Force\|External Force |

### bUseWorldSpaceSimpleExternalForce

**World Space External Force** - Flag for whether to handle simple external force in world coordinate system.

| Property | Value |
|----------|-------|
| Type | bool |
| Default | true |
| Category | Force\|External Force |

## External Force Presets

### ExternalForces

**External Force Presets (Instanced Struct)** - External force presets. Custom presets can be added in C++.

```cpp
UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Force|External Force",
    meta = (BaseStruct = "/Script/KawaiiPhysics.KawaiiPhysics_ExternalForce", ExcludeBaseStruct))
TArray<FInstancedStruct> ExternalForces;
```

### CustomExternalForces (Experimental)

**Custom External Forces (Instanced Property)** - Custom presets can be added in BP/C++.

```cpp
UPROPERTY(EditAnywhere, BlueprintReadWrite, Instanced, Category = "Force|External Force",
    meta=(DisplayName="CustomExternalForces(EXPERIMENTAL)"))
TArray<TObjectPtr<UKawaiiPhysics_CustomExternalForce>> CustomExternalForces;
```

:::warning
This feature is highly experimental. It may not work properly unless you click on the AnimNode or compile the Animation Blueprint.
:::

## Tag

### KawaiiPhysicsTag

**Filtering Tag** - GameplayTag for filtering, used with ExternalForce, etc.

| Property | Value |
|----------|-------|
| Type | FGameplayTag |
| Category | Tag |

```cpp
// Apply external force using tag
FGameplayTagContainer FilterTags;
FilterTags.AddTag(FGameplayTag::RequestGameplayTag("KawaiiPhysics.Hair"));
UKawaiiPhysicsLibrary::AddExternalForcesToComponent(MeshComp, ExternalForces, Owner, FilterTags);
```

## Blueprint API

External forces can be dynamically controlled from Blueprint.

### Adding External Force

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics")
static bool AddExternalForce(const FKawaiiPhysicsReference& KawaiiPhysics,
                             FInstancedStruct& ExternalForce, UObject* Owner, bool bIsOneShot = false);
```

### Adding External Force to Component

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics")
static bool AddExternalForcesToComponent(USkeletalMeshComponent* MeshComp,
                                         TArray<FInstancedStruct>& ExternalForces, UObject* Owner,
                                         FGameplayTagContainer& FilterTags,
                                         bool bFilterExactMatch = false,
                                         bool bIsOneShot = false);
```

### Removing External Force

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics")
static bool RemoveExternalForcesFromComponent(USkeletalMeshComponent* MeshComp, UObject* Owner,
                                              FGameplayTagContainer& FilterTags,
                                              bool bFilterExactMatch = false);
```

For more details, see [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library).
