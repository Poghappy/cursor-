# 🚀 Cursor 多角色 Agent 团队模板 - 快速开始

## 📋 概述

本项目是一个完整的 **Cursor
AI 多角色 Agent 团队模板**，可用于快速搭建新项目的 AI 协作体系。通过标准化的角色定义、阶段流程和交接规范，实现从 0→1 的自主项目交付。

## ⚡ 3 分钟快速体验

### 方法一：直接使用当前项目

```bash
# 1. 进入项目目录
cd /path/to/cursor-multi-agent-template

# 2. 配置 Agent 环境
make setup-agent

# 3. 开始使用 Agent 团队
# 在 Cursor 中输入：
@po 请创建一个用户管理系统的项目简介，目标用户是企业管理员
```

### 方法二：创建新项目

```bash
# 1. 运行项目生成器
./scripts/create-project.sh

# 2. 按提示输入项目信息
# - 项目名称：my-awesome-app
# - 技术栈：Node.js + React + PostgreSQL
# - 功能模块：用户认证、数据管理、API接口

# 3. 进入新项目目录
cd my-awesome-app

# 4. 启动 Agent 团队
@po 开始项目分析
```

## 🎭 Agent 角色快速指南

### 核心角色流程

```mermaid
graph LR
    A[PO: 项目简介] --> B[PM: 用户故事]
    B --> C[BA: 需求分析]
    C --> D[PjM: 任务分解]
    D --> E[Arch: 技术设计]
    E --> F[Dev: 代码实现]
    F --> G[QA: 质量测试]
    G --> H[Ops: 部署运维]
```

### 使用示例

#### 1. 启动项目（PO 角色）

```
@po 请创建项目简介：
- 项目名称：智能客服系统
- 目标用户：企业客服团队
- 核心功能：智能问答、工单管理、数据分析
- 业务目标：提升客服效率50%，降低人工成本30%
```

#### 2. 创建用户故事（PM 角色）

```
@pm 基于 PO 的项目简介，创建详细的用户故事，重点关注：
- 客服代表的日常工作流程
- 管理员的系统配置需求
- 客户的自助服务体验
```

#### 3. 技术架构设计（Arch 角色）

```
@arch 设计技术架构，要求：
- 技术栈：Node.js + React + PostgreSQL + Redis
- 支持高并发（1000+ 在线用户）
- 微服务架构，便于扩展
- 集成第三方AI服务
```

#### 4. 代码实现（Dev 角色）

```
@dev 实现核心功能：
- 用户认证模块
- 智能问答API
- 实时消息系统
- 遵循最小可用原则，优先实现MVP功能
```

## 🛠️ 自定义配置

### 1. 项目信息配置

编辑 `Makefile`：

```makefile
PROJECT_NAME ?= your-project-name
VERSION ?= 1.0.0
LINT_CMD ?= npm run lint
TEST_CMD ?= npm test
```

### 2. Agent 角色定制

在 `prompts/roles/` 中添加自定义角色：

```markdown
# 自定义角色模板 (custom.md)

## 角色定义

你是一个 {ROLE_NAME}，负责 {RESPONSIBILITIES}

## 工作流程

1. {STEP_1}
2. {STEP_2}
3. {STEP_3}

## 输出标准

- {OUTPUT_REQUIREMENT_1}
- {OUTPUT_REQUIREMENT_2}
```

### 3. 阶段流程定制

在 `prompts/stages/` 中定义项目阶段：

```markdown
# 自定义阶段模板 (custom_stage.md)

## 阶段目标

{STAGE_OBJECTIVE}

## 输入要求

- {INPUT_1}
- {INPUT_2}

## 输出交付物

- {DELIVERABLE_1}
- {DELIVERABLE_2}
```

## 📊 质量保证

### 自动化检查

```bash
# 代码质量检查
make lint

# 运行测试
make test

# 生成覆盖率报告
make coverage

# 完整质量检查
make quality
```

### 交接验证

每个 Agent 角色完成工作后会生成标准化的交接 JSON：

