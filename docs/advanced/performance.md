---
sidebar_position: 1
title: "パフォーマンス最適化"
---

# パフォーマンス最適化

KawaiiPhysicsのパフォーマンスを最適化する方法を説明します。

## パフォーマンス特性

KawaiiPhysicsはPhysXを使用しないため、一般的な物理シミュレーションより軽量です。

### 処理コストの要因

| 要因 | 影響度 |
|-----|-------|
| ボーン数 | 高 |
| コリジョン数 | 中〜高 |
| ノード数 | 中 |
| カーブ使用 | 低 |

## 最適化テクニック

### 1. ボーン数の削減

必要最小限のボーンだけを物理対象にします。

```text
スケルトンの階層:
hair_root → hair_01 → hair_02 → hair_03 → hair_04 → hair_05
```

`Root Bone` 配下の子孫ボーンがシミュレーション対象になります。階層の中間ボーンを飛ばして、その先のボーンだけを対象にすることはできません。たとえば `hair_02` とその子孫だけを対象にするなら、`Root Bone` を `hair_02` に設定します。`Exclude Bones` に指定したボーンとその子孫は除外されるため、枝全体を除外したい場合に使います。

### Additional RootBonesの活用

v1.17.0から、1つのAnimNodeで複数のRootBoneを制御できるようになりました。

![Additional RootBones](/img/features/additional-rootbones.webp)

*1つのノードで複数のボーンチェーンを制御*

複数のKawaiiPhysicsノードを使用する代わりに、AdditionalRootBonesを使うことでノード数を削減できます。

### 2. コリジョンの最適化

- シンプルな形状を使用
- 重複するコリジョンを削除
- LODに応じてコリジョン数を調整

### 3. LODによる無効化

ノードが `FAnimNode_SkeletalControlBase` から継承する `LODThreshold`（Detailsの表示名: `LOD Threshold`）で、評価する最大LODを指定できます。設定したLOD以下で評価され、それより高いLODでは評価をスキップします。

![LODによる最適化](/img/generated/performance-lod-optimization.svg)

*距離に応じたボーン数・コリジョン数の削減効果*

```text
例: LOD 0とLOD 1で有効にし、LOD 2以上では評価をスキップする
AnimGraphでKawaiiPhysicsノードを選び、DetailsのLOD Thresholdを1に設定する
```

### 4. Tick Rateの調整

更新頻度を下げることで負荷を軽減できます。

### 5. Warm Up機能の活用

Warm Up機能を使用すると、キャラクター生成時に物理演算を事前に安定させることができます。

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

**設定方法:**

1. **Need Warm Up** を `true` に設定
2. **Warm Up Frame** に空回しするフレーム数を指定（1以上）

:::tip
Warm Up Frameが大きいほど安定しますが、物理計算の回数が増えるため初期化時の負荷が上がります。通常は10〜30フレーム程度で十分です。
:::

![AnimNode Functions](/img/features/animnode-functions.png)

AnimNode関数からWarm Upを動的に有効にすることも可能です。詳細は [更新履歴 v1.13.0](/docs/changelog#v1130) を参照してください。

## プロファイリング

### `stat Anim` での確認

ゲームまたはPIEのコンソールで `stat Anim` を実行し、画面に表示される `KawaiiPhysics_` の統計を確認します。これは実行中の統計オーバーレイです。

### Unreal Insightsでの確認

1. エディタ下部のTrace / Insightsステータスバーからトレースを開始します。
2. 測定したい状況を再現し、記録したトレースをUnreal InsightsのSession Browserで開きます。
3. Timing InsightsのCPUトラックで、アニメーション処理の時間を確認します。

Unreal Insightsはトレースを記録・解析するツールです。`stat Anim` の統計オーバーレイとは別の手順で使います。

### コンソール変数によるデバッグ

:::tip バージョン情報
v1.16.0で追加
:::

レベル上でデバッグ可能なコンソール変数が用意されています。

![Console Debug](/img/features/console-debug.png)

*コンソール変数によるデバッグ*

- `a.AnimNode.KawaiiPhysics.Enable` - 有効/無効の切り替え
- `a.AnimNode.KawaiiPhysics.Debug` - デバッグ表示
- `a.AnimNode.KawaiiPhysics.DebugDrawThickness` - デバッグ描画の線の太さ

CVar の全一覧は [コンソールコマンド / 変数](/docs/advanced/console-variables) を参照してください。

### ボトルネックの特定

- ボーン数が多い → ボーン削減
- コリジョン計算が重い → コリジョン簡略化
- 多数のキャラクター → LOD活用

:::note
処理時間はCPU、ビルド構成、キャラクター数、ボーン数、コリジョン、LOD、サブステップ設定などによって変わります。条件が示されていない処理時間をベンチマークとして扱わず、対象ビルドを実際の実行環境でプロファイリングしてください。
:::
