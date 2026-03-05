// =============================================================================
// sprites.js — All characters drawn programmatically on canvas
// Every draw function takes (ctx, x, y, size, time) where:
//   x, y = center of the character
//   size = base size (roughly the "radius")
//   time = elapsed time in seconds (for animations)
// =============================================================================

import { getDefenderImage, getEnemyImage } from './assets.js';

function withImageSource(getImageFn, typeName, proceduralFn, transformFn) {
    return (ctx, x, y, size, time) => {
        const img = getImageFn(typeName);
        if (!img) return proceduralFn(ctx, x, y, size, time);
        ctx.save();
        try {
            ctx.translate(x, y);
            if (transformFn) transformFn(ctx, time);
            const s = size * 2.8;
            ctx.drawImage(img, -s / 2, -s / 2, s, s);
        } finally {
            ctx.restore();
        }
    };
}

const withImage = (typeName, proceduralFn, transformFn) =>
    withImageSource(getDefenderImage, typeName, proceduralFn, transformFn);
const withEnemyImage = (typeName, proceduralFn, transformFn) =>
    withImageSource(getEnemyImage, typeName, proceduralFn, transformFn);

// ─── Helper Functions ────────────────────────────────────────────────────────

function drawEye(ctx, x, y, r, pupilOffX = 0, pupilOffY = 0) {
    // White
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Pupil
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(x + pupilOffX, y + pupilOffY, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    // Shine
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + pupilOffX - r * 0.15, y + pupilOffY - r * 0.15, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
}

function drawSmile(ctx, x, y, w, h = 0) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y - h, w, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
}

function drawOpenSmile(ctx, x, y, w) {
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(x, y, w, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, w, 0, Math.PI);
    ctx.stroke();
}

