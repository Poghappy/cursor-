# 提示工程工具包模板

## 核心功能

- 提示词优化
- 上下文管理
- 输出格式化
- 错误处理

## 集成到 LLME 角色

```javascript
class LLMEngineer {
  async optimizePrompt(prompt, context) {
    // 集成提示工程工具包的核心算法
    return this.enhancePrompt(prompt, context);
  }
}
```

## 使用示例

```bash
node scripts/agent/roles/llm-engineer.js optimize --prompt="生成用户服务" --context="微服务架构"
```
