---
sidebar_position: 8
title: "AnimNotify"
---

import DocFigure from '@site/src/components/DocFigure';
import LegacyReference from '@site/src/components/LegacyReference';

# AnimNotify

:::tip Version Info
Added in v1.17.0
:::

Use AnimNotify to control KawaiiPhysics external forces and Alpha during animations.

## Overview

KawaiiPhysics v1.21 and earlier provide these three types of AnimNotify:

| Class | Type | Purpose |
|-------|------|---------|
| UAnimNotify_KawaiiPhysicsAddExternalForce | Notify | Add force instantly |
| UAnimNotifyState_KawaiiPhysicsAddExternalForce | NotifyState | Apply force during interval |
| UAnimNotifyState_KawaiiPhysicsSetAlpha | NotifyState | Override Alpha during interval |

The three types above are available in v1.21 and earlier. Additional multiplier and gust Notifies are covered in the [planned-v1.22 section below](#settings-multiplier-notifies).

[View Source](https://github.com/pafuhana1213/KawaiiPhysics/tree/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNotifies)

## AnimNotify vs AnimNotifyState

- **AnimNotify**: Triggers on a single frame. Use for instant impacts
- **AnimNotifyState**: Operates during start-to-end interval. Use for continuous effects

![AnimNotifyState External Force](/img/features/animnotify-externalforce.webp)

*External force application via AnimNotifyState*

---

## AnimNotify_KawaiiPhysicsAddExternalForce

AnimNotify that adds external force instantly.

### Parameters

| Parameter | Type | Category | Description |
|-----------|------|----------|-------------|
| AdditionalExternalForces | TArray\<FInstancedStruct\> | ExternalForce | Array of forces to add |
| FilterTags | FGameplayTagContainer | ExternalForce | Tags to filter application targets |
| bFilterExactMatch | bool | ExternalForce | Whether to filter by exact tag match |

### Use Cases

- Impact on jump landing
- Recoil on attack hit
- Instant wind or explosion

### Setup Steps

1. Open Animation Sequence
2. Right-click on Notifies track → **Add Notify** → **KawaiiPhysics Add External Force**
3. Add force presets to **AdditionalExternalForces**
4. Configure **FilterTags** as needed

---

## AnimNotifyState_KawaiiPhysicsAddExternalForce

AnimNotifyState that applies external force during the interval. Adds force at notify start and automatically removes it at end.

### Parameters

| Parameter | Type | Category | Description |
|-----------|------|----------|-------------|
| AdditionalExternalForces | TArray\<FInstancedStruct\> | ExternalForce | Array of forces to add |
| FilterTags | FGameplayTagContainer | ExternalForce | Tags to filter application targets |
| bFilterExactMatch | bool | ExternalForce | Whether to filter by exact tag match |

### Use Cases

- Hair flowing during dash
- Special effects during skill activation
- Continuous environmental forces

### Setup Steps

1. Open Animation Sequence
2. Right-click on Notifies track → **Add Notify State** → **KawaiiPhysics Add External Force**
3. Drag to set application interval
4. Add force presets to **AdditionalExternalForces**

---

## AnimNotifyState_KawaiiPhysicsSetAlpha

AnimNotifyState that overrides KawaiiPhysics node's Alpha during the interval. Adjust KawaiiPhysics intensity using animation curve values.

### Parameters

#### Alpha Settings

| Parameter | Type | Category | Default | Description |
|-----------|------|----------|---------|-------------|
| Source | EKawaiiPhysicsSetAlphaSource | Alpha | Curve | Alpha source type |
| CurveName | FName | Alpha | - | Curve name when Source=Curve |
| DefaultAlphaIfNoCurve | float | Alpha | 1.0 | Fallback value when curve unavailable (0.0-1.0) |
| ConstantAlpha | float | Alpha | 1.0 | Constant value when Source=Constant (0.0-1.0) |

#### Filter Settings

| Parameter | Type | Category | Default | Description |
|-----------|------|----------|---------|-------------|
| FilterTags | FGameplayTagContainer | Filter | - | Filter target nodes by tags |
| bFilterExactMatch | bool | Filter | false | Whether to filter by exact tag match |

### Alpha Source (EKawaiiPhysicsSetAlphaSource)

| Value | Description |
|-------|-------------|
| Curve | Use animation float curve |
| Constant | Use constant value |

### Use Cases

- Reduce physics during specific motions
- Vary physics influence with animation
- Physics control during cutscenes

### Using Curves

1. Add a float curve to Animation Sequence
2. Set curve name (e.g., `KawaiiPhysicsAlpha`)
3. Set the same name in AnimNotifyState's **CurveName**
4. Control Alpha value (0.0-1.0) with the curve

```
// Curve example
Time 0.0: Alpha = 1.0 (full physics)
Time 0.5: Alpha = 0.0 (physics off)
Time 1.0: Alpha = 1.0 (full physics)
```

:::warning Warning When CurveName Is Not Set
If **Source = Curve** but **CurveName** is left unset (None), a warning is shown in the Message Log (Asset Check) during editor asset validation (e.g., when saving or loading the Animation Sequence).

```
AnimNotifyState(KawaiiPhysics_SetAlpha) CurveName is empty in <asset path>
```

Always set **CurveName** when using curve-based control. Note that if CurveName is set but the curve value cannot be retrieved (e.g., the animation does not contain a curve with that name), no warning is shown and **DefaultAlphaIfNoCurve** is used instead.
:::

### Using Constant Value

```cpp
// Set physics to 50% during interval
Source = EKawaiiPhysicsSetAlphaSource::Constant;
ConstantAlpha = 0.5f;
```

---

## GameplayTag Filtering

The external-force and Alpha Notifies above support node filtering by GameplayTag. The planned-v1.22 Trigger Gust uses different tags for Nodes and Shared Publisher targets.

### Setup

1. Set **KawaiiPhysicsTag** on KawaiiPhysics node

```cpp
// In Animation Blueprint's KawaiiPhysics node
KawaiiPhysicsTag = FGameplayTag::RequestGameplayTag("KawaiiPhysics.Hair");
```

2. Set target tags in AnimNotify's **FilterTags**
3. Specify match condition with **bFilterExactMatch**

### Filter Behavior

| bFilterExactMatch | Behavior |
|-------------------|----------|
| false | Matches specified tag and its children (parent tags also allowed) |
| true | Exact match only |

### Example: Distinguishing Multiple KawaiiPhysics Nodes

```
// GameplayTag hierarchy
KawaiiPhysics
├── Hair
│   ├── Front
│   └── Back
├── Skirt
└── Cape
```

```cpp
// Apply force to Hair only
FilterTags.AddTag("KawaiiPhysics.Hair");
bFilterExactMatch = false; // Hair.Front, Hair.Back also targeted

// Apply force to Hair.Front only
FilterTags.AddTag("KawaiiPhysics.Hair.Front");
bFilterExactMatch = true; // Exact match only
```

---

## Best Practices

### 1. NotifyState Interval Settings

- Align start/end with natural animation breaks
- Use Alpha curve near start/end to avoid abrupt changes

### 2. Performance Considerations

- Avoid triggering many AnimNotifies simultaneously
- Keep complex force calculations minimal

### 3. Debugging

- Set `bDrawDebug = true` on force presets to visualize vectors
- Verify behavior in Animation Editor preview

---

## Settings Multiplier / Trigger Gust (planned for v1.22) {#settings-multiplier-notifies}

:::warning Not officially released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

### Overview {#new-notifies-when-to-use}

You may want softer hair at a landing or looser clothing during an attack. If timing is driven only by gameplay events, revising the animation also requires adjusting when those calls occur.

The new Notifies record multiplier or gust timing on the animation. They help artists adjust the event time or interval. Use these alongside the existing external-force and Alpha Notifies described above.

### Notify Types {#new-notifies-choose}

| Goal | Type |
|---|---|
| Change motion for a duration after an event | `KawaiiPhysics: Settings Multiplier (Pulse)` |
| Apply multipliers during an action interval | NotifyState `KawaiiPhysics: Settings Multiplier` |
| Trigger a gust with the animation | `KawaiiPhysics: Trigger Gust` |

### Adding Settings Multiplier (Pulse) {#new-notifies-artist-setup}

1. Open the Animation Sequence.
2. Select the time when the effect should begin.
3. Add `KawaiiPhysics: Settings Multiplier (Pulse)` on the Notify track (the following setting is an example).
4. Set Stiffness in `SettingsScale` to 0.5; leave other scales at 1.
5. Play and compare motion before and after the Notify.

### Settings Multiplier (Pulse) {#new-notifies-pulse}

Duration includes both fades. Zero or negative Duration does nothing. Pulse does not keep a stop handle; use NotifyState or an API for an event requiring early release.

### Settings Multiplier NotifyState {#new-notifies-state}

NotifyState applies `SettingsScale` over its interval. `Curve` uses the animation curve named by `CurveName` as weight.

Envelope accumulates NotifyTick `FrameDeltaTime`. It may drift from the interval with changed PlayRate, reverse playback, or scrubbing. Use Curve when the weight must follow animation time under those conditions. Missing curves default to weight 1, so check the curve name.

When a Montage is interrupted, or Curve mode ends, the current weight fades out over `BlendOutTime`. Check that interrupted playback returns as intended too.

### Trigger Gust {#new-notifies-trigger-gust}

Add an enabled Procedural Wind to the target node's External Forces. Leaving Gust Direction at zero inherits direction and related settings from that wind.

Add `KawaiiPhysics: Trigger Gust` to the Notify track, set `Strength`, `RiseTime`, `HoldTime`, and `DecayTime`, then play the animation. `Strength` defaults to 0, which produces no gust.

For this mesh, use `Gust Target=Kawaii Physics Nodes`. To send to hair and clothing together, prepare a [Kawaii Physics Shared Publisher](/docs/features/shared-publisher), select `Shared Publisher`, and match `SharedPublisherTag`. Filter Tags and Gust Direction are not used in that mode.

[Property and playback contracts](/docs/api/animation-notifies)

<span id="new-notifies-check" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"new-notifies-check": "/en/docs/features/animnotify#new-notifies-trigger-gust"}} to="/en/docs/features/animnotify#new-notifies-trigger-gust" label="Related specifications and usage" />

