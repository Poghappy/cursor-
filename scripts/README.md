# 📁 Scripts 目录说明

本目录包含项目的所有自动化脚本，按功能分类组织。

---

## 📂 目录结构

### 🤖 agent/ - Agent 相关脚本

**功能**：Agent 系统管理和智能化功能

- `agent-manager.js` - Agent 管理器
- `agent-workflow.js` - Agent 工作流控制
- `intelligent-agent.js` - 智能 Agent 决策引擎
- `memory-manager.js` - Agent 记忆管理

**使用场景**：

```bash
# 启动智能 Agent 系统
node agent/intelligent-agent.js

# 管理 Agent 工作流
node agent/agent-workflow.js
```

### 🔄 automation/ - 自动化脚本

**功能**：项目自动化和集成

- `github-integration-advisor.js` - GitHub 集成顾问
- `railway-automation.js` - Railway 部署自动化 ⭐
- `smart-project-generator.js` - 智能项目生成器
- `task-planner.js` - 任务规划器

**使用场景**：

```bash
# 生成新项目
node automation/smart-project-generator.js

# GitHub 集成建议
node automation/github-integration-advisor.js
```

### 🔧 maintenance/ - 维护工具

**功能**：项目维护和文件管理

- `file-manager.js` - 文件管理工具 ⭐
- `project-health.js` - 项目健康检查 🆕
- `policy-checks.js` - 策略检查
- `check-env.js` - 环境检查

**使用场景**：

```bash
# 文件管理（最常用）
node maintenance/file-manager.js check
node maintenance/file-manager.js clean

# 环境检查
node maintenance/check-env.js
```

### 🖥️ cursor/ - Cursor IDE 工具

**功能**：Cursor IDE 故障排查和优化

- `diagnose-cursor-crash.sh` - 诊断 Cursor 崩溃
- `fix-cursor-crash.sh` - 修复 Cursor 问题
- `quick-fix-crash.sh` - 快速修复

**使用场景**：

```bash
# Cursor 故障排查
./cursor/diagnose-cursor-crash.sh

# 快速修复
./cursor/quick-fix-crash.sh
```

### ⚙️ development/ - 开发工具

**功能**：开发环境配置和工具

- `env-manager.js` - 环境变量管理器 🆕
- `git-hooks-manager.js` - Git Hooks 管理器 🆕
- `setup-agent.sh` - 配置 Agent 环境

### 📊 monitoring/ - 监控工具

**功能**：性能监控和日志分析

- `performance-monitor.js` - 性能监控器 🆕
- `log-analyzer.js` - 日志分析器 🆕

### ⚙️ setup/ - 项目设置

**功能**：项目初始化

- `create-project.sh` - 创建新项目

**使用场景**：

```bash
# 环境变量管理
node development/env-manager.js init
node development/env-manager.js set development PORT 3000

# Git Hooks 管理
node development/git-hooks-manager.js install
node development/git-hooks-manager.js test

# 性能监控
node monitoring/performance-monitor.js full
node monitoring/performance-monitor.js watch

# 日志分析
node monitoring/log-analyzer.js analyze
node monitoring/log-analyzer.js watch logs/app.log

# 创建新项目
./setup/create-project.sh

# 配置 Agent 环境
./development/setup-agent.sh
```

---

## 🚀 快速使用

### 最常用命令

```bash
# 文件管理（推荐每日使用）
make check-files      # 等同于 node maintenance/file-manager.js check
make clean-temp       # 等同于 node maintenance/file-manager.js clean
make fix-files        # 综合文件问题修复

# 环境和开发工具
make setup-env        # 等同于 node development/env-manager.js init
make setup-git-hooks  # 等同于 node development/git-hooks-manager.js install

# 监控和分析
make monitor-performance  # 等同于 node monitoring/performance-monitor.js watch
make analyze-logs        # 等同于 node monitoring/log-analyzer.js analyze

# Cursor 故障排查
make diagnose-cursor  # 等同于 ./cursor/diagnose-cursor-crash.sh
make fix-cursor       # 等同于 ./cursor/fix-cursor-crash.sh

# 智能化功能
make intelligent-agent    # 等同于 node agent/intelligent-agent.js
make smart-dev           # 智能开发流程
```

