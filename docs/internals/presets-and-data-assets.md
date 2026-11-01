---
sidebar_position: 15
title: "Data Asset とプリセット"
description: "Limits、Bone Constraints、Preset、Wind Preset の各 Data Asset について、データの持ち方、適用のタイミング、ライブ同期、シリアライズ互換、プロパティ追加の手順を説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# Data Asset とプリセット

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

このページでは、4種類のアセットのデータの持ち方、ノードへ反映されるタイミング、エディタでの同期、旧データとの互換、プリセットの適用対象の決まり方を説明します。未正式リリースの対象は `UKawaiiPhysicsPresetDataAsset` と `UKawaiiPhysicsWindPresetDataAsset` です。

## このページの要点

**概要**

KawaiiPhysics の Data Asset は、設定を複数のノードで再利用するための仕組みです。Limits、Bone Constraints、Preset、Wind Preset の4種類があります。

**設計**

Limits と Bone Constraints はノードから参照し続けるアセットで、内容はノードの `Transient` な配列へ評価用の作業データとして取り込まれます。Preset と Wind Preset は値をコピーして適用するアセットで、Wind Preset だけは Shared Publisher ノードからも参照されます。Preset は `FAnimNode_KawaiiPhysics` を丸ごと持ち、プロパティを走査して分類した結果で適用対象を決めます。

**理解のポイント**

- アセットの編集がノードへ伝わるかどうかは、参照かコピーかと、再取り込みや再適用の条件で決まります。Bone Constraints の編集は、結合済みの拘束が再構築されるまでシミュレーションに反映されません。
- 参照型のアセットを取り込むタイミングはビルドで異なります。エディタを含むビルドは評価のたびに取り込み、含まないビルドは `Initialize_AnyThread` でだけ取り込みます。
- 同じプリセットでも、ランタイムの適用とエディタの適用は結果が異なります。ランタイムの適用は外力の2つの配列をコピーせず、値も実行中のノードにしか残りません。
- プリセットの分類表は、名前指定のプロパティアクセスの許可リストを兼ねています。プロパティの分類が `Unknown` のままだと、どちらからも使えません。

<DocFigure src="/img/generated/internals-asset-apply-ja.svg" alt="Limits、Bone Constraints、Preset、Wind Presetの4種のアセットについて初期化、エディタ評価、実行時の適用経路を示す図" caption="上段は参照アセットの初期化とエディタでの再取り込み、下段はPresetとWind Presetのコピー適用経路を示します。" maxWidth={960} />

## 関連ファイル

| ファイル | 役割 |
|---|---|
| [`Public/KawaiiPhysicsLimitsDataAsset.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsLimitsDataAsset.h) | Limits アセットと、非推奨の `FSphericalLimitData` などの旧構造体 |
| [`Private/KawaiiPhysicsLimitsDataAsset.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsLimitsDataAsset.cpp) | 編集時の処理、Guid の一意化、`PostLoad` の移行 |
| [`Public/KawaiiPhysicsBoneConstraintsDataAsset.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsBoneConstraintsDataAsset.h) | Bone Constraints アセット、`FModifyBoneConstraintData` |
| [`Private/KawaiiPhysicsBoneConstraintsDataAsset.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsBoneConstraintsDataAsset.cpp) | `GenerateBoneConstraints`、`ApplyRegex`、`PostLoad` の移行 |
| [`Public/KawaiiPhysicsPresetDataAsset.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsPresetDataAsset.h) | Preset アセット、`FKawaiiPhysicsPresetApplyOptions`、`EKawaiiPhysicsPresetPropertyClass` |
| [`Private/KawaiiPhysicsPresetDataAsset.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsPresetDataAsset.cpp) | プロパティの分類表、コピー、適用、比較 |
| [`Public/KawaiiPhysicsWindPresetDataAsset.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsWindPresetDataAsset.h) | Wind Preset アセット、`FKawaiiProceduralWindPreset` |
| [`Private/KawaiiPhysicsWindPresetDataAsset.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsWindPresetDataAsset.cpp) | `ToDynamicParams`、`ResolvePresetParamsByTag`、組み込みプリセット |
| [`Private/AnimNode_KawaiiPhysicsCollision.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsCollision.cpp) | `ApplyLimitsDataAsset`、`ApplyBoneConstraintDataAsset`、`InitBoneConstraints` |
| [`KawaiiPhysicsEd/Private/KawaiiPhysicsEditorLibrary.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/KawaiiPhysicsEditorLibrary.cpp) | `ApplyPresetToGraphNode`、`ApplyPresetToProject` |
| [`Config/DefaultKawaiiPhysics.ini`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Config/DefaultKawaiiPhysics.ini) | CoreRedirects |

