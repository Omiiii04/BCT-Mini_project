export function StatsCards({ stats }) {
  const cards = [
    { label: 'Blocks', value: stats.blockCount ?? 0, icon: '🧱', color: 'text-cyan-400' },
    {
      label: 'Mempool',
      value: stats.pendingTransactions ?? 0,
      icon: '📥',
      color: 'text-yellow-400',
    },
    { label: 'Wallets', value: stats.walletCount ?? 0, icon: '👛', color: 'text-purple-400' },
    { label: 'Confirmed Tx', value: stats.confirmedTransactions ?? 0, icon: '✅', color: 'text-emerald-400' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="glass-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{card.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
            </div>
            <span className={`p-2 rounded-lg ${card.color} bg-[${card.color}]/10`}>
              {card.icon}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function WalletCard({ wallet }) {
  return (
    <div className="wallet-card">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{wallet.emoji || '👤'}</span>
        <div>
          <p className="font-semibold text-white truncate max-w-xs">{wallet.name}</p>
          <p className="text-xs text-slate-400 truncate max-w-xs mono">{wallet.address}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-emerald-400">{wallet.balance?.toLocaleString() ?? 0}</p>
        <p className="text-xs text-slate-400">DMC</p>
      </div>
    </div>
  );
}

export function BlockCard({ block, isValid = true }) {
  const borderColor = isValid ? 'border-emerald-500' : 'border-red-500';
  const txCount = block.txs ? block.txs.length : 0;

  return (
    <div className={`block-card border-l-4 ${borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs font-bold text-cyan-400">#{block.index}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isValid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {isValid ? 'VALID' : 'INVALID'}
        </span>
      </div>
      <div className="mb-2">
        <p className="text-xs text-slate-400">Miner</p>
        <p className="text-sm font-mono text-slate-200 truncate">{block.miner || '—'}</p>
      </div>
      <div className="mb-2">
        <p className="text-xs text-slate-400">Hash</p>
        <p className="text-xs font-mono text-slate-200 truncate">{block.hash}</p>
      </div>
      <div className="mb-2">
        <p className="text-xs text-slate-400">Prev Hash</p>
        <p className="text-xs font-mono text-slate-200 truncate">{block.prev_hash}</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="font-mono">Nonce: {block.nonce}</span>
        <span className="font-mono">Diff: {block.difficulty}</span>
        <span className="font-mono">Txs: {txCount}</span>
      </div>
    </div>
  );
}
