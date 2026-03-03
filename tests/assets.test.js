import { describe, it, expect, beforeEach, vi } from 'vitest';

// Stub Image before importing assets.js
class MockImage {
    set src(val) {
        this._src = val;
        // Simulate async onerror (no real network in node)
        setTimeout(() => this.onerror && this.onerror(), 0);
    }
    get src() { return this._src; }
}
globalThis.Image = MockImage;

const { getDefenderImage, loadDefenderImages } = await import('../js/assets.js');

describe('getDefenderImage', () => {
    it('returns null for unknown type', () => {
        expect(getDefenderImage('nonExistent')).toBeNull();
    });
});

describe('loadDefenderImages', () => {
    it('resolves even when all images fail to load', async () => {
        await expect(loadDefenderImages()).resolves.not.toThrow();
    });

    it('calls onProgress for each image', async () => {
        const calls = [];
        await loadDefenderImages((loaded, total) => calls.push({ loaded, total }));

        expect(calls.length).toBe(7);
        expect(calls[0].total).toBe(7);
        expect(calls[calls.length - 1].loaded).toBe(7);
        calls.forEach((c, i) => expect(c.loaded).toBe(i + 1));
    });

    it('returns null for failed images', async () => {
        await loadDefenderImages();
        expect(getDefenderImage('numberBuddy')).toBeNull();
    });

    it('caches successfully loaded images', async () => {
        // Override Image to simulate successful load
        globalThis.Image = class {
            set src(val) {
                this._src = val;
                setTimeout(() => this.onload && this.onload(), 0);
            }
            get src() { return this._src; }
        };

        // Re-import to get fresh module with reset cache
        vi.resetModules();
        const fresh = await import('../js/assets.js');
        await fresh.loadDefenderImages();
        const img = fresh.getDefenderImage('numberBuddy');
        expect(img).not.toBeNull();
        expect(img).toBeInstanceOf(globalThis.Image);

        // Restore onerror stub
        globalThis.Image = MockImage;
    });
});
