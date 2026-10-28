import { createHash } from 'node:crypto';

/* Pure SHA-256 hex digest (Node built-in crypto). */
export function sha256(input) {
  return createHash('sha256').update(typeof input === 'string' ? input : Buffer.from(input)).digest('hex');
}

/* Serialize block header deterministically for hashing.
   Ends with ',"nonce":' so the miner/appender can inject the nonce value
   and closing brace: headerString(block) + nonce + "}". */
export function headerString(block) {
  return JSON.stringify({
    index: block.index,
    timestamp: block.timestamp,
    note: block.note,
    dataHash: block.dataHash !== undefined ? block.dataHash : block.data_hash,
    prevHash: block.prevHash !== undefined ? block.prevHash : block.prev_hash,
  }) + ',"nonce":';
}

/* Compute block hash from header + nonce. */
export function computeHash(block) {
  return sha256(headerString(block) + block.nonce + '}');
}

/* Data hash = sha256(JSON.stringify(txs)). */
export function dataHashOf(txs) {
  return sha256(JSON.stringify(txs));
}

/* Proof of work: find nonce so hash starts with `difficulty` zeros. */
export function mine(block, difficulty, onTick) {
  const target = '0'.repeat(difficulty);
  const pre = headerString(block);
  let nonce = 0;
  let hashes = 0;
  const batchSize = 2000;

  return new Promise((resolve) => {
    function step() {
      for (let i = 0; i < batchSize; i++) {
        const hash = sha256(pre + nonce + '}');
        hashes++;
        if (hash.startsWith(target)) {
          block.nonce = nonce;
          block.hash = hash;
          block.data_hash = block.data_hash || dataHashOf(block.txs || []);
          if (onTick) onTick(hashes, nonce, true);
          resolve(hashes);
          return;
        }
        nonce++;
      }
      block.nonce = nonce;
      if (onTick) onTick(hashes, nonce, false);
      setTimeout(step, 0);
    }
    step();
  });
}
