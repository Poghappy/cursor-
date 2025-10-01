# 实现阶段模板

## 阶段概述
作为资深开发工程师，请基于技术设计文档选择 1-2 个高优先级任务进行最小可用实现，包括代码实现、测试编写、质量检查和部署准备。

## 输入参数
- **任务列表**: {tasks} (如 ["TB-001", "TB-002"])
- **技术设计**: {tech_design} (通常是 docs/TECH_DESIGN.md)
- **实现约束**: 单回合 ≤ {MAX_FILES} 文件、≤ {MAX_LINES} 行
- **质量要求**: 通过 {LINT_CMD} 和 {TEST_CMD}

## 输出要求

### 1. 变更计划摘要
- 选择的任务和理由
- 实现的功能范围
- 技术实现方案
- 预期交付物

### 2. 文件树 Diff
- 新增文件列表
- 修改文件列表
- 删除文件列表
- 文件变更统计

### 3. 代码实现
- 核心业务逻辑实现
- 数据模型和接口实现
- 错误处理和验证
- 配置和环境设置

### 4. 测试实现
- 单元测试用例
- 集成测试用例
- 测试数据准备
- 测试覆盖率

### 5. 质量检查
- 代码规范检查
- 静态代码分析
- 安全扫描结果
- 性能测试结果

### 6. 部署准备
- 环境配置
- 依赖管理
- 构建脚本
- 部署说明

## 输出格式

### 变更计划摘要
```markdown
## 变更计划摘要

### 选择的任务
- **TB-001**: 项目初始化
- **TB-002**: 用户认证模块

### 实现范围
- 项目基础架构搭建
- 用户注册和登录功能
- JWT 认证机制
- 基础 API 接口

### 技术实现
- 使用 Node.js + Express 框架
- PostgreSQL 数据库
- Redis 缓存
- JWT 认证

### 预期交付物
- 可运行的后端服务
- 完整的 API 接口
- 单元测试覆盖
- 部署配置
```

### 文件树 Diff
```diff
新增文件:
+ src/
+ ├── controllers/
+ │   └── AuthController.ts
+ ├── services/
+ │   └── AuthService.ts
+ ├── models/
+ │   └── User.ts
+ ├── middleware/
+ │   └── auth.ts
+ ├── routes/
+ │   └── auth.ts
+ └── app.ts
+ tests/
+ ├── unit/
+ │   └── AuthService.test.ts
+ └── integration/
+ │   └── auth.test.ts
+ package.json
+ tsconfig.json
+ .env.example
+ docker-compose.yml
+ Dockerfile

修改文件:
- docs/TECH_DESIGN.md (更新实现状态)

删除文件:
- 无
```

### 代码实现示例

#### 1. 项目初始化 (package.json)
```json
{
  "name": "user-management-system",
  "version": "1.0.0",
  "description": "用户管理系统后端服务",
  "main": "dist/app.js",
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    "redis": "^4.6.10",
    "joi": "^17.11.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/pg": "^8.10.9",
    "@types/node": "^20.10.5",
    "@types/jest": "^29.5.8",
    "typescript": "^5.3.3",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "supertest": "^6.3.3",
    "@types/supertest": "^2.0.16",
    "nodemon": "^3.0.2",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0"
  }
}
```

#### 2. 用户模型 (src/models/User.ts)
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 隐藏敏感字段
  toJSON() {
    const { passwordHash, ...user } = this;
    return user;
  }
}
```

#### 3. 认证服务 (src/services/AuthService.ts)
```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { Logger } from '../utils/Logger';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private logger: Logger
  ) {}

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // 1. 验证输入数据
      this.validateUserData(userData);
      
      // 2. 检查用户是否已存在
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      // 3. 加密密码
      const passwordHash = await bcrypt.hash(userData.password, 12);
      
      // 4. 创建用户
      const user = await this.userRepository.create({
        ...userData,
        passwordHash
      });
      
      // 5. 生成 JWT Token
      const token = this.generateToken(user);
      
      this.logger.info('User registered successfully', { userId: user.id });
      
      return {
        token,
        user,
        expiresIn: 3600
      };
    } catch (error) {
      this.logger.error('User registration failed', { error: error.message });
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // 1. 查找用户
      const user = await this.userRepository.findByUsername(credentials.username);
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // 2. 验证密码
      const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }
      
      // 3. 生成 JWT Token
      const token = this.generateToken(user);
      
      this.logger.info('User logged in successfully', { userId: user.id });
      
      return {
        token,
        user,
        expiresIn: 3600
      };
    } catch (error) {
      this.logger.error('User login failed', { error: error.message });
      throw error;
    }
  }

  private validateUserData(userData: RegisterRequest): void {
    if (!userData.email || !this.isValidEmail(userData.email)) {
      throw new Error('Invalid email format');
    }
    
    if (!userData.password || userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    if (!userData.username || userData.username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET!, { algorithm: 'HS256' });
  }
}
```

#### 4. 认证控制器 (src/controllers/AuthController.ts)
```typescript
import { Request, Response } from 'express';
import { AuthService, RegisterRequest, LoginRequest } from '../services/AuthService';
import { Logger } from '../utils/Logger';

