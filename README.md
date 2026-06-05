# Polymetron

We capture buildings and streets with an iPhone, attach the public rules and data that explain what's there, and let anyone open the result on their own phone.

## What's in this repo

A landing page that loads a 3D capture from Polycam, shows five hotspots over the model, and opens an AR walkthrough on iPhone. Each hotspot has a reasoning chain pointing back to the ordinance, the census tract, or the overlay map behind it.

## Stack

model-viewer for the browser 3D and AR Quick Look launcher. Plain HTML, CSS, JS. No build step. Cloudflare Pages for hosting.

## Files

```
.
├── index.html
├── css/styles.css
├── data/hotspots.json
├── assets/
│   ├── capture.glb
│   ├── capture.usdz
│   └── poster.jpg
└── README.md
```

## Capture pipeline

1. Polycam on iPhone, scan a focused space, 10 to 15 minutes.
2. Export USDZ and GLB. Target under 25 MB each.
3. Upload via the GitHub web UI into `assets/`.

## Hotspot positioning

`position` in `hotspots.json` is x y z in metres in the model's own space. Open the live URL, run `dev()` in the browser console to toggle dev mode, then click anywhere on the model. The console prints position and normal. Paste them into the matching hotspot entry.

## License

Proprietary, Polymetron.
