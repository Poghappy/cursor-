# 统一交接 JSON Schema

## 概述
本文件定义了 Cursor 多角色 Agent 团队中所有角色之间交接信息的统一 JSON 格式，确保信息传递的标准化和一致性。

## 交接 JSON 结构

### 基础结构
```json
{
  "inputs": {
    "role": "当前角色名称",
    "stage": "当前阶段名称",
    "artifacts": ["输入文件路径列表"],
    "parameters": {
      "param1": "参数值1",
      "param2": "参数值2"
    },
    "notes": "额外说明信息"
  },
  "decisions": [
    {
      "topic": "决策主题",
      "choice": "选择的方案",
      "rationale": "选择理由",
      "alternatives": ["备选方案1", "备选方案2"],
      "impact": "影响范围",
      "risks": ["风险1", "风险2"]
    }
  ],
  "artifacts": [
    {
      "path": "文件路径",
      "type": "文件类型",
      "summary": "文件摘要",
      "status": "状态",
      "dependencies": ["依赖文件1", "依赖文件2"],
      "validation": {
        "lint": "lint检查结果",
        "test": "测试结果",
        "coverage": "覆盖率结果"
      }
    }
  ],
  "risks": [
    {
      "name": "风险名称",
      "impact": "影响程度",
      "probability": "发生概率",
      "mitigation": "缓解措施",
      "owner": "负责人",
      "deadline": "解决期限"
    }
  ],
  "next_role": "下一个角色",
  "next_instruction": "下一个角色的指令",
  "metadata": {
    "timestamp": "时间戳",
    "version": "版本号",
    "author": "作者",
    "reviewer": "审查者"
  }
}
```

## 字段详细说明

### inputs 字段
- **role**: 当前执行的角色名称 (string, required)
- **stage**: 当前执行的阶段名称 (string, required)
- **artifacts**: 输入的文件路径列表 (array, required)
- **parameters**: 角色特定的参数 (object, optional)
- **notes**: 额外的说明信息 (string, optional)

### decisions 字段
- **topic**: 决策的主题 (string, required)
- **choice**: 最终选择的方案 (string, required)
- **rationale**: 选择该方案的理由 (string, required)
- **alternatives**: 考虑过的备选方案 (array, optional)
- **impact**: 决策的影响范围 (string, optional)
- **risks**: 决策带来的风险 (array, optional)

### artifacts 字段
- **path**: 文件的相对路径 (string, required)
- **type**: 文件类型 (string, required, 如 "document", "code", "test", "config")
- **summary**: 文件内容的简要描述 (string, required)
- **status**: 文件状态 (string, required, 如 "completed", "in_progress", "pending")
- **dependencies**: 依赖的其他文件 (array, optional)
- **validation**: 验证结果 (object, optional)
  - **lint**: 代码规范检查结果 (string, optional)
  - **test**: 测试执行结果 (string, optional)
  - **coverage**: 测试覆盖率结果 (string, optional)

### risks 字段
- **name**: 风险名称 (string, required)
- **impact**: 影响程度 (string, required, 如 "high", "medium", "low")
- **probability**: 发生概率 (string, required, 如 "high", "medium", "low")
- **mitigation**: 缓解措施 (string, required)
- **owner**: 风险负责人 (string, optional)
- **deadline**: 解决期限 (string, optional)

### next_role 字段
- **next_role**: 下一个执行的角色名称 (string, required)
- **next_instruction**: 给下一个角色的具体指令 (string, required)

### metadata 字段
- **timestamp**: 交接时间戳 (string, required, ISO 8601 格式)
- **version**: 版本号 (string, required)
- **author**: 当前角色作者 (string, required)
- **reviewer**: 审查者 (string, optional)

## 角色特定字段

### PO (Product Owner) 特定字段
```json
{
  "inputs": {
    "role": "PO",
    "stage": "project_brief",
    "business_goals": ["目标1", "目标2"],
    "target_users": ["用户群体1", "用户群体2"],
    "success_metrics": ["指标1", "指标2"],
    "constraints": ["约束1", "约束2"]
  },
  "decisions": [
    {
      "topic": "项目范围定义",
      "choice": "包含核心功能，排除高级功能",
      "rationale": "基于资源限制和时间约束",
      "impact": "影响后续所有开发工作",
      "risks": ["功能不完整", "用户满意度低"]
    }
  ]
}
```

