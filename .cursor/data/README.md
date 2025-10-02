# Data - 运行时数据目录

本目录存储 Cursor Agent 系统的运行时数据。

⚠️ **重要**: 此目录中的数据不应提交到 Git，已在 `.gitignore` 中排除。

## 📁 目录结构

```
data/
├── handovers/     # 交接记录
├── sessions/      # 会话数据
├── metrics/       # 指标数据
└── cache/         # 缓存数据
```

## 📂 子目录说明

### 1. handovers/ - 交接记录

**用途**: 存储角色间的实际交接记录

**文件格式**:

```
{role1}_to_{role2}_{timestamp}.json
```

**示例**:

```
dev_to_qa_2025-10-02-100530.json
pm_to_ba_2025-10-01-143020.json
```

**内容示例**:

```json
{
  "from": "dev",
  "to": "qa",
  "timestamp": "2025-10-02T10:05:30Z",
  "project": "user-auth",
  "deliverables": [
    {
      "type": "code",
      "location": "src/auth",
      "description": "认证模块实现"
    }
  ],
  "testCoverage": "85%",
  "notes": "已完成所有功能，待测试验证"
}
```

**数据保留**: 保留最近 30 天

### 2. sessions/ - 会话数据

**用途**: 记录 Agent 会话历史和上下文

**文件格式**:

```
session_{session_id}_{timestamp}.json
```

**内容示例**:

```json
{
  "sessionId": "sess_abc123",
  "startTime": "2025-10-02T10:00:00Z",
  "endTime": "2025-10-02T11:30:00Z",
  "role": "dev",
  "tasks": [
    {
      "id": "task1",
      "title": "实现登录功能",
      "status": "completed"
    }
  ],
  "filesModified": ["src/auth/login.ts", "tests/auth/login.test.ts"],
  "commands": ["@tool:analyze", "@tool:commit"]
}
```

**数据保留**: 保留最近 7 天

### 3. metrics/ - 指标数据

**用途**: 存储性能和使用指标

**文件类型**:

- `response-time.log` - 响应时间记录
- `error-rate.log` - 错误率统计
- `usage-stats.json` - 使用统计
- `performance.json` - 性能指标

**内容示例** (usage-stats.json):

```json
{
  "date": "2025-10-02",
  "totalSessions": 42,
  "byRole": {
    "dev": 15,
    "qa": 8,
    "pm": 5
  },
  "byTool": {
    "analyze": 32,
    "commit": 18,
    "review": 12
  },
  "avgResponseTime": "2.3s",
  "errorRate": "0.5%"
}
```

**数据保留**: 每月归档

### 4. cache/ - 缓存数据

**用途**: 临时缓存，提升性能

**缓存类型**:

- API 响应缓存
- 文件内容缓存
- 编译结果缓存

**缓存策略**:

- 最大大小: 100MB
- TTL: 1 小时
- LRU 淘汰策略

**数据保留**: 自动清理过期数据

## 🔒 安全和隐私

### 敏感信息

**不应存储**:

- ❌ API 密钥
- ❌ 密码
- ❌ Token
- ❌ 个人身份信息

**可以存储**:

- ✅ 会话 ID
- ✅ 文件路径
- ✅ 命令历史
- ✅ 性能指标

### 数据隔离

```bash
# 数据目录在 .gitignore 中
.cursor/data/sessions/
.cursor/data/metrics/
.cursor/data/cache/

# 保留结构
!.cursor/data/.gitkeep
!.cursor/data/README.md
```

## 🧹 数据清理

### 自动清理

配置自动清理策略：

```json
{
  "dataRetention": {
    "handovers": "30d",
    "sessions": "7d",
    "metrics": "90d",
    "cache": "1d"
  },
  "autoCleanup": true,
  "cleanupSchedule": "0 2 * * *" // 每天凌晨 2 点
}
```

### 手动清理

```bash
# 清理会话数据（7天前）
find .cursor/data/sessions -mtime +7 -type f -delete

# 清理缓存
rm -rf .cursor/data/cache/*

# 清理所有临时数据（保留目录结构）
find .cursor/data -type f ! -name .gitkeep ! -name README.md -delete
```

