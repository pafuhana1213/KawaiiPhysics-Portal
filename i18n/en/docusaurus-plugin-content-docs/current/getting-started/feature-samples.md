---
title: "Feature Samples"
description: "Connect a motion problem to a theme and compare changes under the same conditions."
---

import LegacyReference from '@site/src/components/LegacyReference';

import DocFigure from '@site/src/components/DocFigure';

# Feature Samples

:::warning Not Officially Released
This feature has not been officially released yet. It is planned for KawaiiPhysics v1.22. Specifications may change during development.
:::

Hair may keep swinging, clothing may pass through the body, or wind may look too uniform. When investigating these problems, a finished Animation Blueprint alone can make it difficult to separate the settings responsible for the motion.

The development sample groups exhibits into nine themes, with dedicated Animation Blueprints you can open from each exhibit. Choose the behavior you want to investigate, inspect its settings and result, then use that as a starting point for your character. This guide is for artists tuning hair or clothing and technical owners examining combinations of settings.

## Themes {#artist-start}

| What you want to improve | Start with | Watch for |
|---|---|---|
| Hair keeps swinging after movement stops | `02_PhysicsSettings` | How quickly the tip settles; compare Damping and Stiffness separately |
| Hair or cloth passes through the body | `03_Collision` | Shape placement and clearance during the same motion |
| Wind looks too uniform | `08_Wind` | Root-to-tip timing, changes in strength, and gusts |
| An action needs a temporary motion change | `06_RuntimeControl` | Entry into the effect, its duration, and the return afterward |

For a finished character, inspect the related part's ABP in `09_Showcase`, then return to a single-feature exhibit to separate the factors involved. The nine themes include existing features; they are not all additions introduced in v1.22. You can also choose from the [Feature Samples Reference](/docs/getting-started/feature-samples#details-topics).

<DocFigure src="/img/sample-level.png" alt="Older sample screenshot with separate Damping and Stiffness rows, collision shape exhibits, and World Collision OFF and ON" caption="Actual sample screenshot reused from the Portal, showing an older exhibit layout. Find the Damping/Stiffness rows to compare one setting at a time; the World Collision panel compares OFF and ON. This is not a v1.22 nine-theme screenshot." />

### Themes and Related Pages {#details-topics}

| Theme | Main exhibits | Related documentation |
|---|---|---|
| `01_BoneChain` | Root Bone, dummy bones, exclusions, additional roots, multiple nodes and tags | [Bone chains](/docs/features/bone-chain) |
| `02_PhysicsSettings` | Damping, Stiffness, World Damping, Limit Angle, curves, teleport, warmup, SkelCompMoveScale | [Physics setup](/docs/features/physics-setup) |
| `03_Collision` | Spheres, capsules, tapered capsules, boxes, planes, Limits Data Assets, Physics Assets, world collision | [Collision setup](/docs/features/collision-setup), [tapered capsules](/docs/features/collision-setup#tapered-capsule) |
| `04_Forces` | Gravity, Simple External Force, force presets, AnimNotify, coordinate spaces, bone-length scaling, legacy gravity | [Wind and forces](/docs/features/wind-and-forces) |
| `05_Advanced` | Bone constraints, subdivision, Sync Bone, presets, shared collision | [Shared collision](/docs/features/shared-collision), [UKawaiiPhysicsPresetDataAsset](/docs/features/settings-presets) |
| `06_RuntimeControl` | Blueprint Alpha, multipliers and gusts, NotifyState, Sequencer, PostProcess ABP, AnimNode Function, force volumes | [Settings Multiplier](/docs/features/settings-multipliers), [notifies](/docs/features/animnotify#settings-multiplier-notifies), [Kawaii Physics Settings Multiplier](/docs/features/sequencer), [UKawaiiPhysicsLibrary](/docs/api/runtime-properties) |
| `07_SimpleWorldCollision` | Automatic gathering, supported shapes, skeletal mesh collision, gathering radius | [Simple World Collision](/docs/features/simple-world-collision) |
| `08_Wind` | Procedural Wind components, wind preset Data Assets, gust notifies, Shared Publisher | [Procedural Wind](/docs/features/procedural-wind), [Kawaii Physics Shared Publisher](/docs/features/shared-publisher) |
| `09_Showcase` | Finished TA-style Sagimiya Kano setup, explained by body part | Inspect each exhibit's Animation Blueprint |

## Levels {#details-levels}

| Purpose | Content location |
|---|---|
| Original sample level | `Content/KawaiiPhysicsSample/L_KawaiiPhysicsSample` |
| Exhibits by theme | `Content/KawaiiPhysicsSample/Examples/` |
| All themes in one place | `Content/KawaiiPhysicsSample/L_KPS_AllExamples` |

The combined level loads the themed levels side by side. If you know what to investigate, open the corresponding theme and inspect the exhibit's Animation Blueprint.

## Exhibit Navigation {#details-navigation}

Open `Content/KawaiiPhysicsSample/L_KPS_AllExamples` or a themed level, start Play (PIE), and give the viewport keyboard focus.

| Key during PIE | Action |
|---|---|
| Z / X | Previous / next exhibit within the current theme |
| PageUp / PageDown | Previous / next theme |
| H | Open the current exhibit's documentation in the Portal |
| B | Open the current exhibit's Animation Blueprint in the editor |

In the editor, the sign actor's Details panel also provides **Open Docs** / **Open AnimBP** buttons. Signs show Japanese when the current language is Japanese and English otherwise. The sample configures its own documentation links; these do not necessarily all lead to these preview pages.

## Sample Exhibit Examples {#check-result}

<DocFigure src="/img/features/sample-v117.png" alt="Older sample montage with AnimNotify and volume exhibits, three collision source types, force-space comparisons, and a skirt motion comparison" caption="Actual Portal image used in the v1.17 changelog. Top right compares AnimNode/DataAsset/PhysicsAsset sources; bottom left compares force spaces; bottom right compares skirt collision setups. Its Sequencer label is an older exhibit, not evidence of the new v1.22 multiplier track." />

## Character and Screenshot Usage Terms {#credits}

- **Gray-chan**: [provider link in the public README](http://rarihoma.xvs.jp/products/graychan)
- **TA-style Sagimiya Kano**: provided by [TA Inc.](https://xta.co.jp/). Copyright (c) 2025 株式会社TA All rights reserved. [Usage terms](https://uzurig.com/ja/terms_of_use_jp/)

Check the plugin license and each character's usage terms separately. This page reuses existing Portal screenshots and does not redistribute model files. Image references are the Portal's existing sample material and [v1.17 changelog](/docs/changelog).

[Feature Samples Reference](/docs/getting-started/feature-samples#details-topics)

## Related UE documentation {#ue-docs}

- [Animation Blueprint Nodes](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-blueprint-nodes-in-unreal-engine) — Review AnimGraph node placement, connections, and Details editing. (UE 5.8)

<span id="prerequisites" hidden />
<span id="first-pass" hidden />
<span id="troubleshooting" hidden />
<span id="details-credits" hidden />

<LegacyReference redirect renderAnchors={false} targets={{"prerequisites": "/en/docs/getting-started/feature-samples#details-levels", "first-pass": "/en/docs/getting-started/feature-samples#details-navigation", "troubleshooting": "/en/docs/getting-started/feature-samples#details-navigation", "details-credits": "/en/docs/getting-started/feature-samples#credits"}} to="/en/docs/getting-started/feature-samples#details-levels" label="Related specifications and usage" />
