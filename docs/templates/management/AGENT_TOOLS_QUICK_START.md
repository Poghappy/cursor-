# 🚀 Agent 工具快速开始指南

> 基于 GitHub 深度研究的 Agent 团队工具集成方案

## 📋 概述

本指南将帮助您快速上手使用基于 GitHub 研究结果集成的 Agent 团队工具。这些工具专为我们的 11 个 Agent 角色设计，可以显著提升工作效率。

---

## 🎯 快速开始

### 1. 环境准备

```bash
# 检查环境
make check-env

# 安装依赖
make install

# 设置环境
make setup
```

### 2. 查看可用工具

```bash
# 查看所有命令
make help

# 查看 Agent 角色工具
make commands | grep -E "(product|requirement|architecture|developer|test|operations|doc|llm|project)"
```

---

## 🛠️ 按角色使用工具

### 📋 产品管理 (PO/PM)

#### 快速命令

```bash
# 生成产品路线图
make product-roadmap

# 管理用户故事
make user-stories

# 管理功能开关
make feature-flags

# 启动完整工具
make product-manager
```

#### 使用场景

- **产品规划**：使用 `product-roadmap` 生成季度路线图
- **需求管理**：使用 `user-stories` 创建和验证用户故事
- **功能发布**：使用 `feature-flags` 管理功能开关

### 📊 需求分析 (BA)

#### 快速命令

```bash
# 分析需求文档
make requirements-analyze

# 业务流程建模
make process-model

# 生成用例
make use-cases

# 启动完整工具
make requirement-analyzer
```

#### 使用场景

- **需求验证**：使用 `requirements-analyze` 检查需求完整性
- **流程设计**：使用 `process-model` 创建业务流程模型
- **用例开发**：使用 `use-cases` 自动生成测试用例

### 🏗️ 架构设计 (Arch)

#### 快速命令

```bash
# 创建架构决策记录
make adr-create

# 系统设计生成
make system-design

# 技术栈推荐
make tech-stack

# 启动完整工具
make architecture-designer
```

#### 使用场景

- **架构决策**：使用 `adr-create` 记录重要技术决策
- **系统设计**：使用 `system-design` 生成架构图
- **技术选型**：使用 `tech-stack` 获得技术栈建议

### 💻 开发工程 (Dev)

#### 快速命令

```bash
# 代码生成
make code-generate

# API 客户端生成
make api-client

# 数据库迁移
make migration

# 启动完整工具
make developer-tools
```

#### 使用场景

- **快速开发**：使用 `code-generate` 生成 CRUD 代码
- **API 集成**：使用 `api-client` 生成客户端 SDK
- **数据管理**：使用 `migration` 管理数据库变更

### 🧪 质量保证 (QA)

#### 快速命令

```bash
# 生成测试用例
make test-generate

# 质量门禁检查
make quality-gate

# 测试框架设置
make test-framework

# 启动完整工具
make test-manager
```

#### 使用场景

- **测试开发**：使用 `test-generate` 自动生成测试用例
- **质量检查**：使用 `quality-gate` 确保代码质量
- **框架配置**：使用 `test-framework` 设置测试环境

### 🚀 运维部署 (Ops)

#### 快速命令

```bash
# 基础设施即代码
make infrastructure

# CI/CD 管道生成
make pipeline

# 监控设置
make monitor-setup

# 启动完整工具
make operations-tools
```

#### 使用场景

- **基础设施**：使用 `infrastructure` 生成 IaC 配置
- **自动化部署**：使用 `pipeline` 创建 CI/CD 流程
- **系统监控**：使用 `monitor-setup` 配置监控系统

### 📚 技术文档 (TW)

#### 快速命令

```bash
# API 文档生成
make api-docs

# 用户手册生成
make user-manual

# 变更日志管理
make changelog

# 启动完整工具
make doc-generator
```

#### 使用场景

- **API 文档**：使用 `api-docs` 自动生成 API 文档
- **用户指南**：使用 `user-manual` 创建用户手册
- **版本管理**：使用 `changelog` 管理版本变更

### 🤖 AI 工程 (LLME)

#### 快速命令

