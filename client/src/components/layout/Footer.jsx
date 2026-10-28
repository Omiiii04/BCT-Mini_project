import { Layers, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-xl py-8 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">BCT Mini Project</span>
            <span>·</span>
            <span>Educational Blockchain Starter Application</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>SHA-256</span>
            <span>·</span>
            <span>ECDSA P-256</span>
            <span>·</span>
            <span>Proof of Work</span>
            <span>·</span>
            <span>SQLite WASM</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-500">
          <p>Local-first architectural demonstration. No real financial assets or external tokens stored.</p>
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:text-slate-300 transition-colors">Overview</Link>
            <Link to="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
            <Link to="/blocks" className="hover:text-slate-300 transition-colors">Blocks</Link>
            <Link to="/settings" className="hover:text-slate-300 transition-colors">Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
