---
sidebar_position: 10
title: "Subsystem と Shared Collision"
description: "UKawaiiPhysicsSharedCollisionSubsystem のレジストリ、ロック順序、Entry と Slot の寿命、Source / Target ノードの接続手順と鮮度判定を説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# Subsystem と Shared Collision

このページでは Subsystem に共通する構造と、それを使う Shared Collision を説明します。同じ Subsystem を使う他の機能は別ページで扱います。

## このページの要点

**概要**

KawaiiPhysics のノードは AnimInstance ごとに評価されるため、別のメッシュや ChildActor 上のノードと直接データを受け渡せません。`UKawaiiPhysicsSharedCollisionSubsystem` は World ごとに1つ置かれる受け渡し場所です。Shared Collision はこの Subsystem を使い、Source ノードの形状を同じ Actor ファミリーと Tag の Target ノードへ渡します。

**設計**

評価中のノードがロック経由で読み書きし、Game Thread の `Tick` が収集と掃除を担当します。Shared Collision のデータは、Actor ファミリーと Tag をキーとする Entry の中に、Source ごとの Slot として置かれます。Source はワールド空間の形状を Slot へ書き込み、Target は読める Slot を結合して自分のシミュレーション空間へ変換します。Entry と Slot はレジストリとノードの両方が保持するので、使えなくなったことは Entry と Slot 自身の状態で伝えます。

**理解のポイント**

- Subsystem には用途の異なるレジストリが3つあります。互いに独立しているので、どのレジストリの話かを確認しながら読んでください。
- ロックはレジストリ、Entry、バッファの3段です。どのロックが何を守り、どの順で取るかに注目すると、各処理の安全性を追いやすくなります。
- Expired と Retired は別の状態で、対象が Slot か Entry かでも効果と復帰の可否が変わります。期限はフレーム数で判定します。
- Target は物理計算の前に読み、Source は物理計算の後に書きます。評価順によっては、Target が読むのは前回 Publish された形状になります。

Subsystem を使う機能は、次のページに分かれています。

| ページ | 範囲 |
|---|---|
| このページ | Subsystem の構造、ロック、Entry の寿命、Tick、Shared Collision の Source / Target |
| [Simple World Collision](/docs/internals/simple-world-collision) | Game Thread の収集、形状変換、地面 Box、ノード側の読み取り |
| [Shared Publisher](/docs/internals/shared-publisher) | Publisher ノード、Provider / Reader の解決、風の共有クロック |

## 関連ファイル

| ファイル | 役割 |
|---|---|
| [`Public/KawaiiPhysicsSharedCollisionSubsystem.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsSharedCollisionSubsystem.h) | Subsystem、Entry、Slot の宣言。ロック順序の規約はレジストリ宣言のコメントにある |
| [`Private/KawaiiPhysicsSharedCollisionSubsystem.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsSharedCollisionSubsystem.cpp) | 上記の実装。`Tick`、`Deinitialize`、`DoesSupportWorldType` |
| [`Public/KawaiiPhysicsSharedCollisionTypes.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsSharedCollisionTypes.h) | `FKawaiiPhysicsSharedCollisionData`。受け渡しに使う6種類の Limit 配列 |
| [`Private/KawaiiPhysicsCollisionBuffer.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsCollisionBuffer.h) | `FKawaiiPhysicsCollisionBufferWriter`。Convex の内部配列の確保量を保ったままスナップショットを組み直す |
| [`Private/AnimNode_KawaiiPhysics.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysics.cpp) | CVar の定義、`PreUpdate`、`OnInitializeAnimInstance`、`UpdateSharedCollisionRegistration` |
| [`Private/AnimNode_KawaiiPhysicsCollision.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsCollision.cpp) | `InitializeSharedCollision`、`WriteSharedCollisionToSubsystem`、`UpdateSharedCollisionLimits` |

## 設計の要点

### Subsystem の全体構造

`UKawaiiPhysicsSharedCollisionSubsystem` は `UTickableWorldSubsystem` の派生で、用途の異なる3つのレジストリを持ちます。

