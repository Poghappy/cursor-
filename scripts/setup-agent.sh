#!/bin/bash

# Cursor Agent 环境配置脚本
# 用于快速配置新项目的 Agent 环境

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示横幅
show_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                Cursor Agent 环境配置                         ║"
    echo "║                                                              ║"
    echo "║  快速配置 Cursor AI Agent 团队协作环境                      ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 检查 Cursor IDE
check_cursor_ide() {
    log_info "检查 Cursor IDE 环境..."
    
    if command -v cursor >/dev/null 2>&1; then
        local cursor_version=$(cursor --version 2>/dev/null | head -1)
        log_success "Cursor IDE 已安装: $cursor_version"
    else
        log_warning "未检测到 Cursor IDE 命令行工具"
        log_info "请确保已安装 Cursor IDE 并添加到 PATH"
    fi
}

# 检查必需目录
check_directories() {
    log_info "检查项目目录结构..."
    
    local required_dirs=(
        "prompts/roles"
        "prompts/stages"
        ".cursor/rules"
        ".vscode"
        "docs"
        "scripts"
    )
    
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$PROJECT_ROOT/$dir" ]; then
            log_warning "创建缺失目录: $dir"
            mkdir -p "$PROJECT_ROOT/$dir"
        fi
    done
    
    log_success "目录结构检查完成"
}

# 验证 Agent 角色文件
validate_agent_roles() {
    log_info "验证 Agent 角色文件..."
    
    local roles=(
        "po.md"      # Product Owner
        "pm.md"      # Product Manager
        "ba.md"      # Business Analyst
        "pjm.md"     # Project Manager
        "arch.md"    # Architect
        "llme.md"    # LLM Engineer
        "dev.md"     # Developer
        "qa.md"      # Quality Assurance
        "ops.md"     # DevOps
        "tw.md"      # Technical Writer
    )
    
    local missing_roles=()
    
    for role in "${roles[@]}"; do
        if [ ! -f "$PROJECT_ROOT/prompts/roles/$role" ]; then
            missing_roles+=("$role")
        fi
    done
    
    if [ ${#missing_roles[@]} -ne 0 ]; then
        log_warning "缺失角色文件: ${missing_roles[*]}"
        log_info "将创建默认角色文件..."
        create_default_roles "${missing_roles[@]}"
    else
        log_success "所有角色文件已存在"
    fi
}

# 创建默认角色文件
create_default_roles() {
    local missing_roles=("$@")
    
    for role in "${missing_roles[@]}"; do
        local role_name="${role%.md}"
        local role_title=""
        
        case $role_name in
            "po") role_title="Product Owner" ;;
            "pm") role_title="Product Manager" ;;
            "ba") role_title="Business Analyst" ;;
            "pjm") role_title="Project Manager" ;;
            "arch") role_title="Architect" ;;
            "llme") role_title="LLM Engineer" ;;
            "dev") role_title="Developer" ;;
            "qa") role_title="Quality Assurance" ;;
            "ops") role_title="DevOps" ;;
            "tw") role_title="Technical Writer" ;;
        esac
        
        cat > "$PROJECT_ROOT/prompts/roles/$role" << EOF
# $role_title ($role_name)

## 角色定义
你是一个专业的 $role_title，负责项目中的相关工作。

## 职责范围
- 根据角色职责执行相应任务
- 与其他角色协作完成项目目标
- 确保交付物符合质量标准

## 工作流程
1. 接收上游角色的交接信息
2. 分析输入要求和约束条件
3. 执行角色特定的工作任务
4. 生成标准化的输出交付物
5. 按照交接规范传递给下游角色

## 输出标准
- 遵循项目质量标准
- 使用统一的交接 JSON 格式
- 提供清晰的决策说明
- 识别和记录潜在风险

## 注意事项
- 严格遵循 Guardrails 安全约束
- 确保所有交付物可验证
- 记录重要决策过程
- 与团队保持有效沟通
EOF
        
        log_success "创建角色文件: $role"
    done
}

