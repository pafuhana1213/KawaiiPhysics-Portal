---
sidebar_position: 18
title: "テスト"
description: "KawaiiPhysicsTests モジュールの構成、テストハーネス、Golden テスト、Perf テストの見方、変更箇所ごとに実行するテスト、CI の範囲を説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# テスト

このページはテストの構成、ノードを評価する方法、Golden テストの更新手順、変更箇所ごとに実行するテストを説明します。

## このページの要点

**概要**

C++ の自動テストは UE の Automation Test として `KawaiiPhysicsTests` モジュールにあり、CI では実行されません。ソースを変更したら、このページの対応表から実行するテストを選び、手元のエディタで実行します。Golden テストの不一致の判断や Perf テストのログの読み方も、このページで確認できます。

**設計**

テストは、ノードを動かす深さで関数単体、物理コア、本番の評価の3段階に分かれます。深いほど本番に近く、準備に手間がかかります。これとは別に、Golden は位置のビット一致で挙動の変化を検出し、Perf は処理時間をログへ出して変更前後を比較します。`KawaiiPhysics.EditorScripting.*` は、一時的な AnimBlueprint にグラフノードを実際に追加して確認します。

**理解のポイント**

- テストの成功が示す範囲は層ごとに異なります。ハーネスの `StepFrame` と `StepOnce` はダミーボーンや `ExternalForces` に対応せず（専用の Fixture や直接呼び出しのテストはあります）、Perf は時間で失敗せず、`FKawaiiPhysicsEditMode` にはテストがありません。
- ハーネスの `StepFrame` と `StepOnce` は本番の処理順を複製しています。計算の関数は本番と同じですが、呼び出しの順序は二重管理です。
- Golden の不一致には、変更が挙動を変えた場合と環境が変わった場合があります。要素数が合わないと採取モードになり、そのシナリオのビット比較が失敗にならないため、Warning も確認します。
- テスト名の領域と、ファイル名やディレクトリは一致しないことがあります。実行するテストは `KawaiiPhysics.<領域>` の名前で指定します。

<DocFigure src="/img/generated/internals-test-layers-ja.svg" alt="ハーネス、本番ノード評価、Golden、Perf、Editorの5層の検証範囲と限界" caption="各カードの緑の項目が検証範囲、橙の項目が対象外や判定上の限界を示します。" maxWidth={960} />

## 関連ファイル

| ファイル | 役割 |
|---|---|
| [`KawaiiPhysicsTests.Build.cs`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsTests/KawaiiPhysicsTests.Build.cs) | モジュールの依存と include パス |
| [`Private/KawaiiPhysicsTestsModule.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsTests/Private/KawaiiPhysicsTestsModule.cpp) | テスト用 GameplayTag の登録 |
| [`Private/KawaiiPhysicsTestGameplayTags.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsTests/Private/KawaiiPhysicsTestGameplayTags.h) | テスト用タグの定義マクロ |
| [`Private/Runtime/KawaiiPhysicsTestHarness.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsTests/Private/Runtime/KawaiiPhysicsTestHarness.h) | `FKawaiiPhysicsTestAccessor`。Output なしでノードを動かすハーネス |
| [`Private/Runtime/KawaiiPhysicsGoldenTest.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsTests/Private/Runtime/KawaiiPhysicsGoldenTest.cpp) | 位置のビット一致を確認する Golden テスト |
| [`Private/Runtime/KawaiiPhysicsPerfTest.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsTests/Private/Runtime/KawaiiPhysicsPerfTest.cpp) | 性能の計測 |
| [`Private/Runtime/KawaiiPhysicsNodeEvaluationPerfTest.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsTests/Private/Runtime/KawaiiPhysicsNodeEvaluationPerfTest.cpp) | 実際のポーズとプロキシを使うノード評価のテスト |
| [`Tools/check_version_consistency.py`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Tools/check_version_consistency.py) | バージョン表記の整合性の確認 |
| [`.github/workflows/version-consistency.yml`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/.github/workflows/version-consistency.yml) | 上のスクリプトを実行する CI |

## モジュールの構成

`KawaiiPhysics.uplugin` での `KawaiiPhysicsTests` の宣言は次のとおりです。

| 項目 | 値 |
|---|---|
| `Type` | `Runtime` |
| `LoadingPhase` | `Default` |
| `PlatformAllowList` | Win64、Mac、Linux |
| `TargetAllowList` | Editor |

