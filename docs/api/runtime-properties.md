---
title: "UKawaiiPhysicsLibrary — ノード属性とプリセット"
---

import LegacyReference from '@site/src/components/LegacyReference';

import DocFigure from '@site/src/components/DocFigure';

# UKawaiiPhysicsLibrary — ノード属性とプリセット

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

## 概要 {#when-to-use}

ゲームイベントで髪の重力方向を変え、イベント終了時に戻すなど、実行中のノード設定をBlueprintから読み書きできます。ノードタグで部位を選び、型に合うSet／Get関数で値を扱います。アセットに保存する設定の編集は[UKawaiiPhysicsEditorLibrary](/docs/api/editor-library)を使います。

## Gravityの変更例 {#artist-operation}

1. `CollectKawaiiPhysicsNodesFromComponent`へ対象メッシュと`FilterTags`を渡し、ノード参照を取得します。
2. 各参照の`GetNodeVectorProperty`へ`PropertyName = Gravity`を渡し、元の値を保持します。
3. `SetNodeVectorProperty`へ新しいFVectorを渡し、`ExecResult`で成否を扱います。
4. イベント終了時に、保持した値を同じSetterへ渡します。

通常の属性変更は自動で復元されません。期間終了で解除する効果には[Settings Multiplier](/docs/features/settings-multipliers)などの一時効果APIを使えます。

## v1.21との違い {#details-changes}

Alphaの変更・取得、外力の追加・削除、外力属性の型別／Wildcardアクセス、C++のノード収集はv1.21にもあります。今回の追加は**ノード本体の属性アクセス**や新機能へのAPIです。ボーン分割や固定サブステップ自体も既存機能です。

| 旧名（非推奨・引き続き動作） | 開発版で推奨する名前 |
|---|---|
| `SetAlphaToComponent` | `SetAlphaOnComponent` |
| `GetAlphaFromComponent` | `GetAlphaOnComponent` |
| `AddExternalForcesToComponent` | `AddExternalForcesOnComponent` |
| `RemoveExternalForcesFromComponent` | `RemoveExternalForcesOnComponent` |

単一ノードへの`AddExternalForce`も非推奨です。`AddExternalForceWithExecResult`では`EKawaiiPhysicsAccessExternalForceResult`の`Valid`／`NotValid`分岐で成否を扱えます。名前変更だけを新しい物理挙動と解釈しないでください。

## 対象ノードの取得 {#details-target-selection}

`ConvertToKawaiiPhysics`は`FAnimNodeReference`を`FKawaiiPhysicsReference`へ変換します。Blueprintに公開された`CollectKawaiiPhysicsNodesFromAnimInstance`／`CollectKawaiiPhysicsNodesFromComponent`は、参照配列`Nodes`と収集成否を返します。Component側は本体のAnimInstanceに加え、Linked AnimInstanceとPostProcessを対象にします。

`FilterTags`は各ノードの`KawaiiPhysicsTag`で絞る条件です。空なら全件、`bFilterExactMatch`の既定は`false`です。複数対象へのSet Alphaは一致ノード全件、Get Alphaは最初の一致ノード1件を扱います。

<DocFigure src="/img/features/animnode-functions.png" alt="既存のWarm Up関数で左右のノード参照をConvert to Kawaii Physicsへ渡し、Set Need Warm UpにつなぐBlueprint例" caption="既存ドキュメントのWarm Up接続例。対象ノードの参照を渡す考え方を見るための図で、新しい属性SetterのUIを示すものではありません。" />

## 型別・Wildcardの属性アクセス {#details-property-access}

Blueprintの`Kawaii Physics`カテゴリに、次のSet／Getペアがあります。`PropertyName`には表示名ではなくソースの`FName`を渡し、`ExecResult`を必ず確認します。

| 値の型 | API名の共通部分 |
|---|---|
| bool / int32 / float | `NodeBoolProperty` / `NodeIntProperty` / `NodeFloatProperty` |
| FVector / FRotator / FTransform | `NodeVectorProperty` / `NodeRotatorProperty` / `NodeTransformProperty` |
| FName / FGameplayTag | `NodeNameProperty` / `NodeGameplayTagProperty` |
| ピンに接続した型 | `NodeWildcardProperty` |

名前指定で任意の内部値を変更できるわけではありません。対象は`FAnimNode_KawaiiPhysics`自身が持つ、プリセットの属性分類で許可された項目です。Transient／EditorOnlyや拒否対象を除外し、型別APIは期待型、Wildcardはプロパティとピンの同一型を要求します。変更する属性に応じてボーン・共有コリジョン・Simple World Collisionの再初期化が要求されます。

