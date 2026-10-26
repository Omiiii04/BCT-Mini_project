/* Minimal SHA-256 for client-side hash display (not used for mining). */
export function sha256(input) {
  const msg = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  return crypto.subtle.digest('SHA-256', msg).then((hash) => {
    const hex = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hex;
  });
}

export function fmtHash(h) {
  if (!h) return '—';
  return h.length > 24 ? h.slice(0, 12) + '…' + h.slice(-9) : h;
}

export function fmt(n) {
  return Number(n).toLocaleString();
}

export function shortAddr(addr, len = 10) {
  if (!addr) return '—';
  return addr.slice(0, len) + '…' + addr.slice(-6);
}
