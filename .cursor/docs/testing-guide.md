# Cursor IDE 测试指南

完整的测试清单，用于验证 `.cursor/` 目录优化后的所有功能。

## 🎯 测试目标

验证以下功能正常工作：

- ✅ 配置文件正确加载
- ✅ 规则生效
- ✅ 命令系统工作
- ✅ 符号链接正常
- ✅ Agent 功能正常

---

## 📋 快速测试清单（5 分钟）

如果时间有限，执行这些核心测试：

### 1. 基础验证（1 分钟）

```bash
make cursor-validate
ls -la AGENTS.md .cursorrules
```

**检查项**:

- [ ] 目录结构正确
- [ ] 符号链接正常

### 2. 配置检查（1 分钟）

```bash
cat .cursor/config/editor.json | jq .
cat .cursor/config/rules.md | head -20
```

**检查项**:

- [ ] JSON 语法正确
- [ ] 规则文件可读

### 3. Cursor IDE 测试（3 分钟）

**在 Cursor IDE 中**:

1. 打开任意 `.ts` 文件
2. 按 `Cmd/Ctrl + K`
3. 输入: "帮我创建一个新服务"
4. 观察建议是否符合规范

**检查项**:

- [ ] AI 建议位置正确（`src/services/`）
- [ ] 代码风格符合规范
- [ ] 使用 TypeScript 严格模式

### 4. Git Hook 快速测试（1 分钟）

```bash
# 创建测试提交
echo "// test" >> src/app.ts
git add src/app.ts
git commit -m "test: quick verification"

# 撤销测试
git reset HEAD~1
git checkout src/app.ts
```

**检查项**:

- [ ] Pre-commit hook 运行
- [ ] Lint 检查执行
- [ ] Commitlint 验证

---

## 📋 完整测试清单（30 分钟）

### 阶段 1: 基础验证（5 分钟）

#### 1.1 目录和文件检查

```bash
make cursor-validate
make cursor-stats
```

**预期结果**:

- 文件数: 57
- 目录数: 21
- 总大小: ~360KB

#### 1.2 符号链接验证

```bash
ls -la AGENTS.md .cursorrules
readlink AGENTS.md
readlink .cursorrules
```

**预期结果**:

```
AGENTS.md -> .cursor/AGENTS_GUIDE.md
.cursorrules -> .cursor/config/rules.md
```

#### 1.3 配置文件语法

```bash
cat .cursor/config/editor.json | jq .
cat .cursor/config/integrations.json | jq .
```

**检查项**:

- [ ] JSON 格式正确
- [ ] 无语法错误

---

### 阶段 2: Cursor IDE 功能（10 分钟）

#### 2.1 规则加载测试

**测试步骤**:

1. 打开 Cursor IDE
2. 打开 `src/app.ts`
3. 触发 AI（Cmd/Ctrl + K）
4. 输入："帮我创建一个新的用户服务"

**预期行为**:

- 建议在 `src/services/` 创建
- 使用 TypeScript 严格模式
- 代码风格符合 ESLint 规范

**检查项**:

- [ ] 文件位置建议正确
- [ ] 代码风格符合规范
- [ ] 类型定义完整

#### 2.2 自动补全测试

**测试步骤**:

1. 在编辑器中输入 `@`
2. 观察补全建议

**预期行为**:

- 显示角色：`@role:dev`, `@role:qa`, `@role:pm` 等
- 显示工具：`@tool:analyze`, `@tool:commit` 等
- 显示阶段：`@stage:implementation` 等

**检查项**:

- [ ] `@` 触发补全
- [ ] 建议列表显示
- [ ] 建议内容正确

#### 2.3 命令系统测试

**测试角色命令**:

```
在 Cursor 聊天中：
@role:dev 帮我分析这个文件的代码质量
```

**预期**:

- Agent 以 Developer 角色响应
- 提供专业的代码分析

**测试工具命令**:

```
@tool:analyze src/app.ts
```

**预期**:

- 分析文件结构
- 提供改进建议

**检查项**:

- [ ] 角色命令响应正确
- [ ] 工具命令执行成功
- [ ] 建议质量良好

#### 2.4 内联聊天测试

**测试步骤**:

1. 选中一段代码
2. 按 `Cmd/Ctrl + K`
3. 输入："优化这段代码"

**预期行为**:

- 内联聊天弹出
- 提供优化建议
- `Tab` 接受，`Esc` 拒绝

**检查项**:

- [ ] 内联聊天工作
- [ ] 快捷键正常
- [ ] 建议可应用

---

