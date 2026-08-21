---
sidebar_position: 3
title: 执行命令
description: 同步、流式或后台执行 Sandbox 命令，并安全处理参数和输出。
---

# 执行命令

使用 `commands.run` 在 Sandbox 中运行 Shell 命令：

```python
result = sandbox.commands.run("pwd && whoami && python3 --version")

print("exit code:", result.exit_code)
print("stdout:", result.stdout)
print("stderr:", result.stderr)
```

非零退出码不会在所有 SDK 版本中自动抛出异常，业务代码应显式检查 `exit_code`。

## 工作目录、用户和超时

```python
result = sandbox.commands.run(
    "python -m pytest -q",
    cwd="/home/user/project",
    user="user",
    timeout=120,
)
```

`timeout=0` 通常表示取消单次命令的等待上限。此时必须确保 Sandbox 自身的生命周期超时足够长，并为任务设计显式取消机制。

## 传递环境变量

```python
result = sandbox.commands.run(
    'printf "%s\n" "$TASK_NAME"',
    envs={"TASK_NAME": "demo"},
)
```

不要把用户输入直接插入 Shell 字符串：

```python
# 推荐：通过环境变量传递不受信任的值
result = sandbox.commands.run(
    'python /app/task.py --prompt "$PROMPT"',
    envs={"PROMPT": user_prompt},
)
```

即使代码运行在 Sandbox 中，Shell 注入仍可能破坏任务数据、消耗资源或访问 Sandbox 被授予的外部权限。

## 流式输出

长任务可以在执行过程中接收标准输出和错误输出：

```python
def on_stdout(data):
    print(data, end="")

def on_stderr(data):
    print(data, end="")

result = sandbox.commands.run(
    "echo start; sleep 1; echo done",
    on_stdout=on_stdout,
    on_stderr=on_stderr,
)
```

回调中应避免执行耗时操作。需要持久化大量日志时，把数据写入队列或文件，由独立任务处理。

## 后台命令

Web 服务、构建任务或数据处理可以在后台运行：

```python
handle = sandbox.commands.run(
    "python3 -m http.server 3000",
    background=True,
)

print("pid:", handle.pid)

# 不再需要时停止进程
handle.kill()
```

跨请求重新连接后台任务时，保存 Sandbox ID 和 PID：

```python
sandbox = Sandbox.connect(sandbox_id)
handle = sandbox.commands.connect(pid)
handle.wait()
```

流式回调只连接到启动命令的进程。需要跨进程读取结果时，建议把输出重定向到 Sandbox 文件，再由后续请求读取。

## 查看和中断进程

```python
processes = sandbox.commands.list()
for process in processes:
    print(process.pid, process.cmd)

sandbox.commands.kill(pid)
```

具体返回字段和信号接口会随 SDK 小版本变化，请以已安装版本的类型提示为准。
