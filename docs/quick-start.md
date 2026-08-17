---
sidebar_position: 2
title: 5 分钟快速开始
description: 使用 Python SDK 创建第一个 E2B Sandbox，执行命令并安全释放资源。
---

# 5 分钟快速开始

完成本页后，你将创建一个 Sandbox、执行一条命令，并在任务结束后释放资源。

## 1. 准备环境

你需要准备：

- Python 3.10 或更高版本
- 一个可用的 E2B API Key
- 自建服务还需要 API 地址、Sandbox 域名和 Template ID

## 2. 安装 SDK

```bash
python -m pip install e2b python-dotenv
```

## 3. 配置凭证

将 API Key 放入环境变量：

```bash
export E2B_API_KEY="e2b_***"
```

如果使用自建 E2B，再配置：

```bash
export E2B_API_URL="https://api.example.com"
export E2B_DOMAIN="sandbox.example.com"
export E2B_TEMPLATE_ID="your-template-id"
```

## 4. 创建并使用 Sandbox

创建 `hello_sandbox.py`：

```python title="hello_sandbox.py"
import os

from e2b import Sandbox


options = {
    "api_key": os.environ["E2B_API_KEY"],
    "timeout": 120,
}

if os.getenv("E2B_API_URL"):
    options["api_url"] = os.environ["E2B_API_URL"]
    options["domain"] = os.environ["E2B_DOMAIN"]

template_id = os.getenv("E2B_TEMPLATE_ID")
if template_id:
    options["template"] = template_id

sandbox = Sandbox.create(**options)
print("Sandbox ID:", sandbox.sandbox_id)

try:
    result = sandbox.commands.run(
        'echo "Hello from E2B Sandbox" && python3 -c "print(1 + 2)"'
    )
    print(result.stdout)
finally:
    sandbox.kill()
```

运行示例：

```bash
python hello_sandbox.py
```

预期输出类似：

```text
Sandbox ID: sbx_***
Hello from E2B Sandbox
3
```

## 下一步

- 了解 [Sandbox 生命周期](./sandbox/lifecycle.md)
- 学习 [执行命令](./sandbox/commands.md)
- 学习 [文件读写](./sandbox/filesystem.md)