### 阶段 3: Git 集成测试（8 分钟）

#### 3.1 Pre-commit Hook

```bash
# 创建有 lint 错误的代码
echo "var x=1" >> src/app.ts
git add src/app.ts
git commit -m "test: verify hooks"
```

**预期**:

- Lint-staged 运行
- ESLint 检查
- Prettier 格式化
- 如有错误，提交被阻止

**检查项**:

- [ ] Hook 自动运行
- [ ] Lint 检查执行
- [ ] 格式化执行

#### 3.2 Commit-msg Hook

```bash
# 测试错误格式
git commit -m "updated code"
```

**预期**:

- 提交被拒绝
- 显示错误信息：type may not be empty

```bash
# 测试正确格式
git commit -m "test: verify commit message format"
```

**预期**:

- 提交成功

**检查项**:

- [ ] 错误格式被拒绝
- [ ] 正确格式通过
- [ ] 错误信息清晰

#### 3.3 Pre-push Hook

```bash
# 尝试推送（如果有远程）
git push origin main
```

**预期**:

- 运行测试套件
- 运行构建检查
- 全部通过后允许推送

**检查项**:

- [ ] 测试自动运行
- [ ] 构建检查执行
- [ ] Hook 正常工作

---

### 阶段 4: 性能测试（5 分钟）

#### 4.1 响应速度

**测试**:

- 打开大文件（>500 行）
- 触发 AI 建议
- 记录响应时间

**目标**: < 3 秒

**检查项**:

- [ ] 响应时间可接受
- [ ] 建议质量良好
- [ ] 无明显卡顿

#### 4.2 上下文理解

**测试**:

- 在多个文件间跳转
- 触发建议
- 观察上下文理解

**检查项**:

- [ ] 理解当前位置
- [ ] 建议相关性高
- [ ] Import 建议正确

---

### 阶段 5: 高级功能（可选，5 分钟）

#### 5.1 模板系统

```
@template:feature_development 创建认证功能
```

**检查项**:

- [ ] 模板加载
- [ ] 任务清单生成
- [ ] 步骤完整

#### 5.2 交接功能

```
@tool:handover --from dev --to qa
```

**检查项**:

- [ ] 交接文档生成
- [ ] 文件保存正确
- [ ] 内容完整

#### 5.3 数据管理

```bash
ls -la .cursor/data/sessions/
ls -la .cursor/data/handovers/
```

**检查项**:

- [ ] 会话数据记录
- [ ] 交接记录保存
- [ ] 权限正确

---

## 🐛 常见问题排查

### 问题 1: 规则未生效

**症状**: AI 建议不符合规则

**解决**:

```bash
# 1. 检查配置
cat .cursor/config/rules.md

# 2. 验证符号链接
ls -la .cursorrules

# 3. 重启 Cursor IDE

# 4. 清除缓存
rm -rf .cursor/data/cache/*
```

### 问题 2: 命令不工作

**症状**: `@role:` 命令无响应

**解决**:

```bash
# 1. 验证目录
ls -la .cursor/commands/

# 2. 检查链接
ls -la .cursor/commands/roles

# 3. 验证配置
cat .cursor/config/editor.json | jq '.agent'
```

### 问题 3: Git Hooks 不运行

**症状**: 提交时 hooks 未执行

**解决**:

```bash
# 1. 检查 Husky
ls -la .husky/

# 2. 重新安装
npm run prepare

# 3. 验证权限
chmod +x .husky/*
```

---

## 📊 测试报告

完成测试后，使用 `.cursor/TEST_REPORT_TEMPLATE.md` 填写报告。

**关键指标**:

- 功能完整性: \_\_\_ / 10
- 性能表现: \_\_\_ / 10
- 稳定性: \_\_\_ / 10
- 易用性: \_\_\_ / 10
- **综合评分**: \_\_\_ / 10

---

## ✅ 测试通过标准

**最低要求**:

- [ ] 所有基础验证通过
- [ ] 核心功能正常工作
- [ ] Git Hooks 正常运行
- [ ] 无严重性能问题
- [ ] 综合评分 ≥ 7/10

**推荐标准**:

- [ ] 所有功能测试通过
- [ ] 性能表现良好
- [ ] 用户体验优秀
- [ ] 综合评分 ≥ 8.5/10

---

## 📚 相关文档

- [设置指南](setup.md)
- [配置详解](configuration.md)
- [最佳实践](best-practices.md)
- [主 README](../README.md)

---

**最后更新**: 2025-10-02  
**维护者**: Dev Agent Team  
**版本**: 2.0.0
