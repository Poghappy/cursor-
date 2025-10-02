#!/bin/bash

# Cursor IDE 崩溃诊断脚本
# 错误: "crashed", 代码: "5"

echo "🔍 Cursor IDE 崩溃诊断开始..."
echo "================================"

# 1. 检查系统资源
echo ""
echo "📊 1. 系统资源检查"
echo "-------------------"
echo "内存使用情况:"
vm_stat | perl -ne '/page size of (\d+)/ and $size=$1; /Pages\s+([^:]+)[^\d]+(\d+)/ and printf("%-16s % 16.2f MB\n", "$1:", $2 * $size / 1048576);'

echo ""
echo "磁盘空间:"
df -h / | tail -1 | awk '{print "可用空间: " $4 " (" $5 " 已使用)"}'

# 2. 检查 Cursor 配置文件
echo ""
echo "📁 2. Cursor 配置检查"
echo "-------------------"

CURSOR_CONFIG_DIRS=(
    "$HOME/Library/Application Support/Cursor"
    "$HOME/Library/Caches/Cursor"
    "$HOME/.cursor"
)

for dir in "${CURSOR_CONFIG_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        size=$(du -sh "$dir" 2>/dev/null | cut -f1)
        echo "✓ $dir: $size"
        
        # 检查是否有过大的文件
        large_files=$(find "$dir" -type f -size +100M 2>/dev/null)
        if [ -n "$large_files" ]; then
            echo "  ⚠️  发现大文件:"
            echo "$large_files" | while read file; do
                echo "    - $(ls -lh "$file" | awk '{print $9 " (" $5 ")"}')"
            done
        fi
    else
        echo "✗ $dir: 不存在"
    fi
done

# 3. 检查项目配置
echo ""
echo "🔧 3. 项目配置检查"
echo "-------------------"

PROJECT_DIR=$(pwd)
echo "项目路径: $PROJECT_DIR"

# 检查 .cursor 配置
if [ -f ".cursor/mcp.json" ]; then
    echo "✓ MCP 配置存在"
    mcp_size=$(ls -lh .cursor/mcp.json | awk '{print $5}')
    echo "  文件大小: $mcp_size"
    
    # 检查是否启用了多个 MCP 服务器
    mcp_count=$(grep -o '"enabled":\s*true' .cursor/mcp.json | wc -l)
    echo "  已启用功能数: $mcp_count"
fi

# 检查 memories.json
if [ -f ".cursor/memories.json" ]; then
    mem_size=$(ls -lh .cursor/memories.json | awk '{print $5}')
    echo "✓ Agent Memory: $mem_size"
fi

# 4. 检查 node_modules
echo ""
echo "📦 4. 依赖检查"
echo "-------------------"
if [ -d "node_modules" ]; then
    nm_size=$(du -sh node_modules | cut -f1)
    nm_count=$(find node_modules -maxdepth 1 -type d | wc -l)
    echo "node_modules 大小: $nm_size"
    echo "包数量: $((nm_count - 1))"
    
    # 检查特别重的包
    echo ""
    echo "最大的依赖包:"
    du -sh node_modules/* 2>/dev/null | sort -rh | head -5
fi

# 5. 检查 VSCode 扩展冲突
echo ""
echo "🔌 5. 扩展检查建议"
echo "-------------------"
echo "请手动检查以下扩展是否存在冲突:"
echo "  - Playwright Test"
echo "  - 各种 Linter 扩展"
echo "  - Git 相关扩展"
echo "  - AI 助手类扩展"

# 6. 生成诊断报告
echo ""
echo "📋 6. 问题可能原因"
echo "-------------------"

# 检查内存
available_mem=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
if [ $available_mem -lt 100000 ]; then
    echo "⚠️  可用内存较低，可能导致崩溃"
fi

# 检查缓存
cache_size=$(du -sh "$HOME/Library/Caches/Cursor" 2>/dev/null | cut -f1)
if [ -n "$cache_size" ]; then
    echo "ℹ️  Cursor 缓存大小: $cache_size"
fi

echo ""
echo "================================"
echo "✅ 诊断完成！"
echo ""
echo "📝 建议操作 (按顺序尝试):"
echo ""
echo "1️⃣  清理缓存 (最常见解决方案):"
echo "   ./scripts/fix-cursor-crash.sh clean-cache"
echo ""
echo "2️⃣  禁用扩展启动 (排查扩展冲突):"
echo "   cursor --disable-extensions"
echo ""
echo "3️⃣  临时禁用 MCP 功能:"
echo "   ./scripts/fix-cursor-crash.sh disable-mcp"
echo ""
echo "4️⃣  重置 Cursor 配置:"
echo "   ./scripts/fix-cursor-crash.sh reset-config"
echo ""
echo "5️⃣  查看详细日志:"
echo "   cursor --verbose"
echo ""

