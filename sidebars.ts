import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'はじめに',
      link: { type: 'doc', id: 'intro' },
      items: [
        'getting-started/installation',
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
        'features/bone-chain',
        'features/collision-setup',
        'features/wind-and-forces',
        'features/curve-editor',
        'features/data-assets',
        'features/sync-bone',
        'features/external-force-presets',
        'features/animnotify',
      ],
    },
    {
      type: 'category',
      label: '応用・Tips',
      items: [
        'advanced/performance',
        'advanced/debugging',
        'advanced/custom-gravity',
        'advanced/runtime-control',
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
