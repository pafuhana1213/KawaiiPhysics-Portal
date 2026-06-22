---
sidebar_position: 3
title: "カスタム重力"
---

# カスタム重力

重力方向をカスタマイズする方法を説明します。

![カスタム重力の方向別イメージ](/img/generated/custom-gravity-directions.svg)

*Gravityベクトルの向きで揺れ方が変わる。通常（下）／壁歩き（横）／無重力（0）／水中・浮力（上）の例。*

KawaiiPhysics で重力を扱う方法は2つあります。

1. **AnimNode の `Gravity` プロパティ**（`Force` カテゴリ）— シンプルなベクトル指定
2. **`FKawaiiPhysics_ExternalForce_Gravity` プリセット**（`ExternalForces` 配列）— Character の重力方向・GravityScale との連携が可能

## 基本的な重力設定（Gravity プロパティ）

`Gravity` は FVector で、**デフォルトは `(0, 0, 0)`（無重力）** です。下向きの重力を掛けるには明示的に設定します。

```cpp
// 下向きの重力（大きさはワールド単位）
Node->Gravity = FVector(0, 0, -980.0f);
```

:::tip
`bUseDefaultGravityZProjectSetting` を有効にすると、`Gravity` ベクトルにプロジェクト設定の `DefaultGravityZ`（絶対値）が乗算されます。この場合は `Gravity = FVector(0, 0, -1.0f)` のような正規化方向だけ指定すれば、適切な大きさの重力になります。
:::

## 重力方向の変更

### ワールド座標系での指定

`bUseWorldSpaceGravity`（既定 `true`）が有効なときは、`Gravity` はワールド座標系で解釈されます。

```cpp
// 下向き
Node->Gravity = FVector(0, 0, -980.0f);

// 前方向
Node->Gravity = FVector(980.0f, 0, 0);

// 斜め下
Node->Gravity = FVector(0.5f, 0, -0.5f).GetSafeNormal() * 980.0f;
```

### 実行時に変更する

ランタイムでの変更は [UKawaiiPhysicsLibrary](/docs/api/kawaiiphysics-library) の `SetGravity` を使います（`BlueprintThreadSafe`）。

```cpp
// キャラクターの下方向を重力に（壁歩きなど）
FVector CharacterDown = -Character->GetActorUpVector();
KawaiiPhysics = UKawaiiPhysicsLibrary::SetGravity(KawaiiPhysics, CharacterDown * 980.0f);
```

### Character の重力方向に追従する（プリセット）

Character Movement の重力方向（UE5.3以降のカスタム重力）に自動追従させたい場合は、`Gravity` プロパティではなく `FKawaiiPhysics_ExternalForce_Gravity` プリセットを使います。

```cpp
FKawaiiPhysics_ExternalForce_Gravity GravityForce;
GravityForce.bUseCharacterGravityDirection = true;  // Character の重力方向に追従
GravityForce.bUseCharacterGravityScale = true;      // Character の GravityScale を使用
```

詳細は [外部力プリセット](/docs/features/external-force-presets) を参照してください。

## 使用例

### 壁歩きキャラクター

キャラクターが壁を歩く場合、重力方向を壁の法線の逆方向に合わせます。

```cpp
void UpdateGravity(FVector WallNormal)
{
    // 壁の法線と逆方向を重力に
    KawaiiPhysics = UKawaiiPhysicsLibrary::SetGravity(KawaiiPhysics, -WallNormal * 980.0f);
}
```

### 宇宙空間（無重力）

```cpp
Node->Gravity = FVector::ZeroVector;  // デフォルトと同じ（無重力）
```

### 水中（浮力）

```cpp
// 上向きの弱い力で浮力を表現
Node->Gravity = FVector(0, 0, 300.0f);
```

## 部位ごとの重力

異なる部位に異なる重力を適用するには、複数の KawaiiPhysics ノードを使用します。

```
AnimGraph
├── KawaiiPhysics (髪: 通常の重力)
│   Gravity = (0, 0, -980)
│
└── KawaiiPhysics (羽: 上向きの浮力)
    Gravity = (0, 0, 200)
```

## 動的な重力変更

ゲームプレイ中に重力を変更するには、`SetGravity` を Blueprint / C++ から呼びます。

```cpp
// 例: Blueprint 呼び出し可能関数から重力を更新
void AMyCharacter::SetHairGravity(FVector NewGravity)
{
    // AnimGraph の KawaiiPhysics ノードを ConvertToKawaiiPhysics で参照し、
    // UKawaiiPhysicsLibrary::SetGravity(Ref, NewGravity) を呼ぶ
}
```

詳しくは [ランタイム制御](/docs/advanced/runtime-control) を参照してください。
