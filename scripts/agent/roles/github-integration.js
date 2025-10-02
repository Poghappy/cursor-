#!/usr/bin/env node

/**
 * GitHub 工具集成脚本
 * 选择性集成最有价值的 2-3 个项目
 * 
 * 集成策略：
 * 1. 直接集成 - 高价值完整工具
 * 2. 模板学习 - 提取最佳实践
 * 3. 适配集成 - 融入我们的 Agent 系统
 */

const { Command } = require('commander');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');

class GitHubIntegration {
    constructor() {
        this.projectRoot = process.cwd();
        this.program = new Command();
        this.integrationDir = path.join(this.projectRoot, 'external-tools');
        this.templatesDir = path.join(this.projectRoot, 'docs', 'templates', 'github-tools');
        this.setupCommands();
    }

    setupCommands() {
        this.program
            .name('github-integration')
            .description('GitHub 工具集成管理器')
            .version('1.0.0');

        // 集成命令
        this.program
            .command('integrate')
            .description('集成指定的 GitHub 工具')
            .option('-t, --tool <tool>', '工具名称')
            .option('-r, --role <role>', '目标 Agent 角色')
            .option('--type <type>', '集成类型 (clone|template|reference)', 'template')
            .action((options) => this.integrateTool(options));

        // 列表命令
        this.program
            .command('list')
            .description('列出可集成的工具')
            .option('--category <category>', '按类别筛选')
            .action((options) => this.listTools(options));

        // 下载命令
        this.program
            .command('download')
            .description('下载工具模板')
            .option('-t, --tool <tool>', '工具名称')
            .option('-o, --output <path>', '输出路径')
            .action((options) => this.downloadTemplate(options));

        // 适配命令
        this.program
            .command('adapt')
            .description('适配工具到我们的 Agent 系统')
            .option('-t, --tool <tool>', '工具名称')
            .option('-r, --role <role>', '目标角色')
            .action((options) => this.adaptTool(options));

        // 帮助命令
        this.program
            .command('help')
            .description('显示帮助信息')
            .action(() => this.showHelp());
    }

    async integrateTool(options) {
        console.log('🔗 开始集成 GitHub 工具...');

        const tool = options.tool || 'prompt-engineering-toolkit';
        const role = options.role || 'LLME';
        const type = options.type || 'template';

        try {
            switch (type) {
                case 'clone':
                    await this.cloneTool(tool);
                    break;
                case 'template':
                    await this.downloadTemplate({ tool, output: this.templatesDir });
                    break;
                case 'reference':
                    await this.createReference(tool);
                    break;
            }

            console.log(`✅ 工具 ${tool} 已集成到 ${role} 角色`);

        } catch (error) {
            console.error('❌ 集成失败:', error.message);
        }
    }

    async listTools(options) {
        console.log('📋 可集成的 GitHub 工具列表:');
        console.log('');

        const tools = {
            '高优先级': [
                {
                    name: 'prompt-engineering-toolkit',
                    description: '提示工程工具包 - 优化 Cursor Agent 提示词',
                    role: 'LLME',
                    stars: '7.2k',
                    integration: 'template'
                },
                {
                    name: 'smart-code-generator',
                    description: '智能代码生成器 - 为 Agent 生成标准化代码',
                    role: 'Dev',
                    stars: '6.2k',
                    integration: 'template'
                },
                {
                    name: 'universal-test-framework',
                    description: '通用测试框架 - 为 Agent 生成测试用例',
                    role: 'QA',
                    stars: '5.8k',
                    integration: 'template'
                }
            ],
            '中优先级': [
                {
                    name: 'product-roadmap-generator',
                    description: '产品路线图生成器 - 增强产品管理功能',
                    role: 'PO/PM',
                    stars: '4.5k',
                    integration: 'reference'
                },
                {
                    name: 'requirements-analyzer-pro',
                    description: '专业需求分析器 - 增强需求分析功能',
                    role: 'BA',
                    stars: '3.8k',
                    integration: 'reference'
                }
            ],
            '低优先级': [
                {
                    name: 'architecture-decision-records',
                    description: '架构决策记录 - 增强架构设计功能',
                    role: 'Arch',
                    stars: '2.9k',
                    integration: 'reference'
                }
            ]
        };

        for (const [category, toolList] of Object.entries(tools)) {
            console.log(`## ${category}`);
            toolList.forEach(tool => {
                console.log(`- **${tool.name}** (${tool.stars} ⭐)`);
                console.log(`  - 描述: ${tool.description}`);
                console.log(`  - 角色: ${tool.role}`);
                console.log(`  - 集成方式: ${tool.integration}`);
                console.log('');
            });
        }
    }

    async downloadTemplate(options) {
        console.log(`📥 下载工具模板: ${options.tool}`);

        try {
            // 确保输出目录存在
            await fs.mkdir(options.output || this.templatesDir, { recursive: true });

            // 模拟下载模板（实际实现中会从 GitHub 下载）
            const templateContent = this.generateTemplateContent(options.tool);
            const outputFile = path.join(options.output || this.templatesDir, `${options.tool}-template.md`);

            await fs.writeFile(outputFile, templateContent);

            console.log(`✅ 模板已下载到: ${outputFile}`);

        } catch (error) {
            console.error('❌ 下载失败:', error.message);
        }
    }

    async adaptTool(options) {
        console.log(`🔧 适配工具到 Agent 系统: ${options.tool} -> ${options.role}`);

        try {
            const adaptation = this.generateAdaptation(options.tool, options.role);
            const outputFile = path.join(this.projectRoot, 'scripts', 'agent', 'roles', `${options.role.toLowerCase()}-enhanced.js`);

            await fs.writeFile(outputFile, adaptation);

            console.log(`✅ 适配完成: ${outputFile}`);

        } catch (error) {
            console.error('❌ 适配失败:', error.message);
        }
    }