モジュールの種別は `Runtime` ですが、`TargetAllowList` で Editor ターゲットに限定しています。`KawaiiPhysicsTests.Build.cs` の依存に `UnrealEd`、`AnimGraph`、`BlueprintGraph`、`Kismet`、`PropertyEditor`、`KawaiiPhysicsEd` が含まれ、これらは Game ターゲットにありません。ゲームのビルドにはこのモジュールは含まれません。

Build.cs は `KawaiiPhysics`、`KawaiiPhysicsEd`、`KawaiiPhysicsSequencer` の `Private` ディレクトリを `PrivateIncludePaths` に追加します。テストは各モジュールの非公開ヘッダを直接 include できます。

### 本体側のテスト用の口

本体のモジュールには、テストのための宣言が `#if WITH_DEV_AUTOMATION_TESTS` の内側にあります。`FAnimNode_KawaiiPhysics` は `FKawaiiPhysicsTestAccessor` を `friend` にし、Simple World Collision の Entry を差し替えるメンバや、初期化の回数を数える `NumSimpleWorldInitializeAttempts` を持ちます。ヘッダのコメントにあるとおり、Shipping と Test の構成では宣言ごと除外され、出荷ビルドにテスト用の口は残りません。

### ディレクトリの分け方

| ディレクトリ | 内容 |
|---|---|
| `Private/Runtime` | ランタイムの処理のテスト。ハーネスもここにある |
| `Private/Editor` | Editor Library、Details、タブ、Sequencer のトラックエディタのテスト |
| `Private/Sequencer` | Settings Multiplier のセクションのテスト |
| `Private` 直下 | モジュール本体とテスト用タグ |

### テスト用 GameplayTag

`KP_DEFINE_TEST_GAMEPLAY_TAG_STATIC` は `FKawaiiPhysicsTestGameplayTag` の static 変数を定義します。コンストラクタがタグ名を集め、`StartupModule` の `RegisterAllTestTags` が `AddNativeGameplayTag` で登録します。

モジュールのコメントによると、`FNativeGameplayTag` で定義すると ensure が出るため、従来の API を起動時に呼んで登録します。`LoadingPhase` が `Default` であることにも意味があります。PostEngineInit の `DoneAddingNativeTags` より前に登録でき、5.7 以前の登録時の ensure を避けられます。ホットリロードで `StartupModule` が再実行された場合は、登録済みのタグをスキップします。

## テスト名の規則

テストはすべて `IMPLEMENT_SIMPLE_AUTOMATION_TEST` で定義し、フラグは `EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter` で統一されています。名前は `KawaiiPhysics.<領域>.<細目>` の形式です。

| 領域 | 対象 |
|---|---|
| `Simulation` | 積分、サブステップ、Subdivision、Golden |
| `Collision` | 形状ごとの押し出し |
| `AngleLimit` | 軸別角度制限 |
| `Mirror` | コリジョンのミラーと Mirror Table のキャッシュ |
| `ExternalForce` | 外力の基底と単発の外力の寿命 |
| `TransientForce` | 実行時の一時外力と要求キュー |
| `ProceduralWind` | 風の波形、DynamicParams、共有風 |
| `WindPreset` | Wind Preset |
| `SettingsMultiplier` | 物理設定の倍率 |
| `SharedCollision` | Shared Collision のスロットと寿命 |
| `SharedPublisher` | Shared Publisher の公開と読み取り |
| `SimpleWorld` | Simple World Collision |
| `Library` | `UKawaiiPhysicsLibrary` |
| `PropertyAccess` | 名前によるプロパティアクセス |
| `Preset` | プリセットのコピー、比較、分類 |
| `Sequencer` | セクションとトラックエディタ |
| `Editor` | カテゴリ、タブ、設定、Wind Scope、Shared Publisher ノード |
| `EditorScripting` | `UKawaiiPhysicsEditorLibrary` |
| `Perf` | 性能の計測 |

ファイル名やディレクトリと、テスト名の領域は一致しないことがあります。

- `KawaiiPhysicsNodeEvaluationPerfTest.cpp` のテストは `KawaiiPhysics.Simulation.ProductionNodeEvaluation` で、計測はしません。
- `KawaiiPhysicsSubsystemTickPerfTest.cpp` のテストは `KawaiiPhysics.SimpleWorld.SubsystemTickPublish` で、これも計測はしません。
- `Private/Editor` の `KawaiiPhysicsPerAxisLimitAngleDetailsTest.cpp` は `KawaiiPhysics.AngleLimit.Editor.*` です。
- `Private/Editor` の `KawaiiPhysicsSequencerTrackEditorTest.cpp` は `KawaiiPhysics.Sequencer.TrackEditor.*` です。

