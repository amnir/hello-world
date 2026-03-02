// =============================================================================
// tutorial.js — Guided tutorial for Level 1
// =============================================================================

import { DEFENDER_SPRITES } from './sprites.js';
import { playClick, playStarCollect, speak } from './audio.js';

// ─── Constants (duplicated from game.js to avoid circular imports) ──────────

const CANVAS_W = 960;
const CANVAS_H = 540;
const HUD_HEIGHT = 90;
const GRID_LEFT = 60;
const GRID_TOP = 100;
const GRID_RIGHT = 760;
const GRID_BOTTOM = 500;
const CELL_W = (GRID_RIGHT - GRID_LEFT) / 6;
const CELL_H = (GRID_BOTTOM - GRID_TOP) / 3;
const PAUSE_BTN_X = CANVAS_W - 55;
const PAUSE_BTN_Y = HUD_HEIGHT + 12;
const PAUSE_BTN_SIZE = 48;

// ─── Tutorial Steps ─────────────────────────────────────────────────────────

export const TUTORIAL_STEPS = [
    { id: 'welcome', text: 'ברוכים הבאים! בואו נלמד לשחק!', waitFor: 'tap' },
    { id: 'select_defender', text: 'לחצו על חבר המספרים', waitFor: 'select_numberBuddy' },
    { id: 'place_defender', text: 'גררו אותו לכאן!', waitFor: 'place_defender' },
    { id: 'collect_star', text: 'לחצו על הכוכב!', waitFor: 'star_collected' },
    { id: 'complete', text: 'מעולה! אתם מוכנים!', waitFor: 'tap' },
];

// ─── Tutorial Class ─────────────────────────────────────────────────────────

