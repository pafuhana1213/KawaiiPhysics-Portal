---
sidebar_position: 9
title: "Bone Subdivision（ボーン細分化）"
---

# Bone Subdivision（ボーン細分化）

:::tip バージョン情報
v1.21.0で追加
:::

**Bone Subdivision** は、実スケルトンを一切変更せずに、KawaiiPhysics のシミュレーション内部だけで実ボーンの間に仮想的な「ボーン間ダミー」を挿入し、コリジョン判定の解像度を上げる機能です。

## 解決する課題

物理シミュレーション対象のボーン同士が離れていると、その**間**ではコリジョン判定が行われず、形状をすり抜けてしまうことがあります（典型例: 長いボーンで構成されたスカートが脚を貫通する）。

Bone Subdivision は実ボーンの間にダミーボーンを挿入することで、コリジョンや拘束をより細かく効かせ、この貫通を防ぎます。

![Bone Subdivisionによる貫通防止の概念図](/img/generated/bone-subdivision-concept.svg)

*実ボーン間にダミーを挿入してコリジョン解像度を上げ、貫通を防ぐ。横方向（Bridge）細分化で列と列の隙間も埋められる。*

:::note 内部的な動作
挿入されるダミーは実スケルトンには存在せず（`BoneIndex` が負）、最終出力時に自動で除外されます。結果は実ボーンにのみ反映されるため、リグやアニメーションには影響しません。挿入数はボーン間距離とコリジョン半径から自動補正され、セグメントが重ならないようにクランプされます。
:::

## 縦方向の細分化（Bone Subdivision）

`Bones > Bone Subdivision` カテゴリで設定します。いずれも既定でAnimGraphのピンは非表示（詳細パネルから設定）です。

### BoneSubdivisionCount

**ダミー分割数** - 隣接するボーン間に挿入するダミーボーンの最小分割数。コリジョン検出の精度を向上させます。0で無効。

| プロパティ | 値 |
|-----------|-----|
| 型 | int32 |
| デフォルト | 0（無効） |
| 範囲 | 0 - 10 |
| カテゴリ | Bones&#124;Bone Subdivision |

### bBoneSubdivisionCollisionOnly

**コリジョン専用** - 有効にすると、ボーン間ダミーの速度積分（重力・風など）をスキップし、実ボーン間の補間位置からコリジョン・制約にのみ参加します。軽量で、多くの貫通対策ではこれで十分です。ダミーの配置数には影響しません。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | true |
| 編集条件 | `BoneSubdivisionCount > 0` |
| カテゴリ | Bones&#124;Bone Subdivision |

- **true（コリジョン専用・既定）**: 実ボーンのシミュレーション結果を補間してダミーを配置し、コリジョン・BoneConstraint・角度/平面制約に参加。軽量。
- **false（フル物理）**: ダミーも速度・重力・風・剛性を含むシミュレーションに参加。最も自然だがコスト高。

### bBoneSubdivisionDensifyByRadius

**半径による密度補正** - 半径に応じてダミーを追加配置し、コリジョン球でボーン間を概ね隙間なく被覆します。`BoneSubdivisionCount` を最小として、ボーン間が半径に対して離れている区間ほど多く配置します（近接区間は最小のまま。1区間あたり最大50本）。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | false |
| 編集条件 | `BoneSubdivisionCount > 0` |
| カテゴリ | Bones&#124;Bone Subdivision |

:::warning
有効中に `Radius` / `RadiusCurve` を変更した場合、ダミー数の再計算には再初期化（Animation Blueprintの再コンパイル等）が必要なことがあります。
:::

## 横方向の細分化（BoneConstraint Subdivision / Bridge）

縦方向だけでなく、隣接するボーンチェーン（列）の**間**を埋める機能です。スカートのように複数の縦チェーンが並ぶ構成で、列と列の隙間からの貫通を防ぎます。`BoneConstraintSubdivisionCount` と `BoneSubdivisionCount` を組み合わせると、布面に2Dグリッド状のコリジョン点が並びます。

