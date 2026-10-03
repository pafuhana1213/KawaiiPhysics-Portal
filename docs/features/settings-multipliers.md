---
title: "Settings Multiplier"
description: "ベース設定を変更せず、KawaiiPhysicsの物理設定に一時的な倍率を適用する方法。"
---

import LegacyReference from '@site/src/components/LegacyReference';

# Settings Multiplier

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

## 概要 {#artist-entry}

例えば、歩いている間の髪の揺れはできていて、着地の瞬間だけ元の形へ戻る力を弱めたいとします。基準の物理設定を直接変更する方法では、通常時の値を保持し、演出が終わった時に戻す処理も用意する必要があります。

一時設定倍率は、元の設定を書き換えずに、その時だけ倍率を掛けます。髪や服の基準の動きを作った後で、着地・アクション・Sequencerでの変化を重ねたいアーティストやTAに役立ちます。

## 設定項目と境界条件 {#details-fields}

`FKawaiiPhysicsSettingsMultiplier` は全項目が既定1、0以上です。ベース値を書き換えず、各ボーンの実効値へ掛けます。

| 項目 | 意味・境界条件 |
|---|---|
| WorldDampingLocation／Rotation | 実際の反映率は `1 - 値`。倍率1未満では移動・回転が強く反映される |
| Radius | 0ではワールドコリジョンのSweep・押し出しが実質無効。ダミーボーン密度はベース半径で決まるので、1未満では被覆に隙間が生じうる |
| LimitAngle | ベース0は無制限のまま。正のベースは倍率0でも極小の正値にクランプされ、無制限へ変わらない |

## Settings Multiplier (Pulse)の使用方法 {#artist-setup}

以下はStiffnessを一時変更する設定例です。

1. Animation Sequenceを開き、着地などの効果を始めたい時刻を選びます。
2. Notifyトラックへ `KawaiiPhysics: Settings Multiplier (Pulse)` を追加します。
3. `SettingsScale` の `Stiffness` を0.5にします。他の倍率は1のままにします。
4. Durationを1秒にします。Durationは効果の入り・抜けを含む合計時間です。0以下では効果が開始されません。
5. 再生し、発火前・効果中・終了後を比べます。

動作の区間で調整するなら[NotifyState](/docs/features/animnotify#new-notifies-state)、Sequencer上で調整したい場合は[Kawaii Physics Settings Multiplier](/docs/features/sequencer)を使います。

## 寿命・上限・失効 {#details-lifecycle}

- 時間型と外部駆動型を合わせ、ノードあたり最大8件。超過時は最古を破棄します。
- ノード再初期化・Blueprint再コンパイルで失われます。失効ハンドルへのStopはno-opです。
- `IsTransientHandleSet` はIDが設定済みかだけを返し、生存確認ではありません。
- 時間型はアニメーションDeltaTimeで進行し、URO／LOD停止中は実時間の継続が延びます。

## Blueprint・C++からの制御 {#programmer-details}

Blueprintから開始・停止する場合は、対象Componentの選択と停止ハンドルの管理が必要です。[一時効果のAPI](/docs/api/transient-effects#settings-blueprint)に、関数、最大8件の上限、再初期化、C++継続更新とスレッド条件をまとめています。

[プロパティリファレンス](/docs/features/settings-multipliers#details-fields)

## 関連するUE公式ドキュメント {#ue-docs}

- [アニメーション通知](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/animation-notifies-in-unreal-engine) — Notifyトラックへの追加と発火条件を確認できます。 (UE 5.8)

<LegacyReference redirect targets={{"result": "/docs/features/settings-multipliers#artist-setup", "tuning": "/docs/features/settings-multipliers#artist-setup", "common-pitfalls": "/docs/features/settings-multipliers#artist-setup", "details-result-details": "/docs/features/settings-multipliers#artist-setup", "prerequisites": "/docs/features/settings-multipliers#artist-setup"}} to="/docs/features/settings-multipliers#artist-setup" label="使用手順" />
