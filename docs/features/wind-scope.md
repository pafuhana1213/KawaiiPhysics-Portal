---
title: "Wind Scope"
description: "波形を見て風の強さ・周期を調整し、プリセットを比較するアーティスト向けガイド。"
---

import LegacyReference from '@site/src/components/LegacyReference';

import DocFigure from '@site/src/components/DocFigure';

# Wind Scope

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

## 概要 {#強弱の変わり方を数値だけで判断しない}

髪をゆっくりなびかせたいのに、風の強弱が忙しく見える。Procedural Windの値を変えて再生を繰り返しても、どの成分が原因か分かりにくいことがあります。

Wind Scopeは、風の各成分と合成結果を波形で表示します。まず強弱の間隔を比べ、次に力の強さを変える、と調整を分けられます。風を作り込むアーティストやTAが、数値と見た目を結びつけるための確認手段です。

## PreviewとLive {#preview-live}

山が高いほど風の値が大きく、山から次の山までの間隔が長いほど強弱がゆっくり変わります。下の例は、強さを同じにして周期だけを2秒と4秒にした比較です。

<DocFigure src="/img/generated/artist-presets-wind-wave-ja.svg" alt="同じConstant 2、Sway 1で、周期2秒と4秒の風の強さを比較した模式グラフ" caption="模式波形：周期だけを2秒から4秒へ変えた例。波の高さが同じでも強弱の間隔が変わります。実UI・髪や布の動きの予測図ではありません。" maxWidth={420} />

図ではConstant=2、Sway=1、Strength Cycleの倍率1、他の力成分0を使っています。

### 波形の取得範囲 {#details-波形の詳しい読み方}

| 表示 | データ |
|------|--------|
| Preview | エディタ側の設定をコピーして計算。Live対象が取得できない場合の表示 |
| Live | 解決された実行中ノードのサンプル。適用済みの動的更新を含む |

Constant、Sway、Ripple、Strength Cycle、Random、Gust、Totalを扱います。表示時間幅は `Window`、表示停止は `Pause`。プリセットへのホバーは比較用Total波形を重ねます。

両モードはLengthRate=0の根元サンプルです。毛先位相、ボーンごとの力の投影、衝突後の骨位置は表示しません。Live対象が存在しても、新規サンプルがないtickでは表示を保持するため、更新停止だけでPreviewへの切替や風0とは判断できません。

## Wind Scopeの起動 {#open}

1. Animation Blueprintで対象のKawaii Physicsノードを選びます。
2. Detailsの `Wind Scope` を開きます。
3. `Force` で表示したい風を選びます。
4. `Window` で数周期が見える時間幅にします。
5. `Pause` で波形の表示を止めます。

### 起動と共有元の解決 {#details-詳細を調べる}

Detailsの `Wind Scope` と、ノードのコンテキストメニューの `Wind Scope (Force [n])` が入口です。`Force` で外力インデックスを確認します。Shared Publisherの `Shared Wind` も対象です。

消費側の共有風から開くとPublisherへリダイレクトされる場合があります。バナーの対象・タグ、`Show local wind` / `Open publisher` でローカル値と共有元を見分けます。リダイレクトされた消費側では共有パラメータの編集、プリセット適用、Pasteが制限されるため、Publisherを開いて編集します。

## 編集・クリップボード・テスト突風 {#details-edit-and-test}

編集はエディタ側のノード値を変更し、Live対象が解決できる場合は動的更新も要求します。Undo用トランザクションを使いますが、ABPを変更する操作です。

| 操作 | 作用 |
|------|------|
| Copy | 現在のProcedural Wind設定をクリップボードへコピー |
| Paste | 対応するデータをノードへ反映し、Live対象があれば更新要求も送る |
| Test Gust | Live対象へStrength／Rise／Decayを指定した一度のテスト突風を送る。風の設定値自体は変更しない |

Live対象がないTest Gustはスキップ通知になります。共有風はPublisher経由です。ゲーム中のハンドル付き突風管理は[一時外力](/docs/features/procedural-wind#transient-forces)を参照してください。

### プリセット適用と保存 {#details-presets}

Presetsのクリック適用は `ToDynamicParams()` の11項目に加え、Enabled=trueとTimeScale=1を設定します。通常のランタイム `ApplyProceduralWindPreset` はこの2項目を保持するため、同一範囲とは扱いません。

独自アセットは `Project Settings > Plugins > Kawaii Physics` の **Wind Preset Data Asset**（内部名 `WindScopePresetDataAsset`）に指定します。組み込みはBreeze／Strong／Stormです。

| 操作 | 結果 |
|------|------|
| Save as Preset > Add New Preset | 現在値をCustom nとして追加。PresetTagは未設定 |
| Save as Preset > Overwrite | 対象項目を上書き。保存先の項目の名前・タグは保持 |
| Reload | 指定DataAssetから一覧を読み直す |

保存はDataAssetを変更して未保存状態にします。保存先未指定では保存できず、Project Settingsへの案内が出ます。新規項目をゲーム側APIで選ぶには有効なPresetTagを設定します。更新中に一覧が変わった場合はReloadしてから上書き対象を確認してください。風プリセットはノード全体やボーン割り当てを置き換えません。[風プリセット](/docs/features/procedural-wind#wind-presets)に保存項目とランタイム適用の条件をまとめています。

## 関連するUE公式ドキュメント {#ue-docs}

- [Data Assets（英語）](https://dev.epicgames.com/documentation/en-us/unreal-engine/data-assets-in-unreal-engine) — データをアセットとして保存する仕組みと、既存クラスのData Assetインスタンスの作成を確認できます。 (UE 5.8; English)

<span id="details-開く前に用意するもの" hidden />
<span id="edit-and-test" hidden />
<span id="つまずいたとき" hidden />
<span id="details-つまずいたとき" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"details-開く前に用意するもの": "/docs/features/wind-scope#details-詳細を調べる", "edit-and-test": "/docs/features/wind-scope#details-edit-and-test", "つまずいたとき": "/docs/features/wind-scope#details-詳細を調べる", "details-つまずいたとき": "/docs/features/wind-scope#details-詳細を調べる"}} to="/docs/features/wind-scope#details-詳細を調べる" label="関連する仕様・操作へ" />
