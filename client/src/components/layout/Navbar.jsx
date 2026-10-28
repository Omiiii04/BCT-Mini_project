import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import {
  Compass,
  LayoutDashboard,
  Wallet,
  Send,
  Layers,
  Settings,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Database,
  Timer,
  Zap,
} from 'lucide-react';
import ConfirmModal from '../shared/ConfirmModal';

const navItems = [
  { path: '/', label: 'Overview', icon: Compass },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/wallets', label: 'Wallets', icon: Wallet },
  { path: '/transactions', label: 'Transactions', icon: Send },
  { path: '/blocks', label: 'Blocks', icon: Layers },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const { stats, validation, resetChain, isResetting, loading } = useBlockchain();
  const location = useLocation();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const isValid = validation?.valid;
  const blockCount = stats.blockCount ?? 0;
  const pendingCount = stats.pendingTransactions ?? 0;

  const handleResetConfirm = async () => {
    setShowResetConfirm(false);
    await resetChain({ minerAddress: 'Alice' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-2xl border-b border-white/10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-white group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-apple-glow group-hover:scale-105 transition-transform duration-150">
              ⛓
            </div>
            <span className="font-extrabold tracking-tight">
              BCT<span className="text-cyan-400">Mini</span>
            </span>
          </Link>

          {/* Nav Items Pill Bar */}
          <nav className="hidden md:flex items-center p-1 bg-slate-900/80 border border-white/10 rounded-xl shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-[color,background-color] duration-150 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Live Validity Pill */}
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                isValid
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
              title={isValid ? 'Cryptographic chain verification passed' : 'Block integrity mismatch detected'}
            >
              {isValid ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
              <span>{isValid ? 'Chain Valid' : 'Tampered'}</span>
            </div>

            {/* Quick Metrics */}
            <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-200 font-semibold">{blockCount}</span> blocks
              </span>
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3 text-amber-400" />
                <span className="text-slate-200 font-semibold">{pendingCount}</span> pending
              </span>
            </div>

            {/* Reset Chain Trigger */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              disabled={loading}
              className="p-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
              title="Reset chain back to genesis"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Mobile Nav Link */}
            <div className="md:hidden flex items-center gap-1">
              <Link
                to="/dashboard"
                className="btn-primary text-xs px-3 py-1.5"
              >
                App
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile secondary bar */}
        <div className="md:hidden flex items-center justify-around py-2 px-3 border-t border-white/5 bg-slate-950/90 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 p-1 ${
                  isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset Entire Blockchain Network?"
        message="This action will delete all mined blocks and confirmed transactions and re-initialize the Genesis block with fresh allocation. This cannot be undone."
        confirmText="Reset to Genesis"
        confirmVariant="danger"
        loading={isResetting}
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  );
}
