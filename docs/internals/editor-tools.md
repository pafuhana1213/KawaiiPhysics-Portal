---
sidebar_position: 17
title: "エディタツール"
description: "Wind Scope、Node Audit、Preset Diff、UKawaiiPhysicsEditorLibrary、KawaiiPhysicsToolset の設計と、各ツールがノードの情報を読む経路を説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# エディタツール

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

このページは各ツールの構成と、ノードの情報をどの経路で読み書きするかを説明します。タブの登録やプレビューとの同期は[エディタモジュール](/docs/internals/editor-module)を参照してください。

## このページの要点

**概要**

KawaiiPhysics のエディタツールは、ノードの設定の確認、比較、一括変更を担当します。Wind Scope は風の波形の表示と編集、Preset Diff はプリセットとの差分、Node Audit はプロジェクトのノードの一覧を扱います。`UKawaiiPhysicsEditorLibrary` と `KawaiiPhysicsToolset` は、グラフノードの操作を Blueprint、Python、MCP クライアントから使えるようにします。

**設計**

ツールごとに読む対象と経路が異なります。大半のツールはグラフノードの `Node` を読み、実行中の値を見るのは Wind Scope の Live 表示と Toolset の実行時診断だけです。Wind Scope を除くツールは `UKawaiiPhysicsEditorLibrary` を共通の実装として使い、Toolset の編集系ツールはこのクラスを呼ぶ薄い層です。

**理解のポイント**

- ツールが読んでいる値が、グラフノードの値か実行中の値かを確認します。Node Audit と Preset Diff はコンパイル結果も実行中のノードも読まないため、コンパイル前の編集も差分に含まれます。
- 書き込みの経路で、シミュレーションがリセットされるかどうかが変わります。Editor Library の通常のプロパティ Setter は `PostEditChangeProperty` を通り、プリセットの適用には直接リセットする経路もあります。Wind Scope はリセットを避けて値を更新します。
- Preset Diff と Node Audit の一覧はスナップショットです。ノードを編集しても自動では更新されません。
- Toolset は Python から `UFUNCTION` を呼ぶため、名前や引数の変更は C++ のコンパイルでは検出できません。

<DocFigure src="/img/generated/internals-tool-routes-ja.svg" alt="5種類のエディタツールと、グラフの編集値、実行中の風、直近の評価値への読み書き経路" caption="青の矢印は情報の読み取り、緑の矢印は設定や要求の書き込みを示します。" maxWidth={960} />

## 関連ファイル

| ファイル | 役割 |
|---|---|
| [`Private/SKawaiiPhysicsWindScopeWindow.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/SKawaiiPhysicsWindScopeWindow.cpp) | Wind Scope のタブ本体、波形グラフ、編集の適用 |
| [`Private/SKawaiiPhysicsWindScopeEditPanel.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/SKawaiiPhysicsWindScopeEditPanel.cpp) | Wind Scope の編集パネルとパラメータ定義の表 |
| [`Private/KawaiiPhysicsWindScopeTarget.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/KawaiiPhysicsWindScopeTarget.h) | Wind Scope の表示対象の解決 |
| [`Private/SKawaiiPhysicsNodeAuditWindow.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/SKawaiiPhysicsNodeAuditWindow.cpp) | Node Audit のタブ |
| [`Private/KawaiiPhysicsAuditCommandlet.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/KawaiiPhysicsAuditCommandlet.cpp) | 監査のコマンドレットと JSON スキーマ |
| [`Private/SKawaiiPhysicsPresetDiffWindow.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/SKawaiiPhysicsPresetDiffWindow.cpp) | Preset Diff のタブ |
| [`Private/KawaiiPhysicsPresetDiffSnapshot.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/KawaiiPhysicsPresetDiffSnapshot.cpp) | 差分のスナップショットの構築 |
| [`Private/KawaiiPhysicsPresetDataAssetDetails.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/KawaiiPhysicsPresetDataAssetDetails.cpp) | プリセットの Details のボタン |
| [`Public/KawaiiPhysicsEditorLibrary.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Public/KawaiiPhysicsEditorLibrary.h) / [`.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Private/KawaiiPhysicsEditorLibrary.cpp) | Blueprint と Python から使うエディタ API |
| [`Content/Python/init_unreal.py`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Content/Python/init_unreal.py) | Toolset の自動登録 |
| [`Content/Python/kawaii_physics_toolset/toolset.py`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Content/Python/kawaii_physics_toolset/toolset.py) | `KawaiiPhysicsToolset` の定義 |

