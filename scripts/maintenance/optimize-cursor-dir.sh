#!/bin/bash

# .cursor 目录优化脚本
# 自动执行 .cursor 目录结构优化

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

# 备份目录
BACKUP_DIR=".cursor.backup.$(date +%Y%m%d-%H%M%S)"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}.cursor 目录优化工具${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 显示帮助
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -b, --backup-only    仅创建备份"
    echo "  -d, --dry-run        演练模式（不执行实际操作）"
    echo "  -f, --force          强制执行（不询问确认）"
    echo "  -r, --rollback FILE  从备份回滚"
    echo "  -h, --help           显示帮助"
    echo ""
}

# 创建备份
create_backup() {
    echo -e "${YELLOW}📦 创建备份...${NC}"
    
    if [ -d ".cursor" ]; then
        cp -r .cursor "$BACKUP_DIR/.cursor"
        echo -e "${GREEN}✓ .cursor 已备份到 $BACKUP_DIR${NC}"
    fi
    
    if [ -f ".cursorrules" ]; then
        cp .cursorrules "$BACKUP_DIR/.cursorrules"
        echo -e "${GREEN}✓ .cursorrules 已备份${NC}"
    fi
    
    if [ -f "AGENTS.md" ]; then
        cp AGENTS.md "$BACKUP_DIR/AGENTS.md"
        echo -e "${GREEN}✓ AGENTS.md 已备份${NC}"
    fi
    
    echo -e "${GREEN}✓ 备份完成: $BACKUP_DIR${NC}"
    echo ""
}

# 从备份回滚
rollback_from_backup() {
    local backup_dir=$1
    
    if [ ! -d "$backup_dir" ]; then
        echo -e "${RED}✗ 备份目录不存在: $backup_dir${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}🔄 从备份恢复...${NC}"
    
    # 删除当前 .cursor
    if [ -d ".cursor" ]; then
        rm -rf .cursor
    fi
    
    # 恢复备份
    if [ -d "$backup_dir/.cursor" ]; then
        cp -r "$backup_dir/.cursor" .cursor
        echo -e "${GREEN}✓ .cursor 已恢复${NC}"
    fi
    
    if [ -f "$backup_dir/.cursorrules" ]; then
        cp "$backup_dir/.cursorrules" .cursorrules
        echo -e "${GREEN}✓ .cursorrules 已恢复${NC}"
    fi
    
    if [ -f "$backup_dir/AGENTS.md" ]; then
        cp "$backup_dir/AGENTS.md" AGENTS.md
        echo -e "${GREEN}✓ AGENTS.md 已恢复${NC}"
    fi
    
    echo -e "${GREEN}✓ 恢复完成${NC}"
}

