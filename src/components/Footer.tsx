import { site } from "@/config/site";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="text-fg-2">{site.name}</span> · {site.role} · {site.location}
        </p>
        <p className="flex items-center gap-4">
          <a href={site.github} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
            GitHub
          </a>
          <span>© {new Date().getFullYear()} {site.name}</span>
        </p>
      </div>
    </footer>
  );
}
