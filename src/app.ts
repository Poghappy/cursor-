import express from 'express';

const app = express();

app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env['PORT'] || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server started on port ${PORT}`);
  });
}

export default app;
