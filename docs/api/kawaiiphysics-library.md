---
sidebar_position: 2
title: "UKawaiiPhysicsLibrary"
---

# UKawaiiPhysicsLibrary

<!-- AUTO-GENERATED: このページはソースコードから自動生成されます -->

Blueprint Function LibraryのAPIリファレンスです。

[ソースを見る](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsLibrary.h)

## クラス定義

```cpp
UCLASS()
class KAWAIIPHYSICS_API UKawaiiPhysicsLibrary : public UBlueprintFunctionLibrary
```

## ノード参照の取得

### ConvertToKawaiiPhysics

AnimNodeからKawaiiPhysics参照を取得します。

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics",
    meta = (BlueprintThreadSafe, ExpandEnumAsExecs = "Result"))
static FKawaiiPhysicsReference ConvertToKawaiiPhysics(
    const FAnimNodeReference& Node,
    EAnimNodeReferenceConversionResult& Result
);
```

### ConvertToKawaiiPhysicsPure

AnimNodeからKawaiiPhysics参照を取得（Pure版）。

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

AnimInstance（ABP）または SkeletalMeshComponent から、KawaiiPhysics ノード参照をまとめて取得します。GameplayTag でフィルタリングできます。

:::note
この関数は **C++専用ヘルパー** であり、`UFUNCTION` ではないため Blueprint からは直接呼び出せません（AnimInstance 版と SkeletalMeshComponent 版の2オーバーロードを提供）。Blueprint からノードへ一括アクセスする場合は、`AddExternalForcesToComponent` / `SetAlphaToComponent` など Component を受け取る関数を使用してください。
:::

```cpp
// AnimInstance(ABP) から収集
static bool CollectKawaiiPhysicsNodes(
    TArray<FKawaiiPhysicsReference>& Nodes,
    UAnimInstance* AnimInstance,
    const FGameplayTagContainer& FilterTags,
    bool bFilterExactMatch
);

// SkeletalMeshComponent から収集
static bool CollectKawaiiPhysicsNodes(
    TArray<FKawaiiPhysicsReference>& Nodes,
    USkeletalMeshComponent* MeshComp,
    const FGameplayTagContainer& FilterTags,
    bool bFilterExactMatch
);
```

## 物理リセット

### ResetDynamics

KawaiiPhysicsノードの物理状態をリセットします。

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference ResetDynamics(const FKawaiiPhysicsReference& KawaiiPhysics);
```

**使用例:**
- テレポート後のリセット
- アニメーション切り替え時
- シーン遷移時

## ボーン設定

### SetRootBoneName / GetRootBoneName

ルートボーン名の設定/取得。

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

除外ボーン名の設定/取得。

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

ボーン細分化（[Bone Subdivision](/docs/features/bone-subdivision)）に関するランタイム制御です。Count系を変更すると次回Evaluateで再初期化されます。

### SetBoneSubdivisionCount / GetBoneSubdivisionCount

縦方向ダミー分割数の設定/取得（0〜10にクランプ）。

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

コリジョン専用モードの設定/取得。

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

横方向（bridge dummy）分割数の設定/取得（0〜10にクランプ）。

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

フィードバック強度の設定/取得（ランタイムスカラー、再初期化不要）。

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

物理設定の設定/取得。

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

