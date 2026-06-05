# Polymetron Vision

Open the URL on a phone, grant camera access, and the page runs object detection plus scene captioning entirely on your device. The model says what it sees out loud. Nothing leaves the phone.

## What is happening

Two models run on the live camera feed.

**COCO-SSD** (TensorFlow.js, ~30 MB) draws bounding boxes around people, vehicles, infrastructure, goods, animals, and flora at roughly 5 frames per second.

**SmolVLM-256M-Instruct** (Hugging Face transformers.js, ~200 MB) writes one sentence about the scene every few seconds.

Each caption is read aloud through the Web Speech API.

A mode toggle in the panel switches the VLM between two jobs:

- **Public space** (default) — describes the scene and flags anything broken, blocked, missing, or unsafe. The smart-cities general case.
- **Food rescue** — describes any visible food and flags whether it looks leftover, partially eaten, or surplus. The AFCN connector.

Switching mode triggers an immediate re-caption, so you see the model adapt in real time.

The HUD shows the detector backend (WebGL on most phones), the VLM backend (WebGPU when available, WASM otherwise), and live latency for both.

## Live URL

https://polymetron-ar.samduong-work.workers.dev

First visit downloads about 200 MB of model weights to IndexedDB. On LTE that takes 30 to 60 seconds. Subsequent visits load from cache.

> The URL slug still says "ar" for historical reasons. The repo hosted an AR Quick Look demo before pivoting to this on-device vision pipeline. URL preserved so existing links keep working.

## Device compatibility

| Device | Backend | Caption latency |
|---|---|---|
| Android Chrome 113+ on Pixel / Samsung flagship | WebGPU | ~1 to 2 s |
| iPhone on iOS 26+, Safari 18+ | WebGPU | ~1.5 to 3 s |
| iPhone on iOS 17 to 25 (WebGPU off by default) | WASM | ~4 to 8 s |
| Mid-range Android, older Chromebook | WASM | ~4 to 8 s |

The demo runs the same model on all of these. WASM is the universal fallback. WebGPU is the fast path when available. Detection bboxes update in real time on every device because COCO-SSD has its own WebGL path that does not depend on the VLM backend.

## Stack

- Vanilla HTML, CSS, JavaScript. No build step.
- TensorFlow.js 4.20.0 with @tensorflow-models/coco-ssd 2.2.3.
- @huggingface/transformers 3.7.5 with SmolVLM-256M-Instruct.
- Web Speech API for narration.
- No backend, no analytics, no first-party fetches.

## Deploy

See [DEPLOY.md](DEPLOY.md).

## Honest framing

The detection model is off the shelf. The vision-language model is off the shelf. What is novel is the pipeline. A live camera, two models in parallel, spoken narration, all on-device.

## License

MIT.
