# Cursor IDE 故障排查指南

当 Cursor IDE 出现 **"窗口意外终止 (原因: crashed, 代码: 5)"** 错误时的完整排查和修复方案。

---

## 🚨 常见错误

```
窗口意外终止
原因: "crashed"
代码: "5"
```

这通常由以下原因导致：

- 内存不足
- 扩展冲突
- 配置文件损坏
- MCP 服务器问题
- 缓存过大

---

## 🚀 快速修复（推荐）

### 方式 1: 一键修复脚本

```bash
# 执行交互式修复脚本
./scripts/quick-fix-crash.sh
```

选择 **方案 1** 进行快速修复，包括：

- 清理缓存
- 优化 MCP 配置
- 配置文件监控排除

### 方式 2: Make 命令

```bash
# 诊断问题
make diagnose-cursor

# 快速修复
make fix-cursor

# 清理缓存
make clean-cursor-cache
```

---

## 📋 手动排查步骤

### 步骤 1: 诊断问题

```bash
./scripts/diagnose-cursor-crash.sh
```

检查输出中的 ⚠️ 警告信息：

- 可用内存不足
- 大文件占用
- 扩展冲突

### 步骤 2: 清理缓存

```bash
./scripts/fix-cursor-crash.sh clean-cache
```

这会清理：

- `~/Library/Caches/Cursor`
- `~/Library/Application Support/Cursor/Cache`
- `~/Library/Application Support/Cursor/CachedData`

### 步骤 3: 优化配置

```bash
# 减少启用功能
./scripts/fix-cursor-crash.sh reduce-features

# 或完全禁用 MCP
./scripts/fix-cursor-crash.sh disable-mcp
```

### 步骤 4: 禁用扩展测试

```bash
# 禁用所有扩展启动
cursor --disable-extensions
```

如果不再崩溃，说明是扩展问题。

---

## 🔧 深度修复方案

### 方案 A: 卸载大型扩展

诊断发现以下扩展占用大量空间：

```bash
# 卸载 markdown-pdf (173MB Chromium)
cursor --uninstall-extension yzane.markdown-pdf

# 卸载 vscode-speech (103MB 语音模型)
cursor --uninstall-extension ms-vscode.vscode-speech
```

或在 Cursor 中手动卸载：

1. `Cmd+Shift+X` 打开扩展
2. 搜索扩展名
3. 点击卸载

### 方案 B: 优化 MCP 配置

编辑 `.cursor/mcp.json`，减少内存占用：

```json
{
  "mcpServers": {},
  "features": {
    "agentMemory": {
      "enabled": true,
      "memoryFile": ".cursor/memories.json",
      "maxMemorySize": "1MB" // 从 10MB 减少到 1MB
    },
    "taskPlanning": {
      "enabled": false // 禁用任务规划
    },
    "prIndexing": {
      "enabled": false // 禁用 PR 索引
    },
    "conflictResolution": {
      "enabled": true,
      "autoSuggest": false // 禁用自动建议
    }
  }
}
```

### 方案 C: 优化项目配置

创建 `.vscode/settings.json` 减少文件监控：

```json
{
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/node_modules/**": true,
    "**/coverage/**": true,
    "**/dist/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/coverage": true,
    "**/dist": true
  }
}
```

### 方案 D: 重置配置（终极方案）

```bash
# 会备份当前配置
./scripts/fix-cursor-crash.sh reset-config
```

删除以下目录（会先备份）：

- `~/Library/Application Support/Cursor`
- `~/Library/Caches/Cursor`
- 所有设置和扩展会被清除

---

## 🐛 调试技巧

### 1. 查看详细日志

```bash
# 启动详细日志模式
cursor --verbose
```

### 2. 安全模式启动

```bash
# 禁用所有扩展和自定义配置
cursor --disable-extensions --disable-gpu
```

### 3. 检查进程资源占用

```bash
# 查看 Cursor 进程
ps aux | grep -i cursor

# 查看内存使用
top -o MEM | grep Cursor
```

### 4. 查看系统日志

```bash
# macOS 系统日志
log show --predicate 'process == "Cursor"' --last 1h
```

---

## 💡 预防措施

### 1. 定期清理

```bash
# 每周执行一次
make clean-cursor-cache
```

### 2. 监控配置大小

```bash
du -sh ~/Library/Application\ Support/Cursor
du -sh ~/.cursor
```

如果超过 **5GB**，建议清理。

### 3. 控制扩展数量

- 只安装必要的扩展
- 定期卸载不用的扩展
- 避免安装包含大型二进制文件的扩展

### 4. 优化 MCP 配置

- `maxMemorySize` 不超过 **5MB**
- 按需启用功能，不要全部开启
- 监控 `.cursor/memories.json` 大小

### 5. 排除大型目录

在 `.vscode/settings.json` 中排除：

- `node_modules`
- `coverage`
- `dist`
- `.git`

---

## 📊 诊断信息说明

### 内存检查

```
⚠️ 可用内存较低，可能导致崩溃
```

**建议**：

- 关闭其他应用程序
- 重启电脑释放内存
- 考虑升级内存

### 大文件警告

```
⚠️ 发现大文件:
  - /path/to/large/file (173M)
```

**建议**：

- 卸载相关扩展
- 手动删除不需要的文件
- 将大文件移到其他位置

### MCP 功能

```
已启用功能数: 4
```

**建议**：

- 同时启用不超过 2 个功能
- 按需启用，不要全开
- 监控内存占用

---

## 🆘 仍然无法解决？

### 1. 检查 Cursor 版本

```bash
# 打开 Cursor
# 帮助 → 关于
```

确保使用最新版本，老版本可能有 bug。

### 2. 检查系统兼容性

- macOS 版本是否过旧
- 是否有足够的磁盘空间
- 是否有系统权限问题

### 3. 联系支持

如果以上方案都无效：

1. 收集诊断信息：

   ```bash
   ./scripts/diagnose-cursor-crash.sh > cursor-diagnostic.txt
   ```

2. 收集崩溃日志：

   ```bash
   log show --predicate 'process == "Cursor"' --last 1h > cursor-crash.log
   ```

3. 提交到 Cursor 支持或社区

---

## 📚 相关资源

- **诊断脚本**: `scripts/diagnose-cursor-crash.sh`
- **修复脚本**: `scripts/fix-cursor-crash.sh`
- **快速修复**: `scripts/quick-fix-crash.sh`
- **Make 命令**: `make diagnose-cursor`, `make fix-cursor`

---

## ✅ 问题解决检查清单

- [ ] 运行诊断脚本
- [ ] 清理缓存
- [ ] 优化 MCP 配置
- [ ] 卸载大型扩展
- [ ] 禁用扩展测试
- [ ] 检查内存使用
- [ ] 更新 Cursor 版本
- [ ] 重启电脑
- [ ] 必要时重置配置

---

**最后更新**: 2025-10-01  
**维护者**: Cursor Multi-Role Agent Team