export class AuthController {
  constructor(
    private authService: AuthService,
    private logger: Logger
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: RegisterRequest = req.body;
      const result = await this.authService.register(userData);
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully'
      });
    } catch (error) {
      this.logger.error('Registration failed', { error: error.message });
      
      res.status(400).json({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: error.message
        }
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: LoginRequest = req.body;
      const result = await this.authService.login(credentials);
      
      res.json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error) {
      this.logger.error('Login failed', { error: error.message });
      
      res.status(401).json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: 'Invalid credentials'
        }
      });
    }
  }
}
```

#### 5. 认证路由 (src/routes/auth.ts)
```typescript
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import { Logger } from '../utils/Logger';

const router = Router();
const logger = new Logger();
const userRepository = new UserRepository();
const authService = new AuthService(userRepository, logger);
const authController = new AuthController(authService, logger);

// 用户注册
router.post('/register', (req, res) => authController.register(req, res));

// 用户登录
router.post('/login', (req, res) => authController.login(req, res));

export default router;
```

#### 6. 主应用文件 (src/app.ts)
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import { Logger } from './utils/Logger';

const app = express();
const logger = new Logger();

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// 路由
app.use('/api/auth', authRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error'
    }
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
```

### 测试实现示例

#### 1. 单元测试 (tests/unit/AuthService.test.ts)
```typescript
import { AuthService } from '../../src/services/AuthService';
import { UserRepository } from '../../src/repositories/UserRepository';
import { Logger } from '../../src/utils/Logger';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      create: jest.fn()
    } as any;
    
    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    } as any;
    
    authService = new AuthService(mockUserRepository, mockLogger);
  });

  describe('register', () => {
    it('should register user successfully with valid data', async () => {
      // Given
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const createdUser = {
        id: 'user-123',
        username: userData.username,
        email: userData.email,
        passwordHash: 'hashed_password',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(createdUser);

      // When
      const result = await authService.register(userData);

      // Then
      expect(result.token).toBeDefined();
      expect(result.user).toEqual(createdUser);
      expect(result.expiresIn).toBe(3600);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'User registered successfully',
        { userId: createdUser.id }
      );
    });

    it('should throw error when user already exists', async () => {
      // Given
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const existingUser = {
        id: 'existing-user-123',
        username: userData.username,
        email: userData.email,
        passwordHash: 'hashed_password',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // When & Then
      await expect(authService.register(userData))
        .rejects
        .toThrow('User already exists');
    });

    it('should throw error for invalid email format', async () => {
      // Given
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      // When & Then
      await expect(authService.register(userData))
        .rejects
        .toThrow('Invalid email format');
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      // Given
      const credentials = {
        username: 'testuser',
        password: 'password123'
      };
      
      const user = {
        id: 'user-123',
        username: credentials.username,
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.findByUsername.mockResolvedValue(user);
      // Mock bcrypt.compare to return true
      jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(true);

      // When
      const result = await authService.login(credentials);

      // Then
      expect(result.token).toBeDefined();
      expect(result.user).toEqual(user);
      expect(result.expiresIn).toBe(3600);
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(credentials.username);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'User logged in successfully',
        { userId: user.id }
      );
    });

    it('should throw error for invalid credentials', async () => {
      // Given
      const credentials = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      mockUserRepository.findByUsername.mockResolvedValue(null);

      // When & Then
      await expect(authService.login(credentials))
        .rejects
        .toThrow('Invalid credentials');
    });
  });
});
```

