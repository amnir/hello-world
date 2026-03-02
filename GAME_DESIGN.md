# שומרי החוכמה - Wisdom Defenders
## Educational Plants vs Zombies for Pre-Schoolers (Ages 5-6)

---

## 1. Overview

A browser-based tower-defense game inspired by Plants vs Zombies, redesigned for
Hebrew-speaking pre-schoolers (ages 5-6). All challenges are **visual and interactive**
— no reading required. An adult can help with initial setup.

**Core Loop:** Place defenders on a grid → Enemies approach → Solve visual mini-challenges
to power your defenders → Defeat the wave → Progress to harder levels.

---

## 2. Game Grid & Simplifications

| Aspect | Original PvZ | Our Version |
|--------|-------------|-------------|
| Lanes | 5 | **3** (easier to manage) |
| Columns | 9 | **6** (shorter field) |
| Speed | Variable | **Slow** (gentle pace) |
| Currency | Sun falls from sky | **Stars (כוכבים)** earned from challenges |
| Controls | Click to place | **Drag & drop** (more intuitive) |

---

## 3. Subjects & Challenges (Age-Appropriate)

All challenges are **visual** — the child sees pictures, shapes, or objects and
interacts by tapping, dragging, or drawing.

### 3a. Numbers & Counting (מספרים וספירה)
- Count objects on screen (1-10)
- Match a number to a group of objects
- "Give me 3 apples" — drag the right amount

### 3b. Hebrew Letters (אותיות)
- Recognize a letter from 3 options (shown large and colorful)
- Trace a letter with finger/mouse
- Match letter to an object that starts with it (א = אריה with lion picture)

### 3c. Shapes & Colors (צורות וצבעים)
- Identify shapes: circle, square, triangle, star, heart
- Match colors by dragging
- "Find the red triangle" — tap the correct one

### 3d. Patterns & Sequences (דפוסים וסדרות)
- Complete a pattern: 🔴🔵🔴🔵❓
- What comes next in a size sequence?
- Arrange from small to big

### 3e. Nature & Animals (טבע וחיות)
- Match animal to its sound (with audio)
- Match baby animal to parent
- Which animal lives in water/land/sky?

---

## 4. Defenders (שומרים) — The "Plants"

Each defender is a **friendly character** themed around a school/learning tool.
They attack automatically but need **stars** to be placed.

| Defender | Hebrew Name | Visual | Cost | Ability | Challenge Type |
|----------|-------------|--------|------|---------|---------------|
| **Number Buddy** | חבר המספרים | Cute calculator character | 2⭐ | Shoots number bubbles at enemies | Counting |
| **Letter Lion** | אריה האותיות | Friendly lion with א on chest | 3⭐ | Roars letters that damage enemies | Hebrew Letters |
| **Color Flower** | פרח הצבעים | Rainbow flower | 2⭐ | Splashes color paint at enemies | Colors |
| **Shape Shield** | מגן הצורות | Smiling shield with shapes | 4⭐ | Blocks enemies (wall) | Shapes |
| **Star Maker** | יוצר הכוכבים | Happy star character | 2⭐ | Generates stars (currency) | Mini-challenge to collect |
| **Pattern Peacock** | טווס הדפוסים | Colorful peacock | 3⭐ | Slows enemies in lane | Patterns |
| **Music Bird** | ציפור המוזיקה | Singing bird | 3⭐ | Attacks all enemies in lane with sound waves | Sounds |

---

## 5. Enemies (בורים) — The "Zombies"

Enemies are **NOT scary** — they are goofy, silly, non-threatening "confusion clouds"
and "messy monsters." No blood, no horror. Think silly cartoon villains.

| Enemy | Hebrew Name | Visual | HP | Speed | Special |
|-------|-------------|--------|-----|-------|---------|
| **Muddle Cloud** | ענן הבלבול | Small grey cloud with dizzy eyes | Low | Slow | Basic enemy |
| **Mess Monster** | מפלצת הבלגן | Goofy monster covered in paint splotches | Medium | Slow | Leaves mess puddles that slow defenders |
| **Sleepy Snail** | חילזון הישנוני | Cute snail with sleep cap | High | Very Slow | Very tanky, yawns |
| **Giggly Gremlin** | שדון הצחקוקים | Small laughing imp | Low | Fast | Appears in groups |
| **Bubble Trouble** | בועות הצרות | Big soap bubble with silly face | Medium | Medium | Floats over first defender |
| **Boss: King Chaos** | מלך הבלגן | Big goofy crown-wearing monster | Very High | Slow | Appears every 5 waves, throws Giggly Gremlins |

