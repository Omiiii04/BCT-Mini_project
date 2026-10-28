import { useEffect, useState } from 'react';
import { X, Layers, ShieldCheck, ShieldAlert, Cpu, Hash, Clock, FileCode, ArrowRight, AlertTriangle } from 'lucide-react';
import CopyButton from './CopyButton';
import { useBlockchain } from '../../context/BlockchainContext';

export default function BlockInspectorModal({ block, validationResult, isOpen, onClose }) {
  const { tamperChain, repairChain, loading } = useBlockchain();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'raw'
  const [tamperValue, setTamperValue] = useState('');
  const [tamperField, setTamperField] = useState('note');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !block) return null;

  const isValid = !validationResult || (validationResult.own && validationResult.okUpTo);
  const reasons = validationResult?.reasons || [];
  const txs = block.txs || [];

  const rawHeader = {
    index: block.index,
    timestamp: block.timestamp,
    note: block.note,
    dataHash: block.data_hash || block.dataHash,
    prevHash: block.prev_hash || block.prevHash,
    nonce: block.nonce,
  };

  const handleTamper = async () => {
    await tamperChain({
      blockIndex: block.index,
      field: tamperField,
      value: tamperValue || 'TAMPERED_HASH_PAYLOAD',
    });
  };

  const handleRepair = async () => {
    await repairChain();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md transition-opacity duration-200"
      style={{ overscrollBehavior: 'contain' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Block #{block.index}</h3>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isValid
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}
                >
                  {isValid ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" /> Valid &amp; Verified
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5" /> Invalid / Tampered
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Mined {new Date(block.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-[color,background-color] duration-150 enabled:active:scale-[0.96]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invalid warning if tampered */}
        {!isValid && reasons.length > 0 && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-5 py-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-300 space-y-1">
                <p className="font-semibold text-red-200">Validation Failures Detected:</p>
                {reasons.map((r, i) => (
                  <p key={i}>• {r}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-white/5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview &amp; Transactions ({txs.length})
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeTab === 'raw'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw Header JSON
          </button>
          <button
            onClick={() => setActiveTab('tamper')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeTab === 'tamper'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Tamper Testing Lab
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {activeTab === 'overview' && (
            <>
              {/* Hashes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950/60 border border-white/10 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Block Hash
                    </span>
                    <CopyButton text={block.hash} label="" />
                  </div>
                  <p className="font-mono text-cyan-300 break-all">{block.hash || '—'}</p>
                </div>

                <div className="p-3 bg-slate-950/60 border border-white/10 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Previous Block Hash
                    </span>
                    <CopyButton text={block.prev_hash || block.prevHash} label="" />
                  </div>
                  <p className="font-mono text-slate-400 break-all">{block.prev_hash || block.prevHash || '—'}</p>
                </div>

                <div className="p-3 bg-slate-950/60 border border-white/10 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Data (Merkle) Hash
                    </span>
                    <CopyButton text={block.data_hash || block.dataHash} label="" />
                  </div>
                  <p className="font-mono text-slate-300 break-all">{block.data_hash || block.dataHash || '—'}</p>
                </div>

                <div className="p-3 bg-slate-950/60 border border-white/10 rounded-xl space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Miner &amp; Reward
                  </span>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-200 truncate max-w-[180px]">{block.miner || '—'}</span>
                    <span className="text-emerald-400 font-semibold">{block.reward || 50} DMC</span>
                  </div>
                </div>
              </div>

              {/* Proof-of-Work Metrics */}
              <div className="p-3.5 bg-slate-800/40 border border-white/10 rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300">Target Difficulty:</span>
                  <span className="font-mono font-bold text-cyan-400">{block.difficulty} leading zeros</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-300">Winning Nonce:</span>
                  <span className="font-mono font-bold text-purple-300">{block.nonce}</span>
                </div>
              </div>

              {/* Note / Memo */}
              {block.note && (
                <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Block Memo
                  </span>
                  <p className="text-slate-200 mt-1">{block.note}</p>
                </div>
              )}

              {/* Transactions in Block */}
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2.5">
                  Transactions In Block ({txs.length})
                </h4>
                <div className="space-y-2">
                  {txs.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-slate-950/60 border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              tx.kind === 'coinbase'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            }`}
                          >
                            {tx.kind}
                          </span>
                          <span className="font-mono text-slate-400 text-[11px] truncate">{tx.id}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                          <span>{tx.sender ? tx.sender.slice(0, 10) + '…' : 'System'}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span>{tx.recipient ? tx.recipient.slice(0, 10) + '…' : '—'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-emerald-400 text-sm">{tx.amount} DMC</p>
                        {tx.signature && (
                          <span className="text-[10px] text-slate-500 font-mono">ECDSA Signed</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {txs.length === 0 && (
                    <p className="text-slate-500 py-3 text-center">No transactions linked to this block record.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Canonical SHA-256 Pre-image Header:</span>
                <CopyButton text={JSON.stringify(rawHeader, null, 2)} label="Copy JSON" />
              </div>
              <pre className="p-4 bg-slate-950 border border-white/10 rounded-xl font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
                {JSON.stringify(rawHeader, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'tamper' && (
            <div className="space-y-4">
              <p className="text-slate-300 leading-relaxed">
                Demonstrate the fundamental blockchain property of <strong className="text-white">cryptographic immutability</strong>. Modifying even one byte of this block causes its hash to change, breaking the cryptographic link to the next block and invalidating the entire chain!
              </p>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-3">
                <h5 className="font-semibold text-amber-300">Simulate Tampering</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 mb-1 block">Target Field</label>
                    <select
                      className="select-field text-xs"
                      value={tamperField}
                      onChange={(e) => setTamperField(e.target.value)}
                    >
                      <option value="note">Block Memo / Note</option>
                      <option value="transaction">Transaction Amount</option>
                      <option value="hash">Block Hash (Fudge)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 mb-1 block">Altered Value</label>
                    <input
                      type="text"
                      className="input-field text-xs"
                      placeholder="e.g. 99999 or Hacked"
                      value={tamperValue}
                      onChange={(e) => setTamperValue(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTamper}
                    disabled={loading}
                    className="btn-danger text-xs px-4 py-2"
                  >
                    Simulate Tamper
                  </button>
                  <button
                    type="button"
                    onClick={handleRepair}
                    disabled={loading}
                    className="btn-outline text-xs px-4 py-2"
                  >
                    Repair &amp; Re-mine
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>SHA-256 Proof-of-Work</span>
          <button onClick={onClose} className="btn-secondary text-xs px-4 py-1.5">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

