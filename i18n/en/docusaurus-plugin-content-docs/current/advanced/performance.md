---
sidebar_position: 1
title: "Performance Optimization"
---

# Performance Optimization

This guide explains how to optimize KawaiiPhysics performance.

## Performance Characteristics

KawaiiPhysics is lighter than typical physics simulations because it doesn't use PhysX.

### Processing Cost Factors

| Factor | Impact |
|--------|--------|
| Bone count | High |
| Collision count | Medium-High |
| Node count | Medium |
| Curve usage | Low |

## Optimization Techniques

### 1. Reduce Bone Count

Only make the minimum necessary bones physics targets.

```
// Bad example: All bones as physics targets
hair_root → hair_01 → hair_02 → hair_03 → hair_04 → hair_05

// Good example: Only important bones as physics targets
hair_root → hair_02 → hair_04
```

### Using Additional RootBones

Since v1.17.0, a single AnimNode can control multiple RootBones.

![Additional RootBones](/img/features/additional-rootbones.webp)

*Control multiple bone chains with a single node*

Using AdditionalRootBones instead of multiple KawaiiPhysics nodes can reduce the number of nodes.

### 2. Optimize Collision

- Use simple shapes
- Remove overlapping collisions
- Adjust collision count based on LOD

### 3. Disable Based on LOD

KawaiiPhysics can be disabled based on distance.

```cpp
// Disable physics at LOD 2 and above
if (GetCurrentLOD() >= 2)
{
    bEnabled = false;
}
```

### 4. Adjust Tick Rate

Reducing update frequency can reduce load.

### 5. Using Warm Up Feature

The Warm Up feature allows you to pre-stabilize physics simulation when spawning characters.

<div style={{textAlign: 'left', margin: '20px 0'}}>
  <iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/stIOjZQh3Qw"
    title="Warm Up Feature Demo"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen>
  </iframe>
</div>

![Warm Up Parameters](/img/features/warmup-params.png)

**Configuration:**

1. Set **Need Warm Up** to `true`
2. Specify the number of warm-up frames in **Warm Up Frame** (1 or more)

:::tip
Larger Warm Up Frame values lead to more stability but increase initialization load. Usually 10-30 frames is sufficient.
:::

![AnimNode Functions](/img/features/animnode-functions.png)

Warm Up can also be dynamically enabled via AnimNode functions. See [Changelog v1.13.0](/docs/changelog#v1130) for details.

## Profiling

### Checking with Unreal Insights

1. Run **stat KawaiiPhysics** console command
2. Check processing time

### Debugging with Console Variables

:::tip Version Info
Added in v1.16.0
:::

Console variables are available for debugging in the level.

![Console Debug](/img/features/console-debug.png)

*Debugging with console variables*

- `a.AnimNode.KawaiiPhysics.Enable` - Toggle enabled/disabled
- `a.AnimNode.KawaiiPhysics.Debug` - Debug display
- `a.AnimNode.KawaiiPhysics.DebugDrawThickness` - Debug draw line thickness

For the full CVar list, see [Console Commands / Variables](/docs/advanced/console-variables).

### Identifying Bottlenecks

- Many bones → Reduce bones
- Heavy collision calculation → Simplify collision
- Many characters → Use LOD

## Benchmark Guidelines

| Character Count | Bones/Character | Approximate Processing Time |
|-----------------|-----------------|----------------------------|
| 1 | 20 | Under 0.1ms |
| 10 | 20 | Around 1ms |
| 50 | 20 | Around 5ms |

:::note
Actual processing time varies by environment. Always profile on actual hardware.
:::
