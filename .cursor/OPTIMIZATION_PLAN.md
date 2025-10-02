# .cursor/ 目录优化完善方案

**生成时间**: 2025-10-02  
**目标**: 优化 `.cursor/` 目录结构，提升 Cursor IDE Agent 系统的组织性和可维护性

---

## 📊 当前状态分析

### 现有结构

```
.cursor/
├── commands/           # Agent 命令和模板
│   ├── roles/         # 10 个角色定义
│   ├── stages/        # 7 个阶段模板
│   └── tools/         # 8 个工具命令
├── config/            # 配置文件
│   ├── mcp.json
│   ├── memories.json
│   └── pr-config.json
├── handovers/         # 交接记录
│   └── *.json
├── rules/             # 规则定义
│   ├── core/
│   ├── project/
│   └── workflow/
└── agent-todos.json   # 任务模板
```

### 问题识别

1. **配置文件分散**
   - ❌ `.cursorrules` 在根目录，应该在 `.cursor/` 下
   - ❌ `AGENTS.md` 在根目录，应该在 `.cursor/` 下
   - ⚠️ `commitlint.config.js` 与 Git hooks 相关，考虑是否移入

2. **功能重复**
   - ⚠️ `.cursor/commands/roles/` 与 `prompts/roles/` 重复
   - ⚠️ `.cursor/commands/stages/` 与 `prompts/stages/` 重复

3. **缺少关键文件**
   - ❌ 缺少 `.cursor/` 目录的 README 说明
   - ❌ 缺少版本控制和变更日志
   - ❌ 缺少最佳实践文档

4. **命名不一致**
   - ⚠️ 部分文件使用 `.md`，部分使用 `.mdc`
   - ⚠️ 命名规范不统一（kebab-case vs snake_case）

---

## 🎯 优化目标

### 1. 统一配置管理

- ✅ 所有 Cursor Agent 相关配置集中到 `.cursor/`
- ✅ 明确配置文件的作用域和优先级

### 2. 消除冗余

- ✅ 合并重复的角色和阶段定义
- ✅ 统一引用来源

### 3. 增强可维护性

- ✅ 完善文档和说明
- ✅ 添加版本控制
- ✅ 规范文件命名

### 4. 优化目录结构

- ✅ 按功能清晰分类
- ✅ 支持未来扩展

---

## 📋 优化方案

### 阶段 1: 文件移动和整理

#### 1.1 移动根目录文件到 `.cursor/`

```bash
# 1. 移动 .cursorrules
mv .cursorrules .cursor/rules.md

# 2. 移动 AGENTS.md
mv AGENTS.md .cursor/AGENTS_GUIDE.md

# 3. 创建符号链接（保持根目录可访问）
ln -s .cursor/AGENTS_GUIDE.md AGENTS.md
```

**影响范围**: 需要更新引用这些文件的文档

#### 1.2 合并重复定义

```bash
# prompts/ 目录作为主要来源
# .cursor/commands/ 作为快捷引用

# 方案 A: 软链接（推荐）
.cursor/commands/roles/  -> ../../prompts/roles/
.cursor/commands/stages/ -> ../../prompts/stages/

# 方案 B: 删除重复，统一引用
# 删除 .cursor/commands/roles/ 和 stages/
# 在 README 中说明引用 prompts/
```

**推荐**: 方案 A，保持灵活性

#### 1.3 新增必要文件

```
.cursor/
├── README.md              # 目录说明和使用指南
├── CHANGELOG.md           # 变更日志
├── VERSION                # 版本标识
└── templates/             # 新增：模板目录
    ├── handover/          # 交接模板
    ├── todo/              # 任务模板
    └── report/            # 报告模板
```

---

### 阶段 2: 优化目录结构

#### 2.1 推荐的新结构

