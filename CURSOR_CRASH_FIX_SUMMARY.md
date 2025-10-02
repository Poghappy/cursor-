# Cursor IDE 崩溃修复总结

**问题**: 窗口意外终止 (原因: "crashed", 代码: "5")  
**日期**: 2025-10-01  
**状态**: ✅ 已创建完整诊断和修复方案

---

## 📊 诊断结果

### 发现的问题

1. **⚠️ 可用内存不足** (~1.2GB)
   - 这是导致崩溃的主要原因
   - Cursor + 扩展 + MCP 功能消耗大量内存

2. **📦 大型扩展占用过多空间**
   - Cursor 配置目录: **6.2GB**
   - Puppeteer Chromium: **173MB**
   - 语音识别模型: **103MB**

3. **🔧 同时启用 4 个 MCP 功能**
   - Agent Memory
   - Task Planning
   - PR Indexing
   - Conflict Resolution

---

## 🚀 立即执行的修复方案

### 推荐方案（按优先级）

#### 1️⃣ 快速修复（推荐优先尝试）

```bash
# 方式 A: 使用交互式脚本
./scripts/quick-fix-crash.sh

# 方式 B: 使用 Make 命令
make fix-cursor
```

**操作内容**:

- 清理所有缓存
- 优化 MCP 配置（仅保留核心功能）
- 配置文件监控排除规则

#### 2️⃣ 仅清理缓存

```bash
# 最快的解决方案
make clean-cursor-cache

# 或
./scripts/fix-cursor-crash.sh clean-cache
```

#### 3️⃣ 禁用扩展排查

```bash
# 禁用所有扩展启动
cursor --disable-extensions
```

如果不再崩溃，说明是扩展冲突。建议卸载：

- `markdown-pdf` (173MB)
- `vscode-speech` (103MB)

#### 4️⃣ 临时禁用 MCP 功能

```bash
make optimize-cursor

# 或
./scripts/fix-cursor-crash.sh disable-mcp
```

#### 5️⃣ 重置配置（终极方案）

```bash
make reset-cursor

# 或
./scripts/fix-cursor-crash.sh reset-config
```

⚠️ 注意：会备份当前配置，但会清除所有设置和扩展

---

## 📋 已创建的工具

### 1. 诊断脚本

**文件**: `scripts/diagnose-cursor-crash.sh`

**功能**:

- ✅ 检查系统资源（内存、磁盘）
- ✅ 检查 Cursor 配置文件大小
- ✅ 检测大型文件
- ✅ 分析 MCP 功能使用
- ✅ 检查 node_modules 大小
- ✅ 生成问题诊断报告

**使用**:

```bash
./scripts/diagnose-cursor-crash.sh

# 或
make diagnose-cursor
```

### 2. 修复脚本

**文件**: `scripts/fix-cursor-crash.sh`

**功能**:

- ✅ 清理缓存 (`clean-cache`)
- ✅ 禁用 MCP (`disable-mcp`)
- ✅ 重置配置 (`reset-config`)
- ✅ 备份配置 (`backup`)
- ✅ 恢复备份 (`restore`)
- ✅ 禁用内存功能 (`disable-memory`)
- ✅ 减少功能 (`reduce-features`)

**使用**:

```bash
./scripts/fix-cursor-crash.sh <命令>

# 示例
./scripts/fix-cursor-crash.sh clean-cache
./scripts/fix-cursor-crash.sh disable-mcp
```

### 3. 一键修复脚本

**文件**: `scripts/quick-fix-crash.sh`

**功能**:

- ✅ 交互式菜单
- ✅ 5 种修复方案
- ✅ 自动化执行
- ✅ 详细指导

**使用**:

```bash
./scripts/quick-fix-crash.sh

# 或
make fix-cursor
```

### 4. Makefile 命令

**文件**: `Makefile` (已更新)

**新增命令**:

```bash
make diagnose-cursor      # 🔍 诊断问题
make fix-cursor          # 🔧 快速修复
make clean-cursor-cache  # 🧹 清理缓存
make reset-cursor        # ⚠️  重置配置
make optimize-cursor     # ⚡ 优化性能
```

