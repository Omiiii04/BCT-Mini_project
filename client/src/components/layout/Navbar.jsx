import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import {
  Home,
  Wallet,
  Send,
  Layers as Block,
  Settings,
  RefreshCw,
  Database,
  Activity,
  Timer,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/wallets', label: 'Wallets', icon: Wallet },
  { path: '/transactions', label: 'Transactions', icon: Send },
  { path: '/blocks', label: 'Blocks', icon: Block },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const { stats, chainStatus, resetChain } = useBlockchain();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-40 glass-panel border-b border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl tracking-tight text-white"
        >
          <div className="w-7 h-7 rounded bg-cyan-500 flex items-center justify-center text-slate-900 font-bold text-xs">
            ⛓
          </div>
          <span>BCT<span className="text-cyan-400">Mini</span></span>
        </Link>

        <div className="flex-1 flex flex-wrap justify-center gap-2 sm:static sm:flex-no-wrap sm:justify-start sm:flex-1 sm:gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3" /> Blocks: <span className="text-slate-200">{stats.blockCount || 0}</span>
            </span>
            <span className="flex items-center gap-1">
              <Timer className="w-3 h-3" /> Mempool: <span className="text-slate-200">{stats.pendingTransactions || 0}</span>
            </span>
          </div>
          <button
            onClick={() => resetChain({ minerAddress: 'Alice' })}
            className="px-3 py-1.5 text-xs font-medium text-red-300 hover:text-red-200 transition-colors"
            title="Reset chain to genesis"
          >
            Reset Chain
          </button>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/80 py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
        <span>
          Educational blockchain demo — local-first, no real cryptocurrency.
        </span>
        <span>SHA-256 · ECDSA · Proof-of-Work · SQLite</span>
      </div>
    </footer>
  );
}
