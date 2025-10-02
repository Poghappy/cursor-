# 配置详解

详细说明 `.cursor/` 目录中各配置文件的选项和用法。

## 📁 配置文件概览

| 文件                       | 用途                | 优先级 |
| -------------------------- | ------------------- | ------ |
| `config/rules.md`          | Cursor IDE 核心规则 | 高     |
| `config/editor.json`       | 编辑器行为配置      | 高     |
| `config/mcp.json`          | MCP 服务配置        | 中     |
| `config/integrations.json` | 第三方集成          | 中     |
| `config/memories.json`     | 记忆系统            | 低     |
| `config/pr-config.json`    | PR 模板             | 低     |

## 🎯 核心配置: rules.md

### 1. 代码风格

```markdown
### 代码风格

- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 函数和变量使用描述性命名
- 优先使用 const，避免 var
```

**说明**:

- 这些规则会影响 AI 的代码建议
- 严格模式可以catch更多潜在问题
- 描述性命名提高代码可读性

### 2. 文件组织

```markdown
### 文件组织

- 业务逻辑放在 `src/services/`
- 控制器仅做路由和参数校验
- 工具函数放在 `src/utils/`
- 类型定义放在 `src/types/`
```

**使用场景**:

- 创建新文件时参考此规则
- 重构代码时按此组织
- AI 会自动建议正确的位置

### 3. 测试要求

```markdown
### 测试要求

- 核心逻辑必须有单元测试
- 测试覆盖率不低于 80%
- 使用 Jest 作为测试框架
- 测试文件与源文件同目录
```

**配置项**:

- 覆盖率阈值在 `package.json` 中配置
- 可调整为 60%, 70%, 80%, 90%

### 4. 提交规范

```markdown
### 提交规范

- 使用 Conventional Commits 格式
- 每次提交包含清晰的变更说明
- 大功能拆分为多个小提交
- 提交前运行 lint 和 test
```

**支持的提交类型**:

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档
- `style`: 格式
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建/工具
- `ci`: CI 配置
- `build`: 构建系统
- `revert`: 回滚

## ⚙️ 编辑器配置: editor.json

### 1. 上下文窗口

```json
{
  "editor": {
    "contextWindow": {
      "maxLines": 100,
      "includeImports": true,
      "includeTypes": true
    }
  }
}
```

**选项说明**:

- `maxLines`: 最大上下文行数 (50-200)
- `includeImports`: 是否包含 import 语句
- `includeTypes`: 是否包含类型定义

**性能影响**:

- 行数越多，上下文越完整，但响应更慢
- 建议: 50-100 行平衡性能和准确性

### 2. 自动补全

```json
{
  "autoCompletion": {
    "enabled": true,
    "triggerCharacters": ["@", "/", "."],
    "maxSuggestions": 10,
    "showSnippets": true
  }
}
```

**触发字符**:

- `@`: 触发角色/命令建议
- `/`: 触发路径补全
- `.`: 触发方法/属性补全

**自定义建议数**:

- 1-5: 简洁，性能好
- 5-10: 平衡
- 10-20: 全面，但可能干扰

### 3. 内联聊天

```json
{
  "inlineChat": {
    "enabled": true,
    "shortcuts": {
      "accept": "Tab",
      "reject": "Esc"
    },
    "autoTrigger": true,
    "delayMs": 500
  }
}
```

**快捷键**:

- `Tab`: 接受建议
- `Esc`: 拒绝建议
- `Alt+]`: 下一个建议
- `Alt+[`: 上一个建议

**自动触发**:

- `true`: 停止输入后自动弹出
- `false`: 手动触发 (Ctrl+K)
- `delayMs`: 触发延迟 (200-1000ms)

### 4. 代码操作

```json
{
  "codeActions": {
    "enabled": true,
    "autoFix": true,
    "quickFixes": true,
    "refactorings": true
  }
}
```

**操作类型**:

- `autoFix`: 自动修复lint错误
- `quickFixes`: 快速修复建议
- `refactorings`: 重构操作
- `sourceActions`: 源代码操作

## 🔌 集成配置: integrations.json

### 1. GitHub 集成

```json
{
  "github": {
    "enabled": true,
    "autoLinkIssues": true,
    "prTemplates": true,
    "autoComments": false
  }
}
```

**功能**:

