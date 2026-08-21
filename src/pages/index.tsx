import type {ReactNode} from 'react'
import Link from '@docusaurus/Link'
import Layout from '@theme/Layout'
import styles from './index.module.css'

const capabilities = [
  {
    title: '快速开始',
    description: '默认使用 Python SDK 创建 Sandbox，执行命令并处理文件。',
    to: '/docs/quick-start',
  },
  {
    title: '生命周期',
    description: '查询、续期、连接、暂停、恢复、快照并安全释放运行环境。',
    to: '/docs/sandbox/lifecycle',
  },
  {
    title: '执行与文件',
    description: '同步、流式或后台运行任务，并上传、下载和管理业务文件。',
    to: '/docs/sandbox/commands',
  },
  {
    title: '代码解释器',
    description: '运行模型生成的代码，并处理日志、错误、表格和图表结果。',
    to: '/docs/sandbox/code-interpreter',
  },
  {
    title: '自定义 Template',
    description: '预装依赖、复制文件，并让服务在 Sandbox 创建时已经就绪。',
    to: '/docs/templates/overview',
  },
  {
    title: '生产能力',
    description: '通过预热池降低启动延迟，并把 OSS 数据挂载给指定 Template。',
    to: '/docs/sandbox/prewarm-pools',
  },
]

export default function Home(): ReactNode {
  return (
    <Layout
      title="自建 E2B Sandbox 使用指南"
      description="面向自建 E2B 集群的接入、开发与运维指南"
    >
      <main>
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.eyebrow}>SELF-HOSTED E2B · 中文指南</div>
            <h1>让 Agent 安全地<br />执行真实任务</h1>
            <p>
              从集群连接到 Sandbox、Template、预热池和 OSS，帮助你使用与运维自己的 E2B 集群。
            </p>
            <div className={styles.actions}>
              <Link className="button button--primary button--lg" to="/docs/quick-start">
                5 分钟快速开始
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/intro">
                浏览文档
              </Link>
            </div>
          </div>
        </section>
        <section className={styles.capabilities}>
          <div className="container">
            <div className={styles.grid}>
              {capabilities.map((item, index) => (
                <Link className={styles.card} key={item.title} to={item.to}>
                  <span>0{index + 1}</span>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
