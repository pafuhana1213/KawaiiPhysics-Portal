---
sidebar_position: 4
title: "カーブエディタ"
---

import RootToTip from '@site/static/img/generated/curve-root-to-tip.svg';
import HairExample from '@site/static/img/generated/curve-hair-example.svg';
import SkirtExample from '@site/static/img/generated/curve-skirt-example.svg';

<span id="カーブエディタ" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

<span id="curve-editor" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

# カーブエディタ

<span id="概要" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="overview" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

カーブを使うと、髪の根元と先端、スカートの腰と裾など、ボーンチェーンの位置に応じてパラメータを調整できます。

<span id="カーブの読み方" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="reading-curves" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

## カーブの読み方 {#reading-the-curve}

横軸はRootBoneからの**ボーン長比**（根元 `0` → 先端 `1`）、縦軸は**基準値に掛ける倍率**です。位置ごとの適用値は「基準値 × カーブの倍率」で決まります。X=`1`はRoot配下の最長経路の末端（ダミーボーンを含む）で、短い枝の末端は`1`未満です。

<RootToTip style={{display: 'block', width: '100%', maxWidth: '420px', height: 'auto'}} />

カーブのY値にパラメータの実値を入力するわけではありません。以下の使用例でも、この倍率の考え方は共通です。

<span id="使用例" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="設定例" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="setting-examples" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="尻尾" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="tail" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

## 使用例 {#examples}

以下は、X=`1`に達する末端を持つチェーンの例です。

*形状や作用の図は模式図です。シミュレーション結果や揺れ幅を示すものではありません。紫の点は根元、緑の点は先端で、形状とカーブの位置を対応させています。*

<span id="髪の毛" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="髪の毛-先端ほど形に戻る力を弱める" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="hair-reduce-the-return-force-toward-the-tip" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

### 髪の毛: 先端ほど形に戻る力を弱める {#hair}

Stiffnessは、親ボーンに対する入力ポーズの形に戻ろうとする力を調整します。根元側の形を保ちつつ、毛先の戻る力を弱めたい場合は、根元から先端へ倍率を下げます。RootBone自体は入力ポーズに追従します。

<HairExample style={{display: 'block', width: '100%', maxWidth: '420px', height: 'auto'}} />

キーの例は根元 `(0, 1.0)`、先端 `(1, 0.1)` です。基準値が `0.5` なら、根元のキーでの計算は `0.5 × 1.0 = 0.5`、先端では `0.5 × 0.1 = 0.05` です。図の点線と白抜きの毛先は入力ポーズ、実線はそこから変位した髪を示します。実際の動きは減衰や外力などにも左右されます。

<span id="スカート" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="スカート-裾ほど衝突半径を大きくする" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="skirt-increase-the-collision-radius-toward-the-hem" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

### スカート: 裾ほど衝突半径を大きくする {#skirt}

Radiusは、各ボーンの衝突判定に使う半径です。脚との衝突範囲を腰より裾で広く取りたい場合は、裾へ向かって倍率を上げます。

<SkirtExample style={{display: 'block', width: '100%', maxWidth: '420px', height: 'auto'}} />

キーの例は腰 `(0, 1.0)`、裾 `(1, 3.0)` です。基準値が `5 cm` なら、半径は腰で `5 cm`、裾で `15 cm` になります。図の青い円がボーン周囲の衝突範囲、オレンジのカプセルが脚のコリジョンです。**スカートの布自体を膨らませる設定ではありません。**

<span id="カーブの設定" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="setting-up-curves" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

## カーブの設定 {#setting-up-a-curve}

1. AnimGraphでKawaiiPhysicsノードを選択します。
2. Detailsの `Physics Settings | Curves`で対象のカーブを展開します（髪の例は `Stiffness Rate by Bone Length Rate`、スカートの例は `Radius Rate by Bone Length Rate`）。
3. カーブエディタでキーを追加し、位置（X）と倍率（Y）を編集します。
4. プレビューで動きを確認し、基準値とカーブを調整します。

上のグラフは両端のキーを直線で結んだ例です。中間の変化はキーや補間方法で調整できます。

<span id="カーブ-vs-固定値" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />
<span id="curve-vs-fixed-value" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

:::tip
まず固定値で全体の動きを調整し、根元と先端で違いが必要になったらカーブを使うと調整しやすくなります。
:::

<span id="対応パラメータ" style={{display: 'block', height: 0, scrollMarginTop: 'calc(var(--ifm-navbar-height) + 1rem)'}} />

## 対応パラメータ {#supported-parameters}

カーブに対応するパラメータは次の6つです。Detailsの表示名を示します。すべて同じボーン長比と倍率の考え方で設定します。

- `Damping Rate by Bone Length Rate` — 減衰
- `Stiffness Rate by Bone Length Rate` — 入力ポーズの形に戻る力
- `World Damping Location Rate by Bone Length Rate` — ワールド位置減衰
- `World Damping Rotation Rate by Bone Length Rate` — ワールド回転減衰
- `Radius Rate by Bone Length Rate` — 衝突半径
- `LimitAngle Rate by Bone Length Rate` — 角度制限

各カーブプロパティ（`DampingCurveData` ほか）の仕様は [物理パラメータ](/docs/parameters/physics) を参照してください。
