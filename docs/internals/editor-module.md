---
sidebar_position: 16
title: "エディタモジュール"
description: "KawaiiPhysicsEd の AnimGraph ノード、プレビューとの同期、ビューポートのコリジョン編集、Details、起動時の登録を説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# エディタモジュール

:::note 未リリースの機能を含みます
このページに登場する Shared Publisher ノード、Wind Scope、Preset Diff、Node Audit の各タブは、v1.22 で予定している未リリースの機能です。
:::

このページはモジュールの中核を扱います。Wind Scope、Node Audit、Preset Diff、`UKawaiiPhysicsEditorLibrary` の設計は[エディタツール](/docs/internals/editor-tools)を参照してください。

## このページの要点

**概要**

`KawaiiPhysicsEd` は、AnimGraph 上のノード、Persona プレビューへの値の同期、ビューポートでのコリジョン編集、Details のカスタマイズを担当するモジュールです。`UncookedOnly` のモジュールで、パッケージ版には含まれません。

**設計**

2つのモジュールの依存は `KawaiiPhysicsEd` から `KawaiiPhysics` への一方向です。ただし `KawaiiPhysics` も、エディタ向けビルドでは `UnrealEd` を参照します。同じ設定は、アセットに保存するグラフノード、Persona のプレビューのノード、PIE などのデバッグ対象のノードの3箇所に存在します。Details はグラフノードを編集し、プレビューへは `CopyNodeDataToPreviewNode` が値をコピーします。Edit Mode とこのコピーはロックなしで直接書き込み、実行中の ProceduralWind へ送る値は Mutex の内側に要求として積みます。

**理解のポイント**

- コードを読むときは、3つのノードのどれを読み書きしているかを確認します。Edit Mode の描画は実行中のノードを読み、Gizmo の編集はグラフノードと実行中のノードへ書き、Data Asset 由来の要素はアセットへも書き戻します。
- 編集の種類で、シミュレーションへの影響が変わります。Details の編集は `ModifyBones` を空にしてボーンの状態を初期化し、Gizmo の操作は初期化しません。
- プレビューへのコピーは、対象のプロパティを手書きで列挙しています。ノードへプロパティを追加するときの接点で、PIE の実行中ノードへは別の経路で ProceduralWind の編集だけが届きます。
- `bEditing` と Edit Mode は別の概念です。`bEditing` はワールド種別で決まる値で、Edit Mode に入ったかどうかとは関係ありません。

## 関連ファイル

| ファイル | 役割 |
|---|---|
| [`Public/AnimGraphNode_KawaiiPhysics.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Public/AnimGraphNode_KawaiiPhysics.h) / [`.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/AnimGraphNode_KawaiiPhysics.cpp) | KawaiiPhysics ノードのグラフ側。コンパイル検証、Details、プレビュー同期、Data Asset の書き出し |
| [`Public/KawaiiPhysicsEditMode.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Public/KawaiiPhysicsEditMode.h) / [`.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/KawaiiPhysicsEditMode.cpp) | ビューポートの描画、コリジョンの選択、Gizmo による編集 |
| [`Public/AnimGraphNode_KawaiiPhysicsSharedPublisher.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Public/AnimGraphNode_KawaiiPhysicsSharedPublisher.h) / [`.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/AnimGraphNode_KawaiiPhysicsSharedPublisher.cpp) | Shared Publisher ノードのグラフ側 |
| [`Private/KawaiiPhysicsEd.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/KawaiiPhysicsEd.cpp) | モジュールの起動と終了 |
| [`Private/KawaiiPhysicsEditorCategoryNames.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/KawaiiPhysicsEditorCategoryNames.h) | Details のカテゴリ名、並び順、フィルタグループ |
| [`Private/KawaiiPhysicsEdUtils.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/KawaiiPhysicsEdUtils.h) | 実行中ノードの解決、グラフ走査、外力の形状比較 |
| [`Private/KawaiiPhysicsEditorTabFactories.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/KawaiiPhysicsEditorTabFactories.cpp) / [`KawaiiPhysicsEdWindowUtils.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/KawaiiPhysicsEdWindowUtils.cpp) | ドッキング可能なタブの登録と呼び出し |
| [`Private/KawaiiPhysicsEdStyle.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/KawaiiPhysicsEdStyle.cpp) | タブアイコンの Slate スタイル |
| [`Private/KawaiiPhysicsPerAxisLimitAngleCustomization.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/KawaiiPhysicsPerAxisLimitAngleCustomization.cpp) | 軸別角度制限の Details 表示 |
| [`Public/KawaiiPhysicsEditorSettings.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Public/KawaiiPhysicsEditorSettings.h) | Edit Mode の描画スタイル |

