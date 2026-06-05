# Deploy

Cloudflare Workers project with both static assets and a Worker script. The Worker proxies model file fetches through this origin so the demo works on networks that block huggingface.co directly.

| Field | Value |
|---|---|
| Repository | `SamDuo/polymetron-ar` |
| Production branch | `main` |
| Worker entrypoint | `src/index.js` |
| Static assets directory | `./` (with `.assetsignore`) |
| Compatibility date | `2024-12-15` |
| Live URL | https://polymetron-ar.samduong-work.workers.dev |
| Proxy route | `/hf/{model_id}/resolve/{rev}/{file}` |

## What is in the repo

| Path | Purpose |
|---|---|
| `wrangler.toml` | Cloudflare Workers config |
| `.assetsignore` | Which files to exclude from static asset upload |
| `src/index.js` | Worker: HuggingFace proxy + static asset passthrough |
| `index.html` | The demo page |
| `README.md`, `DEPLOY.md`, `CLAUDE.md` | Docs (ignored from upload) |

## How the proxy works

The page sets `transformers.env.remoteHost = window.location.origin` and `remotePathTemplate = 'hf/{model}/resolve/{revision}'`. Every model file fetch lands on `/hf/...` which the Worker rewrites to `https://huggingface.co/...` and returns with CORS headers.

Cloudflare's edge cache holds each file for 30 days. First visitor pays the upstream bandwidth; every subsequent visit on any device gets a fast same-origin response.

## First-time Cloudflare setup verification

The previous deploy was static-assets-only and may not pick up `wrangler.toml` automatically. After pushing to `main`, open the Cloudflare dashboard:

1. **Workers & Pages → polymetron-ar → Settings → Builds & deployments**
2. Confirm the **latest deployment** is from commit hash matching the one pushed to `main` (visible in dashboard)
3. Open **Logs** during a fresh page load. You should see Worker invocations like `GET /hf/HuggingFaceTB/SmolVLM-256M-Instruct/resolve/main/config.json`
4. If you see static-asset deploys but no Worker invocations, the project is still in static-only mode. Try **Workers & Pages → polymetron-ar → Settings → General** and confirm the project type supports Workers, or recreate the project as a Workers project pointing at this repo

## Verify on device

Open the deployed URL on a phone. Tap **Start camera**.

Within 30 to 60 seconds you should see:

1. Status pill cycles through `Testing model proxy` → `Loading SmolVLM` → per-file progress like `vision_encoder_q4 38%` → `Compiling model` → `Warming up` → `Public space · Ready`
2. Bounding boxes draw on visible objects in real time
3. First caption appears in the caption card and the phone speaks it

If the proxy is not deployed, the user sees `Proxy not responding` with a specific error message, not the previous opaque `Load failed`.

## Stack

Same as before: TensorFlow.js, COCO-SSD, transformers.js, SmolVLM-256M-Instruct, Web Speech API. The only addition is the Worker proxy on the deploy side.

HTTPS required for `getUserMedia` (Cloudflare provides it).
