/**
 * ドキュメント更新履歴のデータ。
 *
 * - 1エントリ = 1テーマ（PR 1本や、同じ目的の一連の変更）。コミット単位では書かない。
 * - items には、読者に知らせたいページだけを入れる。相互リンクの追加や誤字修正だけのページは入れない。
 * - 新しいエントリを配列の先頭に追加する。同じ日付のエントリは、目立たせたいものを先に置く。
 * - doc はドキュメントID（`docs/` からの相対パス、拡張子なし）。存在しないIDはビルドエラーになる。
 *
 * このデータは次の3か所で使われる。
 * - ドキュメント更新履歴ページ（docs/doc-updates.mdx）
 * - トップページの「最近のドキュメント更新」
 * - サイドバーの NEW / 更新バッジ（sidebars.ts。ビルド時点からの経過日数で判定）
 */

export type DocUpdateKind = 'new' | 'updated';

export interface DocUpdateItem {
  /** ドキュメントID（例: `features/physics-setup`） */
  doc: string;
  kind: DocUpdateKind;
  /** そのページで何が変わったか。短く1文で。 */
  note?: string;
  /** ページ内の見出しへのリンク。明示ID（`{#id}`）がある見出しだけを指定する。 */
  hash?: string;
  /** false にすると、サイドバーにバッジを出さない。 */
  badge?: boolean;
}

export interface DocUpdateEntry {
  /** ページ内アンカー。英小文字とハイフンで、重複させない。 */
  id: string;
  /** 公開日（YYYY-MM-DD） */
  date: string;
  title: string;
  summary?: string;
  items: DocUpdateItem[];
}

/** サイドバーに NEW を表示する日数 */
export const NEW_BADGE_DAYS = 30;
/** サイドバーに更新マークを表示する日数 */
export const UPDATED_BADGE_DAYS = 14;

