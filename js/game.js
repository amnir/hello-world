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
    playWaveStart, playGameOver, startBgMusic, stopBgMusic,
} from './audio.js';

import { DEFENDER_DEFS, ENEMY_DEFS, LEVELS } from './levels.js';
import { generateChallenge } from './challenges.js';

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
    CHALLENGE: 'challenge',
    WAVE_CLEAR: 'waveClear',
    LEVEL_WON: 'levelWon',
    LEVEL_LOST: 'levelLost',
};

// ─── Game Class ─────────────────────────────────────────────────────────────

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CANVAS_W;
        this.canvas.height = CANVAS_H;

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
        }
    }

    onPointerUp(pos) {
        if (this.state === STATE.PLAYING && this.dragging) {
            const cell = this.screenToGrid(pos.x, pos.y);
            if (cell && !this.grid[cell.row][cell.col]) {
                this.placeDefender(this.dragging.type, cell.row, cell.col);
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
        const btnW = 120;
        const btnH = 100;
        const spacing = 30;
        const startX = CANVAS_W / 2 - (cols * (btnW + spacing) - spacing) / 2;
        const startY = 160;

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
        }
    }

    // ─── Playing Handlers ───────────────────────────────────────────────

    onPlayingClick(pos) {
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
        const btnSize = 60;
        const spacing = 10;
        const totalW = defenders.length * (btnSize + spacing) - spacing;
        const startX = CANVAS_W / 2 - totalW / 2;

        for (let i = 0; i < defenders.length; i++) {
            const bx = startX + i * (btnSize + spacing);
            const by = 15;

            if (pos.x >= bx && pos.x <= bx + btnSize && pos.y >= by && pos.y <= by + btnSize) {
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
        if (this.state !== STATE.PLAYING) {
            // Update challenge result timer
            if (this.state === STATE.CHALLENGE && this.challengeResult) {
                this.challengeResultTimer -= dt;
                if (this.challengeResultTimer <= 0) {
                    this.activeChallenge = null;
                    this.challengeResult = null;
                    this.pendingStarReward = 0;
                    this.state = STATE.PLAYING;
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

        // ── Wave management ──
        this.waveTimer -= dt;

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
                if (this.state === STATE.WAVE_CLEAR) {
                    this.renderWaveClear();
                }
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
        skyGrad.addColorStop(1, '#98FB98');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Sun
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(100, 80, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
        ctx.beginPath();
        ctx.arc(100, 80, 70, 0, Math.PI * 2);
        ctx.fill();

        // Clouds
        this.drawCloud(ctx, 250, 60, 40);
        this.drawCloud(ctx, 600, 40, 30);
        this.drawCloud(ctx, 800, 80, 35);

        // Title
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 52px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('שומרי החוכמה', CANVAS_W / 2, CANVAS_H * 0.2);

        // Subtitle
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '24px Arial';
        ctx.fillText('Wisdom Defenders', CANVAS_W / 2, CANVAS_H * 0.3);

        // Show some characters
        const chars = [
            { draw: DEFENDER_SPRITES.numberBuddy, x: 200, y: 350 },
            { draw: DEFENDER_SPRITES.letterLion, x: 350, y: 360 },
            { draw: DEFENDER_SPRITES.starMaker, x: CANVAS_W / 2, y: 380 },
            { draw: DEFENDER_SPRITES.colorFlower, x: 610, y: 355 },
            { draw: DEFENDER_SPRITES.musicBird, x: 760, y: 360 },
        ];
        for (const ch of chars) {
            ch.draw(ctx, ch.x, ch.y, 35, this.time);
        }

        // Play button
        const btnX = CANVAS_W / 2 - 80;
        const btnY = CANVAS_H * 0.55;
        ctx.fillStyle = '#2ecc71';
        this.roundRect(ctx, btnX, btnY, 160, 60, 15);
        ctx.fill();
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('\u200Fבואו נשחק!', CANVAS_W / 2, btnY + 30);

        // Grass at bottom
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(0, CANVAS_H - 40, CANVAS_W, 40);
        ctx.fillStyle = '#2ecc71';
        for (let i = 0; i < CANVAS_W; i += 15) {
            ctx.beginPath();
            ctx.moveTo(i, CANVAS_H - 40);
            ctx.lineTo(i + 7, CANVAS_H - 55 - Math.sin(i * 0.1 + this.time) * 5);
            ctx.lineTo(i + 14, CANVAS_H - 40);
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

        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('בחרו שלב', CANVAS_W / 2, 70);

        // Level buttons
        const cols = 3;
        const btnW = 120;
        const btnH = 100;
        const spacing = 30;
        const startX = CANVAS_W / 2 - (cols * (btnW + spacing) - spacing) / 2;
        const startY = 160;

        for (let i = 0; i < LEVELS.length; i++) {
            const c = i % cols;
            const r = Math.floor(i / cols);
            const bx = startX + c * (btnW + spacing);
            const by = startY + r * (btnH + spacing);

            const unlocked = i <= this.highestLevel;

            // Button background
            ctx.fillStyle = unlocked ? '#2ecc71' : '#7f8c8d';
            this.roundRect(ctx, bx, by, btnW, btnH, 12);
            ctx.fill();
            ctx.strokeStyle = unlocked ? '#27ae60' : '#666';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Level number
            ctx.fillStyle = '#fff';
            ctx.font = `bold 32px Arial`;
            ctx.fillText((i + 1).toString(), bx + btnW / 2, by + 35);

            // Level name
            ctx.font = '14px Arial';
            ctx.fillText(LEVELS[i].name, bx + btnW / 2, by + 65);

            // Sticker indicator
            const stickerKey = `${i}_${LEVELS[i].stickerReward}`;
            if (this.earnedStickers.has(stickerKey)) {
                drawSticker(ctx, bx + btnW - 15, by + 15, 12, LEVELS[i].stickerReward, true);
            }

            // Lock icon for locked levels
            if (!unlocked) {
                ctx.fillStyle = '#fff';
                ctx.font = '24px Arial';
                ctx.fillText('🔒', bx + btnW / 2, by + btnH / 2);
            }
        }

        // Back button
        ctx.fillStyle = '#e74c3c';
        this.roundRect(ctx, 20, 20, 100, 40, 8);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('חזרה', 70, 42);
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
                const x = GRID_LEFT + col * CELL_W;
                const y = GRID_TOP + row * CELL_H;

                // Alternating green shades
                const shade = (row + col) % 2 === 0 ? '#7ec87e' : '#6ab86a';
                ctx.fillStyle = shade;
                ctx.fillRect(x, y, CELL_W, CELL_H);

                // Grid lines
                ctx.strokeStyle = 'rgba(0,0,0,0.08)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, CELL_W, CELL_H);
            }
        }

        // Hover highlight
        if (this.hoverCell && this.selectedDefender && this.state === STATE.PLAYING) {
            const { row, col } = this.hoverCell;
            const hx = GRID_LEFT + col * CELL_W;
            const hy = GRID_TOP + row * CELL_H;
            const canPlace = !this.grid[row][col];
            ctx.fillStyle = canPlace ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)';
            ctx.fillRect(hx, hy, CELL_W, CELL_H);
        }

        // Path/road at left (enemy entrance)
        ctx.fillStyle = '#8B7355';
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

        // HUD background
        ctx.fillStyle = 'rgba(44, 62, 80, 0.85)';
        ctx.fillRect(0, 0, CANVAS_W, HUD_HEIGHT);

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
            ctx.fillStyle = '#f39c12';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
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
        const btnSize = 60;
        const spacing = 10;
        const totalW = defenders.length * (btnSize + spacing) - spacing;
        const startX = CANVAS_W / 2 - totalW / 2;

        for (let i = 0; i < defenders.length; i++) {
            const defId = defenders[i];
            const def = DEFENDER_DEFS[defId];
            const bx = startX + i * (btnSize + spacing);
            const by = 15;

            const canAfford = this.stars >= def.cost;
            const isSelected = this.selectedDefender === defId;

            // Button background
            ctx.fillStyle = isSelected ? '#f39c12' : canAfford ? '#34495e' : '#1a252f';
            this.roundRect(ctx, bx, by, btnSize, btnSize, 8);
            ctx.fill();

            if (isSelected) {
                ctx.strokeStyle = '#f1c40f';
                ctx.lineWidth = 3;
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

        // Background
        ctx.fillStyle = '#fff';
        this.roundRect(ctx, popX, popY, popW, popH, 20);
        ctx.fill();
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Render the challenge content
        if (this.activeChallenge) {
            this.activeChallenge.render(ctx, { x: popX, y: popY, w: popW, h: popH }, this.time);
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

        ctx.fillStyle = '#fff';
        this.roundRect(ctx, boxX, boxY, boxW, boxH, 20);
        ctx.fill();
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 4;
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
        ctx.fillStyle = '#2ecc71';
        this.roundRect(ctx, nextBtnX, nextBtnY, 160, 50, 12);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px Arial';
        const nextText = (this.currentLevelIndex + 1 < LEVELS.length) ? 'שלב הבא' : '\u200Fסיימנו!';
        ctx.fillText(nextText, CANVAS_W / 2, nextBtnY + 25);

        // Back to menu button
        const menuBtnY = boxY + boxH * 0.82;
        ctx.fillStyle = '#95a5a6';
        this.roundRect(ctx, nextBtnX, menuBtnY, 160, 50, 12);
        ctx.fill();
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

        ctx.fillStyle = '#fff';
        this.roundRect(ctx, boxX, boxY, boxW, boxH, 20);
        ctx.fill();
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 4;
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
        ctx.fillStyle = '#3498db';
        this.roundRect(ctx, btnX, btnY, 160, 50, 12);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px Arial';
        ctx.fillText('\u200Fנסו שוב!', CANVAS_W / 2, btnY + 25);

        // Back to menu
        const menuBtnY = boxY + boxH * 0.73;
        ctx.fillStyle = '#95a5a6';
        this.roundRect(ctx, btnX, menuBtnY, 160, 50, 12);
        ctx.fill();
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

    drawCloud(ctx, x, y, size) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + size * 0.6, y + size * 0.2, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - size * 0.5, y + size * 0.2, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + size * 0.2, y + size * 0.4, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
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
}

// ─── Initialize ─────────────────────────────────────────────────────────────

const canvas = document.getElementById('game-canvas');
resizeCanvas(canvas);
window.addEventListener('resize', () => resizeCanvas(canvas));

const game = new Game(canvas);
