import { gamepulse, hero, site } from "@/config/site";
import { summary } from "@/lib/server-metrics";
import { fmtCompact, fmtPct } from "@/lib/format";
import { IconArrowRight, IconGithub } from "./icons";
import { LinkButton } from "./ui";

/** Abstract retention-curve illustration. Curve shape uses the real (synthetic-data) D1–D14 retention. */
function HeroVisual() {
  const r = summary.retention;
  const pts: [number, number][] = [
    [0, 1],
    [1, r.d1],
    [3, r.d3],
    [7, r.d7],
    [14, r.d14],
  ];
  const W = 520;
  const H = 300;
  const x = (d: number) => 30 + (d / 14) * (W - 60);
  const y = (v: number) => 30 + (1 - v) * (H - 70);
  const path = (scale: number) =>
    pts
      .map(([d, v], i) => {
        const vv = i === 0 ? v : Math.min(1, v * scale);
        return `${i === 0 ? "M" : "L"}${x(d).toFixed(1)},${y(vv).toFixed(1)}`;
      })
      .join(" ");
  const layers = [1.35, 1.15, 1, 0.85, 0.7];

  return (
    <figure className="relative" aria-labelledby="hero-fig-cap">
      <div className="card relative overflow-hidden p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted">
          <span>Cohort retention · D0 → D14</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" /> GAMEPULSE
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Abstract illustration of player retention curves declining from day 0 to day 14">
          {[0, 0.25, 0.5, 0.75, 1].map((g) => (
            <line key={g} x1={30} x2={W - 30} y1={y(g)} y2={y(g)} stroke="rgb(148 163 184 / 0.10)" strokeDasharray="2 6" />
          ))}
          {layers.map((s, i) => (
            <path
              key={s}
              d={path(s)}
              fill="none"
              stroke={s === 1 ? "#2dd4bf" : "#3987e5"}
              strokeOpacity={s === 1 ? 1 : 0.18 + i * 0.04}
              strokeWidth={s === 1 ? 2.5 : 1.5}
              strokeLinejoin="round"
              className="draw-line"
            />
          ))}
          {pts.map(([d, v]) => (
            <g key={d}>
              <circle cx={x(d)} cy={y(v)} r={5} fill="#080b12" stroke="#2dd4bf" strokeWidth={2} />
              <text x={x(d)} y={H - 18} textAnchor="middle" fill="#8b98ad" fontSize="12" fontFamily="var(--font-mono)">
                D{d}
              </text>
            </g>
          ))}
          <text x={x(7) + 10} y={y(r.d7) - 12} fill="#e7ebf3" fontSize="13" fontFamily="var(--font-mono)">
            D7 {fmtPct(r.d7, 0)}
          </text>
        </svg>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
          {[
            { k: "Players", v: fmtCompact(summary.players) },
            { k: "Events", v: fmtCompact(summary.events) },
            { k: "Event types", v: String(summary.eventTypes) },
          ].map((s) => (
            <div key={s.k}>
              <div className="font-mono text-base text-fg sm:text-lg">{s.v}</div>
              <div className="text-[11px] uppercase tracking-wide text-muted">{s.k}</div>
            </div>
          ))}
        </div>
      </div>
      <figcaption id="hero-fig-cap" className="mt-2 text-xs text-muted">
        Shape drawn from GAMEPULSE retention on synthetic data — an illustration, not live telemetry.
      </figcaption>
    </figure>
  );
}

export default function Hero() {
  return (
    <div id="top" className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-32 sm:px-6 md:pt-40 lg:grid-cols-[1.1fr_1fr]">
        <div className="fade-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-ink-850/70 px-3 py-1 text-xs text-fg-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.1] tracking-tight text-fg sm:text-5xl">{hero.heading}</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-fg-2">{hero.sub}</p>
          <p className="mt-4 text-sm text-muted">
            {site.name} · BCA 2026 · {site.location}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="#projects">
              Explore GAMEPULSE <IconArrowRight width={16} height={16} />
            </LinkButton>
            <LinkButton href={site.github} variant="ghost" external>
              <IconGithub width={16} height={16} /> View GitHub
            </LinkButton>
          </div>
          <p className="mt-6 text-xs text-muted">
            Featured project:{" "}
            <a href={gamepulse.repo} target="_blank" rel="noopener noreferrer" className="text-fg-2 underline decoration-line-strong underline-offset-4 hover:text-accent">
              {gamepulse.repo.replace("https://", "")}
            </a>
          </p>
        </div>
        <div className="fade-up [animation-delay:150ms]">
          <HeroVisual />
        </div>
      </div>
    </div>
  );
}
