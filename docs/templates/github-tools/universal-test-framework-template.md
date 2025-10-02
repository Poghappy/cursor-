# 通用测试框架模板

## 核心功能

- 测试用例生成
- 覆盖率分析
- 自动化测试
- 质量门禁

## 集成到 QA 角色

```javascript
class TestManager {
  async generateTests(source, framework) {
    // 集成通用测试框架的核心算法
    return this.createTestSuite(source, framework);
  }
}
```

## 使用示例

```bash
node scripts/agent/roles/test-manager.js generate --type=unit --framework=jest --source=src/**/*.ts
```
