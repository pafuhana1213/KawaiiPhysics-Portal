---
sidebar_position: 14
title: "アニメーション連携（Settings Multiplier / Notify / Sequencer）"
description: "Settings Multiplier の3つの駆動モデルと取り込み処理、AnimNotify 群の実装と後始末、Sequencer モジュールの評価と Restore State を説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# アニメーション連携（Settings Multiplier / Notify / Sequencer）

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

このページでは、駆動モデルと取り込み処理、Notify の実装と中断時の後始末、Sequencer の評価と復元を説明します。要求キューの構造とハンドルは[ランタイム制御と要求キュー](/docs/internals/runtime-control)を参照してください。

## このページの要点

**概要**

Settings Multiplier は、ノードの設定値を書き換えずに、各ボーンの実効値へ一時的な倍率を掛ける仕組みです。AnimNotify はこの倍率に加えて外力、Alpha、突風を再生のタイミングに合わせて操作し、Sequencer はタイムラインから倍率を駆動します。

**設計**

Blueprint、AnimNotify、Sequencer はそれぞれ時間の持ち方が異なるため、倍率の項目には時間型、Infinite Hold、Push の3つの駆動モデルがあります。時間型と Infinite Hold はノード側で時間を進め、Push は呼び出し側が適用率を送り続けます。アニメーション由来の入口は `UKawaiiPhysicsLibrary` を通り、倍率の要求はキューを経由して1評価に1回取り込まれます。合成した倍率は各ボーンの `Bone.PhysicsSettings` へ書き込まれます。

**理解のポイント**

- 入口ごとの駆動モデルを押さえると、終了の条件を追いやすくなります。AnimNotifyState と Sequencer は Push を使い、Blueprint の Start は時間型か Infinite Hold を使います。
- リースのない Push は、Stop が届かないと残り続けます。これに備えて、NotifyState はリースによる自動フェードと状態の掃除を持ち、Sequencer は複数の停止経路を持ちます。
- 取り込みの順序が結果を決めます。経過時間を進めてから Push、Start、Stop の順に適用するため、同じハンドルへの要求が重なる場合は受付時の処理と合わせて読みます。
- ベースの値と実効値を区別します。倍率が掛かってもノードの `PhysicsSettings` は変わらないため、`GetPhysicsSettings` やプリセットの比較に倍率は現れません。

## 関連ファイル

