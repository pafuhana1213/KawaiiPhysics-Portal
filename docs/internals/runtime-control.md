---
sidebar_position: 13
title: "ランタイム制御と要求キュー"
description: "UKawaiiPhysicsLibrary の API 構造、ノード参照の解決、Worker 評価との競合回避、要求キュー、ハンドル、再初期化要求、ランタイム情報を説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# ランタイム制御と要求キュー

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

このページでは、ノードの特定方法、経路ごとの同期の有無、要求が `TransientForceStore` へ取り込まれるまでの流れ、再初期化要求、ランタイム情報の読み出しを説明します。取り込まれた一時外力が `Simulate` の中でどう適用されるかは[外力](/docs/internals/external-forces)を、設定倍率の駆動モデルは[アニメーション連携](/docs/internals/animation-control)を参照してください。

## このページの要点

**概要**

`UKawaiiPhysicsLibrary` は、Blueprint、C++、Thread Safe な AnimBP 関数から KawaiiPhysics ノードを操作する入口です。設定の読み書き、一時外力や設定倍率の要求、診断用のランタイム情報の取得を提供します。

**設計**

ノードの評価は Worker で走るため、API はノードのメンバへ直接書くものと、キューへ要求を積むものに分かれています。直接書く経路は同期を持たず、呼び出してよい文脈を呼び出し側が守ります。キューの経路では要求を Mutex の内側の Pending 配列へ積み、評価の中で Worker が取り込みます。実行中の項目はノードの `TransientForceStore` が持ち、Worker だけが触ります。

**理解のポイント**

- API は機能よりも書き込み経路で見ると整理できます。経路ごとに、書き込み先、同期の有無、反映のタイミングが異なります。
- キューへ積んだ要求は、評価の中で取り込まれるまで反映されません。評価が走らない間は項目の時間が進まず、要求は上限の範囲でキューに残ります。
- キューにも実行中の配列にも上限があり、超えると古い項目が破棄されます。ハンドルは値だけを持つため、項目が消えた後の停止要求は何もしません。
- 値を書くだけでは反映されない設定があります。再初期化要求で内部状態を作り直しますが、Data Asset の再取り込みとボーン参照の解決は含みません。

<DocFigure src="/img/generated/internals-write-routes-ja.svg" alt="ノードへの直接書き込み、再初期化要求、要求キュー、外力ごとの Pending、Entry の Pending を、書き込み先、同期、反映時点で比較する図" caption="5つの書き込み経路を上から下に並べ、各行で書き込み先、同期方法、反映時点を左から右へ比較します。" maxWidth={960} />

## 関連ファイル

