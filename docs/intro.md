---
sidebar_position: 1
slug: /intro
title: E2B Sandbox 中文文档
description: E2B Sandbox 中文使用指南，帮助开发者快速创建和管理安全隔离的代码执行环境。
---

# E2B Sandbox 中文文档

E2B Sandbox 为 AI Agent 提供按需创建的安全隔离环境。你可以在 Sandbox 中执行模型生成的代码、运行命令、处理文件，并在任务结束后释放环境。

## 为什么使用 Sandbox

- **安全隔离**：代码在独立环境中运行，不直接影响应用主机。
- **开箱即用**：通过 Python 或 JavaScript SDK 在几行代码内创建环境。
- **完整工具链**：支持命令执行、文件读写、代码解释器和自定义模板。
- **生命周期可控**：可以创建、连接、延长超时、暂停、恢复和关闭 Sandbox。

## 核心概念

| 概念 | 说明 |
| --- | --- |
| Sandbox | 为一次任务创建的隔离运行环境 |
| Template | Sandbox 启动时使用的软件和系统环境模板 |
| API Key | SDK 访问 E2B 服务使用的凭证 |
| Timeout | Sandbox 自动释放前允许存活的时间 |

## 从哪里开始

第一次使用建议按以下顺序阅读：

1. [快速开始](./quick-start.md)：创建第一个 Sandbox 并执行命令。
2. [连接配置](./connection.md)：连接 E2B 公有云或自建服务。
3. [生命周期](./sandbox/lifecycle.md)：理解创建、连接和清理流程。

:::tip 建议
示例中的 API Key 只从环境变量读取。不要把真实凭证写进代码或提交到 Git 仓库。
:::
