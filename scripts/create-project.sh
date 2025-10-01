#!/bin/bash

# Cursor 多角色 Agent 团队项目生成器
# 用于基于当前模板快速创建新项目

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 默认配置
DEFAULT_PROJECT_NAME="my-cursor-project"
DEFAULT_VERSION="1.0.0"
DEFAULT_LICENSE="MIT"
DEFAULT_NODE_VERSION="18"
DEFAULT_PYTHON_VERSION="3.9"

# 模板目录
TEMPLATE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS_DIR="$TEMPLATE_DIR/scripts"

# 显示横幅
show_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                Cursor 多角色 Agent 团队                      ║"
    echo "║                     项目生成器                               ║"
    echo "║                                                              ║"
    echo "║  快速基于模板创建新的 Cursor AI Agent 协作项目               ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 显示帮助信息
show_help() {
    echo -e "${YELLOW}使用方法:${NC}"
    echo "  $0 [选项]"
    echo ""
    echo -e "${YELLOW}选项:${NC}"
    echo "  -h, --help              显示帮助信息"
    echo "  -c, --config FILE       使用配置文件"
    echo "  -n, --name NAME         项目名称"
    echo "  -d, --dir DIRECTORY     目标目录"
    echo "  -i, --interactive       交互式模式（默认）"
    echo "  -q, --quiet            静默模式"
    echo "  --dry-run              预览模式，不实际创建文件"
    echo ""
    echo -e "${YELLOW}示例:${NC}"
    echo "  $0 --name my-project --dir /path/to/projects"
    echo "  $0 --config project-config.json"
    echo "  $0 --interactive"
}

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

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    local missing_deps=()
    
    # 检查必需工具
    command -v node >/dev/null 2>&1 || missing_deps+=("node")
    command -v npm >/dev/null 2>&1 || missing_deps+=("npm")
    command -v git >/dev/null 2>&1 || missing_deps+=("git")
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "缺少必需依赖: ${missing_deps[*]}"
        log_info "请安装缺少的依赖后重试"
        exit 1
    fi
    
    log_success "依赖检查通过"
}

# 验证项目名称
validate_project_name() {
    local name="$1"
    
    if [[ ! "$name" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        log_error "项目名称只能包含字母、数字、下划线和连字符"
        return 1
    fi
    
    if [ ${#name} -lt 3 ] || [ ${#name} -gt 50 ]; then
        log_error "项目名称长度必须在 3-50 个字符之间"
        return 1
    fi
    
    return 0
}

# 交互式收集项目信息
collect_project_info() {
    echo -e "${CYAN}=== 项目基本信息 ===${NC}"
    
    # 项目名称
    while true; do
        read -p "项目名称 [$DEFAULT_PROJECT_NAME]: " PROJECT_NAME
        PROJECT_NAME=${PROJECT_NAME:-$DEFAULT_PROJECT_NAME}
        
        if validate_project_name "$PROJECT_NAME"; then
            break
        fi
    done
    
    # 项目描述
    read -p "项目描述: " PROJECT_DESCRIPTION
    PROJECT_DESCRIPTION=${PROJECT_DESCRIPTION:-"基于 Cursor 多角色 Agent 团队模板创建的项目"}
    
    # 项目版本
    read -p "初始版本 [$DEFAULT_VERSION]: " PROJECT_VERSION
    PROJECT_VERSION=${PROJECT_VERSION:-$DEFAULT_VERSION}
    
    # 许可证
    echo -e "\n${YELLOW}选择许可证:${NC}"
    echo "1) MIT"
    echo "2) Apache-2.0"
    echo "3) GPL-3.0"
    echo "4) BSD-3-Clause"
    echo "5) 自定义"
    
    while true; do
        read -p "请选择 [1-5]: " license_choice
        case $license_choice in
            1) PROJECT_LICENSE="MIT"; break ;;
            2) PROJECT_LICENSE="Apache-2.0"; break ;;
            3) PROJECT_LICENSE="GPL-3.0"; break ;;
            4) PROJECT_LICENSE="BSD-3-Clause"; break ;;
            5) read -p "输入自定义许可证: " PROJECT_LICENSE; break ;;
            *) echo "请输入 1-5 之间的数字" ;;
        esac
    done
}

