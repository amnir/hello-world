import { describe, it, expect, vi } from 'vitest';

// Stub Image before importing assets.js
class MockImage {
    set src(val) {
        this._src = val;
        setTimeout(() => this.onerror && this.onerror(), 0);
    }
    get src() { return this._src; }
}
globalThis.Image = MockImage;

const { getDefenderImage, getEnemyImage, loadDefenderImages, loadEnemyImages } = await import('../js/assets.js');

describe('getDefenderImage', () => {
    it('returns null for unknown type', () => {
        expect(getDefenderImage('nonExistent')).toBeNull();
    });
});

describe('getEnemyImage', () => {
    it('returns null for unknown type', () => {
        expect(getEnemyImage('nonExistent')).toBeNull();
    });
});

describe.each([
    { label: 'defender', loadFn: 'loadDefenderImages', getFn: 'getDefenderImage', count: 7, sampleKey: 'numberBuddy' },
    { label: 'enemy',    loadFn: 'loadEnemyImages',    getFn: 'getEnemyImage',    count: 6, sampleKey: 'muddleCloud' },
])('$label image loader', ({ loadFn, getFn, count, sampleKey }) => {
    const load = { loadDefenderImages, loadEnemyImages }[loadFn];
    const get = { getDefenderImage, getEnemyImage }[getFn];

    it('resolves even when all images fail to load', async () => {
        await expect(load()).resolves.not.toThrow();
    });

    it('calls onProgress for each image', async () => {
        const calls = [];
        await load((loaded, total) => calls.push({ loaded, total }));

        expect(calls.length).toBe(count);
        expect(calls[0].total).toBe(count);
        expect(calls[calls.length - 1].loaded).toBe(count);
        calls.forEach((c, i) => expect(c.loaded).toBe(i + 1));
    });

    it('returns null for failed images', async () => {
        await load();
        expect(get(sampleKey)).toBeNull();
    });

    it('caches successfully loaded images', async () => {
        globalThis.Image = class {
            set src(val) {
                this._src = val;
                setTimeout(() => this.onload && this.onload(), 0);
            }
            get src() { return this._src; }
        };

        vi.resetModules();
        const fresh = await import('../js/assets.js');
        await fresh[loadFn]();
        const img = fresh[getFn](sampleKey);
        expect(img).not.toBeNull();
        expect(img).toBeInstanceOf(globalThis.Image);

        globalThis.Image = MockImage;
    });
});
