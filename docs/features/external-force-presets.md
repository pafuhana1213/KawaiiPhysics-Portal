---
sidebar_position: 7
title: "外部力プリセット"
---

import DocVideo from '@site/src/components/DocVideo';

# 外部力プリセット

:::tip バージョン情報
v1.16.0で追加
:::

External Forceプリセットシステムは、様々な外力をモジュール化して適用できる機能です。基底構造体を継承した複数のプリセットが用意されており、C++で独自のプリセットを追加することも可能です。

## 概要

![External Forceプリセットシステム](/img/generated/external-force-presets.svg)

*プリセットの種類と適用フロー*

### アーキテクチャ

```
FKawaiiPhysics_ExternalForce (基底)
├─ FKawaiiPhysics_ExternalForce_Basic (汎用方向力)
├─ FKawaiiPhysics_ExternalForce_Curve (時間変化カーブ力)
├─ FKawaiiPhysics_ExternalForce_Gravity (重力)
├─ FKawaiiPhysics_ExternalForce_Wind (風)
└─ FKawaiiPhysics_ExternalForce_ProceduralWind (手続き的な風、v1.22予定)
```

`ProceduralWind` は [Procedural Wind](/docs/features/procedural-wind) を参照してください。

[ソースを見る](https://github.com/pafuhana1213/KawaiiPhysics/tree/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/ExternalForces)

## 基底クラス: FKawaiiPhysics_ExternalForce

全ての外力プリセットの基底となる構造体です。

### 共通パラメータ

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| bIsEnabled | bool | true | 外力の有効/無効 |
| bDrawDebug | bool | false | デバッグ描画の有効/無効 |
| ApplyBoneFilter | TArray\<FBoneReference\> | 空 | 外力を適用するボーンを指定（空の場合は全て） |
| IgnoreBoneFilter | TArray\<FBoneReference\> | 空 | 外力を適用しないボーンを指定 |
| ExternalForceSpace | EExternalForceSpace | WorldSpace | 力のベクトル（Basic の `ForceDir` など）を読む座標系 |
| RandomForceScaleRange | FFloatInterval | (1.0, 1.0) | 力のスケールのランダム化範囲 |

### 力の座標系 (EExternalForceSpace) {#external-force-space}

`ExternalForceSpace` は、力のベクトルをどの座標系の値として読むかを決めます。読んだ力は、ノードの `SimulationSpace` に変換してから加えます。ノードのシミュレーション空間を切り替える設定ではありません。

| 値 | 説明 |
|---|---|
| ComponentSpace | SkeletalMeshComponentの軸で読む。キャラクターが向きを変えると、力の向きも一緒に回る |
| WorldSpace | ワールドの軸で読む。キャラクターの向きに関係なく、同じ方向へ押す（既定値） |
| BoneSpace | 各ボーン自身の軸で読む。基準にするボーンを別に指定する設定はありません |

<DocVideo src="/video/sample/external-force-space.mp4" poster="/video/sample/external-force-space.jpg" alt="回転台の上で走るキャラクター3体のうち、ComponentSpaceの髪は体と一緒に向きが回り、WorldSpaceの髪は常に画面の右へ流れる録画" caption="開発版サンプル展示4.8の実機録画。3体ともBasicのForceDir (0, 1, 0) x 40で、8秒で1回転させています。ComponentSpace（左）は体の前（+Y）へ押すので、髪の向きが体と一緒に回ります。WorldSpace（中央）は常にステージの右へ押します。BoneSpace（右）は各ボーン自身の軸が基準です。" />

Gravity と Wind は常にWorldSpaceで、この設定はありません。

### ボーンフィルタの使用例

```cpp
// 特定のボーンのみに外力を適用
ApplyBoneFilter.Add(FBoneReference("hair_01"));
ApplyBoneFilter.Add(FBoneReference("hair_02"));

// 特定のボーンを除外
IgnoreBoneFilter.Add(FBoneReference("hair_root"));
```

---

## Basic: 基本的な方向力

一定方向の力を継続的または間隔を空けて適用します。

### パラメータ

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| ForceDir | FVector | (0, 0, 0) | 力の方向 |
| ForceRateByBoneLengthRate | FRuntimeFloatCurve | - | ボーンの長さの比率による力の補正カーブ |
| Interval | float | 0.0 | 力を適用する間隔（秒）。0の場合は毎フレーム適用 |

力の大きさは `ForceDir × RandomForceScaleRange から選んだ倍率` です。`ForceDir` に大きさを含めても、`ForceDir` を向きだけにして `RandomForceScaleRange` で強さを決めてもかまいません。

### 使用例

```cpp
// X方向への一定の力（ExternalForceSpace の座標系で読む）
FKawaiiPhysics_ExternalForce_Basic BasicForce;
BasicForce.ForceDir = FVector(100, 0, 0);
BasicForce.Interval = 0.0f; // 毎フレーム適用
```

![BasicでForceDir (0, 1, 0) x 30を加えた鎖が、右へ押されて傾いている画面](/img/sample/external-force-basic.webp)

*開発版サンプル展示4.3の実機画面。`ForceDir = (0, 1, 0)`、強さ30で、鎖が押された方向へ傾いています。*

`ForceRateByBoneLengthRate` カーブを使うと、根元から先端まで力の強さを変えられます。横軸はRootBoneからの長さの割合（0〜1）、縦軸は力に掛ける倍率です。

![同じBasicの力を加えた鎖2本のうち、カーブなしの鎖はまっすぐ斜めに傾き、根元0から先端1のカーブを設定した鎖は根元が垂れたまま先端だけが押されている画面](/img/sample/force-rate-by-bone-length.webp)

*開発版サンプル展示4.9の実機画面。2本ともBasicの `(0, 1, 0) x 80` です。左はカーブなし（全ボーン1）、右は根元0から先端1のカーブで、先端側だけが押されます。*

---

## Curve: カーブベースの力

時間経過に応じてカーブで変化する外力です。アニメーションやタイムラインベースの効果に最適です。

### パラメータ

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| ForceCurve | FRuntimeVectorCurve | - | 時間に応じた外力カーブ（X:時間, Y:力） |
| CurveEvaluateType | EExternalForceCurveEvaluateType | Single | カーブ評価方式 |
| SubstepCount | int | 10 | 経過時間の分割数（Single以外で有効） |
| TimeScale | float | 1.0 | 時間のスケール係数 |
| ForceRateByBoneLengthRate | FRuntimeFloatCurve | - | ボーンの長さの比率による力の補正カーブ |

### カーブ評価方式 (EExternalForceCurveEvaluateType)

| 値 | 説明 |
|---|---|
| Single | 単一ポイントで評価 |
| Average | 複数ポイントの平均値 |
| Max | 複数ポイントの最大値 |
| Min | 複数ポイントの最小値 |

<DocVideo src="/video/sample/external-force-curve.mp4" poster="/video/sample/external-force-curve.jpg" alt="Curveの外力で、鎖が左右に周期的に振れる録画" caption="開発版サンプル展示4.4の実機録画。Y方向の力を4秒周期で0 → 1 → 0 → -1 → 0と変化させ、鎖を左右に振っています。" />

### 使用例

```cpp
// 振動する力
FKawaiiPhysics_ExternalForce_Curve CurveForce;
CurveForce.TimeScale = 2.0f; // 2倍速で再生
CurveForce.CurveEvaluateType = EExternalForceCurveEvaluateType::Average;
```

---

## Gravity: 重力

重力をシミュレートします。Characterの設定と連携可能です。

:::note
重力は常にWorldSpace固定です。空間選択はできません。
:::

### パラメータ

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| ForceRateByBoneLengthRate | FRuntimeFloatCurve | - | ボーンの長さの比率による力の補正カーブ |
| bUseCharacterGravityDirection | bool | false | Character側の重力方向（CustomGravityDirection）を使用（UE5.3以降で有効） |
| bUseCharacterGravityScale | bool | false | Character側のGravityScaleを使用 |
| bUseOverrideGravityDirection | bool | false | 重力方向をオーバーライドするかどうか |
| OverrideGravityDirection | FVector | (0, 0, 0) | 重力方向のオーバーライド値 |

### Characterとの連携

UE5.3以降では、Characterの重力設定（重力方向・GravityScale）と自動連携できます。

```cpp
// Characterの重力設定を使用
FKawaiiPhysics_ExternalForce_Gravity GravityForce;
GravityForce.bUseCharacterGravityDirection = true;
GravityForce.bUseCharacterGravityScale = true;
```

### 重力方向のオーバーライド

```cpp
// 横向きの重力（宇宙ステーションなど）
FKawaiiPhysics_ExternalForce_Gravity GravityForce;
GravityForce.bUseOverrideGravityDirection = true;
GravityForce.OverrideGravityDirection = FVector(1, 0, 0);
```

---

## Wind: 風

WindDirectionalSourceからの風を利用します。ClothやSpeedTreeとの連携を想定しています。

:::note
風は常にWorldSpace固定です。空間選択はできません。
:::

### パラメータ

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| ForceRateByBoneLengthRate | FRuntimeFloatCurve | - | ボーンの長さの比率による力の補正カーブ |
| WindDirectionNoiseAngle | float | 0.0 | WindDirectionalSourceによる風方向のノイズ（角度、度数） |

### WindDirectionalSourceの設定

1. レベルにWindDirectionalSourceを配置
2. 風の強さと方向を設定
3. KawaiiPhysicsノードでWindプリセットを追加

```cpp
FKawaiiPhysics_ExternalForce_Wind WindForce;
WindForce.WindDirectionNoiseAngle = 15.0f; // 15度のランダム変動
```

---

## カスタム外力 (CustomExternalForces)

:::warning 実験的機能
この機能は実験的です。AnimNodeをクリックするか、Animation Blueprintをコンパイルしないと正常に動作しない場合があります。
:::

BlueprintまたはC++で独自の外力ロジックを実装できます。

### 基底クラス: UKawaiiPhysics_CustomExternalForce

```cpp
UCLASS(Abstract, Blueprintable, EditInlineNew, CollapseCategories)
class UKawaiiPhysics_CustomExternalForce : public UObject
```

### パラメータ

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| bIsEnabled | bool | true | このカスタム外力が有効かどうか |
| bDrawDebug | bool | false | デバッグ描画を行うかどうか |

### オーバーライド可能な関数

| 関数 | 説明 |
|------|------|
| PreApply | 外力適用前の処理（全ボーンに対して1回呼ばれる） |
| Apply | 各ボーンに外力を適用（ボーンごとに呼ばれる） |

### C++での実装例

```cpp
UCLASS()
class UMyCustomForce : public UKawaiiPhysics_CustomExternalForce
{
    GENERATED_BODY()

public:
    virtual void Apply_Implementation(FAnimNode_KawaiiPhysics& Node,
        int32 ModifyBoneIndex, const USkeletalMeshComponent* SkelComp,
        const FTransform& BoneTransform) override
    {
        // カスタムロジック
    }
};
```

### Blueprintでの実装

1. `UKawaiiPhysics_CustomExternalForce` を継承したBlueprintクラスを作成
2. `PreApply` と `Apply` イベントをオーバーライド
3. KawaiiPhysicsノードの `CustomExternalForces` に追加

---

## 共通機能

### ForceRateByBoneLengthRate

全てのプリセットで使用できる、ルートからの距離に応じた力の補正カーブです。

- X軸: ボーンチェーン内での位置（0.0 = ルート、1.0 = 末端）
- Y軸: 力のスケール係数

```cpp
// 末端に行くほど力を強くする例
ForceRateByBoneLengthRate.GetRichCurve()->AddKey(0.0f, 0.5f);
ForceRateByBoneLengthRate.GetRichCurve()->AddKey(1.0f, 1.5f);
```

### デバッグ描画

`bDrawDebug = true` にすると、力のベクトルがビューポートに表示されます。

---

## ランタイムでの追加・除去

プリセットはBlueprint/C++からランタイムで追加・除去できます（`AddExternalForce` / `AddExternalForcesToComponent`）。手順は [ランタイム制御](/docs/advanced/runtime-control)、全関数のシグネチャは [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library#external-force-api) を参照してください。

---

## 関連ページ

- [External Forces パラメータ](/docs/parameters/external-forces) - AnimNodeの外力パラメータ
- [AnimNotify](/docs/features/animnotify) - アニメーション中の外力制御
- [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library) - Blueprint API
