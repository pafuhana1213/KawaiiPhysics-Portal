---
sidebar_position: 6
title: "ローカルコリジョン"
description: "ノードが持つコリジョン形状、データソースの統合、押し出し計算、World Collision、デバッグ描画、設定変更時の再構築を実装に沿って説明します。"
---

import DocFigure from '@site/src/components/DocFigure';

# ローカルコリジョン

:::warning 未正式リリース
このページで扱う Tapered Capsule、Collision Mirror、Simple World Collision は、KawaiiPhysics v1.22でリリース予定の機能です。開発中のため仕様が変更される場合があります。
:::

このページでは、形状の型、データソースの統合、押し出し計算、World Collision、デバッグ描画、設定変更時の再構築を説明します。Bone Constraint の解法は [拘束と制限](/docs/internals/constraints-and-limits)、Subsystem 側の処理は [Subsystem と Shared Collision](/docs/internals/shared-collision) と [Simple World Collision](/docs/internals/simple-world-collision) で扱います。

## このページの要点

**概要**

KawaiiPhysics のコリジョンは、ボーンの質点の `Location` を形状に応じて直接補正する処理で、物理エンジンのボディは作りません。形状の定義はノード設定、Data Asset、Physics Asset、Mirror、Shared Collision、Simple World Collision から集まり、どの由来でも同じ押し出し関数を通ります。

**設計**

形状のデータは4系統の配列に分かれ、いずれもノードのメンバです。押し出しの時点で配列はシミュレーション空間の値を持つので、どの系統も同じコードを通ります。形状のボーン追従は評価ごとに1回、派生値の再計算と押し出しはステップごとに行います。押し出しが書き換えるのは `Bone.Location` だけで、積分する点では、最終位置に残った押し出しが次のステップの速度の再構成にも使われます。

**理解のポイント**

- 形状の追従と押し出しは実行の頻度が異なります。サブステップの間、ボーンのポーズ目標は補間されますが、形状の位置は補間されません。
- 押し出しは形状ごとに1回適用するだけで、反復しません。後の形状や拘束、長さ復元によって、ボーンが形状の中へ戻る場合があります。
- `XxxLimitsData` を作り直す Apply 系の呼び出し元は2か所です。そのため、Editor を含むビルドと含まないビルドで、設定変更が反映されるタイミングが異なります。
- World Collision は形状の配列を使わず、Evaluate の中で UE の物理シーンへ同期スイープを発行します。スレッドと負荷の前提がほかの形状と異なります。

## 関連ファイル

