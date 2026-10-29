import { site } from "@/config/site";
import CopyButton from "./CopyButton";
import { IconFile, IconGithub, IconMail } from "./icons";
import { LinkButton, Section } from "./ui";

export default function Contact() {
  return (
    <Section id="contact">
      <div className="card relative overflow-hidden p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Contact</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-fg sm:text-3xl">Let&apos;s talk about player data.</h2>
        <p className="mt-4 max-w-2xl text-fg-2">
          I&apos;m looking for entry-level game analytics roles and I&apos;d value feedback on GAMEPULSE or my games. If you work in games, I&apos;d be glad to hear from you.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {site.email ? (
            <>
              <LinkButton href={`mailto:${site.email}`}>
                <IconMail width={16} height={16} /> {site.email}
              </LinkButton>
              <CopyButton text={site.email} label="Copy email" className="py-2" />
            </>
          ) : null}
          <LinkButton href={site.github} variant="ghost" external>
            <IconGithub width={16} height={16} /> GitHub
          </LinkButton>
          {site.linkedin ? (
            <LinkButton href={site.linkedin} variant="ghost" external>
              LinkedIn
            </LinkButton>
          ) : null}
          {site.resumePath ? (
            <LinkButton href={site.resumePath} variant="ghost" external>
              <IconFile width={16} height={16} /> Resume (PDF)
            </LinkButton>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
