---
sidebar_position: 1
title: 挂载 OSS
description: 将阿里云 OSS 目录挂载到新创建的 E2B Sandbox。
---

# 挂载 OSS

E2B 可以按 Template 配置阿里云 OSS 挂载。OSS 目录既可以是所有 Sandbox 共享的固定路径，也可以使用 `{user_id}`、`{session_id}` 等 Sandbox Metadata 变量动态解析，适合共享数据集、模型、用户工作区和任务结果。

:::warning 生效范围
新增、修改或删除挂载只影响之后新创建的 Sandbox。已经运行或暂停的 Sandbox 会保留创建时的挂载配置。
:::

## 使用前准备

开始配置前，请确认：

- OSS Bucket 已经存在；E2B 不会自动创建 Bucket。
- OSS 目录中第一个变量之前的固定 Prefix 应已存在；动态读写目录可以在创建 Sandbox 时自动创建。
- E2B Client 节点绑定了可访问目标 Bucket 和目录的 ECS RAM Role。
- 管理员已经为 Dashboard 配置 `INFRA_API_ADMIN_TOKEN` 或 `DASHBOARD_API_ADMIN_TOKEN`。
- 已创建需要使用挂载的非默认 Template。

只读挂载至少需要读取和列举目标对象的权限；读写挂载还需要与业务操作相匹配的写入、覆盖或删除权限。建议只授权目标 Bucket 或 Prefix 所需的最小权限。

:::info 凭证安全
Dashboard 会通过 Client 节点的 ECS RAM Role 测试 OSS 访问能力。访问凭证保留在 Client 节点，不会传入 Sandbox，也不会由 Dashboard 保存 OSS AccessKey。
:::

## 创建挂载

1. 登录 E2B Dashboard。
2. 在左侧导航进入 **Storage**。
3. 单击新增 OSS 挂载。
4. 填写 Template、OSS 地址和 Sandbox 挂载目录。
5. 选择只读或读写访问。
6. 单击 **Test and save**。连接测试成功后，系统保存挂载配置。
7. 使用该 Template 新建一个 Sandbox，验证目录可以访问。

| 配置项 | 是否必填 | 说明 |
| --- | --- | --- |
| Template | 是 | 挂载应用到哪个 Template。 |
| Bucket | 是 | 已存在的 OSS Bucket 名称，长度 3～63，只能使用小写字母、数字和连字符。 |
| Region | 是 | Bucket 所在地域，例如 `cn-hangzhou`；默认使用集群地域。 |
| OSS 目录 | 否 | Bucket 内的相对路径。留空表示 Bucket 根目录；支持 `{变量名}` 引用 Sandbox Metadata。 |
| Sandbox 目录 | 是 | Sandbox 内的绝对路径，例如 `/workspace/data`；不能使用根目录 `/`。 |
| 访问模式 | 是 | `Read only`（只读）或 `Read and write`（读写）。 |

### OSS 目录填写方式

| 填写值 | 效果 |
| --- | --- |
| 留空 | 所有 Sandbox 共享 Bucket 根目录。 |
| `shared/workspace` | 所有 Sandbox 共享固定目录。 |
| `{user_id}/workspace` | 根据创建 Sandbox 时传入的 `user_id` 隔离目录。 |
| `{user_id}/workspace/{session_id}` | 同时根据用户和会话隔离目录。 |
| `projects/{user_id}/workspace` | 使用固定的 `projects` Prefix，再根据用户隔离。 |

变量必须独占一个完整目录段：

- ✅ `{user_id}/workspace/{session_id}`
- ❌ `user-{user_id}/workspace`

Dashboard 会自动把 `{user_id}` 转换为后端使用的 `{metadata.user_id}`，用户不需要填写
`metadata.` 前缀。第一个变量之前的固定路径会作为 OSS Prefix，例如
`projects/{user_id}/workspace` 会在 `projects` 下按用户创建或选择子目录。

路径可以带开头或结尾的 `/`，Dashboard 保存时会自动去除。路径中不能包含连续的 `//`，也不能
包含 `.` 或 `..` 路径段。

## 在 Sandbox 中验证

挂载配置保存后，必须新建 Sandbox 才能验证。假设 Dashboard 中填写：

```text
Bucket:           beijing-test-delete
OSS 目录:         {user_id}/workspace/{session_id}
Sandbox 目录:     /workspace/data
```

创建 Sandbox 时传入目录引用的 Metadata：

