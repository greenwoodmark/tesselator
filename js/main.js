/**
 * Main — bootstraps the tessellation app.
 */

import { createTile } from './tile.js';
import { clear, drawTessellation, drawControlPoints } from './renderer.js';
import { setupInteraction } from './interaction.js';

// --- Configuration ---
const CANVAS_SIZE = 600;
const TILE_SCALE = 120; // pixels per tile unit
const GRID_SIZE = 7;    // 7x7 grid of tiles

// --- Setup ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

// Create the tile model
const tile = createTile(10); // 10 control points per edge

// The center tile's origin (top-left corner in canvas space)
function getOrigin() {
    return {
        originX: (CANVAS_SIZE - TILE_SCALE) / 2,
        originY: (CANVAS_SIZE - TILE_SCALE) / 2,
    };
}

function getScale() {
    return TILE_SCALE;
}

// --- Render loop ---
function render() {
    clear(ctx, canvas);

    const { originX, originY } = getOrigin();

    // Draw the full tessellation grid
    drawTessellation(ctx, tile, originX, originY, TILE_SCALE, GRID_SIZE);

    // Draw control points on top of the center tile
    drawControlPoints(ctx, tile, originX, originY, TILE_SCALE, interactionState.activePoint);
}

// --- Interaction ---
const interactionState = setupInteraction(canvas, tile, getOrigin, getScale, render);

// Initial render
render();