- `autoLinkIssues`: 自动链接 issue (#123)
- `prTemplates`: 使用 PR 模板
- `autoComments`: 自动添加 PR 评论
- `branchProtection`: 分支保护规则

### 2. Jira 集成

```json
{
  "jira": {
    "enabled": false,
    "apiToken": "${JIRA_API_TOKEN}",
    "baseUrl": "https://your-org.atlassian.net",
    "projectKey": "PROJ"
  }
}
```

**设置步骤**:

1. 生成 Jira API Token
2. 设置环境变量 `JIRA_API_TOKEN`
3. 配置 baseUrl 和 projectKey
4. 启用集成

### 3. Slack 集成

```json
{
  "slack": {
    "enabled": false,
    "webhookUrl": "${SLACK_WEBHOOK_URL}",
    "channels": {
      "deployments": "#deployments",
      "errors": "#errors"
    }
  }
}
```

**通知类型**:

- `onDeploy`: 部署通知
- `onError`: 错误通知
- `onPR`: PR 通知

### 4. 监控集成

#### Sentry (错误追踪)

```json
{
  "sentry": {
    "enabled": false,
    "dsn": "${SENTRY_DSN}",
    "environment": "development",
    "tracesSampleRate": 1.0
  }
}
```

#### Datadog (性能监控)

```json
{
  "datadog": {
    "enabled": false,
    "apiKey": "${DATADOG_API_KEY}",
    "service": "cursor-agent"
  }
}
```

## 🧠 Agent 配置

### 1. 角色配置

```json
{
  "agent": {
    "roles": {
      "enabled": true,
      "path": "commands/roles",
      "autoSwitch": false
    }
  }
}
```

**选项**:

- `enabled`: 启用角色系统
- `path`: 角色定义路径
- `autoSwitch`: 自动切换角色

**可用角色**:

- PO, PM, BA, Arch, Dev, QA, Ops, TW, PJM, LLME

### 2. 阶段配置

```json
{
  "agent": {
    "stages": {
      "enabled": true,
      "path": "commands/stages",
      "autoProgress": false
    }
  }
}
```

**阶段流程**:

1. user_story (用户故事)
2. prd (产品需求)
3. task_breakdown (任务分解)
4. tech_design (技术设计)
5. implementation (实现)
6. qa_test (测试)
7. iteration (迭代)

## 🔒 安全配置

### 环境变量管理

**推荐做法**:

```bash
# .env (不提交)
JIRA_API_TOKEN=actual_token
SLACK_WEBHOOK_URL=actual_url
SENTRY_DSN=actual_dsn

# integrations.json (提交)
{
  "jira": {
    "apiToken": "${JIRA_API_TOKEN}"
  }
}
```

**避免硬编码**:

- ❌ `"apiToken": "sk-123abc"`
- ✅ `"apiToken": "${API_TOKEN}"`

### 权限管理

```json
{
  "permissions": {
    "fileAccess": ["src/", "tests/"],
    "commandExecution": false,
    "networkAccess": ["api.github.com"]
  }
}
```

## 📊 性能优化

### 1. 缓存配置

```json
{
  "performance": {
    "cacheEnabled": true,
    "cacheSize": "100MB",
    "cacheDir": "data/cache"
  }
}
```

**建议**:

- 开发环境: 100MB
- 生产环境: 500MB-1GB

### 2. 并发控制

```json
{
  "performance": {
    "maxConcurrentRequests": 3,
    "requestTimeout": 30000
  }
}
```

**调优**:

- 高性能机器: 5-10
- 普通机器: 2-3
- 低性能机器: 1-2

## 🎯 最佳实践

### 1. 配置分层

```
开发环境 → .cursor/config/editor.json
测试环境 → .cursor/config/editor.test.json
生产环境 → .cursor/config/editor.prod.json
```

### 2. 配置验证

```bash
# 验证 JSON 语法
cat .cursor/config/editor.json | jq .

# 验证配置完整性
make cursor-validate
```

### 3. 配置备份

```bash
# 备份当前配置
make cursor-backup

# 恢复配置
./scripts/maintenance/optimize-cursor-dir.sh --rollback backup_dir
```

## 📚 相关文档

- [设置指南](setup.md) - 初始设置
- [最佳实践](best-practices.md) - 使用建议
- [主 README](../README.md) - 目录概览

---

**最后更新**: 2025-10-02  
**维护者**: Dev Agent Team