# 验证阶段模板文件
validate_stage_templates() {
    log_info "验证阶段模板文件..."
    
    local stages=(
        "user_story.md"
        "prd.md"
        "task_breakdown.md"
        "tech_design.md"
        "implementation.md"
        "qa_test.md"
        "iteration.md"
    )
    
    local missing_stages=()
    
    for stage in "${stages[@]}"; do
        if [ ! -f "$PROJECT_ROOT/prompts/stages/$stage" ]; then
            missing_stages+=("$stage")
        fi
    done
    
    if [ ${#missing_stages[@]} -ne 0 ]; then
        log_warning "缺失阶段文件: ${missing_stages[*]}"
        log_info "将创建默认阶段文件..."
        create_default_stages "${missing_stages[@]}"
    else
        log_success "所有阶段文件已存在"
    fi
}

# 创建默认阶段文件
create_default_stages() {
    local missing_stages=("$@")
    
    for stage in "${missing_stages[@]}"; do
        local stage_name="${stage%.md}"
        local stage_title=""
        
        case $stage_name in
            "user_story") stage_title="用户故事" ;;
            "prd") stage_title="产品需求文档" ;;
            "task_breakdown") stage_title="任务分解" ;;
            "tech_design") stage_title="技术设计" ;;
            "implementation") stage_title="代码实现" ;;
            "qa_test") stage_title="质量测试" ;;
            "iteration") stage_title="迭代优化" ;;
        esac
        
        cat > "$PROJECT_ROOT/prompts/stages/$stage" << EOF
# $stage_title 阶段

## 阶段目标
完成 $stage_title 相关工作，为下一阶段提供必要的输入。

## 输入要求
- 上一阶段的交付物
- 项目约束和要求
- 相关的业务背景信息

## 主要任务
1. 分析输入信息
2. 执行阶段特定工作
3. 生成标准化输出
4. 验证输出质量

## 输出交付物
- 阶段特定的文档或代码
- 决策记录和说明
- 风险识别和缓解措施
- 下一阶段的输入准备

## 验收标准
- [ ] 输出符合质量要求
- [ ] 通过必要的验证检查
- [ ] 文档完整且准确
- [ ] 风险得到适当处理

## 注意事项
- 遵循项目规范和约束
- 确保输出可追溯和可验证
- 与相关角色保持沟通
- 记录重要决策过程
EOF
        
        log_success "创建阶段文件: $stage"
    done
}

# 配置 Cursor 规则
setup_cursor_rules() {
    log_info "配置 Cursor 规则系统..."
    
    # 检查规则文件
    local rule_files=(
        "handover_schema.md"
        "role_permissions.md"
        "agent_functions.md"
    )
    
    for rule_file in "${rule_files[@]}"; do
        if [ ! -f "$PROJECT_ROOT/.cursor/rules/$rule_file" ]; then
            log_warning "缺失规则文件: $rule_file"
            create_default_rule "$rule_file"
        fi
    done
    
    # 检查 MCP 配置
    if [ ! -f "$PROJECT_ROOT/.cursor/mcp.json" ]; then
        log_info "创建默认 MCP 配置..."
        create_default_mcp_config
    fi
    
    log_success "Cursor 规则配置完成"
}

# 创建默认规则文件
create_default_rule() {
    local rule_file="$1"
    
    case $rule_file in
        "handover_schema.md")
            cp "$PROJECT_ROOT/.cursor/rules/handover_schema.md.template" "$PROJECT_ROOT/.cursor/rules/handover_schema.md" 2>/dev/null || {
                log_warning "创建基础交接规范文件"
                echo "# 交接规范" > "$PROJECT_ROOT/.cursor/rules/handover_schema.md"
                echo "请参考模板项目中的交接规范文件。" >> "$PROJECT_ROOT/.cursor/rules/handover_schema.md"
            }
            ;;
        "role_permissions.md")
            cat > "$PROJECT_ROOT/.cursor/rules/role_permissions.md" << 'EOF'
# 角色权限矩阵

## 文件访问权限
| 角色 | 读取 | 写入 | 删除 |
|------|------|------|------|
| PO   | docs/ | docs/BRIEF.md | - |
| PM   | docs/ | docs/USER_STORIES.md | - |
| BA   | docs/ | docs/PRD.md | - |
| Dev  | src/, tests/ | src/, tests/ | - |
| QA   | tests/ | tests/ | - |

