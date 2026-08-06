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
      link: {
        type: 'generated-index',
        slug: 'getting-started',
        description: 'インストール、公式サンプル、クイックスタート、基本概念を通じてKawaiiPhysicsの導入から最初のセットアップまでを案内します。',
      },
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
      link: {
        type: 'generated-index',
        slug: 'guides',
        description: 'ボーンチェーン、揺れ方、コリジョン、カーブ、外部力、Data Asset、AnimNotifyなど基本的な設定手順を目的別に解説します。',
      },
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
      link: {
        type: 'generated-index',
        slug: 'advanced-features',
        description: 'ボーン細分化、共有コリジョン、Sync Bone、外部力プリセット、カスタム重力、固定サブステップ、ランタイム制御など応用機能を解説します。',
      },
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
      link: {
        type: 'generated-index',
        slug: 'optimization',
        description: 'パフォーマンス最適化、デバッグ、プロジェクト設定、コンソール変数を使った運用時の調整と調査方法を解説します。',
      },
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
      link: {
        type: 'doc',
        id: 'parameters/overview',
      },
      items: [
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
      link: {
        type: 'generated-index',
        slug: 'api',
        description: 'FAnimNode_KawaiiPhysicsとUKawaiiPhysicsLibraryのプロパティやBlueprint/C++向け関数を参照できます。',
      },
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