## UncookedOnly モジュールであること

`KawaiiPhysics.uplugin` での `KawaiiPhysicsEd` の種別は `UncookedOnly`、`LoadingPhase` は `PreDefault`、`PlatformAllowList` は Win64 / Mac / Linux です。`UncookedOnly` はクック済みデータを使わない実行形態でだけ読み込まれる種別で、パッケージ版には含まれません。

読み込まれる先はエディタの UI が動く環境に限りません。このモジュール自身が `UKawaiiPhysicsAuditCommandlet` を持つように、コマンドレットでも動きます。そのため `StartupModule` は Edit Mode と Property カスタマイズを無条件に登録し、Sequencer と Slate に触る処理だけを `GIsEditor && !IsRunningCommandlet()` の内側に置いています。

[`KawaiiPhysicsEd.Build.cs`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/KawaiiPhysicsEd.Build.cs) はエンジンバージョンで次の分岐を持ちます。

| 条件 | 内容 |
|---|---|
| UE 5.5 以上 | `KAWAII_PHYSICS_MCP_COMMENT_NODE_SUPPORTED=1`。未満は `0` |
| UE 5.1 以上 | `AnimationEditMode` に依存 |
| UE 5.4 以下 | `StructUtils` に依存 |

`UKawaiiPhysicsMcpCommentNode` は UHT が `UCLASS` の任意の `#if` 囲みを受け付けないため、宣言は常に残します。5.5 未満では `.cpp` が `gen.cpp` を含めず、使用箇所も `#if` で消すことで休眠させます。

## 設計の要点

### 3つのノードの関係

同じ設定が3箇所に存在します。

| 場所 | 型 | 寿命と用途 |
|---|---|---|
| `UAnimGraphNode_KawaiiPhysics::Node` | `FAnimNode_KawaiiPhysics` | アセットに保存される編集用の値。Details が編集するのはこれです |
| プレビューの AnimInstance のノード | `FAnimNode_KawaiiPhysics` | Persona のプレビューで実際に評価されるノード |
| デバッグ対象の AnimInstance のノード | `FAnimNode_KawaiiPhysics` | PIE などのデバッグ対象で評価されるノード |

エディタ側のコードで実行中のノードを得る経路は2つあります。`FKawaiiPhysicsEditMode` は `EnterMode` の引数として受け取った `InRuntimeNode` を `RuntimeNode` に保持します。Details や Wind Scope は `KawaiiPhysicsEdUtils::ResolveLiveAnimNode` を使い、AnimBlueprint の `GetObjectBeingDebugged()` が `UAnimInstance` のときだけ `GetDebuggedAnimNode` で取得します。

<DocFigure src="/img/generated/internals-editor-nodes-ja.svg" alt="グラフノード、プレビューノード、デバッグ対象ノードを分け、プレビュー同期、ProceduralWind の要求、Edit Mode の実行中ノード参照、Data Asset との編集経路を示す図" caption="上段の3つのノードを起点に、プレビューへのコピー、デバッグ対象への風の要求、下段の Edit Mode と Data Asset の編集経路をたどります。" maxWidth={960} />

### スレッドの境界

`FKawaiiPhysicsEditMode` はエディタの入力処理の中で、`RuntimeNode` のコリジョン配列をロックなしで直接書き換えます。`CopyNodeDataToPreviewNode` もプレビューのノードへ直接代入します。実行中の ProceduralWind へ送る値はこの経路を使わず、`RequestDynamicParams` で `RuntimeState` の Mutex の内側に `PendingParams` として積みます。

### bEditing と Edit Mode は別の概念

`bEditing` は `FAnimNode_KawaiiPhysics` のメンバで、Edit Mode に入ったかどうかとは無関係です。`OnInitializeAnimInstance` がワールド種別を見て、`EWorldType::Editor` または `EWorldType::EditorPreview` のときに `true` にします。PIE では `false` のままです。

用途は1つで、`EvaluateSkeletalControl_AnyThread` の物理設定更新の後に `bInitPhysicsSettings = true` とする処理を止めます。`ShouldUpdatePhysicsSettings` は `!bInitPhysicsSettings` を見るため、プレビューでは `bUpdatePhysicsSettingsInGame` が `false` でも毎評価 `UpdatePhysicsSettingsOfModifyBones` が走ります。

同じくエディタ専用の処理として、`EvaluateSkeletalControl_AnyThread` の `#if WITH_EDITOR` ブロックは毎評価 `ApplyLimitsDataAsset`、`ApplyPhysicsAsset`、`ApplyMirrorLimits`、`ApplyBoneConstraintDataAsset` を実行します。PIE 中でなければ `InitializeBoneReferences` も実行します。Data Asset の編集がコンパイルなしでプレビューに反映されるのはこのためです。

