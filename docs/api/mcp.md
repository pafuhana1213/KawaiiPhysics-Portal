---
title: "KawaiiPhysicsToolset"
description: "UE 5.8のUnreal MCPを通じて、KawaiiPhysicsの様々な作業をAIアシスタントに依頼する方法。"
---

import McpWorkflowFigure from '@site/src/components/McpWorkflowFigure';
import LegacyReference from '@site/src/components/LegacyReference';

# KawaiiPhysicsToolset

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

**KawaiiPhysicsToolset** は、ノードの設定調整やプリセットの一括適用、実行時の診断・記録をAIアシスタントに依頼するためのツールセットです。UE 5.8のUnreal MCPを介してエディタの操作を提供し、Claude CodeやCodexなどのMCP対応クライアントから文章で指示を出せます。Unreal MCPはExperimentalの機能です。

<McpWorkflowFigure locale="ja" />

## AIへの依頼例 {#request-examples}

プロジェクト内の対象を指定して、たとえば次のように依頼できます。

| 作業 | 依頼例 |
|---|---|
| ABPの新規作成 | 「指定のSkeletonと対応するAnimation Sequenceを使い、指定の保存先・名前でABPを新規作成してください。髪のRoot Boneを指定してKawaiiPhysicsノードを接続し、Stiffnessを0.3に設定してコンパイルしてください」 |
| 設定調整 | 「指定したABPの髪ノードのStiffnessを0.3に変更し、コンパイルしてください」 |
| プリセット適用 | 「この設定プリセットを、指定したABPのスカートノードに適用してください」 |
| 一括編集 | 「このプリセットのTargetTagsに一致するプロジェクト内ノードへ、設定を一括反映してください」 |
| 診断・記録 | 「PIE中の指定キャラクターの髪ボーンを120フレーム記録し、移動範囲とフレーム間の移動量をまとめてください」 |

## 接続設定 {#details-connection}

1. UE 5.8の対応するサンプルプロジェクトを開きます。別のプロジェクトへ移す場合は、Unreal MCPと同梱Python Toolsetの構成を確認してください。
2. エディタのコンソールで `ModelContextProtocol.StartServer` を実行します。自動起動は **Editor Preferences > General > Model Context Protocol > Auto Start Server** で設定でき、ユーザーごとに保存され、次回起動から反映されます。
3. MCPクライアントを `http://127.0.0.1:8000/mcp` に接続します。公開サンプルの `.mcp.json` に接続設定があります。
4. クライアントで利用可能なツール一覧を取得し、登録された `KawaiiPhysicsToolset` と `KawaiiPhysicsSetupSkill` の説明を確認します。

## 操作メソッドと適用範囲 {#details-toolset}

下表の名前は同梱Toolsetの実装メソッド名です。クライアントから呼ぶ名前・引数は、その環境が返すツール一覧とスキーマを確認してください。

| 目的 | 主な実装メソッド | 対象と注意点 |
|---|---|---|
| 既存構成を読む | `find_anim_blueprint_assets`, `collect_kawaii_physics_graph_nodes`, `describe_graph_node_settings` | アセット、ノード、設定の確認 |
| ノードを作成・編集する | `add_kawaii_physics_node`, `add_shared_publisher_node`, `set_graph_node_properties`, `compile_anim_blueprint` | Animation Blueprintを変更する。複数属性の変更が途中で失敗しても、それまでの変更は残る場合があります。 |
| プリセットを比較・適用する | `get_preset_diff`, `apply_preset_to_graph_node`, `apply_preset_to_project`, `audit_kawaii_physics_nodes` | 比較・監査は読み取り、適用はAnimation Blueprintの設定を変更する |
| PIEの状態を読む | `describe_kawaii_physics_runtime_on_actor`, `describe_kawaii_physics_bones_on_actor`, `get_simple_world_collision_debug_info` | 実行時ノード・ボーン・収集状態 |
| 実行時の揺れを制御する | `start_physics_settings_multiplier_on_actor`, `start_procedural_wind_gust_on_actor`, `stop_transient_external_force_on_actor` | 実行中のActorを変更する |
| 記録して傾向を調べる | `start_bone_sampler`, `start_collision_penetration_sampler`, `analyze_motion_recording` | 貫通検出は取得したボーンと対応コリジョンを対象とし、メッシュ全体を検証するものではありません。 |
| スカートの設定を補助する | `build_ring_bone_constraints`, `set_bone_constraints_data_asset_pairs`, `set_graph_node_radius_by_depth` | ボーン拘束や半径カーブの設定を変更する |
| エディタ設定を変更する | `set_background_cpu_throttle` | バックグラウンド時のCPU抑制設定を変更する |

ノード編集の基盤は[UKawaiiPhysicsEditorLibrary](/docs/api/editor-library)、比較と一括適用は[UKawaiiPhysicsPresetDataAsset](/docs/features/settings-presets)と[Kawaii Node Audit](/docs/features/node-audit)、PIEの情報は[GetRuntimeNodeInfosOnComponent](/docs/api/runtime-diagnostics)も参照してください。

## 関連するUE公式ドキュメント {#ue-docs}

- [Unreal MCP in Unreal Editor](https://dev.epicgames.com/documentation/unreal-engine/unreal-mcp-in-unreal-editor) — Unreal MCPの接続設定とToolsetの仕組みを確認できます。 (UE 5.8)

<LegacyReference redirect targets={{"first-pass": "/docs/api/mcp#details-toolset", "check-result": "/docs/api/mcp#details-toolset", "details-recording": "/docs/api/mcp#details-toolset"}} to="/docs/api/mcp#details-toolset" label="操作メソッドと適用範囲" />

<span id="artist-start" hidden />
<span id="workflow" hidden />
<span id="troubleshooting" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"artist-start": "/docs/api/mcp#details-connection", "workflow": "/docs/api/mcp#details-toolset", "troubleshooting": "/docs/api/mcp#details-toolset"}} to="/docs/api/mcp#details-connection" label="関連する仕様・操作へ" />
