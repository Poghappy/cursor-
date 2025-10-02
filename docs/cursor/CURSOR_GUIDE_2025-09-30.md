# Cursor 实战指南（含 MCP 与规则）— 2025-09-30

> 整理自 Cursor 官方文档与社区实践，聚焦团队可落地的方法与清单。

## 官方文档导航
- **总览**: [Cursor Docs](https://docs.cursor.sh/)
- **Agent 概览**: [Agent Overview](https://cursor.com/docs/agent/overview)
- **规则 Rules**: [Project/User/Team/AGENTS.md](https://cursor.com/docs/context/rules)
- **MCP 协议**: [Model Context Protocol](https://cursor.com/docs/context/mcp)
- **更新日志**: [Changelog](https://changelog.cursor.sh/)

## 关键能力速览
- **Agent 模式**: Chat/Agent/自定义模式；支持终端集成、自动运行、Diff 审阅、检查点回滚。
- **规则系统**: `.cursor/rules`（项目级 MDC）、User Rules（全局）、Team Rules（组织级）、`AGENTS.md`（简版）。
- **上下文增强**: 代码库索引、@ 符号、Memories、Ignore files。
- **MCP 集成**: 以 stdio/SSE/Streamable HTTP 连接外部系统为“工具/资源/提示”，可一键安装或用 `mcp.json` 配置。

## MCP 实操要点
1) 配置位置
   - 项目级：`.cursor/mcp.json`
   - 全局级：`~/.cursor/mcp.json`
2) 传输方式
   - `stdio`（本地命令）、`SSE`、`Streamable HTTP`（远端服务）
3) 能力映射
   - Tools（可调用函数）/Resources（结构化资源）/Prompts（可复用提示）/Roots（边界）/Elicitation（补充提问）
4) 安全与鉴权
   - 环境变量/OAuth；仅安装可信服务；最小权限；必要时审计源码。
5) Chat 中使用
   - 工具启停、审批/自动运行、参数/响应可视化；可返回图片等非文本内容。

## 规则（Rules）最佳实践
- 结构化：MDC 文件，按目录分层（嵌套 `.cursor/rules` 自动关联所处目录）。
- 控制范围：Always / Auto Attached / Agent Requested / Manual（通过 `@ruleName` 显式引用）。
- 编写原则：
  - 聚焦、可执行、≤ 500 行；大规则切分组合
  - 给出具体示例或引用文件
  - 少用空泛描述，像内部规范文档一样明确
- 团队级规则：在 Dashboard 统一配置与强制执行；与项目/用户规则并行，具有优先级。
- 迁移提示：`.cursorrules` 兼容但将被弃用，建议迁移至项目规则或 `AGENTS.md`。

## 社区经验（汇总）
- 来源：
  - [Cursor Best Practices（digitalchild）](https://github.com/digitalchild/cursor-best-practices)
  - 高质量博客与教程（如 Builder.io、Medium）
- 要点：
  - 把“规则”当作复用的 Prompt 组件，按职责域拆分，按场景挂载
  - 在对话中用“/Generate Cursor Rules”沉淀决策到永久规则
  - 以“最小可用 + 可验证”驱动：每轮输出 lint/test/cov、文件树 Diff、失败最小必要日志
  - 明确规则优先级与触发方式，避免全局规则过载
  - 给 Agent 明确“工具箱”：语义检索、终端、文件编辑等，减少自由度带来的偏差

## 快速清单（可直接落地）
- 规则落地
  - [ ] 在 `.cursor/rules/` 建立分层规则（项目/子模块）
  - [ ] 编写 `AGENTS.md`（简洁指令）
  - [ ] 团队统一 Team Rules（必要时强制）
- MCP 配置
  - [ ] 项目或全局 `mcp.json` 配置核心工具（如文档、Issue、CMDB）
  - [ ] 以环境变量/OAuth 管理密钥，不落库
  - [ ] 在 Chat 中开启所需工具并设定 Auto-run 策略
- 交付规范
  - [ ] 每轮产出：✅ lint / ✅ test / ⏳ cov / ⚠️ 风险 / ▶ 下一步
  - [ ] 提交遵循 Conventional Commits
  - [ ] 变更附“文件树 Diff”与影响面

## 进阶建议
- 自建 MCP Server（stdio/HTTP）：把内部系统（知识库/需求/流水线）接入到 Cursor 工具层
- 结合“阶段模板”：将用户故事→PRD→任务→技术方案→最小实现→测试→迭代发布，制成可复制流水线
- 评测与回放：保存对话与规则版本，构建团队内部的最佳实践库

## 参考链接
- 官方：
  - [Cursor Docs](https://docs.cursor.sh/)
  - [Agent Overview](https://cursor.com/docs/agent/overview)
  - [Rules](https://cursor.com/docs/context/rules)
  - [MCP](https://cursor.com/docs/context/mcp)
  - [Changelog](https://changelog.cursor.sh/)
- 社区：
  - [Cursor Best Practices（GitHub）](https://github.com/digitalchild/cursor-best-practices)
  - [Builder.io: Cursor Tips](https://www.builder.io/blog/cursor-tips)
