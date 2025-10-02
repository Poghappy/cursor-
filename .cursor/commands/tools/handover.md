# 生成交接 JSON (Handover)

**工具目标**: 生成角色切换时的标准化交接文档。

## 使用场景

当前阶段工作完成后，使用此命令生成交接 JSON，传递给下一个角色。

## 交接 JSON 格式

```json
{
  "inputs": {
    "source": "当前阶段名称",
    "notes": "简要说明和上下文"
  },
  "decisions": [
    {
      "topic": "决策主题",
      "choice": "选择的方案",
      "rationale": "理由说明"
    }
  ],
  "artifacts": [
    {
      "path": "产出文件路径",
      "summary": "文件内容摘要"
    }
  ],
  "risks": [
    {
      "name": "风险名称",
      "impact": "影响程度",
      "mitigation": "缓解措施"
    }
  ],
  "next_role": "下一个角色代码",
  "next_instruction": "给下一角色的明确指令"
}
```

## 角色代码映射

- **PO**: Product Owner
- **PM**: Product Manager
- **BA**: Business Analyst
- **Arch**: Architect
- **Dev**: Developer
- **QA**: QA Engineer
- **Ops**: Operations
- **TW**: Technical Writer

## 必需字段

1. **inputs**: 输入来源和上下文
2. **decisions**: 关键决策记录（至少1条）
3. **artifacts**: 产出文件清单（至少1个）
4. **risks**: 识别的风险（至少1个）
5. **next_role**: 下一个角色
6. **next_instruction**: 下一步明确指令

## 质量检查

- [ ] 所有必需字段已填写
- [ ] 决策有明确的理由
- [ ] 产出文件路径正确
- [ ] 风险识别全面
- [ ] 下一步指令清晰

## 输出方式

1. 在对话中输出完整 JSON
2. 说明交接给哪个角色
3. 简述下一步工作内容

---

**完整交接规范**: `.cursor/rules/agent-handover.md`
