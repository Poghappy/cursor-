# 智能代码生成器模板

## 核心功能

- 代码模板生成
- 类型安全
- 最佳实践
- 自动文档

## 集成到 Dev 角色

```javascript
class DeveloperTools {
  async generateCode(type, name, template) {
    // 集成智能代码生成器的核心算法
    return this.createCodeTemplate(type, name, template);
  }
}
```

## 使用示例

```bash
node scripts/agent/roles/developer-tools.js generate --type=service --name=UserService --template=crud
```
