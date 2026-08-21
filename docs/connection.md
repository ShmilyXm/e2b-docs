---
sidebar_position: 3
title: 连接自建集群
description: 使用部署输出配置自建 E2B 的控制面、动态域名、API Key 和 TLS。
---

# 连接自建 E2B 集群

## 从哪里获取连接信息

计算巢部署完成后，在服务实例详情和输出中获取 Dashboard 地址、控制面 API 地址、E2B Domain 及初始化登录信息。其他部署方式由集群管理员提供同等信息。

客户端常用配置如下：

| 环境变量 | 说明 | 示例 |
| --- | --- | --- |
| `E2B_API_KEY` | API 访问凭证 | `e2b_***` |
| `E2B_API_URL` | 部署输出的控制面 API 地址，供 REST、健康检查和运维脚本使用 | `https://api.example.com` |
| `E2B_DOMAIN` | Sandbox 动态域名和服务路由的根域名 | `sandbox.example.com` |
| `E2B_TEMPLATE_ID` | Dashboard 中 Ready Template 的名称或 ID | `abc123` |
| `SSL_CERT_FILE` | 自签或企业 CA 证书链路径 | `/path/to/ca-fullchain.pem` |

Python SDK 创建 Sandbox 时显式传入集群 Domain 和 API Key：

```python
import os

from dotenv import load_dotenv

load_dotenv()

# SSL_CERT_FILE 必须在导入 e2b 前进入进程环境。
from e2b import Sandbox

sandbox = Sandbox.create(
    template=os.environ["E2B_TEMPLATE_ID"],
    api_key=os.environ["E2B_API_KEY"],
    domain=os.environ["E2B_DOMAIN"],
    timeout=120,
)
```

:::note API URL 与 Domain 的用途
本项目的 SDK 示例通过 `domain` 连接 Sandbox 与 Envd；`E2B_API_URL` 主要用于直接调用控制面 REST API。不要在没有核对当前 SDK 参数签名时把 `E2B_API_URL` 直接传给 `Sandbox.create()`。
:::

不使用 `.env` 时，也可以在导入 `e2b` 之前直接设置 `SSL_CERT_FILE`：

```python
import os

os.environ["SSL_CERT_FILE"] = "/path/to/ca-fullchain.pem"

from e2b import Sandbox
```

## 域名与 TLS

自建集群需要保证控制面 API 和动态 Sandbox 域名均可解析。业务端口的访问地址通常形如：

```text
https://<port>-<sandbox-id>.<E2B_DOMAIN>
```

`49983` 是 Envd 常用服务端口；业务服务应通过 `sandbox.get_host(port)` 获取地址，不要手工拼接生产 URL。

:::warning TLS 配置
生产环境应使用受信任证书和正确的通配域名。关闭证书校验只能用于临时排障，不应成为正式接入方式。
:::

## 连接检查清单

1. 客户端能够访问控制面 API。
2. `*.<E2B_DOMAIN>` 的通配 DNS 指向 Sandbox 网关。
3. TLS 证书覆盖根域名和动态子域名，客户端信任完整证书链。
4. Template 存在且至少有一个 Ready 构建。
5. 团队还有可用的 Sandbox 并发额度。

:::tip 凭证管理
API Key 应放在密钥管理服务、CI Secret 或本地环境变量中。不要写入源码、镜像层、Template 环境变量或日志。
:::
