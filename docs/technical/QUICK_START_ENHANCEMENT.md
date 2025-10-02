# 🚀 Cursor Agent 增强快速开始指南

> 基于产品管理工具成功改进的立即行动方案

## 📋 概述

基于您对产品管理工具的出色改进，我们为您提供立即可执行的增强方案。这个指南将帮助您在 1-2 周内实现显著的改进。

## 🎯 立即行动清单

### 第 1 天：环境准备

#### 1.1 创建增强项目结构

```bash
# 创建新的增强目录
mkdir -p scripts/agent/enhanced
mkdir -p docs/templates/enhanced
mkdir -p tmp/enhanced-output

# 复制产品管理工具作为模板
cp scripts/agent/roles/product-manager.js scripts/agent/enhanced/
```

#### 1.2 设置开发环境

```bash
# 安装必要的依赖
npm install js-yaml commander chalk ora
npm install --save-dev @types/node jest

# 创建配置文件
touch .agent-config.yaml
```

### 第 2-3 天：需求分析工具重构

#### 2.1 应用产品管理工具模式

```bash
# 基于产品管理工具重构需求分析工具
node scripts/agent/enhanced/product-manager.js help
# 参考其结构重构 requirement-analyzer.js
```

#### 2.2 实现统一 CLI 接口

```javascript
// 参考产品管理工具的结构
// 1. 统一的命令解析
// 2. 标准化的选项处理
// 3. 一致的错误处理
// 4. 模板化的输出格式
```

### 第 4-5 天：开发工具增强

#### 4.1 重构开发工具

```bash
# 应用相同的模式重构 developer-tools.js
# 添加子命令：generate, refactor, optimize, lint
# 支持选项：--language, --framework, --quality
```

#### 4.2 创建标准模板

```yaml
# 创建开发工具模板
# docs/templates/enhanced/development-templates.yaml
```

### 第 6-7 天：测试管理工具

#### 6.1 统一测试框架

```bash
# 重构 test-manager.js
# 支持多种测试框架
# 集成覆盖率报告
```

#### 6.2 创建测试模板

```yaml
# 创建测试模板文件
# docs/templates/enhanced/test-templates.yaml
```

## 🛠️ 具体实施步骤

### 步骤 1：创建统一命令接口

创建 `scripts/agent/enhanced/agent-cli.js`：

```javascript
#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');

const program = new Command();

program.name('agent').description('Cursor IDE Agent 统一命令行工具').version('1.0.0');

// 产品管理子命令
program
  .command('product')
  .description('产品管理工具')
  .argument('<action>', '操作类型')
  .option('-t, --template <template>', '模板类型')
  .option('--timeframe <timeframe>', '时间范围')
  .action(async (action, options) => {
    const spinner = ora('执行产品管理操作...').start();
    try {
      // 调用产品管理工具
      const ProductManager = require('./product-manager');
      const pm = new ProductManager();
      await pm.execute(action, options);
      spinner.succeed('操作完成');
    } catch (error) {
      spinner.fail(`操作失败: ${error.message}`);
      process.exit(1);
    }
  });

// 需求分析子命令
program
  .command('requirements')
  .description('需求分析工具')
  .argument('<action>', '操作类型')
  .option('-f, --format <format>', '输出格式')
  .option('-o, --output <file>', '输出文件')
  .action(async (action, options) => {
    const spinner = ora('执行需求分析...').start();
    try {
      // 调用需求分析工具
      const RequirementAnalyzer = require('./requirement-analyzer');
      const ra = new RequirementAnalyzer();
      await ra.execute(action, options);
      spinner.succeed('分析完成');
    } catch (error) {
      spinner.fail(`分析失败: ${error.message}`);
      process.exit(1);
    }
  });

// 开发工具子命令
program
  .command('dev')
  .description('开发工具')
  .argument('<action>', '操作类型')
  .option('-l, --language <lang>', '编程语言')
  .option('-f, --framework <framework>', '框架')
  .action(async (action, options) => {
    const spinner = ora('执行开发操作...').start();
    try {
      // 调用开发工具
      const DeveloperTools = require('./developer-tools');
      const dt = new DeveloperTools();
      await dt.execute(action, options);
      spinner.succeed('操作完成');
    } catch (error) {
      spinner.fail(`操作失败: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();