| レジストリ | キー | Entry | ロック |
|---|---|---|---|
| `Registry` | `(ファミリー root Actor, Tag)` | `FKawaiiPhysicsSharedCollisionEntry` | `RegistryLock` |
| `SimpleWorldRegistry` | `FKawaiiPhysicsSimpleWorldRegistryKey`。Local は `(SkelComp, 無効な Tag)`、Shared は `(ファミリー root Actor, Tag)` | `FKawaiiPhysicsSimpleWorldCollisionEntry` | `SimpleWorldRegistryLock` |
| `SharedPublisherRegistry` | `(ファミリー root Actor, Tag)` | `FKawaiiPhysicsSharedPublisherEntry` | `SharedPublisherRegistryLock` |

3つのレジストリは独立しています。`SharedCollisionGroupTag` と Publisher の `SharedGroupTag` に同じ Tag を指定しても、別のレジストリに入るため干渉しません。キーの UObject は弱参照で保持します。

<DocFigure src="/img/generated/internals-subsystem-map-ja.svg" alt="3つのレジストリと Entry、Slot の所有関係、保護するロック、Tick の役割" caption="3列で各レジストリの Entry とロックをたどり、下段で共有ポインタの保持と Tick の処理を確認します。" maxWidth={960} />

### Actor ファミリー

`GetFamilyRoot` は `GetAttachParentActor()` を辿り、親が無ければ `GetParentActor()` で ChildActor の親へ進み、どちらも無くなった Actor を root として返します。同じ root に到達する Actor の集まりがファミリーです。`TryResolveRegistryKey` はこの root と Tag からキーを作り、Actor が null、Tag が無効、root が取れない場合は失敗します。

`GetFamilyRoot` はポインタを辿るだけの処理で、任意のスレッドから呼びます。宣言のコメントには、並列評価中にアタッチが変わらないことが前提と書かれています。

Shared Collision のノードがこの解決を行うのは Entry を取得するときだけです。接続済みのノードは、アタッチ先が変わっても Entry が retire するか再初期化が要求されるまで、元の Entry を使い続けます。毎フレームのチェックで追従するのは Publisher だけです（[Shared Publisher](/docs/internals/shared-publisher)）。

### スレッド境界

| 処理 | スレッド | 内容 |
|---|---|---|
| `OnInitializeAnimInstance`、`PreUpdate` | Game | Subsystem と Owner Actor を解決してノードへキャッシュする |
| `EvaluateSkeletalControl_AnyThread` | Worker または Game | キャッシュを使って Entry の取得、Publish、読み取りを行う |
| `Tick` | Game | Simple World Collision の収集と Publish、期限切れの除去 |

登録と接続を `PreUpdate` に置かず評価側で行うのは、コードコメントによれば、Blueprint の setter でランタイムに有効化した場合も全ビルド構成で動かすためです。そのため Registry は Worker からも変更され、`IsTickable` の空判定にもロックが必要になっています。

### ロックの粒度と順序

ロックはレジストリ単位、Entry 単位、バッファ単位の3段です。`GustMutex` 以外は `FRWLock` です。

| ロック | 保護するもの |
|---|---|
| `RegistryLock`、`SimpleWorldRegistryLock`、`SharedPublisherRegistryLock` | 各レジストリの `TMap` の構造 |
| `SlotsLock` | `FKawaiiPhysicsSharedCollisionEntry` の `Slots` |
| `DescLock` | `FKawaiiPhysicsSimpleWorldCollisionEntry` の `DescSlots`、`MemberSlots`、マージ済み Desc、`bRetired` |
| `BufferLock` | `FKawaiiPhysicsSharedCollisionSourceSlot` の `Buffer` |
| `StateLock` | `FKawaiiPhysicsSharedPublisherEntry` の `State`、`ProviderID`、`bExpired` |
| `GustMutex` | 同 Entry の突風要求と Pending 要求 |

取得順は矢印の向きに統一されています。逆順の取得は禁止で、系統をまたいだ同時保持もしません。

<DocFigure src="/img/generated/internals-lock-order-ja.svg" alt="Shared Collision、Simple World Collision、Shared Publisher のロック取得順と、StateLock と GustMutex への分岐" caption="各段を左から右へ読み、Shared Publisher の分岐では StateLock と GustMutex を別々に取得します。" maxWidth={960} />

守られている規則は次のとおりです。

