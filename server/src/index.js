import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import { initDb, closeDb } from './db.js';
import walletsRouter from './routes/wallets.js';
import transactionsRouter from './routes/transactions.js';
import blocksRouter from './routes/blocks.js';
import chainRouter from './routes/chain.js';
import statsRouter from './routes/stats.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.use('/api/wallets', walletsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/blocks', blocksRouter);
app.use('/api/chain', chainRouter);
app.use('/api/stats', statsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use(errorHandler);

let server;
async function start() {
  await initDb();
  server = app.listen(PORT, () => {
    console.log(`Blockchain server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  if (server) server.close(() => closeDb());
  process.exit(0);
});

process.on('SIGINT', () => {
  if (server) server.close(() => closeDb());
  process.exit(0);
});

export { app };
