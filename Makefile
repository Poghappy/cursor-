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
.PHONY: check-files clean-temp check-duplicates promote-file find-similar fix-files check-file-output validate-syntax fix-syntax-errors
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

check-file-output: ## 检查文件输出错误
	@echo "$(BLUE)🔍 检查文件输出错误...$(NC)"
	@node scripts/maintenance/file-output-validator-clean.js

validate-syntax: ## 验证所有文件语法
	@echo "$(BLUE)🔍 验证文件语法...$(NC)"
	@echo "验证 JavaScript 文件..."
	@find scripts/ -name "*.js" -exec node -c {} \; && echo "✅ JavaScript 语法验证通过" || echo "❌ JavaScript 语法验证失败"
	@echo "验证 TypeScript 文件..."
	@if command -v tsc >/dev/null 2>&1; then \
		tsc --noEmit --skipLibCheck && echo "✅ TypeScript 语法验证通过" || echo "❌ TypeScript 语法验证失败"; \
	else \
		echo "⚠️ TypeScript 编译器未安装，跳过 TS 验证"; \
	fi
	@echo "$(GREEN)✅ 语法验证完成$(NC)"

fix-syntax-errors: ## 修复常见语法错误
	@echo "$(BLUE)🔧 修复语法错误...$(NC)"
	@node scripts/maintenance/file-output-validator.js --auto-fix --verbose

fix-file-output: ## 自动修复文件输出错误
	@echo "$(BLUE)🔧 自动修复文件输出错误...$(NC)"
	@node scripts/maintenance/file-output-validator-clean.js --auto-fix
	@echo "$(GREEN)✅ 文件输出错误修复完成$(NC)"

# 环境设置
.PHONY: setup setup-git-hooks setup-env
setup: init ## 设置开发环境
	@echo "$(BLUE)设置开发环境...$(NC)"
	@if [ ! -f $(ENV_FILE) ]; then \
		cp $(ENV_EXAMPLE) $(ENV_FILE); \
		echo "$(YELLOW)请编辑 $(ENV_FILE) 文件配置环境变量$(NC)"; \
	fi
	@echo "$(GREEN)环境设置完成$(NC)"

setup-git-hooks: ## 设置 Git hooks
	@echo "$(BLUE)🪝 设置 Git hooks...$(NC)"
	@node scripts/development/git-hooks-manager.js install
	@echo "$(GREEN)✅ Git hooks 设置完成$(NC)"

setup-env: ## 初始化环境配置
	@echo "$(BLUE)⚙️ 初始化环境配置...$(NC)"
	@node scripts/development/env-manager.js init
	@echo "$(GREEN)✅ 环境配置初始化完成$(NC)"

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
.PHONY: monitor monitor-performance monitor-logs analyze-logs
monitor: ## 启动监控
	@echo "$(BLUE)启动监控...$(NC)"
	@npm run monitor

monitor-performance: ## 启动性能监控
	@echo "$(BLUE)📊 启动性能监控...$(NC)"
	@node scripts/monitoring/performance-monitor.js watch

monitor-logs: ## 实时监控日志
	@echo "$(BLUE)👁️ 启动日志监控...$(NC)"
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)❌ 请指定日志文件: make monitor-logs FILE=path/to/logfile$(NC)"; \
	else \
		node scripts/monitoring/log-analyzer.js watch $(FILE); \
	fi

analyze-logs: ## 分析日志文件
	@echo "$(BLUE)🔍 分析日志文件...$(NC)"
	@node scripts/monitoring/log-analyzer.js analyze

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

# .cursor 目录优化
.PHONY: cursor-optimize
cursor-optimize: ## 🔧 优化 .cursor 目录结构
	@echo "$(PURPLE)🔧 优化 .cursor 目录...$(NC)"
	@./scripts/maintenance/optimize-cursor-dir.sh

.PHONY: cursor-optimize-dry
cursor-optimize-dry: ## 🔍 演练 .cursor 优化（不实际修改）
	@echo "$(PURPLE)🔍 演练 .cursor 优化...$(NC)"
	@./scripts/maintenance/optimize-cursor-dir.sh --dry-run