ソース中の `KawaiiPhysics.Test.*` や `KawaiiPhysics.Shared.*` のような文字列の多くは GameplayTag の名前で、テスト名ではありません。

## テストの実行

### セッションフロントエンド

エディタの Tools メニューから Session Frontend を開き、Automation タブの検索欄に `KawaiiPhysics` と入力します。テストをツリーで選び、Start Tests で実行します。

### コマンドライン

```bash
UnrealEditor-Cmd.exe KawaiiPhysicsSample.uproject -ExecCmds="Automation RunTests KawaiiPhysics.Simulation;Quit" -unattended -nopause -log
```

`Automation RunTests` は `+` で複数の条件をつなげます。

```text
Automation RunTests KawaiiPhysics.Simulation+KawaiiPhysics.Collision
```

`KawaiiPhysics` だけを指定すると `KawaiiPhysics.Perf.*` も実行されます。`Perf` は専用のフラグを持たず、通常のテストと同じ `EngineFilter` です。計測の回数が多いので、普段は領域を指定します。

### 環境の条件

大半のテストは実行時に Skeleton や AnimBlueprint を作るので、サンプルのアセットに依存しません。`KawaiiPhysics.EditorScripting.PublishedEditorApis` だけは、プロジェクトにプリセットが存在することと `/Game/KawaiiPhysicsSample/Samples/1-Basic` を前提にしています。サンプルプロジェクト以外で実行すると失敗します。

`KawaiiPhysics.Editor.DockableTabs.*` は `GIsEditor` でない場合、コマンドレットの場合、Slate が未初期化の場合に、`AddInfo` を出して成功扱いで終わります。

## ノードの評価方法

テストはノードを動かす深さが3段階あります。深いほど本番に近く、準備に手間がかかります。

| 段階 | 方法 | 例 |
|---|---|---|
| 関数単体 | `FKawaiiPhysicsTestAccessor` の `Call*` で計算の関数を直接呼ぶ | `CallSphereCollision`、`CallComputeVerletStepVelocity` |
| 物理コア | `BuildVerticalChain` でボーンを組み、`StepFrame` で進める | `KawaiiPhysics.Simulation.*` の多く |
| 本番の評価 | 実際の `USkeleton`、`UWorld`、`FAnimInstanceProxy` で `EvaluateSkeletalControl_AnyThread` を呼ぶ | `KawaiiPhysics.Simulation.ProductionNodeEvaluation` |

### FKawaiiPhysicsTestAccessor

`FKawaiiPhysicsTestAccessor` は `FAnimNode_KawaiiPhysics` を値で持つ構造体です。`friend` なので private の状態と関数に触れます。`FComponentSpacePoseContext`（Output）なしで物理コアを実行するのが目的です。

ボーンの配列は `BuildVerticalChain` や `BuildTwoVerticalChains` で直接組みます。`InitModifyBones` は通りません。各ボーンの `PhysicsSettings` は `SetAllPhysicsSettings` で直接入れるので、`StepFrame` は `UpdatePhysicsSettingsOfModifyBones` を通りません。

`StepFrame` と `StepOnce` は、`SimulateModifyBones` と `SimulateOnce` の Output に依存しない部分を複製したものです。

| ハーネス | 複製元 | 内容 |
|---|---|---|
| `PrepareFrame` | `SimulateModifyBones` | `bSkipSimulate` の設定とポーズのスナップショット |
| `StepFrame` | `SimulateModifyBones` | Legacy の1ステップ、または固定サブステップの分割と `PoseLocation` の補間 |
| `StepOnce` | `SimulateOnce` | ルートの追従、積分、BoneConstraint、コリジョン、BoneConstraint、`RestoreBoneLengthsAndLimits` |
| `StepFrameWithComponentTransform` | `EvaluateSkeletalControl_AnyThread` | `UpdateSkelCompMove`、`SimulateModifyBones`、`TeleportType` のリセット、`AdvancePreSkelCompTransform` の順序 |
| `EvaluateSimpleWorldCollision` | `EvaluateSkeletalControl_AnyThread` | Simple World Collision の初期化の判定と読み取り |
| `RunPhysicsSettingsUpdateGate` | `EvaluateSkeletalControl_AnyThread` | 物理設定の更新の判定 |

