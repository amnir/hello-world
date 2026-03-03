# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wisdom Defenders (שומרי החוכמה) — a browser-based educational tower defense game for Hebrew-speaking pre-schoolers (ages 5-6), inspired by Plants vs Zombies. Pure HTML5 Canvas + vanilla JavaScript with no external runtime dependencies. Installable as a PWA (`manifest.json` + `sw.js`).

## Running the Project

No build step required. Serve the files with any HTTP server (needed for ES6 modules):

```
python3 -m http.server
```

Then open http://localhost:8000 in a browser.

Tests use Vitest. Run with:

```
npm test          # single run
npm run test:watch # watch mode
```

Test files live in `tests/` and mirror source modules: `challenges.test.js`, `game-logic.test.js`, `levels.test.js`.

## Architecture

**Entry point:** `index.html` loads `js/game.js` as an ES6 module. The canvas is 960×540.

Seven JS modules, all interconnected via ES6 imports:

- **js/game.js** — Main game engine. Contains the `Game` class which is a state machine (MENU → LEVEL_SELECT → PLAYING → PAUSED → CHALLENGE → WAVE_CLEAR → LEVEL_WON/LEVEL_LOST → STICKER_BOOK → SETTINGS). Handles the game loop, input (mouse + touch), entity management (defenders/enemies/projectiles arrays), collision detection, and rendering. Persists progress via localStorage.

- **js/game-logic.js** — Pure functions and constants extracted from game.js for testability. Grid constants, coordinate conversion (`screenToGrid`/`gridToScreen`), wave timing, combo rewards.

- **js/sprites.js** — All graphics drawn programmatically on canvas (no image assets). Exports `DEFENDER_SPRITES` and `ENEMY_SPRITES` objects keyed by type name, plus UI drawing helpers. Animations are time-based using an `elapsed` parameter.

- **js/levels.js** — Game content definitions: `DEFENDER_DEFS`, `ENEMY_DEFS`, and `LEVELS` array with wave compositions, available defenders, and challenge types.

- **js/challenges.js** — Educational mini-game challenges. Each type is registered in the `GENERATORS` export and provides `render()`, `checkAnswer()`, and `handleHover()` methods. All challenges are visual-only (no reading required).

- **js/audio.js** — Sound effects and background music synthesized via Web Audio API (no audio files). Uses Web Speech API for Hebrew text-to-speech instructions.

- **js/tutorial.js** — Guided tutorial for Level 1. Step-based system that walks new players through defender selection, placement, and star collection.

## Key Design Decisions

- **Procedural-first with optional image assets:** Defenders have AI-generated PNG sprites (`assets/defenders/`) loaded via `js/assets.js`, with automatic fallback to procedural canvas drawing if images fail. Enemy sprites and all audio remain fully procedural/synthesized.
- **RTL layout:** Enemies approach from the left, defenders protect the house on the right. Hebrew text and UI follow RTL conventions.
- **Grid-based:** 3 rows × 6 columns for defender placement.
- **Kid-safe:** Positive reinforcement (stars for all attempts), no scary content, large touch targets (48×48px min).

## Git Workflow

- Commit messages should be a single sentence.
- Create a new feature branch for each change.

## Tools

- `tools/test-challenges.html` — Backoffice page for testing challenge rendering in isolation.
- `scripts/generate-icons.html` — PWA icon generator.

## Design Document

`GAME_DESIGN.md` contains the comprehensive game design specification including all defender/enemy definitions, challenge examples, reward system, and accessibility requirements.
