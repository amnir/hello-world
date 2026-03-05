// =============================================================================
// challenges.js — Educational mini-games that pop up during gameplay
// All challenges are VISUAL — no reading required for the child.
// The game pauses while a challenge is active.
// =============================================================================

const F = 'Rubik, "Segoe UI", "Trebuchet MS", system-ui, sans-serif';

// ─── Hebrew Data ─────────────────────────────────────────────────────────────

const HEBREW_LETTERS = [
    { letter: 'א', name: 'אלף', spoken: 'אָלֶף' },
    { letter: 'ב', name: 'בית', spoken: 'בֵּית' },
    { letter: 'ג', name: 'גימל', spoken: 'גִּימֶל' },
    { letter: 'ד', name: 'דלת', spoken: 'דָּלֶת' },
    { letter: 'ה', name: 'הא', spoken: 'הֵא' },
    { letter: 'ו', name: 'וו', spoken: 'וָו' },
    { letter: 'ז', name: 'זין', spoken: 'זַיִן' },
    { letter: 'ח', name: 'חית', spoken: 'חֵית' },
    { letter: 'ט', name: 'טית', spoken: 'טֵית' },
    { letter: 'י', name: 'יוד', spoken: 'יוֹד' },
];

const COLORS = [
    { name: 'אדום', color: '#e74c3c', nameEn: 'red' },
    { name: 'כחול', color: '#3498db', nameEn: 'blue' },
    { name: 'ירוק', color: '#2ecc71', nameEn: 'green' },
    { name: 'צהוב', color: '#f1c40f', nameEn: 'yellow' },
    { name: 'כתום', color: '#e67e22', nameEn: 'orange' },
    { name: 'סגול', color: '#9b59b6', nameEn: 'purple' },
];

const SHAPES = [
    { name: 'עיגול', nameEn: 'circle' },
    { name: 'ריבוע', nameEn: 'square' },
    { name: 'משולש', nameEn: 'triangle' },
    { name: 'כוכב', nameEn: 'star' },
    { name: 'לב', nameEn: 'heart' },
];

const FRUITS = [
    { emoji: '🍎', plural: 'תפוחים' },
    { emoji: '🍊', plural: 'תפוזים' },
    { emoji: '🍋', plural: 'לימונים' },
    { emoji: '🍐', plural: 'אגסים' },
    { emoji: '🍇', plural: 'אשכולות ענבים' },
    { emoji: '🍓', plural: 'תותים' },
    { emoji: '🍌', plural: 'בננות' },
    { emoji: '🍉', plural: 'אבטיחים' },
];

const ANIMALS = [
    { emoji: '🐶', name: 'כלב', habitat: 'land' },
    { emoji: '🐱', name: 'חתול', habitat: 'land' },
    { emoji: '🐟', name: 'דג', habitat: 'water' },
    { emoji: '🐦', name: 'ציפור', habitat: 'sky' },
    { emoji: '🐴', name: 'סוס', habitat: 'land' },
    { emoji: '🐘', name: 'פיל', habitat: 'land' },
    { emoji: '🐬', name: 'דולפין', habitat: 'water' },
    { emoji: '🦅', name: 'נשר', habitat: 'sky' },
    { emoji: '🐢', name: 'צב', habitat: 'water' },
    { emoji: '🦋', name: 'פרפר', habitat: 'sky' },
    { emoji: '🐄', name: 'פרה', habitat: 'land' },
    { emoji: '🐸', name: 'צפרדע', habitat: 'water' },
];

const ANIMAL_FOODS = [
    { animal: '🐵', animalName: 'קוף', food: '🍌', foodName: 'בננה' },
    { animal: '🐄', animalName: 'פרה', food: '🌿', foodName: 'עשב' },
    { animal: '🐱', animalName: 'חתול', food: '🐟', foodName: 'דג' },
    { animal: '🐶', animalName: 'כלב', food: '🦴', foodName: 'עצם' },
    { animal: '🐰', animalName: 'ארנב', food: '🥕', foodName: 'גזר' },
    { animal: '🐦', animalName: 'ציפור', food: '🐛', foodName: 'תולעת' },
    { animal: '🐘', animalName: 'פיל', food: '🥜', foodName: 'בוטנים' },
    { animal: '🐸', animalName: 'צפרדע', food: '🪰', foodName: 'זבוב' },
    { animal: '🐻', animalName: 'דוב', food: '🍯', foodName: 'דבש' },
    { animal: '🐴', animalName: 'סוס', food: '🌾', foodName: 'חציר' },
];

const PAIRS = [
    { item: '☂️', itemName: 'מטרייה', question: 'מטרייה פותחים כשיש...', match: '🌧️', matchName: 'גשם', wrong: ['🌞', '🍎'] },
    { item: '🔑', itemName: 'מפתח', question: 'מפתח פותח...', match: '🚪', matchName: 'דלת', wrong: ['🌸', '⭐'] },
    { item: '🪥', itemName: 'מברשת שיניים', question: 'מברשת שיניים מנקה...', match: '🦷', matchName: 'שן', wrong: ['👟', '🎈'] },
    { item: '🧦', itemName: 'גרב', question: 'גרב נכנסת ל...', match: '👟', matchName: 'נעל', wrong: ['🌞', '🍌'] },
    { item: '🖍️', itemName: 'צבע', question: 'צבע צובעים על...', match: '📄', matchName: 'נייר', wrong: ['🍕', '⚽'] },
    { item: '🌺', itemName: 'פרח', question: 'מי בא לפרח?', match: '🐝', matchName: 'דבורה', wrong: ['❄️', '🔑'] },
    { item: '🛏️', itemName: 'מיטה', question: 'ישנים במיטה כשיש...', match: '🌙', matchName: 'ירח', wrong: ['⚽', '🥕'] },
    { item: '🍳', itemName: 'מחבת', question: 'מחבת שמים על...', match: '🔥', matchName: 'אש', wrong: ['📚', '🎵'] },
];

const HABITATS = [
    { id: 'land', emoji: '🌳', name: 'יבשה', color: '#27ae60' },
    { id: 'water', emoji: '🌊', name: 'מים', color: '#3498db' },
    { id: 'sky', emoji: '☁️', name: 'שמיים', color: '#85c1e9' },
];

// ─── Utility ─────────────────────────────────────────────────────────────────

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Shape Drawing Helpers (for challenge rendering) ─────────────────────────