計算の関数は本番と同じものを呼ぶので、数式の退行は検出できます。一方で呼び出しの順序は本番と二重管理です。本番の順序だけを変えると、ハーネスのテストは古い順序のまま通ります。

`StepFrame` と `StepOnce` が対応しない範囲は次のとおりです。Subdivision のように本体の関数を個別に呼ぶテストは、`BuildSyncBoneSubdivisionFixture` などの専用の Fixture を使います。

- ダミーボーン、Bridge、LOD の扱い
- `ExternalForces`、`CustomExternalForces`、風（`StepOnce` は積分に風を渡さない。`SimpleExternalForce` は処理する）
- Output に依存する World Collision の sweep
- `BaseBoneSpace`（`StepFrame` は `ensureMsgf` で中断する）
- `StepFrameWithComponentTransform` は `ComponentSpace` のみ
- Shared Collision の配列（`StepOnce` のコリジョンはノード直下、`*LimitsData`、Simple World の配列だけを処理する）

Simple World のコリジョンは、`SetSimpleWorldLimits` で配列へ手動で注入した場合に処理します。Subsystem による収集は対象外です。

### 本番の評価を通すテスト

`FNodeEvaluationFixture` は 64 ボーンの `USkeleton` と `UWorld`、`FAnimInstanceProxy` の派生を作り、`Initialize_AnyThread`、`CacheBones_AnyThread`、`PreUpdate`、`UpdateInternal`、`EvaluateSkeletalControl_AnyThread` を順に呼びます。テストのコード中で `EvaluateSkeletalControl_AnyThread` を呼ぶのはこのテストだけです。

`KawaiiPhysics.Simulation.ProductionNodeEvaluation` は 32 フレーム評価し、全ボーンが出力されて値が有限であることを確認します。リクエストなしと、毎フレーム `RequestPushPhysicsSettingsMultiplier` を送る場合の2通りです。

### エディタのテスト

`KawaiiPhysics.EditorScripting.*` は、`/Temp` 以下の `RF_Transient` のパッケージに AnimBlueprint を作り、グラフノードを実際に追加します。設定を変更するテストは、`FScopedMcpPlacementSettings` のようにデストラクタで値を戻すヘルパーを使います。

`FKawaiiPhysicsEditMode` を対象にしたテストはありません。Gizmo と選択はプレビューで確認します。

## Golden テスト

`KawaiiPhysics.Simulation.GoldenPositions` は、固定のシナリオを 200 フレーム（`1/90` 秒）進めた後の全ボーンの位置が、記録した値とビット単位で一致することを確認します。リファクタリングで挙動が変わっていないことを確認するためのテストです。

| シナリオ | ボーン | 条件 |
|---|---|---|
| `Chain` | 12 | 固定サブステップ（60 fps、最大 4） |
| `ChainLegacy` | 12 | サブステップなし |
| `Constraint` | 16（8 × 2本） | BoneConstraint を前後2回ずつ。`Leather`、拘束の長さ 12 に対して横の間隔 15 |
| `Collision` | 12 | 球、カプセル、ボックス、平面。`Radius` 3、`LimitAngle` 30 |

`ChainLegacy` があるのは、サブステップなしでは `Exponent` が 1.0 にならず、Stiffness の `Pow` が別の経路を通るためです。`Constraint` の拘束の長さを実際の間隔より短くしているのは、違反量が 0 のまま静止すると拘束計算の退行を検出できないためです。`Collision` は同じ条件のコライダーなしの実行と比較し、位置が変わることも確認します。

`CheckOrCapture` の動作は次のとおりです。

- 期待値の要素数と実際の値（ボーン数 × 3）が一致しなければ、**採取モード**になります。`AddWarning` を出して値をログへ書き、`CheckOrCapture` は true を返すので、そのシナリオのビット比較は失敗になりません。ほかのシナリオの比較と、`Collision` のコライダーの有無の検査は実行されます。
- 要素数が一致すれば、`double` のビット列を `uint64` で比較します。最初の不一致で `AddError` を出します。

### 不一致が出たとき

期待値は Pow や Slerp などの関数の結果に依存します。これらの実装は CRT や CPU の命令セットでディスパッチが変わるので、別のマシンや CRT の更新で最下位ビットが変わることがあります。不一致の原因は2通りです。