| ファイル | 役割 |
|---|---|
| [`Public/AnimNode_KawaiiPhysics.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNode_KawaiiPhysics.h) | `FKawaiiPhysicsActiveSettingsMultiplier`、要求の構造体、`ShouldUpdatePhysicsSettings` |
| [`Private/AnimNode_KawaiiPhysicsSimulation.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsSimulation.cpp) | `ConsumeAndAdvancePhysicsSettingsMultipliers`、`ComputeEffectivePhysicsSettingsMultiplierScale`、`UpdatePhysicsSettingsOfModifyBones` |
| [`Private/KawaiiPhysicsLibrary.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsLibrary.cpp) | `BuildSettingsMultiplierStartRequest`、Start / Stop / Push の API、`ResolveWindGustEnvelope`、`EvaluateEnvelopeAlpha01` |
| [`Public/AnimNotifies/AnimNotifyState_KawaiiPhysicsSettingsMultiplier.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNotifies/AnimNotifyState_KawaiiPhysicsSettingsMultiplier.h) | `FActiveStateKey`、`LeaseEvaluations`、`StaleStateFrameThreshold` の宣言と設計のコメント |
| [`Private/AnimNotifies/AnimNotifyState_KawaiiPhysicsSettingsMultiplier.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNotifies/AnimNotifyState_KawaiiPhysicsSettingsMultiplier.cpp) | 再生インスタンスごとの管理、Push、リース、掃除 |
| [`Private/AnimNotifies/AnimNotifyState_KawaiiPhysicsAddExternalForce.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNotifies/AnimNotifyState_KawaiiPhysicsAddExternalForce.cpp) | 区間中の外力の追加と除去 |
| [`Private/AnimNotifies/AnimNotifyState_KawaiiPhysicsSetAlpha.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNotifies/AnimNotifyState_KawaiiPhysicsSetAlpha.cpp) | 区間中の Alpha の上書きと復元 |
| [`Private/AnimNotifies/AnimNotify_KawaiiPhysicsTriggerGust.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNotifies/AnimNotify_KawaiiPhysicsTriggerGust.cpp) | 突風の開始。ノード宛てと Shared Publisher 宛ての分岐 |
| [`KawaiiPhysicsSequencer/Private/MovieSceneKawaiiPhysicsSettingsMultiplierTemplate.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsSequencer/Private/MovieSceneKawaiiPhysicsSettingsMultiplierTemplate.cpp) | 評価、対象の Component の収集、Pre-Animated State |
| [`KawaiiPhysicsSequencer/Private/KawaiiPhysicsSequencerMultiplierRegistry.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsSequencer/Private/KawaiiPhysicsSequencerMultiplierRegistry.cpp) | 停止漏れを防ぐ Entry の登録簿 |
| [`KawaiiPhysicsEd/Private/Sequencer/KawaiiPhysicsSettingsMultiplierTrackEditor.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/Sequencer/KawaiiPhysicsSettingsMultiplierTrackEditor.cpp) | Sequencer の UI（エディタ専用） |

## 入口とキューの対応

アニメーション由来の入口はすべて `UKawaiiPhysicsLibrary` を通ります。どの配列へ入るかは次のとおりです。

<DocFigure src="/img/generated/internals-entry-to-queue-ja.svg" alt="Library を通る AnimNotify、AnimNotifyState、Sequencer と一時外力の要求から、設定倍率用と外力用の Pending 配列、Shared Publisher Entry、直接書き込み先への対応図" caption="各行を左から右へ読み、入口と操作から要求が入る配列または直接書き込まれるメンバを確認します。" maxWidth={960} />

設定倍率の3本は `ConsumeAndAdvancePhysicsSettingsMultipliers` が取り込み、`PendingForces`、`PendingGusts`、`PendingStops` は `ConsumeAndRemoveExpiredTransientExternalForces` が取り込みます。Shared Publisher の Entry は Publisher ノードの更新で消費されます。Notify の Add ExternalForce と Set Alpha はキューを使わず、ノードのメンバへ直接書き込みます。

## 設定倍率の駆動モデル

<DocFigure src="/img/generated/internals-multiplier-models-ja.svg" alt="時間型、Infinite Hold、Push の適用率 α の時間変化と、Stop 時に現在の適用率を PeakAlpha へ畳み込んでフェードする仕組みを示す図" caption="上段の3つのグラフで適用率の推移を比較し、下段で Stop 時の係数と時間パラメータの変換を読みます。" maxWidth={960} />

実行中の倍率は `TransientForceStore.SettingsMultiplierItems` の `FKawaiiPhysicsActiveSettingsMultiplier` です。`bInfiniteHold` と `bExternallyDriven` の組み合わせでモデルが決まります。

| モデル | 開始 | 適用率 | 終了 |
|---|---|---|---|
| 時間型 | `Start...`（`Duration > 0`） | `PeakAlpha * EvaluateEnvelopeAlpha01(Rise, Hold, Decay, ElapsedTime)` | `ElapsedTime >= Rise + Hold + Decay` で削除 |
| Infinite Hold | `Start...`（`Duration < 0`） | `PeakAlpha * Clamp(ElapsedTime / Rise, 0, 1)`。`Rise` が 0 なら `PeakAlpha` | Stop でのみ終了 |
| Push（外部駆動） | `Push...` | `DrivenAlpha` | Stop またはリース失効でのみ終了 |

`BuildSettingsMultiplierStartRequest` が Start の引数を要求へ変換します。`Duration == 0` は `false` を返し、要求は積まれません。`Duration < 0` では `DecayTime` を 0 にします。解放時間は Stop の `BlendOutTime` で決まるため、Start の `BlendOutTime` は保持しません。`Duration > 0` は `ResolveWindGustEnvelope` で台形へ解決し、`Rise + Decay > Duration` のときは両者を比例圧縮して `Hold` を 0 にします。

Push はハンドルを呼び出し側が事前に発行します。Alpha は 0〜1 にクランプされます。内部時間では終わらないため、Stop が届かないと残り続けます。Blueprint には公開されておらず、Blueprint の無期限の用途は `Duration < 0` の Start が担います。

### リース型の Push

`LeaseEvaluations` が 1 以上の Push はリースを持ちます。Push を取り込むたびに `LeaseRemaining` が `LeaseEvaluations` へ戻り、取り込み処理の先頭で評価ごとに 1 減ります。`LeaseRemaining` が 0 以下になると、`LeaseExpireBlendOutTime` を使って Stop と同じ処理でフェードを始めます。つまり、N 回の評価で Push が届かなければ失効します。`KawaiiPhysics.SettingsMultiplier.DrivenLease` がこの動作を固定しています。

`LeaseEvaluations == 0` は無期限です。AnimNotifyState は `LeaseEvaluations = 4`、Sequencer は 0 を使います。

### Stop の畳み込み

Stop は項目を消さずに、時間型のフェードへ変換します。`StopSettingsMultiplierAtIndex` は `BlendOutTime` が `KINDA_SMALL_NUMBER` 以下なら項目を削除します。それ以外では現在の適用率を `PeakAlpha` へ畳み込みます。

- 外部駆動は `PeakAlpha = DrivenAlpha`
- 時間型と Infinite Hold は `PeakAlpha *= 現在のエンベロープ値`

続けて `Rise = 0`、`Hold = 0`、`Decay = BlendOutTime`、`ElapsedTime = 0` に置き換え、`bInfiniteHold` と `bExternallyDriven` を倒します。コードのコメントのとおり、乗算で畳み込むため、フェード中に再度 Stop しても適用率は跳ね上がりません。フェード中の項目へ Push すると、ハンドルで同じ項目が見つかり、再び外部駆動へ戻ります。

## 取り込み {#consume}

`ConsumeAndAdvancePhysicsSettingsMultipliers` は `EvaluateSkeletalControl_AnyThread` から1評価に1回、`UpdatePhysicsSettingsOfModifyBones` の前に呼ばれます。

1. 既存の全項目の `ElapsedTime` を進め、リース付きの外部駆動項目の `LeaseRemaining` を減らします。進めてから取り込むことで、このフレームに積まれた時間型は `ElapsedTime = 0` から始まります。`RiseTime` が正なら、適用率も 0 から立ち上がります。
2. ロックの中で Push、Start、Stop の3本を `Swap` します。
3. Push を適用します。ハンドルで項目を探し、無ければ追加します。
4. Start を適用します。既存の項目があれば置き換えます。
5. Stop を適用します。
6. リースが切れた項目を `StopSettingsMultiplierAtIndex` でフェードへ移します。
7. 終了した時間型の項目を削除します。
8. `MaxPhysicsSettingsMultipliers` を超えた分を先頭から削除します。
9. `Consuming...` を `Reset` し、項目が残っていれば `true` を返します。

同じハンドルへの要求が同じ評価に重なると、受付時の処理と取り込みの順序で結果が決まります。`RequestPushPhysicsSettingsMultiplier` は受付時に同じハンドルの Pending の Stop と Start を削除します。Start と Stop の受付は他の配列に触りません。

| 同一ハンドルの要求順 | 結果 |
|---|---|
| Start → Push | Start が除去され、外部駆動になる |
| Stop → Push | Stop が除去され、外部駆動になる |
| Push → Start | Push の後に Start が適用され、時間型になる |
| Push → Stop | Push の後に Stop が適用され、フェードする |
| Start → Stop | Start の後に Stop が適用され、フェードする |
| Stop → Start | 呼び出し順によらず、Start の後に Stop が適用される |

### 実効倍率の計算

`ComputeEffectivePhysicsSettingsMultiplierScale` は全項目を走査して1つの `FKawaiiPhysicsSettingsMultiplier` へ合成します。項目ごとに適用率で線形補間し、成分ごとに乗算します。

```cpp
Effective.Damping *= FMath::Lerp(1.0f, Item.Scale.Damping, EnvelopeAlpha);
```

`UpdatePhysicsSettingsOfModifyBones` はこの結果を `PhysicsSettings * カーブ値 * 倍率` の形で各ボーンの `Bone.PhysicsSettings` へ書きます。ノードの `PhysicsSettings` は変更しません。各成分のクランプは次のとおりです。

| 成分 | 計算後の処理 |
|---|---|
| `Damping`、`Stiffness`、`WorldDampingLocation`、`WorldDampingRotation` | 0〜1 にクランプ |
| `Radius` | 0 以上にクランプ |
| `LimitAngle` | ベースが 0 なら 0 のまま。ベースが正なら `KINDA_SMALL_NUMBER` を下限にする |
| `PerAxisLimitAngle` | `ScalePerAxisLimitAngle` でスケールする。0 は全軸ロックになる |

`LimitAngle == 0` は制限なしを意味するため、制限ありのボーンが倍率で 0 へ落ちて制限なしへ反転しないよう、下限を設けています。

### 更新のゲート

`ShouldUpdatePhysicsSettings` は次のいずれかで真を返します。

```cpp
return !bInitPhysicsSettings || bUpdatePhysicsSettingsInGame ||
    bHasActiveSettingsMultiplier || bPhysicsSettingsMultiplierAppliedLastUpdate;
```

更新の後、`bPhysicsSettingsMultiplierAppliedLastUpdate` に `bHasActiveSettingsMultiplier` を保存します。`bUpdatePhysicsSettingsInGame` が `false` のノードでは、倍率が有効な間に毎評価更新し、項目が消えた直後の1回でベース値へ戻します。その次の評価からは、`bInitPhysicsSettings` が真なら更新が止まります。`KawaiiPhysics.SettingsMultiplier.GatingRestore` がこの動作を確認しています。`bEditing` が真の間は評価ループが `bInitPhysicsSettings` を立てないため、倍率の終了後も更新が続きます。

## AnimNotify と AnimNotifyState

| クラス | 表示名 | 開始・更新 | 終了 |
|---|---|---|---|
| `UAnimNotify_KawaiiPhysicsAddExternalForce` | KawaiiPhysics: Add ExternalForce (Pulse) | `AddExternalForcesOnComponent`（`bIsOneShot = true`） | `PostApply` の後で配列から削除 |
| `UAnimNotifyState_KawaiiPhysicsAddExternalForce` | KawaiiPhysics: Add ExternalForce | `NotifyBegin` で追加 | `NotifyEnd` の `RemoveExternalForcesOnComponent` |
| `UAnimNotifyState_KawaiiPhysicsSetAlpha` | KawaiiPhysics: Set Alpha (Override) | `NotifyBegin`、`NotifyTick` の `SetAlphaOnComponent` | `NotifyEnd` で保存値へ戻す |
| `UAnimNotifyState_KawaiiPhysicsSettingsMultiplier` | KawaiiPhysics: Settings Multiplier | `NotifyBegin`、`NotifyTick` の Push | `NotifyEnd` の Stop |
| `UAnimNotify_KawaiiPhysicsSettingsMultiplier` | KawaiiPhysics: Settings Multiplier (Pulse) | `StartPhysicsSettingsMultiplierOnComponent` | 時間型の寿命で終了 |
| `UAnimNotify_KawaiiPhysicsTriggerGust` | KawaiiPhysics: Trigger Gust | `StartProceduralWindGustOnComponent` または `StartProceduralWindGustOnSharedPublisher` | 突風の寿命で終了 |

対象の解決は、Shared Publisher 宛ての突風を除いて `CollectKawaiiPhysicsNodes(MeshComp, FilterTags, bFilterExactMatch)` を使います。本体の AnimInstance に加えて Linked AnimInstance と PostProcess のノードも対象で、`FilterTags` が空なら全ノードが対象です。収集は呼び出しのたびに行うため、NotifyTick でも毎回走ります。

### Add ExternalForce

どちらのクラスも `AdditionalExternalForces` を `Owner = this` で追加します。`AddExternalForce` は引数の構造体へ `ExternalOwner` と `bIsOneShot` を書いてからノードへコピーするため、Notify が持つ配列の要素も書き換わります。

Pulse 版は `FKawaiiPhysics_ExternalForce::PostApply` が `bRemovalRequestedAfterPostApply` を立て、`FKawaiiPhysicsExternalForcePostApply::Apply` が配列から削除します。State 版は `NotifyEnd` で `FilterTags` を使って再収集し、`ExternalOwner == this` の要素を削除します。削除はフェードを伴いません。

State 版の後始末は `NotifyEnd` だけで、Settings Multiplier のリースや状態の掃除に当たる処理はありません。`NotifyEnd` が届かない場合や、区間中にノードが `FilterTags` の対象から外れた場合、外力は配列に残ります。再生ごとの区別もなく、同じ Notify が同じ Component で重なると、最初の `NotifyEnd` が `ExternalOwner == this` の要素をまとめて削除します。

### Set Alpha

`NotifyBegin` で `GetAlphaOnComponent` の値を保存し、Tick ごとに `ResolveAlpha` の結果を書き込み、`NotifyEnd` で保存値を書き戻します。`GetAlphaOnComponent` は一致した最初のノードの値を返します。保存先は `SavedAlpha` と `bHasSavedAlpha` の Notify のメンバで、Settings Multiplier のような Component ごとの管理は持ちません。`Alpha` は `FAnimNode_SkeletalControlBase` のメンバへ直接書きます。

### Settings Multiplier（State）

`UAnimNotifyState_KawaiiPhysicsSettingsMultiplier` は外部駆動の Push を使い、再生インスタンスごとの状態を `ActiveStates` で管理します。キーは `FActiveStateKey` で、Component と、UE 5.8 以降は `NotifyInstanceID` です。

ヘッダのコメントによると、5.7 以前はエンジンが Begin と Tick / End で別アドレスのイベントコピーを渡すため、ポインタは識別子になりません。`NotifyStateClass` は Instanced で `this` がイベントと 1:1 なので、5.7 以前は Component だけで識別し、同じイベントの重なりは `ActiveCount` で統合します。

処理の流れは次のとおりです。

1. `NotifyBegin` は `CleanupStaleStates` を実行します。同じキーの状態があれば `ActiveCount` を増やして終わります。無ければ `GenerateTransientHandle` でハンドルを発行し、`ResolveWindGustEnvelope(TotalDuration, BlendInTime, BlendOutTime)` でエンベロープを求めて最初の Push を行います。
2. `NotifyTick` は `ElapsedTime` を `FrameDeltaTime` で進めて `TotalDuration` にクランプし、重みを計算して Push します。リースはこの Push で更新されます。
3. `NotifyEnd` は `ActiveCount` を減らします。0 以下なら `BlendOutTime` で Stop を送り、状態を削除します。最後に `CleanupStaleStates` を実行します。

重みの取得元は `WeightSource` で選びます。`Envelope` は `NotifyTick` の時間を積算するため、ヘッダのコメントのとおり、PlayRate が 1 以外のときや逆再生、スクラブでは区間とずれます。`Curve` は `MeshComp->GetCurveValue`（UE 5.5 以前は `GetCurveValueWithDefault`）の値を使います。

Montage の中断などで区間が途中で終わると、`NotifyEnd` の Stop が現在の `DrivenAlpha` を起点に `BlendOutTime` でフェードします。Envelope が末尾まで再生された場合は、最後の Tick の重みが小さいため、その値を起点に同じ処理が走ります。

`NotifyEnd` が届かない場合の保険が2段あります。

| 保険 | 値 | 動作 |
|---|---|---|
| ノード側のリース | `LeaseEvaluations = 4` | Push が途絶えるとノードが自動でフェードする |
| Notify 側の掃除 | `StaleStateFrameThreshold = 300` | `GFrameCounter` の差が閾値を超えた状態を Stop して削除する。Component が無効な状態も削除する |

ヘッダのコメントによると、`NotifyEnd` はエディタの再インスタンス化中にスキップされることがあります（`UAnimInstance::UninitializeAnimation`）。掃除は同じ Notify の次の Begin / End で走るため、それまで小さなエントリが残ります。コメントでは、アセット共有のオブジェクトに Ticker を持たせる寿命のリスクの方が大きいとして、この設計を選んだと説明しています。

### Settings Multiplier（Pulse）と Trigger Gust

Pulse の Settings Multiplier は時間型の Start で、ハンドルは保存しません。`Duration <= 0` なら何もしません。コードのコメントのとおり、一発の Notify に無限 Hold は許可しません。

Trigger Gust は `Duration = RiseTime + max(HoldTime, 0) + DecayTime` を計算し、`bRealTimeEnvelope = false` で要求します。`GustTarget` が `Nodes` なら Component の対象ノードへ `TransientGustInheritAllWinds` で積み、ハンドルは破棄します。`SharedPublisher` なら `MeshComp->GetOwner()` と `SharedPublisherTag` で Entry を解決します。`FilterTags` と `GustDirection` は使いません。Entry の解決は Game Thread でのみ成功し、生存している Entry が無ければ何も起きません。

## Sequencer 連携

`KawaiiPhysicsSequencer` は Runtime モジュールで、`LoadingPhase` は `PreDefault` です。依存は `Core`、`CoreUObject`、`Engine`、`MovieScene`、`KawaiiPhysics`、`GameplayTags` で、エディタのモジュールには依存しません。Sequencer の UI は `KawaiiPhysicsEd` 側にあり、ランタイムの型を参照する一方向の関係です。

| 型 | モジュール | 役割 |
|---|---|---|
| `UMovieSceneKawaiiPhysicsSettingsMultiplierTrack` | Sequencer | トラック。`bIsRootTrack` でルートトラックを区別し、`CreateTemplateForSection` でテンプレートを作る |
| `UMovieSceneKawaiiPhysicsSettingsMultiplierSection` | Sequencer | 6成分と `Weight` のチャンネル、`FilterTags`、`BlendOutTimeOnEnd` を持つ |
| `FMovieSceneKawaiiPhysicsSettingsMultiplierSectionTemplate` | Sequencer | チャンネルのコピーを持つ評価テンプレート |
| `FKawaiiPhysicsSequencerMultiplierEntry` | Sequencer | Component 1つ分の駆動状態。ハンドルと `Stop` を持つ |
| `FKawaiiPhysicsSequencerMultiplierRegistry` | Sequencer | Section から Entry への弱参照の登録簿。Game Thread 限定 |
| `FKawaiiPhysicsSettingsMultiplierTrackEditor` | Ed | トラックの追加メニュー、セクションの描画 |

### 評価の流れ

`FMovieSceneKawaiiPhysicsSettingsMultiplierSectionTemplate::Evaluate` は、`Clamp(Weight, 0, 1) * EvaluateEasing` を Alpha とし、6成分を `EvaluateKawaiiPhysicsScaleChannels` で評価します。負の値は 0 にクランプされます。結果は `FExecutionToken` へ渡します。

`FExecutionToken::Execute` は次の処理を行います。

1. 対象の Component を集めます。バインド付きトラックは `Player.FindBoundObjects(Operand)` の結果を使い、Actor なら保持する全 `USkeletalMeshComponent` を対象にします。ルートトラックは World 内の全 Component を `TObjectIterator` で走査します。
2. Component ごとに `FSectionData::Entries` の Entry を用意します。無ければハンドルを発行し、Registry へ登録します。
3. Component の初回に `Player.SavePreAnimatedState` で復元トークンを登録します。
4. `PushPhysicsSettingsMultiplierOnComponent` を呼び、キューへ積んだノード数を `LastQueuedNodeCount` に保存します。この6引数のオーバーロードはリースを使いません。
5. 今回の評価で対象から外れた Component の Entry を Stop して削除します。

Entry の作り直しには2つの条件があります。`bStopped` の Entry は、再駆動すると以後の Stop が何もしなくなるため作り直します。`FilterTags`、`bFilterExactMatch`、`BlendOutTime` のいずれかが変わった場合は、古い Entry を Stop してから作り直します。また、前回はノードへ積めたのに今回が 0 件なら、Stop して Entry を削除します。

ルートトラックには制限があります。`FilterTags` が空のとき、または World の種類が Game、PIE、Editor 以外のときは、対象を空にして後段へ流し、以前の Entry を止めます。コードは空のフィルタを安全装置として扱い、エディタのメニューでも Filter Tags が必須だと表示します。走査結果は `RootScanCache` に `0.5` 秒保持します。時刻に `FPlatformTime::Seconds` を使うのは、コメントのとおり、World 時間ではポーズ中にキャッシュが切れないためです。

`Entry::Stop` は `bStopped` で1回に制限され、空のフィルタで `StopPhysicsSettingsMultiplierOnComponent` を呼びます。コメントのとおり、ハンドルは Entry ごとに一意なので、リタグされたノードにも Stop を届けるためです。

### 停止の経路と Restore State

Sequencer の Push はリース無しです。Stop が届かないと倍率が残るため、停止の経路が複数あります。コンストラクタは `EvalOptions` を `RestoreState` に固定し、`bCanEditCompletionMode` を `false` にします。コードのコメントのとおり、区間終了時に Stop するため、KeepState は意味を持ちません。

| 経路 | きっかけ | 呼び出し | フェード |
|---|---|---|---|
| `TearDown` | セクションの評価終了 | 全 Entry の `Stop` と `FSectionData` のクリア | `BlendOutTimeOnEnd` |
| `FPreAnimatedToken::RestoreState` | Pre-Animated State の復元 | `StopForSection(Section, Owner, Component)` | `BlendOutTimeOnEnd` |
| `~FSectionData` | 評価データの破棄 | 全 Entry の `Stop` | `BlendOutTimeOnEnd` |
| Track / Section の編集 | `RemoveSection`、`RemoveSectionAt`、`RemoveAllAnimationData`、`BeginDestroy`、`PostEditUndo` | `StopForSection` または `StopForSectionsNotIn` | `BlendOutTimeOnEnd` |
| `HandleWorldCleanup` | `FWorldDelegates::OnWorldCleanup` | `StopForWorld` | 0（即時） |
| `ShutdownModule` | モジュールの終了 | `StopAll` | 0（即時） |

Registry のヘッダによると、Registry はセクションの削除など、`TearDown` も Pre-Animated の復元も来ない経路（親サブシーケンスの ForceKeepState 下など）に対する保険です。`HandlePostGarbageCollect` の `RemoveInvalidEntries` は無効な参照を掃除するだけで、Stop は送りません。

Pre-Animated の復元は `(Object, AnimTypeID)` をキーにします。同じ Component に複数のセクションが載っても別々に復元されるよう、テンプレートは `FMovieSceneAnimTypeID::Unique()` を持ちます。`FSectionData::InstanceOwner` は評価インスタンスの識別子で、`StopForSection` の Owner フィルタはこれを比較します。Owner が失効していると何も止めません。

### エディタとの境界

`FKawaiiPhysicsEdModule` は `GIsEditor && !IsRunningCommandlet()` のとき `RegisterTrackEditor` を呼びます。`FKawaiiPhysicsSettingsMultiplierTrackEditor` はバインド用とルート用のトラック追加メニューを提供し、ルートトラックでは `bIsRootTrack` を立てます。`FKawaiiPhysicsSettingsMultiplierSectionInterface` はセクションの Weight の曲線を `EvaluateWeightAtTime` で描画し、タイトルへ `MakeKawaiiPhysicsScaleSummaryText` の要約と `GetQueuedNodeCount` の件数を表示します。この件数は Push を積んだノード数の合計で、適用済みの数ではありません。

セクションのコンテキストメニューの Apply Preset（Stiff、Loose、Freeze）は `ApplyKawaiiPhysicsScalePresetToSection` で6チャンネルをリセットして既定値を設定します。これは Sequencer のセクション値のプリセットで、`UKawaiiPhysicsPresetDataAsset` とは関係ありません。

## 状態とライフサイクル

| イベント | 時間型 / Infinite Hold | Push | Notify / Sequencer 側 |
|---|---|---|---|
| `Initialize_AnyThread` | 破棄。ハンドルは失効する | 破棄 | 次の Push で項目が作り直される |
| `ResetDynamics` | 保持 | 保持 | 影響なし |
| Teleport | 保持 | 保持 | 影響なし |
| ルートボーンが無効 | 時間が進まない | 取り込まれない | Pending は上限内で最新値へ集約される |
| URO / LOD で評価されないフレーム | 時間が進まない | 取り込まれない。リースも減らない | 同上 |
| 上限超過 | 先頭から破棄 | 先頭から破棄 | 次の Push で末尾に作り直される |
| Component の破棄 | ノードごと消える | ノードごと消える | Notify は掃除で、Sequencer は GC 後に登録を除去する |

進行は `DeltaTime` を基準にするため、評価が止まると実時間では長く伸びます。

## 他機能との関係

**ダミーボーンと半径**: `LastInitializedRadius` と `ShouldReinitModifyBones` は `PhysicsSettings.Radius` のベース値を見ます。Radius の倍率でダミーボーンの本数は変わりません。

**ランタイム情報**: `FKawaiiPhysicsRuntimeBoneInfo::Radius` は倍率の適用後の値です。ノードの `PhysicsSettings` を読む `GetPhysicsSettings` には倍率が現れません。

**プリセット**: `MatchesNode` はベースの設定値を比較するため、倍率の有無は差分に出ません。

**上限の共有**: `MaxPhysicsSettingsMultipliers` の 8 は、Blueprint の Start、Notify、Sequencer の全項目で共有します。Sequencer はセクションと Component の組ごとに、NotifyState は再生インスタンスごとに1項目を使います。

**リタグ**: NotifyState の Push と Stop は `FilterTags` で対象を再収集するため、区間中に対象から外れたノードには届かず、そのノードはリース失効でフェードします。Sequencer は Push にだけ `FilterTags` を使い、Stop は空のフィルタで送ります。区間中にフィルタの設定が変わらなければ、評価の途中で Entry の Stop が走るのは、一致するノードが 0 件になったときです。同じ Component に一致するノードが残っている間は、対象から外れたノードの項目に Push も Stop も届かず、リースも無いため、最後に Push された値のまま残ります。その項目は Entry の Stop が走った時点で解放されます。

**突風**: Trigger Gust の Nodes 経路は一時外力の Store の上限を消費します。ノードが ProceduralWind を複数持つと、1回の Notify で複数の項目になります。Shared Publisher 経路は[Shared Publisher](/docs/internals/shared-publisher)を参照してください。

## 変更するときの注意

`FKawaiiPhysicsSettingsMultiplier` に成分を追加するときは、次の箇所を揃えます。

1. `ComputeEffectivePhysicsSettingsMultiplierScale` の合成
2. `UpdatePhysicsSettingsOfModifyBones` の2つの分岐（カーブがすべて空の経路と、ボーンごとに評価する経路）
3. Section のチャンネル、コンストラクタの `SetDefault`、`WITH_EDITOR` と非エディタの両方の `Channels` 登録
4. Template のメンバとコンストラクタ、`EvaluateScaleAtTime` と `Evaluate` の `Channels` 配列、`EvaluateKawaiiPhysicsScaleChannels` の添字
5. `ApplyKawaiiPhysicsScalePresetToSection`、`MakeKawaiiPhysicsScaleSummaryString`、`GetKawaiiPhysicsScalePresets`

不変条件は次のとおりです。

- 取り込みは Push、Start、Stop の順です。テストと、同じ評価内で開始と停止を処理する動作がこの順に依存しています。
- 経過時間は取り込みの前に進めます。順序を変えると、新しい時間型の項目が `ElapsedTime = 0` から始まらなくなります。
- Stop の後の項目は時間型として扱います。`Decay` を使わないモデルを追加する場合は、掃除の条件も確認します。
- 外部駆動を使う新しい入口は、停止の経路を用意するか、リースを指定します。
- NotifyState の Notify オブジェクトは同じイベントの全再生で共有されます。再生ごとの値は `ActiveStates` に置きます。
- `Entry::Stop` は冪等です。Sequencer の各経路はこの性質を前提に重複して呼びます。

| 対象 | テスト |
|---|---|
| 要求の変換と時間型 | `KawaiiPhysics.SettingsMultiplier.EnvelopeAlpha`、`RequestConsume`、`StartRequestBuilder` |
| 適用とクランプ | `KawaiiPhysics.SettingsMultiplier.ApplyScale`、`ClampRules`、`Stacking`、`Restore`、`GatingRestore` |
| Stop | `KawaiiPhysics.SettingsMultiplier.StopImmediate`、`StopBlendOut`、`HandleMismatchNoop` |
| Push | `KawaiiPhysics.SettingsMultiplier.DrivenSetCreateAndUpdate`、`DrivenAlphaClamp`、`DrivenNoExpiry`、`DrivenStopBlendOut`、`DrivenSetSupersedesPendingStop`、`SetRemovesPendingStart`、`DrivenLease`、`DrivenReinitClears` |
| Infinite Hold | `KawaiiPhysics.SettingsMultiplier.InfiniteHoldPersists`、`InfiniteHoldStopUsesStopBlendOut`、`InfiniteHoldStopMidRiseCapturesPeak`、`InfiniteHoldReplacedByPush`、`InfiniteHoldReplacedByFiniteStart` |
| 上限 | `KawaiiPhysics.SettingsMultiplier.PendingBounded` |
| Sequencer | `KawaiiPhysics.Sequencer.Section.EvaluateWeight_ChannelDefault`、`TemplateFromTrack`、`EvaluateScale_ChannelKeys`、`Registry_StopForSection`、`Registry_GetQueuedNodeCount`、`Registry_RemoveSectionAtStopsOnlyRemoved`、`Registry_StopForSectionsNotIn`、`Registry_RemoveInvalidEntries`、`Registry_StopAll`、`PreAnimated_RestoreFilters`、`Section_Defaults` |
| Sequencer の UI | `KawaiiPhysics.Sequencer.TrackEditor.ScaleSummary_All`、`ScalePreset_Apply` |

## 関連ページ

- [ランタイム制御と要求キュー](/docs/internals/runtime-control)
- [ノードのライフサイクルと1フレームの処理順](/docs/internals/frame-lifecycle)
- [外力](/docs/internals/external-forces)
- [Shared Publisher](/docs/internals/shared-publisher)
- [Settings Multiplier（ユーザー向け）](/docs/features/settings-multipliers)
- [AnimNotify（ユーザー向け）](/docs/features/animnotify)
- [AnimNotify のリファレンス](/docs/api/animation-notifies)
- [Sequencer（ユーザー向け）](/docs/features/sequencer)
- [一時効果・風の API](/docs/api/transient-effects)
