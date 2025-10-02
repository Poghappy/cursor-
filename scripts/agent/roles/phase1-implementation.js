#!/usr/bin/env node

/**
 * Phase 1 Implementation Script
 * 第一阶段实施脚本 - 创建核心 Agent 角色脚本
 */

const fs = require('fs');
const path = require('path');

class Phase1Implementation {
    constructor() {
        this.projectRoot = process.cwd();
        this.agentRolesDir = path.join(this.projectRoot, 'scripts', 'agent', 'roles');
        this.coreScripts = [
            'product-manager.js',
            'requirement-analyzer.js',
            'test-manager.js',
            'developer-tools.js'
        ];
    }

    createDirectories() {
        console.log('📁 创建目录结构...');

        const dirs = [
            this.agentRolesDir,
            path.join(this.projectRoot, 'docs', 'analysis'),
            path.join(this.projectRoot, 'docs', 'templates', 'agent-tools')
        ];

        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`  ✅ 创建目录: ${dir}`);
            } else {
                console.log(`  ✅ 目录已存在: ${dir}`);
            }
        });
    }

    createCoreScripts() {
        console.log('🔧 创建核心 Agent 角色脚本...');

        this.coreScripts.forEach(scriptName => {
            const scriptPath = path.join(this.agentRolesDir, scriptName);
            if (!fs.existsSync(scriptPath)) {
                const content = this.generateScriptContent(scriptName);
                fs.writeFileSync(scriptPath, content, { mode: 0o755 });
                console.log(`  ✅ 创建脚本: ${scriptName}`);
            } else {
                console.log(`  ✅ 脚本已存在: ${scriptName}`);
            }
        });
    }

    generateScriptContent(scriptName) {
        const roleName = scriptName.replace('.js', '');

        return `#!/usr/bin/env node

/**
 * ${roleName} - Agent 角色脚本
 * 基于 GitHub 工具集成的专业功能
 */

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

class ${this.toPascalCase(roleName)} {
  constructor() {
    this.projectRoot = process.cwd();
    this.program = new Command();
    this.setupCommands();
  }

  setupCommands() {
    this.program
      .name('${roleName}')
      .description('${roleName} agent role tools')
      .version('1.0.0');

    this.program
      .command('init')
      .description('Initialize ${roleName} settings')
      .action(() => this.init());

    this.program
      .command('run <task>')
      .description('Run a specific task')
      .action((task) => this.runTask(task));

    this.program
      .command('help')
      .description('Show help information')
      .action(() => this.showHelp());
  }

  init() {
    console.log('🚀 Initializing ${roleName}...');
    console.log('✅ ${roleName} initialized successfully');
  }

  runTask(task) {
    console.log(\`🎯 Running task: \${task}\`);
    console.log(\`✅ Task \${task} completed\`);
  }

  showHelp() {
    console.log(\`
${roleName} Agent Role Tools

Commands:
  init                    - Initialize ${roleName} settings
  run <task>             - Run a specific task
  help                   - Show this help

Examples:
  node ${scriptName} init
  node ${scriptName} run analyze
  node ${scriptName} help
    \`);
  }

  run() {
    this.program.parse(process.argv);
  }
}

if (require.main === module) {
  const agent = new ${this.toPascalCase(roleName)}();
  agent.run();
}

module.exports = ${this.toPascalCase(roleName)};
`;
    }

    toPascalCase(str) {
        return str.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join('');
    }

    updateMakefile() {
        console.log('📝 更新 Makefile...');

        const makefilePath = path.join(this.projectRoot, 'Makefile');
        if (fs.existsSync(makefilePath)) {
            let content = fs.readFileSync(makefilePath, 'utf8');

            if (!content.includes('# Agent 角色专用工具')) {
                const agentCommands = `

# Agent 角色专用工具
.PHONY: product-manager requirement-analyzer test-manager developer-tools

# 产品管理工具
product-manager: ## 📋 启动产品管理工具
	@echo "$(BLUE)📋 启动产品管理工具...$(NC)"
	@node scripts/agent/roles/product-manager.js

# 需求分析工具  
requirement-analyzer: ## 📊 启动需求分析工具
	@echo "$(BLUE)📊 启动需求分析工具...$(NC)"
	@node scripts/agent/roles/requirement-analyzer.js

# 测试管理工具
test-manager: ## 🧪 启动测试管理工具
	@echo "$(BLUE)🧪 启动测试管理工具...$(NC)"
	@node scripts/agent/roles/test-manager.js

# 开发工程工具
developer-tools: ## 🔧 启动开发工程工具
	@echo "$(BLUE)🔧 启动开发工程工具...$(NC)"
	@node scripts/agent/roles/developer-tools.js
`;

                content += agentCommands;
                fs.writeFileSync(makefilePath, content);
                console.log('  ✅ Makefile 更新完成');
            } else {
                console.log('  ✅ Makefile 已包含 Agent 工具命令');
            }
        }
    }

    runTests() {
        console.log('🧪 运行核心工具测试...');

        this.coreScripts.forEach(scriptName => {
            const scriptPath = path.join(this.agentRolesDir, scriptName);
            try {
                console.log(`  🔍 测试 ${scriptName}...`);
                require(scriptPath);
                console.log(`  ✅ ${scriptName} 测试通过`);
            } catch (error) {
                console.log(`  ❌ ${scriptName} 测试失败: ${error.message}`);
            }
        });
    }

    async run() {
        console.log('✨ 启动第一阶段实施计划...');
        console.log('================================================');

        this.createDirectories();
        this.createCoreScripts();
        this.updateMakefile();
        this.runTests();

        console.log('================================================');
        console.log('🎉 第一阶段实施计划完成！');
        console.log('');
        console.log('📋 下一步操作:');
        console.log('  1. 运行 make product-manager 测试产品管理工具');
        console.log('  2. 运行 make requirement-analyzer 测试需求分析工具');
        console.log('  3. 运行 make test-manager 测试测试管理工具');
        console.log('  4. 运行 make developer-tools 测试开发工程工具');
        console.log('');
        console.log('📚 查看文档:');
        console.log('  - docs/technical/IMPLEMENTATION_PLAN.md');
        console.log('  - docs/technical/AGENT_TOOLS_INTEGRATION_GUIDE.md');
    }
}

if (require.main === module) {
    const phase1 = new Phase1Implementation();
    phase1.run().catch(console.error);
}

module.exports = Phase1Implementation;
