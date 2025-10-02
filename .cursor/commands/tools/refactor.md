# 代码重构 (Refactor)

**工具目标**: 系统化地改进代码结构和质量,而不改变外部行为。

## 重构原则

### 1. 重构时机

- [ ] 代码重复 (DRY 原则)
- [ ] 函数过长 (> 50 行)
- [ ] 类过大 (> 200 行)
- [ ] 复杂度过高 (圈复杂度 > 10)
- [ ] 职责不清晰 (违反单一职责原则)

### 2. 重构前提

- [ ] 有完善的测试覆盖
- [ ] 测试全部通过
- [ ] 代码已提交版本控制
- [ ] 有充足的时间窗口

## 重构类型

### 1. 提取函数 (Extract Function)

```typescript
// 重构前
function processOrder(order) {
  // 验证订单
  if (!order.items || order.items.length === 0) {
    throw new Error('Empty order');
  }
  if (!order.customer) {
    throw new Error('No customer');
  }

  // 计算总价
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.quantity;
  }

  // 保存订单
  return db.save({ ...order, total });
}

// 重构后
function processOrder(order) {
  validateOrder(order);
  const total = calculateTotal(order);
  return saveOrder(order, total);
}

function validateOrder(order) {
  if (!order.items || order.items.length === 0) {
    throw new Error('Empty order');
  }
  if (!order.customer) {
    throw new Error('No customer');
  }
}

function calculateTotal(order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function saveOrder(order, total) {
  return db.save({ ...order, total });
}
```

### 2. 提取类 (Extract Class)

```typescript
// 重构前
class User {
  name: string;
  email: string;
  street: string;
  city: string;
  zipCode: string;

  getFullAddress() {
    return `${this.street}, ${this.city} ${this.zipCode}`;
  }
}

// 重构后
class Address {
  constructor(
    public street: string,
    public city: string,
    public zipCode: string
  ) {}

  getFullAddress() {
    return `${this.street}, ${this.city} ${this.zipCode}`;
  }
}

class User {
  constructor(
    public name: string,
    public email: string,
    public address: Address
  ) {}
}
```

### 3. 简化条件表达式

```typescript
// 重构前
function getDiscount(user, amount) {
  if (user.isVip) {
    if (amount > 1000) {
      return amount * 0.2;
    } else {
      return amount * 0.1;
    }
  } else {
    if (amount > 1000) {
      return amount * 0.05;
    } else {
      return 0;
    }
  }
}

// 重构后
function getDiscount(user, amount) {
  if (user.isVip) {
    return amount > 1000 ? amount * 0.2 : amount * 0.1;
  }
  return amount > 1000 ? amount * 0.05 : 0;
}

// 更好的重构
interface DiscountStrategy {
  calculate(amount: number): number;
}

class VipDiscount implements DiscountStrategy {
  calculate(amount: number) {
    return amount > 1000 ? amount * 0.2 : amount * 0.1;
  }
}

class RegularDiscount implements DiscountStrategy {
  calculate(amount: number) {
    return amount > 1000 ? amount * 0.05 : 0;
  }
}

function getDiscount(user, amount) {
  const strategy: DiscountStrategy = user.isVip ? new VipDiscount() : new RegularDiscount();
  return strategy.calculate(amount);
}
```

### 4. 移除重复代码

```typescript
// 重构前
function sendEmailNotification(user, message) {
  const transport = nodemailer.createTransport({...});
  await transport.sendMail({
    to: user.email,
    subject: 'Notification',
    text: message
  });
}

function sendSmsNotification(user, message) {
  const client = twilio(...);
  await client.messages.create({
    to: user.phone,
    body: message
  });
}

// 重构后
interface NotificationChannel {
  send(recipient: string, message: string): Promise<void>;
}

class EmailNotification implements NotificationChannel {
  async send(email: string, message: string) {
    const transport = nodemailer.createTransport({...});
    await transport.sendMail({
      to: email,
      subject: 'Notification',
      text: message
    });
  }
}

class SmsNotification implements NotificationChannel {
  async send(phone: string, message: string) {
    const client = twilio(...);
    await client.messages.create({
      to: phone,
      body: message
    });
  }
}

class NotificationService {
  constructor(private channels: NotificationChannel[]) {}

  async notify(recipient: string, message: string) {
    await Promise.all(
      this.channels.map(channel => channel.send(recipient, message))
    );
  }
}
```

