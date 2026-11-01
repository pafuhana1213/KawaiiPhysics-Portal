---
sidebar_position: 12
title: "Shared Publisher"
description: "FAnimNode_KawaiiPhysicsSharedPublisher による風と Simple World Collision の配信、Provider / Reader の解決、共有クロック、コピーされるものと共有されるもの、スレッド安全性を説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# Shared Publisher

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

ここでは配信の仕組みを説明します。Entry、ロック、掃除など Subsystem に共通する内容は [Subsystem と Shared Collision](/docs/internals/shared-collision)、収集の中身は [Simple World Collision](/docs/internals/simple-world-collision)、風の計算は [Procedural Wind](/docs/internals/procedural-wind)、配置方法は[ユーザー向けページ](/docs/features/shared-publisher)を参照してください。

## このページの要点

**概要**

髪、服、マントが別メッシュの場合、風の位相や周囲の当たり判定の収集設定を各ノードで個別に持つと、設定が揃わず、収集も重複します。`FAnimNode_KawaiiPhysicsSharedPublisher` は Actor ファミリーに1つ置く pass-through ノードで、風の状態と Simple World Collision の収集設定を、同じ Tag の消費側ノードへ配ります。

**設計**

Publisher はポーズを変更せず、配信を2つの Entry に分けて行います。風は消費側が Publisher Entry の状態を読み、当たり判定は SimpleWorld Entry へ登録した設定をもとに Subsystem の `Tick` が収集して、Reader がその結果を読みます。ノード間の受け渡しは値のコピーで、消費側が Publisher のメモリを参照することはありません。同じファミリーと Tag の Publisher が複数あると、先着の1個だけが provider として受理されます。

**理解のポイント**

- 風と当たり判定は、経路も反映のタイミングも異なります。Publish した収集設定は次の Tick 以降に反映され、風は消費側の外挿で位相を揃えます。
- Publisher と消費側は別のタイミングで評価されます。評価順の差で位相が巻き戻らないようにする時計の仕組みに注目してください。
- Entry の解決は Game Thread の `PreUpdate`、Publish は `Update_AnyThread` で行います。Update が止まる枝に置くと Publish も止まります。
- Publisher が不在の状態と、存在して無効な状態は別です。`Shared` と `Auto` の動作の違いも合わせて確認してください。

<DocFigure src="/img/generated/internals-publisher-routes-ja.svg" alt="Publisher から風の Entry と Simple World の Entry に分岐し、それぞれ風の消費側と Reader へ届く2経路" caption="左列は風の状態を消費側へ渡す経路、右列は Desc から Tick の収集を経て Reader へ形状を渡す経路です。" maxWidth={960} />

## 関連ファイル

| ファイル | 役割 |
|---|---|
| [`Public/AnimNode_KawaiiPhysicsSharedPublisher.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNode_KawaiiPhysicsSharedPublisher.h) | Publisher ノードの宣言 |
| [`Private/AnimNode_KawaiiPhysicsSharedPublisher.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsSharedPublisher.cpp) | ノードの実装と `FKawaiiPhysicsSharedPublishHelper` |
| [`Private/AnimNode_KawaiiPhysicsSharedPublisherInternal.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsSharedPublisherInternal.h) | Helper の宣言。テストから直接使う |
| [`Public/KawaiiPhysicsSharedPublisherTypes.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsSharedPublisherTypes.h) | `FKawaiiPhysicsSharedPublisherEntry`、`FKawaiiPhysicsSharedPublisherState`、`FKawaiiPhysicsSharedWindState` |
| [`Private/KawaiiPhysicsSharedCollisionSubsystem.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsSharedCollisionSubsystem.cpp) | Publisher Entry の実装と `FindOrCreateSharedPublisherEntry` |
| [`Private/AnimNode_KawaiiPhysicsCollision.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsCollision.cpp) | `ResolveSimpleWorldCollisionSource`、`IsSharedProviderAlive`、Reader の読み取り |
| [`Private/ExternalForces/KawaiiPhysicsExternalForce_ProceduralWind.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/ExternalForces/KawaiiPhysicsExternalForce_ProceduralWind.cpp) | `ResolveSharedWindSource`、`ApplySharedWindState`、`PreApply` の共有経路 |
| [`Private/KawaiiPhysicsLibrary.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsLibrary.cpp) | `SetSharedPublisherEnabled` などの Blueprint API |

## 設計の要点

### Publisher の役割

