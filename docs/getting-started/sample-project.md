---
sidebar_position: 2
title: "公式サンプルを動かす"
description: "KawaiiPhysics公式サンプルプロジェクト（KawaiiPhysicsSample）の動かし方。C++ビルド環境がある人・ない人（Release/Fab利用）それぞれの手順を解説。"
---

# 公式サンプルを動かす

KawaiiPhysicsのGitHubリポジトリは、プラグイン単体ではなく **サンプルキャラクターとデモレベルを同梱した完全なUnreal Engineプロジェクト** になっています。実際に揺れる挙動を手元で確認したい場合は、このサンプルを動かすのが一番の近道です。

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
| 対応UEバージョン | 5.3 / 5.4 / 5.5 / 5.6 / 5.7 / 5.8（古いバージョンは[対応表](/docs/#supported-versions)を参照） |

:::info
リポジトリに含まれる `Plugins/KawaiiPhysics` は **C++ソースコード** です。そのままプロジェクトを開くにはプラグインのビルドが必要になります。ビルド環境がない場合は、後述の[ビルド環境がない人向けの手順](#method-b)でプリコンパイル版に差し替えてください。
:::

## サンプルプロジェクトの入手

どちらの方法でも、まずはサンプルプロジェクト一式を入手します。

- **ZIPでダウンロード**: リポジトリの **Code > Download ZIP** からダウンロードして展開
- **Gitでクローン**:

```bash
git clone https://github.com/pafuhana1213/KawaiiPhysics.git
```

:::tip
**お使いのUEバージョンを確認しておきましょう。** サンプルを開く際はこのバージョンと合わせる必要があります（[バージョンの不一致に注意](#version-mismatch)を参照）。
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

ビルドが通れば、最新のソースコードがそのまま反映された状態でサンプルを試せます。プラグインを改造して挙動を試したい場合もこの方法がおすすめです。

そのまま [サンプルレベルを開いて再生する](#play-sample) に進んでください。

---

## 方法B: ビルド環境がない人（Release/Fabのプリコンパイル版を使う） {#method-b}

C++のビルド環境がない場合は、**プリコンパイル済み（ビルド済み）のプラグイン** を使ってサンプルを開きます。Release版とFab版のどちらかを選べます。

:::warning
プリコンパイル版は **UEのバージョンごとに別物** です。必ずお使いのUEバージョンと一致するものを使ってください。
:::

### 方法B-1: GitHub Releaseのプリコンパイル版に差し替える

GitHub Releaseには、UEバージョンごとのビルド済みプラグイン（例: `KawaiiPhysics_5.6_x.xx.x.zip`）が配布されています。これをサンプルプロジェクトに上書きします。

1. [Releases](https://github.com/pafuhana1213/KawaiiPhysics/releases) から、お使いのUEバージョンに対応した最新のzipをダウンロード
   （例: UE5.6なら `KawaiiPhysics_5.6_x.xx.x.zip`）
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

サンプルレベルやアセットは特定のUEバージョンで保存されています。**保存時より古いバージョンのUEでは開けません。** レベルが開けない・破損するといった場合は、対応範囲（5.3〜5.8）内で別のUEバージョンを試してください。プリコンパイル版を使う場合も、その**プラグインが対応するUEバージョンと、プロジェクトを開くUEバージョンを必ず一致**させます。

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
