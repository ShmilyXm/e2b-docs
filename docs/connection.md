---
sidebar_position: 3
title: 连接配置
description: 配置 E2B 公有云和自建服务连接参数。
---

# 连接配置

## E2B 公有云

使用公有云时通常只需要配置 API Key：

```bash
export E2B_API_KEY="e2b_***"
```

SDK 会自动读取该环境变量。

## 自建 E2B

连接自建服务需要明确提供：

| 环境变量 | 说明 | 示例 |
| --- | --- | --- |
| `E2B_API_KEY` | API 访问凭证 | `e2b_***` |
| `E2B_API_URL` | API 服务地址 | `https://api.example.com` |
| `E2B_DOMAIN` | Sandbox 动态域名后缀 | `sandbox.example.com` |
| `E2B_TEMPLATE_ID` | 可用模板 ID | `abc123` |

自建服务需要保证 API 域名和动态 Sandbox 域名均可解析。命令执行通常会访问形如下面的地址：

```text
https://49983-<sandbox-id>.<E2B_DOMAIN>
```

:::warning TLS 配置
生产环境应使用受信任证书和正确的通配域名。关闭证书校验只能用于临时排障，不应成为正式接入方式。
:::
