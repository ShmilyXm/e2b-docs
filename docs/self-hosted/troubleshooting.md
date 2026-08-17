---
sidebar_position: 1
title: 自建服务排障
description: 排查自建 E2B 的创建、网络、证书和命令执行问题。
---

# 自建服务排障

## Sandbox 创建失败

依次检查：

1. `E2B_API_URL` 是否可以从客户端访问。
2. API Key 是否有效。
3. Template ID 是否存在且构建完成。
4. 计算节点是否有足够容量。

## 创建成功但命令执行失败

这种情况通常说明控制面 API 可用，但客户端无法访问 Sandbox 内的 `envd` 服务。重点检查：

- `E2B_DOMAIN` 是否正确。
- `*.<E2B_DOMAIN>` 是否配置通配 DNS。
- HTTPS 证书是否覆盖通配域名。
- 办公网、代理或安全策略是否允许访问动态 Sandbox 域名。
- 49983 等服务端口是否经过网关正确转发。

## 证书错误

生产环境应配置完整证书链。若使用企业 CA，请把 CA 证书加入客户端信任链，而不是永久关闭 TLS 校验。

## 资源未释放

业务代码应始终使用 `try/finally`：

```python
sandbox = Sandbox.create(timeout=120)

try:
    sandbox.commands.run("your-command")
finally:
    sandbox.kill()
```