.PHONY: cursor-backup
cursor-backup: ## 💾 备份 .cursor 配置
	@echo "$(PURPLE)💾 备份 .cursor 配置...$(NC)"
	@./scripts/maintenance/optimize-cursor-dir.sh --backup-only

.PHONY: cursor-validate
cursor-validate: ## ✅ 验证 .cursor 配置
	@echo "$(PURPLE)✅ 验证 .cursor 配置...$(NC)"
	@if [ -d ".cursor" ]; then \
		echo "$(GREEN)✓ .cursor 目录存在$(NC)"; \
		echo "  文件数: $$(find .cursor -type f | wc -l | tr -d ' ')"; \
		echo "  目录数: $$(find .cursor -type d | wc -l | tr -d ' ')"; \
	else \
		echo "$(RED)✗ .cursor 目录不存在$(NC)"; \
	fi

.PHONY: cursor-stats
cursor-stats: ## 📊 显示 .cursor 统计信息
	@echo "$(PURPLE)📊 .cursor 目录统计$(NC)"
	@if [ -d ".cursor" ]; then \
		echo "$(CYAN)目录结构:$(NC)"; \
		tree .cursor -L 2 -I 'node_modules|.git|cache|sessions' 2>/dev/null || find .cursor -maxdepth 2 -type d; \
		echo ""; \
		echo "$(CYAN)大小统计:$(NC)"; \
		du -sh .cursor; \
	else \
		echo "$(RED).cursor 目录不存在$(NC)"; \
	fi

# Agent 角色专用工具
.PHONY: product-manager requirement-analyzer architecture-designer developer-tools test-manager operations-tools doc-generator llm-engineer project-coordinator
.PHONY: product-roadmap user-stories feature-flags requirements-analyze process-model use-cases test-generate quality-gate code-generate api-client migrate review-code

# 产品管理工具
product-manager: ## 📋 启动产品管理工具
	@echo "$(BLUE)📋 启动产品管理工具...$(NC)"

product-roadmap: ## 📋 生成产品路线图
	@echo "$(BLUE)📋 生成产品路线图...$(NC)"
	@node scripts/agent/roles/product-manager.js roadmap --template=quarterly
	@echo "$(GREEN)✅ 产品路线图生成完成$(NC)"

user-stories: ## 📝 管理用户故事
	@echo "$(BLUE)📝 管理用户故事...$(NC)"
	@node scripts/agent/roles/product-manager.js user-story --action=list
	@echo "$(GREEN)✅ 用户故事管理完成$(NC)"

feature-flags: ## 🚩 管理功能开关
	@echo "$(BLUE)🚩 管理功能开关...$(NC)"
	@node scripts/agent/roles/product-manager.js feature-flag --operation=list
	@echo "$(GREEN)✅ 功能开关管理完成$(NC)"

# 需求分析工具
requirements-analyze: ## 📊 分析需求文档
	@echo "$(BLUE)📊 分析需求文档...$(NC)"
	@node scripts/agent/roles/requirement-analyzer.js analyze --input=docs/product/requirements/PRD_v2.md
	@echo "$(GREEN)✅ 需求分析完成$(NC)"

process-model: ## 🔄 业务流程建模
	@echo "$(BLUE)🔄 业务流程建模...$(NC)"
	@node scripts/agent/roles/requirement-analyzer.js model --process=user-registration
	@echo "$(GREEN)✅ 流程建模完成$(NC)"

use-cases: ## 📋 生成用例
	@echo "$(BLUE)📋 生成用例...$(NC)"
	@node scripts/agent/roles/requirement-analyzer.js use-cases --template=standard
	@echo "$(GREEN)✅ 用例生成完成$(NC)"

# 测试管理工具
test-generate: ## 🧪 生成测试用例
	@echo "$(BLUE)🧪 生成测试用例...$(NC)"
	@node scripts/agent/roles/test-manager.js generate --type=unit --framework=jest
	@echo "$(GREEN)✅ 测试用例生成完成$(NC)"

quality-gate: ## 🚪 质量门禁检查
	@echo "$(BLUE)🚪 质量门禁检查...$(NC)"
	@node scripts/agent/roles/test-manager.js quality-gates --coverage=80
	@echo "$(GREEN)✅ 质量门禁检查完成$(NC)"

