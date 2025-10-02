#!/usr/bin/env node

/**
 * 项目健康度检查脚本
 * 全面检查项目的代码质量、安全性、性能等指标
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProjectHealthChecker {
  constructor() {
    this.projectRoot = process.cwd();
    this.healthReport = {
      timestamp: new Date().toISOString(),
      overall: 'unknown',
      scores: {},
      issues: [],
      recommendations: []
    };
  }

  // 运行完整健康检查
  async runHealthCheck() {
    console.log('🏥 开始项目健康度检查...\n');

    const checks = [
      { name: '代码质量', method: 'checkCodeQuality' },
      { name: '安全性', method: 'checkSecurity' },
      { name: '依赖管理', method: 'checkDependencies' },
      { name: '测试覆盖率', method: 'checkTestCoverage' },
      { name: '性能指标', method: 'checkPerformance' },
      { name: '文档完整性', method: 'checkDocumentation' },
      { name: 'Git 规范', method: 'checkGitPractices' },
      { name: '配置文件', method: 'checkConfiguration' }
    ];

    for (const check of checks) {
      try {
        console.log(`🔍 检查${check.name}...`);
        const score = await this[check.method]();
        this.healthReport.scores[check.name] = score;
        console.log(`  评分: ${score}/100\n`);
      } catch (error) {
        console.error(`❌ ${check.name}检查失败:`, error.message);
        this.healthReport.scores[check.name] = 0;
        this.healthReport.issues.push({
          category: check.name,
          severity: 'error',
          message: error.message
        });
      }
    }

    this.calculateOverallHealth();
    this.generateRecommendations();
    this.saveHealthReport();
    this.displayHealthReport();
  }

  // 检查代码质量
  async checkCodeQuality() {
    let score = 100;
    const issues = [];

    try {
      // ESLint 检查
      const lintResult = execSync('npm run lint', { 
        stdio: 'pipe', 
        encoding: 'utf8' 
      });
      
      // 解析 ESLint 输出
      const errorCount = (lintResult.match(/error/g) || []).length;
      const warningCount = (lintResult.match(/warning/g) || []).length;
      
      score -= errorCount * 5;
      score -= warningCount * 2;
      
      if (errorCount > 0) {
        issues.push(`${errorCount} 个 ESLint 错误`);
      }
      if (warningCount > 0) {
        issues.push(`${warningCount} 个 ESLint 警告`);
      }
    } catch (error) {
      score -= 20;
      issues.push('ESLint 检查失败');
    }

    // 检查代码复杂度
    try {
      const complexityCheck = this.checkCodeComplexity();
      score -= complexityCheck.penalty;
      if (complexityCheck.issues.length > 0) {
        issues.push(...complexityCheck.issues);
      }
    } catch (error) {
      issues.push('代码复杂度检查失败');
    }

    // 检查代码重复
    const duplicationCheck = this.checkCodeDuplication();
    score -= duplicationCheck.penalty;
    if (duplicationCheck.issues.length > 0) {
      issues.push(...duplicationCheck.issues);
    }

    this.healthReport.issues.push(...issues.map(issue => ({
      category: '代码质量',
      severity: 'warning',
      message: issue
    })));

    return Math.max(0, score);
  }

  // 检查代码复杂度
  checkCodeComplexity() {
    const issues = [];
    let penalty = 0;

    // 检查文件大小
    const sourceFiles = this.getSourceFiles();
    const largeFiles = sourceFiles.filter(file => {
      const stats = fs.statSync(file);
      return stats.size > 10000; // 10KB
    });

    if (largeFiles.length > 0) {
      penalty += largeFiles.length * 5;
      issues.push(`${largeFiles.length} 个文件过大 (>10KB)`);
    }

    // 检查函数长度（简单启发式）
    let longFunctions = 0;
    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const functionMatches = content.match(/function\s+\w+\s*\([^)]*\)\s*{/g) || [];
      
      functionMatches.forEach(() => {
        // 简单的函数长度检查
        const lines = content.split('\n');
        if (lines.length > 50) {
          longFunctions++;
        }
      });
    });

    if (longFunctions > 0) {
      penalty += longFunctions * 3;
      issues.push(`${longFunctions} 个函数可能过长`);
    }

    return { penalty, issues };
  }

  // 检查代码重复
  checkCodeDuplication() {
    const issues = [];
    let penalty = 0;

    // 简单的重复代码检测
    const sourceFiles = this.getSourceFiles();
    const codeBlocks = new Map();

    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      // 检查连续的代码块
      for (let i = 0; i < lines.length - 5; i++) {
        const block = lines.slice(i, i + 5).join('\n').trim();
        if (block.length > 50) {
          if (codeBlocks.has(block)) {
            codeBlocks.set(block, codeBlocks.get(block) + 1);
          } else {
            codeBlocks.set(block, 1);
          }
        }
      }
    });

    const duplicates = Array.from(codeBlocks.entries()).filter(([, count]) => count > 1);
    if (duplicates.length > 0) {
      penalty += duplicates.length * 3;
      issues.push(`发现 ${duplicates.length} 处可能的代码重复`);
    }

    return { penalty, issues };
  }

  // 检查安全性
  async checkSecurity() {
    let score = 100;
    const issues = [];

    try {
      // npm audit 检查
      const auditResult = execSync('npm audit --json', { 
        stdio: 'pipe', 
        encoding: 'utf8' 
      });
      
      const audit = JSON.parse(auditResult);
      const vulnerabilities = audit.metadata?.vulnerabilities || {};
      
      const critical = vulnerabilities.critical || 0;
      const high = vulnerabilities.high || 0;
      const moderate = vulnerabilities.moderate || 0;
      const low = vulnerabilities.low || 0;

      score -= critical * 20;
      score -= high * 10;
      score -= moderate * 5;
      score -= low * 2;

      if (critical > 0) issues.push(`${critical} 个严重安全漏洞`);
      if (high > 0) issues.push(`${high} 个高危安全漏洞`);
      if (moderate > 0) issues.push(`${moderate} 个中等安全漏洞`);
      if (low > 0) issues.push(`${low} 个低危安全漏洞`);

    } catch (error) {
      score -= 10;
      issues.push('安全审计检查失败');
    }

    // 检查敏感文件
    const sensitiveFiles = [
      '.env',
      'config/database.yml',
      'config/secrets.yml'
    ];

    sensitiveFiles.forEach(file => {
      if (fs.existsSync(path.join(this.projectRoot, file))) {
        // 检查是否在 .gitignore 中
        const gitignorePath = path.join(this.projectRoot, '.gitignore');
        if (fs.existsSync(gitignorePath)) {
          const gitignore = fs.readFileSync(gitignorePath, 'utf8');
          if (!gitignore.includes(file)) {
            score -= 15;
            issues.push(`敏感文件 ${file} 未在 .gitignore 中`);
          }
        }
      }
    });

    this.healthReport.issues.push(...issues.map(issue => ({
      category: '安全性',
      severity: 'error',
      message: issue
    })));

    return Math.max(0, score);
  }

  // 检查依赖管理
  async checkDependencies() {
    let score = 100;
    const issues = [];

    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
      );

      // 检查过时的依赖
      try {
        const outdatedResult = execSync('npm outdated --json', { 
          stdio: 'pipe', 
          encoding: 'utf8' 
        });
        
        const outdated = JSON.parse(outdatedResult || '{}');
        const outdatedCount = Object.keys(outdated).length;
        
        if (outdatedCount > 0) {
          score -= Math.min(outdatedCount * 2, 30);
          issues.push(`${outdatedCount} 个依赖包需要更新`);
        }
      } catch (error) {
        // npm outdated 在没有过时包时会返回非零退出码
      }

      // 检查未使用的依赖
      const unusedDeps = await this.findUnusedDependencies();
      if (unusedDeps.length > 0) {
        score -= Math.min(unusedDeps.length * 3, 20);
        issues.push(`${unusedDeps.length} 个未使用的依赖包`);
      }

      // 检查 package-lock.json
      if (!fs.existsSync(path.join(this.projectRoot, 'package-lock.json'))) {
        score -= 10;
        issues.push('缺少 package-lock.json 文件');
      }

    } catch (error) {
      score -= 20;
      issues.push('依赖检查失败');
    }

    this.healthReport.issues.push(...issues.map(issue => ({
      category: '依赖管理',
      severity: 'warning',
      message: issue
    })));

    return Math.max(0, score);
  }

  // 查找未使用的依赖
  async findUnusedDependencies() {
    const unusedDeps = [];
    
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
      );

      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      const sourceFiles = this.getSourceFiles();
      const allContent = sourceFiles
        .map(file => fs.readFileSync(file, 'utf8'))
        .join('\n');

      Object.keys(dependencies).forEach(dep => {
        const importPatterns = [
          `require('${dep}')`,
          `require("${dep}")`,
          `from '${dep}'`,
          `from "${dep}"`,
          `import '${dep}'`,
          `import "${dep}"`
        ];

        const isUsed = importPatterns.some(pattern => 
          allContent.includes(pattern)
        );

        if (!isUsed) {
          unusedDeps.push(dep);
        }
      });
    } catch (error) {
      console.warn('未使用依赖检查失败:', error.message);
    }

    return unusedDeps;
  }

  // 检查测试覆盖率
  async checkTestCoverage() {
    let score = 100;
    const issues = [];

    try {
      // 运行测试覆盖率
      const coverageResult = execSync('npm run coverage', { 
        stdio: 'pipe', 
        encoding: 'utf8' 
      });

      // 解析覆盖率报告
      const coverageMatch = coverageResult.match(/All files\s+\|\s+([\d.]+)/);
      if (coverageMatch) {
        const coverage = parseFloat(coverageMatch[1]);
        
        if (coverage < 80) {
          score -= (80 - coverage) * 2;
          issues.push(`测试覆盖率过低: ${coverage}%`);
        }
      } else {
        score -= 30;
        issues.push('无法解析测试覆盖率');
      }

    } catch (error) {
      score -= 40;
      issues.push('测试覆盖率检查失败');
    }

    // 检查测试文件存在性
    const testDirs = ['test', 'tests', '__tests__', 'spec'];
    const hasTests = testDirs.some(dir => 
      fs.existsSync(path.join(this.projectRoot, dir))
    );

    if (!hasTests) {
      score -= 50;
      issues.push('未找到测试目录');
    }

    this.healthReport.issues.push(...issues.map(issue => ({
      category: '测试覆盖率',
      severity: 'warning',
      message: issue
    })));

    return Math.max(0, score);
  }

  // 检查性能指标
  async checkPerformance() {
    let score = 100;
    const issues = [];

    // 检查包大小
    try {
      if (fs.existsSync(path.join(this.projectRoot, 'node_modules'))) {
        const nodeModulesSize = this.getDirectorySize(
          path.join(this.projectRoot, 'node_modules')
        );
        
        if (nodeModulesSize > 500 * 1024 * 1024) { // 500MB
          score -= 20;
          issues.push(`node_modules 过大: ${Math.round(nodeModulesSize / 1024 / 1024)}MB`);
        }
      }
    } catch (error) {
      issues.push('包大小检查失败');
    }

    // 检查构建输出大小
    const buildDirs = ['dist', 'build', 'public'];
    buildDirs.forEach(dir => {
      const buildPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(buildPath)) {
        const buildSize = this.getDirectorySize(buildPath);
        if (buildSize > 50 * 1024 * 1024) { // 50MB
          score -= 10;
          issues.push(`构建输出过大: ${dir} (${Math.round(buildSize / 1024 / 1024)}MB)`);
        }
      }
    });

    // 检查大文件
    const largeFiles = this.findLargeFiles();
    if (largeFiles.length > 0) {
      score -= Math.min(largeFiles.length * 5, 25);
      issues.push(`${largeFiles.length} 个大文件 (>1MB)`);
    }

    this.healthReport.issues.push(...issues.map(issue => ({
      category: '性能指标',
      severity: 'info',
      message: issue
    })));

    return Math.max(0, score);
  }

  // 检查文档完整性
  async checkDocumentation() {
    let score = 100;
    const issues = [];

    // 检查必需文档
    const requiredDocs = [
      'README.md',
      'CHANGELOG.md',
      'LICENSE'
    ];

    requiredDocs.forEach(doc => {
      if (!fs.existsSync(path.join(this.projectRoot, doc))) {
        score -= 15;
        issues.push(`缺少 ${doc} 文件`);
      }
    });

    // 检查 README 质量
    const readmePath = path.join(this.projectRoot, 'README.md');
    if (fs.existsSync(readmePath)) {
      const readme = fs.readFileSync(readmePath, 'utf8');
      
      if (readme.length < 500) {
        score -= 10;
        issues.push('README.md 内容过少');
      }

      const requiredSections = ['安装', '使用', '贡献'];
      requiredSections.forEach(section => {
        if (!readme.toLowerCase().includes(section.toLowerCase())) {
          score -= 5;
          issues.push(`README.md 缺少 ${section} 部分`);
        }
      });
    }

    // 检查 API 文档
    if (fs.existsSync(path.join(this.projectRoot, 'src'))) {
      const hasApiDocs = fs.existsSync(path.join(this.projectRoot, 'docs')) ||
                        readme.includes('API') ||
                        readme.includes('api');
      
      if (!hasApiDocs) {
        score -= 10;
        issues.push('缺少 API 文档');
      }
    }

    this.healthReport.issues.push(...issues.map(issue => ({
      category: '文档完整性',
      severity: 'info',
      message: issue
    })));

    return Math.max(0, score);
  }

  // 检查 Git 规范
  async checkGitPractices() {
    let score = 100;
    const issues = [];

    try {
      // 检查 .gitignore
      if (!fs.existsSync(path.join(this.projectRoot, '.gitignore'))) {
        score -= 20;
        issues.push('缺少 .gitignore 文件');
      }

      // 检查提交历史
      const commitCount = execSync('git rev-list --count HEAD', { 
        stdio: 'pipe', 
        encoding: 'utf8' 
      }).trim();

      if (parseInt(commitCount) < 5) {
        score -= 10;
        issues.push('提交历史过少');
      }

      // 检查分支策略
      const branches = execSync('git branch -r', { 
        stdio: 'pipe', 
        encoding: 'utf8' 
      }).trim();

      if (!branches.includes('main') && !branches.includes('master')) {
        score -= 5;
        issues.push('未找到主分支');
      }

      // 检查最近提交
      const lastCommit = execSync('git log -1 --format="%cr"', { 
        stdio: 'pipe', 
        encoding: 'utf8' 
      }).trim();

      if (lastCommit.includes('month') || lastCommit.includes('year')) {
        score -= 15;
        issues.push('项目长时间未更新');
      }

    } catch (error) {
      score -= 30;
      issues.push('Git 检查失败（可能不是 Git 仓库）');
    }

    this.healthReport.issues.push(...issues.map(issue => ({
      category: 'Git 规范',
      severity: 'info',
      message: issue
    })));

    return Math.max(0, score);
  }

  // 检查配置文件
  async checkConfiguration() {
    let score = 100;
    const issues = [];

    // 检查必需配置文件
    const configFiles = [
      'package.json',
      'tsconfig.json',
      '.eslintrc.js',
      '.prettierrc'
    ];

    configFiles.forEach(file => {
      if (!fs.existsSync(path.join(this.projectRoot, file))) {
        score -= 10;
        issues.push(`缺少 ${file} 配置文件`);
      }
    });

    // 检查环境配置
    if (!fs.existsSync(path.join(this.projectRoot, '.env.example'))) {
      score -= 5;
      issues.push('缺少 .env.example 文件');
    }

    // 检查 CI/CD 配置
    const ciConfigs = [
      '.github/workflows',
      '.gitlab-ci.yml',
      'Jenkinsfile'
    ];

    const hasCiConfig = ciConfigs.some(config => 
      fs.existsSync(path.join(this.projectRoot, config))
    );

    if (!hasCiConfig) {
      score -= 10;
      issues.push('缺少 CI/CD 配置');
    }

    this.healthReport.issues.push(...issues.map(issue => ({
      category: '配置文件',
      severity: 'info',
      message: issue
    })));

    return Math.max(0, score);
  }

  // 获取源文件列表
  getSourceFiles() {
    const sourceFiles = [];
    const extensions = ['.js', '.ts', '.jsx', '.tsx'];
    
    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          walkDir(filePath);
        } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
          sourceFiles.push(filePath);
        }
      });
    };

    walkDir(path.join(this.projectRoot, 'src'));
    return sourceFiles;
  }

  // 获取目录大小
  getDirectorySize(dirPath) {
    let size = 0;
    
    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else {
          size += stat.size;
        }
      });
    };

    walkDir(dirPath);
    return size;
  }

  // 查找大文件
  findLargeFiles() {
    const largeFiles = [];
    const maxSize = 1024 * 1024; // 1MB
    
    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          walkDir(filePath);
        } else if (stat.isFile() && stat.size > maxSize) {
          largeFiles.push({
            path: filePath,
            size: stat.size
          });
        }
      });
    };

    walkDir(this.projectRoot);
    return largeFiles;
  }

  // 计算总体健康度
  calculateOverallHealth() {
    const scores = Object.values(this.healthReport.scores);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    if (averageScore >= 90) {
      this.healthReport.overall = 'excellent';
    } else if (averageScore >= 80) {
      this.healthReport.overall = 'good';
    } else if (averageScore >= 70) {
      this.healthReport.overall = 'fair';
    } else if (averageScore >= 60) {
      this.healthReport.overall = 'poor';
    } else {
      this.healthReport.overall = 'critical';
    }
  }

  // 生成改进建议
  generateRecommendations() {
    const recommendations = [];

    // 基于问题生成建议
    this.healthReport.issues.forEach(issue => {
      switch (issue.category) {
        case '代码质量':
          if (issue.message.includes('ESLint')) {
            recommendations.push('运行 `npm run lint -- --fix` 自动修复代码风格问题');
          }
          if (issue.message.includes('复杂度')) {
            recommendations.push('考虑重构复杂的函数和文件，提高代码可维护性');
          }
          break;
          
        case '安全性':
          if (issue.message.includes('漏洞')) {
            recommendations.push('运行 `npm audit fix` 修复安全漏洞');
          }
          if (issue.message.includes('敏感文件')) {
            recommendations.push('将敏感文件添加到 .gitignore 中');
          }
          break;
          
        case '依赖管理':
          if (issue.message.includes('更新')) {
            recommendations.push('运行 `npm update` 更新过时的依赖包');
          }
          if (issue.message.includes('未使用')) {
            recommendations.push('移除未使用的依赖包以减少项目体积');
          }
          break;
          
        case '测试覆盖率':
          recommendations.push('增加单元测试以提高代码覆盖率');
          break;
          
        case '文档完整性':
          recommendations.push('完善项目文档，包括 README、API 文档等');
          break;
      }
    });

    // 通用建议
    if (this.healthReport.overall === 'poor' || this.healthReport.overall === 'critical') {
      recommendations.push('项目健康度较低，建议优先处理高优先级问题');
    }

    this.healthReport.recommendations = [...new Set(recommendations)];
  }

  // 保存健康报告
  saveHealthReport() {
    const reportPath = path.join(this.projectRoot, 'project-health-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.healthReport, null, 2));
    console.log(`📊 健康报告已保存: ${reportPath}`);
  }

  // 显示健康报告
  displayHealthReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 项目健康度报告');
    console.log('='.repeat(60));

    // 总体评级
    const healthEmoji = {
      excellent: '🟢',
      good: '🟡',
      fair: '🟠',
      poor: '🔴',
      critical: '💀'
    };

    console.log(`\n总体健康度: ${healthEmoji[this.healthReport.overall]} ${this.healthReport.overall.toUpperCase()}`);

    // 各项评分
    console.log('\n📈 详细评分:');
    Object.entries(this.healthReport.scores).forEach(([category, score]) => {
      const emoji = score >= 90 ? '🟢' : score >= 80 ? '🟡' : score >= 70 ? '🟠' : '🔴';
      console.log(`  ${emoji} ${category}: ${score}/100`);
    });

    // 问题列表
    if (this.healthReport.issues.length > 0) {
      console.log('\n⚠️ 发现的问题:');
      this.healthReport.issues.forEach(issue => {
        const emoji = issue.severity === 'error' ? '🔴' : 
                     issue.severity === 'warning' ? '🟡' : '🔵';
        console.log(`  ${emoji} [${issue.category}] ${issue.message}`);
      });
    }

    // 改进建议
    if (this.healthReport.recommendations.length > 0) {
      console.log('\n💡 改进建议:');
      this.healthReport.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }

    console.log('\n' + '='.repeat(60));
  }
}

// CLI 入口
async function main() {
  const args = process.argv.slice(2);
  const checker = new ProjectHealthChecker();

  if (args.includes('--help') || args.includes('-h')) {
    console.log('项目健康度检查工具');
    console.log('\n用法:');
    console.log('  node project-health.js          # 运行完整检查');
    console.log('  node project-health.js --quick  # 快速检查');
    console.log('  node project-health.js --report # 仅生成报告');
    return;
  }

  try {
    await checker.runHealthCheck();
  } catch (error) {
    console.error('❌ 健康检查失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ProjectHealthChecker;
