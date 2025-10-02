#!/bin/bash

# GitHub 快速工具安装脚本
# 用于快速设置 GitHub CLI 和集成工具

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 GitHub 快速工具安装脚本${NC}"
echo "=================================="

# 检查操作系统
OS=""
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
else
    echo -e "${RED}❌ 不支持的操作系统: $OSTYPE${NC}"
    exit 1
fi

echo -e "${BLUE}📋 检测到操作系统: $OS${NC}"

# 安装 GitHub CLI
install_gh_cli() {
    echo -e "${BLUE}📦 安装 GitHub CLI...${NC}"
    
    if command -v gh &> /dev/null; then
        echo -e "${GREEN}✅ GitHub CLI 已安装${NC}"
        gh --version
    else
        case $OS in
            "macos")
                if command -v brew &> /dev/null; then
                    brew install gh
                else
                    echo -e "${YELLOW}⚠️ 请先安装 Homebrew: https://brew.sh/${NC}"
                    exit 1
                fi
                ;;
            "linux")
                curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
                echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
                sudo apt update && sudo apt install gh
                ;;
            "windows")
                echo -e "${YELLOW}⚠️ Windows 用户请手动安装 GitHub CLI: https://cli.github.com/${NC}"
                exit 1
                ;;
        esac
    fi
}

# 配置 GitHub CLI
configure_gh_cli() {
    echo -e "${BLUE}🔧 配置 GitHub CLI...${NC}"
    
    if gh auth status &> /dev/null; then
        echo -e "${GREEN}✅ GitHub CLI 已认证${NC}"
        gh auth status
    else
        echo -e "${YELLOW}🔑 需要 GitHub 认证，请按照提示操作...${NC}"
        gh auth login
    fi
}

# 安装 Node.js 依赖
install_dependencies() {
    echo -e "${BLUE}📦 安装 Node.js 依赖...${NC}"
    
    if command -v npm &> /dev/null; then
        npm install
        echo -e "${GREEN}✅ Node.js 依赖安装完成${NC}"
    else
        echo -e "${RED}❌ 请先安装 Node.js: https://nodejs.org/${NC}"
        exit 1
    fi
}

# 创建必要的目录
create_directories() {
    echo -e "${BLUE}📁 创建必要的目录...${NC}"
    
    mkdir -p tmp/generated
    mkdir -p docs/templates/enhanced
    mkdir -p scripts/github-quick
    
    echo -e "${GREEN}✅ 目录创建完成${NC}"
}

# 设置权限
set_permissions() {
    echo -e "${BLUE}🔐 设置文件权限...${NC}"
    
    chmod +x scripts/github-quick/gh-agent.js
    chmod +x scripts/agent/roles/*.js
    
    echo -e "${GREEN}✅ 权限设置完成${NC}"
}

# 测试安装
test_installation() {
    echo -e "${BLUE}🧪 测试安装...${NC}"
    
    # 测试 GitHub CLI
    if gh --version &> /dev/null; then
        echo -e "${GREEN}✅ GitHub CLI 测试通过${NC}"
    else
        echo -e "${RED}❌ GitHub CLI 测试失败${NC}"
        exit 1
    fi
    
    # 测试 Node.js 脚本
    if node scripts/github-quick/gh-agent.js &> /dev/null; then
        echo -e "${GREEN}✅ GitHub Agent 脚本测试通过${NC}"
    else
        echo -e "${RED}❌ GitHub Agent 脚本测试失败${NC}"
        exit 1
    fi
    
    # 测试产品管理工具
    if node scripts/agent/roles/product-manager.js help &> /dev/null; then
        echo -e "${GREEN}✅ 产品管理工具测试通过${NC}"
    else
        echo -e "${RED}❌ 产品管理工具测试失败${NC}"
        exit 1
    fi
}

# 显示使用说明
show_usage() {
    echo -e "${BLUE}📖 使用说明${NC}"
    echo "============="
    echo ""
    echo -e "${GREEN}基本命令:${NC}"
    echo "  make gh-help          # 显示 GitHub 工具帮助"
    echo "  make gh-sync          # 同步 GitHub 代码"
    echo "  make gh-report        # 生成 GitHub 报告"
    echo ""
    echo -e "${GREEN}Issue 和 PR:${NC}"
    echo "  make gh-issue TITLE=\"标题\" BODY=\"内容\" LABELS=\"标签1\" \"标签2\""
    echo "  make gh-pr TITLE=\"标题\" BODY=\"内容\" BASE=\"main\" HEAD=\"feature/branch\""
    echo ""
    echo -e "${GREEN}工作流:${NC}"
    echo "  make workflow-github      # 基础 GitHub 工作流"
    echo "  make workflow-github-full # 完整 GitHub 工作流"
    echo ""
    echo -e "${GREEN}直接使用脚本:${NC}"
    echo "  node scripts/github-quick/gh-agent.js help"
    echo "  node scripts/github-quick/gh-agent.js report"
    echo "  node scripts/github-quick/gh-agent.js list open"
    echo ""
    echo -e "${GREEN}GitHub Actions:${NC}"
    echo "  gh workflow run agent-automation.yml -f agent_type=product-manager -f action=roadmap"
    echo ""
}

# 主安装流程
main() {
    echo -e "${BLUE}开始安装 GitHub 快速工具...${NC}"
    echo ""
    
    install_gh_cli
    echo ""
    
    configure_gh_cli
    echo ""
    
    install_dependencies
    echo ""
    
    create_directories
    echo ""
    
    set_permissions
    echo ""
    
    test_installation
    echo ""
    
    echo -e "${GREEN}🎉 GitHub 快速工具安装完成！${NC}"
    echo ""
    
    show_usage
    
    echo -e "${BLUE}🚀 现在您可以开始使用 GitHub 快速工具了！${NC}"
}

# 运行主函数
main "$@"