function drawShapeAt(ctx, shape, x, y, size, color = '#3498db') {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    switch (shape) {
        case 'circle':
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'square':
            ctx.fillRect(x - size, y - size, size * 2, size * 2);
            ctx.strokeRect(x - size, y - size, size * 2, size * 2);
            break;
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(x, y - size);
            ctx.lineTo(x + size, y + size * 0.7);
            ctx.lineTo(x - size, y + size * 0.7);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 'star': {
            ctx.beginPath();
            for (let i = 0; i < 10; i++) {
                const r = i % 2 === 0 ? size : size * 0.45;
                const angle = (i * Math.PI) / 5 - Math.PI / 2;
                const px = x + Math.cos(angle) * r;
                const py = y + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        }
        case 'heart': {
            // Center the heart on (x, y), proportions matched to ❤️ emoji
            const tip = y + size * 0.9;    // bottom tip
            const dip = y - size * 0.2;    // center dip between bumps
            ctx.beginPath();
            ctx.moveTo(x, tip);
            // Left half: wider bumps to match emoji proportions
            ctx.bezierCurveTo(
                x - size * 1.5, y + size * 0.1,   // wide at bottom
                x - size * 0.85, y - size * 1.2,  // apex: high, slightly inward
                x, dip                              // center dip
            );
            // Right half: mirror
            ctx.bezierCurveTo(
                x + size * 0.85, y - size * 1.2,  // apex: high, slightly inward
                x + size * 1.5, y + size * 0.1,   // wide at bottom
                x, tip                              // back to tip
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        }
    }
}

// ─── Challenge Generators ───────────────────────────────────────────────────
// Each generator returns a challenge object:
// {
//   type: string,
//   render(ctx, area, time): void,       — draws the challenge
//   checkAnswer(x, y): 'correct'|'wrong'|null,  — checks click/tap
//   options: [{x,y,w,h}]                — clickable areas
// }

/**
 * COUNTING: "How many apples?" — Show N fruits, present 3 number choices
 */
function generateCountingChallenge() {
    const correctCount = randInt(1, 7);
    const fruitObj = randChoice(FRUITS);
    const fruit = fruitObj.emoji;

    // Generate wrong answers that are close but different
    let options = [correctCount];
    while (options.length < 3) {
        const wrong = correctCount + randChoice([-2, -1, 1, 2]);
        if (wrong > 0 && wrong <= 10 && !options.includes(wrong)) {
            options.push(wrong);
        }
    }
    options = shuffle(options);

    const correctIndex = options.indexOf(correctCount);

    return {
        type: 'counting',
        questionText: `כמה ${fruitObj.plural} יש פה?`,
        correctIndex,
        render(ctx, area, time) {
            const { x, y, w, h } = area;

            // Title area — show fruits to count
            ctx.font = `${Math.min(w / (correctCount + 1), 50)}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Arrange fruits in a row/grid
            const fruitSize = Math.min(w / (correctCount + 2), 45);
            const totalWidth = correctCount * fruitSize;
            const startX = x + w / 2 - totalWidth / 2 + fruitSize / 2;

            for (let i = 0; i < correctCount; i++) {
                const fx = startX + i * fruitSize;
                const fy = y + h * 0.3;
                ctx.font = `${fruitSize * 0.8}px ${F}`;
                ctx.fillText(fruit, fx, fy);
            }

            // Question
            drawQuestion(ctx, '\u200Fכמה?', x + w / 2, y + h * 0.52, h * 0.08);

            // Answer options (3 big number buttons)
            this.optionAreas = [];
            const btnW = w * 0.22;
            const btnH = h * 0.22;
            const btnY = y + h * 0.65;
            const spacing = w * 0.28;
            const startBtnX = x + w / 2 - spacing;

            options.forEach((num, i) => {
                const bx = startBtnX + i * spacing - btnW / 2;
                const by = btnY;

                const isHover = this._hoverIndex === i;
                drawChallengeButton(ctx, bx, by, btnW, btnH, 14, '#3498db', '#1a6fa0', isHover);

                ctx.fillStyle = '#fff';
                ctx.font = `bold ${btnH * 0.6}px ${F}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                ctx.lineWidth = 3;
                ctx.lineJoin = 'round';
                ctx.strokeText(num.toString(), bx + btnW / 2, by + btnH / 2);
                ctx.fillText(num.toString(), bx + btnW / 2, by + btnH / 2);

                this.optionAreas[i] = { x: bx, y: by, w: btnW, h: btnH };
            });
        },
        checkAnswer(px, py) {
            if (!this.optionAreas) return null;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    return i === correctIndex ? 'correct' : 'wrong';
                }
            }
            return null;
        },
        handleHover(px, py) {
            this._hoverIndex = -1;
            if (!this.optionAreas) return;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    this._hoverIndex = i;
                }
            }
        },
    };
}

/**
 * COLORS: "Find the [color]!" — Show colored circles, pick the named color
 */
