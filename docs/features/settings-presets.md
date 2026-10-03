---
title: "UKawaiiPhysicsPresetDataAsset"
description: "調整済みの揺れ設定を別ノードへ移し、差分を確認するアーティスト向けガイド。"
---

import LegacyReference from '@site/src/components/LegacyReference';

import DocFigure from '@site/src/components/DocFigure';

# UKawaiiPhysicsPresetDataAsset

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

## 概要 {#同じ揺れ設定を転記し確認する手間を減らす}

一つの髪で調整したDampingやStiffnessを、別の部位やキャラクターにも使いたいとします。値を一つずつ転記すると、変更した項目を揃え忘れたり、部位に合わせた調整まで上書きしたりすることがあります。

KawaiiPhysics Preset Data Assetにノード設定を保存すると、別ノードへまとめて適用できます。Preset Diffでは保存値と現在値を比較し、揃える必要がある項目だけを選べます。アーティストやTAが共通の出発点を使いながら、各部位を調整する場面に役立ちます。

## 保存対象と個別設定 {#適用前共通にする値と個別の値}

Detailsの通常適用では、揺れ設定を移しても適用先の `Root Bone`、`Exclude Bones`、`Additional Root Bones` を保持します。左右の髪に同じDampingを使っても、動かすボーンはそれぞれの設定を使えます。

<DocFigure src="/img/generated/artist-presets-sharing-ja.svg" alt="Damping 0.10とStiffness 0.20を共通適用し、左右のRoot Bone hair_Lとhair_Rを保持する模式図" caption="機能の模式図：揺れ設定を共通化しても、DetailsのApply Presetでは適用先のRoot Boneを保持します。数値・ボーン名は説明用、実UIではありません。" maxWidth={420} />

### ボーン割り当てとタグ {#details-ボーン割り当てとタグ}

DetailsのApply Presetは対象のRoot Bone／Exclude Bones／Additional Root Bonesを保持します。既存の有効なKawaiiPhysicsTagは保持し、未設定ノードではプリセットの有効なタグを引き継ぐ場合があります。

`FKawaiiPhysicsPresetApplyOptions` の `bApplyBoneAssignment` と `bApplyTag` は明示的な上書き用で、既定falseです。Preset Diffは既定オプションで比較します。Detailsの通常操作とAPIオプションを同一範囲として扱いません。[UKawaiiPhysicsEditorLibrary](/docs/api/editor-library)はスクリプト適用・属性編集を扱います。

## Export Preset / Apply Preset {#保存適用比較}

1. 元のKawaii Physicsノードを選びます。
2. Detailsの `Export Preset` で設定を保存します。
3. 適用先のノードを選びます。
4. `Apply Preset` で保存したアセットを選びます。
5. Animation Blueprintをコンパイルします。

Skeletonの不一致は警告されますが、適用は停止しません。

## Check Preset Diff {#preset-diff}

プリセットと違う値があっても、その差が間違いとは限りません。ある部位だけ硬くした値は意図した差かもしれず、プリセットを更新した後に残った古い値は更新漏れかもしれません。Preset Diffは値の違いを示し、どちらに揃えるかを判断する材料になります。意図や更新漏れを自動判定する機能ではありません。

`Node Value` と `Preset Value` を見比べて、必要な値だけを選びます。たとえばDampingがノードで0.35、プリセットで0.10の場合に、Dampingだけを適用すると他の調整を残せます。

1. 比較したいKawaii Physicsノードを選びます。
2. Detailsの `Check Preset Diff` を開きます。
3. 選択欄で比較するプリセットを選びます。
4. Dampingの行だけをチェックします。
5. `Apply Selected` を押します。

適用するとノードのDampingが0.10になり、選ばなかった項目は保持されます。

### Check Preset Diff {#details-preset-diff}

Check Preset Diffはノードのタグを対象とするプリセットを検索します。対象なしでは `No preset targets this node's tag.` を通知します。プリセット選択欄で比較対象を切り替えます。

| プロパティ例 | Node Value | Preset Value | 判定 |
|--------------|------------|--------------|------|
| Damping | 0.35 | 0.10 | 異なる |
| Stiffness | 0.05 | 0.20 | 異なる |
| Radius | 3.0 | 3.0 | 一致 |

これらは説明用値です。意図的な調整か更新漏れかを自動判定する比較ではありません。

| 操作 | 方向・範囲 |
|------|------------|
| Apply Selected | チェックしたプロパティのみ、プリセット→ノード |
| Apply Preset to Node | 選んだプリセット全体、プリセット→ノード |
| Update Preset from Node | ノード→プリセット。選択ありなら選択項目、なしなら全差分 |

Update Preset from Nodeは上書き件数の確認ダイアログを出し、プリセットを変更して未保存状態にします。他ノードには再適用・再確認が必要です。プリセットからの2適用操作は表示スナップショット後に関連値が変わると差分を更新して適用を止めます。更新内容を確認して再実行します。

検索はカテゴリ／表示名／内部プロパティ名で絞り込みます。Category、Property、Node Value、Preset Value列を表示し、Propertyのツールチップに内部名があります。Show All Propertiesは一致項目も表示。Copyは差分をタブ区切りテキストとしてコピーし、Refreshはノードを再解決して比較を再計算します。

## タグ検索とDry Run {#details-find-targets}

Target Tagsは検索・監査・プロジェクト適用の対象です。空なら対象なし。Target Tags Exact Matchは既定falseです。Find Target Nodesで対象を調べ、Apply to Project (Dry Run)で差分を確認します。Dry Runはアセットを変更しません。[Kawaii Node Audit](/docs/features/node-audit)も参照してください。

## 関連するUE公式ドキュメント {#ue-docs}

- [Data Assets（英語）](https://dev.epicgames.com/documentation/en-us/unreal-engine/data-assets-in-unreal-engine) — データをアセットとして保存する仕組みと、既存クラスのData Assetインスタンスの作成を確認できます。 (UE 5.8; English)

<span id="details-再利用する設定の範囲" hidden />
<span id="details-見るところ" hidden />
<span id="つまずいたとき" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"details-再利用する設定の範囲": "/docs/features/settings-presets#details-ボーン割り当てとタグ", "details-見るところ": "/docs/features/settings-presets#保存適用比較", "つまずいたとき": "/docs/features/settings-presets#details-find-targets"}} to="/docs/features/settings-presets#details-ボーン割り当てとタグ" label="関連する仕様・操作へ" />