1. 変更が挙動を変えた場合。意図した変更でなければ、コードを直します。
2. 環境が変わった場合。コードの退行ではありません。

エラーの `bone`、`comp`、期待値、実際の値を見て、どちらかを判断します。変更前のコミットでも同じ不一致が出るなら環境の差です。

### 基準値の更新手順

意図した変更か環境の差と確認できたら、次の手順で更新します。

1. `KawaiiPhysicsGoldenTest.cpp` の該当する `Golden_*` 配列を空にします。

   ```cpp
   static const TArray<uint64> Golden_Collision = {
   };
   ```

2. ビルドしてエディタを起動します。
3. `KawaiiPhysics.Simulation.GoldenPositions` を実行します。
4. ログの `GOLDEN <シナリオ名> 0x...` の行を確認します。1ボーンにつき X、Y、Z の順に3行出ます。

   ```text
   GOLDEN Collision 0x0000000000000000
   ```

5. 値を `ULL` 付きのリテラルにして配列へ貼り付けます。既存の配列は1行に1ボーン分です。
6. 変更の理由を配列のコメントに残します。既存の例として `Golden_Collision` に、Box の内部押し出しの変更で更新した旨のコメントがあります。
7. 再びビルドして実行し、`GoldenPositions not captured` の警告が消えて成功することを確認します。

シナリオのボーン数を変えた場合も要素数の不一致で採取モードになり、そのシナリオのビット比較は失敗になりません。Warning を見落とさないようにしてください。

## Perf テスト

`KawaiiPhysics.Perf.*` は処理時間をログへ出します。時間で失敗することはありません。`SimpleWorldRead` と `Sizeof` 以外のベンチは、結果に NaN や Inf があれば `AddError` を出します。`SimpleWorldRead` は結果を検査せずに成功を返すので、コリジョンの結果の確認には使えません。性能の判定は、変更前後のログを比較して行います。

試行の手順は共通です。1回の試行で較正ループ、ウォームアップ（`GWarmupFrames` = 100）、計測の順に実行し、これを `GTrials` = 5 回繰り返します。

| テスト | 構成 | 計測の回数 |
|---|---|---|
| `KawaiiPhysics.Perf.Chain` | 200 ボーン、固定サブステップ | 12000 フレーム |
| `KawaiiPhysics.Perf.ChainLegacy` | 200 ボーン、サブステップなし | 12000 フレーム |
| `KawaiiPhysics.Perf.Collision` | 200 ボーン、球 4、カプセル 8、ボックス 4、平面 2 | 5000 フレーム |
| `KawaiiPhysics.Perf.ConstraintHeavy` | 1000 ボーン、拘束 999、反復 16 + 16 | 1000 フレーム |
| `KawaiiPhysics.Perf.PhysicsSettings` | 200 ボーン。`CurvesEmpty` と `CurvesSet` | 500000 回 / 30000 回 |
| `KawaiiPhysics.Perf.SimpleWorldRead` | Convex 64、Box 64、Ground 1。`PublishEveryFrame` と `PublishEvery12` | 15000 フレーム |
| `KawaiiPhysics.Perf.ExternalForceFilter` | 600 ボーン、2 substep。`Unfiltered1`、`Filtered4`、`Filtered8` | 2000 フレーム |
| `KawaiiPhysics.Perf.Sizeof` | 構造体のサイズとツールチェーンの情報をログへ出す | なし |

`ChainLegacy` は `Exponent` が 1.0 にならないので、Stiffness の `Pow` のコストはこのテストで初めて現れます。`ConstraintHeavy` は拘束計算の小さな差をボーンの処理に埋もれさせないための重いベンチです。

### ログの読み方

```text
PERF_RAW KawaiiPhysics.Perf.Chain trial=0 ms=... calib_ms=...
PERF KawaiiPhysics.Perf.Chain median_ms_per_frame=... min_ms_per_frame=... ns_per_bone_step=... checksum=...
```

| 項目 | 意味 |
|---|---|
| `median_ms_per_frame` | 5 試行の中央値。比較の基本の値 |
| `min_ms_per_frame` | 5 試行の最小値 |
| `ns_per_bone_step` | 中央値をボーン数と1フレームのステップ数で割った値 |
| `checksum` | 計算結果の和。シミュレーションのベンチでは、全試行の全フレームの末端ボーンの座標の和 |
| `calib_ms` | 試行ごとの較正ループの時間 |
| `limits_per_frame` | `SimpleWorldRead` だけが出す、1フレームで読むコリジョンの数 |