## 各ツールが読む情報

ツールごとに読む対象と経路が異なります。グラフノードの `Node` を読むツールは編集用の保存値を見ており、実行中の値を見るのは Wind Scope の Live 表示と Toolset の実行時診断だけです。

| ツール | 読む情報 | 経路 | 同期 |
|---|---|---|---|
| Wind Scope（Preview） | グラフノードの ProceduralWind の設定 | `ResolveGraphWind` のコピーから `ComputeWindSample` を計算 | 不要 |
| Wind Scope（Live 波形） | 実行中ノードの `RuntimeState->ScopeBuffer` | `ResolveLiveWind`（`GetDebuggedAnimNode`） | `RuntimeState->Mutex` |
| Wind Scope（Live 値） | 実行中ノードの ProceduralWind の `UPROPERTY` 値 | `UpdateLiveEditValuesFromRuntime` | なし。表示専用で torn-read を許容 |
| Wind Scope（書き込み） | 実行中ノードの `PendingParams`、`PendingGust` | `RequestDynamicParams`、`RequestGust` | `RuntimeState->Mutex` |
| Node Audit | グラフノードの `Node` | `CollectKawaiiPhysicsGraphNodes`。AnimBlueprint をロードする | なし |
| Preset Diff | グラフノードの `Node` と `Preset.Node` | `FProperty` の反射で比較 | なし |
| Editor Library | グラフノードの `Node` | `FKawaiiPhysicsGraphNodeHandle` の弱参照 | なし |
| Toolset（編集系） | グラフノードの `Node` | `unreal.KawaiiPhysicsEditorLibrary` | なし |
| Toolset（実行時診断） | 直近の評価で使われた値 | `unreal.KawaiiPhysicsLibrary.get_runtime_node_infos_on_component` | Game Thread 専用。評価中には呼ばず、コンポーネントの Tick 後に呼ぶ |

Node Audit と Preset Diff はコンパイル結果も実行中のノードも読みません。そのためコンパイル前の編集も差分に含まれます。

## Wind Scope

Wind Scope は ProceduralWind の波形を表示し、その場でパラメータを編集するタブです。`SKawaiiPhysicsWindScopeWindow` がタブ本体で、波形の描画は `SKawaiiPhysicsWindScopeGraph`、編集 UI は `SKawaiiPhysicsWindScopeEditPanel` が担当します。

### 表示対象の解決

`FKawaiiPhysicsWindScopeTarget` は、対象の種類（`KawaiiPhysicsNode` または `SharedPublisherNode`）、グラフノードの弱参照、`ExternalForces` のインデックスを持つ値型です。ProceduralWind の実体を2通りに解決します。

| 関数 | 返すもの |
|---|---|
| `ResolveGraphWind` | グラフノードの `ExternalForces[Index]` または `Node.SharedWind` |
| `ResolveLiveWind` | 実行中ノードの同じ位置の ProceduralWind |

`ResolveLiveProceduralWind` は `IsExternalForceShapeMatched` でグラフと実行中ノードの配列の形状が同じことを確認してから、インデックスを使います。要素数か、いずれかのインデックスの型が変わると不一致になり、Live の対象を解決できません。プロパティの値の編集や、同じ型の要素同士の並べ替えは不一致になりません。

弱参照が失効した場合、`ResolveTarget` は `AnimBlueprintPath` と `NodeGuid` からノードを探し直します。インデックスが無効なら、先頭の ProceduralWind へフォールバックします。

ノードの `WindSource` が `Shared` または `Auto` で、同じ AnimBlueprint に同じ Tag の Publisher があれば、`ResolveWindScopeOpenTarget` は表示対象を Publisher へ切り替え、元の対象を `RedirectOrigin` に残します。切り替えられない場合は元の対象のまま開きます。Publisher の探索は同じ AnimBlueprint の中だけです。バナーに表示する Tag は `ResolveSharedWindTag` が返します。Publisher の場合は `Node.SharedGroupTag` を返し、Publisher では使わない `Node.SharedWind.SharedWindTag` は読みません。

### 更新の流れ

タブは `RegisterActiveTimer(1.0f / 60.0f, ...)` で `TickWindScope` を実行します。処理順は次のとおりです。

