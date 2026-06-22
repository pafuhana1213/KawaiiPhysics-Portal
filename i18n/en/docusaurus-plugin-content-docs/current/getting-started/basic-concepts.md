---
sidebar_position: 4
title: "Basic Concepts"
description: "How KawaiiPhysics works. Learn about bone chains, Damping, Stiffness, collision, and other core concepts."
---

# Basic Concepts

Understanding how KawaiiPhysics works.

## Architecture

KawaiiPhysics achieves bone physics using its own lightweight algorithm without using PhysX.

```
Animation Pose → KawaiiPhysics Node → Modified Pose
                       ↑
              Physics Simulation
              (Custom Algorithm)
```

## Bone Chain

KawaiiPhysics applies physics to the entire bone chain starting from the **Root Bone**.

```
head (Root Bone)
├── hair_01
│   ├── hair_02
│   └── hair_03  ← Range where physics is applied
└── ponytail_01
    └── ponytail_02
```

### Exclude Bones

You can exclude specific bones from physics calculation.

## Physics Parameters

### Damping

Gradually converges bone movement. Higher values stop movement faster.

![Damping value comparison](/img/generated/damping-comparison.svg)

### Stiffness

The force that tries to return to the original animation pose. Higher values make it stiffer.

### Radius

Defines the physical size of each bone. Used for collision detection.

## Collision System

KawaiiPhysics supports 3 types of collision:

| Type | Usage |
|------|-------|
| Sphere | Spherical shapes (head, shoulders, etc.) |
| Capsule | Capsule shapes (arms, legs, etc.) |
| Plane | Flat surfaces (ground, walls, etc.) |

## Control with Curves

Parameters can be varied along the bone chain.

```
Root ←――――――――――――→ Tip
  Stiff          Soft
```

For more details, see [Curve Editor](/docs/features/curve-editor).
