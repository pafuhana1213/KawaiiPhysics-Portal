import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'KawaiiPhysics',
  tagline: 'Simple bone physics for Unreal Engine',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // GitHub Pages URL
  url: 'https://pafuhana1213.github.io',
  baseUrl: '/KawaiiPhysics-Portal/',

  // GitHub pages deployment config
  organizationName: 'pafuhana1213',
  projectName: 'KawaiiPhysics-Portal',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    localeConfigs: {
      ja: {
        label: '日本語',
        htmlLang: 'ja',
      },
      en: {
        label: 'English',
        htmlLang: 'en',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/pafuhana1213/KawaiiPhysics-Portal/tree/main/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/pafuhana1213/KawaiiPhysics-Portal/tree/main/',
          blogTitle: 'KawaiiPhysics Updates',
          blogDescription: 'KawaiiPhysicsの更新情報とTips',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'KawaiiPhysics',
      logo: {
        alt: 'KawaiiPhysics Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'ドキュメント',
        },
        {
          to: '/blog',
          label: '更新情報',
          position: 'left',
        },
        {
          to: '/adoption',
          label: '採用実績',
          position: 'left',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/pafuhana1213/KawaiiPhysics',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'ドキュメント',
          items: [
            {
              label: 'はじめに',
              to: '/docs',
            },
            {
              label: 'パラメータリファレンス',
              to: '/docs/parameters/overview',
            },
          ],
        },
        {
          title: 'コミュニティ',
          items: [
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/pafuhana1213/KawaiiPhysics/discussions',
            },
            {
              label: 'Issues',
              href: 'https://github.com/pafuhana1213/KawaiiPhysics/issues',
            },
          ],
        },
        {
          title: 'その他',
          items: [
            {
              label: '更新情報',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/pafuhana1213/KawaiiPhysics',
            },
            {
              label: 'Fab',
              href: 'https://www.fab.com/ja/listings/f870c07e-0a02-4a78-a888-e52a22794572',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} pafuhana1213. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['cpp', 'json', 'bash'],
    },
    // Algolia検索は後で設定（デプロイ後に設定）
    // algolia: {
    //   appId: 'YOUR_APP_ID',
    //   apiKey: 'YOUR_SEARCH_API_KEY',
    //   indexName: 'kawaiiphysics',
    //   contextualSearch: true,
    //   searchPagePath: 'search',
    // },
  } satisfies Preset.ThemeConfig,
};

export default config;
