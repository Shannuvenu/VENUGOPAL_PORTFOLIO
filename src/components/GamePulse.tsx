import { gamepulse } from "@/config/site";
import { summary } from "@/lib/server-metrics";
import { fmtCompact, fmtInr, fmtInrCompact, fmtPct } from "@/lib/format";
import { IconCheck, IconGithub } from "./icons";
import { LinkButton, Pill, Section, SectionHeading, SyntheticNote } from "./ui";

export default function GamePulse() {
  const kpis = [
    { label: "Players", value: fmtCompact(summary.players), hint: "registered, Sep 2026" },
    { label: "Raw events", value: fmtCompact(summary.events), hint: `${summary.eventTypes} event types` },
    { label: "Avg DAU", value: fmtCompact(summary.avgDau), hint: "distinct players / day" },
    { label: "Sessions", value: fmtCompact(summary.sessions), hint: `avg ${summary.avgSessionMinutes.toFixed(0)} min` },
    { label: "Match completion", value: fmtPct(summary.matchCompletionRate), hint: `${fmtCompact(summary.matchesAbandoned)} abandoned` },
    { label: "D1 / D7 retention", value: `${fmtPct(summary.retention.d1, 0)} / ${fmtPct(summary.retention.d7, 0)}`, hint: "registration cohorts" },
    { label: "Revenue", value: fmtInrCompact(summary.revenueInr), hint: `${fmtCompact(summary.purchases)} purchases` },
    { label: "ARPU / ARPPU", value: `${fmtInr(summary.arpuInr)} / ${fmtInr(summary.arppuInr)}`, hint: `${fmtPct(summary.payerConversion)} payer conversion` },
  ];

  return (
    <Section id="projects">
      <SectionHeading
        kicker="Featured project"
        title="GAMEPULSE — game analytics & data engineering"
        intro={<p>{gamepulse.summary}</p>}
      />

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <LinkButton href={gamepulse.repo} external>
          <IconGithub width={16} height={16} /> View repository
        </LinkButton>
        <SyntheticNote>{gamepulse.disclosure}</SyntheticNote>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-4">
            <div className="text-xs text-muted">{k.label}</div>
            <div className="mt-1.5 font-mono text-xl text-fg sm:text-2xl">{k.value}</div>
            <div className="mt-1 text-xs text-muted">{k.hint}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        Computed from the project&apos;s raw CSVs by <code className="font-mono text-fg-2">scripts/export_gamepulse_metrics.py</code> in this site&apos;s repository. Definitions are in the dashboard below.
      </p>

      {/* Pipeline */}
      <div className="mt-14">
        <h3 className="text-lg font-semibold text-fg">Pipeline</h3>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {gamepulse.pipeline.map((p, i) => (
            <li key={p.step} className="card relative p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-accent/40 font-mono text-[11px] text-accent">{i + 1}</span>
                <span className="font-semibold text-fg">{p.step}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-fg-2">{p.detail}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-semibold text-fg">Gold tables (Databricks)</h3>
          <ul className="mt-3 space-y-1.5 font-mono text-sm text-fg-2">
            {gamepulse.goldTables.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-fg">Power BI report pages</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {gamepulse.powerBiPages.map((t) => (
              <li key={t}>
                <Pill>{t}</Pill>
              </li>
            ))}
          </ul>
          <h3 className="mt-5 font-semibold text-fg">Stack</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {gamepulse.stack.map((t) => (
              <li key={t}>
                <Pill tone="accent">{t}</Pill>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Capabilities */}
      <div className="mt-10 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-fg">Implemented</h3>
            <Pill tone="accent">Verified in repo</Pill>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {gamepulse.implemented.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-fg-2">
                <IconCheck width={16} height={16} className="mt-0.5 shrink-0 text-accent" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-fg">Potential next steps</h3>
            <Pill>Not built yet</Pill>
          </div>
          <ul className="mt-4 space-y-2">
            {gamepulse.nextSteps.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-fg-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted" aria-hidden="true" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