1. ドラッグ中なのにマウスキャプチャが無ければ、`FinalizeAbandonedWindDrag` でドラッグを確定します。
2. `TryResolvePendingReconnect` で再接続を試みます。
3. `TryGetPreviewForceCopy` でグラフ側の ProceduralWind をコピーし、編集パネルの表示値を更新します。
4. `UpdateLiveEditValuesFromRuntime` で実行中の値を読みます。
5. Pause 中でなければ、`TryUpdateFromLiveRuntime` で Live のサンプルを取得します。Live の対象が無いときだけ `RebuildPreviewSamples` を実行します。
6. グラフへサンプルと表示設定を渡します。

Live のサンプルは、`RecordScopeSample` が Worker から書くリングバッファです。バッファの長さは `ScopeBufferSize`（512）で、`#if WITH_EDITOR` の中にあります。`TryUpdateFromLiveRuntime` は Mutex の中でスナップショットへコピーするだけにして、`ScopeSampleCount` が増えていなければ何もしません。新しいサンプルが無い tick でも Live の対象が解決できていれば、Preview に切り替えません。

Preview は `ComputeWindSample(SampleTime, 0.0f)` で 240 点を計算します。`LengthRate` が 0 なのは、Live のサンプルも `PreApply` で同じ `LengthRate` で計算されているためです。これで2つの波形は同じ基準で比較できます。`ComputeWindSample` は `PreApply` と共有の関数なので、合成式の変更は両方の表示に影響します。

プリセットのボタンにマウスを乗せると、`OnPresetButtonHovered` がコピーした ProceduralWind へプリセットを適用し、`Total` のゴースト波形を作ります。

### 編集の書き込み

Wind Scope はノードへ値を書いても `PostEditChangeProperty` を呼びません。呼ぶと `ModifyBones` が空になり、シミュレーションがリセットされるためです。実行中のノードへは `PendingParams` 経由で同じ値を送ります。

| 操作 | グラフノード | 実行中ノード | トランザクション |
|---|---|---|---|
| ドラッグ開始（Begin） | `DragStartWind` に現在値を保存 | なし | なし |
| ドラッグ中（Interactive） | 値を直接書く | 対応項目を送る | なし |
| ドラッグ確定（Committed） | 開始時の値へ戻してから `Modify` し、新しい値を書く | 対応項目を送る | あり |
| 既定値へ戻す | `ResetWindParamToDefault` | 対応項目を送る | あり |
| プリセットの適用 | `ApplyDynamicParams`。`bIsEnabled` と `TimeScale` も上書き | 同じ `Params` を送る | あり |
| 貼り付け | `*Wind = PastedWind` | `BuildDynamicParamsSnapshot` を送る | あり |
| Test Gust | なし | `RequestGust` | なし |

ドラッグの確定で値を一度戻すのは、`Modify` の時点でノードがドラッグ前の値を持つようにするためです。確定の値が開始時と同じなら、トランザクションを作りません。AnimBlueprint の変更状態は `MarkWindScopeGraphNodeModified` が付けます。

ノードへ値を書いた経路は `SyncEditValuesAfterWrite` を通します。編集パネルの `SSpinBox` は `CachedEditValues` にバインドされており、Slate はテキスト確定の直後に同じコールスタックでバインド値を読み直します。次の tick を待つと旧値が読まれて入力欄が戻り、フォーカスを外したときに旧値がノードへ書き戻されます。

例外は `ApplyWindParamEdit` の中断の経路です。ドラッグの確定で開始時の値へ戻した後に `CanEditWindProperty` が false なら、同期せずに終了します。表示値は次の `TickWindScope` で更新されます。

### 編集パネルのパラメータ定義

`GetWindScopeParamGroups` が表示するパラメータの表です。グループは Common、Direction、Constant、Sway、Ripple、StrengthCycle、Random の7つで、各行は `FKawaiiPhysicsWindScopeParamDef` です。

| フィールド | 意味 |
|---|---|
| `bDynamicParamsSupported` | `BuildDynamicParamsForProperty` で実行中ノードへ送れる項目。`ParameterMode` と `Seed` は false |
| `bAdvancedOnly` | Advanced モードでだけ表示 |
| `bVisibleForSharedPublisher` | Publisher を対象にしたときの表示。`*PhaseOffset` と `Seed` は false |

対象が消費側のノードのままで `IsRedirectedToShared` が true のとき（Publisher から元のノードへ戻った場合や、Publisher が別の AnimBlueprint にある場合）は、`IsSharedWindPublisherParameter` の13項目を編集できません。プリセットの適用と貼り付けも無効になります。

実行中の値と編集値の差が `LiveValueTolerance`（0.01）を超えた行には、実行中の値を表示します。

### プリセットの保存先

