# Tesselator

An interactive tessellation app inspired by the work of M.C. Escher. Deform a square tile by dragging control points on its edges — the app enforces symmetry constraints so the tile always tessellates perfectly with its neighbours.

## How it works

- Start with a square base tile with 10 control points per edge.
- Drag any control point to reshape the tile outline.
- The opposite edge updates automatically to preserve area (pull out on one side = push in on the other).
- A 7x7 grid of tiles renders in real time, alternating black and white in a checkerboard pattern.
- Neighbouring tiles are flipped (horizontally for adjacent rows, vertically for adjacent columns) to ensure interlocking.

## Running locally

Serve the folder with any static HTTP server:

```bash
python -m http.server 8080
```

Then open http://localhost:8080 in your browser.

## Tech

Vanilla JavaScript + HTML Canvas. No dependencies, no build step.
