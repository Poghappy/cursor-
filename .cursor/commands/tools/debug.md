# 调试问题 (Debug)

**工具目标**: 系统化地定位和解决技术问题。

## 调试流程

### 1. 问题重现

- [ ] 记录问题现象
- [ ] 确定重现步骤
- [ ] 识别影响范围
- [ ] 收集错误信息

### 2. 信息收集

- [ ] 查看错误日志
- [ ] 检查系统状态
- [ ] 查看相关代码
- [ ] 收集环境信息

### 3. 问题定位

- [ ] 分析错误堆栈
- [ ] 定位问题代码
- [ ] 识别根本原因
- [ ] 确认影响范围

### 4. 解决方案

- [ ] 设计修复方案
- [ ] 实施最小修复
- [ ] 编写测试用例
- [ ] 验证修复效果

### 5. 预防措施

- [ ] 添加错误处理
- [ ] 改进日志记录
- [ ] 补充测试用例
- [ ] 更新文档

## 常见问题分类

### 运行时错误

```typescript
// TypeError: Cannot read property 'x' of undefined
// 原因：对象未定义就访问属性
// 解决：添加空值检查
if (obj && obj.x) {
  // 使用 obj.x
}
```

### 逻辑错误

```typescript
// 错误：条件判断错误
if ((user.role = 'admin')) {
  // 应该是 === 而不是 =
  // ...
}

// 正确
if (user.role === 'admin') {
  // ...
}
```

### 性能问题

```typescript
// 问题：N+1 查询
users.forEach(user => {
  user.orders = await getOrders(user.id); // 每次都查询
});

// 优化：批量查询
const userIds = users.map(u => u.id);
const orders = await getOrdersByUserIds(userIds);
```

### 并发问题

```typescript
// 问题：竞态条件
let count = 0;
async function increment() {
  const temp = count;
  await delay(100);
  count = temp + 1; // 可能被覆盖
}

// 解决：使用锁或原子操作
```

### 内存泄漏

```typescript
// 问题：未清理的事件监听器
class Component {
  constructor() {
    window.addEventListener('resize', this.onResize);
  }
  // 缺少清理代码
}

// 解决：添加清理
class Component {
  constructor() {
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
  }
}
```

## 调试工具

### 日志调试

```typescript
console.log('变量值:', variable);
console.error('错误信息:', error);
console.trace('调用栈');

// 使用 Winston 等日志库
logger.debug('调试信息', { context });
logger.error('错误信息', { error });
```

### 断点调试

```typescript
// 在代码中设置断点
debugger;

// 使用 IDE 断点
// - VS Code: F9 设置断点
// - Chrome DevTools: 点击行号
```

### 性能分析

```typescript
// 性能计时
console.time('operation');
// ... 执行操作
console.timeEnd('operation');

// 使用性能分析工具
// - Chrome DevTools Performance
// - Node.js --prof
```

### 网络调试

```bash
# 查看网络请求
curl -v https://api.example.com/endpoint

# 使用代理工具
# - Charles
# - Fiddler
# - Postman
```

## 调试技巧

### 二分法定位

1. 注释掉一半代码
2. 运行测试
3. 根据结果缩小范围
4. 重复直到找到问题代码

### 对比法

1. 对比正常和异常的差异
2. 对比不同环境的表现
3. 对比代码变更前后

### 日志追踪

1. 在关键位置添加日志
2. 追踪数据流向
3. 识别异常点

### 隔离测试

1. 创建最小复现用例
2. 排除无关因素
3. 聚焦核心问题

## 调试清单

- [ ] 问题已明确重现
- [ ] 错误日志已收集
- [ ] 问题代码已定位
- [ ] 根本原因已识别
- [ ] 修复方案已验证
- [ ] 测试用例已补充
- [ ] 文档已更新

## 调试报告模板

```markdown
## 问题描述

[问题现象和影响]

## 重现步骤

1. 步骤1
2. 步骤2

## 根本原因

[问题的根本原因分析]

## 解决方案

[实施的修复方案]

## 验证结果

- [ ] 问题已修复
- [ ] 测试通过
- [ ] 无副作用

## 预防措施

[避免类似问题的措施]
```

---

**参考**: 项目中的日志配置和错误处理机制
