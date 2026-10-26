import { Router } from 'express';
import { getDb, all, run } from '../db.js';
import { computeHash, dataHashOf, mine, headerString } from '../services/blockchain.js';

const router = Router();
const ZERO_HASH = '0'.repeat(64);

/* GET /api/chain/validate - validate the entire chain */
router.get('/validate', (_req, res) => {
  const blocks = all('SELECT * FROM blocks ORDER BY [index] ASC');
  const results = [];
  let prev = ZERO_HASH;
  let okSoFar = true;

  for (const b of blocks) {
    const reasons = [];
    const reconstructed = {
      index: b.index,
      timestamp: b.timestamp,
      note: b.note,
      dataHash: b.data_hash,
      prevHash: b.prev_hash,
      nonce: b.nonce,
    };

    if (b.prev_hash !== prev) {
      reasons.push(`Broken link: prevHash does not match block #${b.index - 1}'s hash`);
    }
    if (computeHash(reconstructed) !== b.hash) {
      reasons.push('Hash mismatch: contents were changed after mining');
    }
    if (!b.hash.startsWith('0'.repeat(b.difficulty))) {
      reasons.push(`Proof-of-work not met: needs ${b.difficulty} leading zero(s)`);
    }

    const own = reasons.length === 0;
    okSoFar = okSoFar && own;
    results.push({
      index: b.index,
      own,
      okUpTo: okSoFar,
      reasons,
      hash: b.hash,
    });
    prev = b.hash;
  }

  const firstInvalid = results.findIndex((r) => !r.own);
  res.json({
    valid: firstInvalid === -1,
    firstInvalidIndex: firstInvalid === -1 ? -1 : firstInvalid,
    results,
    blockCount: blocks.length,
  });
});

/* GET /api/chain/status - quick chain status */
router.get('/status', (_req, res) => {
  const blocks = all('SELECT * FROM blocks ORDER BY [index] ASC');
  const pending = all("SELECT COUNT(*) AS c FROM transactions WHERE confirmed = 0")[0].c;
  res.json({
    blockCount: blocks.length,
    pendingTransactions: pending,
    lastBlock: blocks.length ? blocks[blocks.length - 1] : null,
  });
});

/* POST /api/chain/reset - reset chain to genesis */
router.post('/reset', (req, res) => {
  const db = getDb();
  const { minerAddress = 'Alice' } = req.body;
  const REWARD = parseInt(process.env.REWARD || '50', 10);
  const GENESIS_ALLOCATION = parseInt(process.env.GENESIS_ALLOCATION || '100', 10);
  const DEFAULT_DIFFICULTY = parseInt(process.env.DIFFICULTY || '3', 10);

  // Clear chain data
  run('DELETE FROM transactions');
  run('DELETE FROM blocks');

  // Create genesis block
  const now = Date.now();
  const genesisTxs = [
    {
      id: 'genesis_cb',
      kind: 'coinbase',
      sender: null,
      recipient: minerAddress,
      amount: GENESIS_ALLOCATION,
      timestamp: now,
      signature: null,
    },
  ];
  const dataHash = dataHashOf(genesisTxs);

  const block = {
    index: 0,
    timestamp: now,
    note: `Genesis block — ${minerAddress} receives the first ${GENESIS_ALLOCATION} ${process.env.COIN || 'DMC'}`,
    nonce: 0,
    difficulty: 1,
    prevHash: ZERO_HASH,
    hash: '',
    dataHash: dataHash,
    txs: genesisTxs,
  };

  const used = mine(block, 1, () => {});

  run(
    'INSERT INTO blocks ([index], timestamp, note, nonce, difficulty, prev_hash, hash, data_hash, miner, reward) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [0, now, block.note, block.nonce, 1, ZERO_HASH, block.hash, dataHash, minerAddress, GENESIS_ALLOCATION]
  );

  run(
    'INSERT INTO transactions (id, kind, sender, recipient, amount, timestamp, signature, block_index, confirmed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
    [genesisTxs[0].id, genesisTxs[0].kind, genesisTxs[0].sender, genesisTxs[0].recipient, genesisTxs[0].amount, genesisTxs[0].timestamp, genesisTxs[0].signature, 0]
  );

  res.json({ message: 'Chain reset to genesis', block: { ...block, hashes: used } });
});

export default router;
