import { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import {
  Send,
  Trash2,
  Clock,
  CheckCircle2,
  ArrowRight,
  Search,
  Wallet,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import CopyButton from '../components/shared/CopyButton';

export default function Transactions() {
  const {
    mempool,
    blocks,
    createTransaction,
    removeTransaction,
    wallets,
    loading,
  } = useBlockchain();

  const [tx, setTx] = useState({
    sender: '',
    recipient: '',
    amount: '',
  });

  const [activeTab, setActiveTab] = useState('mempool'); // 'mempool' | 'confirmed'
  const [search, setSearch] = useState('');

  const selectedSenderWallet = wallets.find((w) => w.address === tx.sender);
  const senderBalance = selectedSenderWallet?.balance ?? 0;

  // Calculate pending outgoing balance for selected sender in current mempool
  const pendingOutgoing = mempool
    .filter((t) => t.sender === tx.sender)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const availableSpendable = Math.max(0, senderBalance - pendingOutgoing);

  // Extract all confirmed transactions across all blocks
  const confirmedTxs = blocks.flatMap((b) =>
    (b.txs || []).map((t) => ({ ...t, blockIndex: b.index, blockHash: b.hash }))
  );

  const handleMaxAmount = () => {
    if (availableSpendable > 0) {
      setTx((prev) => ({ ...prev, amount: String(availableSpendable) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSenderWallet) return;
    const amountNum = parseInt(tx.amount, 10);
    if (!amountNum || amountNum <= 0) return;

    await createTransaction({
      senderAddress: tx.sender,
      recipientAddress: tx.recipient,
      amount: amountNum,
      privateKey: selectedSenderWallet.privateKey || selectedSenderWallet.private_key,
      publicKey: selectedSenderWallet.publicKey || selectedSenderWallet.public_key,
    });

    setTx({ sender: '', recipient: '', amount: '' });
  };

  const filteredMempool = mempool.filter(
    (t) =>
      !search ||
      (t.sender || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.recipient || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.id || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredConfirmed = confirmedTxs.filter(
    (t) =>
      !search ||
      (t.sender || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.recipient || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.id || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Transactions</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Sign and broadcast zero-trust transfers using ECDSA P-256. Pending transactions wait in the mempool until mined into a block.
        </p>
      </div>

      {/* Create Transaction Form Card */}
      <div className="apple-card p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-4">
          <Send className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Create &amp; Digitally Sign Transfer
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sender Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  From (Sender)
                </label>
                {selectedSenderWallet && (
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    Available: {availableSpendable} DMC
                  </span>
                )}
              </div>
              <select
                className="select-field text-xs"
                value={tx.sender}
                onChange={(e) => setTx({ ...tx, sender: e.target.value })}
                disabled={loading}
                required
              >
                <option value="">Select identity…</option>
                {wallets.map((w) => (
                  <option key={w.address} value={w.address}>
                    {w.emoji || '👤'} {w.name} — {w.balance ?? 0} DMC ({w.address.slice(0, 10)}…)
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Dropdown */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                To (Recipient)
              </label>
              <select
                className="select-field text-xs"
                value={tx.recipient}
                onChange={(e) => setTx({ ...tx, recipient: e.target.value })}
                disabled={loading}
                required
              >
                <option value="">Select recipient…</option>
                {wallets
                  .filter((w) => w.address !== tx.sender)
                  .map((w) => (
                    <option key={w.address} value={w.address}>
                      {w.emoji || '👤'} {w.name} ({w.address.slice(0, 10)}…)
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Amount input & Max Button */}
          <div className="max-w-xs">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Transfer Amount (DMC)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={availableSpendable || undefined}
                className="input-field text-xs pr-14"
                placeholder="1"
                value={tx.amount}
                onChange={(e) => setTx({ ...tx, amount: e.target.value })}
                disabled={loading || !tx.sender}
                required
              />
              <button
                type="button"
                onClick={handleMaxAmount}
                disabled={!selectedSenderWallet || availableSpendable <= 0}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] font-bold text-cyan-300 transition-colors disabled:opacity-30"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Balance warning */}
          {selectedSenderWallet && Number(tx.amount) > availableSpendable && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>Amount exceeds spendable balance ({availableSpendable} DMC available).</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={
                loading ||
                !tx.sender ||
                !tx.recipient ||
                !tx.amount ||
                Number(tx.amount) < 1 ||
                Number(tx.amount) > availableSpendable
              }
              className="btn-primary text-xs px-5 py-2.5 shadow-apple-glow"
            >
              <Send className="w-3.5 h-3.5" /> Sign with ECDSA &amp; Broadcast
            </button>
          </div>
        </form>
      </div>

      {/* Transactions Table & Mempool */}
      <div className="apple-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-950/60 border border-white/10 rounded-xl self-start">
            <button
              type="button"
              onClick={() => setActiveTab('mempool')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-[color,background-color] ${
                activeTab === 'mempool' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Mempool ({mempool.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('confirmed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-[color,background-color] ${
                activeTab === 'confirmed' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Confirmed ({confirmedTxs.length})</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              className="input-field pl-9 py-2 text-xs"
              placeholder="Search sender, recipient, id…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tab 1: Mempool Table */}
        {activeTab === 'mempool' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Tx ID</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Sender</th>
                  <th className="pb-3">Recipient</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredMempool.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pl-2 font-mono text-cyan-300">
                      <div className="flex items-center gap-1">
                        <span>{t.id.slice(0, 10)}…</span>
                        <CopyButton text={t.id} label="" />
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                        {t.kind || 'transfer'}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-200 truncate max-w-[160px]">
                      {t.sender || 'System'}
                    </td>
                    <td className="py-3 font-mono text-slate-200 truncate max-w-[160px]">
                      {t.recipient}
                    </td>
                    <td className="py-3 font-mono font-bold text-emerald-400">
                      {t.amount} DMC
                    </td>
                    <td className="py-3 text-right pr-2">
                      <button
                        type="button"
                        onClick={() => removeTransaction(t.id)}
                        disabled={loading}
                        className="btn-ghost text-red-400 hover:text-red-300"
                        title="Drop from mempool"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Drop
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredMempool.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                      <Clock className="w-6 h-6 mx-auto mb-2 opacity-40" />
                      Mempool is currently empty. Broadcast a transaction above to queue it.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Confirmed Transactions Table */}
        {activeTab === 'confirmed' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Block</th>
                  <th className="pb-3">Tx ID</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Sender</th>
                  <th className="pb-3">Recipient</th>
                  <th className="pb-3 text-right pr-2">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredConfirmed.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pl-2 font-mono font-bold text-cyan-400">
                      #{t.blockIndex}
                    </td>
                    <td className="py-3 font-mono text-slate-300">
                      <div className="flex items-center gap-1">
                        <span>{t.id.slice(0, 10)}…</span>
                        <CopyButton text={t.id} label="" />
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.kind === 'coinbase'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}
                      >
                        {t.kind}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-400 truncate max-w-[160px]">
                      {t.sender ? t.sender.slice(0, 12) + '…' : 'Coinbase Minter'}
                    </td>
                    <td className="py-3 font-mono text-slate-300 truncate max-w-[160px]">
                      {t.recipient ? t.recipient.slice(0, 12) + '…' : '—'}
                    </td>
                    <td className="py-3 text-right pr-2 font-mono font-bold text-emerald-400">
                      +{t.amount} DMC
                    </td>
                  </tr>
                ))}
                {filteredConfirmed.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                      No confirmed transactions on chain yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
