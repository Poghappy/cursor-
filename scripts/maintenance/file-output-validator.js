#!/usr/bin/env node

/**
 * 文件输出验证器
 * 
 * 功能：
 * - 检查文件语法错误
 * - 验证模板字符串格式
 * - 检查字符编码问题
 * - 提供修复建议
 * 
 * 用法：node scripts/maintenance/file-output-validator.js [options]
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class FileOutputValidator {
    constructor(options = {}) {
        this.options = {
            directories: options.directories || ['scripts/', 'src/'],
            fileExtensions: options.fileExtensions || ['.js', '.ts'],
            checkSyntax: options.checkSyntax !== false,
            checkTemplates: options.checkTemplates !== false,
            checkEncoding: options.checkEncoding !== false,
            autoFix: options.autoFix || false,
            verbose: options.verbose || false,
            ...options
        };
        this.errors = [];
        this.warnings = [];
        this.fixed = [];
    }

    /**
     * 运行完整的文件输出验证
     */
    async validate() {
        console.log('🔍 开始文件输出验证...\n');

        try {
            // 1. 检查语法错误
            if (this.options.checkSyntax) {
                await this.checkSyntaxErrors();
            }

            // 2. 检查模板字符串
            if (this.options.checkTemplates) {
                await this.checkTemplateStrings();
            }

            // 3. 检查字符编码
            if (this.options.checkEncoding) {
                await this.checkEncoding();
            }

            // 4. 检查文件路径
            await this.checkFilePaths();

            // 5. 生成报告
            this.generateReport();

            // 6. 自动修复（如果启用）
            if (this.options.autoFix && this.fixed.length > 0) {
                await this.applyFixes();
            }

        } catch (error) {
            console.error(`❌ 验证过程出错: ${error.message}`);
            throw error;
        }
    }

    /**
     * 检查语法错误
     */
    async checkSyntaxErrors() {
        console.log('📝 检查语法错误...');

        const files = await this.getFiles();
        let syntaxErrors = 0;

        for (const file of files) {
            try {
                // 使用 Node.js 检查语法
                execSync(`node -c "${file}"`, { stdio: 'pipe' });
                if (this.options.verbose) {
                    console.log(`  ✅ ${file}`);
                }
            } catch (error) {
                syntaxErrors++;
                const errorMsg = `语法错误: ${file}`;
                this.errors.push({
                    type: 'syntax',
                    file,
                    message: errorMsg,
                    details: error.message
                });
                console.log(`  ❌ ${errorMsg}`);
            }
        }

        console.log(`语法检查完成: ${syntaxErrors} 个错误\n`);
    }

    /**
     * 检查模板字符串问题
     */
    async checkTemplateStrings() {
        console.log('🔤 检查模板字符串...');

        const files = await this.getFiles();
        let templateErrors = 0;

        for (const file of files) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const issues = this.analyzeTemplateStrings(content, file);

                if (issues.length > 0) {
                    templateErrors += issues.length;
                    this.errors.push(...issues);

                    issues.forEach(issue => {
                        console.log(`  ❌ ${issue.message}`);
                        if (this.options.autoFix && issue.fix) {
                            this.fixed.push({
                                file,
                                type: 'template',
                                fix: issue.fix,
                                original: issue.original,
                                replacement: issue.replacement
                            });
                        }
                    });
                } else if (this.options.verbose) {
                    console.log(`  ✅ ${file}`);
                }
            } catch (error) {
                console.log(`  ⚠️ 无法读取文件 ${file}: ${error.message}`);
            }
        }

        console.log(`模板字符串检查完成: ${templateErrors} 个问题\n`);
    }

    /**
     * 分析模板字符串问题
     */
    analyzeTemplateStrings(content, file) {
        const issues = [];
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // 检查错误的转义
            if (line.includes('`') || line.includes('${')) {`
                issues.push({
                    type: 'template_escape',
                    file,
                    line: lineNum,
                    message: `第${lineNum}行: 模板字符串转义错误`,
                    original: line,
                    replacement: line.replace(/`/g, '`').replace(/\\\$\{/g, '${'),
                    fix: true
                });
            }

            // 检查未终止的模板字符串
            const backticks = (line.match(/`/g) || []).length;
            if (backticks % 2 !== 0) {
                issues.push({
                    type: 'template_unterminated',
                    file,
                    line: lineNum,
                    message: `第${lineNum}行: 未终止的模板字符串`,
                    original: line,
                    fix: false
                });
            }

            // 检查混合引号
            if (line.includes('`') && (line.includes('"') || line.includes("'"))) {`
                const hasUnescapedQuotes = /`[^`]*"[^`]*`/.test(line) || /`[^`]*'[^`]*`/.test(line);
                if (hasUnescapedQuotes) {
                    issues.push({
                        type: 'template_mixed_quotes',
                        file,
                        line: lineNum,
                        message: `第${lineNum}行: 模板字符串中混合引号可能导致问题`,
                        original: line,
                        fix: false
                    });
                }
            }
        });

        return issues;
    }

    /**
     * 检查字符编码问题
     */
    async checkEncoding() {
        console.log('🔤 检查字符编码...');

        const files = await this.getFiles();
        let encodingIssues = 0;

        for (const file of files) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // 检查控制字符
                const controlChars = content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g);
                if (controlChars) {
                    encodingIssues++;
                    this.warnings.push({
                        type: 'control_chars',
                        file,
                        message: `包含控制字符: ${controlChars.join(', ')}`,
                        count: controlChars.length
                    });
                    console.log(`  ⚠️ ${file}: 包含 ${controlChars.length} 个控制字符`);
                }

                // 检查 BOM
                if (content.charCodeAt(0) === 0xFEFF) {
                    encodingIssues++;
                    this.warnings.push({
                        type: 'bom',
                        file,
                        message: '包含 BOM (Byte Order Mark)',
                        fix: true
                    });
                    console.log(`  ⚠️ ${file}: 包含 BOM`);
                }

                if (this.options.verbose && !controlChars && content.charCodeAt(0) !== 0xFEFF) {
                    console.log(`  ✅ ${file}`);
                }
            } catch (error) {
                console.log(`  ⚠️ 无法检查编码 ${file}: ${error.message}`);
            }
        }

        console.log(`字符编码检查完成: ${encodingIssues} 个问题\n`);
    }

    /**
     * 检查文件路径问题
     */
    async checkFilePaths() {
        console.log('📁 检查文件路径...');

        const files = await this.getFiles();
        let pathIssues = 0;

        for (const file of files) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // 检查硬编码路径分隔符
                const hardcodedPaths = content.match(/['"`][^'"`]*\\[^'"`]*['"`]/g);
                if (hardcodedPaths) {
                    pathIssues++;
                    this.warnings.push({
                        type: 'hardcoded_path',
                        file,
                        message: `硬编码路径分隔符: ${hardcodedPaths.join(', ')}`,
                        suggestions: ['使用 path.join() 或 path.resolve()']
                    });
                    console.log(`  ⚠️ ${file}: 硬编码路径分隔符`);
                }

                // 检查相对路径
                const relativePaths = content.match(/['"`]\.\.?\/[^'"`]*['"`]/g);
                if (relativePaths) {
                    this.warnings.push({
                        type: 'relative_path',
                        file,
                        message: `相对路径: ${relativePaths.join(', ')}`,
                        suggestions: ['考虑使用绝对路径或 path.resolve()']
                    });
                    console.log(`  ⚠️ ${file}: 使用相对路径`);
                }

                if (this.options.verbose && !hardcodedPaths && !relativePaths) {
                    console.log(`  ✅ ${file}`);
                }
            } catch (error) {
                console.log(`  ⚠️ 无法检查路径 ${file}: ${error.message}`);
            }
        }

        console.log(`文件路径检查完成: ${pathIssues} 个问题\n`);
    }

    /**
     * 获取要检查的文件列表
     */
    async getFiles() {
        const files = [];

        for (const dir of this.options.directories) {
            if (await this.directoryExists(dir)) {
                const dirFiles = await this.getFilesInDirectory(dir);
                files.push(...dirFiles);
            }
        }

        return files;
    }

    /**
     * 获取目录中的文件
     */
    async getFilesInDirectory(dir) {
        const files = [];

        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    const subFiles = await this.getFilesInDirectory(fullPath);
                    files.push(...subFiles);
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name);
                    if (this.options.fileExtensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (error) {
            console.log(`  ⚠️ 无法读取目录 ${dir}: ${error.message}`);
        }

        return files;
    }

    /**
     * 检查目录是否存在
     */
    async directoryExists(dir) {
        try {
            const stat = await fs.stat(dir);
            return stat.isDirectory();
        } catch {
            return false;
        }
    }

    /**
     * 生成验证报告
     */
    generateReport() {
        console.log('📊 验证报告');
        console.log('='.repeat(50));

        console.log(`\n❌ 错误: ${this.errors.length}`);
        if (this.errors.length > 0) {
            this.errors.forEach(error => {
                console.log(`  - ${error.message}`);
                if (error.details) {
                    console.log(`    详情: ${error.details}`);
                }
            });
        }

        console.log(`\n⚠️ 警告: ${this.warnings.length}`);
        if (this.warnings.length > 0) {
            this.warnings.forEach(warning => {
                console.log(`  - ${warning.message}`);
                if (warning.suggestions) {
                    console.log(`    建议: ${warning.suggestions.join(', ')}`);
                }
            });
        }

        console.log(`\n🔧 可修复: ${this.fixed.length}`);
        if (this.fixed.length > 0) {
            this.fixed.forEach(fix => {
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

    /**
     * 应用自动修复
     */
    async applyFixes() {
        console.log('\n🔧 应用自动修复...');

        for (const fix of this.fixed) {
            try {
                const content = await fs.readFile(fix.file, 'utf8');
                const newContent = content.replace(fix.original, fix.replacement);
                await fs.writeFile(fix.file, newContent, 'utf8');
                console.log(`  ✅ 修复: ${fix.file}`);
            } catch (error) {
                console.log(`  ❌ 修复失败: ${fix.file} - ${error.message}`);
            }
        }

        console.log(`\n✅ 自动修复完成: ${this.fixed.length} 个文件`);
    }

    /**
     * 显示帮助信息
     */
    showHelp() {
        console.log(`
🔍 文件输出验证器

用法: node file-output-validator.js [选项]

选项:
  --directories=dir1,dir2    要检查的目录 (默认: scripts/,src/)
  --extensions=.js,.ts       文件扩展名 (默认: .js,.ts)
  --no-syntax                跳过语法检查
  --no-templates             跳过模板字符串检查
  --no-encoding              跳过编码检查
  --auto-fix                 自动修复可修复的问题
  --verbose                  详细输出
  --help                     显示帮助信息

示例:
  node file-output-validator.js
  node file-output-validator.js --auto-fix --verbose
  node file-output-validator.js --directories=src/ --extensions=.ts
        `);`
    }
}

// CLI 接口
async function main() {
    const args = process.argv.slice(2);
    const options = {};

    // 解析参数
    for (const arg of args) {
        if (arg === '--help') {
            const validator = new FileOutputValidator();
            validator.showHelp();
            return;
        }

        if (arg.startsWith('--directories=')) {
            options.directories = arg.split('=')[1].split(',');
        } else if (arg.startsWith('--extensions=')) {
            options.fileExtensions = arg.split('=')[1].split(',');
        } else if (arg === '--no-syntax') {
            options.checkSyntax = false;
        } else if (arg === '--no-templates') {
            options.checkTemplates = false;
        } else if (arg === '--no-encoding') {
            options.checkEncoding = false;
        } else if (arg === '--auto-fix') {
            options.autoFix = true;
        } else if (arg === '--verbose') {
            options.verbose = true;
        }
    }

    try {
        const validator = new FileOutputValidator(options);
        await validator.validate();

        const totalIssues = validator.errors.length + validator.warnings.length;
        process.exit(totalIssues > 0 ? 1 : 0);
    } catch (error) {
        console.error(`❌ 验证失败: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = FileOutputValidator;
