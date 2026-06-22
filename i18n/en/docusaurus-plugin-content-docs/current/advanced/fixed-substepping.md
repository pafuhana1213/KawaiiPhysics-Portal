---
sidebar_position: 5
title: "Fixed Substepping"
---

# Fixed Substepping

:::tip Version Info
Added in v1.21.0. **Enabled (ON) by default.**
:::

**Fixed Substepping** runs the entire simulation in fixed time-steps (`FixedDt = 1 / TargetFramerate`), stepping the solver as many times as needed per frame, to achieve stable physics that does not depend on the frame rate.

## The Problem It Solves

The legacy path integrated each frame directly with the actual `DeltaTime`, so **changing the frame rate changed the way bones sway, how they converge, and how much they sag** (e.g. the look does not match between 60 fps and 30 fps).

Integration error from gravity in particular is strongly affected by the frame rate, and normalizing damping alone could not resolve it. Fixed Substepping fundamentally solves this by running the whole solver at a fixed dt.

## Setup

This is a project-wide setting that you can change under **Project Settings > Plugins > Kawaii Physics**.

<!-- IMAGE_NEEDED: The Project Settings > Plugins > Kawaii Physics settings screen -->

### Use Fixed Substepping

**Enable fixed substepping** - Runs the entire simulation in fixed time-step substeps, eliminating frame-rate-dependent behavior.

| Property | Value |
|----------|-------|
| Type | bool |
| Default | true |
| Category | Simulation |

### Max Substeps

**Maximum number of substeps** - The maximum number of substeps per frame. This is an upper limit that prevents runaway behavior (spiral of death) during low fps or hitches; any time beyond this is discarded.

| Property | Value |
|----------|-------|
| Type | int32 |
| Default | 4 |
| Range | 1 - 16 |
| Category | Simulation |

## How It Works

The actual frame time `DeltaTime` is accumulated, and the solver is stepped as many times as needed at the fixed internal step `FixedDt` (the standard fixed-timestep accumulator pattern).

```
Accumulate the real time of the frame
    ↓
Split into FixedDt (= 1 / TargetFramerate) chunks
    ↓
Step the solver that many times (including collision, constraints, external forces)
    ↓
Carry the leftover time over to the next frame
```

- `FixedDt` is derived from each node's **`Target Framerate`** (default 60, `KawaiiPhysics` category).
- At low fps the substep count grows, so the **CPU cost increases** (up to `Max Substeps` times). Time beyond `Max Substeps` is discarded to prevent runaway after a hitch.
- At high fps (`DeltaTime < FixedDt`), a frame may run zero substeps and hold the previous state.

:::note Under the Hood
During substeps, the input animation pose target is interpolated with `Lerp` / `Slerp`, and wind/gravity/external forces are applied every substep. Wind scene queries are cached once per frame, preserving worker-thread safety.
:::

## Backward Compatibility

:::warning Behavior change in v1.21.0
Fixed Substepping is **enabled (ON) by default in v1.21.0**. As a result, the way bones sway may change slightly compared to previous versions (it becomes more stable).

If you need exactly the same behavior as previous versions, turn `Use Fixed Substepping` **OFF**. When OFF, it runs with the legacy single-step integration path.
:::

## Checking Performance

You can check the load from the increased substep count at low fps with console commands.

```bash
stat KawaiiPhysics
stat Anim
```

Setting `Target Framerate` higher than necessary increases the substep count and the load, so set a value appropriate for your target (60 in most cases).

## Related Pages

- [Performance Optimization](/docs/advanced/performance)
- [Physics Parameters](/docs/parameters/physics)
- [Debugging](/docs/advanced/debugging)
