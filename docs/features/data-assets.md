---
sidebar_position: 5
title: "Data Assets"
---

# Data Assets

パラメータを再利用可能なData Assetとして管理する方法を説明します。

## 概要

**KawaiiPhysicsLimitsDataAsset** を使用すると、コリジョン設定や制限パラメータを複数のキャラクターで共有できます。

## Data Assetの作成

1. Content Browserで右クリック
2. **Miscellaneous > Data Asset** を選択
3. **KawaiiPhysicsLimitsDataAsset** を選択
4. 名前を付けて保存

![DataAsset Regex設定](/img/features/dataasset-regex.png)

*DataAssetでの正規表現による骨セット指定*

## パラメータの設定

Data Assetには以下のコリジョン Limit を保存できます：

- Spherical Limits
- Capsule Limits
- Box Limits
- Planar Limits

## 使用方法

1. KawaiiPhysicsノードの **Limits Data Asset** プロパティを設定
2. Data Assetのパラメータが自動的に読み込まれる

![Bone Hierarchy Picker](/img/features/bone-hierarchy-picker.png)

*ボーン選択が階層ピッカーで可能（v1.16.0以降）*

![Export Limits DataAsset](/img/features/export-limits-dataasset.png)

*AnimNodeのLimits設定をDataAssetにエクスポート（v1.16.0以降）*

```cpp
UPROPERTY()
UKawaiiPhysicsLimitsDataAsset* LimitsDataAsset;
```

## BoneConstraintの設定

Bone Constraint機能そのものの使い方は [Bone Constraint（ボーン間拘束）](/docs/features/bone-constraint) を参照してください。

v1.14.0からDataAssetでBoneConstraint（骨間の距離拘束）を設定できるようになりました。v1.19.0で正式版になっています。

![BoneConstraint Demo](/img/features/boneconstraint-demo.webp)

正規表現を使って拘束対象の骨セットを指定できます：

```text
// 例: skirt_01_* と skirt_02_* 間の拘束
Bone1: skirt_01_.*
Bone2: skirt_02_.*
```

### BoneConstraintsDataAsset

:::tip バージョン情報
v1.19.0で正式化
:::

BoneConstraint設定専用のData Assetです。複数のAnimNodeやAnimation Blueprintで設定を共有したい場合に推奨されます。

[ソースを見る](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsBoneConstraintsDataAsset.h)

![Export BoneConstraint](/img/features/export-boneconstraint.png)

*AnimNodeからBoneConstraint設定をエクスポート*

```cpp
UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Limits|Bone Constraint")
TObjectPtr<UKawaiiPhysicsBoneConstraintsDataAsset> BoneConstraintsDataAsset;
```

#### BoneConstraintsDataAssetのパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| BoneConstraintsData | TArray\<FModifyBoneConstraintData\> | ボーン制約データの配列 |
| RegexPatternList | TArray\<FRegexPatternBoneSet\> | 正規表現パターンリスト（エディタのみ） |
| PreviewSkeleton | TSoftObjectPtr\<USkeleton\> | エディタ用プレビュースケルトン |

#### FModifyBoneConstraintData構造体

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| BoneReference1 | FBoneReference | 最初のボーンへの参照 |
| BoneReference2 | FBoneReference | 2番目のボーンへの参照 |
| bOverrideCompliance | bool | Compliance Typeを上書きするかどうか |
| ComplianceType | EXPBDComplianceType | 上書きする場合のCompliance Type（デフォルト: Leather） |
| bExcludeFromSubdivision | bool | この拘束を BoneConstraint Subdivision の対象から除外する（構造/対角の拘束をオプトアウト、デフォルト: false、v1.21.0で追加） |

#### 正規表現による一括設定

`ApplyRegex` ボタンを使用すると、正規表現パターンからボーン制約を自動生成できます。

```cpp
// FRegexPatternBoneSet
RegexPatternBone1 = "skirt_01_.*";  // 最初のボーンパターン
RegexPatternBone2 = "skirt_02_.*";  // 2番目のボーンパターン
```

## メリット

### 再利用性

同じ体型のキャラクターでコリジョン設定を共有できます。

### 一括変更

Data Assetを修正すると、参照しているすべてのキャラクターに反映されます。

### バージョン管理

アセットとして管理できるため、変更履歴を追跡しやすくなります。

## ベストプラクティス

1. **体型ごとに作成**: 「Male_Standard」「Female_Standard」など
2. **部位ごとに分割**: 「Hair_Collision」「Tail_Collision」など
3. **命名規則**: `DA_KP_[体型]_[部位]`

```text
Content/
└── KawaiiPhysics/
    └── DataAssets/
        ├── DA_KP_Female_Hair
        ├── DA_KP_Female_Skirt
        └── DA_KP_Male_Cape
```