## プレビューとの同期

Details でプロパティを変更すると、グラフノードでは次の処理が走ります。

1. `PostEditChangeChainProperty` が基底の処理を先に通します。コードのコメントによると、基底の処理が `PostEditChangeProperty` を呼びます。`PostEditChangeProperty` は `EnsureUniqueCollisionGuids`、`Node.ModifyBones.Empty()`、`ReconstructNode` を実行します。
2. 続けて `PushProceduralWindEditToLiveInstance` を呼びます。

プレビューのノードへ値を届けるのは `CopyNodeDataToPreviewNode` です。`UAnimGraphNode_Base` の仮想関数で、コード中のコメントのとおりライブ編集のために値をプレビューのインスタンスへ押し込みます。呼び出し元はエンジン側です。

コピーするプロパティは、この関数の中に1つずつ手書きで列挙されています。差分の判定（`IsAnimNodePropertyDifferent`）と `ExternalForces` のコピーには、`FProperty` と `UScriptStruct` の API を使います。大半は単純な代入で、次の項目だけ扱いが異なります。

| 対象 | 処理 |
|---|---|
| `bSharedCollisionSource`、`bUseSharedCollision`、`SharedCollisionGroupTag` | 差分があれば代入の前に `RequestSharedCollisionReinit` を呼ぶ |
| `bUseSimpleWorldCollision`、`SimpleWorldCollisionSource`、`SimpleWorldCollisionSharedTag` | `DoesNodePropertyRequireSimpleWorldCollisionReinit` が true かつ差分があれば `RequestSimpleWorldCollisionReinit` を呼ぶ |
| `ExternalForces` | 形状が同じなら要素ごとに `CopyScriptStruct` で既存メモリへコピーする。違えば配列ごと代入する |
| `ModifyBones` | 最後に `Empty()` する |

`ExternalForces` を丸ごと代入すると `FInstancedStruct` が作り直され、ProceduralWind の `RuntimeState`（シミュレーション時刻、gust、Pending 要求）が失われます。`IsExternalForceShapeMatched` は要素数と各インデックスの型だけを比較し、一致している間は既存メモリへのコピーで実行中の状態を保ちます。要素の追加や削除、いずれかのインデックスの型が変わる変更ではフルリセットになります。同じ型の要素同士の並べ替えは一致と判定されるので、`RuntimeState` はインデックスの位置に残ります。

一方で `ModifyBones` は毎回空になるため、ボーンのシミュレーション状態は Details の編集ごとに初期化されます。次の評価で `ModifyBones.Num() == 0` の分岐に入り、`InitModifyBones` から作り直されます。

この関数がコピーしない `UPROPERTY` もあります。`WarmUpFrames`、`bUseWarmUpWhenResetDynamics`、`bNeedWarmUp`、`TeleportDistanceThreshold`、`TeleportRotationThreshold`、`SkelCompMoveScale`、`KawaiiPhysicsTag`、World Collision の `bAllowWorldCollision`、`bOverrideCollisionParams`、`CollisionChannelSettings`、`bIgnoreSelfComponent`、`IgnoreBones`、`IgnoreBoneNamePrefix` です。

### PIE への反映

`CopyNodeDataToPreviewNode` はプレビュー用の経路です。PIE で動いているノードには `PushProceduralWindEditToLiveInstance` が値を届けます。対象は ProceduralWind の編集だけです。

1. `IsProceduralWindExternalForcesEdit` で編集が `ExternalForces` 配下か判定します。
2. `ResolveLiveKawaiiPhysicsNode` で実行中ノードを解決し、`IsExternalForceShapeMatched` で形状が同じことを確認します。
3. `BuildProceduralWindDynamicParamsForProperty` が編集されたプロパティだけの `FKawaiiProceduralWindDynamicParams` を作ります。
4. `RequestDynamicParams` で実行中の ProceduralWind へ送ります。

3 で失敗した場合、ProceduralWind のメンバなら何も送りません。スナップショットを送ると、編集値を含まないまま PIE 側の対応済み項目を上書きしてしまうためです。ProceduralWind のメンバでない場合は `BuildDynamicParamsSnapshot` を送ります。配列インデックスを特定できない編集では、ほかの外力の型のプロパティでなければ全 ProceduralWind へ送ります。Persona では `CopyNodeDataToPreviewNode` と二重になりますが、同じ値です。

## Pin の扱い

