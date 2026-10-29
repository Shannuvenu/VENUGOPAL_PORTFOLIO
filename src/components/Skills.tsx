import { knowledge, skills, workflow } from "@/config/site";
import { Section, SectionHeading } from "./ui";

export default function Skills() {
  return (
    <Section id="skills">
      <SectionHeading
        kicker="Analytics skills"
        title="Tools I use, and the concepts behind them"
        intro={<p>Tools are the ones I&apos;ve used in my projects and internship. The concept cards explain the metrics I work with — they&apos;re knowledge, not claims of industry experience.</p>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {skills.map((s) => (
          <div key={s.group} className="card p-4">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-accent">{s.group}</h3>
            <ul className="mt-3 space-y-1">
              {s.items.map((i) => (
                <li key={i} className="text-sm font-medium text-fg">
                  {i}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted">{s.note}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-16 text-lg font-semibold text-fg">Game analytics concepts</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {knowledge.map((k) => (
          <div key={k.term} className="card p-4">
            <h4 className="text-sm font-semibold text-fg">{k.term}</h4>
            <p className="mt-2 text-xs leading-relaxed text-fg-2">{k.body}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-16 text-lg font-semibold text-fg">How I approach an analysis</h3>
      <ol className="mt-6 grid gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-8">
        {workflow.map((w, i) => (
          <li key={w.step} className="relative">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-accent/50 bg-accent-soft font-mono text-xs text-accent">{i + 1}</span>
              {i < workflow.length - 1 ? <span className="hidden h-px flex-1 bg-gradient-to-r from-accent/50 to-line lg:block" aria-hidden="true" /> : null}
            </div>
            <p className="mt-3 text-sm font-semibold text-fg">{w.step}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{w.detail}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