プリセット一覧は `UKawaiiPhysicsDeveloperSettings::WindScopePresetDataAsset` の `Presets` を使い、未設定か空なら `UKawaiiPhysicsWindPresetDataAsset::GetDefaultPresets` を使います。`SaveCurrentWindAsPreset` は設定されたアセットにだけ書き込みます。上書きの前に、対象のインデックスの名前と Tag が `CachedPresets` の同じ位置と一致することを確認し、違っていれば中止します。ほかの行やパラメータの値の変更は確認しません。

### タブの状態と再接続

タブを開くと `SaveLastTargetArgs` が AnimBlueprint のパス、`NodeGuid`、種類、インデックスを `GEditorPerProjectIni` の `[KawaiiPhysicsEd]` へ保存します。エディタのレイアウト復元のように引数なしでタブが作られた場合は、`LoadPendingReconnectFromConfig` がこの値を読みます。

再接続は `TryResolvePendingReconnect` が毎 tick 確認します。AnimBlueprint がロード済みなら `SetArgs` します。`WindScopeReconnectTryLoadDelay`（5 秒）経ってもロードされていなければ `RequestAsyncLoad` を開始します。`OpenWindow` で明示的に開かれたら、待機中の再接続は破棄します。

`SetArgs` はサンプル、`PreviewTime`、`LastLiveSampleCount`、ドラッグの状態をリセットします。

## Preset Diff

Preset Diff はグラフノードとプリセットの差分を表示し、片方の値をもう片方へコピーするタブです。

### スナップショット

`KawaiiPhysicsPresetDiff::BuildSnapshot` は `Preset.MatchesNode` を実行し、比較対象のプロパティごとに `FKawaiiPhysicsPresetDiffPropertyRow` を作ります。値の文字列は `ExportText` で作ります。差分の有無は文字列でなく `MatchesNode` の結果で決まります。

比較の対象は `ClassifyNodeProperty` の分類で決まります。`ShouldApplyNodeProperty` が true のプロパティだけを比較するので、既定のオプションではボーン割り当てと `KawaiiPhysicsTag` は差分になりません。比較には `PPF_DeepComparison | PPF_DeepCompareInstances` を使います。分類の詳細は [Data Asset とプリセット](/docs/internals/presets-and-data-assets) を参照してください。

`BuildSnapshotsForNode` は `FindAllPresetAssetData` で全プリセットをロードし、`TargetsNodeTag` が true のプリセットについてスナップショットを作ります。

### タブの操作

タブはノードへの参照を `AnimBlueprintPath` と `NodeGuid` で保持し、操作のたびに `FindGraphNodeByGuid` で解決します。

| 操作 | 関数 | 内容 |
|---|---|---|
| Apply Selected | `OnApplySelectedClicked` | 選択したプロパティを `CopyPropertiesByName` でノードへコピーし、`ModifyBones.Empty()` と `ReconstructNode` を実行。`PostEditChangeProperty` は呼ばない |
| Apply Preset to Node | `OnApplyPresetToNodeClicked` | `ApplyPresetToGraphNode` を呼ぶ |
| Update Preset from Node | `OnUpdatePresetFromNodeClicked` | 確認の後、選択または差分のプロパティをプリセットへコピー |
| Refresh | `OnRefreshClicked` | `BuildSnapshotsForNode` で作り直し、選択中のプリセットを維持 |

ノードへ書く2つの操作は、適用の前に `BuildSnapshot` で最新の状態を作り、`SnapshotRowsMatch` で表示中の値と比較します。比較の範囲は、Apply Selected では選択したプロパティだけ、Apply Preset to Node では比較対象の全プロパティです。値が変わっていれば適用せず、一覧を更新して中止します。`CustomExternalForces` は `DuplicateCustomExternalForces` で複製し、Outer を書き込み先のオブジェクトにします。

プリセットの Details には `FKawaiiPhysicsPresetDataAssetDetails` が Find Target Nodes と Apply to Project (Dry Run) のボタンを追加します。どちらも結果を Node Audit のタブへ渡します。

## Node Audit

Node Audit はプロジェクトの KawaiiPhysics ノードを一覧にするツールで、同じ処理をタブとコマンドレットの2つの入口から使います。

<DocFigure src="/img/generated/internals-audit-flow-ja.svg" alt="プリセットの Details、Node Audit タブ、コマンドレットから共通ライブラリを呼び、監査エントリを受け取って JSON を出力する経路" caption="上から下へ共通処理をたどり、監査エントリからタブとコマンドレットへ戻る経路と JSON の出力先を示します。" maxWidth={960} />

