#!/usr/bin/env node

/**
 * 智能项目生成器
 * 集成GitHub项目推荐，优先使用现有轮子，智能化项目搭建
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const GitHubIntegrationAdvisor = require('./github-integration-advisor');
const IntelligentAgent = require('./intelligent-agent');

class SmartProjectGenerator {
  constructor() {
    this.projectRoot = process.cwd();
    this.advisor = new GitHubIntegrationAdvisor();
    this.agent = new IntelligentAgent();
    this.templates = new Map();
    this.projectTypes = new Map();

    this.init();
  }

  async init() {
    console.log('🚀 智能项目生成器启动中...');
    await this.loadProjectTemplates();
    await this.loadProjectTypes();
    console.log('✨ 准备为您生成最优化的项目结构');
  }

  // 加载项目模板
  async loadProjectTemplates() {
    const templates = {
      'modern-web-app': {
        name: '现代Web应用',
        description: '基于React/Vue + Node.js的全栈Web应用',
        structure: {
          'frontend/': {
            'src/': {
              'components/': {},
              'pages/': {},
              'hooks/': {},
              'utils/': {},
              'styles/': {},
            },
            'public/': {},
            'package.json': 'frontend-package-template',
          },
          'backend/': {
            'src/': {
              'routes/': {},
              'controllers/': {},
              'models/': {},
              'middleware/': {},
              'utils/': {},
            },
            'tests/': {},
            'package.json': 'backend-package-template',
          },
          'shared/': {
            'types/': {},
            'constants/': {},
            'utils/': {},
          },
          'docs/': {},
          'scripts/': {},
          '.gitignore': 'web-app-gitignore',
          'README.md': 'web-app-readme',
          'docker-compose.yml': 'web-app-docker',
        },
        integrations: [
          { category: 'frontend.ui-components', priority: 'high' },
          { category: 'frontend.state-management', priority: 'medium' },
          { category: 'backend.web-framework', priority: 'high' },
          { category: 'backend.database', priority: 'high' },
          { category: 'devtools.testing', priority: 'medium' },
        ],
        estimatedTime: '2-4 hours',
        complexity: 'medium',
      },

      'api-service': {
        name: 'API服务',
        description: 'RESTful API或GraphQL服务',
        structure: {
          'src/': {
            'routes/': {},
            'controllers/': {},
            'services/': {},
            'models/': {},
            'middleware/': {},
            'utils/': {},
            'config/': {},
          },
          'tests/': {
            'unit/': {},
            'integration/': {},
            'e2e/': {},
          },
          'docs/': {
            'api/': {},
          },
          'scripts/': {},
          'package.json': 'api-package-template',
          '.env.example': 'api-env-template',
          Dockerfile: 'api-dockerfile',
          'README.md': 'api-readme',
        },
        integrations: [
          { category: 'backend.web-framework', priority: 'high' },
          { category: 'backend.database', priority: 'high' },
          { category: 'utilities.validation', priority: 'high' },
          { category: 'devtools.testing', priority: 'medium' },
        ],
        estimatedTime: '1-2 hours',
        complexity: 'low',
      },

      'mobile-app': {
        name: '移动应用',
        description: 'React Native或Flutter移动应用',
        structure: {
          'src/': {
            'screens/': {},
            'components/': {},
            'navigation/': {},
            'services/': {},
            'utils/': {},
            'assets/': {
              'images/': {},
              'fonts/': {},
            },
          },
          'tests/': {},
          'android/': {},
          'ios/': {},
          'package.json': 'mobile-package-template',
          'README.md': 'mobile-readme',
        },
        integrations: [
          { category: 'frontend.ui-components', priority: 'high' },
          { category: 'frontend.state-management', priority: 'medium' },
          { category: 'devtools.testing', priority: 'low' },
        ],
        estimatedTime: '4-8 hours',
        complexity: 'high',
      },

      'data-analysis': {
        name: '数据分析项目',
        description: 'Python数据分析和可视化项目',
        structure: {
          'notebooks/': {},
          'src/': {
            'data/': {},
            'analysis/': {},
            'visualization/': {},
            'utils/': {},
          },
          'data/': {
            'raw/': {},
            'processed/': {},
            'external/': {},
          },
          'reports/': {},
          'requirements.txt': 'data-requirements-template',
          'README.md': 'data-readme',
        },
        integrations: [
          { category: 'data.pandas', priority: 'high' },
          { category: 'data.numpy', priority: 'high' },
          { category: 'data.matplotlib', priority: 'medium' },
          { category: 'data.jupyter', priority: 'medium' },
        ],
        estimatedTime: '1-3 hours',
        complexity: 'medium',
      },
    };

    Object.entries(templates).forEach(([key, template]) => {
      this.templates.set(key, template);
    });

    console.log(`📋 加载了 ${this.templates.size} 个项目模板`);
  }

  // 加载项目类型识别规则
  async loadProjectTypes() {
    const projectTypes = {
      'web-application': {
        keywords: [
          '网站',
          'web',
          'website',
          '前端',
          'backend',
          'fullstack',
          '全栈',
        ],
        template: 'modern-web-app',
        confidence: 0.9,
      },
      'api-service': {
        keywords: [
          'api',
          '接口',
          'service',
          '服务',
          'backend',
          '后端',
          'rest',
          'graphql',
        ],
        template: 'api-service',
        confidence: 0.85,
      },
      'mobile-app': {
        keywords: [
          '手机',
          'app',
          'mobile',
          '移动',
          'ios',
          'android',
          'react-native',
          'flutter',
        ],
        template: 'mobile-app',
        confidence: 0.8,
      },
      'data-project': {
        keywords: [
          '数据',
          'data',
          '分析',
          'analysis',
          '统计',
          'chart',
          'visualization',
          'ml',
        ],
        template: 'data-analysis',
        confidence: 0.75,
      },
    };

    Object.entries(projectTypes).forEach(([key, type]) => {
      this.projectTypes.set(key, type);
    });
  }

  // 智能分析项目需求
  async analyzeProjectRequirements(userInput) {
    console.log('🔍 智能分析项目需求...');

    const analysis = {
      originalInput: userInput,
      projectType: null,
      template: null,
      integrations: [],
      customizations: [],
      complexity: 'medium',
      estimatedTime: '2-4 hours',
      confidence: 0,
    };

    // 1. 识别项目类型
    analysis.projectType = this.identifyProjectType(userInput);

    // 2. 选择最佳模板
    if (analysis.projectType) {
      analysis.template = this.templates.get(analysis.projectType.template);
      analysis.confidence = analysis.projectType.confidence;
    }

    // 3. 获取集成建议
    analysis.integrations = await this.getIntegrationRecommendations(
      userInput,
      analysis.template
    );

    // 4. 识别定制需求
    analysis.customizations = this.identifyCustomizations(userInput);

    // 5. 评估复杂度和时间
    if (analysis.template) {
      analysis.complexity = analysis.template.complexity;
      analysis.estimatedTime = analysis.template.estimatedTime;
    }

    console.log('📊 需求分析完成:', {
      项目类型: analysis.projectType?.template || '未识别',
      模板: analysis.template?.name || '未选择',
      集成数量: analysis.integrations.length,
      预估时间: analysis.estimatedTime,
    });

    return analysis;
  }

  // 识别项目类型
  identifyProjectType(input) {
    let bestMatch = null;
    let maxScore = 0;

    for (const [typeKey, typeConfig] of this.projectTypes) {
      let score = 0;

      typeConfig.keywords.forEach(keyword => {
        if (input.toLowerCase().includes(keyword.toLowerCase())) {
          score += typeConfig.confidence;
        }
      });

      if (score > maxScore) {
        maxScore = score;
        bestMatch = { type: typeKey, ...typeConfig, score };
      }
    }

    return bestMatch;
  }

  // 获取集成推荐
  async getIntegrationRecommendations(userInput, template) {
    if (!template || !template.integrations) {
      return [];
    }

    const recommendations = [];

    for (const integration of template.integrations) {
      try {
        // 使用GitHub集成顾问获取推荐
        const analysis = await this.advisor.recommendIntegrations(
          `${userInput} ${integration.category}`
        );

        if (analysis.integrationPlan.recommendedActions.length > 0) {
          const topRecommendation =
            analysis.integrationPlan.recommendedActions[0];

          recommendations.push({
            category: integration.category,
            priority: integration.priority,
            recommendation: topRecommendation,
            alternatives: analysis.integrationPlan.alternatives,
          });
        }
      } catch (error) {
        console.warn(
          `⚠️ 获取 ${integration.category} 集成建议失败:`,
          error.message
        );
      }
    }

    return recommendations;
  }

  // 识别定制需求
  identifyCustomizations(input) {
    const customizations = [];

    // 主题定制
    if (input.match(/主题|theme|颜色|color|样式|style/i)) {
      customizations.push({
        type: 'theming',
        description: '自定义主题和样式',
        implementation: 'setup-custom-theme',
      });
    }

    // 认证系统
    if (input.match(/登录|login|认证|auth|用户|user/i)) {
      customizations.push({
        type: 'authentication',
        description: '用户认证系统',
        implementation: 'setup-auth-system',
      });
    }

    // 数据库
    if (input.match(/数据库|database|存储|storage|mysql|postgresql|mongodb/i)) {
      customizations.push({
        type: 'database',
        description: '数据库集成',
        implementation: 'setup-database',
      });
    }

    // API集成
    if (input.match(/api|接口|第三方|integration/i)) {
      customizations.push({
        type: 'api-integration',
        description: 'API和第三方服务集成',
        implementation: 'setup-api-integration',
      });
    }

    return customizations;
  }

  // 生成智能项目
  async generateSmartProject(analysis, projectName, targetDir) {
    console.log('🏗️ 开始生成智能项目...');

    const projectPath = path.join(targetDir, projectName);

    // 创建项目目录
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    const generation = {
      projectPath: projectPath,
      analysis: analysis,
      steps: [],
      integrations: [],
      customizations: [],
      errors: [],
    };

    try {
      // 1. 创建基础项目结构
      await this.createProjectStructure(generation);

      // 2. 安装推荐的集成
      await this.installRecommendedIntegrations(generation);

      // 3. 应用定制化配置
      await this.applyCustomizations(generation);

      // 4. 生成配置文件
      await this.generateConfigFiles(generation);

      // 5. 创建示例代码
      await this.generateExampleCode(generation);

      // 6. 生成文档
      await this.generateDocumentation(generation);

      // 7. 初始化Git仓库
      await this.initializeGitRepository(generation);

      console.log('✅ 项目生成完成!');
    } catch (error) {
      console.error('❌ 项目生成失败:', error.message);
      generation.errors.push(error);
    }

    return generation;
  }

  // 创建项目结构
  async createProjectStructure(generation) {
    console.log('📁 创建项目结构...');

    const { analysis, projectPath } = generation;

    if (!analysis.template || !analysis.template.structure) {
      throw new Error('未找到项目模板结构');
    }

    const createStructure = (structure, currentPath) => {
      Object.entries(structure).forEach(([name, content]) => {
        const fullPath = path.join(currentPath, name);

        if (name.endsWith('/')) {
          // 目录
          const dirName = name.slice(0, -1);
          const dirPath = path.join(currentPath, dirName);

          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }

          if (typeof content === 'object' && content !== null) {
            createStructure(content, dirPath);
          }
        } else {
          // 文件
          if (typeof content === 'string') {
            // 模板文件
            const templateContent = this.getTemplateContent(content, analysis);
            fs.writeFileSync(fullPath, templateContent);
          } else {
            // 空文件
            fs.writeFileSync(fullPath, '');
          }
        }
      });
    };

    createStructure(analysis.template.structure, projectPath);

    generation.steps.push({
      step: 'create-structure',
      status: 'completed',
      description: '项目结构创建完成',
    });
  }

  // 安装推荐的集成
  async installRecommendedIntegrations(generation) {
    console.log('📦 安装推荐的集成...');

    const { analysis, projectPath } = generation;

    for (const integration of analysis.integrations) {
      try {
        console.log(`  安装 ${integration.recommendation.action}...`);

        // 切换到项目目录执行安装命令
        const installCommand = integration.recommendation.command;

        // 根据项目结构确定安装目录
        let installDir = projectPath;
        if (
          fs.existsSync(path.join(projectPath, 'frontend')) &&
          integration.category.startsWith('frontend')
        ) {
          installDir = path.join(projectPath, 'frontend');
        } else if (
          fs.existsSync(path.join(projectPath, 'backend')) &&
          integration.category.startsWith('backend')
        ) {
          installDir = path.join(projectPath, 'backend');
        }

        // 执行安装命令
        execSync(installCommand, {
          cwd: installDir,
          stdio: 'pipe',
        });

        generation.integrations.push({
          ...integration,
          status: 'installed',
          installDir: installDir,
        });

        console.log(`  ✅ ${integration.recommendation.action} 安装完成`);
      } catch (error) {
        console.warn(
          `  ⚠️ ${integration.recommendation.action} 安装失败:`,
          error.message
        );
        generation.integrations.push({
          ...integration,
          status: 'failed',
          error: error.message,
        });
      }
    }

    generation.steps.push({
      step: 'install-integrations',
      status: 'completed',
      description: `安装了 ${generation.integrations.filter(i => i.status === 'installed').length} 个集成`,
    });
  }

  // 应用定制化配置
  async applyCustomizations(generation) {
    console.log('🎨 应用定制化配置...');

    const { analysis, projectPath } = generation;

    for (const customization of analysis.customizations) {
      try {
        console.log(`  配置 ${customization.description}...`);

        switch (customization.implementation) {
          case 'setup-custom-theme':
            await this.setupCustomTheme(projectPath, customization);
            break;
          case 'setup-auth-system':
            await this.setupAuthSystem(projectPath, customization);
            break;
          case 'setup-database':
            await this.setupDatabase(projectPath, customization);
            break;
          case 'setup-api-integration':
            await this.setupApiIntegration(projectPath, customization);
            break;
        }

        generation.customizations.push({
          ...customization,
          status: 'applied',
        });

        console.log(`  ✅ ${customization.description} 配置完成`);
      } catch (error) {
        console.warn(
          `  ⚠️ ${customization.description} 配置失败:`,
          error.message
        );
        generation.customizations.push({
          ...customization,
          status: 'failed',
          error: error.message,
        });
      }
    }

    generation.steps.push({
      step: 'apply-customizations',
      status: 'completed',
      description: `应用了 ${generation.customizations.filter(c => c.status === 'applied').length} 个定制配置`,
    });
  }

  // 生成配置文件
  async generateConfigFiles(generation) {
    console.log('⚙️ 生成配置文件...');

    const { analysis, projectPath } = generation;

    // 生成 .env 文件
    const envContent = this.generateEnvFile(analysis);
    if (envContent) {
      fs.writeFileSync(path.join(projectPath, '.env.example'), envContent);
    }

    // 生成 Docker 配置
    if (
      analysis.template.name.includes('Web应用') ||
      analysis.template.name.includes('API')
    ) {
      const dockerContent = this.generateDockerfile(analysis);
      fs.writeFileSync(path.join(projectPath, 'Dockerfile'), dockerContent);
    }

    // 生成 CI/CD 配置
    const githubActionsContent = this.generateGithubActions(analysis);
    const githubDir = path.join(projectPath, '.github', 'workflows');
    if (!fs.existsSync(githubDir)) {
      fs.mkdirSync(githubDir, { recursive: true });
    }
    fs.writeFileSync(path.join(githubDir, 'ci.yml'), githubActionsContent);

    generation.steps.push({
      step: 'generate-configs',
      status: 'completed',
      description: '配置文件生成完成',
    });
  }

  // 生成示例代码
  async generateExampleCode(generation) {
    console.log('💻 生成示例代码...');

    const { analysis, projectPath } = generation;

    // 根据模板类型生成不同的示例代码
    switch (analysis.template.name) {
      case '现代Web应用':
        await this.generateWebAppExamples(projectPath, analysis);
        break;
      case 'API服务':
        await this.generateApiExamples(projectPath, analysis);
        break;
      case '移动应用':
        await this.generateMobileAppExamples(projectPath, analysis);
        break;
      case '数据分析项目':
        await this.generateDataAnalysisExamples(projectPath, analysis);
        break;
    }

    generation.steps.push({
      step: 'generate-examples',
      status: 'completed',
      description: '示例代码生成完成',
    });
  }

  // 生成文档
  async generateDocumentation(generation) {
    console.log('📚 生成项目文档...');

    const { analysis, projectPath } = generation;

    // 生成 README.md
    const readmeContent = this.generateReadme(generation);
    fs.writeFileSync(path.join(projectPath, 'README.md'), readmeContent);

    // 生成开发指南
    const devGuideContent = this.generateDevelopmentGuide(generation);
    const docsDir = path.join(projectPath, 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(docsDir, 'DEVELOPMENT.md'), devGuideContent);

    // 生成API文档（如果是API项目）
    if (analysis.template.name.includes('API')) {
      const apiDocsContent = this.generateApiDocs(generation);
      fs.writeFileSync(path.join(docsDir, 'API.md'), apiDocsContent);
    }

    generation.steps.push({
      step: 'generate-docs',
      status: 'completed',
      description: '项目文档生成完成',
    });
  }

  // 初始化Git仓库
  async initializeGitRepository(generation) {
    console.log('🔧 初始化Git仓库...');

    const { projectPath } = generation;

    try {
      // 初始化Git仓库
      execSync('git init', { cwd: projectPath, stdio: 'pipe' });

      // 添加所有文件
      execSync('git add .', { cwd: projectPath, stdio: 'pipe' });

      // 创建初始提交
      execSync('git commit -m "🎉 Initial commit - Smart project generated"', {
        cwd: projectPath,
        stdio: 'pipe',
      });

      generation.steps.push({
        step: 'init-git',
        status: 'completed',
        description: 'Git仓库初始化完成',
      });
    } catch (error) {
      console.warn('⚠️ Git仓库初始化失败:', error.message);
      generation.steps.push({
        step: 'init-git',
        status: 'failed',
        error: error.message,
      });
    }
  }

  // 获取模板内容
  getTemplateContent(templateName, analysis) {
    const templates = {
      'frontend-package-template': this.getFrontendPackageTemplate(analysis),
      'backend-package-template': this.getBackendPackageTemplate(analysis),
      'web-app-gitignore': this.getWebAppGitignore(),
      'web-app-readme': this.getWebAppReadme(analysis),
      'api-package-template': this.getApiPackageTemplate(analysis),
      'api-env-template': this.getApiEnvTemplate(),
      'api-dockerfile': this.getApiDockerfile(),
      'api-readme': this.getApiReadme(analysis),
    };

    return templates[templateName] || '';
  }

  // 前端package.json模板
  getFrontendPackageTemplate(analysis) {
    const uiLibrary = analysis.integrations.find(
      i => i.category === 'frontend.ui-components'
    );

    return JSON.stringify(
      {
        name: 'frontend',
        version: '1.0.0',
        private: true,
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
          'react-router-dom': '^6.8.0',
          ...(uiLibrary
            ? { [uiLibrary.recommendation.action.split(' ')[1]]: 'latest' }
            : {}),
        },
        devDependencies: {
          '@types/react': '^18.0.27',
          '@types/react-dom': '^18.0.10',
          '@vitejs/plugin-react': '^3.1.0',
          typescript: '^4.9.4',
          vite: '^4.1.0',
        },
        scripts: {
          dev: 'vite',
          build: 'tsc && vite build',
          preview: 'vite preview',
          lint: 'eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
        },
      },
      null,
      2
    );
  }

  // 后端package.json模板
  getBackendPackageTemplate(analysis) {
    const framework = analysis.integrations.find(
      i => i.category === 'backend.web-framework'
    );

    return JSON.stringify(
      {
        name: 'backend',
        version: '1.0.0',
        main: 'src/app.js',
        dependencies: {
          express: '^4.18.2',
          cors: '^2.8.5',
          helmet: '^6.0.1',
          dotenv: '^16.0.3',
          ...(framework
            ? { [framework.recommendation.action.split(' ')[1]]: 'latest' }
            : {}),
        },
        devDependencies: {
          '@types/node': '^18.14.2',
          nodemon: '^2.0.20',
          typescript: '^4.9.5',
        },
        scripts: {
          start: 'node dist/app.js',
          dev: 'nodemon src/app.ts',
          build: 'tsc',
          test: 'jest',
        },
      },
      null,
      2
    );
  }

  // Web应用.gitignore
  getWebAppGitignore() {
    return `# Dependencies`
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
/dist
/build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Database
*.sqlite
*.db`;
  }

  // 生成README
  generateReadme(generation) {
    const { analysis } = generation;

    let readme = `# ${analysis.template.name}\n\n`;
    readme += `${analysis.template.description}\n\n`;

    readme += `## 🚀 快速开始\n\n`;
    readme += `### 安装依赖\n`;
    readme += ````bash\nnpm install\n```\n\n`;

    readme += `### 启动开发服务器\n`;
    readme += ````bash\nnpm run dev\n```\n\n`;

    readme += `## 📦 集成的技术栈\n\n`;
    generation.integrations.forEach(integration => {
      if (integration.status === 'installed') {
        readme += `- **${integration.recommendation.action}**: ${integration.recommendation.description}\n`;
      }
    });

    readme += `\n## 🛠️ 开发指南\n\n`;
    readme += `详细的开发指南请查看 [DEVELOPMENT.md](docs/DEVELOPMENT.md)\n\n`;

    readme += `## 📝 许可证\n\n`;
    readme += `MIT License\n`;

    return readme;
  }

  // 生成开发指南
  generateDevelopmentGuide(generation) {
    let guide = `# 开发指南\n\n`;

    guide += `## 项目结构\n\n`;
    guide += ````\n`;
    guide += this.generateProjectStructureTree(
      generation.analysis.template.structure
    );
    guide += ````\n\n`;

    guide += `## 集成说明\n\n`;
    generation.integrations.forEach(integration => {
      if (integration.status === 'installed') {
        guide += `### ${integration.recommendation.action}\n\n`;
        guide += `${integration.recommendation.description}\n\n`;
        guide += `**安装命令**: `${integration.recommendation.command}`\n\n`;

        if (integration.recommendation.steps) {
          guide += `**使用步骤**:\n`;
          integration.recommendation.steps.forEach((step, index) => {
            guide += `${index + 1}. ${step}\n`;
          });
          guide += `\n`;
        }
      }
    });

    return guide;
  }

  // 生成项目结构树
  generateProjectStructureTree(structure, prefix = '') {
    let tree = '';

    Object.keys(structure).forEach((key, index, array) => {
      const isLast = index === array.length - 1;
      const currentPrefix = prefix + (isLast ? '└── ' : '├── ');
      const nextPrefix = prefix + (isLast ? '    ' : '│   ');

      tree += currentPrefix + key + '\n';

      if (key.endsWith('/') && typeof structure[key] === 'object') {
        tree += this.generateProjectStructureTree(structure[key], nextPrefix);
      }
    });

    return tree;
  }

  // 智能对话接口
  async chat(userInput) {
    console.log('💬 智能项目生成器为您服务...');

    try {
      // 分析项目需求
      const analysis = await this.analyzeProjectRequirements(userInput);

      let response = `🔍 我分析了您的需求，为您推荐以下方案:\n\n`;

      if (analysis.template) {
        response += `🎯 **推荐模板**: ${analysis.template.name}\n`;
        response += `📝 **描述**: ${analysis.template.description}\n`;
        response += `⏱️ **预计时间**: ${analysis.estimatedTime}\n`;
        response += `🔧 **复杂度**: ${analysis.complexity}\n\n`;

        if (analysis.integrations.length > 0) {
          response += `📦 **推荐集成** (优先使用现有轮子):\n`;
          analysis.integrations.slice(0, 3).forEach((integration, index) => {
            response += `${index + 1}. **${integration.recommendation.action}** - ${integration.recommendation.description}\n`;
          });
          response += `\n`;
        }

        if (analysis.customizations.length > 0) {
          response += `🎨 **检测到的定制需求**:\n`;
          analysis.customizations.forEach((custom, index) => {
            response += `${index + 1}. ${custom.description}\n`;
          });
          response += `\n`;
        }

        response += `💡 **优势说明**: 我优先为您推荐成熟的开源项目集成，这样可以:\n`;
        response += `- ✅ 节省开发时间 (预计节省70%以上)\n`;
        response += `- ✅ 获得社区支持和持续更新\n`;
        response += `- ✅ 减少bug和安全风险\n`;
        response += `- ✅ 遵循最佳实践\n\n`;

        response += `🚀 输入项目名称开始生成，或说"详细说明"了解更多信息。`;
      } else {
        response += `❓ 我需要更多信息来为您推荐合适的方案。\n\n`;
        response += `💡 请告诉我您想要创建:\n`;
        response += `- 网站或Web应用\n`;
        response += `- API服务或后端\n`;
        response += `- 移动应用\n`;
        response += `- 数据分析项目\n`;
        response += `- 或其他类型的项目\n\n`;
        response += `🎯 例如: "我想创建一个电商网站" 或 "需要一个用户管理的API服务"`;
      }

      return {
        message: response,
        analysis: analysis,
        canGenerate: !!analysis.template,
        quickActions: this.generateQuickActions(analysis),
      };
    } catch (error) {
      return {
        message: `❌ 分析需求时出现错误: ${error.message}`,
        error: true,
      };
    }
  }

  // 生成快捷操作
  generateQuickActions(analysis) {
    const actions = [];

    if (analysis.template) {
      actions.push({
        label: `生成 ${analysis.template.name}`,
        command: 'generate-project',
        description: '立即创建项目',
      });

      actions.push({
        label: '查看集成详情',
        command: 'show-integrations',
        description: '了解推荐的技术栈集成',
      });

      actions.push({
        label: '自定义配置',
        command: 'customize-project',
        description: '调整项目配置和功能',
      });
    }

    actions.push({
      label: '浏览模板',
      command: 'browse-templates',
      description: '查看所有可用的项目模板',
    });

    return actions;
  }
}

// CLI 入口
async function main() {
  const args = process.argv.slice(2);
  const generator = new SmartProjectGenerator();

  if (args.length === 0) {
    console.log('🚀 智能项目生成器');
    console.log('💡 告诉我您想要创建什么项目，我将为您智能推荐最佳方案...\n');

    // 启动交互模式
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const chat = async () => {
      rl.question('🗣️ 您想创建什么项目: ', async input => {
        if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
          console.log('👋 再见！记住：优先使用现有轮子，快速构建优质项目！');
          rl.close();
          return;
        }

        try {
          const response = await generator.chat(input);
          console.log('\n🤖 智能助手:', response.message);

          if (response.quickActions && response.quickActions.length > 0) {
            console.log('\n⚡ 快捷操作:');
            response.quickActions.forEach((action, index) => {
              console.log(
                `${index + 1}. ${action.label} - ${action.description}`
              );
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
        case 'analyze':
          const analysis = await generator.analyzeProjectRequirements(
            params.join(' ')
          );
          console.log(JSON.stringify(analysis, null, 2));
          break;

        case 'generate':
          if (params.length < 2) {
            console.log('用法: generate <项目需求> <项目名称> [目标目录]');
            break;
          }

          const [requirement, projectName, targetDir = '.'] = params;
          const projectAnalysis =
            await generator.analyzeProjectRequirements(requirement);
          const result = await generator.generateSmartProject(
            projectAnalysis,
            projectName,
            targetDir
          );

          console.log('✅ 项目生成完成!');
          console.log('📁 项目路径:', result.projectPath);
          break;

        default:
          console.log('可用命令: analyze, generate');
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

module.exports = SmartProjectGenerator;
