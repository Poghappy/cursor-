#!/bin/bash

# GitHub 快速提交脚本
# 用于快速提交和推送所有新文件

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 GitHub 快速提交脚本${NC}"
echo "=========================="

# 检查 Git 状态
echo -e "${BLUE}📋 检查 Git 状态...${NC}"
git status --porcelain

# 添加所有新文件
echo -e "${BLUE}📁 添加所有新文件...${NC}"
git add .github/workflows/agent-automation.yml
git add docs/summaries/GITHUB_QUICK_IMPLEMENTATION_SUMMARY.md
git add docs/technical/CURSOR_AGENT_ENHANCEMENT_ROADMAP.md
git add docs/technical/GITHUB_QUICK_IMPLEMENTATION.md
git add docs/technical/QUICK_START_ENHANCEMENT.md
git add docs/templates/product/
git add scripts/github-quick/
git add Makefile
git add docs/product/requirements/PRD_v2.md
git add scripts/agent/roles/product-manager.js

# 提交更改
echo -e "${BLUE}💾 提交更改...${NC}"
git commit -m "🚀 添加 GitHub 快速实现方案

- 新增 GitHub Actions 自动化工作流
- 新增 GitHub CLI 快速工具
- 新增产品管理模板文件
- 更新 Makefile 集成 GitHub 工具
- 完善产品管理工具功能
- 添加完整的实施文档和指南

功能特性:
✅ GitHub Actions 自动化工作流
✅ GitHub CLI 快速工具
✅ 产品管理工具增强
✅ 模板文件系统
✅ 完整文档和指南"

# 推送到远程
echo -e "${BLUE}🔄 推送到远程仓库...${NC}"
git push origin main

echo -e "${GREEN}✅ 所有文件已成功提交并推送到 GitHub！${NC}"
echo ""
echo -e "${BLUE}🎯 下一步可以测试 GitHub Actions:${NC}"
echo "  gh workflow run agent-automation.yml -f agent_type=product-manager -f action=roadmap"
echo ""
echo -e "${BLUE}🎯 或者测试 GitHub CLI 工具:${NC}"
echo "  make gh-help"
echo "  node scripts/github-quick/gh-agent.js help"
