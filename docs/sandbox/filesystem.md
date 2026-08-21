---
sidebar_position: 4
title: 文件系统
description: 在 E2B Sandbox 中读写、上传、下载和管理文件。
---

# 文件系统

`sandbox.files` 提供文件和目录操作。Sandbox 内路径应使用绝对路径；业务文件推荐统一放在 `/home/user` 或 Template 约定的工作目录中。

## 写入和读取文本

```python
sandbox.files.write("/tmp/hello.txt", "Hello, E2B!\n")
content = sandbox.files.read("/tmp/hello.txt")
print(content)
```

## 二进制文件

```python
with open("local-image.png", "rb") as file:
    sandbox.files.write("/home/user/image.png", file)

content = sandbox.files.read("/home/user/image.png", format="bytes")
with open("downloaded-image.png", "wb") as file:
    file.write(content)
```

读取大文件时，较新的 SDK 支持 `format="stream"`。使用完流式读取器后应完整消费、调用 `close()`，或使用上下文管理器释放连接。

## 列出目录

```python
entries = sandbox.files.list("/home/user")
for entry in entries:
    print(entry.name, entry.type, entry.size)
```

返回字段可能因 SDK 版本而不同；如只需名称，可以只访问 `entry.name`。

## 创建、移动和删除

```python
sandbox.files.make_dir("/home/user/work")
sandbox.files.move(
    "/home/user/image.png",
    "/home/user/work/input.png",
)
sandbox.files.remove("/home/user/work/input.png")
```

删除目录前先确认当前 SDK 是否要求 `recursive=True`，避免误删或操作失败。

## 上传和下载目录

不同 SDK 版本对批量上传和下载目录的支持程度不同。兼容性最好的做法是：

1. 本地把目录打包为 `tar.gz`。
2. 通过 `files.write` 上传归档。
3. 在 Sandbox 中运行 `tar -xzf` 解压。
4. 下载目录时在 Sandbox 中打包，再通过 `files.read(..., format="bytes")` 保存到本地。

```python
sandbox.commands.run(
    "tar -czf /tmp/output.tar.gz -C /home/user output"
)
archive = sandbox.files.read("/tmp/output.tar.gz", format="bytes")
with open("output.tar.gz", "wb") as file:
    file.write(archive)
```

## 持久化选择

Sandbox 本地文件系统默认与实例生命周期绑定：

- 短期任务结果：在关闭前下载。
- 暂停后继续：使用 Pause/Resume 保存 Sandbox 状态。
- 从同一状态创建多个环境：创建 Snapshot 或 Fork。
- 多个新 Sandbox 共享长期数据：为 Template 配置 [OSS 挂载](../storage/oss-mount.md)。

:::caution 不要把临时目录当作永久存储
`/tmp` 适合任务内临时文件。需要长期保留或跨 Sandbox 共享的数据，应写入 OSS、数据库或其他外部持久化系统。
:::
