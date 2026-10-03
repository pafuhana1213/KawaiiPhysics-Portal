---
title: "UKawaiiPhysicsLibrary — Transient Effects and Wind"
---

import DocFigure from '@site/src/components/DocFigure';

# UKawaiiPhysicsLibrary — Transient Effects and Wind

:::warning Not Officially Released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

Control temporary settings multipliers, gusts, wind parameters, and the Shared Publisher from Blueprint and C++. See [Settings Multiplier](/docs/features/settings-multipliers) and [Procedural Wind](/docs/features/procedural-wind) for effect setup.

## Blueprint Start and Stop {#settings-blueprint}

| Target | Start | Stop |
|---|---|---|
| Node reference | `StartPhysicsSettingsMultiplier` | `StopPhysicsSettingsMultiplier` |
| Component | `StartPhysicsSettingsMultiplierOnComponent` | `StopPhysicsSettingsMultiplierOnComponent` |

Save Start's `OutHandle` and Stop the same target/handle. Component forms collect main, linked, and post-process AnimInstances. Empty Filter Tags matches all; `bFilterExactMatch=false` permits parent tags. Their return values count nodes where requests were queued.

Duration includes both fades. Positive means a trapezoid, zero is a no-op, and negative holds until Stop. If Blend In + Out exceeds Duration, the fades scale proportionally. Negative Duration ignores Start's Blend Out and uses Stop's value for release.

Stop fades linearly from the current applied ratio to 0. Blend Out 0 releases immediately. Stopping the same still-pending handle replaces its release fade time.

## C++ Updates and Threading {#settings-cpp-driven}

`GenerateTransientHandle`, `PushPhysicsSettingsMultiplier`, and `PushPhysicsSettingsMultiplierOnComponent` are C++ only, not Blueprint-exposed. Update using one pre-generated handle and Stop when finished. Pushing an unset handle is a no-op; the node-reference form reports NotValid.

Push updates the same entry and returns a stopped/fading entry to external drive. The ordinary overload does not expire by time. The component overload with a lease fades after the specified number of evaluations without refresh. Repeated pushes to the same handle during URO/LOD pauses retain only the latest pending value.

AnimGraph BlueprintThreadSafe collection must target the caller's own component. Collect other objects on the GameThread while they are not being evaluated. Blueprint can hold using negative Start Duration, but arbitrary-Alpha Push updates are not exposed.