Publisher はポーズを変更しません。`Evaluate_AnyThread` は `Source.Evaluate` を呼ぶだけです。配信はすべて `PreUpdate`（Entry の解決）と `Update_AnyThread`（Publish）で行います。Update で動くので、Blend の weight が 0 の枝や非アクティブな State に置くと Publish が止まります。

配信は2つの Entry に分かれ、それぞれ別の経路で消費側へ届きます。

| 経路 | Entry | 配るもの | 消費側 |
|---|---|---|---|
| 風 | `FKawaiiPhysicsSharedPublisherEntry` | パラメータ、位相、突風、有効フラグ | `FKawaiiPhysics_ExternalForce_ProceduralWind` |
| 当たり判定 | `FKawaiiPhysicsSimpleWorldCollisionEntry` | provider の Desc | Subsystem の Tick が収集し、Reader が Slot を読む |

Reader は Publisher Entry を読みません。形状の読み取りが依存するのは SimpleWorld Entry だけです。`State.SimpleWorldDesc` と `State.SimpleWorldSettings` も Publish されますが、読むのはデバッグ情報と `GetSimpleWorldCollisionSettingsOnSharedPublisher` だけです。

どちらの Entry もキーは `(ファミリー root Actor, Tag)` です。`SharedPublisherRegistry` と `SimpleWorldRegistry` は別のレジストリです。

### データの流れ

<DocFigure src="/img/generated/internals-publisher-sequence-ja.svg" alt="6参加者のレーンに、要求の蓄積、Publisher の更新、Subsystem Tick、消費側の読み取りをスレッド区間とロック付きで並べたシーケンス図" caption="この図は実行順の一例です。別 AnimBlueprint の Publisher 更新と消費側評価は前後し得ます。青い帯でスレッド区間、橙の破線で初回の所有権取得時の PublishState を示します。" maxWidth={960} />

消費側の順序は、当たり判定と風で異なります。当たり判定は Publisher の Update の後に Tick が収集した結果を読むので、Publish した設定が反映されるのは次の Tick 以降です。風は Publisher と別の AnimBlueprint の消費側が先に評価されることがあるので、位相を外挿で揃えます。

### 所有権

同じファミリーと Tag の Publisher が複数あると、`FKawaiiPhysicsSharedPublisherEntry::PublishState` が先着の1個だけを provider として受理します。

```cpp
const bool bCanPublish = ProviderID == 0
    || ProviderID == InProviderID
    || IsKawaiiPhysicsFrameAgeExceeded(CurrentFrame, LastFrame, ProviderMaxAgeFrames);
```

`ProviderID` はノードのアドレスで、0 は未所有の番兵です。ID 0 の Publish は拒否します。現在の provider が `ReaderReleaseMaxAge` を超えて Publish していなければ、別の Publisher が引き継げます。`bExpired` が立った Entry はどの Publisher からの Publish も拒否するので、取得し直す必要があります。

所有権の確認は `ReadProviderSnapshot` が ID と期限を1つのロック区間で読み、解放は `MarkExpiredIfProvider` が ID の確認と `bExpired` の設定を1つのロック区間で行います。別々に読むと、間に別の Publisher が claim したときに、期限切れの旧 provider が自分を生存中と誤認したり、新しい provider の Entry を期限切れにしたりするためです。

負けた Publisher は Desc を SimpleWorld Entry から取り下げます（`UnregisterProviderDesc`）。取り下げないと負け側の設定が `BuildMergedDesc` に混ざるためです。Pending 要求も消費しません。警告ログは非 Shipping のビルドで1回だけ出ます。

## 処理の流れ

### PreUpdate

`FAnimNode_KawaiiPhysicsSharedPublisher::PreUpdate` は Game Thread で動きます。毎フレーム最初に `PreUpdateFrame` と `ProviderMaxAgeFrames` を確定し、World と SkelComp を解決します。World が変わった場合とゲーム時刻が巻き戻った場合は、`SharedWind.ResetRuntimeState` と `ResetWindClock` を実行します。

Entry を取り直す必要があるかは次の条件で判定します。どれも該当しなければ何もしません。

| 条件 | 内容 |
|---|---|
| `bReinit` | `bReinitRequested` が立っている |
| `bNeedsReacquire` | Helper が Publisher Entry を持たない、または再取得を要求している |
| `bTagChanged` | `SharedGroupTag` が `ResolvedTag` と異なる |
| `bContextChanged` | ファミリー root、Subsystem、SkelComp のいずれかが変わった |
| `bWindPresetChanged` | Wind Preset の Data Asset か Tag が変わった |
| `NeedsSimpleWorldEntryReacquire` | SimpleWorld Entry だけを持っていない |