### 直接调用脚本

```bash
# Agent 系统
node agent/intelligent-agent.js --help
node agent/agent-manager.js list

# 文件管理
node maintenance/file-manager.js check
node maintenance/file-manager.js clean
node maintenance/file-manager.js duplicates

# 开发工具
node development/env-manager.js list development
node development/git-hooks-manager.js status

# 监控工具
node monitoring/performance-monitor.js system
node monitoring/log-analyzer.js find

# 项目生成
node automation/smart-project-generator.js --interactive
```

---

## 📋 脚本分类标准

### 🔴 核心工具（每日使用）

- `maintenance/file-manager.js` - 文件管理
- `cursor/fix-cursor-crash.sh` - Cursor 修复

### 🟡 开发工具（开发时使用）

- `agent/intelligent-agent.js` - 智能 Agent
- `automation/smart-project-generator.js` - 项目生成
- `development/env-manager.js` - 环境变量管理 🆕
- `development/git-hooks-manager.js` - Git Hooks 管理 🆕
- `monitoring/performance-monitor.js` - 性能监控 🆕
- `maintenance/project-health.js` - 项目健康检查 🆕
- `maintenance/check-env.js` - 环境检查

### 🟢 设置工具（一次性使用）

- `setup/create-project.sh` - 项目创建
- `setup/setup-agent.sh` - Agent 配置

### 🔵 高级工具（按需使用）

- `automation/github-integration-advisor.js` - GitHub 集成
- `automation/railway-automation.js` - 部署自动化 ⭐
- `monitoring/log-analyzer.js` - 日志分析 🆕
- `agent/memory-manager.js` - 记忆管理

---

## 🛠️ 开发指南

### 添加新脚本

1. **确定分类**：根据功能选择合适的子目录
2. **命名规范**：使用 kebab-case，描述性名称
3. **添加说明**：在对应目录添加脚本说明
4. **更新 Makefile**：如果需要，添加 make 命令

### 脚本规范

```javascript
#!/usr/bin/env node

/**
 * 脚本名称 - 功能描述
 *
 * 用法：node script-name.js [options]
 *
 * 选项：
 *   --help    显示帮助信息
 *   --verbose 详细输出
 */

// 脚本实现...
```

### Shell 脚本规范

```bash
#!/bin/bash

# 脚本名称 - 功能描述
# 用法: ./script-name.sh [options]

set -e  # 遇到错误立即退出

# 脚本实现...
```

---

## 📊 使用统计

**最常用脚本**（按使用频率）：

1. `maintenance/file-manager.js` - 文件管理 ⭐⭐⭐⭐⭐
2. `cursor/fix-cursor-crash.sh` - Cursor 修复 ⭐⭐⭐⭐
3. `development/env-manager.js` - 环境变量管理 ⭐⭐⭐ 🆕
4. `monitoring/performance-monitor.js` - 性能监控 ⭐⭐⭐ 🆕
5. `agent/intelligent-agent.js` - 智能 Agent ⭐⭐⭐
6. `development/git-hooks-manager.js` - Git Hooks 管理 ⭐⭐ 🆕
7. `automation/smart-project-generator.js` - 项目生成 ⭐⭐
8. `monitoring/log-analyzer.js` - 日志分析 ⭐⭐ 🆕
9. `automation/railway-automation.js` - 部署自动化 ⭐ 🆕
10. `setup/create-project.sh` - 项目创建 ⭐

---

## 🔗 相关文档

- [文件管理指南](../docs/templates/management/FILE_MANAGEMENT_GUIDE.md)
- [Cursor 故障排查](../docs/cursor/CURSOR_TROUBLESHOOTING.md)
- [智能系统指南](../docs/cursor/INTELLIGENT_SYSTEM_GUIDE.md)
- [新项目指南](../docs/templates/project/NEW_PROJECT_GUIDE.md)

---

**💡 提示**：优先使用 `make` 命令，它们更简洁且经过优化！
