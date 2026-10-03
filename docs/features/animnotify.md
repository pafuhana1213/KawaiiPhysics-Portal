---
sidebar_position: 8
title: "AnimNotify"
---

import DocFigure from '@site/src/components/DocFigure';
import LegacyReference from '@site/src/components/LegacyReference';

# AnimNotify

:::tip バージョン情報
v1.17.0で追加
:::

AnimNotifyを使用して、アニメーション中にKawaiiPhysicsの外力やAlphaを制御できます。

## 概要

v1.21以前では、次の3種類のAnimNotifyを提供しています：

| クラス | 種類 | 用途 |
|--------|------|------|
| UAnimNotify_KawaiiPhysicsAddExternalForce | Notify | 瞬間的に外力を追加 |
| UAnimNotifyState_KawaiiPhysicsAddExternalForce | NotifyState | 区間中に外力を適用 |
| UAnimNotifyState_KawaiiPhysicsSetAlpha | NotifyState | 区間中にAlphaを上書き |

v1.21以前の外力・Alpha Notifyは上記の3種類です。設定倍率・突風の追加Notifyは[後段のv1.22予定セクション](#settings-multiplier-notifies)を参照してください。

[ソースを見る](https://github.com/pafuhana1213/KawaiiPhysics/tree/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/AnimNotifies)

## AnimNotify vs AnimNotifyState

- **AnimNotify**: 単一フレームでトリガーされる。瞬間的な衝撃などに使用
- **AnimNotifyState**: 開始〜終了の区間で動作する。継続的な効果に使用

![AnimNotifyState External Force](/img/features/animnotify-externalforce.webp)

*AnimNotifyStateによる外力の適用*

---

## AnimNotify_KawaiiPhysicsAddExternalForce

瞬間的に外力を追加するAnimNotifyです。

### パラメータ

| パラメータ | 型 | カテゴリ | 説明 |
|-----------|-----|----------|------|
| AdditionalExternalForces | TArray\<FInstancedStruct\> | ExternalForce | 追加する外力の配列 |
| FilterTags | FGameplayTagContainer | ExternalForce | 適用対象をフィルタリングするTag |
| bFilterExactMatch | bool | ExternalForce | Tagの完全一致でフィルタするか |

### 使用シーン

- ジャンプ着地時の衝撃
- 攻撃ヒット時の反動
- 瞬間的な風や爆発

### 設定手順

1. Animation Sequenceを開く
2. Notifiesトラックで右クリック → **Add Notify** → **KawaiiPhysics Add External Force**
3. **AdditionalExternalForces** に外力プリセットを追加
4. 必要に応じて **FilterTags** を設定

---

## AnimNotifyState_KawaiiPhysicsAddExternalForce

区間中に外力を適用するAnimNotifyStateです。Notifyの開始時に外力を追加し、終了時に自動的に削除します。

### パラメータ

| パラメータ | 型 | カテゴリ | 説明 |
|-----------|-----|----------|------|
| AdditionalExternalForces | TArray\<FInstancedStruct\> | ExternalForce | 追加する外力の配列 |
| FilterTags | FGameplayTagContainer | ExternalForce | 適用対象をフィルタリングするTag |
| bFilterExactMatch | bool | ExternalForce | Tagの完全一致でフィルタするか |

### 使用シーン

- ダッシュ中の髪の流れ
- スキル発動中の特殊エフェクト
- 環境による継続的な力

### 設定手順

1. Animation Sequenceを開く
2. Notifiesトラックで右クリック → **Add Notify State** → **KawaiiPhysics Add External Force**
3. ドラッグして適用区間を設定
4. **AdditionalExternalForces** に外力プリセットを追加

---

## AnimNotifyState_KawaiiPhysicsSetAlpha

区間中にKawaiiPhysicsノードのAlphaを上書きするAnimNotifyStateです。アニメーションカーブの値でKawaiiPhysicsのかかり具合を調整できます。

### パラメータ

#### Alpha設定

| パラメータ | 型 | カテゴリ | デフォルト | 説明 |
|-----------|-----|----------|-----------|------|
| Source | EKawaiiPhysicsSetAlphaSource | Alpha | Curve | Alphaの取得元 |
| CurveName | FName | Alpha | - | Source=Curveの時に参照するカーブ名 |
| DefaultAlphaIfNoCurve | float | Alpha | 1.0 | カーブが取得できない時のフォールバック値（0.0〜1.0） |
| ConstantAlpha | float | Alpha | 1.0 | Source=Constantの時に使う固定値（0.0〜1.0） |

#### フィルタ設定

| パラメータ | 型 | カテゴリ | デフォルト | 説明 |
|-----------|-----|----------|-----------|------|
| FilterTags | FGameplayTagContainer | Filter | - | 適用するノードをTagでフィルタ |
| bFilterExactMatch | bool | Filter | false | Tagの完全一致でフィルタするか |

### Alpha Source (EKawaiiPhysicsSetAlphaSource)

| 値 | 説明 |
|---|---|
| Curve | アニメーションのフロートカーブを使用 |
| Constant | 固定値を使用 |

### 使用シーン

- 特定モーション中に物理を弱める
- アニメーションに合わせて物理の影響度を変化
- カットシーン中の物理制御

### カーブを使用する場合

1. Animation Sequenceにフロートカーブを追加
2. カーブ名を設定（例: `KawaiiPhysicsAlpha`）
3. AnimNotifyStateの **CurveName** に同じ名前を設定
4. カーブでAlpha値（0.0〜1.0）を制御

```
// カーブの例
Time 0.0: Alpha = 1.0 (物理フル)
Time 0.5: Alpha = 0.0 (物理オフ)
Time 1.0: Alpha = 1.0 (物理フル)
```

:::warning CurveName未設定時の警告
**Source = Curve** のまま **CurveName** が未設定（None）の場合、エディタでのアセット検証時（Animation Sequenceの保存・読み込み時など）にMessage Log（Asset Check）へ警告が表示されます。

```
AnimNotifyState(KawaiiPhysics_SetAlpha) CurveName is empty in <アセットパス>
```

カーブ制御を使う場合は必ず **CurveName** を設定してください。なお、CurveNameを設定していてもカーブの値が取得できない場合（アニメーションに該当カーブが存在しない等）は、警告は出ずに **DefaultAlphaIfNoCurve** の値が使用されます。
:::

### 固定値を使用する場合

```cpp
// 区間中は物理を50%に
Source = EKawaiiPhysicsSetAlphaSource::Constant;
ConstantAlpha = 0.5f;
```

---

## GameplayTagによるフィルタリング

上記の外力・Alpha NotifyはGameplayTagによるノードのフィルタリングに対応しています。v1.22予定のTrigger Gustは、Nodes宛てとShared Publisher宛てで使うタグが異なります。

### 設定方法

1. KawaiiPhysicsノードの **KawaiiPhysicsTag** を設定

```cpp
// Animation Blueprint内のKawaiiPhysicsノード
KawaiiPhysicsTag = FGameplayTag::RequestGameplayTag("KawaiiPhysics.Hair");
```

2. AnimNotifyの **FilterTags** に対象Tagを設定
3. **bFilterExactMatch** で一致条件を指定

### フィルタ動作

| bFilterExactMatch | 動作 |
|-------------------|------|
| false | 指定Tagとその子Tagにマッチ（親Tagも許容） |
| true | 指定Tagに完全一致のみ |

### 例: 複数のKawaiiPhysicsノードを区別

```
// GameplayTag階層
KawaiiPhysics
├── Hair
│   ├── Front
│   └── Back
├── Skirt
└── Cape
```

```cpp
// Hairのみに外力を適用
FilterTags.AddTag("KawaiiPhysics.Hair");
bFilterExactMatch = false; // Hair.Front, Hair.Backも対象

// Hair.Frontのみに外力を適用
FilterTags.AddTag("KawaiiPhysics.Hair.Front");
bFilterExactMatch = true; // 完全一致のみ
```

---

## ベストプラクティス

### 1. NotifyStateの区間設定

- 開始・終了をアニメーションの自然な区切りに合わせる
- 急激な変化を避けるため、開始/終了付近でAlphaカーブを使用

### 2. パフォーマンス考慮

- 多数のAnimNotifyを同時にトリガーしない
- 複雑な外力計算は控えめに

### 3. デバッグ

- 外力プリセットの `bDrawDebug = true` でベクトルを可視化
- Animation Editorのプレビューで動作確認

---

## Settings Multiplier / Trigger Gust（v1.22予定） {#settings-multiplier-notifies}

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

### 概要 {#new-notifies-when-to-use}

着地の瞬間だけ髪の硬さを変えたり、攻撃動作の間だけ服を柔らかくしたりしたい場面があります。ゲーム側のイベントだけでタイミングを決める方法では、アニメーションを修正した時に呼び出し位置も合わせ直す作業が必要です。

新しいNotifyは、設定倍率や突風の開始位置をアニメーション上に記録できます。効果を入れる時刻や区間を調整したいアーティストに役立ちます。上記の外力追加・Alpha制御Notifyと、目的に合わせて使い分けてください。

### Notifyの種類 {#new-notifies-choose}

| やりたいこと | 選ぶ種類 |
|---|---|
| 発火から指定秒数だけ揺れ方を変える | `KawaiiPhysics: Settings Multiplier (Pulse)` |
| 動作の区間中に倍率を効かせる | NotifyStateの `KawaiiPhysics: Settings Multiplier` |
| アニメーションに合わせて突風を起こす | `KawaiiPhysics: Trigger Gust` |

### Settings Multiplier (Pulse)の追加 {#new-notifies-artist-setup}

1. Animation Sequenceを開きます。
2. 効果を始めたい時刻を選びます。
3. Notifyトラックへ `KawaiiPhysics: Settings Multiplier (Pulse)` を追加します（以下はStiffnessを変更する例です）。
4. `SettingsScale` のStiffnessを0.5にします。他の倍率は1のままにします。
5. 再生し、Notifyの前後で揺れ方を比べます。

### Settings Multiplier (Pulse) {#new-notifies-pulse}

Durationはフェードを含む合計時間です。0以下では何もしません。停止ハンドルを保存しないため、途中解除が必要なイベントにはNotifyStateやAPIを使います。

### Settings Multiplier NotifyState {#new-notifies-state}

NotifyStateは、置いた区間中に `SettingsScale` を効かせます。`Curve` なら `CurveName` のアニメーションカーブが重みです。

EnvelopeはNotifyTickの `FrameDeltaTime` を累積します。PlayRate変更・逆再生・スクラブでは、区間の時刻とずれる場合があります。その条件でアニメーションの時刻に合わせたい場合はCurveを使います。Curveが取れない時の既定重みは1なので、カーブ名も確認してください。

Montage中断やCurveモードの終了では、現在の重みから `BlendOutTime` 秒で戻ります。

### Trigger Gust {#new-notifies-trigger-gust}

対象ノードのExternal Forcesへ有効なProcedural Windを追加します。Gust Directionをゼロのままにすると、その風の方向などを引き継ぎます。

Notifyトラックへ `KawaiiPhysics: Trigger Gust` を追加し、`Strength` と `RiseTime`、`HoldTime`、`DecayTime` を設定して再生します。`Strength` は既定0のため、そのままでは突風が発生しません。

このメッシュへ送る場合は `Gust Target=Kawaii Physics Nodes` を使います。髪と服へ同時に送りたい場合は[Kawaii Physics Shared Publisher](/docs/features/shared-publisher)を準備し、送信先を `Shared Publisher` にして `SharedPublisherTag` を合わせます。そのモードではFilter TagsとGust Directionは使われません。

[プロパティ・再生契約リファレンス](/docs/api/animation-notifies)

<span id="new-notifies-check" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"new-notifies-check": "/docs/features/animnotify#new-notifies-trigger-gust"}} to="/docs/features/animnotify#new-notifies-trigger-gust" label="関連する仕様・操作へ" />

