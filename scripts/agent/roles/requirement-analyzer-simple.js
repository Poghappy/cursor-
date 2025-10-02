#!/usr/bin/env node

/**
 * 需求分析工具 - 完整版本
 * 基于 GitHub 工具研究集成
 * 
 * 功能：
 * - 需求文档分析和验证
 * - 业务流程建模和可视化
 * - 用例生成和管理
 * - 需求追踪矩阵
 * - 干系人分析
 */

const { Command } = require('commander');
const fs = require('fs').promises;
const path = require('path');

class RequirementAnalyzer {
    constructor() {
        this.projectRoot = process.cwd();
        this.program = new Command();
        this.config = {
            requirementsDir: path.join(this.projectRoot, 'docs', 'requirements'),
            analysisDir: path.join(this.projectRoot, 'docs', 'analysis'),
            templatesDir: path.join(this.projectRoot, 'docs', 'templates', 'requirements')
        };
        this.setupCommands();
        this.ensureDirectories();
    }

    async ensureDirectories() {
        for (const dir of Object.values(this.config)) {
            try {
                await fs.mkdir(dir, { recursive: true });
            } catch (error) {
                // 目录已存在，忽略错误
            }
        }
    }

    setupCommands() {
        this.program
            .name('requirement-analyzer')
            .description('需求分析工具 - 完整版本')
            .version('1.0.0');

        // 分析命令
        this.program
            .command('analyze')
            .description('分析需求文档')
            .option('-f, --file <path>', '指定需求文档路径')
            .option('-o, --output <path>', '输出分析报告路径')
            .option('--format <format>', '输出格式 (json|markdown|html)', 'markdown')
            .action((options) => this.analyzeRequirements(options));

        // 建模命令
        this.program
            .command('model')
            .description('业务流程建模')
            .option('-t, --type <type>', '模型类型 (flowchart|sequence|state)', 'flowchart')
            .option('-o, --output <path>', '输出模型文件路径')
            .option('--format <format>', '输出格式 (mermaid|plantuml|json)', 'mermaid')
            .action((options) => this.createBusinessModel(options));

        // 用例生成命令
        this.program
            .command('use-cases')
            .description('生成用例')
            .option('-t, --template <template>', '用例模板 (basic|detailed|gherkin)', 'detailed')
            .option('-o, --output <path>', '输出用例文件路径')
            .option('--actor <actor>', '指定参与者')
            .action((options) => this.generateUseCases(options));

        // 追踪矩阵命令
        this.program
            .command('traceability')
            .description('生成需求追踪矩阵')
            .option('-o, --output <path>', '输出追踪矩阵路径')
            .option('--format <format>', '输出格式 (csv|excel|markdown)', 'markdown')
            .action((options) => this.generateTraceabilityMatrix(options));

        // 干系人分析命令
        this.program
            .command('stakeholders')
            .description('干系人分析')
            .option('-o, --output <path>', '输出分析报告路径')
            .option('--template <template>', '分析模板 (basic|detailed|power-interest)', 'detailed')
            .action((options) => this.analyzeStakeholders(options));

        // 验证命令
        this.program
            .command('validate')
            .description('验证需求完整性')
            .option('-f, --file <path>', '指定需求文档路径')
            .option('--rules <rules>', '验证规则 (basic|strict|custom)', 'basic')
            .action((options) => this.validateRequirements(options));

        // 帮助命令
        this.program
            .command('help')
            .description('显示帮助信息')
            .action(() => this.showHelp());
    }

    async analyzeRequirements(options) {
        console.log('📊 开始分析需求文档...');

        try {
            const requirementsFile = options.file || path.join(this.config.requirementsDir, 'requirements.md');
            const outputFile = options.output || path.join(this.config.analysisDir, 'requirements-analysis.md');

            // 检查需求文档是否存在
            try {
                await fs.access(requirementsFile);
            } catch (error) {
                console.log('⚠️  需求文档不存在，创建示例文档...');
                await this.createSampleRequirements(requirementsFile);
            }

            // 分析需求文档
            const analysis = await this.performRequirementsAnalysis(requirementsFile);

            // 生成分析报告
            const report = this.generateAnalysisReport(analysis, options.format);

            // 保存报告
            await fs.writeFile(outputFile, report);

            console.log(`✅ 需求分析完成，报告已保存到: ${outputFile}`);
            console.log(`📈 分析结果: ${analysis.totalRequirements} 个需求，${analysis.issues.length} 个问题`);

        } catch (error) {
            console.error('❌ 需求分析失败:', error.message);
        }
    }

    async createBusinessModel(options) {
        console.log('🔄 创建业务流程模型...');

        try {
            const modelType = options.type || 'flowchart';
            const outputFile = options.output || path.join(this.config.analysisDir, `business-model.${options.format || 'mermaid'}`);
            const format = options.format || 'mermaid';

            // 生成模型内容
            const modelContent = this.generateBusinessModel(modelType, format);

            // 保存模型文件
            await fs.writeFile(outputFile, modelContent);

            console.log(`✅ 业务流程模型已创建: ${outputFile}`);
            console.log(`📊 模型类型: ${modelType}, 格式: ${format}`);

        } catch (error) {
            console.error('❌ 模型创建失败:', error.message);
        }
    }

