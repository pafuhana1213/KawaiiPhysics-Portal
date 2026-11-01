---
sidebar_position: 20
title: "改造ガイド"
description: "KawaiiPhysics に機能を追加・変更するときの変更箇所、守るべき不変条件、変更後の確認を説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# 改造ガイド

このページは、1つの変更が複数のファイルへ波及する箇所を、作業の種類ごとにまとめています。詳細は各機能のページの「変更するときの注意」を参照してください。

## このページの要点

**概要**

KawaiiPhysics へ機能を追加・変更するときの手順です。最初に全体の不変条件を確認し、作業の種類に対応する節で変更箇所を確認して、作業の後に「変更後の確認」のテストを実行します。

**設計**

変更は1か所で閉じません。同じ情報を別の形で持つ箇所があるためで、たとえばプロパティの一覧はプリセットの分類とプレビューのコピーに別々にあり、1ステップの処理順は本番とテストのハーネスの両方にあります。そのため、作業ごとに同時に直す箇所を確認し、漏れを検出する手段があるかどうかも確かめます。

**理解のポイント**

- 追加する処理が評価単位かステップ単位かを最初に決めます。ステップ内の処理は `DeltaTime` の代わりに `GetStepDeltaTime()` を使います。
- 位置を変更する処理は、順序と副作用を確認します。コリジョンの前後で結果が変わり、`Location` だけを動かすと、積分する点では、最終位置に残った補正が次のステップの速度にも反映されます。
- 評価は Worker で実行される場合があります。追加する処理が触るデータと走るスレッドを確認し、Game Thread からの書き込みはキューを経由します。
- 漏れを検出するテストが無い箇所があります。表の「漏れの検出」が「なし」の項目はテストで見つからず、CI も Automation Test を実行しないため、変更後は手元で確認します。

## 全体の不変条件

どの変更でも次の条件を維持します。

| 条件 | 内容 |
|---|---|
| 親が子より前 | `ModifyBones` は親が子より前に並びます。`Simulate` と長さ復元はこの順序に依存します |
| Bridge ダミーの親 | Bridge ダミーは `ParentIndex` が負です。`ModifyBones[Bone.ParentIndex]` を読む処理の前に確認します |
| `dt` の取得 | ステップ内の処理は `DeltaTime` ではなく `GetStepDeltaTime()` を使います |
| 処理の単位 | 要求の取り込みと形状の追従は評価単位、`SimulateOnce` の中はステップ単位です |
| 空間 | `Location`、`PrevLocation`、`PoseLocation`、形状の位置はシミュレーション空間です |
| 位置の補正 | `Location` だけを動かすと、積分する点では、最終位置に残った補正が次のステップの速度にも反映されます |
| 評価スレッド | 評価は Worker で実行される場合があります。Game Thread 専用の API を呼びません |
| Game Thread からの書き込み | 評価中のノードへ直接書かず、キューを経由します |

## 作業別の変更箇所

<DocFigure src="/img/generated/internals-change-ripple-ja.svg" alt="プロパティ、ステップ処理、コリジョン形状、要求、倍率成分の追加や変更に伴う確認箇所の対応図" caption="左側の作業から右側へたどると、同時に確認する実装やテストが分かります。" maxWidth={960} />

### ノードに UPROPERTY を追加する

