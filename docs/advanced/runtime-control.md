---
sidebar_position: 4
title: "ランタイム制御"
---

import DocVideo from '@site/src/components/DocVideo';

# ランタイム制御

ゲーム実行中にKawaiiPhysicsを動的に制御する方法を説明します。

ランタイム制御は **[UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library)** が提供する Blueprint 関数を通じて行います。これらは `BlueprintThreadSafe` 指定のため、Animation Blueprint のワーカースレッド（AnimGraph のノード関数や `On Update Animation`）からも安全に呼べます。

![ランタイム制御の流れ](/img/generated/runtime-control-flow.svg)

*ノード参照を取得し、パラメータ変更・有効/無効・外力・リセットを呼び出す全体像*

## ノード参照の取得

パラメータ系の関数はすべて `FKawaiiPhysicsReference`（ノード参照）を受け取ります。AnimGraph のノードハンドルから `Convert to Kawaii Physics` で取得します。

```cpp
// FAnimNodeReference から KawaiiPhysics ノード参照へ変換
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics",
    meta = (BlueprintThreadSafe, ExpandEnumAsExecs = "Result"))
static FKawaiiPhysicsReference ConvertToKawaiiPhysics(const FAnimNodeReference& Node,
                                                      EAnimNodeReferenceConversionResult& Result);

// Pure 版（成功/失敗を bool で受け取る）
static void ConvertToKawaiiPhysicsPure(const FAnimNodeReference& Node,
                                       FKawaiiPhysicsReference& KawaiiPhysics, bool& Result);
```

:::tip
Blueprint では、AnimGraph の KawaiiPhysics ノードに **Anim Node Function**（バインドした関数）を割り当て、その中で `Convert to Kawaii Physics` → 各 Setter を呼ぶのが基本パターンです。
:::

## パラメータの動的変更

各 Setter は `FKawaiiPhysicsReference` を返すため、チェーンして複数のパラメータを連続設定できます。

```cpp
// 重力・風・物理設定を動的に変更
KawaiiPhysics = UKawaiiPhysicsLibrary::SetGravity(KawaiiPhysics, FVector(0, 0, -980.0f));
KawaiiPhysics = UKawaiiPhysicsLibrary::SetWindScale(KawaiiPhysics, 2.0f);
KawaiiPhysics = UKawaiiPhysicsLibrary::SetEnableWind(KawaiiPhysics, true);
```

物理パラメータ（Damping / Stiffness など）はまとめて差し替えます。

```cpp
FKawaiiPhysicsSettings Settings = UKawaiiPhysicsLibrary::GetPhysicsSettings(KawaiiPhysics);
Settings.Damping = 0.2f;
Settings.Stiffness = 0.1f;
KawaiiPhysics = UKawaiiPhysicsLibrary::SetPhysicsSettings(KawaiiPhysics, Settings);
```

:::note
`SetPhysicsSettings` などのパラメータ反映は、ノードの `bUpdatePhysicsSettingsInGame`（既定 `true`）が有効な場合に毎フレーム反映されます。無効化すると軽量化しますが、実行中のパラメータ変更が反映されなくなります。
:::

主なパラメータ系関数（一部）:

| 関数 | 内容 |
|------|------|
| `SetGravity` / `GetGravity` | 重力ベクトル |
| `SetEnableWind` / `SetWindScale` | 風の有効化・スケール |
| `SetPhysicsSettings` / `GetPhysicsSettings` | Damping / Stiffness / Radius などの一括設定 |
| `SetDummyBoneLength` | 末端ダミーボーン長（再初期化を自動予約） |
| `SetBoneSubdivisionCount` | ボーン分割数（再初期化を自動予約） |
| `SetTeleportDistanceThreshold` / `SetTeleportRotationThreshold` | テレポート判定しきい値 |
| `SetAllowWorldCollision` | ワールドコリジョンの有効化 |
| `SetLimitsDataAsset` | コリジョン Data Asset の差し替え |

全関数は [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library) を参照してください。

## 物理の時間を遅く・速くする（TimeScale） {#timescale}

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

