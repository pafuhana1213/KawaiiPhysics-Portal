---
sidebar_position: 4
title: "Basic Concepts"
description: "How KawaiiPhysics works and an overview of its core building blocks: bone chains, Damping/Stiffness/Radius, collision, and curves."
---

# Basic Concepts

Get a high-level picture of how KawaiiPhysics works and how its settings fit together. Each element links to its dedicated setup guide or reference.

## Architecture

KawaiiPhysics achieves bone physics using its own lightweight algorithm without using PhysX. It runs as a node in the AnimGraph, taking the input pose and outputting the pose after physics simulation.

![Architecture and data flow](/img/generated/architecture-dataflow.svg)

*Position of the KawaiiPhysics node within the AnimGraph and its internal processing flow (diagram labels are in Japanese).*

## Overview of the Building Blocks

KawaiiPhysics setup is made up of the following elements.

| Element | Summary | Learn more |
|---------|---------|------------|
| **Bone Chain** | The range of bones that physics is applied to, starting from the Root Bone. Exclude Bones can remove part of it | [Bone Chain Setup](/docs/features/bone-chain) |
| **Physics Parameters** | Damping (how quickly it settles) / Stiffness (how strongly it returns) / Radius (thickness) decide how it sways | [Adjusting the Sway](/docs/features/physics-setup) |
| **Collision** | Sphere, capsule, box, and plane shapes prevent body penetration | [Collision Setup](/docs/features/collision-setup) |
| **Curves** | Smoothly vary parameters from root to tip | [Curve Editor](/docs/features/curve-editor) |
| **External Forces** | Apply wind, gravity, or arbitrary forces | [Wind and External Forces](/docs/features/wind-and-forces) |

## Next Steps

Once you have the big picture, move on to the setup guides based on what you want to do.

1. [Bone Chain Setup](/docs/features/bone-chain) — specify which bones to sway
2. [Adjusting the Sway](/docs/features/physics-setup) — decide how it sways with Damping / Stiffness / Radius
3. [Collision Setup](/docs/features/collision-setup) — prevent body penetration
4. [Wind and External Forces](/docs/features/wind-and-forces) — apply wind and gravity

For a full list of parameters, see the [Parameters Overview](/docs/parameters/overview).
