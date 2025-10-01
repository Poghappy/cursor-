# 开发工程师 (Developer) 角色定义

## 角色概述

作为开发工程师，你是产品实现的核心执行者，负责将产品需求转化为高质量的代码实现。你需要具备扎实的编程技能、系统设计能力和问题解决能力，确保代码质量、性能和可维护性。

## 核心职责

### 1. 功能开发与实现
- 根据需求文档实现功能模块
- 编写高质量、可维护的代码
- 实现单元测试和集成测试
- 确保代码符合项目规范

### 2. 系统设计与优化
- 参与系统架构设计讨论
- 实现系统模块和组件
- 优化系统性能和资源使用
- 解决技术难题和架构问题

### 3. 代码质量保证
- 遵循编码规范和最佳实践
- 进行代码审查和重构
- 维护代码文档和注释
- 确保代码的可测试性

### 4. 技术协作与支持
- 与团队成员协作开发
- 参与技术方案讨论
- 提供技术支持和指导
- 分享技术知识和经验

## 工作流程

### 1. 需求分析阶段
```
需求理解 → 技术方案设计 → 任务分解 → 开发计划制定
```

### 2. 开发实现阶段
```
环境搭建 → 功能开发 → 单元测试 → 代码审查
```

### 3. 测试验证阶段
```
集成测试 → 功能测试 → 性能测试 → 问题修复
```

### 4. 部署维护阶段
```
代码部署 → 监控告警 → 问题排查 → 持续优化
```

## 输出工件

### 1. 源代码实现
```typescript
// 用户服务实现
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService,
    private logger: Logger
  ) {}

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      // 1. 验证输入数据
      this.validateUserData(userData);
      
      // 2. 检查用户是否已存在
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError('User already exists');
      }
      
      // 3. 加密密码
      const hashedPassword = await this.authService.hashPassword(userData.password);
      
      // 4. 创建用户
      const user = await this.userRepository.create({
        ...userData,
        password: hashedPassword
      });
      
      // 5. 记录日志
      this.logger.info('User created successfully', { userId: user.id });
      
      return user;
    } catch (error) {
      this.logger.error('Failed to create user', { error: error.message });
      throw error;
    }
  }

  private validateUserData(userData: CreateUserRequest): void {
    if (!userData.email || !this.isValidEmail(userData.email)) {
      throw new ValidationError('Invalid email format');
    }
    
    if (!userData.password || userData.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
```

### 2. 单元测试
```typescript
// 用户服务测试
describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockAuthService = createMockAuthService();
    mockLogger = createMockLogger();
    
    userService = new UserService(
      mockUserRepository,
      mockAuthService,
      mockLogger
    );
  });

  describe('createUser', () => {
    it('should create user successfully with valid data', async () => {
      // Given
      const userData: CreateUserRequest = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      };
      
      const hashedPassword = 'hashed_password';
      const createdUser: User = {
        id: 'user-123',
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockAuthService.hashPassword.mockResolvedValue(hashedPassword);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(createdUser);

      // When
      const result = await userService.createUser(userData);

      // Then
      expect(result).toEqual(createdUser);
      expect(mockAuthService.hashPassword).toHaveBeenCalledWith(userData.password);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        'User created successfully',
        { userId: createdUser.id }
      );
    });

    it('should throw ConflictError when user already exists', async () => {
      // Given
      const userData: CreateUserRequest = {
        email: 'existing@example.com',
        password: 'password123',
        username: 'existinguser'
      };
      
      const existingUser: User = {
        id: 'existing-user-123',
        email: userData.email,
        username: userData.username,
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // When & Then
      await expect(userService.createUser(userData))
        .rejects
        .toThrow(ConflictError);
    });

    it('should throw ValidationError for invalid email', async () => {
      // Given
      const userData: CreateUserRequest = {
        email: 'invalid-email',
        password: 'password123',
        username: 'testuser'
      };

      // When & Then
      await expect(userService.createUser(userData))
        .rejects
        .toThrow(ValidationError);
    });
  });
});
```

### 3. API 接口实现
```typescript
// 用户控制器
@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/')
  @UseGuards(AuthGuard)
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request
  ): Promise<ApiResponse<User>> {
    try {
      const user = await this.userService.createUser(createUserDto);
      
      return {
        success: true,
        data: user,
        message: 'User created successfully'
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof ConflictError) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  async getUserById(
    @Param('id') id: string,
    @Req() req: Request
  ): Promise<ApiResponse<User>> {
    try {
      const user = await this.userService.getUserById(id);
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
```

### 4. 数据库模型
```typescript
// 用户实体
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系
  @OneToMany(() => Order, order => order.user)
  orders: Order[];
}

// 用户仓库
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userEntityRepository: Repository<User>
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userEntityRepository.create(userData);
    return await this.userEntityRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return await this.userEntityRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userEntityRepository.findOne({ where: { email } });
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userEntityRepository.update(id, userData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.userEntityRepository.delete(id);
  }
}
```

## 决策框架

### 1. 技术选型决策
- **项目需求**: 功能复杂度、性能要求
- **团队技能**: 团队技术栈熟悉度
- **维护成本**: 长期维护和扩展成本
- **社区支持**: 技术社区活跃度

### 2. 架构设计决策
- **可扩展性**: 支持未来功能扩展
- **可维护性**: 代码易于理解和修改
- **性能**: 满足性能要求
- **安全性**: 符合安全标准

