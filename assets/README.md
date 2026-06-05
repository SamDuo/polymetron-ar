# Assets

Drop these files here when the scan is ready.

| File | Source | Notes |
|---|---|---|
| `capture.glb` | Polycam export, glTF 2.0 binary | For laptop model-viewer rendering |
| `capture.usdz` | Polycam export, USDZ | For iPhone AR Quick Look |
| `poster.jpg` | Optional preview screenshot | Shown while the model loads. About 800x600, target under 100 KB |

## Polycam export checklist

1. Process the scan in Polycam (1 to 3 minutes after capture)
2. Share / Export, pick both USDZ and GLB
3. Target file size under 25 MB each. If too large, drop the Detail slider in Polycam settings before re-exporting.
4. Upload through the GitHub web UI (Add file, Upload files) into `assets/`
