/**
 * Renderer — draws the tile and tessellation grid on the canvas.
 */

import { getTilePath, getEdgePoints } from './tile.js';

/**
 * Clear the canvas.
 */
export function clear(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Draw the tessellation grid — a grid of tiles around the center.
 * - Every other column is flipped vertically (head-to-tail) for left/right interlocking.
 * - Every other row is flipped horizontally for top/bottom interlocking.
 * - Tiles that are both odd-row and odd-col get both flips (180° rotation).
 * - Alternating black/white checkerboard colouring (center tile is black).
 */
export function drawTessellation(ctx, tile, originX, originY, scale, gridSize = 5) {
    const halfGrid = Math.floor(gridSize / 2);

    for (let row = -halfGrid; row <= halfGrid; row++) {
        for (let col = -halfGrid; col <= halfGrid; col++) {
            const tileX = originX + col * scale;
            const tileY = originY + row * scale;

            const oddRow = Math.abs(row) % 2 !== 0;
            const oddCol = Math.abs(col) % 2 !== 0;

            let transform = 'none';
            if (oddRow && oddCol) {
                transform = 'flipXY';
            } else if (oddRow) {
                transform = 'flipX';
            } else if (oddCol) {
                transform = 'flipY';
            }

            // Checkerboard: (row+col) even = black, odd = white
            const isBlack = (Math.abs(row) + Math.abs(col)) % 2 === 0;

            drawTile(ctx, tile, tileX, tileY, scale, transform, isBlack);
        }
    }
}

/**
 * Draw a single tile — solid fill and stroke in the same colour.
 */
function drawTile(ctx, tile, originX, originY, scale, transform = 'none', isBlack = true) {
    const path = getTilePath(tile, originX, originY, scale, transform);

    if (path.length === 0) return;

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.closePath();

    const colour = isBlack ? '#00008b' : '#dc2626';
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.strokeStyle = colour;
    ctx.lineWidth = 1;
    ctx.stroke();
}

/**
 * Draw the control points on the center tile's edges.
 */
export function drawControlPoints(ctx, tile, originX, originY, scale, activePoint) {
    const edges = getEdgePoints(tile, originX, originY, scale);
    const radius = 3;

    for (const edgeName of ['left', 'right', 'top', 'bottom']) {
        const points = edges[edgeName];
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const isActive = activePoint && activePoint.edge === edgeName && activePoint.index === i;

            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);

            if (isActive) {
                ctx.fillStyle = '#f59e0b';
                ctx.strokeStyle = '#fff';
            } else {
                ctx.fillStyle = '#e11d48';
                ctx.strokeStyle = '#fff';
            }
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }
}