- 3つのレジストリロックは同時に保持しません。ある系統のロックを持ったまま別の系統のロックも取りません。
- `StateLock` と `GustMutex` は同時に保持しません。
- `FKawaiiPhysicsSharedPublishHelper::Update` は Publisher Entry と SimpleWorld Entry のロックを1つずつ取り、同時には持ちません。
- `FKawaiiPhysics_ExternalForce_ProceduralWind::SendPendingGustRequestsToSharedEntry` は `RuntimeState->Mutex` を抜けてから Publisher Entry を触り、ロックを入れ子にしません。
- `DescLock` の下で `BufferLock` を取るのはファミリーメンバー Slot を扱うときだけです。`Slot` と `GroundSlot` の読み書きは `DescLock` の外で行います。

ロックが不要な読み取りには atomic を使います。Slot の `PublishSerial`、`LastPublishFrame`、`bRetired`、Entry の `bRetired` が該当します。

### Entry と Slot の所有

Entry は `TSharedPtr` でレジストリとノードの両方が保持し、Slot も同様に Entry とノードが保持します。レジストリから取り除いても、ノードが保持している間はメモリが残ります。このため削除だけでは保持側に伝わらず、Entry と Slot 自身に「もう使えない」という状態を持たせています。

`SourceID` はノードのアドレス（`reinterpret_cast<uint64>(this)`）です。1つの Source ノードが Entry 内に専用の Slot を1つ持つので、Source 同士は同じバッファを取り合いません。

### Retired と Expired

2つの語は別の意味で使われています。Slot の Expired は読み手から見えない一時的な状態で、Retired は永久に切り離された状態です。Publisher Entry の Expired には、経過による一時的なものと、印による復帰しないものがあります。

| 状態 | 対象 | 条件 | 効果 | 復帰 |
|---|---|---|---|---|
| Expired | Slot | `LastPublishFrame` が 0、経過フレームが MaxAge 超、または Retired | `ReadMerged` がスキップする | Retired でなければ次の `Publish` で復帰する。Retired なら新しい Slot が必要 |
| Retired | Slot | `Retire`、`RetireIfExpired` | `Publish` を拒否し、バッファを解放し、`AppendTo` は何も返さない | 不可。新しい Slot を取得する |
| Retired | Shared Collision Entry | `Retire`、`RetireIfEmpty` | `GetOrCreateSlot` が null を返し、検索でも返らない | 不可。`FindOrCreateEntry` が新しい Entry を作る |
| Retired | SimpleWorld Entry | `MarkRetired`、`MarkRetiredIfEmpty` | Desc 登録と heartbeat をすべて拒否する。Slot は retire しない | 不可。保持側が取り直す |
| Expired（印あり） | Publisher Entry | `MarkExpired`、`MarkExpiredIfProvider` | `PublishState` を拒否する | 不可。`FindOrCreateSharedPublisherEntry` が置き換える |
| Expired（経過） | Publisher Entry | `IsExpired` が経過フレームで真 | 別の Publisher が所有権を取れる | 次の `PublishState` で復帰する |

`MarkExpired` は `LastPublishFrame` を 0 にするだけなので、Slot に対しては一時的な状態です。`RetireIfExpired` と `RetireIfEmpty` が判定と遷移を同じロック区間で行うのは、並行する `Publish` や `GetOrCreateSlot` の結果を捨てないためです。

## 処理の流れ

### 1回の評価で行うこと

`EvaluateSkeletalControl_AnyThread` の中で Shared Collision は次の順に動きます。全体の順序は[ノードのライフサイクルと1フレームの処理順](/docs/internals/frame-lifecycle)を参照してください。

1. 関数の先頭で `bSharedCollisionNeedsReinit` を処理する。ルートボーンの検証より前に実行する
2. ローカル形状を更新した後、`bSharedCollisionSource` か `bUseSharedCollision` が真で Tag が有効なら `UpdateSharedCollisionRegistration` を呼ぶ
3. Target は `UpdateSharedCollisionLimits` で共有形状を読む
4. `SimulateModifyBones` を実行する。WorldSpace の `TeleportPhysics` では省略する
5. Source は `WriteSharedCollisionToSubsystem` で形状を書き込む。手順4を省略した評価でも書き込む

Source の書き込みが物理計算の後にあるのに対し、Target の読み取りは物理計算の前にあります。

<DocFigure src="/img/generated/internals-source-target-timing-ja.svg" alt="両者が毎フレーム評価と Publish を行う場合の、Source の書き込みと Target の読み取りのタイミングと、評価順による差" caption="上段で書き込みと読み取りの位置を確認し、下段で Source と Target の評価順による形状のフレーム差を比べます。" maxWidth={960} />