### 清理脚本

创建 `scripts/cleanup-data.sh`:

```bash
#!/bin/bash

DAYS_SESSIONS=7
DAYS_HANDOVERS=30
DAYS_METRICS=90

echo "清理会话数据..."
find .cursor/data/sessions -mtime +$DAYS_SESSIONS -type f -delete

echo "清理交接记录..."
find .cursor/data/handovers -mtime +$DAYS_HANDOVERS -type f -delete

echo "清理指标数据..."
find .cursor/data/metrics -mtime +$DAYS_METRICS -type f -delete

echo "清理缓存..."
rm -rf .cursor/data/cache/*

echo "清理完成"
```

## 📊 数据分析

### 查看统计

```bash
# 查看数据大小
du -sh .cursor/data/*

# 统计文件数量
find .cursor/data -type f | wc -l

# 最近的交接
ls -lt .cursor/data/handovers | head -5

# 今天的会话
find .cursor/data/sessions -name "*$(date +%Y-%m-%d)*"
```

### 生成报告

```bash
# 使用统计报告
node scripts/generate-usage-report.js

# 性能分析报告
node scripts/analyze-performance.js
```

## 🔧 配置管理

### 数据目录配置

在 `config/editor.json` 中：

```json
{
  "data": {
    "rootPath": "data",
    "retention": {
      "handovers": 30,
      "sessions": 7,
      "metrics": 90,
      "cache": 1
    },
    "maxSize": {
      "handovers": "10MB",
      "sessions": "50MB",
      "metrics": "100MB",
      "cache": "100MB"
    },
    "backup": {
      "enabled": false,
      "schedule": "daily",
      "location": "../backups/data"
    }
  }
}
```

### 监控告警

```json
{
  "monitoring": {
    "alerts": {
      "diskUsage": {
        "threshold": "80%",
        "action": "cleanup"
      },
      "fileCount": {
        "threshold": 1000,
        "action": "archive"
      }
    }
  }
}
```

## 📝 最佳实践

### 1. 定期维护

```bash
# 每周检查
make cursor-stats

# 每月清理
./scripts/cleanup-data.sh

# 每季度归档
./scripts/archive-old-data.sh
```

### 2. 监控增长

```bash
# 设置监控
watch -n 3600 'du -sh .cursor/data/*'

# 日志记录
du -sh .cursor/data >> .cursor/data/size-history.log
```

### 3. 备份重要数据

```bash
# 备份交接记录
tar -czf handovers-backup-$(date +%Y%m%d).tar.gz \
  .cursor/data/handovers/

# 远程备份
rsync -av .cursor/data/handovers/ \
  backup-server:/backups/cursor/handovers/
```

## 🚨 故障排查

### 磁盘空间不足

```bash
# 查找大文件
find .cursor/data -type f -size +10M -ls

# 清理缓存
rm -rf .cursor/data/cache/*

# 压缩旧数据
tar -czf old-sessions.tar.gz .cursor/data/sessions/*
rm .cursor/data/sessions/*
```

### 数据损坏

```bash
# 验证 JSON 文件
find .cursor/data -name "*.json" -exec sh -c 'jq empty {} || echo "Invalid: {}"' \;

# 删除损坏文件
find .cursor/data -name "*.json" -exec sh -c 'jq empty {} || rm {}' \;
```

### 性能问题

```bash
# 检查文件数量
find .cursor/data -type f | wc -l

# 如果过多，清理或归档
if [ $(find .cursor/data -type f | wc -l) -gt 1000 ]; then
  ./scripts/archive-old-data.sh
fi
```

## 📚 相关文档

- [主 README](../README.md) - 目录概览
- [最佳实践](../docs/best-practices.md) - 使用建议
- [配置详解](../docs/configuration.md) - 配置说明

---

**最后更新**: 2025-10-02  
**维护者**: Dev Agent Team  
**重要提示**: 此目录数据不提交到 Git
