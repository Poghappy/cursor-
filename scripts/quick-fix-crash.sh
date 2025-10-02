#!/bin/bash

# Cursor 崩溃快速修复 - 一键解决方案

echo "🚀 Cursor 崩溃快速修复"
echo "===================="
echo ""

# 询问用户选择
echo "请选择修复方案:"
echo ""
echo "1) 快速修复 (推荐) - 清理缓存 + 优化配置"
echo "2) 彻底清理 - 清理缓存 + 禁用所有 MCP 功能"
echo "3) 仅清理缓存"
echo "4) 卸载大型扩展 (手动步骤指导)"
echo "5) 查看详细诊断"
echo ""
read -p "请输入数字 (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🔧 执行快速修复..."
        echo ""
        
        # 1. 清理缓存
        echo "步骤 1/3: 清理缓存..."
        ./scripts/fix-cursor-crash.sh clean-cache
        
        # 2. 优化配置
        echo ""
        echo "步骤 2/3: 优化配置..."
        ./scripts/fix-cursor-crash.sh reduce-features
        
        # 3. 关闭大型文件索引
        echo ""
        echo "步骤 3/3: 优化项目配置..."
        if [ -f ".vscode/settings.json" ]; then
            cp .vscode/settings.json .vscode/settings.json.bak
        else
            mkdir -p .vscode
        fi
        
        cat > .vscode/settings.json << 'EOF'
{
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/node_modules/**": true,
    "**/coverage/**": true,
    "**/dist/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/coverage": true,
    "**/dist": true
  },
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": false
  }
}
EOF
        
        echo ""
        echo "✅ 快速修复完成！"
        echo ""
        echo "📝 下一步操作:"
        echo "  1. 关闭所有 Cursor 窗口"
        echo "  2. 重新打开 Cursor"
        echo "  3. 如果仍然崩溃，运行方案 2"
        ;;
        
    2)
        echo ""
        echo "🔥 执行彻底清理..."
        echo ""
        
        # 清理缓存
        ./scripts/fix-cursor-crash.sh clean-cache
        
        # 禁用 MCP
        ./scripts/fix-cursor-crash.sh disable-mcp
        
        echo ""
        echo "✅ 彻底清理完成！"
        echo ""
        echo "这将以最小化配置运行 Cursor"
        echo "如果不再崩溃，可以逐步恢复功能"
        ;;
        
    3)
        echo ""
        echo "🧹 仅清理缓存..."
        ./scripts/fix-cursor-crash.sh clean-cache
        ;;
        
    4)
        echo ""
        echo "📦 大型扩展卸载指导"
        echo "===================="
        echo ""
        echo "以下扩展占用大量空间，建议卸载:"
        echo ""
        echo "1. markdown-pdf (包含 Chromium 173MB)"
        echo "   卸载命令: code --uninstall-extension yzane.markdown-pdf"
        echo ""
        echo "2. vscode-speech (语音识别 103MB)"
        echo "   卸载命令: code --uninstall-extension ms-vscode.vscode-speech"
        echo ""
        echo "或者在 Cursor 中手动卸载:"
        echo "  1. 打开扩展面板 (Cmd+Shift+X)"
        echo "  2. 搜索扩展名"
        echo "  3. 点击卸载"
        echo ""
        read -p "是否现在卸载这些扩展? (y/N): " uninstall
        
        if [ "$uninstall" = "y" ]; then
            echo ""
            echo "卸载扩展..."
            cursor --uninstall-extension yzane.markdown-pdf 2>/dev/null && echo "✓ markdown-pdf 已卸载"
            cursor --uninstall-extension ms-vscode.vscode-speech 2>/dev/null && echo "✓ vscode-speech 已卸载"
            echo ""
            echo "✅ 卸载完成，请重启 Cursor"
        fi
        ;;
        
    5)
        echo ""
        ./scripts/diagnose-cursor-crash.sh
        ;;
        
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 其他排查建议:"
echo ""
echo "• 如果仍然崩溃，尝试禁用扩展启动:"
echo "  cursor --disable-extensions"
echo ""
echo "• 查看详细错误日志:"
echo "  cursor --verbose"
echo ""
echo "• 检查是否有 Cursor 更新:"
echo "  帮助 → 检查更新"
echo ""
echo "• 增加系统内存或关闭其他应用"
echo ""

