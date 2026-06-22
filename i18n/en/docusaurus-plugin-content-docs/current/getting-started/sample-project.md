---
sidebar_position: 2
title: "Running the Official Sample"
description: "How to run the official KawaiiPhysics sample project (KawaiiPhysicsSample). Separate steps for users with a C++ build environment and users without one (using Release/Fab binaries)."
---

# Running the Official Sample

The KawaiiPhysics GitHub repository is not just the plugin — it is a **complete Unreal Engine project that bundles sample characters and a demo level**. If you want to see the physics in action on your own machine, running this sample is the quickest way.

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
| Supported UE versions | 5.3 / 5.4 / 5.5 / 5.6 / 5.7 (for older versions, see the [compatibility table](/docs/#supported-versions)) |

:::info
The `Plugins/KawaiiPhysics` folder included in the repository is **C++ source code**. Opening the project as-is requires building the plugin. If you do not have a build environment, replace it with a precompiled build using the [steps for users without a build environment](#method-b) below.
:::

## Getting the Sample Project

Either way, start by getting the full sample project.

- **Download as ZIP**: Download from **Code > Download ZIP** on the repository and extract it
- **Clone with Git**:

```bash
git clone https://github.com/pafuhana1213/KawaiiPhysics.git
```

:::tip
**Check your UE version in advance.** When you open the sample, you need to match this version (see [Watch out for version mismatches](#version-mismatch)).
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

Once the build succeeds, you can try the sample with the latest source code applied. This method is also recommended if you want to modify the plugin and experiment with its behavior.

Continue to [Open and play the sample level](#play-sample).

---

## Method B: Users without a Build Environment (Use Release/Fab Precompiled Binaries) {#method-b}

If you do not have a C++ build environment, open the sample using a **precompiled (prebuilt) plugin**. You can choose either the Release version or the Fab version.

:::warning
Precompiled versions are **specific to each UE version**. Always use the one that matches your UE version.
:::

### Method B-1: Replace with the GitHub Release Precompiled Build

GitHub Releases distribute prebuilt plugins per UE version (e.g. `KawaiiPhysics_5.6_x.xx.x.zip`). Overwrite the sample project with this build.

1. From [Releases](https://github.com/pafuhana1213/KawaiiPhysics/releases), download the latest zip for your UE version
   (e.g. `KawaiiPhysics_5.6_x.xx.x.zip` for UE5.6)
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

The sample level and assets are saved with a specific UE version. **You cannot open them in a UE version older than the one they were saved with.** If a level fails to open or appears corrupted, try a different UE version within the supported range (5.3–5.7). When using a precompiled version, always **match the UE version the plugin targets with the UE version you open the project in**.

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