`UAnimGraphNode_KawaiiPhysics` は Pin を操作するコードを持たず、基底クラスの仕組みに任せています。どのプロパティを Pin にできるかは `AnimNode_KawaiiPhysics.h` の `meta = (PinHiddenByDefault)` で決まります。`RootBone`、`ExcludeBones`、コリジョンの各配列、`BoneConstraints`、`SyncBones`、`ExternalForces`、`TargetFramerate` にはこのメタデータがありません。

`KawaiiPhysics.EditorScripting.Placement.LimitsDataAssetPinHidden` は `PinHiddenByDefault` の `LimitsDataAsset` を例に、この動作を確認しています。プリセットから配置したノードで `FindPin` が null を返し、`ShowPinForProperties` の項目が `bShowPin == false` であることを検査します。

`CopyNodeDataToPreviewNode` は Pin の接続を見ずに `Node` の値をコピーします。`BoneSubdivisionCount`、`BoneConstraintSubdivisionCount`、`bBoneSubdivisionDensifyByRadius`、`DummyBoneLength` の変更は、変更元によらずランタイム側の `ShouldReinitModifyBones` が検出します。`PhysicsSettings.Radius` を比較するのは `bBoneSubdivisionDensifyByRadius` が true のときだけで、`RadiusCurveData` や Settings Multiplier による半径の変化は比較の対象ではありません。

## コンパイル時の検証

`ValidateAnimNodePostCompile` は基底の処理の後に `Node.RootBone.Initialize(CompiledClass->TargetSkeleton)` を実行し、結果に応じて警告を出します。

| 条件 | メッセージ |
|---|---|
| `RootBone` が解決でき、`ExcludeBones` に含まれる | `@@ ExcludeBones should NOT has RootBone.` |
| `RootBone` が解決できず、`TargetSkeleton` がある | `@@ RootBone is empty.` |

`TargetSkeleton` が無い場合はテンプレート ABP として警告を出しません。どちらも Warning で、コンパイルは失敗しません。`AdditionalRootBones` などほかのプロパティはここでは検証しません。

ノードのシリアライズのバージョンは `FKawaiiPhysicsVersion`（カスタムバージョン名 `Kawaii-Phys`）で、`Serialize` はこのバージョンの登録だけを行います。

コリジョンの `Guid` は Edit Mode の削除対象の特定に使うため、`EnsureUniqueCollisionGuids` が `PostLoad` と `PostEditChangeProperty` の両方で重複を振り直します。複製や貼り付けで同じ `Guid` がコピーされうるためです。`UKawaiiPhysicsLimitsDataAsset` にも同名の処理があります。

## Details のカスタマイズ

`CustomizeDetails` の処理順は次のとおりです。

1. `ReadKawaiiPhysicsCategoryFilter` で保存されたフィルタを読みます。
2. `CustomizeDetailTools` が書き出しとプリセットのボタン、カテゴリフィルタを作ります。
3. `CustomizeDetailDebugVisualizations` がデバッグ描画の切り替えボタンを作ります。
4. `bUseSimpleWorldCollision`、`SimpleWorldCollisionSource`、`ExternalForces` の変更で `ForceRefreshDetails` する Delegate を登録します。`ExternalForces` は `Interactive` の変更を無視し、`WindSource`、`SharedWindTag`、配列の増減でだけ再構築します。
5. Shared Publisher を読む設定なら Go to Publisher の行を追加します。
6. External Force カテゴリに Wind Scope のボタンを追加します。
7. `HideCategoriesOutsideFilter` でフィルタ外のカテゴリを隠します。
8. `SortCategories` で並び順と表示名を固定します。

デバッグ描画のフラグ（`bEnableDebugDrawBone` など）は `FAnimNode_KawaiiPhysics` に含まれず、`UAnimGraphNode_KawaiiPhysics` の `UPROPERTY()` です。Edit Mode はこのフラグを `GraphNode` から読みます。

### カテゴリ名の管理

`KawaiiPhysicsEditorCategoryNames.h` は、`AnimNode_KawaiiPhysics.h` の `Category` 文字列と同じ綴りの `FName` 定数を持ちます。`Bones|Bone Subdivision` のように `|` 区切りの文字列も定数にします。

| 関数 | 用途 |
|---|---|
| `GetCategorySortOrderNames` | KawaiiPhysics ノードの並び順 |
| `GetFilterGroups` | フィルタのグループと所属カテゴリ。Bones、Physics、Collision、Force の4つ |
| `GetFilterAdditionalHiddenNames` | フィルタ中に隠すエンジン側のカテゴリ（`Performance`、`Bindings`、`PinOptions`） |
| `GetSharedPublisherCategorySortOrderNames` | Shared Publisher ノードの並び順 |