| ファイル | 役割 |
|---|---|
| [`Public/KawaiiPhysicsCollisionLimits.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsCollisionLimits.h) | 形状の型、`ECollisionLimitType`、`ECollisionSourceType`、派生値キャッシュ |
| [`Private/AnimNode_KawaiiPhysicsCollision.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsCollision.cpp) | Apply 系、`UpdateXxxLimits`、`AdjustByXxxCollision`、Shared と Simple World のノード側の読み取り、寸法の空間変換 |
| [`Private/AnimNode_KawaiiPhysicsSimulation.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsSimulation.cpp) | `SimulateOnce` の中の押し出しの実行順 |
| [`Private/KawaiiPhysicsCollisionBuffer.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsCollisionBuffer.h) | `FKawaiiPhysicsCollisionBufferWriter`。Convex の入れ子配列を再利用する |
| [`Public/KawaiiPhysicsMirrorUtils.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Public/KawaiiPhysicsMirrorUtils.h) | Mirror の Offset 変換と複製 |
| [`Private/KawaiiPhysicsMirrorTableCache.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsMirrorTableCache.h) | PIE 用の Mirror テーブルのスナップショット |
| [`Private/KawaiiPhysicsLimitsDataAsset.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/KawaiiPhysicsLimitsDataAsset.cpp) | `UKawaiiPhysicsLimitsDataAsset`。`SourceType` と `Guid` の管理 |
| [`Private/AnimNode_KawaiiPhysicsDebug.cpp`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysics/Private/AnimNode_KawaiiPhysicsDebug.cpp) | `AnimDrawDebug`（CVar で有効にするワールド上の描画） |
| [`KawaiiPhysicsEd/Public/KawaiiPhysicsEditorSettings.h`](https://github.com/pafuhana1213/KawaiiPhysics/blob/master/Plugins/KawaiiPhysics/Source/KawaiiPhysicsEd/Public/KawaiiPhysicsEditorSettings.h) | Edit Mode の描画スタイル |

## 設計の要点

### 配列がデータの持ち主

コリジョンのデータは4系統の配列に分かれ、すべて `FAnimNode_KawaiiPhysics` のメンバです。押し出し関数は配列を引数に取るため、どの系統も同じコードを通ります。以下、形状ごとの配列を `XxxLimits` のようにまとめて書きます。

| 配列 | 内容 | 書き込む処理 | 対応形状 |
|---|---|---|---|
| `XxxLimits` | ノードに直接設定した形状 | Details、Edit Mode | Sphere、Capsule、Tapered Capsule、Box、Planar |
| `XxxLimitsData` | Data Asset、Physics Asset、Mirror 由来の形状 | `ApplyLimitsDataAsset`、`ApplyPhysicsAsset`、`ApplyMirrorLimits` | 同上 |
| `SharedXxxLimits` | 他ノードが公開した形状 | `UpdateSharedCollisionLimits` | 同上 |
| `SimpleWorldXxxLimits`、`SimpleWorldGroundBoxLimits` | Subsystem が収集したレベルの形状 | `UpdateSimpleWorldCollisionLimits` | Sphere、Capsule、Tapered Capsule、Box、Convex |

すべての配列は、押し出しの時点でシミュレーション空間の `Location` と `Rotation` を持ちます。`XxxLimits` と `XxxLimitsData` は `UpdateXxxLimits` がボーン姿勢から計算し、Shared と Simple World はワールド空間のスナップショットから変換します。

<DocFigure src="/img/generated/internals-collision-sources-ja.svg" alt="6種類のコリジョン入力が4系統の配列へ入り、共通の形状キャッシュと押し出し関数へ進む図" caption="左のデータソースから中央の配列を経て右の共通処理へ進み、Mirror はノードと両アセットの形状を複製します。" maxWidth={960} />

### 処理の順序

<DocFigure src="/img/generated/internals-collision-timing-ja.svg" alt="ステップ数が2、0、1の評価を並べ、形状追従とキャッシュ・押し出しの更新頻度を比較する時間軸" caption="形状追従は各評価で1回、PostApply 後のキャッシュ再計算と押し出しは各ステップで実行され、ステップ数0の評価では走りません。" maxWidth={960} />

コリジョンに関わる処理は、評価ごとに1回の部分とステップごとの部分に分かれます。

```text
EvaluateSkeletalControl_AnyThread
├─ ApplyLimitsDataAsset / ApplyPhysicsAsset / ApplyMirrorLimits   WITH_EDITOR のみ
├─ UpdateSphericalLimits ～ UpdatePlanarLimits                    XxxLimits、XxxLimitsData の順
├─ UpdateSharedCollisionLimits                                    Target のノードのみ
├─ UpdateSimpleWorldCollisionLimits                               bUseSimpleWorldCollision のとき
├─ SimulateModifyBones
│  ├─ PrepareWorldCollisionQueryCaches                            bAllowWorldCollision のとき
│  └─ SimulateOnce                                                サブステップごと
│     ├─ 積分、ダミーの配置、外力の PostApply
│     ├─ PrepareCollisionShapeCaches
│     ├─ AdjustByBoneConstraints                                  Before Collision の回数が正のとき、その回数だけ
│     ├─ AdjustByXxxCollision                                     ボーンごとに全形状
│     ├─ ApplyBridgeDummyCollisionFeedback
│     ├─ AdjustByBoneConstraints                                  After Collision の回数が正のとき、その回数だけ
│     └─ RestoreBoneLengthsAndLimits
├─ WriteSharedCollisionToSubsystem                                Source のノードのみ
├─ ApplySimulateResult
└─ AnimDrawDebug                                                  ENABLE_ANIM_DEBUG のとき
```

### スレッド境界

`UpdateXxxLimits` と `AdjustByXxxCollision` は `EvaluateSkeletalControl_AnyThread` の中で動きます。Shared と Simple World が使う Subsystem、owner Actor、SkeletalMeshComponent の参照は `OnInitializeAnimInstance` と `PreUpdate` でキャッシュし、読み取りは Subsystem 側のロックで保護された経路を使います。World Collision だけは Evaluate の中で同期スイープを発行します（[World Collision](#world-collision)）。

## 形状の型

全形状の基底は `FCollisionLimitBase` です。`DrivingBone`、`OffsetLocation`、`OffsetRotation` が設定値で、`Location`、`Rotation`、`bEnable` が実行時に書き換えられる値です。`SourceType` は定義元を示し、Apply 系の再構築、Edit Mode の色分け、ランタイム情報の取得が参照します。`Guid` と `Type` は `WITH_EDITORONLY_DATA` のみで、Edit Mode の削除と Data Asset への書き戻しで対象を特定するために使います。

| 型 | `ECollisionLimitType` | 固有の値 | 派生値キャッシュ |
|---|---|---|---|
| `FSphericalLimit` | `Spherical` | `Radius`、`LimitType`（Outer / Inner） | なし |
| `FCapsuleLimit` | `Capsule` | `Radius`、`Length` | `CachedStartPoint`、`CachedEndPoint`、`CachedFallbackPushDir` |
| `FTaperedCapsuleLimit` | `TaperedCapsule` | `Radius0`、`Radius1`、`Length` | 上記に `CachedSegment`、`CachedSegmentSizeSq` を加えたもの |
| `FBoxLimit` | `Box` | `Extent`（半分の大きさ） | `CachedBoxTransform`、`CachedLocalBox` |
| `FPlanarLimit` | `Planar` | `Plane` | `CachedNormal` |
| `FKawaiiPhysicsConvexLimit` | `Convex` | `LocalPlanes`、`LocalBounds`、`LocalVertices`、`LocalEdges` | `CachedConvexTransform` |

Capsule 系の軸はローカル Z です。`CachedStartPoint` が +Z 端、`CachedEndPoint` が -Z 端で、Tapered Capsule の `Radius0` は +Z 端、`Radius1` は -Z 端の半径です。`Length` は端球の中心間の距離です。

`FKawaiiPhysicsConvexLimit` だけは `USTRUCT` ではない素の C++ 構造体で、ノードや Data Asset からは定義できません。Simple World Collision の収集結果としてのみ現れます。`LocalVertices` と `LocalEdges` はデバッグ描画用で、`!UE_BUILD_SHIPPING` でのみ存在します。

### 派生値キャッシュ

`UpdateRuntimeCache` は `Location` と `Rotation` から計算できる値を前計算します。キャッシュは `PrepareCollisionShapeCaches` が `SimulateOnce` の中で毎ステップ再計算します。外力の `PostApply` がステップごとに Limit を書き換える可能性があるためで、同梱の外力に Limit を書き換えるものはありません。再計算するのは `bEnable` が true の要素だけです。

キャッシュのフィールドは `UPROPERTY` ではありません。Capsule、Tapered Capsule、Box、Planar の手書きの `operator=` もキャッシュを意図的にコピーしません。コメントによると、代入でコピーするとフィールド追加の漏れで値が静かに古くなるためです。Convex は手書きの `operator=` を持たないので、暗黙の代入で `CachedConvexTransform` もコピーし、`CopyConvex` も明示的にコピーします。一方、コピー構築は全形状とも暗黙の実装なのでキャッシュの値も運びます。Shared の変換で使う `auto Converted = Limit` や `TArray` の `Append` は古いキャッシュを持ったまま配列へ入るので、`AdjustByXxxCollision` の前に `PrepareCollisionShapeCaches` を必ず通すことが正しさの前提です。テスト `KawaiiPhysics.SimpleWorld.CollisionPushOut` は古いキャッシュを注入して再計算を確かめています。

## データソースの統合

`XxxLimitsData` は1本の配列に3種類の由来が混ざり、`SourceType` で区別します。Apply 系の関数は同じ順序で呼ばれます。

```text
ApplyLimitsDataAsset   SourceType が DataAsset の要素を消し、アセットの配列を末尾へ追加
ApplyPhysicsAsset      SourceType が PhysicsAsset の要素を消し、Body から作った形状を末尾へ追加
ApplyMirrorLimits      SourceType が Mirror の要素を消し、複製を末尾へ追加
```

各関数は自分の由来だけを消して末尾へ足すので、3つを順に呼んだ後の並びは常に DataAsset、PhysicsAsset、Mirror です。`ApplyMirrorLimits` は DataAsset と PhysicsAsset の要素も複製元にするため、最後に呼ぶ必要があります。ヘッダのコメントもこの順序を要求しています。

呼び出し元は `Initialize_AnyThread` と、`EvaluateSkeletalControl_AnyThread` の `WITH_EDITOR` のブロックの2か所だけです。`Initialize_AnyThread` は先に `XxxLimitsData` を `Empty` します。

### Data Asset

`ApplyLimitsDataAsset` はアセットの配列を値でコピーし、`DrivingBone.Initialize` を呼びます。ノードごとに自分のコピーを持つので、同じアセットを参照するノードが `Location` を書き換えても互いに影響しません。

この関数は `SourceType` を設定しません。アセットの要素は `SourceType == DataAsset` である前提です。値を設定するのは `UKawaiiPhysicsLimitsDataAsset::PostEditChangeChainProperty`（`ArrayAdd` と `ValueSet`）と、`UAnimGraphNode_KawaiiPhysics::ExportLimitsDataAsset` です。

### Physics Asset

`ApplyPhysicsAsset` は `SkeletalBodySetups` を走査し、`AggGeom` の `SphereElems`、`SphylElems`、`TaperedCapsuleElems`、`BoxElems` を対応する型へ変換します。Box の `Extent` は `FVector(X, Y, Z) / 2` です。`ConvexElems` は読みません。ボーンが `IsValidToEvaluate` を満たさない Body はスキップされ、その形状の要素自体が作られません。Tapered Capsule の半径は入れ替えずにそのままコピーします。テストのコメントによると、`FKTaperedCapsuleElem` も `Radius0` が +Z 端だからです（`KawaiiPhysics.Collision.TaperedCapsulePhysicsAssetImport`）。

### Mirror

`ApplyMirrorLimits` は `MirrorDataTableForLimits` のボーン対応と参照ポーズから、複製元の形状をミラー先ボーンへ複製します。テーブルがない、`MirrorAxis` が `None`、Skeleton がない場合は Mirror の要素を消して終了します。Skeleton がない場合だけ警告を出します。Shipping 以外ではノードごとに1回に抑え、設定変更による `ModifyBones` の再構築で抑制を解除します。Shipping にこの抑制はありません。

複製元は形状の種類ごとに `XxxLimits` と `XxxLimitsData` の2回に分けて処理します。古い Mirror の要素は冒頭で消してあるので、Mirror の複製を再度複製することはありません。作った要素は `NewLimits` へ集め、走査が終わってから `DrivingBone.Initialize` して `XxxLimitsData` へ追加します。

`KawaiiPhysicsMirrorUtils::AppendMirroredLimits` は要素ごとに次を判定します。

- ミラー先ボーンを解決できない要素はスキップします。自分自身へ対応する中央のボーンと、`DrivingBone` が空の要素（床用の Planar など）がこれに当たります。
- `bSkipMirroredBoneWithExistingCollision` が true のとき、ミラー先ボーンに同じ形状の配列で Mirror 以外の要素があればスキップします。他の形状は判定に影響しません。
- `MirrorOffsetLocation` は Offset を複製元ボーンの参照回転でコンポーネント空間へ移し、`MirrorAxis` で反転し、ミラー先ボーンのローカルへ戻します。`MirrorOffsetRotation` も参照回転を基準に変換します。参照回転は Mesh の RefSkeleton から `BuildComponentSpaceRefRotations` で作ります。
- 半径などの寸法は `TLimit NewLimit = Source` のコピーをそのまま使います。

Tapered Capsule には追加の処理があります。鏡映は回転で表せないため、反射軸によっては複製後の +Z 端が鏡像の -Z 端側に来ます。`PreserveMirroredEndpointMeaning` は期待する +Z 方向と実際の +Z 方向を比べ、逆向きなら `Radius0` と `Radius1` を交換します。

### WITH_EDITOR で毎評価走る理由

`EvaluateSkeletalControl_AnyThread` の `WITH_EDITOR` のブロックは、Apply 系と `ApplyBoneConstraintDataAsset` を毎評価呼びます。コードのコメントは目的を「他のNodeでの編集を同期する」と書いています。`XxxLimitsData` はアセットのコピーなので、Edit Mode で1つのノードからアセットを編集しても、他のノードのコピーは Apply を呼ぶまで変わりません。毎評価作り直すことで、Data Asset の編集がアセットを参照する全ノードへ反映され、PIE でも `XxxLimits` の編集が Mirror へ即座に届きます（`KawaiiPhysics.Mirror.TableCache.LiveLimits`）。

このブロックがあるのは Editor を含むビルドだけです。Editor を含まないビルドでは Apply 系は `Initialize_AnyThread` でしか呼ばれません。

PIE では `ApplyMirrorLimits` の前処理である `FillMirrorBoneIndexes` と `BuildComponentSpaceRefRotations` の結果を `FKawaiiPhysicsMirrorTableCache` に保持します。キャッシュするのは Skeleton 由来の2つのテーブルだけで、Limit の複製は毎回行います。`bCacheMirrorTablesForPIE` は `OnInitializeAnimInstance` で `WorldType == EWorldType::PIE` のとき true になり、Persona のプレビューはキャッシュを持ちません。

`Matches` はテーブルと Skeleton の同一性に加えて、テーブルの行、Skeleton のボーン名、Mesh の階層と参照回転を内容で比較します。コメントによると、エディタのトランザクションや配列のその場編集はプロパティの通知を出すとは限らないためです。スナップショットは不変で `TSharedPtr<const ...>` で持つので、コピーされたノード同士で共有できます。

## UpdateXxxLimits: 毎評価のボーン追従

`UpdateSphericalLimits`、`UpdateCapsuleLimits`、`UpdateTaperedCapsuleLimits`、`UpdateBoxLimits`、`UpdatePlanarLimits` は同じ手順で、`XxxLimits` と `XxxLimitsData` に1回ずつ呼ばれます。

1. `DrivingBone.IsValidToEvaluate` を確認します。無効なら `bEnable = false` にして次の要素へ進みます。
2. `Output.Pose` から `DrivingBone` のコンポーネント空間 Transform を取り、ボーン空間で `OffsetRotation` と `OffsetLocation` を加え、コンポーネント空間へ戻します。
3. `ConvertSimulationSpaceTransform` でシミュレーション空間へ変換し、`Location` と `Rotation` へ書き、`bEnable = true` にします。

`Radius`、`Length`、`Extent` などの寸法はここでは変更しません。

`UpdatePlanarLimits` だけ追加の処理があります。`Rotation` を正規化し、`Plane` を `Location` と `Rotation.GetUpVector()` から作り直します。また `DrivingBone` が空の要素は床用として扱い、`OffsetLocation` と `OffsetRotation` をコンポーネント空間の Transform として使って `bEnable = true` にします。他の形状では、`DrivingBone` が空の要素は無効になります。

## AdjustByXxxCollision: 押し出し

### ボーンごとの処理順

`SimulateOnce` は `bSkipSimulate` が false のボーンを1回走査し、ボーンごとに全形状を適用します。コメントによると、形状ごとにループを分けると `ModifyBones` を複数回走査してキャッシュ効率が落ちるためです。対象にはダミーボーンと bridge dummy も含まれます。root は `bSkipSimulate` が true なので対象外です。

| 順 | 形状 | 条件 |
|---|---|---|
| 1 | Sphere、Capsule、Tapered Capsule、Box、Planar の順に、それぞれ `XxxLimits`、`XxxLimitsData` | なし |
| 2 | `SharedXxxLimits` を同じ形状順で | `bUseSharedCollision && !bSharedCollisionSource` |
| 3 | `SimpleWorldXxxLimits` を Sphere、Capsule、Tapered Capsule、Box、Ground Box、Convex の順で | `bUseSimpleWorldCollision` かつ `CVarSimpleWorldCollisionEnable` |
| 4 | `AdjustByWorldCollision` | `bAllowWorldCollision` |

各関数は1回ずつ適用するだけで、反復はしません。後の形状の押し出しが前の形状の中へ戻しても、そのステップでは補正されません。

押し出し関数が書き換えるのは `Bone.Location` だけです。次のステップの速度は `Location - PrevLocation` から計算するので、押し出した量は速度にも反映されます。

### 形状ごとの比較

表の `r` は `Bone.PhysicsSettings.Radius` です。

| 形状 | 押し出しの基準 | 発動条件 | 補正後の位置 | 使うボーン情報 |
|---|---|---|---|---|
| Sphere（Outer） | 中心からの距離 | 距離が `Radius + r` 以下 | 中心から外向きに `Radius + r` | `Location`、`r` |
| Sphere（Inner） | 中心からの距離 | 距離が `Max(Radius - r, 0)` 以上 | 中心から `Max(Radius - r, 0)` | `Location`、`r` |
| Capsule | 軸線分上の最近点 | 距離が `Radius + r` 未満 | 最近点から `Radius + r` | `Location`、`r` |
| Tapered Capsule | 軸線分上の最近点。半径は射影位置 `T` で補間 | 距離が補間半径 + `r` 未満 | 最近点から補間半径 + `r` | `Location`、`r` |
| Box | Box ローカルの最近点 | 球と AABB が交差 | 中心が外側なら最近点から `r`、内側なら最小貫通軸の面から `r` | `Location`、`r` |
| Planar | 平面への射影点 | 距離が `r` 未満、または `Location` と `PrevLocation` の線分が平面を横切る | 射影点から法線方向に `r` | `Location`、`PrevLocation`、`r` |
| Convex | ローカル平面の符号付き距離の最大値 | `LocalBounds` と交差し、最大値が `r` 未満 | 最大値の平面の法線方向に、距離が `r` になる位置 | `Location`、`r` |
| World | 球スイープのヒット | ブロッキングヒットあり | ヒット位置、または貫通の解消位置 | `PrevLocation`、`Location`、`r`、`BoneRef.BoneName` |

`PrevLocation` を見るのは Planar と World だけです。`PrevLocation` はステップの積分前の位置なので、この2つは1ステップで形状を通り抜けた場合も検出できます。他の形状は現在の `Location` だけで判定します。Convex のコメントは、トンネリング対策を Box / Capsule と同様に持たないと明記しています。

### 形状ごとの計算

**Sphere** は `bEnable` が false か `Radius <= 0` の要素をスキップします。Outer で距離が `KINDA_SMALL_NUMBER` 以下の場合は押し出し方向がないので動かしません。Inner の内半径を `Max(Radius - r, 0)` にしているのは、ボーン半径がスフィア半径以上のときに内半径が負になり反対側へ飛ぶのを防ぐためで、その場合は中心にピン留めされます。

**Capsule** は `bEnable` が false、`Radius <= 0`、`Length <= 0` のいずれかの要素をスキップします。`FMath::ClosestPointOnSegment` の最近点から `PushDir` を求め、ボーンが軸上にあって方向が消える場合は `CachedFallbackPushDir`（ローカル X 軸）を使います。

**Tapered Capsule** は両方の半径が 0 以下の要素をスキップします。`UsesSphereFallback` が true のとき、つまり `Max(Length, 0) <= Abs(Max(Radius0, 0) - Max(Radius1, 0)) + KINDA_SMALL_NUMBER` のとき、小さい端球は大きい端球に包含されるので、大きい端球の球として判定します。通常のケースでは、ボーンを軸へ射影した `T`（0 が +Z 端）を求め、`Lerp(Radius0, Radius1, T)` を 0 でクランプした半径で判定します。コメントによると、これは Chaos の `PhiWithNormal` に準拠した近似で、2球の凸包の厳密な距離とは異なります。Edit Mode の表示もこの形状に合わせています。方向が消える場合のフォールバックは Capsule と同じです。

**Box** は `CachedBoxTransform` でボーンをローカルへ変換し、`FMath::SphereAABBIntersection` で交差を調べます。中心が内側か境界上にある場合は、貫通が最小の軸を選び、その軸の面の外へ `r` だけ押し出します。同値のときは X、Y、Z の順に選びます。コメントによると、放射方向へ押し出すと薄く広い Box（地面）で横滑りして内部から抜けないためです。境界のごく直外で最近点との距離が `KINDA_SMALL_NUMBER` 以下の場合も同じ分岐へ入れ、`GetSafeNormal` がゼロになる隙間を塞いでいます。中心が外側にある場合は、最近点から `r` だけ押し出します。

**Planar** は `FVector::PointPlaneProject` で射影点を求めます。距離が `r` 未満か、`Location` と `PrevLocation` の線分が平面と交差すると、射影点 + `CachedNormal * r` へ移します。結果は常に法線の正の側です。線分が平面を横切らず、`r` 以上離れて裏側にあるボーンは動きません。

**Convex** は `bEnable` が false か `LocalPlanes` が空の要素をスキップします。ボーンをローカルへ変換し、`LocalBounds` で早期に棄却した後、全平面の `PlaneDot` の最大値を探します。最大値が `r` 未満なら、その平面の法線方向へ `r - 最大値` だけ動かします。同値のときは先の平面を使います。エッジやコーナーの近くでは、この最大値は真の球と凸包の距離の下界になり、わずかに過剰に押し出します。コメントはこれを Tapered Capsule と同じく意図的な近似としています。

## Shared と Simple World との境界

Shared と Simple World の Subsystem 側の処理は別ページで説明します。`AnimNode_KawaiiPhysicsCollision.cpp` に含まれるのは、ノード側の読み書きと、ワールド空間からシミュレーション空間への変換です。押し出し関数は共用なので、Limit 配列ができた後の処理に区別はありません。

| 関数 | 実行条件 | 動作 |
|---|---|---|
| `WriteSharedCollisionToSubsystem` | Source のノード。`SimulateModifyBones` の後 | `XxxLimits` と `XxxLimitsData` の `bEnable` が true の要素をワールド空間へ変換し、`Publish` する |
| `UpdateSharedCollisionLimits` | Target のノード。`UpdateXxxLimits` の後 | `SharedXxxLimits` を `Reset` し、`ReadMerged` の結果をシミュレーション空間へ変換して追加する |
| `UpdateSimpleWorldCollisionLimits` | `bUseSimpleWorldCollision` のノード。Shared の読み取りの後 | シリアルの変化を見て、スナップショットの取り直しか、その場の変換を行う |

Shared は Convex を公開しません。`UpdateSharedCollisionLimits` は Convex の出力に `nullptr` を渡します。Simple World は Planar を持たず、Planar の出力に `nullptr` を渡します。Source のノードは自分の `SharedXxxLimits` を使いません。

### 寸法の空間変換

`XxxLimits` と `XxxLimitsData` は寸法を変換しません。Shared と Simple World はワールド空間のスナップショットを経由するので、`ComputeLimitDimensionMapping` で寸法も変換します。Shared の場合は公開時にシミュレーション空間からワールド空間へ、読み取り時にワールド空間からシミュレーション空間へ、2回変換します。

`ComputeLimitDimensionMapping` は基底の3軸を `ConvertSimulationSpaceVector` で写し、列の長さと直交性から相似変換かどうかを判定します。許容値は `LimitDimensionSimilarityTolerance`（`1e-9`）です。

| 形状 | 相似変換 | それ以外 |
|---|---|---|
| Sphere | `Radius` に倍率を掛ける | `Radius` に `ConservativeScale` を掛ける |
| Capsule | `Radius` と `Length` に倍率を掛ける | 両端点を変換して中心、長さ、軸を求める。`Radius` は `ConservativeScale` を掛ける |
| Tapered Capsule | 両半径と `Length` に倍率を掛ける | 軸は Capsule と同じ。両半径を大きい方 × `ConservativeScale` にそろえ、通常のカプセルとして扱う |
| Box | `Extent` に倍率を掛ける | 元の8頂点を変換し、変換先の回転に沿う包含箱を作る |
| Convex | 平面の `W`、`LocalBounds`、`LocalVertices` に倍率を掛ける | 同じ処理を `ConservativeScale` で行う |
| Planar | 寸法の変換なし。`Plane` を作り直す | 同左 |

相似変換の倍率は列の長さの最大値で、1 との差が許容値以内なら 1 にスナップして寸法をビット一致で保ちます。`ConservativeScale` は線形写像の最大特異値の上界で、Gram 行列の Gershgorin 行和 `RowSumBound` と `Trace` から `Max(Sqrt(Min(RowSumBound, Trace)), KINDA_SMALL_NUMBER)` で求めます。Sphere、Capsule、Tapered Capsule、Box は、非一様な写像でも像を包含する側へ近似します。Convex は平面の法線を変えず `ConservativeScale` で一様に拡大するだけなので、像を包含するとは限りません。

### 変換し直しとバッファの再利用

ワールド空間の形状は、スナップショットが変わらなくても、コンポーネントが動けばシミュレーション空間の値が変わります。`UpdateSimpleWorldCollisionLimits` は `Slot.GetPublishSerial()` を比べ（reader はメンバーのシリアルの合計も比べます）、変化があれば `CopyShapeLimits` と `CopySimpleWorldLimitsToSimulationSpace` で作り直します。変化がなければ `RefreshSimulationSpaceLimitsInPlace` で既存の要素を上書きします。配列の要素数がずれた場合は作り直しへ戻ります。Ground Box も同じ構成です。

`FKawaiiPhysicsConvexLimit` は `TArray` を持つので、外側の配列を `Reset` すると入れ子の確保が失われます。`FKawaiiPhysicsCollisionBufferWriter` は、生き残る Convex の入れ子配列を壊さずにスナップショットを作り直す型です。コンストラクタは Convex 以外の5配列だけを `Reset` し、`AddConvex` は既存の要素を添字順に上書きし、デストラクタが `SetConvexCount` で要素数を確定します。余った要素はこのとき破棄されます。追記用のコンストラクタでは、要素数の確定は呼び出し側が行います。コメントは、使われない形状を容量のキャッシュとして残さないと明記しています。

ノード側は `CopySimpleWorldLimitsToSimulationSpace` で静的関数の `SetConvexCount` と `CopyConvex` だけを使い、Writer のインスタンスは Subsystem と Simple World の収集側が使います。`ApplyScaledConvexDimensions` も確保済みの配列を再利用し、毎回 `Source` の寸法から代入します。

## World Collision

`bAllowWorldCollision` は既定で false です。ヘッダのコメントは、有効にすると負荷が大幅に上がると書いています。

### クエリ設定のキャッシュ

`PrepareWorldCollisionQueryCaches` は `SimulateModifyBones` の冒頭で1回だけ呼ばれ、サブステップとボーンのループの前に `FCollisionQueryParams`、トレースチャンネル、レスポンスを構築します。`bOverrideCollisionParams` が true なら `CollisionChannelSettings` を使い、false なら `OwningComp` の設定を読みます。`bIgnoreSelfComponent` が true のときは `AddIgnoredComponent` で自分のコンポーネントを除外します。

### スイープ

`AdjustByWorldCollision` は `PrevLocation` と `Location` をワールド空間へ変換し、球でスイープします。球の半径は `Bone.PhysicsSettings.Radius` をそのまま使い、空間変換しません。シミュレーション空間とワールド空間の間にスケールがあると、ローカル形状の判定とは位置に対する半径の比率が異なります。半径が `KINDA_SMALL_NUMBER` 以下のボーンはスキップします。コメントによると、半径 0 の球では sweep が無効になり押し戻しが効かないためです。`ParentIndex < 0` のボーンもスキップしますが、bridge dummy はコリジョンの代理として参加します。

`bIgnoreSelfComponent` で経路が分かれます。

- true の場合は `SweepSingleByChannel` です。
- false の場合は `SweepMultiByChannel` です。結果を `WorldCollisionHitsScratch` で受け、ブロッキングヒットを先頭から調べます。自分のコンポーネントのボーンへのヒットは、ボーン名が処理中のボーン、`IgnoreBones`、`IgnoreBoneNamePrefix` のいずれかに一致すると無視します。最初の無視しないヒットを採用します。

採用したヒットが `bStartPenetrating` なら、スイープ終点 + `Normal * PenetrationDepth` を新しい位置にします。それ以外は `Result.Location` です。結果はシミュレーション空間へ戻して `Bone.Location` へ書きます。`IgnoreBoneNamePrefix` の `FString` 版は配列の変更を検出して遅延で作り直し、プレフィックスがなければ `ToString` を避けます。

### Worker スレッドからの同期スイープ

このスイープは Evaluate の中で同期的に発行されます。ヘッダのコメントは、並列評価中に physics scene が read-safe であることを前提とし、評価中のコリジョン構成の動的な変更には対応しないと書いています。`PrepareWorldCollisionQueryCaches` のコメントにある通り、トレースはゲームスレッド上で実行されないため、`TraceTag` のデバッグトレースは描画されません。

スイープは1ステップにつき対象ボーンごとに最大1回発行されるので、サブステップの回数に比例して増えます。処理時間は `STAT_KawaiiPhysics_WorldCollision` で確認できます。`STAT_KawaiiPhysics_NumWorldCollisionChecks` は `AdjustByWorldCollision` の呼び出し回数で、スイープせずに return した呼び出しも含みます。`SimulateOnce` ごとに上書きするので、値は直近のステップの分です。

## デバッグ描画

描画の経路は2つあり、対象も色の決め方も異なります。

| | `AnimDrawDebug` | Edit Mode |
|---|---|---|
| 場所 | `AnimNode_KawaiiPhysicsDebug.cpp` | `KawaiiPhysicsEditMode.cpp` |
| 有効条件 | `ENABLE_ANIM_DEBUG`、Preview World 以外、`bRecentlyRendered`、`a.AnimNode.KawaiiPhysics.Debug` | ノードを選択中、Alpha が有効、直近に評価された、形状ごとの `bEnableDebugDrawXxxLimit` |
| 対象 | `XxxLimits`、`XxxLimitsData`、Shared（Target のみ）、Simple World | `XxxLimits`、`XxxLimitsData` |
| 色 | 固定 | `UKawaiiPhysicsEditorSettings` |
| `bEnable` | 見ない | Planar を除き、true の要素だけ描く |

### AnimDrawDebug

`EvaluateSkeletalControl_AnyThread` の最後で呼ばれます。色は `XxxLimits` がオレンジ、`XxxLimitsData` が青です。`XxxLimitsData` は由来によらず青で描きます。Shared は緑、Simple World は水色です。ボーンは実ボーンが黄、先端ダミーが赤、ボーン間ダミーが水色、bridge dummy が緑です。線の太さは `a.AnimNode.KawaiiPhysics.DebugDrawThickness`（既定 1.0）です。

Capsule の描画は `AnimDrawDebugCapsule` を使い、UE 5.6 以降でのみコンパイルされます。Box は `AnimDrawDebugBox` が6面の矩形を線で描きます。Tapered Capsule は `AnimDrawDebugTaperedCapsule` が押し出しと同じ断面プロファイルを線で描き、縮退条件を満たす場合は大きい端球だけを描きます。

Convex は `LocalVertices` と `LocalEdges` があれば辺を描きます。空のときは `LocalBounds` の Box で近似します。Simple World の Debug Draw の CVar を後から有効にした場合、次回の収集まで頂点とエッジが空だからです。

### Edit Mode の描画設定

`UKawaiiPhysicsEditorSettings` はエディタの環境設定に表示され、`EditorPerProjectUserSettings` へユーザーごとに保存されます。Sphere、Capsule、TaperedCapsule、Box、Planar の5つの `FKawaiiPhysicsCollisionDrawStyle` を持ち、スタイルごとに `AnimNodeColor`、`DataAssetColor`、`PhysicsAssetColor`、`MirrorColor` と境界線の設定があります。色のアルファ値が不透明度です。既定の不透明度は 0.5 で、`PhysicsAssetColor` だけ 0.2 です。Planar は `AnimNodeColor`、`DataAssetColor`、`MirrorColor` の不透明度が 0.3、`bDrawBorder` が false です。コンストラクタのコメントによると、平面は立体と違い奥の面が重ならないので、1層分に下げて同じ濃さに見せるためです。

`EnterMode` は形状と由来の組み合わせごとに `/Engine/EditorMaterials/PhAT_ElemSelectedMaterial` の `UMaterialInstanceDynamic` を作ります。`UpdateCollisionMaterials` が描画のたびに `SelectionColor` と `Opacity` へ設定値を書きます。ヒットテストは PhysicsAsset 以外で従来のマテリアルを使うので、不透明度 0 でもクリックで選択できます。

`XxxLimitsData` の要素は `SourceType` で色を分けます。クリックで選択できるのは AnimNode と DataAsset の由来だけで、PhysicsAsset と Mirror の由来は表示のみです。Mirror の要素は移動、回転、拡縮の操作でも編集しません。

## 状態とライフサイクル

| タイミング | コリジョンで起きること |
|---|---|
| `Initialize_AnyThread` | `XxxLimitsData` を `Empty` し、Shared の Slot を `MarkExpired` し、Shared と Simple World の配列とキャッシュをリセットして、Apply 系を実行する |
| `OnInitializeAnimInstance` | `bCacheMirrorTablesForPIE` を決め、`CachedMirrorTables` を解放する |
| `InitializeBoneReferences` | `XxxLimits` の `DrivingBone.Initialize` を呼ぶ。`XxxLimitsData` は対象外で、Initialize するのは Apply 系だけ |
| LOD の変更 | `DrivingBone` が `RequiredBones` から外れた要素は `UpdateXxxLimits` で `bEnable = false` になる |
| `ResetDynamics` | Limit の配列は変わらない。`TeleportType` の処理で `ModifyBones` が再構築される場合がある |
| `TeleportPhysics` | Simple World に `RequestRegather` を要求する。WorldSpace では通常の `SimulateModifyBones` をスキップするので、WarmUp を除いて押し出さない（`UpdateXxxLimits` は実行済み） |
| `DeltaTime <= 0` | 通常の `SimulateModifyBones` は何もしないので、WarmUp を除いて押し出さない |
| 固定サブステップの蓄積時間が1ステップに満たない評価 | `SimulateOnce` が0回になり押し出さない。`UpdateXxxLimits` は実行済み |
| WarmUp | `bNeedWarmUp` かつ `WarmUpFrames > 0` のとき、Teleport の判定より前に `SimulateModifyBones` を `WarmUpFrames` 回呼ぶ。固定サブステップが有効なら `DeltaTime` を固定ステップへ置き換えるので、評価の `DeltaTime` が 0 以下でも押し出しが走る。Limit はその評価で計算した位置のまま |
| 評価されないフレーム | Limit の `Location` は更新されない。次の評価で計算し直す |
| `SimulationSpace` の変更 | 配列の位置は同じ評価の `UpdateXxxLimits` と Shared / Simple World の読み取りが新しい空間で書く |

Teleport と `ResetDynamics` の詳細は [ノードのライフサイクルと1フレームの処理順](/docs/internals/frame-lifecycle) を参照してください。

## 設定変更時に再構築されるもの

`RequestModifyBonesReinit` は `ModifyBones` の再構築だけを要求します。`XxxLimitsData` は再構築しません。Apply 系の呼び出し元は2か所だけなので、Editor を含むビルドと含まないビルドで反映のタイミングが変わります。

| 変更 | 経路 | Editor を含むビルド | Editor を含まないビルド |
|---|---|---|---|
| `XxxLimits` の編集 | `PostEditChangeProperty` | `Guid` を一意化し、`ModifyBones` を空にして `ReconstructNode`。プレビューへは `CopyNodeDataToPreviewNode` でコピーする | 該当なし |
| Data Asset の中身の編集 | `PostEditChangeChainProperty`、`UpdateLimit` | 次の評価の Apply 系で全ノードへ反映する。`OnLimitsChanged` で Edit Mode が Details 表示用の配列を同期する | 該当なし |
| Data Asset の差し替え（Details） | `OnExternalNodePropertyChange` | 次の評価で反映する。Edit Mode は通知先を付け替える | 該当なし |
| `SetLimitsDataAsset`、`SetMirrorDataTableForLimits`、`SetSkipMirroredBoneWithExistingCollision` | `RequestModifyBonesReinit` | 次の評価の Apply 系で反映する | `ModifyBones` は再構築する。`XxxLimitsData` は次の `Initialize_AnyThread` で反映する |
| プロパティ名を指定する汎用の Set（`LimitsDataAsset`、`PhysicsAssetForLimits`、`MirrorDataTableForLimits` など） | `GetNodeModifyBonesReinitPropertyNames` | 同上 | 同上 |
| `ApplyPresetDataAsset` | `RequestModifyBonesReinit`、`RequestSharedCollisionReinit` | 同上。`XxxLimits` も上書きする | 同上。`XxxLimits` も上書きする |
| `bSharedCollisionSource`、`bUseSharedCollision`、`SharedCollisionGroupTag` | `RequestSharedCollisionReinit` | 次の評価の冒頭で Source の Slot を期限切れにし、`SharedXxxLimits` を `Reset` する | 同左 |
| Simple World の Source、Tag | `RequestSimpleWorldCollisionReinit` | Entry を解放して次の評価で初期化し直す | 同左 |
| Simple World の収集設定 | `UpdateSimpleWorldCollisionLimits` の Desc の差分検知 | Local の provider は差分があれば `SetDesc` で再送する。reader はこの比較に到達せず、provider の収集結果を読む | 同左 |

`DrivingBone.Initialize` を呼ぶのは Apply 系と `InitializeBoneReferences` だけです。`RequestModifyBonesReinit` は `InitializeBoneReferences` を呼びません。Data Asset 側の配列を実行時に書き換えても、Editor を含まないビルドでは次の `Initialize_AnyThread` まで `XxxLimitsData` へ反映されません。

## 他機能との関係

### サブステップ

`UpdateXxxLimits` は評価ごとに1回です。サブステップの中で `PoseLocation` は補間されますが、Limit の `Location` は補間されません。全サブステップが現在フレームの Limit 位置に対して判定します。ボーンの追従と Limit の移動の時間差を調べるときは、この非対称性を確認してください。詳細は [シミュレーション](/docs/internals/simulation) を参照してください。

### DrivingBone と入力ポーズ

`UpdateXxxLimits` が読むのは `Output.Pose` で、シミュレーション結果の適用前です。同じノードが揺らすボーンを `DrivingBone` に指定しても、Limit はそのノードの入力ポーズに追従します。

### Bone Constraint と長さ復元

コリジョンの前後で、`BoneConstraintIterationCountBeforeCollision` と `BoneConstraintIterationCountAfterCollision` が正のときにその回数だけ `AdjustByBoneConstraints` が走り、最後に `RestoreBoneLengthsAndLimits` が角度制限と平面制約とボーン長を適用します。押し出しの後に実行されるこれらの処理は `Location` を動かすので、ボーンが形状の中へ戻る場合があります。コリジョンの再判定はそのステップでは行いません。順序の詳細は [拘束と制限](/docs/internals/constraints-and-limits) を参照してください。

### ダミーボーン

`bBoneSubdivisionCollisionOnly` のボーン間ダミーは、積分をスキップして端点の間に配置され、押し出しの対象になります。ただし押し出しの結果は `RestoreBoneLengthsAndLimits` が端点の補間位置へ戻すので消え、実ボーンへは転送されません。

bridge dummy も積分をスキップして押し出しの対象になり、`ParentIndex < 0` でも `bSkipSimulate` が false です。押し出しの量は `ApplyBridgeDummyCollisionFeedback` が端点のボーンへ転送します。実ボーンへ変位を返すのはこの経路だけで、端点がボーン間ダミーの場合は実端点へ配分します。bridge dummy は端点のボーンが LOD で外れると `bSkipSimulate = true` になり、押し出しから外れます。詳細は [ボーンモデル](/docs/internals/bone-model) を参照してください。

## 変更するときの注意

### 守るべき不変条件

- `AdjustByXxxCollision` の前に `PrepareCollisionShapeCaches` を通します。キャッシュを `operator=` に追加しないでください。
- Apply 系は `ApplyLimitsDataAsset`、`ApplyPhysicsAsset`、`ApplyMirrorLimits` の順で呼びます。
- Apply 系は `SourceType` で自分の要素を見分けます。`XxxLimitsData` へ要素を足す経路を作るときは、`SourceType` と `DrivingBone.Initialize` まで同じ経路で設定します。`WITH_EDITOR` のビルドでは毎評価同じ関数が走るので、自分の要素を消せないと重複します。
- `XxxLimitsData` は Editor では毎評価作り直されます。要素へのポインタや参照を評価をまたいで保持しないでください。
- 配列に追加する形状は、押し出しの時点でシミュレーション空間の値を持つ必要があります。
- `AdjustByWorldCollision` と `PrepareWorldCollisionQueryCaches` は Evaluate の中で動きます。ゲームスレッド専用の API を呼ばないでください。

### 同時に直す箇所

Tapered Capsule の縮退条件は `FTaperedCapsuleLimit::UsesSphereFallback`、`AnimDrawDebugTaperedCapsule`、`KawaiiPhysicsEditModePrivate::DrawTaperedCapsuleSolverShape` の3か所にあります。Edit Mode と Debug は生の値から同じ条件を再計算するので、コメントも判定をそろえることを要求しています。

新しい形状や配列を足すときは、次を順に確認します。

| 箇所 | 内容 |
|---|---|
| `FKawaiiPhysicsSharedCollisionData`、`FKawaiiPhysicsCollisionBufferWriter` | Shared と Simple World に載せるか |
| Apply 系、`InitializeBoneReferences`、`UpdateXxxLimits` | データソースごとの追加と除去、`DrivingBone` の扱い |
| `ApplyScaledLimitDimensions` のオーバーロード | 寸法の空間変換 |
| `PrepareCollisionShapeCaches`、`SimulateOnce` のループ | キャッシュと押し出し |
| `Initialize_AnyThread`、`EvaluateSkeletalControl_AnyThread` | 無効化時のリセット、`STAT` の更新 |
| `AnimDrawDebug`、`FKawaiiPhysicsEditMode`、`UKawaiiPhysicsEditorSettings` | 描画と設定 |
| `UKawaiiPhysicsLimitsDataAsset`、`ExportLimitsDataAsset` | `UpdateLimit`、`Guid` の一意化、書き出し |
| `KawaiiPhysicsLibrary.cpp` のランタイム情報 | Convex 以外の全系統の配列を `Limits` へ列挙する。Convex は `NumConvexLimits` の件数だけを返す。Shared と Simple World の有効判定は `SimulateOnce` の条件を複製している |
| `KawaiiPhysicsTestHarness.h` の `StepOnce` | `SimulateOnce` のコリジョンループの一部を複製している。Shared、World Collision、bridge dummy の転送、`CVarSimpleWorldCollisionEnable` の条件は含まない |

### 守っているテスト

| テスト | 対象 |
|---|---|
| `KawaiiPhysics.Collision.*`（`SphereOuterPushOut`、`CapsulePushOut`、`TaperedCapsulePushOut`、`BoxInteriorPushOutToNearestFace`、`ConvexPushOut`、`PlanarPushOut`） | 各形状の解析解 |
| `KawaiiPhysics.Collision.TaperedCapsulePhysicsAssetImport` | Physics Asset の取り込み |
| `KawaiiPhysics.SimpleWorld.CollisionPushOut` | 古いキャッシュの再計算、Simple World の押し出し |
| `KawaiiPhysics.Mirror.*`（`SymmetricSkeleton`、`BuildComponentSpaceRefRotations`、`AppendMirroredLimits`、`TableCache.Invalidation`、`TableCache.LiveLimits`） | Offset 変換、スキップ条件、Tapered Capsule の半径、テーブルの無効化、再評価で重複しないこと |
| `KawaiiPhysics.SimpleWorld.ConvexBuffer.ReadReuse`、`PublishReuse` | Convex のバッファ再利用 |
| `KawaiiPhysics.SimpleWorld.ScaledConsumerKeepsWorldDimensions`、`NonUniformScaleMappingIsConservative`、`NonUniformTaperedCapsuleKeepsContainment`、`SimilarityMappingKeepsDimensionsExact`、`InPlaceRefreshMatchesRebuild` | 寸法の空間変換、その場の変換と作り直しの一致 |
| `KawaiiPhysics.SharedCollision.ScaledSourceAndTargetRoundTrip`、`RotatedNonUniformCapsulePublishContainsSource` | Shared の往復の変換 |
| `KawaiiPhysics.SimpleWorld.MergedDescCache` | Simple World の収集設定のマージ |
| `KawaiiPhysics.Simulation.BridgeDummyCollisionFeedback`、`SubdivisionCollisionOnlyRestore` | ダミーボーンの押し出しとの連携 |
| `KawaiiPhysics.Editor.EditorSettings.*` | Edit Mode の描画設定 |

## 関連ページ

- [シミュレーション](/docs/internals/simulation)
- [拘束と制限](/docs/internals/constraints-and-limits)
- [ボーンモデル](/docs/internals/bone-model)
- [Subsystem と Shared Collision](/docs/internals/shared-collision)
- [Simple World Collision](/docs/internals/simple-world-collision)
- [ランタイム制御と要求キュー](/docs/internals/runtime-control)
- [Data Asset とプリセット](/docs/internals/presets-and-data-assets)
- [エディタモジュール](/docs/internals/editor-module)
- [コリジョンのパラメータ](/docs/parameters/collision)
- [Mirror Data Table for Collision](/docs/features/collision-mirroring)