### PM (Product Manager) 特定字段
```json
{
  "inputs": {
    "role": "PM",
    "stage": "user_stories",
    "user_personas": ["用户画像1", "用户画像2"],
    "feature_areas": ["功能领域1", "功能领域2"],
    "acceptance_criteria": ["验收标准1", "验收标准2"]
  },
  "decisions": [
    {
      "topic": "用户故事优先级",
      "choice": "按用户价值和技术复杂度排序",
      "rationale": "确保高价值功能优先交付",
      "impact": "影响开发顺序和资源分配"
    }
  ]
}
```

### BA (Business Analyst) 特定字段
```json
{
  "inputs": {
    "role": "BA",
    "stage": "prd",
    "business_requirements": ["业务需求1", "业务需求2"],
    "functional_requirements": ["功能需求1", "功能需求2"],
    "non_functional_requirements": ["非功能需求1", "非功能需求2"]
  },
  "decisions": [
    {
      "topic": "接口设计",
      "choice": "RESTful API 设计",
      "rationale": "标准化、易理解、易实现",
      "impact": "影响前后端开发工作"
    }
  ]
}
```

### PjM (Project Manager) 特定字段
```json
{
  "inputs": {
    "role": "PjM",
    "stage": "task_breakdown",
    "team_capacity": 8,
    "timeline": "4 weeks",
    "priority_levels": ["high", "medium", "low"]
  },
  "decisions": [
    {
      "topic": "任务分解策略",
      "choice": "按模块和功能点分解",
      "rationale": "便于并行开发和进度跟踪",
      "impact": "影响开发效率和资源分配"
    }
  ]
}
```

### Arch (Architect) 特定字段
```json
{
  "inputs": {
    "role": "Arch",
    "stage": "tech_design",
    "tech_stack": ["技术1", "技术2"],
    "architecture_pattern": "monolith",
    "quality_requirements": ["可测试性", "可维护性"]
  },
  "decisions": [
    {
      "topic": "技术选型",
      "choice": "Node.js + React + PostgreSQL",
      "rationale": "团队熟悉度高，生态成熟",
      "impact": "影响开发效率和维护成本"
    }
  ]
}
```

### Dev (Developer) 特定字段
```json
{
  "inputs": {
    "role": "Dev",
    "stage": "implementation",
    "tech_design": "docs/TECH_DESIGN.md",
    "tasks": ["TB-001", "TB-002"],
    "implementation_scope": "minimal",
    "quality_standards": ["代码规范", "测试覆盖"]
  },
  "decisions": [
    {
      "topic": "实现策略",
      "choice": "最小可用实现",
      "rationale": "快速验证核心功能",
      "impact": "影响交付时间和质量"
    }
  ]
}
```

### QA (Quality Assurance) 特定字段
```json
{
  "inputs": {
    "role": "QA",
    "stage": "qa_test",
    "implementation": "src/",
    "test_scope": ["unit", "integration", "e2e"],
    "quality_metrics": ["覆盖率", "性能", "安全"],
    "test_environment": "development"
  },
  "decisions": [
    {
      "topic": "测试策略",
      "choice": "单元测试 + 集成测试 + 端到端测试",
      "rationale": "确保代码质量和功能正确性",
      "impact": "影响测试覆盖率和质量保证"
    }
  ]
}
```

### Ops (DevOps) 特定字段
```json
{
  "inputs": {
    "role": "Ops",
    "stage": "deployment",
    "test_results": "test-results/",
    "deployment_target": "production",
    "release_strategy": "blue-green",
    "rollback_plan": "automatic"
  },
  "decisions": [
    {
      "topic": "部署策略",
      "choice": "蓝绿部署",
      "rationale": "零停机时间，风险可控",
      "impact": "影响发布稳定性和用户体验"
    }
  ]
}
```

### TW (Technical Writer) 特定字段
```json
{
  "inputs": {
    "role": "TW",
    "stage": "documentation",
    "project_artifacts": ["src/", "docs/", "tests/"],
    "documentation_scope": ["user", "developer", "admin"],
    "documentation_format": ["markdown", "html"],
    "target_audience": ["end-users", "developers", "system-admins"]
  },
  "decisions": [
    {
      "topic": "文档策略",
      "choice": "多格式、多受众文档",
      "rationale": "满足不同用户需求",
      "impact": "影响用户体验和维护效率"
    }
  ]
}
```