function drawRoundedRect(ctx, x, y, w, h, r) {
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

function drawCheeks(ctx, x, y, r) {
    ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawStar(ctx, cx, cy, r, points = 5, innerRatio = 0.5) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? r : r * innerRatio;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
}

function drawHeart(ctx, cx, cy, size) {
    ctx.beginPath();
    const topY = cy - size * 0.4;
    ctx.moveTo(cx, cy + size * 0.6);
    ctx.bezierCurveTo(cx - size, cy, cx - size, topY, cx, topY + size * 0.2);
    ctx.bezierCurveTo(cx + size, topY, cx + size, cy, cx, cy + size * 0.6);
    ctx.closePath();
}

// ─── DEFENDER SPRITES ────────────────────────────────────────────────────────

/**
 * Number Buddy (חבר המספרים) — Cute calculator character
 * Blue body, screen showing numbers, big eyes
 */
export function drawNumberBuddy(ctx, x, y, size, time = 0) {
    const s = size;
    const bob = Math.sin(time * 2) * 2;

    ctx.save();
    ctx.translate(x, y + bob);

    // Legs
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(-s * 0.3, s * 0.55, s * 0.2, s * 0.3);
    ctx.fillRect(s * 0.1, s * 0.55, s * 0.2, s * 0.3);

    // Body (rounded rectangle)
    ctx.fillStyle = '#3498db';
    drawRoundedRect(ctx, -s * 0.5, -s * 0.6, s, s * 1.2, s * 0.15);
    ctx.fill();
    ctx.strokeStyle = '#2471a3';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Screen
    ctx.fillStyle = '#d4efdf';
    drawRoundedRect(ctx, -s * 0.35, -s * 0.45, s * 0.7, s * 0.3, s * 0.05);
    ctx.fill();
    ctx.strokeStyle = '#1e8449';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Number on screen
    const num = Math.floor((time * 0.5) % 10) + 1;
    ctx.fillStyle = '#1e8449';
    ctx.font = `bold ${s * 0.25}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(num.toString(), 0, -s * 0.3);

    // Button dots on body
    ctx.fillStyle = '#2471a3';
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
            ctx.beginPath();
            ctx.arc(-s * 0.2 + col * s * 0.2, s * 0.1 + row * s * 0.2, s * 0.06, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Eyes
    drawEye(ctx, -s * 0.18, -s * 0.65, s * 0.12, -2, 0);
    drawEye(ctx, s * 0.18, -s * 0.65, s * 0.12, -2, 0);

    // Smile
    drawSmile(ctx, 0, -s * 0.48, s * 0.15);

    // Arms
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = s * 0.08;
    ctx.lineCap = 'round';
    const armWave = Math.sin(time * 3) * 0.2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, -s * 0.1);
    ctx.lineTo(-s * 0.75, -s * 0.2 + armWave * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.5, -s * 0.1);
    ctx.lineTo(s * 0.75, -s * 0.2 - armWave * s);
    ctx.stroke();

    ctx.restore();
}

/**
 * Letter Lion (אריה האותיות) — Friendly lion with letter on chest
 */
export function drawLetterLion(ctx, x, y, size, time = 0) {
    const s = size;
    const bob = Math.sin(time * 1.8) * 2;

    ctx.save();
    ctx.translate(x, y + bob);

    // Mane (orange spikes around head)
    ctx.fillStyle = '#e67e22';
    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(
            Math.cos(angle) * s * 0.45,
            -s * 0.35 + Math.sin(angle) * s * 0.45,
            s * 0.2, s * 0.15,
            angle, 0, Math.PI * 2
        );
        ctx.fill();
    }

    // Body
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.2, s * 0.4, s * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d68910';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Letter on chest
    ctx.fillStyle = '#c0392b';
    ctx.font = `bold ${s * 0.35}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('א', 0, s * 0.15);

    // Head
    ctx.fillStyle = '#f5b041';
    ctx.beginPath();
    ctx.arc(0, -s * 0.35, s * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d68910';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes
    drawEye(ctx, -s * 0.13, -s * 0.42, s * 0.1, -1, 0);
    drawEye(ctx, s * 0.13, -s * 0.42, s * 0.1, -1, 0);

    // Nose
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.28, s * 0.06, s * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    drawSmile(ctx, 0, -s * 0.2, s * 0.12);

    // Whiskers
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(dir * s * 0.08, -s * 0.26);
        ctx.lineTo(dir * s * 0.35, -s * 0.32);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(dir * s * 0.08, -s * 0.24);
        ctx.lineTo(dir * s * 0.33, -s * 0.22);
        ctx.stroke();
    }

    // Paws
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.ellipse(-s * 0.2, s * 0.65, s * 0.12, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.2, s * 0.65, s * 0.12, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = s * 0.06;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s * 0.35, s * 0.3);
    ctx.quadraticCurveTo(s * 0.7, s * 0.1 + Math.sin(time * 3) * s * 0.1, s * 0.6, -s * 0.1);
    ctx.stroke();
    // Tail tuft
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.arc(s * 0.6, -s * 0.1, s * 0.07, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

/**
 * Color Flower (פרח הצבעים) — Rainbow flower
 */
export function drawColorFlower(ctx, x, y, size, time = 0) {
    const s = size;
    const sway = Math.sin(time * 1.5) * 3;

    ctx.save();
    ctx.translate(x, y);

    // Stem
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = s * 0.1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, s * 0.7);
    ctx.quadraticCurveTo(sway, s * 0.2, sway * 0.5, -s * 0.1);
    ctx.stroke();

    // Leaves
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.ellipse(-s * 0.15 + sway * 0.3, s * 0.4, s * 0.2, s * 0.08, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.2 + sway * 0.3, s * 0.5, s * 0.18, s * 0.07, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Petals
    const petalColors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#e91e63'];
    const petalCount = 7;
    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2 + Math.sin(time * 2) * 0.1;
        ctx.fillStyle = petalColors[i];
        ctx.beginPath();
        ctx.ellipse(
            sway * 0.5 + Math.cos(angle) * s * 0.22,
            -s * 0.2 + Math.sin(angle) * s * 0.22,
            s * 0.18, s * 0.1,
            angle, 0, Math.PI * 2
        );
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Center face
    ctx.fillStyle = '#f5b041';
    ctx.beginPath();
    ctx.arc(sway * 0.5, -s * 0.2, s * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d68910';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Eyes
    drawEye(ctx, sway * 0.5 - s * 0.07, -s * 0.24, s * 0.06);
    drawEye(ctx, sway * 0.5 + s * 0.07, -s * 0.24, s * 0.06);

    // Smile
    drawSmile(ctx, sway * 0.5, -s * 0.14, s * 0.08);

    // Cheeks
    drawCheeks(ctx, sway * 0.5 - s * 0.13, -s * 0.15, s * 0.04);
    drawCheeks(ctx, sway * 0.5 + s * 0.13, -s * 0.15, s * 0.04);

    ctx.restore();
}

/**
 * Shape Shield (מגן הצורות) — Smiling shield with shapes on it
 */
export function drawShapeShield(ctx, x, y, size, time = 0) {
    const s = size;
    const pulse = 1 + Math.sin(time * 2) * 0.03;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(pulse, pulse);

    // Shield body
    ctx.fillStyle = '#bdc3c7';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.7);
    ctx.quadraticCurveTo(s * 0.6, -s * 0.7, s * 0.6, -s * 0.1);
    ctx.quadraticCurveTo(s * 0.6, s * 0.4, 0, s * 0.75);
    ctx.quadraticCurveTo(-s * 0.6, s * 0.4, -s * 0.6, -s * 0.1);
    ctx.quadraticCurveTo(-s * 0.6, -s * 0.7, 0, -s * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner border
    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.58);
    ctx.quadraticCurveTo(s * 0.48, -s * 0.58, s * 0.48, -s * 0.08);
    ctx.quadraticCurveTo(s * 0.48, s * 0.32, 0, s * 0.62);
    ctx.quadraticCurveTo(-s * 0.48, s * 0.32, -s * 0.48, -s * 0.08);
    ctx.quadraticCurveTo(-s * 0.48, -s * 0.58, 0, -s * 0.58);
    ctx.stroke();

    // Shapes on shield
    // Triangle (red)
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(-s * 0.25, -s * 0.1);
    ctx.lineTo(-s * 0.12, -s * 0.35);
    ctx.lineTo(0, -s * 0.1);
    ctx.closePath();
    ctx.fill();

    // Circle (blue)
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(s * 0.25, -s * 0.22, s * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Square (green)
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(-s * 0.2, s * 0.05, s * 0.2, s * 0.2);

    // Star (yellow)
    ctx.fillStyle = '#f1c40f';
    drawStar(ctx, s * 0.2, s * 0.18, s * 0.12);
    ctx.fill();

    // Eyes (peeking over top of shield)
    drawEye(ctx, -s * 0.15, -s * 0.58, s * 0.09);
    drawEye(ctx, s * 0.15, -s * 0.58, s * 0.09);

    ctx.restore();
}

/**
 * Star Maker (יוצר הכוכבים) — Happy star character that generates currency
 */
export function drawStarMaker(ctx, x, y, size, time = 0) {
    const s = size;
    const glow = 0.3 + Math.sin(time * 3) * 0.15;
    const spin = Math.sin(time * 1.5) * 0.1;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin);

    // Glow effect
    ctx.fillStyle = `rgba(241, 196, 15, ${glow})`;
    drawStar(ctx, 0, 0, s * 0.85, 5, 0.5);
    ctx.fill();

    // Star body
    ctx.fillStyle = '#f1c40f';
    drawStar(ctx, 0, 0, s * 0.65, 5, 0.5);
    ctx.fill();
    ctx.strokeStyle = '#d4ac0d';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Face
    drawEye(ctx, -s * 0.12, -s * 0.08, s * 0.08, 0, 1);
    drawEye(ctx, s * 0.12, -s * 0.08, s * 0.08, 0, 1);
    drawOpenSmile(ctx, 0, s * 0.1, s * 0.1);

    // Cheeks
    drawCheeks(ctx, -s * 0.22, s * 0.05, s * 0.06);
    drawCheeks(ctx, s * 0.22, s * 0.05, s * 0.06);

    // Sparkles around
    ctx.fillStyle = '#fff';
    const sparkleCount = 4;
    for (let i = 0; i < sparkleCount; i++) {
        const angle = (i / sparkleCount) * Math.PI * 2 + time * 2;
        const dist = s * 0.8 + Math.sin(time * 4 + i) * s * 0.1;
        const sx = Math.cos(angle) * dist;
        const sy = Math.sin(angle) * dist;
        const sparkleSize = s * 0.04 + Math.sin(time * 5 + i * 2) * s * 0.02;
        drawStar(ctx, sx, sy, sparkleSize, 4, 0.3);
        ctx.fill();
    }

    ctx.restore();
}

/**
 * Pattern Peacock (טווס הדפוסים) — Colorful peacock with patterned tail
 */
export function drawPatternPeacock(ctx, x, y, size, time = 0) {
    const s = size;
    const bob = Math.sin(time * 2) * 1.5;

    ctx.save();
    ctx.translate(x, y + bob);

    // Tail fan (behind body)
    const tailColors = ['#e74c3c', '#3498db', '#e74c3c', '#3498db', '#e74c3c', '#3498db', '#e74c3c'];
    const featherCount = 7;
    for (let i = 0; i < featherCount; i++) {
        const angle = -Math.PI * 0.65 + (i / (featherCount - 1)) * Math.PI * 0.3 + Math.PI;
        const spread = Math.sin(time * 1.5) * 0.05;
        ctx.fillStyle = tailColors[i];
        ctx.beginPath();
        ctx.ellipse(
            Math.cos(angle + spread) * s * 0.35,
            -s * 0.3 + Math.sin(angle + spread) * s * 0.35,
            s * 0.12, s * 0.35,
            angle + spread + Math.PI / 2, 0, Math.PI * 2
        );
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Eye spot on feather
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(
            Math.cos(angle + spread) * s * 0.35,
            -s * 0.3 + Math.sin(angle + spread) * s * 0.35 - s * 0.15,
            s * 0.05, 0, Math.PI * 2
        );
        ctx.fill();
    }

    // Body
    ctx.fillStyle = '#1abc9c';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.2, s * 0.25, s * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#16a085';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Head
    ctx.fillStyle = '#1abc9c';
    ctx.beginPath();
    ctx.arc(0, -s * 0.25, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#16a085';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Crown feathers
    ctx.fillStyle = '#f1c40f';
    for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.ellipse(i * s * 0.08, -s * 0.5, s * 0.03, s * 0.1, i * 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Dot on top
        ctx.beginPath();
        ctx.arc(i * s * 0.08 + Math.sin(i * 0.2) * s * 0.02, -s * 0.6, s * 0.03, 0, Math.PI * 2);
        ctx.fill();
    }

    // Eyes
    drawEye(ctx, -s * 0.08, -s * 0.28, s * 0.06);
    drawEye(ctx, s * 0.08, -s * 0.28, s * 0.06);

    // Beak
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.2);
    ctx.lineTo(-s * 0.06, -s * 0.15);
    ctx.lineTo(0, -s * 0.1);
    ctx.closePath();
    ctx.fill();

    // Feet
    ctx.strokeStyle = '#e67e22';
    ctx.lineWidth = 2;
    for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(dir * s * 0.1, s * 0.55);
        ctx.lineTo(dir * s * 0.1, s * 0.7);
        ctx.lineTo(dir * s * 0.05, s * 0.75);
        ctx.moveTo(dir * s * 0.1, s * 0.7);
        ctx.lineTo(dir * s * 0.15, s * 0.75);
        ctx.stroke();
    }

    ctx.restore();
}

/**
 * Music Bird (ציפור המוזיקה) — Singing bird with music notes
 */
export function drawMusicBird(ctx, x, y, size, time = 0) {
    const s = size;
    const bob = Math.sin(time * 3) * 2;

    ctx.save();
    ctx.translate(x, y + bob);

    // Wing
    ctx.fillStyle = '#5dade2';
    ctx.beginPath();
    ctx.ellipse(s * 0.15, s * 0.05, s * 0.3, s * 0.15, 0.3 + Math.sin(time * 4) * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.1, s * 0.3, s * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2471a3';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Head
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(0, -s * 0.25, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2471a3';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes
    drawEye(ctx, -s * 0.08, -s * 0.3, s * 0.06, 0, 0);
    drawEye(ctx, s * 0.08, -s * 0.3, s * 0.06, 0, 0);

    // Beak (open, singing)
    ctx.fillStyle = '#f39c12';
    // Top beak
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, -s * 0.18);
    ctx.lineTo(-s * 0.4, -s * 0.22);
    ctx.lineTo(-s * 0.22, -s * 0.14);
    ctx.closePath();
    ctx.fill();
    // Bottom beak
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, -s * 0.12);
    ctx.lineTo(-s * 0.35, -s * 0.08 + Math.sin(time * 6) * s * 0.02);
    ctx.lineTo(-s * 0.22, -s * 0.1);
    ctx.closePath();
    ctx.fill();

    // Musical notes floating
    ctx.fillStyle = '#9b59b6';
    const noteOffsets = [
        { dx: -s * 0.5, dy: -s * 0.4, phase: 0 },
        { dx: -s * 0.7, dy: -s * 0.6, phase: 1.5 },
        { dx: -s * 0.35, dy: -s * 0.7, phase: 3 },
    ];
    for (const note of noteOffsets) {
        const ny = note.dy + Math.sin(time * 2 + note.phase) * s * 0.1;
        const alpha = 0.5 + Math.sin(time * 2 + note.phase) * 0.3;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.ellipse(note.dx, ny, s * 0.05, s * 0.04, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(note.dx + s * 0.05, ny);
        ctx.lineTo(note.dx + s * 0.05, ny - s * 0.12);
        ctx.stroke();
        // Flag
        ctx.beginPath();
        ctx.moveTo(note.dx + s * 0.05, ny - s * 0.12);
        ctx.quadraticCurveTo(note.dx + s * 0.12, ny - s * 0.1, note.dx + s * 0.05, ny - s * 0.07);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Tail
    ctx.fillStyle = '#2471a3';
    ctx.beginPath();
    ctx.moveTo(s * 0.25, s * 0.2);
    ctx.quadraticCurveTo(s * 0.5, s * 0.3, s * 0.45, s * 0.5);
    ctx.quadraticCurveTo(s * 0.3, s * 0.4, s * 0.2, s * 0.3);
    ctx.closePath();
    ctx.fill();

    // Feet
    ctx.strokeStyle = '#e67e22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.08, s * 0.38);
    ctx.lineTo(-s * 0.08, s * 0.55);
    ctx.lineTo(-s * 0.15, s * 0.6);
    ctx.moveTo(-s * 0.08, s * 0.55);
    ctx.lineTo(-s * 0.02, s * 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.08, s * 0.38);
    ctx.lineTo(s * 0.08, s * 0.55);
    ctx.lineTo(s * 0.02, s * 0.6);
    ctx.moveTo(s * 0.08, s * 0.55);
    ctx.lineTo(s * 0.14, s * 0.6);
    ctx.stroke();

    ctx.restore();
}


// ─── ENEMY SPRITES ───────────────────────────────────────────────────────────

/**
 * Muddle Cloud (ענן הבלבול) — Basic enemy, confused cloud
 */
export function drawMuddleCloud(ctx, x, y, size, time = 0) {
    const s = size;
    const wobble = Math.sin(time * 2) * 2;
    const float = Math.sin(time * 1.5) * 3;

    ctx.save();
    ctx.translate(x + wobble, y + float);

    // Cloud body (overlapping circles)
    ctx.fillStyle = '#95a5a6';
    ctx.beginPath();
    ctx.arc(-s * 0.2, s * 0.05, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.2, s * 0.05, s * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -s * 0.15, s * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-s * 0.1, s * 0.15, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.1, s * 0.15, s * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Slightly darker top
    ctx.fillStyle = '#a6b1b5';
    ctx.beginPath();
    ctx.arc(0, -s * 0.2, s * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Spiral eyes (dizzy)
    for (const dir of [-1, 1]) {
        const ex = dir * s * 0.15;
        const ey = -s * 0.1;
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 4; a += 0.2) {
            const r = a * s * 0.015;
            const px = ex + Math.cos(a + time * 3 * dir) * r;
            const py = ey + Math.sin(a + time * 3 * dir) * r;
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }

    // Wavy mouth
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) {
        const mx = -s * 0.15 + (i / 20) * s * 0.3;
        const my = s * 0.08 + Math.sin(i * 0.8 + time * 4) * s * 0.03;
        if (i === 0) ctx.moveTo(mx, my);
        else ctx.lineTo(mx, my);
    }
    ctx.stroke();

    ctx.restore();
}

/**
 * Mess Monster (מפלצת הבלגן) — Paint-splotched goofy monster
 */
export function drawMessMonster(ctx, x, y, size, time = 0) {
    const s = size;
    const bounce = Math.abs(Math.sin(time * 2.5)) * 4;

    ctx.save();
    ctx.translate(x, y - bounce);

    // Body (blobby)
    ctx.fillStyle = '#8e44ad';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.1, s * 0.45, s * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6c3483';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Paint splotches
    const splotchColors = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#e67e22'];
    const splotches = [
        { x: -s * 0.2, y: -s * 0.15, r: s * 0.08 },
        { x: s * 0.15, y: s * 0.2, r: s * 0.1 },
        { x: s * 0.25, y: -s * 0.1, r: s * 0.07 },
        { x: -s * 0.1, y: s * 0.35, r: s * 0.06 },
        { x: s * 0.05, y: -s * 0.3, r: s * 0.09 },
    ];
    splotches.forEach((sp, i) => {
        ctx.fillStyle = splotchColors[i];
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        ctx.fill();
    });

    // Eyes (different sizes for goofiness)
    drawEye(ctx, -s * 0.15, -s * 0.2, s * 0.12, 2, -1);
    drawEye(ctx, s * 0.18, -s * 0.15, s * 0.09, -1, 1);

    // Goofy grin
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(0, s * 0.05, s * 0.18, 0.1, Math.PI - 0.1);
    ctx.fill();
    // Tooth
    ctx.fillStyle = '#fff';
    ctx.fillRect(-s * 0.05, s * 0.05, s * 0.1, s * 0.08);

    // Arms (stubby)
    ctx.fillStyle = '#8e44ad';
    ctx.beginPath();
    ctx.ellipse(-s * 0.5, s * 0.05, s * 0.12, s * 0.08, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.5, s * 0.1, s * 0.12, s * 0.08, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Legs (stubby)
    ctx.beginPath();
    ctx.ellipse(-s * 0.15, s * 0.65, s * 0.12, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.15, s * 0.65, s * 0.12, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

/**
 * Sleepy Snail (חילזון הישנוני) — Tanky snail with sleep cap
 */
export function drawSleepySnail(ctx, x, y, size, time = 0) {
    const s = size;
    const slowBob = Math.sin(time * 0.8) * 1;

    ctx.save();
    ctx.translate(x, y + slowBob);

    // Shell
    ctx.fillStyle = '#d4a574';
    ctx.beginPath();
    ctx.arc(s * 0.1, -s * 0.05, s * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a0764a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Shell spiral
    ctx.strokeStyle = '#a0764a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 5; a += 0.15) {
        const r = s * 0.05 + a * s * 0.02;
        const px = s * 0.1 + Math.cos(a) * Math.min(r, s * 0.28);
        const py = -s * 0.05 + Math.sin(a) * Math.min(r, s * 0.28);
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Body (slug part)
    ctx.fillStyle = '#a3d977';
    ctx.beginPath();
    ctx.ellipse(-s * 0.15, s * 0.3, s * 0.4, s * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7daa55';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Head
    ctx.fillStyle = '#a3d977';
    ctx.beginPath();
    ctx.arc(-s * 0.4, s * 0.15, s * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Sleep cap
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.moveTo(-s * 0.58, s * 0.1);
    ctx.quadraticCurveTo(-s * 0.4, -s * 0.25, -s * 0.15, -s * 0.1);
    ctx.quadraticCurveTo(-s * 0.3, s * 0.1, -s * 0.58, s * 0.1);
    ctx.fill();
    // Pom-pom
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-s * 0.15, -s * 0.12, s * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Closed eyes (sleeping)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-s * 0.45, s * 0.12, s * 0.05, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-s * 0.33, s * 0.12, s * 0.05, 0, Math.PI);
    ctx.stroke();

    // ZZZ
    ctx.fillStyle = '#5dade2';
    ctx.font = `bold ${s * 0.15}px Arial`;
    ctx.textAlign = 'center';
    const zzz = [
        { text: 'z', x: -s * 0.55, y: -s * 0.15, size: s * 0.12 },
        { text: 'z', x: -s * 0.65, y: -s * 0.35, size: s * 0.16 },
        { text: 'Z', x: -s * 0.5, y: -s * 0.55, size: s * 0.2 },
    ];
    zzz.forEach((z, i) => {
        ctx.globalAlpha = 0.5 + Math.sin(time * 2 + i) * 0.3;
        ctx.font = `bold ${z.size}px Arial`;
        ctx.fillText(z.text, z.x, z.y + Math.sin(time * 1.5 + i * 1.2) * s * 0.05);
    });
    ctx.globalAlpha = 1;

    // Eyebrow
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;

    ctx.restore();
}

/**
 * Giggly Gremlin (שדון הצחקוקים) — Small fast laughing imp
 */
export function drawGigglyGremlin(ctx, x, y, size, time = 0) {
    const s = size * 0.7; // Smaller than others
    const jitter = Math.sin(time * 8) * 2;
    const hop = Math.abs(Math.sin(time * 5)) * 5;

    ctx.save();
    ctx.translate(x + jitter, y - hop);

    // Body
    ctx.fillStyle = '#27ae60';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.1, s * 0.3, s * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e8449';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Head
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(0, -s * 0.3, s * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e8449';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pointy ears
    for (const dir of [-1, 1]) {
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.moveTo(dir * s * 0.2, -s * 0.35);
        ctx.lineTo(dir * s * 0.4, -s * 0.55);
        ctx.lineTo(dir * s * 0.25, -s * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // Eyes (squinting with laughter)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, -s * 0.35);
    ctx.lineTo(-s * 0.08, -s * 0.3);
    ctx.lineTo(-s * 0.15, -s * 0.25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.15, -s * 0.35);
    ctx.lineTo(s * 0.08, -s * 0.3);
    ctx.lineTo(s * 0.15, -s * 0.25);
    ctx.stroke();

    // Wide laughing mouth
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(0, -s * 0.15, s * 0.12, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Arms (waving)
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = s * 0.06;
    ctx.lineCap = 'round';
    for (const dir of [-1, 1]) {
        const wave = Math.sin(time * 6 + dir * 2) * 0.5;
        ctx.beginPath();
        ctx.moveTo(dir * s * 0.3, s * 0);
        ctx.lineTo(dir * s * 0.5, -s * 0.2 + wave * s * 0.2);
        ctx.stroke();
    }

    // Legs
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = s * 0.07;
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, s * 0.4);
    ctx.lineTo(-s * 0.15, s * 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.1, s * 0.4);
    ctx.lineTo(s * 0.15, s * 0.6);
    ctx.stroke();

    ctx.restore();
}

/**
 * Bubble Trouble (בועות הצרות) — Floating soap bubble with face
 */
export function drawBubbleTrouble(ctx, x, y, size, time = 0) {
    const s = size;
    const float = Math.sin(time * 1.2) * 5;

    ctx.save();
    ctx.translate(x, y + float);

    // Rainbow sheen / iridescent effect
    const gradient = ctx.createRadialGradient(-s * 0.15, -s * 0.15, s * 0.05, 0, 0, s * 0.5);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(0.3, 'rgba(173, 216, 230, 0.3)');
    gradient.addColorStop(0.5, 'rgba(255, 200, 255, 0.3)');
    gradient.addColorStop(0.7, 'rgba(200, 255, 200, 0.3)');
    gradient.addColorStop(1, 'rgba(173, 216, 230, 0.15)');

    // Bubble body
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Bubble outline
    ctx.strokeStyle = 'rgba(100, 180, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(-s * 0.15, -s * 0.2, s * 0.12, s * 0.08, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // Silly face inside
    drawEye(ctx, -s * 0.12, -s * 0.05, s * 0.08, 1, 1);
    drawEye(ctx, s * 0.12, -s * 0.05, s * 0.08, 1, 1);

    // Surprised O mouth
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.15, s * 0.08, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
}

/**
 * King Chaos (מלך הבלגן) — Boss enemy
 */
export function drawKingChaos(ctx, x, y, size, time = 0) {
    const s = size * 1.3; // Bigger than others
    const stomp = Math.abs(Math.sin(time * 2)) * 3;

    ctx.save();
    ctx.translate(x, y + stomp);

    // Body (large, blobby)
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.15, s * 0.55, s * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#922b21';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Belly patch
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.2, s * 0.3, s * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(0, -s * 0.4, s * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#922b21';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Crown
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, -s * 0.55);
    ctx.lineTo(-s * 0.35, -s * 0.85);
    ctx.lineTo(-s * 0.15, -s * 0.7);
    ctx.lineTo(0, -s * 0.9);
    ctx.lineTo(s * 0.15, -s * 0.7);
    ctx.lineTo(s * 0.35, -s * 0.85);
    ctx.lineTo(s * 0.3, -s * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d4ac0d';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Jewels on crown
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(0, -s * 0.72, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(-s * 0.18, -s * 0.62, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(s * 0.18, -s * 0.62, s * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (angry-ish but goofy)
    drawEye(ctx, -s * 0.15, -s * 0.45, s * 0.1, 2, 0);
    drawEye(ctx, s * 0.15, -s * 0.45, s * 0.1, -2, 0);

    // Angry eyebrows (but crooked/goofy)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-s * 0.25, -s * 0.58);
    ctx.lineTo(-s * 0.08, -s * 0.53);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.25, -s * 0.55);
    ctx.lineTo(s * 0.08, -s * 0.53);
    ctx.stroke();

    // Mouth (grr but silly)
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(0, -s * 0.25, s * 0.15, 0, Math.PI);
    ctx.fill();
    // Teeth
    ctx.fillStyle = '#fff';
    for (let i = -2; i <= 2; i++) {
        ctx.fillRect(i * s * 0.06 - s * 0.025, -s * 0.25, s * 0.05, s * 0.06);
    }

    // Arms (thick)
    ctx.fillStyle = '#c0392b';
    for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(dir * s * 0.6, s * 0, s * 0.15, s * 0.25,
            dir * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#922b21';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Legs
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.ellipse(-s * 0.2, s * 0.75, s * 0.15, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.2, s * 0.75, s * 0.15, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}


// ─── UI / MISC SPRITES ──────────────────────────────────────────────────────

/**
 * Draw a collectible star (currency)
 */
export function drawCollectStar(ctx, x, y, size, time = 0) {
    const s = size;
    const pulse = 1 + Math.sin(time * 4) * 0.1;
    const spin = time * 0.5;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(pulse, pulse);
    ctx.rotate(spin);

    // Glow
    ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
    drawStar(ctx, 0, 0, s * 1.2, 5, 0.5);
    ctx.fill();

    // Star
    ctx.fillStyle = '#f1c40f';
    drawStar(ctx, 0, 0, s, 5, 0.5);
    ctx.fill();
    ctx.strokeStyle = '#d4ac0d';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
}

/**
 * Draw the house/home base (right side of the screen)
 */
export function drawHouse(ctx, x, y, width, height) {
    ctx.save();

    const bodyX = x + width * 0.1;
    const bodyY = y + height * 0.35;
    const bodyW = width * 0.8;
    const bodyH = height * 0.6;

    // Drop shadow behind the house
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#e8d5b7';
    ctx.fillRect(bodyX, bodyY, bodyW, bodyH);
    ctx.restore();

    // House body with gradient
    const wallGrad = ctx.createLinearGradient(bodyX, bodyY, bodyX, bodyY + bodyH);
    wallGrad.addColorStop(0, '#f0e4cc');
    wallGrad.addColorStop(1, '#d4be8e');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(bodyX, bodyY, bodyW, bodyH);

    // Brick/stone texture hints
    ctx.strokeStyle = 'rgba(160, 130, 80, 0.15)';
    ctx.lineWidth = 1;
    for (let row = 0; row < 6; row++) {
        const ly = bodyY + bodyH * (row + 1) / 7;
        ctx.beginPath();
        ctx.moveTo(bodyX + 2, ly);
        ctx.lineTo(bodyX + bodyW - 2, ly);
        ctx.stroke();
        // Vertical joints offset per row
        const offset = row % 2 === 0 ? bodyW * 0.25 : bodyW * 0.5;
        ctx.beginPath();
        ctx.moveTo(bodyX + offset, ly - bodyH / 7);
        ctx.lineTo(bodyX + offset, ly);
        ctx.stroke();
    }

    // Wall border
    ctx.strokeStyle = '#b8975a';
    ctx.lineWidth = 2;
    ctx.strokeRect(bodyX, bodyY, bodyW, bodyH);

    // Roof with shingle texture
    const roofLeft = x;
    const roofRight = x + width;
    const roofPeak = y + height * 0.05;
    const roofBase = y + height * 0.38;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(roofLeft, roofBase);
    ctx.lineTo(x + width * 0.5, roofPeak);
    ctx.lineTo(roofRight, roofBase);
    ctx.closePath();
    ctx.clip();

    // Roof gradient
    const roofGrad = ctx.createLinearGradient(x, roofPeak, x, roofBase);
    roofGrad.addColorStop(0, '#e74c3c');
    roofGrad.addColorStop(1, '#a93226');
    ctx.fillStyle = roofGrad;
    ctx.fillRect(roofLeft, roofPeak, width, roofBase - roofPeak);

    // Shingle arcs
    ctx.strokeStyle = 'rgba(120, 30, 20, 0.25)';
    ctx.lineWidth = 1;
    const shingleRows = 5;
    for (let sr = 0; sr < shingleRows; sr++) {
        const sy = roofPeak + (roofBase - roofPeak) * (sr + 1) / (shingleRows + 1);
        const rowWidth = width * ((sr + 1) / (shingleRows + 1));
        const startShingleX = x + width * 0.5 - rowWidth / 2;
        const shingleW = rowWidth / 4;
        for (let sc = 0; sc < 5; sc++) {
            ctx.beginPath();
            ctx.arc(startShingleX + sc * shingleW, sy, shingleW * 0.6, 0, Math.PI);
            ctx.stroke();
        }
    }
    ctx.restore();

    // Roof outline
    ctx.beginPath();
    ctx.moveTo(roofLeft, roofBase);
    ctx.lineTo(x + width * 0.5, roofPeak);
    ctx.lineTo(roofRight, roofBase);
    ctx.closePath();
    ctx.strokeStyle = '#922b21';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Chimney
    const chimX = x + width * 0.72;
    const chimW = width * 0.12;
    const chimTop = roofPeak + (roofBase - roofPeak) * 0.15;
    const chimBottom = roofBase;
    const chimGrad = ctx.createLinearGradient(chimX, chimTop, chimX + chimW, chimTop);
    chimGrad.addColorStop(0, '#a0522d');
    chimGrad.addColorStop(1, '#8B4513');
    ctx.fillStyle = chimGrad;
    ctx.fillRect(chimX, chimTop, chimW, chimBottom - chimTop);
    ctx.strokeStyle = '#5D2E0C';
    ctx.lineWidth = 1;
    ctx.strokeRect(chimX, chimTop, chimW, chimBottom - chimTop);
    // Chimney cap
    ctx.fillStyle = '#6d3a1a';
    ctx.fillRect(chimX - 2, chimTop, chimW + 4, 4);

    // Smoke wisps
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const smokeTime = (typeof window !== 'undefined' ? performance.now() / 1000 : 0);
    for (let i = 0; i < 3; i++) {
        const sx = chimX + chimW * 0.5 + i * 3 - 3;
        const sy = chimTop - 5 - i * 8;
        const sway = Math.sin(smokeTime * 1.5 + i * 1.2) * 4;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(sx + sway, sy - 8, sx + sway * 0.5, sy - 16);
        ctx.stroke();
    }

    // Window with warm glow
    const winX = x + width * 0.55;
    const winY = y + height * 0.42;
    const winW = width * 0.25;
    const winH = width * 0.2;

    // Window glow (radial gradient)
    const glowGrad = ctx.createRadialGradient(
        winX + winW / 2, winY + winH / 2, 0,
        winX + winW / 2, winY + winH / 2, winW * 0.7
    );
    glowGrad.addColorStop(0, '#fff5cc');
    glowGrad.addColorStop(0.6, '#ffe082');
    glowGrad.addColorStop(1, '#f9a825');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(winX, winY, winW, winH);

    // Window frame
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2;
    ctx.strokeRect(winX, winY, winW, winH);
    // Window cross
    ctx.beginPath();
    ctx.moveTo(winX + winW / 2, winY);
    ctx.lineTo(winX + winW / 2, winY + winH);
    ctx.moveTo(winX, winY + winH / 2);
    ctx.lineTo(winX + winW, winY + winH / 2);
    ctx.stroke();

    // Flower box under window
    const boxH = 6;
    const fbGrad = ctx.createLinearGradient(winX, winY + winH, winX, winY + winH + boxH);
    fbGrad.addColorStop(0, '#8B4513');
    fbGrad.addColorStop(1, '#5D2E0C');
    ctx.fillStyle = fbGrad;
    ctx.fillRect(winX - 3, winY + winH, winW + 6, boxH);
    // Small flowers
    const flowerColors = ['#e74c3c', '#f39c12', '#e74c3c'];
    for (let i = 0; i < 3; i++) {
        const fx = winX + winW * (i + 1) / 4;
        const fy = winY + winH - 2;
        // Stem
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(fx, fy + 3);
        ctx.lineTo(fx, fy - 4);
        ctx.stroke();
        // Petals
        ctx.fillStyle = flowerColors[i];
        ctx.beginPath();
        ctx.arc(fx, fy - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(fx, fy - 5, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Door with gradient
    const doorX = x + width * 0.35;
    const doorY = y + height * 0.55;
    const doorW = width * 0.3;
    const doorH = height * 0.4;
    const doorGrad = ctx.createLinearGradient(doorX, doorY, doorX + doorW, doorY);
    doorGrad.addColorStop(0, '#a0522d');
    doorGrad.addColorStop(0.5, '#8B4513');
    doorGrad.addColorStop(1, '#6d3a1a');
    ctx.fillStyle = doorGrad;
    drawRoundedRect(ctx, doorX, doorY, doorW, doorH, 5);
    ctx.fill();
    ctx.strokeStyle = '#5D2E0C';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Door panel lines
    ctx.strokeStyle = 'rgba(93, 46, 12, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(doorX + doorW * 0.15, doorY + doorH * 0.08, doorW * 0.7, doorH * 0.35);
    ctx.strokeRect(doorX + doorW * 0.15, doorY + doorH * 0.52, doorW * 0.7, doorH * 0.35);

    // Door knob
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(x + width * 0.58, y + height * 0.75, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d4ac0d';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Doorstep / welcome mat
    ctx.fillStyle = '#d4ac0d';
    ctx.fillRect(doorX - 3, doorY + doorH - 1, doorW + 6, 4);
    ctx.fillStyle = '#c0392b';
    drawRoundedRect(ctx, doorX + 2, doorY + doorH + 2, doorW - 4, 5, 2);
    ctx.fill();

    ctx.restore();
}

/**
 * Draw a projectile (number bubble, letter, color splash, etc.)
 */
export function drawProjectile(ctx, x, y, size, type, value, time = 0) {
    const s = size;
    ctx.save();
    ctx.translate(x, y);

    switch (type) {
        case 'number': {
            // Number in a bubble
            ctx.fillStyle = 'rgba(52, 152, 219, 0.7)';
            ctx.beginPath();
            ctx.arc(0, 0, s, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2471a3';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${s * 1.2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(value || '1', 0, 0);
            break;
        }
        case 'letter': {
            // Hebrew letter in a golden circle
            ctx.fillStyle = 'rgba(243, 156, 18, 0.8)';
            ctx.beginPath();
            ctx.arc(0, 0, s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${s * 1.2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(value || 'א', 0, 1);
            break;
        }
        case 'color': {
            // Color splash
            ctx.fillStyle = value || '#e74c3c';
            ctx.beginPath();
            // Irregular splash shape
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const r = s * (0.7 + Math.sin(i * 3 + time * 5) * 0.3);
                const px = Math.cos(angle) * r;
                const py = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            break;
        }
        case 'shape': {
            ctx.fillStyle = '#bdc3c7';
            ctx.beginPath();
            ctx.arc(0, 0, s, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
        case 'music': {
            // Musical note
            ctx.fillStyle = '#9b59b6';
            ctx.beginPath();
            ctx.ellipse(0, s * 0.2, s * 0.4, s * 0.3, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#9b59b6';
            ctx.lineWidth = s * 0.15;
            ctx.beginPath();
            ctx.moveTo(s * 0.35, s * 0.1);
            ctx.lineTo(s * 0.35, -s * 0.6);
            ctx.stroke();
            break;
        }
        case 'pattern': {
            // Small pattern (colored circles)
            const colors = ['#e74c3c', '#3498db', '#e74c3c'];
            colors.forEach((c, i) => {
                ctx.fillStyle = c;
                ctx.beginPath();
                ctx.arc(-s * 0.5 + i * s * 0.5, 0, s * 0.25, 0, Math.PI * 2);
                ctx.fill();
            });
            break;
        }
        default: {
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.arc(0, 0, s, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}

/**
 * Draw a health bar above an entity
 */
export function drawHealthBar(ctx, x, y, width, ratio, height = 6) {
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(x - width / 2, y, width, height);
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(x - width / 2, y, width * Math.max(0, ratio), height);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - width / 2, y, width, height);
}

/**
 * Draw confetti particle
 */
export function drawConfetti(ctx, x, y, size, color, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.fillRect(-size / 2, -size / 4, size, size / 2);
    ctx.restore();
}

/**
 * Draw a sticker (reward)
 */
export function drawSticker(ctx, x, y, size, type, earned = true) {
    ctx.save();
    ctx.translate(x, y);

    if (!earned) {
        ctx.globalAlpha = 0.3;
    }

    // Sticker background (circle)
    ctx.fillStyle = earned ? '#f1c40f' : '#bdc3c7';
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = earned ? '#d4ac0d' : '#95a5a6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icon based on type
    ctx.fillStyle = earned ? '#fff' : '#95a5a6';
    ctx.font = `${size * 0.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const icons = {
        star: '⭐',
        heart: '❤',
        check: '✓',
        crown: '👑',
        flower: '🌸',
        diamond: '💎',
        rainbow: '🌈',
        medal: '🏅',
        trophy: '🏆',
    };
    ctx.fillText(icons[type] || '⭐', 0, 2);

    ctx.restore();
}

// ─── Sprite Map for easy lookup ──────────────────────────────────────────────

export const DEFENDER_SPRITES = {
    numberBuddy:    withImage('numberBuddy', drawNumberBuddy, (ctx, t) => ctx.translate(0, Math.sin(t * 2) * 2)),
    letterLion:     withImage('letterLion', drawLetterLion, (ctx, t) => ctx.translate(0, Math.sin(t * 1.8) * 2)),
    colorFlower:    withImage('colorFlower', drawColorFlower, (ctx, t) => ctx.translate(Math.sin(t * 1.5) * 1.5, 0)),
    shapeShield:    withImage('shapeShield', drawShapeShield, (ctx, t) => ctx.scale(1 + Math.sin(t * 2) * 0.03, 1 + Math.sin(t * 2) * 0.03)),
    starMaker:      withImage('starMaker', drawStarMaker, (ctx, t) => ctx.rotate(Math.sin(t * 1.5) * 0.1)),
    patternPeacock: withImage('patternPeacock', drawPatternPeacock, (ctx, t) => ctx.translate(0, Math.sin(t * 2) * 1.5)),
    musicBird:      withImage('musicBird', drawMusicBird, (ctx, t) => ctx.translate(0, Math.sin(t * 3) * 2)),
};

export const ENEMY_SPRITES = {
    muddleCloud:   withEnemyImage('muddleCloud', drawMuddleCloud, (ctx, t) => ctx.translate(0, Math.sin(t * 2) * 2)),
    messMonster:   withEnemyImage('messMonster', drawMessMonster, (ctx, t) => ctx.translate(0, Math.sin(t * 1.5) * 1.5)),
    sleepySnail:   withEnemyImage('sleepySnail', drawSleepySnail, (ctx, t) => ctx.translate(0, Math.sin(t * 0.8) * 1)),
    gigglyGremlin: withEnemyImage('gigglyGremlin', drawGigglyGremlin, (ctx, t) => ctx.translate(0, Math.sin(t * 4) * 3)),
    bubbleTrouble: withEnemyImage('bubbleTrouble', drawBubbleTrouble, (ctx, t) => ctx.translate(0, Math.sin(t * 2.5) * 3)),
    kingChaos:     withEnemyImage('kingChaos', drawKingChaos, (ctx, t) => ctx.scale(1 + Math.sin(t * 1.5) * 0.03, 1 + Math.sin(t * 1.5) * 0.03)),
};