#### 2. 集成测试 (tests/integration/auth.test.ts)
```typescript
import request from 'supertest';
import app from '../../src/app';

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.user.email).toBe(userData.email);
    });

    it('should return error for invalid email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('REGISTRATION_FAILED');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      // First register a user
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Then login
      const credentials = {
        username: 'testuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.username).toBe(credentials.username);
    });

    it('should return error for invalid credentials', async () => {
      const credentials = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('LOGIN_FAILED');
    });
  });
});
```

### 质量检查结果

#### 1. 代码规范检查
```bash
$ npm run lint
✅ ESLint 检查通过
✅ 代码格式符合规范
✅ 无语法错误
```

#### 2. 测试执行结果
```bash
$ npm test
✅ 单元测试通过: 8/8
✅ 集成测试通过: 4/4
✅ 测试覆盖率: 85%
```

#### 3. 构建结果
```bash
$ npm run build
✅ TypeScript 编译成功
✅ 无类型错误
✅ 输出文件生成成功
```

### 部署准备

#### 1. 环境配置 (.env.example)
```env
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/user_management
REDIS_URL=redis://localhost:6379

# JWT 配置
JWT_SECRET=your-secret-key-here

# 服务器配置
PORT=3000
NODE_ENV=development

# 日志配置
LOG_LEVEL=info
```

#### 2. Docker 配置 (Dockerfile)
```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

#### 3. Docker Compose 配置 (docker-compose.yml)
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/user_management
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret-key-here
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=user_management
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 质量检查清单

### 代码实现质量
- [ ] 代码结构清晰
- [ ] 错误处理完善
- [ ] 输入验证充分
- [ ] 日志记录完整

### 测试质量
- [ ] 单元测试覆盖率高
- [ ] 集成测试完整
- [ ] 测试用例质量好
- [ ] 测试数据准备充分

### 代码规范质量
- [ ] 遵循编码规范
- [ ] 类型定义完整
- [ ] 注释清晰准确
- [ ] 代码可读性好

### 部署质量
- [ ] 环境配置完整
- [ ] 依赖管理正确
- [ ] 构建脚本可用
- [ ] 部署文档清晰

## 交接要求

### 交接 JSON 格式
```json
{
  "inputs": {
    "tasks": ["TB-001", "TB-002"],
    "tech_design": "docs/TECH_DESIGN.md",
    "notes": "完成项目初始化和用户认证模块实现"
  },
  "decisions": [
    {
      "topic": "技术实现方案",
      "choice": "使用 Node.js + Express + PostgreSQL + Redis",
      "rationale": "技术栈成熟，团队熟悉度高"
    },
    {
      "topic": "测试策略",
      "choice": "单元测试 + 集成测试",
      "rationale": "确保代码质量和功能正确性"
    }
  ],
  "artifacts": [
    {
      "path": "src/",
      "summary": "后端服务源代码，包含认证模块"
    },
    {
      "path": "tests/",
      "summary": "单元测试和集成测试"
    },
    {
      "path": "package.json",
      "summary": "项目依赖和脚本配置"
    },
    {
      "path": "docker-compose.yml",
      "summary": "本地开发环境配置"
    }
  ],
  "risks": [
    {
      "name": "数据库连接问题",
      "impact": "可能影响功能测试",
      "mitigation": "提供详细的数据库配置说明"
    }
  ],
  "next_role": "QA",
  "next_instruction": "调用 generate_qa_test 函数，基于实现进行质量测试"
}
```

### 下一步行动
1. 将实现代码保存到相应目录
2. 运行质量检查命令
3. 输出交接 JSON
4. 等待 QA 角色调用 `generate_qa_test` 函数

## 注意事项

### 实现原则
- **最小可用**: 实现核心功能，避免过度设计
- **质量优先**: 确保代码质量和测试覆盖
- **可维护性**: 代码结构清晰，易于维护
- **可扩展性**: 为未来功能扩展预留空间

### 测试原则
- **测试驱动**: 先写测试，后写实现
- **全面覆盖**: 覆盖正常和异常场景
- **独立测试**: 测试用例相互独立
- **快速反馈**: 测试执行快速，反馈及时

### 代码质量原则
- **清晰性**: 代码意图清晰明确
- **简洁性**: 避免不必要的复杂性
- **一致性**: 保持代码风格一致
- **文档化**: 重要逻辑有注释说明

### 部署原则
- **环境隔离**: 开发、测试、生产环境隔离
- **配置管理**: 使用环境变量管理配置
- **容器化**: 使用 Docker 标准化部署
- **监控告警**: 部署后监控系统状态