```

### 步骤 2：创建配置文件

创建 `.agent-config.yaml`：

```yaml
# Cursor Agent 配置文件
version: '1.0.0'

# 全局设置
global:
  outputDir: './tmp/generated'
  templatesDir: './docs/templates'
  logLevel: 'info'
  defaultLanguage: 'typescript'

# 工具配置
tools:
  productManager:
    enabled: true
    templates:
      - 'quarterly'
      - 'annual'
      - 'sprint'
    defaultTemplate: 'quarterly'

  requirementAnalyzer:
    enabled: true
    formats:
      - 'yaml'
      - 'json'
      - 'markdown'
    defaultFormat: 'yaml'

  developerTools:
    enabled: true
    languages:
      - 'typescript'
      - 'javascript'
      - 'python'
      - 'java'
    frameworks:
      - 'react'
      - 'vue'
      - 'angular'
      - 'express'

# 集成设置
integrations:
  github:
    enabled: true
    apiUrl: 'https://api.github.com'
    token: '${GITHUB_TOKEN}'

  cursor:
    enabled: true
    pluginPath: './cursor-plugin'

  web:
    enabled: false
    port: 3000
    host: 'localhost'

# 工作流设置
workflows:
  default:
    - 'requirements'
    - 'product'
    - 'dev'
    - 'test'

  quick:
    - 'product'
    - 'dev'

  full:
    - 'requirements'
    - 'product'
    - 'dev'
    - 'test'
    - 'deploy'
```

### 步骤 3：创建增强的需求分析工具

创建 `scripts/agent/enhanced/requirement-analyzer.js`：

```javascript
#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const chalk = require('chalk');

class RequirementAnalyzer {
  constructor(config = {}) {
    this.config = {
      templatesDir: path.join(__dirname, '../../../docs/templates/enhanced'),
      outputDir: path.join(__dirname, '../../../tmp/enhanced-output'),
      prdPath: path.join(__dirname, '../../../docs/product/requirements/PRD_v2.md'),
      ...config,
    };
    this.logger = console;
  }

  async execute(action, options = {}) {
    switch (action) {
      case 'analyze':
        return await this.analyzeRequirements(options);
      case 'validate':
        return await this.validateRequirements(options);
      case 'export':
        return await this.exportRequirements(options);
      case 'list':
        return await this.listRequirements(options);
      default:
        this.showHelp();
    }
  }

  async analyzeRequirements(options = {}) {
    const { format = 'yaml', output } = options;

    try {
      // 读取 PRD 文件
      const prdContent = await fs.readFile(this.config.prdPath, 'utf8');

      // 分析需求
      const analysis = {
        title: '需求分析报告',
        analyzedAt: new Date().toISOString(),
        summary: this.generateSummary(prdContent),
        features: this.extractFeatures(prdContent),
        userStories: this.extractUserStories(prdContent),
        nonFunctional: this.extractNonFunctional(prdContent),
        risks: this.identifyRisks(prdContent),
        recommendations: this.generateRecommendations(prdContent),
      };

      // 输出结果
      const outputPath =
        output || path.join(this.config.outputDir, `requirements-analysis-${Date.now()}.${format}`);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      let content;
      switch (format) {
        case 'json':
          content = JSON.stringify(analysis, null, 2);
          break;
        case 'markdown':
          content = this.generateMarkdownReport(analysis);
          break;
        default:
          content = yaml.dump(analysis, { indent: 2 });
      }

      await fs.writeFile(outputPath, content, 'utf8');
      this.logger.log(chalk.green(`✅ 需求分析完成: ${outputPath}`));
      return analysis;
    } catch (error) {
      this.logger.error(chalk.red(`❌ 需求分析失败: ${error.message}`));
      throw error;
    }
  }