`SortCategories` のコールバックは並び順に加えて表示名も設定します。エンジンの `FAnimGraphNodeDetails::CustomizeDetails` が `UAnimGraphNode::CustomizeDetails` の後に `EditCategory` を表示名なしで呼び、表示名を既定へ戻すためです。`Bones > Bone Subdivision` のような表示名は、後段で実行されるこのコールバックの中で適用します。並び順を固定するのは、編集したカテゴリが自動で上に移動するためです。

フィルタの選択は `GEditorPerProjectIni` の `[KawaiiPhysicsEd]` セクション、キー `NodeDetailsCategoryFilter` に保存します。

### Data Asset への書き出し

Kawaii Physics Tools カテゴリのボタンは、ノードの private 関数を呼びます。

| ボタン | 関数 | 内容 |
|---|---|---|
| Export Collision | `ExportLimitsDataAsset` | 5種類のコリジョン配列をコピーし、`SourceType` を `DataAsset` に変更 |
| Export BoneConstraints | `ExportBoneConstraintsDataAsset` | `BoneConstraints` を `BoneConstraintsData` へ変換 |
| Export Preset | `ExportPresetDataAsset` | `CopyFromNode` で丸ごとコピー |
| Apply Preset | `ApplyPresetDataAsset` | `UKawaiiPhysicsEditorLibrary::ApplyPresetToGraphNode` を呼ぶ |
| Check Preset Diff | `CheckPresetDiff` | Preset Diff タブを開く |

`ApplyPresetDataAsset` は `bApplyBoneAssignment = false` でボーン割り当てを維持し、`bApplyTag` はノードのタグが未設定でプリセットのタグが有効なときだけ true にします。Skeleton の不一致やタグの不一致は適用を止めません。通知を `CS_Fail` の見た目にして見落としを防ぎます。

軸別角度制限の `FKawaiiPhysicsPerAxisLimitAngleCustomization` は、親のハンドルを `PerAxisLimitAngle`、`PhysicsSettings`、ノードの順にたどって `BoneForwardAxis` を見つけ、ひねり軸の行を無効にします。Lock と Free のボタンは `FScopedTransaction` の中で Min と Max を設定します。

## FKawaiiPhysicsEditMode

### 寿命

`FEditorModeRegistry` にモード名 `AnimGraph.SkeletalControl.KawaiiPhysics` で登録し、`UAnimGraphNode_KawaiiPhysics::GetEditorMode` が同じ文字列を返します。

`EnterMode` は次を行います。

1. `RuntimeNode` と `GraphNode` を保持します。
2. `RuntimeNode` の `SphericalLimitsData` など5種類の `*LimitsData`、`BoneConstraintsData`、`MergedBoneConstraints`、`SyncBones` を `GraphNode->Node` へコピーします。Details に表示するためです。
3. `OnNodePropertyChanged` と、`LimitsDataAsset` があれば `OnLimitsChanged` へ購読します。購読先のアセットは `BoundLimitsDataAsset` に保持します。
4. `PhAT_ElemSelectedMaterial` から、コリジョンの種類5つと由来4つの組み合わせごとに `UMaterialInstanceDynamic` を作ります。

`ExitMode` は購読を解除し、ポインタとマテリアルを破棄します。`LimitsDataAsset` が差し替えられた場合は、`OnExternalNodePropertyChange` が旧アセットの購読を外して新アセットへ付け直します。`CollisionMaterials` は `AddReferencedObjects` で GC から保護します。

### 描画

`Render` は `FAnimWeight::IsRelevant(RuntimeNode->GetAlpha())` と `RuntimeNode->IsRecentlyEvaluated()` が真のときだけ描画します。`IsRecentlyEvaluated` は `LastEvaluatedTime` から 0.1 秒未満かを見ます。偽のとき、`DrawHUD` は `This node does not evaluate recently.` を表示します。

描画はすべて `RuntimeNode` の値を読みます。`RenderLimitsPerSource` はノード直下の配列と `*LimitsData` 配列を順に描き、由来ごとのマテリアルを使い分けます。

| 由来（`ECollisionSourceType`） | 配列 | クリック | 編集 |
|---|---|---|---|
| `AnimNode` | `SphericalLimits` など | 可 | ノードへ書く |
| `DataAsset` | `SphericalLimitsData` など | 可 | ノードとアセットへ書く |
| `PhysicsAsset` | `SphericalLimitsData` など | 不可 | なし |
| `Mirror` | `SphericalLimitsData` など | 不可 | なし |

`bUseHit` が false の形状には `HKawaiiPhysicsHitProxy` を設定しません。`Do*` 関数も `Mirror` 由来を明示的に弾きます。ヒットテストでは、`GetCollisionMaterialProxy` が `PhysicsAsset` 以外に対して色の設定と無関係なマテリアルを返すため、不透明度 0 でもクリックで選択できます。