function generateColorChallenge() {
    // Pick 3 different colors
    const selected = shuffle(COLORS).slice(0, 3);
    const correctIdx = randInt(0, 2);
    const correctColor = selected[correctIdx];

    return {
        type: 'colors',
        questionText: `איפה הצבע ה${correctColor.name}?`,
        render(ctx, area, time) {
            const { x, y, w, h } = area;

            // Listening prompt — question is read aloud
            ctx.fillStyle = '#7f8c8d';
            ctx.font = `bold ${h * 0.09}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔊', x + w / 2, y + h * 0.25);

            // Answer options: 3 large colored circles
            this.optionAreas = [];
            const circleR = Math.min(w * 0.12, h * 0.14);
            const spacing = w * 0.28;
            const startX = x + w / 2 - spacing;
            const cy = y + h * 0.58;

            selected.forEach((col, i) => {
                const cx = startX + i * spacing;
                const isHover = this._hoverIndex === i;
                const r = isHover ? circleR * 1.15 : circleR;

                draw3DCircle(ctx, cx, cy, r, col.color, isHover);

                this.optionAreas[i] = { x: cx - r, y: cy - r, w: r * 2, h: r * 2, cx, cy, r };
            });
        },
        checkAnswer(px, py) {
            if (!this.optionAreas) return null;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                const dx = px - a.cx;
                const dy = py - a.cy;
                if (dx * dx + dy * dy <= a.r * a.r) {
                    return i === correctIdx ? 'correct' : 'wrong';
                }
            }
            return null;
        },
        handleHover(px, py) {
            this._hoverIndex = -1;
            if (!this.optionAreas) return;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                const dx = px - a.cx;
                const dy = py - a.cy;
                if (dx * dx + dy * dy <= a.r * a.r) {
                    this._hoverIndex = i;
                }
            }
        },
    };
}

/**
 * LETTERS: "Find the letter!" — Show a big letter, pick from 3 options
 */
function generateLetterChallenge() {
    const selected = shuffle(HEBREW_LETTERS).slice(0, 3);
    const correctIdx = randInt(0, 2);
    const correctLetter = selected[correctIdx];

    return {
        type: 'letters',
        questionText: `מצאו את האות ${correctLetter.spoken}`,
        render(ctx, area, time) {
            const { x, y, w, h } = area;

            // Listening prompt — question is read aloud
            ctx.fillStyle = '#7f8c8d';
            ctx.font = `bold ${h * 0.09}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔊', x + w / 2, y + h * 0.25);

            // Answer options: 3 letters in boxes
            this.optionAreas = [];
            const btnSize = Math.min(w * 0.22, h * 0.26);
            const spacing = w * 0.28;
            const startX = x + w / 2 - spacing;
            const btnY = y + h * 0.48;

            selected.forEach((item, i) => {
                const bx = startX + i * spacing - btnSize / 2;
                const by = btnY;
                const isHover = this._hoverIndex === i;

                drawChallengeButton(ctx, bx, by, btnSize, btnSize, 12, '#f1c40f', '#b7950b', isHover);

                ctx.fillStyle = '#2c3e50';
                ctx.font = `bold ${btnSize * 0.6}px ${F}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                ctx.lineWidth = 2;
                ctx.lineJoin = 'round';
                ctx.strokeText(item.letter, bx + btnSize / 2, by + btnSize / 2);
                ctx.fillText(item.letter, bx + btnSize / 2, by + btnSize / 2);

                this.optionAreas[i] = { x: bx, y: by, w: btnSize, h: btnSize };
            });
        },
        checkAnswer(px, py) {
            if (!this.optionAreas) return null;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    return i === correctIdx ? 'correct' : 'wrong';
                }
            }
            return null;
        },
        handleHover(px, py) {
            this._hoverIndex = -1;
            if (!this.optionAreas) return;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    this._hoverIndex = i;
                }
            }
        },
    };
}

/**
 * SHAPES: "Find the shape!" — Show a target shape, pick from 3 options
 */
function generateShapeChallenge() {
    const selected = shuffle(SHAPES).slice(0, 3);
    const correctIdx = randInt(0, 2);
    const correctShape = selected[correctIdx];
    const shapeColor = randChoice(COLORS).color;

    return {
        type: 'shapes',
        questionText: `מצאו את ה${correctShape.name}`,
        render(ctx, area, time) {
            const { x, y, w, h } = area;

            // Listening prompt — question is read aloud
            ctx.fillStyle = '#7f8c8d';
            ctx.font = `bold ${h * 0.09}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔊', x + w / 2, y + h * 0.25);

            // Answer options: 3 shapes
            this.optionAreas = [];
            const btnSize = Math.min(w * 0.24, h * 0.28);
            const spacing = w * 0.28;
            const startX = x + w / 2 - spacing;
            const optY = y + h * 0.58;

            selected.forEach((shape, i) => {
                const cx = startX + i * spacing;
                const isHover = this._hoverIndex === i;

                // Premium card background
                const cardSize = btnSize * 1.2;
                drawCard(ctx, cx - cardSize / 2, optY - cardSize / 2, cardSize, cardSize, 14, isHover);

                drawShapeAt(ctx, shape.nameEn, cx, optY, btnSize * 0.35, shapeColor);

                this.optionAreas[i] = {
                    x: cx - btnSize * 0.6, y: optY - btnSize * 0.6,
                    w: btnSize * 1.2, h: btnSize * 1.2,
                    cx, cy: optY, r: btnSize * 0.6
                };
            });
        },
        checkAnswer(px, py) {
            if (!this.optionAreas) return null;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                const dx = px - a.cx;
                const dy = py - a.cy;
                if (dx * dx + dy * dy <= a.r * a.r) {
                    return i === correctIdx ? 'correct' : 'wrong';
                }
            }
            return null;
        },
        handleHover(px, py) {
            this._hoverIndex = -1;
            if (!this.optionAreas) return;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                const dx = px - a.cx;
                const dy = py - a.cy;
                if (dx * dx + dy * dy <= a.r * a.r) {
                    this._hoverIndex = i;
                }
            }
        },
    };
}

/**
 * PATTERNS: "What comes next?" — Show a pattern of colored shapes, pick the next one
 */
