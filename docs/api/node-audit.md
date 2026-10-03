---
title: "KawaiiPhysicsAudit Commandlet"
---

import DocFigure from '@site/src/components/DocFigure';

# KawaiiPhysicsAudit Commandlet

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

非対話の監査をCommandletまたはEditor APIから実行します。画面での確認手順は[Kawaii Node Audit](/docs/features/node-audit)を参照してください。取得・出力するデータの項目は以下で説明します。

## 監査エントリ {#details-audit-fields}

`FKawaiiPhysicsNodeAuditEntry`はABPパス、グラフ名、NodeGuid、RootBone、タグ、`MatchedPresetPath`、`bMatchesPreset`、`DiffProperties`を持ちます。さらにボーン分割数、World／Shared／Simple World Collision設定、Wind、外力数、WarmUpFramesを記録します。これらはアセットの**設定値**で、FPS・性能や実際の衝突成功を計測する結果ではありません。

複数プリセットが一致した場合、`MatchedPresetPath`は先頭1件、`MatchedPresetCount`は全一致件数です。2以上ならTargetTagsの重複を確認してください。差分の値ペア`DiffValues`はAPIの`bIncludeDiffValues = true`またはCommandletの`-IncludeDiffValues`で要求しない限り、既定では空です。

UIのJSONは`Summary`と`Entries`を含みます。UIの`TotalAnimBlueprints`は現在の一覧に含まれるABPの異なり数、Commandletでは指定Content走査の母数です。両者の数をそのまま同じ意味で比較しないでください。CSVは`AnimBlueprint,Graph,Tag,RootBone,Matches,DiffCount,DiffProperties`の簡易一覧です。

## KawaiiPhysicsAudit Commandlet {#commandlet}

UE Editorのコマンドライン実行例です。実際のUE実行ファイル・プロジェクト・出力先へ置き換えてください。監査はプリセットを適用せず、指定したJSONファイルへの書き込みだけを行います。

```text
UnrealEditor-Cmd.exe "C:\Projects\Example\Example.uproject" -run=KawaiiPhysicsAudit -ContentPaths=/Game/Characters -Output="C:\Reports\KawaiiPhysicsAudit.json" -IncludeDiffValues -unattended
```

| 引数 | 挙動 |
|---|---|
| `-ContentPaths=/Game/Characters,/Game/Accessories` | カンマ区切りのContentパス配下。省略・空は`/Game` |
| `-FilterTags=Tag.One,Tag.Two` | ノードタグで絞る。省略・空は全件 |
| `-Exact` または `-FilterExactMatch` | 完全一致。省略は子タグを含む一致 |
| `-IncludeDiffValues` | 不一致エントリの差分値を含める |
| `-Output=...` | JSON出力先。省略時は個別結果をログ出力。CSV切替引数はありません |

未登録のFilterTagsは警告してスキップします。すべて未登録だと空フィルタとなり全件監査になるため、ログと実際の対象数を確認してください。

| 終了コード | 意味 |
|---|---|
| `0` | 監査成功、プリセットずれなし |
| `1` | 一致するプリセットがあるノードに差分あり |
| `2` | 監査失敗またはJSON書き込み失敗 |

プリセットに一致しないノードは「ずれ」の件数には入りません。コード0だけで全ノードにプリセットが設定済みと判断せず、Entriesと一致件数も確認します。出力の`Summary`は`TotalAnimBlueprints`、`TotalNodes`、`PresetDriftCount`、`Entries`は監査エントリ配列です。

## AuditKawaiiPhysicsNodes {#editor-api}

`AuditKawaiiPhysicsNodes(ContentPaths, FilterTags, bFilterExactMatch, OutEntries, bIncludeDiffValues = false)`は読み取り監査の成否を返します。`ApplyPresetToProject`のDry Runは特定プリセットの対象確認に使います。詳細は[UKawaiiPhysicsEditorLibrary](/docs/api/editor-library)を参照してください。

## 関連するUE公式ドキュメント {#ue-docs}

- [コマンドライン引数](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/command-line-arguments-in-unreal-engine) — 実行ファイルにフラグや値を渡す構文を確認できます。監査専用の引数は本ページの表を使います。 (UE 5.8)
