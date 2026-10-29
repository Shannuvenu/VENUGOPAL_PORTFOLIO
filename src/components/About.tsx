import { about } from "@/config/site";
import { Section, SectionHeading } from "./ui";

export default function About() {
  return (
    <Section id="about">
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <SectionHeading kicker="About" title="Why game analytics" />
          <div className="space-y-5 text-base leading-relaxed text-fg-2">
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
        <dl className="card divide-y divide-line self-start">
          {about.facts.map((f) => (
            <div key={f.label} className="px-5 py-4">
              <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">{f.label}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-fg">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
