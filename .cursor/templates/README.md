# Templates - 模板系统

本目录包含 Cursor Agent 系统使用的各类模板。

## 📁 目录结构

```
templates/
├── agent-todos.json        # 任务模板配置
├── handover/              # 交接模板
├── todo/                  # 任务模板
└── report/                # 报告模板
```

## 📋 任务模板 (agent-todos.json)

### 内置模板

#### 1. feature_development - 功能开发流程

```json
{
  "feature_development": {
    "name": "功能开发模板",
    "steps": [
      "requirements_analysis", // BA 需求分析
      "technical_design", // Arch 技术设计
      "task_breakdown", // PJM 任务分解
      "implementation", // Dev 代码实现
      "quality_assurance", // QA 质量保证
      "documentation" // TW 文档更新
    ]
  }
}
```

**适用场景**:

- 新功能开发
- 大型需求实现
- 跨团队协作

**估计时长**: 16-25 小时

#### 2. bug_fix - Bug 修复流程

```json
{
  "bug_fix": {
    "name": "Bug 修复模板",
    "steps": [
      "bug_analysis", // Dev Bug 分析
      "fix_implementation", // Dev 修复实现
      "regression_test" // QA 回归测试
    ]
  }
}
```

**适用场景**:

- 紧急 Bug 修复
- 生产问题处理
- 回归问题修复

**估计时长**: 2-4 小时

#### 3. refactoring - 重构流程

```json
{
  "refactoring": {
    "name": "重构模板",
    "steps": [
      "refactor_planning", // Arch 重构规划
      "test_preparation", // QA 测试准备
      "refactor_execution", // Dev 重构执行
      "validation" // QA 验证测试
    ]
  }
}
```

**适用场景**:

- 代码优化
- 技术债处理
- 架构调整

**估计时长**: 10-15 小时

### 使用模板

#### 在代码中

```typescript
import todoTemplate from './.cursor/templates/agent-todos.json';

// 使用功能开发模板
const featureSteps = todoTemplate.todoTemplates.feature_development.steps;

// 遍历步骤
featureSteps.forEach(step => {
  console.log(`${step.title}: ${step.estimatedTime}`);
});
```

#### 在 Cursor IDE 中

```
@template:feature_development
```

### 自定义模板

创建自定义模板：

```json
{
  "todoTemplates": {
    "custom_workflow": {
      "name": "自定义工作流",
      "steps": [
        {
          "id": "step1",
          "title": "步骤 1",
          "description": "详细说明",
          "assignedRole": "dev",
          "estimatedTime": "2h",
          "dependencies": []
        },
        {
          "id": "step2",
          "title": "步骤 2",
          "description": "详细说明",
          "assignedRole": "qa",
          "estimatedTime": "1h",
          "dependencies": ["step1"]
        }
      ]
    }
  }
}
```

## 🤝 交接模板 (handover/)

### 标准交接模板

```json
{
  "from": "dev",
  "to": "qa",
  "timestamp": "2025-10-02T00:00:00Z",
  "project": "feature-name",
  "status": "ready_for_test",
  "deliverables": [
    {
      "type": "code",
      "location": "src/features/feature-name",
      "description": "实现代码"
    },
    {
      "type": "test",
      "location": "tests/features/feature-name",
      "description": "单元测试"
    }
  ],
  "notes": "特别注意事项",
  "blockers": []
}
```

### 交接类型

1. **standard.json** - 标准交接
   - 正常流程
   - 完整交接
2. **urgent.json** - 紧急交接
   - 生产问题
   - 快速交接
3. **complex.json** - 复杂交接
   - 多方协作
   - 详细记录

## ✅ 任务模板 (todo/)

### 任务类型

1. **feature.json** - 功能任务
2. **bugfix.json** - 修复任务
3. **refactor.json** - 重构任务
4. **docs.json** - 文档任务

### 示例：功能任务

```json
{
  "type": "feature",
  "title": "实现用户认证",
  "priority": "high",
  "estimatedHours": 8,
  "assignedRole": "dev",
  "checklist": ["设计 API 接口", "实现认证逻辑", "编写单元测试", "更新文档"],
  "dependencies": [],
  "tags": ["auth", "security"]
}
```

## 📊 报告模板 (report/)

### 报告类型

1. **daily.md** - 日报模板
2. **weekly.md** - 周报模板
3. **milestone.md** - 里程碑报告

### 示例：日报模板

```markdown
# 日报 - YYYY-MM-DD

## 今日完成

- [ ] 任务 1
- [ ] 任务 2

## 遇到的问题

- 问题描述
- 解决方案

## 明日计划

- [ ] 任务 1
- [ ] 任务 2

## 需要支持

- 资源需求
```

## 🔧 模板配置

### autoBreakdownRules

```json
{
  "autoBreakdownRules": {
    "maxTaskComplexity": 8, // 最大任务复杂度
    "maxTaskDuration": "1d", // 最大任务时长
    "preferredTaskSize": "2-4h", // 推荐任务大小
    "dependencyDepthLimit": 3 // 依赖深度限制
  }
}
```

### progressTracking

```json
{
  "progressTracking": {
    "statusTypes": ["todo", "in_progress", "review", "done", "blocked"],
    "autoStatusUpdate": true, // 自动更新状态
    "notificationEnabled": true // 启用通知
  }
}
```

## 📝 最佳实践

### 1. 模板使用

**何时使用模板**:

- ✅ 标准化流程
- ✅ 团队协作
- ✅ 重复性任务

**何时自定义**:

- ✅ 特殊需求
- ✅ 团队习惯
- ✅ 效率优化

### 2. 模板维护

```bash
# 定期评审
每季度评审一次模板使用情况

# 收集反馈
记录团队使用模板的反馈

# 持续优化
根据反馈优化模板
```

### 3. 版本控制

```bash
# 提交模板变更
git add .cursor/templates/
git commit -m "feat(template): 优化功能开发模板"

# 团队同步
git pull origin main
```

## 🎯 快速开始

### 使用内置模板

```bash
# 1. 查看可用模板
cat .cursor/templates/agent-todos.json | jq '.todoTemplates | keys'

# 2. 使用模板
# 在 Cursor 中: @template:feature_development
```

### 创建自定义模板

```bash
# 1. 复制现有模板
cp .cursor/templates/handover/standard.json \
   .cursor/templates/handover/custom.json

# 2. 编辑模板
vim .cursor/templates/handover/custom.json

# 3. 测试模板
# 在项目中使用并验证
```

## 📚 相关文档

- [主 README](../README.md) - 目录概览
- [最佳实践](../docs/best-practices.md) - 使用建议
- [Agent 指南](../AGENTS_GUIDE.md) - Agent 系统

---

**最后更新**: 2025-10-02  
**维护者**: Dev Agent Team