## 操作权限
- 所有角色可以读取项目文档
- 只有指定角色可以修改特定文件
- 删除操作需要特殊权限
EOF
            ;;
        "agent_functions.md")
            cat > "$PROJECT_ROOT/.cursor/rules/agent_functions.md" << 'EOF'
# Agent 可调用函数

## 文件操作
- read_file: 读取文件内容
- write_file: 写入文件内容
- list_files: 列出目录文件

## 代码操作
- run_tests: 运行测试
- lint_code: 代码检查
- build_project: 构建项目

## 协作操作
- handover: 角色交接
- validate: 验证输出
- document: 生成文档
EOF
            ;;
    esac
    
    log_success "创建规则文件: $rule_file"
}

# 创建默认 MCP 配置
create_default_mcp_config() {
    cat > "$PROJECT_ROOT/.cursor/mcp.json" << 'EOF'
{
  "mcpServers": {
    "memory-manager": {
      "type": "local",
      "command": "node",
      "args": ["scripts/memory-manager.js"],
      "description": "Agent 记忆管理服务"
    },
    "task-planner": {
      "type": "local",
      "command": "node",
      "args": ["scripts/task-planner.js"],
      "description": "任务规划和分解服务"
    }
  },
  "features": {
    "agentMemory": {
      "enabled": true,
      "memoryFile": ".cursor/memories.json",
      "maxMemorySize": "10MB"
    },
    "taskPlanning": {
      "enabled": true,
      "maxTaskDepth": 5,
      "autoBreakdown": true
    }
  }
}
EOF
}

# 配置 VSCode/Cursor IDE
setup_vscode_config() {
    log_info "配置 VSCode/Cursor IDE 设置..."
    
    # 检查 VSCode 配置文件
    local vscode_files=(
        "settings.json"
        "tasks.json"
        "launch.json"
        "extensions.json"
    )
    
    for vscode_file in "${vscode_files[@]}"; do
        if [ ! -f "$PROJECT_ROOT/.vscode/$vscode_file" ]; then
            log_warning "缺失 VSCode 配置: $vscode_file"
            create_default_vscode_config "$vscode_file"
        fi
    done
    
    log_success "VSCode/Cursor IDE 配置完成"
}

# 创建默认 VSCode 配置
create_default_vscode_config() {
    local config_file="$1"
    
    case $config_file in
        "settings.json")
            cat > "$PROJECT_ROOT/.vscode/settings.json" << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.quoteStyle": "single",
  "prettier.singleQuote": true,
  "cursor.general.enableLogging": false
}
EOF
            ;;
        "extensions.json")
            cat > "$PROJECT_ROOT/.vscode/extensions.json" << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
EOF
            ;;
    esac
    
    log_success "创建 VSCode 配置: $config_file"
}

# 验证环境配置
validate_environment() {
    log_info "验证环境配置..."
    
    local validation_passed=true
    
    # 检查 Node.js
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version)
        log_success "Node.js: $node_version"
    else
        log_error "Node.js 未安装"
        validation_passed=false
    fi
    
    # 检查 npm
    if command -v npm >/dev/null 2>&1; then
        local npm_version=$(npm --version)
        log_success "npm: $npm_version"
    else
        log_error "npm 未安装"
        validation_passed=false
    fi
    
    # 检查 Git
    if command -v git >/dev/null 2>&1; then
        local git_version=$(git --version)
        log_success "Git: $git_version"
    else
        log_error "Git 未安装"
        validation_passed=false
    fi
    
    # 检查项目文件
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        log_success "package.json 存在"
    else
        log_warning "package.json 不存在"
    fi
    
    if [ "$validation_passed" = true ]; then
        log_success "环境验证通过"
    else
        log_error "环境验证失败，请安装缺失的依赖"
        return 1
    fi
}

