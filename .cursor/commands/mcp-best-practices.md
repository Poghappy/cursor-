# MCP 工具调用最佳实践

## 核心原则

### 1. 工具选择策略(Tool Loadout)

- **少即是多**: 不要同时启用过多工具(建议≤40个)
- **按需激活**: 根据具体任务选择性启用相关工具
- **避免工具泛滥**: 过多工具会导致LLM混淆、token浪费

### 2. 显式指导原则

```markdown
❌ 不好: "帮我分析这个数据" ✅ 好的:
"使用Firecrawl抓取网站数据,然后用Python分析,最后用Excel生成报表"
```

### 3. 系统提示集成

在常用场景下,在系统提示中包含工具使用指南:

```
当需要执行计算时,始终使用 run_python_code 工具。
使用 Context7 前,先调用 resolve-library-id,再调用 get-library-docs 获取文档。
```

## MCP 工作流模式

### 顺序编排(Sequential Orchestration)

```
步骤A完成 → 触发步骤B → 触发步骤C
示例: 抓取网页 → 提取数据 → 分析 → 生成报告
```

### 并行处理(Parallel Processing)

```
主任务 → 并行执行多个子任务 → 汇总结果
示例: 同时查询多个数据源 → 合并分析
```

### 条件分支(Conditional Branching)

```
分析数据 → 根据条件选择不同路径
示例:
if 企业客户 → 企业流程
elif 中型客户 → 标准流程
else → 简化流程
```

### 反馈循环(Feedback Loops)

```
执行 → 监控 → 分析 → 优化 → 执行
创建复合智能,每次迭代都变得更聪明
```

## 工具使用指南

### 直接工具指定

```
明确告诉AI使用哪个工具:
"使用 Browserbase 截取网站截图"
"用 Firecrawl 抓取文档"
```

### 条件工具使用

```
提供决策树:
"如果是CSV文件,用 read_csv
 如果是JSON,用 parse_json
 如果都不是,用 read_file 并询问我"
```

### 工具序列

```
概述预期的工具顺序:
"首先用 web_search 查找文章
 然后用 fetch_url 获取完整内容
 最后用 summarize_text 创建摘要"
```

### 后备策略

```
定义工具失败时的操作:
"如果 api_call 返回错误,
 用 log_error 记录
 然后尝试 alternative_api"
```

## 并行工具调用优化

### 最大化并行效率

```markdown
如果要调用多个工具且它们之间没有依赖关系, 并行执行所有独立的工具调用。优先并行调用工具,而不是顺序调用。

例如: 读取3个文件时,并行运行3个工具调用
```

### 避免并行的情况

```markdown
如果某些工具调用依赖于前面调用的结果(如参数), 不要并行调用这些工具,而是顺序调用。绝不使用占位符或猜测工具调用中的缺失参数。
```

## 工具审批机制

### 默认行为

- Agent使用MCP工具前会请求批准
- 可以展开查看工具调用的参数

### 自动运行(Yolo模式)

- 启用后Agent可自动执行工具,无需每次批准
- 适合可信任的工作流

## 错误处理

### 清晰的成功/失败标准

```json
{
  "workflow_step": {
    "success_criteria": ["intent_confidence > 0.8", "customer_id_found"],
    "failure_escalation": "human_review_queue"
  }
}
```

### 结构化输入输出

- 每个步骤产生机器可读的输出(JSON,非散文)
- 定义明确的交接协议
- 创建异常升级路径

## 角色特定工具推荐

### 产品类角色(PO/PM/BA)

- **文档管理**: Notion, Google Drive, Figma
- **搜索工具**: Brave Search, DuckDuckGo, Tavily
- **协作工具**: Linear, Slack, Atlassian

### 技术类角色(Dev/Arch/QA/Ops)

- **代码工具**: GitHub, Filesystem, Excel
- **浏览器自动化**: Browserbase, Playwright, Puppeteer
- **数据工具**: PostgreSQL, DuckDB, Redis
- **云服务**: AWS, GCP, Cloudflare, Kubernetes

### 支持类角色(TW/PJM/LLME)

- **文档工具**: Pandoc, Markdownify, Obsidian
- **转换工具**: Mindmap, Magic MCP
- **平台工具**: Context7, FastMCP

## 性能优化

1. **减少工具切换**: 通过合理的工具组合减少上下文切换
2. **批量操作**: 使用并行调用处理多个相似任务
3. **缓存策略**: 利用工具的缓存能力避免重复请求
4. **监控指标**: 跟踪工具使用效率和成功率

## 安全考虑

1. **最小权限原则**: 只授予必要的工具访问权限
2. **审计日志**: 记录所有工具调用和结果
3. **敏感数据**: 使用环境变量管理API密钥
4. **人工审查**: 对关键操作保留人工审批步骤

## 参考资源

- MCP官方文档: https://modelcontextprotocol.io/
- Anthropic MCP指南: https://www.anthropic.com/news/model-context-protocol
- Cursor MCP目录: https://cursor.com/docs/context/mcp/directory
- Claude 4最佳实践:
  https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices
