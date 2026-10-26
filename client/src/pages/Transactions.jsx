import { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { Send, Trash2 } from 'lucide-react';

export default function Transactions() {
  const { mempool, createTransaction, removeTransaction, wallets, loading } = useBlockchain();
  const [tx, setTx] = useState({
    sender: '',
    recipient: '',
    amount: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const senderWallet = wallets.find((w) => w.address === tx.sender);
    if (!senderWallet) return;
    await createTransaction({
      senderAddress: tx.sender,
      recipientAddress: tx.recipient,
      amount: parseInt(tx.amount, 10),
      privateKey: senderWallet.privateKey,
      publicKey: senderWallet.publicKey,
    });
    setTx({ sender: '', recipient: '', amount: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
        <p className="text-slate-400 text-sm">Create and sign transfers, then mine them into a block.</p>
      </div>

      {/* Create transaction */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Create &amp; Sign Transaction</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase">From (Sender)</label>
            <select
              className="select-field"
              value={tx.sender}
              onChange={(e) => setTx({ ...tx, sender: e.target.value })}
              disabled={loading}
            >
              <option value="">Select wallet</option>
              {wallets.map((w) => (
                <option key={w.address} value={w.address}>
                  {w.name} ({w.address.slice(0, 12)}…)
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase">To (Recipient)</label>
            <select
              className="select-field"
              value={tx.recipient}
              onChange={(e) => setTx({ ...tx, recipient: e.target.value })}
              disabled={loading}
            >
              <option value="">Select wallet</option>
              {wallets.map((w) => (
                <option key={w.address} value={w.address}>
                  {w.name} ({w.address.slice(0, 12)}…)
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase">Amount (DMC)</label>
            <input
              type="number"
              min="1"
              className="input-field"
              value={tx.amount}
              onChange={(e) => setTx({ ...tx, amount: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="flex items-end col-span-1 sm:col-span-3">
            <button type="submit" className="btn-primary" disabled={loading || !tx.sender || !tx.recipient || !tx.amount}>
              <Send className="w-4 h-4 mr-2" /> Sign &amp; Add to Mempool
            </button>
          </div>
        </form>
      </div>

      {/* Mempool */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Mempool (Pending)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Sender</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Recipient</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Amount</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mempool.length > 0 ? (
                mempool.map((t) => (
                  <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 text-sm font-mono text-slate-200 truncate max-w-xs">
                      {t.sender}
                    </td>
                    <td className="py-3 text-sm font-mono text-slate-200 truncate max-w-xs">
                      {t.recipient}
                    </td>
                    <td className="py-3 text-sm font-mono text-emerald-400">
                      {t.amount} DMC
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => removeTransaction(t.id)}
                        className="btn-danger text-xs"
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                    Mempool is empty. Create a transaction above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
