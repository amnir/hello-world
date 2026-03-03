// =============================================================================
// challenges.js — Educational mini-games that pop up during gameplay
// All challenges are VISUAL — no reading required for the child.
// The game pauses while a challenge is active.
// =============================================================================

const F = '"Segoe UI", "Trebuchet MS", system-ui, sans-serif';

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
    ctx.save();

    // Drop shadow
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = size * 0.25;
    ctx.shadowOffsetX = size * 0.06;
    ctx.shadowOffsetY = size * 0.1;

    // Darken helper: blend color toward black for gradient edge
    const darken = (hex, amt) => {
        const n = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, (n >> 16) - amt);
        const g = Math.max(0, ((n >> 8) & 0xff) - amt);
        const b = Math.max(0, (n & 0xff) - amt);
        return `rgb(${r},${g},${b})`;
    };

    switch (shape) {
        case 'circle': {
            const grad = ctx.createRadialGradient(
                x - size * 0.3, y - size * 0.3, size * 0.1,
                x, y, size
            );
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.25, color);
            grad.addColorStop(1, darken(color, 60));
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();

            // Glossy highlight
            ctx.shadowColor = 'transparent';
            ctx.beginPath();
            ctx.ellipse(x - size * 0.2, y - size * 0.35, size * 0.35, size * 0.18, -0.3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.fill();
            break;
        }
        case 'square': {
            const r = size * 0.25; // corner radius
            const grad = ctx.createLinearGradient(x - size, y - size, x + size, y + size);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.2, color);
            grad.addColorStop(1, darken(color, 60));
            ctx.fillStyle = grad;

            // Rounded rect path
            ctx.beginPath();
            ctx.moveTo(x - size + r, y - size);
            ctx.lineTo(x + size - r, y - size);
            ctx.quadraticCurveTo(x + size, y - size, x + size, y - size + r);
            ctx.lineTo(x + size, y + size - r);
            ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
            ctx.lineTo(x - size + r, y + size);
            ctx.quadraticCurveTo(x - size, y + size, x - size, y + size - r);
            ctx.lineTo(x - size, y - size + r);
            ctx.quadraticCurveTo(x - size, y - size, x - size + r, y - size);
            ctx.closePath();
            ctx.fill();

            // Glossy highlight
            ctx.shadowColor = 'transparent';
            ctx.beginPath();
            ctx.ellipse(x - size * 0.15, y - size * 0.4, size * 0.55, size * 0.2, -0.15, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.fill();
            break;
        }
        case 'triangle': {
            const grad = ctx.createLinearGradient(x, y - size, x, y + size * 0.7);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.25, color);
            grad.addColorStop(1, darken(color, 60));
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(x, y - size);
            ctx.lineTo(x + size, y + size * 0.7);
            ctx.lineTo(x - size, y + size * 0.7);
            ctx.closePath();
            ctx.fill();

            // Glossy highlight near top
            ctx.shadowColor = 'transparent';
            ctx.beginPath();
            ctx.ellipse(x, y - size * 0.35, size * 0.3, size * 0.15, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fill();
            break;
        }
        case 'star': {
            const grad = ctx.createRadialGradient(
                x - size * 0.2, y - size * 0.2, size * 0.1,
                x, y, size
            );
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.3, color);
            grad.addColorStop(1, darken(color, 55));
            ctx.fillStyle = grad;
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

            // Central glow
            ctx.shadowColor = 'transparent';
            ctx.beginPath();
            ctx.arc(x - size * 0.1, y - size * 0.15, size * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fill();
            break;
        }
        case 'heart': {
            const tip = y + size * 0.9;
            const dip = y - size * 0.2;
            const grad = ctx.createRadialGradient(
                x - size * 0.3, y - size * 0.4, size * 0.1,
                x, y, size * 1.3
            );
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.25, color);
            grad.addColorStop(1, darken(color, 60));
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(x, tip);
            ctx.bezierCurveTo(
                x - size * 1.5, y + size * 0.1,
                x - size * 0.85, y - size * 1.2,
                x, dip
            );
            ctx.bezierCurveTo(
                x + size * 0.85, y - size * 1.2,
                x + size * 1.5, y + size * 0.1,
                x, tip
            );
            ctx.closePath();
            ctx.fill();

            // Glossy highlight on left bump
            ctx.shadowColor = 'transparent';
            ctx.beginPath();
            ctx.ellipse(x - size * 0.4, y - size * 0.55, size * 0.25, size * 0.13, -0.4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fill();
            break;
        }
    }

    ctx.restore();
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

            // Question mark
            ctx.fillStyle = '#2c3e50';
            ctx.font = `bold ${h * 0.08}px ${F}`;
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
                ctx.font = `bold ${btnH * 0.6}px ${F}`;
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

                ctx.fillStyle = isHover ? '#f5b041' : '#f1c40f';
                roundRect(ctx, bx, by, btnSize, btnSize, 10);
                ctx.fill();
                ctx.strokeStyle = '#d4ac0d';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = '#2c3e50';
                ctx.font = `bold ${btnSize * 0.6}px ${F}`;
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
            ctx.font = `bold ${circleR * 1.2}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', startX + patternLen * circleR * 3, patY);

            // Instruction
            ctx.fillStyle = '#2c3e50';
            ctx.font = `bold ${h * 0.06}px ${F}`;
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
            ctx.font = `${h * 0.22}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(animal.emoji, x + w / 2, y + h * 0.28);

            // Question text
            ctx.fillStyle = '#2c3e50';
            ctx.font = `bold ${h * 0.07}px ${F}`;
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
            ctx.fillStyle = '#2c3e50';
            ctx.font = `bold ${h * 0.07}px ${F}`;
            ctx.fillText(`\u200Fמה אוכל ה${correct.animalName}?`, x + w / 2, y + h * 0.48);

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

                ctx.fillStyle = isHover ? '#f5cba7' : '#fdebd0';
                roundRect(ctx, bx, by, btnW, btnH, 12);
                ctx.fill();
                ctx.strokeStyle = isHover ? '#e67e22' : '#d4ac0d';
                ctx.lineWidth = isHover ? 3 : 2;
                ctx.stroke();

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

                // Background circle
                ctx.fillStyle = isHover ? 'rgba(236, 240, 241, 0.9)' : 'rgba(236, 240, 241, 0.5)';
                ctx.beginPath();
                ctx.arc(cx, optY, shapeSize * 1.5, 0, Math.PI * 2);
                ctx.fill();
                if (isHover) {
                    ctx.strokeStyle = '#3498db';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }

                drawShapeAt(ctx, opt.shape.nameEn, cx, optY, shapeSize, opt.color.color);

                this.optionAreas[i] = {
                    cx, cy: optY, r: shapeSize * 1.5,
                    x: cx - shapeSize * 1.5, y: optY - shapeSize * 1.5,
                    w: shapeSize * 3, h: shapeSize * 3,
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

            ctx.fillStyle = '#2c3e50';
            ctx.font = `bold ${h * 0.07}px ${F}`;
            ctx.fillText(isBiggest ? '\u200Fמה הכי גדול?' : '\u200Fמה הכי קטן?', x + w / 2, y + h * 0.42);

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

                ctx.fillStyle = isHover ? '#5dade2' : '#3498db';
                roundRect(ctx, bx, by, btnW, btnH, 12);
                ctx.fill();
                ctx.strokeStyle = '#2471a3';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = '#fff';
                ctx.font = `bold ${btnH * 0.6}px ${F}`;
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
            ctx.fillStyle = '#2c3e50';
            ctx.font = `bold ${h * 0.08}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('\u200Fאיפה יש הכי הרבה?', x + w / 2, y + h * 0.15);

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
                ctx.fillStyle = isHover ? 'rgba(52, 152, 219, 0.15)' : 'rgba(236, 240, 241, 0.5)';
                roundRect(ctx, bx, by, colW, colH, 10);
                ctx.fill();
                if (isHover) {
                    ctx.strokeStyle = '#3498db';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }

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
            ctx.fillStyle = '#2c3e50';
            ctx.font = `bold ${h * 0.09}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('\u200Fמה לא שייך?', x + w / 2, y + h * 0.22);

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
                    // Background
                    ctx.fillStyle = isHover ? 'rgba(236, 240, 241, 0.9)' : 'rgba(236, 240, 241, 0.5)';
                    ctx.beginPath();
                    ctx.arc(cx, optY, r * 1.5, 0, Math.PI * 2);
                    ctx.fill();
                    if (isHover) {
                        ctx.strokeStyle = '#3498db';
                        ctx.lineWidth = 3;
                        ctx.stroke();
                    }
                    drawShapeAt(ctx, item.shape, cx, optY, r, item.color);
                    this.optionAreas[i] = {
                        cx, cy: optY, r: r * 1.5,
                        x: cx - r * 1.5, y: optY - r * 1.5, w: r * 3, h: r * 3,
                    };
                } else {
                    const btnSize = Math.min(w * 0.22, h * 0.26);
                    const bx = cx - btnSize / 2;
                    const by = optY - btnSize / 2;

                    ctx.fillStyle = isHover ? '#d5f5e3' : '#eafaf1';
                    roundRect(ctx, bx, by, btnSize, btnSize, 12);
                    ctx.fill();
                    if (isHover) {
                        ctx.strokeStyle = '#27ae60';
                        ctx.lineWidth = 3;
                        ctx.stroke();
                    }

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

            ctx.fillStyle = '#2c3e50';
            ctx.font = `bold ${h * 0.06}px ${F}`;
            ctx.fillText(`\u200Fאיפה יש בדיוק ${target}?`, x + w / 2, y + h * 0.33);

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

                ctx.fillStyle = isHover ? 'rgba(52, 152, 219, 0.15)' : 'rgba(236, 240, 241, 0.5)';
                roundRect(ctx, bx, by, colW, colH, 10);
                ctx.fill();
                if (isHover) {
                    ctx.strokeStyle = '#3498db';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }

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
            ctx.fillStyle = '#2c3e50';
            ctx.font = `bold ${h * 0.22}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${n}  ←  ?`, x + w / 2, y + h * 0.25);

            ctx.fillStyle = '#2c3e50';
            ctx.font = `bold ${h * 0.06}px ${F}`;
            ctx.fillText(`\u200Fאיזה מספר בא אחרי ${n}?`, x + w / 2, y + h * 0.43);

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

                ctx.fillStyle = isHover ? '#58d68d' : '#2ecc71';
                roundRect(ctx, bx, by, btnW, btnH, 12);
                ctx.fill();
                ctx.strokeStyle = '#27ae60';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = '#fff';
                ctx.font = `bold ${btnH * 0.6}px ${F}`;
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
            ctx.fillStyle = '#2c3e50';
            ctx.font = `bold ${h * 0.09}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(isBiggest ? '\u200Fמה הכי גדול?' : '\u200Fמה הכי קטן?', x + w / 2, y + h * 0.18);

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

                // Background
                ctx.fillStyle = isHover ? 'rgba(236, 240, 241, 0.9)' : 'rgba(236, 240, 241, 0.4)';
                roundRect(ctx, bx, by, btnSize, btnSize, 12);
                ctx.fill();
                if (isHover) {
                    ctx.strokeStyle = '#3498db';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }

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
            ctx.fillStyle = '#2c3e50';
            ctx.font = `bold ${h * 0.07}px ${F}`;
            ctx.fillText(`\u200F${pair.question}`, x + w / 2, y + h * 0.44);

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

                ctx.fillStyle = isHover ? '#d5f5e3' : '#eafaf1';
                roundRect(ctx, bx, by, btnSize, btnSize, 12);
                ctx.fill();
                ctx.strokeStyle = isHover ? '#27ae60' : '#a9dfbf';
                ctx.lineWidth = isHover ? 3 : 2;
                ctx.stroke();

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
