---
title: "Mirror Data Table for Collision"
---

import LegacyReference from '@site/src/components/LegacyReference';

import DocFigure from '@site/src/components/DocFigure';

# Mirror Data Table for Collision {#mirror-data-table-for-collision}

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

腕や脚の両側に同じ当たり判定を作ると、片側の半径や位置を直すたびに反対側も調整する必要があります。左右ボーンの向きが違うSkeletonでは、Offsetの値をそのままコピーしても同じ位置になりません。

**コリジョンの左右生成**は、MirrorDataTableのボーン対応と参照ポーズを使って、片側の形を反対側へ生成します。左右で同じ当たり判定を使いたいキャラクターを調整するアーティストに役立ちます。左右差が必要な部位は、反対側の手動設定を残せます。

<DocFigure src="/img/generated/artist-authoring-mirror-flat.svg" alt="片側の骨に設定したオレンジの球とカプセルから、反対側の対応骨へ青緑の形を生成する前後の模式図" caption="模式図・UEの操作画面ではありません。オレンジが元の設定、青緑が生成結果、点線が鏡映面です。実際のOffset変換にはSkeletonの参照ポーズを使います。" />

## Mirror Data Table for Collisionの設定 {#mirror-setup}

対象Skeletonの左右ボーン対応とMirror Axisを設定したMirrorDataTableを使います。

1. 対象のKawaii Physicsノードを選びます。
2. `Collision > Mirror Data Table for Collision` に用意したテーブルを指定します。
3. 既存コリジョンがある骨をスキップする設定をオンのままにします。
4. Animation Blueprintをコンパイルします。
5. モーションを再生します。

## 形状調整と既存コリジョン {#mirror-adjust}

生成結果を見ながら、元の形の半径・サイズ・位置・回転Offsetを調整します。元の設定から反対側が作られるため、両側へ同じ修正を手入力する作業を減らせます。生成形状は元アセットへ追加保存される形ではありません。

反対側だけ別の形を使いたい場合は、その骨へ手動で設定し、既定のスキップ設定を維持します。スキップは形状タイプごとの判定です。反対側にSphereがあるとSphereの生成を省略しますが、Capsuleの生成まで省略するわけではありません。

## 設定と生成条件 {#mirror-details-configuration}

| 項目 | 条件・動作 |
|---|---|
| `Mirror Data Table for Collision` | 対象Skeletonの左右ボーン対応と `MirrorAxis` を使う |
| `bSkipMirroredBoneWithExistingCollision` | 既定true。同じ形状タイプの非Mirror形状が対応先にあると省略する |
| 元の形 | `Driving Bone`、形状、位置・回転Offsetを設定する |
| 生成しない条件 | テーブルなし、MirrorAxisがNone、Skeleton情報なし、有効な対応なし、対応先が自分自身 |

## オフセットと既存設定 {#mirror-details-existing-collisions}

位置・回転のOffsetは、参照ポーズのコンポーネント空間ボーン回転を使って反対側ボーンのローカル空間へ変換します。ボーン名の置換やOffsetの単純な符号反転だけではありません。

スキップ判定は **反対側ボーンに同じ形状タイプの非Mirrorコリジョンがあるか** です。例えば反対側に手動のSphereがあればSphereの自動生成は省略しますが、Capsuleまで省略する判定ではありません。判定に位置・半径が完全一致する必要もありません。falseにすると手動形状があっても生成するため、重複した押し出しに注意してください。

生成結果の `Source Type` は `Mirror` です。再生成前に以前のMirror由来形状を取り除いてから作り直します。元アセットへ反対側形状を書き込んで保存する操作ではありません。

## 対応形状とTapered Capsule {#mirror-details-shape-notes}

Tapered Capsuleでは `Radius0` が+Z端、`Radius1` が−Z端です。鏡映後の回転で端点の向きが逆転した場合は半径を交換し、元の物理端点に対応した太さを保持します。

この実装の左右生成対象はSphere／Capsule／Tapered Capsule／Box／Planeです。Simple World Collisionで収集した周辺形状やConvexを、この設定で任意にミラーする用途には対応していません。

[正式版のコリジョン設定](/docs/features/collision-setup) · [v1.22予定の機能一覧](/docs/preview)

## 関連するUE公式ドキュメント {#ue-docs}

- [アニメーションのミラーリング](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/mirroring-animation-in-unreal-engine) — Mirror Data Tableの作成、左右ボーンの対応、Mirror Axisを確認できます。KawaiiPhysicsでは形状生成にテーブルを使います。 (UE 5.7)
  [UE5.8版（英語）](https://dev.epicgames.com/documentation/en-us/unreal-engine/mirroring-animation-in-unreal-engine)も参照できます。日本語ページの表示版は5.7です。

<span id="mirror-prerequisites" hidden />
<span id="mirror-check-result" hidden />
<span id="mirror-troubleshooting" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"mirror-prerequisites": "/docs/features/collision-mirroring#mirror-setup", "mirror-check-result": "/docs/features/collision-mirroring#mirror-details-existing-collisions", "mirror-troubleshooting": "/docs/features/collision-mirroring#mirror-details-configuration"}} to="/docs/features/collision-mirroring#mirror-setup" label="関連する仕様・操作へ" />
