"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Metrics, Platform } from "@/lib/metrics";
import { fmtCompact, fmtDay, fmtInr, fmtInrCompact, fmtInt, fmtPct } from "@/lib/format";
import { BarList, ColumnChart, LineChart } from "./charts/Charts";
import { SyntheticNote } from "./ui";

type PlatformFilter = "All" | Platform;
type Metric = "dau" | "sessions" | "revenue" | "matches";

const PLATFORMS: PlatformFilter[] = ["All", "Android", "iOS", "PC"];
const METRICS: { id: Metric; label: string; fmt: (v: number) => string; axis: (v: number) => string }[] = [
  { id: "dau", label: "DAU", fmt: fmtInt, axis: fmtCompact },
  { id: "sessions", label: "Sessions", fmt: fmtInt, axis: fmtCompact },
  { id: "matches", label: "Matches started", fmt: fmtInt, axis: fmtCompact },
  { id: "revenue", label: "Revenue (₹)", fmt: fmtInr, axis: fmtInrCompact },
];

function Card({ title, sub, children, className = "" }: { title: string; sub?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`card p-4 sm:p-5 ${className}`}>
      <h4 className="text-sm font-semibold text-fg">{title}</h4>
      {sub ? <p className="mt-0.5 text-xs text-muted">{sub}</p> : null}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Seg<T extends string>({ options, value, onChange, label }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap rounded-lg border border-line-strong bg-ink-900 p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            value === o.id ? "bg-accent text-ink-950" : "text-fg-2 hover:text-fg"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<Metrics | null>(null);
  const [error, setError] = useState(false);
  const [platform, setPlatform] = useState<PlatformFilter>("All");
  const [metric, setMetric] = useState<Metric>("dau");
  const [start, setStart] = useState("2026-09-01");
  const [end, setEnd] = useState("2026-09-30");

  useEffect(() => {
    let alive = true;
    fetch("/data/gamepulse-metrics.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j: Metrics) => {
        if (!alive) return;
        setData(j);
        setStart(j.summary.period.start);
        setEnd(j.summary.period.end);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  const dates = useMemo(() => (data ? [...new Set(data.daily.map((d) => d.date))].sort() : []), [data]);
  const first = dates[0] ?? "2026-09-01";
  const last = dates[dates.length - 1] ?? "2026-09-30";

  const presets = useMemo(() => {
    const idx = (n: number) => dates[Math.max(0, dates.length - n)] ?? first;
    return [
      { id: "all", label: "Full month", s: first, e: last },
      { id: "h1", label: "1–15 Sep", s: first, e: dates[14] ?? last },
      { id: "l14", label: "Last 14 days", s: idx(14), e: last },
      { id: "l7", label: "Last 7 days", s: idx(7), e: last },
    ];
  }, [dates, first, last]);
  const activePreset = presets.find((p) => p.s === start && p.e === end)?.id ?? "custom";

  const view = useMemo(() => {
    if (!data) return null;
    const inRange = (d: string) => d >= start && d <= end;
    const pOk = (p: Platform) => platform === "All" || p === platform;

    // Daily series
    const byDate = new Map<string, { dau: number; sessions: number; revenue: number; matches: number; completed: number }>();
    for (const r of data.daily) {
      if (!inRange(r.date) || !pOk(r.platform)) continue;
      const x = byDate.get(r.date) ?? { dau: 0, sessions: 0, revenue: 0, matches: 0, completed: 0 };
      x.dau += r.dau;
      x.sessions += r.sessions;
      x.revenue += r.revenue;
      x.matches += r.matchesStarted;
      x.completed += r.matchesCompleted;
      byDate.set(r.date, x);
    }
    const days = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const tot = days.reduce(
      (a, [, v]) => ({ dau: a.dau + v.dau, sessions: a.sessions + v.sessions, revenue: a.revenue + v.revenue, matches: a.matches + v.matches, completed: a.completed + v.completed }),
      { dau: 0, sessions: 0, revenue: 0, matches: 0, completed: 0 },
    );

    // Retention: cohorts registered in range, each Day-N only over eligible cohorts
    const ret = (["d1", "d3", "d7", "d14"] as const).map((k) => {
      let num = 0;
      let den = 0;
      for (const c of data.cohorts) {
        if (!inRange(c.cohortDate) || !pOk(c.platform) || c[k] === null) continue;
        num += c[k] as number;
        den += c.size;
      }
      return { k, rate: den ? num / den : null, den };
    });

    // Levels
    const lv = new Map<number, { s: number; f: number }>();
    for (const r of data.levels) {
      if (!inRange(r.date) || !pOk(r.platform)) continue;
      const x = lv.get(r.level) ?? { s: 0, f: 0 };
      x.s += r.started;
      x.f += r.failed;
      lv.set(r.level, x);
    }
    const levels = [...lv.entries()].sort((a, b) => a[0] - b[0]).map(([level, v]) => ({ level, started: v.s, failed: v.f, rate: v.s ? v.f / v.s : 0 }));
    const maxRate = Math.max(...levels.map((l) => l.rate), 0);

    // Revenue by segment
    const seg = new Map<string, number>();
    for (const r of data.revenueBySegment) if (inRange(r.date) && pOk(r.platform)) seg.set(r.segment, (seg.get(r.segment) ?? 0) + r.price);
    const segTotal = [...seg.values()].reduce((a, b) => a + b, 0);
    const segments = [...seg.entries()].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value, note: segTotal ? fmtPct(value / segTotal, 0) : "" }));

    // Platform comparison (date range applies; platform filter highlights)
    const plats = (["Android", "iOS", "PC"] as Platform[]).map((p) => {
      let dau = 0, rev = 0, ms = 0, mc = 0, n = 0, d7n = 0, d7d = 0;
      const seen = new Set<string>();
      for (const r of data.daily) {
        if (r.platform !== p || !inRange(r.date)) continue;
        dau += r.dau; rev += r.revenue; ms += r.matchesStarted; mc += r.matchesCompleted; seen.add(r.date);
      }
      n = seen.size;
      for (const c of data.cohorts) if (c.platform === p && inRange(c.cohortDate) && c.d7 !== null) { d7n += c.d7; d7d += c.size; }
      return { p, avgDau: n ? dau / n : 0, revenue: rev, completion: ms ? mc / ms : 0, d7: d7d ? d7n / d7d : null };
    });

    return {
      series: days.map(([x, v]) => ({ x, ...v })),
      kpi: {
        avgDau: days.length ? tot.dau / days.length : 0,
        sessions: tot.sessions,
        revenue: tot.revenue,
        completion: tot.matches ? tot.completed / tot.matches : 0,
        d7: ret.find((r) => r.k === "d7")?.rate ?? null,
        days: days.length,
      },
      ret,
      levels: levels.map((l) => ({ ...l, highlight: l.rate === maxRate && maxRate > 0 })),
      segments,
      plats,
    };
  }, [data, start, end, platform]);

  const m = METRICS.find((x) => x.id === metric)!;

  if (error) {
    return (
      <div className="card p-6 text-sm text-fg-2">
        Couldn&apos;t load the dashboard data (<code className="font-mono">/data/gamepulse-metrics.json</code>). Run the export script and redeploy.
      </div>
    );
  }

  return (
    <div id="dashboard" className="mt-16 scroll-mt-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Interactive dashboard</p>
          <h3 className="mt-2 text-xl font-semibold text-fg sm:text-2xl">GAMEPULSE · September 2026</h3>
          <p className="mt-2 max-w-2xl text-sm text-fg-2">
            Every chart below is recomputed in your browser from the exported GAMEPULSE dataset when you change a filter.
          </p>
        </div>
        <SyntheticNote>Synthetic GAMEPULSE data — not live game telemetry.</SyntheticNote>
      </div>

      {/* Filters */}
      <div className="card mt-6 flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">Platform</span>
          <Seg label="Platform filter" options={PLATFORMS.map((p) => ({ id: p, label: p }))} value={platform} onChange={setPlatform} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">Date range</span>
          <Seg
            label="Date range preset"
            options={presets.map((p) => ({ id: p.id, label: p.label }))}
            value={activePreset}
            onChange={(id) => {
              const p = presets.find((x) => x.id === id);
              if (p) {
                setStart(p.s);
                setEnd(p.e);
              }
            }}
          />
          <div className="flex items-center gap-2 text-xs text-fg-2">
            <label className="sr-only" htmlFor="dash-start">Start date</label>
            <input
              id="dash-start"
              type="date"
              min={first}
              max={end}
              value={start}
              onChange={(e) => e.target.value && setStart(e.target.value)}
              className="rounded-md border border-line-strong bg-ink-900 px-2 py-1.5 font-mono text-xs text-fg [color-scheme:dark]"
            />
            <span aria-hidden="true">→</span>
            <label className="sr-only" htmlFor="dash-end">End date</label>
            <input
              id="dash-end"
              type="date"
              min={start}
              max={last}
              value={end}
              onChange={(e) => e.target.value && setEnd(e.target.value)}
              className="rounded-md border border-line-strong bg-ink-900 px-2 py-1.5 font-mono text-xs text-fg [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {!view ? (
        <div className="mt-4 grid gap-3 md:grid-cols-5" aria-busy="true" aria-live="polite">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse" />
          ))}
          <span className="sr-only">Loading dashboard data…</span>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5" aria-live="polite">
            {[
              { k: "Avg DAU", v: fmtInt(view.kpi.avgDau), s: `${view.kpi.days} days` },
              { k: "Sessions", v: fmtCompact(view.kpi.sessions), s: "session_started" },
              { k: "Revenue", v: fmtInrCompact(view.kpi.revenue), s: fmtInr(view.kpi.revenue) },
              { k: "D7 retention", v: view.kpi.d7 === null ? "—" : fmtPct(view.kpi.d7), s: view.kpi.d7 === null ? "cohorts too recent" : "cohorts in range" },
              { k: "Match completion", v: fmtPct(view.kpi.completion), s: "completed ÷ started" },
            ].map((c) => (
              <div key={c.k} className="card p-4">
                <div className="text-xs text-muted">{c.k}</div>
                <div className="mt-1 font-mono text-xl text-fg sm:text-2xl">{c.v}</div>
                <div className="mt-0.5 text-[11px] text-muted">{c.s}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card title="Daily engagement" sub={`${m.label} per day · ${platform === "All" ? "all platforms" : platform}`} className="lg:col-span-2">
              <div className="-mt-1 mb-3">
                <Seg label="Engagement metric" options={METRICS.map((x) => ({ id: x.id, label: x.label }))} value={metric} onChange={setMetric} />
              </div>
              <LineChart
                label={`${m.label} per day`}
                data={view.series.map((d) => ({ x: d.x, y: d[metric] }))}
                format={m.axis}
                xFormat={fmtDay}
              />
              <details className="mt-3 text-xs text-fg-2">
                <summary className="cursor-pointer text-muted hover:text-fg">View as table</summary>
                <div className="mt-2 max-h-56 overflow-auto rounded-md border border-line">
                  <table className="w-full text-left font-mono">
                    <thead className="sticky top-0 bg-ink-900 text-muted">
                      <tr>
                        <th className="px-3 py-1.5 font-normal">Date</th>
                        <th className="px-3 py-1.5 text-right font-normal">DAU</th>
                        <th className="px-3 py-1.5 text-right font-normal">Sessions</th>
                        <th className="px-3 py-1.5 text-right font-normal">Matches</th>
                        <th className="px-3 py-1.5 text-right font-normal">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {view.series.map((d) => (
                        <tr key={d.x} className="border-t border-line">
                          <td className="px-3 py-1">{fmtDay(d.x)}</td>
                          <td className="px-3 py-1 text-right">{fmtInt(d.dau)}</td>
                          <td className="px-3 py-1 text-right">{fmtInt(d.sessions)}</td>
                          <td className="px-3 py-1 text-right">{fmtInt(d.matches)}</td>
                          <td className="px-3 py-1 text-right">{fmtInr(d.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </Card>

            <Card title="Cohort retention" sub="Players registered in range who returned on day N">
              <ColumnChart
                label="Retention by day"
                data={view.ret.map((r) => ({ label: r.k.toUpperCase(), value: r.rate ?? 0, display: r.rate === null ? "n/a" : undefined }))}
                format={(v) => fmtPct(v, 0)}
                color="#2dd4bf"
                showValues
                tooltip={(i) => (
                  <>
                    <div className="text-muted">{view.ret[i].k.toUpperCase()} retention</div>
                    <div className="font-mono text-sm text-fg">{view.ret[i].rate === null ? "No eligible cohorts" : fmtPct(view.ret[i].rate!)}</div>
                    <div className="text-muted">{fmtInt(view.ret[i].den)} eligible players</div>
                  </>
                )}
              />
              <p className="mt-2 text-[11px] leading-relaxed text-muted">A cohort counts toward Day N only if registration date + N ≤ 30 Sep. Short ranges and small platforms mean small cohorts — check the player count in the tooltip.</p>
            </Card>

            <Card title="Level failure rate" sub="level_failed ÷ level_started, by level" className="lg:col-span-2">
              <ColumnChart
                label="Failure rate by level"
                data={view.levels.map((l) => ({ label: String(l.level), value: l.rate, highlight: l.highlight }))}
                format={(v) => fmtPct(v, 0)}
                tooltip={(i) => (
                  <>
                    <div className="text-muted">Level {view.levels[i].level}</div>
                    <div className="font-mono text-sm text-fg">{fmtPct(view.levels[i].rate)} failed</div>
                    <div className="text-muted">
                      {fmtInt(view.levels[i].failed)} of {fmtInt(view.levels[i].started)} attempts
                    </div>
                  </>
                )}
              />
              <p className="mt-2 flex items-center gap-2 text-[11px] text-muted">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-s2" aria-hidden="true" /> Highest failure rate in the selection (labelled)
                <span className="ml-3 inline-block h-2.5 w-2.5 rounded-sm bg-s1" aria-hidden="true" /> Other levels
              </p>
            </Card>

            <Card title="Revenue by player segment" sub="INR · share of selected revenue">
              <BarList label="Revenue by segment" data={view.segments} format={fmtInrCompact} color="#3987e5" />
            </Card>
          </div>

          <Card title="Platform comparison" sub="Selected date range · the platform filter highlights a row" className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-xs text-muted">
                  <tr>
                    <th className="py-2 pr-4 font-normal">Platform</th>
                    <th className="py-2 pr-4 text-right font-normal">Avg DAU</th>
                    <th className="py-2 pr-4 text-right font-normal">Revenue</th>
                    <th className="py-2 pr-4 text-right font-normal">Match completion</th>
                    <th className="py-2 text-right font-normal">D7 retention</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {view.plats.map((p) => {
                    const on = platform === "All" || platform === p.p;
                    const maxDau = Math.max(...view.plats.map((x) => x.avgDau), 1);
                    return (
                      <tr key={p.p} className={`border-t border-line ${on ? "text-fg" : "text-muted"}`}>
                        <td className="py-2.5 pr-4 font-sans">
                          {p.p}
                          {platform === p.p ? <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-[10px] text-accent">selected</span> : null}
                        </td>
                        <td className="py-2.5 pr-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="hidden h-1.5 rounded-full bg-s1 sm:inline-block" style={{ width: `${(p.avgDau / maxDau) * 80}px`, opacity: on ? 1 : 0.4 }} aria-hidden="true" />
                            {fmtInt(p.avgDau)}
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 text-right">{fmtInrCompact(p.revenue)}</td>
                        <td className="py-2.5 pr-4 text-right">{fmtPct(p.completion)}</td>
                        <td className="py-2.5 text-right">{p.d7 === null ? "—" : fmtPct(p.d7)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <details className="card mt-4 p-4 text-sm text-fg-2">
            <summary className="cursor-pointer font-medium text-fg">Metric definitions</summary>
            <ul className="mt-3 space-y-1.5 text-xs leading-relaxed">
              <li><b className="text-fg">DAU</b> — distinct players with ≥1 <code className="font-mono">session_started</code> that day. Avg DAU = mean of daily values.</li>
              <li><b className="text-fg">Revenue</b> — sum of <code className="font-mono">price</code> on <code className="font-mono">purchase_completed</code> with status SUCCESS, in INR.</li>
              <li><b className="text-fg">D7 retention</b> — players with a session exactly 7 days after their registration date ÷ cohort size (eligible cohorts only).</li>
              <li><b className="text-fg">Match completion</b> — <code className="font-mono">match_completed</code> ÷ <code className="font-mono">match_started</code>.</li>
              <li><b className="text-fg">Level failure rate</b> — <code className="font-mono">level_failed</code> ÷ <code className="font-mono">level_started</code> per level.</li>
            </ul>
          </details>
        </>
      )}
    </div>
  );
}
