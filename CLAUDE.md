# Polymetron AR — Claude Project Instructions

This is the `SamDuo/polymetron-ar` repository. A single-file browser demo for the Polymetron Edge AI thesis. Object detection plus vision-language captioning, on-device, with spoken narration.

> The repo name is historical. It hosted an AR Quick Look + model-viewer demo before pivoting to this on-device vision pipeline. The URL `polymetron-ar.samduong-work.workers.dev` is preserved so existing links keep working. The contents and the brand visible to users are "Polymetron Edge Perception."

## Why this repo exists

The Polymetron Founder Inc Off Season application positions around "Edge AI for smart cities, sustainability beachhead." This repo is the perception-layer proof point. A reviewer opens one URL on their phone and sees a vision model running on-device, with spoken narration, with no cloud round-trip.

The application essay carries the connection to the downstream decision and audit work (AFCN food network in Atlanta, Cambridge solar shading analysis). Those live in the separate `SamDuo/polymetron` repository on different branches.

## File layout

| File | Purpose |
|---|---|
| `index.html` | The entire demo. HTML, CSS, two scripts. No build step. ~1550 lines. |
| `README.md` | User-facing overview. |
| `DEPLOY.md` | Cloudflare Workers deploy notes. |
| `CLAUDE.md` | This file. |

That is the whole repo.

## How the demo works

Two models run in parallel on the live camera feed.

**Layer 1 — Detection** (non-module `<script>`, top half of file).
- TensorFlow.js + COCO-SSD lite_mobilenet_v2 from jsdelivr.
- ~5 fps with WebGL backend.
- Draws bounding boxes on a `<canvas>` overlay, updates counters and an audit log.

**Layer 2 — Caption** (ES `<script type="module">`, bottom of file).
- @huggingface/transformers v3 + SmolVLM-256M-Instruct.
- Runs every ~4.5 seconds. WebGPU when available, WASM fallback.
- Writes one sentence per call. Shown in the caption card. Read aloud via Web Speech API.

The two layers coordinate through:
- `window.polymetronVideo` — shared `<video>` element reference.
- `polymetron:cameralive` custom event — fired by the detection script after camera starts, listened to by the VLM module to begin loading.
- `polymetron:camerastop` custom event — fired on camera stop, VLM module stops its caption timer and cancels speech.
- `window.polymetronAudioEnabled` — boolean owned by the detection script's audio toggle handler, read by the VLM module's `speak()`.

## State machine

`setState(next)` in the detection script governs visible UI:

- `idle` — start overlay visible
- `loading` — start overlay with "Loading model..." subhead
- `live` — camera + canvas + panel visible, dispatches `polymetron:cameralive`
- `error` — start overlay with red error message

## Panel layout (top to bottom)

| Section | Source script | Updates |
|---|---|---|
| Counters (People / Vehicles / Infra) | detection script | every COCO-SSD inference (~5 fps) |
| Mode toggle (Food rescue / Public space) | detection script | on click |
| Caption card (current VLM sentence) | VLM module | every ~4.5 s or on mode switch |
| Activity sparkline (60 s rolling) | detection script | once per second |
| Narration history (last 5 captions) | VLM module | each new caption |
| Stats (detector backend, VLM backend, latencies, privacy) | both | continuous |

The audit log from the earlier iteration is gone. Per-detection events were too noisy at 5 fps and duplicated the counter data. The sparkline shows the same activity signal at a glance, and the narration history captures the model's stream of observations at a higher signal-to-noise.

## Activity trend (sparkline)

60-element ring buffer indexed by `epochSec % 60`. Each cell holds the MAX visible bbox count seen during that second (peak-hold, not last-sample). The renderer walks the buffer chronologically so the rightmost bar is "now."

- `TREND_WINDOW_S` (constant) — window length. Default 60.
- `CONF_THRESHOLD` — only detections above this score count toward activity. Default 0.5.
- Sparkline DOM updates throttle to once per second so the inference loop is not redrawing 38-rect SVGs every 180 ms.
- `activityPeak` is monotonic for the session and shown as "peak N" next to the sparkline. Resets only on a new camera start.

## Narration history

Five-entry FIFO of caption objects: `{ time, text, icon }`. The icon comes from `MODE_ICONS` so the reviewer can see which mode produced each sentence at a glance. Resets on `polymetron:camerastop`.

## Caption modes

Three prompts in the `PROMPTS` registry (top of the VLM module script). The mode toggle in the panel switches between them at runtime.

