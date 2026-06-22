---
sidebar_position: 2
title: "UKawaiiPhysicsLibrary"
---

# UKawaiiPhysicsLibrary

<!-- AUTO-GENERATED: This page is auto-generated from source code -->

API reference for the Blueprint Function Library.

[View Source](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsLibrary.h)

## Class Definition

```cpp
UCLASS()
class KAWAIIPHYSICS_API UKawaiiPhysicsLibrary : public UBlueprintFunctionLibrary
```

## Getting Node Reference

### ConvertToKawaiiPhysics

Gets KawaiiPhysics reference from AnimNode.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics",
    meta = (BlueprintThreadSafe, ExpandEnumAsExecs = "Result"))
static FKawaiiPhysicsReference ConvertToKawaiiPhysics(
    const FAnimNodeReference& Node,
    EAnimNodeReferenceConversionResult& Result
);
```

### ConvertToKawaiiPhysicsPure

Gets KawaiiPhysics reference from AnimNode (Pure version).

```cpp
UFUNCTION(BlueprintPure, Category = "Kawaii Physics",
    meta = (BlueprintThreadSafe, DisplayName = "Convert to Kawaii Physics (Pure)"))
static void ConvertToKawaiiPhysicsPure(
    const FAnimNodeReference& Node,
    FKawaiiPhysicsReference& KawaiiPhysics,
    bool& Result
);
```

### CollectKawaiiPhysicsNodes

Collects KawaiiPhysics node references in bulk from an AnimInstance (ABP) or a SkeletalMeshComponent. Can be filtered by GameplayTag.

:::note
This is a **C++-only helper** — it is not a `UFUNCTION`, so it cannot be called directly from Blueprint (two overloads are provided: an AnimInstance version and a SkeletalMeshComponent version). To access nodes in bulk from Blueprint, use the Component-based functions such as `AddExternalForcesToComponent` / `SetAlphaToComponent`.
:::

```cpp
// Collect from AnimInstance (ABP)
static bool CollectKawaiiPhysicsNodes(
    TArray<FKawaiiPhysicsReference>& Nodes,
    UAnimInstance* AnimInstance,
    const FGameplayTagContainer& FilterTags,
    bool bFilterExactMatch
);

// Collect from SkeletalMeshComponent
static bool CollectKawaiiPhysicsNodes(
    TArray<FKawaiiPhysicsReference>& Nodes,
    USkeletalMeshComponent* MeshComp,
    const FGameplayTagContainer& FilterTags,
    bool bFilterExactMatch
);
```

## Physics Reset

### ResetDynamics

Resets the physics state of KawaiiPhysics node.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference ResetDynamics(const FKawaiiPhysicsReference& KawaiiPhysics);
```

**Use Cases:**
- Reset after teleport
- Animation switching
- Scene transitions

## Bone Settings

### SetRootBoneName / GetRootBoneName

