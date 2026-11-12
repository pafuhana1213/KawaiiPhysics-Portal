---
sidebar_position: 2
title: "Adjusting the Sway"
---

import DocVideo from '@site/src/components/DocVideo';

# Adjusting the Sway

This guide explains how to tune the three basic parameters that determine how things sway: **Damping / Stiffness / Radius**. These three decide "how much it sways, how quickly it settles, and how thick it is when it collides."

:::note
This page is a tuning **guide**. For the full specification of each parameter (type, range, curve modulation, etc.), see [Physics Parameters](/docs/parameters/physics).
:::

## Damping — How quickly motion settles

Gradually converges the bone's motion. **Higher = settles faster; lower = keeps swaying longer.**

<DocVideo src="/video/sample/damping.mp4" poster="/video/sample/damping.jpg" alt="Characters run with Damping 0.02, 0.1 and 0.5; only the twin tails at 0.02 bounce widely to the sides" caption="Recorded from development sample exhibit 2.1. Only Damping differs in the same running motion: the twin tails bounce widely at 0.02 on the left and settle quickly at 0.5 on the right." />

| Item | Detail |
|------|--------|
| Default | 0.1 |
| Typical | 0.1 – 0.3 |
| Higher | Settles faster (calm, heavy motion) |
| Lower | Keeps swaying (light, lively motion) |

## Stiffness — How strongly it returns to the original pose

The force pulling back to the original animation pose. **Higher = stiff (keeps the original shape); lower = soft (sways more).**

<DocVideo src="/video/sample/stiffness.mp4" poster="/video/sample/stiffness.jpg" alt="Characters run with Stiffness 0, 0.05 and 0.3; the hair keeps its shape better at higher values" caption="Recorded from development sample exhibit 2.2. Only Stiffness differs in the same running motion: the higher the value, the better the hair keeps its original shape." />

| Item | Detail |
|------|--------|
| Default | 0.05 |
| Typical | 0.05 – 0.2 |
| Higher | Stiff (smaller sway) |
| Lower | Soft (larger sway) |

## Radius — Collision thickness

Defines each bone's physical size (the radius used for collision detection). It is the "thickness" used when colliding.

![Radius concept](/img/generated/radius-concept.svg)

*Auto-generated conceptual diagram. Actual behavior varies with parameters and environment.*

| Item | Detail |
|------|--------|
| Default | 3.0 |
| Higher | Reacts to collisions sooner (thicker) |
| Lower | More likely to pass through (thinner) |

## Tuning Recipes

First decide the overall feel with the combination of Damping and Stiffness, then add collision as needed. The table below is just a starting point.

| Part | Damping | Stiffness | Goal |
|------|---------|-----------|------|
| Hair (long) | Low (0.1) | Low (0.05) | Soft and lively |
| Skirt | Mid (0.15) | Mid (0.1) | Keeps shape without over-swaying (+ collision) |
| Tail | Mid (0.15) | Low–Mid | Even and supple |
| Accessory (hard) | High (0.3) | High (0.2) | Settles quickly with small motion |

:::tip
To vary the sway between root and tip, you can modulate each parameter with a **curve**. See [Curve Editor](/docs/features/curve-editor) for details.
:::

## Related Pages

- [Basic Concepts](/docs/getting-started/basic-concepts) — overview and terms
- [Bone Chain Setup](/docs/features/bone-chain) — specifying which bones sway
- [Curve Editor](/docs/features/curve-editor) — varying from root to tip
- [Physics Parameters](/docs/parameters/physics) — full parameter reference
