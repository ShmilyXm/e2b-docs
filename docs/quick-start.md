---
sidebar_position: 2
title: 5 分钟快速开始
description: 使用 Python SDK 创建第一个 E2B Sandbox，执行命令并安全释放资源。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 5 分钟快速开始

完成本页后，你将使用自建集群的连接信息创建一个 Sandbox、执行命令、读写文件，并在任务结束后释放资源。

## 1. 准备环境

先确认自建 E2B 已经部署完成，并准备：

- Python 3.10+
- Dashboard 地址和可登录账号
- 集群签发的 E2B API Key
- `E2B_DOMAIN`：Sandbox 动态域名的根域名
- 一个状态为 Ready 的 Template 名称或 ID
- 使用企业或自签 CA 时，对应的完整 CA 证书链

计算巢部署可以从服务实例输出中获取 Dashboard、API 和域名信息。Template 名称、ID 和最新 Build 状态以 Dashboard 的 **Templates** 页面为准，不要直接照抄本文档中的示例值。

## 2. 安装 SDK

<Tabs groupId="sdk-language" defaultValue="python" values={[
  {label: 'Python', value: 'python'},
  {label: 'JavaScript / TypeScript', value: 'typescript'},
]}>
<TabItem value="python">

```bash
python -m pip install -U e2b python-dotenv
```

</TabItem>
<TabItem value="typescript">

需要 Node.js 20+：

```bash
npm install e2b dotenv
npm install -D tsx typescript
```

</TabItem>
</Tabs>

## 3. 配置凭证

在项目根目录创建 `.env`，填入自己集群的真实输出，不要提交该文件：

```bash title=".env"
E2B_API_KEY=e2b_***
E2B_DOMAIN=sandbox.example.com
E2B_TEMPLATE_ID=your-template-id

# 仅在需要直接调用控制面 REST API 时使用
E2B_API_URL=https://api.example.com

# 使用企业或自签 CA 时取消注释
# SSL_CERT_FILE=/path/to/ca-fullchain.pem
```

如需通过 REST 或运维脚本直接访问控制面，再按部署输出配置 `E2B_API_URL`。如果集群使用企业或自签 CA，再设置 `SSL_CERT_FILE`。详见[连接配置](./connection.md)。

## 4. 创建并使用 Sandbox

<Tabs groupId="sdk-language" defaultValue="python" values={[
  {label: 'Python', value: 'python'},
  {label: 'JavaScript / TypeScript', value: 'typescript'},
]}>
<TabItem value="python">

创建 `hello_sandbox.py`：

```python title="hello_sandbox.py"
import os

from dotenv import load_dotenv

load_dotenv()

# 使用 .env 中的 SSL_CERT_FILE 时，必须先加载环境变量再导入 SDK。
from e2b import Sandbox

connection = {
    "api_key": os.environ["E2B_API_KEY"],
    "domain": os.environ["E2B_DOMAIN"],
}

sandbox = Sandbox.create(
    template=os.environ["E2B_TEMPLATE_ID"],
    timeout=120,
    metadata={"source": "quick-start"},
    **connection,
)
print("Sandbox ID:", sandbox.sandbox_id)

try:
    result = sandbox.commands.run(
        'echo "Hello from E2B Sandbox" && python3 -c "print(1 + 2)"'
    )
    if result.exit_code != 0:
        raise RuntimeError(result.stderr)

    sandbox.files.write("/tmp/hello.txt", "created by E2B\n")
    print(result.stdout, end="")
    print(sandbox.files.read("/tmp/hello.txt"), end="")
finally:
    sandbox.kill()
```

运行：

```bash
python hello_sandbox.py
```

</TabItem>
<TabItem value="typescript">

创建 `hello-sandbox.ts`：

```typescript title="hello-sandbox.ts"
import 'dotenv/config'
import {Sandbox} from 'e2b'

const {E2B_API_KEY, E2B_DOMAIN, E2B_TEMPLATE_ID} = process.env
if (!E2B_API_KEY || !E2B_DOMAIN || !E2B_TEMPLATE_ID) {
  throw new Error('Missing E2B_API_KEY, E2B_DOMAIN, or E2B_TEMPLATE_ID')
}

const sandbox = await Sandbox.create(E2B_TEMPLATE_ID, {
  apiKey: E2B_API_KEY,
  domain: E2B_DOMAIN,
  timeoutMs: 120_000,
  metadata: {source: 'quick-start'},
})

console.log('Sandbox ID:', sandbox.sandboxId)

try {
  const result = await sandbox.commands.run(
    'echo "Hello from E2B Sandbox" && python3 -c "print(1 + 2)"',
  )
  if (result.exitCode !== 0) throw new Error(result.stderr)

  await sandbox.files.write('/tmp/hello.txt', 'created by E2B\n')
  console.log(result.stdout)
  console.log(await sandbox.files.read('/tmp/hello.txt'))
} finally {
  await sandbox.kill()
}
```

运行：

```bash
npx tsx hello-sandbox.ts
```

</TabItem>
</Tabs>

:::note SDK 小版本差异
E2B SDK 不同小版本对自建连接参数略有差异。应使用集群部署清单验证过的 SDK 版本；升级 SDK 前先在测试集群验证控制面和 Envd 兼容性。
:::

## 5. 检查输出

预期输出类似：

```text
Sandbox ID: sbx_***
Hello from E2B Sandbox
3
created by E2B
```

## 验证失败时

- 创建失败：检查 API Key、Template Build 状态、集群容量和团队并发额度。
- 创建成功但命令失败：检查 Sandbox 动态域名、DNS、证书和网关转发。
- `python3: not found`：当前 Template 未安装 Python，请更换 Template 或创建自定义 Template。
- `kill` 报错：保留 Sandbox ID，在 Dashboard 或 CLI 中清理。

## 下一步

- 了解 [Sandbox 生命周期](./sandbox/lifecycle.md)
- 学习 [执行命令](./sandbox/commands.md)
- 学习 [文件读写](./sandbox/filesystem.md)
- 启动并访问 [Sandbox 内的网络服务](./sandbox/network.md)
- 构建 [自定义 Template](./templates/overview.md)
