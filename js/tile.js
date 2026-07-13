/**
 * Tile model for the tessellation app.
 * 
 * The tile is a unit square (0,0) to (1,1) with control points on each edge.
 * Symmetry constraint: changes to the left edge are mirrored (inverted) on the
 * right edge, and changes to the top edge are mirrored on the bottom edge.
 * This ensures the tile interlocks with translated copies of itself.
 */

/**
 * Creates a default tile with evenly spaced control points on each edge.
 * Each edge has `pointsPerEdge` interior points (corners are shared).
 */
export function createTile(pointsPerEdge = 4) {
    // Each edge stores offsets perpendicular to the edge baseline.
    // Left edge: points go from (0,0) top-left to (0,1) bottom-left
    // Right edge: points go from (1,0) top-right to (1,1) bottom-right
    // Top edge: points go from (0,0) top-left to (1,0) top-right
    // Bottom edge: points go from (0,1) bottom-left to (1,1) bottom-right

    const makeEdgePoints = (count) => {
        const points = [];
        for (let i = 0; i < count; i++) {
            // t is the parametric position along the edge (0 to 1, exclusive of endpoints)
            const t = (i + 1) / (count + 1);
            points.push({ t, offset: 0, tangentOffset: 0 }); // offset perpendicular, tangentOffset along edge
        }
        return points;
    };

    return {
        size: 1, // unit tile
        left: makeEdgePoints(pointsPerEdge),
        right: makeEdgePoints(pointsPerEdge),
        top: makeEdgePoints(pointsPerEdge),
        bottom: makeEdgePoints(pointsPerEdge),
    };
}

/**
 * Update a control point on an edge and mirror it to the opposite edge.
 * 
 * Area-preserving tessellation constraint:
 *   - If you pull a point outward on one edge (adding area), the corresponding
 *     point on the opposite edge must also move outward (removing area from that side).
 *   - The perpendicular offset is copied as-is to the paired edge (same sign).
 *   - The tangent offset is negated on the paired edge (mirrored position means
 *     the tangent direction reverses).
 * 
 * Left ↔ Right: point at index i → paired at (length-1-i), same offset, negated tangent
 * Top ↔ Bottom: point at index i → paired at (length-1-i), same offset, negated tangent
 */
export function updatePoint(tile, edge, index, newOffset, newTangentOffset = 0) {
    tile[edge][index].offset = newOffset;
    tile[edge][index].tangentOffset = newTangentOffset;

    const paired = getPairedEdge(edge);
    const pairedIndex = tile[paired].length - 1 - index;
    tile[paired][pairedIndex].offset = newOffset;
    tile[paired][pairedIndex].tangentOffset = -newTangentOffset;
}

function getPairedEdge(edge) {
    switch (edge) {
        case 'left': return 'right';
        case 'right': return 'left';
        case 'top': return 'bottom';
        case 'bottom': return 'top';
    }
}

/**
 * Convert a tile's edge control points into canvas-space (x, y) coordinates.
 * 
 * @param {object} tile - The tile model
 * @param {number} originX - Top-left x of the tile in canvas space
 * @param {number} originY - Top-left y of the tile in canvas space  
 * @param {number} scale - Pixels per unit (tile size)
 * @returns {object} Object with arrays of {x, y} for each edge
 */
export function getEdgePoints(tile, originX, originY, scale) {
    const s = scale;

    const leftPoints = tile.left.map(p => ({
        x: originX + p.offset * s,
        y: originY + p.t * s + p.tangentOffset * s,
    }));

    const rightPoints = tile.right.map(p => ({
        x: originX + s + p.offset * s,
        y: originY + p.t * s + p.tangentOffset * s,
    }));

    const topPoints = tile.top.map(p => ({
        x: originX + p.t * s + p.tangentOffset * s,
        y: originY + p.offset * s,
    }));

    const bottomPoints = tile.bottom.map(p => ({
        x: originX + p.t * s + p.tangentOffset * s,
        y: originY + s + p.offset * s,
    }));

    return { left: leftPoints, right: rightPoints, top: topPoints, bottom: bottomPoints };
}

/**
 * Build the full outline path of the tile as an array of {x, y} points,
 * traversing clockwise: top-left corner -> top edge -> top-right corner ->
 * right edge -> bottom-right corner -> bottom edge (reversed) -> bottom-left corner ->
 * left edge (reversed) -> back to top-left.
 * 
 * `transform` options:
 *   - 'none': no transformation (default)
 *   - 'flipX': flip horizontally (reflect about the tile's vertical center axis)
 *   - 'flipY': flip vertically (reflect about the tile's horizontal center axis)
 *   - 'flipXY': both flips (equivalent to 180° rotation)
 */
export function getTilePath(tile, originX, originY, scale, transform = 'none') {
    const s = scale;
    const edges = getEdgePoints(tile, originX, originY, s);

    const path = [];

    // Start at top-left corner
    path.push({ x: originX, y: originY });

    // Top edge (left to right)
    for (const p of edges.top) {
        path.push(p);
    }

    // Top-right corner
    path.push({ x: originX + s, y: originY });

    // Right edge (top to bottom)
    for (const p of edges.right) {
        path.push(p);
    }

    // Bottom-right corner
    path.push({ x: originX + s, y: originY + s });

    // Bottom edge (right to left — reverse)
    for (let i = edges.bottom.length - 1; i >= 0; i--) {
        path.push(edges.bottom[i]);
    }

    // Bottom-left corner
    path.push({ x: originX, y: originY + s });

    // Left edge (bottom to top — reverse)
    for (let i = edges.left.length - 1; i >= 0; i--) {
        path.push(edges.left[i]);
    }

    // Apply transformation
    if (transform === 'flipX' || transform === 'flipXY') {
        // Flip horizontally: reflect about the tile's vertical center line
        const cx = originX + s / 2;
        for (let i = 0; i < path.length; i++) {
            path[i] = {
                x: 2 * cx - path[i].x,
                y: path[i].y,
            };
        }
    }
    if (transform === 'flipY' || transform === 'flipXY') {
        // Flip vertically: reflect about the tile's horizontal center line
        const cy = originY + s / 2;
        for (let i = 0; i < path.length; i++) {
            path[i] = {
                x: path[i].x,
                y: 2 * cy - path[i].y,
            };
        }
    }

    return path;
}
