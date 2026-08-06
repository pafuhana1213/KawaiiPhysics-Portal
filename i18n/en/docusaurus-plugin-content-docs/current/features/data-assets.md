---
sidebar_position: 5
title: "Data Assets"
---

# Data Assets

This guide explains how to manage parameters as reusable Data Assets.

## Overview

Using **KawaiiPhysicsLimitsDataAsset**, you can share collision settings and limit parameters across multiple characters.

## Creating a Data Asset

1. Right-click in Content Browser
2. Select **Miscellaneous > Data Asset**
3. Select **KawaiiPhysicsLimitsDataAsset**
4. Name and save

![DataAsset Regex Settings](/img/features/dataasset-regex.png)

*Specifying bone sets with regular expressions in DataAsset*

## Setting Parameters

Data Assets can store the following collision limits:

- Spherical Limits
- Capsule Limits
- Box Limits
- Planar Limits

## Usage

1. Set the **Limits Data Asset** property in the KawaiiPhysics node
2. Parameters from the Data Asset are automatically loaded

```cpp
UPROPERTY()
UKawaiiPhysicsLimitsDataAsset* LimitsDataAsset;
```

## BoneConstraint Settings

See [Bone Constraint](/docs/features/bone-constraint) for a guide to the feature itself.

From v1.14.0, BoneConstraint (distance constraints between bones) can be configured in DataAssets. Became official in v1.19.0.

![BoneConstraint Demo](/img/features/boneconstraint-demo.webp)

Bone sets for constraints can be specified using regular expressions:

```text
// Example: Constraints between skirt_01_* and skirt_02_*
Bone1: skirt_01_.*
Bone2: skirt_02_.*
```

### BoneConstraintsDataAsset

:::tip Version Info
Stabilized in v1.19.0
:::

A Data Asset dedicated to BoneConstraint settings. Recommended when you want to share settings across multiple AnimNodes or Animation Blueprints.

[View Source](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsBoneConstraintsDataAsset.h)

```cpp
UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Limits|Bone Constraint")
TObjectPtr<UKawaiiPhysicsBoneConstraintsDataAsset> BoneConstraintsDataAsset;
```

#### BoneConstraintsDataAsset Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| BoneConstraintsData | TArray\<FModifyBoneConstraintData\> | Array of bone constraint data |
| RegexPatternList | TArray\<FRegexPatternBoneSet\> | Regular expression pattern list (editor only) |
| PreviewSkeleton | TSoftObjectPtr\<USkeleton\> | Preview skeleton for editor |

#### FModifyBoneConstraintData Struct

| Parameter | Type | Description |
|-----------|------|-------------|
| BoneReference1 | FBoneReference | Reference to first bone |
| BoneReference2 | FBoneReference | Reference to second bone |
| bOverrideCompliance | bool | Whether to override Compliance Type |
| ComplianceType | EXPBDComplianceType | Compliance Type when overriding (Default: Leather) |
| bExcludeFromSubdivision | bool | Exclude this constraint from BoneConstraint Subdivision (opt-out for structural/diagonal constraints; default: false, added in v1.21.0) |

#### Batch Setup with Regular Expressions

Use the `ApplyRegex` button to automatically generate bone constraints from regex patterns.

```cpp
// FRegexPatternBoneSet
RegexPatternBone1 = "skirt_01_.*";  // First bone pattern
RegexPatternBone2 = "skirt_02_.*";  // Second bone pattern
```

## Benefits

### Reusability

Collision settings can be shared among characters with the same body type.

### Batch Changes

Modifying the Data Asset reflects changes to all referencing characters.

### Version Control

Can be managed as assets, making change history easier to track.

## Best Practices

1. **Create per body type**: "Male_Standard", "Female_Standard", etc.
2. **Separate by part**: "Hair_Collision", "Tail_Collision", etc.
3. **Naming convention**: `DA_KP_[BodyType]_[Part]`

```text
Content/
└── KawaiiPhysics/
    └── DataAssets/
        ├── DA_KP_Female_Hair
        ├── DA_KP_Female_Skirt
        └── DA_KP_Male_Cape
```