`PhysicsSettings` の `median_ms_per_frame` は1回の呼び出しあたりの値です。固定サブステップのベンチのステップ数は、1/90 秒のフレームを 1/60 秒のステップへ積む理論平均の `GAverageSubsteps`（60 / 90）で計算します。

`calib_ms` は本体と無関係な固定の計算にかかった時間で、その時点のマシンの状態を表します。ms が増えていても `calib_ms` も増えていれば、原因はコードよりマシンの負荷の可能性があります。

`checksum` はコードの変更の前後で値が変わらないことを確認するのに使います。性能の改善のつもりの変更で `checksum` が変わったら、計算結果も変わっています。

`KawaiiPhysics.Perf.Sizeof` は `TOOLCHAIN` と `SIZEOF` の行を出します。`FKawaiiPhysicsModifyBone`、`FKawaiiPhysicsSettings`、コリジョンの各構造体、`FModifyBoneConstraint`、`FKawaiiPhysics_ExternalForce` のサイズを確認できます。

## 変更箇所ごとに実行するテスト

| 変更する箇所 | 実行するテスト |
|---|---|
| 積分、サブステップ、`Simulate` | `KawaiiPhysics.Simulation`、`KawaiiPhysics.Perf.Chain`、`KawaiiPhysics.Perf.ChainLegacy` |
| コリジョンの形状と押し出し | `KawaiiPhysics.Collision`、`KawaiiPhysics.Simulation.GoldenPositions`、`KawaiiPhysics.SimpleWorld.CollisionPushOut`、`KawaiiPhysics.Perf.Collision` |
| Bone Constraint | `KawaiiPhysics.Simulation.BoneConstraintStepDeltaTime`、`KawaiiPhysics.Simulation.GoldenPositions`、`KawaiiPhysics.Perf.ConstraintHeavy` |
| 角度制限 | `KawaiiPhysics.AngleLimit`、`KawaiiPhysics.Collision.AngleLimit` |
| ダミーボーン、Subdivision | `KawaiiPhysics.Simulation` の `SyncBoneSubdivision*`、`BridgeDummyCollisionFeedback`、`SubdivisionCollisionOnlyRestore` |
| Sync Bone | `KawaiiPhysics.Simulation` の `SyncBoneSubdivision*` |
| Teleport | `KawaiiPhysics.Simulation.TeleportDiscardsComponentMove` |
| 物理設定、カーブ | `KawaiiPhysics.Simulation.PhysicsSettingsCurvePaths`、`KawaiiPhysics.Perf.PhysicsSettings` |
| ミラー | `KawaiiPhysics.Mirror` |
| 外力の基底、Custom External Force | `KawaiiPhysics.ExternalForce` |
| 実行時の一時外力、要求キュー | `KawaiiPhysics.TransientForce` |
| Procedural Wind | `KawaiiPhysics.ProceduralWind`、`KawaiiPhysics.WindPreset`、`KawaiiPhysics.Editor.WindScopeEditPanel.Definitions`、`KawaiiPhysics.Perf.ExternalForceFilter` |
| Settings Multiplier | `KawaiiPhysics.SettingsMultiplier`、`KawaiiPhysics.Sequencer` |
| Shared Collision | `KawaiiPhysics.SharedCollision` |
| Shared Publisher | `KawaiiPhysics.SharedPublisher`、`KawaiiPhysics.Editor.SharedPublisher`、`KawaiiPhysics.ProceduralWind`、`KawaiiPhysics.SimpleWorld.Regression` |
| Simple World Collision | `KawaiiPhysics.SimpleWorld`、`KawaiiPhysics.Perf.SimpleWorldRead` |
| `UKawaiiPhysicsLibrary`、プロパティアクセス | `KawaiiPhysics.Library`、`KawaiiPhysics.PropertyAccess` |
| `FAnimNode_KawaiiPhysics` への `UPROPERTY` の追加 | `KawaiiPhysics.Preset.PropertyClassification`、`KawaiiPhysics.Editor.CategoryConsistency` |
| プリセット | `KawaiiPhysics.Preset`、`KawaiiPhysics.EditorScripting.Preset`、`KawaiiPhysics.Editor.PresetDiffSnapshot` |
| Details、カテゴリ | `KawaiiPhysics.Editor.CategoryConsistency`、`KawaiiPhysics.Editor.SharedPublisher.CategoryConsistency`、`KawaiiPhysics.AngleLimit.Editor` |
| タブの登録 | `KawaiiPhysics.Editor.DockableTabs` |
| Wind Scope | `KawaiiPhysics.Editor.WindScope`、`KawaiiPhysics.Editor.WindScopeEditPanel.Definitions` |
| `UKawaiiPhysicsEditorLibrary` | `KawaiiPhysics.EditorScripting` |
| Edit Mode の描画スタイル | `KawaiiPhysics.Editor.EditorSettings` |
| `FKawaiiPhysicsModifyBone` などのレイアウト | `KawaiiPhysics.Perf.Sizeof` |

