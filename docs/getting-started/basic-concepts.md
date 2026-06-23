---
sidebar_position: 4
title: "基本概念"
description: "KawaiiPhysicsの仕組みと主要な構成要素の全体像。ボーンチェーン、Damping/Stiffness/Radius、コリジョン、カーブ。"
---

# 基本概念

KawaiiPhysicsの仕組みと、設定の全体像をつかみましょう。各要素の詳しい設定方法は、それぞれの設定ガイド・リファレンスにリンクしています。

## アーキテクチャ

KawaiiPhysicsはPhysXを使用せず、独自の軽量アルゴリズムでボーン物理を実現します。AnimGraph内のノードとして動作し、入力ポーズを受け取って物理シミュレーション後のポーズを出力します。

![アーキテクチャとデータフロー](/img/generated/architecture-dataflow.svg)

*AnimGraph内でのKawaiiPhysicsノードの位置と内部処理フロー*

## 構成要素の全体像

KawaiiPhysicsの設定は、大きく次の要素で構成されます。

| 要素 | 概要 | 詳しく |
|------|------|--------|
| **ボーンチェーン** | Root Bone から始まる、物理を適用するボーンの範囲。Exclude Bones で一部を除外できる | [ボーンチェーン設定](/docs/features/bone-chain) |
| **物理パラメータ** | Damping（収まりやすさ）/ Stiffness（戻りやすさ）/ Radius（太さ）で揺れ方を決める | [揺れ方の調整](/docs/features/physics-setup) |
| **コリジョン** | 球・カプセル・ボックス・平面で体の貫通を防ぐ | [コリジョン設定](/docs/features/collision-setup) |
| **カーブ** | 根元から先端にかけてパラメータを滑らかに変化させる | [カーブによる調整](/docs/features/curve-editor) |
| **外部力** | 風・重力・任意の力を加える | [風と外部力](/docs/features/wind-and-forces) |

## 次のステップ

全体像をつかんだら、やりたいことに応じて設定ガイドへ進みましょう。

1. [ボーンチェーン設定](/docs/features/bone-chain) — 揺らすボーンを指定する
2. [揺れ方の調整](/docs/features/physics-setup) — Damping / Stiffness / Radius で揺れ方を決める
3. [コリジョン設定](/docs/features/collision-setup) — 体の貫通を防ぐ
4. [風と外部力](/docs/features/wind-and-forces) — 風・重力をかける

全パラメータの一覧は [パラメータ概要](/docs/parameters/overview) を参照してください。