[Animation Notifies](/docs/features/animnotify#settings-multiplier-notifies) · [Kawaii Physics Settings Multiplier](/docs/features/sequencer) · [UKawaiiPhysicsLibrary](/docs/api/runtime-properties)

The effective scale is calculated as `Lerp(1, Scale, EnvelopeAlpha)`.

## APIs and Application Scope {#wind-programmer-details}

### Gust and Transient Force APIs {#wind-gust-and-transient-force-apis}

Use the handle-based APIs in `UKawaiiPhysicsLibrary` to add a short burst for a gameplay event. These are runtime-only transient forces; they do not append to the authored `External Forces` array.

| API | Purpose |
|-----|---------|
| `StartProceduralWindGust` | Start a gust on one node and obtain `OutHandle` |
| `StartProceduralWindGustOnComponent` | Start gusts on filtered component nodes, including linked / post-process instances |
| `AddTransientExternalForce` / `AddTransientExternalForceOnComponent` | Add a generic force struct with `LifetimeSeconds` |
| `StopTransientExternalForce` / `StopTransientExternalForceOnComponent` | Stop forces early using the stored handle |

`Strength` is the gust's peak strength. `Duration` includes rise, hold, and decay; hold is calculated as `max(0, Duration - RiseTime - DecayTime)`. A nonzero `GustDirection` specifies a world-space direction. A zero vector inherits direction, space, bone filters, and related settings from an authored Procedural Wind. On the node API, `ExternalForceIndex = -1` uses the first enabled Procedural Wind as the inheritance source.

When `RiseTime + DecayTime` exceeds `Duration`, both are scaled down proportionally. Specify a positive Duration. At zero or below, gust strength is zero, but the API may still accept the request and return a handle. Request acceptance does not establish a visible effect.

`bRealTimeEnvelope` defaults to true and sets the transient gust's `TimeScale` to 1. With false, the inherited wind's Time Scale affects progress. Both depend on animation evaluation: URO / LOD suspension can extend the elapsed real duration.

Stopping with `BlendOutTime` fades Procedural Wind linearly from its current value in wind time. A value of 0 removes it immediately. Generic transient forces do not use this fade; their lifetime is shortened instead.

Transient forces are capped at **8 per node**. Adding more evicts the oldest entry. Node re-initialization and BP recompile also remove them. `IsTransientHandleSet` only checks whether the ID is set; it does not prove the force still exists. Stopping a stale handle does nothing.

Generic transient forces do not receive `Initialize(Context)`. Forces containing live UObject references, such as `ExternalOwner` or curve assets, are rejected. Procedural Wind creates its runtime state in `PreApply`; do not assume every existing force type supports the same transient workflow.

Component APIs return the number of nodes where a request was queued. Empty `FilterTags` matches all nodes. In an AnimGraph evaluation context, operate on the caller's own component; operations on other objects belong on the GameThread while the target is not evaluating. See [UKawaiiPhysicsLibrary](/docs/api/runtime-properties) for the access contract and [AnimNotify / NotifyState](/docs/features/animnotify#settings-multiplier-notifies) for animation-triggered gusts.

### Wind Preset and Dynamic Parameter Details {#wind-wind-preset-and-dynamic-parameter-details}

A **KawaiiPhysics Wind Preset Data Asset** stores wind tuning values. Unlike the whole-node [UKawaiiPhysicsPresetDataAsset](/docs/features/settings-presets), it applies specifically to Procedural Wind. Each entry in `Presets` contains a `PresetName`, `PresetTag`, and wind values. Tags are matched exactly.

`ApplyProceduralWindPreset` targets a node reference and external-force index; `ApplyProceduralWindPresetOnComponent` targets wind entries in filtered component nodes. Changes are requested for the next `PreApply`. Pre-load the DataAsset and avoid editing or reloading it while simulation is running.

`ToDynamicParams()` updates these 11 fields:

- `ConstantForce`
- `SwayForce`, `SwayPeriod`
- `RippleForce`, `RipplePeriod`, `RippleTipPhaseDelay`
- `StrengthCycleRange`, `StrengthCyclePeriod`
- `RandomForce`, `RandomForcePeriod`
- `WindDirectionNoiseAngle`

It preserves `WindDirection`, enabled state, phase offsets, `TimeScale`, and `WindDirectionNoisePeriod`. Applying this preset also does not create a new external-force entry.

When no DataAsset is supplied, or its `Presets` array is empty, the built-in tags `KawaiiPhysics.WindPreset.Breeze` / `Strong` / `Storm` are available. A supplied asset with entries is searched exclusively; a missing tag does not fall back to the built-in presets. An invalid tag fails as well.

Use `FKawaiiProceduralWindDynamicParams` with `SetProceduralWindParameters` / `SetProceduralWindParametersOnComponent` for individual changes. Only fields with their corresponding `bOverride...` flag set to true are changed. To change constant wind only, set `bOverrideConstantForce` and `ConstantForce`, leaving other overrides false.

`GetProceduralWindParameters` includes pending updates issued earlier in the same frame and returns all overrides as true. You can edit and submit that snapshot, or create a new struct with only the intended overrides enabled. [Wind Scope](/docs/features/wind-scope) helps compare waveforms and presets.

[v1.22 Preview Overview](/docs/preview) · [Official Release External Force Presets](/docs/features/external-force-presets)

## Runtime Control {#publisher-runtime-control}

`UKawaiiPhysicsLibrary` provides `SetSharedPublisherEnabled`, `SetSimpleWorldCollisionSettingsOnSharedPublisher`, `SetProceduralWindParametersOnSharedPublisher`, shared gust start/stop operations, and `GetSharedPublisherDebugInfo`. Specify an Actor and group tag, and check the return value. Requests are processed on a subsequent publisher update rather than synchronously changing every consumer. Runtime overrides of Enabled and collision settings revert to node settings on reinitialization. Wind parameter updates modify the Shared Wind settings and remain after reinitialization.

See [UKawaiiPhysicsLibrary](/docs/api/runtime-properties) for related operations and [GetRuntimeNodeInfosOnComponent](/docs/api/runtime-diagnostics) for inspection data.

[v1.22 Preview Overview](/docs/preview)

The publisher also shares 13 wind parameters and active gust state. Use `SetProceduralWindParametersOnSharedPublisher` to update shared values, and `StartProceduralWindGustOnSharedPublisher` / `StopProceduralWindGustOnSharedPublisher` to start or stop a shared gust. These differ from handle-based APIs that add transient forces to individual nodes. See [Kawaii Physics Shared Publisher](/docs/features/shared-publisher) for targets and persistence.

## Related UE documentation {#ue-docs}

- [Gameplay Tags](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-gameplay-tags-in-unreal-engine) — Review the tag dictionary and hierarchy; consult each reference for KawaiiPhysics matching rules. (UE 5.8)

- [Animation Notifies](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-notifies-in-unreal-engine) — Review Notify tracks, NotifyState intervals, and event firing conditions. (UE 5.8)
- [Data Assets](https://dev.epicgames.com/documentation/en-us/unreal-engine/data-assets-in-unreal-engine) — Review data stored in assets and instances of existing Data Asset classes. (UE 5.8)
