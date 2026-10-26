import { useEffect, useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { BlockCard } from '../components/shared/DashboardWidgets';
import { Loader2, Search, Filter } from 'lucide-react';

export default function Blocks() {
  const { blocks, validation, loadBlocks, loading } = useBlockchain();
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  const filtered = blocks.filter(
    (b) =>
      !search ||
      b.index.toString().includes(search) ||
      (b.miner || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.hash || '').includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Blocks</h1>
          <p className="text-slate-400 text-sm">Explore the chain. Each block commits to the previous block's hash.</p>
        </div>
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="input-field w-64"
            placeholder="Search by index, miner, or hash…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-panel p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="pb-3 text-xs font-semibold text-slate-400 uppercase w-16">#</th>
              <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Miner</th>
              <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Difficulty</th>
              <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Nonce</th>
              <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Txs</th>
              <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
              <th className="pb-3 text-xs font-semibold text-slate-400 uppercase text-right">Hash</th>
              <th className="pb-3 text-xs font-semibold text-slate-400 uppercase text-right">Prev Hash</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0
              ? filtered.map((b) => {
                  const v = validation.results?.[b.index];
                  const isValid = !v || (v.own && v.okUpTo);
                  const txCount = (b.txs || []).length;
                  return (
                    <tr key={b.index} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors group">
                      <td className="py-3 text-sm font-mono text-cyan-400">#{b.index}</td>
                      <td className="py-3 text-sm font-mono text-slate-200 truncate max-w-xs">
                        {b.miner || '—'}
                      </td>
                      <td className="py-3 text-sm font-mono text-slate-300">{b.difficulty}</td>
                      <td className="py-3 text-sm font-mono text-slate-300">{b.nonce}</td>
                      <td className="py-3 text-sm font-mono text-emerald-400">
                        {txCount}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                          isValid
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {isValid ? 'Valid' : 'Invalid'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <p className="text-xs font-mono text-slate-400 truncate max-w-xs">
                          {b.hash}
                        </p>
                      </td>
                      <td className="py-3 text-right">
                        <p className="text-xs font-mono text-slate-500 truncate max-w-xs">
                          {b.prev_hash}
                        </p>
                      </td>
                    </tr>
                  );
                })
              : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-sm">
                    No blocks found.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      {blocks.length > 0 && (
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Chain Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <BlockCard key={blocks[0].index} block={blocks[0]} isValid={true} />
            {blocks.length > 1 && (
              <BlockCard
                key={blocks[blocks.length - 1].index}
                block={blocks[blocks.length - 1]}
                isValid={
                  !validation.results?.[blocks[blocks.length - 1].index]?.reasons?.length
                }
              />
            )}
            <div className="glass-panel p-4 flex flex-col justify-center items-center gap-2">
              <span className="text-xs text-slate-400 uppercase">Total Blocks</span>
              <span className="text-2xl font-bold text-white">{blocks.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