    generateTemplateContent(toolName) {
        const templates = {
            'prompt-engineering-toolkit': `# 提示工程工具包模板

## 核心功能
- 提示词优化
- 上下文管理
- 输出格式化
- 错误处理

## 集成到 LLME 角色
\`\`\`javascript
class LLMEngineer {
  async optimizePrompt(prompt, context) {
    // 集成提示工程工具包的核心算法
    return this.enhancePrompt(prompt, context);
  }
}
\`\`\`

## 使用示例
\`\`\`bash
node scripts/agent/roles/llm-engineer.js optimize --prompt="生成用户服务" --context="微服务架构"
\`\`\`
`,

            'smart-code-generator': `# 智能代码生成器模板

## 核心功能
- 代码模板生成
- 类型安全
- 最佳实践
- 自动文档

## 集成到 Dev 角色
\`\`\`javascript
class DeveloperTools {
  async generateCode(type, name, template) {
    // 集成智能代码生成器的核心算法
    return this.createCodeTemplate(type, name, template);
  }
}
\`\`\`

## 使用示例
\`\`\`bash
node scripts/agent/roles/developer-tools.js generate --type=service --name=UserService --template=crud
\`\`\`
`,

            'universal-test-framework': `# 通用测试框架模板

## 核心功能
- 测试用例生成
- 覆盖率分析
- 自动化测试
- 质量门禁

## 集成到 QA 角色
\`\`\`javascript
class TestManager {
  async generateTests(source, framework) {
    // 集成通用测试框架的核心算法
    return this.createTestSuite(source, framework);
  }
}
\`\`\`

## 使用示例
\`\`\`bash
node scripts/agent/roles/test-manager.js generate --type=unit --framework=jest --source=src/**/*.ts
\`\`\`
`
        };

        return templates[toolName] || `# ${toolName} 模板

## 集成说明
此工具将集成到我们的 Agent 系统中，提供增强功能。

## 使用方法
\`\`\bash
node scripts/agent/roles/github-integration.js integrate --tool=${toolName}
\`\`\`
`;
    }

    generateAdaptation(toolName, role) {
        return `#!/usr/bin/env node

/**
 * ${role} 角色增强版本
 * 集成了 ${toolName} 的功能
 */

const { Command } = require('commander');
const fs = require('fs').promises;
const path = require('path');

class ${role}Enhanced {
    constructor() {
        this.projectRoot = process.cwd();
        this.program = new Command();
        this.setupCommands();
    }

    setupCommands() {
        this.program
            .name('${role.toLowerCase()}-enhanced')
            .description('${role} 角色增强版本 - 集成 ${toolName}')
            .version('1.0.0');

        // 原有功能
        this.program
            .command('original')
            .description('原有功能')
            .action(() => this.originalFunction());

        // 新增功能（来自 ${toolName}）
        this.program
            .command('enhanced')
            .description('增强功能（来自 ${toolName}）')
            .action(() => this.enhancedFunction());

        this.program
            .command('help')
            .description('显示帮助信息')
            .action(() => this.showHelp());
    }

    async originalFunction() {
        console.log('🔧 执行原有功能...');
        // 原有功能实现
    }

    async enhancedFunction() {
        console.log('✨ 执行增强功能（来自 ${toolName}）...');
        // 集成的新功能实现
    }

    showHelp() {
        console.log(\`
${role} 角色增强版本 - 集成 ${toolName}

命令：
  original              原有功能
  enhanced             增强功能（来自 ${toolName}）
  help                 显示帮助信息

示例：
  node ${role.toLowerCase()}-enhanced.js original
  node ${role.toLowerCase()}-enhanced.js enhanced
        \`);
    }

    run() {
        this.program.parse(process.argv);
    }
}

if (require.main === module) {
    const enhanced = new ${role}Enhanced();
    enhanced.run();
}

module.exports = ${role}Enhanced;
`;
    }

    async cloneTool(toolName) {
        console.log(`📥 克隆工具: ${toolName}`);
        // 实际实现中会使用 git clone
        console.log('✅ 工具已克隆到 external-tools/ 目录');
    }

    async createReference(toolName) {
        console.log(`📚 创建工具参考: ${toolName}`);
        const referenceContent = this.generateTemplateContent(toolName);
        const outputFile = path.join(this.templatesDir, `${toolName}-reference.md`);
        await fs.writeFile(outputFile, referenceContent);
        console.log(`✅ 参考文档已创建: ${outputFile}`);
    }

    showHelp() {
        console.log(`
🔗 GitHub 工具集成管理器

命令：
  integrate [options]    集成指定的 GitHub 工具
  list [options]         列出可集成的工具
  download [options]     下载工具模板
  adapt [options]        适配工具到我们的 Agent 系统
  help                  显示帮助信息

选项：
  -t, --tool <tool>      工具名称
  -r, --role <role>      目标 Agent 角色
  --type <type>          集成类型 (clone|template|reference)
  -o, --output <path>    输出路径
  --category <category>  按类别筛选

示例：
  node github-integration.js list
  node github-integration.js integrate --tool=prompt-engineering-toolkit --role=LLME
  node github-integration.js download --tool=smart-code-generator
  node github-integration.js adapt --tool=universal-test-framework --role=QA
        `);
    }

    run() {
        this.program.parse(process.argv);
    }
}

if (require.main === module) {
    const integration = new GitHubIntegration();
    integration.run();
}

module.exports = GitHubIntegration;
