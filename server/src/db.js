import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const wasmPath = join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
const dbFilePath = join(__dirname, '..', 'blockchain.db');

let db = null;
let readyPromise = null;

/* Ergonomic wrapper around sql.js statements. */
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  let row = null;
  if (stmt.step()) row = stmt.getAsObject();
  stmt.free();
  return row;
}

function run(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const info = stmt.run();
  stmt.free();
  save();
  return info;
}

function save() {
  try {
    const data = Buffer.from(db.export());
    writeFileSync(dbFilePath, data);
  } catch (e) {
    // Best-effort persistence; never crash the app because of it.
  }
}

export async function initDb() {
  const wasmBinary = readFileSync(wasmPath);
  const SQL = await initSqlJs({ wasmBinary });

  let sqlDb;
  if (existsSync(dbFilePath)) {
    const fileData = readFileSync(dbFilePath);
    sqlDb = new SQL.Database(Uint8Array.from(fileData));
  } else {
    sqlDb = new SQL.Database();
  }
  db = sqlDb;

  db.exec(`
    CREATE TABLE IF NOT EXISTS wallets (
      address TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      public_key TEXT,
      private_key TEXT,
      emoji TEXT DEFAULT '👤',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS blocks (
      [index] INTEGER PRIMARY KEY,
      timestamp INTEGER NOT NULL,
      note TEXT,
      nonce INTEGER NOT NULL DEFAULT 0,
      difficulty INTEGER NOT NULL,
      prev_hash TEXT NOT NULL,
      hash TEXT NOT NULL,
      data_hash TEXT NOT NULL,
      miner TEXT,
      reward INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL DEFAULT 'transfer',
      sender TEXT,
      recipient TEXT,
      amount INTEGER NOT NULL DEFAULT 0,
      timestamp INTEGER NOT NULL,
      signature TEXT,
      block_index INTEGER,
      confirmed INTEGER DEFAULT 0
    );
  `);

  readyPromise = Promise.resolve({ db, all, get, run });
  return { db, all, get, run };
}

export function getDb() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export { all, get, run };

export async function ready() {
  return readyPromise;
}

export function closeDb() {
  if (db) db.close();
  db = null;
  readyPromise = null;
}