```bash
# 提示工程优化
make prompt-optimize

# 模型管理
make model-manage

# AI 能力评估
make ai-assess

# 启动完整工具
make llm-engineer
```

#### 使用场景

- **提示优化**：使用 `prompt-optimize` 改进 AI 提示
- **模型管理**：使用 `model-manage` 管理 AI 模型
- **能力测试**：使用 `ai-assess` 评估 AI 性能

### 📅 项目管理 (PjM)

#### 快速命令

```bash
# 项目时间线生成
make timeline

# 资源规划
make resource-plan

# 风险评估
make risk-assess

# 启动完整工具
make project-coordinator
```

#### 使用场景

- **项目规划**：使用 `timeline` 生成项目时间线
- **资源管理**：使用 `resource-plan` 规划团队资源
- **风险控制**：使用 `risk-assess` 识别和评估风险

---

## 🔧 高级用法

### 组合使用

```bash
# 完整的产品开发流程
make product-roadmap && \
make requirements-analyze && \
make system-design && \
make code-generate && \
make test-generate && \
make api-docs
```

### 批量操作

```bash
# 生成所有角色的基础工具
make product-manager &
make requirement-analyzer &
make architecture-designer &
make developer-tools &
make test-manager &
wait
```

### 自定义配置

```bash
# 使用自定义参数
node scripts/agent/roles/product-manager.js roadmap --template=annual --include-metrics
node scripts/agent/roles/developer-tools.js generate --type=api --framework=express
```

---

## 📊 工具效果监控

### 项目健康检查

```bash
# 运行完整的项目健康检查
make project-health

# 查看健康报告
cat docs/summaries/PROJECT_HEALTH_REPORT.md
```

### 性能监控

```bash
# 启动性能监控
make monitor-performance

# 分析日志
make analyze-logs
```

---

## 🎯 最佳实践

### 1. 工作流程建议

1. **项目启动**：使用 `product-roadmap` 和 `requirements-analyze`
2. **设计阶段**：使用 `system-design` 和 `adr-create`
3. **开发阶段**：使用 `code-generate` 和 `test-generate`
4. **测试阶段**：使用 `quality-gate` 和 `test-framework`
5. **部署阶段**：使用 `infrastructure` 和 `pipeline`
6. **文档阶段**：使用 `api-docs` 和 `user-manual`

### 2. 团队协作

- **角色分工**：每个角色使用对应的专用工具
- **信息共享**：使用 `project-health` 监控整体状态
- **质量保证**：定期运行 `quality-gate` 检查

### 3. 持续改进

- **定期评估**：使用 `ai-assess` 评估工具效果
- **反馈收集**：收集团队使用反馈
- **工具更新**：定期更新和优化工具

---

## 🚨 故障排查

### 常见问题

#### 工具无法启动

```bash
# 检查环境
make check-env

# 重新安装依赖
make install

# 检查脚本权限
ls -la scripts/agent/roles/
```

#### 工具执行失败

```bash
# 查看详细错误
node scripts/agent/roles/product-manager.js --verbose

# 检查配置文件
cat .env

# 运行健康检查
make project-health
```

#### 性能问题

```bash
# 监控性能
make monitor-performance

# 分析日志
make analyze-logs

# 优化配置
make optimize-cursor
```

---

## 📚 进一步学习

### 相关文档

- [Agent 工具集成指南](../technical/AGENT_TOOLS_INTEGRATION_GUIDE.md)
- [GitHub 工具研究结果](../technical/GITHUB_TOOLS_RESEARCH.md)
- [脚本使用指南](../../scripts/README.md)

### 社区资源

- [GitHub 项目仓库](https://github.com/your-org/cursor-agent-team)
- [问题反馈](https://github.com/your-org/cursor-agent-team/issues)
- [功能请求](https://github.com/your-org/cursor-agent-team/discussions)

---

## 🎉 开始使用

现在您已经了解了所有工具的基本用法，可以开始使用它们来提升您的 Agent 团队工作效率！

```bash
# 选择一个角色开始
make product-manager

# 或者运行完整的健康检查
make project-health
```

---

_最后更新：2025-01-27_ _版本：v1.0.0_
