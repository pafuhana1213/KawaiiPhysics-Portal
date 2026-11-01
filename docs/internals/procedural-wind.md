---
sidebar_position: 9
title: "Procedural Wind"
description: "FKawaiiPhysics_ExternalForce_ProceduralWind の波形合成、時刻の持ち方、RuntimeState、Gust、Shared Publisher との関係、決定論性を説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# Procedural Wind

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

このページでは波形の合成、時刻、状態の持ち方を説明します。外力としての呼び出し回数と `ExternalForceSpace` の扱いは[外力](/docs/internals/external-forces)、Publisher 側の処理は [Shared Publisher](/docs/internals/shared-publisher) を参照してください。

## このページの要点

**概要**

`FKawaiiPhysics_ExternalForce_ProceduralWind` は、UE の `WindDirectionalSource` に依存せず、パラメータだけから風を合成する外力です。波形は時刻の関数なので、Wind Scope で同じ関数を評価して表示でき、Seed で揺らぎを再現できます。

**設計**

設定は構造体のプロパティが持ち、実行中の状態は `RuntimeState` が持ちます。`RuntimeState` はインスタンス間で共有せず、コピーで渡るのは設定だけです。時刻の更新とボーンに依存しない成分の計算は `PreApply` で行い、適用時には Ripple、ボーン長カーブ、必要な空間変換をボーンごとに計算します。実行時の変更は任意のスレッドから要求として積み、Worker の `PreApply` が取り込みます。

**理解のポイント**

- 波形は時刻で決まるので、時刻がいつ進み、いつ止まるかを追うと挙動を整理しやすくなります。`Local` は自分で時刻を進め、Publisher に接続している間は Publisher の時刻を基準にします。
- 時刻と風向きはフレーム単位で決まり、サブステップの間は変わりません。ボーンごとの位相と強さは、Ripple と `ForceRateByBoneLengthRate` で調整します。`BoneSpace` では、ボーンの Transform によって力の向きや大きさも変わります。
- Gust には複数の経路があります。風本体の `ActiveGust` を動かす経路と、別の外力として加算する経路を区別してください。
- Shared の間は、Publisher の値で上書きされる項目とノードの値を使う項目が分かれます。Shared を離れるときに戻る値と残る値も区別してください。

<DocFigure src="/img/generated/internals-wind-compose-ja.svg" alt="ConstantとSwayにRippleを足し、StrengthCycleを掛け、RandomとGustを加えて風向きとともにボーン位置へ適用する合成図" caption="強さを左から合成してTotalを求め、下段で方向ベクトル、ボーン長カーブ、ステップ幅とともに位置へ適用します。" maxWidth={960} />

## 関連ファイル

