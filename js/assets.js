// =============================================================================
// assets.js — Image loader and cache for character sprites
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

const ENEMY_IMAGES = {
    muddleCloud:   'assets/enemies/muddle-cloud.png',
    messMonster:   'assets/enemies/mess-monster.png',
    sleepySnail:   'assets/enemies/sleepy-snail.png',
    gigglyGremlin: 'assets/enemies/giggly-gremlin.png',
    bubbleTrouble: 'assets/enemies/bubble-trouble.png',
    kingChaos:     'assets/enemies/king-chaos.png',
};

const cache = {};

export function getDefenderImage(typeName) {
    return cache[typeName] || null;
}

export function getEnemyImage(typeName) {
    return cache[typeName] || null;
}

function loadImageSet(images, label, onProgress) {
    const entries = Object.entries(images);
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
                console.warn(`Failed to load ${label} image: ${name} (${src})`);
                done();
                resolve();
            };
            img.src = src;
        });
    }));
}

export function loadDefenderImages(onProgress) {
    return loadImageSet(DEFENDER_IMAGES, 'defender', onProgress);
}

export function loadEnemyImages(onProgress) {
    return loadImageSet(ENEMY_IMAGES, 'enemy', onProgress);
}
