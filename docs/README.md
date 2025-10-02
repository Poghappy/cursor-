# 文档目录结构说明

本目录包含 Cursor IDE 多角色 Agent 协作框架的所有项目文档。

---

## 📁 目录结构

### 📦 product/ - 产品文档（PO负责）

**产品规划和需求定义文档**

- `PROJECT_BRIEF.md` - 项目概览（目标、里程碑、成功指标）
- `PRD.md` - 产品需求文档（原始版本）
- `PRD_v2.md` - 产品需求文档（完整版本）⭐
- `USER_STORIES.md` - 用户故事（Epic和详细故事）
- `PRODUCT_BACKLOG.md` - 产品待办事项（RICE评分）
- `PRODUCT_ROADMAP.md` - 产品路线图（3阶段发布计划）
- `PRODUCT_KPI.md` - 产品关键绩效指标

**推荐阅读顺序**: PROJECT_BRIEF → PRD_v2 → USER_STORIES → PRODUCT_ROADMAP

---

### 🎯 project/ - 项目管理文档（PM/BA负责）

**项目执行和任务管理文档**

- `MVP_PROJECT_PLAN.md` - MVP详细项目计划（4周计划）⭐
- `TASKS_SUMMARY.md` - 任务分解摘要（26个任务概览）
- `TASKS.md` - 详细任务列表
- `TASK_BOARD.md` - 任务看板（实时状态跟踪）⭐
- `ACCEPTANCE_CRITERIA.md` - 验收标准检查清单（26个任务详细标准）⭐
- `KICKOFF_MEETING.md` - Kick-off会议材料（完整议程）⭐

**推荐阅读顺序**: MVP_PROJECT_PLAN → TASK_BOARD → ACCEPTANCE_CRITERIA → KICKOFF_MEETING

**每日必看**: TASK_BOARD.md

---

### 🔧 technical/ - 技术文档（Arch/Dev负责）

**技术设计和测试计划文档**

- `TECH_DESIGN.md` - 技术架构设计
- `TEST_PLAN.md` - 测试计划

---

### 💻 cursor/ - Cursor IDE 文档

**Cursor IDE 使用和集成指南**

- `CURSOR_GUIDE_2025-09-30.md` - Cursor实战指南（MCP、规则）⭐
- `CURSOR_OFFICIAL_DOCS_COMPLETE.md` - Cursor官方文档完整版（17章节）
- `CURSOR_IDE_INTEGRATION.md` - Cursor IDE集成指南
- `CURSOR_TROUBLESHOOTING.md` - Cursor故障排查指南
- `INTELLIGENT_SYSTEM_GUIDE.md` - 智能系统使用指南

**新手入门**: CURSOR_GUIDE_2025-09-30.md  
**问题排查**: CURSOR_TROUBLESHOOTING.md

---

### 📋 templates/ - 模板和参考

**可复用的模板和参考资料**

- `QUICK_START_TEMPLATE.md` - 快速开始模板
- `TEMPLATE_USAGE_GUIDE.md` - 模板使用指南
- `REFERENCE_REPOS.md` - 参考仓库列表

---

### 📝 summaries/ - 阶段总结

**各角色阶段工作总结文档**

- `PO_WORK_SUMMARY_2025-10-01.md` - PO阶段工作总结
- 更多总结文档将在各阶段完成后添加...

---

### 📄 根目录文件

- `CHANGELOG.md` - 项目变更日志
- `README.md` - 本文档（目录结构说明）

---

## 🚀 快速导航

### 新成员上手

**第一天**:

1. 阅读 `product/PROJECT_BRIEF.md` - 了解项目全貌
2. 阅读 `product/PRD_v2.md` - 理解产品需求
3. 阅读 `project/KICKOFF_MEETING.md` - 了解团队和流程

**第二天**:

1. 阅读 `project/MVP_PROJECT_PLAN.md` - 理解4周计划
2. 阅读 `project/TASK_BOARD.md` - 查看当前进度
3. 阅读 `project/ACCEPTANCE_CRITERIA.md` - 了解验收标准

**第三天**:

1. 阅读 `cursor/CURSOR_GUIDE_2025-09-30.md` - 学习工具使用
2. 开始承接任务

### 每日工作流程

**每天早上**:

