# CLAUDE.md

Context file for Claude Code and Claude chat when working with
`denzuko/stream-assets`.

---

## Project Overview

`stream-assets` is the **media operations dashboard and CDN** for the
Dwight Spencer / denzuko / zekodun persona. It serves two purposes:

1. **OBS browser sources** — Hugo-generated HTML scenes consumed by
   Streamlabs/OBS as live browser source overlays for Twitch (`twitch.tv/zekodun`)
2. **Brand and asset dashboard** — tabbed web dashboard at
   `stream-assets.cdn.dwightaspencer.com` for managing scenes, fragments,
   bios, brand assets, and sub-document links

It is **not** a public-facing site — it is an internal operations tool,
though it is publicly accessible. Design choices reflect that: it should
feel like a dashboard, not a content site.

**Operator:** Dwight Spencer / Da Planet Security (`denzuko@dapla.net`)
**Live URL:** `https://stream-assets.cdn.dwightaspencer.com/`
**GitHub Pages fallback:** `https://denzuko.github.io/stream-assets/`

---

## Repository Layout

```
stream-assets/
├── hugo.toml                     # baseURL = stream-assets.cdn.dwightaspencer.com
├── data/
│   ├── author.yaml               # Bio variants for all platforms — mirrors dwightaspencer.com
│   ├── brand.yaml                # Canonical design tokens (source of truth)
│   ├── charity.yaml              # Active charity cause, goal, raised, cause list
│   ├── now-building.yaml         # Current work, queue, shipped
│   ├── series.yaml               # Active series, latest post
│   └── stream.yaml               # Handle, links, ticker text
├── layouts/
│   ├── index.html                # Tabbed dashboard (Scenes/Fragments/Bios/Brand/Docs)
│   ├── _default/
│   │   ├── scene-intro.html      # OBS: light, blinking cursor, liminal bg photo
│   │   ├── scene-offair.html     # OBS: dark, T-Pot dots, topbar, ticker
│   │   ├── scene-charity.html    # OBS: dark sidebar cause/goal, HTMX live
│   │   ├── scene-outro.html      # OBS: end card, links, single CTA
│   │   ├── scene-intermission.html # OBS: dark, rotating iris, ticker
│   │   └── scene-transition.html # OBS: wipe animation, inverted mark
│   ├── brand/
│   │   └── brand.html            # Living brand guide at /brand/
│   ├── fragments/
│   │   ├── now-building.html     # HTMX block: current work + queue
│   │   ├── charity-goal.html     # HTMX block: donation progress bar
│   │   ├── stream-status.html    # HTMX block: live/offline indicator
│   │   └── ticker.html           # HTMX block: scrolling links
│   └── partials/
│       ├── head.html             # fonts.css + brand.css + stream.css + theme.js + htmx
│       ├── eyemark.html          # Reusable SVG eye/lens mark partial
│       └── ticker.html           # Reusable ticker partial
├── static/
│   ├── css/
│   │   ├── brand.css             # Design tokens only — no body/reset rules
│   │   └── stream.css            # Scene base styles + [data-theme] overrides
│   ├── js/
│   │   └── theme.js              # Dark/light toggle, localStorage, BroadcastChannel
│   ├── fonts/                    # Self-hosted woff2: Bricolage Grotesque + Share Tech Mono
│   ├── img/                      # Background photos (Unsplash CC0)
│   ├── assets/                   # favicon SVG variants (a/b/c + active)
│   ├── goal.json                 # HTMX endpoint: {"raised":N,"goal":N,"pct":N}
│   ├── stats.json                # HTMX endpoint: T-Pot attack stats
│   └── CNAME                     # stream-assets.cdn.dwightaspencer.com
└── content/
    ├── brand/index.md            # Brand guide content stub
    ├── fragments/{name}.md       # Fragment content stubs
    ├── scene-{name}/index.md     # Scene content stubs
    └── tags/bbs/_index.md        # BBS Easter egg taxonomy content (unused here)
```

---

## Design System

**This repo is the canonical source for the Dwight Spencer persona design system.**
`data/brand.yaml` is the single source of truth for all tokens.
`static/css/brand.css` exports them as CSS custom properties.

### Tokens

| Token | Value | Use |
|---|---|---|
| `--cream` | `#fffdfa` | Primary background (light) |
| `--ink` | `#111111` | Primary foreground (light) |
| `--dark` | `#0d0d0b` | Dark mode background |
| `--text-dark` | `#d1fae5` | Text on dark backgrounds |
| `--green` | `#39ff14` | Monitoring signal only |
| `--amber` | `#ffab00` | Monitoring signal only |
| `--red` | `#ff1744` | Monitoring signal only |
| `--font-mono` | Share Tech Mono | Labels, handles, metadata, code |
| `--font-sans` | Bricolage Grotesque | Prose, cause names |

### Rules

- **No grid lines** as background texture — whitespace and dotted rules only
- **No gradients** — ever
- **No box shadows**
- **No border-radius > 4px** except scene container wrappers
- **`1px dotted #aaa`** (or `rgba` equivalents) for all dividers and borders
- **`brand.css` contains tokens and utility classes only** — never body/reset rules.
  Each consuming project owns its own body styles.
