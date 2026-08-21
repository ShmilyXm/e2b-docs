import type {SidebarsConfig} from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: '开始使用',
      collapsible: false,
      items: ['intro', 'quick-start', 'connection', 'cli'],
    },
    {
      type: 'category',
      label: 'Sandbox',
      items: [
        'sandbox/create',
        'sandbox/lifecycle',
        'sandbox/commands',
        'sandbox/filesystem',
        'sandbox/network',
        'sandbox/code-interpreter',
        'sandbox/prewarm-pools',
      ],
    },
    {
      type: 'category',
      label: 'Templates',
      items: ['templates/overview', 'templates/build'],
    },
    {
      type: 'category',
      label: '存储',
      items: ['storage/oss-mount'],
    },
    {
      type: 'category',
      label: '运维与排障',
      items: ['self-hosted/troubleshooting'],
    },
  ],
}

export default sidebars
