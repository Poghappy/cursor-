# 参考仓库清单与评分标准（Cursor 生态）

> 目标：选择“热门且可复用”的规则/模板/工作流仓库，支撑本项目长期演进。

## 入围清单（初版）

- PatrickJS/awesome-cursorrules
  - 链接：https://github.com/PatrickJS/awesome-cursorrules
  - 特点：社区维护的 .cursorrules/MDC 规则索引与资源导航
- digitalchild/cursor-best-practices
  - 链接：https://github.com/digitalchild/cursor-best-practices
  - 特点：规则分层与优先级、AGENTS.md 与上下文组织的系统总结
- sangampandey/cursor-templates
  - 链接：https://github.com/sangampandey/cursor-templates
  - 特点：以模板方式组织 .cursorrules/项目脚手架
- aiurda/cursor10x
  - 链接：https://github.com/aiurda/cursor10x
  - 特点：增强 Agent 能力与持久化记忆的实践
- DVC2/cursor_prompts
  - 链接：https://github.com/DVC2/cursor_prompts
  - 特点：进阶规则与提示集合，可摘取片段复用

（可选扩展）

- cursor.directory（聚合站）：https://cursor.directory/

## 评分标准（建议权重）

- 活跃度（30%）：stars、近 90 天提交与 issue 响应
- 覆盖范围（25%）：是否覆盖 Rules/MCP/模板/CI/安全/发布
- 可复制性（20%）：目录脚手架、脚本、示例的完整度
- 质量信号（15%）：lint/test/coverage、示例质量、文档深度
- 许可证与风险（10%）：许可证友好、内容安全（无敏感泄露）

## 本项目采纳策略

- 以“可复制、可维护”为首要：先小范围摘取规则片段与脚本
- 对入围规则进行最小化改造与注释，纳入 `.cursor/rules/` 与 `AGENTS.md`
- 通过 CHANGELOG 标注来源与变更，定期复审更新