WildcardはBlueprint用の`CustomThunk`です。ヘッダー上の`int32`仮引数を「どの型にも使えるC++関数」として直接呼び出さないでください。C++向けの文字列／低レベルヘルパーは`UFUNCTION`を持たず、Blueprint公開APIとは区別します。

## プリセットと機能別制御 {#details-feature-control}

`ApplyPresetDataAsset(ExecResult, KawaiiPhysics, Preset, Options)`は[UKawaiiPhysicsPresetDataAsset](/docs/features/settings-presets)をランタイムノードへ適用します。安全のため`ExternalForces`と`CustomExternalForces`は除外します。外力まで一括置換するEditor操作とは同じ範囲ではありません。

| 用途 | 代表API／参照先 |
|---|---|
| Simple World Collisionの切替 | `SetUseSimpleWorldCollision`、`SetSimpleWorldCollisionSource`、`SetSimpleWorldCollisionSharedTag`、`SetSimpleWorldCollisionGatherInterval` → [Simple World Collision](/docs/features/simple-world-collision) |
| コリジョンの左右生成 | `SetMirrorDataTableForLimits`（設定 `Mirror Data Table for Collision` に対応）、`SetSkipMirroredBoneWithExistingCollision` |
| Procedural Wind | `SetProceduralWindParameters`／`OnComponent`、`ApplyProceduralWindPreset`／`OnComponent` → [Procedural Wind](/docs/features/procedural-wind) |
| 一時効果 | `StartPhysicsSettingsMultiplier`／`OnComponent`、`AddTransientExternalForce`／`OnComponent`、対応するStop API |
| Shared Publisher | `SetSharedPublisherEnabled`、`SetSimpleWorldCollisionSettingsOnSharedPublisher`、風の`OnSharedPublisher` API |

`GenerateTransientHandle`と`PushPhysicsSettingsMultiplier`系はC++用で、Blueprintノードとしては公開されていません。一時効果の寿命・ブレンド・ハンドル管理は機能別説明に従ってください。

## 呼び出しタイミング {#details-thread-contract}

`BlueprintThreadSafe`は別スレッドとの同期を自動で作る印ではありません。ノード属性アクセスは参照先へ即時実行します。AnimGraphの適切なThreadSafe文脈、または対象が評価中でないGameThreadから呼んでください。収集をAnimGraphから行う場合は呼び出し元自身のAnimInstance／Componentに限定し、他のオブジェクトは評価されていないGameThreadで扱います。

個々のAPIには別の制約があります。診断はGameThread専用、風のパラメータ更新はPendingRequest経由です。属性APIで共有時計・外力の内部状態を書き換える代わりに、対応する専用APIを使ってください。

## ランタイム適用 {#preset-runtime-preset}

Blueprint公開の `UKawaiiPhysicsLibrary::ApplyPresetDataAsset` はノード参照、プリセット、適用オプションを受け取り、ExecResultでアクセス結果を返します。ExternalForcesとCustomExternalForcesは安全性のためコピーしません。

適用後はModifyBonesとShared Collisionの再初期化を要求します。期間終了で元へ戻る効果ではなく、ノード設定の適用です。一時効果は[Settings Multiplier](/docs/features/settings-multipliers)、スレッド・評価文脈の条件は[UKawaiiPhysicsLibrary](/docs/api/runtime-properties)を確認してください。

[v1.22予定の機能一覧](/docs/preview) · [正式版の物理設定ガイド](/docs/features/physics-setup)

## 関連するUE公式ドキュメント {#ue-docs}

- [Animation Blueprintのノード](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/animation-blueprint-nodes-in-unreal-engine) — AnimGraphのノード追加・接続・Details編集を確認できます。 (UE 5.7)
  [UE5.8版（英語）](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-blueprint-nodes-in-unreal-engine)も参照できます。日本語ページの表示版は5.7です。

<span id="artist-preparation" hidden />
<span id="details-artist-preparation-notes" hidden />
<span id="details-artist-operation-notes" hidden />
<span id="artist-results" hidden />
<span id="details-artist-results-notes" hidden />
<span id="technical-reference" hidden />
<span id="details-technical-reference" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"artist-preparation": "/docs/api/runtime-properties#details-target-selection", "details-artist-preparation-notes": "/docs/api/runtime-properties#details-target-selection", "details-artist-operation-notes": "/docs/api/runtime-properties#artist-operation", "artist-results": "/docs/api/runtime-properties#details-property-access", "details-artist-results-notes": "/docs/api/runtime-properties#details-property-access", "technical-reference": "/docs/api/runtime-properties#details-thread-contract", "details-technical-reference": "/docs/api/runtime-properties#details-thread-contract"}} to="/docs/api/runtime-properties#details-target-selection" label="関連する仕様・操作へ" />
