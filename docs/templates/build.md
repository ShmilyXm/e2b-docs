---
sidebar_position: 2
title: 构建自定义 Template
description: 使用 E2B CLI 或 SDK 构建、验证和发布自定义 Sandbox Template。
---

# 构建自定义 Template

下面提供 CLI 和 SDK 两种方式。首次使用建议从 CLI 脚手架开始；需要把 Template 定义纳入应用代码时使用 SDK。

## 方式一：CLI

安装并配置 CLI 后初始化项目：

```bash
mkdir my-e2b-template
cd my-e2b-template
e2b template init
```

根据提示生成 Template 文件后，构建：

```bash
e2b template build --name my-python-template
```

构建完成后使用名称创建 Sandbox：

```python
from e2b import Sandbox

sandbox = Sandbox.create(template="my-python-template")
```

## 方式二：Python SDK

以下示例在基础 Template 上设置环境变量和一个已经启动的 HTTP 服务：

```python title="build_template.py"
from e2b import (
    Template,
    default_build_logger,
    wait_for_port,
)

template = (
    Template()
    .from_base_image()
    .set_envs({"APP_ENV": "production"})
    .run_cmd("python3 -m pip install --no-cache-dir flask")
    .set_start_cmd(
        "python3 -m http.server 8000 --directory /home/user",
        wait_for_port(8000),
    )
)

build = Template.build(
    template,
    "my-python-template",
    cpu_count=2,
    memory_mb=2048,
    on_build_logs=default_build_logger(),
)

print("template_id:", build.template_id)
print("build_id:", build.build_id)
```

如果自建部署的默认基础 Template 名称不同，可以改用 `.from_template("existing-template")`，或按 SDK 支持的 Debian/Ubuntu 基础镜像方法创建。

## Start Command 与 Ready Command

Start Command 在 **Template 构建末尾**执行，不是在每次创建 Sandbox 时执行。系统等待 Ready Command 返回退出码 0 后保存快照，因此后续 Sandbox 创建时服务已经在运行。

```python
template.set_start_cmd(
    "uvicorn app:app --host 0.0.0.0 --port 8000",
    wait_for_port(8000),
)
```

常见就绪条件包括：

- `wait_for_port(8000)`：端口已监听。
- `wait_for_url("http://localhost:8000/health")`：健康检查返回成功。
- `wait_for_file("/tmp/ready")`：初始化程序写入标记文件。
- 自定义 Shell 命令：退出码为 0 表示 Ready。

:::warning 环境变量时机
`Sandbox.create(envs=...)` 发生在 Start Command 已经运行之后，因此这些变量不会进入被快照捕获的进程。Start Command 需要的变量必须通过 Template 的 `set_envs` 固化，或由创建后的业务命令启动新进程。
:::

## 构建镜像建议

- 优先选择与当前构建系统兼容的 Debian/Ubuntu 系基础镜像。
- 固定关键软件版本，避免上游更新导致不可复现构建。
- 合并包管理器操作并清理缓存，控制 Template 磁盘大小。
- 不要在 Dockerfile、构建参数、复制文件或日志中写入长期凭证。
- 大文件和业务数据优先放入 OSS，不要反复打进 Template。

## 验证流程

1. 在 Dashboard 的 **Templates / Builds** 确认状态为 Ready。
2. 从新 Build 创建测试 Sandbox。
3. 验证预装包、文件、环境变量和工作目录。
4. 验证 Start Command 对应的端口和健康检查。
5. 执行暂停、恢复和关闭，确认资源可以正常回收。
6. 验证通过后再切换生产 Tag、别名或业务配置。

## 常见构建失败

| 现象 | 排查方向 |
| --- | --- |
| 基础镜像拉取失败 | 镜像地址、网络、私有仓库认证和架构 |
| 安装依赖失败 | 软件源、包名、代理、磁盘空间和固定版本 |
| 一直等待 Ready | Start Command 是否退出、服务监听地址、健康检查命令 |
| 创建后服务不存在 | Start Command 是否在构建期成功并被 Ready Command 验证 |
| 构建可用但业务命令失败 | 默认用户、工作目录、文件权限和运行时环境变量 |

预热池会固定创建时解析到的 Build。Template 发布新版本后，需要为新 Build 新建预热池。