## アセットの全体像

| アセット | 持つデータ | ノードの参照 | ノード側の格納先 |
|---|---|---|---|
| `UKawaiiPhysicsLimitsDataAsset` | `SphericalLimits`、`CapsuleLimits`、`TaperedCapsuleLimits`、`BoxLimits`、`PlanarLimits` | `LimitsDataAsset` | Transient の `SphericalLimitsData` など |
| `UKawaiiPhysicsBoneConstraintsDataAsset` | `TArray<FModifyBoneConstraintData> BoneConstraintsData` | `BoneConstraintsDataAsset` | Transient の `BoneConstraintsData` |
| `UKawaiiPhysicsPresetDataAsset` | `FAnimNode_KawaiiPhysics Node`、`TargetTags` | なし（値をコピー） | 対象ノードの各 UPROPERTY |
| `UKawaiiPhysicsWindPresetDataAsset` | `TArray<FKawaiiProceduralWindPreset> Presets` | KawaiiPhysics ノードはなし（タグで検索）。Shared Publisher ノードは `WindPresetDataAsset` | 外力の `PendingParams`。Publisher は `SharedWind` |

Limits と Bone Constraints のノード側の配列は `Transient` です。アセットの内容はノードへ保存されず、評価用の作業データとして取り込まれます。

## Limits Data Asset

`ApplyLimitsDataAsset` は `XxxLimitsData` から `SourceType == ECollisionSourceType::DataAsset` の要素を削除し、アセットの配列を `Append` して `DrivingBone` を初期化します。`Initialize_AnyThread` は先に `XxxLimitsData` を空にします。評価ループの呼び出しでは配列が残っているため、この削除によって重複を防ぎます。

取り込みは `ApplyLimitsDataAsset`、`ApplyPhysicsAsset`、`ApplyMirrorLimits`、`ApplyBoneConstraintDataAsset` の順に呼ばれます。ヘッダのコメントのとおり、`ApplyMirrorLimits` は前の2つの結果を複製するため、この順序が必要です。Mirror は[ローカルコリジョン](/docs/internals/collision)を参照してください。

アセットの要素の `SourceType` が `DataAsset` であることが、削除の前提です。エディタで `PostEditChangeChainProperty` が `ArrayAdd` と `ValueSet` のときに設定し、`UAnimGraphNode_KawaiiPhysics::ExportLimitsDataAsset` も書き出し時に設定します。

## Bone Constraints Data Asset

`BoneConstraintsData` の要素は `FModifyBoneConstraintData` です。`ApplyBoneConstraintDataAsset` は `GenerateBoneConstraints` で `FModifyBoneConstraint` の配列へ変換し、ノードの `BoneConstraintsData` へ格納して `InitializeBone` します。

シミュレーションが読むのは `MergedBoneConstraints` です。`InitBoneConstraints` が `BoneConstraints`、`BoneConstraintsData`、ダミー拘束の順に結合するため、`BoneConstraintsData` を更新しただけでは反映されず、`ModifyBones` の再構築が必要です。拘束の処理は[拘束と制限](/docs/internals/constraints-and-limits)を参照してください。

