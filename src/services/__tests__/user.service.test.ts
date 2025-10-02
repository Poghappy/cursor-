/**
 * 用户服务单元测试
 */

import { CreateUserRequest, UserService } from '../user.service';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const user = await userService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate unique IDs for different users', async () => {
      const user1 = await userService.createUser({
        name: 'User 1',
        email: 'user1@example.com',
      });

      const user2 = await userService.createUser({
        name: 'User 2',
        email: 'user2@example.com',
      });

      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const userData: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const createdUser = await userService.createUser(userData);
      const foundUser = await userService.getUserById(createdUser.id);

      expect(foundUser).toEqual(createdUser);
    });

    it('should return null when user not found', async () => {
      const user = await userService.getUserById('non-existent-id');
      expect(user).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found by email', async () => {
      const userData: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const createdUser = await userService.createUser(userData);
      const foundUser = await userService.getUserByEmail(userData.email);

      expect(foundUser).toEqual(createdUser);
    });

    it('should return null when user not found by email', async () => {
      const user = await userService.getUserByEmail('non-existent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userData: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const createdUser = await userService.createUser(userData);
      const updatedUser = await userService.updateUser(createdUser.id, {
        name: 'Jane Doe',
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe('Jane Doe');
      expect(updatedUser?.email).toBe(userData.email);
      expect(updatedUser?.updatedAt.getTime()).toBeGreaterThanOrEqual(
        createdUser.updatedAt.getTime()
      );
    });

    it('should return null when updating non-existent user', async () => {
      const updatedUser = await userService.updateUser('non-existent-id', {
        name: 'New Name',
      });

      expect(updatedUser).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userData: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const createdUser = await userService.createUser(userData);
      const deleted = await userService.deleteUser(createdUser.id);

      expect(deleted).toBe(true);

      const foundUser = await userService.getUserById(createdUser.id);
      expect(foundUser).toBeNull();
    });

    it('should return false when deleting non-existent user', async () => {
      const deleted = await userService.deleteUser('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const user1 = await userService.createUser({
        name: 'User 1',
        email: 'user1@example.com',
      });

      const user2 = await userService.createUser({
        name: 'User 2',
        email: 'user2@example.com',
      });

      const allUsers = await userService.getAllUsers();

      expect(allUsers).toHaveLength(2);
      expect(allUsers).toContainEqual(user1);
      expect(allUsers).toContainEqual(user2);
    });

    it('should return empty array when no users exist', async () => {
      const allUsers = await userService.getAllUsers();
      expect(allUsers).toEqual([]);
    });
  });
});
