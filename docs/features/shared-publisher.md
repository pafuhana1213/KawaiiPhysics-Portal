---
title: "Kawaii Physics Shared Publisher"
---

import LegacyReference from '@site/src/components/LegacyReference';

import SharedPublisherComparison from '@site/src/components/SharedPublisherComparison';

# Kawaii Physics Shared Publisher

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

## 概要 {#when-to-use}

髪・服・マントが別メッシュの場合、各ノードの風を個別に変更する手間がかかります。Shared Publisherなら共通の風向き・強さを1か所で設定し、各部位へ渡せます。

<SharedPublisherComparison locale="ja" />

周囲の壁や家具についても、Simple World Collisionの収集設定と結果を共有できます。

## 共有範囲と配信条件 {#details-initial-requirements}

- 共有したいメッシュが同じActorファミリーであること。Actorのアタッチ親、なければ親Actorをたどったルートで識別されます。
- Publisherを置く、常に更新されるAnimGraphの枝を用意すること。

タグだけ一致しても別ファミリーとは共有されません。v1.21以前の[Shared Collision](/docs/features/shared-collision)は手作業のコリジョンを別ノードへ渡す機能で、ここで説明するPublisherとは役割が異なります。

## 配置手順 {#details-initial-setup}

1. 本体メッシュのPost Process AnimBP、またはOutput Pose直前の、常に更新される幹へPublisherを1つ配置します。
2. Publisherの `Shared Group Tag` を決めます。既定値は `KawaiiPhysics.Shared.Default` です。同じファミリー・同じタグのPublisherは1つにします。
3. 衝突の消費側では `Use Simple World Collision` を有効にし、`Source` を `Shared` または `Auto`、`Shared Tag` をPublisherと同じ値にします。
4. 風の消費側にProcedural Windを追加し、`Wind Source` を `Shared` または `Auto`、`Shared Wind Tag` を合わせます。

Publisherは **Updateで配信** します。Blend weightが0の枝や非アクティブStateに置くと、ポーズ接続があっても配信が止まります。Publisherの `Enabled` は既定trueです。falseでも生存通知は続き、消費側へ「衝突押し出しなし・風0」の状態を配ります。

## 共有設定とノードごとの設定 {#tuning}

| 作りたい変化 | 調整する場所 |
|---|---|
| 髪と服に共通する風向き・強さを変える | Publisherの `Shared Wind` |
| 髪を柔らかく、マントを重く見せる | 各Kawaii Physicsノードの物理設定 |
| 周囲の当たり判定を集める範囲や対象をそろえる | Publisherの `Simple World Collision` |

### 周辺コリジョンの共有 {#details-collision-sharing}

収集間隔・対象Object Types・半径・Convexの扱い・地面・SkeletalMeshの扱いはPublisher側の `Simple World Collision` で設定します。共有中は消費側の対応する収集値が無視され、`Auto` がLocalへ戻ったときだけ消費側の値を使います。

| Publisherの設定 | 既定値 | 用途 |
|---|---|---|
| Enabled（Simple World Collision内） | true | 衝突共有だけを有効にする |
| Gather Scope | ActorFamily | 同じEntryに参加する全メッシュのBoundsを合成。SkeletalMeshComponentならPublisherのメッシュBounds |
| Gather Interval | 0.2秒 | 新しい対象の収集間隔。0は毎フレーム |
| Object Types | 空 | 空ならWorldStatic＋WorldDynamic |
| Override Gather Radius / Gather Radius | false / 200cm | 自動Bounds範囲の代わりに半径を指定 |
| Override Collision Channel / Collision Channel | false / Pawn | 無効時は所有メッシュのObjectTypeでBlock応答を判定 |
| Gather Family Members | false | 参加メッシュ同士も収集する |
| Skeletal Mesh Collision | None | メッシュ形状はNone／Bounding Box／Physics Asset |

ファミリー内メッシュ同士を当てる場合は、`Gather Family Members` を有効にし、`Object Types` に `Pawn` を含め、`Skeletal Mesh Collision` を適切に選びます。各消費側は自分自身のメッシュ形状を除外します。対象が問い合わせ側のCollision ChannelをBlockすることも必要です。

### 風の共有 {#details-wind-sharing}

Publisherの `Shared Wind` は、風方向から `Random Force Period` までの13項目に加えて、風の位相クロックと実行中の突風 `ActiveGust` を配信します。消費側のPhase Offset・Seed・Time Scale・Enabled・ボーンフィルタ・空間設定は、その消費側の値を保持します。共有パラメータを消費側だけで変更しても共有中はPublisher値が使われます。

`Wind Preset Data Asset` と `Wind Preset Tag` を設定すると、初期化・再初期化時に選んだプリセットをShared Windへ適用します。Publisher側の適用に成功すると、プリセットの11項目に加えてShared Windの`Enabled=true`、`TimeScale=1`も設定します。ここで設定するEnabled／TimeScaleはPublisher自身のShared Windの値で、消費側の同名プロパティを書き換える操作ではありません。ただし、共有中の風の有効状態と位相クロックにはPublisher側の値が使われます。この2値を保持する通常のランタイム風プリセットAPIとは範囲が異なります。詳細は[風プリセット](/docs/features/procedural-wind#wind-presets)を参照してください。

| 消費側のSource | Publisher不在時の衝突 | Publisher不在時の風 |
|---|---|---|
| Local | 自身で収集 | 自身で計算 |
| Shared | 押し出しなし | ローカル積算で継続 |
| Auto | Localへフォールバック | Localへフォールバック |

Publisherが存在したまま `Enabled=false` の状態は「不在」と異なります。無効状態が共有されるため、`Auto` のLocalフォールバックで勝手に有効にはなりません。

## 配置とランタイム制御 {#runtime-control}

配置位置、共有タグ、SourceとPublisher不在時の挙動は、[Kawaii Physics Shared Publisher リファレンス](/docs/features/shared-publisher#details-initial-requirements)を参照してください。ゲームイベントから変更する処理は[UKawaiiPhysicsLibrary](/docs/api/transient-effects#publisher-runtime-control)、共有状態を調べる処理は[GetRuntimeNodeInfosOnComponent](/docs/api/runtime-diagnostics)へ案内します。

## 関連するUE公式ドキュメント {#ue-docs}

- [Gameplay Tags（英語）](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-gameplay-tags-in-unreal-engine) — タグ辞書への登録と階層を確認できます。KawaiiPhysics固有の一致条件は各リファレンスを参照してください。 (UE 5.8; English)

<span id="prerequisites" hidden />
<span id="setup" hidden />
<span id="common-pitfalls" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"prerequisites": "/docs/features/shared-publisher#details-initial-requirements", "setup": "/docs/features/shared-publisher#details-initial-setup", "common-pitfalls": "/docs/features/shared-publisher#details-initial-requirements"}} to="/docs/features/shared-publisher#details-initial-requirements" label="関連する仕様・操作へ" />
