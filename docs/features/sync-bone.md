---
sidebar_position: 6
title: "Sync Bone"
---

# Sync Bone

:::tip バージョン情報
v1.20.0で追加。v1.21.0で適用方向・距離減衰・スケールカーブなどが大幅に強化されました。
:::

Sync Bone機能は、物理制御下のボーンに対して、指定したボーン（同期元）の移動・回転を適用する機能です。スカートが足を貫通するのを防ぐのに効果的です。

## 概要

従来、スカートなどの貫通対策にはコリジョンを使用していましたが、複雑な形状や動きに対応するのが難しい場合がありました。Sync Bone機能を使用すると、コリジョンを使わずに足などのボーンの動きを物理ボーンに反映させることができます。

![Sync Boneデモ](/img/features/syncbone-demo.webp)

## 仕組み

```
足のボーン（同期元 = Bone）
    ↓ 位置・回転を取得
[Sync Bone処理]
    ↓ 物理ボーンに反映（適用方向・スケール・距離減衰を考慮）
スカートのボーン（同期先 = TargetRoots）
```

同期元のボーンが移動・回転すると、その動きが物理ボーンに反映され、貫通を防ぎます。

![Sync Boneの処理フロー](/img/generated/sync-bone-concept.svg)

*Sync Boneによる貫通防止の仕組み*

## 設定方法

1. KawaiiPhysicsノードを選択
2. **Sync Bones** 配列（`Force` カテゴリ）に要素を追加
3. 同期元ボーン（`Bone`）と同期先（`TargetRoots`）を設定

### FKawaiiPhysicsSyncBone

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| Bone | FBoneReference | 同期元のボーン（例: 足のボーン） |
| TargetRoots | TArray\<FKawaiiPhysicsSyncTargetRoot\> | 同期先のボーン/チェーン（下記） |
| GlobalScale | FVector | 全体に適用される移動の度合い（0.0〜1.0、既定 (1,1,1)） |
| ScaleCurveByDeltaDistance | FRuntimeFloatCurve | 同期元の移動距離に応じて補正量にスケールをかけるカーブ（X: 移動距離、Y: スケール） |
| ApplyDirectionX / Y / Z | ESyncBoneDirection | 各軸の移動を適用する方向（既定 Both） |

### FKawaiiPhysicsSyncTargetRoot（同期先の指定）

`TargetRoots` の各要素では、同期先のボーンと、その配下チェーンへの適用を設定します。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| Bone | FBoneReference | 適用対象のボーン |
| bIncludeChildBones | bool | このボーンの子ボーンもすべて対象にするか（既定 true） |
| ScaleCurveByBoneLengthRate | FRuntimeFloatCurve | TargetRootからの長さ割合に応じて影響度にスケールを適用（X: LengthRate、Y: Scale） |

`bIncludeChildBones` を有効にすると、指定ボーンの子ボーンが自動的に同期先（`ChildTargets`）として展開されます。`ScaleCurveByBoneLengthRate` を使うと、TargetRootに近いボーンほど強く、先端ほど弱く、といった段階的な適用が可能です。

### ESyncBoneDirection（適用方向）

各軸ごとに、どの方向の移動を適用するかを指定します。

| 値 | 説明 |
|-----|------|
| Both | 両方向の移動を適用（既定） |
| Positive | 正方向の移動のみ適用 |
| Negative | 負方向の移動のみ適用 |
| None | 移動を適用しない |

例えば、足が外側に動いたときだけスカートを押し出したい場合などに、軸と方向を限定できます。

## 距離減衰（Distance Attenuation）

同期元ボーンと同期先の距離に応じて、適用量（Alpha）を減衰させる設定です。離れたボーンへの過剰な影響を抑えられます。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| bEnableDistanceAttenuation | bool | 距離減衰を有効化（既定 false） |
| AttenuationInnerRadius | float (cm) | この距離以内は減衰しない |
| AttenuationOuterRadius | float (cm) | この距離以上は最大減衰量がかかる |
| MaxAttenuationRate | float | 最大減衰量（0=減衰なし、1=適用量が0になる） |

```
距離 ≤ Inner          : 減衰なし（フル適用）
Inner < 距離 < Outer  : 距離に応じて補間
距離 ≥ Outer          : 最大減衰（MaxAttenuationRate）
```

## 使用例: スカートの足貫通対策

足のボーンを同期元（`Bone`）に、近くのスカートボーンを同期先（`TargetRoots`）に設定します。

```
同期元: thigh_l / thigh_r （足のボーン）
同期先: skirt_front_l_01, skirt_side_l_01 ... （スカートのボーン）
```

- まず `GlobalScale` を低め（0.3〜0.5）に設定し、徐々に上げて調整します。
- `bIncludeChildBones` を有効にすると、スカートチェーン全体へまとめて適用できます。
- 足が体側に動いたときだけ反映したい場合は `ApplyDirection` を限定します。

## Collisionとの組み合わせ

Sync Bone機能とCollisionを組み合わせることで、より確実な貫通防止が可能です。

![SyncBone + Collision比較](/img/features/syncbone-collision-compare.webp)

*SyncBoneとCollisionの組み合わせによる貫通防止効果*

## BoneConstraintとの組み合わせ

Sync Bone機能とBoneConstraint機能を組み合わせることで、より自然なスカート表現が可能です。

![SyncBone + BoneConstraint + Collision](/img/features/syncbone-full-demo.webp)

*SyncBone、BoneConstraint、Collisionを組み合わせた完全なデモ*

- **Sync Bone**: 足との貫通を防止
- **BoneConstraint**: スカートのボーン間の距離を維持

```
[BoneConstraint] ← ボーン間の距離を維持
       ↓
スカートのボーン
       ↑
   [Sync Bone] ← 足の動きを反映
```

## 注意点

:::warning
- `GlobalScale` が高すぎると、物理の動きが不自然になる場合があります。まずは低い値（0.3〜0.5）から調整してください。
- 距離減衰を併用すると、遠いボーンへの過剰な影響を抑えられます。
:::

## コリジョンとの比較

| 方式 | メリット | デメリット |
|-----|---------|----------|
| コリジョン | 物理的に正確 | 設定が複雑、計算コスト高 |
| Sync Bone | 軽量、設定が簡単 | 物理的な正確性は低い |

多くの場合、Sync Boneとコリジョンを併用することで最良の結果が得られます。Bone Subdivision と組み合わせると、さらに細かい貫通対策が可能です。

## 関連ページ

- [コリジョン設定](/docs/features/collision-setup)
- [Bone Subdivision](/docs/features/bone-subdivision)
- [Limitsパラメータ](/docs/parameters/limits)
- [Data Assets](/docs/features/data-assets)
