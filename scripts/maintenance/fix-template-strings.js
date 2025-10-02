#!/usr/bin/env node

/**
 * 模板字符串修复工具
 * 
 * 专门修复模板字符串转义错误
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class TemplateStringFixer {
    constructor() {
        this.fixedCount = 0;
        this.errorCount = 0;
    }

    async fixAllFiles() {
        console.log('🔧 开始修复模板字符串错误...\n');

        try {
            // 获取所有需要修复的文件
            const files = await this.getFilesToFix();

            for (const file of files) {
                await this.fixFile(file);
            }

            console.log(`\n✅ 修复完成: ${this.fixedCount} 个文件`);
            console.log(`❌ 修复失败: ${this.errorCount} 个文件`);

        } catch (error) {
            console.error(`❌ 修复过程出错: ${error.message}`);
            throw error;
        }
    }

    async getFilesToFix() {
        const files = [];
        const searchDirs = ['scripts/', 'src/'];

        for (const dir of searchDirs) {
            if (await this.directoryExists(dir)) {
                const dirFiles = await this.getFilesInDirectory(dir);
                files.push(...dirFiles);
            }
        }

        return files;
    }

    async getFilesInDirectory(dir) {
        const files = [];

        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    const subFiles = await this.getFilesInDirectory(fullPath);
                    files.push(...subFiles);
                } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            console.log(`  ⚠️ 无法读取目录 ${dir}: ${error.message}`);
        }

        return files;
    }

    async directoryExists(dir) {
        try {
            const stat = await fs.stat(dir);
            return stat.isDirectory();
        } catch {
            return false;
        }
    }

    async fixFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const fixedContent = this.fixTemplateStrings(content);

            if (fixedContent !== content) {
                await fs.writeFile(filePath, fixedContent, 'utf8');
                console.log(`  ✅ 修复: ${filePath}`);
                this.fixedCount++;
            }
        } catch (error) {
            console.log(`  ❌ 修复失败: ${filePath} - ${error.message}`);
            this.errorCount++;
        }
    }

    fixTemplateStrings(content) {
        let fixed = content;

        // 修复错误的模板字符串转义
        // 将 ` 替换为 `
        fixed = fixed.replace(/`/g, '`');

        // 将 ${ 替换为 ${
        fixed = fixed.replace(/\\\$\{/g, '${');

        // 修复未终止的模板字符串（简单情况）
        // 查找可能的未终止模板字符串并尝试修复
        const lines = fixed.split('\n');
        const fixedLines = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            // 检查是否有未终止的模板字符串
            const backticks = (line.match(/`/g) || []).length;
            if (backticks % 2 !== 0) {
                // 尝试找到下一个反引号
                let found = false;
                for (let j = i + 1; j < lines.length && j < i + 10; j++) {
                    const nextLine = lines[j];
                    const nextBackticks = (nextLine.match(/`/g) || []).length; `
                    if (nextBackticks > 0) {
                        // 在下一行找到反引号，可能是一个多行模板字符串
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    // 没有找到结束的反引号，尝试添加一个
                    line = line + '`';`
                }
            }

            fixedLines.push(line);
        }

        return fixedLines.join('\n');
    }
}

// CLI 接口
async function main() {
    const fixer = new TemplateStringFixer();
    await fixer.fixAllFiles();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = TemplateStringFixer;
