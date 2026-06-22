import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'はじめに',
      link: { type: 'doc', id: 'intro' },
      items: [
        'getting-started/installation',
        'getting-started/sample-project',
        'getting-started/quick-start',
        'getting-started/basic-concepts',
      ],
    },
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
    {
      type: 'category',
      label: '機能ガイド',
      items: [
        {
          type: 'category',
          label: 'ボーン',
          items: [
            'features/bone-chain',
            'features/bone-subdivision',
          ],
        },
        {
          type: 'category',
          label: '物理・カーブ',
          items: [
            'features/curve-editor',
          ],
        },
        {
          type: 'category',
          label: 'コリジョン',
          items: [
            'features/collision-setup',
            'features/shared-collision',
            'features/data-assets',
          ],
        },
        {
          type: 'category',
          label: '外部力',
          items: [
            'features/wind-and-forces',
            'features/external-force-presets',
            'features/sync-bone',
          ],
        },
        'features/animnotify',
      ],
    },
    {
      type: 'category',
      label: '応用・Tips',
      items: [
        'advanced/performance',
        'advanced/fixed-substepping',
        'advanced/debugging',
        'advanced/custom-gravity',
        'advanced/runtime-control',
        'advanced/console-variables',
        'advanced/project-settings',
      ],
    },
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
