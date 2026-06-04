# Off Season AR

WebAR demo for the Founder Inc Off Season application. Captures a real space with iPhone, distributes the spatial experience through a single URL, attaches Polymetron glass-box reasoning to surfaces.

## Wedge

Founder Inc's spatial computing portfolio covers content (LensAI), face (Theo Vision), lens (Braintrance), and broader AI (Imagine AI). None work on **what's being built**. Construction Tech + 3D vision for the built environment is the gap. Polymetron fills it with a reasoning layer that survives technical due diligence — every claim cites real code, real zoning, real public data.

## Stack

- `<model-viewer>` (Google, MIT) — 3D viewer in browser
- AR Quick Look (native iOS) — spatial walkaround on iPhone
- Plain HTML/CSS/JS, no build step, CDN-only
- Cloudflare Pages — hosting

## File layout

```
offseason-ar/
├── index.html          # landing + model-viewer + wedge copy
├── css/styles.css      # Polymetron-light dark theme
├── data/hotspots.json  # 5 glass-box reasoning hotspots (positions + copy)
├── assets/
│   ├── capture.glb     # P1: drop Polycam GLB export here
│   ├── capture.usdz    # P1: drop Polycam USDZ export here
│   └── poster.jpg      # optional preview image
└── README.md
```

## Capture pipeline (P1)

1. Install [Polycam](https://poly.cam) on iPhone
2. Scan a focused space (~10–15 min), tap Process
3. Export both formats: USDZ + GLB
4. Target: <25 MB each
5. Upload via GitHub Mobile or web UI → `Add file → Upload files` into `assets/`
6. Open the deployed Cloudflare Pages URL — adjust hotspot positions in `data/hotspots.json` until they land on the right surfaces

## Hotspot positioning

`data-position` in `hotspots.json` is model-space `x y z` in metres. Open the page, browser console, type `dev()` to enable click-to-log mode, click anywhere on the model — the coords print. Paste into `hotspots.json`.

## License

Proprietary — Polymetron.
