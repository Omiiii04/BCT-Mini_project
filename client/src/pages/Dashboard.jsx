import { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { StatsCards, WalletCard, BlockCard, ChainVisualizer } from '../components/shared/DashboardWidgets';
import {
  Pickaxe,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Send,
  Plus,
  Layers,
  Wrench,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmModal from '../components/shared/ConfirmModal';

export default function Dashboard() {
  const {
    wallets,
    blocks,
    mempool,
    stats,
    chainStatus,
    validation,
    mineBlock,
    resetChain,
    tamperChain,
    repairChain,
    isMining,
    isResetting,
    loading,
  } = useBlockchain();

  const [mineDifficulty, setMineDifficulty] = useState('3');
  const [selectedMiner, setSelectedMiner] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showTamperConfirm, setShowTamperConfirm] = useState(false);

  const isValid = validation?.valid;
  const reversedBlocks = [...blocks].reverse();

  const handleMine = async (e) => {
    e.preventDefault();
    const miner = selectedMiner || wallets[0]?.address || 'Miner';
    await mineBlock({
      difficulty: parseInt(mineDifficulty, 10) || 3,
      minerAddress: miner,
    });
  };

  const handleResetConfirm = async () => {
    setShowResetConfirm(false);
    await resetChain({ minerAddress: wallets[0]?.name || 'Alice' });
  };

  const handleTamperConfirm = async () => {
    setShowTamperConfirm(false);
    // Tamper with head block or block 1
    const targetBlock = blocks.length > 1 ? blocks[1].index : 0;
    await tamperChain({
      blockIndex: targetBlock,
      field: 'note',
      value: '⚠️ TAMPERED: Hacked Payload',
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Blockchain Dashboard
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isValid
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {isValid ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" /> Chain Verified
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" /> Tamper Detected
                </>
              )}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time consensus monitoring, transaction validation, and proof-of-work mining studio.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          {!isValid && (
            <button
              type="button"
              onClick={() => repairChain()}
              disabled={loading}
              className="btn-primary text-xs px-3.5 py-2"
            >
              <Wrench className="w-3.5 h-3.5" /> Heal &amp; Re-mine Chain
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            disabled={loading}
            className="btn-outline text-xs px-3.5 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20"
            title="Reset chain back to genesis"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Chain
          </button>
        </div>
      </div>

      {/* Network Tamper Alert Banner */}
      {!isValid && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-300">Cryptographic Integrity Violation Detected!</p>
              <p className="text-xs text-red-400/90 mt-0.5">
                One or more blocks fail hash or signature validation. In a decentralized network, this branch would be rejected by consensus peers.
              </p>
            </div>
          </div>
          <button
            onClick={() => repairChain()}
            disabled={loading}
            className="btn-primary text-xs whitespace-nowrap self-start sm:self-auto"
          >
            <Wrench className="w-3.5 h-3.5" /> Auto-Repair Chain
          </button>
        </div>
      )}

      {/* High-level Network Stats */}
      <StatsCards stats={stats} />

      {/* Mining Studio Card */}
      <div className="apple-card p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Pickaxe className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">Proof-of-Work Mining Studio</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Package pending transactions from the mempool into a new block by solving the SHA-256 target collision puzzle. The miner receives the block reward ({stats.reward || 50} {stats.coin || 'DMC'}).
            </p>
          </div>

          <form onSubmit={handleMine} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full lg:w-auto">
            <div className="flex-1 sm:w-44">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Miner Reward Wallet
              </label>
              <select
                className="select-field text-xs"
                value={selectedMiner}
                onChange={(e) => setSelectedMiner(e.target.value)}
                disabled={isMining}
              >
                {wallets.map((w) => (
                  <option key={w.address} value={w.address}>
                    {w.emoji || '👤'} {w.name}
                  </option>
                ))}
                <option value="Miner">Default Miner</option>
              </select>
            </div>

            <div className="sm:w-36">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Difficulty
              </label>
              <select
                className="select-field text-xs"
                value={mineDifficulty}
                onChange={(e) => setMineDifficulty(e.target.value)}
                disabled={isMining}
              >
                <option value="2">2 Zeros (Fast)</option>
                <option value="3">3 Zeros (Standard)</option>
                <option value="4">4 Zeros (Challenging)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isMining || loading}
              className="btn-primary text-xs px-5 py-2.5 shadow-apple-glow sm:self-end whitespace-nowrap"
            >
              <Pickaxe className={`w-4 h-4 ${isMining ? 'animate-spin' : ''}`} />
              {isMining ? 'Mining Block…' : 'Mine Block'}
            </button>
          </form>
        </div>

        {/* Chain Consensus Info Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/5 text-xs">
          <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Latest Block Hash</span>
            <p className="font-mono text-cyan-300 mt-1 truncate">
              {chainStatus.lastBlockHash || blocks[blocks.length - 1]?.hash || '—'}
            </p>
          </div>
          <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Pending in Mempool</span>
            <p className="font-bold text-amber-400 mt-1">
              {mempool.length} transaction{mempool.length === 1 ? '' : 's'} waiting
            </p>
          </div>
          <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Tamper Simulation</span>
              <p className="text-slate-300 mt-0.5 text-[11px]">Test chain resilience</p>
            </div>
            <button
              type="button"
              onClick={() => setShowTamperConfirm(true)}
              disabled={loading}
              className="btn-outline text-xs px-3 py-1.5 text-amber-300 hover:text-amber-200"
            >
              Tamper Block
            </button>
          </div>
        </div>
      </div>

      {/* Visual Chain Graph */}
      <div className="apple-card p-6">
        <ChainVisualizer blocks={blocks} validation={validation} />
      </div>

      {/* Two Column Grid: Wallets & Recent Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wallets Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Active Wallets</h2>
              <p className="text-xs text-slate-400">ECDSA identities and derived chain balances</p>
            </div>
            <Link to="/wallets" className="btn-outline text-xs px-3 py-1.5">
              <Plus className="w-3.5 h-3.5" /> Manage All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {wallets.slice(0, 4).map((w) => (
              <WalletCard key={w.address} wallet={w} />
            ))}
            {wallets.length === 0 && (
              <div className="col-span-full apple-card p-6 text-center text-slate-500 text-xs">
                No wallets created yet. Click Manage All to generate your first keypair.
              </div>
            )}
          </div>
        </div>

        {/* Recent Mined Blocks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Recent Blocks</h2>
              <p className="text-xs text-slate-400">Latest commitments to the distributed ledger</p>
            </div>
            <Link to="/blocks" className="btn-outline text-xs px-3 py-1.5">
              <Layers className="w-3.5 h-3.5" /> View All ({blocks.length})
            </Link>
          </div>

          <div className="space-y-3">
            {reversedBlocks.slice(0, 3).map((b) => {
              const v = validation.results?.[b.index];
              const isBlockValid = !v || (v.own && v.okUpTo);
              return (
                <BlockCard
                  key={b.index}
                  block={b}
                  isValid={isBlockValid}
                  validationResult={v}
                />
              );
            })}
            {blocks.length === 0 && (
              <div className="apple-card p-6 text-center text-slate-500 text-xs">
                No blocks mined yet. Mine the genesis block using the studio above.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset Entire Blockchain Network?"
        message="This action permanently wipes all blocks and transactions and initializes a fresh Genesis block. This action cannot be undone."
        confirmText="Reset to Genesis"
        confirmVariant="danger"
        loading={isResetting}
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
      />

      <ConfirmModal
        isOpen={showTamperConfirm}
        title="Simulate Malicious Block Tamper?"
        message="This will alter the contents of a mined block in the SQLite database without re-mining. You will witness the validation engine immediately detect the broken hash link and mark the chain invalid."
        confirmText="Simulate Tamper"
        confirmVariant="danger"
        loading={loading}
        onConfirm={handleTamperConfirm}
        onCancel={() => setShowTamperConfirm(false)}
      />
    </div>
  );
}