### 監査エントリ

`MakeAuditEntry` はノードの設定を `FKawaiiPhysicsNodeAuditEntry` にコピーし、渡されたプリセットを順に照合します。`TargetsNodeTag` が true のプリセットを数えて `MatchedPresetCount` に入れ、最初に一致したプリセットとだけ `MatchesNode` で比較します。プリセットの順序はパスのソート順です。`DiffValues` は `bIncludeDiffValues` が true のときだけ計算します。

対象の AnimBlueprint は `FindAnimBlueprintAssetDataReferencingTags` で、ロードせずに絞り込みます。

1. `FilterTags` が空なら全件を返します。
2. 未保存の dirty パッケージは常に候補に残します。
3. ロード済みなら、メモリ上のノードのタグで判定します。保存直後は AssetRegistry の依存情報がディスクの再スキャンまで更新されないためです。
4. それ以外は AssetRegistry の `SearchableName` 依存から GameplayTag の名前を調べます。非 Exact では保存されたタグ名の前方一致で子タグも拾います。

ヘッダのコメントが既知の限界として挙げているのは、UE 4.15 より前に保存された非常に古いパッケージです。

### コマンドレット

`UKawaiiPhysicsAuditCommandlet` は `-run=KawaiiPhysicsAudit` で実行します。

| 引数 | 内容 |
|---|---|
| `ContentPaths=` | カンマ区切りの Content パス。省略時は `/Game` |
| `FilterTags=` | カンマ区切りのタグ名。未登録のタグは警告してスキップ |
| `-Exact` または `-FilterExactMatch` | タグを完全一致で照合 |
| `-IncludeDiffValues` | `DiffValues` を出力 |
| `Output=` | JSON の出力先。省略時はログへ1ノード1行 |

`FilterTags=` のタグがすべて未登録の場合はコンテナが空になり、全ノードが監査の対象になります。

終了コードは次のとおりです。

| コード | 意味 |
|---|---|
| 0 | プリセットとの差分なし |
| 1 | `MatchedPresetPath` が有効で `bMatchesPreset` が false のノードがある |
| 2 | 監査の失敗、または JSON の書き込み失敗 |

一致するプリセットが無いノードは差分に数えません。

### タブ

`SKawaiiPhysicsNodeAuditWindow` は引数の `bShowDiffColumns` で Matches、DiffProperties、ViewDiff の列を切り替えます。Find Target Nodes は false、Dry Run は true で開きます。JSON の Export は `KawaiiPhysicsAuditJson::MakeAuditJsonObject` を使い、コマンドレットとスキーマを共有します。`TotalAnimBlueprints` だけは意味が異なり、タブでは一覧に含まれる AnimBlueprint の数を入れます。

Apply to Project は確認のダイアログの後で `ApplyPresetToProject(Preset, false, bCheckOutFiles, Report)` を呼び、返された `Report` で一覧を置き換えます。`Report` のエントリは適用の前に作られます。

## UKawaiiPhysicsEditorLibrary

`UKawaiiPhysicsEditorLibrary` は `UBlueprintFunctionLibrary` で、グラフノードの操作を Blueprint と Python へ公開します。`UFUNCTION` は 46 個あります。Wind Scope を除くツールはこのクラスを共通の実装として使います。

### API の分類

| 分類 | 主な関数 |
|---|---|
| 探索 | `CollectKawaiiPhysicsGraphNodes`、`CollectKawaiiPhysicsSharedPublisherGraphNodes`、`FindAllPresetAssets`、`FindAnimBlueprintAssets`、`FindAnimBlueprintAssetsReferencingTags`、`FindBonesByPattern` |
| 配置 | `AddKawaiiPhysicsNodes`、`AddKawaiiPhysicsSharedPublisherNode`、`ValidatePlacementRequests` |
| グラフ編集 | `SetAnimGraphInputAnimation`、`SetAnimGraphInputPose`、`LayoutKawaiiPhysicsAnimGraph`、`BindGraphNodeAnimNodeFunction` |
| コンパイル | `CompileAnimBlueprintWithMessages` |
| プロパティ | `SetGraphNodePropertyFromString`、`GetGraphNodePropertyAsString`、`SetGraphNodeWildcardProperty`、`SetGraphNodeExternalForcesFromJson`、`SetGraphNodeTag`、`SetGraphNodeRootBoneName`、`SetSharedPublisherNodePropertyFromString` |
| プリセット | `ApplyPresetToGraphNode`、`GetGraphNodePresetDiffProperties`、`GetGraphNodePresetDiffValues`、`ExportGraphNodeToPreset`、`ApplyPresetToProject`、`SetPresetNodePropertyFromString`、`SetPresetTargetTags` |
| 監査 | `AuditKawaiiPhysicsNodes` |
| 補助 | `GetGraphNodeReferenceBoneTransform`、`GetEditorWorldIgnoringPlayMode`、`SetBackgroundCPUThrottleEnabled`、`GetAnimGraphComments` |

