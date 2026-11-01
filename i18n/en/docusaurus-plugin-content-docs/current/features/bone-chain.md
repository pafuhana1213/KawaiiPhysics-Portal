---
sidebar_position: 1
title: "Bone Chain Setup"
---

import DocVideo from '@site/src/components/DocVideo';

# Bone Chain Setup

This guide explains how to set up bone chains in KawaiiPhysics.

:::note
This page is a setup **guide**. For full details of the `RootBone` / `ExcludeBones` / `AdditionalRootBones` / `DummyBoneLength` properties, see [Physics Parameters](/docs/parameters/physics).
:::

## Selecting Root Bone

**Root Bone** specifies the **parent bone** of the bone chain to apply physics to.

:::warning
Physics is not applied to the Root Bone itself. Physics is applied to its child bones and below.
:::

<DocVideo src="/video/sample/bone-chain-root.mp4" poster="/video/sample/bone-chain-root.jpg" alt="A chain without KawaiiPhysics next to a chain with RootBone set to Torus001, which sways" caption="Recorded from development sample exhibit 1.1. Left: no KawaiiPhysics. Right: Root Bone set to Torus001, so the bones below it sway." />

## Auto-detection

KawaiiPhysics automatically detects child bones from the Root Bone and constructs the chain.

```
spine_03 (Root Bone - no physics)
├── hair_front_01  ← Physics applied
│   └── hair_front_02  ← Physics applied
└── hair_back_01   ← Physics applied
    └── hair_back_02   ← Physics applied
```

## DummyBoneLength (Improving End-Bone Sway)

The **end bone** of a chain has no child bone, so it lacks a reference for its rotation and its physics tends to be unstable. Setting `DummyBoneLength` to a value greater than 0 adds one **invisible dummy bone** at the tip, giving the end bone a "child" and stabilizing its rotation and sway. It is an important parameter that directly affects how things sway.

<DocVideo src="/video/sample/dummy-bone-length.mp4" poster="/video/sample/dummy-bone-length.jpg" alt="With DummyBoneLength 0 the chain tip kinks; with 25 the chain sways smoothly to its tip" caption="Comparison recorded on the chain from development sample exhibit 2.3, changing only DummyBoneLength. At 0 (left) the end bone kinks on its own; at 25 (right) the chain sways as one piece to its tip." />

| Property | Value |
|----------|-------|
| Type | float |
| Default | 0.0 (disabled) |
| Range | 0 or higher |
| Category | Bones |

**Tips:**

- Useful when the end bone's sway is weak, jerky, or unnatural
- The value is the dummy bone's length (distance from the end bone). Start with roughly the same length as the end bone
- At runtime it can be changed with `UKawaiiPhysicsLibrary::SetDummyBoneLength` (the bone structure is rebuilt when changed)

:::note
This adds a single dummy at the **tip** of the chain. It is different from `BoneSubdivisionCount`, which inserts dummies **between** adjacent bones to increase collision resolution (see [Bone Subdivision](/docs/features/bone-subdivision)).
:::

## Exclude Bones

You can exclude specific bones from physics calculation.

```cpp
UPROPERTY(EditAnywhere, Category = "Bones")
TArray<FBoneReference> ExcludeBones;
```

:::warning
A bone listed in `ExcludeBones` removes **that bone and all of its descendants** from physics control. If you specify a bone in the middle of a chain, physics will no longer be applied to anything down to the tip from there.
:::

<DocVideo src="/video/sample/exclude-bones.mp4" poster="/video/sample/exclude-bones.jpg" alt="Without ExcludeBones the spine and legs move too; excluding Spine_01 and the thighs leaves only the skirt swaying" caption="Recorded from development sample exhibit 1.3. Left: Root Bone Pelvis alone also moves the spine and legs. Right: excluding Spine_01 and Thigh_L/R leaves only the skirt swaying. A bone listed in Exclude Bones and all of its descendants are removed from the physics calculation." />

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
