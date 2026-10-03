---
title: "Procedural Wind"
description: "Shape wind motion, add short gusts, and reuse wind presets for scenes."
---

import LegacyReference from '@site/src/components/LegacyReference';

import DocFigure from '@site/src/components/DocFigure';

# Procedural Wind

:::warning Not Officially Released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

## Overview {#when-to-use}

Hair and clothing drifting in a constant direction can look repetitive on an outdoor character. You may want to tune the timing of stronger and weaker wind as well as its direction.

Procedural Wind combines steady force with periodic changes, phase changes toward the tips, and random variation. Start with steady wind, then add the changes the scene needs. This makes it easier to see which setting changed the appearance.

<DocFigure src="/img/generated/artist-wind-flat-transparent.png" alt="Clothing before wind, then flowing with the blue arrows" caption="AI-generated concept of clothing drifting with wind. It is not a measured motion trajectory." maxWidth={420} />

## Usage {#basic-setup}

1. Add an entry to the node's `External Forces`.
2. Set its type to `Procedural Wind`.
3. Raise `Constant Force` a little above 0.
4. Play the level.

### Display Modes and Settings {#details-more-wind-settings}

`Parameter Mode` shows the main settings in `Simple` and every setting in `Advanced`. Values hidden in Simple mode still contribute to the calculation.

## Wind Settings {#tuning}

| Change you want | First settings to tune |
|---|---|
| Direction or steady strength | `Wind Direction`, `Constant Force` |
| Periodically stronger and weaker wind | `Sway Force` and `Sway Period` in Advanced mode |
| A delay from roots toward tips | `Ripple Force`, `Ripple Tip Phase Delay` |
| Less regular variation | `Random Force`, direction noise |

### Wind Components and Composition {#details-wind-components}

| Component | Purpose |
|-----------|---------|
| Constant | Wind with a constant strength |
| Sway | A wave that moves all bones in the same phase |
| Ripple | A wave that travels from root to tip |
| Strength Cycle | Periodic multiplier applied to Constant, Sway, and Ripple |
| Random | Smooth noise that varies wind strength |
| Gust | A gust triggered through the API |

The components are combined as follows.

```text
Total = (Constant + Sway + Ripple) * StrengthCycle + Random + Gust
```

`Ripple Tip Phase Delay` controls the phase delay at the tip. At 0 there is no wave propagation; negative values reverse propagation from tip to root. `Wind Direction Noise Angle` and `Wind Direction Noise Period` also vary the direction itself.

## Procedural Wind Gust / Transient External Force {#transient-forces}

When an event needs stronger wind, editing ordinary wind values also means managing when to restore them. A Gust adds a short wind with specified rise, hold, and decay. For animation timing, put its trigger on a Notify track.

1. Open the Animation Sequence.
2. Move to the point where the gust should start.
3. Add `KawaiiPhysics: Trigger Gust` to its Notify track.
4. Raise `Strength` a little above 0 and set a positive total time, for example `RiseTime=0.2` s and `DecayTime=0.5` s. All three times default to 0.
5. Play the animation.

<DocFigure src="/img/generated/artist-gust-envelope-en.svg" alt="Gust rise, hold, decay, and total time" caption="Concept: a gust rises, holds, then fades." maxWidth={420} />

Check for stronger wind at that point followed by a fade. The Notify's total time is `RiseTime + HoldTime + DecayTime`. For gameplay events that need early cancellation, a programmer can manage stopping with a handle-based API.

Progress depends on animation evaluation. Check conditions where LOD or URO stops evaluation. The [transient-force reference](/docs/api/transient-effects#wind-programmer-details) covers lifetimes, the 8-entry limit, and unsupported reference types.

## Wind Preset Data Asset {#wind-presets}

Re-entering wind values for another outfit or scene takes time and makes comparison harder. Saving wind presets lets you choose previously tuned values. Keep this separate from the whole-node [UKawaiiPhysicsPresetDataAsset](/docs/features/settings-presets).

1. Select the target Kawaii Physics node.
2. Open `Wind Scope` in Details.
3. Choose the target Procedural Wind under `Force`.
4. Open `Presets`.
5. Select `Breeze`.

Wind direction remains on the target. See [wind preset APIs](/docs/api/transient-effects#wind-wind-preset-and-dynamic-parameter-details) for the eleven saved fields and runtime application conditions.

To save custom wind, assign a `Wind Preset Data Asset` (`WindScopePresetDataAsset`) under `Project Settings > Plugins > Kawaii Physics > Wind Scope`, then use `Save as Preset > Add New Preset` in Wind Scope. Saving is unavailable with only built-in presets.

Wind Scope application modifies the ABP and also sets `Enabled=true` and `TimeScale=1`, whereas runtime application preserves these two fields. See [Wind Scope](/docs/features/wind-scope#details-presets) for saving and overwriting.

## Local, Shared, and Auto {#details-shared-wind}

The `Shared` and `Auto` wind sources use a **Kawaii Physics Shared Publisher** in the same Actor family. Match `Shared Wind Tag` to the publisher's `Shared Group Tag`.

- `Shared` uses wind parameters from the publisher. While the publisher is absent, it keeps advancing locally.
- `Auto` uses Shared while a publisher exists and Local otherwise.
- Phase offsets, Seed, Time Scale, enabled state, bone filters, and space remain configured on each node during sharing.

`Seed` is shared by Random and direction noise. Matching values can reproduce those fluctuations, but edits during PIE take effect on the next play session. It does not guarantee identical simulation results across all environments.

For programmatic updates to shared parameters or gusts, see [Shared Publisher runtime control](/docs/api/transient-effects#publisher-runtime-control).

## Related UE documentation {#ue-docs}

- [Animation Notifies](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-notifies-in-unreal-engine) — Review Notify tracks, NotifyState intervals, and event firing conditions. (UE 5.8)
- [Data Assets](https://dev.epicgames.com/documentation/en-us/unreal-engine/data-assets-in-unreal-engine) — Review data stored in assets and instances of existing Data Asset classes. (UE 5.8)

<span id="shared-wind" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"shared-wind": "/en/docs/features/procedural-wind#details-shared-wind"}} to="/en/docs/features/procedural-wind#details-shared-wind" label="Related specifications and usage" />
