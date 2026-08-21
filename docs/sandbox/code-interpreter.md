---
sidebar_position: 6
title: 代码解释器
description: 使用 E2B Code Interpreter 执行 Python、JavaScript 等代码并处理结果。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 代码解释器

普通 `e2b` SDK 适合 Shell、文件和进程操作；需要 Jupyter 内核、结构化执行结果、图表或多语言代码上下文时，使用 Code Interpreter SDK 和对应 Template。

## 安装

<Tabs groupId="sdk-language" defaultValue="python" values={[
  {label: 'Python', value: 'python'},
  {label: 'JavaScript / TypeScript', value: 'typescript'},
]}>
<TabItem value="python">

```bash
python -m pip install -U e2b-code-interpreter python-dotenv
```

</TabItem>
<TabItem value="typescript">

```bash
npm install @e2b/code-interpreter dotenv
```

</TabItem>
</Tabs>

先在自建 Dashboard 确认 `code-interpreter-v1` 或同类 Template 的构建状态为 Ready。该名称只是当前计算巢初始化的常见别名，实际使用时以本集群为准。

## 执行 Python

```python
from e2b_code_interpreter import Sandbox

sandbox = Sandbox.create(template="code-interpreter-v1")
try:
    execution = sandbox.run_code(
        "values = [2, 4, 8]\nprint(sum(values))\nsum(values) / len(values)"
    )

    print("stdout:", execution.logs.stdout)
    print("stderr:", execution.logs.stderr)
    print("results:", execution.results)
    print("error:", execution.error)
finally:
    sandbox.kill()
```

`execution.error` 为空才表示代码成功。标准输出位于 `execution.logs`，最后表达式、表格和图片等结构化结果位于 `execution.results`。

## 执行其他语言

Template 安装相应内核后，可以传入 `language`：

```python
execution = sandbox.run_code(
    "console.log(['hello', 'e2b'].join(' '))",
    language="javascript",
)
```

可用语言取决于 Template，而不是 SDK 本身。使用前应先在目标 Template 中执行最小示例验证运行时和内核。

## 上传数据并分析

```python
with open("dataset.csv", "rb") as file:
    remote = sandbox.files.write("/home/user/dataset.csv", file)

execution = sandbox.run_code(
    """
import pandas as pd

df = pd.read_csv('/home/user/dataset.csv')
print(df.shape)
df.describe()
"""
)
```

处理模型生成代码时应限制输入数据和外部凭证权限，设置 Sandbox 与单次执行超时，并检查错误、输出大小和资源使用。

## 选择 `commands.run` 还是 `run_code`

| 场景 | 推荐接口 |
| --- | --- |
| 运行 CLI、构建、测试或启动服务 | `commands.run` |
| 执行短代码并获取结构化结果 | `run_code` / `runCode` |
| 生成图表、表格或保留 Notebook 上下文 | Code Interpreter |
| 需要最小镜像和纯 Shell 环境 | 普通 `e2b` SDK |

:::tip 预装依赖
固定依赖应写入自定义 Template，以减少每次创建 Sandbox 后安装软件的时间。临时或用户指定的包可以在运行期安装，但只对当前 Sandbox 生效。
:::