```
.cursor/
├── 📄 README.md                    # 目录总览和快速开始
├── 📄 CHANGELOG.md                 # 变更历史
├── 📄 VERSION                      # 版本号
├── 📄 AGENTS_GUIDE.md              # Agent 使用指南（原 AGENTS.md）
│
├── 📁 config/                      # 配置文件
│   ├── rules.md                   # Cursor 规则（原 .cursorrules）
│   ├── mcp.json                   # MCP 配置
│   ├── memories.json              # 记忆配置
│   ├── pr-config.json             # PR 配置
│   ├── editor.json                # 编辑器配置
│   └── integrations.json          # 集成配置
│
├── 📁 commands/                    # Agent 命令系统
│   ├── README.md                  # 命令系统说明
│   ├── mcp-best-practices.md      # MCP 最佳实践
│   ├── roles/                     # → 链接到 ../../prompts/roles/
│   ├── stages/                    # → 链接到 ../../prompts/stages/
│   └── tools/                     # 工具命令
│       ├── analyze.md
│       ├── commit.md
│       ├── debug.md
│       ├── deploy.md
│       ├── doc.md
│       ├── handover.md
│       ├── refactor.md
│       └── review.md
│
├── 📁 rules/                       # 规则定义
│   ├── README.md                  # 规则系统说明
│   ├── core/                      # 核心规则
│   │   ├── agent-functions.md
│   │   ├── handover-schema.md
│   │   └── role-permissions.md
│   ├── project/                   # 项目规则
│   │   ├── file-management.md
│   │   ├── project-architecture.md
│   │   └── prompt-to-rule.md
│   └── workflow/                  # 工作流规则
│       ├── agent-handover.md
│       ├── code-style.md
│       └── stage-shortcuts.md
│
├── 📁 templates/                   # 模板系统（新增）
│   ├── README.md                  # 模板使用说明
│   ├── handover/                  # 交接模板
│   │   ├── standard.json
│   │   ├── urgent.json
│   │   └── complex.json
│   ├── todo/                      # 任务模板
│   │   ├── feature.json
│   │   ├── bugfix.json
│   │   └── refactor.json
│   ├── report/                    # 报告模板
│   │   ├── daily.md
│   │   ├── weekly.md
│   │   └── milestone.md
│   └── agent-todos.json           # 移动到这里
│
├── 📁 data/                        # 运行时数据（新增）
│   ├── handovers/                 # 交接记录
│   │   └── *.json
│   ├── sessions/                  # 会话记录
│   ├── metrics/                   # 指标数据
│   └── cache/                     # 缓存数据
│
└── 📁 docs/                        # .cursor 专属文档（新增）
    ├── setup.md                   # 设置指南
    ├── configuration.md           # 配置详解
    ├── best-practices.md          # 最佳实践
    ├── troubleshooting.md         # 故障排查
    └── api-reference.md           # API 参考
```

#### 2.2 文件命名规范

**统一使用 kebab-case**:

- ✅ `agent-functions.md`
- ✅ `handover-schema.md`
- ✅ `role-permissions.md`
- ❌ `agent_functions.md`（旧）
- ❌ `AgentFunctions.md`（旧）

**文件扩展名规范**:

- `.md` - Markdown 文档（统一使用，废弃 `.mdc`）
- `.json` - JSON 配置
- `.js` - JavaScript 配置（如需要）

---

### 阶段 3: 增强功能

#### 3.1 新增配置文件

**`.cursor/config/editor.json`** - 编辑器专属配置

```json
{
  "maxContextLines": 100,
  "autoCompletion": {
    "enabled": true,
    "triggerChars": ["@", "/"],
    "maxSuggestions": 10
  },
  "inlineChat": {
    "enabled": true,
    "shortcuts": {
      "accept": "Tab",
      "reject": "Esc"
    }
  },
  "codeActions": {
    "enabled": true,
    "autoFix": true
  }
}
```

**`.cursor/config/integrations.json`** - 集成配置

```json
{
  "github": {
    "enabled": true,
    "autoLinkIssues": true,
    "prTemplates": true
  },
  "slack": {
    "enabled": false,
    "webhookUrl": ""
  },
  "jira": {
    "enabled": false,
    "apiToken": ""
  }
}
```

#### 3.2 新增文档

**`.cursor/README.md`** - 主要说明文档

