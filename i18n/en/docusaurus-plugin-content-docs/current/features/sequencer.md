---
title: "Kawaii Physics Settings Multiplier"
description: "Keyframe KawaiiPhysics settings multipliers and their weight in Sequencer."
---

import LegacyReference from '@site/src/components/LegacyReference';

# Kawaii Physics Settings Multiplier

:::warning Not officially released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

## Overview {#when-to-use}

In Sequencer, tune separate intervals for settled hair during dialogue or more movement during action. Changing base physics settings directly requires managing the values for each interval and restoring them at the end.

The settings multiplier track records scale and applied weight in Sequencer while keeping the base settings. It helps artists tune shots after establishing the character's normal motion.

## Channels and Constraints {#details-channels}

The track records Damping, Stiffness, WorldDampingLocation, WorldDampingRotation, Radius, LimitAngle, and Weight. It does not directly change the whole node Alpha. See [Settings Multiplier](/docs/features/settings-multipliers#details-fields) for boundary conditions such as Radius and LimitAngle.

## Tracks and Targets {#details-targets}

Uses `UMovieSceneKawaiiPhysicsSettingsMultiplierTrack` and `UMovieSceneKawaiiPhysicsSettingsMultiplierSection` in the new KawaiiPhysicsSequencer module.

| Track | Targets and conditions |
|---|---|
| Kawaii Physics Settings Multiplier | Bound SkeletalMeshComponent, or SkeletalMeshComponents contained in a bound Actor |
| Kawaii Physics Settings Multiplier (All) | Scans the playback Game/PIE/Editor world. Filter Tags required; empty disables it |

Actor binding does not expand to the child-actor family. All scans reuse a 0.5 s cache, so spawn/destruction changes may not appear immediately.

## Creating a Section {#setup}

The following example changes Stiffness.

1. Open the Level Sequence with the target bound.
2. Add `Kawaii Physics Settings Multiplier` to that binding.
3. Set Stiffness scale to 0.5; leave the other scales at 1.
4. Set `Weight` to 1.
5. Play and compare before, during, and after the section.

A new section is one second long. Adjust its range to the intended interval in the Level Sequence.

## Ending and Restoration {#details-lifecycle}

Scrubbing outside the section, stopping, or deleting releases the effect; `BlendOutTimeOnEnd` controls release at the end. Sections use Restore State and cannot use Keep State. Time-based scale evaluation does not guarantee physics rewind or reproducibility.

## Stiff, Loose, and Freeze {#presets}

The section `Apply Preset` menu offers Stiff, Loose, and Freeze for an initial comparison. Freeze is a preset name for high damping and Stiffness, not simulation stop.

### Preset Values and Mutation Scope {#details-presets}

| Preset | Damping | Stiffness | Other four fields |
|---|---:|---:|---:|
| Stiff | 1.5 | 2.0 | 1 |
| Loose | 0.7 | 0.5 | 1 |
| Freeze | 10 | 10 | 1 |

Reset Scale to 1.0 and Apply Preset remove every key in all six Scale channels. Weight, Filter Tags, and the end fade remain unchanged. Freeze is not a stop API.

## Section Labels {#details-programmer-details}

Labels show scales and tags. Live registry data adds `(N nodes)` or `(no match)`. An empty All filter shows `[Filter Tags required]`. N counts queued requests, not physics evaluation completed on that frame.

[Settings Multiplier](/docs/features/settings-multipliers) · [Animation Notifies](/docs/features/animnotify#settings-multiplier-notifies)


## Related UE documentation {#ue-docs}

- [Sequencer Editor](https://dev.epicgames.com/documentation/en-us/unreal-engine/sequencer-cinematic-editor-unreal-engine) — Review Level Sequences and timeline controls; the custom multiplier track is documented here. (UE 5.8)

<LegacyReference redirect targets={{"artist-entry": "/en/docs/features/sequencer#setup", "tuning": "/en/docs/features/sequencer#setup", "common-pitfalls": "/en/docs/features/sequencer#setup"}} to="/en/docs/features/sequencer#setup" label="Usage" />

<span id="prerequisites" hidden />
<span id="result" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"prerequisites": "/en/docs/features/sequencer#details-targets", "result": "/en/docs/features/sequencer#details-lifecycle"}} to="/en/docs/features/sequencer#details-targets" label="Related specifications and usage" />