export class Tutorial {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.step = 0;
        this.textTimer = 0;
        this.pulseTime = 0;
        this.done = false;
        this.savedWaveTimer = 0;
        this.helpBtnArea = null;
    }

    get isActive() {
        return this.active;
    }

    get currentStep() {
        return TUTORIAL_STEPS[this.step];
    }

    start(waveTimer) {
        this.active = true;
        this.step = 0;
        this.textTimer = 0;
        this.pulseTime = 0;
        this.savedWaveTimer = waveTimer;
        speak(TUTORIAL_STEPS[0].text);
    }

    advance() {
        this.step++;
        this.textTimer = 0;
        this.pulseTime = 0;
        if (this.step >= TUTORIAL_STEPS.length) {
            this.active = false;
            this.done = true;
            this.game.saveProgress();
            this.game.waveTimer = this.savedWaveTimer;
            return;
        }
        speak(TUTORIAL_STEPS[this.step].text);
    }

    skip() {
        this.active = false;
        this.done = true;
        this.game.saveProgress();
        this.game.waveTimer = this.savedWaveTimer;
    }

    handleClick(pos) {
        const step = TUTORIAL_STEPS[this.step];

        // Skip button check (bottom-left)
        const skipW = 80, skipH = 36;
        const skipX = 15, skipY = CANVAS_H - skipH - 15;
        if (pos.x >= skipX && pos.x <= skipX + skipW && pos.y >= skipY && pos.y <= skipY + skipH) {
            playClick();
            this.skip();
            return true;
        }

        if (step.waitFor === 'tap') {
            playClick();
            this.advance();
            return true;
        }

        if (step.waitFor === 'select_numberBuddy') {
            if (pos.y < HUD_HEIGHT) {
                const defenders = this.game.currentLevel.availableDefenders;
                const btnSize = 60, spacing = 10;
                const totalW = defenders.length * (btnSize + spacing) - spacing;
                const startX = CANVAS_W / 2 - totalW / 2;
                const nbIndex = defenders.indexOf('numberBuddy');
                if (nbIndex >= 0) {
                    const bx = startX + nbIndex * (btnSize + spacing);
                    const by = 15;
                    if (pos.x >= bx && pos.x <= bx + btnSize && pos.y >= by && pos.y <= by + btnSize) {
                        this.game.selectedDefender = 'numberBuddy';
                        playClick();
                        this.advance();
                    }
                }
            }
            return true;
        }

        if (step.waitFor === 'place_defender') {
            if (this.game.selectedDefender === 'numberBuddy') {
                this.game.dragging = { type: 'numberBuddy', x: pos.x, y: pos.y };
            }
            return true;
        }

        if (step.waitFor === 'star_collected') {
            for (let i = this.game.floatingStars.length - 1; i >= 0; i--) {
                const star = this.game.floatingStars[i];
                const dx = pos.x - star.x;
                const dy = pos.y - star.y;
                if (dx * dx + dy * dy < 600) {
                    this.game.floatingStars.splice(i, 1);
                    playStarCollect();
                    this.game.pendingStarReward = 2;
                    this.game.showChallenge();
                    return true;
                }
            }
            return true;
        }

        return true; // Block all other input during tutorial
    }

    handlePointerUp(cell, type) {
        if (!this.active) return false;
        const step = TUTORIAL_STEPS[this.step];
        if (step.id !== 'place_defender') return false;

        if (cell.row === 1 && cell.col === 3) {
            this.game.placeDefender(type, cell.row, cell.col);
            this.advance();
        }
        return true;
    }

    updateTimers(dt) {
        this.textTimer += dt;
        this.pulseTime += dt;

        // Force-spawn a star when on collect_star step and no stars exist
        if (TUTORIAL_STEPS[this.step].id === 'collect_star' && this.game.floatingStars.length === 0) {
            const targetPos = this.game.gridToScreen(1, 3);
            this.game.floatingStars.push({
                x: targetPos.x,
                y: targetPos.y - 40,
                spawnTime: this.game.time,
                lifetime: 999,
            });
        }
    }

    render() {
        if (!this.active) return;
        const ctx = this.game.ctx;
        const step = TUTORIAL_STEPS[this.step];

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        this._renderHighlight(step);
        this._renderBubble(step);

        // Skip button (bottom-left)
        const skipW = 80, skipH = 36;
        const skipX = 15, skipY = CANVAS_H - skipH - 15;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        roundRect(ctx, skipX, skipY, skipW, skipH, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('דלגו', skipX + skipW / 2, skipY + skipH / 2);

        // "Tap to continue" hint for tap steps
        if (step.waitFor === 'tap') {
            const blink = Math.sin(this.pulseTime * 3) > 0;
            if (blink) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.font = '18px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('לחצו להמשיך', CANVAS_W / 2, CANVAS_H - 60);
            }
        }
    }

    _renderHighlight(step) {
        const ctx = this.game.ctx;
        const pulse = 1 + Math.sin(this.pulseTime * 4) * 0.08;

        let targetRect = null;

        if (step.id === 'select_defender') {
            const defenders = this.game.currentLevel.availableDefenders;
            const btnSize = 60, spacing = 10;
            const totalW = defenders.length * (btnSize + spacing) - spacing;
            const startX = CANVAS_W / 2 - totalW / 2;
            const nbIndex = defenders.indexOf('numberBuddy');
            if (nbIndex >= 0) {
                const bx = startX + nbIndex * (btnSize + spacing);
                targetRect = { x: bx - 4, y: 11, w: btnSize + 8, h: btnSize + 8 };
            }
        } else if (step.id === 'place_defender') {
            const cx = GRID_LEFT + 3 * CELL_W;
            const cy = GRID_TOP + 1 * CELL_H;
            targetRect = { x: cx, y: cy, w: CELL_W, h: CELL_H };
        } else if (step.id === 'collect_star') {
            if (this.game.floatingStars.length > 0) {
                const star = this.game.floatingStars[0];
                targetRect = { x: star.x - 25, y: star.y - 25, w: 50, h: 50 };
            }
        }

        if (targetRect) {
            const pad = 6 * pulse;
            const rx = targetRect.x - pad;
            const ry = targetRect.y - pad;
            const rw = targetRect.w + pad * 2;
            const rh = targetRect.h + pad * 2;

            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            roundRect(ctx, rx, ry, rw, rh, 12);
            ctx.fill();
            ctx.restore();

            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 4]);
            ctx.lineDashOffset = -this.pulseTime * 20;
            roundRect(ctx, rx, ry, rw, rh, 12);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    _renderBubble(step) {
        const ctx = this.game.ctx;

        // Star Maker character at bottom-right
        const charX = CANVAS_W - 80;
        const charY = CANVAS_H - 100;

        DEFENDER_SPRITES.starMaker(ctx, charX, charY, 35, this.game.time);

        // Speech bubble
        const bubbleW = 280;
        const bubbleH = 60;
        const bubbleX = charX - bubbleW - 20;
        const bubbleY = charY - bubbleH / 2;

        const alpha = Math.min(1, this.textTimer * 2);
        ctx.globalAlpha = alpha;

        ctx.fillStyle = '#fff';
        roundRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 14);
        ctx.fill();
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Tail pointing to character
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(bubbleX + bubbleW, bubbleY + bubbleH / 2 - 8);
        ctx.lineTo(bubbleX + bubbleW + 15, bubbleY + bubbleH / 2);
        ctx.lineTo(bubbleX + bubbleW, bubbleY + bubbleH / 2 + 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bubbleX + bubbleW, bubbleY + bubbleH / 2 - 8);
        ctx.lineTo(bubbleX + bubbleW + 15, bubbleY + bubbleH / 2);
        ctx.lineTo(bubbleX + bubbleW, bubbleY + bubbleH / 2 + 8);
        ctx.stroke();

        // Text
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(step.text, bubbleX + bubbleW / 2, bubbleY + bubbleH / 2);

        ctx.globalAlpha = 1;
    }

    renderHelpButton() {
        if (this.game.currentLevelIndex !== 0 || !this.done || this.game.state !== 'playing') {
            this.helpBtnArea = null;
            return;
        }

        const ctx = this.game.ctx;
        const helpSize = 40;
        const helpX = PAUSE_BTN_X + (PAUSE_BTN_SIZE - helpSize) / 2;
        const helpY = PAUSE_BTN_Y + PAUSE_BTN_SIZE + 8;
        this.helpBtnArea = { x: helpX, y: helpY, size: helpSize };

        ctx.fillStyle = 'rgba(52, 152, 219, 0.75)';
        roundRect(ctx, helpX, helpY, helpSize, helpSize, 10);
        ctx.fill();
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', helpX + helpSize / 2, helpY + helpSize / 2);
    }

    checkHelpButtonClick(pos) {
        if (!this.helpBtnArea) return false;
        const b = this.helpBtnArea;
        if (pos.x >= b.x && pos.x <= b.x + b.size && pos.y >= b.y && pos.y <= b.y + b.size) {
            playClick();
            this.done = false;
            this.start(this.game.waveTimer);
            return true;
        }
        return false;
    }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}