1. ✅ 查看 `project/TASK_BOARD.md` - 了解整体进度
2. ✅ 参加每日站会（9:00-9:15）
3. ✅ 更新自己负责任务的状态

**开发过程中**:

1. 📋 参考 `project/ACCEPTANCE_CRITERIA.md` - 对照验收标准
2. 🔍 遇到问题查看 `cursor/CURSOR_TROUBLESHOOTING.md`

**任务完成时**:

1. ✅ 逐项检查 `ACCEPTANCE_CRITERIA.md` 中的验收清单
2. ✅ 更新 `TASK_BOARD.md` 任务状态

### 按角色分类

**Product Owner (PO)**:

- 主要关注: `product/` 目录
- 核心文档: PRD_v2, PRODUCT_ROADMAP, PRODUCT_KPI

**Project Manager (PM)**:

- 主要关注: `project/` 目录
- 核心文档: MVP_PROJECT_PLAN, TASK_BOARD, KICKOFF_MEETING

**Business Analyst (BA)**:

- 主要关注: `project/` 目录
- 核心文档: ACCEPTANCE_CRITERIA, TASK_BOARD, USER_STORIES

**Architect (Arch)**:

- 主要关注: `technical/` + `project/` 目录
- 核心文档: TECH_DESIGN, ACCEPTANCE_CRITERIA

**Developer (Dev)**:

- 主要关注: 所有目录
- 核心文档: TECH_DESIGN, ACCEPTANCE_CRITERIA, TASK_BOARD, CURSOR_GUIDE

**QA Engineer (QA)**:

- 主要关注: `technical/` + `project/` 目录
- 核心文档: TEST_PLAN, ACCEPTANCE_CRITERIA, TASK_BOARD

**Technical Writer (TW)**:

- 主要关注: 所有目录
- 核心文档: 所有文档（审阅和完善）

---

## 📊 文档统计

**总文档数**: 25个文档

**按类型统计**:

- 产品文档: 7个
- 项目管理文档: 6个
- 技术文档: 2个
- Cursor文档: 5个
- 模板参考: 3个
- 阶段总结: 1个
- 其他: 1个

**按状态统计**:

- ✅ 已完成: 11个（PO+PM+BA阶段）
- 🚧 进行中: 2个（技术文档待完善）
- 📋 计划中: 12个（后续阶段产出）

---

## 🔄 文档更新规则

### 更新频率

**每日更新**:

- `project/TASK_BOARD.md` - 每日站会后更新

**按需更新**:

- `project/ACCEPTANCE_CRITERIA.md` - 验收标准调整时
- `CHANGELOG.md` - 重要变更时

**里程碑更新**:

- `summaries/` - 每个里程碑结束时添加总结

### 命名规范

**阶段总结文档**:

- 格式: `{ROLE}_WORK_SUMMARY_{DATE}.md`
- 示例: `PO_WORK_SUMMARY_2025-10-01.md`

**会议记录**:

- 格式: `{MEETING_TYPE}_MEETING_{DATE}.md`
- 示例: `KICKOFF_MEETING.md`, `REVIEW_MEETING_2025-10-14.md`

---

## 💡 使用建议

### 1. 文档搜索

**按功能搜索**:

- 需求相关 → `product/`
- 任务执行 → `project/`
- 技术实现 → `technical/`
- 工具使用 → `cursor/`

**按阶段搜索**:

- 需求分析 → `product/PRD_v2.md`
- 项目规划 → `project/MVP_PROJECT_PLAN.md`
- 任务执行 → `project/TASK_BOARD.md`
- 阶段总结 → `summaries/`

### 2. 文档链接

所有文档支持相互引用，使用相对路径：

```markdown
参考 [产品需求文档](../product/PRD_v2.md) 参考 [任务看板](./TASK_BOARD.md)
```

### 3. 保持同步

- 📝 修改文档后及时通知相关人员
- 🔄 重要文档变更时更新 CHANGELOG.md
- 💬 使用Git提交信息说明变更原因

---

## 📞 文档维护

**负责人**: BA (Business Analyst)  
**更新时间**: 2025-10-01  
**版本**: v1.0

如有文档组织方面的建议，请联系BA或PM。

---

**🎯 清晰的文档组织是高效协作的基础！**
