import type { ReactNode } from "react";
import { gamepulse } from "@/config/site";
import CopyButton from "./CopyButton";
import { Pill, Section, SectionHeading } from "./ui";

const KW = new Set(
  "select from where and or not group by order having with as on left join inner distinct count sum round case when then else end between filter null nullif date interval is in limit desc asc union all over partition using numeric coalesce".split(" "),
);

/** Tiny SQL highlighter → React nodes (no innerHTML). */
function highlight(sql: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(--[^\n]*)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+|[^\sA-Za-z0-9_'-]+|-)/g;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(sql))) {
    const [tok, cm, str, num, word] = m;
    const key = i++;
    if (cm) out.push(<span key={key} className="tok-cm">{tok}</span>);
    else if (str) out.push(<span key={key} className="tok-str">{tok}</span>);
    else if (num) out.push(<span key={key} className="tok-num">{tok}</span>);
    else if (word && KW.has(word.toLowerCase())) out.push(<span key={key} className="tok-kw">{tok}</span>);
    else if (word && sql[re.lastIndex] === "(") out.push(<span key={key} className="tok-fn">{tok}</span>);
    else out.push(tok);
  }
  return out;
}

const SCHEMA = `-- Illustrative schema used by the examples below (PostgreSQL)
-- events : one row per event
--   event_id TEXT, player_id TEXT, event_name TEXT, event_timestamp TIMESTAMP,
--   session_id TEXT, level_id INT, platform TEXT, game_version TEXT,
--   purchase_amount NUMERIC  -- INR, only on purchase_completed
-- players : one row per player
--   player_id TEXT, registration_date DATE, platform TEXT, country TEXT`;

const QUERIES: { title: string; window: string; denominator: string; sql: string }[] = [
  {
    title: "Daily active users (DAU)",
    window: "Each calendar day in September 2026.",
    denominator: "None — a distinct count of players with a session that day (a player with 5 sessions counts once).",
    sql: `SELECT
  event_timestamp::date            AS activity_date,
  COUNT(DISTINCT player_id)        AS dau
FROM events
WHERE event_name = 'session_started'
  AND event_timestamp >= DATE '2026-09-01'
  AND event_timestamp <  DATE '2026-10-01'   -- half-open range: no missed or double-counted midnight
GROUP BY 1
ORDER BY 1;`,
  },
  {
    title: "D1 / D7 retention by registration cohort",
    window: "Cohort = registration_date. Returned = a session exactly 1 or 7 days later.",
    denominator: "Cohort size. Only cohorts whose full D7 window falls inside the data are included.",
    sql: `WITH cohort AS (
  SELECT player_id, registration_date AS cohort_date
  FROM players
  WHERE registration_date BETWEEN DATE '2026-09-01' AND DATE '2026-09-30'
),
activity AS (                         -- one row per player per active day
  SELECT DISTINCT player_id, event_timestamp::date AS active_date
  FROM events
  WHERE event_name = 'session_started'
)
SELECT
  c.cohort_date,
  COUNT(*)                                                     AS cohort_size,
  ROUND(100.0 * COUNT(a1.player_id) / COUNT(*), 1)             AS d1_retention_pct,
  ROUND(100.0 * COUNT(a7.player_id) / COUNT(*), 1)             AS d7_retention_pct
FROM cohort c
LEFT JOIN activity a1
  ON a1.player_id = c.player_id AND a1.active_date = c.cohort_date + 1
LEFT JOIN activity a7
  ON a7.player_id = c.player_id AND a7.active_date = c.cohort_date + 7
WHERE c.cohort_date + 7 <= DATE '2026-09-30'                   -- complete D7 window only
GROUP BY c.cohort_date
ORDER BY c.cohort_date;`,
  },
  {
    title: "Level completion & failure rate",
    window: "September 2026, all attempts.",
    denominator: "level_started events for that level (attempts, not players).",
    sql: `WITH lvl AS (
  SELECT
    level_id,
    COUNT(*) FILTER (WHERE event_name = 'level_started')   AS starts,
    COUNT(*) FILTER (WHERE event_name = 'level_completed') AS completions,
    COUNT(*) FILTER (WHERE event_name = 'level_failed')    AS failures
  FROM events
  WHERE event_name IN ('level_started', 'level_completed', 'level_failed')
    AND event_timestamp >= DATE '2026-09-01'
    AND event_timestamp <  DATE '2026-10-01'
  GROUP BY level_id
)
SELECT
  level_id,
  starts,
  ROUND(100.0 * completions / NULLIF(starts, 0), 1) AS completion_rate_pct,
  ROUND(100.0 * failures    / NULLIF(starts, 0), 1) AS failure_rate_pct
FROM lvl
ORDER BY failure_rate_pct DESC;`,
  },
  {
    title: "Paying-user conversion",
    window: "September 2026.",
    denominator: "Distinct players active in the same period (not all-time registrations).",
    sql: `WITH active AS (
  SELECT DISTINCT player_id
  FROM events
  WHERE event_timestamp >= DATE '2026-09-01'
    AND event_timestamp <  DATE '2026-10-01'
),
payers AS (
  SELECT DISTINCT player_id
  FROM events
  WHERE event_name = 'purchase_completed'
    AND purchase_amount > 0
    AND event_timestamp >= DATE '2026-09-01'
    AND event_timestamp <  DATE '2026-10-01'
)
SELECT
  COUNT(a.player_id)                                        AS active_players,
  COUNT(p.player_id)                                        AS paying_players,
  ROUND(100.0 * COUNT(p.player_id) / COUNT(a.player_id), 2) AS conversion_pct
FROM active a
LEFT JOIN payers p USING (player_id);`,
  },
  {
    title: "ARPPU (average revenue per paying user)",
    window: "September 2026.",
    denominator: "Distinct paying players in the period. Purchases are de-duplicated by event_id first.",
    sql: `WITH purchases AS (                  -- guard against duplicate purchase events
  SELECT DISTINCT ON (event_id) event_id, player_id, purchase_amount
  FROM events
  WHERE event_name = 'purchase_completed'
    AND purchase_amount > 0
    AND event_timestamp >= DATE '2026-09-01'
    AND event_timestamp <  DATE '2026-10-01'
)
SELECT
  SUM(purchase_amount)                                          AS revenue_inr,
  COUNT(DISTINCT player_id)                                     AS paying_players,
  ROUND(SUM(purchase_amount) / NULLIF(COUNT(DISTINCT player_id), 0), 2) AS arppu_inr
FROM purchases;`,
  },
];

