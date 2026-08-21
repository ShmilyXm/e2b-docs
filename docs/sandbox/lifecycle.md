---
sidebar_position: 2
title: 生命周期
description: 创建、查询、续期、暂停、恢复、快照和关闭 E2B Sandbox。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Sandbox 生命周期

一个典型 Sandbox 会经历以下状态：

```text
创建 → Running → Paused → Running → Killed
          └──────────────────────→ Killed
```

`Killed` 是终态，关闭后的 Sandbox 不能连接或恢复。

## 查询信息

```python
info = sandbox.get_info()
print(info.sandbox_id)
print(info.template_id)
print(info.metadata)
print(info.started_at, info.end_at)
```

需要在多个请求之间复用环境时，应把 `sandbox_id` 存入自己的数据库，而不是只保存在进程内存中。

## 修改超时

<Tabs groupId="sdk-language" defaultValue="python" values={[
  {label: 'Python', value: 'python'},
  {label: 'JavaScript / TypeScript', value: 'typescript'},
]}>
<TabItem value="python">

Python SDK 的超时单位是秒：

```python
sandbox = Sandbox.create(timeout=60)
sandbox.set_timeout(10 * 60)
```

</TabItem>
<TabItem value="typescript">

JavaScript/TypeScript SDK 的超时单位是毫秒：

```typescript
const sandbox = await Sandbox.create({timeoutMs: 60_000})
await sandbox.setTimeout(10 * 60_000)
```

</TabItem>
</Tabs>

调用 `set_timeout` 会从当前时刻重新计算到期时间。上限由部署版本、团队配额和管理员策略决定。

## 连接或恢复

使用保存的 ID 连接运行中的 Sandbox；如果目标处于 Paused，`connect` 会先恢复：

```python
from e2b import Sandbox

sandbox = Sandbox.connect("your-sandbox-id", timeout=300)
result = sandbox.commands.run("whoami")
```

连接会刷新或延长 Sandbox 超时。多个服务实例可以使用同一个 ID 重新建立 SDK 连接，但业务层仍需避免对同一文件或进程产生并发冲突。

## 暂停和恢复

暂停会保存 Sandbox 的文件系统，并默认保存内存和运行进程状态：

```python
sandbox_id = sandbox.sandbox_id
sandbox.pause()

same_sandbox = Sandbox.connect(sandbox_id, timeout=300)
```

暂停期间服务端口不可访问，已有网络连接会断开。恢复后服务可以继续运行，但客户端需要重新连接。

当前 SDK 还支持 `keep_memory=False` 的文件系统模式；该模式恢复时会冷启动，运行进程和内存状态不会保留。使用前请确认自建控制面和 SDK 版本均支持。

## 超时后自动暂停

需要长期保留会话状态时，可以让 Sandbox 超时后暂停，而不是直接关闭：

```python
sandbox = Sandbox.create(
    timeout=10 * 60,
    lifecycle={
        "on_timeout": "pause",
        "auto_resume": True,
    },
)
```

`auto_resume` 只应与 `on_timeout="pause"` 一起使用。自动恢复会由 SDK 操作或入站流量触发，适合预览环境；对延迟稳定性要求很高时，应结合[预热池](./prewarm-pools.md)。

## Snapshot 与 Fork

Snapshot 会从当前 Sandbox 保存可复用状态，并且可以在原 Sandbox 关闭后继续存在：

```python
snapshot = sandbox.create_snapshot(name="configured-workspace")
cloned = Sandbox.create(template=snapshot.snapshot_id)
```

Fork 会在原 Sandbox 短暂停顿时捕获一次状态，并创建一个或多个分支环境：

```python
forks = sandbox.fork(count=2, timeout=300)
```

这两个接口依赖较新的 SDK 和控制面版本。生产使用前应在测试环境验证权限、存储空间、失败重试和返回值结构。

## 关闭

```python
sandbox.kill()
```

推荐始终使用 `try/finally`：

```python
sandbox = Sandbox.create(timeout=300)
try:
    sandbox.commands.run("your-command")
finally:
    sandbox.kill()
```

如果应用进程意外退出，使用已保存的 `sandbox_id` 在定时清理任务、Dashboard 或 CLI 中回收超时实例。
