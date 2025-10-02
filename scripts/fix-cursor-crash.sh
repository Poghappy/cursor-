#!/bin/bash

# Cursor IDE 崩溃修复脚本

set -e

BACKUP_DIR="$HOME/.cursor-backup-$(date +%Y%m%d-%H%M%S)"

show_usage() {
    echo "用法: $0 <命令>"
    echo ""
    echo "可用命令:"
    echo "  clean-cache      清理 Cursor 缓存"
    echo "  disable-mcp      临时禁用 MCP 功能"
    echo "  reset-config     重置 Cursor 配置（会备份）"
    echo "  backup           仅备份当前配置"
    echo "  restore          恢复最近的备份"
    echo "  disable-memory   禁用 Agent Memory"
    echo "  reduce-features  减少启用的功能"
    echo ""
}

backup_config() {
    echo "📦 备份当前配置到: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    
    if [ -d "$HOME/Library/Application Support/Cursor" ]; then
        cp -R "$HOME/Library/Application Support/Cursor" "$BACKUP_DIR/app-support"
        echo "✓ 已备份 Application Support"
    fi
    
    if [ -d ".cursor" ]; then
        cp -R ".cursor" "$BACKUP_DIR/project-cursor"
        echo "✓ 已备份项目 .cursor 目录"
    fi
    
    echo "✅ 备份完成"
}

clean_cache() {
    echo "🧹 清理 Cursor 缓存..."
    
    CACHE_DIRS=(
        "$HOME/Library/Caches/Cursor"
        "$HOME/Library/Application Support/Cursor/Cache"
        "$HOME/Library/Application Support/Cursor/CachedData"
        "$HOME/Library/Application Support/Cursor/Code Cache"
    )
    
    for dir in "${CACHE_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            size=$(du -sh "$dir" 2>/dev/null | cut -f1)
            echo "清理: $dir ($size)"
            rm -rf "$dir"
            echo "✓ 已清理"
        fi
    done
    
    echo ""
    echo "✅ 缓存清理完成！"
    echo "请重启 Cursor IDE"
}

disable_mcp() {
    echo "⚠️  临时禁用 MCP 功能..."
    
    if [ -f ".cursor/mcp.json" ]; then
        backup_config
        
        # 创建最小化配置
        cat > ".cursor/mcp.json.disabled" << 'EOF'
{
  "mcpServers": {},
  "features": {
    "agentMemory": {
      "enabled": false
    },
    "taskPlanning": {
      "enabled": false
    },
    "prIndexing": {
      "enabled": false
    },
    "conflictResolution": {
      "enabled": false
    }
  }
}
EOF
        
        mv ".cursor/mcp.json" ".cursor/mcp.json.backup"
        mv ".cursor/mcp.json.disabled" ".cursor/mcp.json"
        
        echo "✅ MCP 功能已临时禁用"
        echo "原配置已备份为: .cursor/mcp.json.backup"
        echo ""
        echo "如果问题解决，说明是 MCP 配置问题"
        echo "恢复命令: mv .cursor/mcp.json.backup .cursor/mcp.json"
    else
        echo "❌ 未找到 .cursor/mcp.json"
    fi
}

reset_config() {
    echo "⚠️  重置 Cursor 配置..."
    echo "这将删除所有 Cursor 设置和扩展！"
    echo ""
    read -p "确认继续? (y/N): " confirm
    
    if [ "$confirm" != "y" ]; then
        echo "已取消"
        exit 0
    fi
    
    backup_config
    
    echo ""
    echo "删除配置目录..."
    
    CONFIG_DIRS=(
        "$HOME/Library/Application Support/Cursor"
        "$HOME/Library/Caches/Cursor"
        "$HOME/Library/Saved Application State/com.todesktop.230313mzl4w4u92.savedState"
    )
    
    for dir in "${CONFIG_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            echo "删除: $dir"
            rm -rf "$dir"
        fi
    done
    
    echo ""
    echo "✅ 配置已重置！"
    echo "备份位置: $BACKUP_DIR"
    echo "请重启 Cursor IDE"
}

disable_memory() {
    echo "💾 禁用 Agent Memory..."
    
    if [ -f ".cursor/mcp.json" ]; then
        # 使用 sed 修改配置
        sed -i.bak 's/"enabled": true/"enabled": false/g' .cursor/mcp.json
        
        echo "✅ 已禁用所有 MCP 功能"
        echo "备份: .cursor/mcp.json.bak"
    fi
}

reduce_features() {
    echo "🔧 减少启用功能（保留基础功能）..."
    
    if [ -f ".cursor/mcp.json" ]; then
        backup_config
        
        cat > ".cursor/mcp.json" << 'EOF'
{
  "mcpServers": {},
  "features": {
    "agentMemory": {
      "enabled": true,
      "memoryFile": ".cursor/memories.json",
      "maxMemorySize": "1MB"
    },
    "taskPlanning": {
      "enabled": false
    },
    "prIndexing": {
      "enabled": false
    },
    "conflictResolution": {
      "enabled": true,
      "autoSuggest": false
    }
  }
}
EOF
        
        echo "✅ 已优化配置，仅保留核心功能"
        echo "备份位置: $BACKUP_DIR"
    fi
}

restore_backup() {
    echo "🔄 恢复备份..."
    
    # 查找最近的备份
    latest_backup=$(ls -dt "$HOME"/.cursor-backup-* 2>/dev/null | head -1)
    
    if [ -z "$latest_backup" ]; then
        echo "❌ 未找到备份"
        exit 1
    fi
    
    echo "找到备份: $latest_backup"
    read -p "确认恢复? (y/N): " confirm
    
    if [ "$confirm" = "y" ]; then
        if [ -d "$latest_backup/project-cursor" ]; then
            cp -R "$latest_backup/project-cursor" ".cursor"
            echo "✓ 已恢复项目配置"
        fi
        
        echo "✅ 恢复完成"
    fi
}

# 主逻辑
case "$1" in
    clean-cache)
        clean_cache
        ;;
    disable-mcp)
        disable_mcp
        ;;
    reset-config)
        reset_config
        ;;
    backup)
        backup_config
        ;;
    restore)
        restore_backup
        ;;
    disable-memory)
        disable_memory
        ;;
    reduce-features)
        reduce_features
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

