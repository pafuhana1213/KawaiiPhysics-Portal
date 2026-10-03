---
title: "Feature Samples"
description: "揺れ方の問題をテーマへ結び付け、同じ条件で変更前後を見比べる。"
---

import LegacyReference from '@site/src/components/LegacyReference';

import DocFigure from '@site/src/components/DocFigure';

# Feature Samples

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

髪の揺れが収まらない、服が身体へ入り込む、風の変化が単調に見える。こうした状態を直すとき、完成形のAnimation Blueprintだけでは、どの設定が効いているのか分けて見るのが難しいことがあります。

開発版サンプルでは、展示を9テーマに分け、各展示の専用Animation Blueprintへ移動できます。調整したい動きの展示を選び、設定と結果を確認してから、自分のキャラクターで試す手掛かりにできます。髪や服を調整するアーティストと、設定の組み合わせを確認する技術担当者向けの案内です。

## テーマ一覧 {#artist-start}

| 調整したいこと | 最初に見るテーマ | 見比べるポイント |
|---|---|---|
| 止まっても髪の揺れが収まらない | `02_PhysicsSettings` | 毛先が落ち着くまでの時間。DampingとStiffnessを別々に比べる |
| 髪や服が身体へ入り込む | `03_Collision` | 同じモーションでの形の位置と身体との距離 |
| 風が一様で単調に見える | `08_Wind` | 根元と毛先のタイミング、強弱、突風 |
| 動作中だけ揺れを変えたい | `06_RuntimeControl` | 効果の入り方、続く時間、元へ戻るまで |

