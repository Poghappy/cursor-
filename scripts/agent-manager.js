#!/usr/bin/env node

/**
 * Cursor AI Agent 管理器
 * 用于管理和协调多个 Agent 的执行、状态跟踪和任务分发
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const readline = require('readline');

class AgentManager {
  constructor() {
    this.projectRoot = process.cwd();
    this.agentsDir = path.join(this.projectRoot, 'prompts', 'roles');
    this.stagesDir = path.join(this.projectRoot, 'prompts', 'stages');
    this.configFile = path.join(
      this.projectRoot,
      '.cursor',
      'agent-config.json'
    );
    this.logFile = path.join(this.projectRoot, '.cursor', 'agent-logs.json');
    this.currentSession = null;
    this.agents = {};
    this.stages = {};

    this.init();
  }

  init() {
    console.log('🤖 Cursor AI Agent Manager 启动中...');
    this.loadAgents();
    this.loadStages();
    this.loadConfig();
    this.createSession();
  }

  // 加载所有 Agent 角色
  loadAgents() {
    if (!fs.existsSync(this.agentsDir)) {
      console.error('❌ Agent 目录不存在:', this.agentsDir);
      return;
    }

    const agentFiles = fs
      .readdirSync(this.agentsDir)
      .filter(file => file.endsWith('.md') && !file.startsWith('_'));

    agentFiles.forEach(file => {
      const agentName = path.basename(file, '.md');
      const agentPath = path.join(this.agentsDir, file);
      const content = fs.readFileSync(agentPath, 'utf8');

      this.agents[agentName] = {
        name: agentName,
        file: file,
        path: agentPath,
        content: content,
        status: 'idle',
        lastActive: null,
        tasks: [],
        capabilities: this.extractCapabilities(content),
      };
    });

    console.log(
      `✅ 加载了 ${Object.keys(this.agents).length} 个 Agent:`,
      Object.keys(this.agents).join(', ')
    );
  }

  // 加载所有阶段模板
  loadStages() {
    if (!fs.existsSync(this.stagesDir)) {
      console.error('❌ 阶段目录不存在:', this.stagesDir);
      return;
    }

    const stageFiles = fs
      .readdirSync(this.stagesDir)
      .filter(file => file.endsWith('.md'));

    stageFiles.forEach(file => {
      const stageName = path.basename(file, '.md');
      const stagePath = path.join(this.stagesDir, file);
      const content = fs.readFileSync(stagePath, 'utf8');

      this.stages[stageName] = {
        name: stageName,
        file: file,
        path: stagePath,
        content: content,
        requiredInputs: this.extractRequiredInputs(content),
        expectedOutputs: this.extractExpectedOutputs(content),
      };
    });

    console.log(
      `✅ 加载了 ${Object.keys(this.stages).length} 个阶段:`,
      Object.keys(this.stages).join(', ')
    );
  }

  // 加载配置
  loadConfig() {
    const defaultConfig = {
      maxConcurrentAgents: 3,
      sessionTimeout: 3600000, // 1 hour
      autoHandover: true,
      logLevel: 'info',
      qualityChecks: true,
      backupEnabled: true,
    };

    if (fs.existsSync(this.configFile)) {
      try {
        const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
        this.config = { ...defaultConfig, ...config };
      } catch (error) {
        console.warn('⚠️ 配置文件解析失败，使用默认配置');
        this.config = defaultConfig;
      }
    } else {
      this.config = defaultConfig;
      this.saveConfig();
    }
  }

  // 保存配置
  saveConfig() {
    const configDir = path.dirname(this.configFile);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
  }

  // 创建新会话
  createSession() {
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: new Date().toISOString(),
      agents: {},
      currentStage: null,
      workflow: [],
      artifacts: [],
      decisions: [],
      risks: [],
    };

    console.log(`🎯 创建新会话: ${this.currentSession.id}`);
  }

  // 生成会话ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 提取 Agent 能力
  extractCapabilities(content) {
    const capabilities = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.includes('## 核心职责') || line.includes('## 主要任务')) {
        // 提取职责和任务
        const match = line.match(/[-*]\s*(.+)/);
        if (match) {
          capabilities.push(match[1].trim());
        }
      }
    }

    return capabilities;
  }

  // 提取必需输入
  extractRequiredInputs(content) {
    const inputs = [];
    const inputSection = content.match(/## 输入要求[\s\S]*?(?=##|$)/);

    if (inputSection) {
      const matches = inputSection[0].match(/[-*]\s*(.+)/g);
      if (matches) {
        inputs.push(
          ...matches.map(match => match.replace(/[-*]\s*/, '').trim())
        );
      }
    }

    return inputs;
  }

  // 提取预期输出
  extractExpectedOutputs(content) {
    const outputs = [];
    const outputSection = content.match(/## 输出交付物[\s\S]*?(?=##|$)/);

    if (outputSection) {
      const matches = outputSection[0].match(/[-*]\s*(.+)/g);
      if (matches) {
        outputs.push(
          ...matches.map(match => match.replace(/[-*]\s*/, '').trim())
        );
      }
    }

    return outputs;
  }

  // 启动 Agent
  async startAgent(agentName, task = null) {
    if (!this.agents[agentName]) {
      throw new Error(`Agent '${agentName}' 不存在`);
    }

    const agent = this.agents[agentName];

    if (agent.status === 'active') {
      console.log(`⚠️ Agent '${agentName}' 已经在运行中`);
      return false;
    }

    agent.status = 'active';
    agent.lastActive = new Date().toISOString();

    if (task) {
      agent.tasks.push({
        id: this.generateTaskId(),
        description: task,
        startTime: new Date().toISOString(),
        status: 'running',
      });
    }

    this.currentSession.agents[agentName] = {
      startTime: new Date().toISOString(),
      status: 'active',
      tasks: agent.tasks,
    };

    console.log(`🚀 启动 Agent: ${agentName}`);
    this.logActivity('agent_start', { agent: agentName, task });

    return true;
  }

  // 停止 Agent
  stopAgent(agentName) {
    if (!this.agents[agentName]) {
      throw new Error(`Agent '${agentName}' 不存在`);
    }

    const agent = this.agents[agentName];
    agent.status = 'idle';

    // 完成当前任务
    agent.tasks.forEach(task => {
      if (task.status === 'running') {
        task.status = 'completed';
        task.endTime = new Date().toISOString();
      }
    });

    if (this.currentSession.agents[agentName]) {
      this.currentSession.agents[agentName].status = 'completed';
      this.currentSession.agents[agentName].endTime = new Date().toISOString();
    }

    console.log(`⏹️ 停止 Agent: ${agentName}`);
    this.logActivity('agent_stop', { agent: agentName });
  }

  // 生成任务ID
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  // Agent 交接
  async handover(fromAgent, toAgent, artifacts = [], decisions = []) {
    console.log(`🔄 Agent 交接: ${fromAgent} → ${toAgent}`);

    // 验证 Agent 存在
    if (!this.agents[fromAgent] || !this.agents[toAgent]) {
      throw new Error('交接的 Agent 不存在');
    }

    // 生成交接 JSON
    const handoverData = {
      timestamp: new Date().toISOString(),
      fromAgent,
      toAgent,
      sessionId: this.currentSession.id,
      artifacts,
      decisions,
      context: this.getSessionContext(),
    };

    // 保存交接记录
    this.currentSession.workflow.push(handoverData);

    // 停止源 Agent，启动目标 Agent
    this.stopAgent(fromAgent);
    await this.startAgent(toAgent, `接收来自 ${fromAgent} 的交接`);

    this.logActivity('handover', handoverData);

    return handoverData;
  }

  // 获取会话上下文
  getSessionContext() {
    return {
      currentStage: this.currentSession.currentStage,
      activeAgents: Object.keys(this.currentSession.agents).filter(
        name => this.currentSession.agents[name].status === 'active'
      ),
      artifactCount: this.currentSession.artifacts.length,
      decisionCount: this.currentSession.decisions.length,
      duration: Date.now() - new Date(this.currentSession.startTime).getTime(),
    };
  }

  // 执行质量检查
  async runQualityCheck() {
    console.log('🔍 执行质量检查...');

    const checks = [];

    try {
      // ESLint 检查
      execSync('npm run lint', { stdio: 'pipe' });
      checks.push({ name: 'ESLint', status: 'passed' });
    } catch (error) {
      checks.push({ name: 'ESLint', status: 'failed', error: error.message });
    }

    try {
      // 测试检查
      execSync('npm test', { stdio: 'pipe' });
      checks.push({ name: 'Tests', status: 'passed' });
    } catch (error) {
      checks.push({ name: 'Tests', status: 'failed', error: error.message });
    }

    // 文件结构检查
    const requiredFiles = [
      'package.json',
      'README.md',
      '.gitignore',
      'src/',
      'tests/',
    ];

    const missingFiles = requiredFiles.filter(
      file => !fs.existsSync(path.join(this.projectRoot, file))
    );

    if (missingFiles.length === 0) {
      checks.push({ name: 'File Structure', status: 'passed' });
    } else {
      checks.push({
        name: 'File Structure',
        status: 'failed',
        error: `Missing files: ${missingFiles.join(', ')}`,
      });
    }

    const result = {
      timestamp: new Date().toISOString(),
      checks,
      passed: checks.every(check => check.status === 'passed'),
      summary: `${checks.filter(c => c.status === 'passed').length}/${checks.length} 检查通过`,
    };

    this.logActivity('quality_check', result);

    return result;
  }

  // 记录活动日志
  logActivity(type, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      sessionId: this.currentSession.id,
      type,
      data,
    };

    // 读取现有日志
    let logs = [];
    if (fs.existsSync(this.logFile)) {
      try {
        logs = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
      } catch (error) {
        console.warn('⚠️ 日志文件读取失败');
      }
    }

    // 添加新日志
    logs.push(logEntry);

    // 保持最近1000条日志
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }

    // 保存日志
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.writeFileSync(this.logFile, JSON.stringify(logs, null, 2));
  }

  // 获取 Agent 状态
  getAgentStatus(agentName = null) {
    if (agentName) {
      return this.agents[agentName] || null;
    }

    return Object.values(this.agents).map(agent => ({
      name: agent.name,
      status: agent.status,
      lastActive: agent.lastActive,
      taskCount: agent.tasks.length,
      capabilities: agent.capabilities.slice(0, 3), // 只显示前3个能力
    }));
  }

  // 获取推荐的下一个 Agent
  getRecommendedNextAgent(currentAgent, context = {}) {
    const workflow = {
      po: ['pm', 'ba'],
      pm: ['ba', 'pjm'],
      ba: ['pjm', 'arch'],
      pjm: ['arch', 'dev'],
      arch: ['dev', 'llme'],
      dev: ['qa', 'ops'],
      qa: ['ops', 'tw'],
      ops: ['tw', 'po'],
      tw: ['po', 'pm'],
    };

    const recommendations = workflow[currentAgent] || [];

    // 根据上下文调整推荐
    if (context.hasErrors) {
      recommendations.unshift('qa');
    }

    if (context.needsDeployment) {
      recommendations.unshift('ops');
    }

    return recommendations[0] || null;
  }

  // 交互式命令行界面
  async startInteractiveMode() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n🎮 进入交互模式 (输入 help 查看命令)');

    const prompt = () => {
      rl.question('\n> ', async input => {
        const [command, ...args] = input.trim().split(' ');

        try {
          switch (command.toLowerCase()) {
            case 'help':
              this.showHelp();
              break;

            case 'status':
              console.log(this.getAgentStatus());
              break;

            case 'start':
              if (args[0]) {
                await this.startAgent(args[0], args.slice(1).join(' '));
              } else {
                console.log('❌ 请指定 Agent 名称');
              }
              break;

            case 'stop':
              if (args[0]) {
                this.stopAgent(args[0]);
              } else {
                console.log('❌ 请指定 Agent 名称');
              }
              break;

            case 'handover':
              if (args.length >= 2) {
                await this.handover(args[0], args[1]);
              } else {
                console.log('❌ 请指定源 Agent 和目标 Agent');
              }
              break;

            case 'check':
              const result = await this.runQualityCheck();
              console.log(result);
              break;

            case 'session':
              console.log(this.currentSession);
              break;

            case 'exit':
            case 'quit':
              console.log('👋 再见！');
              rl.close();
              return;

            default:
              console.log('❌ 未知命令，输入 help 查看可用命令');
          }
        } catch (error) {
          console.error('❌ 错误:', error.message);
        }

        prompt();
      });
    };

    prompt();
  }

  // 显示帮助信息
  showHelp() {
    console.log(`
🤖 Cursor AI Agent Manager 命令:

基础命令:
  help                    显示此帮助信息
  status [agent]          显示 Agent 状态
  start <agent> [task]    启动指定 Agent
  stop <agent>            停止指定 Agent
  
工作流命令:
  handover <from> <to>    Agent 交接
  check                   运行质量检查
  session                 显示当前会话信息
  
系统命令:
  exit/quit              退出交互模式

可用 Agent: ${Object.keys(this.agents).join(', ')}
可用阶段: ${Object.keys(this.stages).join(', ')}
    `);
  }

  // 保存会话
  saveSession() {
    const sessionFile = path.join(
      this.projectRoot,
      '.cursor',
      `session_${this.currentSession.id}.json`
    );
    fs.writeFileSync(sessionFile, JSON.stringify(this.currentSession, null, 2));
    console.log(`💾 会话已保存: ${sessionFile}`);
  }
}

// CLI 入口
async function main() {
  const args = process.argv.slice(2);
  const manager = new AgentManager();

  if (args.length === 0) {
    // 交互模式
    await manager.startInteractiveMode();
  } else {
    // 命令行模式
    const [command, ...params] = args;

    try {
      switch (command) {
        case 'status':
          console.log(
            JSON.stringify(manager.getAgentStatus(params[0]), null, 2)
          );
          break;

        case 'start':
          if (params[0]) {
            await manager.startAgent(params[0], params.slice(1).join(' '));
          }
          break;

        case 'stop':
          if (params[0]) {
            manager.stopAgent(params[0]);
          }
          break;

        case 'check':
          const result = await manager.runQualityCheck();
          console.log(JSON.stringify(result, null, 2));
          break;

        default:
          console.log('❌ 未知命令，使用 --help 查看帮助');
      }
    } catch (error) {
      console.error('❌ 错误:', error.message);
      process.exit(1);
    }
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

module.exports = AgentManager;
