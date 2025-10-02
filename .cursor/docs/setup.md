# .cursor/ 设置指南

本指南帮助你正确设置和配置 Cursor Agent 系统。

## 🚀 快速设置

### 1. 验证安装

```bash
# 检查目录结构
make cursor-validate

# 查看统计信息
make cursor-stats
```

**预期输出**:

```
✓ .cursor 目录存在
  文件数: 57
  目录数: 21
```

### 2. 检查符号链接

```bash
# 验证符号链接
ls -la AGENTS.md .cursorrules
```

**预期输出**:

```
.cursorrules -> .cursor/config/rules.md
AGENTS.md -> .cursor/AGENTS_GUIDE.md
```

### 3. 配置编辑器

Cursor IDE 会自动读取配置，但你可以自定义：

```bash
# 编辑编辑器配置
vim .cursor/config/editor.json

# 编辑集成配置
vim .cursor/config/integrations.json
```

## ⚙️ 详细配置

### 配置文件说明

#### 1. rules.md - 核心规则

```bash
# 直接编辑
vim .cursor/config/rules.md

# 或使用符号链接
vim .cursorrules
```

**配置内容**:

- 代码风格规范
- 文件组织规则
- 测试要求
- 提交规范
- 协作规则

#### 2. editor.json - 编辑器配置

```json
{
  "editor": {
    "contextWindow": {
      "maxLines": 100
    },
    "autoCompletion": {
      "enabled": true,
      "triggerCharacters": ["@", "/", "."]
    }
  }
}
```

**可配置项**:

- 上下文窗口大小
- 自动补全设置
- 内联聊天配置
- 代码操作行为

#### 3. integrations.json - 第三方集成

```json
{
  "github": {
    "enabled": true,
    "autoLinkIssues": true
  }
}
```

**支持的集成**:

- GitHub/GitLab
- Jira
- Slack
- Sentry
- Docker/Kubernetes
- AWS/Vercel/Railway

### 环境变量设置

1. **创建 .env 文件**

```bash
cp .env.example .env
```

2. **配置环境变量**

```bash
# 必需
PORT=3000
NODE_ENV=development

# 可选：集成服务
JIRA_API_TOKEN=your_token
SLACK_WEBHOOK_URL=your_webhook
SENTRY_DSN=your_dsn
```

3. **使用环境管理器**

```bash
# 初始化环境
make setup-env

# 或直接运行
node scripts/development/env-manager.js init
```

## 🔧 高级配置

### 自定义角色

1. **创建角色文件**

```bash
# 在 prompts/roles/ 目录创建
vim prompts/roles/custom-role.md
```

2. **添加角色定义**

```markdown
# Custom Role

## 职责

- ...

## 权限

- ...

## 工作流程

- ...
```

3. **更新引用**

角色会自动被 `.cursor/commands/roles/` 的符号链接引用。

### 自定义阶段

1. **创建阶段文件**

```bash
vim prompts/stages/custom-stage.md
```

2. **定义阶段流程**

```markdown
# Custom Stage

## 目标

- ...

## 输入

- ...

## 输出

- ...

## 步骤

1. ...
```

### 自定义模板

1. **编辑任务模板**

```bash
vim .cursor/templates/agent-todos.json
```

2. **添加新模板**

```json
{
  "todoTemplates": {
    "custom_workflow": {
      "name": "自定义工作流",
      "steps": [
        {
          "id": "step1",
          "title": "步骤 1",
          "description": "...",
          "assignedRole": "dev",
          "estimatedTime": "2h"
        }
      ]
    }
  }
}
```

## 🧪 测试配置

### 1. 验证规则

在 Cursor IDE 中：

1. 打开任意 TypeScript 文件
2. 触发 AI 建议（Ctrl/Cmd + K）
3. 检查建议是否符合配置的规则

### 2. 测试命令

```bash
# 测试角色命令
# 在 Cursor 中输入: @role:dev

# 测试阶段命令
# 在 Cursor 中输入: @stage:implementation

# 测试工具命令
# 在 Cursor 中输入: @tool:analyze
```

### 3. 验证集成

```bash
# 测试 GitHub 集成
git commit -m "test: verify configuration"

# 检查 commit message 格式
git log -1

# 测试 Git hooks
make setup-git-hooks
```

## 🔍 故障排查

### 问题 1: 符号链接失效

**症状**: AGENTS.md 或 .cursorrules 无法访问

**解决方案**:

```bash
# 重新创建符号链接
rm -f AGENTS.md .cursorrules
ln -s .cursor/AGENTS_GUIDE.md AGENTS.md
ln -s .cursor/config/rules.md .cursorrules
```

### 问题 2: 配置未生效

**症状**: Cursor IDE 没有应用新配置

**解决方案**:

1. 验证配置文件语法

```bash
# 验证 JSON 语法
cat .cursor/config/editor.json | jq .
```

2. 重启 Cursor IDE

3. 清除缓存

```bash
rm -rf .cursor/data/cache/*
```

### 问题 3: 环境变量未加载

**症状**: 集成服务无法连接

**解决方案**:

```bash
# 检查 .env 文件
cat .env

# 验证变量加载
node -e "require('dotenv').config(); console.log(process.env.JIRA_API_TOKEN)"

# 重新初始化
make setup-env
```

## 📚 下一步

设置完成后：

1. ✅ 阅读 [配置详解](configuration.md)
2. ✅ 查看 [最佳实践](best-practices.md)
3. ✅ 浏览 [Agent 使用指南](../AGENTS_GUIDE.md)
4. ✅ 参考 [主项目文档](../../docs/)

## 🆘 获取帮助

- 查看 [故障排查指南](../../docs/cursor/CURSOR_TROUBLESHOOTING.md)
- 运行 `make help` 查看所有命令
- 查看项目 [Issues](https://github.com/your-org/repo/issues)

---

**最后更新**: 2025-10-02  
**维护者**: Dev Agent Team
