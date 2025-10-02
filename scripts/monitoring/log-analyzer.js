#!/usr/bin/env node

/**
 * 日志分析器
 * 分析应用日志，提取错误模式、性能指标和异常行为
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class LogAnalyzer {
  constructor() {
    this.projectRoot = process.cwd();
    this.logsDir = path.join(this.projectRoot, 'logs');
    this.reportsDir = path.join(this.projectRoot, 'docs', 'logs');
    this.config = this.loadConfig();
    
    // 确保目录存在
    [this.reportsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // 加载配置
  loadConfig() {
    return {
      logLevels: ['error', 'warn', 'info', 'debug'],
      errorPatterns: [
        /error/i,
        /exception/i,
        /failed/i,
        /timeout/i,
        /connection refused/i,
        /404|500|502|503/,
        /uncaught/i
      ],
      performancePatterns: [
        /response time: (\d+)ms/i,
        /query took (\d+)ms/i,
        /request duration: (\d+)ms/i
      ],
      dateFormats: [
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,  // ISO format
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/,   // Standard format
        /^\w{3} \w{3} \d{2} \d{2}:\d{2}:\d{2}/    // Syslog format
      ]
    };
  }

  /**
   * 查找日志文件
   */
  findLogFiles() {
    const logFiles = [];
    const searchDirs = [
      this.logsDir,
      path.join(this.projectRoot, 'log'),
      path.join(this.projectRoot, 'var', 'log'),
      this.projectRoot
    ];

    const logExtensions = ['.log', '.txt'];
    const logPatterns = ['log', 'error', 'access', 'debug', 'app'];

    searchDirs.forEach(dir => {
      if (!fs.existsSync(dir)) return;

      try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isFile()) {
            const ext = path.extname(file).toLowerCase();
            const name = path.basename(file, ext).toLowerCase();
            
            // 检查是否为日志文件
            if (logExtensions.includes(ext) || 
                logPatterns.some(pattern => name.includes(pattern))) {
              logFiles.push({
                path: filePath,
                name: file,
                size: stats.size,
                modified: stats.mtime,
                type: this.detectLogType(file)
              });
            }
          }
        });
      } catch (error) {
        console.warn(`⚠️ 无法读取目录 ${dir}: ${error.message}`);
      }
    });

    return logFiles.sort((a, b) => b.modified - a.modified);
  }

  /**
   * 检测日志类型
   */
  detectLogType(filename) {
    const name = filename.toLowerCase();
    if (name.includes('error')) return 'error';
    if (name.includes('access')) return 'access';
    if (name.includes('debug')) return 'debug';
    if (name.includes('app')) return 'application';
    return 'general';
  }

  /**
   * 分析单个日志文件
   */
  async analyzeLogFile(filePath) {
    console.log(`📄 分析日志文件: ${path.basename(filePath)}`);

    const stats = {
      totalLines: 0,
      errorCount: 0,
      warningCount: 0,
      errors: [],
      warnings: [],
      performance: [],
      timeRange: { start: null, end: null },
      patterns: new Map(),
      ips: new Map(),
      userAgents: new Map(),
      statusCodes: new Map()
    };

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      stats.totalLines++;
      
      // 解析时间戳
      const timestamp = this.extractTimestamp(line);
      if (timestamp) {
        if (!stats.timeRange.start || timestamp < stats.timeRange.start) {
          stats.timeRange.start = timestamp;
        }
        if (!stats.timeRange.end || timestamp > stats.timeRange.end) {
          stats.timeRange.end = timestamp;
        }
      }

      // 检测错误
      if (this.isErrorLine(line)) {
        stats.errorCount++;
        stats.errors.push({
          line: stats.totalLines,
          timestamp,
          message: this.extractErrorMessage(line),
          full: line.length > 200 ? line.substring(0, 200) + '...' : line
        });
      }

      // 检测警告
      if (this.isWarningLine(line)) {
        stats.warningCount++;
        stats.warnings.push({
          line: stats.totalLines,
          timestamp,
          message: line.length > 100 ? line.substring(0, 100) + '...' : line
        });
      }

      // 提取性能数据
      const perfData = this.extractPerformanceData(line);
      if (perfData) {
        stats.performance.push({
          line: stats.totalLines,
          timestamp,
          ...perfData
        });
      }

      // 分析访问日志模式
      this.analyzeAccessLogPatterns(line, stats);

      // 统计常见模式
      this.updatePatternStats(line, stats.patterns);
    }

    // 计算统计信息
    stats.errorRate = ((stats.errorCount / stats.totalLines) * 100).toFixed(2);
    stats.warningRate = ((stats.warningCount / stats.totalLines) * 100).toFixed(2);

    console.log(`  总行数: ${stats.totalLines}`);
    console.log(`  错误数: ${stats.errorCount} (${stats.errorRate}%)`);
    console.log(`  警告数: ${stats.warningCount} (${stats.warningRate}%)`);

    return stats;
  }

  /**
   * 提取时间戳
   */
  extractTimestamp(line) {
    for (const pattern of this.config.dateFormats) {
      const match = line.match(pattern);
      if (match) {
        try {
          return new Date(match[0]);
        } catch (error) {
          // 忽略无效日期
        }
      }
    }
    return null;
  }

  /**
   * 检测错误行
   */
  isErrorLine(line) {
    return this.config.errorPatterns.some(pattern => pattern.test(line));
  }

  /**
   * 检测警告行
   */
  isWarningLine(line) {
    return /warn|warning/i.test(line) && !this.isErrorLine(line);
  }

  /**
   * 提取错误消息
   */
  extractErrorMessage(line) {
    // 尝试提取错误的核心信息
    const patterns = [
      /error[:\s]+([^,\n]+)/i,
      /exception[:\s]+([^,\n]+)/i,
      /failed[:\s]+([^,\n]+)/i
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return line.length > 100 ? line.substring(0, 100) + '...' : line;
  }

  /**
   * 提取性能数据
   */
  extractPerformanceData(line) {
    for (const pattern of this.config.performancePatterns) {
      const match = line.match(pattern);
      if (match) {
        return {
          duration: parseInt(match[1]),
          type: this.getPerformanceType(pattern),
          context: line.length > 150 ? line.substring(0, 150) + '...' : line
        };
      }
    }
    return null;
  }

  /**
   * 获取性能类型
   */
  getPerformanceType(pattern) {
    const patternStr = pattern.toString();
    if (patternStr.includes('response')) return 'response';
    if (patternStr.includes('query')) return 'database';
    if (patternStr.includes('request')) return 'request';
    return 'general';
  }

  /**
   * 分析访问日志模式
   */
  analyzeAccessLogPatterns(line, stats) {
    // 提取 IP 地址
    const ipMatch = line.match(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/);
    if (ipMatch) {
      const ip = ipMatch[1];
      stats.ips.set(ip, (stats.ips.get(ip) || 0) + 1);
    }

    // 提取 HTTP 状态码
    const statusMatch = line.match(/\s(1\d{2}|2\d{2}|3\d{2}|4\d{2}|5\d{2})\s/);
    if (statusMatch) {
      const status = statusMatch[1];
      stats.statusCodes.set(status, (stats.statusCodes.get(status) || 0) + 1);
    }

    // 提取 User-Agent
    const uaMatch = line.match(/"([^"]*User-Agent[^"]*)"/i);
    if (uaMatch) {
      const ua = uaMatch[1].substring(0, 50); // 截断长 UA
      stats.userAgents.set(ua, (stats.userAgents.get(ua) || 0) + 1);
    }
  }

  /**
   * 更新模式统计
   */
  updatePatternStats(line, patterns) {
    // 提取关键词
    const words = line.toLowerCase().match(/\b\w{3,}\b/g) || [];
    words.forEach(word => {
      if (word.length > 2 && !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all'].includes(word)) {
        patterns.set(word, (patterns.get(word) || 0) + 1);
      }
    });
  }

  /**
   * 分析多个日志文件
   */
  async analyzeAllLogs() {
    console.log('🔍 开始日志分析...');

    const logFiles = this.findLogFiles();
    
    if (logFiles.length === 0) {
      console.log('⚠️ 未找到日志文件');
      return null;
    }

    console.log(`📁 找到 ${logFiles.length} 个日志文件:`);
    logFiles.forEach(file => {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      console.log(`  - ${file.name} (${sizeMB}MB, ${file.type})`);
    });

    const analysis = {
      timestamp: new Date().toISOString(),
      files: [],
      summary: {
        totalFiles: logFiles.length,
        totalLines: 0,
        totalErrors: 0,
        totalWarnings: 0,
        timeRange: { start: null, end: null },
        topErrors: [],
        topIPs: [],
        statusCodeDistribution: new Map(),
        performanceStats: {
          count: 0,
          average: 0,
          min: Infinity,
          max: 0
        }
      }
    };

    // 分析每个文件
    for (const file of logFiles) {
      try {
        const fileStats = await this.analyzeLogFile(file.path);
        fileStats.fileName = file.name;
        fileStats.fileType = file.type;
        analysis.files.push(fileStats);

        // 更新汇总统计
        analysis.summary.totalLines += fileStats.totalLines;
        analysis.summary.totalErrors += fileStats.errorCount;
        analysis.summary.totalWarnings += fileStats.warningCount;

        // 更新时间范围
        if (fileStats.timeRange.start) {
          if (!analysis.summary.timeRange.start || fileStats.timeRange.start < analysis.summary.timeRange.start) {
            analysis.summary.timeRange.start = fileStats.timeRange.start;
          }
        }
        if (fileStats.timeRange.end) {
          if (!analysis.summary.timeRange.end || fileStats.timeRange.end > analysis.summary.timeRange.end) {
            analysis.summary.timeRange.end = fileStats.timeRange.end;
          }
        }

        // 合并状态码统计
        fileStats.statusCodes.forEach((count, code) => {
          analysis.summary.statusCodeDistribution.set(
            code, 
            (analysis.summary.statusCodeDistribution.get(code) || 0) + count
          );
        });

        // 更新性能统计
        fileStats.performance.forEach(perf => {
          analysis.summary.performanceStats.count++;
          analysis.summary.performanceStats.min = Math.min(analysis.summary.performanceStats.min, perf.duration);
          analysis.summary.performanceStats.max = Math.max(analysis.summary.performanceStats.max, perf.duration);
        });

      } catch (error) {
        console.error(`❌ 分析文件 ${file.name} 失败:`, error.message);
      }
    }

    // 计算平均性能
    if (analysis.summary.performanceStats.count > 0) {
      const totalDuration = analysis.files.reduce((sum, file) => {
        return sum + file.performance.reduce((fileSum, perf) => fileSum + perf.duration, 0);
      }, 0);
      analysis.summary.performanceStats.average = Math.round(totalDuration / analysis.summary.performanceStats.count);
    }

    // 提取 Top 错误
    const allErrors = analysis.files.flatMap(file => file.errors);
    const errorGroups = new Map();
    
    allErrors.forEach(error => {
      const key = error.message;
      if (!errorGroups.has(key)) {
        errorGroups.set(key, { message: key, count: 0, files: new Set() });
      }
      errorGroups.get(key).count++;
      errorGroups.get(key).files.add(error.fileName || 'unknown');
    });

    analysis.summary.topErrors = Array.from(errorGroups.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(error => ({
        ...error,
        files: Array.from(error.files)
      }));

    // 提取 Top IP
    const allIPs = new Map();
    analysis.files.forEach(file => {
      file.ips.forEach((count, ip) => {
        allIPs.set(ip, (allIPs.get(ip) || 0) + count);
      });
    });

    analysis.summary.topIPs = Array.from(allIPs.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    console.log('\n📊 分析完成:');
    console.log(`  总行数: ${analysis.summary.totalLines.toLocaleString()}`);
    console.log(`  总错误: ${analysis.summary.totalErrors.toLocaleString()}`);
    console.log(`  总警告: ${analysis.summary.totalWarnings.toLocaleString()}`);

    return analysis;
  }

  /**
   * 生成分析报告
   */
  generateReport(analysis) {
    console.log('📄 生成日志分析报告...');

    const reportPath = path.join(
      this.reportsDir,
      `log-analysis-${new Date().toISOString().split('T')[0]}.md`
    );

    let report = `# 日志分析报告`

**生成时间**: ${new Date().toLocaleString()}
**分析时间范围**: ${analysis.summary.timeRange.start ? analysis.summary.timeRange.start.toLocaleString() : 'N/A'} - ${analysis.summary.timeRange.end ? analysis.summary.timeRange.end.toLocaleString() : 'N/A'}

## 📊 概览

| 指标 | 数值 |
|------|------|
| 分析文件数 | ${analysis.summary.totalFiles} |
| 总日志行数 | ${analysis.summary.totalLines.toLocaleString()} |
| 错误总数 | ${analysis.summary.totalErrors.toLocaleString()} |
| 警告总数 | ${analysis.summary.totalWarnings.toLocaleString()} |
| 错误率 | ${((analysis.summary.totalErrors / analysis.summary.totalLines) * 100).toFixed(3)}% |

## 📁 文件详情

| 文件名 | 类型 | 行数 | 错误数 | 警告数 | 错误率 |
|--------|------|------|--------|--------|--------|
`;

    analysis.files.forEach(file => {
      report += `| ${file.fileName} | ${file.fileType} | ${file.totalLines.toLocaleString()} | ${file.errorCount} | ${file.warningCount} | ${file.errorRate}% |\n`;
    });

    // Top 错误
    if (analysis.summary.topErrors.length > 0) {
      report += `\n## 🔥 高频错误 (Top 10)`

| 错误信息 | 出现次数 | 涉及文件 |
|----------|----------|----------|
`;

      analysis.summary.topErrors.forEach(error => {
        const message = error.message.length > 80 ? error.message.substring(0, 80) + '...' : error.message;
        report += `| ${message} | ${error.count} | ${error.files.join(', ')} |\n`;
      });
    }

    // HTTP 状态码分布
    if (analysis.summary.statusCodeDistribution.size > 0) {
      report += `\n## 📈 HTTP 状态码分布`

| 状态码 | 次数 | 占比 |
|--------|------|------|
`;

      const totalRequests = Array.from(analysis.summary.statusCodeDistribution.values()).reduce((sum, count) => sum + count, 0);
      
      Array.from(analysis.summary.statusCodeDistribution.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([code, count]) => {
          const percentage = ((count / totalRequests) * 100).toFixed(2);
          report += `| ${code} | ${count.toLocaleString()} | ${percentage}% |\n`;
        });
    }

    // 性能统计
    if (analysis.summary.performanceStats.count > 0) {
      report += `\n## ⚡ 性能统计`

| 指标 | 值 |
|------|-----|
| 性能记录数 | ${analysis.summary.performanceStats.count.toLocaleString()} |
| 平均响应时间 | ${analysis.summary.performanceStats.average}ms |
| 最快响应时间 | ${analysis.summary.performanceStats.min}ms |
| 最慢响应时间 | ${analysis.summary.performanceStats.max}ms |
`;
    }

    // Top IP 地址
    if (analysis.summary.topIPs.length > 0) {
      report += `\n## 🌐 访问频次最高的 IP (Top 10)`

| IP 地址 | 访问次数 |
|---------|----------|
`;

      analysis.summary.topIPs.forEach(({ ip, count }) => {
        report += `| ${ip} | ${count.toLocaleString()} |\n`;
      });
    }

    // 建议
    report += `\n## 💡 分析建议`

### 错误处理
`;

    if (analysis.summary.totalErrors > 0) {
      const errorRate = (analysis.summary.totalErrors / analysis.summary.totalLines) * 100;
      if (errorRate > 1) {
        report += `- ⚠️ 错误率较高 (${errorRate.toFixed(2)}%)，建议重点关注高频错误\n`;
      } else {
        report += `- ✅ 错误率在正常范围内 (${errorRate.toFixed(2)}%)\n`;
      }
    }

    if (analysis.summary.topErrors.length > 0) {
      report += `- 🔍 重点关注以下高频错误:\n`;
      analysis.summary.topErrors.slice(0, 3).forEach(error => {
        report += `  - ${error.message} (${error.count} 次)\n`;
      });
    }

    report += `
### 性能优化
`;

    if (analysis.summary.performanceStats.count > 0) {
      if (analysis.summary.performanceStats.average > 1000) {
        report += `- ⚠️ 平均响应时间较长 (${analysis.summary.performanceStats.average}ms)，建议优化性能\n`;
      } else {
        report += `- ✅ 平均响应时间正常 (${analysis.summary.performanceStats.average}ms)\n`;
      }
      
      if (analysis.summary.performanceStats.max > 5000) {
        report += `- 🐌 发现极慢请求 (${analysis.summary.performanceStats.max}ms)，需要排查原因\n`;
      }
    }

    report += `
### 安全建议
`;

    if (analysis.summary.topIPs.length > 0) {
      const topIP = analysis.summary.topIPs[0];
      if (topIP.count > 1000) {
        report += `- 🚨 IP ${topIP.ip} 访问频次异常 (${topIP.count} 次)，建议检查是否为恶意访问\n`;
      }
    }

    // 检查 4xx 和 5xx 错误
    const errorCodes = Array.from(analysis.summary.statusCodeDistribution.entries())
      .filter(([code]) => code.startsWith('4') || code.startsWith('5'));
    
    if (errorCodes.length > 0) {
      const totalErrors = errorCodes.reduce((sum, [, count]) => sum + count, 0);
      report += `- 📊 HTTP 错误请求共 ${totalErrors} 次，建议分析错误原因\n`;
    }

    report += ``
## 📋 操作建议

1. **定期监控**: 建议每日运行日志分析，及时发现问题
2. **日志轮转**: 配置日志轮转，避免单个文件过大
3. **告警设置**: 为高频错误设置告警机制
4. **性能监控**: 建立性能基线，监控响应时间趋势
5. **安全审计**: 定期分析访问模式，识别异常行为

---

*报告由日志分析系统自动生成*
`;

    fs.writeFileSync(reportPath, report);
    console.log(`✅ 日志分析报告已生成: ${reportPath}`);

    return reportPath;
  }

  /**
   * 实时监控日志
   */
  watchLogs(filePath) {
    console.log(`👁️ 开始实时监控日志: ${path.basename(filePath)}`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`日志文件不存在: ${filePath}`);
    }

    let lastSize = fs.statSync(filePath).size;

    const watcher = fs.watchFile(filePath, { interval: 1000 }, (curr, prev) => {
      if (curr.size > lastSize) {
        // 文件增长，读取新内容
        const stream = fs.createReadStream(filePath, {
          start: lastSize,
          end: curr.size
        });

        const rl = readline.createInterface({
          input: stream,
          crlfDelay: Infinity
        });

        rl.on('line', (line) => {
          const timestamp = new Date().toLocaleTimeString();
          
          if (this.isErrorLine(line)) {
            console.log(`🔴 [${timestamp}] ERROR: ${line}`);
          } else if (this.isWarningLine(line)) {
            console.log(`🟡 [${timestamp}] WARN: ${line}`);
          } else {
            console.log(`⚪ [${timestamp}] ${line}`);
          }
        });

        lastSize = curr.size;
      }
    });

    console.log('按 Ctrl+C 停止监控');

    process.on('SIGINT', () => {
      console.log('\n🛑 停止日志监控');
      fs.unwatchFile(filePath);
      process.exit(0);
    });
  }
}

// CLI 入口
async function main() {
  const args = process.argv.slice(2);
  const analyzer = new LogAnalyzer();

  if (args.length === 0 || args.includes('--help')) {
    console.log('日志分析工具');
    console.log('\n用法:');
    console.log('  node log-analyzer.js analyze              # 分析所有日志文件');
    console.log('  node log-analyzer.js analyze <file>       # 分析指定日志文件');
    console.log('  node log-analyzer.js watch <file>         # 实时监控日志文件');
    console.log('  node log-analyzer.js find                 # 查找日志文件');
    return;
  }

  const [command, ...params] = args;

  try {
    switch (command) {
      case 'analyze':
        if (params.length > 0) {
          // 分析指定文件
          const filePath = path.resolve(params[0]);
          const stats = await analyzer.analyzeLogFile(filePath);
          console.log('\n📊 分析结果:', JSON.stringify(stats, null, 2));
        } else {
          // 分析所有文件
          const analysis = await analyzer.analyzeAllLogs();
          if (analysis) {
            analyzer.generateReport(analysis);
          }
        }
        break;

      case 'watch':
        if (params.length < 1) {
          throw new Error('用法: watch <file>');
        }
        const watchPath = path.resolve(params[0]);
        analyzer.watchLogs(watchPath);
        break;

      case 'find':
        const logFiles = analyzer.findLogFiles();
        console.log(`📁 找到 ${logFiles.length} 个日志文件:`);
        logFiles.forEach(file => {
          const sizeMB = (file.size / 1024 / 1024).toFixed(2);
          console.log(`  ${file.path} (${sizeMB}MB, ${file.type}, ${file.modified.toLocaleString()})`);
        });
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

module.exports = LogAnalyzer;
