# Venugopal K — Game Analyst Portfolio

Personal portfolio built with **Next.js 15 (App Router), TypeScript and Tailwind CSS v4**. It features **GAMEPULSE**, a game analytics project with an interactive dashboard computed from the project's real (synthetic) dataset, a case study, SQL examples, and four Unity games.

- No backend, no database, no environment variables.
- Charts are hand-built SVG, so there are no chart-library dependencies.
- All content lives in **one file**: `src/config/site.ts`.

---

## 1. Run it on your computer

You need **Node.js 18.18+** (20 LTS recommended).

```bash
npm install
npm run dev          # http://localhost:3000
```

Before deploying:

```bash
npm run lint
npm run typecheck
npm run build        # production build (Vercel runs this exact command)
```

## 2. Push to GitHub

Create an **empty** repository on GitHub named `portfolio` (no README, no .gitignore). Then, inside this folder, run:

```bash
git init
git add .
git commit -m "Portfolio site"
git branch -M main
git remote add origin https://github.com/Shannuvenu/portfolio.git
git push -u origin main
```

## 3. Deploy on Vercel

1. Go to <https://vercel.com>, sign in with GitHub.
2. **Add New → Project**, then import `Shannuvenu/portfolio`.
3. Leave every setting on its default (Framework: Next.js, Build: `next build`). No environment variables are needed.
4. Click **Deploy**.
5. Copy your live URL (e.g. `https://portfolio-xyz.vercel.app`), paste it into `url` in `src/config/site.ts`, commit and push. Vercel redeploys automatically. This makes the sitemap and social previews use your real address.

---

## Editing content

| What | Where |
|---|---|
| Name, email, GitHub, LinkedIn, site URL | `src/config/site.ts` → `site` |
| Hero text, About text | `hero`, `about` |
| GAMEPULSE description, pipeline, implemented / next steps | `gamepulse` |
| Games (text, status, links) | `games` |
| Skills, concept cards, workflow | `skills`, `knowledge`, `workflow` |
| Resume | replace `public/resume.pdf` (keep the same name) |
| Social preview image | `src/app/opengraph-image.png` (1200×630) |
| Favicon | `src/app/icon.svg` |

**Empty values hide things.** If `linkedin`, `email`, `resumePath` or a game link is `""`, the matching button is not shown, so the site never has dead links.

### Adding a game's APK, source code or video

1. Upload the APK to a **GitHub Release** on that game's repo (Releases → *Create a new release* → attach the `.apk`).
2. Copy the release page URL.
3. Paste it into that game's `links.apk` in `src/config/site.ts`. Fill `links.repo`, `links.video` (YouTube) or `links.itch` the same way.

## GAMEPULSE numbers

The dashboard and KPI figures are **not typed by hand**. They come from `public/data/gamepulse-metrics.json`, which `scripts/export_gamepulse_metrics.py` computes from the GAMEPULSE raw CSVs. If you regenerate the dataset, re-run:

```bash
pip install pandas
# path to the GAMEPULSE repo's data/raw folder (CSV files are stored with Git LFS: run `git lfs pull` first)
python scripts/export_gamepulse_metrics.py ../GAMEPULSE/data/raw
```

Metric definitions (DAU, retention, ARPU, ARPPU and the others) are documented at the top of that script and on the site.

## Project structure

```
src/
  app/            layout (SEO metadata), page, sitemap, robots, icon, OG image
  components/     one file per section + charts/
  config/site.ts  ← all editable content
  lib/            formatting helpers, metric types, server-side data access
public/
  data/gamepulse-metrics.json   exported metrics (fetched by the dashboard)
  resume.pdf
scripts/
  export_gamepulse_metrics.py
```
