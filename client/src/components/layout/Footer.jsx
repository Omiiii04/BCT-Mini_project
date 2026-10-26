export default function Footer() {
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
