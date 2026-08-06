---
sidebar_position: 100
title: "FAQ"
description: "KawaiiPhysicsのよくある質問と回答。トラブルシューティング、パフォーマンス、互換性、Fixed Substepping・Sync Bone・Shared Collisionなど最新機能について。"
---

# FAQ

よくある質問と回答です。最新版（v1.21.0、UE 5.3〜5.8対応）の実装に基づいています。

## 一般

### Q: KawaiiPhysicsは無料ですか？商用利用できますか？

**A:** はい、MITライセンスで無料で使用できます。商用プロジェクトでも利用可能です。ライセンス表記（著作権表記）のみお願いします。

### Q: PhysXやChaosとの違いは？

**A:** KawaiiPhysicsはPhysX/Chaosなどの物理エンジンを使用しない、独自の軽量アルゴリズムを採用しています。ボーンの長さを保ったまま揺らすため計算が破綻してもボーンが伸び縮みせず、アニメーションとの親和性が高く、動作が軽いのが特徴です。髪・スカート・胸などの「揺れもの」を手軽に表現する用途に最適です。

### Q: どこで入手できますか？

**A:** 以下のいずれからでも入手できます（内容は同じです）。

- **[GitHub Releases](https://github.com/pafuhana1213/KawaiiPhysics/releases/)** — C++ビルド環境がなくても使えるビルド済みバイナリ
- **[Fab](https://www.fab.com/ja/listings/f870c07e-0a02-4a78-a888-e52a22794572)** — v1.19.0から配布開始
- **[Booth](https://pafuhana1213.booth.pm/items/5943534)** — ストアをフォローすると更新通知が届きます

導入方法は [インストール](/docs/getting-started/installation) を参照してください。

### Q: どのバージョンのUEに対応していますか？

**A:** 各KawaiiPhysicsバージョンは複数のUEバージョンに対応しています。最新版は v1.21.x です。

| KawaiiPhysics | 対応UEバージョン |
|---------------|-----------------|
| v1.21.x       | 5.3, 5.4, 5.5, 5.6, 5.7, 5.8 |
| v1.20.x       | 5.3, 5.4, 5.5, 5.6, 5.7 |
| v1.19.x       | 5.3, 5.4, 5.5, 5.6 |
| v1.18.x       | 5.3, 5.4, 5.5 |
| v1.17.x       | 5.3, 5.4, 5.5 |
| v1.16.x       | 5.3, 5.4 |
| v1.14.x       | 5.0, 5.1, 5.2 |
| v1.11.1       | 4.27（UE4最終対応） |

## セットアップ

### Q: Root Boneは何を設定すればいいですか？

**A:** 物理を適用したいボーンチェーンの **親ボーン** を設定します。例えば髪の毛を揺らしたい場合、`head`や`spine_03`など、髪の親となるボーンを設定します。Root Bone自体は動かず、その子ボーンが物理で揺れます。

### Q: 複数の部位を物理させたい場合は？

**A:** 大きく2つの方法があります。

1. 部位ごとに別のKawaiiPhysicsノードを使う（部位ごとに異なるパラメータを設定したい場合に最適）
2. 1つのノードで [Additional Root Bones](/docs/features/bone-chain#additional-root-bones) を使い、複数のルートボーンを同じパラメータで制御する（v1.17.0以降。揺れ方を揃えたい場合に便利）

### Q: 特定のボーンだけ揺らしたくありません

**A:** `ExcludeBones` に除外したいボーンを指定してください。**指定したボーン自身とその子孫すべてが物理対象外** になります。Additional Root Bonesを使う場合は、各ルートごとに個別の除外リストを設定できます。

## トラブルシューティング

### Q: ボーンが動きません

**A:** 以下を確認してください。

1. Root Boneに子ボーンが存在するか
2. Stiffness（剛性）が高すぎないか（`0.05`程度から開始）
3. Animation Blueprintでノードが正しく接続され、Alphaが0になっていないか
4. コンソール変数 `a.AnimNode.KawaiiPhysics.Enable` が `0` になっていないか

### Q: 体を貫通してしまいます

**A:** まずコリジョン（Limits）を設定してください。Spherical / Capsule / Box Limits を追加し、体の形状に合わせて調整します。それでも隙間から貫通する場合は、以下も有効です。

- [Bone Subdivision](/docs/features/bone-subdivision)（v1.21.0）でボーン間にダミーを挿入し、コリジョン判定の解像度を上げる
- [Sync Bone](/docs/features/sync-bone) で足などの動きを揺れものに同期させ、めり込みを抑える
- [Bone Constraint](/docs/parameters/limits#bone-constraint) で布の裾同士の距離を保つ

### Q: スカートの裾が足を貫通してしまいます

**A:** スカートのような布は、コリジョンだけでは隙間から足が抜けやすいため、複数機能の併用が効果的です。

1. [Sync Bone](/docs/features/sync-bone)（v1.20.0〜、v1.21.0で強化）で足ボーンの動きをスカートに反映し、追従させる
2. [Bone Constraint](/docs/parameters/limits#bone-constraint) で隣り合うボーン間の距離を維持し、布が裂けたり伸びたりするのを防ぐ
3. [Bone Subdivision](/docs/features/bone-subdivision) の `BoneConstraintSubdivisionCount` で列（チェーン）間にコリジョン代理ダミーを挿入し、列間の隙間からの貫通を防ぐ

### Q: 動きが激しすぎます / 揺れすぎます

**A:** `Damping`（減衰）の値を上げてください。`0.1`〜`0.3`程度が一般的です。あわせて `Stiffness` を上げると元のアニメーション姿勢に戻りやすくなります。

### Q: フレームレートによって揺れ方が変わります

**A:** v1.21.0で追加された [Fixed Substepping](/docs/advanced/fixed-substepping)（固定タイムステップ）が **デフォルトで有効** です。これによりフレームレートに依存しない安定した挙動になります。もし揺れ方がフレームレートで変わる場合は、**Project Settings > Plugins > Kawaii Physics** の `Use Fixed Substepping` が有効か確認してください。低fpsやヒッチ時の暴走は `Max Substeps`（デフォルト4）で抑えられます。

### Q: v1.21にアップデートしたら揺れ方が変わりました

**A:** v1.21.0で [Fixed Substepping](/docs/advanced/fixed-substepping) がデフォルトON化されたため、以前のバージョンと比べて揺れ方がわずかに変化する場合があります。従来挙動が必要な場合は、**Project Settings > Plugins > Kawaii Physics** で `Use Fixed Substepping` を **OFF** にしてください。

### Q: キャラクターを瞬間移動（テレポート）させると揺れが暴れます

**A:** 急激な移動・回転を物理に反映しないようにします。

- `TeleportDistanceThreshold`（デフォルト`300`）/ `TeleportRotationThreshold`（デフォルト`10`度）を設定すると、1フレームでこの値を超える移動・回転を物理に反映しなくなります（[パラメータ詳細](/docs/parameters/physics#teleportdistancethreshold)）
- テレポート直後にBlueprintから `ResetDynamics` を呼ぶ、または `SetWorldLocation` を `ETeleportType::ResetPhysics` 付きで呼ぶと物理がリセットされます
- リセット後の見た目を安定させたい場合は Warm Up（後述）を併用してください

### Q: Rootボーンが大きく動くと揺れが破綻します

**A:** [Simulation Space](/docs/parameters/physics#simulationspace) を `ComponentSpace`（デフォルト）から `WorldSpace` または `BaseBoneSpace` に変更してください（v1.19.0〜）。コンポーネントやRootボーンの急激な移動・回転の影響を回避できます。`BaseBoneSpace` の場合は基準となるボーンを `SimulationBaseBone` で指定します。`ComponentSpace` 以外では微小なパフォーマンス低下が発生します。

### Q: スポーン直後や再生開始時に揺れが安定しません

**A:** Warm Up（物理の空回し）を使うと、定常状態から表示を開始できます。`bNeedWarmUp` を有効にし、`WarmUpFrames`（空回し回数）を設定してください（[パラメータ詳細](/docs/parameters/physics#warmupframes)）。`bUseWarmUpWhenResetDynamics` を有効にしておくと、`ResetDynamics` 後にも自動でWarm Upが実行されます。フレーム数が大きいほど安定しますが、その分だけ計算負荷が上がります。

### Q: パフォーマンスが悪いです

**A:** 以下を検討してください（詳細は [パフォーマンス最適化](/docs/advanced/performance)）。

1. 物理対象のボーン数・コリジョン数を減らす
2. 距離やLODに応じてAlphaを下げる／無効化する
3. `Bone Subdivision` や `Max Substeps` を上げすぎない（ダミー数・計算回数が増えます）
4. `Simulation Space` は必要な場合のみ `ComponentSpace` 以外にする
5. コンソール変数 `a.AnimNode.KawaiiPhysics.Debug` でデバッグ描画を切り忘れていないか確認する

## 機能

### Q: 風の影響を受けさせたいです

**A:** `bEnableWind` を有効にし、レベルに **Wind Directional Source** を配置してください。`WindScale` で影響度を、`WindDirectionNoiseAngle`（v1.21.0）で風向きのゆらぎを調整できます。演出目的の外力については [風と外部力](/docs/features/wind-and-forces) を参照してください。

### Q: 重力の方向を変えたいです

**A:** Gravity Direction で重力の向きを自由に設定できます（v1.20.0で柔軟化）。横方向の重力や無重力風の表現も可能です。詳細は [カスタム重力](/docs/advanced/custom-gravity) を参照してください。

### Q: アニメーション中だけ揺れを強めたい / 一時的に止めたい

**A:** [AnimNotify](/docs/features/animnotify) を使います。

- `AnimNotify / AnimNotifyState KawaiiPhysics AddExternalForce` で、特定の区間だけ外力を加える（攻撃モーションで髪を煽る等）
- [AnimNotifyState SetAlpha](/docs/advanced/runtime-control#animnotifystate-setalpha) で、アニメーションタイムライン上で物理のブレンド率をスムーズに変更する

### Q: ランタイムでパラメータを変更できますか？

**A:** はい。`UKawaiiPhysicsLibrary` の関数（`SetPhysicsSettings`、`SetGravity`、`SetWindScale`、`ResetDynamics` など）を使うか、Animation Blueprintの変数を通じて変更できます。詳細は [ランタイム制御](/docs/advanced/runtime-control) を参照してください。

### Q: Data Assetで設定を共有できますか？

**A:** はい。`KawaiiPhysicsLimitsDataAsset`（コリジョン）や `KawaiiPhysicsBoneConstraintsDataAsset`（ボーン拘束）を作成し、複数のキャラクターやノードで共有できます。AnimNodeの設定をDataAssetにエクスポートするボタンも用意されています。詳細は [Data Assets](/docs/features/data-assets) を参照してください。

### Q: 複数のメッシュや装備品でコリジョンを共有したいです

**A:** v1.21.0で追加された [Shared Collision](/docs/features/shared-collision)（共有コリジョン）を使用してください。`bSharedCollisionSource` を持つノードがコリジョン形状の供給元（Source）となり、`bUseSharedCollision` を有効にしたノード（Target）が同じ `SharedCollisionGroupTag` を介してそれを受け取ります。別々の SkeletalMeshComponent や ChildActor（本体と装備品など）の間でも、1つのコリジョンセットを共有できます。

## その他

### Q: バグを見つけました / 機能リクエストがあります

**A:** [GitHub Issues](https://github.com/pafuhana1213/KawaiiPhysics/issues) または [Discussions](https://github.com/pafuhana1213/KawaiiPhysics/discussions) でお知らせください。

### Q: もっと詳しい情報はどこにありますか？

**A:** 各機能の詳細は本サイトの各ページを、最新のリリース情報は [GitHub Releases](https://github.com/pafuhana1213/KawaiiPhysics/releases) と [更新履歴](/docs/changelog) を参照してください。
