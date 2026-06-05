# Deploy

Cloudflare Workers static asset deploy. The existing `polymetron-ar` Workers project is already wired to this repo's `main` branch. Pushing to `main` triggers a deploy.

| Field | Value |
|---|---|
| Repository | `SamDuo/polymetron-ar` |
| Production branch | `main` |
| Framework preset | None |
| Build command | (blank) |
| Build output directory | `/` |
| Live URL | https://polymetron-ar.samduong-work.workers.dev |

Cloudflare serves `index.html` at the root.

## Stack

Single static `index.html` with three CDN dependencies (TensorFlow.js, COCO-SSD, transformers.js). No build step. No environment variables. No Pages functions. No KV, D1, R2.

HTTPS is on by default and required for `getUserMedia` on both iOS Safari and Android Chrome.

## Verify on device

Open the URL on a phone. Tap **Start camera**.

Within 30 to 60 seconds you should see:

1. Bounding boxes appear in real time over detected objects.
2. The caption card prints "Waiting for the first scene description" with a blinking caret.
3. A few seconds later the first sentence appears and the phone speaks it.
4. The sparkline at the bottom of the panel starts filling from the right edge.

If the first caption never arrives, open Web Inspector and check the console. Likely causes:

- WebGPU declined to compile (look for `VLM WebGPU unavailable, trying WASM fallback`). The demo should still work, just slower.
- The model fetch was blocked. Check that `cdn.jsdelivr.net` and `huggingface.co` are reachable from the device.
- The phone ran out of memory mid-load. Restart Safari / Chrome and try again.