# 收集技术栈信息
collect_tech_stack() {
    echo -e "\n${CYAN}=== 技术栈选择 ===${NC}"
    
    # 前端框架
    echo -e "\n${YELLOW}前端框架:${NC}"
    echo "1) React"
    echo "2) Vue.js"
    echo "3) Angular"
    echo "4) Svelte"
    echo "5) 无前端"
    
    while true; do
        read -p "请选择 [1-5]: " frontend_choice
        case $frontend_choice in
            1) FRONTEND_FRAMEWORK="react"; break ;;
            2) FRONTEND_FRAMEWORK="vue"; break ;;
            3) FRONTEND_FRAMEWORK="angular"; break ;;
            4) FRONTEND_FRAMEWORK="svelte"; break ;;
            5) FRONTEND_FRAMEWORK="none"; break ;;
            *) echo "请输入 1-5 之间的数字" ;;
        esac
    done
    
    # 后端框架
    echo -e "\n${YELLOW}后端框架:${NC}"
    echo "1) Node.js (Express)"
    echo "2) Node.js (Fastify)"
    echo "3) Python (FastAPI)"
    echo "4) Python (Django)"
    echo "5) Go (Gin)"
    echo "6) Java (Spring Boot)"
    
    while true; do
        read -p "请选择 [1-6]: " backend_choice
        case $backend_choice in
            1) BACKEND_FRAMEWORK="nodejs-express"; break ;;
            2) BACKEND_FRAMEWORK="nodejs-fastify"; break ;;
            3) BACKEND_FRAMEWORK="python-fastapi"; break ;;
            4) BACKEND_FRAMEWORK="python-django"; break ;;
            5) BACKEND_FRAMEWORK="go-gin"; break ;;
            6) BACKEND_FRAMEWORK="java-spring"; break ;;
            *) echo "请输入 1-6 之间的数字" ;;
        esac
    done
    
    # 数据库
    echo -e "\n${YELLOW}数据库:${NC}"
    echo "1) PostgreSQL"
    echo "2) MySQL"
    echo "3) MongoDB"
    echo "4) SQLite"
    echo "5) Redis"
    echo "6) 无数据库"
    
    while true; do
        read -p "请选择 [1-6]: " db_choice
        case $db_choice in
            1) DATABASE="postgresql"; break ;;
            2) DATABASE="mysql"; break ;;
            3) DATABASE="mongodb"; break ;;
            4) DATABASE="sqlite"; break ;;
            5) DATABASE="redis"; break ;;
            6) DATABASE="none"; break ;;
            *) echo "请输入 1-6 之间的数字" ;;
        esac
    done
}

# 收集功能模块信息
collect_features() {
    echo -e "\n${CYAN}=== 功能模块选择 ===${NC}"
    echo "请选择需要的功能模块（多选，用空格分隔）:"
    echo "1) 用户认证 (auth)"
    echo "2) 数据管理 (crud)"
    echo "3) API 接口 (api)"
    echo "4) 文件上传 (upload)"
    echo "5) 实时通信 (websocket)"
    echo "6) 缓存系统 (cache)"
    echo "7) 消息队列 (queue)"
    echo "8) 监控告警 (monitoring)"
    echo "9) 日志系统 (logging)"
    echo "10) 测试框架 (testing)"
    
    read -p "请输入选择的数字（如: 1 2 3 8 10）: " feature_choices
    
    FEATURES=()
    for choice in $feature_choices; do
        case $choice in
            1) FEATURES+=("auth") ;;
            2) FEATURES+=("crud") ;;
            3) FEATURES+=("api") ;;
            4) FEATURES+=("upload") ;;
            5) FEATURES+=("websocket") ;;
            6) FEATURES+=("cache") ;;
            7) FEATURES+=("queue") ;;
            8) FEATURES+=("monitoring") ;;
            9) FEATURES+=("logging") ;;
            10) FEATURES+=("testing") ;;
        esac
    done
    
    log_info "选择的功能模块: ${FEATURES[*]}"
}