ダミーボーン長の設定/取得。

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetDummyBoneLength(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    float DummyBoneLength
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static float GetDummyBoneLength(const FKawaiiPhysicsReference& KawaiiPhysics);
```

## テレポートしきい値

### SetTeleportDistanceThreshold / GetTeleportDistanceThreshold

テレポート距離しきい値の設定/取得。

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

テレポート回転しきい値の設定/取得。

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetTeleportRotationThreshold(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    float TeleportRotationThreshold
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static float GetTeleportRotationThreshold(const FKawaiiPhysicsReference& KawaiiPhysics);
```

## 外部力

### SetGravity / GetGravity

重力ベクトルの設定/取得。

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

風の有効化設定/取得。

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

風のスケールの設定/取得。

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetWindScale(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    float WindScale
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static float GetWindScale(const FKawaiiPhysicsReference& KawaiiPhysics);
```

## コリジョン

### SetAllowWorldCollision / GetAllowWorldCollision

ワールドコリジョンの有効化設定/取得。

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

コリジョンData Assetの設定/取得。

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

共有コリジョン（[Shared Collision](/docs/features/shared-collision)）の Source/Target/グループタグを切り替えます。各 Setter は内部で `RequestSharedCollisionReinit()` を呼び、変更は次回の Evaluate（ワーカースレッド）でスレッドセーフに再初期化されます（PreUpdate を介しません）。カテゴリは `Kawaii Physics|Shared Collision`。

### SetSharedCollisionSource / GetSharedCollisionSource

このノードを共有コリジョンの Source にするかの設定/取得。

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

このノードを共有コリジョンの Target にするかの設定/取得。

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

共有コリジョンのグループタグの設定/取得。

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics|Shared Collision", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference SetSharedCollisionGroupTag(
    const FKawaiiPhysicsReference& KawaiiPhysics,
    FGameplayTag SharedCollisionGroupTag
);

UFUNCTION(BlueprintPure, Category = "Kawaii Physics|Shared Collision", meta=(BlueprintThreadSafe))
static FGameplayTag GetSharedCollisionGroupTag(const FKawaiiPhysicsReference& KawaiiPhysics);
```

## ウォームアップ

### SetNeedWarmUp / GetNeedWarmUp

ウォームアップの有効化設定/取得。

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

外力を追加します。

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

外力を追加（実行結果付き）。

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

SkeletalMeshComponentに外力を追加します。

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

SkeletalMeshComponentから外力を削除します。

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static bool RemoveExternalForcesFromComponent(
    USkeletalMeshComponent* MeshComp,
    UObject* Owner,
    UPARAM(ref) FGameplayTagContainer& FilterTags,
    bool bFilterExactMatch = false
);
```

## Alpha制御

### SetAlphaToComponent

コンポーネント内のすべてのKawaiiPhysicsノードにAlpha値を設定します。

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

コンポーネント内の最初にマッチしたKawaiiPhysicsノードからAlpha値を取得します。

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static bool GetAlphaFromComponent(
    USkeletalMeshComponent* MeshComp,
    float& OutAlpha,
    UPARAM(ref) FGameplayTagContainer& FilterTags,
    bool bFilterExactMatch = false
);
```

## External Force プロパティアクセス

### SetExternalForceBoolProperty / GetExternalForceBoolProperty

外力のboolプロパティ設定/取得。

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

### 他の型のプロパティアクセス

同様のパターンで以下の型もサポートしています：

- `int32`: SetExternalForceIntProperty / GetExternalForceIntProperty
- `float`: SetExternalForceFloatProperty / GetExternalForceFloatProperty
- `FVector`: SetExternalForceVectorProperty / GetExternalForceVectorProperty
- `FRotator`: SetExternalForceRotatorProperty / GetExternalForceRotatorProperty
- `FTransform`: SetExternalForceTransformProperty / GetExternalForceTransformProperty
- Wildcard: SetExternalForceWildcardProperty / GetExternalForceWildcardProperty

## Blueprint使用例

### テレポート後のリセット

```
Event: On Teleport
  → Get Anim Instance from Mesh
  → Get Linked Anim Graph Instance by Tag
  → Get Anim Node By Tag
  → Convert to Kawaii Physics
  → Call ResetDynamics
```

### 外力の適用

```
Event: On Impact
  → Create External Force (Instanced Struct)
  → Add External Forces to Component
    → Mesh Comp: Self
    → Owner: Self
    → Filter Tags: "KawaiiPhysics.Hair"
```

## C++使用例

```cpp
#include "KawaiiPhysicsLibrary.h"

void AMyCharacter::OnTeleport()
{
    UAnimInstance* AnimInstance = GetMesh()->GetAnimInstance();

    // ノード参照を取得してリセット
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
    // 外力を追加
    FGameplayTagContainer FilterTags;
    FilterTags.AddTag(FGameplayTag::RequestGameplayTag("KawaiiPhysics.Hair"));

    TArray<FInstancedStruct> ExternalForces;
    // 外力を設定...

    UKawaiiPhysicsLibrary::AddExternalForcesToComponent(
        GetMesh(),
        ExternalForces,
        this,
        FilterTags
    );
}
```

## 関連

- [FAnimNode_KawaiiPhysics](/docs/api/animnode-kawaiiphysics)
- [External Forces パラメータ](/docs/parameters/external-forces)
