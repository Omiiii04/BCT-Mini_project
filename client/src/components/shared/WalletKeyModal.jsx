import { useEffect, useState } from 'react';
import { X, KeyRound, Eye, EyeOff, ShieldCheck, Wallet, ArrowUpRight } from 'lucide-react';
import CopyButton from './CopyButton';

export default function WalletKeyModal({ wallet, isOpen, onClose }) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !wallet) return null;

  const pubKey = wallet.publicKey || wallet.public_key || '—';
  const privKey = wallet.privateKey || wallet.private_key || '—';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md transition-opacity duration-200"
      style={{ overscrollBehavior: 'contain' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-6 text-slate-100 relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-[color,background-color] duration-150 enabled:active:scale-[0.96]"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-white/15 flex items-center justify-center text-2xl shadow-inner">
            {wallet.emoji || '👤'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{wallet.name}</h3>
            <p className="text-xs text-slate-400">ECDSA P-256 (prime256v1) Keypair</p>
          </div>
        </div>

        {/* Balance Badge */}
        <div className="p-4 bg-slate-950/60 border border-white/10 rounded-xl mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Spendable Balance</p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">
              {(wallet.balance ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">DMC</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-3 text-xs">
          {/* Address */}
          <div className="p-3 bg-slate-950/40 border border-white/10 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Address (Hash of PubKey)</span>
              <CopyButton text={wallet.address} />
            </div>
            <p className="font-mono text-cyan-300 break-all">{wallet.address}</p>
          </div>

          {/* Public Key */}
          <div className="p-3 bg-slate-950/40 border border-white/10 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Public Key (SPKI DER Hex)</span>
              <CopyButton text={pubKey} />
            </div>
            <p className="font-mono text-slate-300 break-all line-clamp-3">{pubKey}</p>
          </div>

          {/* Private Key */}
          <div className="p-3 bg-slate-950/40 border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Private Key (PKCS8 PEM)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                >
                  {showPrivateKey ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Reveal
                    </>
                  )}
                </button>
                <CopyButton text={privKey} />
              </div>
            </div>
            {showPrivateKey ? (
              <pre className="font-mono text-[11px] text-purple-300 p-2 bg-slate-950 border border-white/5 rounded-lg overflow-x-auto whitespace-pre leading-relaxed">
                {privKey}
              </pre>
            ) : (
              <div className="font-mono text-slate-500 tracking-widest py-1 select-none">
                ••••••••••••••••••••••••••••••••••••••••••••••••
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button type="button" onClick={onClose} className="btn-secondary px-4 py-2 text-xs">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