# 执行优化
execute_optimization() {
    local dry_run=$1
    
    if [ "$dry_run" = "true" ]; then
        echo -e "${YELLOW}🔍 演练模式（不会实际修改文件）${NC}"
        echo ""
    fi
    
    # 步骤 1: 创建新目录
    echo -e "${BLUE}📁 步骤 1: 创建新目录结构${NC}"
    
    local dirs=(
        ".cursor/templates/handover"
        ".cursor/templates/todo"
        ".cursor/templates/report"
        ".cursor/data/handovers"
        ".cursor/data/sessions"
        ".cursor/data/metrics"
        ".cursor/data/cache"
        ".cursor/docs"
    )
    
    for dir in "${dirs[@]}"; do
        if [ "$dry_run" = "true" ]; then
            echo "  [演练] mkdir -p $dir"
        else
            mkdir -p "$dir"
            echo -e "${GREEN}  ✓ 创建: $dir${NC}"
        fi
    done
    echo ""
    
    # 步骤 2: 移动配置文件
    echo -e "${BLUE}📝 步骤 2: 移动配置文件${NC}"
    
    if [ -f ".cursorrules" ]; then
        if [ "$dry_run" = "true" ]; then
            echo "  [演练] mv .cursorrules .cursor/config/rules.md"
        else
            mv .cursorrules .cursor/config/rules.md
            ln -s .cursor/config/rules.md .cursorrules
            echo -e "${GREEN}  ✓ 移动: .cursorrules → .cursor/config/rules.md${NC}"
            echo -e "${GREEN}  ✓ 创建符号链接: .cursorrules${NC}"
        fi
    fi
    
    if [ -f "AGENTS.md" ]; then
        if [ "$dry_run" = "true" ]; then
            echo "  [演练] mv AGENTS.md .cursor/AGENTS_GUIDE.md"
        else
            mv AGENTS.md .cursor/AGENTS_GUIDE.md
            ln -s .cursor/AGENTS_GUIDE.md AGENTS.md
            echo -e "${GREEN}  ✓ 移动: AGENTS.md → .cursor/AGENTS_GUIDE.md${NC}"
            echo -e "${GREEN}  ✓ 创建符号链接: AGENTS.md${NC}"
        fi
    fi
    echo ""
    
    # 步骤 3: 移动现有数据
    echo -e "${BLUE}📦 步骤 3: 移动现有数据${NC}"
    
    if [ -f ".cursor/agent-todos.json" ]; then
        if [ "$dry_run" = "true" ]; then
            echo "  [演练] mv .cursor/agent-todos.json .cursor/templates/"
        else
            mv .cursor/agent-todos.json .cursor/templates/
            echo -e "${GREEN}  ✓ 移动: agent-todos.json → templates/${NC}"
        fi
    fi
    
    if [ -d ".cursor/handovers" ] && [ "$(ls -A .cursor/handovers)" ]; then
        if [ "$dry_run" = "true" ]; then
            echo "  [演练] mv .cursor/handovers/* .cursor/data/handovers/"
        else
            mv .cursor/handovers/* .cursor/data/handovers/
            echo -e "${GREEN}  ✓ 移动: handovers/* → data/handovers/${NC}"
        fi
    fi
    echo ""
    
    # 步骤 4: 重命名文件（统一命名规范）
    echo -e "${BLUE}🔄 步骤 4: 统一文件命名${NC}"
    
    cd .cursor/rules/core 2>/dev/null || true
    
    if [ -f "agent_functions.md" ]; then
        if [ "$dry_run" = "true" ]; then
            echo "  [演练] mv agent_functions.md agent-functions.md"
        else
            mv agent_functions.md agent-functions.md 2>/dev/null || true
            echo -e "${GREEN}  ✓ 重命名: agent_functions.md → agent-functions.md${NC}"
        fi
    fi
    
    if [ -f "handover_schema.md" ]; then
        if [ "$dry_run" = "true" ]; then
            echo "  [演练] mv handover_schema.md handover-schema.md"
        else
            mv handover_schema.md handover-schema.md 2>/dev/null || true
            echo -e "${GREEN}  ✓ 重命名: handover_schema.md → handover-schema.md${NC}"
        fi
    fi
    
    if [ -f "role_permissions.md" ]; then
        if [ "$dry_run" = "true" ]; then
            echo "  [演练] mv role_permissions.md role-permissions.md"
        else
            mv role_permissions.md role-permissions.md 2>/dev/null || true
            echo -e "${GREEN}  ✓ 重命名: role_permissions.md → role-permissions.md${NC}"
        fi
    fi
    
    cd "$PROJECT_ROOT"
    echo ""
    
    # 步骤 5: 创建新文件
    echo -e "${BLUE}📄 步骤 5: 创建新文件${NC}"
    
    local new_files=(
        ".cursor/README.md"
        ".cursor/CHANGELOG.md"
        ".cursor/VERSION"
        ".cursor/templates/README.md"
        ".cursor/data/README.md"
        ".cursor/data/.gitkeep"
        ".cursor/docs/setup.md"
        ".cursor/docs/configuration.md"
        ".cursor/docs/best-practices.md"
        ".cursor/config/editor.json"
        ".cursor/config/integrations.json"
    )
    
    for file in "${new_files[@]}"; do
        if [ ! -f "$file" ]; then
            if [ "$dry_run" = "true" ]; then
                echo "  [演练] touch $file"
            else
                touch "$file"
                echo -e "${GREEN}  ✓ 创建: $file${NC}"
            fi
        fi
    done
    
    # 写入版本号
    if [ "$dry_run" = "false" ]; then
        echo "2.0.0" > .cursor/VERSION
    fi
    
    echo ""
    
    # 步骤 6: 更新 .gitignore
    echo -e "${BLUE}🔧 步骤 6: 更新 .gitignore${NC}"
    
    local gitignore_content="
# .cursor 运行时数据
.cursor/data/sessions/
.cursor/data/metrics/
.cursor/data/cache/

# .cursor 配置备份
.cursor.backup.*
"
    
    if [ "$dry_run" = "true" ]; then
        echo "  [演练] 添加 .cursor 相关规则到 .gitignore"
    else
        if ! grep -q ".cursor/data/sessions/" .gitignore 2>/dev/null; then
            echo "$gitignore_content" >> .gitignore
            echo -e "${GREEN}  ✓ 更新 .gitignore${NC}"
        else
            echo -e "${YELLOW}  ℹ .gitignore 已包含相关规则${NC}"
        fi
    fi
    echo ""
}

# 验证结果
verify_optimization() {
    echo -e "${BLUE}🔍 验证优化结果${NC}"
    echo ""
    
    local errors=0
    
    # 检查目录
    local required_dirs=(
        ".cursor/templates"
        ".cursor/data"
        ".cursor/docs"
        ".cursor/config"
        ".cursor/rules"
        ".cursor/commands"
    )
    
    for dir in "${required_dirs[@]}"; do
        if [ -d "$dir" ]; then
            echo -e "${GREEN}✓ $dir${NC}"
        else
            echo -e "${RED}✗ $dir 不存在${NC}"
            ((errors++))
        fi
    done
    
    echo ""
    
    # 检查关键文件
    local required_files=(
        ".cursor/README.md"
        ".cursor/VERSION"
        ".cursor/AGENTS_GUIDE.md"
        ".cursor/config/rules.md"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            echo -e "${GREEN}✓ $file${NC}"
        else
            echo -e "${RED}✗ $file 不存在${NC}"
            ((errors++))
        fi
    done
    
    echo ""
    
    # 检查符号链接
    if [ -L "AGENTS.md" ]; then
        echo -e "${GREEN}✓ AGENTS.md 符号链接正常${NC}"
    else
        echo -e "${YELLOW}⚠ AGENTS.md 符号链接未创建${NC}"
    fi
    
    if [ -L ".cursorrules" ]; then
        echo -e "${GREEN}✓ .cursorrules 符号链接正常${NC}"
    else
        echo -e "${YELLOW}⚠ .cursorrules 符号链接未创建${NC}"
    fi
    
    echo ""
    
    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}✅ 验证通过！优化成功完成${NC}"
        return 0
    else
        echo -e "${RED}❌ 验证失败：发现 $errors 个问题${NC}"
        return 1
    fi
}

# 显示统计信息
show_stats() {
    echo -e "${BLUE}📊 .cursor 目录统计${NC}"
    echo ""
    
    if [ -d ".cursor" ]; then
        local total_files=$(find .cursor -type f | wc -l | tr -d ' ')
        local total_dirs=$(find .cursor -type d | wc -l | tr -d ' ')
        local total_size=$(du -sh .cursor | cut -f1)
        
        echo "  文件总数: $total_files"
        echo "  目录总数: $total_dirs"
        echo "  总大小: $total_size"
        echo ""
        
        echo "  目录结构:"
        tree .cursor -L 2 -I 'node_modules|.git' 2>/dev/null || find .cursor -maxdepth 2 -type d
    else
        echo -e "${YELLOW}  .cursor 目录不存在${NC}"
    fi
    
    echo ""
}

# 主函数
main() {
    local dry_run=false
    local force=false
    local backup_only=false
    local rollback=""
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -b|--backup-only)
                backup_only=true
                shift
                ;;
            -d|--dry-run)
                dry_run=true
                shift
                ;;
            -f|--force)
                force=true
                shift
                ;;
            -r|--rollback)
                rollback="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                echo -e "${RED}未知选项: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 处理回滚
    if [ -n "$rollback" ]; then
        rollback_from_backup "$rollback"
        exit 0
    fi
    
    # 创建备份
    create_backup
    
    # 仅备份模式
    if [ "$backup_only" = "true" ]; then
        echo -e "${GREEN}✓ 备份完成，退出${NC}"
        exit 0
    fi
    
    # 确认执行
    if [ "$force" = "false" ] && [ "$dry_run" = "false" ]; then
        echo -e "${YELLOW}⚠️  即将优化 .cursor 目录结构${NC}"
        echo ""
        echo "这将："
        echo "  • 移动和重命名文件"
        echo "  • 创建新的目录结构"
        echo "  • 更新配置文件"
        echo ""
        echo "备份已创建在: $BACKUP_DIR"
        echo ""
        read -p "确认继续？(y/N) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}操作已取消${NC}"
            exit 0
        fi
        echo ""
    fi
    
    # 执行优化
    execute_optimization "$dry_run"
    
    if [ "$dry_run" = "false" ]; then
        # 验证结果
        verify_optimization
        
        # 显示统计
        show_stats
        
        echo ""
        echo -e "${GREEN}🎉 优化完成！${NC}"
        echo ""
        echo "下一步："
        echo "  1. 查看 .cursor/OPTIMIZATION_PLAN.md 了解详细变更"
        echo "  2. 运行 'git status' 检查变更"
        echo "  3. 在 Cursor IDE 中测试功能"
        echo "  4. 如有问题，运行: $0 --rollback $BACKUP_DIR"
        echo ""
    else
        echo -e "${YELLOW}📋 演练完成（未实际修改文件）${NC}"
        echo -e "${YELLOW}移除 --dry-run 参数以执行实际操作${NC}"
    fi
}

# 运行主函数
main "$@"

