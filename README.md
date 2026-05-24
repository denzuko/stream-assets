# stream-assets

Hugo-based stream overlay assets for `twitch.tv/zekodun`.
Deployed to GitHub Pages. Each scene is a browser source in OBS.

## Scenes

| Scene | File | Mode |
|---|---|---|
| Intro / background | `scene-intro.html` | Static image or browser source |
| Off-air | `scene-offair.html` | Browser source — T-Pot map behind it |
| Charity stream | `scene-charity.html` | Browser source — update `data/charity.yaml` |
| Outro | `scene-outro.html` | Browser source |
| Intermission | `scene-intermission.html` | Browser source |
| Transition wipe | `scene-transition.html` | Browser source, ~1s duration |

## OBS setup

Add each scene as a Browser Source:
- URL: `https://denzuko.github.io/stream-assets/scene-NAME/`
- Width: 1920 · Height: 1080
- Check "Shutdown source when not visible"
- Check "Refresh browser when scene becomes active"

For the off-air scene, layer in this order:
1. Browser source: `https://map.clusir-tahiti.org/` (T-Pot map)
2. Browser source: `scene-offair.html` (overlay — topbar, dots, ticker)

## Updating content

### Change the active charity
Edit `data/charity.yaml` — update `cause`, `description`, `raised`, `goal`, `month`.
Push to master. GH Actions redeploys in ~45s.

### Update ticker text
Edit `data/stream.yaml` → `ticker` field. Push.

### Update series reference
Edit `data/series.yaml`. Push.

## Trigger a rebuild without a code change

```sh
# Requires a GitHub personal access token with repo scope
curl -X POST \
  -H "Authorization: token YOUR_GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/denzuko/stream-assets/dispatches \
  -d '{"event_type":"rebuild"}'
```

Or use the Actions UI: Actions → Build and deploy stream assets → Run workflow.

## HTMX live endpoints (optional)

The charity scene polls `/goal.json` every 30s and off-air polls `/stats.json` every 60s.
If these files don't exist, the static values from `data/charity.yaml` are used.

To enable live updates:
- `public/goal.json` — `{"raised":380,"goal":1000,"pct":38}`
- `public/stats.json` — `{"ssh":2847,"rdp":1203,"http":891,"telnet":447}`

Update these files via a separate script or webhook from your T-Pot instance.

## Design system

Mirrors `dwightaspencer.com`:
- Background: `#fffdfa` (light) · `#0d0d0b` (dark)
- Ink: `#111`
- Dividers: `1px dotted #ccc`
- Fonts: Share Tech Mono · Bricolage Grotesque
- No grid lines — whitespace and dotted rules only