# 收集团队配置
collect_team_config() {
    echo -e "\n${CYAN}=== 团队配置 ===${NC}"
    
    # 团队规模
    echo -e "\n${YELLOW}团队规模:${NC}"
    echo "1) 小型团队 (1-5人)"
    echo "2) 中型团队 (6-15人)"
    echo "3) 大型团队 (16+人)"
    
    while true; do
        read -p "请选择 [1-3]: " team_size_choice
        case $team_size_choice in
            1) TEAM_SIZE="small"; break ;;
            2) TEAM_SIZE="medium"; break ;;
            3) TEAM_SIZE="large"; break ;;
            *) echo "请输入 1-3 之间的数字" ;;
        esac
    done
    
    # 开发周期
    echo -e "\n${YELLOW}预计开发周期:${NC}"
    echo "1) 短期 (2-4周)"
    echo "2) 中期 (1-3个月)"
    echo "3) 长期 (3个月以上)"
    
    while true; do
        read -p "请选择 [1-3]: " timeline_choice
        case $timeline_choice in
            1) TIMELINE="short"; break ;;
            2) TIMELINE="medium"; break ;;
            3) TIMELINE="long"; break ;;
            *) echo "请输入 1-3 之间的数字" ;;
        esac
    done
    
    # 质量要求
    echo -e "\n${YELLOW}质量要求:${NC}"
    echo "1) 基础 (基本功能实现)"
    echo "2) 标准 (包含测试和文档)"
    echo "3) 高级 (完整的CI/CD和监控)"
    
    while true; do
        read -p "请选择 [1-3]: " quality_choice
        case $quality_choice in
            1) QUALITY_LEVEL="basic"; break ;;
            2) QUALITY_LEVEL="standard"; break ;;
            3) QUALITY_LEVEL="advanced"; break ;;
            *) echo "请输入 1-3 之间的数字" ;;
        esac
    done
}

# 生成项目配置
generate_project_config() {
    cat > "$TARGET_DIR/project-config.json" << EOF
{
  "project": {
    "name": "$PROJECT_NAME",
    "description": "$PROJECT_DESCRIPTION",
    "version": "$PROJECT_VERSION",
    "license": "$PROJECT_LICENSE"
  },
  "techStack": {
    "frontend": "$FRONTEND_FRAMEWORK",
    "backend": "$BACKEND_FRAMEWORK",
    "database": "$DATABASE"
  },
  "features": [$(printf '"%s",' "${FEATURES[@]}" | sed 's/,$//')]
  ,
  "team": {
    "size": "$TEAM_SIZE",
    "timeline": "$TIMELINE",
    "qualityLevel": "$QUALITY_LEVEL"
  },
  "generated": {
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "templateVersion": "1.0.0",
    "generator": "cursor-multi-agent-template"
  }
}
EOF
}

# 复制模板文件
copy_template_files() {
    log_info "复制模板文件到 $TARGET_DIR..."
    
    # 创建目标目录
    mkdir -p "$TARGET_DIR"
    
    # 复制核心文件和目录
    cp -r "$TEMPLATE_DIR/prompts" "$TARGET_DIR/"
    cp -r "$TEMPLATE_DIR/.cursor" "$TARGET_DIR/"
    cp -r "$TEMPLATE_DIR/.vscode" "$TARGET_DIR/"
    cp -r "$TEMPLATE_DIR/docs" "$TARGET_DIR/"
    cp -r "$TEMPLATE_DIR/scripts" "$TARGET_DIR/"
    cp -r "$TEMPLATE_DIR/tests" "$TARGET_DIR/"
    
    # 复制配置文件
    cp "$TEMPLATE_DIR/package.json" "$TARGET_DIR/"
    cp "$TEMPLATE_DIR/tsconfig.json" "$TARGET_DIR/"
    cp "$TEMPLATE_DIR/.eslintrc.js" "$TARGET_DIR/"
    cp "$TEMPLATE_DIR/.prettierrc" "$TARGET_DIR/"
    cp "$TEMPLATE_DIR/.eslintignore" "$TARGET_DIR/"
    cp "$TEMPLATE_DIR/.gitignore" "$TARGET_DIR/"
    cp "$TEMPLATE_DIR/Makefile" "$TARGET_DIR/"
    
    # 复制示例文件
    if [ -f "$TEMPLATE_DIR/.env.example" ]; then
        cp "$TEMPLATE_DIR/.env.example" "$TARGET_DIR/"
    fi
    
    log_success "模板文件复制完成"
}