### 5. 完整文档

**文件**: `docs/CURSOR_TROUBLESHOOTING.md`

**内容**:

- ✅ 常见错误说明
- ✅ 快速修复方案
- ✅ 手动排查步骤
- ✅ 深度修复方案
- ✅ 调试技巧
- ✅ 预防措施
- ✅ 诊断信息说明
- ✅ 问题解决检查清单

---

## 📁 文件树 Diff

### 新增文件

```
scripts/
├── diagnose-cursor-crash.sh     # 诊断脚本 ✨ NEW
├── fix-cursor-crash.sh          # 修复脚本 ✨ NEW
└── quick-fix-crash.sh           # 一键修复 ✨ NEW

docs/
└── CURSOR_TROUBLESHOOTING.md    # 故障排查文档 ✨ NEW

./
└── CURSOR_CRASH_FIX_SUMMARY.md  # 本文件 ✨ NEW
```

### 修改文件

```
Makefile                         # ✏️  新增 5 个 Cursor 相关命令
README.md                        # ✏️  新增故障排查章节
```

---

## 🎯 下一步操作

### 立即执行

1. **运行诊断** (了解具体问题)

   ```bash
   make diagnose-cursor
   ```

2. **执行快速修复** (推荐)

   ```bash
   make fix-cursor
   ```

   选择 **方案 1** 进行快速修复

3. **重启 Cursor IDE**
   - 完全关闭所有 Cursor 窗口
   - 重新打开项目

### 如果问题持续

4. **禁用扩展测试**

   ```bash
   cursor --disable-extensions
   ```

5. **查看详细日志**

   ```bash
   cursor --verbose
   ```

6. **卸载大型扩展**

   ```bash
   cursor --uninstall-extension yzane.markdown-pdf
   cursor --uninstall-extension ms-vscode.vscode-speech
   ```

7. **临时禁用 MCP**

   ```bash
   make optimize-cursor
   ```

8. **重置配置**（最后手段）
   ```bash
   make reset-cursor
   ```

---

## 🔍 预防性维护

### 定期执行

```bash
# 每周清理一次缓存
make clean-cursor-cache

# 检查配置大小
du -sh ~/Library/Application\ Support/Cursor
du -sh ~/.cursor
```

### 最佳实践

1. **控制扩展数量**
   - 只安装必要的扩展
   - 定期卸载不用的扩展

2. **优化 MCP 配置**
   - 不要同时启用所有功能
   - `maxMemorySize` 设置为 1-5MB

3. **排除大型目录**
   - 在 `.vscode/settings.json` 中排除 `node_modules`、`coverage`、`dist`

4. **监控系统资源**
   - 保持足够的可用内存（建议 > 2GB）
   - 定期检查磁盘空间

---

## 📚 相关文档

- **完整故障排查指南**: [docs/CURSOR_TROUBLESHOOTING.md](docs/CURSOR_TROUBLESHOOTING.md)
- **诊断脚本**: [scripts/diagnose-cursor-crash.sh](scripts/diagnose-cursor-crash.sh)
- **修复脚本**: [scripts/fix-cursor-crash.sh](scripts/fix-cursor-crash.sh)
- **快速修复**: [scripts/quick-fix-crash.sh](scripts/quick-fix-crash.sh)

---

## ✅ 解决方案总结

| 方案         | 操作                          | 影响         | 成功率     |
| ------------ | ----------------------------- | ------------ | ---------- |
| 清理缓存     | `make clean-cursor-cache`     | 无损         | ⭐⭐⭐⭐⭐ |
| 优化配置     | `make optimize-cursor`        | 部分功能受限 | ⭐⭐⭐⭐   |
| 禁用扩展     | `cursor --disable-extensions` | 临时无扩展   | ⭐⭐⭐⭐   |
| 卸载大型扩展 | 手动卸载                      | 失去扩展功能 | ⭐⭐⭐⭐   |
| 重置配置     | `make reset-cursor`           | 失去所有设置 | ⭐⭐⭐⭐⭐ |

---

## 💬 反馈

如果问题解决或有任何建议，请更新本文档或联系团队。

**祝您开发顺利！** 🎉
