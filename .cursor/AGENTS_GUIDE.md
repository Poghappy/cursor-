# 项目 Agent 指南（AGENTS.md）

## 工作方式（简）

- 回复风格：简洁、结构化，优先给出可复制步骤/命令/清单
- 代码规范：TypeScript 优先；遵循 ESLint/Prettier 与现有目录结构
- 变更约束：单次 ≤ {MAX_FILES} 文件、单文件 ≤ {MAX_LINES} 行；必须给出"文件树 Diff"
- 质量门禁：`{LINT_CMD}`、`{TEST_CMD}` 必须通过；必要时提供 `{COVERAGE_CMD}` 摘要
- 提交约定：Conventional Commits；变更需更新相关文档

## 协作要点

- 阶段推进：用户故事 → PRD → 任务分解 → 技术设计 → 最小实现 → 测试 → 发布
- 交接格式：使用 `.cursor/rules/handover_schema.md` 的统一 JSON（含 next_role）
- 外部依赖：优先适配层/Mock；避免长链路不可控副作用
- 故障处理：最短必要日志 → 定位根因 → 最小修复 → 复测

## 常用入口

- 规则目录：`.cursor/rules/`
- 阶段模板：`prompts/stages/*`
- 指南/参考：`docs/CURSOR_GUIDE_2025-09-30.md`、`docs/REFERENCE_REPOS.md`

## 约束占位符（请在项目接入时统一赋值）

- `{MAX_FILES}`、`{MAX_LINES}`、`{LINT_CMD}`、`{TEST_CMD}`、`{COVERAGE_CMD}`
