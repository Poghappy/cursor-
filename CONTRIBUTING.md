# 贡献指南

## 分支与提交

- 分支：`feature/*` `fix/*` `docs/*` `chore/*`
- 提交：遵循 Conventional Commits，例如：
  - `feat(auth): add JWT middleware`
  - `fix(api): handle 400 on invalid email`
  - `docs(readme): update quick start`

## PR 检查清单

- [ ] 变更范围在角色权限内（见 `.cursor/rules/role_permissions.md`）
- [ ] 最多改动 ≤ {MAX_FILES} 文件、单文件 ≤ {MAX_LINES} 行
- [ ] 提供"文件树 Diff"概要
- [ ] 通过 `{LINT_CMD}` `{TEST_CMD}` 且附覆盖率摘要 `{COVERAGE_CMD}`
- [ ] 更新相关文档（`docs/*`、`README`、`CHANGELOG` 如适用）

## 质量基线

- ESLint + Prettier：零错误
- Jest：单测/契约/e2e 覆盖关键路径；全局覆盖率 ≥ 80%
- 安全：不提交密钥/令牌/私钥，仅维护 `.env.example`

## 故障处理最小流程

- 贴最短必要日志
- 快速定位根因 → 最小修复 → 复测
- 记录影响面与回滚路径
