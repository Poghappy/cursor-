# 生成 Commit 信息 (Commit Message)

**工具目标**: 生成符合 Conventional Commits 规范的提交信息。

## Conventional Commits 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Type 类型

- **feat**: 新功能
- **fix**: 修复 bug
- **docs**: 文档变更
- **style**: 代码格式（不影响功能）
- **refactor**: 重构（既不是新功能也不是修复）
- **perf**: 性能优化
- **test**: 测试相关
- **build**: 构建系统或依赖变更
- **ci**: CI 配置变更
- **chore**: 其他变更（工具、配置等）

## Scope 范围（可选）

- **auth**: 认证模块
- **user**: 用户模块
- **api**: API 接口
- **db**: 数据库
- **config**: 配置
- **deps**: 依赖

## Subject 主题

- 使用祈使句（如 "add" 而非 "added"）
- 不超过 50 字符
- 首字母小写
- 结尾不加句号

## Body 正文（可选）

- 详细说明变更内容
- 说明变更原因和影响
- 每行不超过 72 字符

## Footer 脚注（可选）

- **BREAKING CHANGE**: 破坏性变更
- **Closes**: 关闭的 issue

## 示例

### 新功能

```
feat(auth): add user registration endpoint

Implement user registration with email validation
- Add AuthService.register method
- Add input validation using Joi
- Add unique email constraint
- Add password hashing with bcrypt

Closes #123
```

### 修复 bug

```
fix(auth): resolve JWT token expiration issue

Fix token expiration time calculation error
that caused tokens to expire immediately

Closes #456
```

### 破坏性变更

```
feat(api): change authentication endpoint structure

BREAKING CHANGE: authentication endpoints moved from /auth/* to /api/auth/*

Migration guide:
- Update API calls from POST /auth/login to POST /api/auth/login
- Update API calls from POST /auth/register to POST /api/auth/register
```

## 使用方式

1. **分析变更内容**

   ```bash
   git status
   git diff
   ```

2. **确定 type 和 scope**
   - 识别变更类型
   - 确定影响模块

3. **编写 commit 信息**
   - 简洁的主题行
   - 详细的正文说明
   - 必要的脚注信息

4. **提交代码**
   ```bash
   git add .
   git commit -m "type(scope): subject" -m "body" -m "footer"
   ```

## 质量检查

- [ ] type 类型正确
- [ ] subject 清晰简洁
- [ ] body 说明充分（如需要）
- [ ] 破坏性变更已标注（如有）
- [ ] 关联 issue 已关闭（如有）

---

**参考**: `.cursor/rules/code-style.md`
