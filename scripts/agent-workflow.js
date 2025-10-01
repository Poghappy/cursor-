#!/usr/bin/env node

/**
 * Cursor AI Agent 工作流引擎
 * 自动化管理 Agent 之间的协作流程和任务分发
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const AgentManager = require('./agent-manager');

class AgentWorkflow {
  constructor() {
    this.manager = new AgentManager();
    this.workflowsDir = path.join(process.cwd(), '.cursor', 'workflows');
    this.templatesDir = path.join(process.cwd(), 'prompts', 'workflows');
    this.workflows = {};
    this.currentWorkflow = null;

    this.init();
  }

  init() {
    console.log('🔄 Agent 工作流引擎启动中...');
    this.ensureDirectories();
    this.loadWorkflowTemplates();
  }

  // 确保目录存在
  ensureDirectories() {
    [this.workflowsDir, this.templatesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // 加载工作流模板
  loadWorkflowTemplates() {
    // 创建默认工作流模板
    const defaultWorkflows = {
      'full-development': {
        name: '完整开发流程',
        description: '从需求分析到部署的完整开发流程',
        stages: [
          {
            agent: 'po',
            stage: 'user_story',
            inputs: ['需求描述'],
            outputs: ['USER_STORIES.md'],
          },
          {
            agent: 'pm',
            stage: 'prd',
            inputs: ['USER_STORIES.md'],
            outputs: ['PRD.md'],
          },
          {
            agent: 'ba',
            stage: 'task_breakdown',
            inputs: ['PRD.md'],
            outputs: ['TASKS.md'],
          },
          {
            agent: 'arch',
            stage: 'tech_design',
            inputs: ['TASKS.md'],
            outputs: ['TECH_DESIGN.md'],
          },
          {
            agent: 'dev',
            stage: 'implementation',
            inputs: ['TECH_DESIGN.md'],
            outputs: ['代码实现'],
          },
          {
            agent: 'qa',
            stage: 'qa_test',
            inputs: ['代码实现'],
            outputs: ['TEST_PLAN.md'],
          },
          {
            agent: 'ops',
            stage: 'deployment',
            inputs: ['代码实现', 'TEST_PLAN.md'],
            outputs: ['部署配置'],
          },
        ],
        estimatedTime: '2-4 hours',
        complexity: 'high',
      },

      'quick-prototype': {
        name: '快速原型开发',
        description: '快速创建项目原型',
        stages: [
          {
            agent: 'po',
            stage: 'user_story',
            inputs: ['项目想法'],
            outputs: ['简要需求'],
          },
          {
            agent: 'arch',
            stage: 'tech_design',
            inputs: ['简要需求'],
            outputs: ['技术选型'],
          },
          {
            agent: 'dev',
            stage: 'implementation',
            inputs: ['技术选型'],
            outputs: ['原型代码'],
          },
        ],
        estimatedTime: '30-60 minutes',
        complexity: 'low',
      },

      refactoring: {
        name: '代码重构流程',
        description: '现有代码的重构和优化',
        stages: [
          {
            agent: 'arch',
            stage: 'analysis',
            inputs: ['现有代码'],
            outputs: ['重构方案'],
          },
          {
            agent: 'dev',
            stage: 'refactoring',
            inputs: ['重构方案'],
            outputs: ['重构代码'],
          },
          {
            agent: 'qa',
            stage: 'testing',
            inputs: ['重构代码'],
            outputs: ['测试报告'],
          },
        ],
        estimatedTime: '1-2 hours',
        complexity: 'medium',
      },

      'bug-fix': {
        name: '问题修复流程',
        description: '快速定位和修复问题',
        stages: [
          {
            agent: 'qa',
            stage: 'analysis',
            inputs: ['问题描述'],
            outputs: ['问题分析'],
          },
          {
            agent: 'dev',
            stage: 'fix',
            inputs: ['问题分析'],
            outputs: ['修复代码'],
          },
          {
            agent: 'qa',
            stage: 'verification',
            inputs: ['修复代码'],
            outputs: ['验证报告'],
          },
        ],
        estimatedTime: '15-30 minutes',
        complexity: 'low',
      },

      'feature-addition': {
        name: '新功能开发',
        description: '在现有项目中添加新功能',
        stages: [
          {
            agent: 'ba',
            stage: 'analysis',
            inputs: ['功能需求'],
            outputs: ['功能分析'],
          },
          {
            agent: 'arch',
            stage: 'design',
            inputs: ['功能分析'],
            outputs: ['设计方案'],
          },
          {
            agent: 'dev',
            stage: 'implementation',
            inputs: ['设计方案'],
            outputs: ['功能代码'],
          },
          {
            agent: 'qa',
            stage: 'testing',
            inputs: ['功能代码'],
            outputs: ['测试结果'],
          },
        ],
        estimatedTime: '1-3 hours',
        complexity: 'medium',
      },
    };

    // 保存默认工作流
    Object.entries(defaultWorkflows).forEach(([key, workflow]) => {
      const workflowFile = path.join(this.templatesDir, `${key}.json`);
      if (!fs.existsSync(workflowFile)) {
        fs.writeFileSync(workflowFile, JSON.stringify(workflow, null, 2));
      }
      this.workflows[key] = workflow;
    });

    console.log(`✅ 加载了 ${Object.keys(this.workflows).length} 个工作流模板`);
  }

  // 启动工作流
  async startWorkflow(workflowName, inputs = {}) {
    if (!this.workflows[workflowName]) {
      throw new Error(`工作流 '${workflowName}' 不存在`);
    }

    const workflow = this.workflows[workflowName];

    this.currentWorkflow = {
      id: this.generateWorkflowId(),
      name: workflowName,
      template: workflow,
      startTime: new Date().toISOString(),
      status: 'running',
      currentStage: 0,
      stages: workflow.stages.map(stage => ({
        ...stage,
        status: 'pending',
        startTime: null,
        endTime: null,
        artifacts: [],
        errors: [],
      })),
      inputs,
      results: {},
      metrics: {
        totalStages: workflow.stages.length,
        completedStages: 0,
        failedStages: 0,
        estimatedTime: workflow.estimatedTime,
        actualTime: null,
      },
    };

    console.log(`🚀 启动工作流: ${workflow.name} (${workflowName})`);
    console.log(
      `📊 预计时间: ${workflow.estimatedTime}, 复杂度: ${workflow.complexity}`
    );
    console.log(`🔢 总阶段数: ${workflow.stages.length}`);

    // 开始执行第一个阶段
    await this.executeNextStage();

    return this.currentWorkflow;
  }

  // 执行下一个阶段
  async executeNextStage() {
    if (!this.currentWorkflow || this.currentWorkflow.status !== 'running') {
      return false;
    }

    const currentStageIndex = this.currentWorkflow.currentStage;
    const stages = this.currentWorkflow.stages;

    if (currentStageIndex >= stages.length) {
      await this.completeWorkflow();
      return false;
    }

    const stage = stages[currentStageIndex];

    console.log(
      `\n🎯 执行阶段 ${currentStageIndex + 1}/${stages.length}: ${stage.agent} - ${stage.stage}`
    );

    try {
      // 标记阶段开始
      stage.status = 'running';
      stage.startTime = new Date().toISOString();

      // 验证输入
      const missingInputs = this.validateStageInputs(stage);
      if (missingInputs.length > 0) {
        throw new Error(`缺少必需输入: ${missingInputs.join(', ')}`);
      }

      // 启动对应的 Agent
      await this.manager.startAgent(stage.agent, `执行 ${stage.stage} 阶段`);

      // 生成阶段提示
      const prompt = this.generateStagePrompt(stage, currentStageIndex);
      console.log(`\n📝 Agent 提示:\n${prompt}`);

      // 等待用户确认或自动执行
      if (this.currentWorkflow.template.autoExecute !== false) {
        await this.waitForStageCompletion(stage);
      }

      return true;
    } catch (error) {
      console.error(`❌ 阶段执行失败: ${error.message}`);
      stage.status = 'failed';
      stage.endTime = new Date().toISOString();
      stage.errors.push({
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
      });

      this.currentWorkflow.metrics.failedStages++;

      // 决定是否继续
      const shouldContinue = await this.handleStageFailure(stage, error);
      if (shouldContinue) {
        this.currentWorkflow.currentStage++;
        return await this.executeNextStage();
      } else {
        this.currentWorkflow.status = 'failed';
        return false;
      }
    }
  }

  // 生成阶段提示
  generateStagePrompt(stage, stageIndex) {
    const workflow = this.currentWorkflow;
    const template = workflow.template;

    let prompt = `# ${template.name} - 阶段 ${stageIndex + 1}\n\n`;
    prompt += `## 当前任务\n`;
    prompt += `**Agent 角色**: ${stage.agent}\n`;
    prompt += `**阶段名称**: ${stage.stage}\n`;
    prompt += `**描述**: ${template.description}\n\n`;

    prompt += `## 输入材料\n`;
    stage.inputs.forEach(input => {
      prompt += `- ${input}\n`;
    });

    prompt += `\n## 预期输出\n`;
    stage.outputs.forEach(output => {
      prompt += `- ${output}\n`;
    });

    prompt += `\n## 上下文信息\n`;
    prompt += `- 工作流ID: ${workflow.id}\n`;
    prompt += `- 当前进度: ${stageIndex + 1}/${workflow.stages.length}\n`;
    prompt += `- 开始时间: ${workflow.startTime}\n`;

    if (stageIndex > 0) {
      prompt += `\n## 前序阶段结果\n`;
      for (let i = 0; i < stageIndex; i++) {
        const prevStage = workflow.stages[i];
        if (
          prevStage.status === 'completed' &&
          prevStage.artifacts.length > 0
        ) {
          prompt += `### ${prevStage.agent} - ${prevStage.stage}\n`;
          prevStage.artifacts.forEach(artifact => {
            prompt += `- ${artifact}\n`;
          });
        }
      }
    }

    prompt += `\n## 质量要求\n`;
    prompt += `- 遵循项目代码规范\n`;
    prompt += `- 确保输出完整性\n`;
    prompt += `- 提供清晰的文档\n`;
    prompt += `- 考虑后续阶段需求\n`;

    return prompt;
  }

  // 验证阶段输入
  validateStageInputs(stage) {
    const missingInputs = [];

    stage.inputs.forEach(input => {
      // 检查是否为文件
      if (input.endsWith('.md') || input.endsWith('.json')) {
        const filePath = path.join(process.cwd(), 'docs', input);
        if (!fs.existsSync(filePath)) {
          missingInputs.push(input);
        }
      }
      // 检查是否在工作流结果中
      else if (!this.currentWorkflow.results[input]) {
        missingInputs.push(input);
      }
    });

    return missingInputs;
  }

  // 等待阶段完成
  async waitForStageCompletion(stage) {
    return new Promise(resolve => {
      console.log(`⏳ 等待 ${stage.agent} 完成 ${stage.stage} 阶段...`);
      console.log(`💡 提示: 完成后输入 'workflow next' 继续下一阶段`);

      // 模拟等待 - 实际实现中可能需要监听文件变化或用户输入
      setTimeout(() => {
        this.completeCurrentStage();
        resolve();
      }, 2000);
    });
  }

  // 完成当前阶段
  completeCurrentStage(artifacts = []) {
    const currentStageIndex = this.currentWorkflow.currentStage;
    const stage = this.currentWorkflow.stages[currentStageIndex];

    stage.status = 'completed';
    stage.endTime = new Date().toISOString();
    stage.artifacts = artifacts;

    this.currentWorkflow.metrics.completedStages++;
    this.currentWorkflow.currentStage++;

    // 停止当前 Agent
    this.manager.stopAgent(stage.agent);

    console.log(`✅ 阶段完成: ${stage.agent} - ${stage.stage}`);

    // 自动进入下一阶段
    setTimeout(() => {
      this.executeNextStage();
    }, 1000);
  }

  // 处理阶段失败
  async handleStageFailure(stage, error) {
    console.log(`\n⚠️ 阶段失败处理:`);
    console.log(`- 失败阶段: ${stage.agent} - ${stage.stage}`);
    console.log(`- 错误信息: ${error.message}`);

    // 提供恢复选项
    console.log(`\n🔧 恢复选项:`);
    console.log(`1. 重试当前阶段`);
    console.log(`2. 跳过当前阶段`);
    console.log(`3. 终止工作流`);

    // 默认跳过失败阶段继续执行
    console.log(`📝 默认: 跳过失败阶段，继续执行`);
    return true;
  }

  // 完成工作流
  async completeWorkflow() {
    this.currentWorkflow.status = 'completed';
    this.currentWorkflow.endTime = new Date().toISOString();

    const startTime = new Date(this.currentWorkflow.startTime);
    const endTime = new Date(this.currentWorkflow.endTime);
    const actualTime = Math.round((endTime - startTime) / 1000 / 60); // 分钟

    this.currentWorkflow.metrics.actualTime = `${actualTime} minutes`;

    console.log(`\n🎉 工作流完成!`);
    console.log(`📊 执行统计:`);
    console.log(`- 总阶段: ${this.currentWorkflow.metrics.totalStages}`);
    console.log(`- 完成阶段: ${this.currentWorkflow.metrics.completedStages}`);
    console.log(`- 失败阶段: ${this.currentWorkflow.metrics.failedStages}`);
    console.log(`- 预计时间: ${this.currentWorkflow.metrics.estimatedTime}`);
    console.log(`- 实际时间: ${this.currentWorkflow.metrics.actualTime}`);

    // 保存工作流结果
    await this.saveWorkflowResult();

    // 生成总结报告
    await this.generateWorkflowReport();
  }

  // 保存工作流结果
  async saveWorkflowResult() {
    const resultFile = path.join(
      this.workflowsDir,
      `${this.currentWorkflow.id}.json`
    );
    fs.writeFileSync(resultFile, JSON.stringify(this.currentWorkflow, null, 2));
    console.log(`💾 工作流结果已保存: ${resultFile}`);
  }

  // 生成工作流报告
  async generateWorkflowReport() {
    const workflow = this.currentWorkflow;

    let report = `# 工作流执行报告\n\n`;
    report += `**工作流名称**: ${workflow.name}\n`;
    report += `**执行ID**: ${workflow.id}\n`;
    report += `**开始时间**: ${workflow.startTime}\n`;
    report += `**结束时间**: ${workflow.endTime}\n`;
    report += `**状态**: ${workflow.status}\n\n`;

    report += `## 执行统计\n\n`;
    report += `| 指标 | 值 |\n`;
    report += `|------|----|\n`;
    report += `| 总阶段数 | ${workflow.metrics.totalStages} |\n`;
    report += `| 完成阶段 | ${workflow.metrics.completedStages} |\n`;
    report += `| 失败阶段 | ${workflow.metrics.failedStages} |\n`;
    report += `| 成功率 | ${Math.round((workflow.metrics.completedStages / workflow.metrics.totalStages) * 100)}% |\n`;
    report += `| 预计时间 | ${workflow.metrics.estimatedTime} |\n`;
    report += `| 实际时间 | ${workflow.metrics.actualTime} |\n\n`;

    report += `## 阶段详情\n\n`;
    workflow.stages.forEach((stage, index) => {
      report += `### 阶段 ${index + 1}: ${stage.agent} - ${stage.stage}\n\n`;
      report += `- **状态**: ${stage.status}\n`;
      if (stage.startTime) {
        report += `- **开始时间**: ${stage.startTime}\n`;
      }
      if (stage.endTime) {
        report += `- **结束时间**: ${stage.endTime}\n`;
      }
      if (stage.artifacts.length > 0) {
        report += `- **产出物**: ${stage.artifacts.join(', ')}\n`;
      }
      if (stage.errors.length > 0) {
        report += `- **错误**: ${stage.errors.map(e => e.message).join(', ')}\n`;
      }
      report += `\n`;
    });

    const reportFile = path.join(this.workflowsDir, `${workflow.id}_report.md`);
    fs.writeFileSync(reportFile, report);
    console.log(`📄 工作流报告已生成: ${reportFile}`);
  }

  // 生成工作流ID
  generateWorkflowId() {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  // 获取可用工作流
  getAvailableWorkflows() {
    return Object.entries(this.workflows).map(([key, workflow]) => ({
      id: key,
      name: workflow.name,
      description: workflow.description,
      stages: workflow.stages.length,
      estimatedTime: workflow.estimatedTime,
      complexity: workflow.complexity,
    }));
  }

  // 获取当前工作流状态
  getCurrentWorkflowStatus() {
    if (!this.currentWorkflow) {
      return null;
    }

    return {
      id: this.currentWorkflow.id,
      name: this.currentWorkflow.name,
      status: this.currentWorkflow.status,
      progress: `${this.currentWorkflow.currentStage}/${this.currentWorkflow.stages.length}`,
      currentStage:
        this.currentWorkflow.stages[this.currentWorkflow.currentStage],
      metrics: this.currentWorkflow.metrics,
    };
  }

  // 暂停工作流
  pauseWorkflow() {
    if (this.currentWorkflow && this.currentWorkflow.status === 'running') {
      this.currentWorkflow.status = 'paused';
      console.log('⏸️ 工作流已暂停');
      return true;
    }
    return false;
  }

  // 恢复工作流
  resumeWorkflow() {
    if (this.currentWorkflow && this.currentWorkflow.status === 'paused') {
      this.currentWorkflow.status = 'running';
      console.log('▶️ 工作流已恢复');
      this.executeNextStage();
      return true;
    }
    return false;
  }

  // 取消工作流
  cancelWorkflow() {
    if (this.currentWorkflow) {
      this.currentWorkflow.status = 'cancelled';
      this.currentWorkflow.endTime = new Date().toISOString();
      console.log('❌ 工作流已取消');
      return true;
    }
    return false;
  }
}

// CLI 入口
async function main() {
  const args = process.argv.slice(2);
  const workflow = new AgentWorkflow();

  if (args.length === 0) {
    console.log('🔄 Agent 工作流引擎');
    console.log('\n可用工作流:');
    workflow.getAvailableWorkflows().forEach(wf => {
      console.log(
        `- ${wf.id}: ${wf.name} (${wf.stages} 阶段, ${wf.estimatedTime})`
      );
    });
    return;
  }

  const [command, ...params] = args;

  try {
    switch (command) {
      case 'list':
        console.log(JSON.stringify(workflow.getAvailableWorkflows(), null, 2));
        break;

      case 'start':
        if (params[0]) {
          const inputs = {};
          // 解析输入参数
          for (let i = 1; i < params.length; i += 2) {
            if (params[i] && params[i + 1]) {
              inputs[params[i]] = params[i + 1];
            }
          }
          await workflow.startWorkflow(params[0], inputs);
        } else {
          console.log('❌ 请指定工作流名称');
        }
        break;

      case 'status':
        const status = workflow.getCurrentWorkflowStatus();
        console.log(JSON.stringify(status, null, 2));
        break;

      case 'next':
        await workflow.executeNextStage();
        break;

      case 'complete':
        workflow.completeCurrentStage(params);
        break;

      case 'pause':
        workflow.pauseWorkflow();
        break;

      case 'resume':
        workflow.resumeWorkflow();
        break;

      case 'cancel':
        workflow.cancelWorkflow();
        break;

      default:
        console.log('❌ 未知命令');
        console.log(
          '可用命令: list, start, status, next, complete, pause, resume, cancel'
        );
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

module.exports = AgentWorkflow;