| Mode | Prompt focus | Default? |
|---|---|---|
| `public_space` | Describe scene in one sentence | **yes** |
| `people` | Count people and describe what they are doing | no |
| `food_rescue` | Identify any food in the scene; AFCN connector | no |

`people` was added specifically for in-person event demos (lots of people in frame, the prompt produces "I see N people doing X" outputs that are reliable and demo-friendly).

Switching mode dispatches `polymetron:modechange`, which clears the current caption and triggers an immediate re-tick so the next sentence reflects the new prompt without waiting for the 4.5 s interval. Mid-inference swaps drop the stale caption to keep UI and prompt in sync.

To change the default at startup, edit `window.polymetronMode` in the non-module script and the `active` class on the corresponding `.mode-btn` in the HTML.

To add a third mode: add a `PROMPTS` entry, a `MODE_LABELS` entry, and a new `.mode-btn` in the toggle HTML with matching `data-mode`. The handler in the non-module script picks it up automatically because it iterates over all `.mode-btn` elements.

## Device compatibility

| Device | Backend | Caption latency |
|---|---|---|
| Android Chrome 113+ on flagship phone | WebGPU | ~1–2 s |
| iPhone iOS 26+ Safari 18+ | WebGPU | ~1.5–3 s |
| iPhone iOS 17–25 | WASM | ~4–8 s |
| Mid-range Android | WASM | ~4–8 s |

Detection (COCO-SSD) runs on WebGL across all of the above and is always real-time. Only the VLM caption is slower on WASM.

## Design system (atlas Night)

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#324049` | Page background |
| `--surface` | `rgba(58, 79, 94, 0.55)` | Glass cards |
| `--ink` | `#d2dadf` | Primary text |
| `--dim` | `#a4b1bc` | Secondary text |
| `--spinellblau` | `#1c5c84` | Accent (pulse dots, caption border, audio toggle highlight) |
| `--teal` | `#7d9caf` | Detection scores |

Detection bbox colors per group: people `#3b82f6`, vehicles `#22c55e`, infrastructure `#f59e0b`, goods `#a855f7`, animals `#14b8a6`, flora `#84cc16`.

Caption text uses Instrument Serif italic, deliberately set apart from the Manrope UI text so the model's voice feels like a different speaker.

## Common tasks

### Swap the VLM

Edit `MODEL_ID` in the module script.

- `'HuggingFaceTB/SmolVLM-256M-Instruct'` — current. ~200 MB. Balanced.
- `'HuggingFaceTB/SmolVLM-500M-Instruct'` — better captions. ~350 MB. Tight on iOS 17 memory budget.
- `'onnx-community/FastVLM-0.5B-ONNX'` — Apple-trained. Sharpest on iOS 26+ WebGPU. Slower first load.

The loader tries `AutoModelForVision2Seq` first and falls back to `AutoModelForImageTextToText`, so most transformers.js VLMs will load without other changes.

### Change caption cadence

`CAPTION_INTERVAL_MS` in the module script. Default 4500. Going under 3000 will starve the COCO-SSD loop on WASM devices.

### Change caption prompt

The user prompt to the VLM is in `captionFrame()`. Default: `"Describe this street scene in one short sentence."` For a different demo (interior, food, etc.) just change the prompt string.

### Turn off narration entirely

Click the speaker icon in the header. Or set `window.polymetronAudioEnabled = false` in console.

## Constraints (do not break)

- Single file. No build step.
- No backend. No first-party fetches. Only the three model CDN domains: `cdn.jsdelivr.net`, `huggingface.co`, `cdn-lfs.huggingface.co`.
- No analytics. The "no data leaves the device" claim must remain literally true.
- HTTPS only (Cloudflare provides it; required for `getUserMedia` everywhere).

## Out of scope on this repo

The following live in the separate `SamDuo/polymetron` repository:

- Cambridge zoning demo → branch `cambridge-huron`.
- Atlanta SPI-16 demo → branch `cambridge-huron`.
- Next.js Polymetron app → branch `next-rebuild-stitch`.

Do not pull those into `polymetron-ar`. The point of this repo is a small, focused perception demo behind one URL.

## Memory entries worth knowing

The Claude memory dir for this user has project entries that frame this work:

- `project_off_season_pivot` — the Edge AI for smart cities thesis this demo serves.
- `project_polymetron_edge_demo` — the original COCO-SSD-only iteration in `SamDuo/polymetron`'s `cambridge-huron` branch, since superseded by the work in this repo.
