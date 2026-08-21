---
sidebar_position: 1
title: 集群排障
description: 排查自建 E2B 的认证、Template、创建、网络、证书、命令和存储问题。
---

# 自建 E2B 集群排障

排障时先判断问题发生在哪一层：

```text
SDK/CLI → 控制面 API → Sandbox 调度 → 动态域名网关 → Envd/业务进程
                              └────→ Template / OSS / 节点资源
```

记录错误时保留时间、Sandbox ID、Template ID、Build ID 和请求 Trace ID，但必须隐藏 API Key、Access Token、Cookie 和业务敏感数据。

## 认证失败

常见现象是 HTTP 401、403 或 CLI 提示未登录：

1. 确认使用的是 API Key，而不是只供其他管理流程使用的令牌。
2. 检查环境变量是否被当前进程读取，避免 `.env` 未加载。
3. 确认 Key 属于正确团队并且没有被撤销。
4. 检查 SDK 是否连接到了预期的自建控制面。

不要把真实 Key 打印到终端或错误报告中。

## Sandbox 创建失败

依次检查：

1. 控制面 API 是否可以从客户端访问。
2. Template 名称或 ID 是否存在，最新 Build 是否为 Ready。
3. 团队是否达到并发 Sandbox 或创建速率限制。
4. Client 节点是否在线并有足够 CPU、内存和磁盘。
5. 带 Volume、网络或生命周期配置时，控制面和 SDK 版本是否兼容。

如果普通创建成功而带高级参数失败，应逐项移除 `network`、`lifecycle`、Volume 和安全配置，定位不兼容字段，不能长期以关闭安全功能作为解决方案。

## 创建成功但命令或文件操作失败

这种情况通常表示控制面正常，但客户端无法访问 Sandbox 内的 Envd。重点检查：

- `E2B_DOMAIN` 是否正确。
- `*.<E2B_DOMAIN>` 是否配置通配 DNS。
- HTTPS 证书是否覆盖动态子域名。
- 办公网、代理或安全策略是否允许访问动态 Sandbox 域名。
- Envd 端口是否经过网关正确转发。
- Template 内的 Envd 版本是否与控制面要求兼容。

可以先调用 `sandbox.get_host(49983)` 检查生成的域名，但不要假设所有部署都直接开放该端口。

## 业务端口返回 502

1. 使用 `commands.list()` 确认服务进程仍在运行。
2. 在 Sandbox 内执行 `curl http://127.0.0.1:<port>/health`。
3. 确认服务监听 `0.0.0.0`，而不是只监听本地回环地址。
4. 确认 `get_host(port)` 的端口与服务一致。
5. 检查 Sandbox 是否已暂停或超时。

## TLS 证书错误

生产环境应配置完整证书链，并保证证书的 Subject Alternative Name 覆盖 API 域名和 Sandbox 通配域名。

使用企业或自签 CA 时，把 CA 证书加入客户端信任链，并在导入 Python SDK 前设置：

```python
import os

os.environ["SSL_CERT_FILE"] = "/path/to/ca-fullchain.pem"

from e2b import Sandbox
```

不要永久设置跳过 TLS 校验的补丁或环境变量。

## Pause 后无法恢复

1. 确认 Sandbox 状态确实为 Paused，而不是 Killed。
2. 使用原 Sandbox ID 调用 `Sandbox.connect`。
3. 检查快照对象存储、来源节点和控制面日志。
4. 检查自建集群当前 SDK 与控制面是否支持 `keep_memory`、自动恢复等参数。
5. 服务恢复后重新建立客户端网络连接。

## Template 构建失败

在 Dashboard 的 **Templates / Builds** 查看具体日志：

- 基础镜像失败：检查镜像地址、架构、网络和仓库认证。
- 包安装失败：检查软件源、代理、包名、版本和磁盘空间。
- Ready 超时：检查 Start Command 是否持续运行，Ready Command 是否能返回 0。
- 创建后进程缺失：确认进程在构建快照前已经通过就绪检查。

当前自建构建流程优先使用 Debian/Ubuntu 系基础镜像；Alpine、CentOS/RHEL 等缺少 `apt` 的镜像可能无法通过构建阶段。

## OSS 挂载失败

1. 在 Dashboard 重新执行 **Test and save**。
2. 确认 Bucket、Region 和 Prefix 一致。
3. 检查 Client ECS RAM Role 的最小权限。
4. 确认挂载是在 Sandbox 创建前保存，并且 Template 匹配。
5. 检查 Sandbox 内目录没有被业务启动脚本覆盖。

现有 Sandbox 不会自动获得新增挂载，必须新建实例验证。

## 资源未释放

业务代码应始终使用 `try/finally`：

```python
sandbox = Sandbox.create(timeout=120)

try:
    sandbox.commands.run("your-command")
finally:
    sandbox.kill()
```

同时建议运行定时清理任务：按 Metadata、创建时间或业务会话状态找出遗留 Sandbox，确认后关闭。Paused Sandbox 是否计入配额和存储费用取决于部署策略，应由管理员明确回收规则。

## 提交问题时提供

- 客户端 SDK/CLI 版本和语言版本。
- 自建 E2B 发布版本或镜像版本。
- 经过脱敏的最小复现代码。
- Sandbox ID、Template ID、Build ID 和发生时间。
- 控制面、网关、Client/Orchestrator 和 Template Build 的相关错误日志。
- 是否仅在特定网络、Template、节点或高级参数下发生。
