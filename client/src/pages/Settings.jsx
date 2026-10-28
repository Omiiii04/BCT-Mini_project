import { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import {
  Settings as SettingsIcon,
  RotateCcw,
  Database,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  CheckCircle2,
  Info,
  Server,
} from 'lucide-react';
import ConfirmModal from '../components/shared/ConfirmModal';

export default function Settings() {
  const { stats, validation, resetChain, repairChain, isResetting, loading } = useBlockchain();
  const [confirmInput, setConfirmInput] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const isValid = validation?.valid;

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (confirmInput !== 'RESET') return;
    await resetChain({ minerAddress: 'Alice' });
    setConfirmInput('');
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Network Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Node parameters, consensus configuration, database maintenance, and cryptographic validation.
        </p>
      </div>

      {/* Network Configuration Card */}
      <div className="apple-card p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-5">
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Consensus &amp; Node Parameters</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Currency Symbol</span>
            <p className="text-base font-bold text-white font-mono">{stats.coin || 'DMC'}</p>
            <p className="text-[11px] text-slate-500">Decentralized Mini Coin</p>
          </div>

          <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Block Reward</span>
            <p className="text-base font-bold text-emerald-400 font-mono">{stats.reward || 50} DMC</p>
            <p className="text-[11px] text-slate-500">Awarded to miner upon block solve</p>
          </div>

          <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Consensus Algorithm</span>
            <p className="text-base font-bold text-cyan-400 font-mono">Proof of Work</p>
            <p className="text-[11px] text-slate-500">Target zero collision hunting</p>
          </div>

          <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Signature Scheme</span>
            <p className="text-base font-bold text-purple-400 font-mono">ECDSA P-256</p>
            <p className="text-[11px] text-slate-500">NIST prime256v1 asymmetric curves</p>
          </div>

          <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Persistence Engine</span>
            <p className="text-base font-bold text-amber-400 font-mono">SQLite (sql.js)</p>
            <p className="text-[11px] text-slate-500">WASM engine with zero build step</p>
          </div>

          <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Max Block Batch Size</span>
            <p className="text-base font-bold text-white font-mono">5 Txs / Block</p>
            <p className="text-[11px] text-slate-500">Mempool inclusion quota</p>
          </div>
        </div>
      </div>

      {/* Chain Maintenance & Self-Healing Card */}
      <div className="apple-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Chain Integrity &amp; Self-Healing</h2>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isValid
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {isValid ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            {isValid ? 'All Blocks Valid' : 'Integrity Broken'}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          The validation engine verifies every block hash, proof-of-work target, previous hash link, and digital signature across all transactions. If testing tampering, the healing engine can recalculate and re-mine valid nonces.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => repairChain()}
            disabled={loading}
            className="btn-primary text-xs px-4 py-2"
          >
            <Wrench className="w-3.5 h-3.5" /> Run Chain Health Check &amp; Re-mine
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="apple-card p-6 sm:p-7 border-red-500/30 bg-red-950/10 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-red-400" />
          <h2 className="text-base sm:text-lg font-bold text-red-300 tracking-tight">Danger Zone</h2>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Resetting the chain permanently purges all transactions and blocks from the SQLite database and generates a brand new Genesis block.
        </p>

        <form onSubmit={handleResetSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-md pt-2">
          <input
            type="text"
            className="input-field text-xs uppercase"
            placeholder="Type RESET to confirm"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            disabled={isResetting}
          />
          <button
            type="submit"
            disabled={isResetting || confirmInput !== 'RESET'}
            className="btn-danger text-xs px-4 py-2.5 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Network
          </button>
        </form>
      </div>

      {/* About System Card */}
      <div className="apple-card p-6 sm:p-7 space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">About BCT Mini Project</h3>
        </div>
        <p className="text-slate-400 leading-relaxed">
          Built as a full-stack educational blockchain starter application demonstrating real distributed ledger fundamentals: SHA-256 header hashing, ECDSA cryptographic digital signatures, and local-first persistence.
        </p>
      </div>
    </div>
  );
}
