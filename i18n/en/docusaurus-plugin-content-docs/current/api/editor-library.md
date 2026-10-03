---
title: "UKawaiiPhysicsEditorLibrary"
---

import LegacyReference from '@site/src/components/LegacyReference';

import DocFigure from '@site/src/components/DocFigure';

# UKawaiiPhysicsEditorLibrary

:::warning Not officially released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

## Overview {#when-to-use}

Use Blueprint/Python to repeat node placement, bone assignment, and preset application across costume assets. `UKawaiiPhysicsEditorLibrary` collects, places, and edits nodes in AnimBlueprint graphs.

For running nodes, see [UKawaiiPhysicsLibrary](/docs/api/runtime-properties). For preset application and comparison through the editor UI, see [UKawaiiPhysicsPresetDataAsset](/docs/features/settings-presets) and [Kawaii Node Audit](/docs/features/node-audit).

## Collection and handles {#details-handles}

`CollectKawaiiPhysicsGraphNodes(AnimBlueprint, FilterTags, bFilterExactMatch = false)` returns an array of `FKawaiiPhysicsGraphNodeHandle`. Empty tags match all nodes. Check `IsGraphNodeHandleValid` before use. Shared Publisher has a separate handle type and `CollectKawaiiPhysicsSharedPublisherGraphNodes`.

`FindAnimBlueprintAssets(ContentPaths)` returns asset paths; empty paths mean `/Game`. `FindAnimBlueprintAssetsReferencingTags` pre-filters candidates by tag. Load and inspect the returned assets before editing. C++-only `FindGraphNodeByGuid` and functions returning `FAssetData` are not exposed Blueprint nodes.

## Placing and connecting nodes {#details-authoring}

1. Fill an `FKawaiiPhysicsNodePlacementRequest` with root bone, excluded bones, additional roots, tag, and optionally a preset. No preset uses node defaults; an unset tag falls back to the preset's tag.
2. Check `ValidatePlacementRequests` for errors and warnings. Items prefixed `Warning:` are warnings; an empty array means no detected issues.
3. Call `AddKawaiiPhysicsNodes`. `MatchKey` defaults to `None`; `Tag`, `RootBone`, and `TagAndRootBone` can identify existing nodes to update.
4. Inspect the input pose and layout, then call `CompileAnimBlueprintWithMessages`. Zero means no compilation errors, a positive value is the error count, and a null ABP returns -1. `OutMessages` includes Error/Warning/Note prefixes.

Requests default to `bAutoPosition = true` and **`bAutoConnect = false`**. Auto-connect inserts nodes in series before Result. When a request enables both options, the upstream pose chain is laid out on one row. Check the resulting connections in your actual graph; this does not guarantee the intended result for every existing graph structure.

`AddKawaiiPhysicsSharedPublisherNode` instead defaults to `bReuseExisting = true` and `bAutoConnect = true`, and can reuse a publisher with the same tag.

## Pose input, layout, and function binding {#details-graph-tools}

| API | Behavior and key return values |
|---|---|
| `SetAnimGraphInputAnimation` | Walks upstream from Result to replace a SequencePlayer, or add/connect one at an unlinked input; inserts space conversion when needed |
| `SetAnimGraphInputPose` | Adds `InPose`, replacing a SequencePlayer; leaves a connected Input Pose unchanged. New-node count 0/1, or -1 with `OutError` |
| `IsAnimGraphInputPoseConnected` | Checks the above input without modification |
| `LayoutKawaiiPhysicsAnimGraph` | Lays out the first linked pose-input chain upstream of Result; leaves off-chain nodes in place |
| `BindGraphNodeAnimNodeFunction` | Creates/binds an AnimNode Function. None clears the binding but keeps its graph. New-graph count 0/1, or -1 |

These operations do not compile automatically. `GetAnimGraphComments` reads comments; `FindBonesByPattern` searches reference bone names using a regular expression.

## Properties, forces, and presets {#details-properties-and-presets}

- `SetGraphNodePropertyFromString`/`GetGraphNodePropertyAsString` use UE property text format. Pass internal names and check success. Blueprint wildcard access uses `EKawaiiPhysicsEditorAccessResult`.
- `SetGraphNodeRootBoneName`/`SetGraphNodeTag` provide dedicated setters. Shared Publisher and presets have separate string property functions.
- `GetGraphNodeExternalForcesAsJson` returns an array with `_structType` and editable fields, using `null` for empty slots. `SetGraphNodeExternalForcesFromJson` **replaces the entire array**. Omitted fields use defaults; failure returns -1 with `OutError` and leaves the node unchanged.
- `ApplyPresetToGraphNode`, `GetGraphNodePresetDiffProperties`/`Values`, and `ExportGraphNodeToPreset` apply, compare, or export settings. Export writes to an existing preset; it does not create a new asset.
- `SetPresetTargetTags` warns and skips unregistered tags. If every name in non-empty input is invalid, it returns `false` without modifying the preset. Empty target tags match no nodes for project application.

`ApplyPresetToProject(Preset, bDryRun, bCheckOutFiles, OutReport)` applies to matching project nodes. With `bDryRun = true`, it collects an audit report without changing nodes and returns an applied count of 0. The batch API does not save automatically. See [UKawaiiPhysicsPresetDataAsset](/docs/features/settings-presets) and [Kawaii Node Audit](/docs/features/node-audit) for target conditions.

## Related UE documentation {#ue-docs}

- [Scripting the Editor with Python](https://dev.epicgames.com/documentation/en-us/unreal-engine/scripting-the-unreal-editor-using-python) — Review editor Python execution and its separation from gameplay execution. (UE 5.8)

<span id="artist-preparation" hidden />
<span id="details-artist-preparation-notes" hidden />
<span id="artist-operation" hidden />
<span id="details-artist-operation-notes" hidden />
<span id="artist-results" hidden />
<span id="details-artist-results-notes" hidden />
<span id="technical-reference" hidden />
<span id="details-technical-reference" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"artist-preparation": "/en/docs/api/editor-library#details-handles", "details-artist-preparation-notes": "/en/docs/api/editor-library#details-handles", "artist-operation": "/en/docs/api/editor-library#details-authoring", "details-artist-operation-notes": "/en/docs/api/editor-library#details-authoring", "artist-results": "/en/docs/api/editor-library#details-properties-and-presets", "details-artist-results-notes": "/en/docs/api/editor-library#details-properties-and-presets", "technical-reference": "/en/docs/api/editor-library#details-handles", "details-technical-reference": "/en/docs/api/editor-library#details-handles"}} to="/en/docs/api/editor-library#details-handles" label="Related specifications and usage" />