`FindGraphNodeByGuid`、`FindAllPresetAssetData`、`FindAnimBlueprintAssetData`、`FindAnimBlueprintAssetDataReferencingTags` は `UFUNCTION` でない C++ 専用の関数です。`FindAllPresetAssetData` は `TStrongObjectPtr` を返し、GC の安全のため C++ 側はこちらを使います。Python には生ポインタ版の `FindAllPresetAssets` を公開しています。

`FKawaiiPhysicsGraphNodeHandle` は `TWeakObjectPtr` を1つ持つ、グラフノードへの弱参照ハンドルです。

### グラフ編集の共通処理

ノードのプロパティの変更は、`ModifyGraphNodeProperty` が共通の流れを提供します。

```cpp
FScopedTransaction Transaction(TransactionText);
GraphNode->Modify();
if (!Mutator(*GraphNode))
{
    Transaction.Cancel();
    return false;
}
return NotifyGraphNodePropertyChanged(GraphNode, ChangedProperty);
```

`NotifyGraphNodePropertyChanged` は `EPropertyChangeType::ValueSet` の `FPropertyChangedEvent` を作って `PostEditChangeProperty` を呼び、`FBlueprintEditorUtils::MarkBlueprintAsModified` を実行します。`PostEditChangeProperty` を通るので、`ModifyBones` のリセットと `ReconstructNode` もここで走ります。`PostEditChangeChainProperty` は通らないため、`PushProceduralWindEditToLiveInstance` は呼ばれません。

文字列の値は `UKawaiiPhysicsLibrary::SetNodePropertyValueFromString` を経由し、`ImportText` で解釈します。Shared Publisher のプロパティは `Outer.Inner` の形式を1階層だけ受け付けます。`SetSharedPublisherNodePropertyFromString` と `SetPresetNodePropertyFromString` は、対象を変更する前にコピーへインポートして値を検証します。`SetGraphNodeExternalForcesFromJson` も全要素の変換が終わってからノードへ反映します。

ワイルドカードの `SetGraphNodeWildcardProperty` と `GetGraphNodeWildcardProperty` は `CustomThunk` で、`DEFINE_FUNCTION` の中で script stack から値の `FProperty` とアドレスを取り出します。

### トランザクションの単位

| 関数 | 単位 |
|---|---|
| `AddKawaiiPhysicsNodes` | 全リクエストで1つ。何も変更しなければ `Cancel` |
| `ApplyPresetToGraphNode` | ノードごとに1つ |
| `ApplyPresetToProject` | 全体をまとめるトランザクションは無く、ノードごとの `ApplyPresetToGraphNode` が開く |
| `SetPresetNodePropertyFromString`、`SetPresetTargetTags`、`SetPresetDescription` | トランザクションなし。`Modify` と `MarkPackageDirty` だけを呼ぶ |

`AddKawaiiPhysicsNodes` は変更の種類で通知を分けます。ノードや変換ノードを追加したら `MarkBlueprintAsStructurallyModified`、既存ノードの更新や接続だけなら `MarkBlueprintAsModified` です。

`ApplyPresetToGraphNode` は `LimitsDataAsset` や `BoneConstraintsDataAsset` が変わった場合に `NotifyGraphNodePropertyChanged` を呼びます。`FKawaiiPhysicsEditMode::OnExternalNodePropertyChange` は、`OnNodePropertyChanged` の通知の `Property` が `LimitsDataAsset` のときに購読先を付け替えます。参照が変わらなければ `ModifyBones.Empty()` と `ReconstructNode` だけを行います。

### ApplyPresetToProject

`TargetTags` が空のプリセットは何もしません。`TargetsNodeTag` のコメントにあるとおり、全ノードの書き換え事故を避けるためです。処理は AnimBlueprint ごとに次の順で進みます。

