# 🚀 在新项目中使用 Cursor Agent 团队系统指南

本指南将帮助你在**任何新项目**中快速应用这个 Cursor Agent 团队协作系统。

---

## 📋 目录

- [快速启动](#快速启动)
- [三种使用方式](#三种使用方式)
- [完整集成步骤](#完整集成步骤)
- [日常使用流程](#日常使用流程)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## ⚡ 快速启动

### 最快方式（5分钟开始）

```bash
# 1. 克隆这个模板到新项目
git clone https://github.com/Poghappy/cursor-.git my-new-project
cd my-new-project

# 2. 重新初始化 Git（可选）
rm -rf .git
git init
git add .
git commit -m "feat: 初始化项目，基于 Cursor Agent 团队模板"

# 3. 在 Cursor IDE 中打开项目
cursor .

# 4. 开始使用 Agent 团队
# 在 Cursor 的对话框中输入：
# @po 请帮我创建一个在线教育平台的项目简介
```

---

## 🎯 三种使用方式

根据你的需求选择最适合的方式：

### 方式一：完整克隆（推荐新项目）

**适用场景**：从零开始的全新项目

```bash
# 1. 克隆模板
git clone https://github.com/Poghappy/cursor-.git my-project
cd my-project

# 2. 自定义项目信息
# 编辑以下文件：
# - README.md          修改项目名称和描述
# - package.json       修改项目名称、版本、作者
# - Makefile          设置项目变量（PROJECT_NAME等）

# 3. 安装依赖
npm install

# 4. 配置环境
cp .env.example .env
# 编辑 .env 文件

# 5. 开始开发
make dev
```

### 方式二：部分集成（推荐现有项目）

**适用场景**：已有项目，想要添加 Agent 团队能力

```bash
# 1. 进入现有项目
cd existing-project

# 2. 从模板复制核心文件
# 方法 A：手动复制
cp -r /path/to/cursor-agent-template/prompts ./
cp -r /path/to/cursor-agent-template/.cursor ./
cp /path/to/cursor-agent-template/AGENTS.md ./

# 方法 B：使用脚本（如果模板提供）
curl -sSL https://raw.githubusercontent.com/Poghappy/cursor-/main/scripts/integrate.sh | bash

# 3. 在 Cursor IDE 中打开
cursor .

# 4. 开始使用 Agent
# @po 分析现有项目结构
```

### 方式三：仅使用 Prompts（最轻量）

**适用场景**：只想要 Agent 角色提示词，不改变项目结构

```bash
# 1. 下载 prompts 目录
mkdir -p .cursor
curl -L https://github.com/Poghappy/cursor-/archive/main.tar.gz | \
  tar xz --strip=2 cursor--main/prompts -C .cursor/

# 2. 在 Cursor 中使用
# 直接 @ 提及角色名称开始对话
```

---

## 📦 完整集成步骤

### 第一步：准备新项目

```bash
# 选项 A：克隆模板创建新项目
git clone https://github.com/Poghappy/cursor-.git my-awesome-project
cd my-awesome-project
rm -rf .git
git init

# 选项 B：在现有项目中集成
cd your-existing-project
# 跳到第二步
```

### 第二步：复制核心文件到项目

**必需文件**（Agent 系统核心）：

```bash
# 如果是现有项目，从模板复制这些目录
TEMPLATE_PATH="/path/to/cursor-agent-template"

cp -r $TEMPLATE_PATH/prompts ./              # Agent 角色和阶段定义
cp -r $TEMPLATE_PATH/.cursor ./              # Cursor IDE 配置
cp $TEMPLATE_PATH/AGENTS.md ./               # Agent 使用指南
```

**可选文件**（增强功能）：

```bash
cp $TEMPLATE_PATH/Makefile ./                # 项目管理命令
cp -r $TEMPLATE_PATH/scripts ./              # 自动化脚本
cp -r $TEMPLATE_PATH/docs/templates ./docs/  # 文档模板
```

### 第三步：自定义配置

#### 1. 更新项目信息

编辑 `README.md`：

```markdown
# 你的项目名称

[项目描述]

## 使用 Cursor Agent 团队

本项目使用 Cursor AI Agent 团队协作系统进行开发。

### 可用 Agent 角色

- @po - Product Owner
- @pm - Product Manager
- @ba - Business Analyst
- @arch - Architect
- @dev - Developer
- @qa - QA Engineer ... 更多角色
```

编辑 `package.json`：

```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "description": "Your project description",
  "author": "Your Name"
}
```

#### 2. 配置项目约束

编辑 `Makefile`（如果使用）：

```makefile
PROJECT_NAME = your-project-name
VERSION = 1.0.0
LINT_CMD = npm run lint
TEST_CMD = npm test
COVERAGE_CMD = npm run coverage
```

或在 `AGENTS.md` 中替换占位符：

```markdown
- 质量门禁：`npm run lint`、`npm test` 必须通过
- 单次变更：≤ 5 文件、单文件 ≤ 100 行
```

#### 3. 配置 Cursor Rules

编辑 `.cursor/rules/` 中的规则文件，添加项目特定规则：

```markdown
<!-- .cursor/rules/project-specific.md -->

# 项目特定规则

## 技术栈

- 前端：React 18 + TypeScript
- 后端：Node.js + Express
- 数据库：PostgreSQL

## 代码规范

- 使用函数式组件
- 所有组件必须有 TypeScript 类型
- API 调用必须有错误处理

## 测试要求

- 新功能必须包含单元测试
- 覆盖率不低于 80%
```

### 第四步：初始化开发环境

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 3. 初始化数据库（如果需要）
npm run db:migrate

# 4. 运行测试确保环境正常
npm test

# 5. 启动开发服务器
npm run dev
```

### 第五步：在 Cursor IDE 中打开项目

```bash
# 在项目根目录
cursor .

# 或者通过 Cursor 菜单：File -> Open Folder
```

### 第六步：开始使用 Agent 团队

**首次使用 - 项目初始化**：

```
你: @po 你好！我想创建一个在线教育平台，主要功能包括：
- 课程管理
- 在线学习
- 作业提交
- 成绩查询

请帮我创建项目简介。

PO Agent: [会创建详细的项目简介，包括目标用户、业务目标等]

你: 继续

PM Agent: [会基于项目简介创建用户故事]

你: @arch 请设计技术架构，要求：
- 技术栈：React + Node.js + PostgreSQL
- 支持 1000+ 并发用户
- 微服务架构

Arch Agent: [会创建详细的技术设计文档]
```

---

## 🔄 日常使用流程

### 开发新功能

```bash
# 1. 启动 PO 分析需求
你: @po 我需要添加用户评论功能，用户可以对课程进行评论和评分

# 2. PM 拆解用户故事
你: @pm 基于上面的需求，创建用户故事

# 3. BA 分析和验收标准
你: @ba 定义验收标准

# 4. Arch 设计方案
你: @arch 设计评论功能的技术方案

# 5. Dev 实现代码
你: @dev 实现评论功能，包括前后端

# 6. QA 测试
你: @qa 为评论功能编写测试用例并执行测试
```

### 代码审查

```bash
你: @dev 请审查 src/components/Comment.tsx 这个文件，检查代码质量

你: @arch 请评估评论功能的性能影响
```

### 重构代码

```bash
你: @dev 重构 src/services/auth.ts，改进代码结构和可读性

你: @arch 评估重构方案，确保架构一致性
```

### 修复 Bug

```bash
你: @dev 修复 #123 bug - 评论无法提交的问题

你: @qa 为这个 bug 编写回归测试
```

### 编写文档

```bash
你: @tw 为评论功能编写 API 文档

你: @tw 更新用户手册，添加评论功能说明
```

---

## 💡 最佳实践

### 1. Agent 协作最佳实践

**✅ 推荐做法**：

- **按顺序推进**：PO → PM → BA → Arch → Dev → QA
- **明确上下文**：每次对话提供足够的上下文信息
- **验证输出**：检查 Agent 的输出是否符合预期
- **保存记录**：重要决策保存到项目文档
- **增量开发**：先实现 MVP，再逐步增强

**❌ 避免做法**：

- 跳过关键角色（如不经过 Arch 直接开发）
- 提供模糊的需求（会导致理解偏差）
- 忽略 Agent 的建议和警告
- 一次性开发所有功能（风险大）

### 2. 项目组织最佳实践

```
your-project/
├── .cursor/              # Cursor 配置（必需）
│   ├── rules/           # 项目规则
│   ├── mcp.json         # MCP 服务器配置
│   └── commands/        # 自定义命令（可选）
├── prompts/             # Agent 角色定义（必需）
│   ├── roles/          # 10个角色
│   └── stages/         # 7个阶段
├── docs/                # 项目文档（推荐）
│   ├── product/        # 产品文档
│   ├── project/        # 项目管理
│   ├── technical/      # 技术文档
│   └── README.md       # 文档导航
├── src/                 # 源代码
├── tests/               # 测试代码
├── AGENTS.md           # Agent 使用说明（必需）
├── README.md           # 项目说明
└── package.json        # 依赖配置
```

### 3. 文档管理最佳实践

**关键文档**：

- `AGENTS.md` - Agent 团队使用指南
- `docs/product/PRD.md` - 产品需求文档
- `docs/technical/TECH_DESIGN.md` - 技术设计文档
- `docs/CHANGELOG.md` - 变更日志

**更新频率**：

- 每个 Sprint 更新 PRD 和 Roadmap
- 技术决策后立即更新 TECH_DESIGN
- 每次发布更新 CHANGELOG
- 每日更新 TASK_BOARD（如果使用）

### 4. 质量保证最佳实践

```bash
# 开发前
make lint              # 代码规范检查
make test              # 运行测试
make coverage          # 检查覆盖率

# 提交前
make quality           # 完整质量检查
make pre-commit        # 提交前检查

# 部署前
make pre-deploy-check  # 部署前检查
```

---

## 🎭 Agent 角色使用速查表

| 角色      | 使用场景           | 示例命令                     |
| --------- | ------------------ | ---------------------------- |
| **@po**   | 需求分析、项目定义 | `@po 创建电商平台项目简介`   |
| **@pm**   | 用户故事、需求管理 | `@pm 创建用户注册的用户故事` |
| **@ba**   | 需求细化、验收标准 | `@ba 定义支付功能的验收标准` |
| **@pjm**  | 任务分解、进度管理 | `@pjm 分解购物车功能的任务`  |
| **@arch** | 架构设计、技术选型 | `@arch 设计微服务架构方案`   |
| **@llme** | AI/LLM 集成方案    | `@llme 设计智能推荐系统`     |
| **@dev**  | 代码实现、开发     | `@dev 实现用户认证模块`      |
| **@qa**   | 测试、质量保证     | `@qa 为 API 编写集成测试`    |
| **@ops**  | 部署、运维、监控   | `@ops 配置 CI/CD 流程`       |
| **@tw**   | 文档编写           | `@tw 编写 API 使用文档`      |

---

## 🔧 常见问题

### Q1: 如何在现有项目中添加 Agent 能力？

**A**: 最小集成只需要两步：

```bash
# 1. 复制核心文件
cp -r /path/to/template/prompts ./
cp -r /path/to/template/.cursor ./

# 2. 在 Cursor IDE 中打开项目，开始使用
cursor .
```

### Q2: 可以只使用部分 Agent 角色吗？

**A**: 可以！根据项目规模选择：

- **小型项目**（1-2人）：po + dev + qa
- **中型项目**（3-5人）：po + pm + arch + dev + qa
- **大型项目**（5+人）：使用全部 10 个角色

删除不需要的角色文件即可：

```bash
rm prompts/roles/llme.md  # 如果不需要 LLM Engineer
```

### Q3: Agent 的输出如何保存？

**A**: 三种方式：

1. **手动保存**：复制 Agent 输出到项目文档
2. **使用交接格式**：Agent 会生成标准 JSON 保存在 `.cursor/handovers/`
3. **自动生成**：使用 `make save-conversation` 保存对话记录

### Q4: 如何自定义 Agent 角色？

**A**: 编辑或创建新的角色文件：

```markdown
<!-- prompts/roles/custom-role.md -->

# Custom Role

你是一个 [角色名称]，负责 [职责描述]

## 工作流程

1. [步骤1]
2. [步骤2]

## 输出标准

- [标准1]
- [标准2]
```

### Q5: 多人团队如何协作？

**A**: 使用标准的 Git 协作流程：

```bash
# 开发者 A
git checkout -b feature/user-auth
# 使用 @dev 开发功能
git commit -m "feat: 实现用户认证"
git push origin feature/user-auth

# 开发者 B
git checkout -b feature/shopping-cart
# 使用 @dev 开发另一个功能
```

交接记录自动保存在 `.cursor/handovers/`，团队共享。

### Q6: 如何升级到最新版本的 Agent 系统？

**A**: 使用 Git 管理：

```bash
# 1. 添加模板为远程源
git remote add template https://github.com/Poghappy/cursor-.git

# 2. 获取最新更新
git fetch template

# 3. 选择性合并更新
git checkout template/main -- prompts/
git checkout template/main -- .cursor/

# 4. 提交更新
git commit -m "chore: 更新 Agent 系统到最新版本"
```

### Q7: 如何处理 Agent 理解错误？

**A**: 提供更明确的指令：

```bash
# ❌ 模糊的指令
你: @dev 做个登录

# ✅ 明确的指令
你: @dev 实现用户登录功能，要求：
- 使用 JWT 认证
- 支持邮箱/密码登录
- 包含密码加密
- 登录失败3次锁定账户
- 编写单元测试
```

### Q8: 是否支持其他 IDE？

**A**: 这个系统专为 Cursor IDE 设计，但核心的 `prompts/`
目录可以在任何支持 AI 对话的 IDE 中使用，只是需要手动复制提示词内容。

---

## 📚 更多资源

### 官方文档

- [快速开始模板](./QUICK_START_TEMPLATE.md)
- [模板使用指南](./TEMPLATE_USAGE_GUIDE.md)
- [参考仓库列表](./REFERENCE_REPOS.md)

### 项目文档

- [Agent 协作指南](../AGENTS.md)
- [Cursor 使用指南](../cursor/CURSOR_GUIDE_2025-09-30.md)
- [智能系统使用指南](../cursor/INTELLIGENT_SYSTEM_GUIDE.md)

### 社区资源

- [GitHub Issues](https://github.com/Poghappy/cursor-/issues) - 报告问题
- [GitHub Discussions](https://github.com/Poghappy/cursor-/discussions) - 讨论交流
- [示例项目](https://github.com/Poghappy/cursor-/wiki/Examples) - 成功案例

---

## ✅ 检查清单

使用这个清单确保正确集成 Agent 系统：

### 初始化阶段

- [ ] 复制 `prompts/` 目录到项目
- [ ] 复制 `.cursor/` 目录到项目
- [ ] 复制 `AGENTS.md` 到项目根目录
- [ ] 更新 `README.md` 说明使用 Agent 系统
- [ ] 配置项目特定规则（如果需要）

### 配置阶段

- [ ] 更新 `package.json` 项目信息
- [ ] 配置 `Makefile` 或更新 `AGENTS.md` 中的约束
- [ ] 设置环境变量（`.env`）
- [ ] 配置 CI/CD（如果需要）

### 测试阶段

- [ ] 在 Cursor IDE 中打开项目
- [ ] 测试 `@po` 角色能否正常响应
- [ ] 测试基本的 Agent 协作流程
- [ ] 验证质量检查命令正常工作

### 文档阶段

- [ ] 创建或更新 `docs/` 目录结构
- [ ] 添加项目特定文档模板
- [ ] 记录项目使用 Agent 的最佳实践
- [ ] 团队成员培训（如果是团队项目）

---

## 🎯 下一步

现在你已经了解如何在新项目中使用 Cursor Agent 团队系统，建议：

1. **实践**：在一个小项目中试用，熟悉 Agent 协作流程
2. **定制**：根据团队需求调整角色和规则
3. **分享**：将使用经验分享给团队成员
4. **反馈**：遇到问题或有改进建议，提交到 GitHub

---

**🚀 祝你使用愉快！让 Cursor AI Agent 团队助力你的项目成功！**
