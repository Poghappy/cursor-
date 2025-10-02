# 最佳实践指南

Cursor Agent 系统的使用建议和最佳实践。

## 🎯 核心原则

### 1. 配置即代码

**原则**: 所有配置都应该版本化、可审查、可回滚

**实践**:

```bash
# ✅ 好的做法
git add .cursor/config/
git commit -m "feat(config): 优化编辑器配置"

# ❌ 避免
手动修改配置后不提交
```

### 2. 最小化配置

**原则**: 只配置必要的选项，使用默认值

**实践**:

```json
// ✅ 简洁配置
{
  "editor": {
    "contextWindow": {
      "maxLines": 100
    }
  }
}

// ❌ 过度配置
{
  "editor": {
    "contextWindow": {
      "maxLines": 100,
      "includeImports": true,  // 默认值
      "includeTypes": true     // 默认值
    }
  }
}
```

### 3. 环境隔离

**原则**: 开发、测试、生产环境分离

**实践**:

```bash
# 使用环境变量
NODE_ENV=development
NODE_ENV=test
NODE_ENV=production

# 不同环境不同配置
.cursor/config/editor.dev.json
.cursor/config/editor.prod.json
```

## 📝 规则编写

### 1. 清晰的规则

**✅ 好的规则**:

```markdown
- 业务逻辑放在 `src/services/` 目录
- 控制器仅做路由和参数校验
- 每个服务文件不超过 300 行
```

**❌ 模糊的规则**:

```markdown
- 代码要写得好
- 保持代码整洁
- 遵循最佳实践
```

### 2. 可执行的规则

**✅ 可验证**:

```markdown
- 测试覆盖率不低于 80%
- 单文件不超过 300 行
- 函数不超过 50 行
```

**❌ 主观判断**:

```markdown
- 代码应该优雅
- 保持合理的复杂度
- 适当使用注释
```

### 3. 优先级排序

```markdown
## 必须遵守 (MUST)

- 使用 TypeScript 严格模式
- 测试覆盖率 >= 80%

## 应该遵守 (SHOULD)

- 函数命名使用动词开头
- 避免嵌套超过 3 层

## 建议遵守 (MAY)

- 使用函数式编程风格
- 优先使用 const
```

## 🤖 Agent 使用

### 1. 角色切换

**场景**: 不同阶段使用不同角色

```bash
# 需求阶段
@role:po  # Product Owner
@role:ba  # Business Analyst

# 设计阶段
@role:arch  # Architect
@role:pm    # Product Manager

# 开发阶段
@role:dev  # Developer
@role:qa   # Quality Assurance

# 部署阶段
@role:ops  # Operations
```

**技巧**:

- 单一角色专注一个任务
- 交接时明确输入输出
- 记录决策过程

### 2. 阶段推进

**标准流程**:

```
用户故事 → PRD → 任务分解 → 技术设计 → 实现 → 测试 → 迭代
   ↓        ↓       ↓         ↓       ↓     ↓      ↓
  PO/BA    PM/BA    PJM      Arch     Dev    QA    全员
```

**实践建议**:

- 不要跳过阶段
- 每个阶段有明确的输出
- 输出物需要评审

### 3. 工具使用

**常用工具命令**:

```bash
# 代码分析
@tool:analyze src/services/user.ts

# 提交管理
@tool:commit --type feat --scope auth

# 代码审查
@tool:review --file src/

# 文档生成
@tool:doc --module auth

# 交接准备
@tool:handover --from dev --to qa
```

## 📊 数据管理

### 1. 清理策略

**定期清理**:

```bash
# 每周清理
find .cursor/data/sessions -mtime +7 -delete

# 每月清理
find .cursor/data/cache -mtime +30 -delete

# 清理大文件
find .cursor/data -size +10M -ls
```

**自动化清理**:

```bash
# 添加到 crontab
0 2 * * 0 find .cursor/data/sessions -mtime +7 -delete
0 2 1 * * find .cursor/data/cache -mtime +30 -delete
```

### 2. 备份策略

**重要数据备份**:

```bash
# 每日备份
make cursor-backup

# 重要变更前备份
./scripts/maintenance/optimize-cursor-dir.sh --backup-only

# 远程备份
rsync -av .cursor/ backup-server:/backups/cursor/
```

### 3. 监控数据增长

```bash
# 查看目录大小
du -sh .cursor/data/*

# 监控增长
watch -n 60 du -sh .cursor/data
```

## 🔐 安全最佳实践

### 1. 敏感信息管理

**❌ 错误做法**:

```json
{
  "jira": {
    "apiToken": "ATT3xFfGF0123..." // 硬编码
  }
}
```

**✅ 正确做法**:

```json
{
  "jira": {
    "apiToken": "${JIRA_API_TOKEN}" // 环境变量
  }
}
```

```bash
# .env 文件 (不提交)
JIRA_API_TOKEN=ATT3xFfGF0123...

# .gitignore
.env
.env.*
!.env.example
```

### 2. 权限控制

```json
{
  "permissions": {
    "fileAccess": ["src/", "tests/"], // 限制访问范围
    "commandExecution": false, // 禁止执行命令
    "networkAccess": [
      // 限制网络访问
      "api.github.com",
      "api.openai.com"
    ]
  }
}
```

### 3. 审计日志