# 开发工具
code-generate: ## 💻 生成代码
	@echo "$(BLUE)💻 生成代码...$(NC)"
	@node scripts/agent/roles/developer-tools.js generate --type=service --name=User --template=crud
	@echo "$(GREEN)✅ 代码生成完成$(NC)"

api-client: ## 🔗 生成 API 客户端
	@echo "$(BLUE)🔗 生成 API 客户端...$(NC)"
	@node scripts/agent/roles/developer-tools.js api-client --spec=docs/api/openapi.json --language=typescript
	@echo "$(GREEN)✅ API 客户端生成完成$(NC)"

migrate: ## 🗄️ 数据库迁移
	@echo "$(BLUE)🗄️ 数据库迁移...$(NC)"
	@node scripts/agent/roles/developer-tools.js migrate --operation=create --name=add-user-table
	@echo "$(GREEN)✅ 数据库迁移完成$(NC)"

review-code: ## 🔍 代码审查
	@echo "$(BLUE)🔍 代码审查...$(NC)"
	@node scripts/agent/roles/developer-tools.js review --path=src --format=json
	@echo "$(GREEN)✅ 代码审查完成$(NC)"

# 需求分析工具
requirement-analyzer: ## 📊 启动需求分析工具
	@echo "$(BLUE)📊 启动需求分析工具...$(NC)"
	@node scripts/agent/roles/requirement-analyzer.js

requirements-analyze: ## 🔍 分析需求文档
	@echo "$(BLUE)🔍 分析需求文档...$(NC)"
	@node scripts/agent/roles/requirement-analyzer.js analyze --input=requirements.md

process-model: ## 🏗️ 业务流程建模
	@echo "$(BLUE)🏗️ 业务流程建模...$(NC)"
	@node scripts/agent/roles/requirement-analyzer.js model --process=business-flow

use-cases: ## 📋 生成用例
	@echo "$(BLUE)📋 生成用例...$(NC)"
	@node scripts/agent/roles/requirement-analyzer.js generate --use-cases --validate

# 架构设计工具
architecture-designer: ## 🏗️ 启动架构设计工具
	@echo "$(BLUE)🏗️ 启动架构设计工具...$(NC)"
	@node scripts/agent/roles/architecture-designer.js

adr-create: ## 📝 创建架构决策记录
	@echo "$(BLUE)📝 创建架构决策记录...$(NC)"
	@node scripts/agent/roles/architecture-designer.js adr --create --template=standard

system-design: ## 🎨 系统设计生成
	@echo "$(BLUE)🎨 系统设计生成...$(NC)"
	@node scripts/agent/roles/architecture-designer.js design --system --validate

tech-stack: ## 🔧 技术栈推荐
	@echo "$(BLUE)🔧 技术栈推荐...$(NC)"
	@node scripts/agent/roles/architecture-designer.js stack --recommend --context=project

# 开发工程工具
developer-tools: ## 💻 启动开发工程工具
	@echo "$(BLUE)💻 启动开发工程工具...$(NC)"
	@node scripts/agent/roles/developer-tools.js

# 增强版本工具
llme-enhanced: ## 🤖 启动 LLME 增强版本（集成提示工程工具包）
	@echo "$(BLUE)🤖 启动 LLME 增强版本...$(NC)"
	@node scripts/agent/roles/llme-enhanced.js

dev-enhanced: ## 💻 启动 Dev 增强版本（集成智能代码生成器）
	@echo "$(BLUE)💻 启动 Dev 增强版本...$(NC)"
	@node scripts/agent/roles/dev-enhanced.js

qa-enhanced: ## 🧪 启动 QA 增强版本（集成通用测试框架）
	@echo "$(BLUE)🧪 启动 QA 增强版本...$(NC)"
	@node scripts/agent/roles/qa-enhanced.js

github-integration: ## 🔗 启动 GitHub 工具集成管理器
	@echo "$(BLUE)🔗 启动 GitHub 工具集成管理器...$(NC)"
	@node scripts/agent/roles/github-integration.js

code-generate: ## ⚡ 代码生成
	@echo "$(BLUE)⚡ 代码生成...$(NC)"
	@node scripts/agent/roles/developer-tools.js generate --type=service --template=crud