```python
from e2b import Sandbox

sandbox = Sandbox.create(
    template="your-template-id",
    metadata={
        "user_id": "user-123",
        "session_id": "session-456",
    },
)
try:
    result = sandbox.commands.run("ls -la /workspace/data")
    print(result.stdout)
finally:
    sandbox.kill()
```

此时实际映射关系为：

```text
oss://beijing-test-delete/user-123/workspace/session-456/
    -> Sandbox /workspace/data
```

如果使用读写模式，可以在上面的 `try` 代码块中创建测试文件，并到 OSS 控制台确认对象：

```python
result = sandbox.commands.run(
    "printf 'hello from e2b\\n' > /workspace/data/e2b-test.txt"
)
print(result.exit_code)
```

验证完成后，请删除测试文件，避免污染业务目录。

Template 默认挂载由控制面合并到创建请求中。调用方不能通过传入同一路径覆盖它，也不能把管理员配置的只读挂载降级为读写。

### 缺少或传错 Metadata

对于 `{user_id}/workspace/{session_id}`：

| 创建参数 | 结果 |
| --- | --- |
| `user_id`、`session_id` 都存在且合法 | 解析实际 OSS 目录并挂载。 |
| 缺少任意变量，或者变量值为空 | 跳过整条 OSS 挂载，Sandbox 仍然创建。 |
| 变量包含 `/`、反斜杠或控制字符，或者值为 `.`、`..` | Sandbox 创建失败。 |

:::warning 跳过挂载不等于目录不存在
Sandbox 镜像或应用仍可能创建 `/workspace/data` 本地目录，因此不能只根据目录是否存在判断 OSS
是否已经挂载。缺少 Metadata 时写入该本地目录的数据不会进入 OSS，Sandbox 销毁后可能丢失。
如果业务要求数据必须持久化，请在调用 `Sandbox.create()` 前校验必需的 Metadata。
:::

Metadata 应由保存 E2B API Key 的可信应用服务端设置。不要让最终用户随意指定用于租户隔离的
`user_id`，否则用户可能选择其他人的 OSS 目录。

## 访问模式建议

- 数据集、模型和公共依赖建议使用只读模式，减少误删或覆盖风险。
- 任务结果目录可以使用读写模式，并按业务或任务划分 Prefix。
- 多个 Sandbox 同时写入时，应使用不会冲突的对象名称，或在应用层设计并发控制。

:::caution OSS 与本地文件系统不同
OSS 是对象存储，并不完全兼容 POSIX 文件系统语义。不建议在 OSS 挂载目录中运行数据库、依赖文件锁的程序，或需要原子重命名和强一致目录操作的工作负载。此类数据应保存在 Sandbox 本地文件系统或专用存储中。
:::

## 删除挂载

在 **Storage** 页面删除挂载后，后续新建的 Sandbox 不再挂载该 OSS 目录。已经创建的 Sandbox 不受影响，OSS 中的 Bucket 和对象也不会被删除。

## 常见问题

### `Test and save` 提示无权限

检查 Client ECS 实例绑定的 RAM Role，并确认策略覆盖了正确的 Bucket、Region 和 Prefix。只读策略无法保存为读写挂载。

### Dashboard 提示缺少管理员令牌

管理员需要为 Dashboard 服务配置 `INFRA_API_ADMIN_TOKEN` 或 `DASHBOARD_API_ADMIN_TOKEN`，然后重启或重新部署 Dashboard。普通用户无法在页面中补充该配置。

### 新建 Sandbox 中没有挂载目录

依次确认：

1. Sandbox 是否在保存挂载之后创建。
2. 创建 Sandbox 时使用的 Template 是否与挂载配置一致。
3. OSS 目录引用的每个变量是否都通过 Sandbox Metadata 传入且不为空。
4. Sandbox 目录是否与页面配置完全一致。
5. 挂载是否仍显示在 **Storage** 页面。

如果缺少任意 Metadata 变量，系统会按设计跳过整条挂载而继续创建 Sandbox。补齐 Metadata 后必须
重新创建 Sandbox，无法给已经运行的 Sandbox 热添加挂载。

### 为什么 OSS 目录中的变量没有被替换

Dashboard 中使用简写 `{user_id}`，创建 Sandbox 时则传递
`metadata={"user_id": "user-123"}`。不要把花括号表达式作为 Metadata 的值，也不要在 Dashboard
中写成 `user-{user_id}`；变量只能作为一个完整目录段。

### 修改配置后旧 Sandbox 没有变化

这是预期行为。Template 挂载在 Sandbox 创建时确定；请关闭旧 Sandbox，并使用相同 Template 创建新实例。
