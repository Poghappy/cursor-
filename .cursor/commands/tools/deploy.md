# 部署检查清单 (Deployment Checklist)

**工具目标**: 系统化地检查部署前的准备工作,确保安全顺利发布。

## 部署前检查 (Pre-deployment)

### 1. 代码质量检查

- [ ] 所有代码已合并到主分支
- [ ] 代码审查已完成并通过
- [ ] 无未解决的高优先级 Issue
- [ ] Lint 检查通过: `npm run lint`
- [ ] 格式化检查通过: `npm run format:check`

### 2. 测试验证

- [ ] 单元测试通过: `npm test`
- [ ] 集成测试通过: `npm run test:integration`
- [ ] E2E 测试通过: `npm run test:e2e`
- [ ] 测试覆盖率达标: > 80%
- [ ] 性能测试通过
- [ ] 安全扫描通过

### 3. 依赖管理

- [ ] 依赖版本已锁定 (package-lock.json / yarn.lock)
- [ ] 无已知安全漏洞: `npm audit`
- [ ] 生产依赖已优化
- [ ] 可选依赖已分离

### 4. 环境配置

- [ ] 环境变量已配置
  ```bash
  # 检查必需的环境变量
  - DATABASE_URL
  - REDIS_URL
  - JWT_SECRET
  - API_KEY
  ```
- [ ] 配置文件已准备
- [ ] 密钥已安全存储
- [ ] 域名DNS已配置

### 5. 数据库准备

- [ ] 数据库迁移脚本已准备
  ```bash
  npm run db:migrate:dry-run  # 预演
  npm run db:migrate          # 执行
  ```
- [ ] 数据备份已完成
- [ ] 回滚脚本已准备
- [ ] 索引已创建和优化

### 6. 基础设施

- [ ] 服务器资源充足 (CPU/内存/磁盘)
- [ ] 负载均衡器已配置
- [ ] CDN 已配置和预热
- [ ] SSL 证书有效 (> 30天)
- [ ] 防火墙规则已配置

## 部署过程检查 (During Deployment)

### 1. 构建验证

```bash
# 清理旧构建
npm run clean

# 生产构建
npm run build

# 验证构建产物
ls -lh dist/

# 检查文件大小
du -sh dist/
```

- [ ] 构建成功无错误
- [ ] 构建产物完整
- [ ] Bundle 大小合理
- [ ] Source Map 已生成

### 2. 部署执行

```bash
# 健康检查
curl https://api.example.com/health

# 部署新版本
./deploy.sh production v1.2.0

# 验证部署
./verify-deployment.sh

# 监控指标
watch -n 5 'curl -s https://api.example.com/metrics'
```

- [ ] 健康检查通过
- [ ] 服务正常启动
- [ ] 所有实例已更新
- [ ] 无错误日志

### 3. 数据库迁移

```bash
# 备份数据库
pg_dump mydb > backup_$(date +%Y%m%d_%H%M%S).sql

# 执行迁移
npm run db:migrate

# 验证迁移
npm run db:validate
```

- [ ] 数据备份完成
- [ ] 迁移脚本执行成功
- [ ] 数据一致性检查通过
- [ ] 回滚脚本验证

### 4. 监控验证

- [ ] 应用监控正常
  - CPU 使用率 < 70%
  - 内存使用率 < 80%
  - 磁盘使用率 < 80%

- [ ] 业务指标正常
  - 请求成功率 > 99%
  - 响应时间 < 2s (P95)
  - 错误率 < 1%

- [ ] 日志输出正常
  - 无 ERROR 级别日志
  - 无 FATAL 级别日志
  - WARN 日志可接受

## 部署后检查 (Post-deployment)

### 1. 功能验证

- [ ] 核心功能可用

  ```bash
  # 用户登录
  curl -X POST https://api.example.com/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test123"}'

  # 数据查询
  curl https://api.example.com/users \
    -H "Authorization: Bearer <token>"
  ```

- [ ] API 接口响应正常
- [ ] 前端页面正常显示
- [ ] 关键业务流程可用

### 2. 性能验证

```bash
# 压力测试
ab -n 1000 -c 100 https://api.example.com/

# 响应时间测试
wrk -t12 -c400 -d30s https://api.example.com/
```

- [ ] 响应时间达标
- [ ] 吞吐量达标
- [ ] 并发处理正常
- [ ] 资源使用合理

### 3. 监控告警

- [ ] 监控系统正常
  - Prometheus 正常采集
  - Grafana 仪表板正常
  - 告警规则已更新

- [ ] 日志系统正常
  - 日志正常收集
  - 日志查询正常
  - 日志告警正常

- [ ] 链路追踪正常
  - Trace 数据正常
  - 服务依赖可视化
  - 性能瓶颈识别

### 4. 用户验证

- [ ] Beta 用户测试通过
- [ ] 内部团队验证通过
- [ ] 无用户投诉
- [ ] 用户反馈正常

## 回滚计划

### 回滚触发条件

- [ ] 错误率 > 5%
- [ ] 响应时间 > 5s (P95)
- [ ] 核心功能不可用
- [ ] 出现严重安全漏洞

### 回滚步骤

```bash
# 1. 停止新版本部署
kubectl rollout pause deployment/myapp

# 2. 回滚到上一版本
kubectl rollout undo deployment/myapp

# 3. 验证回滚
kubectl rollout status deployment/myapp

# 4. 数据库回滚 (如需要)
psql mydb < backup_20240101_120000.sql

# 5. 清理缓存
redis-cli FLUSHALL
```

## 沟通通知

### 部署前通知

```markdown
**部署通知**

部署时间: 2024-01-01 02:00-03:00 (GMT+8) 部署版本:
v1.2.0影响范围: 所有用户预计影响: 服务中断 5-10 分钟变更内容:

- 新增功能A
- 优化功能B
- 修复Bug C

联系人: zhangsan@example.com
```

### 部署后通知

```markdown
**部署完成**

部署时间: 2024-01-01 02:30部署版本: v1.2.0部署状态: ✅ 成功影响时长: 8 分钟验证结果:

- ✅ 功能验证通过
- ✅ 性能验证通过
- ✅ 监控正常

发布说明: https://example.com/releases/v1.2.0
```

## 部署类型

### 1. 蓝绿部署

- [ ] 绿环境已部署新版本
- [ ] 绿环境验证通过
- [ ] 流量切换到绿环境
- [ ] 蓝环境保留作为备份

### 2. 金丝雀发布

- [ ] 5% 流量切到新版本
- [ ] 监控 30 分钟无异常
- [ ] 逐步增加到 50%
- [ ] 监控正常后全量发布

### 3. 滚动更新

- [ ] 逐个实例更新
- [ ] 每个实例健康检查
- [ ] 自动回滚异常实例
- [ ] 全部实例更新完成

## 应急联系

### 关键人员

- **项目经理**: 张三 (13800138000)
- **技术负责人**: 李四 (13900139000)
- **运维负责人**: 王五 (13700137000)
- **值班人员**: 赵六 (13600136000)

### 应急流程

1. 发现问题 → 评估影响
2. 决定回滚或修复
3. 执行应急方案
4. 通知相关人员
5. 问题复盘总结

---

**记住**: 充分准备和验证是成功部署的关键!
