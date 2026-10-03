---
title: "UKawaiiPhysicsLibrary — Node Properties and Presets"
---

import LegacyReference from '@site/src/components/LegacyReference';

import DocFigure from '@site/src/components/DocFigure';

# UKawaiiPhysicsLibrary — Node Properties and Presets

:::warning Not officially released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

## Overview {#when-to-use}

Read and write running node settings from Blueprint, for example to change hair gravity during a gameplay event and restore it when the event ends. Select the part by node tags and use the matching typed Set/Get functions. For settings stored in assets, use [UKawaiiPhysicsEditorLibrary](/docs/api/editor-library).

## Gravity Change Example {#artist-operation}

1. Pass the target mesh and `FilterTags` to `CollectKawaiiPhysicsNodesFromComponent` to obtain node references.
2. For each reference, call `GetNodeVectorProperty` with `PropertyName = Gravity` and retain the original value.
3. Pass the new FVector to `SetNodeVectorProperty` and handle its `ExecResult`.
4. When the event ends, pass the retained value to the same Setter.

Ordinary property changes do not restore themselves. For effects released when their duration ends, use a transient API such as [Settings Multiplier](/docs/features/settings-multipliers).

## Changes since v1.21 {#details-changes}

Alpha access, external-force add/remove operations, typed/wildcard **external-force** property access, and C++ node collection already exist in v1.21. The additions here include property access on the **node itself** and APIs for the new features. Bone subdivision and fixed substepping are also existing physics features.

| Old name (deprecated, still works) | Recommended development name |
|---|---|
| `SetAlphaToComponent` | `SetAlphaOnComponent` |
| `GetAlphaFromComponent` | `GetAlphaOnComponent` |
| `AddExternalForcesToComponent` | `AddExternalForcesOnComponent` |
| `RemoveExternalForcesFromComponent` | `RemoveExternalForcesOnComponent` |

The single-node `AddExternalForce` is deprecated too. `AddExternalForceWithExecResult` exposes `Valid`/`NotValid` execution branches through `EKawaiiPhysicsAccessExternalForceResult`. Renamed functions do not introduce new physical behavior by themselves.

## Querying Target Nodes {#details-target-selection}

`ConvertToKawaiiPhysics` converts an `FAnimNodeReference` to an `FKawaiiPhysicsReference`. The Blueprint-exposed `CollectKawaiiPhysicsNodesFromAnimInstance` and `CollectKawaiiPhysicsNodesFromComponent` fill the `Nodes` reference array and return collection success. The component form includes its main AnimInstance, linked instances, and post-process instance.

`FilterTags` matches each node's `KawaiiPhysicsTag`. Empty filters collect all nodes; `bFilterExactMatch` defaults to `false`. Component Set Alpha affects all matching nodes; Get Alpha reads the first matching node only.

<DocFigure src="/img/features/animnode-functions.png" alt="Existing Warm Up Blueprint passes left and right node references through Convert to Kawaii Physics into Set Need Warm Up" caption="Existing documentation's Warm Up example, reused to explain passing the intended node reference. It does not show the new named-property setter UI." />

## Typed and wildcard property access {#details-property-access}

The Blueprint `Kawaii Physics` category includes these Set/Get pairs. Pass the source property's internal `FName` as `PropertyName`, rather than its display label, and check `ExecResult`.

| Value type | Shared part of the API name |
|---|---|
| bool / int32 / float | `NodeBoolProperty` / `NodeIntProperty` / `NodeFloatProperty` |
| FVector / FRotator / FTransform | `NodeVectorProperty` / `NodeRotatorProperty` / `NodeTransformProperty` |
| FName / FGameplayTag | `NodeNameProperty` / `NodeGameplayTagProperty` |
| Type connected to the pin | `NodeWildcardProperty` |

Named access does not allow arbitrary internal fields. A property must belong to `FAnimNode_KawaiiPhysics` itself and pass preset property classification. Transient, EditorOnly, and explicitly denied properties are excluded. Typed functions require the expected type; wildcard access requires the pin and property types to match. Relevant setters request bone, shared-collision, or Simple World Collision reinitialization when needed.

