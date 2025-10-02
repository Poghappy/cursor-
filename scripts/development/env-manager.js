#!/usr/bin/env node

/**
 * 环境变量管理器
 * 管理不同环境的配置文件，支持加密敏感信息
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

class EnvManager {
  constructor() {
    this.projectRoot = process.cwd();
    this.envDir = path.join(this.projectRoot, 'env');
    this.templateFile = path.join(this.envDir, '.env.template');
    this.secretsFile = path.join(this.envDir, '.env.secrets');
    this.algorithm = 'aes-256-gcm';
    
    // 确保 env 目录存在
    if (!fs.existsSync(this.envDir)) {
      fs.mkdirSync(this.envDir, { recursive: true });
    }
  }

  /**
   * 初始化环境配置
   */
  async init() {
    console.log('🚀 初始化环境配置...');

    // 创建 .env.template
    await this.createTemplate();
    
    // 创建不同环境的配置文件
    const environments = ['development', 'staging', 'production'];
    
    for (const env of environments) {
      await this.createEnvFile(env);
    }

    // 创建 .gitignore 规则
    await this.updateGitignore();

    console.log('✅ 环境配置初始化完成');
    console.log('\n📝 下一步:');
    console.log('1. 编辑 env/.env.template 定义所需的环境变量');
    console.log('2. 使用 node env-manager.js set <env> <key> <value> 设置变量');
    console.log('3. 使用 node env-manager.js encrypt <env> 加密敏感信息');
  }

  /**
   * 创建环境变量模板
   */
  async createTemplate() {
    if (fs.existsSync(this.templateFile)) {
      console.log('  .env.template 已存在');
      return;
    }

    const template = `# 环境变量模板`
# 复制此文件并重命名为 .env.development, .env.staging, .env.production
# 然后填入相应的值

# 应用配置
NODE_ENV=development
PORT=3000
HOST=localhost

# 数据库配置
DATABASE_URL=
DATABASE_HOST=
DATABASE_PORT=
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=

# API 密钥 (敏感信息，建议加密)
API_KEY=
SECRET_KEY=
JWT_SECRET=

# 第三方服务
REDIS_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# 云服务
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=

# 监控和日志
LOG_LEVEL=info
SENTRY_DSN=

# 功能开关
FEATURE_FLAG_NEW_UI=false
FEATURE_FLAG_BETA_API=false
`;`

    fs.writeFileSync(this.templateFile, template);
    console.log('  创建 .env.template');
  }

  /**
   * 创建环境配置文件
   */
  async createEnvFile(environment) {
    const envFile = path.join(this.envDir, `.env.${environment}`);
    
    if (fs.existsSync(envFile)) {
      console.log(`  .env.${environment} 已存在`);
      return;
    }

    // 从模板复制并设置默认值
    let content = fs.readFileSync(this.templateFile, 'utf8');
    
    // 根据环境设置不同的默认值
    switch (environment) {
      case 'development':
        content = content.replace('NODE_ENV=development', 'NODE_ENV=development');
        content = content.replace('PORT=3000', 'PORT=3000');
        content = content.replace('LOG_LEVEL=info', 'LOG_LEVEL=debug');
        break;
      case 'staging':
        content = content.replace('NODE_ENV=development', 'NODE_ENV=staging');
        content = content.replace('PORT=3000', 'PORT=8080');
        content = content.replace('LOG_LEVEL=info', 'LOG_LEVEL=info');
        break;
      case 'production':
        content = content.replace('NODE_ENV=development', 'NODE_ENV=production');
        content = content.replace('PORT=3000', 'PORT=80');
        content = content.replace('LOG_LEVEL=info', 'LOG_LEVEL=warn');
        break;
    }

    fs.writeFileSync(envFile, content);
    console.log(`  创建 .env.${environment}`);
  }

  /**
   * 更新 .gitignore
   */
  async updateGitignore() {
    const gitignorePath = path.join(this.projectRoot, '.gitignore');
    let gitignoreContent = '';
    
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }

    const envRules = [
      '# Environment variables',
      '.env',
      '.env.local',
      '.env.*.local',
      'env/.env.development',
      'env/.env.staging', 
      'env/.env.production',
      'env/.env.secrets',
      ''
    ];

    // 检查是否已存在环境变量规则
    if (!gitignoreContent.includes('env/.env.development')) {
      gitignoreContent += '\n' + envRules.join('\n');
      fs.writeFileSync(gitignorePath, gitignoreContent);
      console.log('  更新 .gitignore');
    }
  }

  /**
   * 设置环境变量
   */
  async setVar(environment, key, value, isSecret = false) {
    const envFile = path.join(this.envDir, `.env.${environment}`);
    
    if (!fs.existsSync(envFile)) {
      throw new Error(`环境文件不存在: .env.${environment}`);
    }

    let content = fs.readFileSync(envFile, 'utf8');
    const lines = content.split('\n');
    
    // 查找并更新现有变量，或添加新变量
    let found = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith(`${key}=`)) {
        lines[i] = `${key}=${value}`;
        found = true;
        break;
      }
    }
    
    if (!found) {
      lines.push(`${key}=${value}`);
    }

    fs.writeFileSync(envFile, lines.join('\n'));
    
    if (isSecret) {
      console.log(`🔐 设置敏感变量 ${key} 到 ${environment} 环境`);
    } else {
      console.log(`✅ 设置变量 ${key}=${value} 到 ${environment} 环境`);
    }
  }

  /**
   * 获取环境变量
   */
  getVar(environment, key) {
    const envFile = path.join(this.envDir, `.env.${environment}`);
    
    if (!fs.existsSync(envFile)) {
      throw new Error(`环境文件不存在: .env.${environment}`);
    }

    const content = fs.readFileSync(envFile, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.startsWith(`${key}=`)) {
        return line.substring(key.length + 1);
      }
    }
    
    return null;
  }

  /**
   * 列出环境变量
   */
  listVars(environment) {
    const envFile = path.join(this.envDir, `.env.${environment}`);
    
    if (!fs.existsSync(envFile)) {
      throw new Error(`环境文件不存在: .env.${environment}`);
    }

    console.log(`📋 ${environment} 环境变量:`);
    console.log('='.repeat(40));

    const content = fs.readFileSync(envFile, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=');
        
        // 隐藏敏感信息
        const sensitiveKeys = ['PASSWORD', 'SECRET', 'KEY', 'TOKEN'];
        const isSensitive = sensitiveKeys.some(keyword => 
          key.toUpperCase().includes(keyword)
        );
        
        const displayValue = isSensitive && value ? 
          '*'.repeat(Math.min(value.length, 8)) : value;
        
        console.log(`${key}=${displayValue}`);
      }
    }
  }

  /**
   * 加密敏感环境变量
   */
  async encryptSecrets(environment) {
    console.log(`🔐 加密 ${environment} 环境的敏感变量...`);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const password = await new Promise(resolve => {
      rl.question('请输入加密密码: ', (answer) => {
        resolve(answer);
      });
    });

    rl.close();

    const envFile = path.join(this.envDir, `.env.${environment}`);
    const encryptedFile = path.join(this.envDir, `.env.${environment}.encrypted`);
    
    if (!fs.existsSync(envFile)) {
      throw new Error(`环境文件不存在: .env.${environment}`);
    }

    const content = fs.readFileSync(envFile, 'utf8');
    
    // 生成密钥
    const key = crypto.scryptSync(password, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    // 加密
    const cipher = crypto.createCipher(this.algorithm, key);
    let encrypted = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // 保存加密文件
    const encryptedData = {
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      data: encrypted
    };
    
    fs.writeFileSync(encryptedFile, JSON.stringify(encryptedData, null, 2));
    
    console.log(`✅ 环境变量已加密保存到: .env.${environment}.encrypted`);
    console.log('⚠️  请安全保管加密密码，丢失后无法恢复');
  }

  /**
   * 解密敏感环境变量
   */
  async decryptSecrets(environment) {
    console.log(`🔓 解密 ${environment} 环境的敏感变量...`);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const password = await new Promise(resolve => {
      rl.question('请输入解密密码: ', (answer) => {
        resolve(answer);
      });
    });

    rl.close();

    const encryptedFile = path.join(this.envDir, `.env.${environment}.encrypted`);
    
    if (!fs.existsSync(encryptedFile)) {
      throw new Error(`加密文件不存在: .env.${environment}.encrypted`);
    }

    const encryptedData = JSON.parse(fs.readFileSync(encryptedFile, 'utf8'));
    
    // 生成密钥
    const key = crypto.scryptSync(password, 'salt', 32);
    
    try {
      // 解密
      const decipher = crypto.createDecipher(this.algorithm, key);
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // 保存解密文件
      const envFile = path.join(this.envDir, `.env.${environment}`);
      fs.writeFileSync(envFile, decrypted);
      
      console.log(`✅ 环境变量已解密保存到: .env.${environment}`);
    } catch (error) {
      throw new Error('解密失败，请检查密码是否正确');
    }
  }

  /**
   * 验证环境配置
   */
  validateEnv(environment) {
    console.log(`🔍 验证 ${environment} 环境配置...`);

    const envFile = path.join(this.envDir, `.env.${environment}`);
    
    if (!fs.existsSync(envFile)) {
      throw new Error(`环境文件不存在: .env.${environment}`);
    }

    const content = fs.readFileSync(envFile, 'utf8');
    const lines = content.split('\n');
    
    const issues = [];
    const variables = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line || line.startsWith('#')) continue;
      
      if (!line.includes('=')) {
        issues.push(`第 ${i + 1} 行: 格式错误 - ${line}`);
        continue;
      }
      
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      
      // 检查变量名格式
      if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) {
        issues.push(`第 ${i + 1} 行: 变量名格式不规范 - ${key}`);
      }
      
      // 检查是否有空值
      if (!value) {
        issues.push(`第 ${i + 1} 行: 变量值为空 - ${key}`);
      }
      
      // 检查重复定义
      if (variables[key]) {
        issues.push(`第 ${i + 1} 行: 重复定义变量 - ${key}`);
      }
      
      variables[key] = value;
    }

    // 检查必需的变量
    const requiredVars = ['NODE_ENV', 'PORT'];
    for (const reqVar of requiredVars) {
      if (!variables[reqVar]) {
        issues.push(`缺少必需变量: ${reqVar}`);
      }
    }

    if (issues.length === 0) {
      console.log('✅ 环境配置验证通过');
      console.log(`📊 共 ${Object.keys(variables).length} 个环境变量`);
    } else {
      console.log('❌ 环境配置验证失败:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    }

    return issues.length === 0;
  }

  /**
   * 比较不同环境的配置
   */
  compareEnvs(env1, env2) {
    console.log(`🔍 比较 ${env1} 和 ${env2} 环境配置...`);

    const getEnvVars = (env) => {
      const envFile = path.join(this.envDir, `.env.${env}`);
      if (!fs.existsSync(envFile)) {
        throw new Error(`环境文件不存在: .env.${env}`);
      }

      const content = fs.readFileSync(envFile, 'utf8');
      const vars = {};
      
      content.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#') && line.includes('=')) {
          const [key, ...valueParts] = line.split('=');
          vars[key] = valueParts.join('=');
        }
      });
      
      return vars;
    };

    const vars1 = getEnvVars(env1);
    const vars2 = getEnvVars(env2);
    
    const allKeys = new Set([...Object.keys(vars1), ...Object.keys(vars2)]);
    
    console.log('\n📊 配置差异:');
    console.log('='.repeat(60));
    console.log(`| 变量名 | ${env1} | ${env2} | 状态 |`);
    console.log('|--------|--------|--------|------|');
    
    for (const key of allKeys) {
      const val1 = vars1[key] || '';
      const val2 = vars2[key] || '';
      
      let status = '';
      if (!vars1[key]) status = `仅在 ${env2}`;
      else if (!vars2[key]) status = `仅在 ${env1}`;
      else if (val1 !== val2) status = '不同';
      else status = '相同';
      
      // 隐藏敏感信息
      const sensitiveKeys = ['PASSWORD', 'SECRET', 'KEY', 'TOKEN'];
      const isSensitive = sensitiveKeys.some(keyword => 
        key.toUpperCase().includes(keyword)
      );
      
      const displayVal1 = isSensitive && val1 ? '***' : val1;
      const displayVal2 = isSensitive && val2 ? '***' : val2;
      
      console.log(`| ${key} | ${displayVal1} | ${displayVal2} | ${status} |`);
    }
  }

  /**
   * 生成环境配置文档
   */
  generateDocs() {
    console.log('📝 生成环境配置文档...');

    const docsPath = path.join(this.projectRoot, 'docs', 'ENV_CONFIG.md');
    
    let docs = `# 环境配置文档`

## 概述

本项目使用分环境配置管理，支持开发、测试、生产等多个环境。

## 文件结构

```
env/
├── .env.template          # 环境变量模板
├── .env.development       # 开发环境配置
├── .env.staging          # 测试环境配置
├── .env.production       # 生产环境配置
└── .env.secrets          # 加密的敏感信息
```

## 使用方法

### 1. 初始化配置

```bash`
node scripts/development/env-manager.js init
```

### 2. 设置环境变量

```bash`
# 设置普通变量
node scripts/development/env-manager.js set development PORT 3000

# 设置敏感变量
node scripts/development/env-manager.js set production DATABASE_PASSWORD secret123 --secret
```

### 3. 查看环境变量

```bash`
node scripts/development/env-manager.js list development
```

### 4. 验证配置

```bash`
node scripts/development/env-manager.js validate production
```

### 5. 加密敏感信息

```bash`
node scripts/development/env-manager.js encrypt production
```

## 环境变量说明

`;`

    // 读取模板文件并解析变量说明
    if (fs.existsSync(this.templateFile)) {
      const template = fs.readFileSync(this.templateFile, 'utf8');
      const lines = template.split('\n');
      
      let currentSection = '';
      
      for (const line of lines) {
        if (line.startsWith('# ') && !line.includes('环境变量模板')) {
          currentSection = line.substring(2);
          docs += `### ${currentSection}\n\n`;
        } else if (line.includes('=') && !line.startsWith('#')) {
          const [key] = line.split('=');
          docs += `- **${key}**: \n`;
        }
      }
    }

    docs += `
## 安全注意事项

1. **永远不要**将 `.env.*` 文件提交到版本控制系统
2. 使用加密功能保护敏感信息
3. 定期轮换密钥和密码
4. 在生产环境中使用环境变量注入而非文件

## 最佳实践

1. 使用描述性的变量名
2. 为每个变量添加注释说明
3. 定期验证配置完整性
4. 建立配置变更审批流程
`;

    // 确保 docs 目录存在
    const docsDir = path.dirname(docsPath);
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    fs.writeFileSync(docsPath, docs);
    console.log(`✅ 文档已生成: ${docsPath}`);
  }
}