### 接続

`UpdateSharedCollisionRegistration` は最初に、保持している Entry か Slot が retire していないかを確認します。retire していればハンドルと `SharedCollisionMergedData` を破棄し、リトライ状態を初期値に戻します。その後、未初期化なら `InitializeSharedCollision` を試みます。

`InitializeSharedCollision` はキャッシュ済みの Subsystem と Owner Actor を使い、どちらかが無効ならそのまま戻ります。

| 役割 | 取得 | 初期化完了の条件 |
|---|---|---|
| Source | `FindOrCreateEntry` と `GetOrCreateSlot(SourceID)` | 無条件 |
| Target | `FindEntry` | Entry が見つかったとき |

Target が Entry を見つけられない間は、毎評価で再試行します。`InitRetryThreshold` 回を超えると警告を1回出し、以後は `InitRetryThrottleInterval` 回に1回まで間引きます。コードコメントでは、誤設定の Tag で毎フレーム family root の探索と Registry のロックを行わないためと説明されています。Source が後から現れても、最大でその間隔だけ遅れて接続します。

### Source の書き込み

`WriteSharedCollisionToSubsystem` はノード直持ちの `XxxLimits` と Data Asset 由来の `XxxLimitsData` を走査し、`bEnable` が真の形状を `SimulationSpace` からワールド空間へ変換して `SharedCollisionPublishScratch` に集めます。平面は変換後に `Plane` を計算し直します。

`Publish` は呼び出し側の配列と `Buffer` を `Swap` するだけなので、ロック区間内でディープコピーが起きません。戻ってきた旧バッファは次のフレームの一時バッファとして再利用され、毎フレームのメモリ確保を避けます。

### Target の読み取り

`ReadMerged` は `SlotsLock` の読み取りロック下で全 Slot を走査し、`ReadMaxAge` で Expired の Slot を飛ばして `SharedCollisionMergedData` へ結合します。Entry が保持する Source の数だけコピーが発生します。

続けて `AppendSharedCollisionDataToSimulationSpace` がワールド空間からシミュレーション空間へ変換し、`SharedSphericalLimits` などの配列へ書き込みます。Planar は変換対象で、Convex は対象外です。Source は Convex を Publish しません。

### Tick

`Tick` は毎回 `TickSimpleWorldCollision` を実行します。その後 `CleanupAccumulator` が `CleanupInterval` 以上になったときだけ、3つのレジストリを順に掃除します。

| レジストリ | 除去の条件 |
|---|---|
| `Registry` | キーの Actor が無効なら Entry ごと `Retire`。それ以外は `RemoveExpiredSlots` を実行し、Slot が空になったら `RetireIfEmpty` |
| `SimpleWorldRegistry` | キーが無効なら `MarkRetired`。それ以外は `RemoveExpiredDescs` を実行し、Desc が空なら `MarkRetiredIfEmpty` |
| `SharedPublisherRegistry` | キーが無効か、`SharedCollision.CleanupMaxAge` を超えていれば `MarkExpired` |

`Registry` の掃除は書き込みロックをループ全体で保持します。各レジストリの統計（`KawaiiPhysics_SharedCollision_NumEntries` など）もこの区間で更新します。

`IsTickable` はいずれかのレジストリが空でないときに真を返します。`IsTickableInEditor` は真で、`IsTickableWhenPaused` は override していないのでエンジンの既定動作に従います。

## 鮮度判定

鮮度は `GFrameCounter` との差で判定します。フレーム数の比較なので、同じ設定でも実時間はフレームレートで変わります。

| CVar | 既定値 | 用途 |
|---|---|---|
| `a.AnimNode.KawaiiPhysics.SharedCollision.ReadMaxAge` | `10` | `ReadMerged` が Slot を読む上限フレーム数。コメントによれば URO / LOD の間引きを考慮した値 |
| `a.AnimNode.KawaiiPhysics.SharedCollision.CleanupMaxAge` | `60` | `Tick` が Slot を除去するまでのフレーム数。Publisher Entry の除去にも使う |
| `a.AnimNode.KawaiiPhysics.SharedCollision.CleanupInterval` | `1.0` | 掃除の間隔（秒） |
| `a.AnimNode.KawaiiPhysics.SharedCollision.InitRetryThreshold` | `60` | 警告を出すまでの再試行回数 |
| `a.AnimNode.KawaiiPhysics.SharedCollision.InitRetryThrottleInterval` | `60` | 警告後の再試行間隔 |
| `a.AnimNode.KawaiiPhysics.SharedCollision.EnableInPreviewWorld` | `1` | EditorPreview ワールドで Subsystem を作成するか |

