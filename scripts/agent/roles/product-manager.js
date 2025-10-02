#!/usr/bin/env node

/**
 * 产品管理工具 - 基于 GitHub 工具研究集成
 *
 * 功能：
 * - 产品路线图自动生成
 * - 用户故事管理和验证
 * - 功能开关管理
 * - 干系人沟通模板（可后续扩展）
 *
 * 用法：
 *   node scripts/agent/roles/product-manager.js <command> [subcommand] [options]
 *
 * 示例：
 *   node product-manager.js roadmap --template=quarterly --timeframe=2025
 *   node product-manager.js user-story add --title="用户登录" --description="作为用户我想登录" --acceptance="密码正确则进入首页;密码错误提示"
 *   node product-manager.js user-story validate
 *   node product-manager.js user-story prioritize
 *   node product-manager.js feature-flag create --name="new-ui" --enabled=true --rolloutPercentage=5
 *   node product-manager.js feature-flag toggle --name="new-ui"
 *   node product-manager.js feature-flag rollout --name="new-ui" --percentage=50
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

class ProductManager {
    constructor(config = {}) {
        this.config = {
            templatesDir: path.join(__dirname, '../../../docs/templates/product'),
            outputDir: path.join(__dirname, '../../../tmp/generated'),
            prdPath: path.join(__dirname, '../../../docs/product/requirements/PRD_v2.md'),
            ...config,
        };
        this.logger = console;
    }

    // ============== 路线图 ==============

    async generateRoadmap(options = {}) {
        const { template = 'quarterly', timeframe = 'Q1-Q4', includeUserStories = true } = options;

        try {
            // 读取模板文件（可在模板里放 meta、默认分类、里程碑等）
            const templatePath = path.join(this.config.templatesDir, `roadmap-${template}.yaml`);
            let templateMeta = {};
            try {
                const templateContent = await fs.readFile(templatePath, 'utf8');
                templateMeta = yaml.load(templateContent) || {};
            } catch {
                // 模板不存在也不阻断
                templateMeta = { warning: 'Template file not found, using defaults' };
            }

            // 生成路线图数据
            const roadmap = {
                title: `产品路线图 - ${timeframe}`,
                timeframe,
                template,
                templateMeta, // 把模板元信息写入，便于追溯
                quarters: this.generateQuarters(timeframe),
                features: await this.loadFeatures(),
                userStories: includeUserStories ? await this.loadUserStories() : [],
                stakeholders: await this.loadStakeholders(),
                generatedAt: new Date().toISOString(),
            };

            // 输出
            const fileName = `roadmap-${template}-${Date.now()}.yaml`;
            const outputPath = path.join(this.config.outputDir, fileName);
            await fs.mkdir(path.dirname(outputPath), { recursive: true });
            await fs.writeFile(outputPath, yaml.dump(roadmap, { indent: 2 }));

            this.logger.log(`✅ 产品路线图已生成: ${outputPath}`);
            return roadmap;
        } catch (error) {
            this.logger.error(`❌ 生成路线图失败: ${error.message}`);
            throw error;
        }
    }

    // ============== 用户故事 ==============

    async manageUserStories(action, data = {}) {
        const storiesPath = path.join(this.config.templatesDir, 'user-stories.yaml');

        try {
            await fs.mkdir(this.config.templatesDir, { recursive: true });

            let stories = [];
            try {
                const content = await fs.readFile(storiesPath, 'utf8');
                stories = yaml.load(content) || [];
            } catch {
                stories = [];
            }

            switch (action) {
                case 'add': {
                    const acceptance =
                        Array.isArray(data.acceptanceCriteria) && data.acceptanceCriteria.length
                            ? data.acceptanceCriteria
                            : splitList(data.acceptance || data.acceptanceCriteria || '');

                    const newStory = {
                        id: `US-${Date.now()}`,
                        title: data.title || '',
                        description: data.description || '',
                        acceptanceCriteria: acceptance,
                        priority: data.priority || 'medium',
                        storyPoints: toNumber(data.storyPoints, 0),
                        status: 'draft',
                        createdAt: new Date().toISOString(),
                    };
                    stories.push(newStory);
                    this.logger.log(`🆕 已新增用户故事：${newStory.id} - ${newStory.title}`);
                    break;
                }

                case 'validate': {
                    stories = stories.map((story) => ({
                        ...story,
                        validation: this.validateUserStory(story),
                        validatedAt: new Date().toISOString(),
                    }));
                    this.logger.log(`🔎 已完成校验，共 ${stories.length} 条用户故事`);
                    break;
                }

                case 'prioritize': {
                    stories = this.prioritizeStories(stories);
                    this.logger.log(`📈 已按优先级与故事点排序，共 ${stories.length} 条`);
                    break;
                }

                case 'list':
                default: {
                    this.logger.log(`📋 当前用户故事条数：${stories.length}`);
                    break;
                }
            }

            await fs.writeFile(storiesPath, yaml.dump(stories, { indent: 2 }));
            this.logger.log(`✅ 用户故事 ${action || 'list'} 操作完成`);
            return stories;
        } catch (error) {
            this.logger.error(`❌ 用户故事操作失败: ${error.message}`);
            throw error;
        }
    }

    // ============== 功能开关 ==============

    async manageFeatureFlags(operation, config = {}) {
        const flagsPath = path.join(this.config.templatesDir, 'feature-flags.yaml');

        try {
            await fs.mkdir(this.config.templatesDir, { recursive: true });

            let flags = [];
            try {
                const content = await fs.readFile(flagsPath, 'utf8');
                flags = yaml.load(content) || [];
                if (!Array.isArray(flags)) flags = [];
            } catch {
                flags = [];
            }

            switch (operation) {
                case 'create': {
                    const newFlag = {
                        name: String(config.name || '').trim(),
                        description: config.description || '',
                        enabled: toBool(config.enabled, false),
                        rolloutPercentage: clamp(toNumber(config.rolloutPercentage, 0), 0, 100),
                        targetUsers: Array.isArray(config.targetUsers)
                            ? config.targetUsers
                            : splitList(config.targetUsers || ''),
                        createdAt: new Date().toISOString(),
                    };
                    if (!newFlag.name) throw new Error('创建功能开关需要 --name');
                    flags.push(newFlag);
                    this.logger.log(`🆕 已创建功能开关：${newFlag.name}`);
                    break;
                }

                case 'toggle': {
                    const name = String(config.name || '').trim();
                    if (!name) throw new Error('切换开关需要 --name');
                    const flag = flags.find((f) => f.name === name);
                    if (flag) {
                        flag.enabled = !flag.enabled;
                        flag.updatedAt = new Date().toISOString();
                        this.logger.log(`🔁 已切换开关 ${name} => ${flag.enabled}`);
                    } else {
                        this.logger.warn(`未找到名为 ${name} 的功能开关`);
                    }
                    break;
                }

                case 'rollout': {
                    const name = String(config.name || '').trim();
                    const pct = clamp(toNumber(config.percentage, config.rolloutPercentage), 0, 100);
                    if (!name) throw new Error('灰度发布需要 --name');
                    if (pct == null) throw new Error('灰度发布需要 --percentage=0..100');
                    const targetFlag = flags.find((f) => f.name === name);
                    if (targetFlag) {
                        targetFlag.rolloutPercentage = pct;
                        targetFlag.updatedAt = new Date().toISOString();
                        this.logger.log(`📊 已将 ${name} 灰度比例调整为 ${pct}%`);
                    } else {
                        this.logger.warn(`未找到名为 ${name} 的功能开关`);
                    }
                    break;
                }

                case 'list':
                default: {
                    this.logger.log(`📋 当前功能开关数量：${flags.length}`);
                    break;
                }
            }

            await fs.writeFile(flagsPath, yaml.dump(flags, { indent: 2 }));
            this.logger.log(`✅ 功能开关 ${operation || 'list'} 操作完成`);
            return flags;
        } catch (error) {
            this.logger.error(`❌ 功能开关操作失败: ${error.message}`);
            throw error;
        }
    }

    // ============== 辅助方法 ==============

    generateQuarters(timeframe) {
        // timeframe 可以是 'Q1-Q4' 或 '2025' 等，这里简单按当前年生成 4 个季度
        const quarters = [];
        const year = /^\d{4}$/.test(timeframe) ? Number(timeframe) : new Date().getFullYear();
        for (let i = 1; i <= 4; i++) {
            quarters.push({
                quarter: `Q${i}`,
                year,
                startDate: new Date(year, (i - 1) * 3, 1).toISOString(),
                endDate: new Date(year, i * 3, 0).toISOString(),
                features: [],
            });
        }
        return quarters;
    }

    async loadFeatures() {
        try {
            const content = await fs.readFile(this.config.prdPath, 'utf8');
            return this.parseFeaturesFromPRD(content);
        } catch {
            return [];
        }
    }

    async loadUserStories() {
        const storiesPath = path.join(this.config.templatesDir, 'user-stories.yaml');
        try {
            const content = await fs.readFile(storiesPath, 'utf8');
            return yaml.load(content) || [];
        } catch {
            return [];
        }
    }

    async loadStakeholders() {
        return [
            { name: '产品经理', role: '决策者', influence: '高' },
            { name: '开发团队', role: '执行者', influence: '中' },
            { name: '用户', role: '受益者', influence: '高' },
            { name: '业务方', role: '需求方', influence: '中' },
        ];
    }

    parseFeaturesFromPRD(content) {
        const features = [];
        const lines = content.split('\n');

        for (const line of lines) {
            // 兼容 "## 1. 功能A" / "### 2. 功能B"
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

    validateUserStory(story) {
        const checks = {
            hasTitle: !!story.title,
            hasDescription: !!story.description,
            hasAcceptanceCriteria: Array.isArray(story.acceptanceCriteria) && story.acceptanceCriteria.length > 0,
            hasPriority: !!story.priority,
            hasStoryPoints: Number(story.storyPoints) > 0,
        };
        return { ...checks, isValid: Object.values(checks).every(Boolean) };
    }

    prioritizeStories(stories) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return [...stories].sort((a, b) => {
            const pa = priorityOrder[(a.priority || 'medium').toLowerCase()] || 2;
            const pb = priorityOrder[(b.priority || 'medium').toLowerCase()] || 2;
            if (pb !== pa) return pb - pa;
            return (Number(b.storyPoints) || 0) - (Number(a.storyPoints) || 0);
        });
    }

    showHelp() {
        console.log(`
📋 产品管理工具使用指南

命令：
  roadmap [options]            生成产品路线图
  user-story <action>          管理用户故事（add | validate | prioritize | list）
  feature-flag <operation>     管理功能开关（create | toggle | rollout | list）
  help                         显示帮助信息

选项（常用）：
  --template=quarterly         路线图模板 (quarterly|annual|sprint)
  --timeframe=Q1-Q4 / 2025     时间范围（示例：2025）
  --includeUserStories=true    路线图中包含用户故事
  --title=...                  新增用户故事标题
  --description=...            新增用户故事描述
  --acceptance="a;b;c"         新增用户故事验收标准（分号或逗号分隔）
  --priority=high|medium|low   新增用户故事优先级
  --storyPoints=5              新增用户故事故事点
  --name=new-ui                功能开关名称
  --enabled=true|false         功能开关启用状态
  --rolloutPercentage=10       功能开关灰度比例
  --percentage=50              rollout 子命令使用

示例：
  node product-manager.js roadmap --template=quarterly --timeframe=2025
  node product-manager.js user-story add --title="用户登录" --priority=high --acceptance="密码正确进入首页;密码错误提示"
  node product-manager.js user-story validate
  node product-manager.js feature-flag create --name="new-ui" --enabled=true --rolloutPercentage=5
  node product-manager.js feature-flag rollout --name="new-ui" --percentage=50
`);
    }
}

// ============== CLI ==============

function parseOptions(argv) {
    const opts = {};
    for (const arg of argv) {
        if (!arg.startsWith('--')) continue;
        const raw = arg.slice(2);
        if (raw.includes('=')) {
            const [k, v] = raw.split('=');
            opts[k] = coerce(v);
        } else {
            // --flag => true
            opts[raw] = true;
        }
    }
    return opts;
}

function coerce(v) {
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (v === '' || v == null) return true;
    const n = Number(v);
    return Number.isNaN(n) ? v : n;
}

function toBool(v, def = false) {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') return v.toLowerCase() === 'true';
    if (typeof v === 'number') return v !== 0;
    return def;
}

function toNumber(v, def = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
}

function clamp(n, min, max) {
    if (!Number.isFinite(n)) return n;
    return Math.max(min, Math.min(max, n));
}

function splitList(input) {
    if (!input) return [];
    return String(input)
        .split(/[;，,]\s*/)
        .map((s) => s.trim())
        .filter(Boolean);
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const subcommand = args[1]; // action / operation
    const options = parseOptions(args.slice(2));

    const pm = new ProductManager();

    try {
        switch (command) {
            case 'roadmap': {
                await pm.generateRoadmap({
                    template: options.template || 'quarterly',
                    timeframe: options.timeframe || 'Q1-Q4',
                    includeUserStories: toBool(options.includeUserStories, true),
                });
                break;
            }

            case 'user-story': {
                const action = subcommand || 'list';
                await pm.manageUserStories(action, options);
                break;
            }

            case 'feature-flag': {
                const operation = subcommand || 'list';
                await pm.manageFeatureFlags(operation, options);
                break;
            }

            case 'help':
            default: {
                pm.showHelp();
                break;
            }
        }
    } catch (error) {
        console.error('❌ 执行失败: ' + error.message);
        process.exit(1);
    }
}

// 仅当作为主模块运行时执行 main
if (require.main === module) {
    main().catch((error) => {
        console.error('❌ 未捕获异常:', error);
        process.exit(1);
    });
}

module.exports = ProductManager;