    async generateUseCases(options) {
        console.log('📝 生成用例...');

        try {
            const template = options.template || 'detailed';
            const outputFile = options.output || path.join(this.config.analysisDir, 'use-cases.md');
            const actor = options.actor || '用户';

            // 生成用例内容
            const useCases = this.generateUseCasesContent(template, actor);

            // 保存用例文件
            await fs.writeFile(outputFile, useCases);

            console.log(`✅ 用例已生成: ${outputFile}`);
            console.log(`📋 模板: ${template}, 参与者: ${actor}`);

        } catch (error) {
            console.error('❌ 用例生成失败:', error.message);
        }
    }

    async generateTraceabilityMatrix(options) {
        console.log('🔗 生成需求追踪矩阵...');

        try {
            const outputFile = options.output || path.join(this.config.analysisDir, 'traceability-matrix.md');
            const format = options.format || 'markdown';

            // 生成追踪矩阵
            const matrix = this.generateTraceabilityMatrixContent(format);

            // 保存矩阵文件
            await fs.writeFile(outputFile, matrix);

            console.log(`✅ 追踪矩阵已生成: ${outputFile}`);
            console.log(`📊 格式: ${format}`);

        } catch (error) {
            console.error('❌ 追踪矩阵生成失败:', error.message);
        }
    }

    async analyzeStakeholders(options) {
        console.log('👥 分析干系人...');

        try {
            const template = options.template || 'detailed';
            const outputFile = options.output || path.join(this.config.analysisDir, 'stakeholders-analysis.md');

            // 生成干系人分析
            const analysis = this.generateStakeholdersAnalysis(template);

            // 保存分析报告
            await fs.writeFile(outputFile, analysis);

            console.log(`✅ 干系人分析完成: ${outputFile}`);
            console.log(`📋 模板: ${template}`);

        } catch (error) {
            console.error('❌ 干系人分析失败:', error.message);
        }
    }

    async validateRequirements(options) {
        console.log('✅ 验证需求完整性...');

        try {
            const requirementsFile = options.file || path.join(this.config.requirementsDir, 'requirements.md');
            const rules = options.rules || 'basic';

            // 验证需求
            const validation = await this.validateRequirementsContent(requirementsFile, rules);

            console.log(`✅ 需求验证完成`);
            console.log(`📊 验证结果: ${validation.passed} 通过, ${validation.failed} 失败`);

            if (validation.issues.length > 0) {
                console.log('⚠️  发现的问题:');
                validation.issues.forEach((issue, index) => {
                    console.log(`  ${index + 1}. ${issue}`);
                });
            }

        } catch (error) {
            console.error('❌ 需求验证失败:', error.message);
        }
    }

    // 辅助方法
    async createSampleRequirements(filePath) {
        const sampleContent = `# 需求文档示例

## 1. 功能需求

### 1.1 用户管理
- **REQ-001**: 系统应支持用户注册功能
- **REQ-002**: 系统应支持用户登录功能
- **REQ-003**: 系统应支持用户信息修改功能

### 1.2 数据管理
- **REQ-004**: 系统应支持数据的增删改查操作
- **REQ-005**: 系统应支持数据导入导出功能

## 2. 非功能需求

### 2.1 性能需求
- **REQ-006**: 系统响应时间应小于2秒
- **REQ-007**: 系统应支持1000并发用户

### 2.2 安全需求
- **REQ-008**: 系统应支持用户身份验证
- **REQ-009**: 系统应支持数据加密传输
`;
        await fs.writeFile(filePath, sampleContent);
    }

    async performRequirementsAnalysis(filePath) {
        const content = await fs.readFile(filePath, 'utf8');
        const lines = content.split('\n');

        const analysis = {
            totalRequirements: 0,
            functionalRequirements: 0,
            nonFunctionalRequirements: 0,
            issues: []
        };

        lines.forEach((line, index) => {
            if (line.includes('REQ-')) {
                analysis.totalRequirements++;
                if (line.toLowerCase().includes('功能') || line.toLowerCase().includes('functional')) {
                    analysis.functionalRequirements++;
                } else if (line.toLowerCase().includes('非功能') || line.toLowerCase().includes('non-functional')) {
                    analysis.nonFunctionalRequirements++;
                }
            }
        });

        return analysis;
    }

    generateAnalysisReport(analysis, format) {
        if (format === 'json') {
            return JSON.stringify(analysis, null, 2);
        }

        return `# 需求分析报告

## 分析概览
- 总需求数: ${analysis.totalRequirements}
- 功能需求: ${analysis.functionalRequirements}
- 非功能需求: ${analysis.nonFunctionalRequirements}

## 分析结果
${analysis.issues.length > 0 ? '发现以下问题:\n' + analysis.issues.map(issue => `- ${issue}`).join('\n') : '未发现问题'}

## 建议
1. 确保所有需求都有明确的标识符
2. 区分功能需求和非功能需求
3. 为每个需求定义验收标准
`;
    }

