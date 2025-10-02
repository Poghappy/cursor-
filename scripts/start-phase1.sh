#!/bin/bash

# 第一阶段实施启动脚本
# 基于 GitHub 研究结果，立即开始核心工具集成

set -e

echo "🚀 启动第一阶段实施 - Agent 团队工具集成"
echo "================================================"

# 检查环境
echo "📋 检查环境..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "✅ 环境检查通过"

# 创建必要目录
echo "📁 创建目录结构..."
mkdir -p scripts/agent/roles
mkdir -p docs/product
mkdir -p docs/analysis
mkdir -p docs/models
mkdir -p docs/use-cases
mkdir -p tests
mkdir -p config
mkdir -p logs
mkdir -p tmp/generated

echo "✅ 目录结构创建完成"

# 运行第一阶段实施
echo "🔧 开始实施第一阶段..."
node scripts/agent/roles/phase1-implementation.js

echo ""
echo "🎉 第一阶段实施完成！"
echo ""
echo "📚 接下来您可以："
echo "1. 测试工具功能："
echo "   make product-roadmap"
echo "   make requirements-analyze"
echo "   make test-generate"
echo "   make code-generate"
echo ""
echo "2. 查看生成的文档："
echo "   - docs/product/roadmap.md"
echo "   - docs/analysis/requirements-analysis.md"
echo "   - tests/*.test.js"
echo ""
echo "3. 开始第二阶段："
echo "   node scripts/agent/roles/phase2-implementation.js"
echo ""
echo "4. 查看完整文档："
echo "   - docs/technical/IMPLEMENTATION_PLAN.md"
echo "   - docs/templates/management/AGENT_TOOLS_QUICK_START.md"
echo ""
echo "🚀 开始使用您的 Agent 团队工具吧！"
