/**
 * 用户路由
 * 定义用户相关的 API 端点
 */

import { Router } from 'express';
import { userController } from '../controllers/user.controller';

const router = Router();

// 用户路由
router.post('/users', userController.createUser.bind(userController));
router.get('/users', userController.getUsers.bind(userController));
router.get('/users/:id', userController.getUserById.bind(userController));
router.put('/users/:id', userController.updateUser.bind(userController));
router.delete('/users/:id', userController.deleteUser.bind(userController));

export default router;
