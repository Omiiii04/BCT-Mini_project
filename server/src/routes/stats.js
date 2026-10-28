import { Router } from 'express';
import { all } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const blockCount = all('SELECT COUNT(*) AS c FROM blocks')[0]?.c || 0;
  const pending = all("SELECT COUNT(*) AS c FROM transactions WHERE confirmed = 0")[0]?.c || 0;
  const confirmed = all("SELECT COUNT(*) AS c FROM transactions WHERE confirmed = 1")[0]?.c || 0;
  const walletCount = all('SELECT COUNT(*) AS c FROM wallets')[0]?.c || 0;
  const totalSupply = all('SELECT SUM(reward) AS s FROM blocks')[0]?.s || 0;

  const lastBlock = all('SELECT * FROM blocks ORDER BY [index] DESC LIMIT 1')[0];

  res.json({
    blockCount,
    pendingTransactions: pending,
    confirmedTransactions: confirmed,
    walletCount,
    totalSupply,
    lastBlockHash: lastBlock ? lastBlock.hash : null,
    lastDifficulty: lastBlock ? lastBlock.difficulty : 0,
    coin: process.env.COIN || 'DMC',
    reward: parseInt(process.env.REWARD || '50', 10),
    timestamp: Date.now(),
  });
});

export default router;
