import type {ReactNode} from 'react'
import Link from '@docusaurus/Link'
import Layout from '@theme/Layout'
import styles from './index.module.css'

const capabilities = [
  {
    title: '安全隔离',
    description: '让 AI Agent 在独立 Sandbox 中执行代码，降低对应用主机的影响。',
  },
  {
    title: '几行代码即可使用',
    description: '通过 Python SDK 快速创建环境、执行命令和处理文件。',
  },
  {
    title: '支持自建服务',
    description: '通过自定义 API Endpoint、域名和模板连接自己的 E2B 集群。',
  },
]

export default function Home(): ReactNode {
  return (
    <Layout
      title="E2B Sandbox 中文文档"
      description="面向 AI Agent 的安全、隔离代码执行环境"
    >
      <main>
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.eyebrow}>E2B SANDBOX · 中文指南</div>
            <h1>让 Agent 安全地<br />执行真实任务</h1>
            <p>
              从第一个 Sandbox 到自建服务排障，帮助你快速完成 E2B 的接入、开发与运维。
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
                <article className={styles.card} key={item.title}>
                  <span>0{index + 1}</span>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