- Monitoring colours (green/amber/red) are off-air and T-Pot context only.
  Never use them as accent colours in editorial or scene content.

### Fonts

Self-hosted in `static/fonts/`. No Google Fonts requests.
`fonts.css` declares `@font-face` with correct `unicode-range` and
`font-variation-settings: 'opsz' 14` to match the original Google Fonts rendering.

---

## Theme System

Dark/light toggle controlled via `static/js/theme.js`.

- **Storage key:** `denzuko-stream-theme` (`light` | `dark`, default `dark`)
- **BroadcastChannel:** `stream-theme` — index toggle instantly updates all
  open scene tabs without reload
- **Index page:** toggle button in header sets theme, broadcasts to scenes
- **Scene pages:** read stored theme on load, listen for broadcast updates
- **`applyTheme()`** sets `data-theme` on `<html>` AND overrides
  `body.style.background/color` directly (wins over stylesheets).
  Also flips `.scene--light` and `.scene--dark` container backgrounds.

`[data-theme="dark"]` overrides live in `stream.css` — not `brand.css`.

---

## Fragment System

Fragments at `/fragments/{name}/` are self-contained HTML blocks.
Any surface can pull them in via HTMX:

```html
<div hx-get="https://stream-assets.cdn.dwightaspencer.com/fragments/now-building/"
     hx-trigger="load, every 30s"
     hx-swap="outerHTML">
</div>
```

**Update flow:**
1. Edit the relevant YAML file in `data/`
2. `git push` → GH Actions rebuilds → deploys in ~45s
3. All surfaces with HTMX pulls update on next poll

**Rebuild webhook (no code change needed):**
```sh
curl -X POST \
  -H "Authorization: token $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/denzuko/stream-assets/dispatches \
  -d '{"event_type":"rebuild"}'
```

---

## Data Files — What to Edit

| File | Edit when |
|---|---|
| `data/now-building.yaml` | Starting a new stream session, project ships |
| `data/charity.yaml` | Monthly charity stream changes cause or updates goal/raised |
| `data/panels.yaml` | Twitch panel copy changes (except Now Building — that's now-building.yaml) |
| `data/stream.yaml` | Ticker text changes, links update |
| `data/author.yaml` | Bio copy changes — also update `dwightaspencer.com/data/author.yaml` |
| `data/brand.yaml` | Design token changes — also update consuming sites |
| `data/series.yaml` | New post published, new series starts |

---

## OBS Setup

Each scene is a Browser Source in OBS:
- **URL:** `https://stream-assets.cdn.dwightaspencer.com/scene-{name}/`
- **Width:** 1920 · **Height:** 1080
- Check "Shutdown source when not visible"
- Check "Refresh browser when scene becomes active"

**Off-air scene layering (two sources):**
1. Browser source: `https://map.clusir-tahiti.org/` (T-Pot attack map, behind)
2. Browser source: `scene-offair` (topbar, dots, ticker, overlay)

---

## Stream Content Strategy

| Mode | Frequency | Energy |
|---|---|---|
| Off-air | Always connected | Passive/ambient — T-Pot feed |
| R&D / casual coding | Throughout week | ASMR-vibe, educational, rewatchable |
| Weekly Q&A / DevBlog | Weekly | Community, behind-the-curtain |
| Monthly charity | Monthly | Infotainment, awareness, fundraise |

**Charity causes (rotation):**
Girls Who Code · Internet Archive · 2600 · Restore The Fourth ·
Hackers for Charity · Aaron Swartz Foundation

---

## Entity Separation

- **`denzuko`** — community-facing identity (GitHub, Reddit, BMAC, self-host community)
- **`zekodun`** — anagram of denzuko; commercial-web surface (Twitch)
- **`dwightaspencer.com`** is the media outlet / personal publishing platform
- **`Da Planet Security`** is the business entity — never appears in stream-assets content
- **`dapla.net`** is Da Planet Security's infrastructure — not the Dwight Spencer persona's infrastructure

Do not mix these. stream-assets is the zekodun/denzuko surface.

---

## What Claude Should Not Do

- Do not add body/reset rules to `brand.css` — it will break consuming sites
- Do not hardcode absolute paths (`/css/`, `/js/`, `/assets/`) in layouts —
  use `relURL` for stylesheet/script links, `absURL` for card/copy/hx-get URLs
- Do not add grid lines as background texture — whitespace and dotted rules only
- Do not use monitoring colours (green/amber/red) outside off-air/T-Pot context
- Do not reference `dapla.net` infrastructure as Dwight Spencer persona assets
- Do not reference Da Planet Security in stream-assets content
- Do not add inline `style="background:#fffdfa"` hardcoded colours to scene
  containers — use `.scene--light` / `.scene--dark` classes so theme.js can flip them
- Do not serve fonts from Google Fonts — self-hosted in `static/fonts/`
- Do not add a separate `[data-theme]` override to `brand.css` for scene elements —
  those overrides live in `stream.css`
- Do not create a new tab in the dashboard without updating this CLAUDE.md
- Do not modify `data/author.yaml` bios without also updating
  `dwightaspencer.com/data/author.yaml` — they must stay in sync
