---
sidebar_position: 1
title: "Installation"
description: "How to install KawaiiPhysics. Step-by-step guide for Fab, GitHub, and Git Submodule installation methods."
---

# Installation

This guide explains how to install KawaiiPhysics in your project.

## Method 1: Fab (Recommended)

1. Get the plugin from [Fab](https://www.fab.com/ja/listings/f870c07e-0a02-4a78-a888-e52a22794572)
2. Install it to your project via Epic Games Launcher
3. Restart your project

## Method 2: Download from GitHub

1. Download the compatible version from [Releases](https://github.com/pafuhana1213/KawaiiPhysics/releases)
2. Extract to the `Plugins` folder
3. Restart your project

```
YourProject/
├── Content/
├── Plugins/
│   └── KawaiiPhysics/    ← Place it here
└── YourProject.uproject
```

## Method 3: Git Submodule

```bash
cd YourProject
git submodule add https://github.com/pafuhana1213/KawaiiPhysics.git Plugins/KawaiiPhysics
```

## Enabling the Plugin

1. Open **Edit > Plugins**
2. Search for "KawaiiPhysics"
3. Check **Enabled**
4. Restart the editor

![The Plugins window filtered to KawaiiPhysics with its Enabled box checked](/img/editor/plugin-enable-en.webp)

*The actual UE 5.8 window. The version shown depends on the plugin you installed.*

## Verification

When the plugin is correctly installed, **Kawaii Physics** will appear in the node list of Animation Blueprint.

![KawaiiPhysics node in AnimGraph](/img/animgraph-example.jpg)