# 自定义项目文件
customize_project_files() {
    log_info "自定义项目文件..."
    
    # 更新 package.json
    if [ -f "$TARGET_DIR/package.json" ]; then
        # 使用 node 脚本更新 package.json
        node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('$TARGET_DIR/package.json', 'utf8'));
        pkg.name = '$PROJECT_NAME';
        pkg.description = '$PROJECT_DESCRIPTION';
        pkg.version = '$PROJECT_VERSION';
        pkg.license = '$PROJECT_LICENSE';
        fs.writeFileSync('$TARGET_DIR/package.json', JSON.stringify(pkg, null, 2));
        "
    fi
    
    # 更新 Makefile
    if [ -f "$TARGET_DIR/Makefile" ]; then
        sed -i.bak "s/PROJECT_NAME ?= .*/PROJECT_NAME ?= $PROJECT_NAME/" "$TARGET_DIR/Makefile"
        sed -i.bak "s/VERSION ?= .*/VERSION ?= $PROJECT_VERSION/" "$TARGET_DIR/Makefile"
        rm -f "$TARGET_DIR/Makefile.bak"
    fi
    
    # 生成自定义 README
    generate_readme
    
    # 根据技术栈生成特定文件
    generate_tech_specific_files
    
    # 根据功能模块生成文件
    generate_feature_files
    
    log_success "项目文件自定义完成"
}