```markdown
# Cursor Agent 系统

本目录包含 Cursor IDE Agent 系统的所有配置、规则和模板。

## 目录结构

...

## 快速开始

...

## 配置说明

...
```

**`.cursor/CHANGELOG.md`** - 变更日志

```markdown
# Changelog

## [2.0.0] - 2025-10-02

### Added

- 新增模板系统
- 新增数据目录
- 新增文档目录

### Changed

- 优化目录结构
- 统一命名规范
- 合并重复定义

### Removed

- 删除冗余文件
```

**`.cursor/VERSION`** - 版本标识

```
2.0.0
```

---

## 🔄 迁移步骤

### 步骤 1: 备份现有配置

```bash
# 创建备份
cp -r .cursor .cursor.backup.$(date +%Y%m%d-%H%M%S)
cp .cursorrules .cursorrules.backup
cp AGENTS.md AGENTS.md.backup
```

### 步骤 2: 执行文件移动

```bash
# 1. 移动配置文件
mv .cursorrules .cursor/config/rules.md
mv AGENTS.md .cursor/AGENTS_GUIDE.md

# 2. 创建新目录
mkdir -p .cursor/templates/{handover,todo,report}
mkdir -p .cursor/data/{handovers,sessions,metrics,cache}
mkdir -p .cursor/docs

# 3. 移动现有数据
mv .cursor/agent-todos.json .cursor/templates/
mv .cursor/handovers/* .cursor/data/handovers/

# 4. 统一文件命名
cd .cursor/rules/core
mv agent_functions.md agent-functions.md
mv handover_schema.md handover-schema.md
mv role_permissions.md role-permissions.md
```

### 步骤 3: 创建符号链接

```bash
# 在根目录创建链接（保持兼容性）
ln -s .cursor/AGENTS_GUIDE.md AGENTS.md
ln -s .cursor/config/rules.md .cursorrules

# 创建 prompts 引用
cd .cursor/commands
rm -rf roles stages
ln -s ../../prompts/roles roles
ln -s ../../prompts/stages stages
```

### 步骤 4: 创建新文件

```bash
# 创建 README
touch .cursor/README.md
touch .cursor/CHANGELOG.md
touch .cursor/VERSION
touch .cursor/templates/README.md
touch .cursor/data/README.md
touch .cursor/docs/setup.md

# 创建配置文件
touch .cursor/config/editor.json
touch .cursor/config/integrations.json
```

### 步骤 5: 更新引用

需要更新以下文件中的路径引用：

- `README.md`
- `docs/**/*.md`
- `Makefile`
- `package.json`
- `.gitignore`

### 步骤 6: 验证和测试

```bash
# 检查符号链接
ls -la AGENTS.md .cursorrules

# 检查目录结构
tree .cursor -L 3

# 测试 Git 忽略规则
git status

# 验证 Agent 功能
# 在 Cursor IDE 中测试命令和规则
```

---

## 📝 配置更新

### 更新 `.gitignore`

```gitignore
# .cursor 运行时数据（忽略）
.cursor/data/sessions/
.cursor/data/metrics/
.cursor/data/cache/

# .cursor 配置备份（忽略）
.cursor.backup.*

# .cursor 关键配置（保留）
!.cursor/config/
!.cursor/rules/
!.cursor/templates/
!.cursor/commands/
```

### 更新 `Makefile`

```makefile
# 更新路径引用
CURSOR_DIR = .cursor
CURSOR_CONFIG = $(CURSOR_DIR)/config
CURSOR_RULES = $(CURSOR_DIR)/rules
CURSOR_TEMPLATES = $(CURSOR_DIR)/templates

# 新增命令
.PHONY: cursor-validate
cursor-validate: ## 验证 .cursor 配置
	@echo "$(BLUE)验证 Cursor 配置...$(NC)"
	@./scripts/maintenance/validate-cursor-config.sh

.PHONY: cursor-backup
cursor-backup: ## 备份 .cursor 配置
	@echo "$(BLUE)备份 Cursor 配置...$(NC)"
	@cp -r .cursor .cursor.backup.$(shell date +%Y%m%d-%H%M%S)
	@echo "$(GREEN)备份完成$(NC)"
```

