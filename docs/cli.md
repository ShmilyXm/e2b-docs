---
sidebar_position: 4
title: CLI 快速参考
description: 使用 E2B CLI 管理 Template 和 Sandbox。
---

# CLI 快速参考

E2B CLI 适合初始化和构建 Template、查看运行中的 Sandbox，以及进入交互式终端。业务应用仍建议使用 SDK 管理 Sandbox 生命周期。

## 安装与认证

```bash
npm install -g @e2b/cli
```

```bash
export E2B_API_KEY="e2b_***"
```

自建集群还需要根据部署输出配置 Domain 或控制面地址。CLI 对自建地址的参数名称会随版本变化，先运行 `e2b --help` 和对应子命令的 `--help`，并优先使用部署清单验证过的 CLI 版本。

`e2b auth login` 面向上游托管登录流程，不能代替自建集群签发的 API Key。

## Sandbox 管理

```bash
e2b sandbox list
e2b sandbox create <template-name-or-id>
e2b sandbox connect <sandbox-id>
e2b sandbox kill <sandbox-id>
```

进入 Sandbox 后可以直接运行 Shell 命令。不同 CLI 小版本的子命令参数可能变化，批量操作前先查看对应 `--help`。

## Template 管理

```bash
e2b template init
e2b template build --name my-template
e2b template list
e2b template delete <template-id>
```

构建状态和日志也可以在 Dashboard 的 **Templates / Builds** 页面查看。

:::warning 删除前确认依赖
删除 Template 前应确认没有预热池、业务配置或自动化任务仍引用它。运行中的 Sandbox 不会因此自动切换到其他 Template。
:::