Set/get root bone name.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetRootBoneName(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    UPARAM(ref) FName& RootBoneName
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FName GetRootBoneName(const FKawaiiPhysicsReference& KawaiiPhysics);
```

### SetExcludeBoneNames / GetExcludeBoneNames

Set/get exclude bone names.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetExcludeBoneNames(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    UPARAM(ref) TArray<FName>& ExcludeBoneNames
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static TArray<FName> GetExcludeBoneNames(const FKawaiiPhysicsReference& KawaiiPhysics);
```

## Bone Subdivision

Runtime control for bone subdivision (see [Bone Subdivision](/docs/features/bone-subdivision)). Changing the Count values triggers re-initialization on the next Evaluate.

### SetBoneSubdivisionCount / GetBoneSubdivisionCount

Set/get the vertical dummy subdivision count (clamped to 0-10).

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetBoneSubdivisionCount(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    int32 BoneSubdivisionCount
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static int32 GetBoneSubdivisionCount(const FKawaiiPhysicsReference& KawaiiPhysics);
```

### SetBoneSubdivisionCollisionOnly / GetBoneSubdivisionCollisionOnly

Set/get the collision-only mode.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetBoneSubdivisionCollisionOnly(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    bool bBoneSubdivisionCollisionOnly
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static bool GetBoneSubdivisionCollisionOnly(const FKawaiiPhysicsReference& KawaiiPhysics);
```

### SetBoneConstraintSubdivisionCount / GetBoneConstraintSubdivisionCount

Set/get the horizontal (bridge dummy) subdivision count (clamped to 0-10).

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetBoneConstraintSubdivisionCount(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    int32 BoneConstraintSubdivisionCount
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static int32 GetBoneConstraintSubdivisionCount(const FKawaiiPhysicsReference& KawaiiPhysics);
```

### SetBoneConstraintSubdivisionFeedbackScale / GetBoneConstraintSubdivisionFeedbackScale

Set/get the feedback strength (a runtime scalar; no re-initialization required).

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetBoneConstraintSubdivisionFeedbackScale(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    float BoneConstraintSubdivisionFeedbackScale
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static float GetBoneConstraintSubdivisionFeedbackScale(const FKawaiiPhysicsReference& KawaiiPhysics);
```

## Physics Settings

### SetPhysicsSettings / GetPhysicsSettings

Set/get physics settings.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetPhysicsSettings(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    UPARAM(ref) FKawaiiPhysicsSettings& PhysicsSettings
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsSettings GetPhysicsSettings(const FKawaiiPhysicsReference& KawaiiPhysics);
```

### SetDummyBoneLength / GetDummyBoneLength

Set/get dummy bone length.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetDummyBoneLength(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    float DummyBoneLength
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static float GetDummyBoneLength(const FKawaiiPhysicsReference& KawaiiPhysics);
```

## Teleport Threshold

### SetTeleportDistanceThreshold / GetTeleportDistanceThreshold

Set/get teleport distance threshold.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetTeleportDistanceThreshold(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    float TeleportDistanceThreshold
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static float GetTeleportDistanceThreshold(const FKawaiiPhysicsReference& KawaiiPhysics);
```

### SetTeleportRotationThreshold / GetTeleportRotationThreshold

Set/get teleport rotation threshold.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetTeleportRotationThreshold(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    float TeleportRotationThreshold
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static float GetTeleportRotationThreshold(const FKawaiiPhysicsReference& KawaiiPhysics);
```

## External Forces

### SetGravity / GetGravity

Set/get gravity vector.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetGravity(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    FVector Gravity
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FVector GetGravity(const FKawaiiPhysicsReference& KawaiiPhysics);
```

### SetEnableWind / GetEnableWind

Set/get wind enable setting.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetEnableWind(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    bool bEnableWind
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static bool GetEnableWind(const FKawaiiPhysicsReference& KawaiiPhysics);
```

### SetWindScale / GetWindScale

Set/get wind scale.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetWindScale(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    float WindScale
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static float GetWindScale(const FKawaiiPhysicsReference& KawaiiPhysics);
```

## Collision

### SetAllowWorldCollision / GetAllowWorldCollision

Set/get world collision enable setting.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetAllowWorldCollision(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    bool bAllowWorldCollision
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static bool GetAllowWorldCollision(const FKawaiiPhysicsReference& KawaiiPhysics);
```

### SetLimitsDataAsset / GetLimitsDataAsset

Set/get collision Data Asset.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetLimitsDataAsset(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    UKawaiiPhysicsLimitsDataAsset* LimitsDataAsset
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static UKawaiiPhysicsLimitsDataAsset* GetLimitsDataAsset(const FKawaiiPhysicsReference& KawaiiPhysics);
```

## Shared Collision

Switches the Source/Target/group tag for shared collision (see [Shared Collision](/docs/features/shared-collision)). Each setter internally calls `RequestSharedCollisionReinit()`, and changes are re-initialized thread-safely on the next Evaluate (on the worker thread, not via PreUpdate). Category is `Kawaii Physics|Shared Collision`.

### SetSharedCollisionSource / GetSharedCollisionSource

Set/get whether this node acts as a shared collision Source.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics|Shared Collision", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetSharedCollisionSource(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    bool bSharedCollisionSource
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics|Shared Collision", meta=(BlueprintThreadSafe))
static bool GetSharedCollisionSource(const FKawaiiPhysicsReference& KawaiiPhysics);
```

### SetUseSharedCollision / GetUseSharedCollision

Set/get whether this node acts as a shared collision Target.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics|Shared Collision", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetUseSharedCollision(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    bool bUseSharedCollision
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics|Shared Collision", meta=(BlueprintThreadSafe))
static bool GetUseSharedCollision(const FKawaiiPhysicsReference& KawaiiPhysics);
```

### SetSharedCollisionGroupTag / GetSharedCollisionGroupTag

Set/get the shared collision group tag.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics|Shared Collision", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetSharedCollisionGroupTag(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    FGameplayTag SharedCollisionGroupTag
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics|Shared Collision", meta=(BlueprintThreadSafe))
static FGameplayTag GetSharedCollisionGroupTag(const FKawaiiPhysicsReference& KawaiiPhysics);
```

## Warm-up

### SetNeedWarmUp / GetNeedWarmUp

Set/get warm-up enable setting.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetNeedWarmUp(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    bool bNeedWarmUp
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static bool GetNeedWarmUp(const FKawaiiPhysicsReference& KawaiiPhysics);
```

## External Force API

### AddExternalForce

Adds an external force.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static bool AddExternalForce(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    FInstancedStruct& ExternalForce,
    UObject* Owner,
    bool bIsOneShot = false
);
```

### AddExternalForceWithExecResult

Adds an external force (with execution result).

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics",
    meta=(BlueprintThreadSafe, ExpandEnumAsExecs = "ExecResult"))
static FKawaiiPhysicsReference AddExternalForceWithExecResult(
    EKawaiiPhysicsAccessExternalForceResult& ExecResult,
    const FKawaiiPhysicsReference& KawaiiPhysics,
    FInstancedStruct& ExternalForce,
    UObject* Owner
);
```

### AddExternalForcesToComponent

Adds external forces to SkeletalMeshComponent.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static bool AddExternalForcesToComponent(
    USkeletalMeshComponent* MeshComp,
    UPARAM(ref) TArray<FInstancedStruct>& ExternalForces,
    UObject* Owner,
    UPARAM(ref) FGameplayTagContainer& FilterTags,
    bool bFilterExactMatch = false,
    bool bIsOneShot = false
);
```

### RemoveExternalForcesFromComponent

Removes external forces from SkeletalMeshComponent.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static bool RemoveExternalForcesFromComponent(
    USkeletalMeshComponent* MeshComp,
    UObject* Owner,
    UPARAM(ref) FGameplayTagContainer& FilterTags,
    bool bFilterExactMatch = false
);
```

## Alpha Control

### SetAlphaToComponent

Sets Alpha value to all KawaiiPhysics nodes in the component.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static bool SetAlphaToComponent(
    USkeletalMeshComponent* MeshComp,
    float Alpha,
    UPARAM(ref) FGameplayTagContainer& FilterTags,
    bool bFilterExactMatch = false
);
```

### GetAlphaFromComponent

Gets Alpha value from the first matching KawaiiPhysics node in the component.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static bool GetAlphaFromComponent(
    USkeletalMeshComponent* MeshComp,
    float& OutAlpha,
    UPARAM(ref) FGameplayTagContainer& FilterTags,
    bool bFilterExactMatch = false
);
```

## External Force Property Access

### SetExternalForceBoolProperty / GetExternalForceBoolProperty

Set/get external force bool property.

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics",
    meta=(BlueprintThreadSafe, ExpandEnumAsExecs = "ExecResult"))
static FKawaiiPhysicsReference SetExternalForceBoolProperty(
    EKawaiiPhysicsAccessExternalForceResult& ExecResult,
    const FKawaiiPhysicsReference& KawaiiPhysics,
    int ExternalForceIndex,
    FName PropertyName,
    bool Value
);

UFUNCTION(BlueprintCallable, Category = "Kawaii Physics",
    meta=(BlueprintThreadSafe, ExpandEnumAsExecs = "ExecResult"))
static bool GetExternalForceBoolProperty(
    EKawaiiPhysicsAccessExternalForceResult& ExecResult,
    const FKawaiiPhysicsReference& KawaiiPhysics,
    int ExternalForceIndex,
    FName PropertyName
);
```

### Other Type Property Access

The following types are also supported with the same pattern:

- `int32`: SetExternalForceIntProperty / GetExternalForceIntProperty
- `float`: SetExternalForceFloatProperty / GetExternalForceFloatProperty
- `FVector`: SetExternalForceVectorProperty / GetExternalForceVectorProperty
- `FRotator`: SetExternalForceRotatorProperty / GetExternalForceRotatorProperty
- `FTransform`: SetExternalForceTransformProperty / GetExternalForceTransformProperty
- Wildcard: SetExternalForceWildcardProperty / GetExternalForceWildcardProperty

## Blueprint Usage Example

### Reset After Teleport

```
Event: On Teleport
  → Get Anim Instance from Mesh
  → Get Linked Anim Graph Instance by Tag
  → Get Anim Node By Tag
  → Convert to Kawaii Physics
  → Call ResetDynamics
```

### Apply External Force

```
Event: On Impact
  → Create External Force (Instanced Struct)
  → Add External Forces to Component
    → Mesh Comp: Self
    → Owner: Self
    → Filter Tags: "KawaiiPhysics.Hair"
```

## C++ Usage Example

```cpp
#include "KawaiiPhysicsLibrary.h"

void AMyCharacter::OnTeleport()
{
    UAnimInstance* AnimInstance = GetMesh()->GetAnimInstance();

    // Get node reference and reset
    FAnimNodeReference NodeRef = AnimInstance->GetLinkedAnimGraphInstanceByTag("HairPhysics");
    EAnimNodeReferenceConversionResult Result;
    FKawaiiPhysicsReference KPRef = UKawaiiPhysicsLibrary::ConvertToKawaiiPhysics(NodeRef, Result);

    if (Result == EAnimNodeReferenceConversionResult::Succeeded)
    {
        UKawaiiPhysicsLibrary::ResetDynamics(KPRef);
    }
}

void AMyCharacter::ApplyImpact(FVector Direction, float Force)
{
    // Add external force
    FGameplayTagContainer FilterTags;
    FilterTags.AddTag(FGameplayTag::RequestGameplayTag("KawaiiPhysics.Hair"));

    TArray<FInstancedStruct> ExternalForces;
    // Set up external forces...

    UKawaiiPhysicsLibrary::AddExternalForcesToComponent(
        GetMesh(),
        ExternalForces,
        this,
        FilterTags
    );
}
```

## Related

- [FAnimNode_KawaiiPhysics](/docs/api/animnode-kawaiiphysics)
- [External Forces Parameters](/docs/parameters/external-forces)
