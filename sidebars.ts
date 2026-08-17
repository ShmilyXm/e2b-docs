import type {SidebarsConfig} from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: '开始使用',
      collapsible: false,
      items: ['intro', 'quick-start', 'connection'],
    },
    {
      type: 'category',
      label: 'Sandbox',
      items: [
        'sandbox/lifecycle',
        'sandbox/commands',
        'sandbox/filesystem',
      ],
    },
    {
      type: 'category',
      label: '自建服务',
      items: ['self-hosted/troubleshooting'],
    },
  ],
}

export default sidebars
