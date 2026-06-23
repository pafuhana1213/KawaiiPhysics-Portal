---
sidebar_position: 4
title: "Curve Editor"
---

# Curve Editor

This guide explains the curve feature for varying parameters along the bone chain.

:::note
This page is a usage **guide**. For the reference of each curve property (`DampingCurveData`, etc.), see [Physics Parameters](/docs/parameters/physics).
:::

## Overview

Using curves, you can smoothly vary parameters from the root to the tip of the bone chain.

![Parameter variation from root to tip via curves](/img/generated/curve-root-to-tip.svg)

*Smoothly varying a parameter (e.g. Stiffness) from the root toward the tip of the bone chain (diagram labels are in Japanese).*

## Supported Parameters

The following parameters support curves (`Physics Settings | Curves` category, AdvancedDisplay). Each is multiplied into its parameter according to the bone-length ratio from the RootBone (0.0–1.0).

- **Damping Curve** - Damping (editor display name: Damping Rate by Bone Length Rate)
- **Stiffness Curve** - Stiffness (Stiffness Rate by Bone Length Rate)
- **World Damping Location Curve** - World location damping (World Damping Location Rate by Bone Length Rate)
- **World Damping Rotation Curve** - World rotation damping (World Damping Rotation Rate by Bone Length Rate)
- **Radius Curve** - Radius (Radius Rate by Bone Length Rate)
- **LimitAngle Curve** - Angle limit (LimitAngle Rate by Bone Length Rate)

## Setting Up Curves

1. Select the KawaiiPhysics node
2. Expand the target Curve property
3. Add and edit keys in the curve editor

![Curve editor UI](/img/generated/curve-editor-mock.svg)

## Reading Curves

| Axis | Meaning |
|------|---------|
| X axis | Position in bone chain (0=root, 1=tip) |
| Y axis | Parameter value |

## Setting Examples

### Hair

Stiff at root, soft at tip:

```
Stiffness Curve:
  (0.0, 0.5)  ← Root: stiffer
  (1.0, 0.05) ← Tip: softer
```

### Tail

Uniform movement:

```
Damping Curve:
  (0.0, 0.2)
  (1.0, 0.2)  ← Same value throughout
```

### Skirt

Widening toward hem:

```
Radius Curve:
  (0.0, 5.0)  ← Waist area
  (1.0, 15.0) ← Hem
```

## Curve vs Fixed Value

| Situation | Recommended |
|-----------|-------------|
| Want same movement throughout | Fixed value |
| Want different movement at root and tip | Curve |
| Want special movement only in middle section | Curve |

:::tip
It's efficient to start adjusting with fixed values and switch to curves as needed.
:::