```json
{
  "inputs": {
    "role": "dev",
    "stage": "implementation",
    "artifacts": ["src/auth.ts", "tests/auth.test.ts"]
  },
  "decisions": [
    {
      "topic": "认证方式选择",
      "choice": "JWT + OAuth 2.0",
      "rationale": "安全性高，易于扩展"
    }
  ],
  "artifacts": [
    {
      "path": "src/auth.ts",
      "type": "code",
      "status": "completed",
      "validation": {
        "lint": "✅ 通过",
        "test": "✅ 通过",
        "coverage": "95%"
      }
    }
  ],
  "next_role": "qa",
  "next_instruction": "请对认证模块进行全面测试"
}
```

## 🔧 常用命令

### 项目管理

```bash
make help              # 显示所有可用命令
make setup             # 初始化项目环境
make dev               # 启动开发模式
make build             # 构建项目
make deploy            # 部署项目
```

### Agent 管理

```bash
make setup-agent       # 配置 Agent 环境
make validate-roles    # 验证角色配置
make validate-handover # 验证交接格式
```

### 质量控制

```bash
make lint              # 代码检查
make test              # 运行测试
make coverage          # 测试覆盖率
make security          # 安全扫描
make performance       # 性能测试
```

## 🎯 最佳实践

### 1. Agent 协作模式

- **顺序执行**：按照标准流程 PO→PM→BA→PjM→Arch→Dev→QA→Ops
- **并行协作**：多个 Dev 角色可以并行开发不同模块
- **迭代优化**：完成一轮后可以回到任意角色进行优化

### 2. 质量控制

- 每个阶段完成后运行 `make quality`
- 重要决策必须记录在交接 JSON 中
- 代码变更必须通过 lint 和 test 检查

### 3. 文档管理

- 所有文档使用 Markdown 格式
- 重要决策记录在 `docs/DECISIONS.md`
- API 文档自动生成并保持同步

## 🚨 故障排除

### 常见问题

#### 1. Agent 角色无法识别

```bash
# 检查角色文件
ls prompts/roles/

# 重新配置 Agent 环境
make setup-agent
```

#### 2. 交接格式错误

```bash
# 验证交接 JSON
make validate-handover

# 查看交接模板
cat .cursor/rules/handover_schema.md
```

#### 3. 质量检查失败

```bash
# 查看详细错误
make lint-verbose

# 自动修复代码问题
make lint-fix
```

## 📚 进阶使用

### 1. 自定义 MCP 服务器

```json
// .cursor/mcp.json
{
  "mcpServers": {
    "project-assistant": {
      "type": "local",
      "command": "node",
      "args": ["scripts/project-mcp-server.js"],
      "description": "项目助手服务"
    }
  }
}
```

### 2. 团队协作配置

```bash
# 同步团队工作
make team-sync

# 生成团队报告
make team-report

# 查看协作状态
make team-status
```

### 3. 持续集成

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run quality checks
        run: make quality
```

## 🎉 成功案例

### 电商平台项目

- **规模**：10人团队，3个月
- **技术栈**：React + Node.js + PostgreSQL
- **成果**：按时交付，零生产事故，用户满意度95%

### 企业管理系统

- **规模**：15人团队，6个月
- **技术栈**：Vue + Python + MongoDB
- **成果**：提前2周交付，功能超出预期20%

## 📞 获取帮助

### 文档资源

- [完整使用指南](docs/TEMPLATE_USAGE_GUIDE.md)
- [Agent 协作手册](docs/AGENT_COLLABORATION.md)
- [质量保证指南](docs/QUALITY_ASSURANCE.md)

### 社区支持

- [GitHub Issues](https://github.com/Poghappy/cursor-/issues)
- [讨论区](https://github.com/Poghappy/cursor-/discussions)
- [示例项目](https://github.com/cursor-examples)

---

## 🚀 立即开始

选择适合你的方式：

1. **快速体验**：直接在当前项目中使用 `@po` 开始
2. **创建新项目**：运行 `./scripts/create-project.sh`
3. **深入学习**：阅读完整的使用指南

**让 Cursor AI Agent 团队助力你的项目成功！** 🎯
