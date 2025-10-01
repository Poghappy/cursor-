# Cursor 多角色 Agent 团队函数式规则

## 规则概述
本文件定义了 Cursor 多角色 Agent 团队的可调用函数规则，每个函数都有明确的输入参数、输出要求、约束条件和交接机制。

## 函数规则定义

### 1. 项目初始化函数

#### 函数名: `initialize_project`
**描述**: 初始化新项目，创建基础结构和配置
**输入参数**:
- `project_name`: 项目名称 (string, required)
- `project_type`: 项目类型 (string, required, 如 "web", "api", "mobile")
- `tech_stack`: 技术栈 (array, required, 如 ["nodejs", "react", "postgresql"])
- `team_size`: 团队规模 (number, optional, 默认 5)

**输出要求**:
- 创建项目目录结构
- 生成基础配置文件
- 初始化版本控制
- 输出项目初始化报告

**约束条件**:
- 项目名称必须唯一
- 技术栈必须兼容
- 目录结构必须规范
- 配置文件必须完整

**交接机制**:
- 输出项目初始化 JSON
- 设置 next_role 为 "PO"
- 提供 next_instruction 为 "调用 generate_project_brief 函数"

**示例调用**:
```json
{
  "function": "initialize_project",
  "parameters": {
    "project_name": "用户管理系统",
    "project_type": "web",
    "tech_stack": ["nodejs", "react", "postgresql"],
    "team_size": 8
  }
}
```

### 2. 项目概览生成函数

#### 函数名: `generate_project_brief`
**描述**: 生成项目概览文档，包括目标、范围、成功指标等
**输入参数**:
- `project_name`: 项目名称 (string, required)
- `business_goals`: 业务目标 (array, required)
- `target_users`: 目标用户 (array, required)
- `success_metrics`: 成功指标 (array, required)
- `constraints`: 约束条件 (array, optional)

**输出要求**:
- 生成 docs/PROJECT_BRIEF.md
- 包含目标、非目标、用户画像
- 包含里程碑和成功指标
- 包含约束和风险清单

**约束条件**:
- 目标必须可度量
- 范围必须清晰
- 风险必须识别
- 指标必须可追踪

**交接机制**:
- 输出项目概览 JSON
- 设置 next_role 为 "PM"
- 提供 next_instruction 为 "调用 generate_user_stories 函数"

**示例调用**:
```json
{
  "function": "generate_project_brief",
  "parameters": {
    "project_name": "用户管理系统",
    "business_goals": ["提升用户体验", "降低运营成本"],
    "target_users": ["普通用户", "管理员"],
    "success_metrics": ["用户满意度 > 90%", "系统可用性 > 99%"],
    "constraints": ["预算限制", "时间限制"]
  }
}
```

### 3. 用户故事生成函数

#### 函数名: `generate_user_stories`
**描述**: 基于项目概览生成用户故事和验收标准
**输入参数**:
- `project_brief`: 项目概览 (string, required, 通常是 docs/PROJECT_BRIEF.md)
- `user_personas`: 用户画像 (array, required)
- `feature_areas`: 功能领域 (array, required)
- `acceptance_criteria`: 验收标准 (array, optional)

**输出要求**:
- 生成 docs/USER_STORIES.md
- 包含主要用户故事
- 包含边界和极端情况
- 包含 Gherkin 验收标准

**约束条件**:
- 故事必须符合 INVEST 原则
- 验收标准必须可测试
- 覆盖主要和边界场景
- 与项目概览一致

**交接机制**:
- 输出用户故事 JSON
- 设置 next_role 为 "BA"
- 提供 next_instruction 为 "调用 generate_prd 函数"

**示例调用**:
```json
{
  "function": "generate_user_stories",
  "parameters": {
    "project_brief": "docs/PROJECT_BRIEF.md",
    "user_personas": ["普通用户", "管理员"],
    "feature_areas": ["用户认证", "用户管理"],
    "acceptance_criteria": ["功能正确", "性能达标"]
  }
}
```

### 4. 产品需求文档生成函数

