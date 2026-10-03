---
title: "KawaiiPhysicsAudit Commandlet"
---

import DocFigure from '@site/src/components/DocFigure';

# KawaiiPhysicsAudit Commandlet

:::warning Not Officially Released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

Run non-interactive audits through the commandlet or Editor API. See [Kawaii Node Audit](/docs/features/node-audit) for the UI workflow. Data fields returned or exported by audits are described below.

## Audit Entries {#details-audit-fields}

`FKawaiiPhysicsNodeAuditEntry` contains ABP path, graph name, NodeGuid, root bone, tag, `MatchedPresetPath`, `bMatchesPreset`, and `DiffProperties`. It also records subdivision counts, World/Shared/Simple World Collision settings, wind, external-force count, and WarmUpFrames. These are asset **settings**, not measurements of performance or actual collision success.

When multiple presets match, `MatchedPresetPath` identifies the first, while `MatchedPresetCount` reports the total. A count of two or more signals possible overlapping TargetTags. `DiffValues` defaults to empty unless requested through the API's `bIncludeDiffValues = true` or the commandlet's `-IncludeDiffValues`.

UI JSON contains `Summary` and `Entries`. UI `TotalAnimBlueprints` is the number of distinct ABPs in the current list; the commandlet counts ABPs under the scanned Content paths. Do not interpret those totals as identical populations. CSV is a compact table with `AnimBlueprint,Graph,Tag,RootBone,Matches,DiffCount,DiffProperties`.

## KawaiiPhysicsAudit Commandlet {#commandlet}

Replace the executable, project, and output paths in this example. Audit does not apply presets; it only writes the specified JSON report.

```text
UnrealEditor-Cmd.exe "C:\Projects\Example\Example.uproject" -run=KawaiiPhysicsAudit -ContentPaths=/Game/Characters -Output="C:\Reports\KawaiiPhysicsAudit.json" -IncludeDiffValues -unattended
```

| Argument | Behavior |
|---|---|
| `-ContentPaths=/Game/Characters,/Game/Accessories` | Comma-separated Content roots. Empty or omitted means `/Game` |
| `-FilterTags=Tag.One,Tag.Two` | Node tag filter. Empty or omitted matches all |
| `-Exact` or `-FilterExactMatch` | Exact matching; omitted allows matching child tags |
| `-IncludeDiffValues` | Includes values for differences in non-matching entries |
| `-Output=...` | JSON report path; omitted logs individual entries. There is no CSV-switch argument |

Unknown filter tags are skipped with a warning. If all are unknown, the resulting empty filter audits all nodes; check the log and actual target count.

| Exit code | Meaning |
|---|---|
| `0` | Audit succeeded with no preset drift |
| `1` | A node with a matching preset has differing properties |
| `2` | Audit or JSON output failed |

Nodes with no matching preset do not count as drift. Code zero does not establish that every node has a preset; inspect Entries and match counts too. `Summary` includes `TotalAnimBlueprints`, `TotalNodes`, and `PresetDriftCount`; `Entries` is the audit-entry array.

## AuditKawaiiPhysicsNodes {#editor-api}

`AuditKawaiiPhysicsNodes(ContentPaths, FilterTags, bFilterExactMatch, OutEntries, bIncludeDiffValues = false)` returns read-only audit success. A dry-run `ApplyPresetToProject` checks targets for one specified preset. See [UKawaiiPhysicsEditorLibrary](/docs/api/editor-library).

## Related UE documentation {#ue-docs}

- [Command-Line Arguments](https://dev.epicgames.com/documentation/en-us/unreal-engine/command-line-arguments-in-unreal-engine) — Review executable flags and key-value syntax; audit-specific arguments are listed on this page. (UE 5.8)
