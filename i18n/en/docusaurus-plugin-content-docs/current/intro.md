---
sidebar_position: 1
slug: /
title: "Introduction"
description: "KawaiiPhysics - A lightweight bone physics plugin for Unreal Engine. Easily add physics simulation to hair, clothing, and accessories."
---

# Introduction

**KawaiiPhysics** is a lightweight bone physics simulation plugin for Unreal Engine.

![KawaiiPhysics Demo](/img/intro-demo.webp)

<div style={{textAlign: 'center', margin: '20px 0'}}>
  <iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/0f-l-SP07Mo?origin=https://pafuhana1213.github.io"
    title="KawaiiPhysics Demo Video"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    referrerPolicy="strict-origin-when-cross-origin"
    allowFullScreen>
  </iframe>
</div>

![Comparison Demo](/img/comparison-demo.png)

*With/without physics simulation comparison*

## Features

- **Simple Setup**: Just add one node in AnimGraph
- **Lightweight Processing**: Custom algorithm that doesn't depend on PhysX
- **Rich Collision Support**: Supports sphere, capsule, and plane collisions
- **Skeleton Protection**: Stable physics simulation that prevents bone stretching
- **External Force Application**: Supports wind, gravity, and custom forces

## Supported Versions

| KawaiiPhysics | Supported UE Versions |
|---------------|----------------------|
| 1.20.x        | 5.3, 5.4, 5.5, 5.6, 5.7 |
| 1.19.x        | 5.3, 5.4, 5.5, 5.6 |
| 1.18.x        | 5.3, 5.4, 5.5 |
| 1.17.x        | 5.3, 5.4, 5.5 |
| 1.16.x        | 5.3, 5.4 |
| 1.14.x        | 5.0, 5.1, 5.2 |
| 1.11.1        | 4.27 |

## Quick Start

```cpp
// Add KawaiiPhysics node in Animation Blueprint
// Set Root Bone and specify the bone chain you want physics applied to
```

1. Open Animation Blueprint
2. Add **Kawaii Physics** node to AnimGraph
3. Set **Root Bone** to the parent of the bones you want to animate
4. Adjust parameters and preview

For more details, see [Installation](/docs/getting-started/installation) and [Quick Start](/docs/getting-started/quick-start).

## Featured In

KawaiiPhysics has been used in the following titles:

- **Granblue Fantasy Versus Rising** - Fighting Game
- **Stellar Blade** - Action Game

![Dance Demo 1](https://github.com/user-attachments/assets/28d72d0c-4423-41c7-bc52-c5c7c3886e02)

*Hair and cloth physics in dance animation (Lzebul)*

![Dance Demo 2](https://github.com/user-attachments/assets/63faed3c-8aaa-4d4d-ae33-e98f9c8c15fd)

*Hair and cloth physics in dance animation (TA式 鷺宮カノ)*

## Links

- [GitHub Repository](https://github.com/pafuhana1213/KawaiiPhysics)
- [Fab](https://www.fab.com/ja/listings/f870c07e-0a02-4a78-a888-e52a22794572)
- [GitHub Discussions](https://github.com/pafuhana1213/KawaiiPhysics/discussions)