function generatePatternChallenge() {
    // Simple AB pattern with colors
    const patternColors = shuffle(COLORS).slice(0, 2);
    const patternLen = 4; // e.g. 🔴🔵🔴🔵?
    const pattern = [];
    for (let i = 0; i < patternLen; i++) {
        pattern.push(patternColors[i % 2]);
    }
    const correctNext = patternColors[patternLen % 2];

    // Options: correct + 1 wrong
    let options = [correctNext, patternColors[patternLen % 2 === 0 ? 1 : 0]];
    // Add a third random color
    const thirdColor = COLORS.find(c => c.nameEn !== patternColors[0].nameEn && c.nameEn !== patternColors[1].nameEn);
    if (thirdColor) options.push(thirdColor);
    options = shuffle(options);
    const correctIdx = options.findIndex(o => o.nameEn === correctNext.nameEn);

    return {
        type: 'patterns',
        questionText: 'מה הבא בתור?',
        render(ctx, area, time) {
            const { x, y, w, h } = area;

            // Show pattern
            const circleR = Math.min(w * 0.05, h * 0.07);
            const totalW = (patternLen + 1) * circleR * 3;
            const startX = x + w / 2 - totalW / 2 + circleR * 1.5;
            const patY = y + h * 0.3;

            pattern.forEach((col, i) => {
                draw3DCircle(ctx, startX + i * circleR * 3, patY, circleR, col.color, false);
            });

            // Question mark for next
            draw3DCircle(ctx, startX + patternLen * circleR * 3, patY, circleR, '#bdc3c7', false);
            ctx.fillStyle = '#333';
            ctx.font = `bold ${circleR * 1.2}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', startX + patternLen * circleR * 3, patY);

            // Instruction
            drawQuestion(ctx, '\u200Fמה הבא?', x + w / 2, y + h * 0.5, h * 0.06);

            // Answer options
            this.optionAreas = [];
            const optR = Math.min(w * 0.07, h * 0.09);
            const spacing = w * 0.28;
            const optStartX = x + w / 2 - spacing;
            const optY = y + h * 0.68;

            options.forEach((col, i) => {
                const cx = optStartX + i * spacing;
                const isHover = this._hoverIndex === i;
                const r = isHover ? optR * 1.15 : optR;

                draw3DCircle(ctx, cx, optY, r, col.color, isHover);

                this.optionAreas[i] = { cx, cy: optY, r, x: cx - r, y: optY - r, w: r * 2, h: r * 2 };
            });
        },
        checkAnswer(px, py) {
            if (!this.optionAreas) return null;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                const dx = px - a.cx;
                const dy = py - a.cy;
                if (dx * dx + dy * dy <= a.r * a.r) {
                    return i === correctIdx ? 'correct' : 'wrong';
                }
            }
            return null;
        },
        handleHover(px, py) {
            this._hoverIndex = -1;
            if (!this.optionAreas) return;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                const dx = px - a.cx;
                const dy = py - a.cy;
                if (dx * dx + dy * dy <= a.r * a.r) {
                    this._hoverIndex = i;
                }
            }
        },
    };
}

/**
 * ANIMALS (Habitat): "Where does the animal live?" — Show an animal, pick its habitat
 */
function generateAnimalChallengeHabitat() {
    const animal = randChoice(ANIMALS);
    const correctHabitat = HABITATS.find(h => h.id === animal.habitat);
    const options = shuffle(HABITATS);
    const correctIdx = options.findIndex(h => h.id === animal.habitat);

    return {
        type: 'animals',
        questionText: `איפה גר ה${animal.name}?`,
        render(ctx, area, time) {
            const { x, y, w, h } = area;

            // Show the animal large in the center-top area
            ctx.font = `${h * 0.22}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(animal.emoji, x + w / 2, y + h * 0.28);

            // Question text
            drawQuestion(ctx, `\u200Fאיפה גר ה${animal.name}?`, x + w / 2, y + h * 0.48, h * 0.07);

            // Habitat buttons (3 options)
            this.optionAreas = [];
            const btnW = w * 0.25;
            const btnH = h * 0.2;
            const spacing = w * 0.28;
            const startX = x + w / 2 - spacing;
            const btnY = y + h * 0.58;

            options.forEach((hab, i) => {
                const bx = startX + i * spacing - btnW / 2;
                const by = btnY;
                const isHover = this._hoverIndex === i;

                drawChallengeButton(ctx, bx, by, btnW, btnH, 14, hab.color, darkenColor(hab.color, 25), isHover);

                // Habitat emoji and name
                ctx.fillStyle = '#fff';
                ctx.font = `${btnH * 0.4}px ${F}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(hab.emoji, bx + btnW / 2, by + btnH * 0.35);
                ctx.font = `bold ${btnH * 0.25}px ${F}`;
                ctx.fillText(hab.name, bx + btnW / 2, by + btnH * 0.72);

                this.optionAreas[i] = { x: bx, y: by, w: btnW, h: btnH };
            });
        },
        checkAnswer(px, py) {
            if (!this.optionAreas) return null;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    return i === correctIdx ? 'correct' : 'wrong';
                }
            }
            return null;
        },
        handleHover(px, py) {
            this._hoverIndex = -1;
            if (!this.optionAreas) return;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    this._hoverIndex = i;
                }
            }
        },
    };
}

/**
 * ANIMALS (Food): "What does the animal eat?" — Show an animal, pick its food
 */
function generateAnimalChallengeFood() {
    const correct = randChoice(ANIMAL_FOODS);
    // Pick 2 wrong foods (different from correct)
    const others = shuffle(ANIMAL_FOODS.filter(a => a.animalName !== correct.animalName)).slice(0, 2);
    const allFoods = [
        { emoji: correct.food, name: correct.foodName },
        { emoji: others[0].food, name: others[0].foodName },
        { emoji: others[1].food, name: others[1].foodName },
    ];
    const options = shuffle(allFoods);
    const correctIdx = options.findIndex(o => o.emoji === correct.food && o.name === correct.foodName);

    return {
        type: 'animals',
        questionText: `מה אוכל ה${correct.animalName}?`,
        render(ctx, area, time) {
            const { x, y, w, h } = area;

            // Show the animal large
            ctx.font = `${h * 0.22}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(correct.animal, x + w / 2, y + h * 0.28);

            // Question
            drawQuestion(ctx, `\u200Fמה אוכל ה${correct.animalName}?`, x + w / 2, y + h * 0.48, h * 0.07);

            // Food buttons (3 options)
            this.optionAreas = [];
            const btnW = w * 0.25;
            const btnH = h * 0.2;
            const spacing = w * 0.28;
            const startX = x + w / 2 - spacing;
            const btnY = y + h * 0.58;

            options.forEach((food, i) => {
                const bx = startX + i * spacing - btnW / 2;
                const by = btnY;
                const isHover = this._hoverIndex === i;

                drawCard(ctx, bx, by, btnW, btnH, 14, isHover, isHover ? '#f5cba7' : '#fdebd0', isHover ? '#e67e22' : '#d4ac0d');

                // Food emoji and name
                ctx.fillStyle = '#2c3e50';
                ctx.font = `${btnH * 0.4}px ${F}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(food.emoji, bx + btnW / 2, by + btnH * 0.35);
                ctx.font = `bold ${btnH * 0.22}px ${F}`;
                ctx.fillText(food.name, bx + btnW / 2, by + btnH * 0.72);

                this.optionAreas[i] = { x: bx, y: by, w: btnW, h: btnH };
            });
        },
        checkAnswer(px, py) {
            if (!this.optionAreas) return null;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    return i === correctIdx ? 'correct' : 'wrong';
                }
            }
            return null;
        },
        handleHover(px, py) {
            this._hoverIndex = -1;
            if (!this.optionAreas) return;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    this._hoverIndex = i;
                }
            }
        },
    };
}

/**
 * ANIMALS: Randomly picks between habitat and baby-parent sub-types
 */
function generateAnimalChallenge() {
    return Math.random() < 0.5
        ? generateAnimalChallengeHabitat()
        : generateAnimalChallengeFood();
}

// ─── New Challenge Types ────────────────────────────────────────────────────

/**
 * SHAPE+COLOR: "Find the red heart" — Combines shape + color recognition
 */
function generateShapeColorChallenge() {
    const allShapes = shuffle(SHAPES).slice(0, 3);
    const allColors = shuffle(COLORS).slice(0, 3);
    const correctIdx = randInt(0, 2);
    const correctShape = allShapes[correctIdx];
    const correctColor = allColors[correctIdx];

    // Wrong A = right shape / wrong color; Wrong B = right color / wrong shape
    const wrongA = (correctIdx + 1) % 3;
    const wrongB = (correctIdx + 2) % 3;
    const options = [];
    options[correctIdx] = { shape: correctShape, color: correctColor };
    options[wrongA] = { shape: correctShape, color: allColors[wrongA] };
    options[wrongB] = { shape: allShapes[wrongB], color: correctColor };

    return {
        type: 'shapeColor',
        questionText: `מצאו את ה${correctShape.name} ה${correctColor.name}`,
        correctIndex: correctIdx,
        render(ctx, area, time) {
            const { x, y, w, h } = area;

            // Listening prompt
            ctx.fillStyle = '#7f8c8d';
            ctx.font = `bold ${h * 0.09}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔊', x + w / 2, y + h * 0.25);

            // 3 shape options
            this.optionAreas = [];
            const shapeSize = Math.min(w * 0.1, h * 0.13);
            const spacing = w * 0.28;
            const startX = x + w / 2 - spacing;
            const optY = y + h * 0.58;

            options.forEach((opt, i) => {
                const cx = startX + i * spacing;
                const isHover = this._hoverIndex === i;
                const cardSize = shapeSize * 3;
                const bx = cx - cardSize / 2;
                const by = optY - cardSize / 2;

                drawCard(ctx, bx, by, cardSize, cardSize, 14, isHover);
                drawShapeAt(ctx, opt.shape.nameEn, cx, optY, shapeSize, opt.color.color);

                this.optionAreas[i] = {
                    cx, cy: optY, r: shapeSize * 1.5,
                    x: bx, y: by, w: cardSize, h: cardSize,
                };
            });
        },
        checkAnswer(px, py) {
            if (!this.optionAreas) return null;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                const dx = px - a.cx;
                const dy = py - a.cy;
                if (dx * dx + dy * dy <= a.r * a.r) {
                    return i === correctIdx ? 'correct' : 'wrong';
                }
            }
            return null;
        },
        handleHover(px, py) {
            this._hoverIndex = -1;
            if (!this.optionAreas) return;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                const dx = px - a.cx;
                const dy = py - a.cy;
                if (dx * dx + dy * dy <= a.r * a.r) {
                    this._hoverIndex = i;
                }
            }
        },
    };
}

/**
 * MATH COMPARE: "Which number is biggest/smallest?"
 */
function generateMathCompareChallenge() {
    const isBiggest = Math.random() < 0.5;
    // Pick 3 numbers at least 2 apart
    const base = randInt(1, 3);
    const nums = [base, base + randInt(2, 3), base + randInt(5, 6)];
    const options = shuffle(nums);
    const target = isBiggest ? Math.max(...nums) : Math.min(...nums);
    const correctIdx = options.indexOf(target);
    const arrow = isBiggest ? '⬆️' : '⬇️';

    return {
        type: 'mathCompare',
        questionText: isBiggest ? 'מה המספר הכי גדול?' : 'מה המספר הכי קטן?',
        correctIndex: correctIdx,
        render(ctx, area, time) {
            const { x, y, w, h } = area;

            // Arrow hint + question
            ctx.font = `${h * 0.12}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(arrow, x + w / 2, y + h * 0.25);

            drawQuestion(ctx, isBiggest ? '\u200Fמה הכי גדול?' : '\u200Fמה הכי קטן?', x + w / 2, y + h * 0.42, h * 0.07);

            // Number buttons
            this.optionAreas = [];
            const btnW = w * 0.22;
            const btnH = h * 0.22;
            const btnY = y + h * 0.55;
            const spacing = w * 0.28;
            const startBtnX = x + w / 2 - spacing;

            options.forEach((num, i) => {
                const bx = startBtnX + i * spacing - btnW / 2;
                const by = btnY;
                const isHover = this._hoverIndex === i;

                drawChallengeButton(ctx, bx, by, btnW, btnH, 14, '#3498db', '#1a6fa0', isHover);

                ctx.fillStyle = '#fff';
                ctx.font = `bold ${btnH * 0.6}px ${F}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                ctx.lineWidth = 3;
                ctx.lineJoin = 'round';
                ctx.strokeText(num.toString(), bx + btnW / 2, by + btnH / 2);
                ctx.fillText(num.toString(), bx + btnW / 2, by + btnH / 2);

                this.optionAreas[i] = { x: bx, y: by, w: btnW, h: btnH };
            });
        },
        checkAnswer(px, py) {
            if (!this.optionAreas) return null;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    return i === correctIdx ? 'correct' : 'wrong';
                }
            }
            return null;
        },
        handleHover(px, py) {
            this._hoverIndex = -1;
            if (!this.optionAreas) return;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    this._hoverIndex = i;
                }
            }
        },
    };
}