  generateSummary(content) {
    const lines = content.split('\n');
    const sections = lines.filter(line => line.startsWith('##')).length;
    const features = lines.filter(line => /^#{2,3}\s+\d+\./.test(line)).length;

    return {
      totalSections: sections,
      totalFeatures: features,
      complexity: features > 10 ? 'high' : features > 5 ? 'medium' : 'low',
      estimatedEffort: this.estimateEffort(features),
    };
  }

  extractFeatures(content) {
    const features = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (/^#{2,3}\s+\d+\./.test(line)) {
        features.push({
          name: line.replace(/^#{2,3}\s+\d+\.\s*/, '').trim(),
          status: 'planned',
          priority: 'medium',
        });
      }
    }

    return features;
  }

  extractUserStories(content) {
    const stories = [];
    const lines = content.split('\n');
    let currentStory = null;

    for (const line of lines) {
      if (line.includes('作为') && line.includes('我希望')) {
        if (currentStory) stories.push(currentStory);
        currentStory = {
          description: line.trim(),
          acceptanceCriteria: [],
          priority: 'medium',
        };
      } else if (currentStory && line.trim().startsWith('-')) {
        currentStory.acceptanceCriteria.push(line.trim().substring(1).trim());
      }
    }

    if (currentStory) stories.push(currentStory);
    return stories;
  }

  extractNonFunctional(content) {
    const nonFunctional = [];
    const lines = content.split('\n');
    let inNonFunctionalSection = false;

    for (const line of lines) {
      if (line.includes('非功能性需求')) {
        inNonFunctionalSection = true;
        continue;
      }
      if (inNonFunctionalSection && line.startsWith('##')) {
        break;
      }
      if (inNonFunctionalSection && line.trim().startsWith('-')) {
        nonFunctional.push(line.trim().substring(1).trim());
      }
    }

    return nonFunctional;
  }

  identifyRisks(content) {
    const risks = [];
    const lines = content.split('\n');
    let inRiskSection = false;

    for (const line of lines) {
      if (line.includes('风险评估')) {
        inRiskSection = true;
        continue;
      }
      if (inRiskSection && line.startsWith('##')) {
        break;
      }
      if (inRiskSection && line.trim().startsWith('-')) {
        risks.push({
          description: line.trim().substring(1).trim(),
          level: 'medium',
          mitigation: '待制定',
        });
      }
    }

    return risks;
  }

  generateRecommendations(content) {
    const features = this.extractFeatures(content);
    const recommendations = [];

    if (features.length > 10) {
      recommendations.push('建议将项目分为多个阶段实施，降低复杂度');
    }

    if (features.some(f => f.name.includes('AI') || f.name.includes('智能'))) {
      recommendations.push('AI 相关功能需要额外的技术验证和测试');
    }

    return recommendations;
  }

  estimateEffort(featureCount) {
    if (featureCount <= 5) return '2-4 周';
    if (featureCount <= 10) return '1-2 个月';
    if (featureCount <= 20) return '2-3 个月';
    return '3-6 个月';
  }

  generateMarkdownReport(analysis) {
    return `# ${analysis.title}

## 分析摘要
- 总功能数: ${analysis.summary.totalFeatures}
- 复杂度: ${analysis.summary.complexity}
- 预估工作量: ${analysis.summary.estimatedEffort}

## 功能列表
${analysis.features.map(f => `- ${f.name}`).join('\n')}

## 用户故事
${analysis.userStories.map(s => `- ${s.description}`).join('\n')}

## 风险评估
${analysis.risks.map(r => `- ${r.description}`).join('\n')}

## 建议
${analysis.recommendations.map(r => `- ${r}`).join('\n')}

---
*生成时间: ${analysis.analyzedAt}*
`;
  }

  showHelp() {
    console.log(
      chalk.blue(`
📋 需求分析工具使用指南

命令：
  analyze [options]           分析需求文档
  validate [options]          验证需求完整性
  export [options]            导出分析结果
  list [options]              列出所有需求

选项：
  --format=yaml|json|markdown 输出格式 (默认: yaml)
  --output=<file>             输出文件路径
  --template=<template>       使用指定模板

示例：
  agent requirements analyze --format=markdown
  agent requirements validate --output=validation-report.yaml
  agent requirements export --format=json --output=requirements.json
`)
    );
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const action = args[0] || 'help';
  const options = {};

  // 解析选项
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const [key, value] = args[i].substring(2).split('=');
      options[key] = value || true;
    }
  }