コリジョンの `Location` はシミュレーション空間の値です。描画は `SimulationSpace == BaseBoneSpace` のときに `GetBaseBoneSpace2ComponentSpace` で変換します。テーパードカプセルは solver と同じ断面から独自のメッシュを組み、`FKTaperedCapsuleElem` の描画は使いません。側面が solver より太く見えるためです。角度制限はシミュレーション後の方向でなくポーズの方向へ描きます。制限がポーズ方向を基準に判定されるためです。

### 選択と Gizmo

`HandleClick` は Hit Proxy から `SelectCollisionType`、`SelectCollisionIndex`、`SelectCollisionSourceType` を読み、選択時点の `Guid` を `SelectedCollisionGuid` に保存します。Hit Proxy 以外のクリックで選択を解除します。

`ShouldDrawWidget` は `IsValidSelectCollision` の結果を返します。`GetWidgetLocation` は選択中のコリジョンの `Location` を返し、`GetCustomDrawingCoordinateSystem` はその `Rotation` を返します。キー入力は Space で移動、回転、スケールを切り替え、Q でローカルとワールドを切り替えます。

### 編集の書き込み先

`GetSelectCollisionLimitRuntime` と `GetSelectCollisionLimitGraph` が、同じ選択に対応する2つの要素を返します。どちらも `SelectCollisionIndex` で配列から要素を引きます。`SelectedCollisionGuid` を使うのは削除だけです。`Do*` 関数は両方へ書き、`DataAsset` 由来ならアセットへも書きます。

`DoTranslation` は、`DrivingBone` が解決できていれば `ConvertCSVectorToBoneSpace` でボーン空間へ変換してから `OffsetLocation` に加えます。`DoRotation` は `OffsetRotation` へ合成します。どちらも `Location` と `Rotation` を直接書きません。それらは次の評価の `UpdateSphericalLimits` などが `DrivingBone` から計算し直します。

`DoScale` の入力の解釈は形状ごとに異なります。

| 形状 | スケールの反映先 |
|---|---|
| 球 | `Radius` に X、Y、Z の和を加算 |
| カプセル | `Radius` に X、Y を加算。`Length` に Z を加算 |
| テーパードカプセル | `Radius0` に X、`Radius1` に Y、`Length` に Z を加算 |
| ボックス | `Extent` に加算 |
| 平面 | 何もしない |

値は 0 未満にならないよう丸めます。`Do*` 関数自身は `FScopedTransaction` を開かず、`Modify()` も呼びません。

### Data Asset への書き戻し

`DataAsset` 由来の要素は `RuntimeNode->SphericalLimitsData` などのコピーです。このコピーへの書き込みは、次の評価の `ApplyLimitsDataAsset` が `SourceType == DataAsset` の要素を削除して追加し直すときに消えます。そのため `Do*` 関数は、書き込みの後に `UKawaiiPhysicsLimitsDataAsset::UpdateLimit` を呼びます。

`UpdateLimit` は `Limit->Type` で配列を選び、`Guid` が一致する要素を丸ごと置き換えて `MarkPackageDirty` します。アセットを Details で編集した場合は逆方向の経路で、`PostEditChangeChainProperty` が `OnLimitsChanged` を Broadcast し、`OnLimitDataAssetPropertyChange` がランタイムの `*LimitsData` をグラフノードへコピーします。

### 削除

Delete キーは `AnimNode` と `DataAsset` 由来で有効です。`FScopedTransaction` を開き、対象に `Modify()` を呼んでから削除します。

削除対象は `ResolveIndex` で決めます。クリック時の `SelectCollisionIndex` がまだ `SelectedCollisionGuid` の要素を指していればそれを使い、ずれていれば `Guid` で引き直します。`DataAsset` 由来では、`SelectCollisionIndex` がマージ済みの配列上の位置でアセットの配列の位置と異なるため、アセットの配列は常に `Guid` で検索します。削除の後は選択を解除します。

## Shared Publisher ノード

`UAnimGraphNode_KawaiiPhysicsSharedPublisher` は `UAnimGraphNode_SkeletalControlBase` でなく `UAnimGraphNode_Base` を継承します。カテゴリは `Animation|Skeletal Controls` です。

`ValidateAnimNodeDuringCompilation` は次のメッセージを出します。

| 条件 | 種類 |
|---|---|
| `SharedGroupTag` が未設定 | Warning |
| Simple World Collision と Shared Wind の両方が無効 | Note |
| 同じ AnimBlueprint に同じ Tag の Publisher が2つ以上ある | Warning |
| 同じ AnimBlueprint に読む側のノードが無い | Note |

