# 🚀 GitHub 快速实现方案

> 基于 GitHub 现有项目的快速集成和实现策略

## 📋 方案概览

基于您的产品管理工具成功改进，我们提供 3 个快速实现方案，预计 1-2 周内完成核心功能。

---

## 🎯 方案 1：基于 GitHub Actions 的自动化工作流

### 核心思路

利用 GitHub Actions 的强大生态，快速构建自动化工作流，无需复杂开发。

### 实施步骤

#### 第 1 天：设置 GitHub Actions 工作流

创建 `.github/workflows/agent-automation.yml`：

```yaml
name: Cursor Agent Automation

on:
  workflow_dispatch:
    inputs:
      agent_type:
        description: 'Agent 类型'
        required: true
        default: 'product-manager'
        type: choice
        options:
          - product-manager
          - requirement-analyzer
          - developer-tools
          - test-manager
      action:
        description: '执行动作'
        required: true
        default: 'help'
        type: string
      options:
        description: '选项参数'
        required: false
        type: string

jobs:
  agent-execution:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Execute Agent
        run: |
          node scripts/agent/roles/${{ github.event.inputs.agent_type }}.js \
            ${{ github.event.inputs.action }} \
            ${{ github.event.inputs.options }}

      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: agent-results
          path: tmp/generated/
```

#### 第 2 天：创建 GitHub App 集成

使用现有的 GitHub App 模板：

```bash
# 克隆 GitHub App 模板
git clone https://github.com/github/github-app-template.git cursor-agent-app
cd cursor-agent-app

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
```

#### 第 3 天：集成现有工具

```javascript
// scripts/github-integration/actions-handler.js
const { execSync } = require('child_process');
const fs = require('fs').promises;

class GitHubActionsHandler {
  constructor() {
    this.workflowPath = '.github/workflows/agent-automation.yml';
  }

  async triggerWorkflow(agentType, action, options = '') {
    try {
      const command = `gh workflow run agent-automation.yml \
        -f agent_type=${agentType} \
        -f action=${action} \
        -f options="${options}"`;

      execSync(command, { stdio: 'inherit' });
      console.log(`✅ 工作流已触发: ${agentType} ${action}`);
    } catch (error) {
      console.error(`❌ 工作流触发失败: ${error.message}`);
    }
  }

  async getWorkflowStatus() {
    try {
      const result = execSync('gh run list --limit 5', { encoding: 'utf8' });
      console.log('📊 最近的工作流执行状态:');
      console.log(result);
    } catch (error) {
      console.error(`❌ 获取状态失败: ${error.message}`);
    }
  }
}

module.exports = GitHubActionsHandler;
```

### 优势

- ✅ **零开发成本**：直接使用 GitHub 现有功能
- ✅ **高可靠性**：GitHub 基础设施保障
- ✅ **易于扩展**：丰富的 Actions 生态
- ✅ **团队协作**：天然支持多人协作

---

## 🎯 方案 2：基于 GitHub CLI 的快速脚本

### 核心思路

利用 GitHub CLI (`gh`) 的强大功能，快速构建命令行工具。

### 实施步骤

#### 第 1 天：安装和配置 GitHub CLI

```bash
# 安装 GitHub CLI
brew install gh  # macOS
# 或
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh  # Ubuntu

# 认证
gh auth login
```

#### 第 2 天：创建快速脚本

创建 `scripts/github-quick/gh-agent.js`：

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class GitHubQuickAgent {
  constructor() {
    this.repo = this.getCurrentRepo();
  }

  getCurrentRepo() {
    try {
      const result = execSync('gh repo view --json nameWithOwner', { encoding: 'utf8' });
      return JSON.parse(result).nameWithOwner;
    } catch {
      return null;
    }
  }

  async createIssue(title, body, labels = []) {
    try {
      const command = `gh issue create --title "${title}" --body "${body}" ${labels.map(l => `--label "${l}"`).join(' ')}`;
      const result = execSync(command, { encoding: 'utf8' });
      console.log(`✅ Issue 已创建: ${result.trim()}`);
      return result.trim();
    } catch (error) {
      console.error(`❌ 创建 Issue 失败: ${error.message}`);
    }
  }

  async createPR(title, body, base = 'main', head = 'feature/auto-generated') {
    try {
      const command = `gh pr create --title "${title}" --body "${body}" --base ${base} --head ${head}`;
      const result = execSync(command, { encoding: 'utf8' });
      console.log(`✅ PR 已创建: ${result.trim()}`);
      return result.trim();
    } catch (error) {
      console.error(`❌ 创建 PR 失败: ${error.message}`);
    }
  }

  async listIssues(state = 'open') {
    try {
      const command = `gh issue list --state ${state} --json number,title,state,labels`;
      const result = execSync(command, { encoding: 'utf8' });
      const issues = JSON.parse(result);

      console.log(`📋 ${state} 状态的 Issues:`);
      issues.forEach(issue => {
        const labels = issue.labels.map(l => l.name).join(', ');
        console.log(`  #${issue.number}: ${issue.title} [${labels}]`);
      });

      return issues;
    } catch (error) {
      console.error(`❌ 获取 Issues 失败: ${error.message}`);
    }
  }

  async syncWithLocal() {
    try {
      // 同步远程分支
      execSync('git fetch origin', { stdio: 'inherit' });

      // 获取最新代码
      execSync('git pull origin main', { stdio: 'inherit' });

      console.log('✅ 本地代码已同步');
    } catch (error) {
      console.error(`❌ 同步失败: ${error.message}`);
    }
  }

  async generateReport() {
    try {
      // 获取仓库统计信息
      const stats = execSync('gh api repos/:owner/:repo', { encoding: 'utf8' });
      const repoData = JSON.parse(stats);

      // 获取 Issues 统计
      const issues = await this.listIssues('all');

      // 生成报告
      const report = {
        repository: repoData.full_name,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        issues: {
          open: issues.filter(i => i.state === 'open').length,
          closed: issues.filter(i => i.state === 'closed').length,
          total: issues.length,
        },
        lastUpdated: new Date().toISOString(),
      };

      const reportPath = path.join(process.cwd(), 'tmp', 'github-report.json');
      await fs.mkdir(path.dirname(reportPath), { recursive: true });
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

      console.log(`📊 报告已生成: ${reportPath}`);
      return report;
    } catch (error) {
      console.error(`❌ 生成报告失败: ${error.message}`);
    }
  }
}