| ファイル | 役割 |
|---|---|
| [`Public/KawaiiPhysicsLibrary.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsLibrary.h) | API の宣言。単純な Getter / Setter と名前指定アクセスの本体はヘッダ内にある |
| [`Private/KawaiiPhysicsLibrary.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsLibrary.cpp) | ノードの収集、一時効果の要求、ランタイム情報の組み立て、CustomThunk |
| [`Public/AnimNode_KawaiiPhysics.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNode_KawaiiPhysics.h) | 要求の構造体、`FKawaiiPhysicsTransientForceQueue`、`FKawaiiPhysicsTransientForceStore`、上限の定数 |
| [`Private/AnimNode_KawaiiPhysics.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysics.cpp) | 要求の受付（`Request...`）、`ResetTransientRuntimeState`、再初期化の処理 |
| [`Private/AnimNode_KawaiiPhysicsSimulation.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsSimulation.cpp) | 要求の取り込み（`ConsumeAndRemoveExpiredTransientExternalForces`、`ConsumeAndAdvancePhysicsSettingsMultipliers`） |
| [`Public/KawaiiPhysicsTypes.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsTypes.h) | `FKawaiiPhysicsTransientHandle`、`FKawaiiPhysicsSettingsMultiplier` |
| [`Public/KawaiiPhysicsRuntimeInfoTypes.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsRuntimeInfoTypes.h) | `GetRuntimeNodeInfosOnComponent` が返す構造体 |

## API の分類

`UKawaiiPhysicsLibrary` の関数は、機能よりも書き込み経路で見ると整理できます。表の「経路」は後述の[書き込みの経路と同期](#write-paths)に対応します。

| カテゴリ | 主な API | 経路 |
|---|---|---|
| ノード参照の取得 | `ConvertToKawaiiPhysics`、`ConvertToKawaiiPhysicsPure`、`CollectKawaiiPhysicsNodesFromAnimInstance`、`CollectKawaiiPhysicsNodesFromComponent`、`ConvertToKawaiiPhysicsSharedPublisher`、`CollectKawaiiPhysicsSharedPublisherNodes`、`CollectKawaiiPhysicsSharedPublisherNodesOnComponent` | 読み取り |
| 個別プロパティ | `SetPhysicsSettings`、`SetGravity`、`SetDummyBoneLength`、`SetRootBoneName`、`SetExcludeBoneNames`、`SetLimitsDataAsset`、`SetSharedCollisionSource`、`SetUseSimpleWorldCollision` など（対応する Get） | 直接。項目により再初期化要求 |
| 名前指定のプロパティ | `SetNodeBoolProperty` ほか型別の Set / Get、`SetNodeWildcardProperty`、`GetNodeWildcardProperty`、C++ の `SetNodePropertyValueFromString`、`GetNodePropertyValueAsString` | 直接。項目により再初期化要求 |
| プリセット | `ApplyPresetDataAsset` | 直接と再初期化要求 |
| 外力の配列 | `AddExternalForceWithExecResult`、`AddExternalForcesOnComponent`、`RemoveExternalForcesOnComponent`、`FindExternalForceIndicesByStruct`、`SetExternalForceFloatProperty` ほか型別の Set / Get | 直接 |
| 一時外力と突風 | `AddTransientExternalForce`、`StartProceduralWindGust`、`StopTransientExternalForce`（それぞれ `OnComponent` 版あり） | 要求キュー |
| 設定倍率 | `StartPhysicsSettingsMultiplier`、`StopPhysicsSettingsMultiplier`（`OnComponent` 版あり）、C++ の `PushPhysicsSettingsMultiplier`、`PushPhysicsSettingsMultiplierOnComponent`、`GenerateTransientHandle`、`IsTransientHandleSet` | 要求キュー |
| Procedural Wind の値 | `SetProceduralWindParameters`、`GetProceduralWindParameters`、`SetProceduralWindParametersOnComponent`、`ApplyProceduralWindPreset`、`ApplyProceduralWindPresetOnComponent` | 外力ごとの Pending |
| Alpha | `SetAlphaOnComponent`、`GetAlphaOnComponent` | 直接 |
| Shared Publisher | `SetSharedPublisherEnabled`、`SetSimpleWorldCollisionSettingsOnSharedPublisher`、`GetSimpleWorldCollisionSettingsOnSharedPublisher`、`StartProceduralWindGustOnSharedPublisher`、`StopProceduralWindGustOnSharedPublisher`、`SetProceduralWindParametersOnSharedPublisher` | Entry の Pending |
| 診断 | `GetRuntimeNodeInfosOnComponent`、`GetSimpleWorldColliderCount`、`GetSimpleWorldColliderCountOnComponent`、`GetSimpleWorldCollisionDebugInfo`、`GetSharedPublisherDebugInfo`、コンソールコマンド `p.KawaiiPhysics.DumpNodes` | 読み取り |

`AddExternalForce`、`AddExternalForcesToComponent`、`RemoveExternalForcesFromComponent`、`SetAlphaToComponent`、`GetAlphaFromComponent` は非推奨で、上の表の関数へ委譲しているか、`AddExternalForce` のように内部実装として残っています。

## ノードの特定

`FKawaiiPhysicsReference` は `FAnimNodeReference` の派生で、`FInternalNodeType = FAnimNode_KawaiiPhysics` を宣言しているだけの構造体です。参照の作り方は2つあります。

`ConvertToKawaiiPhysics` は、AnimGraph のノード参照を `FAnimNodeReference::ConvertToType` で型変換します。Pure 版は同じ処理の結果を `bool` で返します。

`CollectKawaiiPhysicsNodes` は `UAnimInstance` と `USkeletalMeshComponent` の2つのオーバーロードを持つ C++ 関数で、Blueprint には `...FromAnimInstance` と `...FromComponent` が公開されています。AnimInstance 版は `IAnimClassInterface::GetAnimNodeProperties()` を走査し、`IsChildOf(FAnimNode_KawaiiPhysics)` を満たすプロパティから `FAnimNodeReference(AnimInstance, Index)` を作ります。Component 版は `GetAnimInstance()`、`GetLinkedAnimInstances()`、`GetPostProcessInstance()` の順で AnimInstance 版を呼びます。どちらも結果を `Nodes` へ追記します。引数の `nullptr` は `ensure` で検出され、`false` が返ります。

`OnComponent` 系の API と Notify は呼び出しのたびにこの走査を行い、結果をキャッシュしません。`GetRuntimeNodeInfosOnComponent` だけは AnimInstance のクラス名とノード番号を記録するため、同じ走査を独自に持っています。

`FilterTags` が空なら全件が対象です。KawaiiPhysics ノードは `KawaiiPhysicsTag` を `UBlueprintGameplayTagLibrary::MatchesAnyTags` で照合します。Shared Publisher の収集はノードの `SharedGroupTag` を `FilterTags.HasTagExact` または `FilterTags.HasTag` で照合します。

## 書き込みの経路と同期 {#write-paths}

Library の大半の関数は `KawaiiPhysics.CallAnimNodeFunction<FAnimNode_KawaiiPhysics>` のラムダでノードへ触れます。ヘッダのスレッド契約のとおり、`CallAnimNodeFunction` はノードへ即時に関数を実行するだけで、評価との同期は行いません。`meta=(BlueprintThreadSafe)` も AnimGraph の Thread Safe な文脈から呼べることを示す指定で、実行時の排他は伴いません。

このため、ノードのメンバを読み書きする API の呼び出し元は、次のどちらかに限られます。

- 対象ノード自身の AnimGraph の Thread Safe な文脈
- 対象ノードが評価されていないタイミングの Game Thread

収集系の API にも同じ考え方の契約があり、Thread Safe な文脈から収集できる対象は、呼び出しノード自身の AnimInstance または Component だけです。これらはコード上で強制されません。Game Thread の判定を持つのは、Shared Publisher 系の解決（`ResolveLiveSharedPublisherEntry`）、`GetSharedPublisherDebugInfo`、`DumpKawaiiPhysicsNodes` と、`GetSimpleWorldCollisionDebugInfo` の呼び出し先である Subsystem の `BuildSimpleWorldCollisionDebugInfo` だけです。Subsystem 側は `ensure(IsInGameThread())` で判定し、Shipping ビルドでは常に `false` を返します。

同期を伴う経路は、用途ごとに別の Mutex を持ちます。

| 経路 | 書き込み先 | 同期 | 反映のタイミング |
|---|---|---|---|
| 直接 | ノードの UPROPERTY | なし（呼び出し側の契約） | 読み手が次に参照したとき |
| 再初期化要求 | `bModifyBonesNeedsReinit`、`bSharedCollisionNeedsReinit` | なし（`bool` の書き込み） | 次の `EvaluateSkeletalControl_AnyThread` |
| 要求キュー | `FKawaiiPhysicsTransientForceQueue` の Pending 配列 | `Queue->Mutex` | 受付の後、取り込み関数の `Swap` に到達した評価 |
| 外力ごとの Pending | `FKawaiiProceduralWindRuntimeState` の `PendingParams`、`PendingGust`、`PendingGustStop` | `RuntimeState->Mutex` | 次の `PreApply` |
| Entry の Pending | `FKawaiiPhysicsSharedPublisherEntry` の `PendingGusts` など | `GustMutex` | Publisher の次の更新 |

要求キューの経路でも、ノード参照の解決はキューの外で行います。ラムダの中で触るのは `Request...` 関数だけで、配列へのアクセスは Mutex の内側に閉じています。`SetProceduralWindParameters` は `ExternalForces` のインデックス確認と要素の取得をロックの外で行い、値の受け渡しだけが `RuntimeState->Mutex` で保護されます。

### 要求キューの構造

<DocFigure src="/img/generated/internals-queue-swap-ja.svg" alt="6本の Pending 配列と Consuming 配列の Mutex 内での Swap、ロック外の Store への反映、上限による破棄、Reset による容量保持を示す図" caption="番号順に受付、種類ごとの Swap、Store への反映、Reset をたどり、橙の枠で受付時と実行中の配列の上限を確認します。" maxWidth={960} />

`FKawaiiPhysicsTransientForceQueue` は `FCriticalSection Mutex` と、要求の種類ごとの Pending 配列6本を持ちます。配列は一時外力の `PendingForces`、`PendingGusts`、`PendingStops` と、設定倍率の `PendingSettingsMultipliers`、`PendingSettingsMultiplierPushes`、`PendingSettingsMultiplierStops` です。

`FAnimNode_KawaiiPhysics` のメンバは `FKawaiiPhysicsTransientForceStore TransientForceStore` です。`Items` と `SettingsMultiplierItems` は Worker だけが触る実行中の状態で、`Consuming...` の6本は Pending 配列と容量を交換するための配列です。`Queue` は `TSharedPtr<FKawaiiPhysicsTransientForceQueue, ESPMode::ThreadSafe>` で持ちます。

取り込みでは、ロックの中で Pending と Consuming を `Swap` するだけで、要素の処理はロックの外で行います。処理後に `Consuming...` を `Reset` すると要素は破棄され、確保済みのメモリは残ります。次の評価でこの空の配列が Pending 側へ渡るため、定常状態では再確保が起きません。`KawaiiPhysics.TransientForce.QueueBufferReuse` は、数フレームの後に保持バイト数が一定になることを確認しています。

`TransientForceStore` は UPROPERTY ではありません。GC の追跡対象にならないため、キューへ入れる外力は `KawaiiPhysics::CanQueueTransientExternalForce` で検査します。条件は、`FInstancedStruct` が有効、`FKawaiiPhysics_ExternalForce` の派生、live な UObject 参照を含まないことです。参照の検出（`StructMemoryHasLiveObjectReference`）は構造体、`FInstancedStruct` の中身、配列、Set、Map を再帰的に見ます。Soft / Weak / Lazy 参照は対象外で、`TScriptInterface` は対象です。`RequestTransientExternalForce` 自体は検査を行わないため、C++ から直接呼ぶ場合は参照の生存を呼び出し側が保証します。

一時外力には `Initialize(Context)` が呼ばれません。呼ばれるのは `Initialize_AnyThread` が走査する `ExternalForces` の要素だけで、取り込み処理にはこの呼び出しがありません。ヘッダのコメントのとおり、`Initialize` に依存する汎用の外力は動作が制限されます。ProceduralWind は `RuntimeState` を `PreApply` で遅延作成するため、この制限を受けません。

### ノードのコピー

Store のコピーコンストラクタは既定コンストラクタへ委譲するため、コピー先は新しいキューを持つ空の Store になります。代入演算子は何もしません。コードのコメントはこの理由を二重消費の回避としています。`Queue` は `TSharedPtr` ですが、ノード間で共有されることはありません。`KawaiiPhysics.TransientForce.StoreCopyIsIndependent` と `QueueBufferReuse` がこの性質を確認しています。

## 取り込みの流れ

評価の中で取り込み関数が2回呼ばれます。どちらも `RootBone` の検証より後にあります。

1. `ConsumeAndAdvancePhysicsSettingsMultipliers(DeltaTime)` は `UpdatePhysicsSettingsOfModifyBones` の前に呼ばれます。詳細は[設定倍率の取り込み](/docs/internals/animation-control#consume)を参照してください。
2. `ConsumeAndRemoveExpiredTransientExternalForces(DeltaTime)` は `UpdateSkelCompMove` の後、`WarmUp` と `SimulateModifyBones` の前に呼ばれます。コードのコメントのとおり、1評価に1回だけ取り込むことで、WarmUp の反復や Teleport による `Simulate` のスキップの影響を受けません。

一時外力の取り込みは次の順で進みます。

1. `Items` の `RemainingLifetime` から `InFrameDeltaTime` を引き、0 以下の項目を削除します。
2. ロックの中で3本の配列を `Swap` します。
3. `ConsumingForces` を `Items` へ移します。このとき `bIsOneShot` を `false` に戻し、寿命は Store 側で管理します。
4. `ConsumingGusts` を `BuildTransientGustForce` で `FKawaiiPhysics_ExternalForce_ProceduralWind` の項目へ展開します。
5. `ConsumingStops` を処理します。同じ評価で積まれた開始要求にも停止が届きます。
6. `MaxTransientExternalForces` を超えた分を先頭から削除し、`Consuming...` を `Reset` します。

要求段階の突風はパラメータだけで、`FInstancedStruct` は Worker が作ります。`InheritForceIndex` に有効な ProceduralWind の添字があればそれを方向やフィルタの継承元にし、無ければ `bIsEnabled` が真の最初の ProceduralWind を使います。`OnComponent` 版は `TransientGustInheritAllWinds`（`-2`）を渡し、有効な ProceduralWind ごとに1項目へ展開します。有効な ProceduralWind が無ければ、継承元なしの突風を1項目作ります。項目の寿命は `(Rise + Hold + Decay) / max(TimeScale, KINDA_SMALL_NUMBER) + TransientGustLifetimeMargin` で、余裕は `0.2` 秒です。

停止要求は、`BlendOutTime` が `KINDA_SMALL_NUMBER` 以下なら対象の項目を削除します。それ以外では、ProceduralWind は `RequestGustStop` を呼び、寿命を `BlendOutTime / max(TimeScale, KINDA_SMALL_NUMBER) + 0.2` へ置き換えます。コードのコメントのとおり、エンベロープが新しいフェードへ置き換わるため、残り寿命が短いときは延長します。汎用の外力はフェードせず、寿命を `min(残り寿命, BlendOutTime)` に短縮するだけです。

## ハンドル

`FKawaiiPhysicsTransientHandle` は `int64 Id` だけを持つ構造体で、`Id == 0` が未設定を表します。発行元の `GenerateTransientHandleId` は `static std::atomic<int64>` の `fetch_add(1, memory_order_relaxed)` で、値は 1 から始まり、プロセス全体で一意です。コメントのとおり、ID は同期データを運ばず、実データは Mutex で保護されるため relaxed で足ります。

`OnComponent` 版は1つのハンドルを全ノードで共有します。`OutHandle` は呼び出しの最初に `0` へ戻され、1ノード以上へ積めたときだけ設定されます。`QueueTransientExternalForceToNodes` も同じ規則です。

ハンドルはノード側の状態を持たない値です。`IsTransientHandleSet` は `Id != 0` だけを返します。上限超過やノードの再初期化で項目が消えた後も値は残り、停止要求は一致する項目が無いため何もしません。一時外力と設定倍率は同じ発行元を使いますが、停止要求は別の配列（`PendingStops` と `PendingSettingsMultiplierStops`）へ入るため、種類をまたいで効くことはありません。

`GenerateTransientHandle` は C++ 専用で、`BlueprintPure` にしていません。ヘッダのコメントによると、Pure ノードではピンを参照するたびに別のハンドルが発行され、Stop や同一項目の更新が成立しないためです。

## 上限と破棄の方針

`MaxTransientExternalForces` と `MaxPhysicsSettingsMultipliers` はどちらも `8` です。実行中の配列だけでなく Pending 配列にも上限があります。コードのコメントによると、評価が走らないノードへ要求が連続して積まれても、配列が増え続けないようにするためです。

| 配列 | 上限 | 満杯または重複のときの動作 |
|---|---|---|
| `PendingForces` + `PendingGusts` | 合計 8 | `DropOldestPendingTransientForceIfFull` が、追加する種類の最古を破棄する。その種類が無ければ、もう一方の最古を破棄する |
| `PendingStops` | 8 | 同じハンドルは `BlendOutTime` を上書きする。別のハンドルなら最古を破棄する |
| `PendingSettingsMultipliers` | 8 | 最古を破棄する |
| `PendingSettingsMultiplierPushes` | 8 | 同じハンドルは最新の要求で上書きする。別のハンドルなら最古を破棄する |
| `PendingSettingsMultiplierStops` | 8 | 同じハンドルは `BlendOutTime` を上書きする。別のハンドルなら最古を破棄する |
| `Items` | 8 | 取り込みの最後に先頭から削除する。Verbose ログ |
| `SettingsMultiplierItems` | 8 | 取り込みの最後に先頭から削除する。無限 Hold の項目は非 Shipping で Warning ログ、他は Verbose ログ |

`Items` と `SettingsMultiplierItems` の「最古」は配列の先頭です。既存の項目を置き換える要求は配列の位置を変えません。`TransientGustInheritAllWinds` の展開が上限を超えると先頭側の項目が消えるため、共通ハンドルは残った項目だけを指します。`KawaiiPhysics.TransientForce.SpreadAcrossAuthoredWinds` がこの動作を固定しています。

無限 Hold の Warning は、`WarnedInfiniteHoldSettingsMultiplierEvictionHandleIds` でハンドルごとに1回へ抑えます。この集合が `MaxWarnedInfiniteHoldSettingsMultiplierEvictionHandleIds`（`64`）に達すると丸ごとリセットします。

## 再初期化要求

ノードの設定には、値を書くだけでは反映されず、内部状態の作り直しが必要なものがあります。再初期化要求には3種類あります。

| 要求 | 実体 | 処理の位置 |
|---|---|---|
| `RequestModifyBonesReinit` | `bModifyBonesNeedsReinit = true` | `ShouldReinitModifyBones` が真なら `ModifyBones` を空にし、同じ評価の `InitModifyBones` で作り直す |
| `RequestSharedCollisionReinit` | `bSharedCollisionNeedsReinit = true` | `EvaluateSkeletalControl_AnyThread` の冒頭。旧 Slot の期限切れ処理と共有配列の破棄を、無効なルートボーンによる早期 return より前に行う |
| `RequestSimpleWorldCollisionReinit` | 関数内で状態を戻し、`CachedSimpleWorldEntry` から離脱して手放す | 呼び出した時点。機能が有効なら次の評価で `InitializeSimpleWorldCollision` が走る |

`ShouldReinitModifyBones` は `bModifyBonesNeedsReinit` に加えて、`LastInitialized...` と現在値の差も見ます。対象は Subdivision の各数、`bBoneSubdivisionDensifyByRadius`、Densify 有効時の `PhysicsSettings.Radius`、`DummyBoneLength` です。これらは Library を通らない書き込みでも検出されます。`ModifyBones` が空のときは判定を通らず、`InitModifyBones` の後でフラグが落ちます。`TeleportType == ETeleportType::ResetPhysics` の処理でも `ModifyBones` が空になるため、同じくフラグが落ちます。

個別の Setter は、`SetDummyBoneLength`、`SetBoneSubdivisionCount`、`SetRootBoneName` のように構造に関わる項目だけが要求を出します。`SetBoneConstraintSubdivisionFeedbackScale` のようなスカラーは値を書くだけです。

名前指定の API は、`KawaiiPhysicsLibrary.cpp` の3つの集合で要求の要否を判定します。

| 関数 | 対象のプロパティ |
|---|---|
| `GetNodeModifyBonesReinitPropertyNames` | `RootBone`、`ExcludeBones`、`AdditionalRootBones`、`DummyBoneLength`、`BoneSubdivisionCount`、`bBoneSubdivisionCollisionOnly`、`bBoneSubdivisionDensifyByRadius`、`BoneForwardAxis`、`RadiusCurveData`、`LimitsDataAsset`、`PhysicsAssetForLimits`、`MirrorDataTableForLimits`、`bSkipMirroredBoneWithExistingCollision`、`BoneConstraintSubdivisionCount`、`BoneConstraints`、`BoneConstraintsDataAsset` |
| `GetNodeSharedCollisionReinitPropertyNames` | `bSharedCollisionSource`、`bUseSharedCollision`、`SharedCollisionGroupTag` |
| `GetNodeSimpleWorldCollisionReinitPropertyNames` | `bUseSimpleWorldCollision`、`SimpleWorldCollisionSource`、`SimpleWorldCollisionSharedTag` |

Simple World の収集設定の多くが3つ目の集合に無いのは、`UpdateSimpleWorldCollisionLimits` の Desc 差分検知が毎フレーム追従するためです。コードのコメントに対象の一覧があります。3つ目の集合は、`CopyNodeDataToPreviewNode` のプレビュー同期からも `DoesNodePropertyRequireSimpleWorldCollisionReinit` 経由で参照されます。

再初期化は、Data Asset の再取り込みとボーン参照の解決を含みません。`ApplyLimitsDataAsset`、`ApplyPhysicsAsset`、`ApplyMirrorLimits`、`ApplyBoneConstraintDataAsset` の呼び出し元は `Initialize_AnyThread` と、`WITH_EDITOR` の評価ループだけです。`SetRootBoneName` と `SetExcludeBoneNames` は `FBoneReference(Name)` を代入して要求を出すだけで、`InitializeBoneReferences` は呼びません。ボーン参照の解決は `CacheBones_AnyThread` 経由と、PIE 外のエディタ評価で行われます。

## 名前指定のプロパティアクセス

`SetNode...Property` 系は、`FName` でノードのプロパティを読み書きします。入口の判定は `IsNodePropertyAccessible` にまとまっています。

1. プロパティの `GetOwnerStruct()` が `FAnimNode_KawaiiPhysics` であること。基底クラスの `Alpha` は対象外です。
2. `CPF_Transient`、`CPF_EditorOnly` が付いていないこと。
3. `ExternalForces`、`CustomExternalForces` ではないこと（`IsDeniedRuntimeNodePropertyName`）。
4. `UKawaiiPhysicsPresetDataAsset::ClassifyNodeProperty` が `Deny` でも `Unknown` でもないこと。

4番目のとおり、プリセットの分類表がプロパティアクセスの許可リストを兼ねています。分類の詳細は[Data Asset とプリセット](/docs/internals/presets-and-data-assets)を参照してください。

書き込みの実体は3系統です。`SetNodePropertyValue` は `FindFProperty<PropertyType>` で型を確認します。`SetNodeStructPropertyValue` は `FVector`、`FRotator`、`FTransform`、`FGameplayTag` だけを受け付けます。ワイルドカード版は `CustomThunk` で `Stack.StepCompiledIn` から入力ピンのプロパティとアドレスを取り、`SameType` が一致したときだけ `CopyCompleteValue` します。

どの系統も書き込みの後で3つの集合を確認し、必要な再初期化を要求します。`SetNodePropertyValueFromString` と `GetNodePropertyValueAsString` は `ImportText_Direct` と `ExportTextItem_Direct`（`PPF_ExternalEditor`）を使う C++ 専用の経路で、`UKawaiiPhysicsEditorLibrary` が利用しています。

`SetExternalForce...Property` 系は別の仕組みです。`ExternalForces[Index]` の `GetScriptStruct()` からプロパティを探すため、`IsNodePropertyAccessible` は通りません。ワイルドカード版は Set / Get とも `SameType` が一致したときだけコピーし、`ExecResult` を `Valid` にします。

## ランタイム情報

`GetRuntimeNodeInfosOnComponent` は、直近の評価で使われたボーン、コリジョン、拘束をコンポーネント空間で返す診断用の API です。ノードごとに `KawaiiPhysics::BuildRuntimeNodeInfo` を呼び、`AnimInstanceClassName` と `NodeIndex` を呼び出し側で埋めます。`BuildRuntimeNodeInfo` はコンポーネント無しでテストできるよう公開されています。

ヘッダの契約では Game Thread 専用で、評価中には呼ばず、コンポーネントの Tick の後に呼びます。`ModifyBones` と各コリジョン配列をロック無しで読むため、この契約が前提です。コード上のスレッド判定はありません。`MeshComp` が `nullptr` なら `-1` を返し、`OutError` に理由を入れます。

変換の基準は `GetSimulationSpace2ComponentSpace` が返す `CurrentEvalSimSpaceCache.TargetSpaceToComponent` です。

- `bEvaluated` は `bHasCurrentEvalSimSpaceCache` の値です。偽なら変換は Identity で、`Bones` と `Limits` の位置は意味を持ちません。
- 半径と寸法のスケールは `SimulationToComponent` のスケール絶対値の最大成分です。`X` と `Y`、または `X` と `Z` の差が `1e-3` を超えると `bNonUniformScale` が立ち、これらの値は近似になります。`Y` と `Z` の差は比較しません。
- `Bones[].Radius` は `Bone.PhysicsSettings.Radius` を元にするため、設定倍率が反映された値です。
- `Limits` はノード直持ち、Data Asset などの `XxxLimitsData`、Shared、Simple World の順に並びます。Convex は含めず、`NumConvexLimits` に件数だけを返します。
- `Limits[].bEnabled` は `IsRuntimeLimitEnabled` で判定します。コメントのとおり、この関数は `AdjustBySphereCollision` など衝突処理のスキップ条件を写したものです。Shared は `bUseSharedCollision && !bSharedCollisionSource`、Simple World は `bUseSimpleWorldCollision` と `CVarSimpleWorldCollisionEnable` も条件に含みます。
- `Constraints` は `GetMergedBoneConstraints` から、`IsValid()` が真で両端のインデックスが有効なものだけを返します。出どころは `bIsDummy` なら `AutoDummy`、配列の添字が `BoneConstraints.Num()` 未満なら `AnimNode`、それ以外は `DataAsset` です。

## 状態とライフサイクル

| イベント | `Items` / `SettingsMultiplierItems` | Pending 配列 | 補足 |
|---|---|---|---|
| `Initialize_AnyThread` | 破棄 | 破棄 | `ResetTransientRuntimeState` が実行する。`bPhysicsSettingsMultiplierAppliedLastUpdate` も戻す |
| BP の再コンパイル | 失われる | 失われる | ヘッダのコメントに明記。ハンドルの値は残り、停止は何もしない |
| Library の `ResetDynamics` | 保持 | 保持 | `ResetPhysics` を渡すため次の評価で `ModifyBones` が作り直されるが、Store には触らない |
| `ResetDynamics(TeleportPhysics)` | 保持 | 保持 | ノードの関数は Teleport 種別を保存するだけで、この種別では `ModifyBones` を空にしない |
| Teleport | 保持 | 取り込まれる | WorldSpace の Teleport で `Simulate` をスキップしても、取り込みと寿命の減算は実行される |
| `ModifyBones` の再構築 | 保持 | 保持 | `bInitPhysicsSettings` が倒れ、次の更新で倍率も含めて計算される |
| ルートボーンが無効で早期 return | 時間が進まない | 残る | 取り込み関数まで到達しない。Pending は上限の範囲で積まれ続ける |
| URO / LOD で評価されないフレーム | 時間が進まない | 残る | 取り込みは評価の中だけで行う。`DeltaTime` は `UpdateInternal` で上書きされ、積算されない |
| ノードのコピー | コピーされない | コピーされない | コピー先は新しいキューを持つ |

WarmUp は取り込みの後で実行されるため、同じ評価で取り込まれた項目は WarmUp の反復からも参照されます。

## 他機能との関係

**Procedural Wind**: 一時突風は要求時ではなく取り込み時に `ExternalForces` を参照し、方向やフィルタをコピーします。その間に配列を変更すると、`InheritForceIndex` の指す要素も変わります。コピーするのは外力の現在のメンバで、`PendingParams` は含みません。`PendingParams` は取り込みの後に走る `SimulateModifyBones` の `PreApply` で反映されるため、同じ評価で `SetProceduralWindParameters` と突風を要求すると、突風は更新前の値を継承します。

`SetProceduralWindParameters` 系と `ApplyProceduralWindPreset` 系が更新するのは `ExternalForces` の要素だけで、`TransientForceStore` の項目には届きません。Shared または Auto で Publisher に接続している外力では、`PendingParams` を取り込んだ後、新しい共有状態があれば `ApplySharedWindState` が共有13項目を上書きします。`PendingParams` は Publisher へ転送されません。共有中の値を変えるには `SetProceduralWindParametersOnSharedPublisher` を使います。詳細は[Procedural Wind](/docs/internals/procedural-wind)と[Shared Publisher](/docs/internals/shared-publisher)を参照してください。

**外力の配列**: `AddExternalForce` は `ExternalForces` へ直接追加します。このとき引数の構造体の `ExternalOwner` と `bIsOneShot` を書き換え、`Force.Initialize` は呼びません。配列の要素番号が変わるため、インデックスを保持する呼び出し側へ影響します。

**Notify と Sequencer**: どちらも Library の要求キューを使い、同じノードの `SettingsMultiplierItems` の上限 8 を Blueprint の Start と共有します。入口と配列の対応は[アニメーション連携](/docs/internals/animation-control)にまとめています。

**プリセット**: `ApplyPresetDataAsset` は `ExternalForces` と `CustomExternalForces` を変更しないため、外力のインデックスと `TransientForceStore` は適用の前後で保たれます。

**エディタのプレビュー**: `CopyNodeDataToPreviewNode` は `ModifyBones` を空にしますが、`TransientForceStore` には触りません。

## 変更するときの注意

要求の種類を追加するときは、次の箇所を揃えます。

1. `FKawaiiPhysicsTransientForceQueue` の Pending 配列と、`FKawaiiPhysicsTransientForceStore` の Consuming 配列
2. 上限と破棄の処理を持つ `Request...` 関数
3. `ResetTransientRuntimeState` のリセット
4. 取り込み関数の `Swap` と `Reset`
5. `KawaiiPhysicsRequestQueueReuseTest.cpp` の `FQueueBufferSnapshot` と `ProduceAndConsumeAllRequestTypes`

守るべき不変条件は次のとおりです。

- 取り込み関数は Worker 専用で、1評価に1回だけ呼びます。ヘッダのコメントに明記されています。
- `ConsumeAndAdvancePhysicsSettingsMultipliers` は `UpdatePhysicsSettingsOfModifyBones` より前に呼びます。
- 要求の受付で触ってよいのは `Queue` の中だけです。`Items` と `SettingsMultiplierItems` を呼び出し側のスレッドから触ると、Worker と競合します。
- `QueueTransientExternalForceToNodeUnchecked` は検査済みを前提とします。公開 API は先に `CanQueueTransientExternalForce` を通します。
- 新しいプロパティを `Set` できるようにするときは、3つの再初期化の集合も確認します。手順は[プリセットへの追加手順](/docs/internals/presets-and-data-assets#add-property)にあります。
- `IsRuntimeLimitEnabled` は `AdjustBy...` 系のスキップ条件と揃えます。`BuildRuntimeNodeInfo` の拘束の出どころは、`InitBoneConstraints` が `BoneConstraints`、`BoneConstraintsData`、ダミー拘束の順に結合することに依存しています。

関連するテストは次のとおりです。

| 対象 | テスト |
|---|---|
| キューと Store | `KawaiiPhysics.TransientForce.QueueBufferReuse`、`StoreCopyIsIndependent`、`CapDropsOldest`、`StopCoalesce`、`Stop`、`GustLifetime` |
| ハンドルと共有 | `KawaiiPhysics.TransientForce.HandleId`、`AddTransientOnComponentSharesHandle`、`SpreadAcrossAuthoredWinds` |
| UObject 参照の拒否 | `KawaiiPhysics.TransientForce.LiveObjectReferenceDetection` |
| プロパティアクセス | `KawaiiPhysics.PropertyAccess.RoundTrip`、`DenyList`、`Reinit`、`WildcardSameType`、`KawaiiPhysics.Library.PropertyStringFormat` |
| ランタイム情報 | `KawaiiPhysics.Library.RuntimeNodeInfo.NullComponent`、`UnevaluatedNode`、`SharedAndGroundSources`、`ConstraintSources` |

## 関連ページ

- [ノードのライフサイクルと1フレームの処理順](/docs/internals/frame-lifecycle)
- [外力](/docs/internals/external-forces)
- [アニメーション連携](/docs/internals/animation-control)
- [Data Asset とプリセット](/docs/internals/presets-and-data-assets)
- [Shared Publisher](/docs/internals/shared-publisher)
- [ランタイム制御（ユーザー向け）](/docs/advanced/runtime-control)
- [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library)
- [一時効果・風の API](/docs/api/transient-effects)
- [ノード属性とプリセットの API](/docs/api/runtime-properties)
- [GetRuntimeNodeInfosOnComponent](/docs/api/runtime-diagnostics)