読む側の判定は `KawaiiPhysicsEdUtils::FindKawaiiPhysicsConsumerGraphNodes` です。Simple World Collision の `Shared` / `Auto` と、ProceduralWind の `Shared` / `Auto` の両方を見ます。別の AnimBlueprint の読み手は検出できないので、Warning でなく Note にしています。

`CopyNodeDataToPreviewNode` は、`SharedGroupTag`、`SimpleWorldCollision` の `GatherScope`、`bGatherFamilyMembers`、`bEnabled`、`WindPresetDataAsset`、`WindPresetTag` に差分があれば再初期化を要求します。`SimpleWorldCollision` のほかの項目は代入されるだけで、再初期化の判定には使いません。`WindPresetDataAsset` が設定されている場合は無条件に `ResetSharedWindPresetSnapshot` の後で `RequestSharedPublisherReinit` を呼びます。`SharedWind` を丸ごと同期するとプリセットの値が消えるため、退避値を捨てて適用し直すためです。再初期化は `SharedWind.RuntimeState` に触らないので、位相と突風は保たれます。

Details の `HideIgnoredSharedWindProperties` は、Publisher で使わない `Seed` や `*PhaseOffset` などの行を隠します。Preview Status の行は `ResolveLiveSharedPublisherNode` を読み、公開中の Tag、`GetPublishSerial`、Simple World Collision の Entry の読み手の数（`GetNumReaders`）を表示します。

## 起動時の登録

`StartupModule` の処理順は次のとおりです。

1. `FEditorModeRegistry` に Edit Mode を登録します。
2. `PropertyEditor` に `KawaiiPhysicsPresetDataAsset` のクラスレイアウトと `KawaiiPhysicsPerAxisLimitAngle` の型レイアウトを登録します。
3. `GIsEditor && !IsRunningCommandlet()` なら、Sequencer のトラックエディタを登録します。
4. 同じ条件の中で、Slate が初期化済みなら `RegisterTabSpawners` を呼びます。未初期化なら PostEngineInit の Delegate へ登録します。UE 5.8 以上では `FCoreDelegates::GetOnPostEngineInit()` を使います。

`RegisterTabSpawners` はスタイルを初期化し、`FPersonaModule::OnRegisterTabs` へ `HandleRegisterPersonaTabs` を登録し、Node Audit のグローバルタブを登録します。

`ShutdownModule` は最初に3種類のタブをすべて閉じ、その後で登録を逆順に解除します。

### ドッキング可能なタブ

`HandleRegisterPersonaTabs` は `GetToolkitFName()` が `AnimationBlueprintEditor` のエディタにだけ、`FKawaiiPhysicsWindScopeTabFactory`、`FKawaiiPhysicsPresetDiffTabFactory`、`FKawaiiPhysicsNodeAuditTabFactory` を登録します。タブは AnimBlueprint エディタごとに存在し、Window メニューに表示されます。

| タブ ID | ファクトリ | グローバル登録 |
|---|---|---|
| `KawaiiPhysicsWindScope` | `FKawaiiPhysicsWindScopeTabFactory` | なし |
| `KawaiiPhysicsPresetDiff` | `FKawaiiPhysicsPresetDiffTabFactory` | なし |
| `KawaiiPhysicsNodeAudit` | `FKawaiiPhysicsNodeAuditTabFactory` | あり（`ETabSpawnerMenuType::Hidden`） |

Node Audit だけがグローバルの Nomad タブも持ちます。プリセットの Data Asset の Details は AnimBlueprint エディタの外で開くためです。

`FKawaiiPhysicsTabFactoryBase::RegisterTabSpawner` は、基底の `FWorkflowTabFactory::RegisterTabSpawner` に Mode として `nullptr` を渡します。Mode を渡すとモードカテゴリの直下にも親付けされ、二重に表示されるためです。代わりに `FindOrAddKawaiiPhysicsMenuGroup` で作った Kawaii Physics グループへ入れます。モードの切り替えで再登録されるので、`RemoveStaleSpawnerChildren` が同じタブ ID の古い項目を先に消します。

ファクトリの `SpawnTab` は、ウィジェットへ `SetOwnerTab` で親タブを渡します。`CloseAllWindows` はこの参照を使ってタブを閉じます。

### スタイル

`FKawaiiPhysicsEdStyle` はスタイルセット `KawaiiPhysicsEdStyle` に `KawaiiPhysics.TabIcon` を1つだけ登録します。画像はプラグインの `Resources/Icon128.png` を 16x16 で表示します。`Initialize` は `RegisterTabSpawners` から呼ばれるので、コマンドレットではスタイルセットが存在しません。`Shutdown` は `ensure(StyleSet.IsUnique())` で参照が残っていないことを確認します。

