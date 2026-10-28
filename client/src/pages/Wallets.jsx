import { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { WalletCard } from '../components/shared/DashboardWidgets';
import { UserPlus, Plus, Download, Search, Shield, KeyRound, Wallet as WalletIcon } from 'lucide-react';

export default function Wallets() {
  const { wallets, createWallet, loading, addToast } = useBlockchain();
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('👤');
  const [search, setSearch] = useState('');

  const emojiOptions = ['👤', '🦊', '⚡', '💎', '🚀', '🔮', '🛡️', '🦁', '🌟', '🍀'];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createWallet(name.trim(), selectedEmoji);
    setName('');
  };

  const handleExport = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(wallets, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `wallets-backup-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast('success', 'Wallets Exported', 'Downloaded cryptographic keypair backup file.');
    } catch (e) {
      console.error(e);
    }
  };

  const filteredWallets = wallets.filter(
    (w) =>
      !search ||
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Wallets</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage ECDSA P-256 identities. Balances are derived directly from the valid chain history.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={wallets.length === 0}
          className="btn-outline text-xs px-3.5 py-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export Backup
        </button>
      </div>

      {/* Create Wallet Card */}
      <div className="apple-card p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Generate New Identity</h2>
        </div>

        <form onSubmit={handleCreate} className="space-y-4 max-w-xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Emoji Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 border border-white/10 rounded-xl overflow-x-auto">
              {emojiOptions.slice(0, 5).map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-transform duration-100 ${
                    selectedEmoji === emoji ? 'bg-white/20 scale-110 shadow-sm' : 'hover:bg-white/5 opacity-70'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <input
              type="text"
              className="input-field flex-1"
              placeholder="Identity name (e.g. Carol, Treasury, Validator)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              maxLength={24}
            />

            <button
              type="submit"
              className="btn-primary text-xs px-5 py-2.5 whitespace-nowrap shadow-apple-glow"
              disabled={loading || !name.trim()}
            >
              <Plus className="w-4 h-4" /> Create Wallet
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Keys are generated locally using the standard <code className="text-slate-400">prime256v1</code> NIST curve.
          </p>
        </form>
      </div>

      {/* Wallets Listing */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Registered Identities</h2>
            <p className="text-xs text-slate-400">{wallets.length} wallet(s) active on this node</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              className="input-field pl-9 py-2 text-xs"
              placeholder="Search by name or address…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWallets.map((w) => (
            <WalletCard key={w.address} wallet={w} />
          ))}
          {filteredWallets.length === 0 && (
            <div className="col-span-full apple-card p-12 text-center text-slate-500 text-xs">
              <WalletIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-slate-400">No matching wallets found</p>
              <p className="mt-1">Try a different search query or create a new wallet above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