`RegexPatternList`、`PreviewSkeleton`、`PreviewBoneList`、`PreviewBoneListString` はエディタ専用のデータです。`ApplyRegex` は `PreviewBoneListString` に正規表現を掛け、2つのパターンのマッチを順に組にして `BoneConstraintsData` へ追加します。

## 適用のタイミング {#apply-timing}

`Apply...` 関数の呼び出し元は2か所だけです。

| 呼び出し元 | ビルド | 動作 |
|---|---|---|
| `Initialize_AnyThread` | すべて | `XxxLimitsData` を空にしてから4関数を実行する |
| `EvaluateSkeletalControl_AnyThread` | `WITH_EDITOR` | ルートボーンの検証より前に、毎評価4関数を実行する。PIE も含む |

`ModifyBones` の再構築はこの一覧に含まれません。再構築で実行されるのは `InitModifyBones`、`InitSyncBones`、`InitBoneConstraints` です。そのため、エディタを含まないビルドでは、アセットの差し替えは次の `Initialize_AnyThread` まで `XxxLimitsData` と `BoneConstraintsData` へ反映されません。`SetMirrorDataTableForLimits` のヘッダには、反映が次回のノード初期化であることが明記されています。

`UKawaiiPhysicsLibrary` には `SetLimitsDataAsset` があります。`BoneConstraintsDataAsset` の専用 Setter は無く、名前指定の API で書き換えられます。どちらのプロパティも `GetNodeModifyBonesReinitPropertyNames` に含まれるため、変更時に `ModifyBones` の再構築が要求されます。

## ライブ同期

エディタでアセットを編集した内容がノードへ届く仕組みは、主に評価ループの再取り込みです。デリゲートは Details パネルとの同期に使います。

| 仕組み | 実装 | 役割 |
|---|---|---|
| 毎評価の再取り込み | 評価ループの `#if WITH_EDITOR` | コメントのとおり、他のノードでの編集を同期する |
| `OnLimitsChanged` | `PostEditChangeChainProperty` の最後に `Broadcast` | `FKawaiiPhysicsEditMode::OnLimitDataAssetPropertyChange` が `RuntimeNode` の `XxxLimitsData` を `GraphNode->Node` へ複製する |
| `UpdateLimit` | `FKawaiiPhysicsEditMode` のビューポート操作から呼ぶ | Guid が一致する要素を上書きし、`MarkPackageDirty` する |
| Guid の一意化 | `EnsureUniqueCollisionGuids` | 編集後と `PostLoad` で重複と無効な Guid を再発番する |

`FKawaiiPhysicsEditMode` は `EnterMode` で `OnLimitsChanged` へバインドし、`BoundLimitsDataAsset` にバインド先を保存します。ノードの `LimitsDataAsset` が差し替わると、旧アセットから外して新アセットへバインドし直します。`ExitMode` は保存したアセットから外すため、実行中に差し替わっていても解除できます。

Guid の一意化は、EditMode が Guid で要素を特定して削除するためのものです。複製は `EPropertyChangeType::Duplicate` で再発番し、貼り付けなどの `ValueSet` は `EnsureUniqueCollisionGuids` で処理します。

Bone Constraints アセットにデリゲートはありません。`PostEditChangeProperty` は `PreviewSkeleton` の変更時に `UpdatePreviewBoneList` を呼ぶだけです。評価ループの `ApplyBoneConstraintDataAsset` が `BoneConstraintsData` を更新しますが、`MergedBoneConstraints` は再構築まで変わりません。

