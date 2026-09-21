# Wasel Blog Studio — Frontend

Next.js App Router UI for the MiniMax blog generation engine. White and light-blue
theme, glass surfaces, aurora background, and a live generation stage driven by SSE.

## Setup

```bash
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3332/api
npm run dev
```

Open **http://localhost:3211**. The backend must be running on port 3332 first.

## Screens

| Route | Purpose |
|---|---|
| `/` | **Studio** — hero, generator console (topic, keyword chips, depth, tone, language, image count, plus advanced controls), and a strip of recent articles. |
| `/blog/[id]` | **Live stage** while generating: progress bar, five-step rail, streaming event log, shimmering skeleton. Swaps to the **article view** on completion — hero image, stats, and Article / SEO / Images / Markdown tabs. |
| `/login` | Sign-in. Every other route redirects here when signed out, preserving the intended destination in `?next=`. |
| `/knowledge` | **Knowledge base** — paste blog URLs to crawl, see the derived niche profile, house style, content gaps, and suggested topics. "Write this one" sends a suggestion straight into the studio, prefilled. |
| `/library` | All generated articles with search and status filters. |

The generator form is populated from `GET /api/blogs/options`, so tones, lengths, aspect
ratios and available engines always match what the backend actually supports.

**Writing engine** and **Model** live in the advanced controls. Engines without an API key
are listed but disabled, and switching engine resets the model list to that provider's
default, since model ids are provider-specific.

## Design system

Tokens live in [src/app/globals.css](src/app/globals.css) under Tailwind v4's `@theme`:

- `--color-brand-*` — light blue ramp (`brand-50` → `brand-700`)
- `--color-ink-*` — deep navy text ramp
- `--color-canvas` `#f4f9ff`, `--color-hairline` `#dbe9fa`
- `glass` / `glass-strong` — frosted surfaces
- `text-gradient` — navy → blue headline fill
- `.prose-article` — article typography (headings, tables, figures, quotes, code)

## Structure

```
src/
├── app/
│   ├── page.tsx              Studio
│   ├── library/page.tsx      Library
│   ├── blog/[id]/page.tsx    Progress ⇄ article switch
│   └── globals.css           Theme + article typography
├── components/
│   ├── AuthProvider.tsx      Session restore, route guard, logout
│   ├── ReviewPanel.tsx       Approve / reject / reopen + history timeline
│   ├── KnowledgeManager.tsx  Crawl URLs, niche profile, topic suggestions
│   ├── GeneratorForm.tsx     The console
│   ├── GenerationStage.tsx   SSE progress experience
│   ├── ArticleView.tsx       Tabbed result view
│   ├── SeoPanel.tsx          Score ring, density, social copy, JSON-LD
│   └── ui.tsx                Field / Select / Toggle / Segmented / Badge
└── lib/api.ts                Typed client for the backend
```

## Auth

`AuthProvider` restores the session from `localStorage`, confirms it against `/auth/me`, and
redirects to `/login` when there is no valid session. The API client attaches the bearer
token, and on a `401` it refreshes once and retries the original request transparently — so
a 15-minute access token expiring mid-session is invisible. Concurrent 401s share a single
refresh call, because rotation means two parallel refreshes would invalidate each other.

## Notes

- Generated images are served from the backend's `/uploads`, so plain `<img>` is used
  rather than `next/image` (no loader indirection for a local, already-sized asset).
- The live stage replays persisted events before following the stream, so refreshing
  mid-generation resumes with full history instead of an empty timeline.
