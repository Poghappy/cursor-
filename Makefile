# Cursor 多角色 Agent 团队 Makefile

# 项目配置
PROJECT_NAME ?= user-management-system
VERSION ?= 1.0.0
NODE_VERSION ?= 18
PYTHON_VERSION ?= 3.9

# 目录配置
SRC_DIR = src
DOCS_DIR = docs
TESTS_DIR = tests
PROMPTS_DIR = prompts
CURSOR_DIR = .cursor

# 工具配置
LINT_CMD ?= npm run lint
TEST_CMD ?= npm test
COVERAGE_CMD ?= npm run test:coverage
BUILD_CMD ?= npm run build
CLEAN_CMD ?= npm run clean

# 环境配置
ENV_FILE ?= .env
ENV_EXAMPLE = .env.example
DOCKER_COMPOSE = docker-compose.yml
DOCKERFILE = Dockerfile

# 颜色配置
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[0;33m
BLUE = \033[0;34m
PURPLE = \033[0;35m
CYAN = \033[0;36m
WHITE = \033[0;37m
NC = \033[0m # No Color

# 默认目标
.DEFAULT_GOAL := help

# 帮助信息
.PHONY: help
help: ## 显示帮助信息
	@echo "$(CYAN)Cursor 多角色 Agent 团队 - 项目管理工具$(NC)"
	@echo ""
	@echo "$(YELLOW)可用命令:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)项目信息:$(NC)"
	@echo "  项目名称: $(PROJECT_NAME)"
	@echo "  版本: $(VERSION)"
	@echo "  Node.js: $(NODE_VERSION)"
	@echo "  Python: $(PYTHON_VERSION)"

# 项目初始化
.PHONY: init
init: ## 初始化项目
	@echo "$(BLUE)初始化项目...$(NC)"
	@mkdir -p $(SRC_DIR) $(DOCS_DIR) $(TESTS_DIR) $(PROMPTS_DIR)/roles $(PROMPTS_DIR)/stages $(CURSOR_DIR)/rules
	@echo "$(GREEN)项目初始化完成$(NC)"

# 初始化新项目（基于模板）
.PHONY: init-new-project
init-new-project: ## 基于模板初始化新项目
	@echo "$(BLUE)基于模板创建新项目...$(NC)"
	@./scripts/setup/create-project.sh --interactive
	@echo "$(GREEN)新项目创建完成$(NC)"

# 配置 Agent 环境
.PHONY: setup-agent
setup-agent: ## 配置 Cursor Agent 环境
	@echo "$(BLUE)配置 Agent 环境...$(NC)"
	@./scripts/setup/setup-agent.sh
	@echo "$(GREEN)Agent 环境配置完成$(NC)"

## 📁 文件管理
.PHONY: check-files clean-temp check-duplicates promote-file find-similar fix-files
check-files: ## 检查文件规范和健康度
	@echo "$(BLUE)🔍 检查文件规范...$(NC)"
	@node scripts/maintenance/file-manager.js check

clean-temp: ## 清理过期临时文件
	@echo "$(BLUE)🧹 清理临时文件...$(NC)"
	@node scripts/maintenance/file-manager.js clean

check-duplicates: ## 检查重复文件
	@echo "$(BLUE)🔍 检查重复文件...$(NC)"
	@node scripts/maintenance/file-manager.js duplicates

promote-file: ## 提升临时文件为正式文档 (需要参数: FILE=path TARGET=dir)
	@echo "$(BLUE)📤 提升文件: $(FILE) -> $(TARGET)$(NC)"
	@node scripts/maintenance/file-manager.js promote $(FILE) $(TARGET)

find-similar: ## 查找相似文档 (需要参数: FILE=path)
	@echo "$(BLUE)🔍 查找相似文档: $(FILE)$(NC)"
	@node scripts/maintenance/file-manager.js similar $(FILE)

fix-files: ## 自动修复文件问题
	@echo "$(BLUE)🔧 修复文件问题...$(NC)"
	@make check-files
	@make clean-temp
	@echo "$(GREEN)✅ 文件问题修复完成$(NC)"

# 环境设置
.PHONY: setup
setup: init ## 设置开发环境
	@echo "$(BLUE)设置开发环境...$(NC)"
	@if [ ! -f $(ENV_FILE) ]; then \
		cp $(ENV_EXAMPLE) $(ENV_FILE); \
		echo "$(YELLOW)请编辑 $(ENV_FILE) 文件配置环境变量$(NC)"; \
	fi
	@echo "$(GREEN)环境设置完成$(NC)"

# 依赖安装
.PHONY: install
install: ## 安装依赖
	@echo "$(BLUE)安装依赖...$(NC)"
	@npm install
	@echo "$(GREEN)依赖安装完成$(NC)"

# 代码检查
.PHONY: lint
lint: ## 运行代码检查
	@echo "$(BLUE)运行代码检查...$(NC)"
	@$(LINT_CMD)
	@echo "$(GREEN)代码检查完成$(NC)"

# 代码修复
.PHONY: lint-fix
lint-fix: ## 自动修复代码问题
	@echo "$(BLUE)自动修复代码问题...$(NC)"
	@npm run lint:fix
	@echo "$(GREEN)代码修复完成$(NC)"

# 运行测试
.PHONY: test
test: ## 运行测试
	@echo "$(BLUE)运行测试...$(NC)"
	@$(TEST_CMD)
	@echo "$(GREEN)测试完成$(NC)"

# 测试覆盖率
.PHONY: coverage
coverage: ## 生成测试覆盖率报告
	@echo "$(BLUE)生成测试覆盖率报告...$(NC)"
	@$(COVERAGE_CMD)
	@echo "$(GREEN)覆盖率报告生成完成$(NC)"

# 构建项目
.PHONY: build
build: ## 构建项目
	@echo "$(BLUE)构建项目...$(NC)"
	@$(BUILD_CMD)
	@echo "$(GREEN)项目构建完成$(NC)"

# 清理项目
.PHONY: clean
clean: ## 清理项目
	@echo "$(BLUE)清理项目...$(NC)"
	@$(CLEAN_CMD)
	@echo "$(GREEN)项目清理完成$(NC)"

# 质量检查
.PHONY: quality
quality: lint test coverage ## 运行完整质量检查
	@echo "$(GREEN)质量检查完成$(NC)"

# 开发模式
.PHONY: dev
dev: ## 启动开发模式
	@echo "$(BLUE)启动开发模式...$(NC)"
	@npm run dev

# 生产模式
.PHONY: start
start: build ## 启动生产模式
	@echo "$(BLUE)启动生产模式...$(NC)"
	@npm start

# Docker 相关
.PHONY: docker-build
docker-build: ## 构建 Docker 镜像
	@echo "$(BLUE)构建 Docker 镜像...$(NC)"
	@docker build -t $(PROJECT_NAME):$(VERSION) .
	@echo "$(GREEN)Docker 镜像构建完成$(NC)"

.PHONY: docker-run
docker-run: ## 运行 Docker 容器
	@echo "$(BLUE)运行 Docker 容器...$(NC)"
	@docker run -p 3000:3000 $(PROJECT_NAME):$(VERSION)

.PHONY: docker-compose-up
docker-compose-up: ## 启动 Docker Compose 服务
	@echo "$(BLUE)启动 Docker Compose 服务...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)Docker Compose 服务启动完成$(NC)"

.PHONY: docker-compose-down
docker-compose-down: ## 停止 Docker Compose 服务
	@echo "$(BLUE)停止 Docker Compose 服务...$(NC)"
	@docker-compose down
	@echo "$(GREEN)Docker Compose 服务停止完成$(NC)"

.PHONY: docker-compose-logs
docker-compose-logs: ## 查看 Docker Compose 日志
	@echo "$(BLUE)查看 Docker Compose 日志...$(NC)"
	@docker-compose logs -f

# 数据库相关
.PHONY: db-migrate
db-migrate: ## 运行数据库迁移
	@echo "$(BLUE)运行数据库迁移...$(NC)"
	@npm run db:migrate
	@echo "$(GREEN)数据库迁移完成$(NC)"

.PHONY: db-seed
db-seed: ## 运行数据库种子数据
	@echo "$(BLUE)运行数据库种子数据...$(NC)"
	@npm run db:seed
	@echo "$(GREEN)数据库种子数据完成$(NC)"

.PHONY: db-reset
db-reset: ## 重置数据库
	@echo "$(BLUE)重置数据库...$(NC)"
	@npm run db:reset
	@echo "$(GREEN)数据库重置完成$(NC)"

# 文档相关
.PHONY: docs
docs: ## 生成文档
	@echo "$(BLUE)生成文档...$(NC)"
	@npm run docs
	@echo "$(GREEN)文档生成完成$(NC)"

.PHONY: docs-serve
docs-serve: ## 启动文档服务器
	@echo "$(BLUE)启动文档服务器...$(NC)"
	@npm run docs:serve

# 安全相关
.PHONY: security
security: ## 运行安全扫描
	@echo "$(BLUE)运行安全扫描...$(NC)"
	@npm audit
	@echo "$(GREEN)安全扫描完成$(NC)"

.PHONY: security-fix
security-fix: ## 修复安全漏洞
	@echo "$(BLUE)修复安全漏洞...$(NC)"
	@npm audit fix
	@echo "$(GREEN)安全漏洞修复完成$(NC)"

# 性能相关
.PHONY: performance
performance: ## 运行性能测试
	@echo "$(BLUE)运行性能测试...$(NC)"
	@npm run test:performance
	@echo "$(GREEN)性能测试完成$(NC)"

# 监控相关
.PHONY: monitor
monitor: ## 启动监控
	@echo "$(BLUE)启动监控...$(NC)"
	@npm run monitor

# 部署相关
.PHONY: deploy-dev
deploy-dev: ## 部署到开发环境
	@echo "$(BLUE)部署到开发环境...$(NC)"
	@npm run deploy:dev
	@echo "$(GREEN)开发环境部署完成$(NC)"

.PHONY: deploy-staging
deploy-staging: ## 部署到测试环境
	@echo "$(BLUE)部署到测试环境...$(NC)"
	@npm run deploy:staging
	@echo "$(GREEN)测试环境部署完成$(NC)"

.PHONY: deploy-prod
deploy-prod: ## 部署到生产环境
	@echo "$(BLUE)部署到生产环境...$(NC)"
	@npm run deploy:prod
	@echo "$(GREEN)生产环境部署完成$(NC)"

# 回滚相关
.PHONY: rollback
rollback: ## 回滚到上一个版本
	@echo "$(BLUE)回滚到上一个版本...$(NC)"
	@npm run rollback
	@echo "$(GREEN)回滚完成$(NC)"

# 备份相关
.PHONY: backup
backup: ## 备份项目
	@echo "$(BLUE)备份项目...$(NC)"
	@npm run backup
	@echo "$(GREEN)项目备份完成$(NC)"

.PHONY: restore
restore: ## 恢复项目
	@echo "$(BLUE)恢复项目...$(NC)"
	@npm run restore
	@echo "$(GREEN)项目恢复完成$(NC)"

# 版本管理
.PHONY: version
version: ## 显示版本信息
	@echo "$(BLUE)版本信息:$(NC)"
	@echo "  项目: $(PROJECT_NAME)"
	@echo "  版本: $(VERSION)"
	@echo "  Node.js: $(NODE_VERSION)"
	@echo "  Python: $(PYTHON_VERSION)"

.PHONY: version-patch
version-patch: ## 更新补丁版本
	@echo "$(BLUE)更新补丁版本...$(NC)"
	@npm version patch
	@echo "$(GREEN)补丁版本更新完成$(NC)"

.PHONY: version-minor
version-minor: ## 更新次要版本
	@echo "$(BLUE)更新次要版本...$(NC)"
	@npm version minor
	@echo "$(GREEN)次要版本更新完成$(NC)"

.PHONY: version-major
version-major: ## 更新主要版本
	@echo "$(BLUE)更新主要版本...$(NC)"
	@npm version major
	@echo "$(GREEN)主要版本更新完成$(NC)"

# 团队协作
.PHONY: team-status
team-status: ## 显示团队状态
	@echo "$(BLUE)团队状态:$(NC)"
	@echo "  项目: $(PROJECT_NAME)"
	@echo "  状态: 开发中"
	@echo "  版本: $(VERSION)"
	@echo "  最后更新: $(shell date)"

.PHONY: team-sync
team-sync: ## 同步团队工作
	@echo "$(BLUE)同步团队工作...$(NC)"
	@git pull origin main
	@git push origin main
	@echo "$(GREEN)团队工作同步完成$(NC)"

# 快速命令
.PHONY: quick-start
quick-start: setup install quality ## 快速启动项目
	@echo "$(GREEN)项目快速启动完成$(NC)"

.PHONY: quick-test
quick-test: lint test ## 快速测试
	@echo "$(GREEN)快速测试完成$(NC)"

.PHONY: quick-build
quick-build: clean build test ## 快速构建
	@echo "$(GREEN)快速构建完成$(NC)"

# 清理所有
.PHONY: clean-all
clean-all: clean docker-compose-down ## 清理所有
	@echo "$(BLUE)清理所有资源...$(NC)"
	@docker system prune -f
	@echo "$(GREEN)所有资源清理完成$(NC)"

# 完整流程
.PHONY: full-cycle
full-cycle: clean install quality build test coverage docker-build ## 完整开发流程
	@echo "$(GREEN)完整开发流程完成$(NC)"

# 检查环境
.PHONY: check-env
check-env: ## 检查环境配置
	@echo "$(BLUE)检查环境配置...$(NC)"
	@node --version
	@npm --version
	@docker --version
	@docker-compose --version
	@echo "$(GREEN)环境检查完成$(NC)"

# 生成报告
.PHONY: report
report: quality coverage security performance ## 生成完整报告
	@echo "$(BLUE)生成完整报告...$(NC)"
	@npm run report
	@echo "$(GREEN)完整报告生成完成$(NC)"

# 更新依赖
.PHONY: update
update: ## 更新依赖
	@echo "$(BLUE)更新依赖...$(NC)"
	@npm update
	@echo "$(GREEN)依赖更新完成$(NC)"

# 检查更新
.PHONY: check-updates
check-updates: ## 检查可用更新
	@echo "$(BLUE)检查可用更新...$(NC)"
	@npm outdated
	@echo "$(GREEN)更新检查完成$(NC)"

# 显示项目信息
.PHONY: info
info: ## 显示项目信息
	@echo "$(CYAN)项目信息:$(NC)"
	@echo "  名称: $(PROJECT_NAME)"
	@echo "  版本: $(VERSION)"
	@echo "  目录: $(PWD)"
	@echo "  时间: $(shell date)"
	@echo ""
	@echo "$(YELLOW)目录结构:$(NC)"
	@tree -I 'node_modules|.git|.DS_Store' -L 2

# Agent 相关命令
.PHONY: setup-agent
setup-agent: ## 配置 Cursor Agent 环境
	@echo "$(BLUE)配置 Cursor Agent 环境...$(NC)"
	@./scripts/setup-agent.sh

.PHONY: init-new-project
init-new-project: ## 基于模板初始化新项目
	@echo "$(BLUE)基于模板初始化新项目...$(NC)"
	@./scripts/create-project.sh

# 智能化 Agent 系统
.PHONY: intelligent-agent
intelligent-agent: ## 启动智能化 Agent 系统
	@echo "$(PURPLE)启动智能化 Agent 系统...$(NC)"
	@node scripts/agent/intelligent-agent.js

.PHONY: smart-generate
smart-generate: ## 启动智能项目生成器
	@echo "$(PURPLE)启动智能项目生成器...$(NC)"
	@node scripts/automation/smart-project-generator.js

.PHONY: github-advisor
github-advisor: ## 启动 GitHub 集成顾问
	@echo "$(PURPLE)启动 GitHub 集成顾问...$(NC)"
	@node scripts/automation/github-integration-advisor.js

.PHONY: agent-manager
agent-manager: ## 启动 Agent 管理器
	@echo "$(PURPLE)启动 Agent 管理器...$(NC)"
	@node scripts/agent/agent-manager.js

.PHONY: agent-workflow
agent-workflow: ## 启动 Agent 工作流引擎
	@echo "$(PURPLE)启动 Agent 工作流引擎...$(NC)"
	@node scripts/agent/agent-workflow.js

# 一键智能开发
.PHONY: smart-dev
smart-dev: ## 🚀 启动智能开发模式
	@echo "$(CYAN)🚀 启动智能开发模式...$(NC)"
	@echo "$(YELLOW)💡 优先使用现有GitHub项目，避免重复造轮子$(NC)"
	@echo "1. 智能项目分析"
	@node scripts/agent/intelligent-agent.js
	@echo "2. GitHub 集成推荐"  
	@node scripts/automation/github-integration-advisor.js
	@echo "3. 智能项目生成"
	@node scripts/automation/smart-project-generator.js

# Cursor IDE 故障排查
.PHONY: diagnose-cursor
diagnose-cursor: ## 🔍 诊断 Cursor IDE 崩溃问题
	@echo "$(PURPLE)🔍 诊断 Cursor IDE 问题...$(NC)"
	@./scripts/cursor/diagnose-cursor-crash.sh

.PHONY: fix-cursor
fix-cursor: ## 🔧 快速修复 Cursor IDE 崩溃
	@echo "$(PURPLE)🔧 修复 Cursor IDE...$(NC)"
	@./scripts/cursor/quick-fix-crash.sh

.PHONY: clean-cursor-cache
clean-cursor-cache: ## 🧹 清理 Cursor 缓存
	@echo "$(PURPLE)🧹 清理 Cursor 缓存...$(NC)"
	@./scripts/cursor/fix-cursor-crash.sh clean-cache

.PHONY: reset-cursor
reset-cursor: ## ⚠️  重置 Cursor 配置（会备份）
	@echo "$(RED)⚠️  重置 Cursor 配置...$(NC)"
	@./scripts/cursor/fix-cursor-crash.sh reset-config

.PHONY: optimize-cursor
optimize-cursor: ## ⚡ 优化 Cursor 性能配置
	@echo "$(PURPLE)⚡ 优化 Cursor 配置...$(NC)"
	@./scripts/cursor/fix-cursor-crash.sh reduce-features

# 显示帮助
.PHONY: commands
commands: ## 显示所有可用命令
	@echo "$(CYAN)所有可用命令:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
