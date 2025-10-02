#!/usr/bin/env node

/**
 * 产品管理工具 - 基于 GitHub 工具研究集成
 * 
 * 功能：
 * - 产品路线图自动生成
 * - 用户故事管理和验证
 * - 功能开关管理
 * - 干系人沟通模板
 * 
 * 用法：node scripts/agent/roles/product-manager.js [command] [options]
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

class ProductManager {
    constructor(config = {}) {
        this.config = {
            templatesDir: path.join(__dirname, '../../../docs/templates/product'),
            outputDir: path.join(__dirname, '../../../tmp/generated'),
            ...config
        };
        this.logger = console;
    }

    /**
     * 生成产品路线图
     */
    async generateRoadmap(options = {}) {
        const { template = 'quarterly', timeframe = 'Q1-Q4', includeUserStories = true } = options;

        try {
            // 读取模板
            const templatePath = path.join(this.config.templatesDir, `roadmap-${template}.yaml`);
            const templateContent = await fs.readFile(templatePath, 'utf8');
            const roadmapTemplate = yaml.load(templateContent);

            // 生成路线图数据
            const roadmap = {
                title: `产品路线图 - ${timeframe}`,
                timeframe,
                quarters: this.generateQuarters(timeframe),
                features: await this.loadFeatures(),
                userStories: includeUserStories ? await this.loadUserStories() : [],
                stakeholders: await this.loadStakeholders(),
                generatedAt: new Date().toISOString()
            };

            // 输出路线图
            const outputPath = path.join(this.config.outputDir, `roadmap-${template}-${Date.now()}.yaml`);
            await fs.mkdir(path.dirname(outputPath), { recursive: true });
            await fs.writeFile(outputPath, yaml.dump(roadmap, { indent: 2 }));

            this.logger.log(`✅ 产品路线图已生成: ${outputPath}`);
            return roadmap;

        } catch (error) {
            this.logger.error(`❌ 生成路线图失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 管理用户故事
     */
    async manageUserStories(action, data = {}) {
        const storiesPath = path.join(this.config.templatesDir, 'user-stories.yaml');

        try {
            let stories = [];
            try {
                const content = await fs.readFile(storiesPath, 'utf8');
                stories = yaml.load(content) || [];
            } catch (error) {
                // 文件不存在，创建新的
            }

            switch (action) {
                case 'add':
                    const newStory = {
                        id: `US-${Date.now()}`,
                        title: data.title,
                        description: data.description,
                        acceptanceCriteria: data.acceptanceCriteria || [],
                        priority: data.priority || 'medium',
                        storyPoints: data.storyPoints || 0,
                        status: 'draft',
                        createdAt: new Date().toISOString()
                    };
                    stories.push(newStory);
                    break;

                case 'validate':
                    stories = stories.map(story => ({
                        ...story,
                        validation: this.validateUserStory(story),
                        validatedAt: new Date().toISOString()
                    }));
                    break;

                case 'prioritize':
                    stories = this.prioritizeStories(stories);
                    break;
            }

            await fs.writeFile(storiesPath, yaml.dump(stories, { indent: 2 }));
            this.logger.log(`✅ 用户故事${action}操作完成`);
            return stories;

        } catch (error) {
            this.logger.error(`❌ 用户故事操作失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 管理功能开关
     */
    async manageFeatureFlags(operation, config = {}) {
        const flagsPath = path.join(this.config.templatesDir, 'feature-flags.yaml');

        try {
            let flags = [];
            try {
                const content = await fs.readFile(flagsPath, 'utf8');
                flags = yaml.load(content) || [];
            } catch (error) {
                // 文件不存在，创建新的
            }

            switch (operation) {
                case 'create':
                    const newFlag = {
                        name: config.name,
                        description: config.description,
                        enabled: config.enabled || false,
                        rolloutPercentage: config.rolloutPercentage || 0,
                        targetUsers: config.targetUsers || [],
                        createdAt: new Date().toISOString()
                    };
                    flags.push(newFlag);
                    break;

                case 'toggle':
                    const flag = flags.find(f => f.name === config.name);
                    if (flag) {
                        flag.enabled = !flag.enabled;
                        flag.updatedAt = new Date().toISOString();
                    }
                    break;

                case 'rollout':
                    const targetFlag = flags.find(f => f.name === config.name);
                    if (targetFlag) {
                        targetFlag.rolloutPercentage = config.percentage;
                        targetFlag.updatedAt = new Date().toISOString();
                    }
                    break;
            }

            await fs.writeFile(flagsPath, yaml.dump(flags, { indent: 2 }));
            this.logger.log(`✅ 功能开关${operation}操作完成`);
            return flags;

        } catch (error) {
            this.logger.error(`❌ 功能开关操作失败: ${error.message}`);
            throw error;
        }
    }

    // 辅助方法
    generateQuarters(timeframe) {
        const quarters = [];
        const currentYear = new Date().getFullYear();

        for (let i = 1; i <= 4; i++) {
            quarters.push({
                quarter: `Q${i}`,
                year: currentYear,
                startDate: new Date(currentYear, (i - 1) * 3, 1).toISOString(),
                endDate: new Date(currentYear, i * 3, 0).toISOString(),
                features: []
            });
        }

        return quarters;
    }

    async loadFeatures() {
        // 从现有文档加载功能列表
        const featuresPath = path.join(__dirname, '../../../docs/product/requirements/PRD_v2.md');
        try {
            const content = await fs.readFile(featuresPath, 'utf8');
            // 解析 PRD 文档中的功能列表
            return this.parseFeaturesFromPRD(content);
        } catch (error) {
            return [];
        }
    }

    async loadUserStories() {
        const storiesPath = path.join(this.config.templatesDir, 'user-stories.yaml');
        try {
            const content = await fs.readFile(storiesPath, 'utf8');
            return yaml.load(content) || [];
        } catch (error) {
            return [];
        }
    }

    async loadStakeholders() {
        return [
            { name: '产品经理', role: '决策者', influence: '高' },
            { name: '开发团队', role: '执行者', influence: '中' },
            { name: '用户', role: '受益者', influence: '高' },
            { name: '业务方', role: '需求方', influence: '中' }
        ];
    }

    parseFeaturesFromPRD(content) {
        // 简单的功能解析逻辑
        const features = [];
        const lines = content.split('\n');

        for (const line of lines) {
            if (line.match(/^###?\s+\d+\./)) {
                features.push({
                    name: line.replace(/^###?\s+\d+\.\s*/, ''),
                    status: 'planned',
                    priority: 'medium'
                });
            }
        }

        return features;
    }

    validateUserStory(story) {
        const validation = {
            hasTitle: !!story.title,
            hasDescription: !!story.description,
            hasAcceptanceCriteria: story.acceptanceCriteria && story.acceptanceCriteria.length > 0,
            hasPriority: !!story.priority,
            hasStoryPoints: story.storyPoints > 0,
            isValid: true
        };

        validation.isValid = Object.values(validation).every(v => v === true);
        return validation;
    }

    prioritizeStories(stories) {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return stories.sort((a, b) => {
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return b.storyPoints - a.storyPoints;
        });
    }

    showHelp() {
        console.log(`
📋 产品管理工具使用指南

命令：
  roadmap [options]     生成产品路线图
  user-story [action]  管理用户故事
  feature-flag [op]    管理功能开关
  help                 显示帮助信息

选项：
  --template=quarterly   路线图模板 (quarterly|annual|sprint)
  --timeframe=Q1-Q4     时间范围
  --include-stories      包含用户故事

示例：
  node product-manager.js roadmap --template=quarterly
  node product-manager.js user-story add --title="用户登录" --priority=high
  node product-manager.js feature-flag create --name="new-ui" --enabled=true
    `); `
    }
}

// CLI 接口
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const options = {};

    // 解析选项
    for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const [key, value] = arg.substring(2).split('=');
            options[key] = value || true;
        }
    }

    const productManager = new ProductManager();

    try {
        switch (command) {
            case 'roadmap':
                await productManager.generateRoadmap(options);
                break;
            case 'user-story':
                await productManager.manageUserStories(options.action || 'list', options);
                break;
            case 'feature-flag':
                await productManager.manageFeatureFlags(options.operation || 'list', options);
                break;
            case 'help':
            default:
                productManager.showHelp();
                break;
        }
    } catch (error) {
        console.error('❌ 执行失败: ' + error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = ProductManager;
