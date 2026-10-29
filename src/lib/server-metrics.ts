/**
 * Server-only access to the exported GAMEPULSE metrics.
 * Imported only by Server Components, so the full JSON is never shipped in the JS bundle.
 * (The interactive dashboard fetches /data/gamepulse-metrics.json on demand instead.)
 */
import raw from "../../public/data/gamepulse-metrics.json";
import type { Metrics } from "./metrics";

const metrics = raw as unknown as Metrics;

export const summary = metrics.summary;
export const returners = metrics.returnersVsChurners;
export const failureReasons = metrics.failureReasons;
export const failureReasonsByLevel = metrics.failureReasonsByLevel;

export const levelTotals = (() => {
  const m = new Map<number, { started: number; completed: number; failed: number }>();
  for (const r of metrics.levels) {
    const x = m.get(r.level) ?? { started: 0, completed: 0, failed: 0 };
    x.started += r.started;
    x.completed += r.completed;
    x.failed += r.failed;
    m.set(r.level, x);
  }
  return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([level, v]) => ({ level, ...v, failRate: v.failed / v.started }));
})();

export const segmentRevenue = (() => {
  const m = new Map<string, number>();
  for (const r of metrics.revenueBySegment) m.set(r.segment, (m.get(r.segment) ?? 0) + r.price);
  const total = [...m.values()].reduce((a, b) => a + b, 0);
  return [...m.entries()].map(([segment, revenue]) => ({ segment, revenue, share: revenue / total })).sort((a, b) => b.revenue - a.revenue);
})();
