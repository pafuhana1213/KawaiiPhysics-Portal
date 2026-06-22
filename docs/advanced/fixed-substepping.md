---
sidebar_position: 5
title: "Fixed Substepping（フレームレート非依存化）"
---

# Fixed Substepping（フレームレート非依存化）

:::tip バージョン情報
v1.21.0で追加。**デフォルトで有効（ON）**です。
:::

**Fixed Substepping** は、シミュレーション全体を固定タイムステップ（`FixedDt = 1 / TargetFramerate`）で必要回数だけ実行することで、フレームレートに依存しない安定した物理挙動を実現する機能です。

## 解決する課題

従来の処理では、1フレームを実際の `DeltaTime` でそのまま積分していたため、**フレームレートが変わると揺れ方・収束・たわみ（sag）が変化**してしまう問題がありました（例: 60fpsと30fpsで見た目が一致しない）。

特に重力による積分誤差はフレームレートの影響を強く受けるため、Damping の正規化だけでは解消できませんでした。Fixed Substepping は、ソルバ全体を固定 dt で回すことでこの問題を根本的に解決します。

## 設定方法

プロジェクト全体の設定として、**Project Settings > Plugins > Kawaii Physics** から変更できます。

<!-- IMAGE_NEEDED: Project Settings > Plugins > Kawaii Physics の設定画面 -->

### Use Fixed Substepping

**固定サブステップの有効化** - シミュレーション全体を固定タイムステップでサブステップ実行し、フレームレート依存の挙動を解消します。

| プロパティ | 値 |
|-----------|-----|
| 型 | bool |
| デフォルト | true |
| カテゴリ | Simulation |

### Max Substeps

**最大サブステップ数** - 1フレームあたりの最大サブステップ数です。低fps・ヒッチ時の暴走（spiral of death）を防ぐ上限で、これを超える分の時間は破棄されます。

| プロパティ | 値 |
|-----------|-----|
| 型 | int32 |
| デフォルト | 4 |
| 範囲 | 1 - 16 |
| カテゴリ | Simulation |

## 仕組み

実フレーム時間 `DeltaTime` をアキュムレータに溜め、固定内部ステップ `FixedDt` でソルバを必要回数だけ回します（standard な fixed-timestep accumulator パターン）。

```
1フレームの実時間を蓄積
    ↓
FixedDt（= 1 / TargetFramerate）ごとに分割
    ↓
分割した回数だけソルバを実行（コリジョン・拘束・外力を含む）
    ↓
余った時間は次フレームに繰り越し
```

![Fixed Substeppingの概念図](/img/generated/fixed-substepping-concept.svg)

*実フレーム時間を固定dtのサブステップに分割。60fpsと30fpsで同じ総シミュレート時間に到達し、揺れ方が一致する。*

- `FixedDt` は各ノードの **`Target Framerate`**（既定60、`KawaiiPhysics` カテゴリ）から算出されます。
- 低fps時はサブステップ数が増えるため、**CPU負荷が上がります**（最大で `Max Substeps` 倍）。`Max Substeps` を超える時間は破棄され、ヒッチ後の暴走を防ぎます。
- 高fps時（`DeltaTime < FixedDt`）は、そのフレームのサブステップ数が0になることがあり、前回の状態を維持します。

:::note 内部的な動作
サブステップ中は入力アニメーションのポーズ目標を `Lerp` / `Slerp` で補間し、風・重力・外力は毎サブステップ適用されます。風のシーン問い合わせは毎フレーム1回だけキャッシュされるため、ワーカースレッドの安全性も保たれています。
:::

## 後方互換性に関する注意

:::warning v1.21.0での挙動変更
Fixed Substepping は **v1.21.0でデフォルト有効（ON）** になりました。これにより、以前のバージョンと比べて揺れ方がわずかに変化する場合があります（より安定した挙動になります）。

過去バージョンと完全に同じ挙動が必要な場合は、`Use Fixed Substepping` を **OFF** にしてください。OFF時は従来の単一ステップ積分（legacy パス）で動作します。
:::

## パフォーマンスの確認

低fps時のサブステップ増による負荷は、コンソールコマンドで確認できます。

```bash
stat KawaiiPhysics
stat Anim
```

`Target Framerate` を必要以上に高く設定するとサブステップ数が増えて負荷が上がるため、対象に合った値（多くの場合60）を設定してください。

## 関連ページ

- [パフォーマンス最適化](/docs/advanced/performance)
- [物理パラメータ](/docs/parameters/physics)
- [デバッグ](/docs/advanced/debugging)
