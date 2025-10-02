#!/usr/bin/env node

/**
 * GitHub 项目集成顾问
 * 智能推荐现有开源项目，避免重复造轮子
 * 优先集成成熟的GitHub项目，除非自建更简单或更适合
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class GitHubIntegrationAdvisor {
  constructor() {
    this.projectRoot = process.cwd();
    this.knowledgeBase = new Map();
    this.integrationPatterns = new Map();
    this.qualityMetrics = new Map();

    this.init();
  }

  async init() {
    console.log('🔍 GitHub 项目集成顾问启动中...');
    await this.loadKnowledgeBase();
    await this.loadIntegrationPatterns();
    console.log('✅ 准备为您推荐最佳的开源项目集成方案');
  }

  // 加载知识库
  async loadKnowledgeBase() {
    const knowledgeBase = {
      // 前端框架和库
      frontend: {
        'ui-components': {
          keywords: ['组件', 'ui', 'component', '界面', '按钮', '表单'],
          recommendations: [
            {
              name: 'Ant Design',
              repo: 'ant-design/ant-design',
              description: '企业级UI设计语言和React组件库',
              stars: '90k+',
              pros: ['完整的设计体系', '丰富的组件', '企业级应用'],
              cons: ['包体积较大', '定制化复杂'],
              bestFor: ['管理后台', '企业应用', '中后台系统'],
              integration: 'npm install antd',
              difficulty: 'easy',
            },
            {
              name: 'Material-UI',
              repo: 'mui/material-ui',
              description: 'React的Material Design组件库',
              stars: '85k+',
              pros: ['Material Design', '主题定制', 'TypeScript支持'],
              cons: ['学习曲线', '包体积'],
              bestFor: ['现代Web应用', '移动端适配', 'PWA'],
              integration:
                'npm install @mui/material @emotion/react @emotion/styled',
              difficulty: 'medium',
            },
            {
              name: 'Chakra UI',
              repo: 'chakra-ui/chakra-ui',
              description: '简单、模块化、可访问的React组件库',
              stars: '35k+',
              pros: ['简单易用', '高度可定制', '无障碍支持'],
              cons: ['组件相对较少', '社区较小'],
              bestFor: ['快速原型', '初学者项目', '定制化需求'],
              integration:
                'npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion',
              difficulty: 'easy',
            },
          ],
        },
        'state-management': {
          keywords: ['状态管理', 'state', 'redux', 'store', '数据流'],
          recommendations: [
            {
              name: 'Redux Toolkit',
              repo: 'reduxjs/redux-toolkit',
              description: 'Redux的官方工具集，简化Redux使用',
              stars: '10k+',
              pros: ['官方推荐', '减少样板代码', 'DevTools支持'],
              cons: ['学习曲线', '小项目过度设计'],
              bestFor: ['复杂状态管理', '大型应用', '团队协作'],
              integration: 'npm install @reduxjs/toolkit react-redux',
              difficulty: 'medium',
            },
            {
              name: 'Zustand',
              repo: 'pmndrs/zustand',
              description: '轻量级状态管理解决方案',
              stars: '35k+',
              pros: ['极简API', '无样板代码', 'TypeScript友好'],
              cons: ['功能相对简单', 'DevTools支持有限'],
              bestFor: ['中小型项目', '快速开发', '简单状态管理'],
              integration: 'npm install zustand',
              difficulty: 'easy',
            },
          ],
        },
        routing: {
          keywords: ['路由', 'router', '导航', 'navigation', '页面跳转'],
          recommendations: [
            {
              name: 'React Router',
              repo: 'remix-run/react-router',
              description: 'React的声明式路由库',
              stars: '50k+',
              pros: ['官方推荐', '功能完整', '社区支持好'],
              cons: ['API变化频繁', '学习成本'],
              bestFor: ['SPA应用', '复杂路由需求', '标准React项目'],
              integration: 'npm install react-router-dom',
              difficulty: 'medium',
            },
          ],
        },
      },

      // 后端框架和工具
      backend: {
        'web-framework': {
          keywords: ['web框架', 'api', 'server', '服务器', 'http'],
          recommendations: [
            {
              name: 'Express.js',
              repo: 'expressjs/express',
              description: 'Node.js的快速、极简Web框架',
              stars: '60k+',
              pros: ['简单易用', '生态丰富', '灵活性高'],
              cons: ['缺少内置功能', '需要额外配置'],
              bestFor: ['API服务', '快速原型', '微服务'],
              integration: 'npm install express',
              difficulty: 'easy',
            },
            {
              name: 'Fastify',
              repo: 'fastify/fastify',
              description: '高性能的Node.js Web框架',
              stars: '30k+',
              pros: ['高性能', 'TypeScript支持', '插件系统'],
              cons: ['生态相对较小', '学习曲线'],
              bestFor: ['高性能API', 'TypeScript项目', '现代架构'],
              integration: 'npm install fastify',
              difficulty: 'medium',
            },
            {
              name: 'NestJS',
              repo: 'nestjs/nest',
              description: '构建高效、可扩展Node.js服务器端应用的框架',
              stars: '60k+',
              pros: ['企业级架构', 'TypeScript原生', '装饰器支持'],
              cons: ['学习曲线陡峭', '过度设计风险'],
              bestFor: ['企业应用', '大型项目', '团队开发'],
              integration: 'npm install @nestjs/core @nestjs/common',
              difficulty: 'hard',
            },
          ],
        },
        database: {
          keywords: ['数据库', 'database', 'orm', 'sql', 'nosql'],
          recommendations: [
            {
              name: 'Prisma',
              repo: 'prisma/prisma',
              description: '下一代Node.js和TypeScript ORM',
              stars: '35k+',
              pros: ['类型安全', '自动生成客户端', '迁移工具'],
              cons: ['学习成本', '特定数据库支持'],
              bestFor: ['TypeScript项目', '类型安全需求', '现代开发'],
              integration: 'npm install prisma @prisma/client',
              difficulty: 'medium',
            },
            {
              name: 'Mongoose',
              repo: 'Automattic/mongoose',
              description: 'MongoDB的优雅对象建模工具',
              stars: '25k+',
              pros: ['MongoDB专用', 'Schema验证', '中间件支持'],
              cons: ['仅限MongoDB', '性能开销'],
              bestFor: ['MongoDB项目', '文档数据库', '快速开发'],
              integration: 'npm install mongoose',
              difficulty: 'easy',
            },
          ],
        },
      },

      // 开发工具
      devtools: {
        testing: {
          keywords: ['测试', 'test', 'unit', 'integration', 'e2e'],
          recommendations: [
            {
              name: 'Jest',
              repo: 'facebook/jest',
              description: 'JavaScript测试框架',
              stars: '42k+',
              pros: ['零配置', '快照测试', '覆盖率报告'],
              cons: ['内存占用', '配置复杂性'],
              bestFor: ['单元测试', 'React项目', '快速测试'],
              integration: 'npm install --save-dev jest',
              difficulty: 'easy',
            },
            {
              name: 'Cypress',
              repo: 'cypress-io/cypress',
              description: '现代Web的端到端测试框架',
              stars: '45k+',
              pros: ['真实浏览器测试', '调试友好', '时间旅行'],
              cons: ['资源占用大', '仅支持现代浏览器'],
              bestFor: ['E2E测试', '集成测试', 'UI测试'],
              integration: 'npm install --save-dev cypress',
              difficulty: 'medium',
            },
          ],
        },
        'build-tools': {
          keywords: ['构建', 'build', 'bundle', '打包', 'webpack', 'vite'],
          recommendations: [
            {
              name: 'Vite',
              repo: 'vitejs/vite',
              description: '下一代前端构建工具',
              stars: '60k+',
              pros: ['极快的热重载', '零配置', 'ES模块支持'],
              cons: ['相对较新', '插件生态'],
              bestFor: ['现代前端项目', '快速开发', 'Vue/React项目'],
              integration: 'npm create vite@latest',
              difficulty: 'easy',
            },
            {
              name: 'Webpack',
              repo: 'webpack/webpack',
              description: '静态模块打包器',
              stars: '63k+',
              pros: ['功能强大', '生态丰富', '高度可配置'],
              cons: ['配置复杂', '学习曲线陡峭'],
              bestFor: ['复杂构建需求', '企业项目', '定制化构建'],
              integration: 'npm install --save-dev webpack webpack-cli',
              difficulty: 'hard',
            },
          ],
        },
      },

      // 工具库
      utilities: {
        'date-time': {
          keywords: ['日期', 'date', 'time', '时间', '格式化'],
          recommendations: [
            {
              name: 'date-fns',
              repo: 'date-fns/date-fns',
              description: '现代JavaScript日期工具库',
              stars: '32k+',
              pros: ['模块化', 'Tree-shaking友好', 'TypeScript支持'],
              cons: ['API较多', '学习成本'],
              bestFor: ['日期处理', '现代项目', 'Tree-shaking需求'],
              integration: 'npm install date-fns',
              difficulty: 'easy',
            },
            {
              name: 'Day.js',
              repo: 'iamkun/dayjs',
              description: '轻量级日期库，Moment.js的替代品',
              stars: '45k+',
              pros: ['轻量级', 'Moment.js兼容API', '插件系统'],
              cons: ['功能相对简单', '插件依赖'],
              bestFor: ['轻量级需求', 'Moment.js迁移', '简单日期操作'],
              integration: 'npm install dayjs',
              difficulty: 'easy',
            },
          ],
        },
        validation: {
          keywords: ['验证', 'validation', '校验', 'schema', '表单验证'],
          recommendations: [
            {
              name: 'Zod',
              repo: 'colinhacks/zod',
              description: 'TypeScript优先的模式验证库',
              stars: '25k+',
              pros: ['TypeScript原生', '类型推断', '链式API'],
              cons: ['仅限TypeScript', '学习成本'],
              bestFor: ['TypeScript项目', '类型安全', 'API验证'],
              integration: 'npm install zod',
              difficulty: 'medium',
            },
            {
              name: 'Joi',
              repo: 'sideway/joi',
              description: 'JavaScript对象模式描述语言和验证器',
              stars: '20k+',
              pros: ['功能强大', '详细错误信息', '插件支持'],
              cons: ['包体积大', '学习曲线'],
              bestFor: ['复杂验证', 'Node.js后端', '详细错误处理'],
              integration: 'npm install joi',
              difficulty: 'medium',
            },
          ],
        },
      },
    };

    Object.entries(knowledgeBase).forEach(([category, subcategories]) => {
      Object.entries(subcategories).forEach(([subcat, data]) => {
        this.knowledgeBase.set(`${category}.${subcat}`, data);
      });
    });

    console.log(`📚 加载了 ${this.knowledgeBase.size} 个集成方案类别`);
  }

  // 加载集成模式
  async loadIntegrationPatterns() {
    const patterns = {
      // 何时推荐现有项目 vs 自建
      'recommendation-rules': {
        'use-existing': {
          conditions: [
            'stars > 10000', // 高星标项目
            'active-maintenance', // 活跃维护
            'good-documentation', // 良好文档
            'stable-api', // 稳定API
            'community-support', // 社区支持
            'typescript-support', // TypeScript支持
            'test-coverage > 80%', // 测试覆盖率
          ],
          weight: 0.8,
        },
        'build-custom': {
          conditions: [
            'simple-implementation', // 实现简单
            'specific-requirements', // 特定需求
            'learning-purpose', // 学习目的
            'performance-critical', // 性能关键
            'no-suitable-alternative', // 无合适替代
            'bundle-size-critical', // 包大小关键
          ],
          weight: 0.2,
        },
      },

      // 集成复杂度评估
      'integration-complexity': {
        easy: {
          criteria: ['simple-api', 'good-docs', 'common-use-case'],
          timeEstimate: '15-30 minutes',
          riskLevel: 'low',
        },
        medium: {
          criteria: ['moderate-config', 'some-learning', 'integration-steps'],
          timeEstimate: '1-2 hours',
          riskLevel: 'medium',
        },
        hard: {
          criteria: ['complex-setup', 'steep-learning', 'breaking-changes'],
          timeEstimate: '4+ hours',
          riskLevel: 'high',
        },
      },
    };

    Object.entries(patterns).forEach(([key, value]) => {
      this.integrationPatterns.set(key, value);
    });
  }

  // 智能推荐集成方案
  async recommendIntegrations(requirements) {
    console.log('🔍 分析需求并推荐最佳集成方案...');

    const analysis = {
      requirements: requirements,
      matches: [],
      customBuildRecommendations: [],
      integrationPlan: null,
      riskAssessment: null,
    };

    // 1. 关键词匹配
    const matches = await this.findMatchingProjects(requirements);

    // 2. 质量评估
    const qualifiedMatches = await this.assessProjectQuality(matches);

    // 3. 集成复杂度评估
    const complexityAssessment =
      await this.assessIntegrationComplexity(qualifiedMatches);

    // 4. 自建 vs 集成决策
    const decision = await this.makeIntegrationDecision(
      complexityAssessment,
      requirements
    );

    // 5. 生成集成计划
    const integrationPlan = await this.generateIntegrationPlan(decision);

    analysis.matches = qualifiedMatches;
    analysis.integrationPlan = integrationPlan;
    analysis.riskAssessment =
      await this.assessIntegrationRisks(integrationPlan);

    return analysis;
  }

  // 查找匹配的项目
  async findMatchingProjects(requirements) {
    const matches = [];
    const keywords = this.extractKeywords(requirements);

    for (const [key, category] of this.knowledgeBase) {
      const relevanceScore = this.calculateRelevance(
        keywords,
        category.keywords
      );

      if (relevanceScore > 0.3) {
        // 相关性阈值
        category.recommendations.forEach(project => {
          matches.push({
            ...project,
            category: key,
            relevanceScore: relevanceScore,
            matchedKeywords: keywords.filter(k =>
              category.keywords.some(
                ck =>
                  k.toLowerCase().includes(ck.toLowerCase()) ||
                  ck.toLowerCase().includes(k.toLowerCase())
              )
            ),
          });
        });
      }
    }

    // 按相关性排序
    return matches.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // 提取关键词
  extractKeywords(requirements) {
    const text =
      typeof requirements === 'string'
        ? requirements
        : JSON.stringify(requirements);

    // 简单的关键词提取（实际项目中可以使用更复杂的NLP）
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);

    return [...new Set(words)];
  }

  // 计算相关性
  calculateRelevance(userKeywords, categoryKeywords) {
    let matches = 0;
    let totalWeight = 0;

    userKeywords.forEach(userKeyword => {
      categoryKeywords.forEach(categoryKeyword => {
        if (
          userKeyword.includes(categoryKeyword) ||
          categoryKeyword.includes(userKeyword)
        ) {
          matches++;
        }
      });
      totalWeight++;
    });

    return totalWeight > 0 ? matches / totalWeight : 0;
  }

  // 评估项目质量
  async assessProjectQuality(matches) {
    return matches
      .map(project => {
        const qualityScore = this.calculateQualityScore(project);

        return {
          ...project,
          qualityScore: qualityScore,
          qualityLevel: this.getQualityLevel(qualityScore),
          recommendation: this.getRecommendationLevel(
            qualityScore,
            project.relevanceScore
          ),
        };
      })
      .filter(project => project.qualityScore > 0.5); // 过滤低质量项目
  }

  // 计算质量分数
  calculateQualityScore(project) {
    let score = 0;

    // 星标数权重
    const stars = parseInt(project.stars.replace(/[^\d]/g, ''));
    if (stars > 50000) score += 0.3;
    else if (stars > 20000) score += 0.25;
    else if (stars > 10000) score += 0.2;
    else if (stars > 5000) score += 0.15;
    else score += 0.1;

    // 优点权重
    score += Math.min(project.pros.length * 0.1, 0.3);

    // 缺点惩罚
    score -= Math.min(project.cons.length * 0.05, 0.2);

    // 集成难度
    if (project.difficulty === 'easy') score += 0.2;
    else if (project.difficulty === 'medium') score += 0.1;
    else score -= 0.1;

    return Math.max(0, Math.min(1, score));
  }

  // 获取质量等级
  getQualityLevel(score) {
    if (score >= 0.8) return 'excellent';
    if (score >= 0.7) return 'good';
    if (score >= 0.6) return 'fair';
    return 'poor';
  }

  // 获取推荐等级
  getRecommendationLevel(qualityScore, relevanceScore) {
    const combinedScore = qualityScore * 0.6 + relevanceScore * 0.4;

    if (combinedScore >= 0.8) return 'highly-recommended';
    if (combinedScore >= 0.6) return 'recommended';
    if (combinedScore >= 0.4) return 'consider';
    return 'not-recommended';
  }

  // 评估集成复杂度
  async assessIntegrationComplexity(projects) {
    return projects.map(project => {
      const complexity = this.integrationPatterns.get('integration-complexity')[
        project.difficulty
      ];

      return {
        ...project,
        integrationComplexity: {
          level: project.difficulty,
          timeEstimate: complexity.timeEstimate,
          riskLevel: complexity.riskLevel,
          steps: this.generateIntegrationSteps(project),
        },
      };
    });
  }

  // 生成集成步骤
  generateIntegrationSteps(project) {
    const baseSteps = [
      `安装依赖: ${project.integration}`,
      '阅读官方文档和示例',
      '配置项目设置',
      '编写基础使用代码',
      '测试集成效果',
    ];

    // 根据难度添加额外步骤
    if (project.difficulty === 'medium') {
      baseSteps.splice(2, 0, '配置构建工具', '设置类型定义');
    } else if (project.difficulty === 'hard') {
      baseSteps.splice(
        2,
        0,
        '深入理解架构概念',
        '配置复杂的项目结构',
        '设置高级功能',
        '优化性能配置'
      );
    }

    return baseSteps;
  }

  // 做出集成决策
  async makeIntegrationDecision(projects, requirements) {
    const decisions = [];

    for (const project of projects.slice(0, 5)) {
      // 只考虑前5个最佳匹配
      const decision = {
        project: project,
        action: 'integrate', // 默认推荐集成
        reasoning: [],
        alternatives: [],
      };

      // 评估是否应该集成现有项目
      if (this.shouldUseExisting(project, requirements)) {
        decision.action = 'integrate';
        decision.reasoning.push(
          `${project.name} 是成熟的解决方案，有 ${project.stars} 星标`
        );
        decision.reasoning.push(
          `集成难度: ${project.difficulty}，预计时间: ${project.integrationComplexity.timeEstimate}`
        );

        if (project.pros.length > 0) {
          decision.reasoning.push(
            `主要优势: ${project.pros.slice(0, 2).join(', ')}`
          );
        }
      } else {
        decision.action = 'build-custom';
        decision.reasoning.push('推荐自建的原因:');

        if (this.isSimpleToImplement(requirements)) {
          decision.reasoning.push('- 功能相对简单，自建更快');
        }

        if (this.hasSpecificRequirements(requirements)) {
          decision.reasoning.push('- 有特定需求，现有方案不够灵活');
        }

        decision.alternatives = [project]; // 保留作为备选方案
      }

      decisions.push(decision);
    }

    return decisions;
  }

  // 判断是否应该使用现有项目
  shouldUseExisting(project, requirements) {
    // 高质量项目优先
    if (project.qualityScore > 0.8) return true;

    // 简单集成优先
    if (project.difficulty === 'easy' && project.qualityScore > 0.6)
      return true;

    // 复杂需求使用成熟方案
    if (this.isComplexRequirement(requirements) && project.qualityScore > 0.7)
      return true;

    return false;
  }

  // 判断是否容易实现
  isSimpleToImplement(requirements) {
    const simpleKeywords = ['简单', 'basic', '基础', '快速', 'simple', 'quick'];
    const reqText = JSON.stringify(requirements).toLowerCase();

    return simpleKeywords.some(keyword => reqText.includes(keyword));
  }

  // 判断是否有特定需求
  hasSpecificRequirements(requirements) {
    const specificKeywords = [
      '定制',
      'custom',
      '特殊',
      'specific',
      '独特',
      'unique',
    ];
    const reqText = JSON.stringify(requirements).toLowerCase();

    return specificKeywords.some(keyword => reqText.includes(keyword));
  }

  // 判断是否复杂需求
  isComplexRequirement(requirements) {
    const complexKeywords = [
      '复杂',
      'complex',
      '企业级',
      'enterprise',
      '大型',
      'large-scale',
    ];
    const reqText = JSON.stringify(requirements).toLowerCase();

    return complexKeywords.some(keyword => reqText.includes(keyword));
  }

  // 生成集成计划
  async generateIntegrationPlan(decisions) {
    const plan = {
      recommendedActions: [],
      timeline: [],
      dependencies: [],
      riskMitigation: [],
      alternatives: [],
    };

    decisions.forEach((decision, index) => {
      if (decision.action === 'integrate') {
        plan.recommendedActions.push({
          priority: index + 1,
          action: `集成 ${decision.project.name}`,
          description: decision.project.description,
          steps: decision.project.integrationComplexity.steps,
          timeEstimate: decision.project.integrationComplexity.timeEstimate,
          command: decision.project.integration,
          reasoning: decision.reasoning,
        });
      } else {
        plan.alternatives.push({
          option: `自建替代 ${decision.project.name}`,
          reasoning: decision.reasoning,
          fallback: decision.alternatives[0],
        });
      }
    });

    // 生成时间线
    plan.timeline = this.generateTimeline(plan.recommendedActions);

    // 识别依赖关系
    plan.dependencies = this.identifyDependencies(plan.recommendedActions);

    return plan;
  }

  // 生成时间线
  generateTimeline(actions) {
    let currentTime = 0;

    return actions.map(action => {
      const duration = this.parseTimeEstimate(action.timeEstimate);
      const timeline = {
        action: action.action,
        startTime: `T+${currentTime}min`,
        duration: `${duration}min`,
        endTime: `T+${currentTime + duration}min`,
      };

      currentTime += duration;
      return timeline;
    });
  }

  // 解析时间估算
  parseTimeEstimate(timeStr) {
    if (timeStr.includes('minutes')) {
      const match = timeStr.match(/(\d+)-?(\d+)?\s*minutes?/);
      return match ? parseInt(match[2] || match[1]) : 30;
    }

    if (timeStr.includes('hours')) {
      const match = timeStr.match(/(\d+)-?(\d+)?\s*hours?/);
      return match ? parseInt(match[2] || match[1]) * 60 : 120;
    }

    return 60; // 默认1小时
  }

  // 识别依赖关系
  identifyDependencies(actions) {
    const dependencies = [];

    // 简单的依赖关系识别
    for (let i = 0; i < actions.length; i++) {
      for (let j = i + 1; j < actions.length; j++) {
        if (this.hasDependency(actions[i], actions[j])) {
          dependencies.push({
            prerequisite: actions[i].action,
            dependent: actions[j].action,
            reason: '技术栈依赖关系',
          });
        }
      }
    }

    return dependencies;
  }

  // 检查依赖关系
  hasDependency(action1, action2) {
    // 简单的依赖关系检查逻辑
    const frameworks = ['react', 'vue', 'angular'];
    const utilities = ['lodash', 'axios', 'date-fns'];

    const action1Lower = action1.action.toLowerCase();
    const action2Lower = action2.action.toLowerCase();

    // 框架应该在工具库之前
    const action1IsFramework = frameworks.some(f => action1Lower.includes(f));
    const action2IsUtility = utilities.some(u => action2Lower.includes(u));

    return action1IsFramework && action2IsUtility;
  }

  // 评估集成风险
  async assessIntegrationRisks(plan) {
    const risks = [];

    plan.recommendedActions.forEach(action => {
      // 版本兼容性风险
      if (action.timeEstimate.includes('hours')) {
        risks.push({
          type: 'complexity',
          level: 'medium',
          description: `${action.action} 集成复杂度较高`,
          mitigation: '建议先在测试环境验证，准备回滚方案',
        });
      }

      // 依赖冲突风险
      if (plan.dependencies.length > 0) {
        risks.push({
          type: 'dependency',
          level: 'low',
          description: '存在依赖关系，需要按顺序集成',
          mitigation: '严格按照推荐顺序进行集成',
        });
      }
    });

    // 学习成本风险
    const hardIntegrations = plan.recommendedActions.filter(
      a => a.timeEstimate.includes('4+') || a.timeEstimate.includes('hours')
    );

    if (hardIntegrations.length > 0) {
      risks.push({
        type: 'learning-curve',
        level: 'medium',
        description: '部分集成需要较长学习时间',
        mitigation: '建议分阶段学习，先掌握基础用法',
      });
    }

    return risks;
  }

  // 生成集成报告
  generateIntegrationReport(analysis) {
    let report = `# GitHub 项目集成建议报告\n\n`;

    report += `## 📋 需求分析\n`;
    report += `**原始需求**: ${JSON.stringify(analysis.requirements)}\n\n`;

    report += `## 🎯 推荐集成方案\n\n`;
    analysis.integrationPlan.recommendedActions.forEach((action, index) => {
      report += `### ${index + 1}. ${action.action}\n`;
      report += `**描述**: ${action.description}\n`;
      report += `**预计时间**: ${action.timeEstimate}\n`;
      report += `**安装命令**: \`${action.command}\`\n`;
      report += `**推荐理由**:\n`;
      action.reasoning.forEach(reason => {
        report += `- ${reason}\n`;
      });
      report += `\n**集成步骤**:\n`;
      action.steps.forEach((step, stepIndex) => {
        report += `${stepIndex + 1}. ${step}\n`;
      });
      report += `\n`;
    });

    if (analysis.integrationPlan.alternatives.length > 0) {
      report += `## 🔄 备选方案\n\n`;
      analysis.integrationPlan.alternatives.forEach(alt => {
        report += `### ${alt.option}\n`;
        alt.reasoning.forEach(reason => {
          report += `- ${reason}\n`;
        });
        report += `\n`;
      });
    }

    report += `## ⏰ 集成时间线\n\n`;
    analysis.integrationPlan.timeline.forEach(item => {
      report += `- **${item.action}**: ${item.startTime} - ${item.endTime} (${item.duration})\n`;
    });

    if (analysis.riskAssessment.length > 0) {
      report += `\n## ⚠️ 风险评估\n\n`;
      analysis.riskAssessment.forEach(risk => {
        report += `### ${risk.type} (${risk.level})\n`;
        report += `**描述**: ${risk.description}\n`;
        report += `**缓解措施**: ${risk.mitigation}\n\n`;
      });
    }

    report += `## 💡 最佳实践建议\n\n`;
    report += `1. **优先使用成熟方案**: 推荐的开源项目都经过大量实践验证\n`;
    report += `2. **渐进式集成**: 先集成核心功能，再逐步添加高级特性\n`;
    report += `3. **版本锁定**: 使用具体版本号避免意外更新\n`;
    report += `4. **文档先行**: 集成前仔细阅读官方文档\n`;
    report += `5. **测试验证**: 每个集成完成后进行功能测试\n\n`;

    return report;
  }

  // 智能对话接口
  async chat(userInput) {
    console.log('💬 GitHub集成顾问为您服务...');

    try {
      // 分析用户需求
      const analysis = await this.recommendIntegrations(userInput);

      // 生成友好的回复
      let response = `🔍 我为您分析了需求，找到了 ${analysis.matches.length} 个相关的开源项目。\n\n`;

      if (analysis.integrationPlan.recommendedActions.length > 0) {
        response += `🎯 **推荐集成方案**:\n`;
        analysis.integrationPlan.recommendedActions
          .slice(0, 3)
          .forEach((action, index) => {
            response += `${index + 1}. **${action.action}** - ${action.description}\n`;
            response += `   ⏱️ 预计时间: ${action.timeEstimate}\n`;
            response += `   📦 安装: \`${action.command}\`\n\n`;
          });
      }

      if (analysis.integrationPlan.alternatives.length > 0) {
        response += `🔄 **备选方案**: 如果现有方案不合适，我也为您准备了自建方案。\n\n`;
      }

      response += `📊 **总体评估**: 基于项目质量、社区活跃度和集成复杂度，我推荐优先使用现有的开源方案，这样可以节省 ${this.calculateTimeSavings(analysis)} 的开发时间。\n\n`;
      response += `💡 输入 "详细报告" 获取完整的集成计划和步骤说明。`;

      return {
        message: response,
        analysis: analysis,
        quickActions: this.generateQuickActions(analysis),
      };
    } catch (error) {
      return {
        message: `❌ 分析过程中出现错误: ${error.message}`,
        error: true,
      };
    }
  }

  // 计算时间节省
  calculateTimeSavings(analysis) {
    const integrationTime = analysis.integrationPlan.timeline.reduce(
      (total, item) => {
        return total + this.parseTimeEstimate(item.duration + 'min');
      },
      0
    );

    // 假设自建需要的时间是集成时间的5-10倍
    const buildFromScratchTime = integrationTime * 7;
    const savedTime = buildFromScratchTime - integrationTime;

    if (savedTime > 1440) {
      // 超过1天
      return `${Math.round(savedTime / 1440)} 天`;
    } else if (savedTime > 60) {
      // 超过1小时
      return `${Math.round(savedTime / 60)} 小时`;
    } else {
      return `${savedTime} 分钟`;
    }
  }

  // 生成快捷操作
  generateQuickActions(analysis) {
    const actions = [];

    if (analysis.integrationPlan.recommendedActions.length > 0) {
      const topAction = analysis.integrationPlan.recommendedActions[0];
      actions.push({
        label: `立即集成 ${topAction.action}`,
        command: topAction.command,
        description: `一键安装最推荐的方案`,
      });
    }

    actions.push({
      label: '生成详细报告',
      command: 'generate-report',
      description: '获取完整的集成计划和步骤',
    });

    actions.push({
      label: '查看替代方案',
      command: 'show-alternatives',
      description: '探索其他可能的解决方案',
    });

    return actions;
  }
}

// CLI 入口
async function main() {
  const args = process.argv.slice(2);
  const advisor = new GitHubIntegrationAdvisor();

  if (args.length === 0) {
    console.log('🔍 GitHub 项目集成顾问');
    console.log('💡 告诉我您的需求，我将为您推荐最佳的开源项目集成方案...\n');

    // 启动交互模式
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const chat = async () => {
      rl.question('🗣️ 您的需求: ', async input => {
        if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
          console.log('👋 再见！记住：优先使用现有轮子，除非造轮子更简单！');
          rl.close();
          return;
        }

        if (input === '详细报告' || input === 'generate-report') {
          // 生成详细报告的逻辑
          console.log('📄 正在生成详细集成报告...');
          chat();
          return;
        }

        try {
          const response = await advisor.chat(input);
          console.log('\n🤖 集成顾问:', response.message);

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
        case 'recommend':
          const analysis = await advisor.recommendIntegrations(
            params.join(' ')
          );
          console.log(JSON.stringify(analysis, null, 2));
          break;

        case 'report':
          const reportAnalysis = await advisor.recommendIntegrations(
            params.join(' ')
          );
          const report = advisor.generateIntegrationReport(reportAnalysis);
          console.log(report);
          break;

        default:
          console.log('可用命令: recommend, report');
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

module.exports = GitHubIntegrationAdvisor;
