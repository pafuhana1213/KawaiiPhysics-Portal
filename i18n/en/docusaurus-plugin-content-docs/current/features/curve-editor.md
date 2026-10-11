---
sidebar_position: 4
title: "Curve Editor"
---

import RootToTip from '@site/static/img/generated/curve-root-to-tip-en.svg';
import HairExample from '@site/static/img/generated/curve-hair-example-en.svg';
import SkirtExample from '@site/static/img/generated/curve-skirt-example-en.svg';

<span id="カーブエディタ" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

<span id="curve-editor" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

# Curve Editor

<span id="概要" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="overview" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

Curves let you vary parameters along a bone chain, such as from the roots to the tips of hair or from the waist to the hem of a skirt.

<span id="カーブの読み方" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="reading-curves" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

## Reading the Curve {#reading-the-curve}

The X axis is the **bone-length ratio** from the RootBone (root `0` → tip `1`), and the Y axis is a **multiplier applied to the base value**. The applied value at each position is `base value × curve multiplier`. X=`1` is the endpoint of the longest path under the RootBone, including dummy bones; endpoints on shorter branches are below `1`.

<RootToTip style={{display: 'block', width: '100%', maxWidth: '420px', height: 'auto'}} />

Enter a multiplier on the curve's Y axis, not the parameter's final value. The same rule applies to the examples below.

<span id="使用例" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="設定例" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="setting-examples" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="尻尾" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="tail" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

## Examples {#examples}

These examples use a chain with an endpoint at X=`1`.

*The shape and effect diagrams are schematic. They do not show simulation results or motion range. Purple marks the root and green marks the tip; each point corresponds to the same position on the shape and curve.*

<span id="髪の毛" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="髪の毛-先端ほど形に戻る力を弱める" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="hair-reduce-the-return-force-toward-the-tip" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

### Hair: Reduce the Return Force Toward the Tip {#hair}

Stiffness controls how strongly a bone returns toward its input-pose shape relative to its parent bone. To preserve the shape near the root while reducing the return force toward the hair tip, lower the multiplier from root to tip. The RootBone itself follows the input pose.

<HairExample style={{display: 'block', width: '100%', maxWidth: '420px', height: 'auto'}} />

For example, use root `(0, 1.0)` and tip `(1, 0.1)` keys. With a base value of `0.5`, the calculation is `0.5 × 1.0 = 0.5` at the root key and `0.5 × 0.1 = 0.05` at the tip key. In the diagram, the dashed line and hollow hair tip show the input pose; the solid line shows the displaced hair. Actual motion also depends on damping, external forces, and other settings.

<span id="スカート" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="スカート-裾ほど衝突半径を大きくする" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="skirt-increase-the-collision-radius-toward-the-hem" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

### Skirt: Increase the Collision Radius Toward the Hem {#skirt}

Radius is the collision radius used for each bone. If you want a wider collision range against the legs near the hem than at the waist, increase the multiplier toward the hem.

<SkirtExample style={{display: 'block', width: '100%', maxWidth: '420px', height: 'auto'}} />

For example, use waist `(0, 1.0)` and hem `(1, 3.0)` keys. With a base Radius of `5 cm`, the radius is `5 cm` at the waist and `15 cm` at the hem. The blue circles show the collision range around the bones; the orange capsules show the leg colliders. **This does not expand the skirt fabric itself.**

<span id="カーブの設定" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="setting-up-curves" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

## Setting Up a Curve {#setting-up-a-curve}

1. Select the KawaiiPhysics node in the AnimGraph.
2. In the Details panel, expand the target curve under `Physics Settings | Curves` (`Stiffness Rate by Bone Length Rate` for the hair example or `Radius Rate by Bone Length Rate` for the skirt example).
3. Add keys in the curve editor and edit their position (X) and multiplier (Y).
4. Preview the motion, then adjust the base value and curve.

The graphs above use a straight line between the endpoint keys. Add keys or change interpolation to adjust the values between them.

<span id="カーブ-vs-固定値" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="curve-vs-fixed-value" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

:::tip
Start by tuning the overall motion with a fixed value. Add a curve when you need different behavior at the root and tip.
:::

<span id="対応パラメータ" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

## Supported Parameters {#supported-parameters}

These six parameters support curves. Their names below match the Details panel. All use the same bone-length ratio and multiplier model.

- `Damping Rate by Bone Length Rate` — damping
- `Stiffness Rate by Bone Length Rate` — return toward the input-pose shape
- `World Damping Location Rate by Bone Length Rate` — world location damping
- `World Damping Rotation Rate by Bone Length Rate` — world rotation damping
- `Radius Rate by Bone Length Rate` — collision radius
- `LimitAngle Rate by Bone Length Rate` — angle limit

For details on the curve properties (`DampingCurveData`, etc.), see [Physics Parameters](/docs/parameters/physics).
