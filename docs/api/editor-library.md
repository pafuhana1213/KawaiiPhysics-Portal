---
title: "UKawaiiPhysicsEditorLibrary"
---

import LegacyReference from '@site/src/components/LegacyReference';

import DocFigure from '@site/src/components/DocFigure';

# UKawaiiPhysicsEditorLibrary

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

## 概要 {#when-to-use}

衣装ごとにノードを配置し、対象ボーンやプリセットを設定する作業を、Blueprint／Pythonから繰り返し実行できます。`UKawaiiPhysicsEditorLibrary`はAnimBlueprintのグラフノードを収集・配置・編集するライブラリです。

実行中のノードは[UKawaiiPhysicsLibrary](/docs/api/runtime-properties)、画面からの設定適用・比較は[UKawaiiPhysicsPresetDataAsset](/docs/features/settings-presets)と[Kawaii Node Audit](/docs/features/node-audit)を参照してください。

## 収集とノードハンドル {#details-handles}

`CollectKawaiiPhysicsGraphNodes(AnimBlueprint, FilterTags, bFilterExactMatch = false)`は`FKawaiiPhysicsGraphNodeHandle`の配列を返します。空タグは全件です。使用前に`IsGraphNodeHandleValid`を確認してください。Shared Publisherは`CollectKawaiiPhysicsSharedPublisherGraphNodes`と別のハンドル型を使います。

`FindAnimBlueprintAssets(ContentPaths)`はアセットパスを返し、空パスは`/Game`です。`FindAnimBlueprintAssetsReferencingTags`はタグで候補を事前に絞ります。返ったアセットパスはロード・ノード確認につなげます。C++専用の`FindGraphNodeByGuid`や`FAssetData`を返す関数を、Blueprint公開ノードと混同しないでください。

## ノード配置と接続 {#details-authoring}

1. `FKawaiiPhysicsNodePlacementRequest`へRootBone、除外ボーン、追加RootBone、タグ、必要ならプリセットを指定します。プリセット未指定はノード既定値、タグ未指定はプリセット側タグを使用します。
2. `ValidatePlacementRequests`でエラー・警告を確認します。`Warning:`で始まる項目は警告で、空配列なら検出項目なしです。
3. `AddKawaiiPhysicsNodes`を呼びます。`MatchKey`は既定`None`、既存ノード照合は`Tag`／`RootBone`／`TagAndRootBone`から選べます。
4. 入力ポーズ・配置を確認し、`CompileAnimBlueprintWithMessages`でコンパイルします。戻り値0はコンパイルエラーなし、正数はエラー数、nullのABPは-1です。`OutMessages`にはError／Warning／Note付きの文字列を返します。

配置リクエストの`bAutoPosition`は既定`true`、**`bAutoConnect`は既定`false`**です。自動接続を有効にするとResultの直前へ直列接続します。両方有効なリクエストがあれば、Result上流のチェーンを同じ行へ整列します。すべての既存グラフ構造に期待どおり接続できることを保証するものではありません。

`AddKawaiiPhysicsSharedPublisherNode`は`bReuseExisting = true`、`bAutoConnect = true`が既定で、同Tagの既存Publisherを再利用できます。通常ノード配置の既定値とは異なります。

## 入力ポーズ・レイアウト・関数バインド {#details-graph-tools}

| API | 操作と戻り値の要点 |
|---|---|
| `SetAnimGraphInputAnimation` | Resultから上流をたどり、既存SequencePlayerの差替え、または未接続入力へ追加・接続。必要なら空間変換ノードを挿入 |
| `SetAnimGraphInputPose` | `InPose`入力を追加。SequencePlayerを置換し、接続済みInput Poseは変更しない。新規数0／1、失敗-1と`OutError` |
| `IsAnimGraphInputPoseConnected` | 上記Input Poseの接続を変更せず確認 |
| `LayoutKawaiiPhysicsAnimGraph` | Result上流の先頭の接続済みポーズチェーンを整列。チェーン外ノードは動かさない |
| `BindGraphNodeAnimNodeFunction` | AnimNode Functionを作成／バインド。Noneはバインド解除だけで関数グラフを残す。新規数0／1、失敗-1 |

これらは自動コンパイルしません。`GetAnimGraphComments`はコメントを読み、`FindBonesByPattern`は参照ボーン名を正規表現で検索します。

## 属性・外力・プリセット {#details-properties-and-presets}

- `SetGraphNodePropertyFromString`／`GetGraphNodePropertyAsString`はUEのプロパティ文字列形式を扱います。表示名ではなく内部名を渡し、成否を確認します。BlueprintのWildcardペアは`EKawaiiPhysicsEditorAccessResult`を使います。
- `SetGraphNodeRootBoneName`／`SetGraphNodeTag`は専用Setterです。Shared Publisherやプリセットにもそれぞれ文字列Setter／Getterがあります。
- `GetGraphNodeExternalForcesAsJson`は`_structType`と編集可能フィールドを持つ配列、空スロットを`null`で返します。`SetGraphNodeExternalForcesFromJson`は**配列全体を置換**します。省略フィールドは既定値、失敗は-1と`OutError`でノードを変更しません。
- `ApplyPresetToGraphNode`、`GetGraphNodePresetDiffProperties`／`Values`、`ExportGraphNodeToPreset`で設定の適用・比較・既存プリセットへの書出しができます。`ExportGraphNodeToPreset`は新規アセット作成関数ではありません。
- `SetPresetTargetTags`は未登録タグを警告してスキップします。非空入力がすべて無効なら変更せず`false`です。対象タグが空のプロジェクト適用は対象なしです。

`ApplyPresetToProject(Preset, bDryRun, bCheckOutFiles, OutReport)`はプロジェクト内の一致ノードへ適用します。`bDryRun = true`は変更せず監査報告を収集し、適用数の戻り値は0です。一括APIは自動保存を行いません。対象条件は[UKawaiiPhysicsPresetDataAsset](/docs/features/settings-presets)と[Kawaii Node Audit](/docs/features/node-audit)を参照してください。

## 関連するUE公式ドキュメント {#ue-docs}

- [Pythonを使用したエディタのスクリプティング](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/scripting-the-unreal-editor-using-python) — Pythonのエディタでの実行方法と、ゲーム実行時には使えない範囲を確認できます。 (UE 5.8)

<span id="artist-preparation" hidden />
<span id="details-artist-preparation-notes" hidden />
<span id="artist-operation" hidden />
<span id="details-artist-operation-notes" hidden />
<span id="artist-results" hidden />
<span id="details-artist-results-notes" hidden />
<span id="technical-reference" hidden />
<span id="details-technical-reference" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"artist-preparation": "/docs/api/editor-library#details-handles", "details-artist-preparation-notes": "/docs/api/editor-library#details-handles", "artist-operation": "/docs/api/editor-library#details-authoring", "details-artist-operation-notes": "/docs/api/editor-library#details-authoring", "artist-results": "/docs/api/editor-library#details-properties-and-presets", "details-artist-results-notes": "/docs/api/editor-library#details-properties-and-presets", "technical-reference": "/docs/api/editor-library#details-handles", "details-technical-reference": "/docs/api/editor-library#details-handles"}} to="/docs/api/editor-library#details-handles" label="関連する仕様・操作へ" />
