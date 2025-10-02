#!/usr/bin/env node

/**
 * 性能监控脚本
 * 监控应用性能指标，生成报告和告警
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

class PerformanceMonitor {
  constructor() {
    this.projectRoot = process.cwd();
    this.metricsDir = path.join(this.projectRoot, 'metrics');
    this.reportsDir = path.join(this.projectRoot, 'docs', 'performance');
    this.config = this.loadConfig();
    
    // 确保目录存在
    [this.metricsDir, this.reportsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // 加载配置
  loadConfig() {
    const defaultConfig = {
      thresholds: {
        cpu: 80,           // CPU 使用率阈值 (%)
        memory: 85,        // 内存使用率阈值 (%)
        loadTime: 3000,    // 页面加载时间阈值 (ms)
        bundleSize: 5000,  // 打包大小阈值 (KB)
        lighthouse: {
          performance: 90,
          accessibility: 90,
          bestPractices: 90,
          seo: 90
        }
      },
      monitoring: {
        interval: 60000,   // 监控间隔 (ms)
        retention: 30,     // 数据保留天数
        alerts: true       // 是否启用告警
      }
    };

    const configFile = path.join(this.projectRoot, 'performance.config.js');
    if (fs.existsSync(configFile)) {
      try {
        const userConfig = require(configFile);
        return { ...defaultConfig, ...userConfig };
      } catch (error) {
        console.warn('⚠️ 性能监控配置文件解析失败，使用默认配置');
      }
    }

    return defaultConfig;
  }

  /**
   * 收集系统性能指标
   */
  collectSystemMetrics() {
    console.log('📊 收集系统性能指标...');

    const metrics = {
      timestamp: new Date().toISOString(),
      cpu: {
        usage: this.getCpuUsage(),
        loadAverage: os.loadavg(),
        cores: os.cpus().length
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
      },
      disk: this.getDiskUsage(),
      network: this.getNetworkStats(),
      uptime: os.uptime()
    };

    console.log(`  CPU 使用率: ${metrics.cpu.usage}%`);
    console.log(`  内存使用率: ${metrics.memory.usage}%`);
    console.log(`  系统运行时间: ${Math.floor(metrics.uptime / 3600)}小时`);

    return metrics;
  }

  /**
   * 获取 CPU 使用率
   */
  getCpuUsage() {
    try {
      // 在 macOS 上使用 top 命令
      const output = execSync('top -l 1 -n 0 | grep "CPU usage"', { 
        encoding: 'utf8',
        timeout: 5000 
      });
      
      // 解析 CPU 使用率
      const match = output.match(/(\d+\.\d+)%\s+user/);
      return match ? parseFloat(match[1]) : 0;
    } catch (error) {
      console.warn('⚠️ 无法获取 CPU 使用率');
      return 0;
    }
  }

  /**
   * 获取磁盘使用情况
   */
  getDiskUsage() {
    try {
      const output = execSync('df -h /', { encoding: 'utf8' });
      const lines = output.split('\n');
      
      if (lines.length > 1) {
        const parts = lines[1].split(/\s+/);
        return {
          total: parts[1],
          used: parts[2],
          available: parts[3],
          usage: parts[4]
        };
      }
    } catch (error) {
      console.warn('⚠️ 无法获取磁盘使用情况');
    }
    
    return { total: 'N/A', used: 'N/A', available: 'N/A', usage: 'N/A' };
  }

  /**
   * 获取网络统计信息
   */
  getNetworkStats() {
    try {
      const output = execSync('netstat -ib', { encoding: 'utf8' });
      const lines = output.split('\n');
      
      // 简化的网络统计
      return {
        interfaces: lines.length - 2,
        status: 'active'
      };
    } catch (error) {
      console.warn('⚠️ 无法获取网络统计信息');
      return { interfaces: 0, status: 'unknown' };
    }
  }

  /**
   * 分析构建产物性能
   */
  analyzeBuildPerformance() {
    console.log('📦 分析构建产物性能...');

    const buildDirs = ['dist', 'build', '.next', 'out'];
    let buildDir = null;
    
    // 查找构建目录
    for (const dir of buildDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        buildDir = dirPath;
        break;
      }
    }

    if (!buildDir) {
      console.log('  ⚠️ 未找到构建产物目录');
      return null;
    }

    const analysis = {
      timestamp: new Date().toISOString(),
      buildDir: path.basename(buildDir),
      files: [],
      totalSize: 0,
      gzipSize: 0
    };

    // 分析文件
    this.walkDirectory(buildDir, (filePath) => {
      const stats = fs.statSync(filePath);
      const relativePath = path.relative(buildDir, filePath);
      const ext = path.extname(filePath);
      
      const fileInfo = {
        path: relativePath,
        size: stats.size,
        type: this.getFileType(ext),
        gzipSize: this.estimateGzipSize(stats.size)
      };

      analysis.files.push(fileInfo);
      analysis.totalSize += stats.size;
      analysis.gzipSize += fileInfo.gzipSize;
    });

    // 按大小排序
    analysis.files.sort((a, b) => b.size - a.size);

    console.log(`  总文件数: ${analysis.files.length}`);
    console.log(`  总大小: ${(analysis.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  预估 Gzip 大小: ${(analysis.gzipSize / 1024 / 1024).toFixed(2)} MB`);

    // 检查大文件
    const largeFiles = analysis.files.filter(f => f.size > 1024 * 1024); // > 1MB
    if (largeFiles.length > 0) {
      console.log(`  ⚠️ 发现 ${largeFiles.length} 个大文件 (>1MB)`);
    }

    return analysis;
  }

  /**
   * 遍历目录
   */
  walkDirectory(dir, callback) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
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
   * 获取文件类型
   */
  getFileType(ext) {
    const types = {
      '.js': 'JavaScript',
      '.css': 'CSS',
      '.html': 'HTML',
      '.json': 'JSON',
      '.png': 'Image',
      '.jpg': 'Image',
      '.jpeg': 'Image',
      '.gif': 'Image',
      '.svg': 'Image',
      '.woff': 'Font',
      '.woff2': 'Font',
      '.ttf': 'Font',
      '.eot': 'Font'
    };
    
    return types[ext] || 'Other';
  }

  /**
   * 估算 Gzip 压缩后大小
   */
  estimateGzipSize(originalSize) {
    // 简单估算，实际压缩比取决于文件内容
    return Math.floor(originalSize * 0.3);
  }

  /**
   * 运行 Lighthouse 性能测试
   */
  async runLighthouseAudit(url = 'http://localhost:3000') {
    console.log(`🔍 运行 Lighthouse 性能测试: ${url}`);

    try {
      // 检查 Lighthouse 是否安装
      execSync('lighthouse --version', { stdio: 'pipe' });
    } catch (error) {
      console.log('  ⚠️ Lighthouse 未安装，跳过性能测试');
      console.log('  安装命令: npm install -g lighthouse');
      return null;
    }

    try {
      const outputFile = path.join(this.metricsDir, `lighthouse-${Date.now()}.json`);
      
      execSync(`lighthouse ${url} --output=json --output-path=${outputFile} --chrome-flags="--headless"`, {
        stdio: 'pipe',
        timeout: 60000
      });

      const report = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      
      const scores = {
        performance: Math.round(report.lhr.categories.performance.score * 100),
        accessibility: Math.round(report.lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(report.lhr.categories['best-practices'].score * 100),
        seo: Math.round(report.lhr.categories.seo.score * 100),
        pwa: report.lhr.categories.pwa ? Math.round(report.lhr.categories.pwa.score * 100) : null
      };

      console.log('  性能评分:');
      console.log(`    性能: ${scores.performance}/100`);
      console.log(`    可访问性: ${scores.accessibility}/100`);
      console.log(`    最佳实践: ${scores.bestPractices}/100`);
      console.log(`    SEO: ${scores.seo}/100`);

      return {
        timestamp: new Date().toISOString(),
        url: url,
        scores: scores,
        reportPath: outputFile
      };
    } catch (error) {
      console.error('  ❌ Lighthouse 测试失败:', error.message);
      return null;
    }
  }

  /**
   * 检查性能阈值
   */
  checkThresholds(metrics) {
    console.log('⚠️ 检查性能阈值...');

    const alerts = [];

    // 检查 CPU 使用率
    if (metrics.system && metrics.system.cpu.usage > this.config.thresholds.cpu) {
      alerts.push({
        type: 'cpu',
        message: `CPU 使用率过高: ${metrics.system.cpu.usage}% (阈值: ${this.config.thresholds.cpu}%)`,
        severity: 'warning'
      });
    }

    // 检查内存使用率
    if (metrics.system && parseFloat(metrics.system.memory.usage) > this.config.thresholds.memory) {
      alerts.push({
        type: 'memory',
        message: `内存使用率过高: ${metrics.system.memory.usage}% (阈值: ${this.config.thresholds.memory}%)`,
        severity: 'warning'
      });
    }

    // 检查构建大小
    if (metrics.build && metrics.build.totalSize > this.config.thresholds.bundleSize * 1024) {
      const sizeMB = (metrics.build.totalSize / 1024 / 1024).toFixed(2);
      const thresholdMB = (this.config.thresholds.bundleSize / 1024).toFixed(2);
      alerts.push({
        type: 'bundle-size',
        message: `构建产物过大: ${sizeMB}MB (阈值: ${thresholdMB}MB)`,
        severity: 'warning'
      });
    }

    // 检查 Lighthouse 分数
    if (metrics.lighthouse) {
      Object.entries(this.config.thresholds.lighthouse).forEach(([category, threshold]) => {
        const score = metrics.lighthouse.scores[category];
        if (score && score < threshold) {
          alerts.push({
            type: 'lighthouse',
            message: `${category} 分数过低: ${score}/100 (阈值: ${threshold}/100)`,
            severity: 'warning'
          });
        }
      });
    }

    if (alerts.length === 0) {
      console.log('  ✅ 所有指标正常');
    } else {
      console.log(`  ⚠️ 发现 ${alerts.length} 个性能问题:`);
      alerts.forEach(alert => {
        console.log(`    - ${alert.message}`);
      });
    }

    return alerts;
  }

  /**
   * 生成性能报告
   */
  generateReport(metrics, alerts = []) {
    console.log('📄 生成性能报告...');

    const reportPath = path.join(
      this.reportsDir, 
      `performance-report-${new Date().toISOString().split('T')[0]}.md`
    );

    let report = `# 性能监控报告

**生成时间**: ${new Date().toLocaleString()}

## 📊 概览

`;

    // 系统指标
    if (metrics.system) {
      report += `### 系统性能

| 指标 | 当前值 | 状态 |
|------|--------|------|
| CPU 使用率 | ${metrics.system.cpu.usage}% | ${metrics.system.cpu.usage > this.config.thresholds.cpu ? '⚠️ 超阈值' : '✅ 正常'} |
| 内存使用率 | ${metrics.system.memory.usage}% | ${parseFloat(metrics.system.memory.usage) > this.config.thresholds.memory ? '⚠️ 超阈值' : '✅ 正常'} |
| 磁盘使用率 | ${metrics.system.disk.usage} | ${metrics.system.disk.usage.includes('9') ? '⚠️ 空间不足' : '✅ 正常'} |
| 系统运行时间 | ${Math.floor(metrics.system.uptime / 3600)}小时 | ✅ 正常 |

`;
    }

    // 构建性能
    if (metrics.build) {
      const sizeMB = (metrics.build.totalSize / 1024 / 1024).toFixed(2);
      const gzipMB = (metrics.build.gzipSize / 1024 / 1024).toFixed(2);
      
      report += `### 构建性能

| 指标 | 值 |
|------|-----|
| 总文件数 | ${metrics.build.files.length} |
| 总大小 | ${sizeMB} MB |
| Gzip 大小 | ${gzipMB} MB |
| 压缩率 | ${((1 - metrics.build.gzipSize / metrics.build.totalSize) * 100).toFixed(1)}% |

#### 最大文件 (Top 10)

| 文件 | 大小 | 类型 |
|------|------|------|
`;

      metrics.build.files.slice(0, 10).forEach(file => {
        const sizeKB = (file.size / 1024).toFixed(1);
        report += `| ${file.path} | ${sizeKB} KB | ${file.type} |\n`;
      });

      report += '\n';
    }

    // Lighthouse 分数
    if (metrics.lighthouse) {
      report += `### Lighthouse 性能评分

| 类别 | 分数 | 状态 |
|------|------|------|
| 性能 | ${metrics.lighthouse.scores.performance}/100 | ${metrics.lighthouse.scores.performance >= this.config.thresholds.lighthouse.performance ? '✅' : '⚠️'} |
| 可访问性 | ${metrics.lighthouse.scores.accessibility}/100 | ${metrics.lighthouse.scores.accessibility >= this.config.thresholds.lighthouse.accessibility ? '✅' : '⚠️'} |
| 最佳实践 | ${metrics.lighthouse.scores.bestPractices}/100 | ${metrics.lighthouse.scores.bestPractices >= this.config.thresholds.lighthouse.bestPractices ? '✅' : '⚠️'} |
| SEO | ${metrics.lighthouse.scores.seo}/100 | ${metrics.lighthouse.scores.seo >= this.config.thresholds.lighthouse.seo ? '✅' : '⚠️'} |

`;
    }

    // 告警信息
    if (alerts.length > 0) {
      report += `## ⚠️ 性能告警

`;
      alerts.forEach((alert, index) => {
        report += `${index + 1}. **${alert.type.toUpperCase()}**: ${alert.message}\n`;
      });
      report += '\n';
    }

    // 建议
    report += `## 💡 优化建议

### 系统优化
- 定期清理临时文件和日志
- 监控长时间运行的进程
- 考虑增加内存或优化内存使用

### 构建优化
- 使用代码分割减少初始包大小
- 启用 Tree Shaking 移除未使用代码
- 优化图片和静态资源
- 使用 CDN 加速资源加载

### 性能优化
- 实施懒加载策略
- 优化关键渲染路径
- 减少第三方脚本影响
- 启用浏览器缓存

## 📈 历史趋势

查看历史性能数据请参考 \`metrics/\` 目录下的数据文件。

---

*报告由性能监控系统自动生成*
`;

    fs.writeFileSync(reportPath, report);
    console.log(`✅ 性能报告已生成: ${reportPath}`);

    return reportPath;
  }

  /**
   * 保存指标数据
   */
  saveMetrics(metrics) {
    const timestamp = new Date().toISOString().split('T')[0];
    const metricsFile = path.join(this.metricsDir, `metrics-${timestamp}.json`);
    
    let dailyMetrics = [];
    if (fs.existsSync(metricsFile)) {
      dailyMetrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
    }
    
    dailyMetrics.push({
      timestamp: new Date().toISOString(),
      ...metrics
    });
    
    fs.writeFileSync(metricsFile, JSON.stringify(dailyMetrics, null, 2));
    console.log(`💾 指标数据已保存: ${metricsFile}`);
  }

  /**
   * 清理过期数据
   */
  cleanupOldData() {
    console.log('🧹 清理过期性能数据...');

    const retentionMs = this.config.monitoring.retention * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - retentionMs);
    
    let cleanedFiles = 0;

    // 清理指标文件
    if (fs.existsSync(this.metricsDir)) {
      const files = fs.readdirSync(this.metricsDir);
      files.forEach(file => {
        const filePath = path.join(this.metricsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          cleanedFiles++;
        }
      });
    }

    console.log(`✅ 清理了 ${cleanedFiles} 个过期文件`);
  }

  /**
   * 运行完整性能监控
   */
  async runFullMonitoring(url) {
    console.log('🚀 开始完整性能监控...');

    const metrics = {};

    // 收集系统指标
    metrics.system = this.collectSystemMetrics();

    // 分析构建性能
    metrics.build = this.analyzeBuildPerformance();

    // 运行 Lighthouse 测试
    if (url) {
      metrics.lighthouse = await this.runLighthouseAudit(url);
    }

    // 检查阈值
    const alerts = this.checkThresholds(metrics);

    // 生成报告
    const reportPath = this.generateReport(metrics, alerts);

    // 保存数据
    this.saveMetrics(metrics);

    // 清理过期数据
    this.cleanupOldData();

    console.log('✅ 性能监控完成');

    return {
      metrics,
      alerts,
      reportPath
    };
  }

  /**
   * 启动持续监控
   */
  startContinuousMonitoring() {
    console.log('🔄 启动持续性能监控...');
    console.log(`监控间隔: ${this.config.monitoring.interval / 1000}秒`);

    const monitor = () => {
      try {
        const metrics = {
          system: this.collectSystemMetrics()
        };

        const alerts = this.checkThresholds(metrics);
        
        if (alerts.length > 0 && this.config.monitoring.alerts) {
          console.log(`⚠️ [${new Date().toLocaleTimeString()}] 发现性能问题:`);
          alerts.forEach(alert => console.log(`  - ${alert.message}`));
        }

        this.saveMetrics(metrics);
      } catch (error) {
        console.error('❌ 监控过程中出错:', error.message);
      }
    };

    // 立即执行一次
    monitor();

    // 设置定时器
    const intervalId = setInterval(monitor, this.config.monitoring.interval);

    console.log('按 Ctrl+C 停止监控');

    // 处理退出信号
    process.on('SIGINT', () => {
      console.log('\n🛑 停止性能监控');
      clearInterval(intervalId);
      process.exit(0);
    });
  }
}

