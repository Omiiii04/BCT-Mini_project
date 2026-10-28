import { Router } from 'express';
import { getDb, all, get, run } from '../db.js';
import { computeHash, dataHashOf, mine, headerString } from '../services/blockchain.js';
import { verifySignature, txPayload } from '../services/wallet.js';

const router = Router();
const ZERO_HASH = '0'.repeat(64);

/* GET /api/chain/validate - validate the entire chain */
router.get('/validate', (_req, res) => {
  const blocks = all('SELECT * FROM blocks ORDER BY [index] ASC');
  const wallets = all('SELECT * FROM wallets');
  const walletMap = new Map(wallets.map((w) => [w.address, w.public_key]));

  const results = [];
  let prev = ZERO_HASH;
  let okSoFar = true;

  for (const b of blocks) {
    const reasons = [];
    const blockTxs = all('SELECT * FROM transactions WHERE block_index = ? ORDER BY timestamp ASC', [b.index]);

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
      reasons.push('Hash mismatch: block header contents or nonce altered after mining');
    }

    if (!b.hash.startsWith('0'.repeat(b.difficulty))) {
      reasons.push(`Proof-of-work not met: requires ${b.difficulty} leading zeros`);
    }

    // Verify block data hash matches transactions
    const canonicalTxs = blockTxs.map((t) => ({
      id: t.id,
      kind: t.kind,
      sender: t.sender,
      recipient: t.recipient,
      amount: t.amount,
      timestamp: t.timestamp,
      signature: t.signature,
    }));
    const computedDataHash = dataHashOf(canonicalTxs);
    if (computedDataHash !== b.data_hash) {
      reasons.push(`Data hash mismatch: block transactions altered (expected ${b.data_hash.slice(0, 10)}…, calculated ${computedDataHash.slice(0, 10)}…)`);
    }

    // Verify transaction digital signatures
    for (const tx of blockTxs) {
      if (tx.kind === 'transfer') {
        const pubKey = walletMap.get(tx.sender);
        const payload = txPayload({
          sender: tx.sender,
          recipient: tx.recipient,
          amount: tx.amount,
          timestamp: tx.timestamp,
        });
        if (!pubKey || !tx.signature || !verifySignature(pubKey, payload, tx.signature)) {
          reasons.push(`Invalid ECDSA signature for transaction ${tx.id}`);
        }
      }
    }

    const own = reasons.length === 0;
    okSoFar = okSoFar && own;
    results.push({
      index: b.index,
      own,
      okUpTo: okSoFar,
      reasons,
      hash: b.hash,
      prevHash: b.prev_hash,
      difficulty: b.difficulty,
      txCount: blockTxs.length,
      miner: b.miner,
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
  const lastBlock = blocks.length ? blocks[blocks.length - 1] : null;
  res.json({
    blockCount: blocks.length,
    pendingTransactions: pending,
    lastBlock,
    lastBlockHash: lastBlock ? lastBlock.hash : null,
  });
});

/* POST /api/chain/tamper - simulate tampering with a block or transaction */
router.post('/tamper', (req, res, next) => {
  try {
    const { blockIndex = 1, field = 'note', value = '⚠️ TAMPERED DATA' } = req.body;
    const block = get('SELECT * FROM blocks WHERE [index] = ?', [blockIndex]);
    if (!block) {
      const err = new Error(`Block #${blockIndex} not found`);
      err.status = 404;
      throw err;
    }

    if (field === 'transaction') {
      const tx = get('SELECT * FROM transactions WHERE block_index = ? AND kind = ? LIMIT 1', [blockIndex, 'transfer'])
        || get('SELECT * FROM transactions WHERE block_index = ? LIMIT 1', [blockIndex]);
      if (tx) {
        const fakeAmount = Number(value) || (tx.amount + 9999);
        run('UPDATE transactions SET amount = ? WHERE id = ?', [fakeAmount, tx.id]);
        return res.json({
          message: `Tampered with transaction ${tx.id} in block #${blockIndex}: amount altered to ${fakeAmount}`,
          tamperedField: 'transaction.amount',
          blockIndex,
        });
      }
    }

    if (field === 'hash') {
      run('UPDATE blocks SET hash = ? WHERE [index] = ?', ['deadbeef' + '0'.repeat(56), blockIndex]);
      return res.json({ message: `Tampered with block #${blockIndex} hash`, blockIndex });
    }

    // Default: modify note
    run('UPDATE blocks SET note = ? WHERE [index] = ?', [String(value), blockIndex]);
    res.json({
      message: `Tampered with block #${blockIndex} note: "${value}"`,
      tamperedField: 'note',
      blockIndex,
    });
  } catch (err) {
    next(err);
  }
});

/* POST /api/chain/repair - recompute valid hashes and re-mine from first invalid block */
router.post('/repair', async (req, res, next) => {
  try {
    const blocks = all('SELECT * FROM blocks ORDER BY [index] ASC');
    let prev = ZERO_HASH;
    let repairedCount = 0;

    for (const b of blocks) {
      const blockTxs = all('SELECT * FROM transactions WHERE block_index = ? ORDER BY timestamp ASC', [b.index]);
      const canonicalTxs = blockTxs.map((t) => ({
        id: t.id,
        kind: t.kind,
        sender: t.sender,
        recipient: t.recipient,
        amount: t.amount,
        timestamp: t.timestamp,
        signature: t.signature,
      }));
      const currentDataHash = dataHashOf(canonicalTxs);

      const blockToMine = {
        index: b.index,
        timestamp: b.timestamp,
        note: b.note,
        difficulty: b.difficulty,
        prevHash: prev,
        dataHash: currentDataHash,
        nonce: 0,
        hash: '',
      };

      await mine(blockToMine, b.difficulty, () => {});

      run(
        'UPDATE blocks SET prev_hash = ?, data_hash = ?, nonce = ?, hash = ? WHERE [index] = ?',
        [blockToMine.prevHash, blockToMine.dataHash, blockToMine.nonce, blockToMine.hash, b.index]
      );
      prev = blockToMine.hash;
      repairedCount++;
    }

    res.json({ message: `Chain re-mined and repaired (${repairedCount} blocks)`, repairedCount });
  } catch (err) {
    next(err);
  }
});

/* POST /api/chain/reset - reset chain to genesis */
router.post('/reset', async (req, res, next) => {
  try {
    const { minerAddress = 'Alice' } = req.body;
    const REWARD = parseInt(process.env.REWARD || '50', 10);
    const GENESIS_ALLOCATION = parseInt(process.env.GENESIS_ALLOCATION || '100', 10);

    // Resolve miner address: if a name like 'Alice' was provided, check if wallet exists
    let resolvedMiner = minerAddress;
    const matchedWallet = get('SELECT address FROM wallets WHERE name = ? OR address = ? LIMIT 1', [minerAddress, minerAddress]);
    if (matchedWallet) {
      resolvedMiner = matchedWallet.address;
    }

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
        recipient: resolvedMiner,
        amount: GENESIS_ALLOCATION,
        timestamp: now,
        signature: null,
      },
    ];
    const dataHash = dataHashOf(genesisTxs);

    const block = {
      index: 0,
      timestamp: now,
      note: `Genesis block — ${minerAddress} receives first ${GENESIS_ALLOCATION} ${process.env.COIN || 'DMC'}`,
      nonce: 0,
      difficulty: 1,
      prevHash: ZERO_HASH,
      hash: '',
      dataHash: dataHash,
      txs: genesisTxs,
    };

    const used = await mine(block, 1, () => {});

    run(
      'INSERT INTO blocks ([index], timestamp, note, nonce, difficulty, prev_hash, hash, data_hash, miner, reward) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [0, now, block.note, block.nonce, 1, ZERO_HASH, block.hash, dataHash, resolvedMiner, GENESIS_ALLOCATION]
    );

    run(
      'INSERT INTO transactions (id, kind, sender, recipient, amount, timestamp, signature, block_index, confirmed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [genesisTxs[0].id, genesisTxs[0].kind, genesisTxs[0].sender, genesisTxs[0].recipient, genesisTxs[0].amount, genesisTxs[0].timestamp, genesisTxs[0].signature, 0]
    );

    res.json({ message: 'Chain reset to genesis', block: { ...block, hashes: used } });
  } catch (err) {
    next(err);
  }
});

export default router;
