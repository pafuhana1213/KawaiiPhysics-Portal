---
sidebar_position: 1
title: "内部設計の全体像"
description: "KawaiiPhysics を調査・改造するプログラマ向けに、モジュール構成、中心となるデータ、機能とソースの対応を説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# 内部設計の全体像

:::note 対象のコード
このカテゴリは [KawaiiPhysics](https://github.com/pafuhana1213/KawaiiPhysics) の `master` ブランチを基準に、コミット `80b0016` の時点の内容で書かれています。v1.22 で予定している未リリースの機能を含みます。正式版の v1.21 には存在しない機能があるため、参照しているバージョンと照らし合わせてください。
:::

このカテゴリは、KawaiiPhysics のソースコードを調査・改造するプログラマ向けの資料で、読者には UE の C++ と AnimGraph の知識を想定しています。パラメータの使い方は[設定ガイド](/docs/guides)と[パラメータリファレンス](/docs/parameters/overview)を参照してください。

## このページの要点

**概要**

KawaiiPhysics は、AnimGraph のノードでボーンの揺れを計算するプラグインです。プラグインは、実行時の処理、Sequencer のトラック、エディタ統合、自動テストの4つのモジュールで構成されます。

**設計**

評価が Worker スレッドで実行される場合に備えて、参照は Game Thread 側で解決してキャッシュし、一時外力などの要求はキューで渡します。Simple World Collision の重い形状収集は Subsystem へ分離します。ノードの設定値と実行時の値は分けて持ちます。作業配列の再利用で毎フレームの確保を避け、一時外力や設定倍率の要求と保持の件数には上限を設けます。

**理解のポイント**

- データの持ち主を先に確認すると、機能どうしの関係を追いやすくなります。`ModifyBones`、コリジョン形状、要求キューはノードが持ちます。
- 処理の単位として、評価とステップを区別します。1回の評価でステップは0回以上走るので、どの処理がどちらの単位で動くかが各ページの前提になります。
- 各機能のページは、ノードとの接点から読みます。要求や形状がどの経路で評価側へ届くかを見ると、機能どうしの違いを比べられます。
- 読む順序は目的で変わります。全体を理解する場合は、1フレームの処理順、ボーンモデル、シミュレーションの3ページがほかのページの前提になります。

## 構造の要約

KawaiiPhysics の中心は `FAnimNode_KawaiiPhysics` という1つの AnimGraph ノードです。シミュレーションの状態はこのノードのインスタンスが保持し、`EvaluateSkeletalControl_AnyThread` で計算して、結果をボーンの Transform として出力します。この関数は Worker スレッドで実行される場合があります。ボーンの運動は独自のソルバーで計算します。UE の物理シーンを使うのは、World Collision のスイープなどコリジョンのクエリだけです。

<DocFigure src="/img/generated/internals-architecture-ja.svg" alt="Game Thread などからの要求入力と Subsystem、評価スレッドの物理ノードと Shared Publisher、Data Asset とレベルのコリジョンの接続図" caption="矢印は要求キュー、共有形状、風、収集設定、アセットの取り込みの向きを示します。" maxWidth={960} />

ノードの外にある機能の多くは、ノードへ入力を届ける経路です。一時外力、Gust、設定倍率の要求はキューを経由し、共有コリジョンとワールドの形状は Subsystem を経由して、評価側で取り込みます。これはノード全体の規則ではありません。`AddExternalForce` や `SetAlphaOnComponent` のようにキューを経由しない API や、外力へ可変のノード参照を渡す経路もあります。

## モジュール構成

プラグインは4つのモジュールで構成されます。

| モジュール | Type | LoadingPhase | 役割 |
|---|---|---|---|
| `KawaiiPhysics` | Runtime | PostConfigInit | ノード、Subsystem、外力、Data Asset、Library、Notify |
| `KawaiiPhysicsSequencer` | Runtime | PreDefault | Settings Multiplier の Sequencer トラック |
| `KawaiiPhysicsEd` | UncookedOnly | PreDefault | AnimGraph ノード、EditMode、ツール類、Editor Library。Win64、Mac、Linux のみ |
| `KawaiiPhysicsTests` | Runtime | Default | 自動テスト。Editor ターゲットのみ |

<DocFigure src="/img/generated/internals-modules-ja.svg" alt="KawaiiPhysics、KawaiiPhysicsSequencer、KawaiiPhysicsEd、KawaiiPhysicsTests の Type、役割、6本の依存関係" caption="矢印を依存元から依存先へたどると、4モジュールの関係を確認できます。" maxWidth={960} />

対応エンジンは UE 5.3 から 5.8 です。バージョン差は `UE_VERSION_OLDER_THAN` で分岐しています。

## 中心となるデータ

コードを読むときは、次の3つのデータの持ち主を押さえると全体が追いやすくなります。

| データ | 持ち主 | 内容 |
|---|---|---|
| `TArray<FKawaiiPhysicsModifyBone> ModifyBones` | ノード | シミュレーションする質点の配列。実ボーンとダミーが同じ配列に入る |
| `SphericalLimits`、`CapsuleLimits` など | ノード | コリジョン形状。ノード直持ち、Data Asset 由来、共有、ワールドで配列が分かれる |
| `FKawaiiPhysicsTransientForceStore TransientForceStore` | ノード | Game Thread からの要求キューと、取り込み済みの一時外力、設定倍率 |

`FAnimNode_KawaiiPhysics` はコピーされることのある構造体です。`FKawaiiPhysicsTransientForceStore` のコピーコンストラクタは新しい空のストアと独立したキューを作り、コピー代入は何もしません。要求の二重消費を避けるためで、通常の `TSharedPtr` のコピーとは異なり、コピー元とキューを共有しません。詳細は[ランタイム制御と要求キュー](/docs/internals/runtime-control)を参照してください。

## ノード実装のファイル分割

`FAnimNode_KawaiiPhysics` のメンバ関数は、責務ごとに複数の `.cpp` に分かれています。

| ファイル（`KawaiiPhysics/Private/`） | 内容 |
|---|---|
| `AnimNode_KawaiiPhysics.cpp` | ライフサイクル、評価ループ、要求の受付、CVar、Stat |
| `AnimNode_KawaiiPhysicsModifyBones.cpp` | ボーンの構築、ダミーの挿入、ポーズの取得、Component の移動 |
| `AnimNode_KawaiiPhysicsSimulation.cpp` | 物理設定、サブステップ、積分、結果の出力、空間変換 |
| `AnimNode_KawaiiPhysicsCollision.cpp` | 形状の更新と押し出し、Data Asset の取り込み、Bone Constraint、共有コリジョンの読み書き |
| `AnimNode_KawaiiPhysicsSyncBone.cpp` | Sync Bone |
| `AnimNode_KawaiiPhysicsDebug.cpp` | デバッグ描画 |
| `AnimNode_KawaiiPhysicsInternal.h` | 分割したファイルで共有する Stat の宣言 |

## 機能マップ

機能ごとの入口と、説明しているページの対応です。

| 機能 | 主な型・関数 | 内部設計 | 使い方 |
|---|---|---|---|
| ボーンチェーン、ダミー | `InitModifyBones`、`AddModifyBone` | [ボーンモデル](/docs/internals/bone-model) | [ボーンチェーン](/docs/features/bone-chain) |
| 物理計算 | `SimulateModifyBones`、`SimulateOnce`、`Simulate` | [シミュレーション](/docs/internals/simulation) | [物理パラメータ](/docs/parameters/physics) |
| 固定サブステップ | `UKawaiiPhysicsDeveloperSettings` | [シミュレーション](/docs/internals/simulation) | [Fixed Substepping](/docs/advanced/fixed-substepping) |
| Bone Constraint | `InitBoneConstraints`、`AdjustByBoneConstraints` | [拘束と制限](/docs/internals/constraints-and-limits) | [Bone Constraint](/docs/features/bone-constraint) |
| 角度制限 | `AdjustByAngleLimit`、`KawaiiPhysicsAngleLimit.h` | [拘束と制限](/docs/internals/constraints-and-limits) | [Limits](/docs/parameters/limits) |
| Subdivision | `InsertInterBoneDummyBones` | [ボーンモデル](/docs/internals/bone-model) | [ボーン細分化](/docs/features/bone-subdivision) |
| コリジョン | `UpdateSphericalLimits`、`AdjustBySphereCollision` など | [ローカルコリジョン](/docs/internals/collision) | [コリジョン](/docs/features/collision-setup) |
| Sync Bone | `FKawaiiPhysicsSyncBone` | [Sync Bone](/docs/internals/sync-bone) | [Sync Bone](/docs/features/sync-bone) |
| 外力 | `FKawaiiPhysics_ExternalForce`、`UKawaiiPhysics_CustomExternalForce` | [外力](/docs/internals/external-forces) | [外部力](/docs/features/wind-and-forces) |
| Procedural Wind | `FKawaiiPhysics_ExternalForce_ProceduralWind` | [Procedural Wind](/docs/internals/procedural-wind) | [Procedural Wind](/docs/features/procedural-wind) |
| Shared Collision | `UKawaiiPhysicsSharedCollisionSubsystem` | [Subsystem と Shared Collision](/docs/internals/shared-collision) | [共有コリジョン](/docs/features/shared-collision) |
| Simple World Collision | `KawaiiPhysicsSimpleWorldCollision.h` | [Simple World Collision](/docs/internals/simple-world-collision) | [Simple World Collision](/docs/features/simple-world-collision) |
| Shared Publisher | `FAnimNode_KawaiiPhysicsSharedPublisher` | [Shared Publisher](/docs/internals/shared-publisher) | [Shared Publisher](/docs/features/shared-publisher) |
| 実行時 API | `UKawaiiPhysicsLibrary` | [ランタイム制御と要求キュー](/docs/internals/runtime-control) | [Library](/docs/api/kawaiiphysics-library) |
| Settings Multiplier、Notify、Sequencer | `FKawaiiPhysicsSettingsMultiplier` | [アニメーション連携](/docs/internals/animation-control) | [Settings Multiplier](/docs/features/settings-multipliers) |
| Data Asset、プリセット | `UKawaiiPhysicsPresetDataAsset` | [Data Asset とプリセット](/docs/internals/presets-and-data-assets) | [Data Asset](/docs/features/data-assets) |
| エディタ統合 | `UAnimGraphNode_KawaiiPhysics`、`FKawaiiPhysicsEditMode` | [エディタモジュール](/docs/internals/editor-module) | ― |
| エディタツール | Wind Scope、Node Audit、`UKawaiiPhysicsEditorLibrary` | [エディタツール](/docs/internals/editor-tools) | [Wind Scope](/docs/features/wind-scope) |

## 読む順序

<DocFigure src="/img/generated/internals-reading-map-ja.svg" alt="内部設計の7グループと各ページ、全体理解・不具合調査・改造の3つの読む経路" caption="上段の緑・青・橙の経路を目的に合わせて選び、下段の7グループから各ページを探します。" maxWidth={960} />

目的ごとの順序です。

- **全体を理解する:** [1フレームの処理順](/docs/internals/frame-lifecycle) → [ボーンモデル](/docs/internals/bone-model) → [シミュレーション](/docs/internals/simulation) の順に読むと、ほかのページの前提がそろいます。
- **不具合を調べる:** [調査ガイド](/docs/internals/investigation-guide)の症状別の手順から入ります。
- **機能を追加・変更する:** [改造ガイド](/docs/internals/modification-guide)で変更箇所と不変条件を確認し、該当する機能のページへ進みます。
- **ソースを読み始める:** `AnimNode_KawaiiPhysics.cpp` の `EvaluateSkeletalControl_AnyThread` が評価処理の起点です。初期化は `Initialize_AnyThread`、Game Thread の更新は `PreUpdate`、外部からの要求は `RequestXxx` 系の関数が入口です。

## 全体に共通する設計

### Game Thread 側で解決した参照をキャッシュする

Subsystem やオーナー Actor のような参照は、`PreUpdate` と `OnInitializeAnimInstance` であらかじめ解決してメンバに保持します。`CachedSharedCollisionSubsystem` や `CachedSimpleWorldCollisionSkelComp` がこの例です。評価中に UObject へ一切触らないわけではありません。`SimulateModifyBones` は `SkelComp->GetWorld()`、`GetDefault<UKawaiiPhysicsDeveloperSettings>()`、`UPhysicsSettings::Get()` を呼びます。UObject 型の外力も評価中に実行されます。

### Game Thread から Worker へはキューで渡す

一時外力、Gust、設定倍率の要求は、`RequestXxx` 系の関数がキューへ積み、Worker 側が評価中に `Swap` して取り込みます。ルートボーンの検証で早期 return した評価では取り込まないため、取り込みは評価につき最大1回です。

### 重い収集は Subsystem に分離する

Simple World Collision の形状収集は Subsystem の Tick が行い、ノードは結果の読み取りのほか、Entry の登録と解放、再収集の要求を行います。詳細は[Simple World Collision](/docs/internals/simple-world-collision)を参照してください。

### ノードの設定値と実行時の値を分ける

`PhysicsSettings` などのプロパティは設定値で、ボーンごとの `Bone.PhysicsSettings` が実行時の値です。`GetRuntimeNodeInfosOnComponent` は、シミュレーション後の位置、入力ポーズの位置、倍率の適用後の `Radius` など、直近の評価で使われた値を返します。

### 毎フレームの確保を避ける

作業配列はメンバとして保持して再利用します（`BridgeFeedbackPushScratch`、`ConsumingForces` など）。`KawaiiPhysicsTests` には再利用を確認するテスト（`KawaiiPhysics.TransientForce.QueueBufferReuse`、`KawaiiPhysics.SimpleWorld.ConvexBuffer.ReadReuse` など）があります。

### 上限を設ける

実行時に増える要素には上限 `MaxTransientExternalForces` と `MaxPhysicsSettingsMultipliers` があります。取り込み済みの配列は先頭（最も古い要素）から破棄します。一時外力の待機キューは、通常の外力と Gust を合わせて上限を判定し、追加する要求と同じ種類の最も古い要素を優先して破棄します。全要求を時系列で比較するわけではありません。

## 用語

| 用語 | 意味 |
|---|---|
| ModifyBone | シミュレーションする質点。`FKawaiiPhysicsModifyBone` |
| 実ボーン | スケルトンに存在するボーン |
| 末端ダミー | 末端の先に作る仮想ボーン。`DummyBoneLength` |
| Inter-Bone ダミー | 親子の間に挿入する仮想ボーン。Subdivision で作られる |
| Bridge ダミー | 横方向の Bone Constraint 上に置くコリジョン用の仮想ボーン |
| Limit | コリジョン形状。Sphere、Capsule など |
| シミュレーション空間 | `Location` などの座標の基準。`EKawaiiPhysicsSimulationSpace` |
| ステップ | `SimulateOnce` 1回。1回の評価で0回以上走る |
| 評価 | `EvaluateSkeletalControl_AnyThread` 1回 |
| 一時外力 | 実行時に追加される寿命つきの外力。Transient External Force |
| Source / Target | Shared Collision の形状の提供側と利用側 |
| Provider / Reader | Simple World Collision の収集の提供側と利用側 |

## 関連ページ

- [ノードのライフサイクルと1フレームの処理順](/docs/internals/frame-lifecycle)
- [調査ガイド](/docs/internals/investigation-guide)
- [改造ガイド](/docs/internals/modification-guide)