Wildcard functions use Blueprint `CustomThunk`. Do not call the header's placeholder `int32` signature as a generic C++ function. String and low-level C++ helpers without `UFUNCTION` are separate from Blueprint-exposed APIs.

## Presets and feature controls {#details-feature-control}

`ApplyPresetDataAsset(ExecResult, KawaiiPhysics, Preset, Options)` applies a [UKawaiiPhysicsPresetDataAsset](/docs/features/settings-presets) to a runtime node. It excludes `ExternalForces` and `CustomExternalForces` for safety; its scope differs from an editor operation that replaces forces as well.

| Purpose | Representative APIs / details |
|---|---|
| Simple World Collision | `SetUseSimpleWorldCollision`, `SetSimpleWorldCollisionSource`, `SetSimpleWorldCollisionSharedTag`, `SetSimpleWorldCollisionGatherInterval` → [Simple World Collision](/docs/features/simple-world-collision) |
| Mirrored collision generation | `SetMirrorDataTableForLimits` (corresponds to `Mirror Data Table for Collision`), `SetSkipMirroredBoneWithExistingCollision` |
| Procedural Wind | `SetProceduralWindParameters`/`OnComponent`, `ApplyProceduralWindPreset`/`OnComponent` → [Procedural Wind](/docs/features/procedural-wind) |
| Temporary effects | `StartPhysicsSettingsMultiplier`/`OnComponent`, `AddTransientExternalForce`/`OnComponent`, and their Stop APIs |
| Shared Publisher | `SetSharedPublisherEnabled`, `SetSimpleWorldCollisionSettingsOnSharedPublisher`, wind `OnSharedPublisher` APIs |

`GenerateTransientHandle` and the `PushPhysicsSettingsMultiplier` family are C++ APIs, not exposed Blueprint nodes. Follow the feature-specific lifetime, blend, and handle rules for temporary effects.

## Calling timing {#details-thread-contract}

`BlueprintThreadSafe` does not add synchronization with evaluation threads. Node property access executes immediately on the referenced node. Call it from a suitable ThreadSafe AnimGraph context, or on the GameThread while the target is not being evaluated. Collection from an AnimGraph must target the caller's own AnimInstance/component; use the GameThread, outside evaluation, for other objects.

Individual APIs have further restrictions: diagnostics require the GameThread, while wind parameter updates use a pending request. Use dedicated feature APIs instead of writing internal shared clocks or force state through named access.

## Runtime Application {#preset-runtime-preset}

Blueprint-exposed `UKawaiiPhysicsLibrary::ApplyPresetDataAsset` accepts a node reference, preset, and options; ExecResult reports access success. ExternalForces and CustomExternalForces are skipped for safety.

Application requests ModifyBones and Shared Collision re-initialization. It applies node settings rather than restoring prior values after a duration. Use [Settings Multiplier](/docs/features/settings-multipliers) for temporary effects and [UKawaiiPhysicsLibrary](/docs/api/runtime-properties) for threading and evaluation-context conditions.

[v1.22 Preview Overview](/docs/preview) · [Official Release Physics Setup](/docs/features/physics-setup)

## Related UE documentation {#ue-docs}

- [Animation Blueprint Nodes](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-blueprint-nodes-in-unreal-engine) — Review AnimGraph node placement, connections, and Details editing. (UE 5.8)

<span id="artist-preparation" hidden />
<span id="details-artist-preparation-notes" hidden />
<span id="details-artist-operation-notes" hidden />
<span id="artist-results" hidden />
<span id="details-artist-results-notes" hidden />
<span id="technical-reference" hidden />
<span id="details-technical-reference" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"artist-preparation": "/en/docs/api/runtime-properties#details-target-selection", "details-artist-preparation-notes": "/en/docs/api/runtime-properties#details-target-selection", "details-artist-operation-notes": "/en/docs/api/runtime-properties#artist-operation", "artist-results": "/en/docs/api/runtime-properties#details-property-access", "details-artist-results-notes": "/en/docs/api/runtime-properties#details-property-access", "technical-reference": "/en/docs/api/runtime-properties#details-thread-contract", "details-technical-reference": "/en/docs/api/runtime-properties#details-thread-contract"}} to="/en/docs/api/runtime-properties#details-target-selection" label="Related specifications and usage" />