    generateBusinessModel(type, format) {
        if (format === 'mermaid') {
            return `graph TD
    A[开始] --> B[需求收集]
    B --> C[需求分析]
    C --> D[需求验证]
    D --> E{需求是否完整?}
    E -->|是| F[需求确认]
    E -->|否| B
    F --> G[需求管理]
    G --> H[结束]`;
        }

        return `# 业务流程模型 (${type})
模型内容将根据类型和格式生成...`;
    }

    generateUseCasesContent(template, actor) {
        return `# 用例文档

## 用例 1: 用户登录

**参与者**: ${actor}
**前置条件**: 用户已注册
**主要流程**:
1. ${actor} 打开登录页面
2. ${actor} 输入用户名和密码
3. 系统验证用户信息
4. 系统显示登录成功

**后置条件**: 用户成功登录系统
**异常流程**: 用户名或密码错误时显示错误信息

## 用例 2: 数据查询

**参与者**: ${actor}
**前置条件**: 用户已登录
**主要流程**:
1. ${actor} 选择查询条件
2. ${actor} 点击查询按钮
3. 系统执行查询
4. 系统显示查询结果

**后置条件**: 显示查询结果
**异常流程**: 无数据时显示空结果提示
`;
    }

    generateTraceabilityMatrixContent(format) {
        return `# 需求追踪矩阵

| 需求ID | 需求描述 | 用例 | 测试用例 | 实现状态 |
|--------|----------|------|----------|----------|
| REQ-001 | 用户注册功能 | UC-001 | TC-001 | 已实现 |
| REQ-002 | 用户登录功能 | UC-002 | TC-002 | 已实现 |
| REQ-003 | 用户信息修改 | UC-003 | TC-003 | 开发中 |
| REQ-004 | 数据增删改查 | UC-004 | TC-004 | 已实现 |
| REQ-005 | 数据导入导出 | UC-005 | TC-005 | 待开发 |

## 追踪说明
- ✅ 已实现: 功能已完成开发
- 🔄 开发中: 功能正在开发
- ⏳ 待开发: 功能尚未开始开发
`;
    }

    generateStakeholdersAnalysis(template) {
        return `# 干系人分析报告

## 干系人列表

### 主要干系人
1. **产品经理**
   - 角色: 需求定义者
   - 影响: 高
   - 关注点: 产品功能、用户体验

2. **开发团队**
   - 角色: 实现者
   - 影响: 高
   - 关注点: 技术可行性、开发效率

3. **测试团队**
   - 角色: 质量保证者
   - 影响: 中
   - 关注点: 测试覆盖率、质量指标

### 次要干系人
1. **最终用户**
   - 角色: 使用者
   - 影响: 中
   - 关注点: 易用性、性能

2. **运维团队**
   - 角色: 维护者
   - 影响: 低
   - 关注点: 系统稳定性、可维护性

## 沟通策略
- 定期与主要干系人沟通项目进展
- 建立反馈机制收集干系人意见
- 及时处理干系人关注的问题
`;
    }

    async validateRequirementsContent(filePath, rules) {
        const content = await fs.readFile(filePath, 'utf8');
        const validation = {
            passed: 0,
            failed: 0,
            issues: []
        };

        // 基本验证规则
        if (rules === 'basic' || rules === 'strict') {
            if (!content.includes('REQ-')) {
                validation.issues.push('未发现需求标识符 (REQ-)');
                validation.failed++;
            } else {
                validation.passed++;
            }

            if (!content.includes('功能需求') && !content.includes('functional')) {
                validation.issues.push('未发现功能需求章节');
                validation.failed++;
            } else {
                validation.passed++;
            }
        }

        // 严格验证规则
        if (rules === 'strict') {
            if (!content.includes('非功能需求') && !content.includes('non-functional')) {
                validation.issues.push('未发现非功能需求章节');
                validation.failed++;
            } else {
                validation.passed++;
            }
        }

        return validation;
    }

    showHelp() {
        console.log(`
📊 需求分析工具使用指南 - 完整版本

命令：
  analyze [options]       分析需求文档
  model [options]         业务流程建模
  use-cases [options]     生成用例
  traceability [options]  生成需求追踪矩阵
  stakeholders [options]  干系人分析
  validate [options]      验证需求完整性
  help                   显示帮助信息

选项：
  -f, --file <path>      指定文件路径
  -o, --output <path>    输出文件路径
  --format <format>      输出格式
  --template <template>  模板类型
  --rules <rules>        验证规则

示例：
  node requirement-analyzer.js analyze --file requirements.md
  node requirement-analyzer.js model --type flowchart --format mermaid
  node requirement-analyzer.js use-cases --template detailed --actor 管理员
  node requirement-analyzer.js traceability --format markdown
  node requirement-analyzer.js stakeholders --template detailed
  node requirement-analyzer.js validate --rules strict
    `);
    }

    run() {
        this.program.parse(process.argv);
    }
}

if (require.main === module) {
    const analyzer = new RequirementAnalyzer();
    analyzer.run();
}

module.exports = RequirementAnalyzer;