api-client: ## 🔌 API 客户端生成
	@echo "$(BLUE)🔌 API 客户端生成...$(NC)"
	@node scripts/agent/roles/developer-tools.js api-client --spec=openapi.json

migration: ## 🗄️ 数据库迁移
	@echo "$(BLUE)🗄️ 数据库迁移...$(NC)"
	@node scripts/agent/roles/developer-tools.js migrate --database=postgresql

# 测试管理工具
test-manager: ## 🧪 启动测试管理工具
	@echo "$(BLUE)🧪 启动测试管理工具...$(NC)"
	@node scripts/agent/roles/test-manager.js

test-generate: ## 📝 生成测试用例
	@echo "$(BLUE)📝 生成测试用例...$(NC)"
	@node scripts/agent/roles/test-manager.js generate --type=unit --coverage=80%

quality-gate: ## 🚪 质量门禁检查
	@echo "$(BLUE)🚪 质量门禁检查...$(NC)"
	@node scripts/agent/roles/test-manager.js quality-gate --check --threshold=90%

test-framework: ## 🏗️ 测试框架设置
	@echo "$(BLUE)🏗️ 测试框架设置...$(NC)"
	@node scripts/agent/roles/test-manager.js framework --setup --type=jest

# 运维部署工具
operations-tools: ## 🚀 启动运维部署工具
	@echo "$(BLUE)🚀 启动运维部署工具...$(NC)"
	@node scripts/agent/roles/operations-tools.js

infrastructure: ## 🏗️ 基础设施即代码
	@echo "$(BLUE)🏗️ 基础设施即代码...$(NC)"
	@node scripts/agent/roles/operations-tools.js infrastructure --generate --provider=aws

pipeline: ## 🔄 CI/CD 管道生成
	@echo "$(BLUE)🔄 CI/CD 管道生成...$(NC)"
	@node scripts/agent/roles/operations-tools.js pipeline --create --type=github-actions

monitor-setup: ## 📊 监控设置
	@echo "$(BLUE)📊 监控设置...$(NC)"
	@node scripts/agent/roles/operations-tools.js monitor --setup --dashboard=grafana

# 技术文档工具
doc-generator: ## 📚 启动技术文档工具
	@echo "$(BLUE)📚 启动技术文档工具...$(NC)"
	@node scripts/agent/roles/doc-generator.js

api-docs: ## 📖 API 文档生成
	@echo "$(BLUE)📖 API 文档生成...$(NC)"
	@node scripts/agent/roles/doc-generator.js api --spec=openapi.json --format=markdown

user-manual: ## 📘 用户手册生成
	@echo "$(BLUE)📘 用户手册生成...$(NC)"
	@node scripts/agent/roles/doc-generator.js template --type=user-manual --generate

changelog: ## 📝 变更日志管理
	@echo "$(BLUE)📝 变更日志管理...$(NC)"
	@node scripts/agent/roles/doc-generator.js changelog --update --version=1.0.0

# AI 工程工具
llm-engineer: ## 🤖 启动 AI 工程工具
	@echo "$(BLUE)🤖 启动 AI 工程工具...$(NC)"
	@node scripts/agent/roles/llm-engineer.js

prompt-optimize: ## 🎯 提示工程优化
	@echo "$(BLUE)🎯 提示工程优化...$(NC)"
	@node scripts/agent/roles/llm-engineer.js prompt --optimize --context=product

model-manage: ## 🧠 模型管理
	@echo "$(BLUE)🧠 模型管理...$(NC)"
	@node scripts/agent/roles/llm-engineer.js model --manage --version=latest

ai-assess: ## 📊 AI 能力评估
	@echo "$(BLUE)📊 AI 能力评估...$(NC)"
	@node scripts/agent/roles/llm-engineer.js assess --capability --benchmark

# 项目管理工具
project-coordinator: ## 📅 启动项目管理工具
	@echo "$(BLUE)📅 启动项目管理工具...$(NC)"
	@node scripts/agent/roles/project-coordinator.js

timeline: ## ⏰ 项目时间线生成
	@echo "$(BLUE)⏰ 项目时间线生成...$(NC)"
	@node scripts/agent/roles/project-coordinator.js timeline --generate --milestones

