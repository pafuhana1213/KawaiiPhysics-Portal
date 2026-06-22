---
sidebar_position: 1
title: "Parameters Overview"
description: "Complete parameter reference for KawaiiPhysics. Physics, collision, limits, and external force settings."
---

# Parameters Overview

<!-- AUTO-GENERATED: This page is auto-generated from source code -->

Overview of configurable parameters in the KawaiiPhysics node.

![Parameter category map](/img/generated/parameter-categories-map.svg)

*An overview of the main parameters organized into four categories: Physics / Collision / Limits / External Forces. (Diagram labels are in Japanese.)*

## Parameter Categories

| Category | Description |
|----------|-------------|
| [Physics](/docs/parameters/physics) | Basic physics simulation parameters |
| [Collision](/docs/parameters/collision) | Collision settings |
| [Limits](/docs/parameters/limits) | Angle and movement limits |
| [External Forces](/docs/parameters/external-forces) | External forces like wind and gravity |

## Quick Reference

### Commonly Used Parameters

| Parameter | Category | Description |
|-----------|----------|-------------|
| Root Bone | Basic | Parent of the bone chain to apply physics |
| Damping | Physics | Damping coefficient |
| Stiffness | Physics | Stiffness |
| Radius | Physics | Bone radius |
| Gravity | External Forces | Gravity direction and strength |

### Default Values

```cpp
// From AnimNode_KawaiiPhysics.h
Damping = 0.1f;
Stiffness = 0.05f;
Radius = 3.0f;  // Display name: Collision Radius
```

## Management with Data Asset

Parameters can be saved to **KawaiiPhysicsLimitsDataAsset** for reuse.

For more details, see [Data Assets](/docs/features/data-assets).
