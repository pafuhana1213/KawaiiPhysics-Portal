---
title: "AnimNotify Properties and Playback Reference"
readers: [Programmers, Technical Artists]
---

import DocFigure from '@site/src/components/DocFigure';

# AnimNotify Properties and Playback Reference

:::warning Not officially released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

This page describes Notify properties and playback contracts. See [animation Notifies](/docs/features/animnotify#settings-multiplier-notifies) for placement and artistic use.

## Pulse Properties {#pulse}

Class: `UAnimNotify_KawaiiPhysicsSettingsMultiplier`. Display name: `KawaiiPhysics: Settings Multiplier (Pulse)`. Track label: `KP: Settings Multiplier Pulse`.

| Property | Default and contract |
|---|---|
| SettingsScale | All six fields 1 |
| Duration | 1 s, including fades; zero or negative is a no-op |
| BlendInTime / BlendOutTime | 0.2 / 0.5 s |
| FilterTags / bFilterExactMatch | Empty matches all; exact matching false |

Pulse calls component Start but discards the handle. The API's negative-Duration indefinite hold is not allowed in Pulse.

## NotifyState Weight and Ending {#state}

Class: `UAnimNotifyState_KawaiiPhysicsSettingsMultiplier`. Display name: `KawaiiPhysics: Settings Multiplier`. SettingsScale and tag filtering are shared with Pulse.

| Property | Default and contract |
|---|---|
| WeightSource | Envelope |
| BlendInTime / BlendOutTime | 0.2 / 0.2 s |
| CurveName | None; animation curve read in Curve mode |
| DefaultWeightIfNoCurve | 1; weight is clamped to 0–1 |

Envelope builds a trapezoid from interval duration/fades and accumulates NotifyTick FrameDeltaTime. It may drift with PlayRate≠1, reverse playback, or scrubbing; use Curve to follow animation time. Early ending and Curve mode fade from the current NotifyEnd weight over BlendOutTime.

## Playback Instances and End Notification Tracking {#programmer-details}

UE5.8+ identifies Component + NotifyInstanceID. UE5.7 and earlier merge concurrent plays of the same event on a component through ActiveCount, retaining the effect until all Ends arrive.

State uses C++ Push with a four-evaluation refresh lease: missing updates fade the node-side effect. Remaining Notify bookkeeping is cleaned on the next Begin/End. The eight-entry cap and stale handles follow [Settings Multiplier Reference](/docs/features/settings-multipliers#details-lifecycle).

## Trigger Gust Targets and Timing {#trigger-gust}

Class: `UAnimNotify_KawaiiPhysicsTriggerGust`. Display name: `KawaiiPhysics: Trigger Gust`. Track label: `KP: Trigger Gust`.

| Property | Default and contract |
|---|---|
| Strength | 0 |
| RiseTime / HoldTime / DecayTime | All 0 s; Duration = Rise + Max(Hold,0) + Decay |
| GustDirection | Zero inherits direction/settings from authored Procedural Wind for Nodes; nonzero is world-space |
| FilterTags / bFilterExactMatch | Empty / false; Nodes target filtering |
| GustTarget | Nodes (displayed as Kawaii Physics Nodes) or SharedPublisher |
| SharedPublisherTag | KawaiiPhysics.Shared.Default |

Nodes calls `StartProceduralWindGustOnComponent`; SharedPublisher calls `StartProceduralWindGustOnSharedPublisher` with the owner Actor. SharedPublisher ignores Filter Tags and Gust Direction. Both use `bRealTimeEnvelope=false`, advancing in wind time. The Notify discards the stop handle. See [gusts and transient forces](/docs/features/procedural-wind#transient-forces) for stopping APIs and generic forces.

[Settings Multiplier](/docs/features/settings-multipliers) · [Kawaii Physics Settings Multiplier](/docs/features/sequencer)

## Related UE documentation {#ue-docs}

- [Animation Notifies](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-notifies-in-unreal-engine) — Review Notify tracks, NotifyState intervals, and event firing conditions. (UE 5.8)