![横方向の細分化（Bridge）の概念図](/img/generated/bridge-subdivision-concept.svg)

*BoneConstraint Subdivision なし（左）では列の隙間からコライダーがすり抜けて貫通。あり（右）では横方向Constraintに沿ってコリジョン点（bridge dummy）が挿入され、隙間を埋めて貫通を防ぐ。*

### BoneConstraintSubdivisionCount

**横方向分割数** - 横方向のBoneConstraintに沿って挿入するコリジョン代理ダミー（bridge dummy）の分割数。隣接チェーン間の隙間をコリジョン点で埋めて貫通を防ぎます。0で無効。

| プロパティ | 値 |
|-----------|-----|
| 型 | int32 |
| デフォルト | 0（無効） |
| 範囲 | 0 - 10 |
| カテゴリ | Bones&#124;Bone Subdivision |

端点コリジョンが既に重なる接続（間隔 ≤ 2×半径）には挿入されません。`BoneSubdivisionCount` とは独立して動作します。

### BoneConstraintSubdivisionFeedbackScale

**フィードバック強度** - bridge dummy が受けたコリジョンの押し出しを、その端点ボーンに伝える強さです（0=伝えない、1=標準）。これにより列の間で動くコライダーが実ボーンを押し出せます（貫通防止フィードバックの本体）。剛性が強すぎる場合は下げてください。

| プロパティ | 値 |
|-----------|-----|
| 型 | float |
| デフォルト | 1.0 |
| 範囲 | 0.0 - 2.0 |
| 編集条件 | `BoneConstraintSubdivisionCount > 0` |
| カテゴリ | Bones&#124;Bone Subdivision |

### bExcludeFromSubdivision（BoneConstraint側）

個々の `FModifyBoneConstraint` には `bExcludeFromSubdivision` フラグがあり、特定の制約を bridge 細分化の対象から除外できます。

## デバッグ表示

エディタのデバッグ描画では、ボーンの種類が色分けされます。

| 種類 | 色 |
|-----|-----|
| ボーン間ダミー（inter-bone dummy） | シアン |
| 先端ダミー（tip dummy） | 赤 |
| 実ボーン | 黄 |

## パフォーマンス上の注意

:::warning
ダミーボーンは増えるほどコリジョン・拘束のコストが上がります。生成数が多すぎる場合は警告ログが出力されます（しきい値は **Project Settings > Plugins > Kawaii Physics** の `Inter-Bone Dummy Warning Threshold`（既定100）/ `Bridge Dummy Warning Threshold`（既定200）で調整可能、0で無効化。詳細は [プロジェクト設定](/docs/advanced/project-settings#performance-warnings) を参照）。

まずは `BoneSubdivisionCount` を小さい値（1〜2）から試し、必要に応じて `bBoneSubdivisionDensifyByRadius` を有効化してください。
:::

## Blueprintからの制御

ランタイムで以下のBlueprint関数から設定を変更できます。

| 関数 | 説明 |
|------|------|
| `Set/Get Bone Subdivision Count` | 縦方向ダミー分割数（変更時に再初期化） |
| `Set/Get Bone Subdivision Collision Only` | コリジョン専用の切り替え |
| `Set/Get Bone Constraint Subdivision Count` | 横方向ダミー分割数（変更時に再初期化） |
| `Set/Get Bone Constraint Subdivision Feedback Scale` | フィードバック強度（即時反映） |

詳しくは [KawaiiPhysics Library](/docs/api/kawaiiphysics-library) を参照してください。

## 関連ページ

- [コリジョン設定](/docs/features/collision-setup)
- [Sync Bone](/docs/features/sync-bone)
- [リミットパラメータ](/docs/parameters/limits)
- [パフォーマンス最適化](/docs/advanced/performance)
- [プロジェクト設定](/docs/advanced/project-settings)
