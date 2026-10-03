---
title: "Kawaii Physics Shared Publisher"
---

import LegacyReference from '@site/src/components/LegacyReference';

import SharedPublisherComparison from '@site/src/components/SharedPublisherComparison';

# Kawaii Physics Shared Publisher

:::warning Not Officially Released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

## Overview {#when-to-use}

When hair, clothing, and a cape use separate meshes, changing the wind on each node takes repeated work. Shared Publisher lets you set the common direction and strength once and pass them to each part.

<SharedPublisherComparison locale="en" />

It can also share Simple World Collision gathering settings and results for nearby walls and props.

## Sharing Scope and Publishing Conditions {#details-initial-requirements}

- Meshes must belong to the same Actor family, identified by following attachment parents, or parent Actors when no attachment parent exists, to a root.
- Provide an always-updated AnimGraph branch for the publisher.

Matching tags alone do not share across families. The [Shared Collision](/docs/features/shared-collision) available before v1.22 sends hand-authored shapes between nodes and has a different role.

## Setup Procedure {#details-initial-setup}

1. Place one publisher in the body mesh's Post Process AnimBP, or on an always-updated trunk immediately before Output Pose.
2. Set its `Shared Group Tag`. The default is `KawaiiPhysics.Shared.Default`. Use only one publisher per family and tag.
3. On collision consumers, enable `Use Simple World Collision`, select `Shared` or `Auto` for `Source`, and match `Shared Tag`.
4. Add Procedural Wind to wind consumers, select `Shared` or `Auto` for `Wind Source`, and match `Shared Wind Tag`.

Publishing happens during **Update**. A zero-weight branch or inactive state stops publishing even when the pose is connected. Publisher `Enabled` defaults to true. When false, it keeps its heartbeat and publishes a disabled state: no collision push-out and zero wind.

## Shared and Per-Node Settings {#tuning}

| Change you want | Where to tune it |
|---|---|
| Common wind direction and strength for hair and clothing | The publisher's `Shared Wind` |
| Softer hair or a heavier-looking cape | Each Kawaii Physics node's physics settings |
| A common gathering area and set of nearby collision targets | The publisher's `Simple World Collision` |

### Sharing Nearby Collision {#details-collision-sharing}

Configure the interval, Object Types, radius, convex handling, ground, and SkeletalMesh handling in the publisher's `Simple World Collision` settings. During sharing, corresponding consumer gather values are ignored. An `Auto` consumer uses its own values only when it falls back to Local.

| Publisher Setting | Default | Purpose |
|---|---|---|
| Enabled, inside Simple World Collision | true | Enable collision sharing independently |
| Gather Scope | ActorFamily | Combine bounds of all meshes participating in the same entry; SkeletalMeshComponent uses the publisher mesh bounds |
| Gather Interval | 0.2 seconds | Gather new targets; 0 gathers every frame |
| Object Types | Empty | Empty uses WorldStatic and WorldDynamic |
| Override Gather Radius / Gather Radius | false / 200 cm | Specify a radius instead of the automatic bounds range |
| Override Collision Channel / Collision Channel | false / Pawn | When disabled, use the owning mesh ObjectType to test Block responses |
| Gather Family Members | false | Gather participating meshes for mutual collision |
| Skeletal Mesh Collision | None | None, Bounding Box, or Physics Asset |

For mutual collision within the family, enable `Gather Family Members`, include `Pawn` in `Object Types`, and select a suitable `Skeletal Mesh Collision` mode. Each consumer excludes its own mesh shapes. Targets must also Block the query Collision Channel.

### Sharing Wind {#details-wind-sharing}

The publisher's `Shared Wind` distributes 13 fields from wind direction through `Random Force Period`, plus phase clocks and the active gust, `ActiveGust`. Phase Offset, Seed, Time Scale, Enabled, bone filters, and force space remain consumer settings. Changing only the consumer's shared parameters does not override the publisher during sharing.

With `Wind Preset Data Asset` and `Wind Preset Tag` set, initialization and reinitialization apply the selected preset to Shared Wind. Successful publisher application also sets Shared Wind's `Enabled=true` and `TimeScale=1`, alongside the eleven preset fields. This differs from the ordinary runtime wind preset API, which preserves those two values. See [wind presets](/docs/features/procedural-wind#wind-presets) for details. These are properties of the publisher's own Shared Wind; applying the preset does not rewrite the consumer's properties with the same names. While sharing, however, the published enabled state and phase clock use the publisher's values.

| Consumer Source | Collision without a Publisher | Wind without a Publisher |
|---|---|---|
| Local | Gather locally | Compute locally |
| Shared | No push-out | Continue with local time accumulation |
| Auto | Fall back to Local | Fall back to Local |

A present publisher with `Enabled=false` differs from an absent publisher. Its disabled state is shared; `Auto` does not reactivate the feature by switching to Local merely because the publisher is disabled.

## Setup and Runtime Control {#runtime-control}

The [Kawaii Physics Shared Publisher Reference](/docs/features/shared-publisher#details-initial-requirements) covers placement, sharing tags, and Source behavior when a publisher is absent. Use [UKawaiiPhysicsLibrary](/docs/api/transient-effects#publisher-runtime-control) for gameplay-triggered changes and [GetRuntimeNodeInfosOnComponent](/docs/api/runtime-diagnostics) for reading shared state.

## Related UE documentation {#ue-docs}

- [Gameplay Tags](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-gameplay-tags-in-unreal-engine) — Review the tag dictionary and hierarchy; consult each reference for KawaiiPhysics matching rules. (UE 5.8)

<span id="prerequisites" hidden />
<span id="setup" hidden />
<span id="common-pitfalls" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"prerequisites": "/en/docs/features/shared-publisher#details-initial-requirements", "setup": "/en/docs/features/shared-publisher#details-initial-setup", "common-pitfalls": "/en/docs/features/shared-publisher#details-initial-requirements"}} to="/en/docs/features/shared-publisher#details-initial-requirements" label="Related specifications and usage" />
