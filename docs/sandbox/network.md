---
sidebar_position: 5
title: 网络与服务访问
description: 在 Sandbox 中启动服务、获取端口地址并排查网络问题。
---

# 网络与服务访问

Sandbox 可以访问外部网络，也可以把内部 HTTP 服务通过动态域名提供给客户端。可用范围由部署网络、团队策略和创建参数共同决定。

## 启动服务并获取地址

下面在 Sandbox 的 3000 端口启动一个 HTTP 服务：

```python
from e2b import Sandbox

sandbox = Sandbox.create(timeout=300)
server = sandbox.commands.run(
    "python3 -m http.server 3000 --directory /home/user",
    background=True,
)

host = sandbox.get_host(3000)
print(f"https://{host}")
```

`get_host` 只生成端口对应的主机名，不会自动启动服务，也不会验证端口是否已监听。应用应先执行健康检查，再把 URL 返回给用户。

:::warning 服务必须监听可访问地址
Web 框架默认可能只监听 `127.0.0.1`。请根据框架设置监听 `0.0.0.0`，例如 `uvicorn app:app --host 0.0.0.0 --port 3000`。
:::

## 自建环境的地址格式

自建 E2B 通常使用以下动态域名：

```text
https://<port>-<sandbox-id>.<E2B_DOMAIN>
```

必须为 `*.<E2B_DOMAIN>` 配置通配 DNS 和 TLS 证书。生产代码应始终调用 `get_host(port)`，不要依赖手工拼接规则。

## 入站访问保护

默认动态 URL 是否公开取决于部署和 SDK 参数。对预览页面、内部 API 或包含业务数据的服务，应：

- 保持 Sandbox Envd 的安全访问开启。
- 使用控制面支持的 `network` 入站策略或每 Sandbox 访问令牌。
- 在服务自身增加鉴权，不把不可猜测 URL 当作唯一安全边界。
- 避免在响应、日志或前端代码中泄露长期凭证。

较新的 SDK 可以通过 `network` 配置限制公共流量；该能力需要控制面版本匹配，使用前请在自建环境验证。

## 出站访问

默认情况下 Sandbox 可以访问互联网。对只需要访问少量服务的任务，建议使用网络策略限制出站地址，并为外部 API 使用短期凭证。

```python
sandbox = Sandbox.create(
    allow_internet_access=False,
)
```

`allow_internet_access=False` 需要较新的 SDK 和控制面。若部署未启用动态网络策略，应在 VPC、安全组、NAT 或代理层实现相同限制。

## 常见问题

### URL 返回 502 或连接失败

依次检查：

1. 进程是否仍在运行，后台命令是否提前退出。
2. 服务是否监听正确端口和 `0.0.0.0`。
3. `get_host` 使用的端口是否与服务一致。
4. 通配 DNS、TLS 证书和网关转发是否正常。
5. Sandbox 是否已经超时、暂停或关闭。

### 暂停后连接中断

这是预期行为。暂停会停止网络服务并断开现有连接；恢复后需要重新建立 HTTP、WebSocket 或数据库连接。

### 自签证书报错

把企业或自签 CA 的完整证书链加入客户端信任，并在导入 SDK 前设置 `SSL_CERT_FILE`。不要在生产代码中永久关闭证书校验。