分類表の更新は必須です。手順は[プリセットにプロパティを追加する](/docs/internals/presets-and-data-assets#add-property)を参照してください。確認する箇所は次のとおりです。

| 箇所 | 内容 | 漏れの検出 |
|---|---|---|
| `GetCopyTargetPropertyNames` などの分類 | `Unknown` のままだと Preset と名前指定の API が使えない | `KawaiiPhysics.Preset.PropertyClassification` |
| `CopyNodeDataToPreviewNode` | Persona のライブ編集へ届ける | なし |
| カテゴリ名 | `KawaiiPhysicsEditorCategoryNames.h` と一致させる | `KawaiiPhysics.Editor.CategoryConsistency` |
| 再初期化の3集合 | 名前指定の API から変更したときの再初期化 | なし |
| `ShouldReinitModifyBones` | ボーンやダミーの生成条件、初期配置に関わる設定を自動検出する場合 | なし |

### 実行時の状態を追加する

`Initialize_AnyThread`、`ResetTransientRuntimeState`、`ResetDynamics` のそれぞれでリセットするか決めます。[リセット系イベントの比較](/docs/internals/frame-lifecycle)の表を基準にしてください。

`FAnimNode_KawaiiPhysics` はコピーされる構造体です。ポインタやキャッシュを持たせる場合は、コピーの後の動作を確認します。

### 1ステップの処理を追加・変更する

1. `SimulateOnce` または `Simulate` に処理を追加します。
2. 処理の位置を決めます。コリジョンの前後で結果が変わります。長さ復元は最後に実行され、それまでの補正の長さ成分を上書きします。
3. ダミーの扱いを決めます。`bSkipSimulate`、`bInterBoneDummy`、`bBridgeDummy`、`bBoneSubdivisionCollisionOnly` の組み合わせを確認します。比較表は[ボーンモデル](/docs/internals/bone-model)にあります。
4. `KawaiiPhysicsTestHarness.h` の `StepOnce` と `StepFrame` を同時に直します。本番の処理順を複製しているためです。ハーネスは単純な縦チェーン向けで、外力、Bridge ダミー、LOD、World のスイープ、`BaseBoneSpace` には対応していません。これらに関わる変更は Golden テストだけでは検証できません。
5. Golden テストを実行します。結果が意図どおりなら基準値を更新します。

### コリジョン形状を追加する

確認する箇所は[ローカルコリジョン](/docs/internals/collision)の「同時に直す箇所」にあります。Simple World Collision と Shared Collision に載せる場合は、それぞれのページの変更箇所も確認します。

`XxxLimitsData` へ要素を足す経路では、`SourceType` と `DrivingBone.Initialize` を同じ経路で設定します。`WITH_EDITOR` のビルドでは同じ処理が毎評価走るため、自分の要素を消せないと重複します。

### 外力を追加する

自作の手順は[外力](/docs/internals/external-forces)にあります。組み込みの判定に関わる点は次のとおりです。

- `PreApply` は `SimulateModifyBones` の呼び出し単位で、WarmUp の間も呼ばれます。時間を持つ場合は `IsWarmingUp()` を確認します。
- `NumSteps` が 0 のフレームは、`PreApply` だけが走り、`Apply` と `PostApply` は走りません。
- `bIsEnabled` が false でも `PreApply` と `PostApply` は呼ばれます。ボーンフィルタを効かせるには、実装の中で `CanApply` を呼びます。
- `ExternalForces` のインデックスは単発の外力の削除でずれます。インデックスを保持しないでください。
- Procedural Wind の判定は `ScriptStruct` の完全一致です。派生構造体は Procedural Wind 専用の API の対象になりません。

### Procedural Wind のパラメータを追加する

風のサンプルの合成は `ComputeWindSample`、`Apply`、`AnimDrawDebugForEditMode` の3か所にあります。追加の手順は[Procedural Wind](/docs/internals/procedural-wind)、プリセットに含める場合は[Data Asset とプリセット](/docs/internals/presets-and-data-assets#add-property)を参照してください。

### Game Thread からの要求を追加する

1. `FKawaiiPhysicsTransientForceQueue` に Pending 配列を追加します。
2. `FKawaiiPhysicsTransientForceStore` に対応する Consuming 配列を追加します。
3. `RequestXxx` 関数を追加し、`Queue->Mutex` の下で上限を確認して積みます。
4. 評価の取り込み処理で `Swap` して消費します。
5. `ResetTransientRuntimeState` にリセットを追加します。
6. `KawaiiPhysicsRequestQueueReuseTest` の `FQueueBufferSnapshot` を更新します。

取り込みはルート検証の後に行われます。ルートが無効な間、要求はキューに残ります。

### Settings Multiplier の成分を追加する

`FKawaiiPhysicsSettingsMultiplier` への追加は、`ComputeEffectivePhysicsSettingsMultiplierScale`、`UpdatePhysicsSettingsOfModifyBones` の2つの分岐、Sequencer の Section と Template のチャンネル、TrackEditor へ波及します。詳細は[アニメーション連携](/docs/internals/animation-control)を参照してください。

### ボーンのインデックスを持つフィールドを追加する

`InitModifyBones` の `InitRootBone` は、ルートごとに作った配列を連結するときにインデックスへオフセットを加算します。新しいインデックスのフィールドもここで加算します。

### Subsystem のデータを追加する

- Simple World Collision の Desc に追加するときは、`operator==`、`DoesChangeRequireRegather`、`Merge`、2つの `BuildSimpleWorldCollisionDesc`、`AreSimpleWorldSettingsEqual` を同時に直します。
- Tick 専有のフィールドに評価スレッドから触らないでください。
- ロックの順序は[Subsystem と Shared Collision](/docs/internals/shared-collision)を参照してください。

### プロパティの名前を変更する

`Plugins/KawaiiPhysics/Config/DefaultKawaiiPhysics.ini` の `PropertyRedirects` に追加します。旧名はチェーンさせず最終名へ直接向けます。単位が変わる場合は、既存の例のようにリダイレクトしない判断もあります。

`UFUNCTION` の名前を変更するときは、`Content/Python/kawaii_physics_toolset/` の呼び出しも確認します。C++ のコンパイルでは検出されません。

### CVar や Stat を追加する

- CVar は `AnimNode_KawaiiPhysics.cpp` にまとめて定義します。他のファイルからは `extern` で参照します。
- 複数の `.cpp` で共有する Stat は、`AnimNode_KawaiiPhysicsInternal.h` で `DECLARE_..._EXTERN` し、`AnimNode_KawaiiPhysics.cpp` で `DEFINE_STAT` します。1つの `.cpp` でしか使わない Stat は、外力や Subsystem の実装のようにその `.cpp` 内で `DECLARE_CYCLE_STAT` します。

## エンジンバージョンの互換

対応範囲は UE 5.3 から 5.8 です。API の差は `UE_VERSION_OLDER_THAN` で分岐します。`KawaiiPhysicsTests` と Editor 系のモジュールも同じ範囲をビルドします。対応バージョンの表記は `Tools/check_version_consistency.py` と CI が確認します。

## 変更後の確認

CI はバージョン表記の確認だけで、Automation Test は実行しません。変更後は手元で実行してください。変更箇所ごとの対応は[テスト](/docs/internals/testing)を参照してください。

最低限、次を実行します。

| 変更 | テスト |
|---|---|
| シミュレーション全般 | `KawaiiPhysics.Simulation` |
| 形状と押し出し | `KawaiiPhysics.Collision`、`KawaiiPhysics.SimpleWorld` |
| UPROPERTY の追加 | `KawaiiPhysics.Preset`、`KawaiiPhysics.Editor` |

Golden テストは要素数が一致しないと採取モードになり、Warning だけで成功します。ボーン構成を変えたテストでは、Warning の有無も確認してください。

`KawaiiPhysics.Simulation.ProductionNodeEvaluation` は基本的なチェーンで本番の初期化と評価を実行しますが、複雑な生成条件は網羅していません。次の処理は変更したらエディタでも確認します。

- `InitModifyBones` と `InitBoneConstraints` の複雑な生成条件、`InsertBridgeDummiesForConstraints`
- `InitSyncBones`、`ApplySyncBones` の全体
- `CopyNodeDataToPreviewNode` の列挙の漏れ

## 関連ページ

- [内部設計の全体像](/docs/internals/overview)
- [ノードのライフサイクルと1フレームの処理順](/docs/internals/frame-lifecycle)
- [調査ガイド](/docs/internals/investigation-guide)
- [テスト](/docs/internals/testing)
