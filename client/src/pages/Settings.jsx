import { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { Settings as SettingsIcon, RefreshCw, Database } from 'lucide-react';

export default function Settings() {
  const { resetChain, loading } = useBlockchain();
  const [confirm, setConfirm] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    if (confirm !== 'RESET') return;
    await resetChain({ minerAddress: 'Alice' });
    setConfirm('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 text-sm">Configure and manage the blockchain network.</p>
      </div>

      {/* Network config */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">Network Configuration</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase">Coin</label>
            <p className="text-sm text-white font-mono">DMC</p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase">Block Reward</label>
            <p className="text-sm text-white font-mono">50 DMC</p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase">Genesis Allocation</label>
            <p className="text-sm text-white font-mono">100 DMC</p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase">Max Tx per Block</label>
            <p className="text-sm text-white font-mono">5</p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase">Database</label>
            <p className="text-sm text-white font-mono">SQLite</p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase">Consensus</label>
            <p className="text-sm text-white font-mono">Proof of Work</p>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="glass-panel p-6 border-red-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-semibold text-white">Danger Zone</h2>
        </div>
        <p className="text-sm text-slate-400 mb-6">
          Resetting the chain will delete all blocks and transactions and create a fresh genesis block.
          This action cannot be undone.
        </p>
        <form onSubmit={handleReset} className="flex flex-col sm:flex-row gap-3 max-w-sm">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Type RESET to confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn-danger"
            disabled={loading || confirm !== 'RESET'}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Reset Chain
          </button>
        </form>
      </div>

      {/* About */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-white">About</h2>
        </div>
        <div className="space-y-2 text-sm text-slate-400">
          <p>
            <span className="text-white font-medium">BCT Mini Project</span>
            — a full-stack blockchain starter web application.
          </p>
          <p>
            <span className="text-white font-medium">Frontend:</span> React 18 + Vite + Tailwind CSS
          </p>
          <p>
            <span className="text-white font-medium">Backend:</span> Node.js + Express + SQLite
          </p>
          <p>
            <span className="text-white font-medium">Cryptography:</span> SHA-256 · ECDSA P-256 · Proof of Work
          </p>
          <p className="text-xs text-slate-500 mt-4">
            Educational demo — not a real cryptocurrency. Nothing of monetary value is stored.
          </p>
        </div>
      </div>
    </div>
  );
}
