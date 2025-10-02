#!/bin/bash

# GitHub 工具集成快速设置脚本
# 用法: ./scripts/setup/setup-github-tools.sh

set -e

# 颜色配置
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 GitHub 工具集成快速设置${NC}"
echo "=================================="

# 检查 Node.js 版本
echo -e "${BLUE}📋 检查环境...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装，请先安装 Node.js 18+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 版本过低，需要 18+，当前版本: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 版本: $(node -v)${NC}"

# 安装依赖
echo -e "${BLUE}📦 安装依赖包...${NC}"
npm install js-yaml glob --save-dev

# 创建目录结构
echo -e "${BLUE}📁 创建目录结构...${NC}"
mkdir -p docs/templates/product
mkdir -p docs/templates/analysis
mkdir -p docs/templates/development
mkdir -p tmp/generated
mkdir -p docs/api

echo -e "${GREEN}✅ 目录结构创建完成${NC}"

# 创建示例配置文件
echo -e "${BLUE}⚙️ 创建示例配置文件...${NC}"

# 创建产品路线图模板
cat > docs/templates/product/roadmap-quarterly.yaml << 'EOF'
title: "季度产品路线图"
quarters:
  - name: "Q1"
    focus: "核心功能开发"
    features: []
  - name: "Q2"
    focus: "功能完善"
    features: []
  - name: "Q3"
    focus: "性能优化"
    features: []
  - name: "Q4"
    focus: "新功能规划"
    features: []
EOF

# 创建用户故事模板
cat > docs/templates/product/user-stories.yaml << 'EOF'
- id: "US-001"
  title: "用户登录"
  description: "作为用户，我希望能够登录系统"
  acceptanceCriteria:
    - "用户输入用户名和密码"
    - "系统验证用户身份"
    - "登录成功后跳转到主页"
  priority: "high"
  storyPoints: 5
  status: "draft"
  createdAt: "2025-01-27T00:00:00.000Z"
EOF

# 创建功能开关模板
cat > docs/templates/product/feature-flags.yaml << 'EOF'
- name: "new-ui"
  description: "新用户界面"
  enabled: false
  rolloutPercentage: 0
  targetUsers: []
  createdAt: "2025-01-27T00:00:00.000Z"
EOF

# 创建服务模板
cat > docs/templates/development/service-crud.yaml << 'EOF'
service:
  imports:
    - "import { Injectable } from '@nestjs/common';"
  class: "Injectable"
  methods: ["create", "findAll", "findOne", "update", "remove"]

controller:
  imports:
    - "import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';"
  class: "Controller"
  decorators: ["@Controller()"]

dto:
  imports:
    - "import { IsString, IsOptional } from 'class-validator';"
  class: "class"
  properties: ["id", "name", "description"]
EOF

# 创建 OpenAPI 示例
cat > docs/api/openapi.json << 'EOF'
{
  "openapi": "3.0.0",
  "info": {
    "title": "User Management API",
    "version": "1.0.0",
    "description": "用户管理 API"
  },
  "paths": {
    "/users": {
      "get": {
        "summary": "获取用户列表",
        "operationId": "getUsers",
        "responses": {
          "200": {
            "description": "成功"
          }
        }
      },
      "post": {
        "summary": "创建用户",
        "operationId": "createUser",
        "responses": {
          "201": {
            "description": "创建成功"
          }
        }
      }
    },
    "/users/{id}": {
      "get": {
        "summary": "获取用户详情",
        "operationId": "getUser",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "成功"
          }
        }
      }
    }
  }
}
EOF

echo -e "${GREEN}✅ 示例配置文件创建完成${NC}"

# 设置脚本权限
echo -e "${BLUE}🔐 设置脚本权限...${NC}"
chmod +x scripts/agent/roles/*.js
chmod +x scripts/setup/setup-github-tools.sh

echo -e "${GREEN}✅ 脚本权限设置完成${NC}"

# 测试工具
echo -e "${BLUE}🧪 测试工具...${NC}"

# 测试产品管理工具
echo -e "${YELLOW}测试产品管理工具...${NC}"
if node scripts/agent/roles/product-manager.js --help > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 产品管理工具正常${NC}"
else
    echo -e "${RED}❌ 产品管理工具测试失败${NC}"
fi

# 测试需求分析工具
echo -e "${YELLOW}测试需求分析工具...${NC}"
if node scripts/agent/roles/requirement-analyzer.js --help > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 需求分析工具正常${NC}"
else
    echo -e "${RED}❌ 需求分析工具测试失败${NC}"
fi

# 测试测试管理工具
echo -e "${YELLOW}测试测试管理工具...${NC}"
if node scripts/agent/roles/test-manager.js --help > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 测试管理工具正常${NC}"
else
    echo -e "${RED}❌ 测试管理工具测试失败${NC}"
fi

# 测试开发工具
echo -e "${YELLOW}测试开发工具...${NC}"
if node scripts/agent/roles/developer-tools.js --help > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 开发工具正常${NC}"
else
    echo -e "${RED}❌ 开发工具测试失败${NC}"
fi

# 创建快速测试脚本
echo -e "${BLUE}📝 创建快速测试脚本...${NC}"
cat > scripts/test-github-tools.sh << 'EOF'
#!/bin/bash

echo "🧪 GitHub 工具快速测试"
echo "======================"

echo "📋 测试产品管理工具..."
make product-roadmap

echo "📊 测试需求分析工具..."
make requirements-analyze

echo "🧪 测试测试管理工具..."
make test-generate

echo "💻 测试开发工具..."
make code-generate

echo "✅ 所有工具测试完成！"
EOF

chmod +x scripts/test-github-tools.sh

echo -e "${GREEN}✅ 快速测试脚本创建完成${NC}"

# 显示完成信息
echo ""
echo -e "${GREEN}🎉 GitHub 工具集成设置完成！${NC}"
echo "=================================="
echo ""
echo -e "${YELLOW}📋 可用命令:${NC}"
echo "  make product-roadmap      # 生成产品路线图"
echo "  make user-stories         # 管理用户故事"
echo "  make feature-flags        # 管理功能开关"
echo "  make requirements-analyze # 分析需求文档"
echo "  make process-model        # 业务流程建模"
echo "  make use-cases           # 生成用例"
echo "  make test-generate       # 生成测试用例"
echo "  make quality-gate        # 质量门禁检查"
echo "  make code-generate       # 代码生成"
echo "  make api-client          # API 客户端生成"
echo "  make migrate            # 数据库迁移"
echo "  make review-code        # 代码审查"
echo ""
echo -e "${YELLOW}🧪 快速测试:${NC}"
echo "  ./scripts/test-github-tools.sh"
echo ""
echo -e "${YELLOW}📚 文档:${NC}"
echo "  docs/technical/GITHUB_TOOLS_INTEGRATION_GUIDE.md"
echo ""
echo -e "${GREEN}🚀 开始使用 GitHub 工具增强你的 Cursor Agent 团队！${NC}"
