// =============================================================================
// game.js — Main game engine: state machine, game loop, rendering, input
// =============================================================================

import {
    DEFENDER_SPRITES, ENEMY_SPRITES,
    drawCollectStar, drawHouse, drawProjectile, drawHealthBar,
    drawConfetti, drawSticker,
} from './sprites.js';

import {
    initAudio, playCorrect, playWrong, playStarCollect, playPlace,
    playShoot, playHit, playPop, playClick, playCelebration,
    playWaveStart, playGameOver, startBgMusic, stopBgMusic, speak,
} from './audio.js';

import { DEFENDER_DEFS, ENEMY_DEFS, LEVELS } from './levels.js';
import { generateChallenge } from './challenges.js';
import { Tutorial } from './tutorial.js';

// ─── Constants ──────────────────────────────────────────────────────────────

const CANVAS_W = 960;
const CANVAS_H = 540;
const ROWS = 3;
const COLS = 6;

// Grid layout (enemies come from LEFT, house on RIGHT)
const GRID_LEFT = 60;
const GRID_TOP = 100;
const GRID_RIGHT = 760;
const GRID_BOTTOM = 500;
const CELL_W = (GRID_RIGHT - GRID_LEFT) / COLS;   // ~116
const CELL_H = (GRID_BOTTOM - GRID_TOP) / ROWS;   // ~133

const HOUSE_X = GRID_RIGHT;
const HOUSE_W = CANVAS_W - GRID_RIGHT;

const HUD_HEIGHT = 90;
const PROJECTILE_SPEED = 250; // pixels/sec (moves LEFT toward enemies)

// ─── Game States ────────────────────────────────────────────────────────────

const STATE = {
    MENU: 'menu',
    LEVEL_SELECT: 'levelSelect',
    PLAYING: 'playing',
    PAUSED: 'paused',
    CHALLENGE: 'challenge',
    WAVE_CLEAR: 'waveClear',
    LEVEL_WON: 'levelWon',
    LEVEL_LOST: 'levelLost',
    STICKER_BOOK: 'stickerBook',
};

// Pause button dimensions (large for kid-friendly touch targets)
const PAUSE_BTN_X = CANVAS_W - 55;
const PAUSE_BTN_Y = HUD_HEIGHT + 12;
const PAUSE_BTN_SIZE = 48;

