# 项目基础设施使用指南

本文档说明项目中所有关键设施的使用方法和最佳实践。

## 📦 依赖管理

### 安装依赖

```bash
# 首次安装（会自动初始化 Husky）
npm install

# 或使用快速启动
npm run quick-start
```

### 更新依赖

```bash
# 检查过期依赖
npm run outdated

# 更新依赖
npm run update

# 安全审计
npm run audit
npm run audit:fix
```

## 🎣 Git Hooks（Husky）

项目配置了以下 Git hooks：

### Pre-commit（提交前）

- 自动运行 `lint-staged`
- 对暂存的文件执行 ESLint 和 Prettier
- 确保提交的代码符合规范

### Commit-msg（提交信息验证）

- 验证提交信息符合 Conventional Commits 规范
- 格式：`<type>(<scope>): <subject>`
- 支持的类型：
  - `feat`: 新功能
  - `fix`: 修复 Bug
  - `docs`: 文档变更
  - `style`: 代码格式调整
  - `refactor`: 重构
  - `perf`: 性能优化
  - `test`: 测试相关
  - `chore`: 构建/工具变更
  - `ci`: CI 配置变更

**示例提交信息**：

```bash
git commit -m "feat(auth): add JWT authentication"
git commit -m "fix(api): resolve null pointer exception"
git commit -m "docs: update README with setup instructions"
```

### Pre-push（推送前）

- 运行完整测试套件
- 验证构建成功
- 确保推送的代码质量

## 📝 代码规范

### ESLint

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix
```

### Prettier

```bash
# 格式化代码
npm run format
```

### Lint-staged

自动在 Git commit 时运行，配置在 `package.json`：

```json
"lint-staged": {
  "*.ts": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

## 🧪 测试

### 运行测试

```bash
# 所有测试
npm test

# 单元测试
npm run test:unit

# 集成测试
npm run test:integration

# E2E 测试
npm run test:e2e

# 覆盖率报告
npm run test:coverage

# 监听模式
npm run test:watch
```

### 覆盖率要求

- 分支覆盖率：80%
- 函数覆盖率：80%
- 行覆盖率：80%
- 语句覆盖率：80%

## 🔧 环境配置

### 环境变量

1. 复制模板文件：

```bash
cp .env.example .env
```

2. 填写必需的环境变量：

- `PORT`: 服务器端口（默认 3000）
- `DATABASE_URL`: PostgreSQL 连接字符串
- `REDIS_URL`: Redis 连接字符串
- `JWT_SECRET`: JWT 密钥（生产环境必须修改）

### Node 版本管理

项目使用 `.nvmrc` 指定 Node.js 版本：

```bash
# 使用 nvm 切换到项目版本
nvm use

# 或安装指定版本
nvm install
```

要求：Node.js >= 18.0.0

## 🏗️ 构建和部署

### 本地构建

```bash
# 清理并构建
npm run clean
npm run build

# 快速构建（包含测试）
npm run quick-build

# 完整流程
npm run full-cycle
```

### 部署

```bash
# 开发环境
npm run deploy:dev

# 预发布环境
npm run deploy:staging

# 生产环境
npm run deploy:prod
```

## 🚀 CI/CD

### GitHub Actions

项目配置了两个工作流：

#### CI 工作流 (`.github/workflows/ci.yml`)

触发条件：Push 或 PR 到 main/develop 分支

执行步骤：

1. **代码检查**：ESLint + Prettier
2. **测试**：单元测试 + 集成测试 + 覆盖率
3. **构建**：TypeScript 编译
4. **安全检查**：npm audit

#### CD 工作流 (`.github/workflows/cd.yml`)

触发条件：

- Push 到 develop：部署到开发环境
- Push 到 main：部署到预发布环境
- 推送 tag（v\*）：部署到生产环境

## 📐 编辑器配置

### EditorConfig

`.editorconfig` 确保团队使用统一的编辑器设置：

- 字符集：UTF-8
- 换行符：LF
- 缩进：2 空格
- 文件末尾：插入空行
- 行尾空格：自动删除

### VSCode 推荐设置

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## 🔍 常见问题

### Husky hooks 未生效

```bash
# 重新安装 Husky
npm run prepare
```

### 提交信息格式错误

确保使用 Conventional Commits 格式：

```bash
# ❌ 错误
git commit -m "updated readme"

# ✅ 正确
git commit -m "docs: update README with new features"
```

### 测试覆盖率不足

```bash
# 查看详细覆盖率报告
npm run test:coverage
open coverage/index.html
```

### 依赖安全警告

```bash
# 自动修复
npm audit fix

# 强制修复（可能破坏兼容性）
npm audit fix --force
```

## 📚 相关文档

- [TypeScript 配置](../tsconfig.json)
- [ESLint 规则](./.eslintrc.json)
- [Prettier 配置](./.prettierrc)
- [Commitlint 规则](../commitlint.config.js)
- [项目指南](./QUICK_START_TEMPLATE.md)

## 🎯 快速检查清单

开发前检查：

- [ ] 已安装依赖：`npm install`
- [ ] 已配置环境变量：复制并填写 `.env`
- [ ] Node 版本正确：`node -v` >= 18.0.0
- [ ] Git hooks 已启用：`.husky/` 目录存在

提交前检查：

- [ ] 代码通过 lint：`npm run lint`
- [ ] 格式正确：`npm run format`
- [ ] 测试通过：`npm test`
- [ ] 构建成功：`npm run build`

推送前检查：

- [ ] 所有测试通过
- [ ] 覆盖率达标（80%）
- [ ] 提交信息符合规范
- [ ] 无安全漏洞：`npm audit`

## 💡 最佳实践

1. **小步提交**：每次提交只做一件事
2. **清晰的提交信息**：使用 Conventional Commits
3. **测试先行**：新功能先写测试
4. **代码审查**：所有 PR 需要审查
5. **定期更新**：及时更新依赖
6. **安全意识**：不要提交敏感信息
7. **文档同步**：代码变更同步更新文档

## 🆘 获取帮助

- 查看 [CONTRIBUTING.md](../CONTRIBUTING.md)
- 查看 [Makefile](../Makefile) 了解更多命令
- 查看 [scripts/README.md](../scripts/README.md) 了解自动化脚本