SimpleWorld Entry の再取得以外の条件では `ApplySharedWindPreset` を実行します。プリセットだけの変更なら、適用して終わります。

ファミリー root は毎フレーム解決して比較するので、Publisher はアタッチの変更に追従します。キーが同じで Publisher Entry が健全なら Entry を保持し、必要なら SimpleWorld Entry だけを取り直します。それ以外は `ReleaseEntries` の後に `FindOrCreateSharedPublisherEntry` で取り直します。

新しい Entry に生存中の別 provider がいる場合、または `bExpired` が立っている場合は、`FindSimpleWorldEntry` で参照だけを持ち、Desc を登録しません。それ以外は `FindOrCreateSimpleWorldEntry` で provider として登録します。

### Update_AnyThread

`Update_AnyThread` は exposed input の評価と `Source.Update` の後に、`FKawaiiPhysicsSharedPublishHelper::Update` を呼びます。

1. Publisher Entry が無ければ再取得を要求して戻る
2. 前進量を決める。ゲーム時刻が前回と今回の両方であれば、その差を使う
3. 所有権に関係なく、自分の `SharedWind` の時計を進める
4. `ReadProviderSnapshot` で所有権を確認する。生存中の別 provider がいれば手順8へ進む
5. UPROPERTY の変化を実効値へ取り込む
6. Publish する
7. 受理されたら SimpleWorld Entry の Desc を更新して終わる
8. 拒否されたら Desc を取り下げる。Entry が期限切れなら再取得を要求する

手順6は、前フレームから自分が provider かどうかで分かれます。

| 状態 | 順序 | Publish 回数 |
|---|---|---|
| 所有済み | Pending を消費し、状態を作り、Publish する | 1回 |
| claim（provider 不在、期限切れからの取得） | 状態を作って Publish し、受理されたら Pending を消費し、状態を作り直して再度 Publish する | `SharedWind` があれば2回 |

claim のフレームで順序を入れ替えているのは、拒否された Publisher が Pending を消費しないためです。時計を手順3で先に進めるのは、最初の Publish で前フレームの `Time` を配ると、別の AnimBlueprint の消費側がその中間状態を読んで位相が巻き戻るためです。

同じフレームに UPROPERTY の変化と Pending 要求が競合したときの結果は、種類によって異なります。Enabled は `ReapplyChangedInputs` が UPROPERTY の値へ戻します。収集設定は構造体全体を比較して全体を戻すので、別のフィールドへの Pending の上書きも戻ります。風のパラメータは再適用の対象外で、Pending が `ConsumePendingRequests` で後から適用されます。

`Desc.bProviderDisabled` は `bEffectiveEnabled` と `EffectiveSimpleWorldSettings.bEnabled` の両方が真でないときに立ちます。Publisher が無効でも Publish と heartbeat は続くので、消費側は「不在」と区別できます。

### Provider / Reader の解決

<DocFigure src="/img/generated/internals-provider-reader-ja.svg" alt="Local、Shared、Auto の解決表と、Auto が provider の生存、不在、無効化に応じて取る状態" caption="上段で設定ごとの解決結果を比べ、下段で Auto の状態遷移と Shared の不在時の動作、風の値の復元を確認します。" maxWidth={960} />

`SimpleWorldCollisionSource` は消費側ノードの設定で、`ResolveSimpleWorldCollisionSource` が解決します。

| 設定 | 条件 | 結果 |
|---|---|---|
| `Local` | | Local |
| `Shared` / `Auto` | Tag が無効 | 警告を出して Local |
| `Shared` | 上記以外 | Reader。ファミリー root が無くてもキー無しの Reader のまま再試行する |
| `Auto` | ファミリー root が無い | Local |
| `Auto` | `IsSharedProviderAlive` が真 | Reader |
| `Auto` | 上記以外 | Local |

`IsSharedProviderAlive` は SimpleWorld Entry を検索し、provider の Desc があり、`LastProviderFrame` が `ReaderReleaseMaxAge` 以内かを確認します。

解決の結果が Reader なら、`FindOrCreateSimpleWorldEntry` を `bProvider = false` で呼び、`AddReaderMember` で参加します。Reader の評価は次の順です。