`SimulateOnce` や `SimulateModifyBones` の処理順を変えたら、ハーネスの `StepOnce` と `StepFrame` も同じ順序に直します。そうしないとテストが本番を反映しなくなります。

## Python のテスト

`KawaiiPhysicsToolset` のテストは C++ のモジュールと別に、`Content/Python/kawaii_physics_toolset/tests/` にあります。

| ファイル | 内容 | 実行環境 |
|---|---|---|
| `test_toolset.py` | ツールの呼び出し。`toolset_registry` の `ToolCallTestCase` を継承 | UE 5.8 のエディタ。サンプルのアセットを読む |
| `test_motion_metrics.py` | 動きの分析の計算 | `unreal` を import しない。標準ライブラリと `motion_metrics` だけに依存する |

どちらも `unittest` の形式です。`test_toolset.py` は `/Game/Test/PyToolset/` をテスト用のフォルダとして使います。

## CI

GitHub Actions のワークフローは `.github/workflows/version-consistency.yml` の1つだけです。UE を使うジョブは無く、Automation Test は CI で実行されません。

このワークフローは対象ファイルが変わった push と pull request で、`ubuntu-latest` の上で `python Tools/check_version_consistency.py` を実行します。対象は `README.md`、`README_ja.md`、`Fab_StoreDescription.md`、`Fab_StoreDescription.txt`、`Fab_Changelog.txt`、`KawaiiPhysics.uplugin`、スクリプト自身、ワークフロー自身です。

`check_version_consistency.py` は2種類の確認を行います。

| 確認 | 内容 |
|---|---|
| UE の対応バージョン | `README.md` と `README_ja.md` のバッジと本文、Fab の説明文の計7箇所から範囲を取り出し、最も多い値と比較 |
| プラグインのバージョン | `KawaiiPhysics.uplugin` の `VersionName` が `Fab_Changelog.txt` の見出し行にあるか確認 |

Fab 系のファイルはリポジトリで追跡されていないローカルの運用ファイルです。CI 上には存在しないので、スキップします。CI で実際に比較されるのは README の4箇所で、`VersionName` と更新履歴の確認は `Fab_Changelog.txt` がある手元の環境でだけ行われます。必須のファイル（`README.md`、`README_ja.md`、`KawaiiPhysics.uplugin`）が無ければ失敗します。`README_en.md` は確認の対象ではありません。

## 変更するときの注意

- テストを追加したら `EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter` を指定し、`KawaiiPhysics.<領域>` の名前を付けます。領域は上の表に揃えます。
- ファイル全体を `#if WITH_DEV_AUTOMATION_TESTS` で囲みます。
- テストのヘルパーは、`KawaiiPhysicsGoldenTestPrivate` のようにファイルごとの `<ファイル名>Private` 名前空間に置きます。
- 本体の private へのアクセスは `FKawaiiPhysicsTestAccessor` に追加します。本体側の宣言を増やすときは `#if WITH_DEV_AUTOMATION_TESTS` で囲みます。
- テスト用のタグは `KP_DEFINE_TEST_GAMEPLAY_TAG_STATIC` で定義します。
- 設定を変更するテストは、デストラクタで元に戻すヘルパーを使います。

## 関連ページ

- [エディタモジュール](/docs/internals/editor-module)
- [エディタツール](/docs/internals/editor-tools)
- [シミュレーション](/docs/internals/simulation)
- [ノードのライフサイクルと1フレームの処理順](/docs/internals/frame-lifecycle)
- [改造ガイド](/docs/internals/modification-guide)
