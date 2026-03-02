# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wisdom Defenders (שומרי החוכמה) — a browser-based educational tower defense game for Hebrew-speaking pre-schoolers (ages 5-6), inspired by Plants vs Zombies. Pure HTML5 Canvas + vanilla JavaScript with no external dependencies.

## Running the Project

No build step required. Serve the files with any HTTP server (needed for ES6 modules):

```
python3 -m http.server
```

Then open http://localhost:8000 in a browser. There are no automated tests or linting configured.

## Architecture

**Entry point:** `index.html` loads `js/game.js` as an ES6 module. The canvas is 960×540.

Five JS modules, all interconnected via ES6 imports:

- **js/game.js** — Main game engine. Contains the `Game` class which is a state machine (MENU → LEVEL_SELECT → PLAYING → CHALLENGE → WAVE_CLEAR → LEVEL_WON/LEVEL_LOST). Handles the game loop, input (mouse + touch), entity management (defenders/enemies/projectiles arrays), collision detection, and rendering. Persists progress via localStorage.

- **js/sprites.js** — All graphics drawn programmatically on canvas (no image assets). Exports `DEFENDER_SPRITES` and `ENEMY_SPRITES` objects keyed by type name, plus UI drawing helpers. Animations are time-based using an `elapsed` parameter.

- **js/levels.js** — Game content definitions: `DEFENDER_DEFS` (7 types with stats), `ENEMY_DEFS` (6 types), and `LEVELS` array (6 levels with wave compositions, available defenders, and challenge types).

- **js/challenges.js** — Five educational mini-game types (counting, colors, letters, shapes, patterns). Each challenge type provides `render()`, `checkAnswer()`, and `handleHover()` methods. All challenges are visual-only (no reading required).

- **js/audio.js** — Sound effects and background music synthesized via Web Audio API (no audio files). Uses Web Speech API for Hebrew text-to-speech instructions.

## Key Design Decisions

- **No external assets:** All graphics are procedural canvas drawing, all audio is synthesized. This makes the project fully self-contained.
- **RTL layout:** Enemies approach from the left, defenders protect the house on the right. Hebrew text and UI follow RTL conventions.
- **Grid-based:** 3 rows × 6 columns for defender placement.
- **Kid-safe:** Positive reinforcement (stars for all attempts), no scary content, large touch targets (48×48px min).

## Git Workflow

- Commit messages should be a single sentence.
- Create a new feature branch for each change.

## Design Document

`GAME_DESIGN.md` contains the comprehensive game design specification including all defender/enemy definitions, challenge examples, reward system, and accessibility requirements.
