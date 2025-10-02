# 文件输出标准规范

**目标**：防止文件输出错误，确保代码质量和一致性

---

## 🚨 常见文件输出错误类型

### 1. 语法错误

- **模板字符串错误**：反斜杠转义问题
- **未终止的字符串**：引号不匹配
- **无效字符**：特殊字符编码问题

### 2. 编码问题

- **字符编码不一致**：UTF-8 vs 其他编码
- **特殊字符处理**：emoji、中文标点符号
- **换行符问题**：Windows vs Unix 换行符

### 3. 文件路径问题

- **路径分隔符**：Windows vs Unix 路径
- **相对路径错误**：路径解析失败
- **文件权限**：读写权限不足

---

## 📋 文件输出检查清单

### 创建文件前

- [ ] 检查目标目录是否存在
- [ ] 验证文件路径格式正确
- [ ] 确认文件权限设置
- [ ] 检查字符编码设置

### 写入内容时

- [ ] 验证模板字符串语法
- [ ] 检查特殊字符转义
- [ ] 确认字符串终止符
- [ ] 验证换行符格式

### 文件生成后

- [ ] 运行 linter 检查
- [ ] 验证文件可读性
- [ ] 检查文件大小合理
- [ ] 确认内容完整性

---

## 🛠️ 防错机制

### 1. 模板字符串规范

**正确写法**：

```javascript
// 使用反引号，正确转义
const content = `Hello ${name}!
This is a multi-line string.
Special chars: \${variable}`;

// 字符串拼接
const message = 'Hello ' + name + '!';
```

**错误写法**：

```javascript
// ❌ 错误的转义
const content = \`Hello \${name}!\`;

// ❌ 未终止的字符串
const message = "Hello ${name}!;
```

### 2. 文件写入规范

**安全写入**：

```javascript
const fs = require('fs').promises;
const path = require('path');

async function safeWriteFile(filePath, content) {
  try {
    // 确保目录存在
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // 写入文件
    await fs.writeFile(filePath, content, 'utf8');

    // 验证写入成功
    const stats = await fs.stat(filePath);
    console.log(`✅ 文件写入成功: ${filePath} (${stats.size} bytes)`);
  } catch (error) {
    console.error(`❌ 文件写入失败: ${error.message}`);
    throw error;
  }
}
```

### 3. 内容验证

**内容检查**：

```javascript
function validateContent(content) {
  const checks = {
    isEmpty: !content || content.trim().length === 0,
    hasInvalidChars: /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(content),
    hasUnmatchedQuotes: (content.match(/"/g) || []).length % 2 !== 0,
    hasUnmatchedBraces: (content.match(/\{/g) || []).length !== (content.match(/\}/g) || []).length,
  };

  const errors = Object.entries(checks)
    .filter(([_, hasError]) => hasError)
    .map(([check, _]) => check);

  if (errors.length > 0) {
    throw new Error(`内容验证失败: ${errors.join(', ')}`);
  }

  return true;
}
```

---

## 🔧 自动化工具

### 1. 文件输出验证器

**创建验证脚本**：

```bash
#!/bin/bash
# scripts/validate-file-output.sh

FILE_PATH="$1"
CONTENT="$2"

echo "🔍 验证文件输出..."

# 检查文件路径
if [[ ! "$FILE_PATH" =~ ^[a-zA-Z0-9/._-]+$ ]]; then
    echo "❌ 无效的文件路径: $FILE_PATH"
    exit 1
fi

# 检查内容
if [[ -z "$CONTENT" ]]; then
    echo "❌ 内容为空"
    exit 1
fi

# 检查特殊字符
if echo "$CONTENT" | grep -q '[[:cntrl:]]'; then
    echo "❌ 包含控制字符"
    exit 1
fi

echo "✅ 文件输出验证通过"
```

### 2. 预提交钩子

**Git 钩子检查**：

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 运行文件输出检查..."

# 检查 JavaScript 文件
for file in $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts)$'); do
    echo "检查 $file..."

    # 运行 linter
    if ! npx eslint "$file"; then
        echo "❌ $file 存在 lint 错误"
        exit 1
    fi

    # 检查语法
    if ! node -c "$file"; then
        echo "❌ $file 存在语法错误"
        exit 1
    fi
