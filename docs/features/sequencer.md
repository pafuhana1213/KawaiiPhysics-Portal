---
title: "Kawaii Physics Settings Multiplier"
description: "SequencerでKawaiiPhysicsの設定倍率と適用率をキーフレーム制御する方法。"
---

import LegacyReference from '@site/src/components/LegacyReference';

# Kawaii Physics Settings Multiplier

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

## 概要 {#when-to-use}

Sequencerで、会話中は髪の揺れを落ち着かせ、アクション中は動きを残す、といった区間ごとの調整ができます。基準の物理設定を直接変更する方法では、区間ごとの値と終了時の復元を管理する必要があります。

設定倍率トラックは、ベース設定を残したまま、Sequencer上で倍率と適用率を記録します。キャラクターの通常の揺れを作った後、ショットの時間に合わせて表現を調整したいアーティストに役立ちます。

## チャンネルと制約 {#details-channels}

Damping、Stiffness、WorldDampingLocation、WorldDampingRotation、Radius、LimitAngleとWeightを記録できます。ノード全体のAlphaを直接変更するトラックではありません。Radius・LimitAngle等の境界条件は[Settings Multiplier](/docs/features/settings-multipliers#details-fields)を参照してください。

## トラックと対象 {#details-targets}

新しいKawaiiPhysicsSequencerモジュールの `UMovieSceneKawaiiPhysicsSettingsMultiplierTrack` と `UMovieSceneKawaiiPhysicsSettingsMultiplierSection` を使います。

| トラック | 対象・条件 |
|---|---|
| Kawaii Physics Settings Multiplier | バインドされたSkeletalMeshComponent、またはActorに含まれるSkeletalMeshComponent |
| Kawaii Physics Settings Multiplier (All) | Game／PIE／Editorの再生World内を走査。Filter Tags必須、空なら無効 |

Actorバインドは子Actorファミリー全体を対象にしません。Allの探索キャッシュは0.5秒再利用され、生成・破棄直後の変化が即時とは限りません。

## セクションの作成 {#setup}

以下はStiffnessを変更する設定例です。

1. 対象をバインドしたLevel Sequenceを開きます。
2. 対象バインドへ `Kawaii Physics Settings Multiplier` トラックを追加します。
3. `Stiffness` の倍率を0.5にします。他の倍率は1にします。
4. `Weight` を1にします。
5. 再生し、セクションの前・中・後を比べます。

新規セクションの長さは1秒です。Level Sequence内で効果を入れる区間に合わせて範囲を変更します。

## 終了と復帰 {#details-lifecycle}

区間外へのスクラブ・停止・削除で効果が解除され、終了時の戻り方には`BlendOutTimeOnEnd`を使います。セクションはRestore Stateを使い、Keep Stateへ変更できません。倍率の時刻評価は物理シミュレーションの巻き戻し・再現性を保証しません。

## Stiff・Loose・Freeze {#presets}

セクションメニューの `Apply Preset` にはStiff、Loose、Freezeがあります。最初の比較には使えますが、Freezeは高い減衰・Stiffnessのプリセット名で、シミュレーション停止ではありません。

### プリセットの値と変更範囲 {#details-presets}

| プリセット | Damping | Stiffness | 残り4項目 |
|---|---:|---:|---:|
| Stiff | 1.5 | 2.0 | 1 |
| Loose | 0.7 | 0.5 | 1 |
| Freeze | 10 | 10 | 1 |

Reset Scale to 1.0とApply Presetは6つのScaleチャンネルの全キーを削除します。Weight、Filter Tags、終了フェードは変えません。Freezeは停止APIではありません。

## セクション表示 {#details-programmer-details}

セクションは倍率要約とタグを表示します。実行中の登録情報があれば `(N nodes)` または `(no match)` を加えます。Allの空フィルタは `[Filter Tags required]` です。Nはリクエストをキューしたノード数で、そのフレームの物理評価完了を示すものではありません。

[Settings Multiplier](/docs/features/settings-multipliers) · [アニメーションNotify](/docs/features/animnotify#settings-multiplier-notifies)


## 関連するUE公式ドキュメント {#ue-docs}

- [Sequencerエディタ](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/sequencer-cinematic-editor-unreal-engine) — Level Sequenceとタイムラインの基本操作を確認できます。独自倍率トラックの仕様はこのサイトを参照してください。 (UE 5.8)

<LegacyReference redirect targets={{"artist-entry": "/docs/features/sequencer#setup", "tuning": "/docs/features/sequencer#setup", "common-pitfalls": "/docs/features/sequencer#setup"}} to="/docs/features/sequencer#setup" label="使用手順" />

<span id="prerequisites" hidden />
<span id="result" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"prerequisites": "/docs/features/sequencer#details-targets", "result": "/docs/features/sequencer#details-lifecycle"}} to="/docs/features/sequencer#details-targets" label="関連する仕様・操作へ" />