## 関連ページ

- [External Force プリセット](/docs/features/external-force-presets) - 外力プリセットの詳細
- [External Forces パラメータ](/docs/parameters/external-forces) - AnimNodeの外力パラメータ
- [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library) - Blueprint API

<LegacyReference targets={{"programmer-details": "/docs/api/animation-notifies#programmer-details"}} to="/docs/api/animation-notifies" label="Notifyの詳細リファレンスへ" />

<LegacyReference targets={{"new-notifies-references": "/docs/features/animnotify#ue-docs"}} to="/docs/features/animnotify#ue-docs" label="関連ドキュメントを読む" />

## 関連するUE公式ドキュメント {#ue-docs}

- [アニメーション通知](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/animation-notifies-in-unreal-engine) — Notifyトラックへの追加、NotifyStateの区間、発火条件を確認できます。 (UE 5.8)

<LegacyReference redirect targets={{"new-notifies-result": "/docs/features/animnotify#new-notifies-artist-setup", "new-notifies-tuning": "/docs/features/animnotify#new-notifies-artist-setup", "new-notifies-common-pitfalls": "/docs/features/animnotify#new-notifies-artist-setup", "new-notifies-prerequisites": "/docs/features/animnotify#new-notifies-artist-setup"}} to="/docs/features/animnotify#new-notifies-artist-setup" label="使用手順" />