スロー演出などでアニメーションだけを遅くするときは、ノードの [TimeScale](/docs/parameters/physics#timescale) を同じ倍率にすると、揺れの速さもアニメーションに揃います。演出やゲームプレイで切り替えるには、次のどれかを使います。

| 方法 | 向いている場面 |
|------|----------------|
| ピンに AnimBP の変数をつなぐ | AnimBP の中で毎フレーム決める値（スロー状態のフラグから倍率を決めるなど） |
| ノードプロパティ API | ゲームイベントから特定のノードだけを切り替える |
| Sequencer | カットシーンのスローに合わせてキーを打つ |

### ピンで渡す

`TimeScale` のピンは既定で非表示です。ノードの Details で `TimeScale` のピン表示を有効にし、AnimBP の変数をつなぎます。ピンから範囲外の値が来ても、0.01〜10 に丸めて使います。

### ノードプロパティ API で書き換える

`TimeScale` 専用の Setter はありません。名前を指定する `SetNodeFloatProperty` / `GetNodeFloatProperty` を使います。

```cpp
EKawaiiPhysicsAccessResult Result;
KawaiiPhysics = UKawaiiPhysicsLibrary::SetNodeFloatProperty(Result, KawaiiPhysics, TEXT("TimeScale"), 0.25f);
```

`Get` は設定した値をそのまま返します。実際に使われる値は 0.01〜10 に丸めたものです。属性アクセスの条件は [UKawaiiPhysicsLibrary — ノード属性とプリセット](/docs/api/runtime-properties#details-property-access) を参照してください。

### Sequencer で変える

Actor の Blueprint に float 変数を作って **Expose to Cinematics** を有効にし、Sequencer でキーを打ちます。AnimBP ではその変数を読み、`TimeScale` のピンへつなぎます。

[Kawaii Physics Settings Multiplier](/docs/features/sequencer) トラックは Damping などの物理設定に倍率を掛けるもので、`TimeScale` は変えません。

:::tip Actor の CustomTimeDilation との違い
`CustomTimeDilation` は AnimBP の再生も遅くするため、既に遅くしたアニメーションがさらに遅くなります。アニメーションの速さはそのままで揺れだけを合わせたいときは `TimeScale` を使います。比較は [TimeScale](/docs/parameters/physics#timescale) の表を参照してください。
:::

:::note 物理を止めたいとき
`TimeScale` は `0` にできません。物理の効果を消すときは、下の [Alpha](#alpha) を使います。Alpha `0` はアニメーションのポーズに戻すもので、今の揺れた形のまま止めるわけではありません。
:::

`TimeScale` はプリセットのコピー・適用の対象外です。[プリセット](/docs/features/settings-presets#runtime-only)を適用しても、実行中に切り替えた値は上書きされません。

## 有効/無効の切り替え

ノード単位の enable/disable プロパティはありません。次のいずれかで制御します。

### Alpha による制御（推奨） {#alpha}

`SetAlphaToComponent` でコンポーネント内の KawaiiPhysics ノードのブレンド率（入力 Alpha）をまとめて設定します。`0.0` で物理 OFF（元アニメーション）、`1.0` で物理 ON です。

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static bool SetAlphaToComponent(USkeletalMeshComponent* MeshComp, float Alpha,
                                UPARAM(ref) FGameplayTagContainer& FilterTags,
                                bool bFilterExactMatch = false);
```

`FilterTags` に [KawaiiPhysicsTag](/docs/parameters/external-forces) を渡すと、対象ノードを絞り込めます。アニメーション中の自動制御には [AnimNotifyState: Set Alpha](#animnotifystate-setalpha) も利用できます。

### コンソール変数による一括停止

デバッグ用途では `a.AnimNode.KawaiiPhysics.Enable 0` で全 KawaiiPhysics ノードのシミュレーションを停止できます（[コンソール変数](/docs/advanced/console-variables)）。

**使用例:**

- カットシーン中は Alpha を 0 に
- ポーズメニュー中は停止
- LOD に応じて Alpha を下げる

## 外部力の動的適用

外部力は `FInstancedStruct`（外力プリセット）として追加します。単純なベクトルを直接渡す API はありません。プリセットの詳細は [外部力プリセット](/docs/features/external-force-presets) を参照してください。

### ノード参照に追加

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static bool AddExternalForce(const FKawaiiPhysicsReference& KawaiiPhysics,
                             FInstancedStruct& ExternalForce, UObject* Owner, bool bIsOneShot = false);
```

`bIsOneShot = true` にすると、その力は一度だけ適用されます（衝撃表現に便利）。

### コンポーネントへ一括追加

AnimGraph 外（ゲームスレッド）からは、コンポーネント単位で外力を追加するのが簡単です。`FilterTags` で対象ノードを絞り込めます。

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static bool AddExternalForcesToComponent(USkeletalMeshComponent* MeshComp,
                                         UPARAM(ref) TArray<FInstancedStruct>& ExternalForces, UObject* Owner,
                                         UPARAM(ref) FGameplayTagContainer& FilterTags,
                                         bool bFilterExactMatch = false,
                                         bool bIsOneShot = false);

// 追加した外力の除去（Owner 単位）
static bool RemoveExternalForcesFromComponent(USkeletalMeshComponent* MeshComp, UObject* Owner,
                                              UPARAM(ref) FGameplayTagContainer& FilterTags,
                                              bool bFilterExactMatch = false);
```

<DocVideo src="/video/sample/external-force-volume.mp4" poster="/video/sample/external-force-volume.jpg" alt="台に乗って左右に動くキャラクターが、ピンクの枠に入ると髪が上へ吹き上がり、枠から出ると元に戻る録画" caption="開発版サンプル展示6.9の実機録画。BP_KPS_ForceVolumeは、枠に入ったアクタのSkeletalMeshに上向きの外力（Basic x 100）を追加し、出たら除去します。展示は開発版の新しい名前 AddExternalForcesOnComponent / RemoveExternalForcesOnComponent を使っています。" />

:::note v1.22での名前の変更
開発版（v1.22予定）では、`AddExternalForcesToComponent` と `RemoveExternalForcesFromComponent` は非推奨になり、`AddExternalForcesOnComponent` と `RemoveExternalForcesOnComponent` に置き換わります。
:::

:::tip
爆発やダメージの衝撃は、`FKawaiiPhysics_ExternalForce_Basic` プリセット（力の向き・大きさを持つ）を `bIsOneShot = true` で追加すると表現できます。継続的な力は OneShot にせず、不要になったら `RemoveExternalForcesFromComponent` で除去します。
:::

## リセット

物理状態を初期状態に戻します。テレポートやリスポーン時に使用します。

```cpp
UFUNCTION(BlueprintCallable, Category = "Kawaii Physics", meta=(BlueprintThreadSafe))
static FKawaiiPhysicsReference ResetDynamics(const FKawaiiPhysicsReference& KawaiiPhysics);
```

```cpp
// ノード参照を取得してリセット
bool bOk = false;
FKawaiiPhysicsReference Ref;
UKawaiiPhysicsLibrary::ConvertToKawaiiPhysicsPure(Node, Ref, bOk);
if (bOk)
{
    UKawaiiPhysicsLibrary::ResetDynamics(Ref);
}
```

:::note
ノードの `bUseWarmUpWhenResetDynamics`（既定 `true`）が有効な場合、リセット時に `WarmUpFrames` 分の空回しが行われ、物理が落ち着いた状態から再開します。
:::

**使用例:**

- テレポート後（しきい値を超える移動は自動でテレポート扱いになりますが、明示的なリセットも可能）
- アニメーション遷移時
- リスポーン時

## イベント連携

### AnimNotify / AnimNotifyState {#animnotify}

:::tip バージョン情報
v1.17.0 で外力系 Notify、v1.20.0 で Set Alpha NotifyState を追加
:::

KawaiiPhysics 専用の AnimNotify / AnimNotifyState が提供されています。詳細は [AnimNotify](/docs/features/animnotify) を参照してください。

| クラス | 種類 | 内容 |
|--------|------|------|
| `AnimNotify_KawaiiPhysicsAddExternalForce` | AnimNotify | その瞬間に外力を1回適用（OneShot） |
| `AnimNotifyState_KawaiiPhysicsAddExternalForce` | AnimNotifyState | 区間中、外力を継続適用（Begin で追加・End で除去） |
| `AnimNotifyState_KawaiiPhysicsSetAlpha` | AnimNotifyState | 区間中、物理のブレンド率（Alpha）を制御 |

### AnimNotifyState: Set Alpha {#animnotifystate-setalpha}

アニメーション中に物理のブレンド率を動的に変更できる AnimNotifyState です。内部的に `SetAlphaToComponent` を呼び出します。

```
アニメーションタイムライン:
[=======================================]
     [--Set Alpha: 0.0 -> 1.0--]
     ↑                        ↑
     開始（物理OFF）          終了（物理ON）
```

**使用例:**

- 特定のアニメーション中だけ物理を無効化
- アニメーション遷移時のスムーズなブレンド
- カットシーン中の制御

### ゲームプレイイベントからの適用

```cpp
// ダメージを受けた時、衝撃を外力プリセットとして適用
void AMyCharacter::OnDamageReceived(float Damage, FVector HitDirection)
{
    // FKawaiiPhysics_ExternalForce_Basic を構築し、FInstancedStruct 化して
    // AddExternalForcesToComponent( ..., bIsOneShot = true ) で適用する
}
```

詳しくは [APIリファレンス](/docs/api/kawaiiphysics-library) を参照してください。