resource-plan: ## 👥 资源规划
	@echo "$(BLUE)👥 资源规划...$(NC)"
	@node scripts/agent/roles/project-coordinator.js resource --plan --allocation

risk-assess: ## ⚠️ 风险评估
	@echo "$(BLUE)⚠️ 风险评估...$(NC)"
	@node scripts/agent/roles/project-coordinator.js risk --assess --matrix

# 项目健康检查
.PHONY: project-health
project-health: ## 💖 项目健康度检查
	@echo "$(BLUE)💖 运行项目健康度检查...$(NC)"
	@node scripts/maintenance/project-health.js

# GitHub 快速工具
.PHONY: gh-help gh-issue gh-pr gh-sync gh-report gh-workflow gh-status
gh-help: ## 🚀 GitHub 工具帮助
	@echo "$(BLUE)🚀 GitHub 快速工具帮助$(NC)"
	@node scripts/github-quick/gh-agent.js

gh-issue: ## 📝 创建 GitHub Issue
	@echo "$(BLUE)📝 创建 GitHub Issue...$(NC)"
	@node scripts/github-quick/gh-agent.js issue "$(TITLE)" "$(BODY)" $(LABELS)

gh-pr: ## 🔄 创建 GitHub PR
	@echo "$(BLUE)🔄 创建 GitHub PR...$(NC)"
	@node scripts/github-quick/gh-agent.js pr "$(TITLE)" "$(BODY)" "$(BASE)" "$(HEAD)"

gh-sync: ## 🔄 同步 GitHub 代码
	@echo "$(BLUE)🔄 同步 GitHub 代码...$(NC)"
	@node scripts/github-quick/gh-agent.js sync

gh-report: ## 📊 生成 GitHub 报告
	@echo "$(BLUE)📊 生成 GitHub 报告...$(NC)"
	@node scripts/github-quick/gh-agent.js report

gh-workflow: ## ⚡ 触发 GitHub 工作流
	@echo "$(BLUE)⚡ 触发 GitHub 工作流...$(NC)"
	@node scripts/github-quick/gh-agent.js workflow "$(WORKFLOW)" $(INPUTS)

gh-status: ## 📊 查看 GitHub 工作流状态
	@echo "$(BLUE)📊 查看 GitHub 工作流状态...$(NC)"
	@node scripts/github-quick/gh-agent.js status

gh-branch: ## 🌿 创建 GitHub 分支
	@echo "$(BLUE)🌿 创建 GitHub 分支...$(NC)"
	@node scripts/github-quick/gh-agent.js branch "$(BRANCH)" "$(BASE)"

gh-commit: ## 💾 提交并推送代码
	@echo "$(BLUE)💾 提交并推送代码...$(NC)"
	@node scripts/github-quick/gh-agent.js commit "$(MESSAGE)" $(FILES)

# GitHub 集成工作流
.PHONY: workflow-github workflow-github-full
workflow-github: ## 🚀 GitHub 集成工作流
	@echo "$(BLUE)🚀 执行 GitHub 集成工作流...$(NC)"
	@make gh-sync
	@make agent-product roadmap --template=quarterly
	@make gh-issue TITLE="产品路线图更新" BODY="已生成新的季度产品路线图" LABELS="product" "roadmap"
	@make gh-report

workflow-github-full: ## 🚀 GitHub 完整工作流
	@echo "$(BLUE)🚀 执行 GitHub 完整工作流...$(NC)"
	@make gh-sync
	@make agent-requirements analyze --format=markdown
	@make agent-product roadmap --template=quarterly
	@make agent-dev generate --language=typescript
	@make gh-branch BRANCH="feature/auto-generated" BASE="main"
	@make gh-commit MESSAGE="🤖 自动生成: 需求分析、产品路线图、开发工具"
	@make gh-pr TITLE="自动生成的功能更新" BODY="包含需求分析、产品路线图和开发工具生成" BASE="main" HEAD="feature/auto-generated"
	@make gh-report

# 显示帮助
.PHONY: commands
commands: ## 显示所有可用命令
	@echo "$(CYAN)所有可用命令:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