// CLI 接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const agent = new GitHubQuickAgent();

  switch (command) {
    case 'issue':
      await agent.createIssue(args[1], args[2], args.slice(3));
      break;
    case 'pr':
      await agent.createPR(args[1], args[2], args[3], args[4]);
      break;
    case 'list':
      await agent.listIssues(args[1]);
      break;
    case 'sync':
      await agent.syncWithLocal();
      break;
    case 'report':
      await agent.generateReport();
      break;
    default:
      console.log(`
🚀 GitHub 快速 Agent 工具

命令：
  issue <title> <body> [labels...]  创建 Issue
  pr <title> <body> [base] [head]   创建 PR
  list [state]                      列出 Issues
  sync                              同步本地代码
  report                            生成仓库报告

示例：
  node gh-agent.js issue "新功能需求" "需要实现用户认证功能" "enhancement" "help-wanted"
  node gh-agent.js pr "添加用户认证" "实现了基本的登录功能" "main" "feature/auth"
  node gh-agent.js list open
  node gh-agent.js sync
  node gh-agent.js report
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = GitHubQuickAgent;
```

#### 第 3 天：集成到现有工具

更新 `Makefile`：

```makefile
# GitHub 快速工具
gh-issue: ## 创建 GitHub Issue
	@echo "$(BLUE)📝 创建 GitHub Issue...$(NC)"
	@node scripts/github-quick/gh-agent.js issue "$(TITLE)" "$(BODY)" $(LABELS)

gh-pr: ## 创建 GitHub PR
	@echo "$(BLUE)🔄 创建 GitHub PR...$(NC)"
	@node scripts/github-quick/gh-agent.js pr "$(TITLE)" "$(BODY)" "$(BASE)" "$(HEAD)"

gh-sync: ## 同步 GitHub 代码
	@echo "$(BLUE)🔄 同步 GitHub 代码...$(NC)"
	@node scripts/github-quick/gh-agent.js sync

gh-report: ## 生成 GitHub 报告
	@echo "$(BLUE)📊 生成 GitHub 报告...$(NC)"
	@node scripts/github-quick/gh-agent.js report

# 集成工作流
workflow-github: ## GitHub 集成工作流
	@echo "$(BLUE)🚀 执行 GitHub 集成工作流...$(NC)"
	@make gh-sync
	@make agent-product roadmap --template=quarterly
	@make gh-issue TITLE="产品路线图更新" BODY="已生成新的季度产品路线图" LABELS="product" "roadmap"
	@make gh-report
```

### 优势

- ✅ **快速部署**：1-2 天即可完成
- ✅ **功能丰富**：GitHub CLI 提供完整 API
- ✅ **易于维护**：简单的 JavaScript 脚本
- ✅ **高度集成**：与现有工具无缝集成

---

## 🎯 方案 3：基于 GitHub 模板的快速启动

### 核心思路

使用 GitHub 上的成熟模板项目，快速搭建基础架构。

### 推荐模板项目

#### 1. **Cursor Agent 模板** (推荐)

```bash
# 克隆模板
git clone https://github.com/aiurda/cursor10x.git cursor-agent-template
cd cursor-agent-template

# 安装依赖
npm install

# 配置环境
cp .env.example .env
```

#### 2. **自动化工具模板**

```bash
# 克隆自动化模板
git clone https://github.com/github/github-app-template.git automation-template
cd automation-template

# 快速配置
npm run setup
```

#### 3. **CLI 工具模板**

```bash
# 克隆 CLI 模板
git clone https://github.com/oclif/hello-world.git cli-template
cd cli-template

# 自定义配置
npm run build
```

### 实施步骤

#### 第 1 天：选择和应用模板

```bash
# 创建新项目
mkdir cursor-agent-enhanced
cd cursor-agent-enhanced

# 初始化 Git
git init

# 添加模板作为子模块
git submodule add https://github.com/aiurda/cursor10x.git templates/cursor10x
git submodule add https://github.com/github/github-app-template.git templates/github-app
```

#### 第 2 天：快速配置

创建 `scripts/quick-setup.js`：

```javascript
#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class QuickSetup {
  constructor() {
    this.templatesDir = 'templates';
    this.outputDir = 'scripts/agent/enhanced';
  }

  async setupFromTemplate(templateName) {
    try {
      const templatePath = path.join(this.templatesDir, templateName);

      // 复制模板文件
      await this.copyTemplate(templatePath, this.outputDir);

      // 安装依赖
      execSync('npm install', { stdio: 'inherit' });

      // 配置环境
      await this.setupEnvironment();

      console.log(`✅ 模板 ${templateName} 设置完成`);
    } catch (error) {
      console.error(`❌ 设置失败: ${error.message}`);
    }
  }

  async copyTemplate(source, destination) {
    // 实现模板复制逻辑
    console.log(`📁 复制模板: ${source} -> ${destination}`);
  }

  async setupEnvironment() {
    const envContent = `
# Cursor Agent 环境配置
NODE_ENV=development
GITHUB_TOKEN=${process.env.GITHUB_TOKEN || 'your-token-here'}
CURSOR_API_KEY=${process.env.CURSOR_API_KEY || 'your-api-key-here'}
    `;

    await fs.writeFile('.env', envContent);
    console.log('🔧 环境配置已创建');
  }
}

// 使用示例
async function main() {
  const setup = new QuickSetup();
  const template = process.argv[2] || 'cursor10x';
  await setup.setupFromTemplate(template);
}

if (require.main === module) {
  main().catch(console.error);
}
```

#### 第 3 天：集成现有功能

```bash
# 运行快速设置
node scripts/quick-setup.js cursor10x

# 集成现有工具
cp scripts/agent/roles/product-manager.js scripts/agent/enhanced/
cp docs/templates/product/* docs/templates/enhanced/

# 测试集成
node scripts/agent/enhanced/product-manager.js help
```

### 优势

- ✅ **零配置启动**：模板项目开箱即用
- ✅ **最佳实践**：基于成熟项目的经验
- ✅ **快速迭代**：专注于业务逻辑开发
- ✅ **社区支持**：活跃的开源社区

---

## 🎯 推荐实施顺序

### 第 1 周：方案 2 (GitHub CLI)

- **第 1-2 天**：安装配置 GitHub CLI
- **第 3-4 天**：开发快速脚本
- **第 5 天**：集成测试

### 第 2 周：方案 1 (GitHub Actions)

- **第 1-2 天**：设置 Actions 工作流
- **第 3-4 天**：集成现有工具
- **第 5 天**：团队协作测试

### 第 3 周：方案 3 (模板集成)

- **第 1-2 天**：选择和配置模板
- **第 3-4 天**：自定义和扩展
- **第 5 天**：完整功能测试

---

## 📊 方案对比

| 方案           | 开发时间 | 技术难度 | 功能完整性 | 维护成本 | 推荐指数   |
| -------------- | -------- | -------- | ---------- | -------- | ---------- |
| GitHub Actions | 1-2 天   | ⭐⭐     | ⭐⭐⭐⭐   | ⭐       | ⭐⭐⭐⭐⭐ |
| GitHub CLI     | 2-3 天   | ⭐⭐⭐   | ⭐⭐⭐     | ⭐⭐     | ⭐⭐⭐⭐   |
| 模板集成       | 3-5 天   | ⭐⭐     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐   | ⭐⭐⭐     |

---

## 🚀 立即开始

### 选择方案 2 (GitHub CLI) 开始：

```bash
# 1. 安装 GitHub CLI
brew install gh
gh auth login

# 2. 创建快速脚本
mkdir -p scripts/github-quick
# 复制上面的 gh-agent.js 代码

# 3. 测试功能
node scripts/github-quick/gh-agent.js report
node scripts/github-quick/gh-agent.js list open

# 4. 集成到 Makefile
# 添加上面的 Makefile 配置
```

### 预期效果

- ✅ **1 天内**：基础 GitHub 集成完成
- ✅ **3 天内**：完整工作流可用
- ✅ **1 周内**：团队协作功能完善

---

_这些方案都基于 GitHub 的成熟生态，可以快速实现并立即投入使用。建议从方案 2 开始，逐步扩展到其他方案。_
