import { Router } from 'express';
import { getDb, all, get, run } from '../db.js';
import { sha256, mine, dataHashOf } from '../services/blockchain.js';
import { signPayload, txPayload } from '../services/wallet.js';

const router = Router();
const COIN = process.env.COIN || 'DMC';
const REWARD = parseInt(process.env.REWARD || '50', 10);
const MAX_TX_PER_BLOCK = parseInt(process.env.MAX_TX_PER_BLOCK || '5', 10);
const ZERO_HASH = '0'.repeat(64);

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

/* GET /api/transactions - all transactions */
router.get('/', (_req, res) => {
  const txs = all('SELECT * FROM transactions ORDER BY timestamp DESC');
  res.json(txs);
});

/* GET /api/transactions/mempool - pending transactions */
router.get('/mempool', (_req, res) => {
  const txs = all("SELECT * FROM transactions WHERE confirmed = 0 ORDER BY timestamp ASC");
  res.json(txs);
});

/* POST /api/transactions - create and sign a transfer */
router.post('/', (req, res) => {
  const { senderAddress, recipientAddress, amount, privateKey, publicKey } = req.body;

  if (!senderAddress || !recipientAddress || !amount) {
    const err = new Error('senderAddress, recipientAddress and amount are required');
    err.status = 400;
    throw err;
  }

  const amountNum = parseInt(amount, 10);
  if (!Number.isInteger(amountNum) || amountNum < 1) {
    const err = new Error('Amount must be a whole number >= 1');
    err.status = 400;
    throw err;
  }

  const sender = get('SELECT * FROM wallets WHERE address = ?', [senderAddress]);
  if (!sender) {
    const err = new Error('Sender wallet not found');
    err.status = 404;
    throw err;
  }

  const bal = computeBalances();
  const pendingOut = all("SELECT * FROM transactions WHERE confirmed = 0 AND sender = ?", [senderAddress])
    .reduce((sum, t) => sum + t.amount, 0);
  const spendable = (bal[senderAddress] || 0) - pendingOut;
  if (amountNum > spendable) {
    const err = new Error(`Insufficient balance: ${senderAddress} has ${spendable} spendable ${COIN}`);
    err.status = 400;
    throw err;
  }

  const timestamp = Date.now();
  const payload = txPayload({ sender: senderAddress, recipient: recipientAddress, amount: amountNum, timestamp });
  const privKey = privateKey || sender.privateKey;
  const signature = signPayload(privKey, payload);

  const id = 'tx_' + sha256(senderAddress + recipientAddress + amountNum + timestamp + Math.random()).slice(0, 16);

  const tx = {
    id, kind: 'transfer', sender: senderAddress, recipient: recipientAddress,
    amount: amountNum, timestamp, signature, block_index: null, confirmed: 0,
  };

  run(
    'INSERT INTO transactions (id, kind, sender, recipient, amount, timestamp, signature, block_index, confirmed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [tx.id, tx.kind, tx.sender, tx.recipient, tx.amount, tx.timestamp, tx.signature, tx.block_index, tx.confirmed]
  );

  res.status(201).json({ ...tx, senderEmoji: sender.emoji });
});

/* DELETE /api/transactions/:id - remove from mempool */
router.delete('/:id', (req, res) => {
  const info = run('DELETE FROM transactions WHERE id = ? AND confirmed = 0', [req.params.id]);
  if (info.changes === 0) {
    const err = new Error('Transaction not found or already confirmed');
    err.status = 404;
    throw err;
  }
  res.json({ message: 'Transaction removed from mempool' });
});

export default router;