# 生成 README
generate_readme() {
    cat > "$TARGET_DIR/README.md" << EOF
# $PROJECT_NAME

$PROJECT_DESCRIPTION

## 项目信息

- **版本**: $PROJECT_VERSION
- **许可证**: $PROJECT_LICENSE
- **技术栈**: $BACKEND_FRAMEWORK + $DATABASE
- **团队规模**: $TEAM_SIZE
- **开发周期**: $TIMELINE

## 功能模块

$(printf '- %s\n' "${FEATURES[@]}")

## 快速开始

\`\`\`bash
# 安装依赖
make install

# 配置环境
cp .env.example .env
# 编辑 .env 文件

# 启动开发服务器
make dev
\`\`\`

## 开发指南

### Agent 团队协作

本项目使用 Cursor 多角色 Agent 团队模板，支持以下角色：

- **PO** (Product Owner): 产品需求定义
- **PM** (Product Manager): 用户故事管理
- **BA** (Business Analyst): 业务需求分析
- **PjM** (Project Manager): 项目管理
- **Arch** (Architect): 技术架构设计
- **Dev** (Developer): 代码实现
- **QA** (Quality Assurance): 质量保证
- **Ops** (DevOps): 部署运维
- **TW** (Technical Writer): 文档编写

### 使用 Agent

\`\`\`bash
# 启动产品需求分析
@po 请分析以下业务需求...

# 创建用户故事
@pm 基于PO的需求创建用户故事

# 设计技术架构
@arch 设计系统架构，技术栈：$BACKEND_FRAMEWORK + $DATABASE
\`\`\`

## 项目结构

\`\`\`
$PROJECT_NAME/
├── prompts/          # Agent 角色和阶段定义
├── .cursor/          # Cursor IDE 配置
├── src/              # 源代码
├── tests/            # 测试文件
├── docs/             # 项目文档
├── scripts/          # 自动化脚本
└── Makefile          # 项目管理命令
\`\`\`

## 可用命令

\`\`\`bash
make help            # 显示所有可用命令
make setup           # 初始化项目环境
make dev             # 启动开发模式
make test            # 运行测试
make lint            # 代码检查
make build           # 构建项目
make deploy          # 部署项目
\`\`\`

## 质量保证

- **代码规范**: ESLint + Prettier
- **测试覆盖率**: > 80%
- **类型检查**: TypeScript 严格模式
- **安全扫描**: npm audit

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 许可证

本项目基于 $PROJECT_LICENSE 许可证开源。

---

*本项目基于 [Cursor 多角色 Agent 团队模板](https://github.com/Poghappy/cursor-) 创建*
EOF
}

# 生成技术栈特定文件
generate_tech_specific_files() {
    case $BACKEND_FRAMEWORK in
        "nodejs-express")
            generate_nodejs_express_files
            ;;
        "nodejs-fastify")
            generate_nodejs_fastify_files
            ;;
        "python-fastapi")
            generate_python_fastapi_files
            ;;
        *)
            log_warning "暂不支持 $BACKEND_FRAMEWORK 的特定文件生成"
            ;;
    esac
}

# 生成 Node.js Express 文件
generate_nodejs_express_files() {
    mkdir -p "$TARGET_DIR/src"
    
    cat > "$TARGET_DIR/src/app.ts" << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { routes } from './routes';

const app = express();

// 中间件
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api', routes);

// 错误处理
app.use(errorHandler);

const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
EOF
}

# 生成功能模块文件
generate_feature_files() {
    for feature in "${FEATURES[@]}"; do
        case $feature in
            "auth")
                generate_auth_files
                ;;
            "crud")
                generate_crud_files
                ;;
            "api")
                generate_api_files
                ;;
            "monitoring")
                generate_monitoring_files
                ;;
            *)
                log_info "生成 $feature 功能模块文件"
                ;;
        esac
    done
}

# 生成认证模块文件
generate_auth_files() {
    mkdir -p "$TARGET_DIR/src/auth"
    
    cat > "$TARGET_DIR/src/auth/authService.ts" << 'EOF'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(payload: object): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' });
  }

  static verifyToken(token: string): any {
    return jwt.verify(token, process.env.JWT_SECRET!);
  }
}
EOF
}

# 初始化 Git 仓库
init_git_repo() {
    if [ "$INIT_GIT" = true ]; then
        log_info "初始化 Git 仓库..."
        
        cd "$TARGET_DIR"
        git init
        git add .
        git commit -m "Initial commit: Created from Cursor multi-agent template

Project: $PROJECT_NAME
Description: $PROJECT_DESCRIPTION
Tech Stack: $BACKEND_FRAMEWORK + $DATABASE
Features: ${FEATURES[*]}
Generated: $(date)"
        
        log_success "Git 仓库初始化完成"
    fi
}

# 安装依赖
install_dependencies() {
    if [ "$INSTALL_DEPS" = true ]; then
        log_info "安装项目依赖..."
        
        cd "$TARGET_DIR"
        npm install
        
        log_success "依赖安装完成"
    fi
}

# 显示完成信息
show_completion_info() {
    echo -e "\n${GREEN}🎉 项目创建成功！${NC}"
    echo -e "\n${CYAN}项目信息:${NC}"
    echo -e "  名称: ${YELLOW}$PROJECT_NAME${NC}"
    echo -e "  路径: ${YELLOW}$TARGET_DIR${NC}"
    echo -e "  技术栈: ${YELLOW}$BACKEND_FRAMEWORK + $DATABASE${NC}"
    echo -e "  功能模块: ${YELLOW}${FEATURES[*]}${NC}"
    
    echo -e "\n${CYAN}下一步操作:${NC}"
    echo -e "  1. ${YELLOW}cd $TARGET_DIR${NC}"
    echo -e "  2. ${YELLOW}cp .env.example .env${NC} (配置环境变量)"
    echo -e "  3. ${YELLOW}make setup${NC} (初始化项目)"
    echo -e "  4. ${YELLOW}make dev${NC} (启动开发服务器)"
    
    echo -e "\n${CYAN}Agent 使用示例:${NC}"
    echo -e "  ${YELLOW}@po${NC} 请分析业务需求并创建项目简介"
    echo -e "  ${YELLOW}@arch${NC} 设计技术架构，使用 $BACKEND_FRAMEWORK + $DATABASE"
    echo -e "  ${YELLOW}@dev${NC} 实现核心功能模块"
    
    echo -e "\n${CYAN}更多信息:${NC}"
    echo -e "  📖 查看 ${YELLOW}README.md${NC} 了解详细使用说明"
    echo -e "  📋 查看 ${YELLOW}docs/TEMPLATE_USAGE_GUIDE.md${NC} 了解模板使用"
    echo -e "  🔧 运行 ${YELLOW}make help${NC} 查看所有可用命令"
    
    echo -e "\n${GREEN}祝你的项目开发顺利！ 🚀${NC}"
}

# 主函数
main() {
    local config_file=""
    local interactive=true
    local quiet=false
    local dry_run=false
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -c|--config)
                config_file="$2"
                interactive=false
                shift 2
                ;;
            -n|--name)
                PROJECT_NAME="$2"
                shift 2
                ;;
            -d|--dir)
                TARGET_DIR="$2"
                shift 2
                ;;
            -i|--interactive)
                interactive=true
                shift
                ;;
            -q|--quiet)
                quiet=true
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 显示横幅
    if [ "$quiet" = false ]; then
        show_banner
    fi
    
    # 检查依赖
    check_dependencies
    
    # 收集项目信息
    if [ "$interactive" = true ]; then
        collect_project_info
        collect_tech_stack
        collect_features
        collect_team_config
        
        # 设置默认目标目录
        TARGET_DIR="${TARGET_DIR:-$(pwd)/$PROJECT_NAME}"
        
        # 确认创建
        echo -e "\n${CYAN}=== 项目创建确认 ===${NC}"
        echo -e "项目名称: ${YELLOW}$PROJECT_NAME${NC}"
        echo -e "目标目录: ${YELLOW}$TARGET_DIR${NC}"
        echo -e "技术栈: ${YELLOW}$BACKEND_FRAMEWORK + $DATABASE${NC}"
        echo -e "功能模块: ${YELLOW}${FEATURES[*]}${NC}"
        
        read -p "确认创建项目? [Y/n]: " confirm
        if [[ "$confirm" =~ ^[Nn]$ ]]; then
            log_info "项目创建已取消"
            exit 0
        fi
        
        # 询问是否初始化 Git 和安装依赖
        read -p "是否初始化 Git 仓库? [Y/n]: " init_git_confirm
        INIT_GIT=true
        if [[ "$init_git_confirm" =~ ^[Nn]$ ]]; then
            INIT_GIT=false
        fi
        
        read -p "是否自动安装依赖? [Y/n]: " install_deps_confirm
        INSTALL_DEPS=true
        if [[ "$install_deps_confirm" =~ ^[Nn]$ ]]; then
            INSTALL_DEPS=false
        fi
    fi
    
    # 预览模式
    if [ "$dry_run" = true ]; then
        log_info "预览模式 - 不会实际创建文件"
        echo "将要创建的项目:"
        echo "  名称: $PROJECT_NAME"
        echo "  目录: $TARGET_DIR"
        echo "  技术栈: $BACKEND_FRAMEWORK + $DATABASE"
        echo "  功能: ${FEATURES[*]}"
        exit 0
    fi
    
    # 检查目标目录
    if [ -d "$TARGET_DIR" ] && [ "$(ls -A "$TARGET_DIR")" ]; then
        log_error "目标目录 $TARGET_DIR 不为空"
        read -p "是否清空目录继续? [y/N]: " clear_confirm
        if [[ ! "$clear_confirm" =~ ^[Yy]$ ]]; then
            log_info "项目创建已取消"
            exit 1
        fi
        rm -rf "$TARGET_DIR"/*
    fi
    
    # 创建项目
    copy_template_files
    customize_project_files
    generate_project_config
    
    # 可选操作
    init_git_repo
    install_dependencies
    
    # 显示完成信息
    if [ "$quiet" = false ]; then
        show_completion_info
    fi
}

# 运行主函数
main "$@"
