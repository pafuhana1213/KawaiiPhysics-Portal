---
sidebar_position: 2
title: "Running the Official Sample"
description: "How to run the official KawaiiPhysics sample project (KawaiiPhysicsSample). Separate steps for users with a C++ build environment and users without one (using Release/Fab binaries)."
---

# Running the Official Sample

Use the official sample to try out hair and clothing physics. For your first run, choose the stable v1.21.0 release. To try unreleased features, choose the development version, `master`.

:::warning
**v1.22 has not been released.** `master` contains work in progress and is not a stable release. For testing, use the released [v1.21.0](https://github.com/pafuhana1213/KawaiiPhysics/releases/tag/20260624-v1.21.0).
:::

## What the Sample Contains

The top level of the [KawaiiPhysics repository](https://github.com/pafuhana1213/KawaiiPhysics) is structured as follows.

```
KawaiiPhysics/
├── Config/
├── Content/
│   └── KawaiiPhysicsSample/
│       ├── L_KawaiiPhysicsSample.umap   ← Sample level (demo map)
│       ├── Model/
│       ├── Samples/
│       └── Other/
├── Plugins/
│   └── KawaiiPhysics/                    ← The plugin itself (C++ source)
└── KawaiiPhysicsSample.uproject          ← Open this project file
```

| Item | Details |
|------|---------|
| Project file | `KawaiiPhysicsSample.uproject` |
| Sample level | `Content/KawaiiPhysicsSample/L_KawaiiPhysicsSample` |
| UE versions supported by the v1.21.0 plugin | 5.3–5.8 (see the [compatibility table](/docs/#supported-versions) for details) |

The UE versions in this table describe the plugin's supported range. They do not guarantee that the sample's assets and levels will open in a different UE version.

:::info
The `Plugins/KawaiiPhysics` folder included in the repository is **C++ source code**. Opening the project as-is requires building the plugin. If you do not have a build environment, replace it with a precompiled build using the [steps for users without a build environment](#method-b) below.
:::

## Getting the Sample Project

### Stable Release v1.21.0 (Recommended)

To use the released sample, pin your download to tag `20260624-v1.21.0`. The [`KawaiiPhysicsSample.uproject`](https://github.com/pafuhana1213/KawaiiPhysics/blob/20260624-v1.21.0/KawaiiPhysicsSample.uproject) in this version is configured for UE 5.3.

- [Download the v1.21.0 source ZIP](https://github.com/pafuhana1213/KawaiiPhysics/archive/refs/tags/20260624-v1.21.0.zip)
- Or clone the tagged version with Git:

```bash
git clone --branch 20260624-v1.21.0 --depth 1 https://github.com/pafuhana1213/KawaiiPhysics.git
```

The plugin itself supports UE 5.3–5.8. If building from C++ source, prepare an environment for the UE version you will use. If you do not have a build environment, choose the precompiled build for your UE version from [GitHub Releases](https://github.com/pafuhana1213/KawaiiPhysics/releases/tag/20260624-v1.21.0).

### Development Version `master` (To Try In-Development Features)

`master` is configured for UE 5.8. `ModelContextProtocol`, `EditorToolset`, and `SlateInspectorToolset` are enabled in `KawaiiPhysicsSample.uproject`. To use the development version, build the source using [Method A](#method-a). The released precompiled builds in Method B may not be compatible with the development content in `master`. Do not infer whether this sample will launch from the plugin's supported-version table alone.

- [Download the `master` ZIP](https://github.com/pafuhana1213/KawaiiPhysics/archive/refs/heads/master.zip)
- Or clone `master` with Git:

```bash
git clone --branch master --depth 1 https://github.com/pafuhana1213/KawaiiPhysics.git
```

:::tip
Open the sample with the UE version specified by the version you downloaded. See Method A or B below for the steps that apply to your download.
:::

---

## Method A: Users with a Build Environment (Visual Studio + C++) {#method-a}

If you have an environment that can build UE C++ code, such as Visual Studio, you can open it directly from source.

:::note
Prepare a build environment that matches your UE version in advance, such as **Visual Studio (Game development with C++ workload)**. See the [official documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/setting-up-visual-studio-development-environment-for-cplusplus-projects-in-unreal-engine) for setup instructions.
:::

### Steps

1. (Optional) Right-click `KawaiiPhysicsSample.uproject` and run **Generate Visual Studio project files**
2. Double-click `KawaiiPhysicsSample.uproject`
3. When the dialog "Missing modules. Would you like to rebuild them?" appears, choose **Yes**
4. The plugin will compile, and the editor will launch once it finishes

Once the build succeeds, you can try the sample with the source code from the version you downloaded. This method is also recommended if you want to modify the plugin and experiment with its behavior.

Continue to [Open and play the sample level](#play-sample).

---

## Method B: Users without a Build Environment (Use Release/Fab Precompiled Binaries) {#method-b}

The steps below are for the stable v1.21.0 sample project. If you do not have a C++ build environment, open the sample using a **precompiled (prebuilt) plugin**. You can choose either the GitHub Release version or the Fab version.

:::warning
Precompiled versions are **specific to each UE version**. Always use the one that matches your UE version.
:::

### Method B-1: Replace with the GitHub Release Precompiled Build

GitHub Releases provide prebuilt plugins for each UE version. Replace the plugin in the stable sample with the matching build.

1. From the [v1.21.0 release](https://github.com/pafuhana1213/KawaiiPhysics/releases/tag/20260624-v1.21.0), download the zip for your UE version
   (e.g. [`KawaiiPhysics_5.6_1.21.0.zip`](https://github.com/pafuhana1213/KawaiiPhysics/releases/download/20260624-v1.21.0/KawaiiPhysics_5.6_1.21.0.zip) for UE5.6)
2. Extracting the zip gives you a `KawaiiPhysics` folder that includes a `Binaries` folder
3. **Delete the entire** `Plugins/KawaiiPhysics` folder in the sample project you obtained
4. Place the extracted precompiled `KawaiiPhysics` folder into `Plugins/` instead

```
KawaiiPhysicsSample/
└── Plugins/
    └── KawaiiPhysics/    ← Delete the source version and replace with the precompiled one
        ├── Binaries/     ← Contains the prebuilt binaries
        ├── Content/
        └── KawaiiPhysics.uplugin
```

5. Double-click `KawaiiPhysicsSample.uproject` and open it with the matching UE version
   → The editor launches without building

### Method B-2: Use the Fab Version (Plugin Installed to the Engine) {#method-b2}

If you have already installed KawaiiPhysics to your engine from [Fab](https://www.fab.com/ja/listings/f870c07e-0a02-4a78-a888-e52a22794572), simply removing the source plugin from the project makes it use the precompiled version installed in the engine.

1. Confirm that you have installed KawaiiPhysics (Fab version) for your UE version via the Epic Games Launcher
2. **Delete the entire** `Plugins/KawaiiPhysics` folder in the sample project you obtained
3. Double-click `KawaiiPhysicsSample.uproject` and open it with the matching UE version
   → With no plugin inside the project, the engine-side Fab version is loaded, and it launches without building

:::note
In Method B-2, if you leave the project's `Plugins/KawaiiPhysics` in place, UE will prioritize the project-side source plugin and try to build it. Be sure to delete the entire folder.
:::

Continue to [Open and play the sample level](#play-sample).

---

## Open and Play the Sample Level {#play-sample}

Once the project launches, check out the demo.

1. Open `Content/KawaiiPhysicsSample/` in the **Content Browser**
2. Double-click `L_KawaiiPhysicsSample` to open the level
3. Click **Play** or **Simulate** in the toolbar
4. You can watch the sample character's hair and clothing sway

<!-- IMAGE_NEEDED: L_KawaiiPhysicsSample opened in the editor, showing the Play button location -->

:::tip
Moving and rotating the character makes the swaying parts move more dramatically due to inertia. Open the Animation Blueprint, change the parameters on the KawaiiPhysics node, and compare how the behavior differs.
:::

## Common Issues

### Watch Out for Version Mismatches {#version-mismatch}

The plugin's supported UE versions alone do not tell you whether the sample will launch. **Open the project using the UE version specified in the project configuration.** If you use a precompiled plugin, match its build's UE version to the one you use to open the project. If you need to try opening the project or converting assets in another UE version, do so on a backup and verify the result.

### "This project needs to be rebuilt" appears and the editor will not launch

`Plugins/KawaiiPhysics` is still in source form (not yet built).

- If you have a build environment → allow the rebuild in [Method A](#method-a)
- If you do not have a build environment → replace it with a precompiled build in [Method B](#method-b)

### Two plugins are loaded and conflict

If the plugin exists both in the engine (Fab version) and in the project (`Plugins/KawaiiPhysics`), they conflict. Keep only one of them (see [Method B-2](#method-b2)).

## Next Steps

- [Installation](/docs/getting-started/installation) - Add it to your own project
- [Quick Start](/docs/getting-started/quick-start) - Your first setup
- [Basic Concepts](/docs/getting-started/basic-concepts) - Understand how it works

See [Feature Samples](/docs/getting-started/feature-samples) for the development version’s themed exhibits.
