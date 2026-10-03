---
title: "Simple World Collision"
description: "周囲の壁や家具の当たり判定を使い、髪や衣服の突き抜けを抑える方法。"
---

import LegacyReference from '@site/src/components/LegacyReference';

import DocFigure from '@site/src/components/DocFigure';

# Simple World Collision

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

## 概要 {#when-to-use}

廊下で壁に近づいたときや、椅子のそばに立ったとき、髪や裾が周囲の物を突き抜けることがあります。キャラクター側の手作業コリジョンで周囲まで対応しようとすると、物ごとに形を用意・調整する作業が増えます。

Simple World Collisionは、近くの物が持つSimple Collisionを集めて、髪や服のボーンを形状の外へ押し戻します。レベル側の当たり判定を利用できるので、家具や壁のそばでも揺れを確認したい場面に使えます。

<DocFigure src="/img/generated/style-a-flat-transparent-v1.png" alt="左はボーン半径がBoxと重なり、右は半径を含めて外へ押し戻された状態" caption="AI生成の模式図。橙の円を、青い箱の外へ押し戻す考え方です。" maxWidth={420} />

## 使用方法 {#基本的な設定}

対象オブジェクトにはSimple Collisionと、揺らすメッシュのObject Typeへの`Block`応答が必要です。ノード側で収集するには次のように設定します。

1. Kawaii Physicsノードの `Collision > Simple World Collision` を開きます。
2. `Use Simple World Collision` をオンにします。
3. `Source` を `Local` にします。
4. レベルを再生します。
5. キャラクターを箱へゆっくり近づけます。

### 主な設定と既定値 {#details-主な設定と既定値}

| 設定 | 既定値 | 意味 |
|------|--------|------|
| Use Simple World Collision | false | この機能を有効にする |
| Source | Local | このノード側で収集する |
| Gather Interval | 0.2秒 | 新しい周辺対象を収集する間隔。0なら毎フレーム |
| Object Types | 空 | 空の場合はWorldStaticとWorldDynamic |
| Override Gather Radius | false | 無効時はメッシュのBoundsから収集範囲を算出 |
| Gather Radius | 200cm | 半径の上書きが有効な場合に使う値 |
| Convex Shape | Convex Hull | 凸形状の平面セットを使う |
| Ground Collision | true | 地面情報を薄いBoxとして取り込む |
| Skeletal Mesh Collision | None | 周囲のSkeletalMeshに対する形状の扱い |

`Object Types` に属していても、所有SkeletalMeshComponentのObjectTypeを **Block** するコンポーネントだけが収集されます。`Override SkelComp Collision Params` が有効な場合は、そのObjectTypeが使われます。OverlapやIgnoreの対象は収集されません。収集済みコンポーネントの位置は毎フレーム更新されます。

## 収集条件と制約 {#common-pitfalls}

薄い壁や高速移動では通り抜けることがあります。移動経路を調べるSweepではなく、現在の形状から押し出す処理です。必要に応じて[World Collision](/docs/parameters/collision#world-collision)を併用できます。

### Convex Hullと地面 {#details-convex-hullと地面}

`Convex Shape` は `Convex Hull`、`Bounding Box`、`Bounding Sphere`、`None` から選びます。既定のConvex Hullは実形状の平面セットを使用します。ハル情報が取れない場合や、Project Settingsの `Max Convex Planes`（既定64）を超える場合はBounding Boxへフォールバックします。

LandscapeやComplex Collisionだけのメッシュは通常の形状収集の対象外です。ただし `Ground Collision` は別経路で、所有Actorの地面情報を使用し、なければ下方向のトレースで地面を求めます。このため、すべての処理がトレースなしになるわけではありません。

周囲のSkeletalMeshに当てる場合は `Skeletal Mesh Collision` を `Bounding Box` または `Physics Asset` にします。Physics Assetモードのポーズ情報は1フレーム遅れる場合があり、アニメーション由来のボーンスケールは形状サイズへ反映されません。

## IKawaiiPhysicsGroundProvider {#ground-provider}

自作MovementやMover側ですでに床を調べている場合、服の地面判定にもその情報を使いたい場面があります。Ground Providerは、移動処理が持つ床情報をSimple World Collisionへ渡す入口です。取得済みの結果を使えるため、Provider内で床を調べ直す必要がありません。

1. Simple World Collisionの `Ground Collision` を有効にします。
2. 所有Actorまたはコンポーネントへ `IKawaiiPhysicsGroundProvider` を実装します。
3. `GetKawaiiPhysicsGround` からキャッシュした床情報を返します。

<DocFigure src="/img/generated/artist-ground-flat-transparent.png" alt="左は床情報を使う地面Box、右は床なしを明示して地面Boxを除いた状態" caption="AI生成の模式図。床ありの情報と、床なしの情報を渡した場合を比べています。" maxWidth={420} />

### IKawaiiPhysicsGroundProvider {#details-ground-provider}

`IKawaiiPhysicsGroundProvider` はMover・自作Movement Component・Blueprint Pawnなどから、Simple World Collisionの地面情報を供給するインターフェースです。`Ground Collision` を有効にしたうえで、所有Actorまたはそのコンポーネントに実装し、`GetKawaiiPhysicsGround(SkelComp)` から `FKawaiiPhysicsGroundHit` を返します。検索は所有Actorからアタッチ親へ最大8段階進みます。

毎フレーム呼ばれるため、移動処理で既に得た床情報をキャッシュして返してください。インターフェース内で追加トレースを行う設計は避けます。Moverの床情報を自動で読み取る専用アダプターではなく、その情報を返す実装を用意するための接点です。

| 戻り値 | 動作 |
|---|---|
| `bNoGround=true` | 地面Boxを即座に除去。`bHit`に関係なくCharacterMovement／トレースへフォールバックしない |
| `bNoGround=false, bHit=true` | ワールド空間の`Location`・`Normal`を使う。`Component`は任意 |
| 両方false | 情報未取得としてCharacterMovementのCurrentFloor、次いで下方向トレースへ進む |

ジャンプや空中移動で「床なし」と判断できる場合は `bNoGround=true` を返します。「床を調べていない」場合の両方falseとは意味が異なります。LandscapeやComplex-only床も、地面情報のこの別経路で扱えます。

[v1.22予定の機能一覧](/docs/preview) · [正式版のコリジョン設定](/docs/features/collision-setup)

## Local・Shared・Auto {#details-共有と制約}

`Source` の `Shared` / `Auto` は、同じActorファミリーの [Kawaii Physics Shared Publisher](/docs/features/shared-publisher) と共有タグを使います。既存の[Shared Collision](/docs/features/shared-collision)のSourceノードとは役割が異なります。

- `Shared`: Publisherの収集結果を使用。Publisherがない間は押し出しを行いません。
- `Auto`: Publisherがあれば共有し、なければLocalへ戻ります。
- 共有中の収集設定はPublisher側の値が使われます。

## 関連するUE公式ドキュメント {#ue-docs}

- [SimpleとComplexコリジョン](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/simple-versus-complex-collision-in-unreal-engine) — 形状によるSimple CollisionとポリゴンによるComplex Collisionの違いを確認できます。 (UE 5.8)

<span id="共有と制約" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"共有と制約": "/docs/features/simple-world-collision#details-共有と制約"}} to="/docs/features/simple-world-collision#details-共有と制約" label="関連する仕様・操作へ" />
