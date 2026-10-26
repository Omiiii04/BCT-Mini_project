import { useEffect, useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { StatsCards, WalletCard, BlockCard } from '../components/shared/DashboardWidgets';
import { Play, RefreshCw, Pickaxe as Mine, ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const { wallets, blocks, stats, chainStatus, validation, mineBlock, resetChain, loading } =
    useBlockchain();

  const [mineData, setMineData] = useState({ difficulty: '3', minerAddress: 'Miner' });

  const validBlocks = blocks.filter((b) => b.index === 0 || !validation.results?.[b.index]?.reasons?.length);

  const handleMine = async (e) => {
    e.preventDefault();
    await mineBlock({
      difficulty: parseInt(mineData.difficulty, 10) || 3,
      minerAddress: mineData.minerAddress || 'Miner',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm">Overview of your blockchain network state.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => resetChain({ minerAddress: 'Alice' })}
            className="btn-danger"
          >
            <ShieldAlert className="w-4 h-4 mr-2" /> Reset Chain
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Quick actions */}
      <div className="glass-panel p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Mine a Block</h2>
            <p className="text-sm text-slate-400">
              Package pending transactions into a new block with proof-of-work.
            </p>
          </div>
          <form onSubmit={handleMine} className="flex flex-col sm:flex-row gap-3">
            <select
              className="select-field w-full sm:w-auto max-w-xs"
              value={mineData.difficulty}
              onChange={(e) => setMineData({ ...mineData, difficulty: e.target.value })}
            >
              <option value="2">Easy (2 zeros)</option>
              <option value="3">Medium (3 zeros)</option>
              <option value="4">Hard (4 zeros)</option>
              <option value="5">Expert (5 zeros)</option>
            </select>
            <input
              type="text"
              className="input-field w-full sm:w-auto max-w-sm"
              placeholder="Miner address"
              value={mineData.minerAddress}
              onChange={(e) => setMineData({ ...mineData, minerAddress: e.target.value })}
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              <Mine className="w-4 h-4" /> Mine Block
            </button>
          </form>
        </div>

        {/* Chain status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="glass-panel p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Chain Status</p>
            <p className="font-medium text-white">{chainStatus.valid ? 'Valid' : 'Invalid'}</p>
            <p className="text-xs text-slate-500 mt-1">
              {chainStatus.blockCount ?? 0} blocks · {chainStatus.pendingTransactions ?? 0} pending
            </p>
          </div>
          <div className="glass-panel p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Last Hash</p>
            <p className="font-mono text-xs text-cyan-300 truncate">{chainStatus.lastBlockHash ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Recent wallets */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Wallets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wallets.slice(0, 4).length > 0 ? (
            wallets.slice(0, 4).map((w) => <WalletCard key={w.address} wallet={w} />)
          ) : (
            <p className="text-slate-400 text-sm">No wallets yet. Create one in the Wallets page.</p>
          )}
        </div>
        {wallets.length > 4 && (
          <p className="text-xs text-slate-500 mt-3">
            + {wallets.length - 4} more wallets
          </p>
        )}
      </div>

      {/* Recent blocks */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Blocks</h2>
        </div>
        <div className="space-y-3">
          {[...blocks].slice(0, 5).map((b) => {
            const v = validation.results?.[b.index];
            const isValid = !v || (v.own && v.okUpTo);
            return <BlockCard key={b.index} block={b} isValid={isValid} />;
          })}
          {blocks.length === 0 && (
            <p className="text-slate-400 text-sm py-4 text-center">No blocks yet. Mine the genesis block.</p>
          )}
        </div>
      </div>
    </div>
  );
}