#### 函数名: `generate_prd`
**描述**: 基于用户故事生成产品需求文档
**输入参数**:
- `user_stories`: 用户故事 (string, required, 通常是 docs/USER_STORIES.md)
- `business_requirements`: 业务需求 (array, required)
- `functional_requirements`: 功能需求 (array, required)
- `non_functional_requirements`: 非功能需求 (array, optional)

**输出要求**:
- 生成 docs/PRD.md
- 包含产品愿景和范围
- 包含功能需求规格
- 包含非功能需求目标

**约束条件**:
- 需求必须可验证
- 功能必须可实现
- 非功能目标必须可度量
- 与用户故事一致

**交接机制**:
- 输出 PRD JSON
- 设置 next_role 为 "PjM"
- 提供 next_instruction 为 "调用 generate_task_breakdown 函数"

**示例调用**:
```json
{
  "function": "generate_prd",
  "parameters": {
    "user_stories": "docs/USER_STORIES.md",
    "business_requirements": ["提升用户体验", "降低运营成本"],
    "functional_requirements": ["用户注册", "用户登录", "用户管理"],
    "non_functional_requirements": ["性能", "安全", "可用性"]
  }
}
```

### 5. 任务分解函数

#### 函数名: `generate_task_breakdown`
**描述**: 基于 PRD 生成详细的任务分解和项目计划
**输入参数**:
- `prd`: 产品需求文档 (string, required, 通常是 docs/PRD.md)
- `team_capacity`: 团队容量 (number, required)
- `timeline`: 时间线 (string, required, 如 "4 weeks")
- `priority_levels`: 优先级 (array, required, 如 ["high", "medium", "low"])

**输出要求**:
- 生成 docs/TASKS.md
- 包含任务 ID、名称、模块
- 包含负责人、工时、依赖
- 包含优先级和 DoD

**约束条件**:
- 任务必须可并行
- 依赖关系必须清晰
- 工时估算必须合理
- 优先级必须明确

**交接机制**:
- 输出任务分解 JSON
- 设置 next_role 为 "Arch"
- 提供 next_instruction 为 "调用 generate_tech_design 函数"

**示例调用**:
```json
{
  "function": "generate_task_breakdown",
  "parameters": {
    "prd": "docs/PRD.md",
    "team_capacity": 8,
    "timeline": "4 weeks",
    "priority_levels": ["high", "medium", "low"]
  }
}
```

### 6. 技术设计生成函数

#### 函数名: `generate_tech_design`
**描述**: 基于任务分解生成技术设计文档
**输入参数**:
- `tasks`: 任务列表 (string, required, 通常是 docs/TASKS.md)
- `tech_stack`: 技术栈 (array, required)
- `architecture_pattern`: 架构模式 (string, required, 如 "microservices", "monolith")
- `quality_requirements`: 质量要求 (array, required)

**输出要求**:
- 生成 docs/TECH_DESIGN.md
- 包含架构图和设计
- 包含技术选型理由
- 包含质量保证策略

**约束条件**:
- 架构必须可扩展
- 技术选型必须合理
- 质量要求必须可验证
- 与任务分解一致

**交接机制**:
- 输出技术设计 JSON
- 设置 next_role 为 "Dev"
- 提供 next_instruction 为 "调用 generate_implementation 函数"

**示例调用**:
```json
{
  "function": "generate_tech_design",
  "parameters": {
    "tasks": "docs/TASKS.md",
    "tech_stack": ["nodejs", "react", "postgresql"],
    "architecture_pattern": "monolith",
    "quality_requirements": ["可测试性", "可维护性", "可扩展性"]
  }
}
```

### 7. 代码实现函数

#### 函数名: `generate_implementation`
**描述**: 基于技术设计生成最小可用实现
**输入参数**:
- `tech_design`: 技术设计 (string, required, 通常是 docs/TECH_DESIGN.md)
- `tasks`: 任务列表 (array, required, 如 ["TB-001", "TB-002"])
- `implementation_scope`: 实现范围 (string, required, 如 "minimal", "full")
- `quality_standards`: 质量标准 (array, required)

**输出要求**:
- 生成 src/ 目录代码
- 包含核心功能实现
- 包含单元测试
- 包含集成测试

