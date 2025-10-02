#!/usr/bin/env node

/**
 * 需求分析工具 - 基于 GitHub 工具研究集成
 * 
 * 功能：
 * - 需求文档自动解析和验证
 * - 业务流程建模
 * - 用例自动生成
 * - 需求跟踪矩阵
 * 
 * 用法：node scripts/agent/roles/requirement-analyzer.js [command] [options]
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

class RequirementAnalyzer {
    constructor(config = {}) {
        this.config = {
            docsDir: path.join(__dirname, '../../../docs'),
            templatesDir: path.join(__dirname, '../../../docs/templates/analysis'),
            outputDir: path.join(__dirname, '../../../tmp/generated'),
            ...config
        };
        this.logger = console;
    }

    /**
     * 分析需求文档
     */
    async analyzeRequirements(options = {}) {
        const { input, format = 'markdown', validation = 'strict' } = options;

        try {
            // 读取需求文档
            const inputPath = input || path.join(this.config.docsDir, 'product/requirements/PRD_v2.md');
            const content = await fs.readFile(inputPath, 'utf8');

            // 解析需求
            const requirements = this.parseRequirements(content, format);

            // 验证需求
            const validationResults = this.validateRequirements(requirements, validation);

            // 生成分析报告
            const analysis = {
                document: inputPath,
                totalRequirements: requirements.length,
                validRequirements: validationResults.valid.length,
                invalidRequirements: validationResults.invalid.length,
                requirements: requirements,
                validation: validationResults,
                gaps: this.identifyGaps(requirements),
                conflicts: this.identifyConflicts(requirements),
                analyzedAt: new Date().toISOString()
            };

            // 输出分析结果
            const outputPath = path.join(this.config.outputDir, `requirements-analysis-${Date.now()}.yaml`);
            await fs.mkdir(path.dirname(outputPath), { recursive: true });
            await fs.writeFile(outputPath, yaml.dump(analysis, { indent: 2 }));

            this.logger.log(`✅ 需求分析完成: ${outputPath}`);
            this.logger.log(`📊 总计: ${requirements.length} 个需求`);
            this.logger.log(`✅ 有效: ${validationResults.valid.length} 个`);
            this.logger.log(`❌ 无效: ${validationResults.invalid.length} 个`);

            return analysis;

        } catch (error) {
            this.logger.error(`❌ 需求分析失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 业务流程建模
     */
    async modelBusinessProcess(options = {}) {
        const { process, notation = 'bpmn', optimization = 'ai' } = options;

        try {
            // 加载业务流程模板
            const processTemplate = await this.loadProcessTemplate(process);

            // 生成 BPMN 模型
            const bpmnModel = this.generateBPMNModel(processTemplate, notation);

            // 优化建议
            const optimizations = optimization === 'ai' ?
                await this.generateOptimizationSuggestions(processTemplate) : [];

            const model = {
                process: process,
                notation: notation,
                bpmn: bpmnModel,
                optimizations: optimizations,
                stakeholders: this.identifyStakeholders(processTemplate),
                roles: this.identifyRoles(processTemplate),
                generatedAt: new Date().toISOString()
            };

            // 输出模型
            const outputPath = path.join(this.config.outputDir, `process-model-${process}-${Date.now()}.yaml`);
            await fs.writeFile(outputPath, yaml.dump(model, { indent: 2 }));

            this.logger.log(`✅ 业务流程模型已生成: ${outputPath}`);
            return model;

        } catch (error) {
            this.logger.error(`❌ 流程建模失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 生成用例
     */
    async generateUseCases(options = {}) {
        const { requirements, template = 'standard', validate = true } = options;

        try {
            // 加载需求（如果未提供）
            const reqs = requirements || await this.loadRequirements();

            // 生成用例
            const useCases = [];
            for (const req of reqs) {
                const useCase = this.generateUseCaseFromRequirement(req, template);
                useCases.push(useCase);
            }

            // 验证用例
            if (validate) {
                useCases.forEach(uc => {
                    uc.validation = this.validateUseCase(uc);
                });
            }

            const result = {
                template: template,
                totalUseCases: useCases.length,
                useCases: useCases,
                generatedAt: new Date().toISOString()
            };

            // 输出用例
            const outputPath = path.join(this.config.outputDir, `use-cases-${Date.now()}.yaml`);
            await fs.writeFile(outputPath, yaml.dump(result, { indent: 2 }));

            this.logger.log(`✅ 用例生成完成: ${outputPath}`);
            this.logger.log(`📋 生成用例: ${useCases.length} 个`);

            return result;

        } catch (error) {
            this.logger.error(`❌ 用例生成失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 生成需求跟踪矩阵
     */
    async generateTraceabilityMatrix(options = {}) {
        const { requirements, testCases, designDocs } = options;

        try {
            // 加载数据
            const reqs = requirements || await this.loadRequirements();
            const tests = testCases || await this.loadTestCases();
            const designs = designDocs || await this.loadDesignDocs();

            // 生成跟踪矩阵
            const matrix = [];
            for (const req of reqs) {
                const trace = {
                    requirementId: req.id,
                    requirementTitle: req.title,
                    testCases: tests.filter(t => t.requirementId === req.id),
                    designDocuments: designs.filter(d => d.requirementId === req.id),
                    coverage: this.calculateCoverage(req, tests, designs),
                    status: this.determineStatus(req, tests, designs)
                };
                matrix.push(trace);
            }

            const result = {
                totalRequirements: reqs.length,
                totalTestCases: tests.length,
                totalDesignDocs: designs.length,
                coverage: this.calculateOverallCoverage(matrix),
                matrix: matrix,
                generatedAt: new Date().toISOString()
            };

            // 输出矩阵
            const outputPath = path.join(this.config.outputDir, `traceability-matrix-${Date.now()}.yaml`);
            await fs.writeFile(outputPath, yaml.dump(result, { indent: 2 }));

            this.logger.log(`✅ 跟踪矩阵已生成: ${outputPath}`);
            this.logger.log(`📊 覆盖率: ${result.coverage.percentage}%`);

            return result;

        } catch (error) {
            this.logger.error(`❌ 跟踪矩阵生成失败: ${error.message}`);
            throw error;
        }
    }

    // 辅助方法
    parseRequirements(content, format) {
        const requirements = [];
        const lines = content.split('\n');
        let currentReq = null;

        for (const line of lines) {
            // 匹配需求标题
            const reqMatch = line.match(/^###?\s*(\d+\.?\d*)\s*(.+)/);
            if (reqMatch) {
                if (currentReq) {
                    requirements.push(currentReq);
                }
                currentReq = {
                    id: reqMatch[1],
                    title: reqMatch[2],
                    description: '',
                    type: 'functional',
                    priority: 'medium',
                    source: 'PRD'
                };
            } else if (currentReq && line.trim()) {
                currentReq.description += line.trim() + ' ';
            }
        }

        if (currentReq) {
            requirements.push(currentReq);
        }

        return requirements;
    }

    validateRequirements(requirements, validation) {
        const valid = [];
        const invalid = [];

        for (const req of requirements) {
            const validation = {
                hasId: !!req.id,
                hasTitle: !!req.title,
                hasDescription: !!req.description && req.description.length > 10,
                isComplete: true
            };

            validation.isComplete = Object.values(validation).every(v => v === true);

            if (validation.isComplete) {
                valid.push(req);
            } else {
                invalid.push({ ...req, validation });
            }
        }

        return { valid, invalid };
    }

    identifyGaps(requirements) {
        const gaps = [];
        const commonPatterns = [
            '用户认证', '数据验证', '错误处理', '日志记录', '性能要求', '安全要求'
        ];

        for (const pattern of commonPatterns) {
            const hasPattern = requirements.some(req =>
                req.title.includes(pattern) || req.description.includes(pattern)
            );
            if (!hasPattern) {
                gaps.push({
                    type: 'missing_requirement',
                    pattern: pattern,
                    suggestion: `考虑添加${pattern}相关需求`
                });
            }
        }

        return gaps;
    }

    identifyConflicts(requirements) {
        const conflicts = [];

        // 检查重复需求
        const titles = requirements.map(r => r.title.toLowerCase());
        const duplicates = titles.filter((title, index) => titles.indexOf(title) !== index);

        for (const duplicate of duplicates) {
            conflicts.push({
                type: 'duplicate',
                title: duplicate,
                suggestion: '合并重复需求或明确区分'
            });
        }

        return conflicts;
    }

    async loadProcessTemplate(process) {
        const templatePath = path.join(this.config.templatesDir, `process-${process}.yaml`);
        try {
            const content = await fs.readFile(templatePath, 'utf8');
            return yaml.load(content);
        } catch (error) {
            // 返回默认模板
            return {
                name: process,
                steps: [
                    { id: 'start', name: '开始', type: 'start' },
                    { id: 'process', name: '处理', type: 'task' },
                    { id: 'end', name: '结束', type: 'end' }
                ],
                flows: [
                    { from: 'start', to: 'process' },
                    { from: 'process', to: 'end' }
                ]
            };
        }
    }

    generateBPMNModel(template, notation) {
        return {
            notation: notation,
            elements: template.steps.map(step => ({
                id: step.id,
                name: step.name,
                type: step.type,
                x: Math.random() * 400,
                y: Math.random() * 300
            })),
            flows: template.flows
        };
    }

    async generateOptimizationSuggestions(template) {
        return [
            {
                type: 'efficiency',
                suggestion: '考虑并行处理以提高效率',
                impact: 'high',
                effort: 'medium'
            },
            {
                type: 'automation',
                suggestion: '自动化重复性任务',
                impact: 'medium',
                effort: 'low'
            }
        ];
    }

    identifyStakeholders(template) {
        return [
            { name: '业务用户', role: '使用者', influence: '高' },
            { name: '系统管理员', role: '维护者', influence: '中' },
            { name: '开发团队', role: '实现者', influence: '中' }
        ];
    }

    identifyRoles(template) {
        return [
            { name: '用户', permissions: ['read', 'execute'] },
            { name: '管理员', permissions: ['read', 'write', 'execute', 'delete'] }
        ];
    }

    async loadRequirements() {
        const reqPath = path.join(this.config.docsDir, 'product/requirements/PRD_v2.md');
        try {
            const content = await fs.readFile(reqPath, 'utf8');
            return this.parseRequirements(content);
        } catch (error) {
            return [];
        }
    }

    generateUseCaseFromRequirement(req, template) {
        return {
            id: `UC-${req.id}`,
            title: req.title,
            description: req.description,
            actors: ['用户'],
            preconditions: ['系统可用'],
            mainFlow: [
                '用户发起请求',
                '系统处理请求',
                '系统返回结果'
            ],
            alternativeFlows: [],
            postconditions: ['请求处理完成'],
            requirementId: req.id,
            template: template
        };
    }

    validateUseCase(useCase) {
        return {
            hasTitle: !!useCase.title,
            hasDescription: !!useCase.description,
            hasActors: useCase.actors && useCase.actors.length > 0,
            hasMainFlow: useCase.mainFlow && useCase.mainFlow.length > 0,
            isValid: true
        };
    }

    async loadTestCases() {
        // 从测试目录加载测试用例
        return [];
    }

    async loadDesignDocs() {
        // 从设计文档目录加载设计文档
        return [];
    }

    calculateCoverage(req, tests, designs) {
        const testCount = tests.filter(t => t.requirementId === req.id).length;
        const designCount = designs.filter(d => d.requirementId === req.id).length;

        return {
            testCoverage: testCount > 0,
            designCoverage: designCount > 0,
            overallCoverage: testCount > 0 && designCount > 0
        };
    }

    determineStatus(req, tests, designs) {
        const coverage = this.calculateCoverage(req, tests, designs);

        if (coverage.overallCoverage) return 'complete';
        if (coverage.testCoverage || coverage.designCoverage) return 'partial';
        return 'pending';
    }

    calculateOverallCoverage(matrix) {
        const total = matrix.length;
        const covered = matrix.filter(m => m.status === 'complete').length;

        return {
            percentage: total > 0 ? Math.round((covered / total) * 100) : 0,
            covered: covered,
            total: total
        };
    }

    showHelp() {
        console.log(`
📊 需求分析工具使用指南

命令：
  analyze [options]       分析需求文档
  model [options]         业务流程建模
  use-cases [options]     生成用例
  traceability [options]  生成跟踪矩阵
  help                   显示帮助信息

选项：
  --input=path           输入文档路径
  --format=markdown      文档格式
  --validation=strict    验证级别
  --process=name         流程名称
  --notation=bpmn        建模符号
  --template=standard    用例模板

示例：
  node requirement-analyzer.js analyze --input=PRD.md
  node requirement-analyzer.js model --process=user-registration
  node requirement-analyzer.js use-cases --template=standard
  node requirement-analyzer.js traceability
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

    const analyzer = new RequirementAnalyzer();

    try {
        switch (command) {
            case 'analyze':
                await analyzer.analyzeRequirements(options);
                break;
            case 'model':
                await analyzer.modelBusinessProcess(options);
                break;
            case 'use-cases':
                await analyzer.generateUseCases(options);
                break;
            case 'traceability':
                await analyzer.generateTraceabilityMatrix(options);
                break;
            case 'help':
            default:
                analyzer.showHelp();
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

module.exports = RequirementAnalyzer;