Simple World の Reader も `InitRetryThreshold` と `InitRetryThrottleInterval` を共用します。SimpleWorld の Desc の期限には `a.AnimNode.KawaiiPhysics.SimpleWorldCollision.CleanupMaxAge`（既定 `60`）を使い、Publisher の所有権の期限には `a.AnimNode.KawaiiPhysics.SharedPublisher.ReaderReleaseMaxAge`（既定 `60`）を使います。

Source が Publish を止めた後の経過は次のようになります。`IsExpired` の境界は含まれるので、ちょうど MaxAge フレーム後までは読めます。

1. 10フレームまでは Target が直前のデータを読み続ける
2. 11フレーム目以降、`ReadMerged` がその Slot を飛ばす。読み取り結果が空なら Target の `SharedXxxLimits` も空になる
3. 61フレーム以降の最初の掃除で Slot を retire して除去する。Slot が残っていなければ Entry も retire する

## プレビューワールドでの作成条件

`DoesSupportWorldType` は `EWorldType::EditorPreview` のときだけ `EnableInPreviewWorld` を読みます。それ以外は基底クラスの判定に従い、コメントによれば Game、Editor、PIE が対象で、GamePreview と Inactive は対象外です。Persona のプレビューで Shared Collision と Simple World Collision を確認できるのはこの分岐によります。CVar は Subsystem の作成判定で読むだけなので、すでに作成済みのワールドには影響しません。

プレビューワールドに Subsystem が無い場合、`GetSubsystem` が null を返すので、ノードは接続しません。

## 状態とライフサイクル

| イベント | 動作 |
|---|---|
| `Initialize_AnyThread` | 旧 Slot を `MarkExpired` し、ハンドル、リトライ状態、`SharedCollisionMergedData`、`SharedXxxLimits` を破棄する |
| `RequestSharedCollisionReinit` | 次の評価の先頭で同じ破棄を行う。`UKawaiiPhysicsLibrary` の setter と `GetNodeSharedCollisionReinitPropertyNames` に含まれるプロパティの変更が要求する |
| retire の検知 | `UpdateSharedCollisionRegistration` がハンドルと `SharedCollisionMergedData` を破棄し、リトライ状態を戻す。`SharedXxxLimits` は次に `UpdateSharedCollisionLimits` が走るまで残る |
| Teleport、`ResetDynamics` | Shared Collision の接続には影響しない |
| LOD、非評価フレーム | `EvaluateSkeletalControl_AnyThread` が走らなければ Publish も heartbeat も止まる。ルートボーンの検証で return した場合も同じ |
| 非評価からの復帰 | Slot が除去されていれば `IsRetired` で検知し、同じ評価内で再登録する |
| Actor の破棄 | キーの弱参照が無効になり、次の掃除で Entry を `Retire` する |
| World の破棄 | `Deinitialize` が全 Entry を `Retire`、`MarkRetired`、`MarkExpired` してレジストリを空にする |

`bSharedCollisionNeedsReinit` の処理を早期 return より前に置いているのは、コメントによれば、無効化や Tag のクリアの後は `UpdateSharedCollisionLimits` が呼ばれず、残った形状がシミュレーションで使われ続けるためです。Slot を `MarkExpired` するのは、無効化した Source の形状を Target が次フレームに読まないようにするためです。

retire の検知では `SharedXxxLimits` を消しません。Entry を取得できない間は `UpdateSharedCollisionLimits` が呼ばれず、`SimulateOnce` の適用条件は `bUseSharedCollision` と `bSharedCollisionSource` だけを見るので、配列に残った形状はそのまま適用されます。Target が評価され続けていれば、Slot が `ReadMaxAge` を超えた時点で読み取り結果が空になり、配列も空になります。形状が残るのは、Target も評価されないまま Entry が retire した場合などです。再接続して `UpdateSharedCollisionLimits` が走ると配列は置き換わります。

## 他機能との関係

