#!/usr/bin/env node

/**
 * 文件管理工具 - 防止临时文件污染和重复生成
 * 
 * 功能：
 * - 检查文件命名规范
 * - 检测重复内容
 * - 管理临时文件
 * - 文档生命周期管理
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class FileManager {
    constructor() {
        this.projectRoot = process.cwd();
        this.config = {
            docsDir: 'docs',
            tempDir: 'tmp',
            workDir: '.work',
            archiveDir: 'docs/archive',
            maxTempAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            similarityThreshold: 0.8
        };
        
        this.filePatterns = {
            formal: /^[A-Z_]+_[A-Z_]+_v\d+\.md$/,
            temp: /^\d{8}_[A-Z_]+_[A-Z_]+_temp\.md$/,
            agent: /^[A-Z]+_\d{8}_[A-Z_]+_(draft|review|final)\.md$/
        };
    }

    /**
     * 检查文件命名规范
     */
    checkNamingConvention(filePath) {
        const fileName = path.basename(filePath);
        const dir = path.dirname(filePath);
        
        // 检查是否在正确目录
        if (dir.includes('docs/') && !dir.includes('tmp/')) {
            // 正式文档应使用正式命名格式
            if (!this.filePatterns.formal.test(fileName) && fileName.endsWith('.md')) {
                return {
                    valid: false,
                    type: 'naming',
                    message: `正式文档命名不规范: ${fileName}，应使用格式: TYPE_TOPIC_v1.md`
                };
            }
        }
        
        if (dir.includes('tmp/')) {
            // 临时文件应使用临时命名格式
            const isValidTemp = this.filePatterns.temp.test(fileName) || 
                               this.filePatterns.agent.test(fileName);
            if (!isValidTemp && fileName.endsWith('.md')) {
                return {
                    valid: false,
                    type: 'naming',
                    message: `临时文件命名不规范: ${fileName}`
                };
            }
        }
        
        return { valid: true };
    }

    /**
     * 计算文件内容哈希
     */
    getFileHash(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            // 移除元数据和时间戳，只计算主要内容的哈希
            const cleanContent = content
                .replace(/<!--[\s\S]*?-->/g, '') // 移除注释
                .replace(/\d{4}-\d{2}-\d{2}/g, '') // 移除日期
                .replace(/\s+/g, ' ') // 标准化空白字符
                .trim();
            
            return crypto.createHash('md5').update(cleanContent).digest('hex');
        } catch (error) {
            return null;
        }
    }

    /**
     * 检测重复文件
     */
    findDuplicates() {
        const hashMap = new Map();
        const duplicates = [];
        
        this.walkDirectory(this.config.docsDir, (filePath) => {
            if (!filePath.endsWith('.md')) return;
            
            const hash = this.getFileHash(filePath);
            if (!hash) return;
            
            if (hashMap.has(hash)) {
                duplicates.push({
                    original: hashMap.get(hash),
                    duplicate: filePath,
                    hash
                });
            } else {
                hashMap.set(hash, filePath);
            }
        });
        
        return duplicates;
    }

    /**
     * 检查内容相似性
     */
    checkSimilarity(file1, file2) {
        try {
            const content1 = fs.readFileSync(file1, 'utf8').toLowerCase();
            const content2 = fs.readFileSync(file2, 'utf8').toLowerCase();
            
            // 简单的相似度计算（基于共同词汇）
            const words1 = new Set(content1.match(/\w+/g) || []);
            const words2 = new Set(content2.match(/\w+/g) || []);
            
            const intersection = new Set([...words1].filter(x => words2.has(x)));
            const union = new Set([...words1, ...words2]);
            
            return intersection.size / union.size;
        } catch (error) {
            return 0;
        }
    }

    /**
     * 查找相似文档
     */
    findSimilarDocuments(targetFile) {
        const similar = [];
        
        this.walkDirectory(this.config.docsDir, (filePath) => {
            if (filePath === targetFile || !filePath.endsWith('.md')) return;
            
            const similarity = this.checkSimilarity(targetFile, filePath);
            if (similarity > this.config.similarityThreshold) {
                similar.push({
                    file: filePath,
                    similarity: similarity.toFixed(2)
                });
            }
        });
        
        return similar.sort((a, b) => b.similarity - a.similarity);
    }

    /**
     * 清理过期临时文件
     */
    cleanOldTempFiles() {
        const now = Date.now();
        const cleaned = [];
        
        if (!fs.existsSync(this.config.tempDir)) return cleaned;
        
        this.walkDirectory(this.config.tempDir, (filePath) => {
            try {
                const stats = fs.statSync(filePath);
                const age = now - stats.mtime.getTime();
                
                if (age > this.config.maxTempAge) {
                    // 备份重要文件
                    if (this.isImportantFile(filePath)) {
                        this.backupFile(filePath);
                    }
                    
                    fs.unlinkSync(filePath);
                    cleaned.push(filePath);
                }
            } catch (error) {
                console.warn(`无法处理文件 ${filePath}: ${error.message}`);
            }
        });
        
        return cleaned;
    }

    /**
     * 判断是否为重要文件
     */
    isImportantFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        // 检查文件大小和内容质量
        return content.length > 1000 && 
               !content.includes('[DRAFT]') &&
               !content.includes('TODO');
    }

    /**
     * 备份文件
     */
    backupFile(filePath) {
        const backupDir = path.join(this.config.tempDir, 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const fileName = path.basename(filePath);
        const timestamp = new Date().toISOString().slice(0, 10);
        const backupPath = path.join(backupDir, `${timestamp}_${fileName}`);
        
        fs.copyFileSync(filePath, backupPath);
    }

    /**
     * 提升临时文件为正式文档
     */
    promoteFile(tempFilePath, targetDir) {
        if (!fs.existsSync(tempFilePath)) {
            throw new Error(`临时文件不存在: ${tempFilePath}`);
        }
        
        // 检查是否存在相似文档
        const similar = this.findSimilarDocuments(tempFilePath);
        if (similar.length > 0) {
            console.warn('发现相似文档:');
            similar.forEach(item => {
                console.warn(`  - ${item.file} (相似度: ${item.similarity})`);
            });
        }
        
        // 生成正式文件名
        const content = fs.readFileSync(tempFilePath, 'utf8');
        const formalName = this.generateFormalName(content, targetDir);
        const targetPath = path.join(targetDir, formalName);
        
        // 检查目标文件是否已存在
        if (fs.existsSync(targetPath)) {
            throw new Error(`目标文件已存在: ${targetPath}`);
        }
        
        // 移动文件并清理元数据
        const cleanContent = this.cleanupContent(content);
        fs.writeFileSync(targetPath, cleanContent);
        fs.unlinkSync(tempFilePath);
        
        return targetPath;
    }

    /**
     * 生成正式文档名称
     */
    generateFormalName(content, targetDir) {
        // 从内容中提取类型和主题
        const lines = content.split('\n');
        const title = lines.find(line => line.startsWith('# '))?.replace('# ', '') || 'UNTITLED';
        
        // 根据目录确定类型
        const dirName = path.basename(targetDir);
        const typeMap = {
            'product': 'PRD',
            'technical': 'TECH',
            'project': 'PROJECT',
            'cursor': 'GUIDE'
        };
        
        const type = typeMap[dirName] || 'DOC';
        const topic = title.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z_]/g, '');
        
        return `${type}_${topic}_v1.md`;
    }

    /**
     * 清理文档内容
     */
    cleanupContent(content) {
        // 移除临时标记和生成信息
        return content
            .replace(/<!--[\s\S]*?Generated by:[\s\S]*?-->/g, '')
            .replace(/\[DRAFT\]/g, '')
            .replace(/\[WIP\]/g, '')
            .replace(/\[REVIEW\]/g, '')
            .trim();
    }

    /**
     * 遍历目录
     */
    walkDirectory(dir, callback) {
        if (!fs.existsSync(dir)) return;
        
        // 排除的目录
        const excludeDirs = ['node_modules', '.git', 'coverage', 'dist', '.next', '.nuxt'];
        
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            // 跳过排除的目录
            if (excludeDirs.includes(file)) return;
            
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
                this.walkDirectory(filePath, callback);
            } else {
                callback(filePath);
            }
        });
    }

    /**
     * 生成文件健康度报告
     */
    generateHealthReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFiles: 0,
                tempFiles: 0,
                violations: 0,
                duplicates: 0
            },
            issues: [],
            recommendations: []
        };

        // 检查所有文件
        this.walkDirectory('.', (filePath) => {
            if (!filePath.endsWith('.md')) return;
            
            report.summary.totalFiles++;
            
            if (filePath.includes('tmp/')) {
                report.summary.tempFiles++;
            }
            
            // 检查命名规范
            const namingCheck = this.checkNamingConvention(filePath);
            if (!namingCheck.valid) {
                report.summary.violations++;
                report.issues.push({
                    type: 'naming',
                    file: filePath,
                    message: namingCheck.message
                });
            }
        });

        // 检查重复文件
        const duplicates = this.findDuplicates();
        report.summary.duplicates = duplicates.length;
        duplicates.forEach(dup => {
            report.issues.push({
                type: 'duplicate',
                files: [dup.original, dup.duplicate],
                message: '发现重复内容文件'
            });
        });

        // 生成建议
        if (report.summary.tempFiles > 10) {
            report.recommendations.push('临时文件过多，建议运行清理命令');
        }
        if (report.summary.violations > 0) {
            report.recommendations.push('存在命名规范违规，建议修正文件名');
        }
        if (report.summary.duplicates > 0) {
            report.recommendations.push('存在重复文档，建议合并或归档');
        }

        return report;
    }

    /**
     * 主命令处理
     */
    async run() {
        const command = process.argv[2];
        
        switch (command) {
            case 'check':
                console.log('🔍 检查文件规范...');
                const report = this.generateHealthReport();
                console.log(JSON.stringify(report, null, 2));
                break;
                
            case 'clean':
                console.log('🧹 清理临时文件...');
                const cleaned = this.cleanOldTempFiles();
                console.log(`已清理 ${cleaned.length} 个过期临时文件`);
                cleaned.forEach(file => console.log(`  - ${file}`));
                break;
                
            case 'duplicates':
                console.log('🔍 检查重复文件...');
                const duplicates = this.findDuplicates();
                if (duplicates.length === 0) {
                    console.log('✅ 未发现重复文件');
                } else {
                    console.log(`⚠️ 发现 ${duplicates.length} 组重复文件:`);
                    duplicates.forEach(dup => {
                        console.log(`  - ${dup.original}`);
                        console.log(`  - ${dup.duplicate}`);
                        console.log('');
                    });
                }
                break;
                
            case 'promote':
                const tempFile = process.argv[3];
                const targetDir = process.argv[4];
                if (!tempFile || !targetDir) {
                    console.error('用法: node file-manager.js promote <临时文件> <目标目录>');
                    process.exit(1);
                }
                try {
                    const promoted = this.promoteFile(tempFile, targetDir);
                    console.log(`✅ 文件已提升: ${promoted}`);
                } catch (error) {
                    console.error(`❌ 提升失败: ${error.message}`);
                    process.exit(1);
                }
                break;
                
            case 'similar':
                const targetFile = process.argv[3];
                if (!targetFile) {
                    console.error('用法: node file-manager.js similar <文件路径>');
                    process.exit(1);
                }
                const similar = this.findSimilarDocuments(targetFile);
                if (similar.length === 0) {
                    console.log('✅ 未发现相似文档');
                } else {
                    console.log(`🔍 发现 ${similar.length} 个相似文档:`);
                    similar.forEach(item => {
                        console.log(`  - ${item.file} (相似度: ${item.similarity})`);
                    });
                }
                break;
                
            default:
                console.log(`
文件管理工具 - 使用说明

命令:
  check      - 检查文件规范和健康度
  clean      - 清理过期临时文件
  duplicates - 检查重复文件
  promote    - 提升临时文件为正式文档
  similar    - 查找相似文档

示例:
  node file-manager.js check
  node file-manager.js clean
  node file-manager.js promote tmp/drafts/my_doc.md docs/technical/
  node file-manager.js similar docs/product/PRD_v1.md
                `);
        }
    }
}

// 运行工具
if (require.main === module) {
    const manager = new FileManager();
    manager.run().catch(console.error);
}

module.exports = FileManager;
