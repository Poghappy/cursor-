# Cursor 文件输出规则

**目标**：为 Cursor AI 提供明确的文件输出指导，防止常见错误

---

## 🎯 核心原则

### 1. 安全第一

- 所有文件操作前必须验证输入
- 使用 try-catch 包装所有文件操作
- 提供清晰的错误信息和恢复建议

### 2. 一致性

- 统一使用 UTF-8 编码
- 标准化文件路径处理
- 一致的错误处理模式

### 3. 可验证性

- 文件生成后必须验证内容
- 提供回滚机制
- 记录所有操作日志

---

## 📝 文件输出模板

### JavaScript/TypeScript 文件生成

```javascript
// ✅ 正确的文件生成模式
async function generateFile(filePath, content) {
  try {
    // 1. 验证输入
    if (!filePath || !content) {
      throw new Error('文件路径和内容不能为空');
    }

    // 2. 确保目录存在
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // 3. 验证内容
    validateContent(content);

    // 4. 写入文件
    await fs.writeFile(filePath, content, 'utf8');

    // 5. 验证写入结果
    const stats = await fs.stat(filePath);
    console.log(`✅ 文件生成成功: ${filePath} (${stats.size} bytes)`);

    return filePath;
  } catch (error) {
    console.error(`❌ 文件生成失败: ${error.message}`);
    throw error;
  }
}

// 内容验证函数
function validateContent(content) {
  if (typeof content !== 'string') {
    throw new Error('内容必须是字符串');
  }

  // 检查模板字符串语法
  if (content.includes('\\`') || content.includes('\\${')) {
    throw new Error('模板字符串转义错误');
  }

  // 检查未匹配的引号
  const singleQuotes = (content.match(/'/g) || []).length;
  const doubleQuotes = (content.match(/"/g) || []).length;
  const backticks = (content.match(/`/g) || []).length;

  if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0 || backticks % 2 !== 0) {
    throw new Error('引号不匹配');
  }
}
```

### Markdown 文件生成

```javascript
// ✅ Markdown 文件生成模板
async function generateMarkdownFile(filePath, title, content) {
  const markdownContent = `# ${title}

${content}

---
*生成时间: ${new Date().toISOString()}*
*文件路径: ${filePath}*
`;

  return await generateFile(filePath, markdownContent);
}
```

### JSON 文件生成

```javascript
// ✅ JSON 文件生成模板
async function generateJsonFile(filePath, data) {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    return await generateFile(filePath, jsonContent);
  } catch (error) {
    throw new Error(`JSON 序列化失败: ${error.message}`);
  }
}
```

---

## 🚫 禁止模式

### 1. 不安全的文件操作

```javascript
// ❌ 错误：直接写入，无错误处理
fs.writeFileSync(filePath, content);

// ❌ 错误：不检查目录是否存在
fs.writeFile(filePath, content, callback);

// ❌ 错误：不验证内容
await fs.writeFile(filePath, undefined);
```

### 2. 模板字符串错误

```javascript
// ❌ 错误：错误的转义
const content = \`Hello \${name}!\`;

// ❌ 错误：未终止的字符串
const message = "Hello ${name}!;

// ❌ 错误：混合引号
const text = `Hello "world'`;
```

### 3. 路径处理错误

```javascript
// ❌ 错误：硬编码路径分隔符
const path = 'folder\\file.js';

// ❌ 错误：不处理相对路径
const filePath = './file.js';

// ❌ 错误：不验证路径格式
const path = userInput; // 可能包含恶意路径
```

---

## 🔧 工具函数

### 1. 安全文件写入器

```javascript
class SafeFileWriter {
  constructor(options = {}) {
    this.encoding = options.encoding || 'utf8';
    this.backup = options.backup !== false;
    this.validate = options.validate !== false;
  }

  async write(filePath, content) {
    try {
      // 备份现有文件
      if (this.backup && (await this.fileExists(filePath))) {
        await this.backupFile(filePath);
      }

      // 验证内容
      if (this.validate) {
        this.validateContent(content);
      }

      // 确保目录存在
      await this.ensureDirectory(filePath);

      // 写入文件
      await fs.writeFile(filePath, content, this.encoding);

      // 验证写入
      await this.verifyWrite(filePath, content);

      return filePath;
    } catch (error) {
      // 恢复备份
      if (this.backup) {
        await this.restoreBackup(filePath);
      }
      throw error;
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async backupFile(filePath) {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    await fs.copyFile(filePath, backupPath);
    return backupPath;
  }

  async ensureDirectory(filePath) {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
  }

  validateContent(content) {
    if (content === null || content === undefined) {
      throw new Error('内容不能为空');
    }

    if (typeof content !== 'string') {
      throw new Error('内容必须是字符串');
    }

    // 检查控制字符
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(content)) {
      throw new Error('内容包含无效的控制字符');
    }
  }

  async verifyWrite(filePath, expectedContent) {
    const actualContent = await fs.readFile(filePath, this.encoding);
    if (actualContent !== expectedContent) {
      throw new Error('文件内容验证失败');
    }
  }
}
```

### 2. 内容生成器

```javascript
class ContentGenerator {
  static generateJavaScript(content, options = {}) {
    const header = options.header || '';
    const footer = options.footer || '';

    return `${header}${content}${footer}`;
  }

  static generateMarkdown(title, content, metadata = {}) {
    const frontmatter = metadata.frontmatter
      ? `---\n${Object.entries(metadata.frontmatter)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')}\n---\n\n`
      : '';

    return `${frontmatter}# ${title}\n\n${content}\n\n---\n*生成时间: ${new Date().toISOString()}*`;
  }

  static generateJson(data, options = {}) {
    const indent = options.indent || 2;
    return JSON.stringify(data, null, indent);
  }
}
```

---

## 📋 检查清单

### 文件生成前

- [ ] 验证文件路径格式
- [ ] 检查目标目录权限
- [ ] 确认内容不为空
- [ ] 验证模板字符串语法

### 文件生成中

- [ ] 使用 try-catch 包装
- [ ] 确保目录存在
- [ ] 使用正确的编码
- [ ] 处理并发写入

### 文件生成后

- [ ] 验证文件大小
- [ ] 检查内容完整性
- [ ] 运行 linter 检查
- [ ] 记录操作日志

---

## 🎯 Cursor AI 指导

### 当生成文件时，请遵循以下步骤：

1. **验证输入**
   - 检查文件路径是否有效
   - 确认内容不为空
   - 验证参数类型

2. **准备内容**
   - 使用正确的模板字符串语法
   - 转义特殊字符
   - 格式化内容

3. **安全写入**
   - 确保目录存在
   - 使用 UTF-8 编码
   - 处理写入错误

4. **验证结果**
   - 检查文件是否创建成功
   - 验证内容完整性
   - 提供成功确认

### 错误处理模式：

```javascript
try {
  // 文件操作
  const result = await generateFile(filePath, content);
  console.log(`✅ 成功: ${result}`);
} catch (error) {
  console.error(`❌ 失败: ${error.message}`);
  // 提供修复建议
  if (error.message.includes('模板字符串')) {
    console.log('💡 建议: 检查反引号和转义字符');
  }
  throw error;
}
```

---

**遵循这些规则，可以确保 Cursor AI 生成的文件安全、可靠、无错误！** 🎯
