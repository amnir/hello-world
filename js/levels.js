// =============================================================================
// levels.js — Level definitions and progression
// Each level defines: available defenders, wave composition, challenge types
// =============================================================================

// ─── Defender Definitions ───────────────────────────────────────────────────

export const DEFENDER_DEFS = {
    starMaker: {
        id: 'starMaker',
        name: 'יוצר הכוכבים',
        cost: 0,  // First one is free — generates currency
        hp: 100,
        cooldown: 5,         // seconds between star generation
        projectileType: null, // doesn't shoot
        damage: 0,
        range: 0,
        isGenerator: true,
        challengeType: 'counting',
    },
    numberBuddy: {
        id: 'numberBuddy',
        name: 'חבר המספרים',
        cost: 2,
        hp: 80,
        cooldown: 2.0,
        projectileType: 'number',
        damage: 15,
        range: 600,
        isGenerator: false,
        challengeType: 'counting',
    },
    letterLion: {
        id: 'letterLion',
        name: 'אריה האותיות',
        cost: 3,
        hp: 100,
        cooldown: 1.8,
        projectileType: 'letter',
        damage: 20,
        range: 500,
        isGenerator: false,
        challengeType: 'letters',
    },
    colorFlower: {
        id: 'colorFlower',
        name: 'פרח הצבעים',
        cost: 2,
        hp: 60,
        cooldown: 1.5,
        projectileType: 'color',
        damage: 12,
        range: 550,
        isGenerator: false,
        challengeType: 'colors',
    },
    shapeShield: {
        id: 'shapeShield',
        name: 'מגן הצורות',
        cost: 4,
        hp: 300,
        cooldown: 0,
        projectileType: null,  // doesn't shoot, is a wall
        damage: 0,
        range: 0,
        isGenerator: false,
        isWall: true,
        challengeType: 'shapes',
    },
    patternPeacock: {
        id: 'patternPeacock',
        name: 'טווס הדפוסים',
        cost: 3,
        hp: 80,
        cooldown: 2.5,
        projectileType: 'pattern',
        damage: 10,
        range: 450,
        isGenerator: false,
        slowAmount: 0.5, // slows enemies to 50% speed
        challengeType: 'patterns',
    },
    musicBird: {
        id: 'musicBird',
        name: 'ציפור המוזיקה',
        cost: 3,
        hp: 70,
        cooldown: 3.0,
        projectileType: 'music',
        damage: 8,
        range: 700,     // hits all in lane
        isGenerator: false,
        hitsAll: true,  // damage all enemies in lane
        challengeType: 'counting',
    },
};

// ─── Enemy Definitions ──────────────────────────────────────────────────────

export const ENEMY_DEFS = {
    muddleCloud: {
        id: 'muddleCloud',
        name: 'ענן הבלבול',
        hp: 50,
        speed: 25,       // pixels per second
        damage: 10,      // damage to defenders per second
        points: 1,
    },
    messMonster: {
        id: 'messMonster',
        name: 'מפלצת הבלגן',
        hp: 100,
        speed: 20,
        damage: 15,
        points: 2,
    },
    sleepySnail: {
        id: 'sleepySnail',
        name: 'חילזון הישנוני',
        hp: 200,
        speed: 12,
        damage: 8,
        points: 3,
    },
    gigglyGremlin: {
        id: 'gigglyGremlin',
        name: 'שדון הצחקוקים',
        hp: 30,
        speed: 50,
        damage: 12,
        points: 1,
    },
    bubbleTrouble: {
        id: 'bubbleTrouble',
        name: 'בועות הצרות',
        hp: 80,
        speed: 30,
        damage: 12,
        points: 2,
        floats: true,    // skips first defender
    },
    kingChaos: {
        id: 'kingChaos',
        name: 'מלך הבלגן',
        hp: 500,
        speed: 15,
        damage: 25,
        points: 10,
        isBoss: true,
        spawnsOnDamage: 'gigglyGremlin', // spawns gremlins when damaged
    },
};

// ─── Level Definitions ──────────────────────────────────────────────────────

