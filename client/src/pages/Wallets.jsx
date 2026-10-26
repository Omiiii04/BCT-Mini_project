import { useEffect, useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { WalletCard } from '../components/shared/DashboardWidgets';
import { UserPlus, Plus, Trash2, Loader2 } from 'lucide-react';

export default function Wallets() {
  const { wallets, createWallet, loading } = useBlockchain();
  const [name, setName] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createWallet(name.trim());
    setName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Wallets</h1>
          <p className="text-slate-400 text-sm">Manage identities and view balances derived from the chain.</p>
        </div>
        <button
          onClick={() => {}}
          className="btn-outline hidden sm:flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Create wallet form */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Create New Wallet</h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 max-w-md">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Wallet name (e.g. Alice)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={loading || !name.trim()}>
            <Plus className="w-4 h-4" /> Create
          </button>
        </form>
      </div>

      {/* Wallet list */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Your Wallets</h2>
          <span className="text-xs text-slate-400">{wallets.length} wallet(s)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.length > 0 ? (
            wallets.map((w) => <WalletCard key={w.address} wallet={w} />)
          ) : (
            <div className="col-span-full py-8 text-center">
              <p className="text-slate-500 text-sm">No wallets yet.</p>
              <p className="text-xs text-slate-600 mt-1">Create one above to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
