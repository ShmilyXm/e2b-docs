import type {Config} from '@docusaurus/types'
import type {Options, ThemeConfig} from '@docusaurus/preset-classic'
import {themes as prismThemes} from 'prism-react-renderer'

const config: Config = {
  title: 'E2B Sandbox 中文文档',
  tagline: '面向 AI Agent 的安全、隔离代码执行环境',
  favicon: 'img/favicon.svg',
  url: 'https://shmilyxm.github.io',
  baseUrl: '/e2b-docs/',
  organizationName: 'ShmilyXm',
  projectName: 'e2b-docs',
  trailingSlash: true,
  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
    localeConfigs: {
      'zh-Hans': {
        label: '简体中文',
        htmlLang: 'zh-CN',
      },
    },
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl: 'https://github.com/ShmilyXm/e2b-docs/edit/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
      } satisfies Options,
    ],
  ],
  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'E2B Sandbox',
      logo: {
        alt: 'E2B Sandbox',
        src: 'img/logo.svg',
      },
      items: [
        {to: '/docs/intro', label: '文档', position: 'left'},
        {to: '/docs/quick-start', label: '快速开始', position: 'left'},
        {
          href: 'https://github.com/ShmilyXm/e2b-docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '开始使用',
          items: [
            {label: '产品介绍', to: '/docs/intro'},
            {label: '快速开始', to: '/docs/quick-start'},
          ],
        },
        {
          title: '核心能力',
          items: [
            {label: '生命周期', to: '/docs/sandbox/lifecycle'},
            {label: '执行命令', to: '/docs/sandbox/commands'},
            {label: '文件系统', to: '/docs/sandbox/filesystem'},
          ],
        },
        {
          title: '更多',
          items: [
            {label: 'GitHub', href: 'https://github.com/ShmilyXm/e2b-docs'},
            {label: 'E2B 官方文档', href: 'https://docs.e2b.dev/'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} E2B Sandbox 中文文档`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'python'],
    },
  } satisfies ThemeConfig,
}

export default config
