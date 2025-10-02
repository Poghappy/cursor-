# Cursor IDE 崩溃快速修复卡片

当 Cursor 出现 **"窗口意外终止 (crash code 5)"** 时：

## 🚀 一键修复

```bash
make fix-cursor
```

选择 **方案 1** → 重启 Cursor

---

## 📋 常用命令

```bash
# 诊断问题
make diagnose-cursor

# 清理缓存（最常用）
make clean-cursor-cache

# 优化配置
make optimize-cursor

# 重置配置（会备份）
make reset-cursor
```

---

## 🔧 手动修复

### 方案 1: 清理缓存
```bash
./scripts/fix-cursor-crash.sh clean-cache
```

### 方案 2: 禁用扩展
```bash
cursor --disable-extensions
```

### 方案 3: 卸载大型扩展
```bash
cursor --uninstall-extension yzane.markdown-pdf
cursor --uninstall-extension ms-vscode.vscode-speech
```

---

## 📚 完整文档

**详细排查**: `docs/CURSOR_TROUBLESHOOTING.md`

---

**保存此卡片，随时查阅！** 🎯

