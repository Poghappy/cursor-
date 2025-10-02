# 实现阶段 (Implementation)

**阶段目标**: 选择 1-2 个高优先级任务进行最小可用实现。

## 输入来源

- **任务列表**: `docs/TASKS.md` 中选择 1-2 个任务
- **技术设计**: `docs/TECH_DESIGN.md`

## 实现约束

- **文件数量**: 单次 ≤ 5 文件
- **代码行数**: 单文件 ≤ 100 行
- **质量要求**: 必须通过 `npm run lint` 和 `npm test`
- **测试覆盖率**: > 80%

## 输出要求

### 1. 变更计划摘要

- 选择的任务和理由
- 实现范围
- 技术方案
- 预期交付物

### 2. 文件树 Diff

```diff
新增文件:
+ src/services/UserService.ts
+ src/controllers/UserController.ts
+ tests/unit/UserService.test.ts

修改文件:
~ src/app.ts
~ package.json

删除文件:
- 无
```

### 3. 代码实现

- 业务逻辑 (`src/services/`)
- 控制器 (`src/controllers/`)
- 路由 (`src/routes/`)
- 数据模型 (`src/models/`)

### 4. 测试实现

- 单元测试 (`tests/unit/`)
- 集成测试 (`tests/integration/`)

### 5. 质量检查结果

```bash
✅ npm run lint - 通过
✅ npm test - 通过
✅ 测试覆盖率 - 85%
```

## 实现原则

- **最小可用**: 实现核心功能，避免过度设计
- **质量优先**: 确保代码质量和测试覆盖
- **可维护性**: 代码结构清晰，易于维护
- **可测试性**: 依赖注入，接口抽象

## 输出文件

- 源代码文件
- 测试文件
- 更新的配置文件

## 质量检查

- [ ] 代码规范检查通过
- [ ] 所有测试通过
- [ ] 测试覆盖率达标
- [ ] 代码审查通过

## 下一步

完成后使用 `/handover` 生成交接 JSON，交接给 **QA** 角色进行测试。

---

**完整模板**: `prompts/stages/implementation.md`
