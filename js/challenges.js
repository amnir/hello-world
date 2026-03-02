// =============================================================================
// challenges.js — Educational mini-games that pop up during gameplay
// All challenges are VISUAL — no reading required for the child.
// The game pauses while a challenge is active.
// =============================================================================

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
    { emoji: '🐶', name: 'כלב', habitat: 'land', baby: '🐕' },
    { emoji: '🐱', name: 'חתול', habitat: 'land', baby: '🐈' },
    { emoji: '🐟', name: 'דג', habitat: 'water', baby: '🐠' },
    { emoji: '🐦', name: 'ציפור', habitat: 'sky', baby: '🐤' },
    { emoji: '🐴', name: 'סוס', habitat: 'land', baby: '🐎' },
    { emoji: '🐘', name: 'פיל', habitat: 'land', baby: '🐘' },
    { emoji: '🐬', name: 'דולפין', habitat: 'water', baby: '🐬' },
    { emoji: '🦅', name: 'נשר', habitat: 'sky', baby: '🦅' },
    { emoji: '🐢', name: 'צב', habitat: 'water', baby: '🐢' },
    { emoji: '🦋', name: 'פרפר', habitat: 'sky', baby: '🦋' },
    { emoji: '🐄', name: 'פרה', habitat: 'land', baby: '🐮' },
    { emoji: '🐸', name: 'צפרדע', habitat: 'water', baby: '🐸' },
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
            ctx.font = `${Math.min(w / (correctCount + 1), 50)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Arrange fruits in a row/grid
            const fruitSize = Math.min(w / (correctCount + 2), 45);
            const totalWidth = correctCount * fruitSize;
            const startX = x + w / 2 - totalWidth / 2 + fruitSize / 2;

            for (let i = 0; i < correctCount; i++) {
                const fx = startX + i * fruitSize;
                const fy = y + h * 0.3;
                ctx.font = `${fruitSize * 0.8}px Arial`;
                ctx.fillText(fruit, fx, fy);
            }

            // Question mark
            ctx.fillStyle = '#2c3e50';
            ctx.font = `bold ${h * 0.08}px Arial`;
            ctx.fillText('\u200Fכמה?', x + w / 2, y + h * 0.52);

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

                // Button background
                const isHover = this._hoverIndex === i;
                ctx.fillStyle = isHover ? '#5dade2' : '#3498db';
                roundRect(ctx, bx, by, btnW, btnH, 12);
                ctx.fill();
                ctx.strokeStyle = '#2471a3';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Number
                ctx.fillStyle = '#fff';
                ctx.font = `bold ${btnH * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
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
            ctx.font = `bold ${h * 0.09}px Arial`;
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

                ctx.fillStyle = col.color;
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = isHover ? '#fff' : '#333';
                ctx.lineWidth = isHover ? 4 : 2;
                ctx.stroke();

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
            ctx.font = `bold ${h * 0.09}px Arial`;
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

                ctx.fillStyle = isHover ? '#f5b041' : '#f1c40f';
                roundRect(ctx, bx, by, btnSize, btnSize, 10);
                ctx.fill();
                ctx.strokeStyle = '#d4ac0d';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = '#2c3e50';
                ctx.font = `bold ${btnSize * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
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
            ctx.font = `bold ${h * 0.09}px Arial`;
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

                // Background circle for clickable area
                ctx.fillStyle = isHover ? 'rgba(236, 240, 241, 0.9)' : 'rgba(236, 240, 241, 0.5)';
                ctx.beginPath();
                ctx.arc(cx, optY, btnSize * 0.6, 0, Math.PI * 2);
                ctx.fill();
                if (isHover) {
                    ctx.strokeStyle = '#3498db';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }

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
                ctx.fillStyle = col.color;
                ctx.beginPath();
                ctx.arc(startX + i * circleR * 3, patY, circleR, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.stroke();
            });

            // Question mark for next
            ctx.fillStyle = '#bdc3c7';
            ctx.beginPath();
            ctx.arc(startX + patternLen * circleR * 3, patY, circleR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#333';
            ctx.font = `bold ${circleR * 1.2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', startX + patternLen * circleR * 3, patY);

            // Instruction
            ctx.fillStyle = '#2c3e50';
            ctx.font = `bold ${h * 0.06}px Arial`;
            ctx.fillText('\u200Fמה הבא?', x + w / 2, y + h * 0.5);

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

                ctx.fillStyle = col.color;
                ctx.beginPath();
                ctx.arc(cx, optY, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = isHover ? '#fff' : '#333';
                ctx.lineWidth = isHover ? 4 : 2;
                ctx.stroke();

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
            ctx.font = `${h * 0.22}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(animal.emoji, x + w / 2, y + h * 0.28);

            // Question text
            ctx.fillStyle = '#2c3e50';
            ctx.font = `bold ${h * 0.07}px Arial`;
            ctx.fillText(`\u200Fאיפה גר ה${animal.name}?`, x + w / 2, y + h * 0.48);

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

                ctx.fillStyle = isHover ? hab.color : hab.color + '99';
                roundRect(ctx, bx, by, btnW, btnH, 12);
                ctx.fill();
                ctx.strokeStyle = isHover ? '#fff' : '#333';
                ctx.lineWidth = isHover ? 3 : 2;
                ctx.stroke();

                // Habitat emoji and name
                ctx.fillStyle = '#fff';
                ctx.font = `${btnH * 0.4}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(hab.emoji, bx + btnW / 2, by + btnH * 0.35);
                ctx.font = `bold ${btnH * 0.25}px Arial`;
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
 * ANIMALS (Baby-Parent): "Who is the baby's mom?" — Show a baby animal, pick its parent
 */
function generateAnimalChallengeBabyParent() {
    const correctAnimal = randChoice(ANIMALS);
    // Pick 2 wrong animals (different from correct)
    const others = shuffle(ANIMALS.filter(a => a.name !== correctAnimal.name)).slice(0, 2);
    let options = shuffle([correctAnimal, ...others]);
    const correctIdx = options.findIndex(a => a.name === correctAnimal.name);

    return {
        type: 'animals',
        questionText: `מי האמא של ה${correctAnimal.name}?`,
        render(ctx, area, time) {
            const { x, y, w, h } = area;

            // Show the baby large
            ctx.font = `${h * 0.18}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(correctAnimal.baby, x + w / 2, y + h * 0.25);

            // Question
            ctx.fillStyle = '#2c3e50';
            ctx.font = `bold ${h * 0.07}px Arial`;
            ctx.fillText(`\u200Fמי האמא?`, x + w / 2, y + h * 0.44);

            // Options (3 adult animals)
            this.optionAreas = [];
            const btnSize = Math.min(w * 0.22, h * 0.26);
            const spacing = w * 0.28;
            const startX = x + w / 2 - spacing;
            const btnY = y + h * 0.55;

            options.forEach((animal, i) => {
                const bx = startX + i * spacing - btnSize / 2;
                const by = btnY;
                const isHover = this._hoverIndex === i;

                ctx.fillStyle = isHover ? '#f5cba7' : '#fdebd0';
                roundRect(ctx, bx, by, btnSize, btnSize, 12);
                ctx.fill();
                ctx.strokeStyle = isHover ? '#e67e22' : '#d4ac0d';
                ctx.lineWidth = isHover ? 3 : 2;
                ctx.stroke();

                ctx.font = `${btnSize * 0.5}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(animal.emoji, bx + btnSize / 2, by + btnSize * 0.45);

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
 * ANIMALS: Randomly picks between habitat and baby-parent sub-types
 */
function generateAnimalChallenge() {
    return Math.random() < 0.5
        ? generateAnimalChallengeHabitat()
        : generateAnimalChallengeBabyParent();
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