// ─── Game Class ─────────────────────────────────────────────────────────────

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // HiDPI/Retina support
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = CANVAS_W * dpr;
        this.canvas.height = CANVAS_H * dpr;
        this.ctx.scale(dpr, dpr);

        // State
        this.state = STATE.MENU;
        this.time = 0;
        this.lastTime = 0;

        // Level state
        this.currentLevel = null;
        this.currentLevelIndex = 0;
        this.stars = 0;
        this.waveIndex = 0;
        this.waveTimer = 0;
        this.waveDelay = 3; // seconds between waves

        // Entities
        this.defenders = [];   // placed defenders on grid
        this.enemies = [];     // active enemies
        this.projectiles = []; // active projectiles
        this.floatingStars = []; // collectible stars on field
        this.particles = [];   // visual effects

        // Grid (which cells have defenders)
        this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

        // UI state
        this.selectedDefender = null; // defender type being placed
        this.dragging = null;         // {type, x, y} while dragging
        this.hoverCell = null;        // {row, col} under mouse

        // Challenge
        this.activeChallenge = null;
        this.challengeResult = null;  // 'correct'|'wrong'
        this.challengeResultTimer = 0;
        this.pendingStarReward = 0;
        this.speakerBtnArea = null;   // {x,y,w,h} for the replay-instructions button
        this.speakerBtnHover = false;

        // Tutorial
        this.tutorial = new Tutorial(this);

        // Progression
        this.earnedStickers = new Set();
        this.loadProgress();

        // Wave spawning
        this.waveEnemies = [];    // enemies yet to spawn in current wave
        this.spawnTimers = [];    // timers for delayed spawns

        // Level transition
        this.transitionTimer = 0;

        // Confetti
        this.confetti = [];

        // Input
        this.mouse = { x: 0, y: 0, down: false };
        this.setupInput();

        // Start game loop
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    // ─── Save / Load ────────────────────────────────────────────────────

    loadProgress() {
        try {
            const data = localStorage.getItem('wisdomDefenders');
            if (data) {
                const parsed = JSON.parse(data);
                this.earnedStickers = new Set(parsed.stickers || []);
                this.highestLevel = parsed.highestLevel || 0;
                this.tutorial.done = !!parsed.tutorialDone;
            } else {
                this.highestLevel = 0;
            }
        } catch {
            this.highestLevel = 0;
        }
    }

    saveProgress() {
        try {
            localStorage.setItem('wisdomDefenders', JSON.stringify({
                stickers: [...this.earnedStickers],
                highestLevel: this.highestLevel,
                tutorialDone: this.tutorial.done,
            }));
        } catch { /* ignore */ }
    }

    // ─── Input ──────────────────────────────────────────────────────────

    setupInput() {
        const getPos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = CANVAS_W / rect.width;
            const scaleY = CANVAS_H / rect.height;

            let clientX, clientY;
            if (e.touches) {
                clientX = e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX;
                clientY = e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY,
            };
        };

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            const pos = getPos(e);
            this.mouse = { ...pos, down: true };
            this.onPointerDown(pos);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const pos = getPos(e);
            this.mouse = { ...pos, down: this.mouse.down };
            this.onPointerMove(pos);
        });

        this.canvas.addEventListener('mouseup', (e) => {
            const pos = getPos(e);
            this.mouse = { ...pos, down: false };
            this.onPointerUp(pos);
        });

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const pos = getPos(e);
            this.mouse = { ...pos, down: true };
            this.onPointerDown(pos);
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const pos = getPos(e);
            this.mouse = { ...pos, down: this.mouse.down };
            this.onPointerMove(pos);
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const pos = getPos(e);
            this.mouse = { ...pos, down: false };
            this.onPointerUp(pos);
        }, { passive: false });
    }

    onPointerDown(pos) {
        initAudio();

        switch (this.state) {
            case STATE.MENU:
                this.onMenuClick(pos);
                break;
            case STATE.LEVEL_SELECT:
                this.onLevelSelectClick(pos);
                break;
            case STATE.PLAYING:
                this.onPlayingClick(pos);
                break;
            case STATE.PAUSED:
                this.onPausedClick(pos);
                break;
            case STATE.CHALLENGE:
                this.onChallengeClick(pos);
                break;
            case STATE.WAVE_CLEAR:
                // auto-advance after timer
                break;
            case STATE.LEVEL_WON:
                this.onLevelWonClick(pos);
                break;
            case STATE.LEVEL_LOST:
                this.onLevelLostClick(pos);
                break;
            case STATE.STICKER_BOOK:
                this.onStickerBookClick(pos);
                break;
        }
    }

    onPointerMove(pos) {
        if (this.state === STATE.PLAYING) {
            // Update hover cell
            this.hoverCell = this.screenToGrid(pos.x, pos.y);

            // Update drag position
            if (this.dragging) {
                this.dragging.x = pos.x;
                this.dragging.y = pos.y;
            }
        }

        if (this.state === STATE.CHALLENGE && this.activeChallenge) {
            this.activeChallenge.handleHover?.(pos.x, pos.y);

            // Track hover state for the speaker replay button
            if (this.speakerBtnArea) {
                const b = this.speakerBtnArea;
                this.speakerBtnHover =
                    pos.x >= b.x && pos.x <= b.x + b.w &&
                    pos.y >= b.y && pos.y <= b.y + b.h;
            }
        }
    }

    onPointerUp(pos) {
        if (this.state === STATE.PLAYING && this.dragging) {
            const cell = this.screenToGrid(pos.x, pos.y);
            if (cell && !this.grid[cell.row][cell.col]) {
                if (this.tutorial.handlePointerUp(cell, this.dragging.type)) {
                    // Tutorial handled placement
                } else {
                    this.placeDefender(this.dragging.type, cell.row, cell.col);
                }
            }
            this.dragging = null;
        }
    }

    // ─── Screen ↔ Grid conversion ───────────────────────────────────────

    screenToGrid(sx, sy) {
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

    gridToScreen(row, col) {
        return {
            x: GRID_LEFT + col * CELL_W + CELL_W / 2,
            y: GRID_TOP + row * CELL_H + CELL_H / 2,
        };
    }

    // ─── Menu Handlers ──────────────────────────────────────────────────

    onMenuClick(pos) {
        // Play button area (center of screen)
        const btnX = CANVAS_W / 2 - 80;
        const btnY = CANVAS_H * 0.55;
        if (pos.x >= btnX && pos.x <= btnX + 160 && pos.y >= btnY && pos.y <= btnY + 60) {
            playClick();
            this.state = STATE.LEVEL_SELECT;
        }
    }

    onLevelSelectClick(pos) {
        // Check which level button was clicked
        const levels = LEVELS;
        const cols = 3;
        const rows = Math.ceil(levels.length / cols);
        const btnW = 120;
        const btnH = 75;
        const spacing = 18;
        const startX = CANVAS_W / 2 - (cols * (btnW + spacing) - spacing) / 2;
        const startY = 95;

        for (let i = 0; i < levels.length; i++) {
            const c = i % cols;
            const r = Math.floor(i / cols);
            const bx = startX + c * (btnW + spacing);
            const by = startY + r * (btnH + spacing);

            if (pos.x >= bx && pos.x <= bx + btnW && pos.y >= by && pos.y <= by + btnH) {
                if (i <= this.highestLevel) {
                    playClick();
                    this.startLevel(i);
                }
                return;
            }
        }

        // Back button
        if (pos.x >= 20 && pos.x <= 120 && pos.y >= 20 && pos.y <= 60) {
            playClick();
            this.state = STATE.MENU;
            return;
        }

        // My Stickers button
        const gridBottom = startY + rows * (btnH + spacing);
        const stickerBtnW = 200;
        const stickerBtnH = 45;
        const stickerBtnX = CANVAS_W / 2 - stickerBtnW / 2;
        const stickerBtnY = gridBottom + 8;
        if (pos.x >= stickerBtnX && pos.x <= stickerBtnX + stickerBtnW &&
            pos.y >= stickerBtnY && pos.y <= stickerBtnY + stickerBtnH) {
            playClick();
            this.state = STATE.STICKER_BOOK;
            return;
        }
    }

    // ─── Playing Handlers ───────────────────────────────────────────────

    onPlayingClick(pos) {
        // Tutorial interception — all logic delegated to Tutorial class
        if (this.tutorial.isActive) {
            this.tutorial.handleClick(pos);
            return;
        }

        // Help button check (Level 1 only, after tutorial done)
        if (this.tutorial.checkHelpButtonClick(pos)) return;

        // Check if clicking the pause button
        if (pos.x >= PAUSE_BTN_X && pos.x <= PAUSE_BTN_X + PAUSE_BTN_SIZE &&
            pos.y >= PAUSE_BTN_Y && pos.y <= PAUSE_BTN_Y + PAUSE_BTN_SIZE) {
            playClick();
            this.pauseGame();
            return;
        }

        // Check if clicking a floating star
        for (let i = this.floatingStars.length - 1; i >= 0; i--) {
            const star = this.floatingStars[i];
            const dx = pos.x - star.x;
            const dy = pos.y - star.y;
            if (dx * dx + dy * dy < 600) { // ~24px radius
                this.floatingStars.splice(i, 1);
                playStarCollect();

                // Trigger a challenge for the star
                this.pendingStarReward = 2;
                this.showChallenge();
                return;
            }
        }

        // Check if clicking on defender bar (HUD)
        if (pos.y < HUD_HEIGHT) {
            this.onHUDClick(pos);
            return;
        }

        // If a defender is selected and clicking on the grid, start dragging
        if (this.selectedDefender) {
            const def = DEFENDER_DEFS[this.selectedDefender];
            if (this.stars >= def.cost) {
                this.dragging = { type: this.selectedDefender, x: pos.x, y: pos.y };
            }
            return;
        }

        // Clicking on grid directly (without selection) - do nothing
    }

    onHUDClick(pos) {
        if (!this.currentLevel) return;

        const defenders = this.currentLevel.availableDefenders;

        for (let i = 0; i < defenders.length; i++) {
            const btn = this.getDefenderButtonRect(i);
            if (pos.x >= btn.x && pos.x <= btn.x + btn.w && pos.y >= btn.y && pos.y <= btn.y + btn.h) {
                const defId = defenders[i];
                const def = DEFENDER_DEFS[defId];

                if (this.stars >= def.cost) {
                    if (this.selectedDefender === defId) {
                        this.selectedDefender = null; // deselect
                    } else {
                        this.selectedDefender = defId;
                        playClick();
                    }
                }
                return;
            }
        }
    }

    // ─── Challenge Handlers ─────────────────────────────────────────────

    onChallengeClick(pos) {
        if (!this.activeChallenge) return;
        if (this.challengeResult) return; // already showing result

        // Check if the speaker replay button was clicked
        if (this.speakerBtnArea) {
            const b = this.speakerBtnArea;
            if (pos.x >= b.x && pos.x <= b.x + b.w && pos.y >= b.y && pos.y <= b.y + b.h) {
                if (this.activeChallenge.questionText) {
                    speak(this.activeChallenge.questionText);
                }
                return;
            }
        }

        const result = this.activeChallenge.checkAnswer(pos.x, pos.y);
        if (result === 'correct') {
            playCorrect();
            this.challengeResult = 'correct';
            this.challengeResultTimer = 1.2;
            this.stars += this.pendingStarReward || 2;
        } else if (result === 'wrong') {
            playWrong();
            this.challengeResult = 'wrong';
            this.challengeResultTimer = 1.2;
            this.stars += 1; // Always give at least 1 star (never punish)
        }
    }

    onLevelWonClick(pos) {
        // Must match coordinates from renderLevelWon
        const boxH = 350;
        const boxY = (CANVAS_H - boxH) / 2;
        const nextBtnX = CANVAS_W / 2 - 80;
        const nextBtnY = boxY + boxH * 0.62;
        if (pos.x >= nextBtnX && pos.x <= nextBtnX + 160 && pos.y >= nextBtnY && pos.y <= nextBtnY + 50) {
            playClick();
            if (this.currentLevelIndex + 1 < LEVELS.length) {
                this.startLevel(this.currentLevelIndex + 1);
            } else {
                this.state = STATE.LEVEL_SELECT;
            }
            return;
        }

        const menuBtnY = boxY + boxH * 0.82;
        if (pos.x >= nextBtnX && pos.x <= nextBtnX + 160 && pos.y >= menuBtnY && pos.y <= menuBtnY + 50) {
            playClick();
            stopBgMusic();
            this.state = STATE.LEVEL_SELECT;
        }
    }

    onLevelLostClick(pos) {
        // Must match coordinates from renderLevelLost
        const boxH = 280;
        const boxY = (CANVAS_H - boxH) / 2;
        const btnX = CANVAS_W / 2 - 80;
        const btnY = boxY + boxH * 0.5;
        if (pos.x >= btnX && pos.x <= btnX + 160 && pos.y >= btnY && pos.y <= btnY + 50) {
            playClick();
            this.startLevel(this.currentLevelIndex);
            return;
        }

        const menuBtnY = boxY + boxH * 0.73;
        if (pos.x >= btnX && pos.x <= btnX + 160 && pos.y >= menuBtnY && pos.y <= menuBtnY + 50) {
            playClick();
            stopBgMusic();
            this.state = STATE.LEVEL_SELECT;
        }
    }

    // ─── Pause Handlers ─────────────────────────────────────────────────

    pauseGame() {
        this.state = STATE.PAUSED;
        this.dragging = null;
        stopBgMusic();
    }

    resumeGame() {
        this.state = STATE.PLAYING;
        startBgMusic();
    }

    onPausedClick(pos) {
        // Resume button (centered on screen)
        const btnW = 220;
        const btnH = 70;
        const btnX = CANVAS_W / 2 - btnW / 2;
        const btnY = CANVAS_H / 2 - 10;
        if (pos.x >= btnX && pos.x <= btnX + btnW && pos.y >= btnY && pos.y <= btnY + btnH) {
            playClick();
            this.resumeGame();
            return;
        }

        // Menu button (below resume)
        const menuBtnY = btnY + 90;
        if (pos.x >= btnX && pos.x <= btnX + btnW && pos.y >= menuBtnY && pos.y <= menuBtnY + btnH) {
            playClick();
            stopBgMusic();
            this.state = STATE.LEVEL_SELECT;
        }
    }

    // ─── Game Logic ─────────────────────────────────────────────────────

    startLevel(index) {
        this.currentLevelIndex = index;
        this.currentLevel = LEVELS[index];
        this.state = STATE.PLAYING;

        // Reset
        this.stars = this.currentLevel.startingStars;
        this.waveIndex = 0;
        this.waveTimer = 8; // 8 seconds before first wave — gives kids time to place defenders
        this.defenders = [];
        this.enemies = [];
        this.projectiles = [];
        this.floatingStars = [];
        this.particles = [];
        this.confetti = [];
        this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
        this.selectedDefender = null;
        this.dragging = null;
        this.activeChallenge = null;
        this.challengeResult = null;
        this.waveEnemies = [];
        this.spawnTimers = [];
        this.transitionTimer = 0;
        this.starSpawnTimer = 8; // first bonus star after 8 seconds

        startBgMusic();
        playWaveStart();

        // Tutorial: activate on first play of Level 1
        if (index === 0 && !this.tutorial.done) {
            this.tutorial.start(this.waveTimer);
        }
    }

    getDefenderButtonRect(index) {
        if (!this.currentLevel) return null;
        const defenders = this.currentLevel.availableDefenders;
        if (index < 0 || index >= defenders.length) return null;
        const btnSize = 60, spacing = 10;
        const totalW = defenders.length * (btnSize + spacing) - spacing;
        const startX = CANVAS_W / 2 - totalW / 2;
        return { x: startX + index * (btnSize + spacing), y: 15, w: btnSize, h: btnSize };
    }

    placeDefender(type, row, col) {
        const def = DEFENDER_DEFS[type];
        if (this.stars < def.cost) return;
        if (this.grid[row][col]) return;

        this.stars -= def.cost;
        const pos = this.gridToScreen(row, col);

        const defender = {
            type,
            row,
            col,
            x: pos.x,
            y: pos.y,
            hp: def.hp,
            maxHp: def.hp,
            cooldownTimer: def.cooldown,
            def,
        };

        this.grid[row][col] = defender;
        this.defenders.push(defender);
        this.selectedDefender = null;
        playPlace();
    }

    getWaveDelay() {
        // Later levels/waves get more time between waves to prepare
        const baseDelay = 6;
        const levelBonus = Math.min(this.currentLevelIndex, 5) * 0.5; // +0.5s per level, up to +2.5s
        const waveBonus = Math.floor(this.waveIndex / 2) * 1;         // +1s every 2 waves
        return baseDelay + levelBonus + waveBonus;
    }

    showChallenge() {
        const types = this.currentLevel?.challengeTypes || ['counting'];
        this.activeChallenge = generateChallenge(types);
        this.challengeResult = null;
        this.challengeResultTimer = 0;
        this.state = STATE.CHALLENGE;

        // Read the question aloud for kids who can't read yet
        if (this.activeChallenge.questionText) {
            speak(this.activeChallenge.questionText);
        }
    }

    spawnEnemy(type, lane) {
        const def = ENEMY_DEFS[type];
        if (!def) return;

        const enemy = {
            type,
            lane,
            x: -30, // spawn off-screen left
            y: GRID_TOP + lane * CELL_H + CELL_H / 2,
            hp: def.hp,
            maxHp: def.hp,
            speed: def.speed,
            damage: def.damage,
            def,
            skippedFirst: false,
            attackTarget: null,
            attackTimer: 0,
            slowTimer: 0,
            slowAmount: 1,
        };

        this.enemies.push(enemy);
    }

    spawnStar() {
        // Spawn a random floating star on the field
        const x = GRID_LEFT + Math.random() * (GRID_RIGHT - GRID_LEFT);
        const y = GRID_TOP + Math.random() * (GRID_BOTTOM - GRID_TOP);
        this.floatingStars.push({
            x, y,
            spawnTime: this.time,
            lifetime: 10, // disappears after 10 seconds
        });
    }

    // ─── Update Loop ────────────────────────────────────────────────────

    update(dt) {
        // When paused, do nothing — freeze all game logic
        if (this.state === STATE.PAUSED) return;

        if (this.state !== STATE.PLAYING) {
            // Update challenge result timer
            if (this.state === STATE.CHALLENGE && this.challengeResult) {
                this.challengeResultTimer -= dt;
                if (this.challengeResultTimer <= 0) {
                    this.activeChallenge = null;
                    this.challengeResult = null;
                    this.pendingStarReward = 0;
                    this.speakerBtnArea = null;
                    this.speakerBtnHover = false;
                    this.state = STATE.PLAYING;

                    // Advance tutorial if we were on the star_collected step
                    if (this.tutorial.isActive && this.tutorial.currentStep.id === 'collect_star') {
                        this.tutorial.advance();
                    }
                }
            }

            // Update wave clear transition
            if (this.state === STATE.WAVE_CLEAR) {
                this.transitionTimer -= dt;
                if (this.transitionTimer <= 0) {
                    this.state = STATE.PLAYING;
                    this.waveTimer = this.getWaveDelay(); // pause before next wave — scales with level
                }
            }

            // Update confetti
            this.updateConfetti(dt);

            return;
        }

        // Tutorial: freeze wave timer and update tutorial timers
        if (this.tutorial.isActive) {
            this.tutorial.updateTimers(dt);
        }
        this.tutorial.updateHelpButton();

        // ── Wave management ──
        if (!this.tutorial.isActive) {
            this.waveTimer -= dt;
        }

        if (this.waveTimer <= 0 && this.waveIndex < this.currentLevel.waves.length) {
            if (this.waveEnemies.length === 0 && this.spawnTimers.length === 0) {
                // Start next wave
                const wave = this.currentLevel.waves[this.waveIndex];
                this.spawnTimers = wave.enemies.map(e => ({
                    type: e.type,
                    lane: e.lane,
                    delay: e.delay,
                    timer: e.delay,
                }));
                this.waveIndex++;
            }
        }

        // Process spawn timers
        for (let i = this.spawnTimers.length - 1; i >= 0; i--) {
            this.spawnTimers[i].timer -= dt;
            if (this.spawnTimers[i].timer <= 0) {
                const s = this.spawnTimers[i];
                this.spawnEnemy(s.type, s.lane);
                this.spawnTimers.splice(i, 1);
            }
        }

        // ── Star generators ──
        for (const defender of this.defenders) {
            if (defender.def.isGenerator) {
                defender.cooldownTimer -= dt;
                if (defender.cooldownTimer <= 0) {
                    defender.cooldownTimer = defender.def.cooldown;
                    // Create a floating star near the defender
                    this.floatingStars.push({
                        x: defender.x + (Math.random() - 0.5) * 40,
                        y: defender.y - 40 - Math.random() * 30,
                        spawnTime: this.time,
                        lifetime: 12,
                    });
                }
            }
        }

        // ── Bonus stars timer ──
        this.starSpawnTimer -= dt;
        if (this.starSpawnTimer <= 0) {
            this.starSpawnTimer = 12 + Math.random() * 5;
            this.spawnStar();
        }

        // ── Floating stars expiry ──
        for (let i = this.floatingStars.length - 1; i >= 0; i--) {
            const star = this.floatingStars[i];
            if (this.time - star.spawnTime > star.lifetime) {
                this.floatingStars.splice(i, 1);
            }
        }

        // ── Defender shooting ──
        for (const defender of this.defenders) {
            if (defender.def.isGenerator || defender.def.isWall) continue;

            defender.cooldownTimer -= dt;
            if (defender.cooldownTimer <= 0) {
                // Check if there's an enemy in this lane (to the left of defender)
                const hasTarget = this.enemies.some(e =>
                    e.lane === defender.row && e.x < defender.x && e.hp > 0
                );

                if (hasTarget) {
                    defender.cooldownTimer = defender.def.cooldown;

                    if (defender.def.hitsAll) {
                        // Music bird: damage all enemies in lane
                        for (const enemy of this.enemies) {
                            if (enemy.lane === defender.row && enemy.hp > 0) {
                                enemy.hp -= defender.def.damage;
                                if (enemy.hp <= 0) {
                                    this.onEnemyDeath(enemy);
                                }
                            }
                        }
                        // Visual: wide projectile
                        this.projectiles.push({
                            x: defender.x,
                            y: defender.y,
                            lane: defender.row,
                            type: defender.def.projectileType,
                            damage: 0, // already applied
                            speed: PROJECTILE_SPEED * 1.5,
                            isWave: true,
                            value: null,
                        });
                        playShoot();
                    } else {
                        // Normal projectile
                        this.projectiles.push({
                            x: defender.x - 20,
                            y: defender.y,
                            lane: defender.row,
                            type: defender.def.projectileType,
                            damage: defender.def.damage,
                            speed: PROJECTILE_SPEED,
                            slowAmount: defender.def.slowAmount || 0,
                            value: defender.def.projectileType === 'number'
                                ? String(Math.floor(Math.random() * 9) + 1)
                                : defender.def.projectileType === 'letter'
                                    ? 'אבגדהוזחטי'[Math.floor(Math.random() * 10)]
                                    : defender.def.projectileType === 'color'
                                        ? ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'][Math.floor(Math.random() * 5)]
                                        : null,
                        });
                        playShoot();
                    }
                }
            }
        }

        // ── Update projectiles ──
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.x -= proj.speed * dt; // Move LEFT toward enemies

            // Off-screen
            if (proj.x < -50) {
                this.projectiles.splice(i, 1);
                continue;
            }

            // Wave projectiles don't do collision
            if (proj.isWave) continue;

            // Check collision with enemies
            for (const enemy of this.enemies) {
                if (enemy.lane === proj.lane && enemy.hp > 0) {
                    const dx = proj.x - enemy.x;
                    const dy = proj.y - enemy.y;
                    if (dx * dx + dy * dy < 900) { // ~30px
                        enemy.hp -= proj.damage;
                        playHit();

                        // Apply slow
                        if (proj.slowAmount) {
                            enemy.slowTimer = 3;
                            enemy.slowAmount = proj.slowAmount;
                        }

                        if (enemy.hp <= 0) {
                            this.onEnemyDeath(enemy);
                        }

                        this.projectiles.splice(i, 1);
                        break;
                    }
                }
            }
        }

        // ── Update enemies ──
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (enemy.hp <= 0) {
                this.enemies.splice(i, 1);
                continue;
            }

            // Slow effect
            let speedMult = 1;
            if (enemy.slowTimer > 0) {
                enemy.slowTimer -= dt;
                speedMult = enemy.slowAmount;
            }

            // Check if attacking a defender
            if (enemy.attackTarget) {
                if (enemy.attackTarget.hp <= 0) {
                    // Defender destroyed
                    enemy.attackTarget = null;
                    enemy.attackTimer = 0;
                } else {
                    enemy.attackTimer -= dt;
                    if (enemy.attackTimer <= 0) {
                        enemy.attackTarget.hp -= enemy.damage;
                        enemy.attackTimer = 1; // attack every second

                        if (enemy.attackTarget.hp <= 0) {
                            // Remove defender from grid
                            const d = enemy.attackTarget;
                            this.grid[d.row][d.col] = null;
                            this.defenders = this.defenders.filter(dd => dd !== d);
                            enemy.attackTarget = null;
                        }
                    }
                    continue; // Don't move while attacking
                }
            }

            // Move RIGHT (toward house)
            enemy.x += enemy.speed * speedMult * dt;

            // Check collision with defenders
            for (const defender of this.defenders) {
                if (defender.row !== enemy.lane) continue;
                if (defender.hp <= 0) continue;

                const dx = enemy.x - defender.x;
                if (dx > -10 && dx < 30) {
                    // Bubble trouble: skip first defender
                    if (enemy.def.floats && !enemy.skippedFirst) {
                        enemy.skippedFirst = true;
                        continue;
                    }

                    enemy.attackTarget = defender;
                    enemy.attackTimer = 0.5;
                    break;
                }
            }

            // Check if enemy reached the house
            if (enemy.x >= GRID_RIGHT + 20) {
                this.onEnemyReachedHouse();
                break;
            }
        }

        // ── Check wave/level completion ──
        if (this.enemies.length === 0 && this.spawnTimers.length === 0) {
            if (this.waveIndex >= this.currentLevel.waves.length) {
                // All waves completed!
                this.onLevelComplete();
            } else if (this.waveIndex > 0 && this.waveTimer <= 0) {
                // Wave cleared, brief celebration
                this.state = STATE.WAVE_CLEAR;
                this.transitionTimer = 1.5;
            }
        }

        // ── Update particles ──
        this.updateParticles(dt);
        this.updateConfetti(dt);
    }

    onEnemyDeath(enemy) {
        playPop();
        // Spawn death particles
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: enemy.x,
                y: enemy.y,
                vx: (Math.random() - 0.5) * 100,
                vy: (Math.random() - 0.5) * 100 - 50,
                life: 0.5 + Math.random() * 0.3,
                maxLife: 0.8,
                color: '#95a5a6',
                size: 4 + Math.random() * 4,
            });
        }

        // Boss: spawn gremlins
        if (enemy.def.spawnsOnDamage && enemy.hp <= 0) {
            // Already dead, spawn gremlins as celebration/extra challenge
            for (let lane = 0; lane < ROWS; lane++) {
                if (Math.random() > 0.5) {
                    this.spawnTimers.push({
                        type: 'gigglyGremlin',
                        lane,
                        delay: Math.random() * 2,
                        timer: Math.random() * 2,
                    });
                }
            }
        }
    }

    onEnemyReachedHouse() {
        stopBgMusic();
        playGameOver();
        this.state = STATE.LEVEL_LOST;
    }

    onLevelComplete() {
        stopBgMusic();
        playCelebration();
        this.state = STATE.LEVEL_WON;

        // Award sticker
        const sticker = this.currentLevel.stickerReward;
        this.earnedStickers.add(`${this.currentLevelIndex}_${sticker}`);

        // Unlock next level
        if (this.currentLevelIndex >= this.highestLevel) {
            this.highestLevel = this.currentLevelIndex + 1;
        }
        this.saveProgress();

        // Confetti!
        for (let i = 0; i < 50; i++) {
            this.confetti.push({
                x: Math.random() * CANVAS_W,
                y: -20 - Math.random() * 100,
                vx: (Math.random() - 0.5) * 60,
                vy: 80 + Math.random() * 120,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 5,
                color: ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#e67e22'][Math.floor(Math.random() * 6)],
                size: 6 + Math.random() * 6,
                life: 3 + Math.random() * 2,
            });
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 200 * dt; // gravity
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateConfetti(dt) {
        for (let i = this.confetti.length - 1; i >= 0; i--) {
            const c = this.confetti[i];
            c.x += c.vx * dt;
            c.y += c.vy * dt;
            c.rotation += c.rotSpeed * dt;
            c.life -= dt;
            if (c.life <= 0 || c.y > CANVAS_H + 20) {
                this.confetti.splice(i, 1);
            }
        }
    }

    // ─── Render ─────────────────────────────────────────────────────────

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        switch (this.state) {
            case STATE.MENU:
                this.renderMenu();
                break;
            case STATE.LEVEL_SELECT:
                this.renderLevelSelect();
                break;
            case STATE.PLAYING:
            case STATE.WAVE_CLEAR:
                this.renderGame();
                if (this.state === STATE.PLAYING && this.tutorial.isActive) {
                    this.tutorial.render();
                }
                if (this.state === STATE.WAVE_CLEAR) {
                    this.renderWaveClear();
                }
                break;
            case STATE.PAUSED:
                this.renderGame();
                this.renderPaused();
                break;
            case STATE.CHALLENGE:
                this.renderGame();
                this.renderChallenge();
                break;
            case STATE.LEVEL_WON:
                this.renderGame();
                this.renderLevelWon();
                break;
            case STATE.LEVEL_LOST:
                this.renderGame();
                this.renderLevelLost();
                break;
            case STATE.STICKER_BOOK:
                this.renderStickerBook();
                break;
        }

        // Always render confetti on top
        this.renderConfetti();
    }

    // ─── Menu Screen ────────────────────────────────────────────────────

    renderMenu() {
        const ctx = this.ctx;

        // Sky background
        const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
        skyGrad.addColorStop(0, '#87CEEB');
        skyGrad.addColorStop(0.7, '#b8e6f0');
        skyGrad.addColorStop(1, '#98FB98');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // ── Pulsing Sun with Rotating Rays ──
        const sunX = 100, sunY = 80;
        const sunBaseR = 45;
        const sunPulse = sunBaseR + Math.sin(this.time * 2) * 5;

        // Outer glow layers
        ctx.fillStyle = 'rgba(241, 196, 15, 0.1)';
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunPulse + 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(241, 196, 15, 0.2)';
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunPulse + 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(241, 196, 15, 0.35)';
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunPulse + 12, 0, Math.PI * 2);
        ctx.fill();

        // Rotating triangular rays
        const rayRotation = this.time * 0.3;
        ctx.fillStyle = '#f1c40f';
        for (let r = 0; r < 12; r++) {
            const angle = rayRotation + (r * Math.PI * 2) / 12;
            ctx.save();
            ctx.translate(sunX, sunY);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(sunPulse + 5, -6);
            ctx.lineTo(sunPulse + 28, 0);
            ctx.lineTo(sunPulse + 5, 6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Main sun circle
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunPulse, 0, Math.PI * 2);
        ctx.fill();
        // Sun highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.arc(sunX - 10, sunY - 10, sunPulse * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // ── Drifting Clouds ──
        const clouds = [
            { baseX: 0, y: 55, size: 40, speed: 18 },
            { baseX: 200, y: 35, size: 32, speed: 12 },
            { baseX: 450, y: 70, size: 38, speed: 15 },
            { baseX: 650, y: 25, size: 28, speed: 10 },
            { baseX: 850, y: 60, size: 34, speed: 20 },
        ];
        for (const c of clouds) {
            const cx = (c.baseX + this.time * c.speed) % (CANVAS_W + 200) - 100;
            this.drawCloud(ctx, cx, c.y, c.size);
        }

        // ── Floating Sparkle Stars ──
        const sparkles = [
            { x: 180, y: 30, phase: 0, speed: 3.0 },
            { x: 320, y: 55, phase: 1.2, speed: 2.5 },
            { x: 500, y: 20, phase: 2.5, speed: 3.5 },
            { x: 620, y: 65, phase: 0.8, speed: 2.8 },
            { x: 750, y: 35, phase: 3.8, speed: 3.2 },
            { x: 870, y: 50, phase: 1.5, speed: 2.2 },
            { x: 410, y: 80, phase: 4.2, speed: 2.9 },
            { x: 560, y: 45, phase: 5.0, speed: 3.3 },
            { x: 240, y: 90, phase: 2.0, speed: 2.6 },
            { x: 700, y: 15, phase: 3.2, speed: 3.1 },
        ];
        for (const s of sparkles) {
            const alpha = 0.3 + Math.sin(this.time * s.speed + s.phase) * 0.35 + 0.35;
            const sz = 3 + Math.sin(this.time * s.speed + s.phase) * 1.5;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            // 4-pointed star
            ctx.moveTo(s.x, s.y - sz);
            ctx.lineTo(s.x + sz * 0.3, s.y - sz * 0.3);
            ctx.lineTo(s.x + sz, s.y);
            ctx.lineTo(s.x + sz * 0.3, s.y + sz * 0.3);
            ctx.lineTo(s.x, s.y + sz);
            ctx.lineTo(s.x - sz * 0.3, s.y + sz * 0.3);
            ctx.lineTo(s.x - sz, s.y);
            ctx.lineTo(s.x - sz * 0.3, s.y - sz * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // ── Title Text Animation ──
        const titleY = CANVAS_H * 0.2 + Math.sin(this.time * 1.5) * 6;
        const titleScale = 1 + Math.sin(this.time * 2) * 0.03;
        ctx.save();
        ctx.translate(CANVAS_W / 2, titleY);
        ctx.scale(titleScale, titleScale);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 52px Arial';
        // Outer glow
        ctx.shadowColor = 'rgba(241, 196, 15, 0.5)';
        ctx.shadowBlur = 15;
        // Drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillText('שומרי החוכמה', 3, 4);
        ctx.shadowBlur = 0;
        // Thick outline
        ctx.strokeStyle = '#1a252f';
        ctx.lineWidth = 5;
        ctx.strokeText('שומרי החוכמה', 0, 0);
        // Gradient fill
        const titleGrad = ctx.createLinearGradient(-150, -25, 150, 25);
        titleGrad.addColorStop(0, '#f39c12');
        titleGrad.addColorStop(0.5, '#f1c40f');
        titleGrad.addColorStop(1, '#e67e22');
        ctx.fillStyle = titleGrad;
        ctx.fillText('שומרי החוכמה', 0, 0);
        ctx.restore();

        // Subtitle with offset phase
        const subY = CANVAS_H * 0.3 + Math.sin(this.time * 1.5 + 0.8) * 5;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.font = '24px Arial';
        ctx.fillText('Wisdom Defenders', CANVAS_W / 2 + 2, subY + 2);
        // Main subtitle
        ctx.fillStyle = '#5d6d7e';
        ctx.fillText('Wisdom Defenders', CANVAS_W / 2, subY);
        ctx.restore();

        // ── All 7 Defenders in Showcase Row ──
        const defenderNames = [
            'starMaker', 'numberBuddy', 'letterLion', 'colorFlower',
            'shapeShield', 'patternPeacock', 'musicBird'
        ];
        const defStartX = 100;
        const defSpacing = (CANVAS_W - 200) / (defenderNames.length - 1);
        const defBaseY = 365;
        for (let i = 0; i < defenderNames.length; i++) {
            const dx = defStartX + i * defSpacing;
            const dy = defBaseY + Math.sin(this.time * 2 + i * 0.9) * 8;
            DEFENDER_SPRITES[defenderNames[i]](ctx, dx, dy, 32, this.time);
        }

        // ── Play Button with Pulsing Glow ──
        const btnX = CANVAS_W / 2 - 80;
        const btnY = CANVAS_H * 0.55;
        const glowIntensity = 8 + Math.sin(this.time * 3) * 6;
        ctx.save();
        ctx.shadowColor = 'rgba(46, 204, 113, 0.6)';
        ctx.shadowBlur = glowIntensity;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        this.drawButton(ctx, btnX, btnY, 160, 60, 15, '#2ecc71', '#27ae60');
        ctx.restore();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u200Fבואו נשחק!', CANVAS_W / 2, btnY + 30);

        // ── Wandering Enemies ──
        const enemies = [
            { name: 'muddleCloud', startX: 0, speed: 25, y: 435 },
            { name: 'messMonster', startX: 250, speed: 18, y: 450 },
            { name: 'sleepySnail', startX: 500, speed: 12, y: 440 },
            { name: 'gigglyGremlin', startX: 750, speed: 22, y: 455 },
        ];
        for (const e of enemies) {
            const ex = (e.startX + this.time * e.speed) % (CANVAS_W + 100) - 50;
            ENEMY_SPRITES[e.name](ctx, ex, e.y, 26, this.time);
        }

        // ── Enhanced Grass with Dual-Wave Animation ──
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(0, CANVAS_H - 40, CANVAS_W, 40);

        // Layer 1: darker grass blades
        ctx.fillStyle = '#1e8449';
        for (let i = 0; i < CANVAS_W; i += 12) {
            const sway = Math.sin(i * 0.1 + this.time * 1.5) * 5;
            const h = 14 + (i * 7 % 5);
            ctx.beginPath();
            ctx.moveTo(i, CANVAS_H - 40);
            ctx.lineTo(i + 5 + sway, CANVAS_H - 40 - h);
            ctx.lineTo(i + 10, CANVAS_H - 40);
            ctx.fill();
        }

        // Layer 2: lighter grass blades
        ctx.fillStyle = '#2ecc71';
        for (let i = 6; i < CANVAS_W; i += 15) {
            const sway = Math.sin(i * 0.15 + this.time * 2 + 1) * 6;
            const h = 12 + (i * 11 % 6);
            ctx.beginPath();
            ctx.moveTo(i, CANVAS_H - 40);
            ctx.lineTo(i + 6 + sway, CANVAS_H - 40 - h);
            ctx.lineTo(i + 12, CANVAS_H - 40);
            ctx.fill();
        }
    }

    // ─── Level Select ───────────────────────────────────────────────────

    renderLevelSelect() {
        const ctx = this.ctx;

        // Background
        const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
        grad.addColorStop(0, '#2c3e50');
        grad.addColorStop(1, '#3498db');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Floating sparkles in background
        const sparkles = [
            { x: 100, y: 80, phase: 0, speed: 2.5 },
            { x: 300, y: 120, phase: 1.0, speed: 3.0 },
            { x: 500, y: 60, phase: 2.2, speed: 2.8 },
            { x: 700, y: 100, phase: 0.5, speed: 3.2 },
            { x: 850, y: 70, phase: 3.5, speed: 2.3 },
            { x: 200, y: 480, phase: 1.8, speed: 2.7 },
            { x: 600, y: 500, phase: 4.0, speed: 3.1 },
            { x: 800, y: 460, phase: 2.8, speed: 2.6 },
        ];
        for (const s of sparkles) {
            const alpha = 0.15 + Math.sin(this.time * s.speed + s.phase) * 0.15 + 0.15;
            const sz = 2 + Math.sin(this.time * s.speed + s.phase) * 1;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(s.x, s.y - sz);
            ctx.lineTo(s.x + sz * 0.3, s.y - sz * 0.3);
            ctx.lineTo(s.x + sz, s.y);
            ctx.lineTo(s.x + sz * 0.3, s.y + sz * 0.3);
            ctx.lineTo(s.x, s.y + sz);
            ctx.lineTo(s.x - sz * 0.3, s.y + sz * 0.3);
            ctx.lineTo(s.x - sz, s.y);
            ctx.lineTo(s.x - sz * 0.3, s.y - sz * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('בחרו שלב', CANVAS_W / 2, 50);

        // Level buttons — compact grid to fit 10 levels + sticker button
        const cols = 3;
        const rows = Math.ceil(LEVELS.length / cols);
        const btnW = 120;
        const btnH = 75;
        const spacing = 18;
        const startX = CANVAS_W / 2 - (cols * (btnW + spacing) - spacing) / 2;
        const startY = 95;

        for (let i = 0; i < LEVELS.length; i++) {
            const c = i % cols;
            const r = Math.floor(i / cols);
            const bx = startX + c * (btnW + spacing);
            const by = startY + r * (btnH + spacing);

            const unlocked = i <= this.highestLevel;

            // Button background with gradient and shadow
            if (unlocked) {
                this.drawButton(ctx, bx, by, btnW, btnH, 12, '#2ecc71', '#27ae60');
            } else {
                this.drawButton(ctx, bx, by, btnW, btnH, 12, '#7f8c8d', '#666666');
            }

            // Level number
            ctx.fillStyle = '#fff';
            ctx.font = `bold 28px Arial`;
            ctx.fillText((i + 1).toString(), bx + btnW / 2, by + 28);

            // Level name
            ctx.font = '13px Arial';
            ctx.fillText(LEVELS[i].name, bx + btnW / 2, by + 55);

            // Sticker indicator
            const stickerKey = `${i}_${LEVELS[i].stickerReward}`;
            if (this.earnedStickers.has(stickerKey)) {
                drawSticker(ctx, bx + btnW - 15, by + 15, 12, LEVELS[i].stickerReward, true);
            }

            // Lock icon for locked levels
            if (!unlocked) {
                ctx.fillStyle = '#fff';
                ctx.font = '22px Arial';
                ctx.fillText('🔒', bx + btnW / 2, by + btnH / 2);
            }
        }

        // Back button
        this.drawButton(ctx, 20, 20, 100, 40, 8, '#e74c3c', '#c0392b');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('חזרה', 70, 42);

        // My Stickers button — placed below the grid
        const gridBottom = startY + rows * (btnH + spacing);
        const stickerBtnW = 200;
        const stickerBtnH = 45;
        const stickerBtnX = CANVAS_W / 2 - stickerBtnW / 2;
        const stickerBtnY = gridBottom + 8;
        this.drawButton(ctx, stickerBtnX, stickerBtnY, stickerBtnW, stickerBtnH, 12, '#f1c40f', '#d4ac0d');
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u{1F4D6} המדבקות שלי', CANVAS_W / 2, stickerBtnY + stickerBtnH / 2);
    }

    // ─── Sticker Book ────────────────────────────────────────────────────

    renderStickerBook() {
        const ctx = this.ctx;

        // Dark gradient background
        const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
        grad.addColorStop(0, '#1a1a2e');
        grad.addColorStop(1, '#2c3e50');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Gold decorative border
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 4;
        this.roundRect(ctx, 15, 15, CANVAS_W - 30, CANVAS_H - 30, 16);
        ctx.stroke();

        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u{1F4D6} \u05D0\u05D5\u05E1\u05E3 \u05D4\u05DE\u05D3\u05D1\u05E7\u05D5\u05EA', CANVAS_W / 2, 55);

        // Progress counter
        const earned = this.earnedStickers.size;
        const total = LEVELS.length;
        ctx.fillStyle = '#f1c40f';
        ctx.font = '20px Arial';
        ctx.fillText(`${earned}/${total} \u05DE\u05D3\u05D1\u05E7\u05D5\u05EA`, CANVAS_W / 2, 85);

        // Sticker grid — 3 columns
        const gridCols = 3;
        const spacingX = 150;
        const spacingY = 140;
        const gridStartX = CANVAS_W / 2 - (gridCols - 1) * spacingX / 2;
        const gridStartY = 160;

        for (let i = 0; i < LEVELS.length; i++) {
            const c = i % gridCols;
            const r = Math.floor(i / gridCols);
            const cx = gridStartX + c * spacingX;
            const cy = gridStartY + r * spacingY;

            const stickerKey = `${i}_${LEVELS[i].stickerReward}`;
            const isEarned = this.earnedStickers.has(stickerKey);

            if (isEarned) {
                // Gold background circle
                const pulse = 1 + Math.sin(this.time * 3 + i) * 0.1;
                ctx.save();
                ctx.translate(cx, cy);
                ctx.scale(pulse, pulse);
                ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
                ctx.beginPath();
                ctx.arc(0, 0, 40, 0, Math.PI * 2);
                ctx.fill();
                drawSticker(ctx, 0, 0, 30, LEVELS[i].stickerReward, true);
                ctx.restore();
            } else {
                drawSticker(ctx, cx, cy, 30, LEVELS[i].stickerReward, false);
            }

            // Level number
            ctx.fillStyle = isEarned ? '#fff' : '#7f8c8d';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`\u05E9\u05DC\u05D1 ${i + 1}`, cx, cy + 45);

            // Sticker type name
            ctx.font = '12px Arial';
            ctx.fillText(LEVELS[i].stickerReward, cx, cy + 62);
        }

        // Share button (only if at least 1 sticker earned)
        if (earned > 0) {
            const shareBtnW = 180;
            const shareBtnH = 50;
            const shareBtnX = CANVAS_W / 2 - shareBtnW / 2;
            const shareBtnY = 400;
            this.drawButton(ctx, shareBtnX, shareBtnY, shareBtnW, shareBtnH, 12, '#2ecc71', '#27ae60');
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 22px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('\u{1F4E4} \u05E9\u05EA\u05E4\u05D5!', CANVAS_W / 2, shareBtnY + shareBtnH / 2);
        }

        // Back button
        this.drawButton(ctx, 20, 20, 100, 40, 8, '#e74c3c', '#c0392b');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u05D7\u05D6\u05E8\u05D4', 70, 42);
    }

    onStickerBookClick(pos) {
        // Back button
        if (pos.x >= 20 && pos.x <= 120 && pos.y >= 20 && pos.y <= 60) {
            playClick();
            this.state = STATE.LEVEL_SELECT;
            return;
        }

        // Share button
        if (this.earnedStickers.size > 0) {
            const shareBtnW = 180;
            const shareBtnH = 50;
            const shareBtnX = CANVAS_W / 2 - shareBtnW / 2;
            const shareBtnY = 400;
            if (pos.x >= shareBtnX && pos.x <= shareBtnX + shareBtnW &&
                pos.y >= shareBtnY && pos.y <= shareBtnY + shareBtnH) {
                playClick();
                this.generateShareCard();
                return;
            }
        }
    }

    generateShareCard() {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = 800;
        offCanvas.height = 600;
        const offCtx = offCanvas.getContext('2d');

        // Background gradient (sky blue to green, like the game)
        const bgGrad = offCtx.createLinearGradient(0, 0, 0, 600);
        bgGrad.addColorStop(0, '#87CEEB');
        bgGrad.addColorStop(1, '#98FB98');
        offCtx.fillStyle = bgGrad;
        offCtx.fillRect(0, 0, 800, 600);

        // Decorative border
        offCtx.strokeStyle = '#f1c40f';
        offCtx.lineWidth = 6;
        offCtx.beginPath();
        offCtx.roundRect(10, 10, 780, 580, 20);
        offCtx.stroke();

        // Title
        offCtx.fillStyle = '#2c3e50';
        offCtx.font = 'bold 48px Arial';
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillText('\u05E9\u05D5\u05DE\u05E8\u05D9 \u05D4\u05D7\u05D5\u05DB\u05DE\u05D4', 400, 80);

        // Subtitle
        offCtx.fillStyle = '#e67e22';
        offCtx.font = 'bold 32px Arial';
        offCtx.fillText('\u{1F31F} \u05D0\u05D5\u05E1\u05E3 \u05D4\u05DE\u05D3\u05D1\u05E7\u05D5\u05EA \u05E9\u05DC\u05D9 \u{1F31F}', 400, 140);

        // Draw earned stickers in a row, centered
        const earnedArr = [];
        for (let i = 0; i < LEVELS.length; i++) {
            const stickerKey = `${i}_${LEVELS[i].stickerReward}`;
            if (this.earnedStickers.has(stickerKey)) {
                earnedArr.push({ index: i, type: LEVELS[i].stickerReward });
            }
        }

        const stickerSpacing = Math.min(120, 600 / (earnedArr.length + 1));
        const stickerRowX = 400 - (earnedArr.length - 1) * stickerSpacing / 2;
        const stickerRowY = 280;

        for (let j = 0; j < earnedArr.length; j++) {
            const sx = stickerRowX + j * stickerSpacing;
            // Gold background circle
            offCtx.fillStyle = 'rgba(241, 196, 15, 0.3)';
            offCtx.beginPath();
            offCtx.arc(sx, stickerRowY, 45, 0, Math.PI * 2);
            offCtx.fill();
            drawSticker(offCtx, sx, stickerRowY, 35, earnedArr[j].type, true);
        }

        // Progress bar
        const barX = 150;
        const barY = 420;
        const barW = 500;
        const barH = 30;
        const progress = this.earnedStickers.size / LEVELS.length;

        // Bar background
        offCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        offCtx.beginPath();
        offCtx.roundRect(barX, barY, barW, barH, 15);
        offCtx.fill();

        // Bar fill
        const fillGrad = offCtx.createLinearGradient(barX, 0, barX + barW, 0);
        fillGrad.addColorStop(0, '#f1c40f');
        fillGrad.addColorStop(1, '#e67e22');
        offCtx.fillStyle = fillGrad;
        offCtx.beginPath();
        offCtx.roundRect(barX, barY, barW * progress, barH, 15);
        offCtx.fill();

        // Progress text
        offCtx.fillStyle = '#2c3e50';
        offCtx.font = 'bold 20px Arial';
        offCtx.fillText(`${this.earnedStickers.size}/${LEVELS.length}`, 400, barY + barH + 30);

        // Footer
        offCtx.fillStyle = '#7f8c8d';
        offCtx.font = '22px Arial';
        offCtx.fillText('Wisdom Defenders \u{1F3AE}', 400, 540);

        // Share or download
        const dataUrl = offCanvas.toDataURL('image/png');
        if (navigator.share && navigator.canShare) {
            offCanvas.toBlob(async (blob) => {
                const file = new File([blob], 'wisdom-defenders-stickers.png', { type: 'image/png' });
                try {
                    await navigator.share({ files: [file], title: '\u05E9\u05D5\u05DE\u05E8\u05D9 \u05D4\u05D7\u05D5\u05DB\u05DE\u05D4' });
                } catch (e) {
                    this.downloadShareCard(dataUrl);
                }
            });
        } else {
            this.downloadShareCard(dataUrl);
        }
    }

    downloadShareCard(dataUrl) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'wisdom-defenders-stickers.png';
        a.click();
    }

    // ─── Game Field ─────────────────────────────────────────────────────

    renderGame() {
        const ctx = this.ctx;

        // Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
        skyGrad.addColorStop(0, '#87CEEB');
        skyGrad.addColorStop(0.6, '#b0e0b0');
        skyGrad.addColorStop(1, '#7ec87e');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Clouds
        this.drawCloud(ctx, 150 + Math.sin(this.time * 0.2) * 20, 30, 25);
        this.drawCloud(ctx, 500 + Math.sin(this.time * 0.15 + 1) * 20, 20, 20);

        // Grass/lawn grid
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cx = GRID_LEFT + col * CELL_W;
                const cy = GRID_TOP + row * CELL_H;

                // Alternating green shades with subtle gradient
                const isLight = (row + col) % 2 === 0;
                const cellGrad = ctx.createLinearGradient(cx, cy, cx, cy + CELL_H);
                cellGrad.addColorStop(0, isLight ? '#88d488' : '#74c474');
                cellGrad.addColorStop(1, isLight ? '#72c072' : '#5eae5e');
                ctx.fillStyle = cellGrad;
                ctx.fillRect(cx, cy, CELL_W, CELL_H);

                // Inner shadow/vignette (darker edges)
                const vigGrad = ctx.createRadialGradient(
                    cx + CELL_W / 2, cy + CELL_H / 2, CELL_W * 0.25,
                    cx + CELL_W / 2, cy + CELL_H / 2, CELL_W * 0.7
                );
                vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
                vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.06)');
                ctx.fillStyle = vigGrad;
                ctx.fillRect(cx, cy, CELL_W, CELL_H);

                // Grid lines
                ctx.strokeStyle = 'rgba(0,0,0,0.08)';
                ctx.lineWidth = 1;
                ctx.strokeRect(cx, cy, CELL_W, CELL_H);

                // Grass tufts (small dots/blades for texture)
                ctx.fillStyle = 'rgba(40, 160, 40, 0.25)';
                const seed = row * 7 + col * 13;
                for (let t = 0; t < 3; t++) {
                    const tx = cx + ((seed + t * 37) % 90) + 10;
                    const ty = cy + ((seed + t * 53) % 110) + 10;
                    ctx.beginPath();
                    ctx.arc(tx, ty, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Soft drop shadow along grid edges
        const gridShadowGrad = ctx.createLinearGradient(GRID_LEFT, GRID_BOTTOM, GRID_LEFT, GRID_BOTTOM + 8);
        gridShadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.12)');
        gridShadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gridShadowGrad;
        ctx.fillRect(GRID_LEFT, GRID_BOTTOM, GRID_RIGHT - GRID_LEFT, 8);

        // Hover highlight
        if (this.hoverCell && this.selectedDefender && this.state === STATE.PLAYING) {
            const { row, col } = this.hoverCell;
            const hx = GRID_LEFT + col * CELL_W;
            const hy = GRID_TOP + row * CELL_H;
            const canPlace = !this.grid[row][col];
            ctx.fillStyle = canPlace ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)';
            ctx.fillRect(hx, hy, CELL_W, CELL_H);
        }

        // Path/road at left (enemy entrance) with gradient
        const pathGrad = ctx.createLinearGradient(0, GRID_TOP, GRID_LEFT, GRID_TOP);
        pathGrad.addColorStop(0, '#9c8567');
        pathGrad.addColorStop(0.5, '#8B7355');
        pathGrad.addColorStop(1, '#7a6347');
        ctx.fillStyle = pathGrad;
        ctx.fillRect(0, GRID_TOP, GRID_LEFT, GRID_BOTTOM - GRID_TOP);

        // House
        drawHouse(ctx, HOUSE_X, GRID_TOP, HOUSE_W, GRID_BOTTOM - GRID_TOP);

        // ── Render defenders ──
        for (const defender of this.defenders) {
            const drawFn = DEFENDER_SPRITES[defender.type];
            if (drawFn) {
                drawFn(ctx, defender.x, defender.y, CELL_W * 0.35, this.time);
            }
            // Health bar (only if damaged)
            if (defender.hp < defender.maxHp) {
                drawHealthBar(ctx, defender.x, defender.y - CELL_H * 0.45, CELL_W * 0.6, defender.hp / defender.maxHp);
            }
        }

        // ── Render enemies ──
        for (const enemy of this.enemies) {
            if (enemy.hp <= 0) continue;
            const drawFn = ENEMY_SPRITES[enemy.type];
            if (drawFn) {
                drawFn(ctx, enemy.x, enemy.y, CELL_W * 0.35, this.time);
            }
            // Health bar
            if (enemy.hp < enemy.maxHp) {
                drawHealthBar(ctx, enemy.x, enemy.y - CELL_H * 0.45, CELL_W * 0.5, enemy.hp / enemy.maxHp);
            }
        }

        // ── Render projectiles ──
        for (const proj of this.projectiles) {
            if (proj.isWave) {
                // Wave attack (music bird) — horizontal line
                ctx.strokeStyle = 'rgba(155, 89, 182, 0.5)';
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.moveTo(proj.x, proj.y);
                ctx.lineTo(proj.x - 60, proj.y);
                ctx.stroke();
            } else {
                drawProjectile(ctx, proj.x, proj.y, 10, proj.type, proj.value, this.time);
            }
        }

        // ── Render floating stars ──
        for (const star of this.floatingStars) {
            const age = this.time - star.spawnTime;
            const float = Math.sin(age * 2) * 5;
            const fadeOut = star.lifetime - age < 2 ? (star.lifetime - age) / 2 : 1;
            ctx.globalAlpha = fadeOut;
            drawCollectStar(ctx, star.x, star.y + float, 15, this.time);
            ctx.globalAlpha = 1;
        }

        // ── Render particles ──
        for (const p of this.particles) {
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // ── Render dragging defender ──
        if (this.dragging) {
            ctx.globalAlpha = 0.7;
            const drawFn = DEFENDER_SPRITES[this.dragging.type];
            if (drawFn) {
                drawFn(ctx, this.dragging.x, this.dragging.y, CELL_W * 0.35, this.time);
            }
            ctx.globalAlpha = 1;
        }

        // ── HUD ──
        this.renderHUD();
    }

    renderHUD() {
        const ctx = this.ctx;

        // HUD background with gradient
        const hudGrad = ctx.createLinearGradient(0, 0, 0, HUD_HEIGHT);
        hudGrad.addColorStop(0, 'rgba(52, 73, 94, 0.9)');
        hudGrad.addColorStop(1, 'rgba(36, 52, 68, 0.88)');
        ctx.fillStyle = hudGrad;
        ctx.fillRect(0, 0, CANVAS_W, HUD_HEIGHT);
        // Thin highlight line at bottom edge
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, HUD_HEIGHT);
        ctx.lineTo(CANVAS_W, HUD_HEIGHT);
        ctx.stroke();

        // Star count (top right because RTL)
        drawCollectStar(ctx, CANVAS_W - 40, 20, 14, this.time);
        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.stars.toString(), CANVAS_W - 60, 22);

        // Wave indicator (top left)
        ctx.fillStyle = '#ecf0f1';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        const totalWaves = this.currentLevel?.waves.length || 0;
        ctx.fillText(`גל ${this.waveIndex}/${totalWaves}`, 15, 22);

        // Level name
        ctx.fillStyle = '#ecf0f1';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(this.currentLevel?.name || '', 15, 45);

        // Wave countdown timer
        if (this.waveTimer > 0 && this.waveIndex < totalWaves && this.enemies.length === 0 && this.spawnTimers.length === 0) {
            const secs = Math.ceil(this.waveTimer);
            const timerText = `\u200Fהגל הבא בעוד: ${secs}`;
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.strokeText(timerText, CANVAS_W / 2, CANVAS_H - 30);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(timerText, CANVAS_W / 2, CANVAS_H - 30);

            // Progress bar
            const barW = 160;
            const barH = 6;
            const barX = CANVAS_W / 2 - barW / 2;
            const barY = CANVAS_H - 16;
            const maxTimer = this.waveIndex === 0 ? 8 : this.getWaveDelay();
            const progress = 1 - (this.waveTimer / maxTimer);

            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            this.roundRect(ctx, barX, barY, barW, barH, 3);
            ctx.fill();
            ctx.fillStyle = '#f39c12';
            this.roundRect(ctx, barX, barY, barW * Math.max(0, progress), barH, 3);
            ctx.fill();
        }

        // Defender selection bar
        if (!this.currentLevel) return;
        const defenders = this.currentLevel.availableDefenders;

        for (let i = 0; i < defenders.length; i++) {
            const defId = defenders[i];
            const def = DEFENDER_DEFS[defId];
            const btn = this.getDefenderButtonRect(i);
            const bx = btn.x, by = btn.y, btnSize = btn.w;

            const canAfford = this.stars >= def.cost;
            const isSelected = this.selectedDefender === defId;

            // Button background with gradient
            const defBtnGrad = ctx.createLinearGradient(bx, by, bx, by + btnSize);
            defBtnGrad.addColorStop(0, isSelected ? '#f5ab35' : canAfford ? '#3d566e' : '#22303f');
            defBtnGrad.addColorStop(1, isSelected ? '#e08e0b' : canAfford ? '#2c3e50' : '#131d27');
            ctx.fillStyle = defBtnGrad;
            this.roundRect(ctx, bx, by, btnSize, btnSize, 8);
            ctx.fill();

            if (isSelected) {
                ctx.strokeStyle = '#f1c40f';
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            // Subtle separator between buttons
            if (i > 0) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(bx - spacing / 2, by + 8);
                ctx.lineTo(bx - spacing / 2, by + btnSize - 8);
                ctx.stroke();
            }

            // Mini defender sprite
            const drawFn = DEFENDER_SPRITES[defId];
            if (drawFn) {
                ctx.globalAlpha = canAfford ? 1 : 0.4;
                drawFn(ctx, bx + btnSize / 2, by + btnSize / 2 - 5, btnSize * 0.28, this.time);
                ctx.globalAlpha = 1;
            }

            // Cost
            if (def.cost > 0) {
                ctx.fillStyle = canAfford ? '#f1c40f' : '#7f8c8d';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(`⭐${def.cost}`, bx + btnSize / 2, by + btnSize - 2);
            } else {
                ctx.fillStyle = '#2ecc71';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText('חינם', bx + btnSize / 2, by + btnSize - 2);
            }
        }

        // Pause button (below HUD, top-right corner — large and obvious)
        if (this.state === STATE.PLAYING) {
            const px = PAUSE_BTN_X;
            const py = PAUSE_BTN_Y;
            const ps = PAUSE_BTN_SIZE;

            // Button background
            ctx.fillStyle = 'rgba(44, 62, 80, 0.75)';
            this.roundRect(ctx, px, py, ps, ps, 12);
            ctx.fill();
            ctx.strokeStyle = '#ecf0f1';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Pause icon (two vertical bars)
            const barW = ps * 0.18;
            const barH = ps * 0.5;
            const gap = ps * 0.12;
            const barX = px + ps / 2 - gap / 2 - barW;
            const barY = py + ps / 2 - barH / 2;
            ctx.fillStyle = '#ecf0f1';
            this.roundRect(ctx, barX, barY, barW, barH, 3);
            ctx.fill();
            this.roundRect(ctx, barX + barW + gap, barY, barW, barH, 3);
            ctx.fill();
        }

        // Tutorial help button
        this.tutorial.renderHelpButton();
    }

    // ─── Challenge Overlay ──────────────────────────────────────────────

    renderChallenge() {
        const ctx = this.ctx;

        // Dim background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Challenge popup box
        const popW = CANVAS_W * 0.6;
        const popH = CANVAS_H * 0.7;
        const popX = (CANVAS_W - popW) / 2;
        const popY = (CANVAS_H - popH) / 2;

        // Drop shadow behind dialog
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 5;
        // Gradient background
        const popGrad = ctx.createLinearGradient(popX, popY, popX, popY + popH);
        popGrad.addColorStop(0, '#ffffff');
        popGrad.addColorStop(1, '#f0f0f0');
        ctx.fillStyle = popGrad;
        this.roundRect(ctx, popX, popY, popW, popH, 20);
        ctx.fill();
        ctx.restore();
        // Border
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 4;
        this.roundRect(ctx, popX, popY, popW, popH, 20);
        ctx.stroke();
        // Inner highlight border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        this.roundRect(ctx, popX + 3, popY + 3, popW - 6, popH - 6, 18);
        ctx.stroke();

        // Render the challenge content
        if (this.activeChallenge) {
            this.activeChallenge.render(ctx, { x: popX, y: popY, w: popW, h: popH }, this.time);
        }

        // Draw the speaker replay button (top-left of popup, large for kids)
        if (this.activeChallenge && !this.challengeResult) {
            const btnSize = 52;
            const btnMargin = 14;
            const btnX = popX + btnMargin;
            const btnY = popY + btnMargin;
            this.speakerBtnArea = { x: btnX, y: btnY, w: btnSize, h: btnSize };

            // Button background — rounded circle
            const cx = btnX + btnSize / 2;
            const cy = btnY + btnSize / 2;
            const r = btnSize / 2;

            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fillStyle = this.speakerBtnHover ? '#2980b9' : '#3498db';
            ctx.fill();
            if (this.speakerBtnHover) {
                ctx.shadowColor = 'rgba(52, 152, 219, 0.5)';
                ctx.shadowBlur = 10;
            }
            ctx.strokeStyle = '#2471a3';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();

            // Draw speaker icon programmatically (white on blue)
            ctx.save();
            ctx.translate(cx, cy);
            const s = btnSize * 0.22; // scale unit

            // Speaker body: back plate + horn expanding to the right
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            // Back plate (small rectangle on the left)
            ctx.moveTo(-s * 0.5, -s * 0.45);
            ctx.lineTo(0, -s * 0.45);
            // Horn expands outward to the right
            ctx.lineTo(s * 0.7, -s * 1.0);
            ctx.lineTo(s * 0.7, s * 1.0);
            ctx.lineTo(0, s * 0.45);
            ctx.lineTo(-s * 0.5, s * 0.45);
            ctx.closePath();
            ctx.fill();

            // Sound waves (arcs radiating from the right side of the horn)
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';

            // First wave (small)
            ctx.beginPath();
            ctx.arc(s * 0.7, 0, s * 0.55, -Math.PI * 0.3, Math.PI * 0.3);
            ctx.stroke();

            // Second wave (larger)
            ctx.beginPath();
            ctx.arc(s * 0.7, 0, s * 1.0, -Math.PI * 0.35, Math.PI * 0.35);
            ctx.stroke();

            ctx.restore();
        } else {
            this.speakerBtnArea = null;
        }

        // Show result feedback
        if (this.challengeResult) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.roundRect(ctx, popX, popY, popW, popH, 20);
            ctx.fill();

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (this.challengeResult === 'correct') {
                ctx.fillStyle = '#2ecc71';
                ctx.font = 'bold 48px Arial';
                ctx.fillText('\u200Fכל הכבוד!', CANVAS_W / 2, CANVAS_H / 2 - 20);
                ctx.font = '24px Arial';
                ctx.fillText('⭐⭐', CANVAS_W / 2, CANVAS_H / 2 + 30);
            } else {
                ctx.fillStyle = '#e67e22';
                ctx.font = 'bold 40px Arial';
                ctx.fillText('\u200Fניסיון יפה!', CANVAS_W / 2, CANVAS_H / 2 - 20);
                ctx.font = '24px Arial';
                ctx.fillText('⭐', CANVAS_W / 2, CANVAS_H / 2 + 30);
            }
        }
    }

    // ─── Wave Clear / Level Won / Level Lost overlays ───────────────────

    renderWaveClear() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 3;
        ctx.strokeText('\u200Fהגל עבר!', CANVAS_W / 2, CANVAS_H / 2);
        ctx.fillText('\u200Fהגל עבר!', CANVAS_W / 2, CANVAS_H / 2);
    }

    renderPaused() {
        const ctx = this.ctx;

        // Dim the game field
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Pause box
        const boxW = 340;
        const boxH = 300;
        const boxX = (CANVAS_W - boxW) / 2;
        const boxY = (CANVAS_H - boxH) / 2;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 5;
        const pauseGrad = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
        pauseGrad.addColorStop(0, '#ffffff');
        pauseGrad.addColorStop(1, '#f0f0f0');
        ctx.fillStyle = pauseGrad;
        this.roundRect(ctx, boxX, boxY, boxW, boxH, 24);
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 4;
        this.roundRect(ctx, boxX, boxY, boxW, boxH, 24);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        this.roundRect(ctx, boxX + 3, boxY + 3, boxW - 6, boxH - 6, 22);
        ctx.stroke();

        // Title
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u200Fהפסקה', CANVAS_W / 2, boxY + 60);

        // Pause icon (decorative)
        const iconY = boxY + 115;
        const iconBarW = 14;
        const iconBarH = 40;
        const iconGap = 12;
        ctx.fillStyle = '#3498db';
        this.roundRect(ctx, CANVAS_W / 2 - iconGap / 2 - iconBarW, iconY - iconBarH / 2, iconBarW, iconBarH, 4);
        ctx.fill();
        this.roundRect(ctx, CANVAS_W / 2 + iconGap / 2, iconY - iconBarH / 2, iconBarW, iconBarH, 4);
        ctx.fill();

        // Resume button (large, green, kid-friendly)
        const btnW = 220;
        const btnH = 70;
        const btnX = CANVAS_W / 2 - btnW / 2;
        const btnY = CANVAS_H / 2 - 10;

        this.drawButton(ctx, btnX, btnY, btnW, btnH, 16, '#2ecc71', '#27ae60');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px Arial';
        ctx.fillText('\u200Fהמשך לשחק!', CANVAS_W / 2, btnY + btnH / 2);

        // Menu button
        const menuBtnY = btnY + 90;
        this.drawButton(ctx, btnX, menuBtnY, btnW, btnH, 16, '#95a5a6', '#7f8c8d');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('תפריט ראשי', CANVAS_W / 2, menuBtnY + btnH / 2);
    }

    renderLevelWon() {
        const ctx = this.ctx;

        // Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Celebration box
        const boxW = 400;
        const boxH = 350;
        const boxX = (CANVAS_W - boxW) / 2;
        const boxY = (CANVAS_H - boxH) / 2;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 5;
        const wonGrad = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
        wonGrad.addColorStop(0, '#fffef5');
        wonGrad.addColorStop(1, '#f0ece0');
        ctx.fillStyle = wonGrad;
        this.roundRect(ctx, boxX, boxY, boxW, boxH, 20);
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 4;
        this.roundRect(ctx, boxX, boxY, boxW, boxH, 20);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        this.roundRect(ctx, boxX + 3, boxY + 3, boxW - 6, boxH - 6, 18);
        ctx.stroke();

        // Title
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u200F🎉 כל הכבוד! 🎉', CANVAS_W / 2, boxY + 55);

        // Sticker earned
        ctx.font = '22px Arial';
        ctx.fillStyle = '#7f8c8d';
        ctx.fillText('\u200Fקיבלת מדבקה!', CANVAS_W / 2, boxY + 100);

        drawSticker(ctx, CANVAS_W / 2, boxY + 155, 35, this.currentLevel?.stickerReward || 'star', true);

        // Next Level button
        const nextBtnX = CANVAS_W / 2 - 80;
        const nextBtnY = boxY + boxH * 0.62;
        this.drawButton(ctx, nextBtnX, nextBtnY, 160, 50, 12, '#2ecc71', '#27ae60');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px Arial';
        const nextText = (this.currentLevelIndex + 1 < LEVELS.length) ? 'שלב הבא' : '\u200Fסיימנו!';
        ctx.fillText(nextText, CANVAS_W / 2, nextBtnY + 25);

        // Back to menu button
        const menuBtnY = boxY + boxH * 0.82;
        this.drawButton(ctx, nextBtnX, menuBtnY, 160, 50, 12, '#95a5a6', '#7f8c8d');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('תפריט ראשי', CANVAS_W / 2, menuBtnY + 25);
    }

    renderLevelLost() {
        const ctx = this.ctx;

        // Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Box
        const boxW = 380;
        const boxH = 280;
        const boxX = (CANVAS_W - boxW) / 2;
        const boxY = (CANVAS_H - boxH) / 2;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 5;
        const lostGrad = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
        lostGrad.addColorStop(0, '#ffffff');
        lostGrad.addColorStop(1, '#f0f0f0');
        ctx.fillStyle = lostGrad;
        this.roundRect(ctx, boxX, boxY, boxW, boxH, 20);
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 4;
        this.roundRect(ctx, boxX, boxY, boxW, boxH, 20);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        this.roundRect(ctx, boxX + 3, boxY + 3, boxW - 6, boxH - 6, 18);
        ctx.stroke();

        // Encouraging message
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u200Fאופס!', CANVAS_W / 2, boxY + 50);

        ctx.font = '22px Arial';
        ctx.fillStyle = '#7f8c8d';
        ctx.fillText('\u200Fבואו ננסה שוב?', CANVAS_W / 2, boxY + 95);

        // Try again button
        const btnX = CANVAS_W / 2 - 80;
        const btnY = boxY + boxH * 0.5;
        this.drawButton(ctx, btnX, btnY, 160, 50, 12, '#3498db', '#2980b9');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px Arial';
        ctx.fillText('\u200Fנסו שוב!', CANVAS_W / 2, btnY + 25);

        // Back to menu
        const menuBtnY = boxY + boxH * 0.73;
        this.drawButton(ctx, btnX, menuBtnY, 160, 50, 12, '#95a5a6', '#7f8c8d');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('תפריט ראשי', CANVAS_W / 2, menuBtnY + 25);
    }

    renderConfetti() {
        const ctx = this.ctx;
        for (const c of this.confetti) {
            ctx.globalAlpha = Math.min(1, c.life);
            drawConfetti(ctx, c.x, c.y, c.size, c.color, c.rotation);
        }
        ctx.globalAlpha = 1;
    }

    // ─── Helpers ────────────────────────────────────────────────────────

    /**
     * Draw a polished button with gradient, highlight, and drop shadow.
     * baseColor: the main button color (hex string)
     */
    drawButton(ctx, x, y, w, h, r, baseColor, borderColor) {
        ctx.save();
        // Drop shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;

        // Gradient fill (lighter top → darker bottom)
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, this.lightenColor(baseColor, 20));
        grad.addColorStop(1, this.darkenColor(baseColor, 15));
        ctx.fillStyle = grad;
        this.roundRect(ctx, x, y, w, h, r);
        ctx.fill();
        ctx.restore();

        // Border
        ctx.strokeStyle = borderColor || this.darkenColor(baseColor, 25);
        ctx.lineWidth = 2;
        this.roundRect(ctx, x, y, w, h, r);
        ctx.stroke();

        // Inner highlight line at top
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + r + 2, y + 2);
        ctx.lineTo(x + w - r - 2, y + 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
    }

    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, (num >> 16) + Math.round(255 * percent / 100));
        const g = Math.min(255, ((num >> 8) & 0xFF) + Math.round(255 * percent / 100));
        const b = Math.min(255, (num & 0xFF) + Math.round(255 * percent / 100));
        return `rgb(${r}, ${g}, ${b})`;
    }

    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, (num >> 16) - Math.round(255 * percent / 100));
        const g = Math.max(0, ((num >> 8) & 0xFF) - Math.round(255 * percent / 100));
        const b = Math.max(0, (num & 0xFF) - Math.round(255 * percent / 100));
        return `rgb(${r}, ${g}, ${b})`;
    }

    drawCloud(ctx, x, y, size) {
        // Cloud puffs with positions and radii
        const puffs = [
            { dx: 0, dy: 0, r: size },
            { dx: size * 0.7, dy: size * 0.15, r: size * 0.75 },
            { dx: -size * 0.6, dy: size * 0.18, r: size * 0.65 },
            { dx: size * 0.25, dy: size * 0.35, r: size * 0.55 },
            { dx: -size * 0.25, dy: size * 0.3, r: size * 0.5 },
            { dx: size * 1.1, dy: size * 0.3, r: size * 0.5 },
        ];

        // Subtle shadow underneath
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        for (const p of puffs) {
            ctx.beginPath();
            ctx.arc(x + p.dx, y + p.dy + size * 0.25, p.r * 0.9, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cloud puffs with radial gradients
        for (const p of puffs) {
            const grad = ctx.createRadialGradient(
                x + p.dx - p.r * 0.2, y + p.dy - p.r * 0.2, 0,
                x + p.dx, y + p.dy, p.r
            );
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.7)');
            grad.addColorStop(1, 'rgba(240, 245, 255, 0.3)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x + p.dx, y + p.dy, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    roundRect(ctx, x, y, w, h, r) {
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

    // ─── Game Loop ──────────────────────────────────────────────────────

    loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // cap at 50ms
        this.lastTime = timestamp;
        this.time += dt;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }
}

// ─── Canvas Sizing ──────────────────────────────────────────────────────────

function resizeCanvas(canvas) {
    const container = canvas.parentElement;
    const aspect = CANVAS_W / CANVAS_H;
    let w = container.clientWidth;
    let h = container.clientHeight;

    if (w / h > aspect) {
        w = h * aspect;
    } else {
        h = w / aspect;
    }

    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    // HiDPI/Retina: scale backing buffer
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
}

// ─── Initialize ─────────────────────────────────────────────────────────────

const canvas = document.getElementById('game-canvas');
resizeCanvas(canvas);
window.addEventListener('resize', () => resizeCanvas(canvas));

const game = new Game(canvas);