export const docUpdates: DocUpdateEntry[] = [
  {
    id: 'doc-updates-page',
    date: '2026-11-07',
    title: 'ドキュメント更新履歴を追加',
    summary:
      'ページの追加と更新をテーマごとにまとめた、このページを追加しました。サイドバーでは、最近追加したページに「NEW」、最近更新したページに点を表示します。',
    items: [{doc: 'doc-updates', kind: 'new'}],
  },
  {
    id: 'sample-footage',
    date: '2026-11-07',
    title: '公式サンプルの録画とエディタの実画面を追加',
    summary:
      '設定ガイドを中心に、公式サンプルの展示を録画した動画と、エディタの実画面を追加しました。あわせて、外部力の座標系（ExternalForceSpace）などの説明をソースに合わせて修正しています。',
    items: [
      {doc: 'getting-started/quick-start', kind: 'updated', note: 'Root Bone と Physics Settings の入力欄の画面'},
      {doc: 'features/bone-chain', kind: 'updated', note: 'Additional Root Bones や、複数ノード構成のエディタ画面'},
      {doc: 'features/physics-setup', kind: 'updated', note: 'WorldDamping、LimitAngle、TeleportDistanceThreshold などの展示動画'},
      {doc: 'features/collision-setup', kind: 'updated', note: 'コリジョン形状の一覧と、スカートの貫通対策の動画'},
      {doc: 'features/simple-world-collision', kind: 'updated', note: 'Simple World Collision の展示動画'},
      {doc: 'features/curve-editor', kind: 'updated', note: 'カーブの効果を比べる動画と、Stiffness カーブの実画面'},
      {doc: 'features/wind-and-forces', kind: 'updated', note: '外部力の展示動画と静止画。ExternalForceSpace の説明を修正'},
      {doc: 'features/procedural-wind', kind: 'updated', note: '突風（Gust）の展示動画'},
      {doc: 'features/wind-scope', kind: 'updated', note: 'Wind Scope の起動ボタンとウィンドウの画面'},
      {doc: 'features/data-assets', kind: 'updated', note: 'Limits / BoneConstraints Data Asset のエディタ画面'},
      {doc: 'features/settings-presets', kind: 'updated', note: 'Preset Diff ウィンドウの画面と、比較手順の修正'},
      {doc: 'features/node-audit', kind: 'updated', note: 'プリセットアセットと監査結果の画面'},
      {doc: 'features/animnotify', kind: 'updated', note: 'AnimNotify で外部力を加える展示動画'},
      {doc: 'features/shared-collision', kind: 'updated', note: 'Shared Collision の展示動画'},
      {doc: 'features/external-force-presets', kind: 'updated', note: 'SimpleExternalForce と ProceduralWind の説明を修正'},
      {doc: 'advanced/fixed-substepping', kind: 'updated', note: 'Project Settings の実画面'},
      {doc: 'advanced/runtime-control', kind: 'updated', note: 'ボリュームで外部力を加える展示動画と、v1.22 での API 名の変更'},
      {doc: 'features/sequencer', kind: 'updated', note: 'Settings Multiplier トラックの画面'},
      {doc: 'advanced/performance', kind: 'updated', note: 'Warm Up の展示動画と、現行版の設定手順'},
      {doc: 'advanced/debugging', kind: 'updated', note: 'デバッグ表示の切り替えと、ツールボタンの画面'},
      {doc: 'advanced/project-settings', kind: 'updated', note: 'Project Settings > Plugins > Kawaii Physics の実画面'},
    ],
  },
  {
    id: 'per-axis-limit-angle',
    date: '2026-11-02',
    title: '軸ごとの角度制限（Per Axis LimitAngle）を追加（v1.22予定）',
    summary:
      '親ボーンのローカル軸ごとに曲がる範囲を指定する LimitAngleMode と PerAxisLimitAngle を、設定ガイドとリファレンスに追加しました。展示2.11の録画とヒンジ設定の画面を載せています。',
    items: [
      {doc: 'features/physics-setup', kind: 'updated', note: 'ヒンジの設定手順と展示動画'},
      {doc: 'parameters/physics', kind: 'updated', note: 'LimitAngleMode と PerAxisLimitAngle の項目'},
      {doc: 'parameters/limits', kind: 'updated', note: 'Cone と Per Axis で 0 の意味が違う点を追記'},
      {doc: 'api/animnode-kawaiiphysics', kind: 'updated', note: '追加されたプロパティ'},
    ],
  },
  {
    id: 'internals',
    date: '2026-11-02',
    title: '内部設計カテゴリを新設',
    summary:
      'KawaiiPhysics を調査・改造するプログラマ向けに、処理の順序、データ構造、守るべき条件をソースに沿って説明する20ページを追加しました。',
    items: [
      {
        doc: 'internals/overview',
        kind: 'new',
        note: 'カテゴリの入口。コア処理、拘束とコリジョン、共有システム、エディタ、テストなど20ページ',
      },
    ],
  },
  {
    id: 'replace-figures',
    date: '2026-11-01',
    title: '概念図を公式サンプルの録画に置き換え',
    summary: '自動生成の概念図を、公式サンプルの録画とエディタの実画面に置き換えました。',
    items: [
      {doc: 'getting-started/installation', kind: 'updated', note: 'プラグインウィンドウの画面'},
      {doc: 'getting-started/sample-project', kind: 'updated', note: 'サンプルレベルの画面'},
      {doc: 'features/bone-chain', kind: 'updated'},
      {doc: 'features/physics-setup', kind: 'updated'},
      {doc: 'features/data-assets', kind: 'updated'},
      {doc: 'features/procedural-wind', kind: 'updated'},
      {doc: 'features/simple-world-collision', kind: 'updated'},
      {doc: 'features/bone-constraint', kind: 'updated'},
      {doc: 'features/bone-subdivision', kind: 'updated'},
      {doc: 'features/sync-bone', kind: 'updated'},
    ],
  },
  {
    id: 'reference-corrections',
    date: '2026-10-11',
    title: '物理リファレンスとカーブ設定の説明を修正',
    summary:
      '角度制限、カーブの倍率、Data Asset、サンプルの対応バージョン、プロファイリングの説明を見直しました。テレポートの API の例も修正しています。',
    items: [
      {doc: 'getting-started/sample-project', kind: 'updated', note: 'サンプルの対応バージョン'},
      {doc: 'features/curve-editor', kind: 'updated', note: 'カーブの倍率の説明'},
      {doc: 'features/data-assets', kind: 'updated'},
      {doc: 'advanced/performance', kind: 'updated', note: 'プロファイリングの説明'},
      {doc: 'parameters/physics', kind: 'updated'},
      {doc: 'parameters/limits', kind: 'updated', note: '角度制限の説明'},
    ],
  },
  {
    id: 'v122-preview',
    date: '2026-10-04',
    title: 'v1.22予定の機能ガイドとAPIリファレンスを追加',
    summary:
      '開発中の v1.22 で追加予定の機能について、設定ガイド10ページとAPIリファレンス7ページを追加しました。機能の一覧は「v1.22予定」ページにまとめています。',
    items: [
      {doc: 'preview/overview', kind: 'new', note: 'v1.22予定の機能の一覧'},
      {doc: 'getting-started/feature-samples', kind: 'new'},
      {doc: 'features/simple-world-collision', kind: 'new'},
      {doc: 'features/collision-mirroring', kind: 'new'},
      {doc: 'features/procedural-wind', kind: 'new'},
      {doc: 'features/wind-scope', kind: 'new'},
      {doc: 'features/settings-presets', kind: 'new'},
      {doc: 'features/node-audit', kind: 'new'},
      {doc: 'features/settings-multipliers', kind: 'new'},
      {doc: 'features/shared-publisher', kind: 'new'},
      {doc: 'features/sequencer', kind: 'new'},
      {doc: 'api/runtime-properties', kind: 'new'},
      {doc: 'api/transient-effects', kind: 'new'},
      {doc: 'api/runtime-diagnostics', kind: 'new'},
      {doc: 'api/editor-library', kind: 'new'},
      {doc: 'api/node-audit', kind: 'new'},
      {doc: 'api/mcp', kind: 'new'},
      {doc: 'api/animation-notifies', kind: 'new'},
      {doc: 'features/collision-setup', kind: 'updated', note: 'Tapered Capsule を追加'},
      {
        doc: 'features/animnotify',
        kind: 'updated',
        hash: 'settings-multiplier-notifies',
        note: 'Settings Multiplier / Trigger Gust の Notify を追加',
      },
    ],
  },
  {
    id: 'bone-constraint-guide',
    date: '2026-08-06',
    title: 'Bone Constraint のガイドを新設',
    summary:
      'リファレンスや Data Asset のページに分かれていた Bone Constraint の説明を、1ページの機能ガイドにまとめました。',
    items: [{doc: 'features/bone-constraint', kind: 'new'}],
  },
  {
    id: 'ue58-animnotify',
    date: '2026-08-06',
    title: '対応UEバージョンの更新と AnimNotify の追記',
    summary:
      'v1.21.x の対応UEバージョンを 5.3〜5.8 に更新しました。AnimNotifyState の Set Alpha で CurveName を設定していないときに出る警告も追記しています。',
    items: [
      {doc: 'intro', kind: 'updated', note: '対応UEバージョンを 5.3〜5.8 に更新'},
      {doc: 'faq', kind: 'updated', note: '対応UEバージョンを 5.3〜5.8 に更新'},
      {doc: 'features/animnotify', kind: 'updated', note: 'CurveName が未設定のときの警告'},
    ],
  },
  {
    id: 'concept-figures',
    date: '2026-06-24',
    title: '概念図を追加',
    summary:
      '設定の効果が分かりにくいページに概念図を追加しました。ボーンチェーンのページには DummyBoneLength の解説を追加しています。',
    items: [
      {doc: 'features/bone-chain', kind: 'updated', note: 'DummyBoneLength の解説と図'},
      {doc: 'features/curve-editor', kind: 'updated', note: '根元から先端への変化の図'},
      {doc: 'features/bone-subdivision', kind: 'updated', note: '貫通防止と横方向の細分化の図'},
      {doc: 'features/shared-collision', kind: 'updated', note: '共有の流れの図'},
      {doc: 'advanced/custom-gravity', kind: 'updated', note: '重力の向きごとの図'},
      {doc: 'advanced/fixed-substepping', kind: 'updated', note: '固定タイムステップの図'},
      {doc: 'parameters/overview', kind: 'updated', note: 'パラメータの全体像の図'},
    ],
  },
  {
    id: 'restructure',
    date: '2026-06-23',
    title: 'ドキュメント構成の再編と v1.21.0 ソースとの照合',
    summary:
      'サイドバーを「はじめ方 → 設定ガイド → 高度な機能 → リファレンス」と段階的に読める構成に再編し、揺れ方の調整をまとめたガイドを追加しました。全ページを v1.21.0 のソースと照合し、存在しない API や既定値の誤りを修正しています。',
    items: [
      {doc: 'features/physics-setup', kind: 'new', note: 'Damping、Stiffness、Radius の調整をまとめたガイド'},
      {doc: 'getting-started/basic-concepts', kind: 'updated', note: '全体像のページに整理し、概念図を追加'},
      {doc: 'advanced/runtime-control', kind: 'updated', note: '実在する UKawaiiPhysicsLibrary の API に修正'},
      {doc: 'faq', kind: 'updated', note: 'v1.21.0 の新機能の Q&A を追加'},
      {doc: 'api/animnode-kawaiiphysics', kind: 'updated', note: 'API の誤記を修正'},
    ],
  },
  {
    id: 'sample-project',
    date: '2026-06-23',
    title: '公式サンプルの動かし方を追加',
    summary:
      '公式サンプルプロジェクトの動かし方を、C++ のビルド環境がある場合とない場合に分けて説明するページを追加しました。',
    items: [{doc: 'getting-started/sample-project', kind: 'new'}],
  },
  {
    id: 'project-settings-cvars',
    date: '2026-06-22',
    title: 'プロジェクト設定とコンソール変数のページを追加',
    items: [
      {doc: 'advanced/project-settings', kind: 'new', note: 'Project Settings > Plugins > Kawaii Physics の各項目'},
      {doc: 'advanced/console-variables', kind: 'new', note: 'デバッグ、初期化、Shared Collision のコンソール変数'},
    ],
  },
  {
    id: 'v121',
    date: '2026-06-22',
    title: 'v1.21.0 の新機能に対応',
    summary:
      'Fixed Substepping、Bone Subdivision、Shared Collision のページを追加し、Sync Bone の強化とパラメータ・APIの追加を反映しました。',
    items: [
      {doc: 'advanced/fixed-substepping', kind: 'new'},
      {doc: 'features/bone-subdivision', kind: 'new'},
      {doc: 'features/shared-collision', kind: 'new'},
      {doc: 'features/sync-bone', kind: 'updated', note: '軸ごとの適用方向や距離減衰などの強化'},
      {doc: 'changelog', kind: 'updated', note: 'v1.21.0 の更新内容'},
    ],
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function daysSince(date: string, now: Date): number {
  const [y, m, d] = date.split('-').map(Number);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((today - Date.UTC(y, m - 1, d)) / DAY_MS);
}

/**
 * サイドバーに表示するバッジを、ドキュメントIDごとに返す。
 * 同じページに NEW と更新の両方が該当するときは NEW を優先する。
 */
export function getRecentDocBadges(now: Date = new Date()): Map<string, DocUpdateKind> {
  const badges = new Map<string, DocUpdateKind>();
  for (const entry of docUpdates) {
    const age = daysSince(entry.date, now);
    for (const item of entry.items) {
      if (item.badge === false || age < 0) continue;
      if (item.kind === 'new' && age <= NEW_BADGE_DAYS) {
        badges.set(item.doc, 'new');
      } else if (item.kind === 'updated' && age <= UPDATED_BADGE_DAYS && !badges.has(item.doc)) {
        badges.set(item.doc, 'updated');
      }
    }
  }
  return badges;
}

/** エントリ内の新規・更新ページ数 */
export function countItems(entry: DocUpdateEntry): {added: number; updated: number} {
  let added = 0;
  let updated = 0;
  for (const item of entry.items) {
    if (item.kind === 'new') added += 1;
    else updated += 1;
  }
  return {added, updated};
}
