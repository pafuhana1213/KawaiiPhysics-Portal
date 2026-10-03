---
sidebar_position: 1
slug: /preview
title: "v1.22 Preview (In Development)"
description: "Experimental documentation for unreleased features planned for KawaiiPhysics v1.22."
---

import LegacyReference from '@site/src/components/LegacyReference';

# v1.22 Preview (In Development)

:::warning Not Officially Released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

These experimental pages introduce features planned for v1.22 based on the development implementation. They are separate from the features available when installing the official v1.21 release.

## Feature Usage Examples {#artist-start}

- **Collision with walls and furniture**: [Simple World Collision](/docs/features/simple-world-collision)
- **Wind cycles and fluctuations**: [Procedural Wind](/docs/features/procedural-wind)
- **Common wind and nearby collision across meshes**: [Kawaii Physics Shared Publisher](/docs/features/shared-publisher)
- **Control at animation times and intervals**: [Notifies](/docs/features/animnotify#settings-multiplier-notifies)
- **Control within a Level Sequence**: [Kawaii Physics Settings Multiplier](/docs/features/sequencer)

## Feature Index {#topics}

| # | Topic | Goal |
|---|---|---|
| 1 | [Kawaii Physics Shared Publisher](/docs/features/shared-publisher) | Share wind and nearby collision across hair, clothing, and equipment |
| 2 | [Settings Multiplier](/docs/features/settings-multipliers) | Change stiffness or other settings only during an action |
| 3 | [Settings Multiplier / Trigger Gust](/docs/features/animnotify#settings-multiplier-notifies) | Place changes and gusts at animation times or intervals |
| 4 | [Kawaii Physics Settings Multiplier](/docs/features/sequencer) | Keyframe motion changes in Sequencer |
| 5 | [Mirror Data Table for Collision](/docs/features/collision-mirroring) | Duplicate collision shapes to matching bones on the other side |
| 6 | [UKawaiiPhysicsLibrary](/docs/api/runtime-properties) | Change settings or forces from gameplay events |
| 7 | [GetRuntimeNodeInfosOnComponent](/docs/api/runtime-diagnostics) | Compare configured and evaluated values to diagnose issues |
| 8 | [KawaiiPhysicsToolset](/docs/api/mcp) | Ask an AI assistant to create ABPs, tune settings, and query diagnostics |
| 9 | [Feature Samples](/docs/getting-started/feature-samples) | Find an implementation example for a particular goal |
| 10 | [Tapered Capsule Collision](/docs/features/collision-setup#tapered-capsule) | Fit a collider to a part with different endpoint widths |
| 11 | [IKawaiiPhysicsGroundProvider](/docs/features/simple-world-collision#ground-provider) | Reuse floor data from custom movement |
| 12 | [Procedural Wind Gust / Transient External Force](/docs/features/procedural-wind#transient-forces) | Add brief wind or forces for an event |
| 13 | [Wind Preset Data Asset](/docs/features/procedural-wind#wind-presets) | Save and reuse a tuned wind |
| 14 | [Wind Scope](/docs/features/wind-scope) | Compare settings while inspecting wind waveforms |
| 15 | [Check Preset Diff](/docs/features/settings-presets#preset-diff) | Find differences between a saved preset and current values |
| 16 | [UKawaiiPhysicsEditorLibrary](/docs/api/editor-library) | Edit and compare nodes through editor tools |
| 17 | [Kawaii Node Audit](/docs/features/node-audit) | Inspect settings throughout an AnimBP |

This index lists the documented features. It does not cover all v1.22 changes or final release contents. The samples and API guides also explain existing functionality where needed.

<LegacyReference targets={{"implementation-snapshot": "/en/docs/preview#official-release-documentation"}} to="/en/docs/preview#official-release-documentation" label="Read Related Documentation" />

## Official Release Documentation

- [Introduction and Supported Versions](/docs/)
- [Installation](/docs/getting-started/installation)
- [Changelog](/docs/changelog)

<span id="development-version" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"development-version": "/en/docs/preview#topics"}} to="/en/docs/preview#topics" label="Related specifications and usage" />
