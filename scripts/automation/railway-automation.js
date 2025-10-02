#!/usr/bin/env node

/**
 * Railway 部署自动化脚本
 * 提供一键部署到 Railway 平台的完整解决方案
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class RailwayAutomation {
  constructor() {
    this.projectRoot = process.cwd();
    this.railwayConfig = null;
    this.deploymentHistory = [];
    
    this.init();
  }

  async init() {
    console.log('🚂 Railway 部署自动化系统启动中...');
    await this.loadConfig();
    await this.checkRailwayCLI();
    console.log('✅ Railway 自动化系统就绪');
  }

  // 加载配置
  async loadConfig() {
    const configFile = path.join(this.projectRoot, 'railway.json');
    
    if (fs.existsSync(configFile)) {
      try {
        this.railwayConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        console.log('📋 已加载 Railway 配置');
      } catch (error) {
        console.warn('⚠️ Railway 配置文件解析失败，使用默认配置');
        this.railwayConfig = this.getDefaultConfig();
      }
    } else {
      console.log('📝 创建默认 Railway 配置...');
      this.railwayConfig = this.getDefaultConfig();
      await this.saveConfig();
    }
  }

  // 获取默认配置
  getDefaultConfig() {
    return {
      projectName: path.basename(this.projectRoot),
      environment: 'production',
      buildCommand: 'npm run build',
      startCommand: 'npm start',
      healthCheck: {
        enabled: true,
        path: '/health',
        timeout: 30
      },
      environmentVariables: {
        NODE_ENV: 'production',
        PORT: '${{RAILWAY_PORT}}'
      },
      domains: [],
      services: {
        web: {
          source: '.',
          buildCommand: 'npm run build',
          startCommand: 'npm start'
        }
      },
      deployment: {
        autoRedeploy: true,
        rollbackOnFailure: true,
        notifications: {
          slack: false,
          email: true
        }
      }
    };
  }

  // 保存配置
  async saveConfig() {
    const configFile = path.join(this.projectRoot, 'railway.json');
    fs.writeFileSync(configFile, JSON.stringify(this.railwayConfig, null, 2));
    console.log('💾 Railway 配置已保存');
  }

  // 检查 Railway CLI
  async checkRailwayCLI() {
    try {
      execSync('railway --version', { stdio: 'pipe' });
      console.log('✅ Railway CLI 已安装');
    } catch (error) {
      console.error('❌ Railway CLI 未安装');
      console.log('📥 安装 Railway CLI:');
      console.log('  npm install -g @railway/cli');
      console.log('  或访问: https://railway.app/cli');
      throw new Error('Railway CLI 未安装');
    }
  }

  // 登录 Railway
  async login() {
    console.log('🔐 登录 Railway...');
    
    try {
      execSync('railway login', { stdio: 'inherit' });
      console.log('✅ Railway 登录成功');
    } catch (error) {
      console.error('❌ Railway 登录失败');
      throw error;
    }
  }

  // 初始化项目
  async initProject() {
    console.log('🚀 初始化 Railway 项目...');
    
    try {
      // 检查是否已经初始化
      if (fs.existsSync(path.join(this.projectRoot, '.railway'))) {
        console.log('📋 项目已初始化');
        return;
      }

      // 初始化新项目
      execSync('railway init', { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      
      console.log('✅ Railway 项目初始化完成');
    } catch (error) {
      console.error('❌ 项目初始化失败:', error.message);
      throw error;
    }
  }

  // 配置环境变量
  async configureEnvironment() {
    console.log('⚙️ 配置环境变量...');
    
    const envVars = this.railwayConfig.environmentVariables;
    
    for (const [key, value] of Object.entries(envVars)) {
      try {
        execSync(`railway variables set ${key}="${value}"`, {
          stdio: 'pipe',
          cwd: this.projectRoot
        });
        console.log(`✅ 设置环境变量: ${key}`);
      } catch (error) {
        console.warn(`⚠️ 设置环境变量失败: ${key}`);
      }
    }

    // 从 .env 文件读取额外变量
    await this.syncEnvFile();
  }

  // 同步 .env 文件
  async syncEnvFile() {
    const envFile = path.join(this.projectRoot, '.env');
    
    if (!fs.existsSync(envFile)) {
      console.log('📝 未找到 .env 文件');
      return;
    }

    console.log('🔄 同步 .env 文件到 Railway...');
    
    const envContent = fs.readFileSync(envFile, 'utf8');
    const envLines = envContent.split('\n').filter(line => 
      line.trim() && !line.startsWith('#')
    );

    for (const line of envLines) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      
      if (key && value) {
        try {
          execSync(`railway variables set ${key.trim()}="${value.trim()}"`, {
            stdio: 'pipe',
            cwd: this.projectRoot
          });
          console.log(`✅ 同步环境变量: ${key.trim()}`);
        } catch (error) {
          console.warn(`⚠️ 同步失败: ${key.trim()}`);
        }
      }
    }
  }

  // 生成 Railway 配置文件
  async generateRailwayFiles() {
    console.log('📄 生成 Railway 配置文件...');

    // 生成 railway.toml
    const railwayToml = `[build]`
command = "${this.railwayConfig.buildCommand}"

[deploy]
startCommand = "${this.railwayConfig.startCommand}"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[healthcheck]
enabled = ${this.railwayConfig.healthCheck.enabled}
path = "${this.railwayConfig.healthCheck.path}"
timeout = ${this.railwayConfig.healthCheck.timeout}
`;`

    fs.writeFileSync(path.join(this.projectRoot, 'railway.toml'), railwayToml);
    console.log('✅ 生成 railway.toml');

    // 生成 Dockerfile (如果不存在)
    await this.generateDockerfile();

    // 生成 .railwayignore
    await this.generateRailwayIgnore();
  }

  // 生成 Dockerfile
  async generateDockerfile() {
    const dockerfilePath = path.join(this.projectRoot, 'Dockerfile');
    
    if (fs.existsSync(dockerfilePath)) {
      console.log('📋 Dockerfile 已存在');
      return;
    }

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
    );

    const dockerfile = `# Railway Dockerfile`
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:$PORT/health || exit 1

# Start application
CMD ["npm", "start"]
`;`

    fs.writeFileSync(dockerfilePath, dockerfile);
    console.log('✅ 生成 Dockerfile');
  }

  // 生成 .railwayignore
  async generateRailwayIgnore() {
    const ignorePath = path.join(this.projectRoot, '.railwayignore');
    
    const ignoreContent = `# Railway ignore file`
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.env.local
.env.development.local
.env.test.local
.env.production.local
coverage/
.nyc_output/
.cache/
dist/
build/
.DS_Store
Thumbs.db
*.log
.git/
.vscode/
.idea/
*.swp
*.swo
*~
`;`

    fs.writeFileSync(ignorePath, ignoreContent);
    console.log('✅ 生成 .railwayignore');
  }

  // 部署应用
  async deploy(options = {}) {
    console.log('🚀 开始部署到 Railway...');
    
    const deploymentId = `deploy_${Date.now()}`;
    const startTime = new Date();

    try {
      // 预部署检查
      await this.preDeploymentCheck();

      // 执行部署
      const deployCommand = options.detach ? 'railway up --detach' : 'railway up';
      
      console.log('📦 执行部署命令...');
      const result = execSync(deployCommand, {
        stdio: 'pipe',
        cwd: this.projectRoot,
        encoding: 'utf8'
      });

      console.log('✅ 部署命令执行完成');
      console.log(result);

      // 等待部署完成
      if (!options.detach) {
        await this.waitForDeployment();
      }

      // 记录部署历史
      const deployment = {
        id: deploymentId,
        timestamp: startTime.toISOString(),
        status: 'success',
        duration: Date.now() - startTime.getTime(),
        commit: this.getCurrentCommit(),
        environment: this.railwayConfig.environment
      };

      this.deploymentHistory.push(deployment);
      await this.saveDeploymentHistory();

      console.log('🎉 部署成功完成！');
      
      // 显示部署信息
      await this.showDeploymentInfo();

    } catch (error) {
      console.error('❌ 部署失败:', error.message);
      
      // 记录失败的部署
      const deployment = {
        id: deploymentId,
        timestamp: startTime.toISOString(),
        status: 'failed',
        error: error.message,
        duration: Date.now() - startTime.getTime()
      };

      this.deploymentHistory.push(deployment);
      await this.saveDeploymentHistory();

      throw error;
    }
  }

  // 预部署检查
  async preDeploymentCheck() {
    console.log('🔍 执行预部署检查...');

    const checks = [];

    // 检查 package.json
    if (!fs.existsSync(path.join(this.projectRoot, 'package.json'))) {
      checks.push('❌ 缺少 package.json');
    } else {
      checks.push('✅ package.json 存在');
    }

    // 检查构建脚本
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
    );

    if (!packageJson.scripts || !packageJson.scripts.build) {
      checks.push('⚠️ 缺少 build 脚本');
    } else {
      checks.push('✅ build 脚本存在');
    }

    if (!packageJson.scripts || !packageJson.scripts.start) {
      checks.push('❌ 缺少 start 脚本');
    } else {
      checks.push('✅ start 脚本存在');
    }

    // 检查环境变量
    const requiredEnvVars = ['NODE_ENV'];
    for (const envVar of requiredEnvVars) {
      if (this.railwayConfig.environmentVariables[envVar]) {
        checks.push(`✅ 环境变量 ${envVar} 已配置`);
      } else {
        checks.push(`⚠️ 环境变量 ${envVar} 未配置`);
      }
    }

    console.log('检查结果:');
    checks.forEach(check => console.log(`  ${check}`));

    const hasErrors = checks.some(check => check.startsWith('❌'));
    if (hasErrors) {
      throw new Error('预部署检查失败，请修复上述问题');
    }

    console.log('✅ 预部署检查通过');
  }

  // 等待部署完成
  async waitForDeployment() {
    console.log('⏳ 等待部署完成...');
    
    // 这里可以添加更复杂的部署状态检查逻辑
    // 目前简单等待一段时间
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // 获取当前 Git 提交
  getCurrentCommit() {
    try {
      return execSync('git rev-parse HEAD', { 
        stdio: 'pipe', 
        encoding: 'utf8' 
      }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  // 显示部署信息
  async showDeploymentInfo() {
    console.log('\n📊 部署信息:');
    
    try {
      // 获取项目信息
      const projectInfo = execSync('railway status', {
        stdio: 'pipe',
        encoding: 'utf8',
        cwd: this.projectRoot
      });
      
      console.log(projectInfo);
    } catch (error) {
      console.warn('⚠️ 无法获取项目状态');
    }

    // 显示访问链接
    console.log('\n🔗 访问链接:');
    console.log('  Railway Dashboard: https://railway.app/dashboard');
    console.log('  项目日志: railway logs');
    console.log('  项目状态: railway status');
  }

  // 保存部署历史
  async saveDeploymentHistory() {
    const historyFile = path.join(this.projectRoot, '.railway-history.json');
    fs.writeFileSync(historyFile, JSON.stringify(this.deploymentHistory, null, 2));
  }

  // 回滚部署
  async rollback(deploymentId = null) {
    console.log('🔄 执行部署回滚...');
    
    try {
      if (deploymentId) {
        execSync(`railway rollback ${deploymentId}`, {
          stdio: 'inherit',
          cwd: this.projectRoot
        });
      } else {
        execSync('railway rollback', {
          stdio: 'inherit',
          cwd: this.projectRoot
        });
      }
      
      console.log('✅ 回滚成功');
    } catch (error) {
      console.error('❌ 回滚失败:', error.message);
      throw error;
    }
  }

  // 查看日志
  async logs(options = {}) {
    console.log('📋 获取应用日志...');
    
    try {
      let logCommand = 'railway logs';
      
      if (options.follow) {
        logCommand += ' --follow';
      }
      
      if (options.lines) {
        logCommand += ` --lines ${options.lines}`;
      }

      execSync(logCommand, {
        stdio: 'inherit',
        cwd: this.projectRoot
      });
    } catch (error) {
      console.error('❌ 获取日志失败:', error.message);
    }
  }

  // 管理域名
  async manageDomains() {
    console.log('🌐 管理自定义域名...');
    
    try {
      execSync('railway domains', {
        stdio: 'inherit',
        cwd: this.projectRoot
      });
    } catch (error) {
      console.error('❌ 域名管理失败:', error.message);
    }
  }

  // 智能对话接口
  async chat(userInput) {
    console.log('💬 Railway 部署助手为您服务...');

    try {
      let response = '';

      if (userInput.includes('部署') || userInput.includes('deploy')) {
        response = `🚀 我来帮您部署到 Railway！`

当前配置:
- 项目: ${this.railwayConfig.projectName}
- 构建命令: ${this.railwayConfig.buildCommand}
- 启动命令: ${this.railwayConfig.startCommand}

部署步骤:
1. 检查配置和环境变量
2. 生成必要的配置文件
3. 执行部署命令
4. 监控部署状态

是否现在开始部署？`;

      } else if (userInput.includes('配置') || userInput.includes('config')) {
        response = `⚙️ Railway 配置管理`

当前配置文件: railway.json
环境变量: ${Object.keys(this.railwayConfig.environmentVariables).length} 个

可用操作:
- 查看配置: railway status
- 设置环境变量: railway variables set KEY=VALUE
- 查看日志: railway logs
- 管理域名: railway domains

需要修改哪个配置？`;

      } else if (userInput.includes('日志') || userInput.includes('logs')) {
        response = `📋 查看应用日志`

可用选项:
- 实时日志: railway logs --follow
- 最近日志: railway logs --lines 100
- 错误日志: railway logs | grep ERROR

输入 "查看日志" 开始查看实时日志。`;

      } else {
        response = `🚂 Railway 部署自动化助手`

我可以帮您:
- 🚀 一键部署应用到 Railway
- ⚙️ 配置环境变量和域名
- 📋 查看应用日志和状态
- 🔄 执行回滚操作
- 🌐 管理自定义域名

请告诉我您需要什么帮助？`;`
      }

      return {
        message: response,
        quickActions: [
          { label: '立即部署', command: 'deploy', description: '开始部署到 Railway' },
          { label: '查看日志', command: 'logs', description: '查看应用日志' },
          { label: '配置管理', command: 'config', description: '管理项目配置' },
          { label: '域名管理', command: 'domains', description: '管理自定义域名' }
        ]
      };

    } catch (error) {
      return {
        message: `❌ 处理请求时出现错误: ${error.message}`,
        error: true
      };
    }
  }
}

// CLI 入口
async function main() {
  const args = process.argv.slice(2);
  const automation = new RailwayAutomation();

  if (args.length === 0) {
    console.log('🚂 Railway 部署自动化');
    console.log('💡 告诉我您需要什么帮助...\n');

    // 启动交互模式
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const chat = async () => {
      rl.question('🗣️ 您: ', async (input) => {
        if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
          console.log('👋 再见！Railway 部署愉快！');
          rl.close();
          return;
        }

        try {
          const response = await automation.chat(input);
          console.log('\n🤖 助手:', response.message);

          if (response.quickActions && response.quickActions.length > 0) {
            console.log('\n⚡ 快捷操作:');
            response.quickActions.forEach((action, index) => {
              console.log(`${index + 1}. ${action.label} - ${action.description}`);
            });
          }
        } catch (error) {
          console.error('❌ 处理请求时出错:', error.message);
        }

        chat();
      });
    };

    chat();
  } else {
    // 命令行模式
    const [command, ...params] = args;

    try {
      switch (command) {
        case 'init':
          await automation.login();
          await automation.initProject();
          await automation.generateRailwayFiles();
          break;

        case 'deploy':
          const deployOptions = {
            detach: params.includes('--detach')
          };
          await automation.deploy(deployOptions);
          break;

        case 'config':
          await automation.configureEnvironment();
          break;

        case 'logs':
          const logOptions = {
            follow: params.includes('--follow'),
            lines: params.find(p => p.startsWith('--lines='))?.split('=')[1]
          };
          await automation.logs(logOptions);
          break;

        case 'rollback':
          const deploymentId = params[0];
          await automation.rollback(deploymentId);
          break;

        case 'domains':
          await automation.manageDomains();
          break;

        default:
          console.log('可用命令: init, deploy, config, logs, rollback, domains');
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

module.exports = RailwayAutomation;
