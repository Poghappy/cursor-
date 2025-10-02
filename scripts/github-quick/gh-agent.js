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
                    total: issues.length
                },
                lastUpdated: new Date().toISOString()
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

    async triggerWorkflow(workflowName, inputs = {}) {
        try {
            const inputArgs = Object.entries(inputs)
                .map(([key, value]) => `-f ${key}="${value}"`)
                .join(' ');

            const command = `gh workflow run ${workflowName}.yml ${inputArgs}`;
            execSync(command, { stdio: 'inherit' });
            console.log(`✅ 工作流 ${workflowName} 已触发`);
        } catch (error) {
            console.error(`❌ 触发工作流失败: ${error.message}`);
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

    async createBranch(branchName, base = 'main') {
        try {
            execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
            console.log(`✅ 分支 ${branchName} 已创建并切换`);
        } catch (error) {
            console.error(`❌ 创建分支失败: ${error.message}`);
        }
    }

    async commitAndPush(message, files = []) {
        try {
            if (files.length > 0) {
                execSync(`git add ${files.join(' ')}`, { stdio: 'inherit' });
            } else {
                execSync('git add .', { stdio: 'inherit' });
            }

            execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
            execSync('git push origin HEAD', { stdio: 'inherit' });

            console.log(`✅ 代码已提交并推送: ${message}`);
        } catch (error) {
            console.error(`❌ 提交推送失败: ${error.message}`);
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
        case 'workflow':
            const inputs = {};
            for (let i = 2; i < args.length; i += 2) {
                if (args[i] && args[i + 1]) {
                    inputs[args[i]] = args[i + 1];
                }
            }
            await agent.triggerWorkflow(args[1], inputs);
            break;
        case 'status':
            await agent.getWorkflowStatus();
            break;
        case 'branch':
            await agent.createBranch(args[1], args[2]);
            break;
        case 'commit':
            await agent.commitAndPush(args[1], args.slice(2));
            break;
        default:
            console.log(`
🚀 GitHub 快速 Agent 工具

命令：
  issue <title> <body> [labels...]    创建 Issue
  pr <title> <body> [base] [head]     创建 PR
  list [state]                        列出 Issues
  sync                                同步本地代码
  report                              生成仓库报告
  workflow <name> [key=value...]      触发工作流
  status                              查看工作流状态
  branch <name> [base]                创建分支
  commit <message> [files...]         提交并推送代码

示例：
  node gh-agent.js issue "新功能需求" "需要实现用户认证功能" "enhancement" "help-wanted"
  node gh-agent.js pr "添加用户认证" "实现了基本的登录功能" "main" "feature/auth"
  node gh-agent.js list open
  node gh-agent.js sync
  node gh-agent.js report
  node gh-agent.js workflow agent-automation agent_type=product-manager action=roadmap
  node gh-agent.js status
  node gh-agent.js branch feature/new-auth main
  node gh-agent.js commit "添加新功能" "src/auth.js" "docs/auth.md"
      `);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = GitHubQuickAgent;
