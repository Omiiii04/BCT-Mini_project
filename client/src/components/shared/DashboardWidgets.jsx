import { useState } from 'react';
import { Layers, Database, Timer, Wallet, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';
import CopyButton from './CopyButton';
import BlockInspectorModal from './BlockInspectorModal';
import WalletKeyModal from './WalletKeyModal';

export function StatsCards({ stats }) {
  const cards = [
    {
      label: 'Chain Height',
      value: stats.blockCount ?? 0,
      sub: 'Blocks verified',
      icon: Layers,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    {
      label: 'Mempool',
      value: stats.pendingTransactions ?? 0,
      sub: 'Awaiting block',
      icon: Timer,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      label: 'Identities',
      value: stats.walletCount ?? 0,
      sub: 'ECDSA Wallets',
      icon: Wallet,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      label: 'Circulation',
      value: `${(stats.totalSupply ?? 0).toLocaleString()} ${stats.coin || 'DMC'}`,
      sub: 'Coinbase minted',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="apple-card p-5 hover:border-white/20 transition-[border-color,transform] duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-xl ${card.bg} ${card.border} border flex items-center justify-center ${card.color}`}>
                <Icon className="w-4 h-4" strokeWidth={1.75} />
              </div>
            </div>
            <div className="mt-2.5">
              <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function WalletCard({ wallet, onSelect }) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (onSelect) onSelect(wallet);
    else setShowModal(true);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="apple-card apple-card-hover p-4 cursor-pointer group flex flex-col justify-between gap-3 relative"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-150">
              {wallet.emoji || '👤'}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-white truncate text-sm tracking-tight">{wallet.name}</p>
              <p className="text-[11px] text-slate-400 font-mono truncate">{wallet.address}</p>
            </div>
          </div>
          <CopyButton text={wallet.address} label="" />
        </div>

        <div className="flex items-end justify-between pt-2 border-t border-white/5">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Balance</span>
          <div className="text-right">
            <span className="text-lg font-bold text-emerald-400 font-mono tracking-tight">
              {(wallet.balance ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 ml-1">DMC</span>
          </div>
        </div>
      </div>

      <WalletKeyModal
        wallet={wallet}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

export function BlockCard({ block, isValid = true, validationResult }) {
  const [showModal, setShowModal] = useState(false);
  const txCount = block.txs ? block.txs.length : 0;

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className={`apple-card apple-card-hover p-4 cursor-pointer border-l-4 transition-[border-color,transform] duration-150 ${
          isValid ? 'border-l-emerald-500 hover:border-l-emerald-400' : 'border-l-red-500 hover:border-l-red-400'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
              Block #{block.index}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Diff: {block.difficulty} · Nonce: {block.nonce}
            </span>
          </div>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isValid
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {isValid ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
            {isValid ? 'VALID' : 'INVALID'}
          </span>
        </div>

        <div className="space-y-1.5 text-xs mt-3">
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-400 text-[11px]">Hash:</span>
            <span className="text-cyan-300 truncate max-w-[240px]">{block.hash || '—'}</span>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-400 text-[11px]">Prev:</span>
            <span className="text-slate-500 truncate max-w-[240px]">{block.prev_hash || block.prevHash || '—'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/5 text-[11px] text-slate-400">
          <span>{txCount} transaction{txCount === 1 ? '' : 's'}</span>
          <span className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-medium">
            Inspect Block <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      <BlockInspectorModal
        block={block}
        validationResult={validationResult}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

export function ChainVisualizer({ blocks, validation }) {
  const [selectedBlock, setSelectedBlock] = useState(null);

  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" /> Live Chain Structure
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          {blocks.length} block{blocks.length === 1 ? '' : 's'} linked via SHA-256
        </span>
      </div>

      <div className="overflow-x-auto pb-3 pt-1">
        <div className="flex items-center gap-3 min-w-max">
          {blocks.map((block, i) => {
            const v = validation.results?.[block.index];
            const isValid = !v || (v.own && v.okUpTo);

            return (
              <div key={block.index} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBlock(block)}
                  className={`apple-card p-3.5 w-52 text-left transition-[border-color,transform] duration-150 hover:-translate-y-0.5 border-t-2 ${
                    isValid ? 'border-t-emerald-500 hover:border-emerald-400/50' : 'border-t-red-500 hover:border-red-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      Block #{block.index}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        isValid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {isValid ? 'Valid' : 'Tampered'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    Hash: <span className="text-slate-300">{block.hash?.slice(0, 10)}…</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    Prev: {block.prev_hash?.slice(0, 8)}…
                  </p>
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{block.txs?.length || 0} txs</span>
                    <span className="text-cyan-400">Diff {block.difficulty}</span>
                  </div>
                </button>

                {i < blocks.length - 1 && (
                  <div className="flex items-center text-slate-600 flex-shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

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
