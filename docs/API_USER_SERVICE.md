# 用户服务 API 文档

## 概述

用户服务提供了完整的用户管理功能，包括创建、查询、更新和删除用户。

## API 端点

### 1. 创建用户

**POST** `/api/users`

创建新用户。

#### 请求体

```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### 响应

**成功 (201)**

```json
{
  "id": "user_1759401206452_abc123def",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-10-02T00:10:06.452Z",
  "updatedAt": "2025-10-02T00:10:06.452Z"
}
```

**错误 (400)**

```json
{
  "error": "Missing required fields: name and email are required"
}
```

**错误 (409)**

```json
{
  "error": "User with this email already exists"
}
```

### 2. 获取用户列表

**GET** `/api/users`

获取所有用户列表。

#### 响应

**成功 (200)**

```json
[
  {
    "id": "user_1759401206452_abc123def",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-10-02T00:10:06.452Z",
    "updatedAt": "2025-10-02T00:10:06.452Z"
  }
]
```

### 3. 根据 ID 获取用户

**GET** `/api/users/:id`

根据用户 ID 获取用户信息。

#### 路径参数

- `id` (string): 用户 ID

#### 响应

**成功 (200)**

```json
{
  "id": "user_1759401206452_abc123def",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-10-02T00:10:06.452Z",
  "updatedAt": "2025-10-02T00:10:06.452Z"
}
```

**错误 (404)**

```json
{
  "error": "User not found"
}
```

### 4. 更新用户

**PUT** `/api/users/:id`

更新用户信息。

#### 路径参数

- `id` (string): 用户 ID

#### 请求体

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

#### 响应

**成功 (200)**

```json
{
  "id": "user_1759401206452_abc123def",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "createdAt": "2025-10-02T00:10:06.452Z",
  "updatedAt": "2025-10-02T00:10:07.123Z"
}
```

**错误 (404)**

```json
{
  "error": "User not found"
}
```

### 5. 删除用户

**DELETE** `/api/users/:id`

删除用户。

#### 路径参数

- `id` (string): 用户 ID

#### 响应

**成功 (204)** 无响应体

**错误 (404)**

```json
{
  "error": "User not found"
}
```

## 使用示例

### 使用 curl

```bash
# 创建用户
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# 获取用户列表
curl http://localhost:3000/api/users

# 获取特定用户
curl http://localhost:3000/api/users/user_1759401206452_abc123def

# 更新用户
curl -X PUT http://localhost:3000/api/users/user_1759401206452_abc123def \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe"}'

# 删除用户
curl -X DELETE http://localhost:3000/api/users/user_1759401206452_abc123def
```

### 使用 JavaScript/TypeScript

```typescript
// 创建用户
const createUser = async (userData: { name: string; email: string }) => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return response.json();
};

// 获取用户列表
const getUsers = async () => {
  const response = await fetch('/api/users');
  return response.json();
};

// 获取特定用户
const getUserById = async (id: string) => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};

// 更新用户
const updateUser = async (id: string, updateData: { name?: string; email?: string }) => {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  return response.json();
};

// 删除用户
const deleteUser = async (id: string) => {
  const response = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  });
  return response.ok;
};
```

## 数据模型

### User

```typescript
interface User {
  id: string; // 用户唯一标识符
  name: string; // 用户姓名
  email: string; // 用户邮箱
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
}
```

### CreateUserRequest

```typescript
interface CreateUserRequest {
  name: string; // 用户姓名（必填）
  email: string; // 用户邮箱（必填）
}
```

### UpdateUserRequest

```typescript
interface UpdateUserRequest {
  name?: string; // 用户姓名（可选）
  email?: string; // 用户邮箱（可选）
}
```

## 错误处理

所有 API 端点都遵循统一的错误响应格式：

```json
{
  "error": "错误描述信息"
}
```

常见错误状态码：

- `400 Bad Request`: 请求参数错误
- `404 Not Found`: 资源不存在
- `409 Conflict`: 资源冲突（如邮箱已存在）
- `500 Internal Server Error`: 服务器内部错误

## 测试

运行测试：

```bash
# 运行所有测试
npm test

# 运行用户服务测试
npm test -- --testPathPattern=user.service.test.ts

# 运行测试并生成覆盖率报告
npm run test:coverage
```

## 开发说明

### 项目结构

```
src/
├── services/
│   ├── user.service.ts          # 用户服务业务逻辑
│   └── __tests__/
│       └── user.service.test.ts # 用户服务单元测试
├── controllers/
│   └── user.controller.ts       # 用户控制器
├── routes/
│   └── user.routes.ts           # 用户路由
└── app.ts                       # 主应用文件
```

### 设计原则

1. **业务逻辑分离**: 服务层处理业务逻辑，控制器层处理 HTTP 请求
2. **类型安全**: 使用 TypeScript 严格模式，确保类型安全
3. **错误处理**: 统一的错误响应格式
4. **测试覆盖**: 核心业务逻辑有完整的单元测试
5. **代码规范**: 遵循 ESLint 和 Prettier 配置

### 扩展建议

1. **数据库集成**: 当前使用内存存储，可集成 MongoDB 或 PostgreSQL
2. **身份验证**: 添加 JWT 或 OAuth 认证
3. **数据验证**: 使用 Joi 或 Zod 进行请求数据验证
4. **日志记录**: 添加结构化日志记录
5. **API 文档**: 集成 Swagger/OpenAPI 文档生成
