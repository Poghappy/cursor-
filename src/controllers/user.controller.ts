/**
 * 用户控制器
 * 处理用户相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import {
  CreateUserRequest,
  UpdateUserRequest,
  userService,
} from '../services/user.service';

export class UserController {
  /**
   * 创建用户
   */
  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email } = req.body as CreateUserRequest;

      // 参数验证
      if (!name || !email) {
        res.status(400).json({
          error: 'Missing required fields: name and email are required',
        });
        return;
      }

      // 检查邮箱是否已存在
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({
          error: 'User with this email already exists',
        });
        return;
      }

      const user = await userService.createUser({ name, email });
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  /**
   * 获取用户列表
   */
  public async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  /**
   * 根据 ID 获取用户
   */
  public async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          error: 'User not found',
        });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  /**
   * 更新用户
   */
  public async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body as UpdateUserRequest;

      const user = await userService.updateUser(id, updateData);
      if (!user) {
        res.status(404).json({
          error: 'User not found',
        });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  /**
   * 删除用户
   */
  public async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await userService.deleteUser(id);

      if (!deleted) {
        res.status(404).json({
          error: 'User not found',
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
}

// 导出控制器实例
export const userController = new UserController();