1. `MarkReaderRead` で heartbeat し、provider の生存を確認する
2. 失敗したら解放する。`Auto` は再初期化を要求し、`Shared` は再試行の回数を増やす
3. `IsProviderDisabled` が真なら配列を空にして戻る
4. 形状の serial とメンバーの serial の合計を確認し、コピーか再変換を行う。自分の SkelComp のメンバー Slot は除外する
5. 地面の serial を確認し、同じ処理を行う

`Auto` が Local で動いている間は、`AutoResolveInterval` 回の評価ごとに `IsSharedProviderAlive` を確認し、真なら `RequestSimpleWorldCollisionReinit` で Reader へ切り替えます。Local へ戻るときは `MarkReaderRead` の失敗が起点です。

Shared の Reader は provider が見つからない間、Entry の作成と解放を繰り返すので、`InitRetryThreshold` 回で警告を1回出した後は `InitRetryThrottleInterval` 回に1回へ間引きます。ピンで Source や Tag が変わった場合は、間引きを待たずに `UpdateSimpleWorldCollisionLimits` の先頭で解決し直します。

風の消費側は `WindSource` で同じ3択を持ち、`ResolveSharedWindSource` が Publisher Entry を直接検索します。`IsSharedPublisherEntryLive` は `ProviderID` が 0 でなく、かつ期限切れでないことを要求します。claim 前の Entry は `LastPublishFrame` が 0 なので、起動直後の MaxAge フレームの間は期限切れに見えません。その Entry へ接続すると突風要求を捨ててしまうので、`ProviderID` も確認します。

## 共有クロック

### Publisher の時計

Publisher の `SharedWind.RuntimeState` が持つ `Time` と `UnscaledTime` が共有クロックの本体です。前進量は `PreUpdate` で取得した `World->GetTimeSeconds()` の差です。コメントのとおり、ゲーム時刻の差を使うので `PreUpdate` 自体が止まった期間も回収できます。逆に、World が停止している間は評価の DeltaTime があっても進みません。前回の時刻が無い最初のフレームと、World を持たない呼び出し元だけ DeltaTime を使います。

現在の Entry へ Publish 済みなら、前進に使う `TimeScale` と有効フラグは前回 Publish した値です。消費側は前回 Publish された値で外挿しているので、Publisher も同じ値で当フレーム分を進め、新しい値は次のフレーム以降の外挿用として Publish します。これで評価順に関わらず、Publish する時刻が消費側の外挿値以上になります。位相のポップと突風エンベロープの巻き戻しは、この関係で防いでいます。`AdvanceWindTime` は構造体の現在の `TimeScale` を掛けるので、ここでは使わず `Time` へ直接加算します。

### 消費側の時計

消費側は新しい serial を見つけると `ApplySharedWindState` で `Time`、`GameTimeSeconds`、`PublisherTimeScale`、`ActiveGust` などを採用します。Publisher と消費側は別のタイミングで評価されるので、serial が変わらないフレームも含めて、基準時刻からの外挿で `Time` を求めます。

```cpp
const float Elapsed = RuntimeState->bPublisherWindDisabled ? 0.0f : static_cast<float>(FMath::Max(
    0.0, Node.GetSharedWindGameTimeSeconds().GetValue() - RuntimeState->SharedGameTimeAtPublish.GetValue()));
RuntimeState->Time = RuntimeState->SharedWindTimeAtPublish + Elapsed * RuntimeState->CachedPublisherTimeScale;
```

ゲーム時刻が基準なので、WarmUp のように1回の評価で `PreApply` を複数回呼んでも時計は二重に進みません。ゲーム時刻が使えない場合は、新しい serial が無いフレームだけステップの時間を積算します。この経路では `IsWarmingUp` の間と Publisher の無効中は進めません。

### SharedWindClockGeneration

`FAnimNode_KawaiiPhysics::PreUpdate` は、World が変わったときとゲーム時刻が巻き戻ったときに `SharedWindClockGeneration` を増やします。`FKawaiiPhysics_ExternalForce_ProceduralWind::PreApply` は `RuntimeState->ClockGeneration` と比較し、異なれば値を記録します。記録済みの値が 0 でなければ `ResetRuntimeState` で旧時計を捨てます。0 のときに捨てないのは、起動直前に届いた要求を保持するためです。

Publisher も同じ2条件で時計をリセットします。消費側の世代管理と Publisher のリセットが揃うので、World の変更やゲーム時刻の巻き戻りの後も、両者の基準がずれません。この比較は `WindSource` の分岐より前にあるので、Local の風にも効きます。

## Publisher 不在時の振る舞い

