# Cursor 斜杠命令使用指南

本目录包含 Cursor IDE 的自定义斜杠命令，用于快速切换 Agent 角色、启动开发阶段和使用工具。

## 📁 目录结构

```
.cursor/commands/
├── roles/          # 角色命令（10个）
│   ├── po.md       # Product Owner
│   ├── pm.md       # Product Manager
│   ├── ba.md       # Business Analyst
│   ├── arch.md     # Architect
│   ├── dev.md      # Developer
│   ├── qa.md       # QA Engineer
│   ├── ops.md      # Operations
│   ├── tw.md       # Technical Writer
│   ├── pjm.md      # Project Manager
│   └── llme.md     # LLM Engineer
├── stages/         # 阶段命令（7个）
│   ├── story.md    # 生成用户故事
│   ├── prd.md      # 生成 PRD
│   ├── tasks.md    # 任务分解
│   ├── impl.md     # 实现阶段
│   ├── test.md     # 测试阶段
│   ├── design.md   # 技术设计
│   └── iterate.md  # 迭代优化
├── tools/          # 工具命令（8个）
│   ├── handover.md # 生成交接 JSON
│   ├── review.md   # 代码审查
│   ├── commit.md   # 生成 Commit 信息
│   ├── doc.md      # 生成文档
│   ├── debug.md    # 调试问题
│   ├── refactor.md # 代码重构
│   ├── deploy.md   # 部署检查清单
│   └── analyze.md  # 项目分析
└── README.md       # 本文件
```

## 🎯 快速开始

### 在 Cursor 中使用命令

1. 在聊天窗口输入 `/` 触发命令提示
2. 输入命令名称（如 `po`、`dev`、`story`）
3. 选择对应命令并执行

### 命令类型

#### 🎭 角色命令

切换到特定 Agent 角色，获得角色相关的上下文和行为准则。

| 命令    | 角色             | 用途                 |
| ------- | ---------------- | -------------------- |
| `/po`   | Product Owner    | 定义产品愿景和优先级 |
| `/pm`   | Product Manager  | 生成产品需求文档     |
| `/ba`   | Business Analyst | 任务分解和需求分析   |
| `/arch` | Architect        | 系统架构设计         |
| `/dev`  | Developer        | 代码实现             |
| `/qa`   | QA Engineer      | 质量测试             |

#### 📋 阶段命令

快速启动特定开发阶段的工作流。

| 命令     | 阶段         | 产出                   |
| -------- | ------------ | ---------------------- |
| `/story` | 用户故事生成 | `docs/USER_STORIES.md` |
| `/prd`   | PRD 生成     | `docs/PRD.md`          |
| `/tasks` | 任务分解     | `docs/TASKS.md`        |
| `/impl`  | 实现阶段     | 源代码 + 测试          |
| `/test`  | 测试阶段     | `docs/TEST_REPORT.md`  |

#### 🛠️ 工具命令

通用开发工具和工作流辅助。

| 命令        | 工具        | 用途                    |
| ----------- | ----------- | ----------------------- |
| `/handover` | 交接生成    | 生成角色切换的交接 JSON |
| `/review`   | 代码审查    | 全面的代码质量审查      |
| `/commit`   | Commit 生成 | 符合规范的提交信息      |
| `/doc`      | 文档生成    | API、架构、部署文档     |
| `/debug`    | 调试助手    | 系统化问题定位          |

## 💡 使用示例

### 场景 1: 从零开始新项目

```
1. /po        → 定义产品愿景，生成项目概览
2. /story     → 生成用户故事
3. /handover  → 交接给 PM
4. /pm        → 生成 PRD
5. /handover  → 交接给 BA
6. /tasks     → 任务分解
7. /handover  → 交接给 Arch
8. /arch      → 技术设计
9. /handover  → 交接给 Dev
10. /dev      → 开始实现
```

### 场景 2: 代码开发

```
1. /dev       → 切换到开发角色
2. /impl      → 启动实现阶段
3. [编写代码]
4. /review    → 代码自审
5. /commit    → 生成 Commit 信息
6. git commit
```

### 场景 3: 调试问题

```
1. /debug     → 启动调试流程
2. [定位问题]
3. /dev       → 切换到开发角色修复
4. /commit    → 生成修复 Commit
```

## 🔄 标准工作流

### 完整开发流程

```mermaid
graph LR
    A[PO: 产品愿景] --> B[PM: PRD]
    B --> C[BA: 任务分解]
    C --> D[Arch: 技术设计]
    D --> E[Dev: 实现]
    E --> F[QA: 测试]
    F --> G[Ops: 部署]
```

### 每阶段结束时

1. 完成阶段产出
2. 运行质量检查（如 lint、test）
3. 使用 `/handover` 生成交接 JSON
4. 切换到下一角色

## 📝 命令开发指南

### 创建新命令

1. 在对应目录创建 `.md` 文件
2. 文件命名与命令名一致（如 `ops.md` → `/ops`）
3. 使用清晰的 Markdown 结构
4. 包含以下部分：
   - 角色/阶段/工具概述
   - 核心职责
   - 主要产出
   - 行为准则
   - 参考文档

### 命令内容模板

```markdown
# 命令标题

你现在是 **角色名称**，负责...

## 核心职责

- 职责1
- 职责2

## 主要产出

1. **产出1** (`文件路径`)
   - 内容要点

## 行为准则

- 准则1
- 准则2

## 参考文档

- 完整定义: `prompts/roles/xxx.md`
- 模板文件: `prompts/stages/xxx.md`

---

**开始你的工作吧！**
```

## 🎓 最佳实践

### 角色切换

- 使用角色命令明确当前上下文
- 完成阶段后及时交接
- 保持角色职责清晰

### 阶段执行

- 按照阶段模板输出标准文档
- 遵循质量检查清单
- 每阶段输出可验证的产物

### 工具使用

- 代码变更前先 `/review`
- 提交前使用 `/commit` 生成规范信息
- 遇到问题使用 `/debug` 系统化排查

## 📚 相关资源

- **完整角色定义**: `prompts/roles/`
- **阶段模板**: `prompts/stages/`
- **项目规则**: `.cursor/rules/`
- **Agent 指南**: `AGENTS.md`

## 🚀 下一步

- [ ] 创建剩余 5 个角色命令（ops, tw, pjm, llme, 等）
- [ ] 创建 2 个阶段命令（design, iterate）
- [ ] 创建 3 个工具命令（refactor, deploy, analyze）
- [ ] 根据使用反馈优化命令内容

---

**现在开始使用吧！输入 `/` 查看所有可用命令。**
