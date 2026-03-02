import { describe, it, expect } from 'vitest';
import { generateChallenge, GENERATORS } from '../js/challenges.js';

// Proxy-based canvas context mock — accepts any property/method call so it
// won't break if challenge rendering adds new canvas API calls in the future.
function createMockCtx() {
    return new Proxy({}, {
        get(target, prop) {
            if (prop in target) return target[prop];
            // Return a no-op function for any unknown method
            return () => {};
        },
        set(target, prop, value) {
            target[prop] = value;
            return true;
        },
    });
}

const AREA = { x: 0, y: 0, w: 960, h: 540 };

const CHALLENGE_TYPES = ['counting', 'colors', 'letters', 'shapes', 'patterns', 'animals'];

// Helper: render a challenge and find the correct index by probing each option
function findCorrectIndex(challenge) {
    const ctx = createMockCtx();
    challenge.render(ctx, AREA, 0);
    for (let i = 0; i < challenge.optionAreas.length; i++) {
        const a = challenge.optionAreas[i];
        const cx = a.cx ?? a.x + a.w / 2;
        const cy = a.cy ?? a.y + a.h / 2;
        if (challenge.checkAnswer(cx, cy) === 'correct') {
            return i;
        }
    }
    return -1;
}

describe('Challenge generators', () => {
    for (const type of CHALLENGE_TYPES) {
        describe(`${type} challenge`, () => {
            it('generates a valid challenge object', () => {
                const challenge = GENERATORS[type]();
                expect(challenge).toHaveProperty('type');
                expect(challenge).toHaveProperty('questionText');
                expect(typeof challenge.render).toBe('function');
                expect(typeof challenge.checkAnswer).toBe('function');
            });

            it('has exactly one correct answer among 3 options', () => {
                for (let i = 0; i < 10; i++) {
                    const challenge = GENERATORS[type]();
                    const correctIdx = findCorrectIndex(challenge);
                    expect(correctIdx).toBeGreaterThanOrEqual(0);
                    expect(correctIdx).toBeLessThanOrEqual(2);
                    expect(challenge.optionAreas.length).toBe(3);
                }
            });

            it('returns "correct" when clicking the correct option', () => {
                const challenge = GENERATORS[type]();
                const ctx = createMockCtx();
                challenge.render(ctx, AREA, 0);

                const correctIdx = findCorrectIndex(challenge);
                const correct = challenge.optionAreas[correctIdx];
                const cx = correct.cx ?? correct.x + correct.w / 2;
                const cy = correct.cy ?? correct.y + correct.h / 2;
                expect(challenge.checkAnswer(cx, cy)).toBe('correct');
            });

            it('returns "wrong" when clicking a wrong option', () => {
                const challenge = GENERATORS[type]();
                const ctx = createMockCtx();
                challenge.render(ctx, AREA, 0);

                const correctIdx = findCorrectIndex(challenge);
                const wrongIdx = (correctIdx + 1) % 3;
                const wrong = challenge.optionAreas[wrongIdx];
                const cx = wrong.cx ?? wrong.x + wrong.w / 2;
                const cy = wrong.cy ?? wrong.y + wrong.h / 2;
                expect(challenge.checkAnswer(cx, cy)).toBe('wrong');
            });

            it('returns null when clicking outside all options', () => {
                const challenge = GENERATORS[type]();
                const ctx = createMockCtx();
                challenge.render(ctx, AREA, 0);

                expect(challenge.checkAnswer(-100, -100)).toBeNull();
            });
        });
    }
});

describe('generateChallenge()', () => {
    it('returns a challenge of an allowed type', () => {
        for (let i = 0; i < 30; i++) {
            const challenge = generateChallenge(['counting', 'colors']);
            expect(['counting', 'colors']).toContain(challenge.type);
        }
    });

    it('falls back to counting for unknown types', () => {
        const challenge = generateChallenge(['nonexistent_type']);
        expect(challenge.type).toBe('counting');
    });
});
