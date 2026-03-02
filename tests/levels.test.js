import { describe, it, expect } from 'vitest';
import { DEFENDER_DEFS, ENEMY_DEFS, LEVELS } from '../js/levels.js';

describe('Defender definitions', () => {
    for (const [id, def] of Object.entries(DEFENDER_DEFS)) {
        it(`${id} has required fields`, () => {
            expect(def).toHaveProperty('cost');
            expect(def).toHaveProperty('hp');
            expect(def).toHaveProperty('cooldown');
            expect(def).toHaveProperty('damage');
            expect(typeof def.cost).toBe('number');
            expect(typeof def.hp).toBe('number');
            expect(typeof def.cooldown).toBe('number');
            expect(typeof def.damage).toBe('number');
        });
    }
});

describe('Enemy definitions', () => {
    for (const [id, def] of Object.entries(ENEMY_DEFS)) {
        it(`${id} has required fields`, () => {
            expect(def).toHaveProperty('hp');
            expect(def).toHaveProperty('speed');
            expect(def).toHaveProperty('damage');
            expect(typeof def.hp).toBe('number');
            expect(typeof def.speed).toBe('number');
            expect(typeof def.damage).toBe('number');
            expect(def.hp).toBeGreaterThan(0);
            expect(def.speed).toBeGreaterThan(0);
        });
    }
});

describe('Level definitions', () => {
    for (const level of LEVELS) {
        describe(`Level ${level.id}: ${level.name}`, () => {
            it('availableDefenders reference valid defender IDs', () => {
                for (const defId of level.availableDefenders) {
                    expect(DEFENDER_DEFS).toHaveProperty(defId);
                }
            });

            it('wave enemies reference valid enemy IDs', () => {
                for (const wave of level.waves) {
                    for (const entry of wave.enemies) {
                        expect(ENEMY_DEFS).toHaveProperty(entry.type);
                    }
                }
            });

            it('wave enemy lanes are 0-2', () => {
                for (const wave of level.waves) {
                    for (const entry of wave.enemies) {
                        expect(entry.lane).toBeGreaterThanOrEqual(0);
                        expect(entry.lane).toBeLessThanOrEqual(2);
                    }
                }
            });

            it('startingStars >= cheapest available defender cost', () => {
                const cheapest = Math.min(
                    ...level.availableDefenders.map(id => DEFENDER_DEFS[id].cost)
                );
                expect(level.startingStars).toBeGreaterThanOrEqual(cheapest);
            });
        });
    }
});
