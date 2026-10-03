---
title: "Settings Multiplier"
description: "Apply temporary multipliers to KawaiiPhysics settings without overwriting the base values."
---

import LegacyReference from '@site/src/components/LegacyReference';

# Settings Multiplier

:::warning Not officially released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

## Overview {#artist-entry}

Suppose the hair already looks right while walking, but you want a weaker pull toward its original shape at a landing. Directly changing the base physics settings also requires keeping the normal values and restoring them when the event ends.

A temporary settings multiplier scales the settings for that moment without overwriting the originals. It helps artists and technical artists add landing, action, or Sequencer changes after establishing the baseline hair or clothing motion.

## Settings Fields and Boundary Conditions {#details-fields}

Every `FKawaiiPhysicsSettingsMultiplier` field defaults to 1 and accepts non-negative values. It scales effective bone settings without rewriting the base.

| Field | Meaning and boundary conditions |
|---|---|
| WorldDampingLocation / Rotation | Reflection uses `1 - value`; scales below 1 reflect more movement/rotation |
| Radius | Zero effectively disables world collision sweep/push-out. Dummy density uses the base radius, so scales below 1 may leave coverage gaps |
| LimitAngle | Base 0 remains unlimited. A positive base with scale 0 is clamped to a tiny positive value, not unlimited |

## Using Settings Multiplier (Pulse) {#artist-setup}

The following example temporarily changes Stiffness.

1. Open the Animation Sequence and select the event time, such as a landing.
2. Add `KawaiiPhysics: Settings Multiplier (Pulse)` on the Notify track.
3. Set `Stiffness` in `SettingsScale` to 0.5. Leave the other scales at 1.
4. Set Duration to 1 s. Duration includes entry and exit; zero or negative values do not start an effect.
5. Play and compare before, during, and after the effect.

Use [NotifyState](/docs/features/animnotify#new-notifies-state) for an action interval. To adjust it in Sequencer, use [Kawaii Physics Settings Multiplier](/docs/features/sequencer).

## Lifetime, Capacity, and Stale Handles {#details-lifecycle}

- Timed and driven entries share a maximum of eight per node. The oldest is evicted above the cap.
- Node reinitialization and Blueprint recompilation discard entries. Stopping a stale handle is a no-op.
- `IsTransientHandleSet` checks only that an ID is set, not effect survival.
- Timed effects advance by animation DeltaTime. URO/LOD evaluation pauses extend real-time duration.

## Blueprint and C++ Control {#programmer-details}

Blueprint control requires component targeting and stop-handle management. The [transient-effect APIs](/docs/api/transient-effects#settings-blueprint) covers functions, the eight-entry cap, reinitialization, C++ continuous updates, and threading requirements.

[Properties Reference](/docs/features/settings-multipliers#details-fields)

## Related UE documentation {#ue-docs}

- [Animation Notifies](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-notifies-in-unreal-engine) — Review Notify placement and playback conditions for the Pulse example. (UE 5.8)

<LegacyReference redirect targets={{"result": "/en/docs/features/settings-multipliers#artist-setup", "tuning": "/en/docs/features/settings-multipliers#artist-setup", "common-pitfalls": "/en/docs/features/settings-multipliers#artist-setup", "details-result-details": "/en/docs/features/settings-multipliers#artist-setup", "prerequisites": "/en/docs/features/settings-multipliers#artist-setup"}} to="/en/docs/features/settings-multipliers#artist-setup" label="Usage" />
