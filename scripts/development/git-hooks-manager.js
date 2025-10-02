#!/usr/bin/env node

/**
 * Git Hooks 管理器
 * 自动安装和管理项目的 Git hooks，确保代码质量和提交规范
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class GitHooksManager {
  constructor() {
    this.projectRoot = process.cwd();
    this.hooksDir = path.join(this.projectRoot, '.git', 'hooks');
    this.huskyDir = path.join(this.projectRoot, '.husky');
    this.config = this.loadConfig();
  }

  // 加载配置
  loadConfig() {
    const defaultConfig = {
      hooks: {
        'pre-commit': {
          enabled: true,
          tasks: ['lint-staged', 'type-check']
        },
        'commit-msg': {
          enabled: true,
          tasks: ['commitlint']
        },
        'pre-push': {
          enabled: true,
          tasks: ['test', 'build-check']
        },
        'post-commit': {
          enabled: false,
          tasks: ['notify']
        }
      },
      tools: {
        husky: true,
        lintStaged: true,
        commitlint: true
      }
    };

    const configFile = path.join(this.projectRoot, '.githooks.json');
    if (fs.existsSync(configFile)) {
      try {
        const userConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        return { ...defaultConfig, ...userConfig };
      } catch (error) {
        console.warn('⚠️ Git hooks 配置文件解析失败，使用默认配置');
      }
    }

    return defaultConfig;
  }

  // 安装 Git hooks
  async installHooks() {
    console.log('🔧 安装 Git hooks...');

    // 检查是否为 Git 仓库
    if (!fs.existsSync(path.join(this.projectRoot, '.git'))) {
      throw new Error('当前目录不是 Git 仓库');
    }

    // 安装 Husky
    if (this.config.tools.husky) {
      await this.installHusky();
    }

    // 安装 lint-staged
    if (this.config.tools.lintStaged) {
      await this.installLintStaged();
    }

    // 安装 commitlint
    if (this.config.tools.commitlint) {
      await this.installCommitlint();
    }

    // 创建 hook 文件
    await this.createHookFiles();

    console.log('✅ Git hooks 安装完成');
  }

  // 安装 Husky
  async installHusky() {
    console.log('📦 安装 Husky...');

    try {
      // 检查是否已安装
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
      );

      if (!packageJson.devDependencies?.husky) {
        console.log('  安装 husky 依赖...');
        execSync('npm install --save-dev husky', { 
          stdio: 'inherit',
          cwd: this.projectRoot 
        });
      }

      // 初始化 Husky
      if (!fs.existsSync(this.huskyDir)) {
        console.log('  初始化 Husky...');
        execSync('npx husky install', { 
          stdio: 'inherit',
          cwd: this.projectRoot 
        });
      }

      // 添加 prepare 脚本
      const updatedPackageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
      );

      if (!updatedPackageJson.scripts?.prepare) {
        updatedPackageJson.scripts = updatedPackageJson.scripts || {};
        updatedPackageJson.scripts.prepare = 'husky install';
        
        fs.writeFileSync(
          path.join(this.projectRoot, 'package.json'),
          JSON.stringify(updatedPackageJson, null, 2)
        );
        
        console.log('  添加 prepare 脚本到 package.json');
      }

      console.log('✅ Husky 安装完成');
    } catch (error) {
      console.error('❌ Husky 安装失败:', error.message);
      throw error;
    }
  }

  // 安装 lint-staged
  async installLintStaged() {
    console.log('📦 安装 lint-staged...');

    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
      );

      if (!packageJson.devDependencies?.['lint-staged']) {
        console.log('  安装 lint-staged 依赖...');
        execSync('npm install --save-dev lint-staged', { 
          stdio: 'inherit',
          cwd: this.projectRoot 
        });
      }

      // 创建 lint-staged 配置
      await this.createLintStagedConfig();

      console.log('✅ lint-staged 安装完成');
    } catch (error) {
      console.error('❌ lint-staged 安装失败:', error.message);
      throw error;
    }
  }

  // 安装 commitlint
  async installCommitlint() {
    console.log('📦 安装 commitlint...');

    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
      );

      const commitlintPackages = [
        '@commitlint/cli',
        '@commitlint/config-conventional'
      ];

      const missingPackages = commitlintPackages.filter(
        pkg => !packageJson.devDependencies?.[pkg]
      );

      if (missingPackages.length > 0) {
        console.log('  安装 commitlint 依赖...');
        execSync(`npm install --save-dev ${missingPackages.join(' ')}`, { 
          stdio: 'inherit',
          cwd: this.projectRoot 
        });
      }

      // 创建 commitlint 配置
      await this.createCommitlintConfig();

      console.log('✅ commitlint 安装完成');
    } catch (error) {
      console.error('❌ commitlint 安装失败:', error.message);
      throw error;
    }
  }

  // 创建 lint-staged 配置
  async createLintStagedConfig() {
    const configFile = path.join(this.projectRoot, '.lintstagedrc.js');
    
    if (fs.existsSync(configFile)) {
      console.log('  lint-staged 配置已存在');
      return;
    }

    const config = `module.exports = {`
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'git add'
  ],
  '*.{json,md,yml,yaml}': [
    'prettier --write',
    'git add'
  ],
  '*.{css,scss,less}': [
    'prettier --write',
    'git add'
  ]
};
`;`

    fs.writeFileSync(configFile, config);
    console.log('  创建 .lintstagedrc.js 配置文件');
  }

  // 创建 commitlint 配置
  async createCommitlintConfig() {
    const configFile = path.join(this.projectRoot, 'commitlint.config.js');
    
    if (fs.existsSync(configFile)) {
      console.log('  commitlint 配置已存在');
      return;
    }

    const config = `module.exports = {`
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复
        'docs',     // 文档
        'style',    // 格式
        'refactor', // 重构
        'perf',     // 性能
        'test',     // 测试
        'chore',    // 构建过程或辅助工具的变动
        'ci',       // CI/CD
        'build',    // 构建
        'revert'    // 回滚
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72]
  }
};
`;`

    fs.writeFileSync(configFile, config);
    console.log('  创建 commitlint.config.js 配置文件');
  }

  // 创建 hook 文件
  async createHookFiles() {
    console.log('📝 创建 Git hook 文件...');

    Object.entries(this.config.hooks).forEach(([hookName, hookConfig]) => {
      if (hookConfig.enabled) {
        this.createHookFile(hookName, hookConfig);
      }
    });
  }

  // 创建单个 hook 文件
  createHookFile(hookName, hookConfig) {
    const hookPath = path.join(this.huskyDir, hookName);
    
    let hookContent = '#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n\n';

    hookConfig.tasks.forEach(task => {
      switch (task) {
        case 'lint-staged':
          hookContent += 'npx lint-staged\n';
          break;
        case 'type-check':
          hookContent += 'npm run type-check\n';
          break;
        case 'commitlint':
          hookContent += 'npx --no -- commitlint --edit "$1"\n';
          break;
        case 'test':
          hookContent += 'npm test\n';
          break;
        case 'build-check':
          hookContent += 'npm run build\n';
          break;
        case 'notify':
          hookContent += 'echo "✅ 提交成功！"\n';
          break;
        default:
          hookContent += `${task}\n`;
      }
    });

    // 确保 .husky 目录存在
    if (!fs.existsSync(this.huskyDir)) {
      fs.mkdirSync(this.huskyDir, { recursive: true });
    }

    fs.writeFileSync(hookPath, hookContent);
    fs.chmodSync(hookPath, '755');
    
    console.log(`  创建 ${hookName} hook`);
  }

  // 卸载 hooks
  async uninstallHooks() {
    console.log('🗑️ 卸载 Git hooks...');

    try {
      // 删除 .husky 目录
      if (fs.existsSync(this.huskyDir)) {
        fs.rmSync(this.huskyDir, { recursive: true, force: true });
        console.log('  删除 .husky 目录');
      }

      // 从 package.json 移除相关脚本和依赖
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // 移除 prepare 脚本
        if (packageJson.scripts?.prepare === 'husky install') {
          delete packageJson.scripts.prepare;
        }

        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('  清理 package.json');
      }

      // 删除配置文件
      const configFiles = [
        '.lintstagedrc.js',
        'commitlint.config.js',
        '.githooks.json'
      ];

      configFiles.forEach(file => {
        const filePath = path.join(this.projectRoot, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`  删除 ${file}`);
        }
      });

      console.log('✅ Git hooks 卸载完成');
    } catch (error) {
      console.error('❌ 卸载失败:', error.message);
      throw error;
    }
  }

  // 测试 hooks
  async testHooks() {
    console.log('🧪 测试 Git hooks...');

    const testResults = [];

    // 测试 pre-commit hook
    if (this.config.hooks['pre-commit']?.enabled) {
      try {
        console.log('  测试 pre-commit hook...');
        
        // 创建测试文件
        const testFile = path.join(this.projectRoot, 'test-hook.js');
        fs.writeFileSync(testFile, 'console.log("test");\n');
        
        // 添加到暂存区
        execSync('git add test-hook.js', { cwd: this.projectRoot });
        
        // 运行 lint-staged
        execSync('npx lint-staged', { 
          stdio: 'pipe',
          cwd: this.projectRoot 
        });
        
        // 清理测试文件
        execSync('git reset HEAD test-hook.js', { cwd: this.projectRoot });
        fs.unlinkSync(testFile);
        
        testResults.push({ hook: 'pre-commit', status: 'passed' });
        console.log('    ✅ pre-commit hook 测试通过');
      } catch (error) {
        testResults.push({ 
          hook: 'pre-commit', 
          status: 'failed', 
          error: error.message 
        });
        console.log('    ❌ pre-commit hook 测试失败');
      }
    }

    // 测试 commit-msg hook
    if (this.config.hooks['commit-msg']?.enabled) {
      try {
        console.log('  测试 commit-msg hook...');
        
        // 创建测试提交消息文件
        const testMsgFile = path.join(this.projectRoot, '.git', 'COMMIT_EDITMSG');
        fs.writeFileSync(testMsgFile, 'feat: test commit message');
        
        // 运行 commitlint
        execSync(`npx commitlint --edit ${testMsgFile}`, { 
          stdio: 'pipe',
          cwd: this.projectRoot 
        });
        
        testResults.push({ hook: 'commit-msg', status: 'passed' });
        console.log('    ✅ commit-msg hook 测试通过');
      } catch (error) {
        testResults.push({ 
          hook: 'commit-msg', 
          status: 'failed', 
          error: error.message 
        });
        console.log('    ❌ commit-msg hook 测试失败');
      }
    }

    console.log('\n📊 测试结果:');
    testResults.forEach(result => {
      const emoji = result.status === 'passed' ? '✅' : '❌';
      console.log(`  ${emoji} ${result.hook}: ${result.status}`);
      if (result.error) {
        console.log(`    错误: ${result.error}`);
      }
    });

    return testResults;
  }

  // 显示状态
  showStatus() {
    console.log('📊 Git Hooks 状态');
    console.log('='.repeat(40));

    // 检查 Husky
    const huskyInstalled = fs.existsSync(this.huskyDir);
    console.log(`Husky: ${huskyInstalled ? '✅ 已安装' : '❌ 未安装'}`);

    // 检查各个 hook
    Object.entries(this.config.hooks).forEach(([hookName, hookConfig]) => {
      const hookPath = path.join(this.huskyDir, hookName);
      const hookExists = fs.existsSync(hookPath);
      const status = hookConfig.enabled ? 
        (hookExists ? '✅ 已启用' : '⚠️ 已配置但未创建') : 
        '⏸️ 已禁用';
      
      console.log(`${hookName}: ${status}`);
      
      if (hookExists) {
        console.log(`  任务: ${hookConfig.tasks.join(', ')}`);
      }
    });

    // 检查配置文件
    console.log('\n配置文件:');
    const configFiles = [
      '.lintstagedrc.js',
      'commitlint.config.js',
      '.githooks.json'
    ];

    configFiles.forEach(file => {
      const exists = fs.existsSync(path.join(this.projectRoot, file));
      console.log(`  ${file}: ${exists ? '✅' : '❌'}`);
    });
  }

  // 生成配置文件
  generateConfig() {
    const configPath = path.join(this.projectRoot, '.githooks.json');
    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
    console.log(`📝 配置文件已生成: ${configPath}`);
  }
}

// CLI 入口
async function main() {
  const args = process.argv.slice(2);
  const manager = new GitHooksManager();

  if (args.length === 0 || args.includes('--help')) {
    console.log('Git Hooks 管理器');
    console.log('\n用法:');
    console.log('  node git-hooks-manager.js install    # 安装 Git hooks');
    console.log('  node git-hooks-manager.js uninstall  # 卸载 Git hooks');
    console.log('  node git-hooks-manager.js test       # 测试 hooks');
    console.log('  node git-hooks-manager.js status     # 显示状态');
    console.log('  node git-hooks-manager.js config     # 生成配置文件');
    return;
  }

  const [command] = args;

  try {
    switch (command) {
      case 'install':
        await manager.installHooks();
        break;

      case 'uninstall':
        await manager.uninstallHooks();
        break;

      case 'test':
        await manager.testHooks();
        break;

      case 'status':
        manager.showStatus();
        break;

      case 'config':
        manager.generateConfig();
        break;

      default:
        console.log('❌ 未知命令:', command);
        console.log('使用 --help 查看可用命令');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

module.exports = GitHooksManager;