function CodeBlock({ code, title }: { code: string; title: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-ink-900">
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <span className="font-mono text-xs text-muted">{title}</span>
        <CopyButton text={code} label="Copy SQL" />
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-fg">{highlight(code)}</code>
      </pre>
    </div>
  );
}

export default function SqlShowcase() {
  return (
    <Section id="sql" className="pt-0 md:pt-0">
      <SectionHeading
        kicker="SQL showcase"
        title="Core game KPIs in SQL"
        intro={
          <p>
            Readable PostgreSQL for the metrics I use most. Each query states its time window and denominator. They use the{" "}
            <Pill tone="warn">illustrative schema</Pill> below — the real GAMEPULSE raw table keeps level and price inside a JSON{" "}
            <code className="font-mono text-fg">event_properties</code> column, so the queries need small adaptations for it. GAMEPULSE&apos;s own SQL lives in the{" "}
            <a className="text-accent underline-offset-4 hover:underline" href={`${gamepulse.repo}/tree/main/sql`} target="_blank" rel="noopener noreferrer">
              repository&apos;s sql/ folder
            </a>
            .
          </p>
        }
      />
      <CodeBlock title="schema.sql" code={SCHEMA} />
      <div className="mt-6 grid gap-6">
        {QUERIES.map((q) => (
          <article key={q.title} className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <div>
              <h3 className="font-semibold text-fg">{q.title}</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Window</dt>
                  <dd className="text-fg-2">{q.window}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Denominator</dt>
                  <dd className="text-fg-2">{q.denominator}</dd>
                </div>
              </dl>
            </div>
            <CodeBlock title={`${q.title.split(" (")[0].toLowerCase().replace(/[^a-z0-9]+/g, "_")}.sql`} code={q.sql} />
          </article>
        ))}
      </div>
    </Section>
  );
}
