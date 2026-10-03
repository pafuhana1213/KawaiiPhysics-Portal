---
title: "Kawaii Node Audit"
---

import LegacyReference from '@site/src/components/LegacyReference';

import DocFigure from '@site/src/components/DocFigure';

# Kawaii Node Audit

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

## 概要 {#when-to-use}

基準の髪設定を更新した後、複数の衣装へ反映したか分からなくなることがあります。各AnimBlueprintを開いて値を見比べる作業では、対象ノードを探す手間がかかり、衣装ごとの意図した調整と更新漏れも区別する必要があります。

ノード監査は、対象ノードと基準プリセットの違いを一覧で確認するエディタ機能です。書き換えを行わないDry Runから対象を探し、違う値を見て、残す差とそろえる差を判断できます。

<DocFigure src="/img/generated/artist-runtime-preset-diff-ja.svg" alt="プリセット基準と対象ノードのDamping、Stiffnessを棒で比較し、Dampingだけが異なる例" caption="差分を読む概念例。基準とノードのDampingだけが異なり、Stiffnessは一致しています。数値は説明用で、実プロジェクトの検査結果や新UIではありません。" />

## 監査の実行 {#artist-operation}

1. 基準プリセットDataAssetの詳細を開きます。
2. `Apply To Project (Dry Run)` を押します。
3. 一覧のAnimBlueprint名と対象の部位を確認します。
4. 調べる行の `View Diff` を押します。
5. プリセットと違う値を読みます。

Dry Runから開く`Kawaii Node Audit`では、対象と差分を確認できます。対象ノードの場所だけ知りたい場合は`Find Target Nodes`を使えますが、こちらは差分列・差分フィルタ・適用操作を表示しません。

対象はプリセットの`TargetTags`で決まり、空なら対象なしです。タグの一致条件は[プリセット](/docs/features/settings-presets#details-find-targets)を参照してください。

## 表示フィルタと適用・出力範囲 {#audit-ui}

`Refresh`は同じプリセットのDry Runを再実行し、`Export...`はJSON／CSVを保存します。`Show Differing Only`は表示だけを絞ります。

表示フィルタと行選択は適用対象を絞りません。`Apply to Project...`はプリセットのTargetTagsに一致するプロジェクト内ノードへ適用し、Exportは表示フィルタ前の全監査エントリを含みます。

実適用は確認ダイアログ後にアセットを変更します。`Check out files`でチェックアウトに失敗したアセットはスキップされます。

### 監査画面の操作 {#details-audit-ui}

`Kawaii Node Audit`タブは常設のWindowメニューには表示されません。プリセットのDry Runまたは対象検索から開きます。Dry RunではMatchesが一致をチェック、不一致を差分プロパティ数で表示します。アセット行からABPを開き、`View Diff`から一致プリセットとの値付き比較へ進めます。差分フィルタ・`Check out files`・実適用はDry Runから開いた画面で利用します。

## KawaiiPhysicsAudit Commandlet {#technical-reference}

[KawaiiPhysicsAudit Commandlet](/docs/api/node-audit)に、監査データ・JSON／CSVの範囲・Commandlet引数と終了コード・Editor APIをまとめています。Commandletは読み取り監査を行い、必要に応じてJSONを書き出します。プリセットの実適用とは分けて運用します。

## 関連するUE公式ドキュメント {#ue-docs}

- [コマンドライン引数](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/command-line-arguments-in-unreal-engine) — 実行ファイルにフラグや値を渡す構文を確認できます。監査専用の引数は[KawaiiPhysicsAudit Commandlet](/docs/api/node-audit#commandlet)を参照してください。 (UE 5.8)

<span id="artist-preparation" hidden />
<span id="artist-results" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"artist-preparation": "/docs/features/node-audit#artist-operation", "artist-results": "/docs/features/node-audit#details-audit-ui"}} to="/docs/features/node-audit#artist-operation" label="関連する仕様・操作へ" />
