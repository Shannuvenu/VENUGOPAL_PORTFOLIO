const inr0 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const int = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export const fmtInt = (n: number) => int.format(Math.round(n));
export const fmtInr = (n: number) => inr0.format(n);
export const fmtPct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;

/** Compact Indian-style money: ₹22.9L, ₹1.2Cr */
export function fmtInrCompact(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

export function fmtCompact(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return `${Math.round(n)}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-09-14" → "14 Sep" (no Date parsing → no timezone/hydration drift) */
export function fmtDay(iso: string) {
  const [, m, d] = iso.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]}`;
}
