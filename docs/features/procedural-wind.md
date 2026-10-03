---
title: "Procedural Wind"
description: "風の揺れを作り、短い突風と風プリセットを演出・再利用に使う方法。"
---

import LegacyReference from '@site/src/components/LegacyReference';

import DocFigure from '@site/src/components/DocFigure';

# Procedural Wind

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

## 概要 {#when-to-use}

外を歩くキャラクターの髪や服を風になびかせたいとき、一定方向へ流すだけでは単調に見えることがあります。風向きに加えて、強弱の間隔や揺らぎも調整したい場面です。

Procedural Windは、一定の風に周期的な強弱・毛先へ伝わる位相の変化・ランダムな揺らぎを組み合わせられます。まず一定の風で効き方を確認し、必要な変化だけ足していけば、何が見た目を変えたか追いやすくなります。

<DocFigure src="/img/generated/artist-wind-flat-transparent.png" alt="左は風を加える前、右は青い矢印の向きへ服とボーンが流れる模式図" caption="AI生成の模式図。青い矢印の向きへ流れる服を示しています。実測した揺れの軌跡ではありません。" maxWidth={420} />

## 使用方法 {#基本的な設定}

1. ノードの `External Forces` に要素を追加します。
2. 追加した要素の型を `Procedural Wind` にします。
3. `Constant Force` を0から少し増やします。
4. レベルを再生します。

### 表示モードと設定項目 {#details-more-wind-settings}

`Parameter Mode`は`Simple`で主な項目、`Advanced`で全設定を表示します。Simpleで隠れた項目も、設定値は計算に使われます。

## 風の設定項目 {#tuning}

| 欲しい変化 | 最初に調整する項目 |
|---|---|
| 向きや基礎の強さを変える | `Wind Direction`、`Constant Force` |
| 全体の風を周期的に強く・弱くする | Advancedの `Sway Force`・`Sway Period` |
| 根元と毛先に時間差を付ける | `Ripple Force`、`Ripple Tip Phase Delay` |
| 規則的すぎる変化を少し崩す | `Random Force`、風向きノイズ |

### 風の成分と合成式 {#details-風を作る要素}

| 要素 | 役割 |
|------|------|
| Constant | 常に同じ強さで流す風 |
| Sway | 全ボーンを同じ位相で揺らす波 |
| Ripple | 根元から毛先へ伝わる波 |
| Strength Cycle | Constant・Sway・Ripple全体に掛ける周期的な倍率 |
| Random | 滑らかなノイズによる強さの変化 |
| Gust | APIから発生させる突風 |

合成の関係は次のとおりです。

```text
Total = (Constant + Sway + Ripple) * StrengthCycle + Random + Gust
```

`Ripple Tip Phase Delay` は毛先での位相遅れです。0では波の伝播がなくなり、負の値では毛先から根元へ逆向きに伝わります。`Wind Direction Noise Angle` と `Wind Direction Noise Period` で風向き自体にも変化を付けられます。

## Procedural Wind Gust / Transient External Force {#transient-forces}

着地や大きな動作の瞬間に風を強めたい場合、通常風の値を書き換えると元へ戻すタイミングも管理する必要があります。Gustは、立ち上がり・維持・減衰を指定して短い風を重ねられます。アニメーションに合わせるなら、発火位置をNotifyトラックへ置けます。

1. Animation Sequenceを開きます。
2. 突風を始めたい時刻へ移動します。
3. Notifyトラックへ `KawaiiPhysics: Trigger Gust` を追加します。
4. `Strength` を0から少し増やし、`RiseTime=0.2`秒、`DecayTime=0.5`秒など、合計時間が0より大きくなるよう設定します。3つの時間の既定値はすべて0です。
5. アニメーションを再生します。

<DocFigure src="/img/generated/artist-gust-envelope-ja.svg" alt="突風が立ち上がり、維持され、減衰する時間と全期間" caption="模式図。突風の強さが上がり、しばらく続いて下がる形です。" maxWidth={420} />

Notifyの全期間は`RiseTime + HoldTime + DecayTime`です。途中解除にはハンドル付きAPIを使います。

進行はアニメーション評価に依存します。LODやUROで評価が止まる条件も確認してください。汎用一時外力の寿命・8件の上限・使えない参照型は[一時外力リファレンス](/docs/api/transient-effects#wind-programmer-details)で説明します。

## Wind Preset Data Asset {#wind-presets}

衣装や別のシーンでも似た風を作りたい場合、値を一から入力し直すと比較や調整に時間がかかります。風プリセットへ保存すると、調整済みの風の値を選んで使い直せます。全ノードの物理設定を保存する[UKawaiiPhysicsPresetDataAsset](/docs/features/settings-presets)とは用途を分けます。

1. 対象のKawaii Physicsノードを選びます。
2. Detailsの `Wind Scope` を開きます。
3. `Force` で対象のProcedural Windを選びます。
4. `Presets` メニューを開きます。
5. `Breeze` を選びます。

風向きは適用先に残ります。保存される11項目とランタイム適用の条件は[風プリセットAPI](/docs/api/transient-effects#wind-風プリセット動的パラメータの詳細)を参照してください。

自分の風を保存するには、`Project Settings > Plugins > Kawaii Physics > Wind Scope`の`Wind Preset Data Asset`（内部名`WindScopePresetDataAsset`）を指定し、Wind Scopeの`Save as Preset > Add New Preset`を使います。組み込みプリセットだけの状態では保存できません。

Wind Scopeでの適用はABPを変更し、`Enabled=true`、`TimeScale=1`も設定します。この2値を保持するランタイムAPIとは適用範囲が異なります。保存・上書きは[Wind Scope](/docs/features/wind-scope#details-presets)を参照してください。

## Local・Shared・Auto {#details-shared-wind}

`Wind Source` の `Shared` / `Auto` は同じActorファミリーの **Kawaii Physics Shared Publisher** を参照します。`Shared Wind Tag` をPublisherの `Shared Group Tag` と合わせます。

- `Shared` はPublisherの風パラメータを使います。Publisherがない間はローカルの時間積算で動き続けます。
- `Auto` はPublisherがあればShared、なければLocalとして動きます。
- 共有中でも位相オフセット、Seed、Time Scale、有効状態、ボーンフィルタ、空間は各ノード側の設定です。

`Seed` はRandomと風向きノイズに共通です。同じ値は揺らぎの再現に使えますが、PIE中のライブ変更は次回再生から反映されます。シミュレーション全体の結果がすべての環境で一致することを保証する設定ではありません。

コードで共有パラメータや突風を変更する場合は[Shared Publisherのランタイム制御](/docs/api/transient-effects#publisher-runtime-control)を参照してください。

## 関連するUE公式ドキュメント {#ue-docs}

- [アニメーション通知](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/animation-notifies-in-unreal-engine) — Notifyトラックへの追加、NotifyStateの区間、発火条件を確認できます。 (UE 5.8)
- [Data Assets（英語）](https://dev.epicgames.com/documentation/en-us/unreal-engine/data-assets-in-unreal-engine) — データをアセットとして保存する仕組みと、既存クラスのData Assetインスタンスの作成を確認できます。 (UE 5.8; English)

<span id="shared-wind" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"shared-wind": "/docs/features/procedural-wind#details-shared-wind"}} to="/docs/features/procedural-wind#details-shared-wind" label="関連する仕様・操作へ" />
