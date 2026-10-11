---
sidebar_position: 2
title: "Debugging"
---

# Debugging

This guide explains how to investigate and resolve KawaiiPhysics issues.

## Debug Display

### Collision Visualization

Collision shapes can be displayed in the editor.

![Collision debug display](/img/collision-example.webp)

### Supported Collision Shapes

| Shape | Debug Display | Version |
|-------|--------------|---------|
| Sphere | Wireframe sphere | - |
| Capsule | Wireframe capsule | - |
| Plane | Plane grid | Improved in v1.20.0 |
| Box | Wireframe box | Added in v1.20.0 |

### Bone Chain Verification

You can visually verify which bones have physics applied.

### GameplayTag Filtering {#gameplaytag-filtering}

:::tip Version Info
Added in v1.17.0, enhanced in v1.20.0
:::

Debug display targets can be filtered using GameplayTags. Useful when you want to debug display only specific characters among many characters.

## Common Issues

### Bones Don't Move

**Cause 1**: Root Bone setting mistake

- Physics is not applied to Root Bone itself
- Verify child bones exist

**Cause 2**: Extreme parameters

```cpp
// Stiffness too high
Stiffness = 1.0f; // Almost no movement

// Appropriate value
Stiffness = 0.05f;
```

### Bones Are Erratic

**Cause**: Damping too low

```cpp
// Doesn't converge
Damping = 0.0f;

// Appropriate value
Damping = 0.1f;
```

### Penetrating Through Body

**Cause**: Collision not set or too small

- Verify collision size
- Verify Driving Bone is correct

### Performance Degradation

- Verify bone count
- Verify collision count
- See [Performance](/docs/advanced/performance)

## Console Commands

```bash
stat Anim
```

KawaiiPhysics stats are part of `STATGROUP_Anim`. Look for entries beginning with `KawaiiPhysics_` in the displayed list.

## Log Output

```cpp
// Enable verbose logging
UE_LOG(LogKawaiiPhysics, Verbose, TEXT("Debug info"));
```

## Reporting Issues

If the issue persists, please report it on [GitHub Issues](https://github.com/pafuhana1213/KawaiiPhysics/issues).

Information to include when reporting:
- UE version
- KawaiiPhysics version
- Steps to reproduce
- Screenshots/videos
