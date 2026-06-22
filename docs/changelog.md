---
sidebar_position: 101
title: "更新履歴"
---

# 更新履歴

<!-- AUTO-GENERATED: このページはリリースノートから自動生成されます -->

KawaiiPhysicsの更新履歴です。

最新のリリース情報は [GitHub Releases](https://github.com/pafuhana1213/KawaiiPhysics/releases) を参照してください。

## v1.21.x (UE 5.3 - 5.8対応)

### v1.21.0

**Fixed Substepping（フレームレート非依存化）**

シミュレーション全体を固定タイムステップ（`FixedDt = 1 / TargetFramerate`）でサブステップ実行し、フレームレートに依存しない安定した物理挙動を実現する機能が追加されました。**デフォルトで有効（ON）** です。

- **Project Settings > Plugins > Kawaii Physics** の `Use Fixed Substepping` / `Max Substeps` で制御
- **【挙動変更】デフォルトON化により、以前のバージョンと比べて揺れ方がわずかに変化する場合があります。従来挙動が必要な場合はOFFにしてください。**

詳細は [Fixed Substepping](/docs/advanced/fixed-substepping) を参照してください。

**Bone Subdivision（ボーン細分化）**

実スケルトンを変更せずに、実ボーンの間に仮想的なダミーを挿入してコリジョン判定の解像度を上げる機能が追加されました。

- `BoneSubdivisionCount` / `bBoneSubdivisionCollisionOnly` / `bBoneSubdivisionDensifyByRadius`（半径による密度補正）
- 横方向の **BoneConstraint Subdivision (bridge dummy)**: `BoneConstraintSubdivisionCount` / `BoneConstraintSubdivisionFeedbackScale` で列間の貫通を防止
- `BoneSubdivisionCount` と組み合わせると布面に2Dグリッド状のコリジョン点が並ぶ

詳細は [Bone Subdivision](/docs/features/bone-subdivision) を参照してください。

**Shared Collision（共有コリジョン）**

複数の KawaiiPhysics ノード（別々の SkeletalMeshComponent や ChildActor を含む）が、1つのコリジョン形状セットを共有できる機能が追加されました。

- Source / Target ロール + `SharedCollisionGroupTag` でグルーピング
- 同一 Actor/ChildActor ファミリー内で共有
- Blueprint API で Source/Target/タグをランタイム切り替え可能

詳細は [Shared Collision](/docs/features/shared-collision) を参照してください。

**Sync Bone の強化**

- 軸ごとの適用方向（`ApplyDirectionX/Y/Z`: Both/Positive/Negative/None）
- 距離減衰（`bEnableDistanceAttenuation` ほか）
- 子ボーンの自動展開（`bIncludeChildBones`）と長さ割合・移動距離によるスケールカーブ

**その他の改善**

- Wind に方向ノイズ `WindDirectionNoiseAngle` を追加
- プロジェクト全体設定 `KawaiiPhysicsDeveloperSettings`（固定サブステップ / ダミー生成数の警告しきい値）を新設
- 物理コアの自動テスト（UE Automation）基盤を追加し、回帰検出を強化
- UE5.8 のビルドエラー修正、各種パフォーマンス最適化

最新のリリース情報は [GitHub Releases](https://github.com/pafuhana1213/KawaiiPhysics/releases) を参照してください。

## v1.20.x (UE 5.7対応)

### v1.20.0

**Sync Bone機能**

物理制御下のボーンに対して、指定したボーンの移動・回転を適用する機能が追加されました。スカートが足を貫通するのを防ぐのに効果的です。

![SyncBone + Collision比較](/img/features/syncbone-collision-compare.webp)

*SyncBoneとCollisionの組み合わせによる貫通防止*

![SyncBone + BoneConstraint + Collision](/img/features/syncbone-full-demo.webp)

*SyncBone、BoneConstraint、Collisionを組み合わせた完全なデモ*

- 同期元ボーンの位置・回転を物理ボーンに反映
- コリジョンを使わずに貫通を防止
- パフォーマンスに優れた軽量な処理

**重力システムの改善**

![Gravity Demo](/img/features/gravity-demo.webp)

*Gravity Directionによる柔軟な重力制御*

![Gravity Settings](/img/features/gravity-settings.png)

- Gravity Directionパラメータを追加
- より柔軟な重力制御が可能に

**AnimNotifyState: Set Alpha**

アニメーション中に物理のブレンド率を動的に変更できるAnimNotifyStateが追加されました。

![AnimNotifyState SetAlpha](/img/features/animnotify-setalpha.png)

- アニメーションタイムライン上で物理の影響度を制御
- スムーズなブレンドイン/アウト

**デバッグ機能強化**

![Debug Draw改善](/img/features/debug-draw-box-plane.png)

*Box LimitとPlanar Limitのデバッグ表示*

- Box Limitのデバッグ表示を追加
- Planar Limitのデバッグ表示を改善
- GameplayTagによるデバッグフィルタリング

**新サンプル**

![新サンプル一覧](/img/features/sample-v120.png)

詳細は [GitHub Discussion #165](https://github.com/pafuhana1213/KawaiiPhysics/discussions/165) を参照してください。

## v1.19.x (UE 5.6対応)

### v1.19.0

**Simulation Space機能**

物理シミュレーションを行う座標空間を選択できるようになりました。

![Simulation Space設定](/img/features/simulation-space-settings.png)

| 値 | 説明 |
|-----|------|
| ComponentSpace | コンポーネント空間（デフォルト） |
| WorldSpace | ワールド空間 |
| BaseBoneSpace | 指定したボーン空間 |

WorldSpaceやBaseBoneSpaceを使用すると、Rootボーンの急激な移動・回転の影響を回避できます。

**Wind Noise機能**

風にノイズを加えて自然な揺れを実現できます。

| Wind Noise OFF | Wind Noise ON |
|----------------|---------------|
| ![Wind Noise OFF](/img/features/wind-noise-off.webp) | ![Wind Noise ON](/img/features/wind-noise-on.gif) |

**Move Scale機能**

移動の影響をスケーリングできます。

| Move Scale OFF | Move Scale ON |
|----------------|---------------|
| ![Move Scale OFF](/img/features/move-scale-off.webp) | ![Move Scale ON](/img/features/move-scale-on.gif) |

**サンプルプロジェクトの刷新**

![サンプルV2概要](/img/features/sample-v2-overview.png)

- 全サンプルを最新のベストプラクティスに更新
- 新機能のデモを追加

**BoneConstraint機能の正式化**

v1.14.0で実験的に導入されたBoneConstraint機能が正式版になりました。

**Fab配布開始**

Fabストアでの配布を開始しました。

- [Fab](https://www.fab.com/ja/listings/f870c07e-0a02-4a78-a888-e52a22794572)

詳細は [GitHub Discussion #155](https://github.com/pafuhana1213/KawaiiPhysics/discussions/155) を参照してください。

## v1.18.x (UE 5.5対応)

### v1.18.0

**著作権表記の追加**

- MITライセンスの著作権表記を全ソースファイルに追加

**パッケージングエラーの修正**

- 一部の環境でパッケージングに失敗する問題を修正

**その他の改善**

- UE 5.5への正式対応
- 軽微なバグ修正

詳細は [GitHub Discussion #145](https://github.com/pafuhana1213/KawaiiPhysics/discussions/145) を参照してください。

## v1.17.x (UE 5.3-5.5対応)

### v1.17.0

**複数RootBoneサポート**

1つのAnimNodeで複数のRootBoneを設定できるようになりました。

![Additional RootBones](/img/features/additional-rootbones.webp)

- `AdditionalRootBones` パラメータで追加のRootBoneを指定
- 各RootBoneに個別のExcludeBonesリストを設定可能
- 同じパラメータで複数のボーンチェーンを制御

**Box Limits**

直方体形状のLimitが追加されました。

![Box Limits](/img/features/box-limits.webp)

- 体や建物など、矩形に近い形状に最適
- オフセットと回転の調整が可能

**PhysicsAsset統合**

既存のPhysicsAssetからLimits形状を自動生成できるようになりました。

![PhysicsAsset for Limits](/img/features/physicsasset-limits.png)

- PhysicsAssetを指定するだけで自動変換
- 手動でのLimits設定作業を削減

**AnimNotifyサポート**

アニメーション通知から物理パラメータを制御できるようになりました。

![AnimNotifyState External Force](/img/features/animnotify-externalforce.webp)

![Blueprint Nodes](/img/features/bp-externalforce-nodes.png)

- AnimNotify_KawaiiPhysics_ResetDynamics
- AnimNotify_KawaiiPhysics_SetExternalForce

**GameplayTagサポート**

GameplayTagを使用してデバッグ対象をフィルタリングできます。

![Filter Tag](/img/features/filter-tag.png)

**Wind Directional Sourceサポート**

Unreal EngineのWind Directional Sourceに対応しました。

![Wind External Force](/img/features/wind-externalforce.png)

- レベルに配置した風の影響を自動的に受ける
- WindScaleで影響度を調整

**BoneConstraintエクスポート**

![Export BoneConstraint](/img/features/export-boneconstraint.png)

**新サンプル**

![v1.17サンプル](/img/features/sample-v117.png)

詳細は [GitHub Discussion #138](https://github.com/pafuhana1213/KawaiiPhysics/discussions/138) を参照してください。

## v1.16.x (UE 5.3-5.5対応)

### v1.16.0

**新しい外部力システム**

外部力の適用プロセスが大幅に改善されました。一部のボーンにのみ、ボーンのローカル座標系で一定間隔で力を加えることができる複数の外部力プリセットが追加されました。

![External Force設定1](/img/features/externalforce-settings1.png)

![External Force設定2](/img/features/externalforce-settings2.png)

![External Forceデモ](/img/features/externalforce-demo.webp)

- 複数のプリセットを組み合わせ可能
- C++でカスタムプリセットを実装可能

**Detailsパネルの整理**

![Details Panel](/img/features/details-panel.png)

![Property Tooltip](/img/features/property-tooltip.png)

- プロパティ名とカテゴリの再編成
- デバッグ機能をボタン化
- すべてのプロパティにツールチップを追加

**コンソール変数によるデバッグ**

![Console Debug](/img/features/console-debug.png)

レベル上でデバッグ可能な新しいコンソール変数を追加：

- `a.AnimNode.KawaiiPhysics.Enable`
- `a.AnimNode.KawaiiPhysics.Debug`
- `a.AnimNode.KawaiiPhysics.Debug.LengthRate`

**DataAssetの改善**

![Bone Hierarchy Picker](/img/features/bone-hierarchy-picker.png)

![Export Limits DataAsset](/img/features/export-limits-dataasset.png)

- ボーン選択が階層ピッカーで可能に
- AnimNodeのLimits設定をDataAssetにエクスポートするボタンを追加

詳細は [GitHub Discussion #128](https://github.com/pafuhana1213/KawaiiPhysics/discussions/128) を参照してください。

## v1.15.x

### v1.15.0

- UE 5.4対応
- パフォーマンス改善

詳細は [GitHub Discussion #117](https://github.com/pafuhana1213/KawaiiPhysics/discussions/117) を参照してください。

## v1.14.x (UE 5.0-5.2対応)

### v1.14.0

**BoneConstraint機能（実験的）**

骨間の距離拘束を行う BoneConstraint機能が追加されました。

![BoneConstraint Demo](/img/features/boneconstraint-demo.webp)

*スカートなどの布シミュレーションで効果的*

![BoneConstraint Parameters](/img/features/boneconstraint-params.png)

- 指定した骨間（BoneConstraints/Bone1, 2）の距離をXPBDを使用して維持
- `Bone Constraint Iteration Count Before/After Collision` で拘束処理の実行回数を指定可能
- DataAssetでの設定も可能
- 正規表現で拘束対象の骨セットを設定可能

![DataAsset Regex](/img/features/dataasset-regex.png)

**その他の改善**

- KawaiiPhysicsのAnimNodeが持つDataAssetをピンに公開できるようになりました
- Planar Limitの処理を最適化
- 物理処理部分のコードをリファクタリング

詳細は [GitHub Discussion #112](https://github.com/pafuhana1213/KawaiiPhysics/discussions/112) を参照してください。

## v1.13.x

### v1.13.0

**Warm Up機能**

物理の空回し（Warm Up）機能が追加されました。

<div style={{textAlign: 'left', margin: '20px 0'}}>
  <iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/stIOjZQh3Qw"
    title="Warm Up Feature Demo"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen>
  </iframe>
</div>

![Warm Up Parameters](/img/features/warmup-params.png)

- **Need Warm Up** が `true` かつ **Warm Up Frame** が1以上の場合、Warm Up処理が実行されます
- 実行後は Need Warm Up は `false` になります
- Warm Up Frameが大きいほど安定しますが、物理計算の回数が増えるため負荷が上がります

![AnimNode Functions](/img/features/animnode-functions.png)

v1.12.0から対応したAnimNode関数からWarm Upを有効にすることも可能です。

詳細は [GitHub Discussion #104](https://github.com/pafuhana1213/KawaiiPhysics/discussions/104) を参照してください。

## v1.12.x

### v1.12.0

- AnimNode関数を追加
- BlueprintからKawaiiPhysicsノードの状態を動的に変更可能に

詳細は [GitHub Discussion #103](https://github.com/pafuhana1213/KawaiiPhysics/discussions/103) を参照してください。

## v1.11.x (UE 4.27対応)

### v1.11.1

- UE 4.27最終対応バージョン

---

:::note
すべての変更内容は [GitHub Releases](https://github.com/pafuhana1213/KawaiiPhysics/releases) を参照してください。
:::
