import express from 'express';
import userRoutes from './routes/user.routes';

const app = express();

// 中间件
app.use(express.json());

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

// 用户路由
app.use('/api', userRoutes);

const PORT = process.env['PORT'] || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server started on port ${PORT}`);
  });
}

export default app;