完成形を見たい場合は `09_Showcase` の部位ごとのABPを確認し、その後に単機能の展示へ戻ると要因を分けて見られます。9テーマには既存機能も含み、すべてがv1.22で追加された機能という意味ではありません。[Feature Samples リファレンス](/docs/getting-started/feature-samples#details-topics)からも選べます。

<DocFigure src="/img/sample-level.png" alt="DampingとStiffnessの値別展示、コリジョン形状、World CollisionのOFFとONが並ぶ旧サンプルの実画面" caption="Portalの既存サンプル画像・旧展示構成です。Damping／Stiffnessの列は1項目ずつの比較、World CollisionのパネルはOFF／ONの比較に使えます。v1.22の9テーマ画面ではありません。" />

### テーマと関連ページ {#details-topics}

| テーマ | 主な展示 | 関連ドキュメント |
|---|---|---|
| `01_BoneChain` | Root Bone、Dummy、除外、追加ルート、複数ノードとタグ | [ボーンチェーン](/docs/features/bone-chain) |
| `02_PhysicsSettings` | Damping、Stiffness、World Damping、Limit Angle、カーブ、テレポート、ウォームアップ、SkelCompMoveScale | [揺れ方の設定](/docs/features/physics-setup) |
| `03_Collision` | 球、カプセル、テーパードカプセル、箱、平面、Limits Data Asset、Physics Asset、ワールドコリジョン | [コリジョン](/docs/features/collision-setup)、[テーパードカプセル](/docs/features/collision-setup#tapered-capsule) |
| `04_Forces` | 重力、Simple External Force、外力プリセット、AnimNotify、座標系、ボーン長による倍率、従来の重力方式 | [風と外力](/docs/features/wind-and-forces) |
| `05_Advanced` | ボーン拘束、細分化、Sync Bone、プリセット、共有コリジョン | [共有コリジョン](/docs/features/shared-collision)、[UKawaiiPhysicsPresetDataAsset](/docs/features/settings-presets) |
| `06_RuntimeControl` | BlueprintのAlpha・倍率・突風、NotifyState、Sequencer、PostProcess ABP、AnimNode Function、外力ボリューム | [Settings Multiplier](/docs/features/settings-multipliers)、[Notify](/docs/features/animnotify#settings-multiplier-notifies)、[Kawaii Physics Settings Multiplier](/docs/features/sequencer)、[UKawaiiPhysicsLibrary](/docs/api/runtime-properties) |
| `07_SimpleWorldCollision` | 自動収集、対応形状、スケルタルメッシュのコリジョン、収集半径 | [Simple World Collision](/docs/features/simple-world-collision) |
| `08_Wind` | Procedural Windの成分、風プリセットData Asset、突風Notify、Shared Publisher | [Procedural Wind](/docs/features/procedural-wind)、[Kawaii Physics Shared Publisher](/docs/features/shared-publisher) |
| `09_Showcase` | TA式 鷺宮カノの完成形を部位ごとに紹介 | 各展示のAnimation Blueprintを参照 |

## レベル一覧 {#details-levels}

| 用途 | コンテンツの場所 |
|---|---|
| 従来のサンプルレベル | `Content/KawaiiPhysicsSample/L_KawaiiPhysicsSample` |
| テーマ別の展示 | `Content/KawaiiPhysicsSample/Examples/` |
| 全テーマを一か所で確認 | `Content/KawaiiPhysicsSample/L_KPS_AllExamples` |

全テーマのレベルはテーマ別レベルを並べて読み込みます。確認したい項目が決まっている場合は、テーマ別のレベルと該当展示のAnimation Blueprintを確認してください。

## 展示の操作 {#details-navigation}

`Content/KawaiiPhysicsSample/L_KPS_AllExamples`またはテーマ別レベルを開き、Play（PIE）を開始してビューポートへキーボードフォーカスを移します。

| PIE中のキー | 動作 |
|---|---|
| Z / X | 同じテーマ内の前 / 次の展示へ移動 |
| PageUp / PageDown | 前 / 次のテーマへ移動 |
| H | 現在の展示のドキュメントをPortalで開く |
| B | 現在の展示のAnimation Blueprintをエディタで開く |

エディタでは看板ActorのDetailsにある **Open Docs** / **Open AnimBP** ボタンからも参照できます。看板は現在の言語が日本語なら日本語、それ以外なら英語で説明を表示します。看板のリンク先はサンプル側の設定なので、すべてがこの試験的なページに接続されるとは限りません。

## サンプルの展示例 {#check-result}

<DocFigure src="/img/features/sample-v117.png" alt="AnimNotifyとVolume、AnimNode・DataAsset・PhysicsAssetのコリジョン元、外力の空間、スカートの比較が並ぶ旧サンプル画像" caption="Portalのv1.17更新履歴に使われている実画面です。右上はコリジョンの定義元、左下は外力の空間、右下はスカートの当たり方の比較です。画像のSequencerは旧展示で、v1.22予定の倍率トラックを示すものではありません。" />

## キャラクターと画像の利用条件 {#credits}

- **Grayちゃん**: [公開READMEの提供元リンク](http://rarihoma.xvs.jp/products/graychan)
- **TA式 鷺宮カノ**: [株式会社TA](https://xta.co.jp/)提供。Copyright (c) 2025 株式会社TA All rights reserved。[利用規約](https://uzurig.com/ja/terms_of_use_jp/)

プラグインのライセンスと、同梱キャラクターの利用条件は別々に確認してください。このページはPortalの既存画像を再利用し、モデルファイルは再配布していません。画像の参照元は既存サンプル素材と[v1.17更新履歴](/docs/changelog)です。

[Feature Samples リファレンス](/docs/getting-started/feature-samples#details-topics)

## 関連するUE公式ドキュメント {#ue-docs}

- [Animation Blueprintのノード](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/animation-blueprint-nodes-in-unreal-engine) — AnimGraphのノード追加・接続・Details編集を確認できます。 (UE 5.7)
  [UE5.8版（英語）](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-blueprint-nodes-in-unreal-engine)も参照できます。日本語ページの表示版は5.7です。

<span id="prerequisites" hidden />
<span id="first-pass" hidden />
<span id="troubleshooting" hidden />
<span id="details-credits" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"prerequisites": "/docs/getting-started/feature-samples#details-levels", "first-pass": "/docs/getting-started/feature-samples#details-navigation", "troubleshooting": "/docs/getting-started/feature-samples#details-navigation", "details-credits": "/docs/getting-started/feature-samples#credits"}} to="/docs/getting-started/feature-samples#details-levels" label="関連する仕様・操作へ" />