---

## 6. Game Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Title Screen │────▶│ Level Select  │────▶│  Place Phase │
│  (Press Play) │     │  (1-20 levels)│     │  (30 seconds)│
└─────────────┘     └──────────────┘     └─────────────┘
                                                  │
                                                  ▼
                                          ┌─────────────┐
                              ┌──────────│  Wave Phase  │◀─────┐
                              │           │  (enemies!)  │      │
                              ▼           └─────────────┘      │
                     ┌─────────────┐              │             │
                     │  Challenge   │              │  More waves │
                     │  Pop-up!     │──────────────┘             │
                     │  (earn stars)│                            │
                     └─────────────┘     ┌─────────────┐       │
                                          │  Wave Clear! │───────┘
                                          │  (celebrate) │
                                          └─────────────┘
                                                  │ All waves done
                                                  ▼
                                          ┌─────────────┐
                                          │  Level Won!  │
                                          │  (stickers!) │
                                          └─────────────┘
```

### Star Generation
- **Star Maker** defender periodically creates a star that floats up
- Player taps the star → a quick mini-challenge appears
- Solve it correctly → get 2 stars
- Solve it wrong → get 1 star anyway (we never punish, just encourage!)
- Stars also appear randomly on the field every ~15 seconds

### Challenge Pop-ups
- Appear as a **friendly bubble** over the game
- Game **pauses** while challenge is active (no stress!)
- Large, colorful visuals
- Audio narration in Hebrew says the instruction
- Positive feedback always ("!כל הכבוד" / "!נסה שוב" with encouraging tone)

---

## 7. Reward System

- **Stickers (מדבקות):** Earn a sticker for completing each level
- **Sticker Book:** Collection screen showing all earned stickers
- **Celebration Animation:** Confetti + happy music when winning
- **No Fail State:** If enemies reach the house, gentle "Let's try again!" message
  (never "Game Over" or "You Lost")

---

## 8. Visual Style

- **Bright, saturated colors** — primary colors dominate
- **Large sprites** — easy to see and tap on small screens
- **Cartoon style** — similar to original PvZ but rounder, friendlier
- **Big eyes** on all characters — friendly and approachable
- **RTL layout** — enemies come from the LEFT (Hebrew reading direction),
  defenders protect the RIGHT side (the "home/house")
- **Background:** A friendly garden/yard with a cute house on the right

---

## 9. Audio Design

- **Hebrew narration** for all instructions
- **Cheerful background music** (loopable, not distracting)
- **Sound effects:** Pops, boings, giggles — nothing scary
- **Positive reinforcement sounds** for correct answers
- **Gentle "oops" sound** for wrong answers (never harsh)

---

## 10. Technical Architecture

```
project/
├── index.html          # Single page app
├── css/
│   └── style.css       # Responsive layout
├── js/
│   ├── game.js         # Main game engine & loop
│   ├── grid.js         # Grid system & lane management
│   ├── defenders.js    # Defender classes & behaviors
│   ├── enemies.js      # Enemy classes & wave system
│   ├── challenges.js   # Educational mini-game system
│   ├── ui.js           # UI overlays, menus, HUD
│   ├── audio.js        # Sound manager
│   ├── sprites.js      # Sprite/animation system (canvas-drawn)
│   └── levels.js       # Level definitions & progression
├── assets/
│   └── (audio files if any)
└── GAME_DESIGN.md      # This file
```

**Tech:** Pure HTML5 Canvas + JavaScript. No frameworks, no dependencies.
Everything drawn programmatically on canvas (no image assets needed).

---

## 11. RTL & Hebrew Notes

- All text rendered right-to-left
- Canvas text uses Hebrew fonts
- Enemies approach from the **left** side (matching Hebrew reading direction —
  "danger" comes from the unfamiliar left, "home" is on the familiar right)
- UI buttons have both icons AND Hebrew labels
- Numbers displayed in standard Arabic numerals (1, 2, 3) as used in Israel

---

## 12. Accessibility

- **Large touch targets** (minimum 48x48px)
- **High contrast** colors
- **No time pressure** on challenges (game pauses)
- **Audio + visual** instructions together
- **Forgiving gameplay** — stars given even for wrong answers (just fewer)
- **Simple drag & drop** — primary interaction method
