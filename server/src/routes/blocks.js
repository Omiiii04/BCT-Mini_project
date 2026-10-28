import { Router } from 'express';
import { getDb, all, get, run } from '../db.js';
import { sha256, computeHash, dataHashOf, mine, headerString } from '../services/blockchain.js';

const router = Router();
const COIN = process.env.COIN || 'DMC';
const REWARD = parseInt(process.env.REWARD || '50', 10);
const MAX_TX_PER_BLOCK = parseInt(process.env.MAX_TX_PER_BLOCK || '5', 10);
const DEFAULT_DIFFICULTY = parseInt(process.env.DIFFICULTY || '3', 10);
const ZERO_HASH = '0'.repeat(64);

function getLastBlock() {
  return get('SELECT * FROM blocks ORDER BY [index] DESC LIMIT 1');
}

function computeBalances() {
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

/* GET /api/blocks - list all blocks with their transactions */
router.get('/', (_req, res) => {
  const blocks = all('SELECT * FROM blocks ORDER BY [index] ASC');
  for (const b of blocks) {
    b.txs = all('SELECT * FROM transactions WHERE block_index = ? ORDER BY timestamp ASC', [b.index]);
  }
  res.json(blocks);
});

/* GET /api/blocks/:index */
router.get('/:index', (req, res) => {
  const b = get('SELECT * FROM blocks WHERE [index] = ?', [parseInt(req.params.index, 10)]);
  if (!b) {
    const err = new Error('Block not found');
    err.status = 404;
    throw err;
  }
  b.txs = all('SELECT * FROM transactions WHERE block_index = ? ORDER BY timestamp ASC', [b.index]);
  res.json(b);
});

/* POST /api/blocks/mine - mine a new block */
router.post('/mine', async (req, res, next) => {
  try {
    const { difficulty: diffOverride, minerAddress } = req.body;

    const lastBlock = getLastBlock();
    const prevHash = lastBlock ? lastBlock.hash : ZERO_HASH;
    const index = lastBlock ? lastBlock.index + 1 : 0;
    const difficulty = diffOverride !== undefined ? parseInt(diffOverride, 10) : DEFAULT_DIFFICULTY;

    const pending = all('SELECT * FROM transactions WHERE confirmed = 0 ORDER BY timestamp ASC LIMIT ?', [MAX_TX_PER_BLOCK]);

    const resolvedMiner = minerAddress || (lastBlock ? lastBlock.miner : 'Miner');

    const blockTxs = [
      {
        id: 'cb_' + index,
        kind: 'coinbase',
        sender: null,
        recipient: resolvedMiner,
        amount: REWARD,
        timestamp: Date.now(),
        signature: null,
      },
      ...pending.map((t) => ({
        id: t.id,
        kind: t.kind,
        sender: t.sender,
        recipient: t.recipient,
        amount: t.amount,
        timestamp: t.timestamp,
        signature: t.signature,
      })),
    ];

    const dataHash = dataHashOf(blockTxs);
    const block = {
      index,
      timestamp: Date.now(),
      note: `Mined by ${resolvedMiner} · block reward ${REWARD} ${COIN}`,
      nonce: 0,
      difficulty,
      prevHash,
      hash: '',
      dataHash,
      txs: blockTxs,
    };

    const used = await mine(block, difficulty, () => {});

    const blockRow = {
      index: block.index,
      timestamp: block.timestamp,
      note: block.note,
      nonce: block.nonce,
      difficulty: block.difficulty,
      prev_hash: block.prevHash,
      hash: block.hash,
      data_hash: block.dataHash,
      miner: resolvedMiner,
      reward: REWARD,
    };

    run(
      'INSERT INTO blocks ([index], timestamp, note, nonce, difficulty, prev_hash, hash, data_hash, miner, reward) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [blockRow.index, blockRow.timestamp, blockRow.note, blockRow.nonce, blockRow.difficulty, blockRow.prev_hash, blockRow.hash, blockRow.data_hash, blockRow.miner, blockRow.reward]
    );

    // Mark the pending transactions as confirmed and link to this block
    for (const t of pending) {
      run('UPDATE transactions SET block_index = ?, confirmed = 1 WHERE id = ? AND confirmed = 0', [block.index, t.id]);
    }

    // Persist the coinbase reward transaction
    const cb = blockTxs[0];
    run(
      'INSERT INTO transactions (id, kind, sender, recipient, amount, timestamp, signature, block_index, confirmed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [cb.id, cb.kind, cb.sender, cb.recipient, cb.amount, cb.timestamp, cb.signature, block.index]
    );

    res.status(201).json({
      ...blockRow,
      txs: blockTxs,
      hashes: used,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