---

## 🎯 优化收益

### 1. 组织性提升

**之前**:

- ❌ 配置分散在多个位置
- ❌ 角色/阶段定义重复
- ❌ 缺少文档和说明

**之后**:

- ✅ 配置集中管理
- ✅ 单一数据来源
- ✅ 完善的文档体系

### 2. 可维护性提升

**之前**:

- ❌ 命名不一致
- ❌ 结构不清晰
- ❌ 难以扩展

**之后**:

- ✅ 统一命名规范
- ✅ 清晰的目录结构
- ✅ 易于扩展

### 3. 开发体验提升

**之前**:

- ❌ 难以找到配置
- ❌ 不知道如何使用
- ❌ 缺少最佳实践

**之后**:

- ✅ 配置一目了然
- ✅ 详细的使用指南
- ✅ 丰富的示例和模板

---

## 🚨 注意事项

### 兼容性

1. **符号链接兼容性**
   - Windows 用户可能需要管理员权限
   - 考虑提供复制文件的备选方案

2. **Git 兼容性**
   - 确保 `.gitignore` 正确配置
   - 测试 Git 子模块兼容性

3. **IDE 兼容性**
   - 验证 Cursor IDE 能正确读取新路径
   - 测试命令和规则是否生效

### 回滚方案

如果迁移出现问题：

```bash
# 方案 1: 从备份恢复
rm -rf .cursor
mv .cursor.backup.YYYYMMDD-HHMMSS .cursor
mv .cursorrules.backup .cursorrules
mv AGENTS.md.backup AGENTS.md

# 方案 2: 使用 Git 回滚
git checkout HEAD~1 -- .cursor/
git checkout HEAD~1 -- .cursorrules AGENTS.md
```

---

## 📊 验证清单

### 结构验证

- [ ] `.cursor/` 目录结构正确
- [ ] 所有必要文件已创建
- [ ] 符号链接正常工作
- [ ] 旧文件已清理

### 功能验证

- [ ] Cursor Agent 命令正常
- [ ] 规则配置生效
- [ ] 模板可以使用
- [ ] 交接流程正常

### 文档验证

- [ ] README 完整准确
- [ ] CHANGELOG 记录完整
- [ ] 所有引用路径正确
- [ ] 示例代码可运行

### Git 验证

- [ ] `.gitignore` 配置正确
- [ ] 不应跟踪的文件被忽略
- [ ] 应跟踪的文件被包含
- [ ] Git 状态干净

---

## 🎓 最佳实践

### 1. 配置管理

- ✅ 使用版本控制跟踪配置变更
- ✅ 敏感信息使用环境变量
- ✅ 提供默认配置示例
- ✅ 文档化所有配置选项

### 2. 模板使用

- ✅ 保持模板简洁通用
- ✅ 提供多个场景的模板
- ✅ 模板包含注释说明
- ✅ 定期更新和优化

### 3. 数据管理

- ✅ 定期清理过期数据
- ✅ 重要数据备份
- ✅ 控制数据目录大小
- ✅ 使用 `.gitignore` 排除临时数据

### 4. 文档维护

- ✅ 变更时同步更新文档
- ✅ 提供清晰的示例
- ✅ 记录已知问题和解决方案
- ✅ 保持文档简洁易读

---

## 📅 实施计划

### Week 1: 准备和验证

- Day 1-2: 备份和测试
- Day 3-4: 文件移动和重命名
- Day 5: 创建新文件和目录

### Week 2: 文档和测试

- Day 1-2: 编写 README 和文档
- Day 3-4: 更新引用和测试
- Day 5: 团队培训和部署

---

## 📚 参考资源

- [Cursor 官方文档](https://cursor.sh/docs)
- [项目现有文档](../docs/)
- [基础设施指南](../docs/INFRASTRUCTURE_GUIDE.md)

---

**优化方案生成**: 2025-10-02  
**执行者**: Dev Agent  
**状态**: 待审核
