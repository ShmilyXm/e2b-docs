---
sidebar_position: 1
title: 生命周期
description: 创建、连接、续期和关闭 E2B Sandbox。
---

# Sandbox 生命周期

一个典型 Sandbox 会经历以下状态：

```text
创建 → 运行 → 暂停 → 恢复 → 关闭
          └──────────→ 关闭
```

## 创建

```python
from e2b import Sandbox

sandbox = Sandbox.create(timeout=300)
print(sandbox.sandbox_id)
```

`timeout` 表示 Sandbox 的存活时间。长任务应设置合理超时，避免任务尚未完成环境就被自动释放。

## 连接已有 Sandbox

应用应保存 `sandbox_id`，需要继续工作时再连接：

```python
sandbox = Sandbox.connect("your-sandbox-id")
```

## 关闭

使用完毕后主动关闭：

```python
sandbox.kill()
```

推荐把清理逻辑放在 `finally` 中，确保命令执行失败时也能释放资源。
