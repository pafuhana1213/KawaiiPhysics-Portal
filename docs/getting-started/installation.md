---
sidebar_position: 1
title: "インストール"
description: "KawaiiPhysicsのインストール方法。Fab、GitHub、Git Submoduleからの導入手順を解説。"
---

# インストール

KawaiiPhysicsをプロジェクトに導入する方法を説明します。

## 方法1: Fab（推奨）

1. [Fab](https://www.fab.com/ja/listings/f870c07e-0a02-4a78-a888-e52a22794572) からプラグインを取得
2. Epic Games Launcherでプロジェクトにインストール
3. プロジェクトを再起動

## 方法2: GitHubからダウンロード

1. [Releases](https://github.com/pafuhana1213/KawaiiPhysics/releases) から対応バージョンをダウンロード
2. `Plugins` フォルダに展開
3. プロジェクトを再起動

```
YourProject/
├── Content/
├── Plugins/
│   └── KawaiiPhysics/    ← ここに配置
└── YourProject.uproject
```

## 方法3: Git Submodule

```bash
cd YourProject
git submodule add https://github.com/pafuhana1213/KawaiiPhysics.git Plugins/KawaiiPhysics
```

## プラグインの有効化

1. **Edit > Plugins** を開く
2. "KawaiiPhysics" を検索
3. **Enabled** にチェック
4. エディタを再起動

![Pluginsウィンドウで「KawaiiPhysics」を検索し、Enabledにチェックが入った実際の画面](/img/editor/plugin-enable-ja.webp)

*UE 5.8の実画面。バージョン表記は導入したプラグインによって異なります。*

## 確認

プラグインが正しくインストールされると、Animation Blueprintのノード一覧に **Kawaii Physics** が表示されます。

![AnimGraphでのKawaiiPhysicsノード](/img/animgraph-example.jpg)
