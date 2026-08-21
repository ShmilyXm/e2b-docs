---
sidebar_position: 1
slug: /intro
title: 自建 E2B Sandbox 使用指南
description: 面向自建 E2B 集群的连接、Sandbox 开发、Template、存储和运维指南。
---

# 自建 E2B Sandbox 使用指南

本文档面向已经部署 E2B 集群的管理员和开发者，介绍如何使用部署输出的地址与凭证连接集群，通过 SDK 或 CLI 创建 Sandbox，并管理 Template、预热池和 OSS 挂载。代码示例默认使用 Python SDK；提供多语言示例时，可通过语言 Tab 切换到 JavaScript/TypeScript。

:::info 阅读前提
本文档不是 `e2b.dev` 公有云账号的使用手册。页面中的域名、API Key、Template 和配额都来自你自己的 E2B 集群；上游 E2B 文档只作为 SDK 接口参考。
:::

## 为什么使用 Sandbox

- **强隔离**：每个 Sandbox 运行在独立的 Firecracker 微虚拟机中，不直接访问应用主机。
- **快速启动**：Template 预先构建并保存运行环境，创建 Sandbox 时从快照恢复。
- **完整工具链**：支持命令执行、文件读写、代码解释器、自定义 Template 和端口访问。
- **生命周期可控**：支持创建、查询、续期、连接、暂停、恢复、快照和关闭。
- **面向生产**：可以使用 Metadata 关联业务对象，使用预热池降低突发请求的启动延迟，并把 OSS 数据挂载给指定 Template。

## 核心概念

| 概念 | 说明 |
| --- | --- |
| Sandbox | 为一次任务或会话创建的隔离运行环境 |
| Template | Sandbox 启动时使用的软件、文件和进程模板 |
| API Key | 由自建集群签发、供 SDK 和 CLI 访问控制面的凭证 |
| Timeout | Sandbox 自动释放或暂停前允许存活的时间 |
| Envd | Sandbox 内提供命令、文件和代码执行能力的守护进程 |
| Snapshot | 从运行中 Sandbox 保存的可复用状态 |
| Prewarm Pool | 为指定 Template 预先准备的可分配 Sandbox 集合 |

## 推荐阅读顺序

1. [5 分钟快速开始](./quick-start.md)：使用集群输出创建第一个 Sandbox。
2. [连接配置](./connection.md)：理解控制面地址、动态域名和证书。
3. [创建 Sandbox](./sandbox/create.md)：选择 Template、超时、环境变量和 Metadata。
4. [生命周期](./sandbox/lifecycle.md)：管理续期、暂停、恢复和清理。
5. [自定义 Template](./templates/overview.md)：预装依赖、文件和长驻服务。

:::tip 凭证安全
示例中的 API Key 只从环境变量读取。不要把真实凭证写进代码、Template、镜像层、日志或 Git 仓库。
:::

## 能力边界

本文档以本仓库当前自建 E2B 实现和 E2B v2 SDK 为准。上游 SDK 的新接口只有在自建控制面、Envd 和 Template 版本同时支持时才可用；涉及并发额度、连续运行时间、网络和存储时，以当前集群的 Dashboard、部署参数和管理员策略为准。
