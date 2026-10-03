---
sidebar_position: 1
slug: /preview
title: "v1.22予定の機能（開発中）"
description: "KawaiiPhysics v1.22予定の未正式リリース機能を紹介する試験的なドキュメント。"
---

import LegacyReference from '@site/src/components/LegacyReference';

# v1.22予定の機能（開発中）

:::warning 未正式リリース
この機能はまだ正式リリースされていません。KawaiiPhysics v1.22でリリース予定です。開発中のため仕様が変更される場合があります。
:::

ここでは開発中の実装をもとに、v1.22予定の機能を試験的に紹介します。正式版v1.21のインストールで利用できる機能とは区別してください。

## 機能別の使用例 {#artist-start}

- **壁や家具への衝突**：[Simple World Collision](/docs/features/simple-world-collision)
- **風の強弱や揺らぎ**：[Procedural Wind](/docs/features/procedural-wind)
- **複数メッシュで共通の風・周辺衝突**：[Kawaii Physics Shared Publisher](/docs/features/shared-publisher)
- **アニメーションの時刻・区間で制御**：[Notify](/docs/features/animnotify#settings-multiplier-notifies)
- **Level Sequence内で制御**：[Kawaii Physics Settings Multiplier](/docs/features/sequencer)

## 機能一覧 {#topics}

| # | トピック | やりたいこと |
|---|---|---|
| 1 | [Kawaii Physics Shared Publisher](/docs/features/shared-publisher) | 髪・衣服・装備へ同じ風と周囲の衝突を配る |
| 2 | [Settings Multiplier](/docs/features/settings-multipliers) | アクション中だけ揺れの硬さなどを変える |
| 3 | [Settings Multiplier / Trigger Gust](/docs/features/animnotify#settings-multiplier-notifies) | アニメーションの時刻・区間で揺れや突風を変える |
| 4 | [Kawaii Physics Settings Multiplier](/docs/features/sequencer) | Sequencerで揺れの変更をキーフレーム化する |
| 5 | [Mirror Data Table for Collision](/docs/features/collision-mirroring) | 左右のボーンにコリジョンを複製する |
| 6 | [UKawaiiPhysicsLibrary](/docs/api/runtime-properties) | ゲームイベントから設定や外力を変える |
| 7 | [GetRuntimeNodeInfosOnComponent](/docs/api/runtime-diagnostics) | 設定値と実行中の値を分けて問題を調べる |
| 8 | [KawaiiPhysicsToolset](/docs/api/mcp) | AIアシスタントへABP作成・設定調整・診断を依頼する |
| 9 | [Feature Samples](/docs/getting-started/feature-samples) | 目的に合う実装例を見つける |
| 10 | [Tapered Capsule Collision](/docs/features/collision-setup#tapered-capsule) | 太さが端ごとに違う部位へ形状を合わせる |
| 11 | [IKawaiiPhysicsGroundProvider](/docs/features/simple-world-collision#ground-provider) | 自作の移動処理で取得した床を使う |
| 12 | [Procedural Wind Gust / Transient External Force](/docs/features/procedural-wind#transient-forces) | イベント時だけ短い風や外力を足す |
| 13 | [Wind Preset Data Asset](/docs/features/procedural-wind#wind-presets) | 調整した風を保存して再利用する |
| 14 | [Wind Scope](/docs/features/wind-scope) | 風の波形を見ながら設定を比較する |
| 15 | [Check Preset Diff](/docs/features/settings-presets#preset-diff) | 保存した設定と現在値の違いを調べる |
| 16 | [UKawaiiPhysicsEditorLibrary](/docs/api/editor-library) | ツールからノードの編集・比較を行う |
| 17 | [Kawaii Node Audit](/docs/features/node-audit) | AnimBP全体の設定を点検する |

この一覧は掲載機能の索引です。v1.22の全変更や最終的な収録内容を示すものではありません。サンプルやAPIの説明では、必要に応じて既存機能も扱います。

<LegacyReference targets={{"implementation-snapshot": "/docs/preview#正式版のドキュメント"}} to="/docs/preview#正式版のドキュメント" label="関連ドキュメントを読む" />

## 正式版のドキュメント

- [はじめに・対応バージョン](/docs/)
- [インストール](/docs/getting-started/installation)
- [更新履歴](/docs/changelog)

<span id="対象となる開発版" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"対象となる開発版": "/docs/preview#topics"}} to="/docs/preview#topics" label="関連する仕様・操作へ" />
