import type { ReactNode } from "react";

export function Section({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 md:py-24 ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeading({ kicker, title, intro }: { kicker: string; title: string; intro?: ReactNode }) {
  return (
    <header className="mb-10 max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{kicker}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{title}</h2>
      {intro ? <div className="mt-4 text-base leading-relaxed text-fg-2">{intro}</div> : null}
    </header>
  );
}

export function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "accent" | "warn" }) {
  const tones = {
    default: "border-line-strong text-fg-2",
    accent: "border-accent/40 bg-accent-soft text-accent",
    warn: "border-warn/40 bg-warn/10 text-warn",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  external = false,
  download = false,
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  external?: boolean;
  download?: boolean;
  ariaLabel?: string;
}) {
  const styles =
    variant === "primary"
      ? "bg-accent text-ink-950 hover:bg-[#5eead4]"
      : "border border-line-strong text-fg hover:border-accent/60 hover:text-accent";
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...(download ? { download: "" } : {})}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${styles}`}
    >
      {children}
    </a>
  );
}

export function SyntheticNote({ children }: { children?: ReactNode }) {
  return (
    <p className="inline-flex items-start gap-2 rounded-lg border border-warn/30 bg-warn/[0.07] px-3 py-2 text-xs leading-relaxed text-[#f1c27a]">
      <svg viewBox="0 0 24 24" width="14" height="14" className="mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16h.01" />
      </svg>
      <span>{children ?? "Synthetic data — computed from the GAMEPULSE generated dataset, not live game telemetry."}</span>
    </p>
  );
}
