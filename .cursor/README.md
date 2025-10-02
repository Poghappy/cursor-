# Cursor Agent 系统

欢迎使用 Cursor 多角色 Agent 团队协作系统的配置目录。

## 📁 目录结构

```
.cursor/
├── 📄 AGENTS_GUIDE.md         # Agent 使用指南
├── 📄 CHANGELOG.md            # 变更日志
├── 📄 VERSION                 # 版本标识
├── 📄 README.md               # 本文件
│
├── 📁 config/                 # 配置文件
│   ├── rules.md              # Cursor 规则配置
│   ├── mcp.json              # MCP 服务配置
│   ├── memories.json         # 记忆系统配置
│   ├── pr-config.json        # PR 模板配置
│   ├── editor.json           # 编辑器配置
│   └── integrations.json     # 集成配置
│
├── 📁 commands/               # Agent 命令系统
│   ├── roles/                # → 链接到 ../../prompts/roles/
│   ├── stages/               # → 链接到 ../../prompts/stages/
│   └── tools/                # 工具命令集
│
├── 📁 rules/                  # 规则定义
│   ├── core/                 # 核心规则
│   ├── project/              # 项目规则
│   └── workflow/             # 工作流规则
│
├── 📁 templates/              # 模板系统
│   ├── agent-todos.json      # 任务模板配置
│   ├── handover/             # 交接模板
│   ├── todo/                 # 任务模板
│   └── report/               # 报告模板
│
├── 📁 data/                   # 运行时数据
│   ├── handovers/            # 交接记录
│   ├── sessions/             # 会话数据
│   ├── metrics/              # 指标数据
│   └── cache/                # 缓存数据
│
└── 📁 docs/                   # 专属文档
    ├── setup.md              # 设置指南
    ├── configuration.md      # 配置详解
    └── best-practices.md     # 最佳实践
```

## 🚀 快速开始

### 1. 基本使用

Cursor Agent 系统会自动读取此目录下的配置和规则。无需手动操作，系统会：

- 自动加载 `config/rules.md` 中的规则
- 根据 `commands/` 中的定义提供命令建议
- 使用 `templates/` 中的模板快速生成内容

### 2. 配置说明

#### 核心配置文件

- **rules.md**: Cursor IDE 的主要规则配置
- **mcp.json**: Model Context Protocol 服务配置
- **editor.json**: 编辑器行为配置
- **integrations.json**: 第三方集成配置

#### 如何修改配置

```bash
# 编辑规则
vim .cursor/config/rules.md

# 或使用符号链接（推荐）
vim .cursorrules  # → 自动链接到 .cursor/config/rules.md
```

### 3. 常用命令

```bash
# 验证配置
make cursor-validate

# 查看统计
make cursor-stats

# 备份配置
make cursor-backup
```

## 📚 文档导航

### 快速参考

- [Agent 使用指南](AGENTS_GUIDE.md) - 如何使用 Agent 系统
- [变更日志](CHANGELOG.md) - 版本变更记录
- [优化方案](OPTIMIZATION_PLAN.md) - 目录结构优化详情

### 详细文档

- [设置指南](docs/setup.md) - 初始设置步骤
- [配置详解](docs/configuration.md) - 配置项说明
- [最佳实践](docs/best-practices.md) - 使用建议

### 外部文档

- [项目主文档](../docs/) - 完整项目文档
- [基础设施指南](../docs/INFRASTRUCTURE_GUIDE.md) - 项目基础设施
- [贡献指南](../CONTRIBUTING.md) - 如何贡献

## ⚙️ 配置管理

### 规则配置

规则定义在 `config/rules.md` 中，包括：

- **代码风格**: TypeScript 严格模式、ESLint、Prettier
- **文件组织**: 业务逻辑、控制器、工具函数分离
- **测试要求**: 80% 覆盖率、Jest 框架
- **提交规范**: Conventional Commits
- **协作规则**: 角色定义、交接规范

### 命令系统

命令分为三类：

1. **角色命令** (`commands/roles/`): 10 个专业角色
   - PO (Product Owner)
   - PM (Product Manager)
   - BA (Business Analyst)
   - Arch (Architect)
   - Dev (Developer)
   - QA (Quality Assurance)
   - Ops (Operations)
   - TW (Technical Writer)
   - PJM (Project Manager)
   - LLME (LLM Engineer)

2. **阶段命令** (`commands/stages/`): 7 个开发阶段
   - user_story: 用户故事
   - prd: 产品需求文档
   - task_breakdown: 任务分解
   - tech_design: 技术设计
   - implementation: 实现
   - qa_test: 测试
   - iteration: 迭代

3. **工具命令** (`commands/tools/`): 8 个常用工具
   - analyze: 代码分析
   - commit: 提交管理
   - debug: 调试辅助
   - deploy: 部署工具
   - doc: 文档生成
   - handover: 交接工具
   - refactor: 重构辅助
   - review: 代码审查

## 🔧 模板系统

### 任务模板

位于 `templates/agent-todos.json`，包含三种模板：

1. **feature_development**: 功能开发流程
2. **bug_fix**: Bug 修复流程
3. **refactoring**: 重构流程

### 使用模板

模板会自动应用到相应的工作流程中，也可以手动引用：

```javascript
// 在代码中引用
const todoTemplate = require('./.cursor/templates/agent-todos.json');
```

## 📊 数据管理

### 运行时数据

`data/` 目录存储运行时数据，不应提交到 Git：

- **handovers/**: 角色间交接记录
- **sessions/**: 会话历史
- **metrics/**: 性能指标
- **cache/**: 临时缓存

### 数据清理

定期清理过期数据：

```bash
# 清理 30 天前的会话
find .cursor/data/sessions -mtime +30 -delete

# 清理缓存
rm -rf .cursor/data/cache/*
```

## 🔒 安全提示

1. **敏感信息**: 不要在配置文件中存储密钥、令牌等敏感信息
2. **环境变量**: 使用 `.env` 文件管理敏感配置
3. **数据隔离**: 运行时数据已在 `.gitignore` 中排除

## 🆘 故障排查

### 常见问题

**Q: Agent 命令不工作？** A: 检查 Cursor IDE 配置，确保正确加载了 `.cursor/` 目录

**Q: 规则没有生效？** A: 验证 `config/rules.md` 语法，尝试重启 Cursor IDE

**Q: 符号链接失效？** A: 运行 `ls -la AGENTS.md .cursorrules` 检查链接状态

### 获取帮助

- 查看 [故障排查文档](../docs/cursor/CURSOR_TROUBLESHOOTING.md)
- 运行 `make help` 查看所有可用命令
- 查看项目 [Issue 列表](https://github.com/your-org/repo/issues)

## 📝 版本信息

- **当前版本**: 见 [VERSION](VERSION) 文件
- **变更记录**: 见 [CHANGELOG.md](CHANGELOG.md)
- **优化历史**: 见 [OPTIMIZATION_PLAN.md](OPTIMIZATION_PLAN.md)

## 🤝 贡献

如需修改配置或添加功能：

1. 创建功能分支
2. 修改相应配置
3. 测试验证
4. 提交 PR
5. 更新文档

详见 [贡献指南](../CONTRIBUTING.md)

---

**最后更新**: 2025-10-02  
**维护者**: Dev Agent Team  
**版本**: 2.0.0