// CLI 入口
async function main() {
  const args = process.argv.slice(2);
  const manager = new EnvManager();

  if (args.length === 0 || args.includes('--help')) {
    console.log('环境变量管理器');
    console.log('\n用法:');
    console.log('  node env-manager.js init                              # 初始化环境配置');
    console.log('  node env-manager.js set <env> <key> <value> [--secret] # 设置环境变量');
    console.log('  node env-manager.js get <env> <key>                   # 获取环境变量');
    console.log('  node env-manager.js list <env>                        # 列出环境变量');
    console.log('  node env-manager.js validate <env>                    # 验证环境配置');
    console.log('  node env-manager.js compare <env1> <env2>             # 比较环境配置');
    console.log('  node env-manager.js encrypt <env>                     # 加密敏感变量');
    console.log('  node env-manager.js decrypt <env>                     # 解密敏感变量');
    console.log('  node env-manager.js docs                              # 生成配置文档');
    return;
  }

  const [command, ...params] = args;

  try {
    switch (command) {
      case 'init':
        await manager.init();
        break;

      case 'set':
        if (params.length < 3) {
          throw new Error('用法: set <env> <key> <value> [--secret]');
        }
        const isSecret = params.includes('--secret');
        await manager.setVar(params[0], params[1], params[2], isSecret);
        break;

      case 'get':
        if (params.length < 2) {
          throw new Error('用法: get <env> <key>');
        }
        const value = manager.getVar(params[0], params[1]);
        console.log(value || '(未设置)');
        break;

      case 'list':
        if (params.length < 1) {
          throw new Error('用法: list <env>');
        }
        manager.listVars(params[0]);
        break;

      case 'validate':
        if (params.length < 1) {
          throw new Error('用法: validate <env>');
        }
        manager.validateEnv(params[0]);
        break;

      case 'compare':
        if (params.length < 2) {
          throw new Error('用法: compare <env1> <env2>');
        }
        manager.compareEnvs(params[0], params[1]);
        break;

      case 'encrypt':
        if (params.length < 1) {
          throw new Error('用法: encrypt <env>');
        }
        await manager.encryptSecrets(params[0]);
        break;

      case 'decrypt':
        if (params.length < 1) {
          throw new Error('用法: decrypt <env>');
        }
        await manager.decryptSecrets(params[0]);
        break;

      case 'docs':
        manager.generateDocs();
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

module.exports = EnvManager;