| ファイル | 役割 |
|---|---|
| [`Public/ExternalForces/KawaiiPhysicsExternalForce_ProceduralWind.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/ExternalForces/KawaiiPhysicsExternalForce_ProceduralWind.h) | 構造体本体、`FKawaiiProceduralWindDynamicParams`、`FKawaiiProceduralWindRuntimeState` |
| [`Private/ExternalForces/KawaiiPhysicsExternalForce_ProceduralWind.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/ExternalForces/KawaiiPhysicsExternalForce_ProceduralWind.cpp) | 波形の計算、要求の取り込み、Shared の解決、コピーの処理 |
| [`Public/KawaiiPhysicsWindPresetDataAsset.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsWindPresetDataAsset.h) | `FKawaiiProceduralWindPreset` と Data Asset |
| [`Public/KawaiiPhysicsSharedPublisherTypes.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsSharedPublisherTypes.h) | `FKawaiiPhysicsSharedWindState`、`FKawaiiPhysicsSharedPublisherEntry` |
| [`Private/AnimNode_KawaiiPhysicsSimulation.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsSimulation.cpp) | 一時 Gust の構築 `BuildTransientGustForce` |

## 設計の要点

### 波形の構成

合成式はヘッダのコメントと `ComputeWindSample` のとおりです。

```text
Total = (Constant + Sway + Ripple) * StrengthCycle + Random + Gust
```

各成分は時刻 `t` と、ボーンの長さ比率 `r`（`LengthRateFromRoot`）から求めます。

| 成分 | 式 | ボーン依存 |
|---|---|---|
| Constant | `ConstantForce` | なし |
| Sway | `SwayForce * sin(2π * t / SwayPeriod + SwayPhaseOffset)` | なし |
| Ripple | `RippleForce * sin(2π * t / RipplePeriod - r * RippleTipPhaseDelay + RipplePhaseOffset)` | あり |
| StrengthCycle | `Lerp(Min, Max, 0.5 * (1 + sin(2π * t / StrengthCyclePeriod + StrengthCyclePhaseOffset)))` | なし |
| Random | `RandomForce * SampleSmoothNoise(t / RandomForcePeriod, Seed, 0)` | なし |
| Gust | `EvaluateActiveGust`（後述） | なし |

位相のオフセットと `RippleTipPhaseDelay` は度の値を `DegreesToRadians` で変換します。周期はどれも `FMath::Max(Period, 0.01f)` でクランプしてから割ります。`StrengthCycleRange` の倍率がかかるのは Constant、Sway、Ripple だけで、Random と Gust には影響しません。

`WindDirectionNoise` は強さでなく方向の揺らぎで、`Total` には含まれません。`WindDirectionNoiseAngle` が正のとき、`Time / WindDirectionNoisePeriod` で Channel 1 と 2 のノイズを引き、`ApplyConeNoiseToDirection` が `WindDirection` を軸とする円錐の中で方向をぶらします。1フレームに1方向だけ計算し、全ボーンで共有します。

### データの持ち主

設定は構造体の `UPROPERTY` が持ち、実行中の状態はすべて `RuntimeState`（`TSharedPtr<FKawaiiProceduralWindRuntimeState, ESPMode::ThreadSafe>`）が持ちます。

| 状態 | 書き手 | 保護 |
|---|---|---|
| `PendingParams`、`PendingGust`、`PendingGustStop` | 任意のスレッドが積み、Worker の `PreApply` が取り込む | `Mutex` |
| `Time`、`UnscaledTime`、`ActiveGust`、`Cached*` | `PreApply` | Worker だけが書く |
| `SharedPublisherEntry`、`ResolvedSource`、`LocalSharedParamsBackup` など共有風の状態 | `PreApply` | ヘッダのコメントのとおり Worker 専用で、`Mutex` の対象外 |
| `ScopeBuffer`、`ScopeWriteIndex`、`ScopeSampleCount`（`WITH_EDITOR`） | `PreApply` が書き、Wind Scope が読む | `Mutex` |

`EnsureRuntimeState` のコメントは、`RuntimeState` を常に有効に保つことを不変条件としています。他のコードがロックなしで参照できるのはこの条件によるものです。コンストラクタで確保し、`ResetRuntimeState` もポインタを差し替えず中身だけを戻します（`KawaiiPhysics.ProceduralWind.ResetRuntimeState`）。

### コピー

`RuntimeState` はインスタンス間で共有しません。`TStructOpsTypeTraits` の `WithCopy` で独自の `operator=` を使い、設定だけをコピーします。

- コピーコンストラクタは新しい `RuntimeState` を持ちます。Gust のコメントにあるとおり、`RequestGust` のあとで本体をコピーすると `PendingGust` は失われます。
- 代入先が有効な `RuntimeState` を持つ場合は、そのポインタと中身を保持します。Persona のプレビュー同期（`CopyNodeDataToPreviewNode`）が形状の一致している間 in-place でコピーしても、シミュレーション時刻がリセットされないのはこのためです（`KawaiiPhysics.ProceduralWind.AssignmentPreservesDestinationRuntimeState`）。
- `WindSource` か `SharedWindTag` が変わる代入では、解決済みの Shared の状態を捨てます。

## 時刻の持ち方

風の時計は2つあります。

| 時計 | 前進 | 使う場所 |
|---|---|---|
| `Time` | `dt * TimeScale` | 全成分と方向ノイズ、既定の Gust エンベロープ |
| `UnscaledTime` | `dt` | `bRealTimeEnvelope` の Gust エンベロープ |

`AdvanceWindTime` は `PreApply` の中で呼ばれるため、`dt` は実フレーム時間です（WarmUp の固定サブステップでは `FixedDt`）。ステップごとには進まないので、1フレームの全サブステップは同じ `Time` の値を使います。`KawaiiPhysics.ProceduralWind.FramerateIndependence` は、同じキャッシュを1回で適用しても4分割で適用しても変位の合計が一致することを確認しています。`NumSteps` が 0 のフレームでも時刻は進みます。

`PreApply` は `MaxSubsteps` による時間のクランプより前に走ります。`MaxSubsteps * FixedDt` を超える長いフレームでは、物理はクランプ後の時間しか進みませんが、`Time` は実フレーム時間ぶん進みます。一時 Gust の `RemainingLifetime` も、シミュレーションできた時間ではなく評価時の `DeltaTime` で減ります。

`ClockGeneration` は時計の世代です。ノードは `PreUpdate` で World の変更かゲーム時刻の巻き戻りを検出すると `SharedWindClockGeneration` を進めます。`PreApply` は値の不一致を見つけると、`RuntimeState` の世代が 0 でなければ `ResetRuntimeState` を呼びます。世代が 0 のとき、つまり初回はリセットしません。コメントのとおり、起動直前に届いた要求を保持するためです。

## 1フレームの計算フロー

<DocFigure src="/img/generated/internals-wind-preapply-flow-ja.svg" alt="Local と Shared／Auto の風の前処理、Entry の有効性による分岐、Publisher の風が無効な場合のゼロ設定と適用の省略" caption="上段の Local と下段の Shared／Auto をたどります。Publisher の風が無効ならサンプルと CachedWindVector をゼロにし、Apply は適用せず終了します。それ以外は ComputeWindSample で計算します。" maxWidth={960} />

`Super::PreApply` は `bSupportsRandomForceScaleRange` が false なので乱数を使わず、`RandomizedForceScale` を 1 にします。

`PreApply` の後半は `ComputeWindSample(Time, 0.0f)` を1回呼び、ボーンに依存しない成分を `CachedSinesWithoutRipple`（Constant + Sway）、`CachedStrengthCycle`、`CachedRandom`、`CachedGust` に保存します。`Apply` は全ボーンで呼ばれるため、毎回計算しないようにするためのキャッシュです。Ripple だけはボーンごとに `Apply` で計算します。

`CachedWindVector` は `SafeDirectionOrForward` で正規化した方向にノイズを加え、`ConvertExternalForceToSimulationSpace` で変換した値です。`BoneSpace` ではボーンローカルのまま保存します。

`Apply` の計算は次のとおりです。

```text
Ripple = RippleForce * sin(...)   ボーンの LengthRateFromRoot を使う
Total  = (CachedSinesWithoutRipple + Ripple) * CachedStrengthCycle + CachedRandom + CachedGust
Force  = CachedWindVector * Total * ForceRate
Bone.Location += Force * GetStepDeltaTime()
```

`BoneSpace` では `CachedWindVector` の代わりに `BoneTM.TransformVector(CachedWindVector)` を使います。基底の `RandomizedForceScale` は掛けません。ソースコメントのとおり、ランダム性は Seed で管理する Random 成分に一本化しています。

### ボーン長比率

`Bone.LengthRateFromRoot` は `LengthFromRoot / TotalBoneLength` です。`TotalBoneLength` はルートごとの最長の `LengthFromRoot` なので、根元が 0、最も遠い末端が 1 になります。Procedural Wind では2か所で使います。

- **力の分配:** `ForceRateByBoneLengthRate` の評価値を `Total` に掛けます。カーブが空なら 1.0 で、全ボーンに同じ強さが掛かります。
- **Ripple の位相:** `r * RippleTipPhaseDelay` だけ位相を遅らせます。これにより波が根元から末端へ伝わります。ヘッダのコメントによれば、波が走り抜ける時間は `RipplePeriod * (RippleTipPhaseDelay / 360)` で、0 なら Sway と同じ動きに、負の値なら逆方向の波になります。

## Gust

`ActiveGust` は台形のエンベロープを1つ持ちます。`EvaluateActiveGust` は開始からの経過時間で値を返します。

| フェーズ | 値 |
|---|---|
| Rise（`RiseTime` の間） | `Strength * Elapsed / RiseTime` |
| Hold（`HoldTime` の間） | `Strength` |
| Decay（`DecayTime` の間） | `Strength` から 0 へ線形に減少 |
| 終了後 | 0 |

`RiseTime` が `KINDA_SMALL_NUMBER` 以下なら Rise を飛ばし、`DecayTime` が同様なら Hold の直後に 0 になります。終了しても `bIsActive` は下ろしません。

要求は `RequestGust` が `PendingGust` の単一スロットへ積み、`ConsumePendingRequests` が `ActiveGust` へ移します。同じフレームの複数の要求は後勝ちです。`StartTime` はその時点の `Time`（`bRealTimeEnvelope` なら `UnscaledTime`）です。Local の経路では取り込みが `AdvanceWindTime` より前なので、最初のフレームの経過時間は1フレーム分になります。

`RequestGustStop` は `PendingGustStop` に積まれ、開始要求のあとに処理されるので、同じフレームでは停止が優先されます。`BlendOutTime` が `KINDA_SMALL_NUMBER` 以下なら即座に `bIsActive` を下ろします。それ以外は現在の強度を `Strength` とする Decay だけのエンベロープに置き換え、時計は `Time` に切り替えます。

Gust の経路は3つあります。

| 経路 | 入口 | 動作 |
|---|---|---|
| 一時 Gust | `StartProceduralWindGust`、`StartProceduralWindGustOnComponent` | 別のインスタンスを `TransientForceStore.Items` に作る |
| Publisher | `StartProceduralWindGustOnSharedPublisher` | `FKawaiiPhysicsSharedPublisherEntry::RequestGust` に積み、Publisher が消費する |
| Wind Scope の試し吹き | `SKawaiiPhysicsWindScopeWindow::PushGustToLiveRuntime` | 対象の `RequestGust` を直接呼ぶ |

一時 Gust は、`ConstantForce` などが 0 の Procedural Wind に `RequestLocalGust` で突風だけを持たせたものです。元の風の `ActiveGust` は変わらず、別の外力として加算されます。そのため元の風の `ScopeBuffer` には記録されません。キューと継承の処理は[ランタイム制御と要求キュー](/docs/internals/runtime-control)を参照してください。

## ランタイム更新

`FKawaiiProceduralWindDynamicParams` は、18項目の `bOverride` と値の組です。呼び出し側は `RequestDynamicParams` で `PendingParams` に積み、次の `PreApply` で `ApplyDynamicParams` が反映します。

`PendingParams` への積み込みは `MergeProceduralWindDynamicParams` で項目ごとにマージします。単一スロットを上書きすると、取り込み前に届いた別の項目が失われるためです（ソースコメントより）。同じ項目は後勝ちです。`ApplyDynamicParams` は強さを 0 以上、周期を 0.01 以上にクランプします。

`BuildDynamicParamsSnapshot` は現在の値に `PendingParams` を重ねて返すので、`Set` の直後の `Get` でも指定した値が読めます。`Seed`、`WindSource`、`ForceRateByBoneLengthRate` は `FKawaiiProceduralWindDynamicParams` に含まれません。

`bIsEnabled` も更新の対象です。`PreApply` は無効な外力にも呼ばれるので、無効の間に積んだ要求も取り込まれ、時刻も進み続けます。

## Shared Publisher との関係

<DocFigure src="/img/generated/internals-wind-clock-ja.svg" alt="Localの2つの時計、Publisherの共有状態の採用と外挿、Localへ戻るときの設定復元と時計の継続を示す図" caption="上段でLocalと共有時計を比較し、下段で共有13項目を退避値へ戻しながら時計とGustを引き継ぐ経路を読みます。" maxWidth={960} />

`WindSource` は3種類です。

| `WindSource` | 動作 |
|---|---|
| `Local` | 自分で時刻を進めて波形を計算する |
| `Shared` | Publisher の値を使う。Entry がない間は Local と同じ経路で動く |
| `Auto` | ランタイムの処理は `Shared` と同じ |

`Shared` と `Auto` の実行時の違いは、解決の失敗が 60 回に達したときの警告ログが `Shared` だけに出ることです。`Local` 以外のときは、`SharedResolveCountdown` が 0 になるたびに `ResolveSharedWindSource` が `FindSharedPublisherEntry` で Entry を探します。Entry は `IsSharedPublisherEntryLive` で、provider が claim 済みで期限切れでないことを確認してから採用します。

Publisher が配る `FKawaiiPhysicsSharedWindState` を、消費側は `ApplySharedWindState` で採用します。`GetPublishSerial` が前回の値と異なるときだけ読み直し、Serial と State は同じロック区間で読みます。

| 項目 | Shared の間の扱い |
|---|---|
| 共有13項目（`WindDirection`、`WindDirectionNoiseAngle`、`WindDirectionNoisePeriod`、`ConstantForce`、`SwayForce`、`SwayPeriod`、`RippleForce`、`RipplePeriod`、`RippleTipPhaseDelay`、`StrengthCycleRange`、`StrengthCyclePeriod`、`RandomForce`、`RandomForcePeriod`） | Publisher の値で上書きする |
| `SwayPhaseOffset`、`RipplePhaseOffset`、`StrengthCyclePhaseOffset`、`Seed`、`bIsEnabled` | ノードの値を使う |
| ボーンフィルタ、空間、`ForceRateByBoneLengthRate` | ノードの値を使う |
| `TimeScale` | 値はノードのまま残る。時刻の外挿には `PublisherTimeScale` を使うので、Local へ戻るまで効かない |
| `ActiveGust` | Publisher の値で上書きする |

`Time` の扱いは次のとおりです。`SharedGameTimeAtPublish` とノードの `SharedWindGameTimeSeconds` の両方があれば、ゲーム時刻の差から絶対的に求めます。

```text
Time = SharedWindTimeAtPublish + Elapsed * CachedPublisherTimeScale
```

ゲーム時刻がなければ、Serial が変わらないフレームだけ `dt * CachedPublisherTimeScale` を足します。Publisher の風が無効の間は `bPublisherWindDisabled` が真になり、外挿を止め、サンプルをゼロにし、`Apply` も何もしません。

最初の採用の直前に `BuildSharedWindParams` でローカルの13項目を `LocalSharedParamsBackup` へ退避します。`PreApply` と `ResolveSharedWindSource` は Shared を離れるときに `RestoreLocalSharedParams` で書き戻すので、フォールバックは最後に受け取った共有値でなく authored の値で動きます。`ResetRuntimeState` も中身を消す前に復元します。コメントのとおり、共有値が authored の値として焼き付くのを防ぐためです。一時 Gust の `RequestLocalGust` だけは例外で、その時点の実効値に突風を乗せるため、書き戻さず退避を捨てます。

`RestoreLocalSharedParams` が戻すのは共有13項目だけです。採用済みの `Time`、`UnscaledTime`、`ActiveGust` は Shared を離れても残り、Local の時計としてそこから進みます。`LocalSharedParamsBackup` は最初の採用時の値のままで、Shared の間の `RequestDynamicParams` では更新されません。Shared 中に変更した共有項目は次の Serial で上書きされ、Local へ戻ると退避した値になります。

Shared の消費側へ来た Gust 要求は `SendPendingGustRequestsToSharedEntry` が Worker から Entry へ転送します。コメントによれば、全消費者へ届くのは1〜2フレーム後です。`ResolvedSource` と `SharedPublisherEntry` は Worker 専用なので、呼び出し元のスレッドから直接 Entry を触りません。

## bIsWarmingUp の扱い

WarmUp は1回の評価で `PreApply` を `WarmUpFrames` 回呼びますが、Publisher は1フレーム分しか進みません。経路ごとの扱いは次のとおりです。

| 経路 | WarmUp 中の時刻 |
|---|---|
| Local | 反復ごとに進む |
| Shared、ゲーム時刻あり | ゲーム時刻が同じなので `Time` は変わらない |
| Shared、ゲーム時刻なし | `Node.IsWarmingUp()` が真の間は外挿しない |

Shared で時刻を進めると、次の Serial の採用で巻き戻り、Gust のエンベロープも早送りされます（`KawaiiPhysics.ProceduralWind.SharedWarmUpHoldsClock` のコメントより）。同じテストの最後は、Local が WarmUp 中も進むことを Golden のビット一致を維持する経路として確認しています。

一時 Gust は `WindSource` が `Local` なので、WarmUp の反復の分だけ Gust の時刻も進みます。

## Wind Preset

`FKawaiiProceduralWindPreset` は風のパラメータの組で、`ToDynamicParams` が11項目の `bOverride` を立てます。`WindDirection`、3つの `PhaseOffset`、`WindDirectionNoisePeriod`、`TimeScale`、`bIsEnabled` は含みません（`KawaiiPhysics.WindPreset.ApplyRoundTrip`）。

`ResolvePresetParamsByTag` の照合規則は次のとおりです。

- 無効なタグは常に失敗します。
- Data Asset に1件以上のプリセットがあれば、その中だけを完全一致で探します。見つからなくても組み込みへ戻りません。
- Data Asset が null か空のときは、`GetDefaultPresets` の3件（Breeze、Strong、Storm）から探します。

| 適用の経路 | 反映方法 |
|---|---|
| `ApplyProceduralWindPreset`、`ApplyProceduralWindPresetOnComponent` | `RequestDynamicParams` で `PendingParams` に積む |
| Wind Scope の `ApplyPreset` | `bIsEnabled = true` と `TimeScale = 1` を足し、グラフノードへ `ApplyDynamicParams` を書き、実行中のノードへは `RequestDynamicParams` で送る |
| Shared Publisher の `WindPresetDataAsset` と `WindPresetTag` | `bIsEnabled = true` と `TimeScale = 1` を足して `SharedWind` へ適用する。適用前の値を `SharedWindBeforePreset` へ退避する |

プリセットの11項目はすべて共有13項目に含まれます。Shared の消費側へ `ApplyProceduralWindPreset` を呼んでも、次の Serial の採用で上書きされます。

## Wind Scope が波形を読む経路

Wind Scope は2つの方法で波形を読みます。

| 方法 | API | 内容 |
|---|---|---|
| 理論波形 | `ComputeWindSample(Time, 0.0f)` | グラフノードの値のコピーを任意の時刻で評価する。プリセットのゴースト表示は、コピーへ `ApplyDynamicParams` を適用してから同じ関数を呼ぶ |
| Live | `RuntimeState->ScopeBuffer`、`ScopeWriteIndex`、`ScopeSampleCount` | `PreApply` が記録したリングバッファを `Mutex` の下で読む |

`ScopeBuffer` の大きさは `ScopeBufferSize`（512）で、`SKawaiiPhysicsWindScopeWindow` の描画解像度に対応します。記録は `RecordScopeSample` が行います。`PreApply` は計算済みの `Sample` を渡して二重の計算を避けます。

どちらも `LengthRate` は 0 で評価します。表示される `Total` は根元の位相の値で、`ForceRateByBoneLengthRate` も含みません。`FKawaiiPhysicsProceduralWindSample` は成分ごとの値を持つので、グラフは系列ごとに表示できます。編集の送信には `BuildDynamicParamsSnapshot`、`RequestDynamicParams`、`ApplyDynamicParams` を使います。

`RecordScopeSample` と `ScopeBuffer` の中身は `WITH_EDITOR` でのみ動作します。

## 決定論性

Random 成分と方向ノイズは、呼び出し順やスレッドに依存しない形で作ります。

1. `ComputeStableHash(Seed, GridIndex, Channel)` が FNV-1a と追加の撹拌でハッシュを作ります。
2. `SampleNoiseAt` がそのハッシュで `FRandomStream` を作り、`[-1, 1]` の値を1つ引きます。ストリームの状態は持ち回しません。
3. `SampleSmoothNoise` が隣り合う整数グリッドの値を `3α² - 2α³` で補間します。

Channel は Random が 0、方向ノイズが 1 と 2 です。`bSupportsRandomForceScaleRange` を false にしているのも同じ理由で、ソースコメントによれば、基底の `RandomForceScaleRange` は固有の Random と紛らわしく、Seed の再現性も壊すためです。`PreApply` はグローバルの乱数を消費しません（`KawaiiPhysics.ProceduralWind.PreApplyConsumesNoGlobalRandom`）。

Random 成分と方向ノイズは、パラメータ、`Seed`、`Time` が同じなら同じ値になります。`ComputeWindSample` のサンプル全体は、さらに `InLengthRate`（Ripple）と `RuntimeState` の `ActiveGust`（Gust）に依存します。`bRealTimeEnvelope` の Gust は引数の時刻を使わず、`RuntimeState->UnscaledTime` で評価します。`KawaiiPhysics.ProceduralWind.Determinism` は、Gust のない状態で同じ長さ比率を与えて一致を確認しています。Local の `Time` は `dt` の積算なので、実行全体が一致するのは `dt` の列も同じときです。

`Seed` は `DynamicParams` に含まれません。Shared では `Time` が揃うので、`Seed` も揃えると同じ揺らぎになります。一時 Gust は、方向を明示した場合はノイズなしで、方向を継承した場合は元の風の `WindDirectionNoiseAngle`、`WindDirectionNoisePeriod`、`Seed` を引き継ぎます。

## 状態とライフサイクル

| イベント | 動作 |
|---|---|
| 構築 | コンストラクタで `RuntimeState` を作る。`SharedWindTag` の既定は `TAG_KawaiiPhysics_Shared_Default` |
| `Initialize` | `ResetRuntimeState`。時刻、Gust、Pending をすべて戻す |
| World の変更、ゲーム時刻の巻き戻り | `ClockGeneration` の不一致で `ResetRuntimeState` |
| `ResetDynamics`、`ResetPhysics` | 風の状態は変わらない |
| `WorldSpace` の Teleport | WarmUp の分を除いて `PreApply` が走らず、Local の時刻は止まる |
| 評価されないフレーム | Local の時刻は止まる。Shared は次の評価でゲーム時刻の差から追いつく |
| Entry の期限切れ | `RestoreLocalSharedParams` のあと Local と同じ経路へ移り、`SharedResolveCountdown` の後に解決し直す |
| 外力の削除 | `RuntimeState` はインスタンスとともに解放される |

`Seed` は `DynamicParams` に含まれないので、PIE 中にグラフの `Seed` を編集しても実行中のノードへは送られません。ヘッダのコメントが次回の再生から反映されるとしているのはこの経路です。計算側はその時点の `Seed` を読むので、実行中のインスタンスの値を `SetExternalForceIntProperty` などで書き換えた場合は次の計算から反映されます。

## 他機能との関係

- **Fixed Substepping:** `PreApply` がフレームに1回なので、波形はサブステップ間で変化しません。ステップ数は位置へ足す回数にだけ影響します。
- **`bIsEnabled`:** 無効でも時刻は進みます。有効に戻すと波形は連続せず、経過した時刻の値から再開します。
- **Shared Publisher:** `SharedWind` メンバもこの構造体です。ただし `PreApply` は呼ばれず、Publisher の Helper が `ConsumePendingRequests`、`RecordScopeSample`、`BuildSharedWindParams` を直接呼びます。
- **Preset Data Asset:** Wind Preset とは別の仕組みです。エディタでグラフノードへ適用する経路では `ExternalForces` の要素としてコピーされ、`RuntimeState` は上のコピーの規則に従います。ランタイムの `UKawaiiPhysicsLibrary::ApplyPresetDataAsset` は `ExternalForces` を適用しません。
- **派生構造体:** Library の `GetMutableProceduralWind` と Simulation の `GetMutableProceduralWindInNode` は `GetScriptStruct()` の完全一致で判定します。この構造体から派生すると、`SetProceduralWindParameters` や `ApplyProceduralWindPreset` などの Procedural Wind 専用 API と Gust の継承の対象になりません。`SetExternalForceFloatProperty` などの汎用 setter は実際の `ScriptStruct` からプロパティを探すので、派生構造体にも使えます。汎用 setter は値を直接書くので、`PendingParams` と `ApplyDynamicParams` のクランプを通りません。
- **EditMode のデバッグ矢印:** `AnimDrawDebugForEditMode` は `Apply` と同じ式で `Total` を計算し、`ComputeDebugTotalRate` で矢印の長さを正規化します。

## 変更するときの注意

- **合成式は3か所にあります。** `ComputeWindSample`、`Apply`、`AnimDrawDebugForEditMode` です。`ComputeWindSample` のコメントは、Wind Scope の表示と一致することの確認も求めています。`KawaiiPhysics.ProceduralWind.SinePhase` と `RipplePropagation` が式を守っています。
- **パラメータを追加するときは同時に直す箇所が多くあります。** `FKawaiiProceduralWindDynamicParams`、`MergeProceduralWindDynamicParams`、`ApplyDynamicParams`、`BuildDynamicParamsForProperty`、`BuildDynamicParamsSnapshot`、`operator=` です。`operator=` はヘッダのコメントでも明示されています。共有の対象なら `BuildSharedWindParams` も確認します。プリセットに入れるなら `FKawaiiProceduralWindPreset` と `ToDynamicParams`、Wind Scope に出すなら `SKawaiiPhysicsWindScopeEditPanel` と `SKawaiiPhysicsWindScopeWindow` も変更します。
- **`RuntimeState` を null にしないでください。** ロックなしの参照はこの不変条件に依存します。
- **`Time` を `Apply` で進めないでください。** フレームレート非依存は `PreApply` で1回だけ進めることに依存します。
- **Shared の時刻を二重に進めないでください。** `PreApply` の外挿は WarmUp と評価回数を考慮しています。`KawaiiPhysics.ProceduralWind.SharedTimeAdoptAndExtrapolate` と `SharedWarmUpHoldsClock` を実行してください。
- **Shared を離れる経路を追加するときは `RestoreLocalSharedParams` と `bPublisherWindDisabled` の解除を忘れないでください。** `KawaiiPhysics.ProceduralWind.AutoFallbackRestoresLocalParams` と `SharedTagClearedRestoresLocalWind` が守っています。
- **グローバルの乱数を使わないでください。** `KawaiiPhysics.ProceduralWind.PreApplyConsumesNoGlobalRandom` と `Determinism` が守っています。
- **コピーの挙動を変えるときは** `KawaiiPhysics.ProceduralWind.AssignmentPreservesDestinationRuntimeState` と `AssignmentCopiesWindSource` を確認してください。

## 関連ページ

- [外力](/docs/internals/external-forces)
- [Shared Publisher](/docs/internals/shared-publisher)
- [ランタイム制御と要求キュー](/docs/internals/runtime-control)
- [Data Asset とプリセット](/docs/internals/presets-and-data-assets)
- [エディタツール](/docs/internals/editor-tools)
- [Procedural Wind（ユーザー向け）](/docs/features/procedural-wind)
- [Wind Scope（ユーザー向け）](/docs/features/wind-scope)
- [Kawaii Physics Shared Publisher（ユーザー向け）](/docs/features/shared-publisher)