/**
 * COUNT COMPARE: "Where are there most?" — 3 groups of fruit, pick the biggest
 */
function generateCountCompareChallenge() {
    // Generate 3 counts where one is clearly largest (diff >= 2), no ties for max
    const counts = [];
    const maxCount = randInt(5, 7);
    counts.push(maxCount);
    counts.push(randInt(1, maxCount - 2));
    counts.push(randInt(1, maxCount - 2));
    const fruits = shuffle(FRUITS).slice(0, 3);
    const options = shuffle(counts.map((c, i) => ({ count: c, fruit: fruits[i] })));
    const correctIdx = options.findIndex(o => o.count === maxCount);

    return {
        type: 'countCompare',
        questionText: 'איפה יש הכי הרבה?',
        correctIndex: correctIdx,
        render(ctx, area, time) {
            const { x, y, w, h } = area;

            // Question
            drawQuestion(ctx, '\u200Fאיפה יש הכי הרבה?', x + w / 2, y + h * 0.15, h * 0.08);

            // 3 columns of fruit
            this.optionAreas = [];
            const colW = w * 0.26;
            const colH = h * 0.65;
            const spacing = w * 0.3;
            const startX = x + w / 2 - spacing;
            const colY = y + h * 0.25;

            options.forEach((opt, i) => {
                const cx = startX + i * spacing;
                const bx = cx - colW / 2;
                const by = colY;
                const isHover = this._hoverIndex === i;

                // Column background
                drawCard(ctx, bx, by, colW, colH, 12, isHover);

                // Draw fruit emoji in a mini-grid
                const emojiSize = Math.min(colW / 3.5, colH / 5);
                const cols = Math.min(opt.count, 3);
                const rows = Math.ceil(opt.count / cols);
                const gridW = cols * emojiSize;
                const gridH = rows * emojiSize;
                const gx = bx + colW / 2 - gridW / 2 + emojiSize / 2;
                const gy = by + colH / 2 - gridH / 2 + emojiSize / 2;

                ctx.font = `${emojiSize * 0.8}px ${F}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                for (let j = 0; j < opt.count; j++) {
                    const col = j % cols;
                    const row = Math.floor(j / cols);
                    ctx.fillText(opt.fruit.emoji, gx + col * emojiSize, gy + row * emojiSize);
                }

                this.optionAreas[i] = { x: bx, y: by, w: colW, h: colH };
            });
        },
        checkAnswer(px, py) {
            if (!this.optionAreas) return null;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    return i === correctIdx ? 'correct' : 'wrong';
                }
            }
            return null;
        },
        handleHover(px, py) {
            this._hoverIndex = -1;
            if (!this.optionAreas) return;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    this._hoverIndex = i;
                }
            }
        },
    };
}

/**
 * ODD ONE OUT: "What doesn't belong?" — 3 items, one is different
 */
function generateOddOneOutChallenge() {
    const variant = randChoice(['color', 'shape', 'category']);
    let items; // [{draw(ctx,x,y,size), isOdd}]
    let correctIdx;

    if (variant === 'color') {
        const colors = shuffle(COLORS).slice(0, 2);
        const shape = randChoice(SHAPES);
        const positions = shuffle([0, 1, 2]);
        const oddPos = positions[0];
        items = [0, 1, 2].map(i => ({
            shape: shape.nameEn,
            color: i === oddPos ? colors[1].color : colors[0].color,
            isOdd: i === oddPos,
            isShape: true,
        }));
        correctIdx = oddPos;
    } else if (variant === 'shape') {
        const shapes = shuffle(SHAPES).slice(0, 2);
        const color = randChoice(COLORS);
        const positions = shuffle([0, 1, 2]);
        const oddPos = positions[0];
        items = [0, 1, 2].map(i => ({
            shape: i === oddPos ? shapes[1].nameEn : shapes[0].nameEn,
            color: color.color,
            isOdd: i === oddPos,
            isShape: true,
        }));
        correctIdx = oddPos;
    } else {
        // Category: 2 fruits + 1 animal (or vice versa)
        const useFruits = Math.random() < 0.5;
        const pair = useFruits ? shuffle(FRUITS).slice(0, 2) : shuffle(ANIMALS).slice(0, 2);
        const odd = useFruits ? randChoice(ANIMALS) : randChoice(FRUITS);
        const emojis = shuffle([
            { emoji: pair[0].emoji, isOdd: false },
            { emoji: pair[1].emoji, isOdd: false },
            { emoji: odd.emoji, isOdd: true },
        ]);
        items = emojis.map(e => ({ ...e, isShape: false }));
        correctIdx = items.findIndex(it => it.isOdd);
    }

    return {
        type: 'oddOneOut',
        questionText: 'מה לא שייך?',
        correctIndex: correctIdx,
        render(ctx, area, time) {
            const { x, y, w, h } = area;

            // Question
            drawQuestion(ctx, '\u200Fמה לא שייך?', x + w / 2, y + h * 0.22, h * 0.09);

            // 3 items
            this.optionAreas = [];
            const spacing = w * 0.28;
            const startX = x + w / 2 - spacing;
            const optY = y + h * 0.55;

            items.forEach((item, i) => {
                const cx = startX + i * spacing;
                const isHover = this._hoverIndex === i;

                if (item.isShape) {
                    const r = Math.min(w * 0.1, h * 0.13);
                    const cardSize = r * 3;
                    const bx = cx - cardSize / 2;
                    const by = optY - cardSize / 2;
                    drawCard(ctx, bx, by, cardSize, cardSize, 14, isHover);
                    drawShapeAt(ctx, item.shape, cx, optY, r, item.color);
                    this.optionAreas[i] = {
                        x: bx, y: by, w: cardSize, h: cardSize,
                    };
                } else {
                    const btnSize = Math.min(w * 0.22, h * 0.26);
                    const bx = cx - btnSize / 2;
                    const by = optY - btnSize / 2;

                    drawCard(ctx, bx, by, btnSize, btnSize, 14, isHover, isHover ? '#d5f5e3' : '#eafaf1', isHover ? '#27ae60' : '#a9dfbf');

                    ctx.font = `${btnSize * 0.55}px ${F}`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(item.emoji, cx, optY);

                    this.optionAreas[i] = { x: bx, y: by, w: btnSize, h: btnSize };
                }
            });
        },
        checkAnswer(px, py) {
            if (!this.optionAreas) return null;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (a.r) {
                    const dx = px - a.cx;
                    const dy = py - a.cy;
                    if (dx * dx + dy * dy <= a.r * a.r) {
                        return i === correctIdx ? 'correct' : 'wrong';
                    }
                } else {
                    if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                        return i === correctIdx ? 'correct' : 'wrong';
                    }
                }
            }
            return null;
        },
        handleHover(px, py) {
            this._hoverIndex = -1;
            if (!this.optionAreas) return;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (a.r) {
                    const dx = px - a.cx;
                    const dy = py - a.cy;
                    if (dx * dx + dy * dy <= a.r * a.r) this._hoverIndex = i;
                } else {
                    if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) this._hoverIndex = i;
                }
            }
        },
    };
}

/**
 * COUNT EXACT: "Which group has exactly N?" — Target number, 3 groups with different counts
 */
function generateCountExactChallenge() {
    const target = randInt(2, 6);
    // 3 counts: one is target, others differ by at least 1
    let counts = [target];
    while (counts.length < 3) {
        const c = randInt(1, 7);
        if (c !== target && !counts.includes(c)) counts.push(c);
    }
    const fruits = shuffle(FRUITS).slice(0, 3);
    const options = shuffle(counts.map((c, i) => ({ count: c, fruit: fruits[i] })));
    const correctIdx = options.findIndex(o => o.count === target);

    return {
        type: 'countExact',
        questionText: `איפה יש בדיוק ${target}?`,
        correctIndex: correctIdx,
        render(ctx, area, time) {
            const { x, y, w, h } = area;

            // Big target number
            ctx.fillStyle = '#e74c3c';
            ctx.font = `bold ${h * 0.18}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(target.toString(), x + w / 2, y + h * 0.18);

            drawQuestion(ctx, `\u200Fאיפה יש בדיוק ${target}?`, x + w / 2, y + h * 0.33, h * 0.06);

            // 3 groups of fruit
            this.optionAreas = [];
            const colW = w * 0.26;
            const colH = h * 0.48;
            const spacing = w * 0.3;
            const startX = x + w / 2 - spacing;
            const colY = y + h * 0.42;

            options.forEach((opt, i) => {
                const cx = startX + i * spacing;
                const bx = cx - colW / 2;
                const by = colY;
                const isHover = this._hoverIndex === i;

                drawCard(ctx, bx, by, colW, colH, 12, isHover);

                const emojiSize = Math.min(colW / 3.5, colH / 4);
                const cols = Math.min(opt.count, 3);
                const rows = Math.ceil(opt.count / cols);
                const gridW = cols * emojiSize;
                const gridH = rows * emojiSize;
                const gx = bx + colW / 2 - gridW / 2 + emojiSize / 2;
                const gy = by + colH / 2 - gridH / 2 + emojiSize / 2;

                ctx.font = `${emojiSize * 0.8}px ${F}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                for (let j = 0; j < opt.count; j++) {
                    const col = j % cols;
                    const row = Math.floor(j / cols);
                    ctx.fillText(opt.fruit.emoji, gx + col * emojiSize, gy + row * emojiSize);
                }

                this.optionAreas[i] = { x: bx, y: by, w: colW, h: colH };
            });
        },
        checkAnswer(px, py) {
            if (!this.optionAreas) return null;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    return i === correctIdx ? 'correct' : 'wrong';
                }
            }
            return null;
        },
        handleHover(px, py) {
            this._hoverIndex = -1;
            if (!this.optionAreas) return;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    this._hoverIndex = i;
                }
            }
        },
    };
}

/**
 * NEXT NUMBER: "What comes after N?"
 */
function generateNextNumberChallenge() {
    const n = randInt(1, 8);
    const correct = n + 1;
    let wrongs = [n - 1, n + 2].filter(v => v >= 1 && v <= 10 && v !== correct);
    // Ensure we have 2 wrongs
    while (wrongs.length < 2) {
        const w = randInt(1, 10);
        if (w !== correct && !wrongs.includes(w)) wrongs.push(w);
    }
    wrongs = wrongs.slice(0, 2);
    const options = shuffle([correct, ...wrongs]);
    const correctIdx = options.indexOf(correct);

    return {
        type: 'nextNumber',
        questionText: `איזה מספר בא אחרי ${n}?`,
        correctIndex: correctIdx,
        render(ctx, area, time) {
            const { x, y, w, h } = area;

            // Big number with arrow
            drawQuestion(ctx, `${n}  ←  ?`, x + w / 2, y + h * 0.25, h * 0.22);

            drawQuestion(ctx, `\u200Fאיזה מספר בא אחרי ${n}?`, x + w / 2, y + h * 0.43, h * 0.06);

            // Number buttons
            this.optionAreas = [];
            const btnW = w * 0.22;
            const btnH = h * 0.22;
            const btnY = y + h * 0.56;
            const spacing = w * 0.28;
            const startBtnX = x + w / 2 - spacing;

            options.forEach((num, i) => {
                const bx = startBtnX + i * spacing - btnW / 2;
                const by = btnY;
                const isHover = this._hoverIndex === i;

                drawChallengeButton(ctx, bx, by, btnW, btnH, 14, '#2ecc71', '#1a8a4a', isHover);

                ctx.fillStyle = '#fff';
                ctx.font = `bold ${btnH * 0.6}px ${F}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                ctx.lineWidth = 3;
                ctx.lineJoin = 'round';
                ctx.strokeText(num.toString(), bx + btnW / 2, by + btnH / 2);
                ctx.fillText(num.toString(), bx + btnW / 2, by + btnH / 2);

                this.optionAreas[i] = { x: bx, y: by, w: btnW, h: btnH };
            });
        },
        checkAnswer(px, py) {
            if (!this.optionAreas) return null;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    return i === correctIdx ? 'correct' : 'wrong';
                }
            }
            return null;
        },
        handleHover(px, py) {
            this._hoverIndex = -1;
            if (!this.optionAreas) return;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    this._hoverIndex = i;
                }
            }
        },
    };
}

