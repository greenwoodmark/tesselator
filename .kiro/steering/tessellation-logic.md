# Tessellation Flip Logic

This document defines the core tessellation rules for how neighbouring tiles relate to each other. These rules must be preserved in all future development.

## Tile Grid Layout

Tiles are arranged in a regular grid. The **center tile** (row 0, col 0) is the "base" orientation — the one the user edits directly.

## Neighbour Transformations

Each tile's transform is determined by whether its row and column indices are odd or even:

| Row parity | Col parity | Transform applied |
|------------|------------|-------------------|
| Even       | Even       | None (base orientation) |
| Even       | Odd        | Flip vertically (reflect about horizontal center — "head to tail") |
| Odd        | Even       | Flip horizontally (reflect about vertical center — "left to right") |
| Odd        | Odd        | Both flips (equivalent to 180° rotation) |

### Left/Right neighbours (same row)

Adjacent tiles in the same row alternate between base and **vertically flipped** (flipY). This "head to tail" flip ensures the left edge of one tile interlocks with the right edge of its neighbour.

### Top/Bottom neighbours (same column)

Adjacent tiles in the same column alternate between base and **horizontally flipped** (flipX). This ensures the top edge of one tile interlocks with the bottom edge of the tile above it.

## Edge Symmetry Constraint (Area Preservation)

When the user drags a control point on one edge, the corresponding control point on the **opposite** edge is updated to preserve the tile's total area:

- A point at parametric index `i` with offset `d` on one edge maps to index `(length - 1 - i)` on the paired edge with offset `d` (same value, same sign).
- This means: pulling outward on the left pushes the mirrored point inward on the right (and vice versa), because "outward" is opposite directions for left vs right edges.
- The same logic applies to top/bottom pairs.

### Edge pairings

- Left ↔ Right
- Top ↔ Bottom

## Key Invariant

The combination of the flip transforms and the edge symmetry constraint guarantees that **all tiles in the grid interlock perfectly** — no gaps, no overlaps — regardless of how the user deforms the base tile.


## Tile Colouring

Tiles follow a checkerboard colouring pattern:

- The center tile (row 0, col 0) is **black**.
- A tile is black when `(|row| + |col|) % 2 === 0`, white otherwise.
- Both the fill and the stroke/outline of each tile use the **same colour** (solid black or solid white — no separate border colour).
- The canvas background should be a neutral mid-grey (`#808080`) so both colours are clearly visible.
- Control points use red (`#e11d48`) with a white border to remain visible against both black and white tiles. Active (dragged) points use amber (`#f59e0b`).