# 生成配置报告
generate_config_report() {
    log_info "生成配置报告..."
    
    local report_file="$PROJECT_ROOT/agent-setup-report.md"
    
    cat > "$report_file" << EOF
# Agent 环境配置报告

生成时间: $(date)

## 环境信息
- Node.js: $(node --version 2>/dev/null || echo "未安装")
- npm: $(npm --version 2>/dev/null || echo "未安装")
- Git: $(git --version 2>/dev/null || echo "未安装")
- Cursor: $(cursor --version 2>/dev/null | head -1 || echo "未检测到")

## 项目结构
\`\`\`
$(tree -I 'node_modules|.git' -L 2 "$PROJECT_ROOT" 2>/dev/null || find "$PROJECT_ROOT" -maxdepth 2 -type d | head -20)
\`\`\`

## Agent 角色
$(ls "$PROJECT_ROOT/prompts/roles/" 2>/dev/null | sed 's/^/- /' || echo "- 无角色文件")

## 阶段模板
$(ls "$PROJECT_ROOT/prompts/stages/" 2>/dev/null | sed 's/^/- /' || echo "- 无阶段文件")

## 配置文件状态
- .cursor/mcp.json: $([ -f "$PROJECT_ROOT/.cursor/mcp.json" ] && echo "✅" || echo "❌")
- .cursor/rules/: $([ -d "$PROJECT_ROOT/.cursor/rules" ] && echo "✅" || echo "❌")
- .vscode/settings.json: $([ -f "$PROJECT_ROOT/.vscode/settings.json" ] && echo "✅" || echo "❌")
- package.json: $([ -f "$PROJECT_ROOT/package.json" ] && echo "✅" || echo "❌")

## 下一步建议
1. 检查并安装缺失的依赖
2. 配置环境变量 (.env)
3. 运行 \`make setup\` 初始化项目
4. 开始使用 Agent 团队协作

## 使用示例
\`\`\`bash
# 启动 PO 角色
@po 请创建项目简介

# 流转到 PM 角色
@pm 基于 PO 的输出创建用户故事

# 设计技术架构
@arch 设计系统架构
\`\`\`
EOF
    
    log_success "配置报告已生成: $report_file"
}

# 显示完成信息
show_completion_info() {
    echo -e "\n${GREEN}🎉 Agent 环境配置完成！${NC}"
    echo -e "\n${CYAN}配置摘要:${NC}"
    echo -e "  ✅ 目录结构检查"
    echo -e "  ✅ Agent 角色文件"
    echo -e "  ✅ 阶段模板文件"
    echo -e "  ✅ Cursor 规则配置"
    echo -e "  ✅ VSCode/Cursor IDE 配置"
    
    echo -e "\n${CYAN}下一步操作:${NC}"
    echo -e "  1. ${YELLOW}make setup${NC} - 初始化项目环境"
    echo -e "  2. ${YELLOW}make install${NC} - 安装项目依赖"
    echo -e "  3. ${YELLOW}@po${NC} - 开始使用 Agent 团队"
    
    echo -e "\n${CYAN}配置文件:${NC}"
    echo -e "  📋 查看 ${YELLOW}agent-setup-report.md${NC} 了解详细配置"
    echo -e "  📖 查看 ${YELLOW}docs/TEMPLATE_USAGE_GUIDE.md${NC} 了解使用方法"
    
    echo -e "\n${GREEN}Agent 团队已就绪，开始你的项目吧！ 🚀${NC}"
}

# 主函数
main() {
    local quiet=false
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                echo "Cursor Agent 环境配置脚本"
                echo ""
                echo "用法: $0 [选项]"
                echo ""
                echo "选项:"
                echo "  -h, --help    显示帮助信息"
                echo "  -q, --quiet   静默模式"
                exit 0
                ;;
            -q|--quiet)
                quiet=true
                shift
                ;;
            *)
                log_error "未知参数: $1"
                exit 1
                ;;
        esac
    done
    
    # 显示横幅
    if [ "$quiet" = false ]; then
        show_banner
    fi
    
    # 执行配置步骤
    check_cursor_ide
    check_directories
    validate_agent_roles
    validate_stage_templates
    setup_cursor_rules
    setup_vscode_config
    validate_environment
    generate_config_report
    
    # 显示完成信息
    if [ "$quiet" = false ]; then
        show_completion_info
    fi
}

# 运行主函数
main "$@"
