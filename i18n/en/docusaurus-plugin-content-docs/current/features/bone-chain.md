---
sidebar_position: 1
title: "Bone Chain Setup"
---

# Bone Chain Setup

This guide explains how to set up bone chains in KawaiiPhysics.

## Selecting Root Bone

**Root Bone** specifies the **parent bone** of the bone chain to apply physics to.

:::warning
Physics is not applied to the Root Bone itself. Physics is applied to its child bones and below.
:::

![Bone chain structure diagram](/img/generated/bone-chain-diagram.svg)

## Auto-detection

KawaiiPhysics automatically detects child bones from the Root Bone and constructs the chain.

```
spine_03 (Root Bone - no physics)
├── hair_front_01  ← Physics applied
│   └── hair_front_02  ← Physics applied
└── hair_back_01   ← Physics applied
    └── hair_back_02   ← Physics applied
```

## Exclude Bones

You can exclude specific bones from physics calculation.

```cpp
UPROPERTY(EditAnywhere, Category = "Bones")
TArray<FBoneReference> ExcludeBones;
```

:::warning
A bone listed in `ExcludeBones` removes **that bone and all of its descendants** from physics control. If you specify a bone in the middle of a chain, physics will no longer be applied to anything down to the tip from there.
:::

### Use Cases

- Parts you don't want to move, like ribbon knots
- Bones you want to control with a different KawaiiPhysics node

:::tip
To set a dedicated exclude list per Additional Root Bone, use `OverrideExcludeBones` (when `bUseOverrideExcludeBones` is enabled) on each `FKawaiiPhysicsRootBoneSetting`.
:::

## Multiple Bone Chains

You can use multiple KawaiiPhysics nodes for one character.

```
AnimGraph
├── KawaiiPhysics (for hair)
├── KawaiiPhysics (for tail)
└── KawaiiPhysics (for clothing)
```

:::tip
Parts with different parameters are easier to adjust when managed with separate nodes.
:::

## Additional Root Bones {#additional-root-bones}

:::tip Version Info
Added in v1.17.0
:::

You can set multiple RootBones in a single KawaiiPhysics node. Useful when you want to control multiple bone chains with the same parameters.

### Setup

1. Select KawaiiPhysics node
2. Add elements to **Additional Root Bones** array
3. Set additional RootBone for each element

### FKawaiiPhysicsRootBoneSetting

| Property | Type | Description |
|----------|------|-------------|
| RootBone | FBoneReference | Additional control root bone |
| OverrideExcludeBones | TArray\<FBoneReference\> | Exclude bones list specific to this root bone |
| bUseOverrideExcludeBones | bool | Enable exclude bones override |

### Usage Example

```
// Control front and back hair with one node
RootBone: hair_front_root
AdditionalRootBones:
  - RootBone: hair_back_root
  - RootBone: hair_side_l_root
  - RootBone: hair_side_r_root
```

### Benefits

- **Reduced Node Count**: Combine into one node if parameters are the same
- **Performance**: Slightly more efficient than multiple nodes
- **Easier Management**: Parameter changes apply to all at once

### Comparison with Traditional Method

| Method | Benefits | Drawbacks |
|--------|----------|-----------|
| Multiple Nodes | Different parameters for each part | More nodes |
| Additional Root Bones | Manage all with same parameters | Difficult to fine-tune per part |

:::tip
Recommended to use Additional Root Bones for parts you want to animate with the same parameters like hair, and use separate nodes for parts that need different parameters like skirt and tail.
:::

## Bone Length and Radius

Each bone's length is automatically calculated. Radius can be set manually or controlled with curves.

For more details, see [Curve Editor](/docs/features/curve-editor).
