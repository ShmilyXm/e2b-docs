---
sidebar_position: 1
title: Template 概览
description: 选择系统 Template，并了解何时创建自定义运行环境。
---

# Template 概览

Template 定义 Sandbox 启动时拥有的操作系统、软件包、文件、环境变量、资源规格和长驻进程。Template 构建完成后可以反复创建一致的 Sandbox。

## 两种使用路径

### 基于现有 Template

适合希望复用平台内置命令、文件和代码执行能力，只需要少量业务依赖的场景：

1. 在 Dashboard 的 **Templates** 页面选择 Ready Template。
2. 使用 Template 名称或 ID 创建 Sandbox。
3. 在运行期通过 `commands.run` 安装少量临时依赖。

```python
from e2b import Sandbox

sandbox = Sandbox.create(template="code-interpreter-v1")
```

运行期安装的依赖只属于当前 Sandbox，新建实例不会继承。

### 创建自定义 Template

适合以下场景：

- 每次任务都使用相同的大型依赖。
- 需要固定代码、模型、系统包、用户或工作目录。
- Sandbox 创建后需要服务已经处于运行状态。
- 需要可审计、可灰度的环境版本。

自定义 Template 可以使用 CLI 初始化，也可以用 Python/TypeScript SDK 声明构建步骤。详见[构建自定义 Template](./build.md)。

## 构建与运行的区别

Template 构建阶段会：

1. 准备基础镜像。
2. 执行安装、复制文件和配置等步骤。
3. 运行 Start Command。
4. 等待 Ready Command 成功。
5. 保存可快速恢复的 Template 快照。

从 Template 创建 Sandbox 时，Start Command 不会重新执行；被快照捕获的进程会直接恢复。需要每次创建都执行的逻辑，应放在应用调用 `Sandbox.create()` 之后。

## Template 标识

- **ID**：不可读但稳定，适合精确引用。
- **名称或别名**：便于业务配置，但应避免随意改变指向。
- **Tag**：把稳定名称映射到具体构建，适合开发、灰度和生产发布。
- **Build ID**：一次不可变构建的唯一标识。

生产发布建议创建新 Build，验证后再切换 Tag 或业务配置，不要直接覆盖正在使用的版本。

## 在 Dashboard 中检查

Dashboard 的 **Templates** 页面可以查看：

- Template ID、名称、可见性和资源规格。
- 最新 Build 的状态、版本和构建日志。
- Tag 当前指向的 Build 和历史变化。
- 使用该 Template 启动的 Sandbox 数量。

Template 构建失败时，先查看 Build 日志定位镜像拉取、软件安装、磁盘空间或 Ready Command 问题。