// CLI 入口
async function main() {
  const args = process.argv.slice(2);
  const monitor = new PerformanceMonitor();

  if (args.length === 0 || args.includes('--help')) {
    console.log('性能监控工具');
    console.log('\n用法:');
    console.log('  node performance-monitor.js system              # 收集系统指标');
    console.log('  node performance-monitor.js build               # 分析构建性能');
    console.log('  node performance-monitor.js lighthouse <url>    # 运行 Lighthouse 测试');
    console.log('  node performance-monitor.js full [url]          # 运行完整监控');
    console.log('  node performance-monitor.js watch               # 启动持续监控');
    console.log('  node performance-monitor.js cleanup             # 清理过期数据');
    return;
  }

  const [command, ...params] = args;

  try {
    switch (command) {
      case 'system':
        const systemMetrics = monitor.collectSystemMetrics();
        console.log('\n📊 系统指标:', JSON.stringify(systemMetrics, null, 2));
        break;

      case 'build':
        const buildMetrics = monitor.analyzeBuildPerformance();
        if (buildMetrics) {
          console.log('\n📦 构建分析:', JSON.stringify(buildMetrics, null, 2));
        }
        break;

      case 'lighthouse':
        if (params.length < 1) {
          throw new Error('用法: lighthouse <url>');
        }
        const lighthouseResult = await monitor.runLighthouseAudit(params[0]);
        if (lighthouseResult) {
          console.log('\n🔍 Lighthouse 结果:', JSON.stringify(lighthouseResult, null, 2));
        }
        break;

      case 'full':
        const url = params[0];
        await monitor.runFullMonitoring(url);
        break;

      case 'watch':
        monitor.startContinuousMonitoring();
        break;

      case 'cleanup':
        monitor.cleanupOldData();
        break;

      default:
        console.log('❌ 未知命令:', command);
        console.log('使用 --help 查看可用命令');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

module.exports = PerformanceMonitor;
