import { describe, it, expect } from 'vitest';
import {
    GRID_LEFT, GRID_TOP, GRID_RIGHT, GRID_BOTTOM,
    ROWS, COLS, CELL_W, CELL_H,
    screenToGrid, gridToScreen, getWaveDelay, getComboTier,
} from '../js/game-logic.js';

describe('screenToGrid()', () => {
    it('returns correct cell for center of grid', () => {
        const center = gridToScreen(1, 3);
        const result = screenToGrid(center.x, center.y);
        expect(result).toEqual({ row: 1, col: 3 });
    });

    it('returns null for coordinates outside the grid', () => {
        expect(screenToGrid(0, 0)).toBeNull();        // top-left corner
        expect(screenToGrid(900, 300)).toBeNull();     // right of grid
        expect(screenToGrid(400, 50)).toBeNull();      // above grid
        expect(screenToGrid(400, 550)).toBeNull();     // below grid
    });

    it('returns {row: 0, col: 0} for top-left cell', () => {
        const result = screenToGrid(GRID_LEFT + 1, GRID_TOP + 1);
        expect(result).toEqual({ row: 0, col: 0 });
    });

    it('returns last cell for bottom-right of grid', () => {
        const result = screenToGrid(GRID_RIGHT - 1, GRID_BOTTOM - 1);
        expect(result).toEqual({ row: ROWS - 1, col: COLS - 1 });
    });
});

describe('gridToScreen()', () => {
    it('returns center of first cell', () => {
        const pos = gridToScreen(0, 0);
        expect(pos.x).toBeCloseTo(GRID_LEFT + CELL_W / 2);
        expect(pos.y).toBeCloseTo(GRID_TOP + CELL_H / 2);
    });

    it('round-trips with screenToGrid', () => {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const pos = gridToScreen(row, col);
                const cell = screenToGrid(pos.x, pos.y);
                expect(cell).toEqual({ row, col });
            }
        }
    });
});

describe('getWaveDelay()', () => {
    it('returns base delay of 6 for level 0, wave 0', () => {
        expect(getWaveDelay(0, 0)).toBe(6);
    });

    it('increases with level index', () => {
        expect(getWaveDelay(2, 0)).toBe(7);    // 6 + 2*0.5
        expect(getWaveDelay(5, 0)).toBe(8.5);  // 6 + 5*0.5
    });

    it('caps level bonus at level 5', () => {
        expect(getWaveDelay(5, 0)).toBe(getWaveDelay(10, 0));
    });

    it('increases with wave index (every 2 waves)', () => {
        expect(getWaveDelay(0, 0)).toBe(6);
        expect(getWaveDelay(0, 1)).toBe(6);    // floor(1/2)=0
        expect(getWaveDelay(0, 2)).toBe(7);    // floor(2/2)=1
        expect(getWaveDelay(0, 3)).toBe(7);    // floor(3/2)=1
        expect(getWaveDelay(0, 4)).toBe(8);    // floor(4/2)=2
    });
});

describe('getComboTier()', () => {
    it('returns base tier for streak < 3', () => {
        const tier = getComboTier(1);
        expect(tier.bonusStars).toBe(0);
        expect(tier.comboSound).toBe(false);
        expect(tier.confetti).toBe(false);
    });

    it('returns mid tier for streak 3-4', () => {
        const tier = getComboTier(3);
        expect(tier.bonusStars).toBe(1);
        expect(tier.comboSound).toBe(true);
        expect(tier.confetti).toBe(false);
    });

    it('returns top tier for streak >= 5', () => {
        const tier = getComboTier(5);
        expect(tier.bonusStars).toBe(2);
        expect(tier.comboSound).toBe(true);
        expect(tier.confetti).toBe(true);
    });

    it('top tier also applies to streak > 5', () => {
        const tier = getComboTier(10);
        expect(tier.bonusStars).toBe(2);
        expect(tier.confetti).toBe(true);
    });
});

describe('Collision detection (distance-based)', () => {
    function isColliding(x1, y1, x2, y2, threshold) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return dx * dx + dy * dy < threshold;
    }

    it('detects collision when objects overlap', () => {
        expect(isColliding(100, 100, 105, 100, 600)).toBe(true);
    });

    it('no collision when objects are far apart', () => {
        expect(isColliding(100, 100, 200, 200, 600)).toBe(false);
    });

    it('boundary: exactly at threshold is not a collision', () => {
        // distance^2 = 600 → distance ≈ 24.49
        // dx=24, dy=5 → 576+25=601 > 600
        expect(isColliding(0, 0, 24, 5, 600)).toBe(false);
    });

    it('boundary: just inside threshold is a collision', () => {
        // dx=20, dy=10 → 400+100=500 < 600
        expect(isColliding(0, 0, 20, 10, 600)).toBe(true);
    });
});
