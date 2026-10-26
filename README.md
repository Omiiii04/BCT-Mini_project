# ⛓ BCT Mini Project — Full-Stack Blockchain Starter

A full-stack blockchain starter web application with a **React frontend** and a **Node.js + Express + SQLite backend**. Real SHA-256 hashing, ECDSA P-256 digital signatures, proof-of-work mining, chain validation, tamper detection, and a responsive UI — all persisted in SQLite.

```
BCT-Mini_project/
├── README.md               # This file
├── client/                 # React frontend (Vite + Tailwind CSS)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx        # Entry point
│       ├── App.jsx         # Routing
│       ├── index.css       # Tailwind + base styles
│       ├── services/
│       │   └── api.js      # API client
│       ├── context/
│       │   └── BlockchainContext.jsx  # React context + data fetching
│       ├── utils/
│       │   └── crypto.js   # Hash/format helpers
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.jsx
│       │   │   └── Footer.jsx
│       │   └── shared/
│       │       └── DashboardWidgets.jsx
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Wallets.jsx
│           ├── Transactions.jsx
│           ├── Blocks.jsx
│           └── Settings.jsx
└── server/                 # Node.js + Express + SQLite backend
    ├── package.json
    ├── .env
    ├── blockchain.db       # SQLite database (auto-created)
    └── src/
        ├── index.js        # Express app + server bootstrap
        ├── db.js           # SQLite (sql.js) init + persistence wrapper
        ├── middleware/
        │   └── errorHandler.js
        ├── routes/
        │   ├── wallets.js
        │   ├── transactions.js
        │   ├── blocks.js
        │   ├── chain.js
        │   └── stats.js
        └── services/
            ├── blockchain.js   # SHA-256, header hashing, proof-of-work
            └── wallet.js       # ECDSA P-256 wallets, signing, verification
```

## Features

- **Wallets** — Create ECDSA P-256 wallets; balances derived from the chain (never stored).
- **Transactions** — Sign and broadcast transfers; they live in the mempool until mined.
- **Mining** — Proof-of-work with adjustable difficulty; block reward + fees go to the miner.
- **Chain validation** — Every block's hash, links, proof-of-work, and signatures are verified; invalidity cascades.
- **Tamper resistance** — Editing block data or amounts breaks hashes/signatures; the chain turns red.
- **Persistence** — SQLite database (`blockchain.db`) survives server restarts.
- **Responsive UI** — Tailwind CSS, works on desktop and mobile.
- **No build step on the backend** — vanilla Node.js ES modules.

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Lucide icons, Axios
- **Backend:** Node.js (ES modules), Express, SQLite (sql.js / WASM)
- **Crypto:** SHA-256, ECDSA P-256 (Node `crypto`), proof-of-work

## Quick start

### Prerequisites
- Node.js 18+

### 1. Start the backend

```bash
cd server
npm install
npm start        # http://localhost:5000
```

### 2. Start the frontend (in a new terminal)

```bash
cd client
npm install
npm run dev      # http://localhost:5173
```

Open <http://localhost:5173> in your browser. The frontend proxies `/api` requests to the backend automatically.

### 3. Try it out

1. **Wallets** — Create Alice, Bob, and Carol wallets.
2. **Dashboard** — Alice starts with 100 DMC from the genesis block.
3. **Transactions** — Send Alice → Bob, 40 DMC. It appears in the mempool.
4. **Dashboard** — Mine a block (difficulty 3). The transaction is confirmed and the miner earns 50 DMC.
5. **Blocks** — Inspect the chain; green = valid, red = invalid.
6. **Settings** — Reset the chain to a fresh genesis block.

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Network statistics |
| GET | `/api/wallets` | List wallets with balances |
| POST | `/api/wallets` | Create a wallet (`{ name }`) |
| GET | `/api/wallets/:address` | Get a wallet |
| GET | `/api/transactions` | All transactions |
| GET | `/api/transactions/mempool` | Pending transactions |
| POST | `/api/transactions` | Sign & create a transfer |
| DELETE | `/api/transactions/:id` | Remove from mempool |
| GET | `/api/blocks` | List all blocks |
| GET | `/api/blocks/:index` | Get a block |
| POST | `/api/blocks/mine` | Mine a new block |
| GET | `/api/chain/validate` | Validate the chain |
| GET | `/api/chain/status` | Chain status |
| POST | `/api/chain/reset` | Reset to genesis |

## Configuration

Edit `server/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
COIN=DMC
REWARD=50
GENESIS_ALLOCATION=100
MAX_TX_PER_BLOCK=5
DIFFICULTY=3
```

## Notes

- This is an **educational demo**, not a production cryptocurrency.
- Keys are generated in memory and persisted to SQLite; the database file is `server/blockchain.db`.
- The frontend is responsive and adapts to mobile/tablet/desktop screen sizes.
