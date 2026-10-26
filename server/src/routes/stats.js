import { Router } from 'express';
import { all } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const blockCount = all('SELECT COUNT(*) AS c FROM blocks')[0].c;
  const pending = all("SELECT COUNT(*) AS c FROM transactions WHERE confirmed = 0")[0].c;
  const confirmed = all("SELECT COUNT(*) AS c FROM transactions WHERE confirmed = 1")[0].c;
  const walletCount = all('SELECT COUNT(*) AS c FROM wallets')[0].c;

  const lastBlock = all('SELECT * FROM blocks ORDER BY [index] DESC LIMIT 1')[0];

  res.json({
    blockCount,
    pendingTransactions: pending,
    confirmedTransactions: confirmed,
    walletCount,
    lastBlockHash: lastBlock ? lastBlock.hash : null,
    lastDifficulty: lastBlock ? lastBlock.difficulty : 0,
    timestamp: Date.now(),
  });
});

export default router;
