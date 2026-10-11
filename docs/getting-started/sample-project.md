---
sidebar_position: 2
title: "公式サンプルを動かす"
description: "KawaiiPhysics公式サンプルプロジェクト（KawaiiPhysicsSample）の動かし方。C++ビルド環境がある人・ない人（Release/Fab利用）それぞれの手順を解説。"
---

# 公式サンプルを動かす

公式サンプルで髪や服の物理挙動を試せます。初めて動かす場合は安定版v1.21.0を選んでください。未リリース機能を試す場合は開発版の `master` を選びます。

:::warning
**v1.22は未リリースです。** `master` は開発中の内容を含み、安定リリースではありません。動作確認には公開済みの [v1.21.0](https://github.com/pafuhana1213/KawaiiPhysics/releases/tag/20260624-v1.21.0) を使ってください。
:::

## サンプルの中身

[KawaiiPhysics リポジトリ](https://github.com/pafuhana1213/KawaiiPhysics) のトップ階層は以下の構成です。

```
KawaiiPhysics/
├── Config/
├── Content/
│   └── KawaiiPhysicsSample/
│       ├── L_KawaiiPhysicsSample.umap   ← サンプルレベル（デモ用マップ）
│       ├── Model/
│       ├── Samples/
│       └── Other/
├── Plugins/
│   └── KawaiiPhysics/                    ← プラグイン本体（C++ソース）
└── KawaiiPhysicsSample.uproject          ← このプロジェクトファイルを開く
```

| 項目 | 内容 |
|------|------|
| プロジェクトファイル | `KawaiiPhysicsSample.uproject` |
| サンプルレベル | `Content/KawaiiPhysicsSample/L_KawaiiPhysicsSample` |
| v1.21.0プラグインの対応UEバージョン | 5.3〜5.8（詳しくは[対応表](/docs/#supported-versions)を参照） |

この表はプラグインの対応範囲です。サンプルのアセットやレベルが、別のUEバージョンで開けることを保証するものではありません。

:::info
リポジトリに含まれる `Plugins/KawaiiPhysics` は **C++ソースコード** です。そのままプロジェクトを開くにはプラグインのビルドが必要になります。ビルド環境がない場合は、後述の[ビルド環境がない人向けの手順](#method-b)でプリコンパイル版に差し替えてください。
:::

## サンプルプロジェクトの入手

### 安定版v1.21.0（推奨）

公開済みのサンプルを使う場合は、タグ `20260624-v1.21.0` を指定して入手します。このバージョンの [`KawaiiPhysicsSample.uproject`](https://github.com/pafuhana1213/KawaiiPhysics/blob/20260624-v1.21.0/KawaiiPhysicsSample.uproject) はUE 5.3に設定されています。

- [v1.21.0のソースZIPをダウンロード](https://github.com/pafuhana1213/KawaiiPhysics/archive/refs/tags/20260624-v1.21.0.zip)
- またはGitでタグを指定してクローンします。

```bash
git clone --branch 20260624-v1.21.0 --depth 1 https://github.com/pafuhana1213/KawaiiPhysics.git
```

プラグイン自体はUE 5.3〜5.8に対応します。C++ソースからビルドする場合は、使用するUEバージョンのビルド環境を用意してください。ビルド環境がない場合は、[GitHub Releases](https://github.com/pafuhana1213/KawaiiPhysics/releases/tag/20260624-v1.21.0)から使用するUEバージョン向けのプリコンパイル版を選びます。

### 開発版 `master`（開発中の機能を試す場合）

`master` はUE 5.8に設定され、`KawaiiPhysicsSample.uproject` で `ModelContextProtocol`、`EditorToolset`、`SlateInspectorToolset` が有効です。開発版は [方法A](#method-a) でソースからビルドしてください。方法Bの公開済みプリコンパイル版は、`master` の開発中コンテンツと互換性がない可能性があります。プラグインの対応UE一覧だけでサンプルが起動すると判断しないでください。

- [`master` のZIPをダウンロード](https://github.com/pafuhana1213/KawaiiPhysics/archive/refs/heads/master.zip)
- またはGitで `master` を指定してクローンします。

```bash
git clone --branch master --depth 1 https://github.com/pafuhana1213/KawaiiPhysics.git
```

:::tip
入手したバージョンのプロジェクト設定で指定されたUEを使って開いてください。以下の方法Aまたは方法Bから、入手したバージョンに合う手順を選びます。
:::

---

## 方法A: ビルド環境がある人（Visual Studio + C++） {#method-a}

Visual Studio など、UEのC++をビルドできる環境がある場合は、ソースのまま開けます。

:::note
事前に **Visual Studio（C++によるゲーム開発 ワークロード）** など、お使いのUEバージョンに対応したビルド環境を用意してください。セットアップ方法は[公式ドキュメント](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/setting-up-visual-studio-development-environment-for-cplusplus-projects-in-unreal-engine)を参照してください。
:::

### 手順

1. （任意）`KawaiiPhysicsSample.uproject` を右クリックし、**Generate Visual Studio project files** を実行
2. `KawaiiPhysicsSample.uproject` をダブルクリック
3. 「モジュールが見つかりません。リビルドしますか？」というダイアログが出たら **はい** を選択
4. プラグインのコンパイルが走り、完了するとエディタが起動します

ビルドが通れば、入手したバージョンのソースコードを使ってサンプルを試せます。プラグインを改造して挙動を試したい場合もこの方法がおすすめです。

そのまま [サンプルレベルを開いて再生する](#play-sample) に進んでください。

---

## 方法B: ビルド環境がない人（Release/Fabのプリコンパイル版を使う） {#method-b}

以下は安定版v1.21.0のサンプル向けの手順です。C++のビルド環境がない場合は、**プリコンパイル済み（ビルド済み）のプラグイン** を使ってサンプルを開きます。GitHub Release版とFab版のどちらかを選べます。

:::warning
プリコンパイル版は **UEのバージョンごとに別物** です。必ずお使いのUEバージョンと一致するものを使ってください。
:::

### 方法B-1: GitHub Releaseのプリコンパイル版に差し替える

GitHub Releaseには、UEバージョンごとのビルド済みプラグインが配布されています。安定版サンプルのプラグインを、対応するビルドへ差し替えます。

1. [v1.21.0リリース](https://github.com/pafuhana1213/KawaiiPhysics/releases/tag/20260624-v1.21.0) から、使用するUEバージョンに対応したzipをダウンロード
   （例: UE5.6なら [`KawaiiPhysics_5.6_1.21.0.zip`](https://github.com/pafuhana1213/KawaiiPhysics/releases/download/20260624-v1.21.0/KawaiiPhysics_5.6_1.21.0.zip)）
2. zipを展開すると、`Binaries` フォルダを含む `KawaiiPhysics` フォルダが得られます
3. 入手したサンプルプロジェクトの `Plugins/KawaiiPhysics` フォルダを **丸ごと削除**
4. 代わりに、展開したプリコンパイル版の `KawaiiPhysics` フォルダを `Plugins/` に配置

```
KawaiiPhysicsSample/
└── Plugins/
    └── KawaiiPhysics/    ← ソース版を削除し、プリコンパイル版に置き換える
        ├── Binaries/     ← ビルド済みバイナリが入っている
        ├── Content/
        └── KawaiiPhysics.uplugin
```

5. `KawaiiPhysicsSample.uproject` をダブルクリックし、対応するUEバージョンで開く
   → ビルドなしでエディタが起動します

### 方法B-2: Fab版（エンジンにインストール済みのプラグイン）を使う {#method-b2}

[Fab](https://www.fab.com/ja/listings/f870c07e-0a02-4a78-a888-e52a22794572) からエンジンにKawaiiPhysicsをインストール済みの場合は、プロジェクト側のソースプラグインを取り除くだけで、エンジンにインストールされたプリコンパイル版が使われます。

1. Epic Games Launcherから、お使いのUEバージョンにKawaiiPhysics（Fab版）をインストール済みであることを確認
2. 入手したサンプルプロジェクトの `Plugins/KawaiiPhysics` フォルダを **丸ごと削除**
3. `KawaiiPhysicsSample.uproject` をダブルクリックし、対応するUEバージョンで開く
   → プロジェクト内にプラグインが無くなることで、エンジン側のFab版が読み込まれ、ビルドなしで起動します

:::note
方法B-2でプロジェクトの `Plugins/KawaiiPhysics` を残したままにすると、UEはプロジェクト側のソースプラグインを優先してビルドしようとします。必ずフォルダごと削除してください。
:::

そのまま [サンプルレベルを開いて再生する](#play-sample) に進んでください。

---

## サンプルレベルを開いて再生する {#play-sample}

プロジェクトが起動したら、デモを確認します。

1. **Content Browser** で `Content/KawaiiPhysicsSample/` を開く
2. `L_KawaiiPhysicsSample` をダブルクリックしてレベルを開く
3. ツールバーの **Play**（プレイ）または **Simulate**（シミュレート）を実行
4. サンプルキャラクターの髪や服が揺れる様子を確認できます

<!-- IMAGE_NEEDED: L_KawaiiPhysicsSample をエディタで開いた画面とPlayボタンの位置 -->

:::tip
キャラクターを移動・回転させると、慣性で揺れものが大きく動きます。Animation Blueprintを開いてKawaiiPhysicsノードのパラメータを変更し、挙動の違いを試してみてください。
:::

## よくあるトラブル

### バージョンの不一致に注意 {#version-mismatch}

プラグインの対応UEバージョンだけでは、サンプルが起動するかどうかは判断できません。**プロジェクト設定で指定されたUEバージョンを使って開いてください。** プリコンパイル版を使う場合は、そのビルドのUEバージョンも一致させます。別のUEバージョンでの起動やアセット変換を試す必要がある場合は、バックアップしたコピーで行い、結果を検証してください。

### 「このプロジェクトはリビルドが必要です」と出てエディタが起動しない

`Plugins/KawaiiPhysics` がソースコードのまま（ビルド未実施）の状態です。

- ビルド環境がある → [方法A](#method-a) でリビルドを許可する
- ビルド環境がない → [方法B](#method-b) でプリコンパイル版に差し替える

### プラグインが2つ読み込まれて競合する

エンジン（Fab版）とプロジェクト（`Plugins/KawaiiPhysics`）の両方にプラグインがあると競合します。どちらか一方だけにしてください（[方法B-2](#method-b2)参照）。

## 次のステップ

- [インストール](/docs/getting-started/installation) - 自分のプロジェクトへ導入する
- [クイックスタート](/docs/getting-started/quick-start) - 最初のセットアップ
- [基本概念](/docs/getting-started/basic-concepts) - 仕組みを理解する

開発版のテーマ別展示は[Feature Samples](/docs/getting-started/feature-samples)を参照してください。