| 消費側の設定 | 当たり判定 | 風 |
|---|---|---|
| `Local` | 自身で収集する | 自身で計算する |
| `Shared` | 配列を空にして再試行する。押し出しは無い | ローカルの値で積算を続ける。解決の失敗が60回に達すると非 Shipping のビルドで警告する |
| `Auto` | Local へ切り替える | ローカルの値で積算を続ける |

風の消費側は Shared を離れるときに `RestoreLocalSharedParams` で共有13項目を採用前の値へ戻します。`Auto` と `Shared` のどちらも、最後に受け取った共有パラメータでは動きません。戻すのは13項目だけで、`Time`、`UnscaledTime`、`ActiveGust` は維持したままローカルの積算を続けます。

Publisher が存在して `bEnabled` が偽の状態は不在とは別です。Publish と heartbeat は続くので `Auto` は Local へ戻りません。当たり判定は `PublishSimpleWorldEmptyLimits` と `IsProviderDisabled` で空になり、風は `bPublisherWindDisabled` でサンプルが 0 になり、外挿も止まります。

## ReaderReleaseMaxAge と AutoResolveInterval

| CVar | 既定値 | 使う場所 |
|---|---|---|
| `a.AnimNode.KawaiiPhysics.SharedPublisher.ReaderReleaseMaxAge` | `60` | 下の表を参照 |
| `a.AnimNode.KawaiiPhysics.SharedPublisher.AutoResolveInterval` | `30` | `Auto` の Local 状態からの再確認間隔（`UpdateSimpleWorldCollisionLimits` の回数）、風の再解決の間隔（`PreApply` の回数）。1 未満は 1 として扱う |
| `a.AnimNode.KawaiiPhysics.SharedPublisher.DebugDraw` | `0` | Subsystem の Tick から Tag、Reader 数、収集数のラベルを描画する |

`ReaderReleaseMaxAge` は provider の生存判定に共通で使います。

| 場所 | 用途 |
|---|---|
| Publisher の `ProviderMaxAgeFrames` | 別の Publisher が所有権を引き継げるまでのフレーム数 |
| `MarkReaderRead`、`IsSharedProviderAlive` | Reader が provider を生存中と見なす上限 |
| `PreApply`、`ResolveSharedWindSource` | 風の消費側が Entry を手放す条件 |
| `ResolveLiveSharedPublisherEntry` | Blueprint API が要求を受け付ける条件 |
| `BuildSharedPublisherDebugInfo` | `bProviderAlive` |

Publisher の Update が止まった後、当たり判定の Reader が provider を見失うまでのフレーム数は、`ReaderReleaseMaxAge` と `SimpleWorldCollision.CleanupMaxAge` の小さい方で決まります。前者を超えると `MarkReaderRead` が失敗し、後者を超えると Desc 自体が除去されます。それまでの間も Tick は最後の Desc で収集を続けます。

風の消費側は `IsExpired` で、`ReaderReleaseMaxAge` の経過と `bExpired` の両方を見ます。Publisher Entry は `SharedCollision.CleanupMaxAge` を超えると掃除で `MarkExpired` されるので、`ReaderReleaseMaxAge` の方が大きくても、その時点で共有を終えます。

## コピーされるものと共有されるもの

ノード間の受け渡しはすべて値のコピーです。消費側が Publisher のメモリを参照することはありません。

| データ | 受け渡し | 備考 |
|---|---|---|
| `FKawaiiPhysicsSharedPublisherState` | `PublishState` が `StateLock` 内で全体を値コピーする | 受理された Update ごとに serial が増える |
| `FKawaiiPhysicsSharedWindState` | `ReadWindState` が `State.Wind` だけをコピーする | 消費側は serial が変わったときだけ読む |
| 風の13項目 | `BuildSharedWindParams` が抽出し、`ApplyDynamicParams` が消費側の構造体へ上書きする | 初回の採用時に `LocalSharedParamsBackup` へ退避する |
| 形状 | Tick が Slot へ Publish し、各 Reader が `SimpleWorldMergedScratch` へコピーする | シミュレーション空間への変換はノードごと |
| 突風の要求 | 消費側から `PendingGusts` へ積み、Publisher が消費する | 開始した `ActiveGust` は State で全消費側へ配られる |

共有する13項目は、風向き、`ConstantForce`、`SwayForce`、`SwayPeriod`、`RippleForce`、`RipplePeriod`、`RippleTipPhaseDelay`、`StrengthCycleRange`、`StrengthCyclePeriod`、`RandomForce`、`RandomForcePeriod`、`WindDirectionNoiseAngle`、`WindDirectionNoisePeriod` です。`bIsEnabled`、`SwayPhaseOffset`、`RipplePhaseOffset`、`StrengthCyclePhaseOffset`、`TimeScale` の5項目はノード個別です。`Seed`、ボーンフィルタ、`ForceRateByBoneLengthRate` も配りません。

