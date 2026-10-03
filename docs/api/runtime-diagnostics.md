---
title: "GetRuntimeNodeInfosOnComponent"
---

import LegacyReference from '@site/src/components/LegacyReference';

import DocFigure from '@site/src/components/DocFigure';

# GetRuntimeNodeInfosOnComponent

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

## 概要 {#when-to-use}

髪が体へ食い込むとき、画面だけでは、入力の姿勢・揺れた後の位置・当たり判定の大きさのどこを見直すべきか分からないことがあります。設定を変えて再生するだけでは、動いているボーンと、設定した衝突形状の対応も追いにくくなります。

Runtime診断では、直近の計算結果からボーン位置・半径・衝突形状の情報を取得できます。元の位置と揺れた後の位置を比べ、想定と違う値を調査する材料にできます。食い込みの原因を自動で判定する機能ではありません。

APIは診断データを返します。図のような描画や記録UIは呼び出し側で実装します。

<DocFigure src="/img/generated/artist-runtime-diagnostics-ja.svg" alt="入力ポーズの点線チェーンと評価後のオレンジ色チェーンを重ね、実効半径の円と青い衝突カプセルを比較する概念図" caption="診断データの読み方を示す概念図。点線は入力位置、オレンジは評価後位置と実効半径、青はコリジョン。UE画面や実測結果ではありません。" />

## GetRuntimeNodeInfosOnComponentの呼び出し {#details-query}

Blueprintの`Kawaii Physics`カテゴリにある関数へ、対象`MeshComp`、`FilterTags`、`bFilterExactMatch`を渡します。出力は`OutInfos`と`OutError`、戻り値はノード数です。C++の宣言は次のとおりです。

```cpp
static int32 GetRuntimeNodeInfosOnComponent(
    USkeletalMeshComponent* MeshComp,
    const FGameplayTagContainer& FilterTags,
    bool bFilterExactMatch,
    TArray<FKawaiiPhysicsRuntimeNodeInfo>& OutInfos,
    FString& OutError);
```

1. **GameThreadで対象ComponentのTick後**に呼びます。並列アニメーション評価中には呼ばないでください。単に同じActorのTickに置くだけで順序を保証したことにはなりません。
2. 空の`FilterTags`は全KawaiiPhysicsノードを対象にします。本体AnimInstance、Linked AnimInstance、PostProcessを走査します。完全一致が必要な場合は`bFilterExactMatch = true`を指定します。
3. `-1`なら`OutError`を確認します。`0`は一致ノードがない状態、正数は結果配列の件数です。関数は呼び出しごとに出力配列・エラーをリセットします。
4. 各結果の`bEvaluated`を確認してから位置を使用します。未評価なら`Bones`／`Limits`の位置に意味はありません。

`bEvaluated`は直近の評価で使った変換キャッシュの有無で、そのフレームに評価されたことを示す時刻ではありません。

## 取得できる情報 {#details-fields}

| 結果 | 主な内容 |
|---|---|
| `FKawaiiPhysicsRuntimeNodeInfo` | `AnimInstanceClassName`、`NodeIndex`、`RootBone`、`Tag`、`SimulationSpace`、`bEvaluated`、`SimulationToComponent` |
| `Bones` | ボーン名、配列内Index／ParentIndex、物理後`Location`、入力ポーズ`PoseLocation`、実効`Radius`、`LengthRateFromRoot`、`bSkipSimulate` |
| `Limits` | 形状、出典、元配列名・Index、追従ボーン、有効状態、位置・回転・寸法 |
| `Constraints` | 接続するボーンIndex・名前、AnimNode／DataAsset／AutoDummyの出典 |

位置と寸法は**Component Space**、距離単位はcmです。半径には一時設定倍率を反映します。`bNonUniformScale = true`なら半径・寸法は近似であり、診断値を厳密な形状として扱わないでください。

ダミーボーンの`BoneName`はNoneで、`DummyType`に`Tip`（末端）、`InterBone`（実ボーン間）、`Bridge`（横拘束上）が入ります。`ParentIndex`や拘束のIndexは`Bones`配列を参照し、Skeletonのボーン番号とは異なります。`bSkipSimulate`はチェーン根元など、入力ポーズに固定されるボーンを示します。

## コリジョンデータの制約 {#details-collision-limits}

`Limits`の`SourceArrayName`／`SourceIndex`は元設定との照合用です。`bEnabled`は単なる設定フラグではなく、無効設定・寸法などを考慮した直近評価での使用状態です。Capsuleの`Start`は+Z側、`End`は-Z側で、Tapered Capsuleは`Radius0`／`Radius1`を持ちます。Boxは半サイズ`Extent`、Planeは`PlaneNormal`、内側Sphereは`bInnerSphere`で識別します。

**Convexの形状は`Limits`に含みません。** `NumConvexLimits`でSimple World CollisionのConvex件数、`ConvexFallbackShape`で代替形状設定を取得します。診断の描画にConvexが出ないことを、衝突自体がない証拠としないでください。

## 関連する診断API {#details-related-diagnostics}

- `GetSimpleWorldColliderCount`と`GetSimpleWorldColliderCountOnComponent`はSphere／Capsule／TaperedCapsule／Boxに加え、地面BoxとConvexを含む件数です。後者は一致ノードの合計で、同じ共有形状を複数ノードが使う場合の「一意なワールド形状数」ではありません。
- `GetSimpleWorldCollisionDebugInfo`は収集件数や地面ソースなど、Subsystem側の情報を読むGameThread専用・`DevelopmentOnly` APIです。ノード未初期化、機能OFF、Shipping等でEntryがなければ`false`です。
- `GetSharedPublisherDebugInfo`もGameThread専用で、Publisherの診断を取得します。未初期化・Shipping等でEntryがなければ`false`です。

収集の仕組みは[Simple World Collision](/docs/features/simple-world-collision)、アセット設定の一覧化は[Kawaii Node Audit](/docs/features/node-audit)を参照してください。監査はエディタ設定、ここでは実行時評価結果を扱います。

## 関連するUE公式ドキュメント {#ue-docs}

- [Animation Blueprintのノード](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/animation-blueprint-nodes-in-unreal-engine) — AnimGraphのノード追加・接続・Details編集を確認できます。 (UE 5.7)
  [UE5.8版（英語）](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-blueprint-nodes-in-unreal-engine)も参照できます。日本語ページの表示版は5.7です。

<span id="artist-preparation" hidden />
<span id="details-artist-preparation-notes" hidden />
<span id="artist-operation" hidden />
<span id="details-artist-operation-notes" hidden />
<span id="artist-results" hidden />
<span id="details-artist-results-notes" hidden />
<span id="technical-reference" hidden />
<span id="details-technical-reference" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"artist-preparation": "/docs/api/runtime-diagnostics#details-query", "details-artist-preparation-notes": "/docs/api/runtime-diagnostics#details-query", "artist-operation": "/docs/api/runtime-diagnostics#details-query", "details-artist-operation-notes": "/docs/api/runtime-diagnostics#details-query", "artist-results": "/docs/api/runtime-diagnostics#details-fields", "details-artist-results-notes": "/docs/api/runtime-diagnostics#details-fields", "technical-reference": "/docs/api/runtime-diagnostics#details-query", "details-technical-reference": "/docs/api/runtime-diagnostics#details-query"}} to="/docs/api/runtime-diagnostics#details-query" label="関連する仕様・操作へ" />
