---
sidebar_position: 3
title: "カスタム重力"
---

# カスタム重力

重力方向をカスタマイズする方法を説明します。

![カスタム重力の方向別イメージ](/img/generated/custom-gravity-directions.svg)

*Gravityベクトルの向きで揺れ方が変わる。通常（下）／壁歩き（横）／無重力（0）／水中・浮力（上）の例。*

## 基本的な重力設定

```cpp
UPROPERTY()
FVector Gravity = FVector(0, 0, -1.0f);
```

デフォルトは下向き（-Z方向）の重力です。

## 重力方向の変更

### ワールド座標系での指定

```cpp
// 下向き（デフォルト）
Gravity = FVector(0, 0, -1.0f);

// 前方向
Gravity = FVector(1.0f, 0, 0);

// 斜め下
Gravity = FVector(0.5f, 0, -0.5f).GetSafeNormal();
```

### キャラクター相対での指定

Blueprintで動的に設定:

```cpp
// キャラクターの下方向を使用
FVector CharacterDown = -Character->GetActorUpVector();
KawaiiPhysicsNode->Gravity = CharacterDown;
```

## 使用例

### 壁歩きキャラクター

キャラクターが壁を歩く場合、重力方向を壁の法線に合わせます。

```cpp
void UpdateGravity(FVector WallNormal)
{
    // 壁の法線と逆方向を重力に
    Gravity = -WallNormal;
}
```

### 宇宙空間

無重力環境:

```cpp
Gravity = FVector::ZeroVector;
```

### 水中

浮力を表現:

```cpp
// 上向きの浮力
Gravity = FVector(0, 0, 0.3f);
```

## 部位ごとの重力

異なる部位に異なる重力を適用するには、複数のKawaiiPhysicsノードを使用します。

```
AnimGraph
├── KawaiiPhysics (髪: 通常の重力)
│   Gravity = (0, 0, -1)
│
└── KawaiiPhysics (羽: 上向きの浮力)
    Gravity = (0, 0, 0.2)
```

## 動的な重力変更

ゲームプレイ中に重力を変更できます。

```cpp
// Blueprint呼び出し可能関数
UFUNCTION(BlueprintCallable)
void SetCustomGravity(FVector NewGravity)
{
    KawaiiPhysicsNode->Gravity = NewGravity;
}
```

詳しくは [ランタイム制御](/docs/advanced/runtime-control) を参照してください。
