#!/usr/bin/env node

/**
 * 环境检查脚本
 * 检查必要的环境变量和系统依赖
 */

const fs = require('fs');
const path = require('path');

// 必需的环境变量
const REQUIRED_ENV_VARS = ['NODE_ENV'];

// 可选的环境变量
const OPTIONAL_ENV_VARS = ['PORT', 'DATABASE_URL', 'REDIS_URL', 'JWT_SECRET'];

/**
 * 检查环境变量
 */
function checkEnvironmentVariables() {
  console.log('🔍 检查环境变量...');

  const missing = [];
  const warnings = [];

  // 检查必需的环境变量
  REQUIRED_ENV_VARS.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      console.log(`✅ ${varName}: ${process.env[varName]}`);
    }
  });

  // 检查可选的环境变量
  OPTIONAL_ENV_VARS.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
    } else {
      console.log(`✅ ${varName}: ${process.env[varName]}`);
    }
  });

  if (missing.length > 0) {
    console.error('❌ 缺少必需的环境变量:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    return false;
  }

  if (warnings.length > 0) {
    console.warn('⚠️  未设置的可选环境变量:');
    warnings.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
  }

  return true;
}

/**
 * 检查 Node.js 版本
 */
function checkNodeVersion() {
  console.log('🔍 检查 Node.js 版本...');

  const currentVersion = process.version;
  const requiredVersion = '18.0.0';

  console.log(`当前版本: ${currentVersion}`);
  console.log(`要求版本: >= ${requiredVersion}`);

  const current = currentVersion.slice(1).split('.').map(Number);
  const required = requiredVersion.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (current[i] > required[i]) {
      console.log('✅ Node.js 版本符合要求');
      return true;
    }
    if (current[i] < required[i]) {
      console.error('❌ Node.js 版本过低');
      return false;
    }
  }

  console.log('✅ Node.js 版本符合要求');
  return true;
}

/**
 * 检查必要文件
 */
function checkRequiredFiles() {
  console.log('🔍 检查必要文件...');

  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'src/app.ts',
    '.env.example',
  ];

  const missing = [];

  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      missing.push(file);
    }
  });

  if (missing.length > 0) {
    console.error('❌ 缺少必要文件:');
    missing.forEach(file => {
      console.error(`   - ${file}`);
    });
    return false;
  }

  return true;
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始环境检查...\n');

  const checks = [
    checkNodeVersion,
    checkRequiredFiles,
    checkEnvironmentVariables,
  ];

  let allPassed = true;

  checks.forEach((check, index) => {
    const passed = check();
    allPassed = allPassed && passed;

    if (index < checks.length - 1) {
      console.log('');
    }
  });

  console.log('\n' + '='.repeat(50));

  if (allPassed) {
    console.log('✅ 所有检查通过！环境配置正确。');
    process.exit(0);
  } else {
    console.log('❌ 环境检查失败！请修复上述问题。');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironmentVariables,
  checkNodeVersion,
  checkRequiredFiles,
};
