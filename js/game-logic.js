// =============================================================================
// game-logic.js — Pure functions and constants extracted for testability
// =============================================================================

// ─── Grid Constants ─────────────────────────────────────────────────────────

export const CANVAS_W = 960;
export const CANVAS_H = 540;
export const ROWS = 3;
export const COLS = 6;

export const GRID_LEFT = 60;
export const GRID_TOP = 100;
export const GRID_RIGHT = 760;
export const GRID_BOTTOM = 500;
export const CELL_W = (GRID_RIGHT - GRID_LEFT) / COLS;
export const CELL_H = (GRID_BOTTOM - GRID_TOP) / ROWS;

// ─── Coordinate Conversion ──────────────────────────────────────────────────

export function screenToGrid(sx, sy) {
    if (sx < GRID_LEFT || sx > GRID_RIGHT || sy < GRID_TOP || sy > GRID_BOTTOM) {
        return null;
    }
    const col = Math.floor((sx - GRID_LEFT) / CELL_W);
    const row = Math.floor((sy - GRID_TOP) / CELL_H);
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        return { row, col };
    }
    return null;
}

export function gridToScreen(row, col) {
    return {
        x: GRID_LEFT + col * CELL_W + CELL_W / 2,
        y: GRID_TOP + row * CELL_H + CELL_H / 2,
    };
}

// ─── Wave Timing ────────────────────────────────────────────────────────────

export function getWaveDelay(currentLevelIndex, waveIndex) {
    const baseDelay = 6;
    const levelBonus = Math.min(currentLevelIndex, 5) * 0.5;
    const waveBonus = Math.floor(waveIndex / 2) * 1;
    return baseDelay + levelBonus + waveBonus;
}

// ─── Combo Rewards ──────────────────────────────────────────────────────────

export function getComboTier(comboStreak) {
    if (comboStreak >= 5) {
        return { text: '\u200Fמדהים!', color: '#e74c3c', bonusStars: 2, comboSound: true, confetti: true };
    } else if (comboStreak >= 3) {
        return { text: '\u200Fמצוין!', color: '#f39c12', bonusStars: 1, comboSound: true, confetti: false };
    }
    return { text: '\u200Fכל הכבוד!', color: '#2ecc71', bonusStars: 0, comboSound: false, confetti: false };
}