Publisher ノード自体をコピーしたときの扱いは次のとおりです。

- コピーコンストラクタと `operator=` は設定値をコピーし、`Helper` は新しく作ります。Helper の Entry、実効値、時計は引き継ぎません。
- `SourceID` は `this` のアドレスなので、コピー先は別の provider です。`operator=` は代入前に自分の Entry を解放し、キャッシュを捨てて `bReinitRequested` を立てます。
- `SharedWind` の `RuntimeState` はインスタンス間で共有しません。コピー先が有効な `RuntimeState` を持っていれば、ポインタと中身を保持します。コメントによれば、Persona の `CopyNodeDataToPreviewNode` のようなインプレース同期で時刻をリセットしないためです。

エディタでは `UAnimGraphNode_KawaiiPhysicsSharedPublisher::CopyNodeDataToPreviewNode` がプレビューノードへ設定をコピーします。Tag や Gather Scope などの変更時とプリセット使用時に `RequestSharedPublisherReinit` を要求しますが、`RuntimeState` には触らないので位相と突風は保たれます。

## スレッド安全性

| データ | スレッド | 保護 |
|---|---|---|
| `CachedFamilyRoot`、`CachedSkelComp`、`SharedWindBeforePreset` など | `PreUpdate`（Game Thread） | ロック無し |
| `CachedWindGameTimeSeconds`、`PreUpdateFrame`、`ProviderMaxAgeFrames` | `PreUpdate` で書き、`Update_AnyThread` が読む | ロック無し |
| `bReinitRequested` | 任意 | atomic |
| Helper の実効値、`LastPublishedState`、`SharedWind` の時計 | `PreUpdate`、`Update_AnyThread` | ロック無し。コメントでは Helper が Worker 上の `SharedWind` の唯一の書き手とされている |
| `State`、`ProviderID`、`bExpired` | 任意 | `StateLock` |
| `PublishSerial`、`LastPublishFrame` | 任意 | atomic |
| `PendingGusts`、Pending の Enabled / Settings / WindParams | 任意 | `GustMutex` |
| 風の `PendingParams`、`PendingGust` | 任意 | `RuntimeState->Mutex` |
| 消費側の `SharedPublisherEntry`、`LocalSharedParamsBackup` など | `PreApply` のみ | コメントのとおり `Mutex` の対象外 |

`UKawaiiPhysicsLibrary` の `SetSharedPublisherEnabled`、`SetSimpleWorldCollisionSettingsOnSharedPublisher`、`SetProceduralWindParametersOnSharedPublisher`、`StartProceduralWindGustOnSharedPublisher`、`StopProceduralWindGustOnSharedPublisher` は Game Thread で `ResolveLiveSharedPublisherEntry` を通し、Entry の Pending へ積むだけです。適用は provider の次の Update で行います。`RequestWindParams` は項目単位でマージするので、同じフレームの複数の要求が失われません。

serial と状態の組は `ReadWindState` が同じロック区間で読みます。別々に読むと、間に Publish が入って状態と serial がずれます。

消費側からの突風要求は呼び出しスレッドでは Entry を触らず、`RuntimeState` の `PendingGust` へ積みます。Worker の `PreApply` が `SendPendingGustRequestsToSharedEntry` で転送するので、コメントのとおり全消費側へ届くのは1〜2フレーム後です。これは Publisher の Update と各消費側の `PreApply` が毎フレーム動く場合の値で、間引かれるとその分遅れます。`PendingGusts` を消費するのは Publisher だけなので、消費される前に Entry が失効すると、その要求は適用されません。

