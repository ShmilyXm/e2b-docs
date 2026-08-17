---
sidebar_position: 3
title: 文件系统
description: 在 E2B Sandbox 中读写和管理文件。
---

# 文件系统

## 写入文件

```python
sandbox.files.write("/tmp/hello.txt", "Hello, E2B!\n")
```

## 读取文件

```python
content = sandbox.files.read("/tmp/hello.txt")
print(content)
```

## 列出目录

```python
entries = sandbox.files.list("/tmp")
for entry in entries:
    print(entry.name)
```

Sandbox 默认是临时环境。需要长期保留的数据应在 Sandbox 关闭前下载或写入外部持久化存储。
