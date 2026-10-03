---
title: "Kawaii Node Audit"
---

import LegacyReference from '@site/src/components/LegacyReference';

import DocFigure from '@site/src/components/DocFigure';

# Kawaii Node Audit

:::warning Not officially released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

## Overview {#when-to-use}

After updating a reference hair setup, it can be unclear which costumes received the change. Opening each AnimBlueprint and comparing values requires locating the nodes and distinguishing intended costume adjustments from missed updates.

Node audit is an editor feature that lists target nodes and differences from reference presets. Start with a Dry Run that does not modify settings, inspect the differing values, and decide which differences to keep or align.

<DocFigure src="/img/generated/artist-runtime-preset-diff-en.svg" alt="Bars compare preset and node Damping and Stiffness, showing only Damping differs" caption="Conceptual diff example: only Damping differs; Stiffness matches. Values are illustrative, not a project audit result or a new UI screenshot." />

## Running an Audit {#artist-operation}

1. Open the reference preset DataAsset details.
2. Press `Apply To Project (Dry Run)`.
3. Check the AnimBlueprint names and target parts in the list.
4. Press `View Diff` on the row to inspect.
5. Read the values that differ from the preset.

The `Kawaii Node Audit` view opened by Dry Run shows targets and differences. To locate target nodes only, use `Find Target Nodes`; that view does not show difference columns, difference filters, or application controls.

The preset `TargetTags` determine targets; an empty list matches none. See [presets](/docs/features/settings-presets#details-find-targets) for tag matching.

## Display Filters and Application or Export Scope {#audit-ui}

`Refresh` repeats the same preset Dry Run; `Export...` saves JSON or CSV. `Show Differing Only` filters the display.

Display filters and row selection do not limit application targets. `Apply to Project...` applies to project nodes matching the preset TargetTags; Export includes all audit entries before display filtering.

Real application modifies assets after a confirmation dialog. With `Check out files`, assets whose checkout fails are skipped.

### Audit View Controls {#details-audit-ui}

The `Kawaii Node Audit` tab is not a persistent global Window-menu entry; open it through a preset Dry Run or target search. In the Dry Run view, Matches shows a check mark for agreement or the number of differing properties. Open the ABP from its row, or use `View Diff` for a value-level comparison with the matching preset. Difference filtering, `Check out files`, and real application are available in the view opened through Dry Run.

## KawaiiPhysicsAudit Commandlet {#technical-reference}

The [KawaiiPhysicsAudit Commandlet](/docs/api/node-audit) covers audit fields, JSON/CSV scope, commandlet arguments and exit codes, and the Editor API. The commandlet performs read-only audits and optionally writes JSON. Operate it separately from real preset application.

## Related UE documentation {#ue-docs}

- [Command-Line Arguments](https://dev.epicgames.com/documentation/en-us/unreal-engine/command-line-arguments-in-unreal-engine) — Review executable flags and key-value syntax; see [KawaiiPhysicsAudit Commandlet](/docs/api/node-audit#commandlet) for audit-specific arguments. (UE 5.8)

<span id="artist-preparation" hidden />
<span id="artist-results" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"artist-preparation": "/en/docs/features/node-audit#artist-operation", "artist-results": "/en/docs/features/node-audit#details-audit-ui"}} to="/en/docs/features/node-audit#artist-operation" label="Related specifications and usage" />