ロックの順序は [Subsystem と Shared Collision](/docs/internals/shared-collision#ロックの粒度と順序) を参照してください。

## 状態とライフサイクル

| イベント | 動作 |
|---|---|
| `Initialize_AnyThread` | `bReinitRequested` を立て、Helper の実効値を UPROPERTY へ戻す。`PendingDeltaTime` は保持する |
| reinit（次の `PreUpdate`） | キーが同じで Entry が健全なら Entry を保持し、実効値を戻す。`RuntimeState` は変えない |
| Tag、ファミリー、Subsystem、SkelComp の変更 | `ReleaseEntries` の後に取り直す。実効値は UPROPERTY へ戻る |
| `SharedGroupTag` のピンによる変更 | ピンは `Update_AnyThread` で評価され、Entry の解決は `PreUpdate` で行うので、そのフレームは旧 Entry へ Publish する。次の `PreUpdate` で取り直す |
| Publisher Entry の経過による期限切れ（`MarkExpired` の前に復帰） | 同じ provider の `PublishState` は受理されるので Entry を保持する。実効値も保持する |
| Publisher Entry の `MarkExpired`（掃除など） | `PublishState` が拒否され、`bNeedsEntryReacquire` で次の `PreUpdate` が取り直す。実効値は UPROPERTY へ戻り、Blueprint API で適用した Enabled と収集設定の上書きも消える |
| SimpleWorld Entry だけの消失 | `SetSimpleWorldEntry` で差し替える。実効値と風の時計を保持し、`SharedWind` にも触らない |
| `ResetDynamics(ResetPhysics)` | `SharedWind.ResetRuntimeState` と `ResetWindClock` |
| `ResetDynamics(TeleportPhysics)` | SimpleWorld Entry へ `RequestRegather` |
| World の変更、ゲーム時刻の巻き戻り | `ResetDynamics(ResetPhysics)` と同じ処理 |
| weight 0、LOD、非アクティブな State | `PreUpdate` が動いても `Update_AnyThread` が止まれば Publish と heartbeat が止まる |
| ノードの破棄、`operator=` | `ReleaseEntries` が Desc を外し、自分が provider なら `MarkExpiredIfProvider` する |

`ReleaseEntries` は `MarkExpiredIfProvider` で自分が所有者のときだけ Entry を期限切れにします。所有権を持たない Publisher がファミリーを変えても、勝っている側の Entry は失効しません。

`FindOrCreateSharedPublisherEntry` は `bExpired` の Entry を見つけると、掃除を待たずに新しい Entry へ置き換えます。コメントのとおり provider の交代を掃除の間隔まで止めないためです。旧 Entry を保持している側は `IsExpired` と `PublishState` の拒否で気付きます。消費側の風は Entry を手放した後、`AutoResolveInterval` 回の間隔で再解決します。

ファミリーの追従は Publisher だけが毎フレーム確認します。消費側は Entry の取得時にキーを解決するので、Publisher が移動して Desc を外せば Reader は `MarkReaderRead` の失敗から解決し直しますが、消費側の Actor だけが別のファミリーへ移動した場合は、元の provider が生きている間は元の Entry を読み続けます。`Auto` が Local で動いている間の確認も、解決時に保存した `SimpleWorldSharedKey` を使います。

## 他機能との関係

**配置。** 宣言のコメントは、本体メッシュの Post Process AnimBP か、Output Pose 直前の幹に置くよう案内しています。エディタの `ValidateAnimNodeDuringCompilation` は、同じ AnimBlueprint 内の同じ Tag の重複に警告を出します。別の AnimBlueprint の重複はランタイムの所有権で解決します。

**Simple World Collision の設定。** Reader では、ノード側の収集設定7項目は使いません。`Auto` は Local に戻ったときだけ使います。`bGatherFamilyMembers` を使うときは、メンバーの ObjectType を `ObjectTypes` に含めます。メンバーの ObjectType が Pawn なら Pawn が必要です。

**Wind Preset。** `ApplySharedWindPreset` は Game Thread 専用で、初回の適用の直前に `SharedWindBeforePreset` へ元の値を退避し、プリセットが外れたら書き戻します。適用時は `bIsEnabled` と `TimeScale` も固定します。Publisher Entry の再取得でプリセットは適用し直されるので、Blueprint から上書きした風の値も置き換わります。SimpleWorld Entry だけの再取得では適用しません。

**AnimNotify。** `UAnimNotify_KawaiiPhysicsTriggerGust` は `EKawaiiPhysicsGustTarget::SharedPublisher` のとき、Publisher Entry へ突風要求を送ります。

**Wind Scope。** `ProcessPendingAndWind` が `RecordScopeSample` を呼び、Publisher の `SharedWind` にも Wind Scope 用のサンプルを記録します。

**同一 Tag の既定値。** `SharedGroupTag`、`SimpleWorldCollisionSharedTag`、`SharedWindTag` の既定値はすべて `TAG_KawaiiPhysics_Shared_Default`（`KawaiiPhysics.Shared.Default`）です。

**デバッグ。** `UKawaiiPhysicsLibrary::GetSharedPublisherDebugInfo` は `BuildSharedPublisherDebugInfo` を通じて、Entry の serial、provider の生存、Reader 数などを返します。Shipping では常に偽です。統計は `STATGROUP_Anim` の `KawaiiPhysics_SharedPublisher_NumEntries`、`KawaiiPhysics_SharedPublisher_NumReaders`、`KawaiiPhysics_SharedPublisher_PublishesPerFrame` で、Subsystem の掃除の区間で更新します。`PublishesPerFrame` の値は、掃除の間隔内の serial の増分です。

## 変更するときの注意

- 風の項目を共有対象に足すときは、`FKawaiiProceduralWindDynamicParams`、`BuildDynamicParamsSnapshot`、`ApplyDynamicParams`、`BuildSharedWindParams` を同時に直します。ノード個別にするなら `BuildSharedWindParams` で `bOverride` を外します。
- `FKawaiiPhysicsSimpleWorldCollisionSettings` にフィールドを足すときは、`AreSimpleWorldSettingsEqual` と `BuildSimpleWorldCollisionDesc` も直します。比較に漏れると UPROPERTY の変更が実効値へ反映されません。
- Helper の時計の前進は、`BuildDescAndState` が State へ入れる値と同じ規則に保ちます。ここがずれると消費側の位相が巻き戻ります。
- 所有権の判定を `GetProviderID` と `IsExpired` の個別の呼び出しへ分けないでください。
- Pending の消費は所有権の確定後に行います。拒否された Publisher が消費すると Blueprint の要求が失われます。
- `ProviderID` の 0 は未所有の番兵です。Publish に使わないでください。
- `SourceID` はノードのアドレスなので、ノードの再配置があれば別の provider として扱われます。
- 消費側が Entry を採用するときは `ProviderID` が 0 でないことも確認します。`IsExpired` だけでは起動直後の未所有 Entry を除外できません。

| テスト | 守る内容 |
|---|---|
| `KawaiiPhysics.SharedPublisher.EntryPublishRead`、`KawaiiPhysics.SharedPublisher.PublishHelperUpdate` | Publish と読み取りの基本動作 |
| `KawaiiPhysics.SharedPublisher.StaleProviderHandoff`、`KawaiiPhysics.SharedPublisher.ExpiredEntryReplacedOnAcquire` | provider の交代 |
| `KawaiiPhysics.SharedPublisher.RejectedDuplicateRemovesPreUpdateDesc` | 負けた Publisher の Desc の取り下げ |
| `KawaiiPhysics.SharedPublisher.DetachedSimpleWorldEntryRebound` | SimpleWorld Entry だけの再取得 |
| `KawaiiPhysics.SharedPublisher.InputChangeBeatsSameFramePending`、`KawaiiPhysics.SharedPublisher.WindParamsRequestsMerge` | 要求の優先順位とマージ |
| `KawaiiPhysics.SharedPublisher.ClaimFramePublishesCaughtUpClock`、`KawaiiPhysics.SharedPublisher.StalledPublisherResumesWithoutTimeRewind` | 時計が巻き戻らないこと |
| `KawaiiPhysics.SharedPublisher.Regression.GameTimeClock` | ゲーム時刻の時計、WarmUp、評価順、World の変更 |
| `KawaiiPhysics.SharedPublisher.Regression.OwnerFamilyChanges` | ファミリーの変更と競合 |
| `KawaiiPhysics.SimpleWorld.Regression.DirectSourceAndTagChanges`、`KawaiiPhysics.SimpleWorld.ThrottledReaderDetectsPinChange` | ピンによる Source と Tag の変更 |
| `KawaiiPhysics.SimpleWorld.AutoSourceFollowsProvider`、`KawaiiPhysics.SimpleWorld.SharedReaderClearsWhenProviderDisabled`、`KawaiiPhysics.SimpleWorld.SharedReaderReleasesWhenProviderGone` | Reader の状態遷移 |
| `KawaiiPhysics.SimpleWorld.MissingProviderInitIsThrottled` | provider 不在時の再試行 |
| `KawaiiPhysics.Library.SharedPublisherWindApi` | Blueprint API |

## 関連ページ

- [Subsystem と Shared Collision](/docs/internals/shared-collision)
- [Simple World Collision](/docs/internals/simple-world-collision)
- [Procedural Wind](/docs/internals/procedural-wind)
- [ランタイム制御と要求キュー](/docs/internals/runtime-control)
- [Shared Publisher（ユーザー向け）](/docs/features/shared-publisher)