## 重构流程

### 第一步: 确保测试覆盖

```bash
# 运行测试并检查覆盖率
npm test -- --coverage

# 确保覆盖率 > 80%
```

### 第二步: 识别重构目标

1. 运行代码质量工具

   ```bash
   npm run lint
   npm run complexity
   ```

2. 查看代码审查反馈
3. 分析代码度量指标
4. 收集团队反馈

### 第三步: 小步重构

1. 一次只做一个小改动
2. 每次改动后运行测试
3. 提交版本控制
4. 持续进行直到满意

### 第四步: 验证效果

1. 所有测试通过
2. 代码质量指标改善
3. 团队审查通过
4. 性能无降低

## 重构模式

### 1. 设计模式应用

- **策略模式**: 消除大量 if-else
- **工厂模式**: 统一对象创建
- **装饰器模式**: 动态添加功能
- **观察者模式**: 解耦事件处理

### 2. 代码组织

- **按功能分层**: Controller / Service / Repository
- **按领域分组**: User / Order / Payment
- **依赖注入**: 提高可测试性
- **接口抽象**: 降低耦合度

### 3. 命名改进

```typescript
// 重构前
function f(x) {
  return x * 1.1;
}

// 重构后
function calculateTotalWithTax(subtotal: number): number {
  const TAX_RATE = 0.1;
  return subtotal * (1 + TAX_RATE);
}
```

## 重构检查清单

### 代码结构

- [ ] 函数职责单一
- [ ] 函数长度合理 (< 50 行)
- [ ] 类大小适中 (< 200 行)
- [ ] 模块耦合度低

### 代码质量

- [ ] 无重复代码
- [ ] 命名清晰准确
- [ ] 注释简洁有效
- [ ] 复杂度可控 (< 10)

### 测试覆盖

- [ ] 测试覆盖率 > 80%
- [ ] 测试全部通过
- [ ] 边界情况覆盖
- [ ] 错误情况覆盖

### 性能考虑

- [ ] 无性能退化
- [ ] 资源使用合理
- [ ] 响应时间达标
- [ ] 并发安全

## 常见重构场景

### 场景1: 长方法拆分

1. 识别独立的代码块
2. 提取为独立函数
3. 使用描述性命名
4. 保持单一职责

### 场景2: 大类拆分

1. 识别类的不同职责
2. 提取为独立类
3. 使用组合代替继承
4. 保持接口稳定

### 场景3: 重复代码消除

1. 找到相似代码段
2. 提取公共逻辑
3. 参数化差异部分
4. 复用公共函数

### 场景4: 条件逻辑简化

1. 使用策略模式
2. 使用多态替代
3. 提前返回
4. 使用卫语句

## 重构工具

### 代码质量工具

- **ESLint**: 静态代码分析
- **SonarQube**: 代码质量平台
- **Code Climate**: 代码质量监控

### 重构工具

- **IDE重构**: VS Code / WebStorm 内置
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查

## 注意事项

### 1. 重构风险

- **功能破坏**: 确保测试覆盖充分
- **性能退化**: 进行性能测试
- **引入缺陷**: 小步重构,逐步验证
- **时间成本**: 评估重构价值

### 2. 何时不重构

- 临近发布deadline
- 没有测试覆盖
- 代码即将废弃
- 收益不明显

### 3. 重构最佳实践

- 保持小步前进
- 频繁提交代码
- 持续运行测试
- 及时停止重构

---

**记住**: 重构是改进代码结构,而不是添加新功能!
