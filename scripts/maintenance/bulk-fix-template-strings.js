#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const targetDirs = ['scripts/', 'src/'];
const fileExtensions = ['.js', '.ts'];

async function bulkFixTemplateStrings() {
    console.log('🔧 开始批量修复模板字符串错误...');
    let fixedCount = 0;
    let failedCount = 0;

    for (const dir of targetDirs) {
        try {
            const files = execSync(`find ${dir} -type f ${fileExtensions.map(ext => `-name "*${ext}"`).join(' -o ')}`).toString().split('\n').filter(Boolean);

            for (const file of files) {
                try {
                    let content = await fs.readFile(file, 'utf8');
                    let hasChanges = false;

                    // 修复模板字符串内部的转义问题
                    // 1. 修复 ` 为 `
                    const beforeBacktick = content;
                    content = content.replace(/\`/g, '`');
                    if (content !== beforeBacktick) hasChanges = true;

                    // 2. 修复 ${ 为 ${
                    const beforeDollar = content;
                    content = content.replace(/\\\$\{/g, '${');
                    if (content !== beforeDollar) hasChanges = true;

                    // 3. 修复未终止的模板字符串（简单情况）
                    // 查找可能的未终止模板字符串
                    const lines = content.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];

                        // 检查是否有未终止的模板字符串
                        if (line.includes('`') && !line.includes('console.log(`') && !line.includes('console.error(`')) {
                            // 计算反引号数量
                            const backtickCount = (line.match(/`/g) || []).length;
                            if (backtickCount % 2 !== 0) {
                                // 奇数个反引号，可能未终止
                                // 尝试在行末添加反引号
                                if (!line.trim().endsWith('`') && !line.trim().endsWith(';')) {
                                    `
                                    lines[i] = line + '`';
                                    hasChanges = true;
                                }
                            }
                        }
                    }

                    if (hasChanges) {
                        content = lines.join('\n');
                        await fs.writeFile(file, content, 'utf8');
                        console.log(`  ✅ 修复: ${file}`);
                        fixedCount++;
                    }
                } catch (fileError) {
                    console.error(`  ❌ 修复文件失败 ${file}: ${fileError.message}`);
                    failedCount++;
                }
            }
        } catch (dirError) {
            console.warn(`⚠️ 查找文件失败 ${dir}: ${dirError.message}`);
        }
    }

    console.log(`\n✅ 批量修复完成: ${fixedCount} 个文件`);
    console.log(`❌ 修复失败: ${failedCount} 个文件`);
}

if (require.main === module) {
    bulkFixTemplateStrings().catch(console.error);
}

module.exports = { bulkFixTemplateStrings };