## Related Pages

- [External Force Presets](/docs/features/external-force-presets) - External force preset details
- [External Forces Parameters](/docs/parameters/external-forces) - AnimNode external force parameters
- [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library) - Blueprint API

<LegacyReference targets={{"programmer-details": "/en/docs/api/animation-notifies#programmer-details"}} to="/en/docs/api/animation-notifies" label="Read the detailed Notify reference" />

<LegacyReference targets={{"new-notifies-references": "/en/docs/features/animnotify#ue-docs"}} to="/en/docs/features/animnotify#ue-docs" label="Read Related Documentation" />

## Related UE documentation {#ue-docs}

- [Animation Notifies](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-notifies-in-unreal-engine) — Review Notify tracks, NotifyState intervals, and event firing conditions. (UE 5.8)

<LegacyReference redirect targets={{"new-notifies-result": "/en/docs/features/animnotify#new-notifies-artist-setup", "new-notifies-tuning": "/en/docs/features/animnotify#new-notifies-artist-setup", "new-notifies-common-pitfalls": "/en/docs/features/animnotify#new-notifies-artist-setup", "new-notifies-prerequisites": "/en/docs/features/animnotify#new-notifies-artist-setup"}} to="/en/docs/features/animnotify#new-notifies-artist-setup" label="Usage" />
