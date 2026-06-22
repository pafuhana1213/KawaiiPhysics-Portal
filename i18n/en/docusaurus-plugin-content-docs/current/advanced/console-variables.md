---
sidebar_position: 6
title: "Console Commands / Variables"
---

# Console Commands / Variables

A reference of the console variables (CVars) provided by KawaiiPhysics, plus the stat commands useful for debugging. All CVars share the `a.AnimNode.KawaiiPhysics.` prefix and are used to tune runtime behavior or toggle debug visualization.

:::note
KawaiiPhysics does not register any function-style "console commands". Everything is a console **variable** (a value you read or write). For profiling, use UE's standard `stat` commands.
:::

## Usage

Console variables can be set in any of the following ways.

```bash
# Editor / in-game console (open with @ or ~)
a.AnimNode.KawaiiPhysics.Debug 1

# Check the current value (omit the value to print the current value and help)
a.AnimNode.KawaiiPhysics.Debug
```

To fix a value at startup, add it to `DefaultEngine.ini`.

```ini
[ConsoleVariables]
a.AnimNode.KawaiiPhysics.SharedCollision.ReadMaxAge=15
```

You can also pass it from the command line.

```bash
YourGame.exe -ExecCmds="a.AnimNode.KawaiiPhysics.Debug 1"
```

## Debug CVars

:::warning Build configuration
The three CVars below are only registered in builds where `ENABLE_ANIM_DEBUG` is on (Editor / Development / DebugGame). **They do not exist in Shipping / Test builds.**
:::

| CVar | Type | Default | Description |
|------|------|---------|-------------|
| `a.AnimNode.KawaiiPhysics.Enable` | bool | `true` | Enable / disable KawaiiPhysics. Set to `0` to stop simulation on all KawaiiPhysics nodes |
| `a.AnimNode.KawaiiPhysics.Debug` | bool | `false` | Enable visual debug drawing for bone chains, external forces, and more |
| `a.AnimNode.KawaiiPhysics.DebugDrawThickness` | float | `1.0` | Override the debug draw line thickness. Values `<= 0` fall back to the per-call thickness |

```bash
# Pause the simulation to compare against the source animation
a.AnimNode.KawaiiPhysics.Enable 0

# Enable debug drawing and thicken the lines for readability
a.AnimNode.KawaiiPhysics.Debug 1
a.AnimNode.KawaiiPhysics.DebugDrawThickness 2.0
```

:::tip
Debug drawing can be filtered by GameplayTag. See [Debugging](/docs/advanced/debugging#gameplaytag-filtering) for details.
:::

## Initialization CVars

| CVar | Type | Default | Description |
|------|------|---------|-------------|
| `a.AnimNode.KawaiiPhysics.UseBoneContainerRefSkeletonWhenInit` | bool | `true` | Selects which RefSkeleton `InitModifyBones` reads from. `true` uses the BoneContainer's RefSkeleton (fix for [Issue #174](https://github.com/pafuhana1213/KawaiiPhysics/issues/174)). Set to `false` to revert to the previous behavior |

## Shared Collision CVars

These tune the freshness management and cleanup behavior of the [Shared Collision](/docs/features/shared-collision) shared data. The prefix is `a.AnimNode.KawaiiPhysics.SharedCollision.`.

| CVar | Type | Default | Description |
|------|------|---------|-------------|
| `a.AnimNode.KawaiiPhysics.SharedCollision.ReadMaxAge` | int32 | `10` | Max frame age for the `ReadMerged` freshness check. Published data older than this is ignored. Set it high enough to account for URO / LOD skips |
| `a.AnimNode.KawaiiPhysics.SharedCollision.CleanupMaxAge` | int32 | `60` | Grace period in frames before expired slots are removed during Tick cleanup |
| `a.AnimNode.KawaiiPhysics.SharedCollision.InitRetryThreshold` | int32 | `60` | Number of Target init retries before a warning is logged |
| `a.AnimNode.KawaiiPhysics.SharedCollision.CleanupInterval` | float | `1.0` | Interval in seconds at which cleanup runs |

:::tip
When evaluation is throttled by URO (Update Rate Optimization) or LOD, the Source publishes less frequently. If you want to keep using the most recent data while throttled, raise `ReadMaxAge`.
:::

## Stat Commands

Use UE's standard `stat` commands to profile KawaiiPhysics.

```bash
# KawaiiPhysics-specific stat group
stat KawaiiPhysics

# General animation stats (KawaiiPhysics is also part of STATGROUP_Anim)
stat Anim
```

`stat KawaiiPhysics` breaks down simulation time, collision processing, bone counts, and more. For detailed performance investigation, see [Performance Optimization](/docs/advanced/performance).

## Source Code

The CVars are defined in the following files.

- [`AnimNode_KawaiiPhysics.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysics.cpp) — all CVar definitions
- [`AnimNode_KawaiiPhysics.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNode_KawaiiPhysics.h) — debug CVar declarations
