import { Router } from 'express';
import { getDb, all, get, run } from '../db.js';
import { makeWallet } from '../services/wallet.js';

const router = Router();
const COIN = process.env.COIN || 'DMC';

/* Derive balances from the valid prefix of the chain. */
function computeBalances() {
  const db = getDb();
  const blocks = all('SELECT * FROM blocks ORDER BY [index] ASC');
  const txs = all("SELECT * FROM transactions WHERE confirmed = 1 ORDER BY block_index ASC");
  const bal = {};
  for (const b of blocks) {
    const blockTxs = txs.filter((t) => t.block_index === b.index);
    for (const t of blockTxs) {
      if (t.kind === 'coinbase') {
        bal[t.recipient] = (bal[t.recipient] || 0) + t.amount;
      } else {
        bal[t.sender] = (bal[t.sender] || 0) - t.amount;
        bal[t.recipient] = (bal[t.recipient] || 0) + t.amount;
      }
    }
  }
  return bal;
}

/* GET /api/wallets - list wallets with balances */
router.get('/', (_req, res) => {
  const wallets = all('SELECT * FROM wallets ORDER BY name ASC');
  const bal = computeBalances();
  const result = wallets.map((w) => ({
    ...w,
    publicKey: w.public_key,
    privateKey: w.private_key,
    createdAt: w.created_at,
    balance: bal[w.address] || 0,
  }));
  res.json(result);
});

/* POST /api/wallets - create a new wallet */
router.post('/', (req, res) => {
  const { name, emoji } = req.body;
  if (!name) {
    const err = new Error('Wallet name is required');
    err.status = 400;
    throw err;
  }

  const w = makeWallet(name);
  const now = Date.now();
  const emojis = ['👤', '🦊', '⚡', '💎', '🚀', '🔮', '🛡️', '🦁', '🌟', '🍀'];
  const assignedEmoji = emoji || emojis[Math.floor(Math.random() * emojis.length)];

  run(
    'INSERT INTO wallets (address, name, public_key, private_key, emoji, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [w.address, name, w.publicKey, w.privateKey, assignedEmoji, now]
  );

  const bal = computeBalances();
  res.status(201).json({
    ...w,
    emoji: assignedEmoji,
    publicKey: w.publicKey,
    privateKey: w.privateKey,
    createdAt: now,
    balance: bal[w.address] || 0,
  });
});

/* GET /api/wallets/:address - get wallet details */
router.get('/:address', (req, res) => {
  const w = get('SELECT * FROM wallets WHERE address = ?', [req.params.address]);
  if (!w) {
    const err = new Error('Wallet not found');
    err.status = 404;
    throw err;
  }
  const bal = computeBalances();
  res.json({
    ...w,
    publicKey: w.public_key,
    privateKey: w.private_key,
    createdAt: w.created_at,
    balance: bal[w.address] || 0,
  });
});

export default router;
