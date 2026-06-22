---
sidebar_position: 10
title: "Shared Collision"
---

# Shared Collision

:::tip Version Info
Added in v1.21.0
:::

**Shared Collision** lets multiple KawaiiPhysics nodes share a single set of collision shapes. They can even be shared across different SkeletalMeshComponents on the same Actor, or across AnimInstances on ChildActors.

## The Problem It Solves

Previously, each node had to own its own `SphericalLimit` / `CapsuleLimit` / `BoxLimit` / `PlanarLimit`. This made it impossible to, for example, have "the collision shapes computed by the character body (hair, chest, etc.)" be referenced by "the physics node of a costume skirt".

With Shared Collision, you can centralize collision across multiple meshes, reducing duplicated setup and manual synchronization.

![Shared Collision sharing concept](/img/generated/shared-collision-concept.svg)

*The body mesh (Source) publishes its computed collision through the shared subsystem, and the costume mesh (Target) reads it using the same GroupTag. (Diagram labels are in Japanese.)*

## How It Works (Source / Target)

Shared Collision uses a Publisher/Subscriber model. Each node is either a **Source (publisher)** or a **Target (subscriber)**, grouped by `SharedCollisionGroupTag`.

```
[Source node]
  Publishes its computed collision in world space
        ↓  (same group tag)
[Target node]
  Reads the published collision and uses it in its own simulation space
```

Source and Target are shared using the top-most Actor in the attach hierarchy (the Actor family) as the key, so collision can be shared parent→child, child→parent, or between different AnimInstances on the same Actor.

## Setup

Configure these under the `Limits > Shared Collision` category.

### bSharedCollisionSource

**Publish Collision** - Provides this node's collision to KawaiiPhysics nodes in the same attached Actor/ChildActor family (acts as a Source).

| Property | Value |
|----------|-------|
| Type | bool |
| Default | false |
| Category | Limits&#124;Shared Collision |

### bUseSharedCollision

**Use Shared Collision** - Uses collision published by Source nodes in the same family (acts as a Target). Can only be set when `bSharedCollisionSource` is disabled (Source and Target are mutually exclusive).

| Property | Value |
|----------|-------|
| Type | bool |
| Default | false |
| Edit Condition | `!bSharedCollisionSource` |
| Category | Limits&#124;Shared Collision |

### SharedCollisionGroupTag

**Group Tag** - A GameplayTag that identifies the shared collision group. Both the Source and Target in the same family use the same tag.

| Property | Value |
|----------|-------|
| Type | FGameplayTag |
| Edit Condition | `bSharedCollisionSource &#124;&#124; bUseSharedCollision` |
| Category | Limits&#124;Shared Collision |

## Note on Evaluation Order

:::warning
If you want to use the same-frame result within one AnimGraph, place the **Source node so it evaluates before the Target node**.

If the Target evaluates first, or across different AnimInstances, the Target may read the previous frame's collision data (one-frame latency) depending on tick/evaluation order. This is usually not a problem, but keep evaluation order in mind when exact synchronization is required.
:::

:::note Under the Hood
The shared data is managed by `UKawaiiPhysicsSharedCollisionSubsystem` (a World-scoped subsystem) keyed by `(Actor family root, group tag)`. The Source publishes in world space via a lock-free double buffer, and the Target merges all Sources in the same group at read time, converting them into its own simulation space. Initialization happens on the GameThread (PreUpdate), so it is safe under parallel worker-thread evaluation.
:::

## CVar Tuning

You can tune behavior with console variables (prefix `a.AnimNode.KawaiiPhysics.SharedCollision.`).

| CVar | Default | Meaning |
|------|---------|---------|
| `ReadMaxAge` | 10 (frames) | Published data older than this is ignored on read. Set this to account for skips from URO / LOD. |
| `CleanupMaxAge` | 60 (frames) | Grace period before an unused slot is physically removed. |
| `InitRetryThreshold` | 60 (times) | Number of Target init retries before a warning log is emitted. |
| `CleanupInterval` | 1.0 (sec) | Interval at which cleanup runs. |

:::tip
When URO (Update Rate Optimization) or LOD thins out evaluation, the Source publishes less frequently. Increase `ReadMaxAge` to keep using recent data while evaluation is thinned out.
:::

## Blueprint Control

You can switch Source / Target / group tag at runtime (changes are safely re-initialized on the next frame).

| Function | Description |
|----------|-------------|
| `Set/Get Shared Collision Source` | Whether this node is a Source |
| `Set/Get Use Shared Collision` | Whether this node is a Target |
| `Set/Get Shared Collision Group Tag` | Get/set the group tag |

For details, see [KawaiiPhysics Library](/docs/api/kawaiiphysics-library).

## Sample

The sample project includes a Source / Target demo under `Content/KawaiiPhysicsSample/Samples/4-Advanced/4-9/`.

## Related Pages

- [Collision Setup](/docs/features/collision-setup)
- [Collision Parameters](/docs/parameters/collision)
- [Data Assets](/docs/features/data-assets)