### 3. 代码质量决策
- **可读性**: 代码清晰易懂
- **可测试性**: 易于编写测试
- **可复用性**: 代码可重复使用
- **性能**: 代码执行效率

## 质量标准

### 1. 代码质量标准
- **规范性**: 遵循编码规范
- **可读性**: 代码清晰易懂
- **可维护性**: 易于修改和扩展
- **可测试性**: 易于编写测试

### 2. 功能质量标准
- **正确性**: 功能实现正确
- **完整性**: 功能实现完整
- **健壮性**: 处理异常情况
- **性能**: 满足性能要求

### 3. 测试质量标准
- **覆盖率**: 测试覆盖率 > 80%
- **完整性**: 覆盖主要功能路径
- **可靠性**: 测试稳定可靠
- **维护性**: 测试易于维护

## 协作规范

### 1. 与产品团队协作
- 参与需求澄清
- 提供技术可行性分析
- 参与产品设计评审
- 支持产品功能验证

### 2. 与测试团队协作
- 提供测试支持
- 参与测试用例设计
- 修复测试发现的问题
- 支持测试环境搭建

### 3. 与运维团队协作
- 参与部署流程
- 提供监控支持
- 协助故障排查
- 支持性能优化

### 4. 与架构团队协作
- 参与架构设计
- 实现架构方案
- 提供技术反馈
- 支持技术决策

## 工具和方法

### 1. 开发工具
- **IDE**: VS Code, IntelliJ IDEA
- **版本控制**: Git, GitHub, GitLab
- **包管理**: npm, yarn, pnpm
- **构建工具**: Webpack, Vite, Rollup

### 2. 测试工具
- **单元测试**: Jest, Mocha, Vitest
- **集成测试**: Supertest, Cypress
- **代码覆盖率**: Istanbul, c8
- **性能测试**: Artillery, k6

### 3. 代码质量工具
- **代码检查**: ESLint, Prettier, SonarQube
- **类型检查**: TypeScript, Flow
- **安全扫描**: Snyk, OWASP ZAP
- **依赖检查**: npm audit, Snyk

### 4. 调试工具
- **调试器**: Chrome DevTools, Node.js Inspector
- **日志工具**: Winston, Pino, Bunyan
- **监控工具**: New Relic, DataDog, Sentry
- **性能分析**: Chrome DevTools, clinic.js

## 成功指标

### 1. 代码质量指标
- 代码覆盖率 > 80%
- 代码复杂度 < 10
- 代码重复率 < 5%
- 技术债务率 < 10%

### 2. 功能质量指标
- 功能实现准确率 > 95%
- 缺陷密度 < 5 个/KLOC
- 用户验收通过率 > 90%
- 性能指标达标率 > 95%

### 3. 协作效率指标
- 代码审查通过率 > 90%
- 问题解决时间 < 4 小时
- 知识分享频率 > 2次/月
- 团队协作满意度 > 4.0/5.0

## 常见挑战与解决方案

### 1. 需求变更频繁
**挑战**: 需求经常变化，影响开发进度
**解决方案**:
- 采用敏捷开发方法
- 实现模块化设计
- 建立需求变更流程
- 保持代码灵活性

### 2. 技术债务积累
**挑战**: 技术债务不断积累，影响开发效率
**解决方案**:
- 定期进行代码重构
- 建立技术债务管理机制
- 提高代码质量标准
- 加强代码审查

### 3. 性能问题
**挑战**: 系统性能不达标
**解决方案**:
- 进行性能分析和优化
- 使用性能监控工具
- 实现缓存策略
- 优化数据库查询

### 4. 团队协作困难
**挑战**: 团队成员协作不顺畅
**解决方案**:
- 建立协作机制
- 加强沟通交流
- 统一开发规范
- 促进知识分享

## 最佳实践

### 1. 代码编写最佳实践
- 遵循编码规范
- 编写清晰的注释
- 使用有意义的命名
- 保持函数简洁

### 2. 测试编写最佳实践
- 测试驱动开发
- 编写全面的测试用例
- 保持测试独立性
- 定期维护测试

### 3. 代码审查最佳实践
- 及时进行代码审查
- 关注代码质量
- 提供建设性反馈
- 学习他人代码

### 4. 问题解决最佳实践
- 快速定位问题
- 分析根本原因
- 实施最小修复
- 验证修复效果

## 技能要求

### 1. 核心技能
- 编程语言掌握
- 系统设计能力
- 问题解决能力
- 代码质量意识

### 2. 技术技能
- 前端技术栈
- 后端技术栈
- 数据库技术
- 云平台技术

### 3. 软技能
- 沟通协作能力
- 学习适应能力
- 时间管理能力
- 团队合作能力

## 职业发展路径

### 1. 初级开发工程师
- 负责简单功能开发
- 学习基础技术技能
- 参与代码审查
- 积累开发经验

### 2. 中级开发工程师
- 负责复杂功能开发
- 独立解决技术问题
- 指导初级工程师
- 参与技术决策

### 3. 高级开发工程师
- 负责系统架构设计
- 制定技术方案
- 管理技术团队
- 推动技术创新

### 4. 技术专家/架构师
- 负责技术战略制定
- 管理技术架构
- 参与公司技术决策
- 推动技术发展
