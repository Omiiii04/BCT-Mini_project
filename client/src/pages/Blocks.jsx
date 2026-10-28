import { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { BlockCard } from '../components/shared/DashboardWidgets';
import BlockInspectorModal from '../components/shared/BlockInspectorModal';
import { Search, Layers, ShieldCheck, ShieldAlert, Cpu, ArrowRight, LayoutGrid, List } from 'lucide-react';
import CopyButton from '../components/shared/CopyButton';

export default function Blocks() {
  const { blocks, validation, loading } = useBlockchain();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [selectedBlock, setSelectedBlock] = useState(null);

  const filtered = blocks.filter(
    (b) =>
      !search ||
      b.index.toString().includes(search) ||
      (b.miner || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.hash || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.prev_hash || '').toLowerCase().includes(search.toLowerCase())
  );

  const reversedFiltered = [...filtered].reverse();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Block Explorer</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Every block cryptographically commits to the previous block&apos;s SHA-256 hash. Click any block to inspect its pre-image header and signatures.
          </p>
        </div>

        {/* View Switcher & Search */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              className="input-field pl-9 py-2 text-xs"
              placeholder="Search index, miner, hash…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center p-1 bg-slate-900 border border-white/10 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'cards' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Card grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="apple-card p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2 w-20">Height</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Miner</th>
                <th className="pb-3">Diff</th>
                <th className="pb-3">Nonce</th>
                <th className="pb-3">Txs</th>
                <th className="pb-3 text-right">Block Hash</th>
                <th className="pb-3 text-right pr-2">Prev Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {reversedFiltered.map((b) => {
                const v = validation.results?.[b.index];
                const isValid = !v || (v.own && v.okUpTo);
                const txCount = (b.txs || []).length;

                return (
                  <tr
                    key={b.index}
                    onClick={() => setSelectedBlock(b)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 pl-2 font-mono font-bold text-cyan-400">
                      #{b.index}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isValid
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {isValid ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        {isValid ? 'Valid' : 'Tampered'}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-300 truncate max-w-[140px]">
                      {b.miner || '—'}
                    </td>
                    <td className="py-3 font-mono text-slate-400">{b.difficulty}</td>
                    <td className="py-3 font-mono text-purple-300">{b.nonce}</td>
                    <td className="py-3 font-mono text-emerald-400 font-semibold">{txCount}</td>
                    <td className="py-3 text-right font-mono text-cyan-300">
                      <div className="flex items-center justify-end gap-1">
                        <span className="truncate max-w-[140px]">{b.hash}</span>
                        <CopyButton text={b.hash} label="" />
                      </div>
                    </td>
                    <td className="py-3 text-right pr-2 font-mono text-slate-500">
                      <div className="flex items-center justify-end gap-1">
                        <span className="truncate max-w-[140px]">{b.prev_hash || b.prevHash}</span>
                        <CopyButton text={b.prev_hash || b.prevHash} label="" />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {reversedFiltered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    <Layers className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    No blocks match your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reversedFiltered.map((b) => {
            const v = validation.results?.[b.index];
            const isValid = !v || (v.own && v.okUpTo);
            return (
              <BlockCard
                key={b.index}
                block={b}
                isValid={isValid}
                validationResult={v}
              />
            );
          })}
          {reversedFiltered.length === 0 && (
            <div className="col-span-full apple-card p-12 text-center text-slate-500 text-xs">
              No matching blocks found.
            </div>
          )}
        </div>
      )}

      {/* Selected Block Inspector Modal */}
      {selectedBlock && (
        <BlockInspectorModal
          block={selectedBlock}
          validationResult={validation.results?.[selectedBlock.index]}
          isOpen={Boolean(selectedBlock)}
          onClose={() => setSelectedBlock(null)}
        />
      )}
    </div>
  );
}
