---
sidebar_position: 7
title: "プロジェクト設定（Project Settings）"
---

# プロジェクト設定（Project Settings）

KawaiiPhysics は、プロジェクト全体に適用される設定を **Project Settings > Plugins > Kawaii Physics** に持っています。ここで設定した値は、そのプロジェクト内のすべての KawaiiPhysics ノードに共通で適用されます。

:::tip バージョン情報
このプロジェクト設定（`KawaiiPhysicsDeveloperSettings`）はv1.21.0で追加されました。
:::

## 設定画面の開き方

1. エディタ上部メニューの **Edit > Project Settings** を開く
2. 左側のカテゴリ一覧から **Plugins > Kawaii Physics** を選択

<!-- IMAGE_NEEDED: Project Settings > Plugins > Kawaii Physics の設定画面 -->

:::note 設定の保存先
これらは `config = Engine` 指定の `UDeveloperSettings` です。変更すると、プロジェクトの `Config/DefaultEngine.ini` に以下のセクションで保存されます。バージョン管理や他メンバーとの共有もこのファイル経由で行われます。

```ini
[/Script/KawaiiPhysics.KawaiiPhysicsDeveloperSettings]
bUseFixedSubstepping=True
MaxSubsteps=4
InterBoneDummyWarningThreshold=100
BridgeDummyWarningThreshold=200
```
:::

## Simulation

シミュレーションの時間積分に関する設定です。

### Use Fixed Substepping

**固定サブステップの有効化** - シミュレーション全体を固定タイムステップ（`FixedDt = 1 / TargetFramerate`）でサブステップ実行し、フレームレート依存の挙動を解消します。低fps時はサブステップ数が増えるため負荷が上がります。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | true |
| カテゴリ | Simulation |
| INIキー | `bUseFixedSubstepping` |

詳しい仕組みや後方互換性については [Fixed Substepping](/docs/advanced/fixed-substepping) を参照してください。

### Max Substeps

**最大サブステップ数** - 1フレームあたりの最大サブステップ数です。低fps・ヒッチ時の暴走（spiral of death）を防ぐ上限で、これを超える分の時間は破棄されます。

| プロパティ | 値 |
|-----------|-----|
| 型 | int32 |
| デフォルト | 4 |
| 範囲 | 1 - 16 |
| 編集条件 | `Use Fixed Substepping` が有効なときのみ編集可能 |
| カテゴリ | Simulation |
| INIキー | `MaxSubsteps` |

## Performance Warnings

[Bone Subdivision](/docs/features/bone-subdivision) によって生成されるダミーボーンが多すぎる場合に、出力ログへ警告を出すためのしきい値です。生成数がしきい値を超えると、負荷上昇の可能性を知らせる警告ログが1回出力されます。

:::note エディタ専用設定
この2つは `WITH_EDITORONLY_DATA` 配下のエディタ専用設定です。警告ログもエディタ／開発ビルドでの確認用であり、製品ビルドの挙動には影響しません。
:::

### Inter-Bone Dummy Warning Threshold

**ボーン間ダミー警告しきい値** - `BoneSubdivisionCount`（縦方向の細分化）で生成される inter-bone ダミーボーン数の警告しきい値です。`0` で警告を無効化します。

| プロパティ | 値 |
|-----------|-----|
| 型 | int32 |
| デフォルト | 100 |
| 範囲 | 0 以上（0で無効） |
| カテゴリ | Performance Warnings |
| INIキー | `InterBoneDummyWarningThreshold` |

### Bridge Dummy Warning Threshold

**ブリッジダミー警告しきい値** - `BoneConstraintSubdivisionCount`（横方向の細分化／Bridge）で生成される bridge collision-proxy ダミーボーン数の警告しきい値です。`0` で警告を無効化します。

| プロパティ | 値 |
|-----------|-----|
| 型 | int32 |
| デフォルト | 200 |
| 範囲 | 0 以上（0で無効） |
| カテゴリ | Performance Warnings |
| INIキー | `BridgeDummyWarningThreshold` |

:::tip
警告が出た場合は、まず `BoneSubdivisionCount` / `BoneConstraintSubdivisionCount` を下げて生成数を抑えるのが基本です。意図的に多くのダミーを使う場合のみ、しきい値を引き上げてください。詳細は [Bone Subdivision](/docs/features/bone-subdivision#パフォーマンス上の注意) を参照してください。
:::

## ソースコード

- [`KawaiiPhysicsDeveloperSettings.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsDeveloperSettings.h) — 設定クラスの定義

## 関連ページ

- [Fixed Substepping（フレームレート非依存化）](/docs/advanced/fixed-substepping)
- [Bone Subdivision（ボーン細分化）](/docs/features/bone-subdivision)
- [コンソールコマンド / 変数](/docs/advanced/console-variables)
- [パフォーマンス最適化](/docs/advanced/performance)
