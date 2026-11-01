# Docs Media Rules

ドキュメントの動画・画像の基準。撮影の手順は `/capture-sample` を使う。

## 素材の選び方

- 挙動の説明は、公式サンプルの実機録画を第一にする。自動生成の図解で代用しない。
- UIの説明は、エディタの実画面を使う。モック図は使わない。
- 図解は、データフローやタイミングなど、映像では見えない概念にだけ使う。
- 動かない内容（力で押された形のまま止まる展示など）は、動画ではなく静止画にする。

## サンプルの使い方

- 開発版の画面は `L_KPS_AllExamples` またはテーマ別レベルで撮る。`L_KawaiiPhysicsSample` は旧展示なので、スクリーンショットに使わない。
- 比較動画は、効果が見える距離まで寄る。差が見えない動画は載せない。
- 鎖は `DummyBoneLength` を設定した状態で撮る。`0` だと末端が折れ曲がり、印象が悪い。比較の目的以外で `0` の鎖を見せない。
- スカートの貫通対策の例は、BoneConstraint と Subdivision の併用を見せる。Constraint 単体は脚が突き抜けるので、良い例として使わない。SyncBone まで入れると機能を詰め込みすぎになる。

## 配置

| 種類 | 場所 | 形式 |
|---|---|---|
| 動画 | `static/video/sample/<name>.mp4` | H.264、音声なし、8秒前後、`+faststart`、1本1MB未満が目安 |
| 動画のポスター | `static/video/sample/<name>.jpg` | 動画と同名。差が最も分かるフレーム |
| エディタ画面 | `static/img/editor/<name>-ja.webp`、`-en.webp` | 言語別に撮る |

- 短いループはリポジトリに置く。YouTube は数分の解説動画にだけ使う。アップロードはユーザーが行う。
- 動画は `DocVideo` で掲載する。Markdown の画像記法では埋め込まない。

```mdx
import DocVideo from '@site/src/components/DocVideo';

<DocVideo src="/video/sample/damping.mp4" poster="/video/sample/damping.jpg" alt="..." caption="..." />
```

## 説明文

- どの展示の録画かを書く（例: `開発版サンプル展示2.1の実機録画`）。
- 実際に映っている内容を書く。比較では、左右で何が違うかを書く。
- 設定を足して撮った場合は、その値を書く。
- `alt` と `caption` は ja/en の両方を用意する。

## 公開前の確認

- 原寸のフレームで内容を確認する。サムネイルでは貫通などを正しく判断できない。
- 掲載する内容がサンプルの変更に依存するときは、サンプルのPRをマージしてからドキュメントを公開する。
- `docs/assets/image-requirements.md` の撮影ガイドラインは古い。このルールを優先する。
