// =============================================================================
// assets.js — Image loader and cache for defender sprites
// =============================================================================

const DEFENDER_IMAGES = {
    numberBuddy:    'assets/defenders/number-buddy.png',
    letterLion:     'assets/defenders/letter-lion.png',
    colorFlower:    'assets/defenders/color-flower.png',
    shapeShield:    'assets/defenders/shape-shield.png',
    starMaker:      'assets/defenders/star-maker.png',
    patternPeacock: 'assets/defenders/pattern-peacock.png',
    musicBird:      'assets/defenders/music-bird.png',
};

const cache = {};

export function getDefenderImage(typeName) {
    return cache[typeName] || null;
}

export function loadDefenderImages(onProgress) {
    const entries = Object.entries(DEFENDER_IMAGES);
    let loaded = 0;

    function done() {
        loaded++;
        if (onProgress) onProgress(loaded, entries.length);
    }

    return Promise.all(entries.map(([name, src]) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                cache[name] = img;
                done();
                resolve();
            };
            img.onerror = () => {
                console.warn(`Failed to load defender image: ${name} (${src})`);
                done();
                resolve();
            };
            img.src = src;
        });
    }));
}
