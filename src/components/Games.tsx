import type { ReactNode } from "react";
import { apkSafety, games, type Game } from "@/config/site";
import { IconCheck, IconDownload, IconExternal, IconGithub, IconPlay, IconShield } from "./icons";
import { Pill, Section, SectionHeading } from "./ui";

function Links({ g }: { g: Game }) {
  const items = [
    g.links.repo && { href: g.links.repo, label: "Source", icon: <IconGithub width={14} height={14} /> },
    g.links.itch && { href: g.links.itch, label: "Play in browser", icon: <IconExternal width={14} height={14} /> },
    g.links.video && { href: g.links.video, label: "Gameplay video", icon: <IconPlay width={14} height={14} /> },
  ].filter(Boolean) as { href: string; label: string; icon: ReactNode }[];
  if (!items.length && !g.links.apk) return null;
  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-2">
        {g.links.apk ? (
          <a
            href={g.links.apk}
            download
            rel="noopener"
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-xs font-semibold text-ink-950 transition-colors hover:bg-[#5eead4]"
          >
            <IconDownload width={14} height={14} /> Download APK{g.apkSize ? ` · ${g.apkSize}` : ""}
          </a>
        ) : null}
        {items.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-line-strong px-3 py-1.5 text-xs font-medium text-fg-2 transition-colors hover:border-accent/60 hover:text-accent"
          >
            {l.icon} {l.label}
          </a>
        ))}
      </div>
      {g.links.apk && g.dataNote ? (
        <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted">
          <IconShield width={13} height={13} className="mt-0.5 shrink-0 text-accent" />
          <span>{g.dataNote}</span>
        </p>
      ) : null}
    </div>
  );
}

function Featured({ g }: { g: Game }) {
  return (
    <article className="card overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[1.2fr_1fr]">
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="accent">Secondary project</Pill>
            <Pill>{g.engine}</Pill>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-fg">{g.name}</h3>
          <p className="text-sm text-muted">
            {g.genre} · {g.status}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-fg-2">{g.summary}</p>
          <h4 className="mt-5 text-xs font-medium uppercase tracking-wide text-muted">What I built</h4>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {g.built.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-fg-2">
                <IconCheck width={15} height={15} className="mt-0.5 shrink-0 text-accent" />
                {b}
              </li>
            ))}
          </ul>
          <Links g={g} />
        </div>
        <div className="border-t border-line bg-ink-900/60 p-6 lg:border-l lg:border-t-0">
          <h4 className="text-sm font-semibold text-fg">Analytics in the game</h4>
          <p className="mt-1 text-xs text-muted">Building the game is how I learn where instrumentation belongs.</p>
          <div className="mt-4">
            <Pill tone="accent">Implemented</Pill>
            <ul className="mt-2 space-y-1.5">
              {g.telemetryImplemented.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-fg-2">
                  <IconCheck width={15} height={15} className="mt-0.5 shrink-0 text-accent" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-5">
            <Pill>Planned telemetry</Pill>
            <ul className="mt-2 space-y-1.5">
              {g.telemetryPlanned.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-fg-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}

function Small({ g }: { g: Game }) {
  return (
    <article className="card flex flex-col p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Pill>{g.engine}</Pill>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-fg">{g.name}</h3>
      <p className="text-xs text-muted">
        {g.genre} · {g.status}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-fg-2">{g.summary}</p>
      <ul className="mt-3 space-y-1">
        {g.built.map((b) => (
          <li key={b} className="flex items-start gap-2 text-xs text-fg-2">
            <IconCheck width={13} height={13} className="mt-0.5 shrink-0 text-accent" />
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t border-line pt-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Planned analytics</p>
        <p className="mt-1 text-xs text-fg-2">{g.telemetryPlanned.join(" · ")}</p>
      </div>
      <div className="mt-auto">
        <Links g={g} />
      </div>
    </article>
  );
}

export default function Games() {
  const featured = games.filter((g) => g.featured);
  const rest = games.filter((g) => !g.featured);
  return (
    <Section id="games">
      <SectionHeading
        kicker="Game development"
        title="I build games, too"
        intro={
          <p>
            Making games in Unity teaches me what an analyst can&apos;t see in a table: why a room feels unfair, where a player hesitates, and which events are worth logging. These are personal projects — status and analytics are described as they are today.
          </p>
        }
      />
      {games.some((g) => g.links.apk) ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm leading-relaxed text-fg-2">
          <IconShield width={18} height={18} className="mt-0.5 shrink-0 text-accent" />
          <p>{apkSafety}</p>
        </div>
      ) : null}
      <div className="space-y-4">
        {featured.map((g) => (
          <Featured key={g.name} g={g} />
        ))}
        <div className="grid gap-4 md:grid-cols-3">
          {rest.map((g) => (
            <Small key={g.name} g={g} />
          ))}
        </div>
      </div>
    </Section>
  );
}
