import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-[color,transform] duration-150 enabled:active:scale-[0.96] ${className}`}
      title={copied ? 'Copied!' : label}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
          <span className="text-[11px] text-emerald-400 font-medium">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
          {label && <span className="text-[11px]">{label}</span>}
        </>
      )}
    </button>
  );
}