**约束条件**:
- 代码必须可运行
- 测试必须通过
- 质量必须达标
- 与技术设计一致

**交接机制**:
- 输出实现 JSON
- 设置 next_role 为 "QA"
- 提供 next_instruction 为 "调用 generate_qa_test 函数"

**示例调用**:
```json
{
  "function": "generate_implementation",
  "parameters": {
    "tech_design": "docs/TECH_DESIGN.md",
    "tasks": ["TB-001", "TB-002"],
    "implementation_scope": "minimal",
    "quality_standards": ["代码规范", "测试覆盖", "性能要求"]
  }
}
```

### 8. 质量测试函数

#### 函数名: `generate_qa_test`
**描述**: 基于实现代码生成和执行质量测试
**输入参数**:
- `implementation`: 实现代码 (string, required, 通常是 src/ 目录)
- `test_scope`: 测试范围 (array, required, 如 ["unit", "integration", "e2e"])
- `quality_metrics`: 质量指标 (array, required)
- `test_environment`: 测试环境 (string, required)

**输出要求**:
- 生成测试用例
- 执行测试并生成报告
- 包含覆盖率分析
- 包含质量评估

**约束条件**:
- 测试必须全面
- 覆盖率必须达标
- 质量必须可验证
- 报告必须详细

**交接机制**:
- 输出测试 JSON
- 设置 next_role 为 "Ops"
- 提供 next_instruction 为 "调用 generate_deployment 函数"

**示例调用**:
```json
{
  "function": "generate_qa_test",
  "parameters": {
    "implementation": "src/",
    "test_scope": ["unit", "integration", "e2e"],
    "quality_metrics": ["覆盖率", "性能", "安全"],
    "test_environment": "development"
  }
}
```

### 9. 部署发布函数

#### 函数名: `generate_deployment`
**描述**: 基于测试结果生成部署和发布策略
**输入参数**:
- `test_results`: 测试结果 (string, required, 通常是测试报告)
- `deployment_target`: 部署目标 (string, required, 如 "production", "staging")
- `release_strategy`: 发布策略 (string, required, 如 "blue-green", "rolling")
- `rollback_plan`: 回滚计划 (string, required)

**输出要求**:
- 生成部署配置
- 包含环境变量配置
- 包含监控和告警配置
- 包含回滚策略

**约束条件**:
- 部署必须安全
- 配置必须完整
- 监控必须有效
- 回滚必须可行

**交接机制**:
- 输出部署 JSON
- 设置 next_role 为 "TW"
- 提供 next_instruction 为 "调用 generate_documentation 函数"

**示例调用**:
```json
{
  "function": "generate_deployment",
  "parameters": {
    "test_results": "test-results/",
    "deployment_target": "production",
    "release_strategy": "blue-green",
    "rollback_plan": "automatic"
  }
}
```

### 10. 文档生成函数

#### 函数名: `generate_documentation`
**描述**: 基于项目成果生成完整文档
**输入参数**:
- `project_artifacts`: 项目产物 (array, required)
- `documentation_scope`: 文档范围 (array, required, 如 ["user", "developer", "admin"])
- `documentation_format`: 文档格式 (array, required, 如 ["markdown", "html", "pdf"])
- `target_audience`: 目标受众 (array, required)

**输出要求**:
- 生成用户文档
- 生成开发者文档
- 生成管理员文档
- 生成 API 文档

**约束条件**:
- 文档必须准确
- 内容必须完整
- 格式必须规范
- 受众必须明确

**交接机制**:
- 输出文档 JSON
- 设置 next_role 为 "PM"
- 提供 next_instruction 为 "调用 generate_iteration_plan 函数"

**示例调用**:
```json
{
  "function": "generate_documentation",
  "parameters": {
    "project_artifacts": ["src/", "docs/", "tests/"],
    "documentation_scope": ["user", "developer", "admin"],
    "documentation_format": ["markdown", "html"],
    "target_audience": ["end-users", "developers", "system-admins"]
  }
}
```

### 11. 迭代计划生成函数

