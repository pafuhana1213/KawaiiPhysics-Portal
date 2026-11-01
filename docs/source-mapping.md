---
sidebar_class_name: hidden
---

# ソースコードとドキュメントの対応

このページはClaude Code用の内部ドキュメントです。

## ソースファイルとドキュメントのマッピング

| ソースファイル | ドキュメント |
|--------------|-------------|
| `AnimNode_KawaiiPhysics.h` | `docs/api/animnode-kawaiiphysics.md`, `docs/parameters/*.md` |
| `KawaiiPhysicsLibrary.h` | `docs/api/kawaiiphysics-library.md` |
| `KawaiiPhysicsLimitsDataAsset.h` | `docs/features/data-assets.md` |
| `KawaiiPhysicsBoneConstraintsDataAsset.h` | `docs/features/data-assets.md` |
| `KawaiiPhysicsCustomExternalForce.h` | `docs/features/external-force-presets.md` |
| `ExternalForces/*.h` | `docs/features/external-force-presets.md` |
| `AnimNotifies/*.h` | `docs/features/animnotify.md` |
| `KawaiiPhysicsSyncBone.h` | `docs/features/sync-bone.md` |

## 内部設計カテゴリ（`docs/internals/`）

ソースの処理順、データ構造、不変条件を説明する手動メンテナンスのページです。基準コミットは `docs/internals/overview.md` の注記に記載します。対象のソースを変更したら、該当ページの更新と基準コミットの見直しを行います。

| ソースファイル（`Plugins/KawaiiPhysics/Source/`） | ドキュメント |
|--------------|-------------|
| `KawaiiPhysics/Private/AnimNode_KawaiiPhysics.cpp` | `frame-lifecycle.md`, `overview.md` |
| `KawaiiPhysics/Private/AnimNode_KawaiiPhysicsSimulation.cpp` | `simulation.md`, `constraints-and-limits.md` |
| `KawaiiPhysics/Private/AnimNode_KawaiiPhysicsModifyBones.cpp` | `bone-model.md` |
| `KawaiiPhysics/Private/AnimNode_KawaiiPhysicsCollision.cpp`, `KawaiiPhysicsCollisionLimits.h` | `collision.md`, `constraints-and-limits.md` |
| `KawaiiPhysics/Private/KawaiiPhysicsAngleLimit.cpp` | `constraints-and-limits.md` |
| `KawaiiPhysicsSyncBone.h/.cpp`, `AnimNode_KawaiiPhysicsSyncBone.cpp` | `sync-bone.md` |
| `ExternalForces/*`, `KawaiiPhysicsCustomExternalForce.h` | `external-forces.md`, `procedural-wind.md` |
| `KawaiiPhysicsSharedCollisionSubsystem.h/.cpp` | `shared-collision.md`, `simple-world-collision.md`, `shared-publisher.md` |
| `KawaiiPhysicsSimpleWorldCollision.h/.cpp`, `KawaiiPhysicsGroundProvider.h` | `simple-world-collision.md` |
| `AnimNode_KawaiiPhysicsSharedPublisher.h/.cpp` | `shared-publisher.md` |
| `KawaiiPhysicsLibrary.h/.cpp`, `KawaiiPhysicsRuntimeInfoTypes.h` | `runtime-control.md` |
| `AnimNotifies/*`, `KawaiiPhysicsSequencer/*` | `animation-control.md` |
| `*DataAsset.h/.cpp`, `Config/DefaultKawaiiPhysics.ini` | `presets-and-data-assets.md` |
| `KawaiiPhysicsEd/*` | `editor-module.md`, `editor-tools.md` |
| `KawaiiPhysicsTests/*` | `testing.md` |
| 上記の変更全般 | `investigation-guide.md`, `modification-guide.md` |

## パラメータカテゴリとファイルの対応

| UPROPERTYカテゴリ | ドキュメントファイル |
|------------------|---------------------|
| `KawaiiPhysics` | `docs/parameters/physics.md` |
| `KawaiiPhysics|Collision` | `docs/parameters/collision.md` |
| `KawaiiPhysics|Limits` | `docs/parameters/limits.md` |
| `KawaiiPhysics|ExternalForce` | `docs/parameters/external-forces.md` |

## 自動更新対象

以下のファイルはソースコードから自動生成・更新されます：

- `docs/parameters/overview.md`
- `docs/parameters/physics.md`
- `docs/parameters/collision.md`
- `docs/parameters/limits.md`
- `docs/parameters/external-forces.md`
- `docs/api/animnode-kawaiiphysics.md`
- `docs/api/kawaiiphysics-library.md`
- `docs/changelog.md`

## 手動メンテナンス対象

以下のファイルは手動でメンテナンスします：

- `docs/intro.md`
- `docs/getting-started/*.md`
- `docs/features/*.md`
- `docs/advanced/*.md`
- `docs/internals/*.md`
- `docs/faq.md`

## 更新トリガー

1. KawaiiPhysicsリポジトリの新しいリリース
2. GitHub Actionsの手動実行
3. `/sync-docs` スキルの実行
