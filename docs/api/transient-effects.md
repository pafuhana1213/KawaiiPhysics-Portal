---
title: "UKawaiiPhysicsLibrary — 一時効果・風"
---

import DocFigure from '@site/src/components/DocFigure';

# UKawaiiPhysicsLibrary — 一時効果・風

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

一時設定倍率、突風、風パラメータ、Shared PublisherをBlueprint・C++から制御します。演出の設定は[Settings Multiplier](/docs/features/settings-multipliers)と[Procedural Wind](/docs/features/procedural-wind)を参照してください。

## Blueprintから開始・停止 {#settings-blueprint}

| 対象 | 開始 | 停止 |
|---|---|---|
| ノード参照 | `StartPhysicsSettingsMultiplier` | `StopPhysicsSettingsMultiplier` |
| Component | `StartPhysicsSettingsMultiplierOnComponent` | `StopPhysicsSettingsMultiplierOnComponent` |

Startの `OutHandle` を保存し、同じ対象とハンドルでStopします。Component版は本体・Linked AnimInstance・PostProcessのノードを収集し、空Filter Tagsは全件、`bFilterExactMatch=false` は親タグを許容します。戻り値はリクエストをキューしたノード数です。

DurationはBlend In／Outを含む合計です。正なら台形、0はno-op、負ならStopまで保持します。Blend In＋OutがDurationを超えると比例圧縮します。負のDurationではStart側のBlend Outは無視し、Stop側の値を解除に使います。

Stopは現在の適用率から0へ線形フェードします。Blend Out0は即時解除。まだ未評価の同一ハンドルへのStopは、解除フェード時間を上書きします。

## C++継続更新とスレッド条件 {#settings-cpp-driven}

`GenerateTransientHandle`、`PushPhysicsSettingsMultiplier`、`PushPhysicsSettingsMultiplierOnComponent` はC++専用でBlueprint非公開です。事前生成した同じハンドルで更新し、終了時はStopします。未設定ハンドルのPushはno-opで、ノード参照版のExecResultはNotValidです。

同一ハンドルのPushは同じ項目を更新し、Stop後のフェード中でも外部駆動へ戻します。普通のoverloadは時間で終了しません。Componentのlease付きoverloadは指定した評価回数だけ更新が来ないとフェードします。URO／LOD停止中に同じハンドルでPushを繰り返すと、未評価キューには最新値だけを残します。

AnimGraphのBlueprintThreadSafe文脈でComponentを収集する場合は呼び出し元自身だけを対象にします。他オブジェクトの収集は、そのオブジェクトが評価中でないGameThreadで行ってください。Blueprintで無期限保持する場合は負のDurationのStartを使いますが、任意AlphaのPush更新は公開されていません。

