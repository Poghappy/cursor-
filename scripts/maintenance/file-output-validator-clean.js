#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class FileOutputValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.fixed = [];
        this.targetDirs = ['scripts/', 'src/'];
        this.fileExtensions = ['.js', '.ts'];
    }

    async validate() {
        console.log('🔍 开始文件输出验证...\n');

        let syntaxErrors = 0;
        let templateErrors = 0;
        let encodingIssues = 0;
        let pathIssues = 0;

        for (const dir of this.targetDirs) {
            try {
                const files = execSync(`find ${dir} -type f ${this.fileExtensions.map(ext => `-name "*${ext}"`).join(' -o ')}`).toString().split('\n').filter(Boolean);

                for (const file of files) {
                    try {
                        // 语法检查
                        execSync(`node -c "${file}"`, { stdio: 'pipe' });
                        console.log(`  ✅ ${file}`);
                    } catch (error) {
                        syntaxErrors++;
                        console.log(`  ❌ ${file}`);
                        this.errors.push({
                            type: 'syntax',
                            file,
                            message: error.message.split('\n')[0]
                        });
                    }

                    // 模板字符串检查
                    const content = await fs.readFile(file, 'utf8');
                    const templateIssues = this.checkTemplateStrings(content, file);
                    templateErrors += templateIssues.length;
                    this.errors.push(...templateIssues);

                    // 字符编码检查
                    const encodingIssues = this.checkEncoding(content, file);
                    encodingIssues += encodingIssues.length;
                    this.warnings.push(...encodingIssues);

                    // 路径检查
                    const pathIssues = this.checkPaths(content, file);
                    pathIssues += pathIssues.length;
                    this.warnings.push(...pathIssues);
                }
            } catch (dirError) {
                console.warn(`⚠️ 查找文件失败 ${dir}: ${dirError.message}`);
            }
        }

        console.log(`\n语法检查完成: ${syntaxErrors} 个错误`);
        console.log(`模板字符串检查完成: ${templateErrors} 个问题`);
        console.log(`字符编码检查完成: ${encodingIssues} 个问题`);
        console.log(`文件路径检查完成: ${pathIssues} 个问题`);

        this.generateReport();
    }

    checkTemplateStrings(content, file) {
        const issues = [];
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // 检查错误的转义
            if (line.includes('\\`') || line.includes('\\${')) {
                issues.push({
                    type: 'template_escape',
                    file,
                    line: lineNum,
                    message: `第${lineNum}行: 模板字符串转义错误`,
                    original: line,
                    replacement: line.replace(/\\`/g, '`').replace(/\\\$\{/g, '${'),
                    fix: true
                });
            }

            // 检查未终止的模板字符串
            const backticks = (line.match(/`/g) || []).length;
            if (backticks % 2 !== 0) {
                issues.push({
                    type: 'unterminated_template',
                    file,
                    line: lineNum,
                    message: `第${lineNum}行: 未终止的模板字符串`,
                    original: line,
                    fix: false
                });
            }
        });

        return issues;
    }

    checkEncoding(content, file) {
        const issues = [];

        // 检查控制字符
        const controlChars = content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g);
        if (controlChars) {
            issues.push({
                type: 'encoding',
                file,
                message: '包含控制字符',
                fix: false
            });
        }

        return issues;
    }

    checkPaths(content, file) {
        const issues = [];

        // 检查硬编码路径分隔符
        if (content.includes('\\') && !content.includes('\\\\')) {
            issues.push({
                type: 'hardcoded_path',
                file,
                message: '硬编码路径分隔符',
                suggestion: '使用 path.join() 或 path.resolve()',
                fix: false
            });
        }

        return issues;
    }

    generateReport() {
        console.log('\n📊 验证报告');
        console.log('==================================================\n');

        if (this.errors.length > 0) {
            console.log(`❌ 错误: ${this.errors.length}`);
            this.errors.forEach(error => {
                console.log(`  - ${error.type}: ${error.file}`);
                if (error.message) {
                    console.log(`    详情: ${error.message}`);
                }
            });
        }

        if (this.warnings.length > 0) {
            console.log(`\n⚠️ 警告: ${this.warnings.length}`);
            this.warnings.forEach(warning => {
                console.log(`  - ${warning.type}: ${warning.file}`);
                if (warning.message) {
                    console.log(`    ${warning.message}`);
                }
                if (warning.suggestion) {
                    console.log(`    建议: ${warning.suggestion}`);
                }
            });
        }

        const fixableErrors = this.errors.filter(e => e.fix);
        if (fixableErrors.length > 0) {
            console.log(`\n🔧 可修复: ${fixableErrors.length}`);
            fixableErrors.forEach(fix => {
                console.log(`  - ${fix.file}: ${fix.type}`);
            });
        }

        const totalIssues = this.errors.length + this.warnings.length;
        if (totalIssues === 0) {
            console.log('\n✅ 所有检查通过！文件输出质量良好。');
        } else {
            console.log(`\n📋 总计: ${totalIssues} 个问题需要处理`);
        }
    }

    async autoFix() {
        console.log('\n🔧 应用自动修复...');

        const fixableErrors = this.errors.filter(e => e.fix);
        let fixedCount = 0;

        for (const fix of fixableErrors) {
            try {
                const content = await fs.readFile(fix.file, 'utf8');
                const lines = content.split('\n');

                if (fix.type === 'template_escape') {
                    lines[fix.line - 1] = fix.replacement;
                    await fs.writeFile(fix.file, lines.join('\n'), 'utf8');
                    console.log(`  ✅ 修复: ${fix.file}`);
                    fixedCount++;
                }
            } catch (error) {
                console.error(`  ❌ 修复失败 ${fix.file}: ${error.message}`);
            }
        }

        console.log(`\n✅ 自动修复完成: ${fixedCount} 个文件`);
    }
}

async function main() {
    const validator = new FileOutputValidator();
    const args = process.argv.slice(2);

    await validator.validate();

    if (args.includes('--auto-fix')) {
        await validator.autoFix();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { FileOutputValidator };
