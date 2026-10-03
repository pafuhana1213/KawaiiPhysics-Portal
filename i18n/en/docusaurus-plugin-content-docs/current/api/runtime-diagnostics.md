---
title: "GetRuntimeNodeInfosOnComponent"
---

import LegacyReference from '@site/src/components/LegacyReference';

import DocFigure from '@site/src/components/DocFigure';

# GetRuntimeNodeInfosOnComponent

:::warning Not officially released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

## Overview {#when-to-use}

When hair penetrates the body, appearance alone may not show whether to investigate the input pose, the simulated position, or collision size. Changing settings and replaying also makes it difficult to track the relationship between moving bones and configured collision shapes.

Runtime diagnostics return bone positions, radii, and collision shape information from the latest evaluation. Comparing input and evaluated positions provides evidence for investigating unexpected values. The feature does not identify the cause of penetration automatically.

The API returns diagnostic data; the caller implements overlays and recording UI such as the illustration below.

<DocFigure src="/img/generated/artist-runtime-diagnostics-en.svg" alt="A dotted input-pose chain overlaid with an orange evaluated chain, effective-radius circles, and a blue collision capsule" caption="Conceptual diagnostic overlay: dotted input positions, orange evaluated positions/radii, and blue collision. This is not a UE screenshot or measured result." />

## Calling GetRuntimeNodeInfosOnComponent {#details-query}

Call the function in the Blueprint `Kawaii Physics` category with `MeshComp`, `FilterTags`, and `bFilterExactMatch`. Outputs are `OutInfos` and `OutError`; the return value is the node count. The C++ declaration is:

```cpp
static int32 GetRuntimeNodeInfosOnComponent(
    USkeletalMeshComponent* MeshComp,
    const FGameplayTagContainer& FilterTags,
    bool bFilterExactMatch,
    TArray<FKawaiiPhysicsRuntimeNodeInfo>& OutInfos,
    FString& OutError);
```

1. Call on the **GameThread after the target component has ticked**, outside parallel animation evaluation. Placing it in the same Actor's Tick does not by itself guarantee this order.
2. Empty `FilterTags` matches all KawaiiPhysics nodes. The main, linked, and post-process AnimInstances are traversed. Set `bFilterExactMatch = true` when exact tag matching is needed.
3. If the return value is `-1`, read `OutError`. Zero means no matching nodes; a positive return is the result-array size. The function clears both outputs on each call.
4. Check each result's `bEvaluated` before using positions. `Bones`/`Limits` positions are meaningless when the node has not been evaluated.

`bEvaluated` indicates whether the latest evaluation transform cache is available; it is not a timestamp proving evaluation in the current frame.

## Available fields {#details-fields}

| Result | Main fields |
|---|---|
| `FKawaiiPhysicsRuntimeNodeInfo` | `AnimInstanceClassName`, `NodeIndex`, `RootBone`, `Tag`, `SimulationSpace`, `bEvaluated`, `SimulationToComponent` |
| `Bones` | Bone name, array Index/ParentIndex, post-physics `Location`, input `PoseLocation`, effective `Radius`, `LengthRateFromRoot`, `bSkipSimulate` |
| `Limits` | Shape, source, original array name/index, driving bone, enabled state, position, rotation, dimensions |
| `Constraints` | Connected bone indices/names and AnimNode/DataAsset/AutoDummy source |

Positions and dimensions are in **component space**, with distances in cm. Radii include temporary settings multipliers. When `bNonUniformScale = true`, radii and dimensions are approximations; avoid treating the diagnostic geometry as exact.

Dummy bones have no `BoneName`. `DummyType` distinguishes `Tip`, `InterBone`, and `Bridge` dummies. Parent and constraint indices refer to the `Bones` array, not skeleton bone indices. `bSkipSimulate` identifies bones pinned to the input pose, such as a chain root.

## Collision Data Limitations {#details-collision-limits}

Use `SourceArrayName`/`SourceIndex` to trace a limit to its configuration. `bEnabled` describes use by the latest collision step, accounting for disabled settings and relevant dimensions. Capsule `Start` is its +Z end and `End` its -Z end; tapered capsules have `Radius0`/`Radius1`. Boxes expose half-size `Extent`, planes expose `PlaneNormal`, and inner spheres set `bInnerSphere`.

**Convex shapes are excluded from `Limits`.** `NumConvexLimits` reports the number of Simple World Collision convex limits, and `ConvexFallbackShape` identifies the fallback setting. A missing convex shape in a diagnostic drawing does not establish that it is absent from collision processing.

## Related diagnostics {#details-related-diagnostics}

- `GetSimpleWorldColliderCount` and `GetSimpleWorldColliderCountOnComponent` count spheres, capsules, tapered capsules, and boxes, including ground boxes and Convex shapes. The component form totals matching nodes; shared shapes may be counted by multiple nodes, so this is not a unique world-shape count.
- `GetSimpleWorldCollisionDebugInfo` reads subsystem diagnostics such as gathered counts and ground source. It is GameThread-only and `DevelopmentOnly`. It returns `false` when no entry exists, including an uninitialized node, disabled feature, or Shipping build.
- `GetSharedPublisherDebugInfo` is also GameThread-only. It reads publisher diagnostics and returns `false` when no entry exists, including uninitialized or Shipping cases.

See [Simple World Collision](/docs/features/simple-world-collision) for collection behavior and [Kawaii Node Audit](/docs/features/node-audit) for asset-level inspection. Audit reads editor configuration; this page describes evaluated runtime results.

## Related UE documentation {#ue-docs}

- [Animation Blueprint Nodes](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-blueprint-nodes-in-unreal-engine) — Review AnimGraph node placement, connections, and Details editing. (UE 5.8)

<span id="artist-preparation" hidden />
<span id="details-artist-preparation-notes" hidden />
<span id="artist-operation" hidden />
<span id="details-artist-operation-notes" hidden />
<span id="artist-results" hidden />
<span id="details-artist-results-notes" hidden />
<span id="technical-reference" hidden />
<span id="details-technical-reference" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"artist-preparation": "/en/docs/api/runtime-diagnostics#details-query", "details-artist-preparation-notes": "/en/docs/api/runtime-diagnostics#details-query", "artist-operation": "/en/docs/api/runtime-diagnostics#details-query", "details-artist-operation-notes": "/en/docs/api/runtime-diagnostics#details-query", "artist-results": "/en/docs/api/runtime-diagnostics#details-fields", "details-artist-results-notes": "/en/docs/api/runtime-diagnostics#details-fields", "technical-reference": "/en/docs/api/runtime-diagnostics#details-query", "details-technical-reference": "/en/docs/api/runtime-diagnostics#details-query"}} to="/en/docs/api/runtime-diagnostics#details-query" label="Related specifications and usage" />
