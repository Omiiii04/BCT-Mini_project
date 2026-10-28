import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';
import {
  ShieldCheck,
  ShieldAlert,
  Pickaxe,
  Send,
  Cpu,
  Lock,
  Layers,
  Database,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import CopyButton from '../components/shared/CopyButton';

export default function Landing() {
  const { stats, validation, chainStatus, blocks, wallets, mineBlock, isMining } = useBlockchain();
  const [quickDifficulty, setQuickDifficulty] = useState('3');
  const [demoMinedInfo, setDemoMinedInfo] = useState(null);

  const isChainValid = validation.valid;
  const blockCount = stats.blockCount ?? 0;
  const mempoolCount = stats.pendingTransactions ?? 0;
  const walletCount = stats.walletCount ?? 0;

  const handleQuickMine = async () => {
    try {
      const res = await mineBlock({
        difficulty: parseInt(quickDifficulty, 10) || 3,
        minerAddress: wallets[0]?.address || 'GenesisMiner',
      });
      setDemoMinedInfo(res);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 pt-6 pb-12">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Live Network Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-white/10 shadow-sm mb-6 text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isChainValid ? 'bg-emerald-400' : 'bg-red-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isChainValid ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
          </span>
          <span className="font-medium">
            {isChainValid ? 'Network Synchronized &amp; Cryptographically Valid' : 'Tamper Alert Detected in Chain'}
          </span>
          <span className="text-slate-600">·</span>
          <span className="font-mono text-cyan-400">{blockCount} Blocks Mined</span>
        </div>

        {/* Display Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08]">
          The Decentralized Ledger,{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            Engineered with Precision.
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Experience real SHA-256 proof-of-work mining, ECDSA digital signatures, Merkle-hashed blocks, and instant tamper detection — persisted locally in SQLite.
        </p>

        {/* Action Buttons */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link to="/dashboard" className="btn-primary text-base px-6 py-3 shadow-apple-glow">
            <Zap className="w-5 h-5 mr-1 text-slate-950" /> Launch Dashboard
          </Link>
          <Link to="/blocks" className="btn-secondary text-base px-6 py-3">
            <Layers className="w-5 h-5 mr-1 text-slate-400" /> Explore Chain
          </Link>
        </div>

        {/* Quick Metrics Bar */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl max-w-3xl mx-auto shadow-apple-card">
          <div className="p-3 text-center">
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Blocks</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">{blockCount}</p>
          </div>
          <div className="p-3 text-center border-l border-white/5">
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Mempool</p>
            <p className="text-2xl font-bold text-amber-400 font-mono mt-1">{mempoolCount}</p>
          </div>
          <div className="p-3 text-center border-l border-white/5">
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Wallets</p>
            <p className="text-2xl font-bold text-purple-400 font-mono mt-1">{walletCount}</p>
          </div>
          <div className="p-3 text-center border-l border-white/5">
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Proof of Work</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">SHA-256</p>
          </div>
        </div>
      </section>

      {/* Interactive Live Playground Widget */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="apple-card p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-white tracking-tight">Interactive Mining Playground</h2>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Test consensus proof-of-work in real time. Adjust target difficulty and watch SHA-256 hash collision hunting.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                className="select-field text-xs py-2 w-auto"
                value={quickDifficulty}
                onChange={(e) => setQuickDifficulty(e.target.value)}
              >
                <option value="2">Difficulty 2 (2 zeros)</option>
                <option value="3">Difficulty 3 (3 zeros)</option>
                <option value="4">Difficulty 4 (4 zeros)</option>
              </select>

              <button
                type="button"
                onClick={handleQuickMine}
                disabled={isMining}
                className="btn-primary text-xs py-2 px-4 shadow-apple-glow"
              >
                <Pickaxe className={`w-4 h-4 ${isMining ? 'animate-spin' : ''}`} />
                {isMining ? 'Computing Hashes…' : 'Mine Block'}
              </button>
            </div>
          </div>

          {/* Mined Result Banner */}
          {demoMinedInfo && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-emerald-300 text-xs">
                      Successfully Mined Block #{demoMinedInfo.index}!
                    </span>
                    <span className="text-[11px] text-slate-400">({demoMinedInfo.hashes} hashes evaluated)</span>
                  </div>
                  <p className="font-mono text-xs text-slate-200 break-all">
                    Hash: <span className="text-cyan-300 font-bold">{demoMinedInfo.hash}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Nonce: {demoMinedInfo.nonce} · Reward: {demoMinedInfo.reward} DMC
                  </p>
                </div>
                <CopyButton text={demoMinedInfo.hash} label="Copy Hash" />
              </div>
            </div>
          )}

          {/* Block preview carousel */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Recent Chain Commitments
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {blocks.slice(-3).reverse().map((b) => (
                <div key={b.index} className="p-3.5 bg-slate-950/60 border border-white/10 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">Block #{b.index}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                      Diff {b.difficulty}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-300 truncate">{b.hash}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Nonce: {b.nonce}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cryptographic Pillars Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Four Pillars of Cryptographic Trust
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            How this blockchain achieves mathematical immutability and zero-trust verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1 */}
          <div className="apple-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">1. SHA-256 Proof-of-Work Consensus</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every block header is deterministically serialized and hashed with an incremental nonce. The network enforces a difficulty target requiring leading zeros, making rewriting historical blocks computationally prohibitive.
            </p>
            <div className="pt-2 text-xs font-mono text-cyan-300 bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
              hash = sha256(headerString + nonce + &apos;&#125;&apos;) &lt; target
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="apple-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">2. ECDSA P-256 Digital Signatures</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Each wallet generates an elliptic curve keypair (<code className="text-purple-300">prime256v1</code>). Transactions are signed with the sender&apos;s private key and mathematically verified using their public key before entering the mempool.
            </p>
            <div className="pt-2 text-xs font-mono text-purple-300 bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
              verifySignature(pubKey, sender|recipient|amount, signature)
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="apple-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">3. Merkle &amp; Data Hash Tamper Resistance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transactions are committed via a cryptographic data hash inside the block header. Modifying a single transaction amount or recipient immediately changes the block hash, breaking the hash link to the entire subsequent chain.
            </p>
            <div className="pt-2 text-xs font-mono text-emerald-300 bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
              dataHash = sha256(JSON.stringify(blockTransactions))
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="apple-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">4. Local-First SQLite Persistence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Powered by SQLite WASM (<code className="text-amber-300">sql.js</code>), every block, wallet, and transaction survives server restarts. No heavy external database or blockchain client install is required.
            </p>
            <div className="pt-2 text-xs font-mono text-amber-300 bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
              blockchain.db · Zero external daemon dependencies
            </div>
          </div>
        </div>
      </section>

      {/* Visual Chain Architecture Diagram */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="apple-card p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Chain Architecture Overview</h3>
              <p className="text-xs text-slate-400 mt-1">
                How blocks link together cryptographically from Genesis forward.
              </p>
            </div>
            <Link to="/blocks" className="btn-outline text-xs px-3.5 py-2">
              Inspect Full Chain <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Block 0 */}
            <div className="p-4 bg-slate-950/80 border border-cyan-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-400">#0 Genesis</span>
                <span className="text-[10px] text-slate-400 font-mono">Prev: 0000…</span>
              </div>
              <p className="text-xs text-slate-300">Genesis allocation block reward.</p>
              <div className="pt-2 border-t border-white/5 font-mono text-[10px] text-cyan-300 truncate">
                Hash: {blocks[0]?.hash || '08910552a435…'}
              </div>
            </div>

            {/* Block 1 */}
            <div className="p-4 bg-slate-950/80 border border-purple-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-purple-400">#1 Transfer Block</span>
                <span className="text-[10px] text-cyan-400 font-mono">Linked to #0</span>
              </div>
              <p className="text-xs text-slate-300">Transactions packaged with PoW.</p>
              <div className="pt-2 border-t border-white/5 font-mono text-[10px] text-purple-300 truncate">
                Hash: {blocks[1]?.hash || '0009d4f050cb…'}
              </div>
            </div>

            {/* Block 2 */}
            <div className="p-4 bg-slate-950/80 border border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-400">#{blocks.length > 2 ? blocks.length - 1 : '2'} Head Block</span>
                <span className="text-[10px] text-purple-400 font-mono">Linked to #1</span>
              </div>
              <p className="text-xs text-slate-300">Latest valid head of the chain.</p>
              <div className="pt-2 border-t border-white/5 font-mono text-[10px] text-emerald-300 truncate">
                Hash: {blocks[blocks.length - 1]?.hash || '000ac51840be…'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="text-center max-w-2xl mx-auto px-4 pb-12">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Ready to Take Control?</h2>
        <p className="text-sm text-slate-400 mt-2 mb-6">
          Create cryptographic wallets, sign and broadcast transfers, and mine blocks.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/dashboard" className="btn-primary px-6 py-3 text-sm">
            Open Blockchain Dashboard
          </Link>
          <Link to="/wallets" className="btn-outline px-6 py-3 text-sm">
            Create Wallet Identity
          </Link>
        </div>
      </section>
    </div>
  );
}

