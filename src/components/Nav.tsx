"use client";

import { useEffect, useState } from "react";
import { nav, site } from "@/config/site";
import { IconClose, IconFile, IconMenu } from "./icons";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const sections = nav
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );
    sections.forEach((s) => io.observe(s));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const linkCls = (id: string) =>
    `rounded-md px-3 py-2 text-sm transition-colors ${
      active === id ? "text-accent" : "text-fg-2 hover:text-fg"
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled || open ? "border-b border-line bg-ink-950/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5 font-semibold tracking-tight text-fg">
          <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-md border border-accent/40 bg-accent-soft font-mono text-xs text-accent">
            VK
          </span>
          <span>{site.name}</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={linkCls(n.id)} aria-current={active === n.id ? "true" : undefined}>
              {n.label}
            </a>
          ))}
          {site.resumePath ? (
            <a
              href={site.resumePath}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-accent/50 px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
            >
              <IconFile width={15} height={15} /> Resume
            </a>
          ) : null}
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-fg-2 hover:text-fg md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IconClose /> : <IconMenu />}
        </button>
      </nav>

      {open ? (
        <div id="mobile-menu" className="border-t border-line px-4 pb-4 md:hidden">
          <ul className="flex flex-col py-2">
            {nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} onClick={() => setOpen(false)} className={`block ${linkCls(n.id)}`}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          {site.resumePath ? (
            <a
              href={site.resumePath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent/50 px-3 py-2 text-sm font-medium text-accent"
            >
              <IconFile width={15} height={15} /> Resume (PDF)
            </a>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