```bash
# 启用日志
{
  "audit": {
    "enabled": true,
    "logPath": "data/audit.log",
    "level": "info"
  }
}

# 定期审查
cat .cursor/data/audit.log | grep ERROR
```

## ⚡ 性能优化

### 1. 上下文优化

```json
{
  "contextWindow": {
    "maxLines": 50, // 从 100 降到 50
    "includeImports": false, // 禁用不必要的包含
    "smartSelection": true // 智能选择上下文
  }
}
```

**效果**:

- 响应速度提升 2-3x
- token 使用减少 40-50%

### 2. 缓存策略

```json
{
  "performance": {
    "cacheEnabled": true,
    "cacheSize": "100MB",
    "cacheTTL": 3600 // 1小时过期
  }
}
```

### 3. 并发控制

```json
{
  "performance": {
    "maxConcurrentRequests": 2, // 限制并发
    "requestTimeout": 30000, // 30秒超时
    "retryAttempts": 3 // 失败重试 3 次
  }
}
```

## 🧪 测试建议

### 1. 配置测试

```bash
# 验证 JSON 语法
cat .cursor/config/editor.json | jq .

# 验证配置完整性
node -e "const config = require('./.cursor/config/editor.json'); console.log('Valid:', !!config.editor)"

# 运行验证
make cursor-validate
```

### 2. 集成测试

```typescript
// tests/cursor-config.test.ts
import { readFileSync } from 'fs';

describe('Cursor 配置', () => {
  it('应该有效的 JSON 格式', () => {
    const config = JSON.parse(readFileSync('.cursor/config/editor.json', 'utf-8'));
    expect(config).toBeDefined();
  });

  it('应该包含必需的配置项', () => {
    const config = JSON.parse(readFileSync('.cursor/config/editor.json', 'utf-8'));
    expect(config.editor).toBeDefined();
    expect(config.agent).toBeDefined();
  });
});
```

### 3. 回归测试

```bash
# 配置变更前
cp -r .cursor .cursor.backup

# 进行变更
vim .cursor/config/editor.json

# 测试
make test

# 如果失败，回滚
rm -rf .cursor
mv .cursor.backup .cursor
```

## 📚 文档维护

### 1. 同步更新

```bash
# 配置变更时
1. 修改配置文件
2. 更新 configuration.md
3. 更新 CHANGELOG.md
4. 提交所有变更
```

### 2. 示例代码

**文档中包含示例**:

```markdown
## 配置 GitHub 集成

\`\`\`json { "github": { "enabled": true, "autoLinkIssues": true } } \`\`\`

**效果**: Commit中的 #123 会自动链接到 Issue
```

### 3. 版本标记

```markdown
## v2.0.0 新增功能

- ✨ 模板系统
- ✨ 数据目录
- ✨ 专属文档

## v1.0.0 基础功能

- 角色系统
- 阶段管理
- 命令工具
```

## 🤝 团队协作

### 1. 配置共享

```bash
# 团队成员获取最新配置
git pull origin main

# 如有本地修改，解决冲突
git checkout --theirs .cursor/config/editor.json
```

### 2. 标准化流程

```markdown
## 团队工作流

1. 创建功能分支 \`\`\`bash git checkout -b feature/new-config \`\`\`

2. 修改配置 \`\`\`bash vim .cursor/config/editor.json \`\`\`

3. 验证配置 \`\`\`bash make cursor-validate \`\`\`

4. 提交变更 \`\`\`bash git add .cursor/ git commit -m "feat(config): 新增配置项" \`\`\`

5. 提交 PR \`\`\`bash git push origin feature/new-config \`\`\`
```

### 3. 代码审查

**审查清单**:

- [ ] JSON 语法正确
- [ ] 配置项有文档说明
- [ ] 无敏感信息泄露
- [ ] 测试通过
- [ ] CHANGELOG 已更新

## 📊 监控和度量

### 1. 使用统计

```bash
# 查看命令使用频率
grep "@role:" .cursor/data/sessions/* | sort | uniq -c | sort -nr

# 查看最常用的工具
grep "@tool:" .cursor/data/sessions/* | sort | uniq -c | sort -nr
```

### 2. 性能监控

```bash
# 响应时间
cat .cursor/data/metrics/response-time.log

# 错误率
cat .cursor/data/metrics/error-rate.log
```

### 3. 持续改进

```markdown
## 每月评审

1. 查看使用统计
2. 识别瓶颈
3. 优化配置
4. 更新文档
5. 团队培训
```

## 🎓 学习路径

### 新手 (0-1 周)

1. ✅ 阅读 [README](../README.md)
2. ✅ 完成 [设置指南](setup.md)
3. ✅ 尝试基本命令
4. ✅ 理解角色系统

### 进阶 (1-4 周)

1. ✅ 掌握所有角色
2. ✅ 熟悉阶段流程
3. ✅ 自定义配置
4. ✅ 使用工具命令

### 高级 (1-3 月)

1. ✅ 自定义角色/阶段
2. ✅ 优化性能
3. ✅ 集成第三方服务
4. ✅ 贡献最佳实践

## 📞 获取帮助

- 查看 [配置详解](configuration.md)
- 运行 `make help`
- 查看 [Issue 列表](https://github.com/your-org/repo/issues)
- 加入社区讨论

---

**最后更新**: 2025-10-02  
**维护者**: Dev Agent Team  
**反馈**: 欢迎提出改进建议
