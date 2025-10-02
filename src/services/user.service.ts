/**
 * 用户服务
 * 处理用户相关的业务逻辑
 */

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export class UserService {
  private users: Map<string, User> = new Map();

  /**
   * 创建新用户
   */
  public async createUser(request: CreateUserRequest): Promise<User> {
    const id = this.generateId();
    const now = new Date();

    const user: User = {
      id,
      name: request.name,
      email: request.email,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, user);
    return user;
  }

  /**
   * 根据 ID 获取用户
   */
  public async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  /**
   * 根据邮箱获取用户
   */
  public async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  /**
   * 更新用户信息
   */
  public async updateUser(
    id: string,
    request: UpdateUserRequest
  ): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }

    const updatedUser: User = {
      ...user,
      ...request,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  /**
   * 删除用户
   */
  public async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  /**
   * 获取所有用户
   */
  public async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出单例实例
export const userService = new UserService();