1. `CollectKawaiiPhysicsGraphNodes` で対象のノードを集めます。
2. ノードごとに `MakeAuditEntry` で適用前の状態を `OutReport` へ追加します。`bDryRun` ならここで次のノードへ進みます。
3. アセットごとに1回だけ `CheckOutPackageIfNeeded` を試みます。失敗したら、そのアセットの残りのノードをスキップします。
4. `ApplyPresetToGraphNode` を呼びます。

この関数は保存もコンパイルもしません。アセット 20 個ごとに `CollectGarbage` を実行するので、変更済みの AnimBlueprint は `TStrongObjectPtr` の配列で保持します。`AuditKawaiiPhysicsNodes` も同じ間隔で GC します。

### 配置

`AddKawaiiPhysicsNodes` はリクエストを `ResolvePlacementRequest` で解決し、`ValidateResolvedPlacementRequest` を通ったものだけを処理します。`MatchKey` で既存ノードが見つかれば更新し、無ければ `FGraphNodeCreator` で作成します。ノードの値は `ApplyResolvedPlacementToGraphNode` が設定します。プリセットを適用した後で、リクエストの RootBone、ExcludeBones、AdditionalRootBones、Tag で上書きします。

`bAutoConnect` は `ConnectGraphNodeBeforeResult` で Result の直前へ接続し、必要なら空間変換ノードを追加します。`Comment` を指定すると `FindOrAddMcpCommentNode` がコメント枠を追加します。UE 5.5 以上では `UKawaiiPhysicsMcpCommentNode`、それ未満では `UEdGraphNode_Comment` を使います。配置の間隔と方向は `UKawaiiPhysicsDeveloperSettings` の `McpNodePlacement*` で設定します。

## KawaiiPhysicsToolset

`KawaiiPhysicsToolset` は MCP クライアントからエディタを操作するためのツール定義で、C++ でなく Python で書かれています。定義はプラグインの `Content/Python/kawaii_physics_toolset/` にあります。

| ファイル | 内容 |
|---|---|
| `Content/Python/init_unreal.py` | 登録の入口 |
| `kawaii_physics_toolset/registration.py` | `toolset_registry.registration.Registration` への登録 |
| `kawaii_physics_toolset/toolset.py` | `KawaiiPhysicsToolset`（`unreal.ToolsetDefinition` の派生）。`@toolset_registry.tool_call` のメソッドが 73 個 |
| `kawaii_physics_toolset/skills/kawaii_physics_setup.py` | `KawaiiPhysicsSetupSkill`（`unreal.AgentSkill` の派生） |
| `kawaii_physics_toolset/motion_metrics.py` | 動きの記録の分析。`unreal` を import しない |
| `kawaii_physics_toolset/tests/` | `test_toolset.py`、`test_motion_metrics.py` |

### UE 5.8 依存の扱い

`.uplugin` はほかのプラグインへの依存を宣言しておらず、`KawaiiPhysicsEd` の C++ も MCP に依存しません。UE 5.8 への依存は Python の側で閉じています。`init_unreal.py` は `import toolset_registry` を試み、`ImportError` なら何もしません。登録中の例外は `unreal.log_warning` に出して終わります。

サンプルプロジェクトは `KawaiiPhysicsSample.uproject` で `ModelContextProtocol`、`EditorToolset`、`SlateInspectorToolset`、`PythonScriptPlugin` を有効にし、リポジトリ直下の `.mcp.json` に接続先を書いています。これはサンプルプロジェクトの設定で、プラグインの要件ではありません。

UE 5.8 の MCP は省略可能なリスト引数（`list[...] | None`）への値の変換に失敗するため、ツールのリスト引数は省略不可の `list` で宣言し、指定しないときは `[]` を渡します。`test_toolset.py` の `test_tool_schema_requires_only_params_without_defaults` がツールのスキーマの必須引数を確認します。

### Editor Library との関係

編集系のツールは、引数を検証して例外へ変換し、`unreal.KawaiiPhysicsEditorLibrary` を呼ぶ薄い層です。たとえば `set_graph_node_property` は `set_graph_node_property_from_string` が false を返すと `RuntimeError` を送出します。実行時の操作は `unreal.KawaiiPhysicsLibrary` を呼びます。

Toolset にだけ実装がある処理もあります。

| 機能 | 実装 |
|---|---|
| ボーンとコリジョンの隙間の確認 | `toolset.py` の `_geom_*`。`get_runtime_node_infos_on_component` の結果から計算 |
| 貫通とボーンのサンプラー | `unreal.register_slate_post_tick_callback` で毎 tick 記録 |
| 動きの分析 | `motion_metrics.py` |
| 環状のボーン拘束の作成 | `build_ring_bone_constraints` |