## 交接流程

### 1. 角色完成工作
- 执行角色特定的任务
- 生成相应的交付物
- 记录决策和风险
- 准备交接信息

### 2. 生成交接 JSON
- 填写 inputs 字段
- 记录 decisions 字段
- 列出 artifacts 字段
- 识别 risks 字段
- 设置 next_role 和 next_instruction

### 3. 验证交接信息
- 检查必填字段
- 验证文件路径
- 确认决策合理性
- 评估风险等级

### 4. 传递给下一个角色
- 输出交接 JSON
- 等待下一个角色确认
- 处理交接问题
- 开始下一阶段工作

## 交接质量检查

### 必填字段检查
- [ ] inputs.role 已填写
- [ ] inputs.stage 已填写
- [ ] inputs.artifacts 已填写
- [ ] decisions 已填写
- [ ] artifacts 已填写
- [ ] next_role 已填写
- [ ] next_instruction 已填写

### 内容质量检查
- [ ] 决策理由充分
- [ ] 风险识别完整
- [ ] 文件路径正确
- [ ] 指令清晰明确
- [ ] 时间戳格式正确

### 一致性检查
- [ ] 角色与阶段匹配
- [ ] 文件与描述一致
- [ ] 决策与影响一致
- [ ] 风险与缓解一致

## 交接模板

### 基础交接模板
```json
{
  "inputs": {
    "role": "{CURRENT_ROLE}",
    "stage": "{CURRENT_STAGE}",
    "artifacts": ["{INPUT_FILE_1}", "{INPUT_FILE_2}"],
    "parameters": {
      "{PARAM_1}": "{VALUE_1}",
      "{PARAM_2}": "{VALUE_2}"
    },
    "notes": "{ADDITIONAL_NOTES}"
  },
  "decisions": [
    {
      "topic": "{DECISION_TOPIC}",
      "choice": "{CHOSEN_OPTION}",
      "rationale": "{REASONING}",
      "alternatives": ["{ALTERNATIVE_1}", "{ALTERNATIVE_2}"],
      "impact": "{IMPACT_DESCRIPTION}",
      "risks": ["{RISK_1}", "{RISK_2}"]
    }
  ],
  "artifacts": [
    {
      "path": "{OUTPUT_FILE_1}",
      "type": "{FILE_TYPE}",
      "summary": "{FILE_SUMMARY}",
      "status": "completed",
      "dependencies": ["{DEPENDENCY_1}", "{DEPENDENCY_2}"],
      "validation": {
        "lint": "✅ 通过",
        "test": "✅ 通过",
        "coverage": "85%"
      }
    }
  ],
  "risks": [
    {
      "name": "{RISK_NAME}",
      "impact": "medium",
      "probability": "low",
      "mitigation": "{MITIGATION_PLAN}",
      "owner": "{RISK_OWNER}",
      "deadline": "{DEADLINE}"
    }
  ],
  "next_role": "{NEXT_ROLE}",
  "next_instruction": "调用 {NEXT_FUNCTION} 函数，{NEXT_DESCRIPTION}",
  "metadata": {
    "timestamp": "{ISO_TIMESTAMP}",
    "version": "1.0.0",
    "author": "{CURRENT_ROLE}",
    "reviewer": "{REVIEWER}"
  }
}
```

## 交接最佳实践

### 信息完整性
- 确保所有必填字段都已填写
- 提供充分的上下文信息
- 记录重要的决策过程
- 识别潜在的风险点

### 信息准确性
- 验证文件路径的正确性
- 确认决策的合理性
- 检查数据的准确性
- 核实时间戳的格式

### 信息清晰性
- 使用简洁明了的语言
- 避免歧义和模糊表达
- 提供具体的操作指令
- 说明预期的输出结果

### 信息可追溯性
- 记录决策的时间点
- 保留决策的依据
- 跟踪风险的演变
- 维护变更的历史

## 交接问题处理

### 常见问题
1. **字段缺失**: 补充必填字段
2. **路径错误**: 修正文件路径
3. **格式错误**: 检查 JSON 格式
4. **内容不一致**: 核实信息准确性

### 问题解决流程
1. 识别问题类型
2. 分析问题原因
3. 制定解决方案
4. 实施修复措施
5. 验证修复结果

### 问题预防措施
1. 使用交接模板
2. 进行质量检查
3. 建立审查机制
4. 持续改进流程