export const LEVELS = [
    // ── Level 1: Introduction ──
    {
        id: 1,
        name: 'הגינה שלנו',  // Our Garden
        availableDefenders: ['starMaker', 'numberBuddy'],
        challengeTypes: ['counting'],
        startingStars: 4,
        waves: [
            { enemies: [{ type: 'muddleCloud', lane: 1, delay: 0 }] },
            { enemies: [
                { type: 'muddleCloud', lane: 0, delay: 0 },
                { type: 'muddleCloud', lane: 2, delay: 4 },
            ]},
            { enemies: [
                { type: 'muddleCloud', lane: 0, delay: 0 },
                { type: 'muddleCloud', lane: 1, delay: 3 },
                { type: 'muddleCloud', lane: 2, delay: 6 },
            ]},
        ],
        stickerReward: 'star',
    },
    // ── Level 2: Colors ──
    {
        id: 2,
        name: 'עולם הצבעים',  // World of Colors
        availableDefenders: ['starMaker', 'numberBuddy', 'colorFlower'],
        challengeTypes: ['counting', 'colors'],
        startingStars: 5,
        waves: [
            { enemies: [
                { type: 'muddleCloud', lane: 0, delay: 0 },
                { type: 'muddleCloud', lane: 1, delay: 3 },
            ]},
            { enemies: [
                { type: 'muddleCloud', lane: 0, delay: 0 },
                { type: 'muddleCloud', lane: 1, delay: 3 },
                { type: 'muddleCloud', lane: 2, delay: 6 },
            ]},
            { enemies: [
                { type: 'messMonster', lane: 1, delay: 0 },
                { type: 'muddleCloud', lane: 0, delay: 3 },
                { type: 'muddleCloud', lane: 2, delay: 5 },
            ]},
        ],
        stickerReward: 'flower',
    },
    // ── Level 3: Letters ──
    {
        id: 3,
        name: 'אותיות קסומות',  // Magic Letters
        availableDefenders: ['starMaker', 'numberBuddy', 'colorFlower', 'letterLion'],
        challengeTypes: ['counting', 'colors', 'letters'],
        startingStars: 5,
        waves: [
            { enemies: [
                { type: 'muddleCloud', lane: 0, delay: 0 },
                { type: 'muddleCloud', lane: 2, delay: 3 },
            ]},
            { enemies: [
                { type: 'messMonster', lane: 1, delay: 0 },
                { type: 'muddleCloud', lane: 0, delay: 3 },
            ]},
            { enemies: [
                { type: 'messMonster', lane: 0, delay: 0 },
                { type: 'muddleCloud', lane: 1, delay: 3 },
                { type: 'messMonster', lane: 2, delay: 5 },
            ]},
            { enemies: [
                { type: 'muddleCloud', lane: 0, delay: 0 },
                { type: 'muddleCloud', lane: 1, delay: 2 },
                { type: 'muddleCloud', lane: 2, delay: 4 },
                { type: 'messMonster', lane: 1, delay: 6 },
            ]},
        ],
        stickerReward: 'heart',
    },
    // ── Level 4: Shapes ──
    {
        id: 4,
        name: 'ממלכת הצורות',  // Kingdom of Shapes
        availableDefenders: ['starMaker', 'numberBuddy', 'colorFlower', 'letterLion', 'shapeShield'],
        challengeTypes: ['counting', 'colors', 'letters', 'shapes'],
        startingStars: 6,
        waves: [
            { enemies: [
                { type: 'muddleCloud', lane: 0, delay: 0 },
                { type: 'muddleCloud', lane: 1, delay: 2.5 },
                { type: 'muddleCloud', lane: 2, delay: 5 },
            ]},
            { enemies: [
                { type: 'sleepySnail', lane: 1, delay: 0 },
                { type: 'muddleCloud', lane: 0, delay: 4 },
                { type: 'muddleCloud', lane: 2, delay: 6 },
            ]},
            { enemies: [
                { type: 'messMonster', lane: 0, delay: 0 },
                { type: 'messMonster', lane: 2, delay: 3 },
                { type: 'sleepySnail', lane: 1, delay: 5 },
            ]},
            { enemies: [
                { type: 'muddleCloud', lane: 0, delay: 0 },
                { type: 'muddleCloud', lane: 1, delay: 2 },
                { type: 'muddleCloud', lane: 2, delay: 4 },
                { type: 'messMonster', lane: 0, delay: 6 },
                { type: 'messMonster', lane: 2, delay: 8 },
            ]},
        ],
        stickerReward: 'check',
    },
    // ── Level 5: Patterns (Boss!) ──
    {
        id: 5,
        name: 'מלך הבלגן',  // King Chaos
        availableDefenders: ['starMaker', 'numberBuddy', 'colorFlower', 'letterLion', 'shapeShield', 'patternPeacock'],
        challengeTypes: ['counting', 'colors', 'letters', 'shapes', 'patterns'],
        startingStars: 7,
        waves: [
            { enemies: [
                { type: 'muddleCloud', lane: 0, delay: 0 },
                { type: 'muddleCloud', lane: 1, delay: 2.5 },
                { type: 'muddleCloud', lane: 2, delay: 5 },
            ]},
            { enemies: [
                { type: 'messMonster', lane: 0, delay: 0 },
                { type: 'sleepySnail', lane: 1, delay: 3 },
                { type: 'messMonster', lane: 2, delay: 5 },
            ]},
            { enemies: [
                { type: 'gigglyGremlin', lane: 0, delay: 0 },
                { type: 'gigglyGremlin', lane: 1, delay: 1.5 },
                { type: 'gigglyGremlin', lane: 2, delay: 3 },
                { type: 'gigglyGremlin', lane: 0, delay: 5 },
                { type: 'gigglyGremlin', lane: 2, delay: 6.5 },
            ]},
            { enemies: [
                { type: 'messMonster', lane: 0, delay: 0 },
                { type: 'messMonster', lane: 2, delay: 3 },
                { type: 'bubbleTrouble', lane: 1, delay: 5 },
            ]},
            { enemies: [
                { type: 'kingChaos', lane: 1, delay: 0 },
                { type: 'muddleCloud', lane: 0, delay: 4 },
                { type: 'muddleCloud', lane: 2, delay: 6 },
            ]},
        ],
        stickerReward: 'crown',
    },
    // ── Level 6: Music ──
    {
        id: 6,
        name: 'קונצרט בגינה',  // Concert in the Garden
        availableDefenders: ['starMaker', 'numberBuddy', 'colorFlower', 'letterLion', 'shapeShield', 'patternPeacock', 'musicBird'],
        challengeTypes: ['counting', 'colors', 'letters', 'shapes', 'patterns'],
        startingStars: 6,
        waves: [
            { enemies: [
                { type: 'muddleCloud', lane: 0, delay: 0 },
                { type: 'messMonster', lane: 1, delay: 3 },
                { type: 'muddleCloud', lane: 2, delay: 5 },
            ]},
            { enemies: [
                { type: 'gigglyGremlin', lane: 0, delay: 0 },
                { type: 'gigglyGremlin', lane: 0, delay: 2 },
                { type: 'gigglyGremlin', lane: 1, delay: 4 },
                { type: 'gigglyGremlin', lane: 1, delay: 6 },
                { type: 'gigglyGremlin', lane: 2, delay: 8 },
                { type: 'gigglyGremlin', lane: 2, delay: 10 },
            ]},
            { enemies: [
                { type: 'sleepySnail', lane: 0, delay: 0 },
                { type: 'sleepySnail', lane: 2, delay: 3 },
                { type: 'bubbleTrouble', lane: 1, delay: 6 },
            ]},
            { enemies: [
                { type: 'messMonster', lane: 0, delay: 0 },
                { type: 'messMonster', lane: 1, delay: 2.5 },
                { type: 'messMonster', lane: 2, delay: 5 },
                { type: 'bubbleTrouble', lane: 0, delay: 7 },
                { type: 'bubbleTrouble', lane: 2, delay: 9 },
            ]},
            { enemies: [
                { type: 'kingChaos', lane: 1, delay: 0 },
                { type: 'messMonster', lane: 0, delay: 4 },
                { type: 'messMonster', lane: 2, delay: 6 },
                { type: 'gigglyGremlin', lane: 0, delay: 8 },
                { type: 'gigglyGremlin', lane: 1, delay: 9.5 },
                { type: 'gigglyGremlin', lane: 2, delay: 11 },
            ]},
        ],
        stickerReward: 'flower',
    },
];
