---
sidebar_position: 11
title: "Simple World Collision"
description: "Game Thread の収集と Worker の読み取りの分離、Entry と Desc の構造、形状の変換、地面 Box、収集間隔と上限、再収集のトリガーを説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# Simple World Collision

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

ここでは収集からノードの読み取りまでを説明します。Subsystem の全体構造とロックの規約は [Subsystem と Shared Collision](/docs/internals/shared-collision)、Publisher による共有は [Shared Publisher](/docs/internals/shared-publisher)、使い方は[ユーザー向けページ](/docs/features/simple-world-collision)を参照してください。

## このページの要点

**概要**

Simple World Collision は、レベル上の simple collision を物理ボーンへトレース無しで当てる機能です。周囲のコンポーネントから形状を定期的に収集し、床は地面 Box として別の経路で扱います。

**設計**

物理クエリは Game Thread の Subsystem だけが発行し、ノードは Subsystem が Publish した形状のスナップショットを読みます。問い合わせは Entry 単位なので、同じ Entry を共有するノードやボーンが増えても問い合わせは増えません。Entry ごとの1回の収集で発行するのは、Overlap 1回と、必要なときの地面トレース1回です。ただし provider を足すと、Merge の結果によって収集間隔が短くなったり、地面トレースが加わったりします。Publish される形状はワールド空間で、ノードは評価のたびに自分のシミュレーション空間へ変換します。

**理解のポイント**

- 収集の単位は Entry です。同じ Entry の provider の設定は Merge で1つにまとまるので、ノードの設定値がそのまま収集に使われるとは限りません。
- Entry のデータは、ロックで守るもの、atomic のもの、Tick 専有のものに分かれます。どのスレッドが触るデータかを確認しながら読んでください。
- 収集、毎 Tick の形状の更新、評価ごとの読み取りは別の頻度で動きます。どの変化がどの段階で反映されるかを区別すると、遅延や再収集の条件を追いやすくなります。
- 読み取りでは、コピーと空間変換を分けて考えます。Serial が同じならコピーを省きますが、シミュレーション空間への変換はやり直します。

## 関連ファイル