Preset と、Library や Wind Scope で適用した Wind Preset はコピーのため、アセットの編集は適用済みのノードへ伝わりません。Shared Publisher の再適用条件は[後述](#shared-publisher-wind-preset)します。差分の確認には `MatchesNode` と[Preset Diff](/docs/internals/editor-tools)を使います。

## シリアライズ互換

Limits、Bone Constraints、Preset の各アセットと、ノードの `Kawaii-Phys` は、`FCustomVersionRegistration` で独立したカスタムバージョンを登録しています。Wind Preset に登録はありません。

| アセット | バージョン構造体 | 列挙値 | 移行処理 |
|---|---|---|---|
| Limits | `FCollisionLimitDataCustomVersion` | `ChangeToBoneReference`、`DeprecateLimitData` | `PostLoad` で `DrivingBoneName` を `DrivingBoneReference` へ移し、`Sync` で旧配列を新配列へ変換する |
| Bone Constraints | `FBoneConstraintDataCustomVersion` | `ChangeToBoneReference` | `PostLoad` で `BoneName1`、`BoneName2` を `BoneReference1`、`BoneReference2` へ移す |
| Preset | `FKawaiiPhysicsPresetVersion` | `Initial` | 移行処理なし。`Serialize` でバージョンを記録するだけ |
| Wind Preset | なし | なし | CoreRedirects のみ |

Limits の旧プロパティは `SphericalLimitsData`、`CapsuleLimitsData`、`BoxLimitsData`、`PlanarLimitsData` で、`DeprecatedProperty` 付きの `WITH_EDITORONLY_DATA` です。`Sync` は各要素の `Convert()` で `FSphericalLimit` などへ変換します。2つの移行は `PostLoad` の中で順に判定されるため、古いアセットは両方を通ります。Limits の `Serialize` 自体も `WITH_EDITORONLY_DATA` の中にあります。テーパードカプセルの配列には旧形式がありません。

`FModifyBoneConstraintData` の `BoneName1` と `BoneName2` は移行のために UPROPERTY のまま残っています。

### CoreRedirects

プラグインの `Config/DefaultKawaiiPhysics.ini` の `[CoreRedirects]` に `PropertyRedirects` があります。対象は4グループです。

| 対象 | 内容 |
|---|---|
| `KawaiiPhysics_ExternalForce_ProceduralWind` | Procedural Wind のパラメータ名の変更 |
| `KawaiiProceduralWindDynamicParams` | 同じ変更の値と `bOverride...` フラグ |
| `KawaiiProceduralWindPreset` | 同じ変更。プリセットに存在する項目だけ |
| `KawaiiPhysicsEd.AnimGraphNode_KawaiiPhysics` | `bEnableDebugDrawPlanerLimit` から `bEnableDebugDrawPlanarLimit` への綴りの修正 |

ini のコメントに規則が書かれています。旧名はチェーンさせず、最終名へ直接リダイレクトします。次の項目は意図的にリダイレクトしていません。

- `EnvelopeFrequency`：Hz から秒へ単位が変わるため。旧アセットの値は破棄され、既定値へ戻ります。
- `bOverrideEnvelopeFrequency`：フラグだけを移すと既定の Period を強制的に上書きするため。
- `EnvelopeMin`、`EnvelopeMax`、`BreathingMin`、`BreathingMax`：`FFloatInterval` へ統合されたため。

`UKawaiiPhysicsPresetDataAsset::Node` はノードの構造体をそのまま UPROPERTY として保持します。ノードのプロパティ名を変更すると、Blueprint のノードだけでなくプリセットアセットの保存データにも影響します。

## Preset Data Asset

`UKawaiiPhysicsPresetDataAsset` は `FAnimNode_KawaiiPhysics Node` を丸ごと持ちます。ボーン参照を編集するための `Skeleton` と `IBoneReferenceSkeletonProvider`、適用対象を示す `TargetTags` と `bTargetTagsExactMatch` が加わります。Details では `FKawaiiPhysicsPresetDataAssetDetails` が `Links`、`Alpha`、`Performance` のカテゴリを隠し、Find Target Nodes と Apply to Project (Dry Run) のボタンを追加します。

### 適用対象の列挙 {#classification}

適用するプロパティは、`FAnimNode_KawaiiPhysics::StaticStruct()` を `TFieldIterator<FProperty>`（`EFieldIteratorFlags::ExcludeSuper`）で走査して決めます。基底クラスの `Alpha` などは対象になりません。`TransientForceStore` のような非 UPROPERTY のメンバも対象外です。

`ClassifyNodeProperty` が各プロパティを次の順で分類します。

| 判定順 | 条件 | 分類 | 適用 |
|---|---|---|---|
| 1 | `CPF_Transient`、`CPF_EditorOnly`、または `GetDeniedPropertyNames`（`DeltaTime`） | `Deny` | しない |
| 2 | `GetBoneAssignmentPropertyNames`（`RootBone`、`ExcludeBones`、`AdditionalRootBones`） | `BoneAssignment` | `Options.bApplyBoneAssignment` が真のとき |
| 3 | `KawaiiPhysicsTag` | `Tag` | `Options.bApplyTag` が真のとき |
| 4 | `GetCopyTargetPropertyNames` | `CopyTarget` | する |
| 5 | どれにも該当しない | `Unknown` | しない |

`CopyFromNode`、`ApplyToNode`、`MatchesNode` は同じ走査を使います。`CopyNodeProperty` は `CustomExternalForces` だけを `DuplicateCustomExternalForces`（`DuplicateObject`）で複製し、それ以外は `CopyCompleteValue_InContainer` でコピーします。`ExternalForces` は `FInstancedStruct` の配列としてコピーされます。

`CopyFromNode` は `CopyTarget`、`BoneAssignment`、`Tag` をすべてコピーし、ノードのタグが有効なら `TargetTags` へ追加します。既存の `TargetTags` は残ります。

`MatchesNode` は `Identical_InContainer` を `PPF_DeepComparison | PPF_DeepCompareInstances` で呼び、差のあるプロパティ名を返します。Preset Diff と Node Audit の差分はこの結果を元にしています。

`TargetsNodeTag` は `TargetTags` が空なら `false` を返します。Collect 系の API は空のフィルタを全件として扱いますが、コードのコメントのとおり、プリセットでは全ノードを書き換える事故を避けるため、空を対象なしとして扱います。

### ランタイム適用とエディタ適用の違い

`ApplyToNode` の `TargetOuter` が `nullptr` のとき、`ExternalForces` と `CustomExternalForces` はスキップされます。ランタイム API はここへ `nullptr` を渡します。ヘッダのコメントは、この除外の理由を実行時の安全性としています。

| 項目 | `UKawaiiPhysicsLibrary::ApplyPresetDataAsset` | `UKawaiiPhysicsEditorLibrary::ApplyPresetToGraphNode` |
|---|---|---|
| 対象 | 実行中のノード | `UAnimGraphNode_KawaiiPhysics::Node` |
| `TargetOuter` | `nullptr` | Graph Node |
| 外力の2配列 | コピーしない | コピーする。`CustomExternalForces` は Graph Node を Outer に複製する |
| 同期 | `CallAnimNodeFunction` の契約に従う | Game Thread のエディタ操作 |
| Undo | なし | `FScopedTransaction` と `Modify` |
| 適用後の処理 | `RequestModifyBonesReinit` と `RequestSharedCollisionReinit` | Data Asset の参照が変われば `NotifyGraphNodePropertyChanged`。変わらなければ `ModifyBones.Empty`、`ReconstructNode`、Blueprint の変更通知 |
| 永続性 | 実行中のみ | Blueprint に保存される |

`MatchesNode` は `ExternalForces` と `CustomExternalForces` も比較対象に含みます。ランタイム適用はこの2配列をコピーしないため、適用後のノードでも、これらが異なれば差分として報告されます。

ランタイム適用では、`ModifyBones` の再構築が常に要求されるため、揺れの状態も作り直されます。Simple World Collision の再初期化は要求しません。Data Asset の参照は値としてコピーされますが、`XxxLimitsData` への再取り込みは[適用のタイミング](#apply-timing)の表のとおりです。ボーン参照の解決も行いません。

エディタ側の入口は複数あります。`UAnimGraphNode_KawaiiPhysics` のコンテキストメニュー、Preset Diff ウィンドウ、`ApplyPresetToProject` はすべて `ApplyPresetToGraphNode` を通ります。`ApplyPresetToProject` は `FKawaiiPhysicsPresetApplyOptions` の既定値で適用し、`bDryRun` と `bCheckOutFiles` を受け取ります。`AddKawaiiPhysicsNodes` の配置処理は `ApplyToNode` を直接呼び、その後でリクエストの `RootBone` やタグを上書きします。これらの詳細は[エディタツール](/docs/internals/editor-tools)を参照してください。

## Wind Preset Data Asset

`FKawaiiProceduralWindPreset` は `PresetTag`、`PresetName` と11個の風の値を持ちます。`ToDynamicParams` は11項目の `bOverride...` を立てた `FKawaiiProceduralWindDynamicParams` を返します。`WindDirection`、位相、`WindDirectionNoisePeriod`、`TimeScale`、`bIsEnabled` は上書きしません。`KawaiiPhysics.WindPreset.ApplyRoundTrip` がこの範囲を固定しています。

`ResolvePresetParamsByTag` の解決規則は次のとおりです。

1. 無効なタグは失敗します。
2. アセットの `Presets` が空でなければ、そのアセットだけを照合します。見つからなくても組み込みプリセットへは戻りません。
3. アセットが `nullptr` か `Presets` が空なら、`GetDefaultPresets` の3件（`KawaiiPhysics.WindPreset.Breeze`、`Strong`、`Storm`）を照合します。

`FindPresetByTag` は完全一致の最初の要素を返します。重複タグは `IsDataValid` が警告します。

ランタイムでは `ApplyProceduralWindPreset` と `ApplyProceduralWindPresetOnComponent` が解決結果を `RequestDynamicParams` へ渡します。値は `PendingParams` へ入り、次の `PreApply` の `ConsumePendingRequests` で `ApplyDynamicParams` により反映されます。要求の経路は[ランタイム制御と要求キュー](/docs/internals/runtime-control#write-paths)を参照してください。

この経路が保持されるのは、外力が Local で動いている間です。Shared または Auto で Publisher に接続している外力では、`ConsumePendingRequests` の直後に、新しい共有状態があれば `ApplySharedWindState` が値を上書きします。プリセットの11項目はすべて共有される項目なので、同じ `PreApply` の中で置き換わることがあります。`PendingParams` は Publisher へ転送されません。

Wind Scope の適用は別の経路です。`SKawaiiPhysicsWindScopeWindow::ApplyPreset` は `ToDynamicParams` の結果に `bIsEnabled = true` と `TimeScale = 1.0` を加え、Graph Node の外力へ `ApplyDynamicParams` で書きます。コメントのとおり、シミュレーションのリセットを避けるため `PostEditChangeProperty` は呼ばず、実行中の外力へは `PushParamsToLiveRuntime` で同じ値を送ります。一覧は `UKawaiiPhysicsDeveloperSettings::WindScopePresetDataAsset` の `Presets` を使い、空なら組み込みプリセットを使います。

### Shared Publisher からの参照 {#shared-publisher-wind-preset}

`FAnimNode_KawaiiPhysicsSharedPublisher` は `WindPresetDataAsset` と `WindPresetTag` を UPROPERTY として持ちます。`PreUpdate` は、再初期化要求、Publisher Entry の再取得、`SharedGroupTag` の変更、FamilyRoot・Subsystem・SkeletalMeshComponent の変更、`WindPresetDataAsset` の参照または `WindPresetTag` の変更を検出すると、`ApplySharedWindPreset` を呼びます。比較するのは参照とタグだけで、同じアセットの内容の編集は検出しません。

`ApplySharedWindPreset` は Game Thread 専用で、`ResolvePresetParamsByTag` の結果に `bIsEnabled = true` と `TimeScale = 1.0` を加えて `SharedWind` へ適用します。最初の適用の直前に `SharedWind` の値を `SharedWindBeforePreset` へ退避します。アセットを外した場合やタグを解決できなくなった場合は、この値へ戻します。Shared Wind の詳細は[Shared Publisher](/docs/internals/shared-publisher)を参照してください。

## プリセットにプロパティを追加する {#add-property}

`FAnimNode_KawaiiPhysics` へ UPROPERTY を追加するときは、分類表の更新が必須です。分類が `Unknown` のままだと、プリセットの対象外になるだけでなく、`IsNodePropertyAccessible` も `false` を返すため、名前指定の API からも使えません。`KawaiiPhysics.Preset.PropertyClassification` は全プロパティが分類済みであることを確認し、`Unknown` があると失敗します。

手順は次のとおりです。

1. **分類を決めます。** `KawaiiPhysicsPresetDataAsset.cpp` の次のいずれかへ `GET_MEMBER_NAME_CHECKED` で追加します。実行時の状態なら `Transient` にするか `GetDeniedPropertyNames` へ入れます。ボーンの割り当てなら `GetBoneAssignmentPropertyNames`、通常の設定なら `GetCopyTargetPropertyNames` です。
2. **再初期化の要否を決めます。** `KawaiiPhysicsLibrary.cpp` の `GetNodeModifyBonesReinitPropertyNames`、`GetNodeSharedCollisionReinitPropertyNames`、`GetNodeSimpleWorldCollisionReinitPropertyNames` を確認します。これらを使うのは名前指定の API で、Simple World の集合だけは `CopyNodeDataToPreviewNode` も参照します。`ApplyPresetDataAsset` は集合を見ずに固定の要求を出すため、Simple World に関わる項目ではそちらも確認します。
3. **API を通らない変更の検出が必要か決めます。** 必要なら `ShouldReinitModifyBones` の条件と `LastInitialized...` のメンバ、評価ループの記録を追加します。
4. **エディタのプレビューへ同期します。** `UAnimGraphNode_KawaiiPhysics::CopyNodeDataToPreviewNode` はプロパティを手書きで列挙しています。Persona のライブ編集へ反映するならここへ追加します。
5. **実行時に適用してはいけない項目か確認します。** その場合は `ApplyToNode` の `TargetOuter` の判定と、`IsDeniedRuntimeNodePropertyName` の両方へ追加します。
6. **Outer が必要な UObject か確認します。** インスタンス化された UObject を持つ場合は、`CopyNodeProperty` に `CustomExternalForces` と同様の分岐を追加します。
7. **テストを更新します。** `KawaiiPhysicsPresetTest.cpp` の `MakePresetSourceNode` に既定値と異なる値を設定すると、`KawaiiPhysics.Preset.RoundTrip` が全プロパティの走査で検証します。

`MatchesNode`、Preset Diff、Node Audit の差分はプロパティの走査で動くため、個別の修正は要りません。

Wind Preset へ項目を追加するときは、次の箇所を揃えます。

1. `FKawaiiProceduralWindPreset` のメンバと `ToDynamicParams`
2. `MakeWindPreset` の引数と `GetDefaultPresets` の3件
3. Wind Scope の `MakeWindPresetFromCurrentWind`
4. `FKawaiiProceduralWindDynamicParams` に無い項目なら、値と `bOverride...`、`ApplyDynamicParams`、`MergeProceduralWindDynamicParams`、`BuildDynamicParamsSnapshot`、`BuildDynamicParamsForProperty`
5. `KawaiiPhysicsWindPresetTest.cpp` の `GWindPresetParamMappings`

名前を変更するときは、`DefaultKawaiiPhysics.ini` の該当グループへ `PropertyRedirects` を追加します。旧名はチェーンさせず、最終名へ直接向けます。

## 状態とライフサイクル

| イベント | Limits / Bone Constraints | Preset | Wind Preset |
|---|---|---|---|
| `Initialize_AnyThread` | Transient の配列を作り直す | 影響なし（適用済みの値はノードにある） | `ExternalForces` の値はノードにある |
| `ModifyBones` の再構築 | `InitBoneConstraints` が `MergedBoneConstraints` を作り直す | 影響なし | 影響なし |
| `ResetDynamics` | 影響なし | 影響なし | 影響なし |
| アセットの編集 | エディタの評価ループで取り込まれる | 適用済みのノードへは伝わらない | 適用済みのノードへは伝わらない。Shared Publisher も再適用の条件を満たすまで反映しない |

## 他機能との関係

**プロパティアクセス**: `GetCopyTargetPropertyNames` などの分類は、`IsNodePropertyAccessible` の許可リストを兼ねています。分類を変更すると、`SetNode...Property` の可否も変わります。詳細は[ランタイム制御と要求キュー](/docs/internals/runtime-control)を参照してください。

**外力**: ランタイム適用は `ExternalForces` を変更しないため、外力のインデックスと実行中の Procedural Wind の状態は保たれます。一方で、プリセット内の外力設定はランタイムでは反映されません。

**Settings Multiplier**: プリセットが書き換えるのはベースの `PhysicsSettings` です。倍率の項目には影響せず、適用中の倍率はそのまま掛かります。

**Shared Collision**: `bSharedCollisionSource`、`bUseSharedCollision`、`SharedCollisionGroupTag` は `CopyTarget` です。ランタイム適用は値の変化を問わず `RequestSharedCollisionReinit` を要求します。

**Mirror**: `MirrorDataTableForLimits` と `bSkipMirroredBoneWithExistingCollision` は `CopyTarget` ですが、`ApplyMirrorLimits` の実行時期は Limits と同じです。

**ボーンの割り当て**: `FKawaiiPhysicsPresetApplyOptions` の既定値は両方 `false` です。既定では `RootBone`、`ExcludeBones`、`AdditionalRootBones`、`KawaiiPhysicsTag` は上書きされません。`KawaiiPhysics.Preset.ApplyExclusions` がこの動作を確認しています。

## 変更するときの注意

不変条件は次のとおりです。

- `ApplyLimitsDataAsset` の削除は `SourceType == DataAsset` に依存します。アセットへ要素を追加する経路を作るときは `SourceType` を設定します。
- `ApplyMirrorLimits` は `ApplyLimitsDataAsset` と `ApplyPhysicsAsset` の後に呼びます。
- `TargetsNodeTag` の空は対象なしです。Collect 系の API の空と意味が異なります。
- ランタイム適用では `TargetOuter` を `nullptr` にします。`CustomExternalForces` の複製には Outer が必要です。
- カスタムバージョンの列挙値は `VersionPlusOne` の前へ追加します。

| 対象 | テスト |
|---|---|
| コピーと適用 | `KawaiiPhysics.Preset.RoundTrip`、`ApplyExclusions` |
| 分類 | `KawaiiPhysics.Preset.PropertyClassification` |
| タグと比較 | `KawaiiPhysics.Preset.TargetTags`、`Match` |
| Wind Preset | `KawaiiPhysics.WindPreset.ApplyRoundTrip`、`ResolvePresetParamsByTag` |
| 差分表示 | `KawaiiPhysics.Editor.PresetDiffSnapshot.Matches`、`PhysicsSettingsDiff` |
| プロパティアクセス | `KawaiiPhysics.PropertyAccess.DenyList` |

## 関連ページ

- [ランタイム制御と要求キュー](/docs/internals/runtime-control)
- [ローカルコリジョン](/docs/internals/collision)
- [拘束と制限](/docs/internals/constraints-and-limits)
- [Procedural Wind](/docs/internals/procedural-wind)
- [エディタツール](/docs/internals/editor-tools)
- [Data Assets（ユーザー向け）](/docs/features/data-assets)
- [プリセット（ユーザー向け）](/docs/features/settings-presets)
- [Wind Scope（ユーザー向け）](/docs/features/wind-scope)
- [ノード属性とプリセットの API](/docs/api/runtime-properties)
