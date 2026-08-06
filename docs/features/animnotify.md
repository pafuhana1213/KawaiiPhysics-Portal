---
sidebar_position: 8
title: "AnimNotify"
---

# AnimNotify

:::tip バージョン情報
v1.17.0で追加
:::

AnimNotifyを使用して、アニメーション中にKawaiiPhysicsの外力やAlphaを制御できます。

## 概要

KawaiiPhysicsは3種類のAnimNotifyを提供しています：

| クラス | 種類 | 用途 |
|--------|------|------|
| UAnimNotify_KawaiiPhysicsAddExternalForce | Notify | 瞬間的に外力を追加 |
| UAnimNotifyState_KawaiiPhysicsAddExternalForce | NotifyState | 区間中に外力を適用 |
| UAnimNotifyState_KawaiiPhysicsSetAlpha | NotifyState | 区間中にAlphaを上書き |

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

全てのAnimNotifyはGameplayTagによるフィルタリングに対応しています。

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

## 関連ページ

- [External Force プリセット](/docs/features/external-force-presets) - 外力プリセットの詳細
- [External Forces パラメータ](/docs/parameters/external-forces) - AnimNodeの外力パラメータ
- [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library) - Blueprint API
