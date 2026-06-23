import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// 段階的に深まる構成: 概要 → はじめ方 → 設定ガイド → 高度な機能 → 最適化・運用 → パラメータ → API
const sidebars: SidebarsConfig = {
  docsSidebar: [
    // 1. 概要
    'intro',

    // 2. はじめ方（基本セットアップ）
    {
      type: 'category',
      label: 'はじめ方',
      items: [
        'getting-started/installation',
        'getting-started/sample-project',
        'getting-started/quick-start',
        'getting-started/basic-concepts',
      ],
    },

    // 3. 設定ガイド（やりたいことから学ぶ・初心者向け）
    {
      type: 'category',
      label: '設定ガイド',
      items: [
        'features/bone-chain',
        'features/physics-setup',
        'features/collision-setup',
        'features/curve-editor',
        'features/wind-and-forces',
        'features/data-assets',
        'features/animnotify',
      ],
    },

    // 4. 高度な機能
    {
      type: 'category',
      label: '高度な機能',
      items: [
        'features/bone-subdivision',
        'features/shared-collision',
        'features/sync-bone',
        'features/external-force-presets',
        'advanced/custom-gravity',
        'advanced/fixed-substepping',
        'advanced/runtime-control',
      ],
    },

    // 5. 最適化・運用
    {
      type: 'category',
      label: '最適化・運用',
      items: [
        'advanced/performance',
        'advanced/debugging',
        'advanced/project-settings',
        'advanced/console-variables',
      ],
    },

    // 6. パラメータリファレンス
    {
      type: 'category',
      label: 'パラメータリファレンス',
      items: [
        'parameters/overview',
        'parameters/physics',
        'parameters/collision',
        'parameters/limits',
        'parameters/external-forces',
      ],
    },

    // 7. APIリファレンス
    {
      type: 'category',
      label: 'APIリファレンス',
      items: [
        'api/animnode-kawaiiphysics',
        'api/kawaiiphysics-library',
      ],
    },

    'faq',
    'changelog',
  ],
};

export default sidebars;