#### 函数名: `generate_iteration_plan`
**描述**: 基于项目成果生成下一轮迭代计划
**输入参数**:
- `current_status`: 当前状态 (string, required)
- `user_feedback`: 用户反馈 (array, optional)
- `business_priorities`: 业务优先级 (array, required)
- `technical_debt`: 技术债务 (array, optional)

**输出要求**:
- 生成迭代计划
- 包含功能优化建议
- 包含技术优化建议
- 包含下一轮目标

**约束条件**:
- 计划必须可行
- 优先级必须明确
- 目标必须可度量
- 资源必须充足

**交接机制**:
- 输出迭代计划 JSON
- 设置 next_role 为 "PO"
- 提供 next_instruction 为 "调用 generate_project_brief 函数"

**示例调用**:
```json
{
  "function": "generate_iteration_plan",
  "parameters": {
    "current_status": "v1.0.0 released",
    "user_feedback": ["性能需要优化", "界面需要改进"],
    "business_priorities": ["用户体验", "系统性能"],
    "technical_debt": ["代码重构", "测试覆盖"]
  }
}
```

## 函数调用规范

### 调用格式
```json
{
  "function": "function_name",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

### 响应格式
```json
{
  "status": "success|error",
  "message": "执行结果描述",
  "data": {
    "artifacts": ["path1", "path2"],
    "next_role": "role_name",
    "next_instruction": "调用下一个函数"
  },
  "error": {
    "code": "error_code",
    "message": "error_message"
  }
}
```

### 错误处理
- 参数验证失败: 返回 400 错误
- 函数执行失败: 返回 500 错误
- 资源不足: 返回 503 错误
- 权限不足: 返回 403 错误

## 函数依赖关系

### 顺序依赖
1. `initialize_project` → `generate_project_brief`
2. `generate_project_brief` → `generate_user_stories`
3. `generate_user_stories` → `generate_prd`
4. `generate_prd` → `generate_task_breakdown`
5. `generate_task_breakdown` → `generate_tech_design`
6. `generate_tech_design` → `generate_implementation`
7. `generate_implementation` → `generate_qa_test`
8. `generate_qa_test` → `generate_deployment`
9. `generate_deployment` → `generate_documentation`
10. `generate_documentation` → `generate_iteration_plan`

### 并行依赖
- 某些函数可以并行执行
- 需要明确依赖关系
- 避免循环依赖

## 函数配置

### 环境变量
- `MAX_FILES`: 最大文件数限制
- `MAX_LINES`: 最大行数限制
- `LINT_CMD`: 代码检查命令
- `TEST_CMD`: 测试执行命令
- `COVERAGE_CMD`: 覆盖率检查命令

### 配置文件
- `.cursor/rules/agent_functions.md`: 函数规则定义
- `prompts/roles/*.md`: 角色提示模板
- `prompts/stages/*.md`: 阶段提示模板
- `docs/*.md`: 文档模板

## 函数监控

### 性能监控
- 函数执行时间
- 资源使用情况
- 错误率统计
- 成功率统计

### 质量监控
- 代码质量指标
- 测试覆盖率
- 文档完整性
- 用户满意度

### 告警机制
- 函数执行失败告警
- 性能指标异常告警
- 质量指标不达标告警
- 资源使用超限告警

## 函数扩展

### 新增函数
1. 定义函数规则
2. 实现函数逻辑
3. 更新依赖关系
4. 添加测试用例
5. 更新文档

### 修改函数
1. 评估影响范围
2. 更新函数规则
3. 修改实现逻辑
4. 更新测试用例
5. 更新文档

### 删除函数
1. 检查依赖关系
2. 迁移相关功能
3. 更新调用代码
4. 清理相关资源
5. 更新文档

## 函数最佳实践

### 设计原则
- 单一职责原则
- 开闭原则
- 里氏替换原则
- 接口隔离原则
- 依赖倒置原则

### 实现原则
- 代码简洁清晰
- 错误处理完善
- 日志记录完整
- 性能优化合理
- 安全防护充分

### 测试原则
- 单元测试覆盖
- 集成测试完整
- 端到端测试有效
- 性能测试达标
- 安全测试通过

### 文档原则
- 文档准确完整
- 示例清晰易懂
- 更新及时有效
- 格式规范统一
- 受众明确具体