`UKawaiiPhysicsEditorSettings` は Editor Preferences の Plugins カテゴリに表示され、`EditorPerProjectUserSettings` にユーザーごとに保存されます。コリジョンの色のアルファが不透明度になります。

## 状態とライフサイクル

| 操作 | グラフノード | 実行中ノード |
|---|---|---|
| Details の編集 | 値を更新し `ModifyBones` を空にする | `ModifyBones` を空にし、次の評価で再構築。ProceduralWind の `RuntimeState` は形状が同じなら維持 |
| Gizmo の操作 | `Offset*` や半径を更新 | 同じ値を更新。`ModifyBones` は維持 |
| Delete キー | 配列から削除 | 配列から削除。`ModifyBones` は維持 |
| Data Asset の Details 編集 | `OnLimitsChanged` で `*LimitsData` を更新 | 次の評価の `ApplyLimitsDataAsset` で更新 |
| Edit Mode の開始 | ランタイムの値を `*LimitsData` などへコピー | 変更なし |
| ロード | `PostLoad` で `Guid` を一意化 | 変更なし |

## 他機能との関係

- **シミュレーション**: Details の編集は `ModifyBones` を空にするので、揺れの確認中に値を変えるとボーンの状態が初期化されます。Gizmo の操作は初期化しません。
- **Procedural Wind**: `CopyNodeDataToPreviewNode` の in-place コピーは、`FKawaiiPhysics_ExternalForce_ProceduralWind::operator=` が代入先の `RuntimeState` を保持することに依存します。
- **Shared Collision / Simple World Collision**: プレビューの再初期化は `CopyNodeDataToPreviewNode` の差分検出に依存します。ランタイムの再初期化要求の仕組みは [Subsystem と Shared Collision](/docs/internals/shared-collision) と [Simple World Collision](/docs/internals/simple-world-collision) を参照してください。
- **プリセット**: `UKawaiiPhysicsPresetDataAsset` のプロパティ分類は反射でプロパティを走査するのに対し、`CopyNodeDataToPreviewNode` はコピー対象を手書きで列挙します。プロパティを追加すると、それぞれ別の対応が必要です。
- **Sequencer**: `FKawaiiPhysicsSettingsMultiplierTrackEditor` の登録はこのモジュールが行います。動作は[アニメーション連携](/docs/internals/animation-control)を参照してください。

## 変更するときの注意

- `FAnimNode_KawaiiPhysics` にプロパティを追加したら、`CopyNodeDataToPreviewNode` と `UKawaiiPhysicsPresetDataAsset` の分類の両方に追加します。分類は `KawaiiPhysics.Preset.PropertyClassification` が検出しますが、`CopyNodeDataToPreviewNode` の漏れを検出するテストはありません。
- 新しい `Category` を追加したら `KawaiiPhysicsEditorCategoryNames.h` の並び順とフィルタグループにも追加します。定数が実在のカテゴリと一致することは `KawaiiPhysics.Editor.CategoryConsistency` が確認します。Publisher 側は `KawaiiPhysics.Editor.SharedPublisher.CategoryConsistency` です。
- コリジョンの形状を追加する場合、`FKawaiiPhysicsEditMode` は `IsValidSelectCollision`、`GetSelectCollisionLimitRuntime`、`GetSelectCollisionLimitGraph`、`DoScale`、`InputKey`、`DrawHUD` の switch と `EnterMode` のマテリアルの列挙を直します。`EnsureUniqueCollisionGuids` と `ExportLimitsDataAsset` と `UpdateLimit` も対象です。
- `Do*` 関数でノードだけを更新して Data Asset へ書き戻さないと、値が次の評価で消えます。
- `ExternalForces` を丸ごと代入する経路を増やすと、ProceduralWind の時刻と突風が失われます。
- `IsSharedWindPublisherParameter` の13項目は、Publisher が配る項目と一致している必要があります。
- タブを追加したら、ファクトリの登録に加えて `ShutdownModule` の `CloseAllWindows` を追加します。登録の構造は `KawaiiPhysics.Editor.DockableTabs.Spawners` と `KawaiiPhysics.Editor.DockableTabs.MenuGroupRegistration` が確認します。

## 関連ページ

- [エディタツール](/docs/internals/editor-tools)
- [テスト](/docs/internals/testing)
- [ノードのライフサイクルと1フレームの処理順](/docs/internals/frame-lifecycle)
- [ローカルコリジョン](/docs/internals/collision)
- [Data Asset とプリセット](/docs/internals/presets-and-data-assets)
- [Shared Publisher](/docs/internals/shared-publisher)
- [Data Asset の使い方](/docs/features/data-assets)
- [コリジョンの設定](/docs/features/collision-setup)
