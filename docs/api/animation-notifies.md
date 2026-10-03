---
title: "AnimNotify：プロパティ・再生契約リファレンス"
readers: [プログラマー, TA]
---

import DocFigure from '@site/src/components/DocFigure';

# AnimNotify：プロパティ・再生契約リファレンス

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

Notifyのプロパティと再生時の契約を説明します。配置と使い分けは[アニメーションNotify](/docs/features/animnotify#settings-multiplier-notifies)を参照してください。

## Pulseのプロパティ {#pulse}

クラスは `UAnimNotify_KawaiiPhysicsSettingsMultiplier`。表示名は `KawaiiPhysics: Settings Multiplier (Pulse)`、トラック名は `KP: Settings Multiplier Pulse` です。

| プロパティ | 既定・契約 |
|---|---|
| SettingsScale | 6項目すべて1 |
| Duration | 1秒。フェードを含む合計。0以下ではno-op |
| BlendInTime／BlendOutTime | 0.2／0.5秒 |
| FilterTags／bFilterExactMatch | 空で全ノード、完全一致はfalse |

Component版Startを呼びますが、ハンドルは保存しません。APIで利用できる負のDurationの無期限保持はPulseでは許可しません。

## NotifyStateの重みと終了 {#state}

クラスは `UAnimNotifyState_KawaiiPhysicsSettingsMultiplier`、表示名は `KawaiiPhysics: Settings Multiplier` です。SettingsScaleとタグフィルタはPulseと共通です。

| プロパティ | 既定・契約 |
|---|---|
| WeightSource | Envelope |
| BlendInTime／BlendOutTime | 0.2／0.2秒 |
| CurveName | None。Curveモードで読むアニメーションカーブ |
| DefaultWeightIfNoCurve | 1。重みは0〜1へクランプ |

Envelopeは区間長とフェードから台形を作り、NotifyTickのFrameDeltaTimeを累積します。PlayRate≠1、逆再生、スクラブでは区間とずれうるため、アニメーション時刻への追従にはCurveを使います。区間途中の終了とCurveモードでは、NotifyEnd時の現在重みからBlendOutTimeでフェードします。

## 再生インスタンスとEnd通知の追跡 {#programmer-details}

UE5.8以降はComponent＋NotifyInstanceIDで識別します。UE5.7以前は同一イベントの同じComponent上での重複をActiveCountへまとめ、全Endまで保持します。

StateはC++のPushで外部駆動し、4評価分の更新が来なければノード側がフェードするleaseを付けます。Notify側の残った帳簿は次のBegin／Endで掃除されます。最大8件の上限やハンドル失効は[Settings Multiplier リファレンス](/docs/features/settings-multipliers#details-lifecycle)と共通です。

## Trigger Gustの送信先と時間設定 {#trigger-gust}

クラスは `UAnimNotify_KawaiiPhysicsTriggerGust`、表示名は `KawaiiPhysics: Trigger Gust`、トラック名は `KP: Trigger Gust` です。

| プロパティ | 既定・契約 |
|---|---|
| Strength | 0 |
| RiseTime／HoldTime／DecayTime | すべて0秒。Duration = Rise + Max(Hold,0) + Decay |
| GustDirection | ゼロ。Nodes宛てで既存Procedural Windの方向などを継承。非ゼロはワールド空間 |
| FilterTags／bFilterExactMatch | 空／false。Nodes宛てのフィルタ |
| GustTarget | Nodes（表示はKawaii Physics Nodes）またはSharedPublisher |
| SharedPublisherTag | KawaiiPhysics.Shared.Default |

Nodesは `StartProceduralWindGustOnComponent`、SharedPublisherはOwner Actorを入口に `StartProceduralWindGustOnSharedPublisher` を呼びます。SharedPublisher宛てではFilter TagsとGust Directionを使いません。どちらも `bRealTimeEnvelope=false`、風の時間で進行します。Notifyは停止ハンドルを保持しません。APIの停止と汎用外力は[突風・一時外力](/docs/features/procedural-wind#transient-forces)を参照してください。

[Settings Multiplier](/docs/features/settings-multipliers) · [Kawaii Physics Settings Multiplier](/docs/features/sequencer)

## 関連するUE公式ドキュメント {#ue-docs}

- [アニメーション通知](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/animation-notifies-in-unreal-engine) — Notifyトラックへの追加、NotifyStateの区間、発火条件を確認できます。 (UE 5.8)