[アニメーションNotify](/docs/features/animnotify#settings-multiplier-notifies) · [Kawaii Physics Settings Multiplier](/docs/features/sequencer) · [UKawaiiPhysicsLibrary](/docs/api/runtime-properties)

実効倍率は `Lerp(1, Scale, EnvelopeAlpha)` で計算します。

## APIと適用範囲 {#wind-programmer-details}

### 突風・一時外力API {#wind-突風一時外力api}

ゲーム中のイベントに合わせて短時間だけ風を追加する場合は、`UKawaiiPhysicsLibrary` のハンドル付きAPIを使います。保存済みの `External Forces` 配列を増やす操作ではなく、ランタイム専用の一時外力です。

| API | 用途 |
|-----|------|
| `StartProceduralWindGust` | 1つのノードに突風を開始し、`OutHandle` を取得する |
| `StartProceduralWindGustOnComponent` | Component内の対象ノードへ突風を開始する。Linked／PostProcessも含み、タグで絞り込める |
| `AddTransientExternalForce` / `AddTransientExternalForceOnComponent` | 外力構造体と `LifetimeSeconds` を指定して汎用の一時外力を追加する |
| `StopTransientExternalForce` / `StopTransientExternalForceOnComponent` | 保存したハンドルの外力を早期停止する |

突風の `Strength` はピーク強度、`Duration` は立ち上がり・維持・減衰を含む期間です。維持時間は `max(0, Duration - RiseTime - DecayTime)` から決まります。`GustDirection` が非ゼロならワールド空間の方向を使い、ゼロなら既存のProcedural Windから方向・空間・ボーンフィルタ等を引き継ぎます。ノード単位APIの `ExternalForceIndex = -1` は最初の有効なProcedural Windを継承元にします。

`RiseTime + DecayTime` が `Duration` を超える場合は両時間を比例圧縮します。Durationには正値を指定してください。0以下では突風強度が0になりますが、APIが要求を受け付けてハンドルを返す場合はあります。要求受付の成功と、効果が見えることは別です。

`bRealTimeEnvelope` の既定値はtrueで、一時突風の `TimeScale` を1にして進行します。falseでは継承した風のTime Scaleの影響を受けます。どちらもアニメーション評価に依存するため、URO／LODで評価が止まると実時間としての期間が延びます。

停止時の `BlendOutTime` はwind時間で、Procedural Windを現在値から線形フェードさせます。0は即時除去です。汎用一時外力には同じフェード処理がなく、寿命を短縮します。

一時外力は**ノードあたり8件まで**で、超過すると最古の項目が破棄されます。ノード再初期化・BP再コンパイルでも失われます。`IsTransientHandleSet` はIDが設定済みかだけを調べるため、外力が今も存在することの判定には使えません。失効ハンドルのStopは何もしません。

汎用一時外力では `Initialize(Context)` が呼ばれず、`ExternalOwner`・カーブアセット等のliveなUObject参照を含む外力は拒否されます。Procedural Windは `PreApply` で状態を生成しますが、既存のあらゆる外力が同じように利用できる前提にはしないでください。

Component APIの戻り値は要求をキューしたノード数です。空の `FilterTags` は全ノード対象になります。AnimGraphの評価文脈から呼ぶ場合は呼び出し元のComponentに限定し、別オブジェクトへの操作は対象が評価中でないGameThreadで行います。詳細は[UKawaiiPhysicsLibrary](/docs/api/runtime-properties)を参照してください。アニメーションに合わせて発生させる方法は[AnimNotify／NotifyState](/docs/features/animnotify#settings-multiplier-notifies)で説明します。

### 風プリセット・動的パラメータの詳細 {#wind-風プリセット動的パラメータの詳細}

**KawaiiPhysics Wind Preset Data Asset** は風の調整値を保存します。[UKawaiiPhysicsPresetDataAsset](/docs/features/settings-presets)がノード設定全体を扱うのに対し、こちらはProcedural Wind専用です。`Presets` 配列の各要素に `PresetName` と `PresetTag`、風の各調整値を設定します。タグの照合は完全一致です。

`ApplyProceduralWindPreset` はノード参照と外力インデックスへ、`ApplyProceduralWindPresetOnComponent` はタグで選んだComponent内の風へ適用要求を送ります。次の `PreApply` で反映されます。DataAssetを事前ロードし、シミュレーション中の編集・再ロードを避けてください。

`ToDynamicParams()` が更新するのは次の11項目です。

- `ConstantForce`
- `SwayForce`、`SwayPeriod`
- `RippleForce`、`RipplePeriod`、`RippleTipPhaseDelay`
- `StrengthCycleRange`、`StrengthCyclePeriod`
- `RandomForce`、`RandomForcePeriod`
- `WindDirectionNoiseAngle`

`WindDirection`、有効状態、位相オフセット、`TimeScale`、`WindDirectionNoisePeriod` はこのプリセット適用では変更しません。風の新規要素そのものを追加するAPIでもありません。

DataAsset未指定または `Presets` が空の場合は、組み込みタグ `KawaiiPhysics.WindPreset.Breeze` / `Strong` / `Storm` を使えます。要素のあるDataAssetを指定した場合はその中だけを検索し、見つからなくても組み込みへフォールバックしません。無効タグも失敗扱いです。

個別値を変更する場合は `FKawaiiProceduralWindDynamicParams` と `SetProceduralWindParameters` / `SetProceduralWindParametersOnComponent` を使います。対応する `bOverride...` がtrueの項目だけを変更します。たとえば定常風だけを変えるなら `bOverrideConstantForce` と `ConstantForce` を設定し、他のoverrideはfalseにします。

`GetProceduralWindParameters` は未反映の同フレーム要求も合成して返し、すべてのoverrideがtrueです。その戻り値を編集してSetへ渡す方法と、変更項目だけを有効にした新しい構造体を渡す方法を使い分けます。[Wind Scope](/docs/features/wind-scope)では波形とプリセットを比較できます。

[v1.22予定の機能一覧](/docs/preview) · [正式版の外部力プリセット](/docs/features/external-force-presets)

## ランタイム制御 {#publisher-runtime-control}

`UKawaiiPhysicsLibrary` には `SetSharedPublisherEnabled`、`SetSimpleWorldCollisionSettingsOnSharedPublisher`、`SetProceduralWindParametersOnSharedPublisher`、共有突風の開始・停止、`GetSharedPublisherDebugInfo` があります。Actorと共有タグで対象を指定し、戻り値を確認します。変更要求は即時に全ノードへ反映されるものではなく、Publisherの次の更新で処理されます。Enabledと衝突設定の実行時上書きは再初期化でノードの設定へ戻ります。一方、風パラメータ更新はShared Windの設定へ反映され、再初期化後も保持されます。

関連APIは[UKawaiiPhysicsLibrary](/docs/api/runtime-properties)、確認用の情報取得は[GetRuntimeNodeInfosOnComponent](/docs/api/runtime-diagnostics)も参照してください。

[v1.22予定の機能一覧](/docs/preview)

Publisherは風の13パラメータと突風状態も共有します。共有される値の更新には `SetProceduralWindParametersOnSharedPublisher` を使い、共有の突風開始・停止には `StartProceduralWindGustOnSharedPublisher` / `StopProceduralWindGustOnSharedPublisher` を使います。これらは各ノードに一時外力を追加するハンドルAPIとは別です。詳しい対象と保持期間は[Kawaii Physics Shared Publisher](/docs/features/shared-publisher)を参照してください。

## 関連するUE公式ドキュメント {#ue-docs}

- [Gameplay Tags（英語）](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-gameplay-tags-in-unreal-engine) — タグ辞書への登録と階層を確認できます。KawaiiPhysics固有の一致条件は各リファレンスを参照してください。 (UE 5.8; English)

- [アニメーション通知](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/animation-notifies-in-unreal-engine) — Notifyトラックへの追加、NotifyStateの区間、発火条件を確認できます。 (UE 5.8)
- [Data Assets（英語）](https://dev.epicgames.com/documentation/en-us/unreal-engine/data-assets-in-unreal-engine) — データをアセットとして保存する仕組みと、既存クラスのData Assetインスタンスの作成を確認できます。 (UE 5.8; English)
