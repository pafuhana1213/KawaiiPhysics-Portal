---
title: "KawaiiPhysicsToolset"
description: "Ask an AI assistant to perform KawaiiPhysics work in natural language through Unreal MCP in UE 5.8."
---

import McpWorkflowFigure from '@site/src/components/McpWorkflowFigure';
import LegacyReference from '@site/src/components/LegacyReference';

# KawaiiPhysicsToolset

:::warning Not Officially Released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

**KawaiiPhysicsToolset** lets you ask an AI assistant to adjust nodes, apply presets in bulk, and inspect or record runtime state. It exposes these editor operations through Unreal MCP in UE 5.8, so you can describe the work in an MCP-compatible client such as Claude Code or Codex. Unreal MCP is Experimental.

<McpWorkflowFigure locale="en" />

## Example Requests for AI {#request-examples}

Specify the targets in your project and ask, for example:

| Task | Example request |
|---|---|
| Create an ABP | “Create a new ABP at the specified location and name using the specified Skeleton and a matching Animation Sequence. Connect a KawaiiPhysics node for the specified hair Root Bone, set Stiffness to 0.3, and compile the ABP.” |
| Adjust settings | “Set Stiffness to 0.3 on the specified ABP hair node, then compile the ABP.” |
| Apply a preset | “Apply this settings preset to the specified skirt node in the ABP.” |
| Edit in bulk | “Apply this preset to project nodes matching its TargetTags.” |
| Inspect and record | “Record the specified PIE character's hair bones for 120 frames and summarize their movement range and frame-to-frame displacement.” |

## Connection Settings {#details-connection}

1. Open the corresponding UE 5.8 sample project. Before moving the setup to another project, check its Unreal MCP and bundled Python Toolset configuration.
2. Run `ModelContextProtocol.StartServer` in the editor console. Alternatively, **Editor Preferences > General > Model Context Protocol > Auto Start Server** enables automatic startup from the next launch; this preference is stored per user.
3. Connect your MCP client to `http://127.0.0.1:8000/mcp`. The public sample contains this configuration in `.mcp.json`.
4. List available tools in the client and read the descriptions registered by `KawaiiPhysicsToolset` and `KawaiiPhysicsSetupSkill`.

## Toolset Methods and Scope {#details-toolset}

The names below are implementation method names in the bundled Toolset. Check the names and argument schemas returned by your environment before making client calls.

| Purpose | Representative implementation methods | Scope and considerations |
|---|---|---|
| Inspect existing configuration | `find_anim_blueprint_assets`, `collect_kawaii_physics_graph_nodes`, `describe_graph_node_settings` | Assets, nodes, and settings |
| Create or edit nodes | `add_kawaii_physics_node`, `add_shared_publisher_node`, `set_graph_node_properties`, `compile_anim_blueprint` | Modifies Animation Blueprints. If a multi-property edit fails partway through, earlier changes can remain. |
| Compare or apply presets | `get_preset_diff`, `apply_preset_to_graph_node`, `apply_preset_to_project`, `audit_kawaii_physics_nodes` | Comparison and audit read settings; application modifies Animation Blueprint settings |
| Inspect PIE state | `describe_kawaii_physics_runtime_on_actor`, `describe_kawaii_physics_bones_on_actor`, `get_simple_world_collision_debug_info` | Runtime nodes, bones, and gathering state |
| Control motion at runtime | `start_physics_settings_multiplier_on_actor`, `start_procedural_wind_gust_on_actor`, `stop_transient_external_force_on_actor` | Changes running actors |
| Record and analyze trends | `start_bone_sampler`, `start_collision_penetration_sampler`, `analyze_motion_recording` | Penetration detection evaluates sampled bones and supported collision shapes; it does not validate the entire mesh. |
| Assist skirt setup | `build_ring_bone_constraints`, `set_bone_constraints_data_asset_pairs`, `set_graph_node_radius_by_depth` | Modifies constraints or radius curves |
| Change editor settings | `set_background_cpu_throttle` | Changes the editor CPU-throttle setting used in the background |

See [UKawaiiPhysicsEditorLibrary](/docs/api/editor-library) for authoring APIs, [UKawaiiPhysicsPresetDataAsset](/docs/features/settings-presets) and [Kawaii Node Audit](/docs/features/node-audit) for comparison and bulk operations, and [GetRuntimeNodeInfosOnComponent](/docs/api/runtime-diagnostics) for PIE data.

## Related UE documentation {#ue-docs}

- [Unreal MCP in Unreal Editor](https://dev.epicgames.com/documentation/unreal-engine/unreal-mcp-in-unreal-editor) — Review Unreal MCP setup, client connections, and Toolsets. (UE 5.8)

<LegacyReference redirect targets={{"first-pass": "/en/docs/api/mcp#details-toolset", "check-result": "/en/docs/api/mcp#details-toolset", "details-recording": "/en/docs/api/mcp#details-toolset"}} to="/en/docs/api/mcp#details-toolset" label="Toolset Methods and Scope" />

<span id="artist-start" hidden />
<span id="workflow" hidden />
<span id="troubleshooting" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"artist-start": "/en/docs/api/mcp#details-connection", "workflow": "/en/docs/api/mcp#details-toolset", "troubleshooting": "/en/docs/api/mcp#details-toolset"}} to="/en/docs/api/mcp#details-connection" label="Related specifications and usage" />
