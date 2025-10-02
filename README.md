# Cursor IDE 官方 Agent 增强系统

专为 **Cursor IDE 官方自带的 Agent 功能**
设计的智能化多角色协作系统。通过战略级 AI 决策引擎和 GitHub 项目集成顾问，为 Cursor
IDE 用户提供零学习成本的全栈开发体验。

## 🎯 核心价值

- **🧠 战略级智能**: 具备自主决策、风险评估、自动学习能力的 AI Agent 团队
- **🔍 GitHub 优先**: 智能推荐成熟开源项目，避免重复造轮子，节省 70% 开发时间
- **👶 小白友好**: 零学习成本，引导式开发体验，从想法到产品的完整解决方案
- **🤖 Cursor 原生**: 完美集成 Cursor IDE 的 Agent 功能，10 个专业角色协作
- **⚡ 一键开发**: `make smart-dev` 启动完整智能开发流程

## 🚀 快速开始

### 在 Cursor IDE 中使用

```bash
# 1. 克隆项目到 Cursor IDE
git clone https://github.com/your-repo/cursor-agent-team.git
cd cursor-agent-team

# 2. 一键智能开发（推荐）
make smart-dev

# 3. 或分步骤使用
make intelligent-agent    # 智能需求分析
make github-advisor      # GitHub 集成推荐
make smart-generate      # 智能项目生成
```

### 传统开发流程

```bash
# 准备环境
cp .env.example .env
make setup

# 开发与质量
make dev          # 本地开发
make lint         # 代码规范
make test         # 测试
make coverage     # 覆盖率
```

### 🔧 Cursor IDE 故障排查

如果遇到 Cursor 崩溃问题（crash code 5），使用以下命令：

```bash
# 诊断问题
make diagnose-cursor

# 快速修复（推荐）
make fix-cursor

# 清理缓存
make clean-cursor-cache

# 优化性能配置
make optimize-cursor
```

详细排查指南请查看 [故障排查文档](docs/CURSOR_TROUBLESHOOTING.md)

## 目录结构

```text
.
├─ docs/                  # BRIEF/PRD/TASKS/TECH_DESIGN/TEST_PLAN/CHANGELOG
├─ prompts/
│  ├─ system.md          # 总控 System Prompt
│  ├─ roles/             # 角色系统提示（po/pm/ba/pjm/arch/llme/dev/qa/ops/tw）
│  └─ stages/            # 分阶段模板（user_story/prd/task_breakdown/...）
├─ .cursor/
│  └─ rules/             # 函数式规则、交接 schema、权限矩阵
├─ src/                  # 最小实现（按需生成）
├─ tests/                # 单测/契约/e2e（按需生成）
├─ Makefile              # 一键质量与运维命令
├─ package.json          # 脚本/依赖
└─ tsconfig.json
```

## 🤖 智能化 Agent 系统

### 核心组件

1. **智能决策引擎** (`scripts/intelligent-agent.js`)
   - 🔍 自动分析用户需求和项目类型
   - 🎯 基于用户水平推荐最适合的技术方案
   - ⚠️ 智能识别技术风险和学习成本
   - 🧠 从历史执行中学习，持续优化决策

2. **GitHub 集成顾问** (`scripts/github-integration-advisor.js`)
   - 📦 智能推荐成熟的开源项目，避免重复造轮子
   - ⭐ 基于星标、维护状态、社区活跃度评估项目质量
   - ⚡ 评估集成复杂度和时间成本
   - 🛡️ 提供集成风险评估和缓解方案

3. **智能项目生成器** (`scripts/smart-project-generator.js`)
   - 🎯 自动识别项目类型（Web应用、API服务、移动应用等）
   - 📦 自动集成推荐的 GitHub 项目
   - 🎨 根据需求自动配置主题、认证、数据库等
   - 📚 自动生成 README、开发指南、API 文档

### Agent 团队协作

- **10 个专业角色**: PO/PM/BA/PjM/Arch/LLME/DEV/QA/Ops/TW
- **7 个标准阶段**: 用户故事 → PRD → 任务分解 → 技术设计 → 实现 → 测试 → 部署
- **统一交接规范**: 基于 JSON Schema 的标准化工作流
- **质量保证体系**: 自动化 ESLint、测试、文件结构检查

## 💡 使用场景

### 场景 1: 小白用户创建第一个项目

```bash
make intelligent-agent
# 用户输入: "我想学习编程，创建一个简单的网站"
# 系统自动识别为初学者，推荐简单技术栈，提供学习路径
```

### 场景 2: 经验开发者快速原型

```bash
make smart-dev
# 用户输入: "创建一个用户认证API服务"
# 系统推荐 Express.js + JWT + Prisma，自动集成现有认证库
```

### 场景 3: 团队协作项目

```bash
make agent-workflow
# 系统自动: PO分析需求 → PM制定计划 → BA分解任务 → Arch设计架构 → Dev实现 → QA测试 → Ops部署
```

## 🎯 核心原则

- **GitHub 优先**: 优先集成现有项目 vs 自建（星标>10k + 活跃维护 + 良好文档）
- **渐进式开发**: 先实现 MVP，再逐步添加功能
- **质量保证**: 自动化 ESLint、测试、安全扫描
- **学习友好**: 为小白用户提供详细解释和学习路径

## 📚 详细文档

- [智能化系统使用指南](docs/INTELLIGENT_SYSTEM_GUIDE.md) - 完整的使用说明和最佳实践
- [产品需求文档](docs/PRD.md) - 产品愿景和功能规划
- [用户故事](docs/USER_STORIES.md) - 详细的用户场景和验收标准
- [技术设计](docs/TECH_DESIGN.md) - 系统架构和技术选型

## 许可证

MIT
