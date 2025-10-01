# Cursor 多角色 Agent 团队模板

一套可在 Cursor IDE 中直接运行的"多角色 Agent 团队（PO/PM/BA/PjM/Arch/LLME/DEV/QA/Ops/TW）"0→1 自主交付模板。

## 快速开始
```bash
# 克隆并进入
git clone https://github.com/Poghappy/cursor-.git
cd cursor-

# 准备环境
cp .env.example .env
make setup        # 仅示例：创建目录/复制 .env 等

# 开发与质量
make dev          # 本地开发
make lint         # 代码规范
make test         # 测试
make coverage     # 覆盖率
```

## 目录结构
```
.
├─ docs/                  # BRIEF/PRD/TASKS/TECH_DESIGN/TEST_PLAN/CHANGELOG
├─ prompts/
│  ├─ system.md          # 总控 System Prompt
│  ├─ roles/             # 角色系统提示（po/pm/ba/pjm/arch/llme/dev/qa/ops/tw）
│  └─ stages/            # 分阶段模板（user_story/prd/task_breakdown/...）
├─ .cursor/
│  └─ rules/             # 函数式规则、交接 schema、权限矩阵
├─ src/                  # 最小实现（按需生成）
├─ tests/                # 单测/契约/e2e（按需生成）
├─ Makefile              # 一键质量与运维命令
├─ package.json          # 脚本/依赖
└─ tsconfig.json
```

## 工作方式（概览）
- 多角色通过 `prompts/roles/*` 各司其职，阶段流经 `prompts/stages/*`。
- 规则在 `.cursor/rules/*` 定义：
  - `agent_functions.md`: 可调用函数与输入/输出/约束
  - `handover_schema.md`: 统一交接 JSON Schema
  - `role_permissions.md`: 角色权限与改动限制
- 守护与基线：`prompts/roles/_guardrails.md`。

## 自定义占位符
- `{PROJECT_NAME}` `{LINT_CMD}` `{TEST_CMD}` `{COVERAGE_CMD}` `{MAX_FILES}` `{MAX_LINES}` 参见 Makefile/规则与文档模板。

## 约定
- Conventional Commits
- 先测后码；最小可用实现；文件树 Diff 必须可读
- 不写入密钥，仅维护 `.env.example` 与说明

## 许可证
MIT