**評価順。** Target は物理計算の前に読み、Source は物理計算の後に書きます。`bUseSharedCollision` のコメントのとおり、同じ AnimGraph で同一フレームの結果を使うには Source を Target より先に評価される位置に置く必要があります。そうでなければ Target は1フレーム前の形状を読みます。別の AnimInstance のノードとの順序は、このコードでは決めていません。

**公開される形状。** Publish の対象はノード自身の `XxxLimits` と `XxxLimitsData` です。Target が受け取った共有形状と Simple World Collision の形状は再公開しません。`bEnable` が偽の形状も除外します。

**役割の排他。** Source と Target は同時に成立しません。`bSharedCollisionSource` が真のノードは `UpdateSharedCollisionLimits` を呼ばず、`SimulateOnce` も共有形状を適用しません。

**スケールと空間変換。** 書き込みと読み取りの両方で `ApplyScaledLimitDimensions` が形状の寸法を変換します。Component に非一様スケールがある場合の扱いは[ローカルコリジョン](/docs/internals/collision)を参照してください。

**形状のランタイムキャッシュ。** `auto Converted = Limit` のコピーは古いキャッシュ値も運びます。`PrepareCollisionShapeCaches` が `SharedCapsuleLimits` などを含めて `AdjustBy*` の前に計算し直します。

**適用順。** `SimulateOnce` はローカル形状、共有形状、Simple World Collision、World Collision の順に押し出します。

## 変更するときの注意

- `FKawaiiPhysicsSharedCollisionData` に形状の種類を足すときは、`Reset`、`IsEmpty`、`FKawaiiPhysicsSharedCollisionSourceSlot::AppendTo`、`FKawaiiPhysicsCollisionBufferWriter` のコンストラクタと `Append`、`WriteSharedCollisionToSubsystem`、`AppendSharedCollisionDataToSimulationSpace`、`RefreshSimulationSpaceLimitsInPlace`、`PrepareCollisionShapeCaches`、`SimulateOnce` を同時に直します。
- レジストリを増やすときは、`Tick` の掃除、`IsTickable`、`Deinitialize` の3か所に追加します。
- レジストリロックを保持したまま別の系統のロックを取らないでください。追加のロックが必要なら、上の図の順序に組み込みます。
- `Publish` の後、呼び出し側のバッファは旧データです。内容を再利用しないでください。Convex の内部配列は確保量の再利用を前提に `FKawaiiPhysicsCollisionBufferWriter` が管理します。
- `PublishSerial` は読み取りの前に取得します。後で読むと、割り込んだ Publish の新しい serial と古いデータが結び付き、更新を取りこぼします。
- `ReadMaxAge` を `CleanupMaxAge` より大きくしても、掃除で Slot が除去された時点で読めなくなります。2つの値は組で調整します。
- Worker から呼ぶ API で弱参照の UObject を扱うときは、Simple World の API と同じくデリファレンスしない形に揃えます。`GetFamilyRoot` は Actor を辿りますが、並列評価中にアタッチが変わらない前提に依存しています。

| テスト | 守る内容 |
|---|---|
| `KawaiiPhysics.SharedCollision.SourceSlot` | Publish の置き換え、`AppendTo` の追記、MaxAge の境界 |
| `KawaiiPhysics.SharedCollision.Lifecycle.Reconnect` | 掃除の後の再接続、`Deinitialize` による retire |
| `KawaiiPhysics.SharedCollision.Lifecycle.PublishRetirement` | retire 済み Slot への Publish の拒否 |
| `KawaiiPhysics.SharedCollision.Lifecycle.RetryThrottle` | 警告後の再試行間隔 |
| `KawaiiPhysics.SharedCollision.SubsystemSupportsEditorPreview` | プレビューワールドでの作成条件 |
| `KawaiiPhysics.SharedCollision.ScaledSourceAndTargetRoundTrip` | スケール付きの往復変換 |
| `KawaiiPhysics.SimpleWorld.ConvexBuffer.PublishReuse`、`KawaiiPhysics.SimpleWorld.ConvexBuffer.ReadReuse` | バッファの再利用 |

## 関連ページ

- [Simple World Collision](/docs/internals/simple-world-collision)
- [Shared Publisher](/docs/internals/shared-publisher)
- [ノードのライフサイクルと1フレームの処理順](/docs/internals/frame-lifecycle)
- [ローカルコリジョン](/docs/internals/collision)
- [Shared Collision（ユーザー向け）](/docs/features/shared-collision)
- [コンソール変数](/docs/advanced/console-variables)
