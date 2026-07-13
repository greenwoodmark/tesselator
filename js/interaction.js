/**
 * Interaction — handles mouse events for dragging control points.
 */

import { getEdgePoints, updatePoint } from './tile.js';

const HIT_RADIUS = 10; // pixels

/**
 * Find which control point (if any) is under the given canvas coordinates.
 * Returns { edge, index } or null.
 */
export function hitTest(tile, originX, originY, scale, mouseX, mouseY) {
    const edges = getEdgePoints(tile, originX, originY, scale);

    for (const edgeName of ['left', 'right', 'top', 'bottom']) {
        const points = edges[edgeName];
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            if (dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS) {
                return { edge: edgeName, index: i };
            }
        }
    }

    return null;
}

/**
 * Compute perpendicular and tangential offsets when dragging a control point.
 * The perpendicular offset is the distance from the edge baseline.
 * The tangential offset is the displacement along the edge from the point's base position.
 * The tangential offset is clamped so the angle from perpendicular doesn't exceed 45°.
 */
export function computeOffsets(edge, index, tile, mouseX, mouseY, originX, originY, scale) {
    const point = tile[edge][index];
    let perpOffset, tangOffset;

    switch (edge) {
        case 'left':
            perpOffset = (mouseX - originX) / scale;
            tangOffset = (mouseY - (originY + point.t * scale)) / scale;
            break;
        case 'right':
            perpOffset = (mouseX - (originX + scale)) / scale;
            tangOffset = (mouseY - (originY + point.t * scale)) / scale;
            break;
        case 'top':
            perpOffset = (mouseY - originY) / scale;
            tangOffset = (mouseX - (originX + point.t * scale)) / scale;
            break;
        case 'bottom':
            perpOffset = (mouseY - (originY + scale)) / scale;
            tangOffset = (mouseX - (originX + point.t * scale)) / scale;
            break;
    }

    // Clamp perpendicular offset
    perpOffset = Math.max(-0.4, Math.min(0.4, perpOffset));

    // Allow tangential movement up to half the perpendicular movement.
    // Use half the max perp range (0.4) as the absolute tangent limit = 0.2,
    // but also scale it relative to actual perp so it feels proportional.
    const maxTangent = 0.2;
    tangOffset = Math.max(-maxTangent, Math.min(maxTangent, tangOffset));

    return { perpOffset, tangOffset };
}

/**
 * Set up mouse event listeners on the canvas.
 * Returns a state object that tracks the currently active (dragged) point.
 */
export function setupInteraction(canvas, tile, getOrigin, getScale, onUpdate) {
    const state = {
        activePoint: null,  // { edge, index } or null
        isDragging: false,
    };

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const { originX, originY } = getOrigin();
        const scale = getScale();

        const hit = hitTest(tile, originX, originY, scale, mouseX, mouseY);
        if (hit) {
            state.activePoint = hit;
            state.isDragging = true;
            canvas.style.cursor = 'grabbing';
            onUpdate();
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const { originX, originY } = getOrigin();
        const scale = getScale();

        if (state.isDragging && state.activePoint) {
            const { perpOffset, tangOffset } = computeOffsets(
                state.activePoint.edge, state.activePoint.index, tile,
                mouseX, mouseY, originX, originY, scale
            );
            updatePoint(tile, state.activePoint.edge, state.activePoint.index, perpOffset, tangOffset);
            onUpdate();
        } else {
            // Update cursor on hover
            const hit = hitTest(tile, originX, originY, scale, mouseX, mouseY);
            canvas.style.cursor = hit ? 'grab' : 'default';
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (state.isDragging) {
            state.isDragging = false;
            canvas.style.cursor = 'default';
            onUpdate();
        }
    });

    canvas.addEventListener('mouseleave', () => {
        if (state.isDragging) {
            state.isDragging = false;
            canvas.style.cursor = 'default';
            onUpdate();
        }
    });

    return state;
}
