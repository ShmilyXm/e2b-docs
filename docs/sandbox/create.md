---
sidebar_position: 1
title: 创建 Sandbox
description: 选择 Template，并配置超时、环境变量、Metadata 和安全选项。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 创建 Sandbox

`Sandbox.create()` 从指定 Template 创建一个隔离环境。创建请求成功返回后，Sandbox 内的 Envd 已经可以执行命令和文件操作。

## 最小创建示例

```python
from e2b import Sandbox

sandbox = Sandbox.create()
print(sandbox.sandbox_id)
```

SDK 允许省略 Template，但自建集群的默认别名取决于初始化结果。应用应显式指定 Dashboard 中 Ready Template 的名称、别名或 ID，避免集群升级或管理员调整默认值后运行环境发生变化。

```python
sandbox = Sandbox.create(template="code-interpreter-v1")
```

## 常用参数

```python
sandbox = Sandbox.create(
    template="my-template",
    timeout=15 * 60,
    envs={"TASK_ID": "task-123"},
    metadata={"user_id": "user-42", "scene": "code-review"},
    secure=True,
)
```

<Tabs groupId="sdk-language" defaultValue="python" values={[
  {label: 'Python', value: 'python'},
  {label: 'JavaScript / TypeScript', value: 'typescript'},
]}>
<TabItem value="python">

| Python 参数 | 说明 |
| --- | --- |
| `template` | Template 名称、别名或 ID |
| `timeout` | Sandbox 超时时间，单位为秒 |
| `envs` | 注入 Sandbox 的全局环境变量 |
| `metadata` | 用于检索和关联业务对象的字符串键值对 |
| `secure` | 是否保护 Envd 访问；生产环境建议保持开启 |
| `request_timeout` | SDK 调用控制面或 Envd 的请求超时 |
| `network` | 入站、出站和 Host Header 等网络策略 |
| `lifecycle` | 超时后关闭或暂停，以及是否自动恢复 |

</TabItem>
<TabItem value="typescript">

| JavaScript/TypeScript 参数 | 说明 |
| --- | --- |
| 第一个参数或 `template` | Template 名称、别名或 ID |
| `timeoutMs` | Sandbox 超时时间，单位为毫秒 |
| `envs` | 注入 Sandbox 的全局环境变量 |
| `metadata` | 用于检索和关联业务对象的字符串键值对 |
| `secure` | 是否保护 Envd 访问；生产环境建议保持开启 |
| `requestTimeoutMs` | SDK 调用控制面或 Envd 的请求超时 |
| `network` | 入站、出站和 Host Header 等网络策略 |
| `lifecycle` | 超时后关闭或暂停，以及是否自动恢复 |

</TabItem>
</Tabs>

:::warning 两类超时不要混淆
Sandbox 的 `timeout` 控制实例生命周期；命令的 `timeout` 控制单次命令等待时长；`request_timeout` 控制 SDK 网络请求。三者相互独立。
:::

## 环境变量

创建时传入的 `envs` 对后续命令和代码执行可见：

```python
sandbox = Sandbox.create(envs={"TASK_NAME": "demo"})
result = sandbox.commands.run('printf "%s" "$TASK_NAME"')
print(result.stdout)
```

单次命令也可以覆盖或补充环境变量：

```python
result = sandbox.commands.run(
    'printf "%s" "$TASK_NAME"',
    envs={"TASK_NAME": "one-command"},
)
```

不要把长期有效的高权限凭证注入 Sandbox。优先使用短期、最小权限令牌，并在日志中隐藏敏感值。

## Metadata

Metadata 不会自动成为环境变量，它用于把 Sandbox 与用户、会话、任务或租户关联：

```python
sandbox = Sandbox.create(
    metadata={
        "user_id": "user-42",
        "session_id": "session-20260818",
    }
)
```

推荐只保存不敏感、便于查询的标识。不要把 API Key、Token 或个人敏感数据放入 Metadata。

## 创建后的必做事项

1. 保存 `sandbox_id`，方便跨进程连接和异常清理。
2. 检查首个命令或健康检查是否成功。
3. 将清理逻辑放入 `finally`，或按需配置暂停策略。
4. 为每个业务请求设置合理超时，避免资源长期占用。