  const analyzer = new RequirementAnalyzer();
  analyzer.execute(action, options).catch(console.error);
}

module.exports = RequirementAnalyzer;
```

### 步骤 4：创建 Makefile 集成

更新 `Makefile` 添加新的命令：

```makefile
# Agent 增强工具
agent-help: ## 显示 Agent 工具帮助
	@echo "$(BLUE)🤖 Cursor Agent 工具帮助$(NC)"
	@node scripts/agent/enhanced/agent-cli.js --help

agent-product: ## 产品管理工具
	@echo "$(BLUE)📋 产品管理工具$(NC)"
	@node scripts/agent/enhanced/agent-cli.js product $(filter-out $@,$(MAKECMDGOALS))

agent-requirements: ## 需求分析工具
	@echo "$(BLUE)📊 需求分析工具$(NC)"
	@node scripts/agent/enhanced/agent-cli.js requirements $(filter-out $@,$(MAKECMDGOALS))

agent-dev: ## 开发工具
	@echo "$(BLUE)💻 开发工具$(NC)"
	@node scripts/agent/enhanced/agent-cli.js dev $(filter-out $@,$(MAKECMDGOALS))

# 快速工作流
workflow-quick: ## 快速工作流
	@echo "$(BLUE)⚡ 执行快速工作流$(NC)"
	@make agent-product roadmap --template=quarterly
	@make agent-requirements analyze --format=markdown
	@make agent-dev generate --language=typescript

workflow-full: ## 完整工作流
	@echo "$(BLUE)🔄 执行完整工作流$(NC)"
	@make agent-requirements analyze
	@make agent-product roadmap --template=quarterly
	@make agent-dev generate --language=typescript
	@make agent-test create --framework=jest
```

## 🎯 使用示例

### 基本使用

```bash
# 显示帮助
make agent-help

# 产品管理
make agent-product roadmap --template=quarterly --timeframe=2025
make agent-product user-story add --title="新功能" --priority=high

# 需求分析
make agent-requirements analyze --format=markdown
make agent-requirements validate --output=validation.yaml

# 开发工具
make agent-dev generate --language=typescript --framework=react
make agent-dev refactor --quality=high
```

### 工作流使用

```bash
# 快速工作流
make workflow-quick

# 完整工作流
make workflow-full
```

## 📊 预期效果

### 第 1 周结束

- ✅ 统一命令接口完成
- ✅ 3-4 个核心工具重构完成
- ✅ 基础模板系统建立
- ✅ 错误处理标准化

### 第 2 周结束

- ✅ 所有工具标准化完成
- ✅ 工作流自动化实现
- ✅ 配置系统完善
- ✅ 文档和示例完整

## 🚀 下一步

完成基础增强后，您可以：

1. **添加更多工具** - 基于相同模式扩展其他 Agent 工具
2. **实现智能功能** - 添加 AI 驱动的建议和优化
3. **构建 Web 界面** - 创建可视化的管理界面
4. **开发 Cursor 插件** - 集成到 Cursor IDE 中

## 📞 支持

如有问题，请参考：

- 产品管理工具的实现模式
- 本指南中的代码示例
- 项目文档和规范

---

_这个快速开始指南将帮助您在 1-2 周内实现显著的改进，为后续的高级功能打下坚实基础。_