| ファイル | 役割 |
|---|---|
| [`Public/KawaiiPhysicsSimpleWorldCollision.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsSimpleWorldCollision.h) | `FKawaiiPhysicsSimpleWorldCollisionDesc`、列挙型、形状変換関数の宣言 |
| [`Private/KawaiiPhysicsSimpleWorldCollision.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsSimpleWorldCollision.cpp) | AggGeom、Bounds、Physics Asset から Limit への変換。フェードと地面 Box の計算 |
| [`Public/KawaiiPhysicsSharedCollisionSubsystem.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsSharedCollisionSubsystem.h) | `FKawaiiPhysicsSimpleWorldCollisionEntry`、`FKawaiiPhysicsSimpleWorldRegistryKey` |
| [`Private/KawaiiPhysicsSharedCollisionSubsystem.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsSharedCollisionSubsystem.cpp) | `TickSimpleWorldCollision`、`GatherSimpleWorldEntry`、`UpdateSimpleWorldTransforms`、Desc の Merge、デバッグ描画 |
| [`Private/AnimNode_KawaiiPhysicsCollision.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsCollision.cpp) | `InitializeSimpleWorldCollision`、`UpdateSimpleWorldCollisionLimits`、`ReleaseSimpleWorldCollision` |
| [`Public/KawaiiPhysicsGroundProvider.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsGroundProvider.h) | `IKawaiiPhysicsGroundProvider`、`FKawaiiPhysicsGroundHit` |
| [`Public/KawaiiPhysicsDeveloperSettings.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsDeveloperSettings.h) | 上限、自動半径、フェード、距離間引きのプロジェクト設定 |

## 設計の要点

### 収集と読み取りの分離

処理はスレッドで明確に分かれています。

| 処理 | スレッド | 内容 |
|---|---|---|
| 登録、heartbeat、読み取り | ノードの評価スレッド（Worker または Game） | `SetDesc`、`MarkRead`、`AddReaderMember`、`Slot` からのコピー |
| 収集、形状の更新、Publish | Game Thread の `Tick` | Overlap、ライントレース、コンポーネントの参照、`Slot` への Publish |

Worker から呼ぶ Entry の API は SkelComp の弱参照をデリファレンスしません。`IsValid(false, true)` のスレッドセーフ判定と、弱参照同士の比較だけを使います。`GetPrimarySkelComp` と `CollectMemberSkelComps` は生ポインタを解決するので Tick 専用です。

<DocFigure src="/img/generated/internals-simple-world-flow-ja.svg" alt="Desc の登録とマージ済みキャッシュの更新から、Game Thread の収集と Publish、評価スレッドの Serial 比較と読み取りまでの流れ" caption="Desc から Tick の収集と Publish をたどり、評価側で Serial が同じときにコピーを省略して空間変換へ進む経路を確認します。" maxWidth={960} />

Slot に入る形状はワールド空間です。ノードは読み取ったワールド空間のコピーを `SimpleWorldMergedScratch` に保持し、評価のたびに自分のシミュレーション空間へ変換します。

### データの持ち主

`FKawaiiPhysicsSimpleWorldCollisionEntry` のフィールドは、アクセスするスレッドごとに扱いが違います。

| データ | 保護 | 書く側 | 読む側 |
|---|---|---|---|
| `DescSlots`、マージ済み Desc、`LastProviderFrame`、`bRetired` | `DescLock` | 評価スレッド、Tick | 評価スレッド、Tick |
| `MemberSlots` の構造 | `DescLock` | Tick（追加、除去）、評価スレッド（除去） | 評価スレッド、Tick |
| `Slot`、`GroundSlot`、メンバー Slot の Buffer | 各 `BufferLock` | Tick | 評価スレッド |
| `bRegatherRequested` | atomic | 評価スレッド、Tick | Tick |
| `GatheredComponents`、地面 Box 関連、`TimeSinceLastGather`、各 scratch | Tick 専有でロック無し | Tick | Tick、デバッグ情報 |

Slot は `Slot`（収集した形状）と `GroundSlot`（地面 Box を0個か1個）に分かれ、ファミリーメンバーの形状だけ `MemberSlots` に SkelComp ごとの Slot を持ちます。`GroundSlot` が別なので、地面 Box の更新で形状の配列全体を読み直す必要がありません。

### Entry のキー

`FKawaiiPhysicsSimpleWorldRegistryKey` は `MakeLocalKey(SkelComp)` か `MakeSharedKey(FamilyRoot, Tag)` で作ります。Local は Tag が無効な状態で、同じ SkeletalMeshComponent 上の複数のノードが1つの Entry を共有します。収集は Entry につき1回です。

Worker からは `FindOrCreateSimpleWorldEntry` で取得します。Entry の作成と最初の Desc の登録は同じ書き込みロック区間で行います。掃除も同じロックで空判定と除去を行うため、作成直後の空の Entry が除去される窓がありません。

### Desc と Merge

`FKawaiiPhysicsSimpleWorldCollisionDesc` は収集設定の1単位です。ノードは `FAnimNode_KawaiiPhysics::BuildSimpleWorldCollisionDesc` で、Publisher は `KawaiiPhysicsSimpleWorldCollision::BuildSimpleWorldCollisionDesc` で作ります。ノードの Desc の `GatherScope` は既定の `SkeletalMeshComponent`、`bGatherFamilyMembers` は `false` のままです。

Entry の `DescSlots` は `SourceID` ごとの登録です。`bProvider` が真の登録は設定を提供し、`Merge` で1つにまとめられます。偽の登録（Reader）は `Merge` に参加しません。メンバーとして `ActorFamily` の Bounds と無視対象に影響し、`bGatherFamilyMembers` が有効なら、その SkelComp の形状も収集対象になります。

| 項目 | 規則 |
|---|---|
| `GatherIntervalSec` | 最小値 |
| `GatherRadiusOverride` | 指定された値の最大。`bGatherRadiusAllOverridden` は全 Desc が指定したときだけ真 |
| `CollisionChannel` | 登録順で最初の `ECC_MAX` 以外の値 |
| `ObjectTypes` | 和集合。空の Desc があれば WorldStatic と WorldDynamic を加える |
| `ConvexFallbackShape` | 列挙の宣言順で最も前の値（高精度側） |
| `SkeletalMeshCollision` | PhysicsAsset、BoundingBox、None の優先順 |
| `bGroundCollision`、`bGatherFamilyMembers` | OR |
| `GatherScope` | ActorFamily を優先 |
| `bProviderDisabled` | AND |

マージ結果は `RebuildMergedDescLocked` が `CachedMergedDesc` に保持します。再計算は provider の登録、設定変更、除去のときだけで、heartbeat と Reader の操作では走りません。`TMap` の反復順はノードアドレスのハッシュに依存するため、`RegistrationOrdinal` で登録順に並べてから `Merge` します。これで `CollisionChannel` の結果が決定的になります。

### Serial

`Slot.GetPublishSerial()` は Publish ごとに増える単調カウンタです。ノードは `CopyShapeLimits` の前に serial を読み、前回の値と同じならコピーを省略します。読む順序を逆にすると、割り込んだ Publish の新しい serial を古いデータに結び付けて更新を取りこぼします。

コピーを省略したフレームでも、ノード自身は動いている場合があるので、`RefreshSimulationSpaceLimitsInPlace` がワールド空間のコピーからシミュレーション空間の配列を計算し直します。この関数は配列を再確保しません。要素数が合わないときは偽を返し、全体の組み直しへ戻ります。

メンバー Slot は `GetMemberSlotsPublishSerialSum` の合計値で変化を検出します。`LastReadSimpleWorldShapeSerial` などの値 0 は未読を意味します。

## 処理の流れ

### TickSimpleWorldCollision

`Tick` は最初に `SimpleWorldCollision.Enable` と Dedicated Server の条件を確認し、続けて `SimpleWorldRegistryLock` の読み取りロック下で Entry の配列をコピーします。物理クエリはレジストリのロックの外で走ります。その後、Entry ごとに次の順で処理します。

1. `RemoveExpiredDescs` で期限切れの Desc を除去する
2. `ConsumeRegatherRequested` で再収集の要求を取り出す。Desc のスナップショットより前に消費することで、変更を取りこぼす窓を作らない
3. `BuildMergedDesc` が失敗すれば（provider 不在）、要求があれば Tick 専有の状態を消して次の Entry へ進む
4. `GetPrimarySkelComp` で最も早く登録された provider の SkelComp を取得する
5. `ActorFamily` か `bGatherFamilyMembers` のとき、参加メンバーの SkelComp、Owner、Bounds を集める
6. 収集の中心と半径を決める
7. `bProviderDisabled` なら `PublishSimpleWorldEmptyLimits` で空を Publish して終わる
8. 再収集の要求があれば `GatheredComponents` と地面 Box を消す
9. 収集間隔を判定し、`GatherSimpleWorldEntry` または `UpdateSimpleWorldGround` を実行する
10. `UpdateSimpleWorldTransforms` で収集済み形状を更新する
11. 変化があれば `PublishSimpleWorldShapeLimits` と `PublishSimpleWorldGroundBox` を実行する

### GatherSimpleWorldEntry

`OverlapMultiByChannel` を Sphere で1回発行します。問い合わせ側のチャンネルは Desc の `CollisionChannel`、`ECC_MAX` なら SkelComp の `GetCollisionObjectType()` です。レスポンスは `BuildSimpleWorldResponseParams` が作り、`ObjectTypes` を Block、それ以外を Ignore にします。`ObjectTypes` が空なら WorldStatic と WorldDynamic を Block します。`bIgnoreTouches` を立てて Overlap 応答を除外し、結果のループでも `bBlockingHit` を確認します。

無視の設定は次のとおりです。

- `bGatherFamilyMembers` が無効なら、自分の SkelComp と Owner を無視する。`ActorFamily` スコープではメンバー全員の Owner を無視する
- `bGatherFamilyMembers` が有効でメンバーがいるときは Actor を無視しない。代わりに、メンバーの SkelComp 以外でメンバーの Owner に属するコンポーネントをループ内で飛ばす
- Actor かコンポーネントに `KawaiiPhysics.IgnoreSimpleWorldCollision` タグがあれば飛ばす

Overlap の数が上限を超えると、`ShouldUseSimpleWorldGatherOrder` が距離順の走査へ切り替えます。距離は中心からコンポーネントの `Bounds.Origin`、ISM はインスタンス位置までです。上限が 0 なら並べ替えも省きます。`FKawaiiPhysicsSimpleWorldGatherKey` で同じコンポーネントとインスタンスの重複を除きます。

収集結果は `NewGatheredComponents` に作り、最後に `GatheredComponents` と入れ替えます。すでに収集済みのコンポーネントは `FadeAlpha` を引き継ぎ、新規は `bHasGatheredOnce` が真なら 0 から、偽なら 1 から始まります。

### 形状の変換

形状はコンポーネントのローカル空間の Limit として `LocalLimits` に保存し、ワールド Transform は別に持ちます。スケールは収集時に Limit の寸法へ焼き込み、Transform からはスケールを除きます。Query が無効な要素は `CollisionEnabledHasQuery` で除外します。

| 対象 | 条件 | 変換 | 追従 |
|---|---|---|---|
| Primitive / Static Mesh | `GetBodySetup()` があり、`CTF_UseComplexAsSimple` でなく、AggGeom が空でない | `ConvertAggGeomToLocalLimits` | Static は固定。それ以外は毎 Tick `LastComponentTM` を更新 |
| ISM / HISM | Overlap のアイテムが有効なインスタンス | 上と同じ。Transform とスケールにインスタンスの値を使う | 上と同じ |
| Skeletal Mesh `None` | | 収集しない | |
| Skeletal Mesh `BoundingBox` | | `AppendBoundsLocalLimits` で Box 1個 | 上と同じ。Bounds の大きさは次の収集まで固定 |
| Skeletal Mesh `PhysicsAsset` | Physics Asset、SkinnedAsset、Component Space Transform が揃っている | `AppendPhysicsAssetLocalLimits` | `BodyBindings` でボーンに追従。`bStatic` は常に偽 |

Landscape や Complex コリジョンのみのメッシュは形状を作れないので収集しません。床は地面 Box の経路が扱います。

**AggGeom。** Sphere、Sphyl、TaperedCapsule、Box はそれぞれ対応する Limit になります。`GetFinalScaled(Scale3D, FTransform::Identity)` でスケールを適用します。

**Convex。** `ConvexFallbackShape` が `ConvexHull` なら、`AppendConvexElemLocalLimit` が平面セットを `FKawaiiPhysicsConvexLimit` に変換します。法線は逆転置でスケール変換するので、負のスケールでも外向きが保たれます。平面数が `MaxConvexPlanes` を超える場合、頂点が無い場合、値が不正な場合は `ElemBox` の Box へフォールバックします。`BoundingBox` と `BoundingSphere` は `ElemBox` から作り、`None` は無視します。デバッグ用の頂点とエッジは `SimpleWorldCollision.DebugDraw` が有効なときだけ作ります。

**Physics Asset。** 候補は `SkeletalBodySetups` のうち、`BodyCollision_Disabled` でなく、AggGeom が空でなく、ボーン名が RefSkeleton で解決できるものです。ボーン index、body index の昇順に並べ、`MaxBodies` まで採用します。

`FKawaiiPhysicsSimpleWorldBodyBinding` は BoneIndex と各形状の個数だけを持ち、開始 offset を持ちません。`LocalLimits` は body の順に連続して並び、読む側が先頭から累積して範囲を求めます。`AppendPhysicsAssetLocalLimits` を空の配列から使い始める必要があるのはこのためです。

Physics Asset の結果には3通りあります。Physics Asset が無いなどで構築できなければ Bounds の Box へフォールバックします。Physics Asset があって採用できる body が0個なら、コメントのとおり意図的にコリジョンを切っている状態として収集しません。`MaxPhysicsAssetBodies` が 0 以下なら、このモードの SkeletalMesh を収集しません。

毎 Tick のボーン追従は `UpdateSkeletalBodyWorldTransforms` が行います。Component Space Transform と Component Transform を合成してスケールを除くので、コンポーネントのスケールはボーンの位置にだけ反映され、アニメーション由来のボーンスケールは形状の大きさに反映されません。

### 地面 Box

地面 Box は Overlap とは別の経路で作ります。ソースの優先順は Provider、CharacterMovement、Trace です。

`ResolveSimpleWorldGroundSource` は収集フレームごとに、SkelComp の Owner からアタッチ親を最大8段辿ります。各 Actor で `IKawaiiPhysicsGroundProvider` の実装（Actor 自身、なければコンポーネント）と `UCharacterMovementComponent` を探し、2つをそれぞれキャッシュします。付け替え先の Owner を掴み続けないよう、前回の結果は使いません。`SimpleWorldCollision.UseMovementGround` が 0 なら Trace のみです。

`TryUpdateSimpleWorldGroundBoxFromSource` は収集フレームと、それ以外の毎 Tick に Provider と CharacterMovement を順に試します。

| ソース | 結果 | 動作 |
|---|---|---|
| Provider | `bNoGround` | Box を外して終了。CharacterMovement にもトレースにも進まない |
| Provider | `bHit` | Box を作る |
| Provider | どちらでもない | CharacterMovement へ進む |
| CharacterMovement | `IsFalling()` | Provider / CharacterMovement 由来の Box を外し、失敗を返す。Trace 由来の Box は残す |
| CharacterMovement | `CurrentFloor.IsWalkableFloor()` | Box を作る。位置はカプセル中心から重力方向へ半高と床までの距離を足した点。カプセルでなければ `ImpactPoint` |

落下中に古い Box を即座に外すのは、コメントによれば、崖から落ちたときに古い床の高さで髪が跳ねるのを防ぐためです。残した Trace 由来の Box は着地先の床です。

どちらも失敗した収集フレームでは、中心から真下（ワールド -Z）へ `GroundTraceLength` の長さのライントレースを1回行います。チャンネルとレスポンスは Overlap と同じで、自分とメンバーの Owner は `bGatherFamilyMembers` に関わらず無視します。ヒットしなければ Box を外します。

Box は `BuildSimpleWorldGroundBox` が作ります。中心を接地点から法線の逆方向へ `GroundBoxHalfThickness`（10cm）下げて上面を接地点に合わせ、XY の半径は収集半径、向きは法線に合わせます。Trace 由来の Box は床コンポーネントのローカル空間（`GroundBoxLocal`）でも保持し、床が Static でなければ毎 Tick `UpdateSimpleWorldTraceGroundBoxFromFloor` で追従します。この追従の中で床の消失やインスタンスの無効化を検知すると、Box を外して次の Tick で収集し直します。床が Static の場合はこの確認を行わないので、Box は次の収集まで残ります。

`IKawaiiPhysicsGroundProvider` の実装は Game Thread で毎 Tick 呼ばれます。宣言のコメントどおり、キャッシュ済みの値を返す実装にして、内部でトレースしないでください。`Execute_GetKawaiiPhysicsGround` の引数はプライマリの SkelComp です。

### UpdateSimpleWorldTransforms と Publish

`UpdateSimpleWorldTransforms` は毎 Tick、収集済み形状を更新して、Publish が必要かを返します。

- 無効になったコンポーネントを除去する
- `FadeAlpha` を `DeltaTime / FadeInTime` ずつ進める
- Physics Asset の形状は `UpdateSkeletalBodyWorldTransforms` で Body の Transform を更新し、変化があれば Publish 対象にする
- Static でない形状は Transform を比較し、変化があれば Publish 対象にする。スケールの変化と ISM インスタンスの有効性もこの経路で確認する

Static の形状は Transform を比較しません。フェードが完了し、形状と地面に変化がなければ、収集フレーム以外の Publish は起きません。`GatherSimpleWorldEntry` は `bWorldLimitsDirty` と `bGroundBoxDirty` の両方を立てるので、収集フレームでは内容が同じでも Publish します。

`PublishSimpleWorldShapeLimits` は `PublishScratch` にワールド空間の形状を組み立て、`Slot.Publish` で Swap します。`AppendFadedLocalLimits` は Sphere、Capsule、TaperedCapsule の半径に `FadeAlpha` を掛けます。Box と Convex は縮小できないので、`FadeAlpha` が `GSimpleWorldFadeBoxEnableThreshold`（0.5）に達するまで追記しません。メンバーの形状は `MemberPublishScratch` に分けて、対応するメンバー Slot へ Publish します。Convex の内部配列は `FKawaiiPhysicsCollisionBufferWriter` が再利用します。

### ノード側の読み取り

`EvaluateSkeletalControl_AnyThread` は `bUseSimpleWorldCollision` と `SimpleWorldCollision.Enable` の両方が真のとき、共有コリジョンの処理の後で読み取ります。条件が偽になると `ReleaseSimpleWorldCollision` で自分の Desc を外し、配列を空にします。

Local の `UpdateSimpleWorldCollisionLimits` は次の順に動きます。Reader の経路は [Shared Publisher](/docs/internals/shared-publisher) を参照してください。

1. Entry が retire していれば解放して戻る。次の評価で登録し直す
2. `BuildSimpleWorldCollisionDesc` の結果を `LastSentSimpleWorldDesc` と比較し、差があれば `SetDesc` する
3. `MarkRead` で heartbeat する。失敗すれば解放して戻る
4. 形状の serial を確認し、コピーか再変換を行う
5. 地面の serial を確認し、同じ処理を行う
6. `CheckSimpleWorldGatherRadius` で半径を確認する

変換後の配列は `SimpleWorldSphericalLimits`、`SimpleWorldCapsuleLimits`、`SimpleWorldTaperedCapsuleLimits`、`SimpleWorldBoxLimits`、`SimpleWorldGroundBoxLimits`、`SimpleWorldConvexLimits` です。Planar は読みません。読み取りは評価につき1回なので、サブステップの間は同じ形状を使います。

## 収集間隔と半径

実効の収集間隔は `GatherIntervalSec` に `SimpleWorldCollision.GatherIntervalScale`（既定 `1.0`）を掛けた値です。`GatherIntervalSec` が `KINDA_SMALL_NUMBER` 以下なら毎フレーム収集します。

プレイヤーカメラがあるワールドでは、カメラと収集中心の距離で間引きます。`GetFirstPlayerController()` か `PlayerCameraManager` が無いワールドでは間引きません。

| 距離 | 動作 |
|---|---|
| `SimpleWorldCollisionDistanceThrottleStop`（10000cm）超 | 収集しない。地面の更新も止まる。形状の Transform 更新と Publish は続く |
| `SimpleWorldCollisionDistanceThrottleStart`（3000cm）超 | 収集間隔を2倍にする |

中心と半径は Bounds から決めます。`SkeletalMeshComponent` スコープはプライマリの SkelComp の `Bounds`、`ActorFamily` スコープは `ComputeSimpleWorldGatherBounds` で全メンバーの Bounds を合成した値です。中心は `Origin` です。

半径は次のとおりです。

- 自動半径は `SphereRadius` に `SimpleWorldCollisionAutoGatherRadiusScale`（既定 `1.5`）を掛けた値
- 全 Desc が Override を指定していれば、その最大値をそのまま使う。自動半径より小さくできる
- 1つでも自動の Desc があれば、自動半径と Override の最大値の大きい方を使う

地面トレースの長さは `FMath::Max(Radius, AutoRadius)` です。Bounds の原点から床までの距離は半径の Override と無関係なので、半径を小さくしてもトレースは短くなりません。地面 Box の XY 半径は Override の値に従います。

`IsSimpleWorldGatherInputValid` が中心の NaN と半径を確認し、不正なフレームは収集しません。ノードは `bOverrideSimpleWorldCollisionGatherRadius` が有効なとき、`CheckSimpleWorldGatherRadius` でチェーンの到達距離より半径が小さければ警告を1回出します。

## 上限と設定

CVar が 0 以上なら DeveloperSettings より優先します。`-1` なら DeveloperSettings の値を使います。

| 項目 | DeveloperSettings（既定） | CVar（既定） | 単位 | 0 のとき |
|---|---|---|---|---|
| 収集数 | `SimpleWorldCollisionMaxGatheredComponents`（64） | `SimpleWorldCollision.MaxComponents`（-1） | Entry ごと。ISM / HISM はインスタンス数で数える | 形状を収集しない |
| Body 数 | `SimpleWorldCollisionMaxPhysicsAssetBodies`（32） | `SimpleWorldCollision.MaxPhysicsAssetBodies`（-1） | SkeletalMeshComponent ごと | PhysicsAsset モードの SkeletalMesh を収集しない |
| 平面数 | `SimpleWorldCollisionMaxConvexPlanes`（64） | `SimpleWorldCollision.MaxConvexPlanes`（-1） | Convex Hull ごと | 全 Hull がフォールバックする |
| スケール変化の再収集 | `bSimpleWorldCollisionRegatherOnScaleChange`（false） | `SimpleWorldCollision.RegatherOnScaleChange`（-1） | | CVar の 0 で無効、1 で有効 |

その他の CVar です。プレフィックスは `a.AnimNode.KawaiiPhysics.SimpleWorldCollision.` です。

| CVar | 既定値 | 用途 |
|---|---|---|
| `Enable` | `1` | 0 で収集、毎 Tick の更新、Publish、ノードの適用をすべて止める |
| `GatherIntervalScale` | `1.0` | 実効の収集間隔に掛ける係数 |
| `CleanupMaxAge` | `60` | Desc を除去するまでのフレーム数 |
| `DebugDraw` | `0` | Subsystem 側のデバッグ描画 |
| `ForceEnableOnServer` | `0` | 1 で Dedicated Server でも収集する |
| `UseMovementGround` | `1` | 0 で地面を下方向トレースのみにする |

CVar を変更しても再収集は要求しません。収集数、Body 数、平面数の上限と `UseMovementGround` は次の収集で反映され、収集が止まっている間は既存の形状とキャッシュ済みの地面ソースを使い続けます。

**Dedicated Server。** `TickSimpleWorldCollision` は `NM_DedicatedServer` かつ `ForceEnableOnServer` が 0 なら先頭で戻ります。コメントのとおり見た目専用の機能として扱うためです。ノードの登録はそのまま動きますが、Slot に Publish されないので形状は空のままです。Entry の掃除は `Tick` の後段で続きます。

## 状態とライフサイクル

### 再収集のトリガー

再収集には全体をやり直す経路と、1つのコンポーネントだけを落とす経路があります。

| トリガー | 経路 | 動作 |
|---|---|---|
| Teleport（`ETeleportType::TeleportPhysics`） | `RequestRegather` | 全体 |
| provider の新規登録。同じ設定の provider がすでにあれば除く | `SetDesc` | 全体 |
| `DoesChangeRequireRegather` が真の Desc の変更 | `SetDesc` | 全体 |
| provider と Reader の切り替え | `SetDesc`、`AddReaderMember` | 全体 |
| Reader の参加、SkelComp の変更 | `AddReaderMember` | 全体 |
| Desc の除去 | `RemoveDesc`、`RemoveExpiredDescs` | 全体 |
| SkinnedAsset / PhysicsAsset の差し替え | `UpdateSimpleWorldTransforms` | 部分 |
| スケール変化（有効時のみ。Static の形状は対象外） | `UpdateSimpleWorldTransforms` | 部分 |
| ボーンの欠落、Static でない ISM インスタンスの無効化 | `UpdateSimpleWorldTransforms` | 部分 |
| Static でない床コンポーネントの消失 | `UpdateSimpleWorldTraceGroundBoxFromFloor` | 部分 |

全体の再収集は `bRegatherRequested` で次の Tick に実行します。`GatheredComponents` と地面 Box を消し、`bHasGatheredOnce` を偽にするので、再収集した形状はフェード無しで全強度になります。部分の再収集はその要素だけを除去し、`TimeSinceLastGather` を `FLT_MAX` にして次の Tick で収集します。このとき除去した形状は新規扱いになり、フェードし直します。

Static の形状と床はスケール、インスタンス、床の有無を毎 Tick 確認しないので、これらの変化は次の収集まで反映されません。

`GatherIntervalSec` だけの変更では再収集しません。ピン駆動で毎フレーム値が変わっても、収集済みの形状とフェードの状態を維持するためです。

スケールの再収集は既定で無効です。無効の間はスケールが変わっても収集時の寸法を使い続け、位置と回転だけが追従します。

### ノードのイベント

| イベント | 動作 |
|---|---|
| `Initialize_AnyThread` | `ReleaseSimpleWorldCollision` で Desc を外し、配列と serial を初期化する |
| `PreUpdate` で World か SkelComp の変化を検出 | `RequestSimpleWorldCollisionReinit` を実行する |
| `bUseSimpleWorldCollision`、Source、Tag の setter | `RequestSimpleWorldCollisionReinit` を実行する |
| 収集設定の変更 | Desc の差分で追従する。再初期化は不要 |
| ピンによる Source と Tag の変更 | `UpdateSimpleWorldCollisionLimits` の先頭で検出して解決し直す |
| `TeleportPhysics` | 読み取りの後に `RequestRegather` する |
| `ResetPhysics` | 評価の冒頭で `TeleportType` が `None` に戻るので再収集しない |
| LOD、非評価フレーム | heartbeat が止まる。`CleanupMaxAge` を超えると Desc が除去され、復帰時の `MarkRead` の失敗で解放してから登録し直す |
| ノードの破棄 | デストラクタでは解除しない。heartbeat が止まるので Desc の期限切れで除去される |
| World の破棄 | `Deinitialize` が `MarkRetired` する |

Entry が掃除で retire すると、Local のノードは `IsRetired` か `MarkRead` の失敗で検知し、`ReleaseSimpleWorldCollision` の後に登録し直します。Entry の Slot は retire しません。

## デバッグ

`a.AnimNode.KawaiiPhysics.SimpleWorldCollision.DebugDraw` は `ENABLE_DRAW_DEBUG` のビルドで Game Thread から描画します。

| 描画 | 色 |
|---|---|
| 収集半径の球 | 白 |
| 収集した形状 | 水色。フェード中は暗い色 |
| 地面 Box | Provider はマゼンタ、CharacterMovement は水色、Trace は緑 |

Convex の頂点は DebugDraw の有効時に収集したものだけが持つので、有効にした直後は次の収集まで `LocalBounds` の Box で近似します。`bProviderDisabled` の Entry は描画しません。

`UKawaiiPhysicsLibrary::GetSimpleWorldCollisionDebugInfo` は `BuildSimpleWorldCollisionDebugInfo` を通じて、Local の Entry の状態を返します。Shipping では常に偽です。ノード側で変換した配列は `AnimNode_KawaiiPhysicsDebug.cpp` の `AnimDrawDebug` が描画します。統計は `STATGROUP_Anim` の `KawaiiPhysics_SimpleWorldCollision_Gather`、`KawaiiPhysics_SimpleWorldCollision_UpdateTransforms`、`KawaiiPhysics_SimpleWorldCollision_Ground`、`KawaiiPhysics_SimpleWorldCollision_NumGatheredComponents` などです。

## 他機能との関係

**適用順。** `SimulateOnce` はローカル形状、共有形状の後に Simple World の形状を適用し、最後に World Collision を実行します。プロパティのコメントは、薄い壁や高速移動では World Collision との併用を推奨しています。

**遅延。** `UpdateSimpleWorldTransforms` のコメントによれば、相手の SkelComp の `PostAnimEvaluation` と `Tick` の順序によって、読むポーズは1フレーム前の可能性があり、ノード側の Publish と読み取りの位相差を含めると最大2フレーム遅れます。これは関係する処理が毎フレーム動く場合の値です。Component Space Transform に鮮度の判定は無いので、相手のアニメーション更新が間引かれると、その分だけ古いポーズを読みます。

**Bounds への依存。** 自動半径と中心は SkelComp の `Bounds` から決まります。Bounds が変わると収集範囲も変わります。

**Shared Publisher。** Reader の参加は Merge に影響しませんが、`ActorFamily` の Bounds と無視対象に影響し、再収集のトリガーになります。ファミリーメンバーの形状は、`bGatherFamilyMembers` が有効で、`SkeletalMeshCollision` が `None` でなく、メンバーの ObjectType が `ObjectTypes` に含まれ、メンバーが問い合わせのチャンネルを Block するときに収集されます。メンバーの ObjectType が Pawn なら `ObjectTypes` に Pawn が必要です。詳細は [Shared Publisher](/docs/internals/shared-publisher) を参照してください。

**Convex。** Convex の Limit は Simple World Collision の経路だけが作ります。Shared Collision の Source は Publish しません。

**カスタム重力。** CharacterMovement の経路は `GetGravityDirection()` を使いますが、下方向トレースはワールド -Z で固定です。

## 変更するときの注意

- Tick 専有のフィールドに評価スレッドから触らないでください。評価スレッドから変更が必要なデータは `DescLock` か atomic を通します。
- 評価スレッドから呼ぶ Entry の API では、SkelComp の弱参照を `Get()` しないでください。
- `ConsumeRegatherRequested` を `BuildMergedDesc` より後へ動かすと、消費前の変更を取りこぼします。
- `FKawaiiPhysicsSimpleWorldCollisionDesc` にフィールドを足すときは、`operator==`、`DoesChangeRequireRegather`、`Merge`、2つの `BuildSimpleWorldCollisionDesc`、`AreSimpleWorldSettingsEqual` を同時に直します。
- 形状の種類を足すときは、`ConvertAggGeomToLocalLimits`、`AppendBodyLocalLimits` と `FKawaiiPhysicsSimpleWorldBodyBinding`、`AppendFadedLocalLimits`、`AppendFadedSkeletalLocalLimits`、`DrawKawaiiPhysicsSimpleWorldLimitRange`、`CopySimpleWorldLimitsToSimulationSpace`、`RefreshSimulationSpaceLimitsInPlace`、`PrepareCollisionShapeCaches`、`SimulateOnce` を確認します。
- `BodyBindings` は累積で offset を求めるので、`LocalLimits` の並びを変えると全 body の対応が崩れます。
- Provider の呼び出しを増やすと、毎 Tick の Game Thread の負荷に直結します。

| テスト | 守る内容 |
|---|---|
| `KawaiiPhysics.SimpleWorld.DescMerge`、`KawaiiPhysics.SimpleWorld.MergedDescCache` | Merge の規則と登録順、再計算の抑制 |
| `KawaiiPhysics.SimpleWorld.EntryLifecycle`、`KawaiiPhysics.SimpleWorld.RetiredEntryRejectsRegistration` | Desc の期限と retire |
| `KawaiiPhysics.SimpleWorld.DormantLocalNodeRebindsAfterRegistryCleanup` | 非評価からの復帰 |
| `KawaiiPhysics.SimpleWorld.ConvertAggGeomToLocalLimits`、`KawaiiPhysics.SimpleWorld.AppendConvexElemLocalLimit`、`KawaiiPhysics.SimpleWorld.AppendPhysicsAssetLocalLimits` | 形状の変換 |
| `KawaiiPhysics.SimpleWorld.AppendFadedLocalLimits`、`KawaiiPhysics.SimpleWorld.AppendFadedSkeletalLocalLimits` | フェードの規則 |
| `KawaiiPhysics.SimpleWorld.BuildGroundBox`、`KawaiiPhysics.SimpleWorld.GroundBoxFollowsComponent`、`KawaiiPhysics.SimpleWorld.GroundSlotIndependentPublish` | 地面 Box |
| `KawaiiPhysics.SimpleWorld.InPlaceRefreshMatchesRebuild` | 再変換と組み直しの一致 |
| `KawaiiPhysics.SimpleWorld.SubsystemTickPublish` | Publish の頻度と Tick の動作 |
| `KawaiiPhysics.SimpleWorld.SortGatherOrderByDistance`、`KawaiiPhysics.SimpleWorld.GatherOrderSkippedForZeroCap` | 上限を超えたときの走査順 |

## 関連ページ

- [Subsystem と Shared Collision](/docs/internals/shared-collision)
- [Shared Publisher](/docs/internals/shared-publisher)
- [ローカルコリジョン](/docs/internals/collision)
- [ノードのライフサイクルと1フレームの処理順](/docs/internals/frame-lifecycle)
- [Simple World Collision（ユーザー向け）](/docs/features/simple-world-collision)
- [プロジェクト設定](/docs/advanced/project-settings)
- [コンソール変数](/docs/advanced/console-variables)