/**
 * SIZE COMPARE: "Which is biggest/smallest?" — Same emoji at 3 different sizes
 */
function generateSizeCompareChallenge() {
    const isBiggest = Math.random() < 0.5;
    const emoji = randChoice(['🐶', '🐱', '🌟', '🍎', '🐸', '🦋', '🌺']);
    const sizes = shuffle([20, 40, 60]);
    const target = isBiggest ? 60 : 20;
    const correctIdx = sizes.indexOf(target);

    return {
        type: 'sizeCompare',
        questionText: isBiggest ? 'מה הכי גדול?' : 'מה הכי קטן?',
        correctIndex: correctIdx,
        render(ctx, area, time) {
            const { x, y, w, h } = area;

            // Question
            drawQuestion(ctx, isBiggest ? '\u200Fמה הכי גדול?' : '\u200Fמה הכי קטן?', x + w / 2, y + h * 0.18, h * 0.09);

            // 3 emoji at different sizes
            this.optionAreas = [];
            const spacing = w * 0.28;
            const startX = x + w / 2 - spacing;
            const optY = y + h * 0.55;
            const btnSize = Math.min(w * 0.22, h * 0.3);

            sizes.forEach((sz, i) => {
                const cx = startX + i * spacing;
                const bx = cx - btnSize / 2;
                const by = optY - btnSize / 2;
                const isHover = this._hoverIndex === i;

                drawCard(ctx, bx, by, btnSize, btnSize, 14, isHover);

                ctx.font = `${sz}px ${F}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(emoji, cx, optY);

                this.optionAreas[i] = { x: bx, y: by, w: btnSize, h: btnSize };
            });
        },
        checkAnswer(px, py) {
            if (!this.optionAreas) return null;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    return i === correctIdx ? 'correct' : 'wrong';
                }
            }
            return null;
        },
        handleHover(px, py) {
            this._hoverIndex = -1;
            if (!this.optionAreas) return;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    this._hoverIndex = i;
                }
            }
        },
    };
}

/**
 * PAIR MATCH: "What goes with X?" — Logical pairing
 */
function generatePairMatchChallenge() {
    const pair = randChoice(PAIRS);
    const options = shuffle([
        { emoji: pair.match, name: pair.matchName, isCorrect: true },
        { emoji: pair.wrong[0], name: '', isCorrect: false },
        { emoji: pair.wrong[1], name: '', isCorrect: false },
    ]);
    const correctIdx = options.findIndex(o => o.isCorrect);

    return {
        type: 'pairMatch',
        questionText: pair.question,
        correctIndex: correctIdx,
        render(ctx, area, time) {
            const { x, y, w, h } = area;

            // Target item large at top
            ctx.font = `${h * 0.18}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pair.item, x + w / 2, y + h * 0.25);

            // Question
            drawQuestion(ctx, `\u200F${pair.question}`, x + w / 2, y + h * 0.44, h * 0.07);

            // 3 emoji options
            this.optionAreas = [];
            const btnSize = Math.min(w * 0.22, h * 0.26);
            const spacing = w * 0.28;
            const startX = x + w / 2 - spacing;
            const btnY = y + h * 0.56;

            options.forEach((opt, i) => {
                const bx = startX + i * spacing - btnSize / 2;
                const by = btnY;
                const isHover = this._hoverIndex === i;

                drawCard(ctx, bx, by, btnSize, btnSize, 14, isHover, isHover ? '#d5f5e3' : '#eafaf1', isHover ? '#27ae60' : '#a9dfbf');

                ctx.font = `${btnSize * 0.55}px ${F}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(opt.emoji, bx + btnSize / 2, by + btnSize / 2);

                this.optionAreas[i] = { x: bx, y: by, w: btnSize, h: btnSize };
            });
        },
        checkAnswer(px, py) {
            if (!this.optionAreas) return null;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    return i === correctIdx ? 'correct' : 'wrong';
                }
            }
            return null;
        },
        handleHover(px, py) {
            this._hoverIndex = -1;
            if (!this.optionAreas) return;
            for (let i = 0; i < this.optionAreas.length; i++) {
                const a = this.optionAreas[i];
                if (px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h) {
                    this._hoverIndex = i;
                }
            }
        },
    };
}

// ─── Color Utilities ────────────────────────────────────────────────────────

function _expandHex(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return parseInt(h, 16);
}

function lightenColor(hex, pct) {
    const n = _expandHex(hex);
    const r = Math.min(255, (n >> 16) + Math.round(255 * pct / 100));
    const g = Math.min(255, ((n >> 8) & 0xFF) + Math.round(255 * pct / 100));
    const b = Math.min(255, (n & 0xFF) + Math.round(255 * pct / 100));
    return `rgb(${r},${g},${b})`;
}

function darkenColor(hex, pct) {
    const n = _expandHex(hex);
    const r = Math.max(0, (n >> 16) - Math.round(255 * pct / 100));
    const g = Math.max(0, ((n >> 8) & 0xFF) - Math.round(255 * pct / 100));
    const b = Math.max(0, (n & 0xFF) - Math.round(255 * pct / 100));
    return `rgb(${r},${g},${b})`;
}

// ─── Premium Rendering Helpers ──────────────────────────────────────────────

/** Styled question text with dark outline for AAA legibility */
function drawQuestion(ctx, text, x, y, size) {
    ctx.font = `bold ${size}px ${F}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = Math.max(3, size * 0.12);
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = '#1a2a3a';
    ctx.fillText(text, x, y);
}

/** Premium 3D button with shelf, gradient, and gloss */
function drawChallengeButton(ctx, x, y, w, h, r, color, borderColor, isHover) {
    const shelf = Math.min(4, h * 0.08);
    ctx.save();
    ctx.shadowColor = isHover ? (color + '55') : 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = isHover ? 12 : 6;
    ctx.shadowOffsetY = 3;

    // Shelf
    ctx.fillStyle = darkenColor(color, 30);
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Face
    const faceH = h - shelf;
    const topPct = isHover ? 32 : 22;
    const midPct = isHover ? 10 : 0;
    const botPct = isHover ? 0 : 8;
    const grad = ctx.createLinearGradient?.(x, y, x, y + faceH);
    if (grad) {
        grad.addColorStop(0, lightenColor(color, topPct));
        grad.addColorStop(0.5, midPct > 0 ? lightenColor(color, midPct) : color);
        grad.addColorStop(1, botPct > 0 ? darkenColor(color, botPct) : color);
        ctx.fillStyle = grad;
    } else {
        ctx.fillStyle = color;
    }
    roundRect(ctx, x, y, w, faceH, r);
    ctx.fill();

    // Gloss
    ctx.save();
    roundRect(ctx, x, y, w, faceH, r);
    ctx.clip();
    const glossH = faceH * 0.4;
    const gloss = ctx.createLinearGradient?.(x, y, x, y + glossH);
    if (gloss) {
        gloss.addColorStop(0, 'rgba(255,255,255,0.35)');
        gloss.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gloss;
        ctx.fillRect(x, y, w, glossH);
    }
    ctx.restore();

    // Border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2.5;
    roundRect(ctx, x, y, w, h, r);
    ctx.stroke();

    // Inner top highlight
    ctx.beginPath();
    ctx.moveTo(x + r + 2, y + 2);
    ctx.lineTo(x + w - r - 2, y + 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
}

/** Premium option card with shadow, gradient bg, and hover glow */
function drawCard(ctx, x, y, w, h, r, isHover, fillColor, borderColor) {
    const shelf = Math.min(4, Math.round(h * 0.06));
    ctx.save();
    // Deep drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    // 3D shelf (darker bottom edge) — same technique as buttons
    const shelfColor = borderColor ? darkenColor(borderColor, 20) : (isHover ? '#1a6fa0' : '#8090a0');
    ctx.fillStyle = shelfColor;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Main face with gradient
    const faceH = h - shelf;
    const baseTop = fillColor || (isHover ? '#e8f4fd' : '#f5f6f8');
    const baseBot = fillColor ? darkenColor(fillColor.startsWith('#') ? fillColor : '#eee', 8) : (isHover ? '#d0e8f5' : '#dce0e6');
    const grad = ctx.createLinearGradient?.(x, y, x, y + faceH);
    if (grad) {
        grad.addColorStop(0, baseTop);
        grad.addColorStop(0.5, fillColor || (isHover ? '#e0eef8' : '#eef0f3'));
        grad.addColorStop(1, baseBot);
        ctx.fillStyle = grad;
    } else {
        ctx.fillStyle = baseTop;
    }
    roundRect(ctx, x, y, w, faceH, r);
    ctx.fill();

    // Glossy top shine
    ctx.save();
    roundRect(ctx, x, y, w, faceH, r);
    ctx.clip();
    const glossH = faceH * 0.38;
    const gloss = ctx.createLinearGradient?.(x, y, x, y + glossH);
    if (gloss) {
        gloss.addColorStop(0, 'rgba(255,255,255,0.5)');
        gloss.addColorStop(0.6, 'rgba(255,255,255,0.12)');
        gloss.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gloss;
        ctx.fillRect(x, y, w, glossH);
    }
    ctx.restore();

    // Outer border
    ctx.strokeStyle = borderColor || (isHover ? '#3498db' : '#8a95a3');
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, r);
    ctx.stroke();

    // Inner highlight line
    if (h > 30) {
        ctx.beginPath();
        ctx.moveTo(x + r + 2, y + 1.5);
        ctx.lineTo(x + w - r - 2, y + 1.5);
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    ctx.restore();
}

// ─── 3D circle (for color/pattern options) ──────────────────────────────────

function draw3DCircle(ctx, cx, cy, r, color, isHover) {
    ctx.save();
    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    // Dark base ring (3D shelf)
    ctx.beginPath();
    ctx.arc(cx, cy + 3, r, 0, Math.PI * 2);
    ctx.fillStyle = darkenColor(color, 30);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Main face with radial gradient
    const grad = ctx.createRadialGradient?.(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (grad) {
        grad.addColorStop(0, lightenColor(color, 25));
        grad.addColorStop(0.7, color);
        grad.addColorStop(1, darkenColor(color, 15));
        ctx.fillStyle = grad;
    } else {
        ctx.fillStyle = color;
    }
    ctx.fill();

    // Glossy highlight arc
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.15, r * 0.75, Math.PI * 1.15, Math.PI * 1.85);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = r * 0.2;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Border
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = isHover ? '#fff' : darkenColor(color, 25);
    ctx.lineWidth = isHover ? 3.5 : 2;
    ctx.stroke();

    ctx.restore();
}

// ─── Rounded rect helper ────────────────────────────────────────────────────

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

// ─── Public API ──────────────────────────────────────────────────────────────

export const GENERATORS = {
    counting: generateCountingChallenge,
    colors: generateColorChallenge,
    letters: generateLetterChallenge,
    shapes: generateShapeChallenge,
    patterns: generatePatternChallenge,
    animals: generateAnimalChallenge,
    shapeColor: generateShapeColorChallenge,
    mathCompare: generateMathCompareChallenge,
    countCompare: generateCountCompareChallenge,
    oddOneOut: generateOddOneOutChallenge,
    countExact: generateCountExactChallenge,
    nextNumber: generateNextNumberChallenge,
    sizeCompare: generateSizeCompareChallenge,
    pairMatch: generatePairMatchChallenge,
};

/**
 * Generate a random challenge from the allowed types
 * @param {string[]} allowedTypes — e.g. ['counting', 'colors']
 * @returns {object} challenge object
 */
export function generateChallenge(allowedTypes) {
    const type = randChoice(allowedTypes);
    const gen = GENERATORS[type];
    if (!gen) return generateCountingChallenge(); // fallback
    return gen();
}
