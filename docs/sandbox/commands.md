---
sidebar_position: 2
title: 执行命令
description: 在 E2B Sandbox 中执行 Shell 命令并处理输出。
---

# 执行命令

使用 `commands.run` 在 Sandbox 中运行命令：

```python
result = sandbox.commands.run("pwd && whoami && python3 --version")

print("exit code:", result.exit_code)
print("stdout:", result.stdout)
print("stderr:", result.stderr)
```

## 传递环境变量

创建 Sandbox 时可以注入任务环境变量：

```python
sandbox = Sandbox.create(
    envs={"TASK_NAME": "demo"},
    timeout=120,
)

result = sandbox.commands.run('echo "$TASK_NAME"')
```

不要通过这种方式注入长期有效的高权限凭证。优先使用短期、最小权限的访问令牌。