対象のワールドは `_resolve_world(prefer_pie)` が決めます。`prefer_pie` が true なら `get_game_world()` を先に使い、無ければ `GetEditorWorldIgnoringPlayMode` でエディタのワールドを取得します。`UnrealEditorSubsystem.get_editor_world()` は PIE 中にエラーを出して None を返すため、C++ 側に専用の関数を用意しています。

## 状態とライフサイクル

| ツール | 状態の持ち主 | 寿命 |
|---|---|---|
| Wind Scope | `SKawaiiPhysicsWindScopeWindow`、最後の対象は ini | タブの寿命。対象の情報は再接続で復元 |
| Preset Diff | `SKawaiiPhysicsPresetDiffWindow` のスナップショット | 明示的な Refresh か適用まで更新しない |
| Node Audit | `SKawaiiPhysicsNodeAuditWindow` のエントリのコピー | Refresh か適用まで更新しない |
| Editor Library | なし | 呼び出しごと |
| Toolset のサンプラー | `toolset.py` のモジュール変数 | `stop_*` か完了まで |

Preset Diff と Node Audit の一覧はスナップショットなので、ノードを編集しても自動では更新されません。各タブのウィンドウは `LiveWindScopeWindows` のような静的配列に弱参照で登録され、`ShutdownModule` の `CloseAllWindows` で閉じられます。

## 他機能との関係

- **Procedural Wind**: Wind Scope は `FKawaiiProceduralWindRuntimeState` の Mutex と `ScopeBuffer` に依存します。`BuildDynamicParamsForProperty` の対応項目を変えたら、編集パネルの表も合わせます。
- **Shared Publisher**: Wind Scope の転送と編集制限は `WindSource` と `SharedGroupTag` で決まります。転送先の検索は同じ AnimBlueprint の中だけです。
- **プリセット**: Preset Diff、Node Audit、`ApplyPresetToGraphNode` はすべて `ClassifyNodeProperty` の分類に従います。`Unknown` のプロパティはコピーも比較もされません。
- **タグ**: Node Audit の対象は `KawaiiPhysicsTag` で決まります。タグの無いノードは `TargetsNodeTag` に一致しません。

## 変更するときの注意

- ProceduralWind に編集できるプロパティを追加したら、`GetWindScopeParamGroups` の表を更新します。表の `bDynamicParamsSupported` と `BuildDynamicParamsForProperty` の一致は `KawaiiPhysics.Editor.WindScopeEditPanel.Definitions` が確認します。
- Wind Scope の書き込み経路を追加するときは `SyncEditValuesAfterWrite` を通します。
- Wind Scope の対象解決は `KawaiiPhysics.Editor.WindScope.SharedTargetResolve` が確認します。
- `FKawaiiPhysicsNodeAuditEntry` にフィールドを追加したら、`MakeAuditEntry` と `FindTargetNodes` の両方で設定します。`FindTargetNodes` はエントリを自前で作り、`bUseSimpleWorldCollision` と `SimpleWorldCollisionSkeletalMeshCollision` は設定しないので、この2つは既定値のままです。JSON は `UStructToJsonObject` なので自動で増えますが、CSV の列は `ExportEntriesToCsv` に手書きです。
- スナップショットの動作は `KawaiiPhysics.Editor.PresetDiffSnapshot.Matches` と `KawaiiPhysics.Editor.PresetDiffSnapshot.PhysicsSettingsDiff` が確認します。
- Editor Library の変更は `KawaiiPhysics.EditorScripting.*` で確認します。Python のツールを変更したら `tests/test_toolset.py` も実行します。
- `UFUNCTION` の名前や引数を変えると、`toolset.py` の呼び出しも直す必要があります。C++ のコンパイルでは検出できません。
- ツールの挙動を変えたら、docstring と `KawaiiPhysicsSetupSkill` の `instructions` も合わせます。

## 関連ページ

- [エディタモジュール](/docs/internals/editor-module)
- [テスト](/docs/internals/testing)
- [Procedural Wind](/docs/internals/procedural-wind)
- [Shared Publisher](/docs/internals/shared-publisher)
- [Data Asset とプリセット](/docs/internals/presets-and-data-assets)
- [Wind Scope の使い方](/docs/features/wind-scope)
- [Node Audit の使い方](/docs/features/node-audit)
- [プリセットの使い方](/docs/features/settings-presets)
- [KawaiiPhysicsToolset の使い方](/docs/api/mcp)