done

echo "✅ 所有文件检查通过"
```

### 3. 文件生成模板

**安全文件生成器**：

```javascript
class SafeFileGenerator {
  constructor(options = {}) {
    this.encoding = options.encoding || 'utf8';
    this.validateContent = options.validateContent !== false;
    this.createDirs = options.createDirs !== false;
  }

  async generateFile(filePath, content, options = {}) {
    try {
      // 验证输入
      this.validateInputs(filePath, content);

      // 验证内容
      if (this.validateContent) {
        this.validateContent(content);
      }

      // 创建目录
      if (this.createDirs) {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
      }

      // 写入文件
      await fs.writeFile(filePath, content, this.encoding);

      // 验证写入
      await this.verifyFile(filePath, content);

      console.log(`✅ 文件生成成功: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error(`❌ 文件生成失败: ${error.message}`);
      throw error;
    }
  }

  validateInputs(filePath, content) {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('文件路径无效');
    }

    if (content === undefined || content === null) {
      throw new Error('内容不能为空');
    }
  }

  async verifyFile(filePath, expectedContent) {
    const actualContent = await fs.readFile(filePath, this.encoding);
    if (actualContent !== expectedContent) {
      throw new Error('文件内容验证失败');
    }
  }
}
```

---

## 📊 错误监控

### 1. 错误日志

**记录文件输出错误**：

```javascript
class FileOutputLogger {
  constructor(logFile = 'logs/file-output-errors.log') {
    this.logFile = logFile;
  }

  logError(error, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name,
      },
      context: {
        filePath: context.filePath,
        operation: context.operation,
        contentLength: context.content?.length,
      },
    };

    fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
  }
}
```

### 2. 错误统计

**生成错误报告**：

```javascript
function generateErrorReport() {
  const errors = fs
    .readFileSync('logs/file-output-errors.log', 'utf8')
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));

  const stats = {
    totalErrors: errors.length,
    errorTypes: {},
    commonIssues: {},
    timeRange: {
      first: errors[0]?.timestamp,
      last: errors[errors.length - 1]?.timestamp,
    },
  };

  errors.forEach(error => {
    const type = error.error.type;
    stats.errorTypes[type] = (stats.errorTypes[type] || 0) + 1;

    const issue = error.error.message;
    stats.commonIssues[issue] = (stats.commonIssues[issue] || 0) + 1;
  });

  return stats;
}
```

---

## 🎯 最佳实践

### 1. 开发阶段

- 使用 TypeScript 严格模式
- 启用所有 ESLint 规则
- 使用 Prettier 格式化代码
- 定期运行 linter 检查

### 2. 测试阶段

- 为文件生成功能编写单元测试
- 测试各种边界情况
- 验证错误处理机制
- 检查文件内容完整性

### 3. 部署阶段

- 使用预提交钩子检查
- 运行完整的 lint 和测试
- 验证文件输出功能
- 监控错误日志

### 4. 维护阶段

- 定期检查错误日志
- 更新 linter 规则
- 优化文件生成性能
- 改进错误处理机制

---

## ⚠️ 紧急修复

### 常见错误快速修复

**模板字符串错误**：

```bash
# 查找并修复模板字符串问题
grep -r "\\`" scripts/ --include="*.js" | while read line; do
    echo "修复: $line"
    # 手动修复或使用 sed 命令
done
```

**编码问题**：

```bash
# 转换文件编码
find . -name "*.js" -exec file {} \; | grep -v "UTF-8" | while read file; do
    iconv -f $(file -bi "$file" | cut -d= -f2) -t UTF-8 "$file" > "$file.tmp"
    mv "$file.tmp" "$file"
done
```

**路径问题**：

```bash
# 标准化路径分隔符
find . -name "*.js" -exec sed -i 's|\\|/|g' {} \;
```

---

**遵循这些标准，可以有效防止文件输出错误，提高代码质量和可靠性！** 🎯
