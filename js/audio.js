// =============================================================================
// audio.js — Sound system using Web Audio API (no audio files needed)
// All sounds are synthesized: cheerful beeps, pops, and simple melodies
// =============================================================================

let audioCtx = null;

function getCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

/** Ensure audio context is resumed (must be called from user gesture) */
export function initAudio() {
    const ctx = getCtx();
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
}

// ─── Basic Sound Generators ─────────────────────────────────────────────────

function playTone(freq, duration, type = 'sine', volume = 0.15, delay = 0) {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
}

function playNoise(duration, volume = 0.05, delay = 0) {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3000;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(ctx.currentTime + delay);
}

// ─── Game Sound Effects ─────────────────────────────────────────────────────

/** Cheerful "correct answer" jingle */
export function playCorrect() {
    playTone(523, 0.12, 'sine', 0.15, 0);     // C5
    playTone(659, 0.12, 'sine', 0.15, 0.1);   // E5
    playTone(784, 0.2, 'sine', 0.15, 0.2);    // G5
    playTone(1047, 0.3, 'sine', 0.12, 0.3);   // C6
}

/** Gentle "try again" sound (not harsh) */
export function playWrong() {
    playTone(330, 0.2, 'sine', 0.1, 0);       // E4
    playTone(294, 0.3, 'sine', 0.1, 0.15);    // D4
}

/** Star collected pop */
export function playStarCollect() {
    playTone(880, 0.08, 'sine', 0.12, 0);
    playTone(1100, 0.12, 'sine', 0.12, 0.06);
    playNoise(0.05, 0.03, 0);
}

/** Defender placed sound */
export function playPlace() {
    playTone(440, 0.08, 'triangle', 0.12, 0);
    playTone(554, 0.1, 'triangle', 0.12, 0.06);
    playNoise(0.08, 0.02, 0);
}

/** Projectile fired */
export function playShoot() {
    playTone(600, 0.06, 'square', 0.05, 0);
    playTone(800, 0.04, 'square', 0.04, 0.03);
}

/** Enemy hit */
export function playHit() {
    playTone(200, 0.1, 'square', 0.08, 0);
    playNoise(0.08, 0.04, 0);
}

/** Enemy defeated (pop!) */
export function playPop() {
    playTone(400, 0.05, 'sine', 0.1, 0);
    playTone(600, 0.05, 'sine', 0.08, 0.03);
    playTone(800, 0.08, 'sine', 0.06, 0.06);
    playNoise(0.1, 0.05, 0);
}

/** Button click */
export function playClick() {
    playTone(660, 0.06, 'sine', 0.1, 0);
}

/** Level complete celebration */
export function playCelebration() {
    const notes = [523, 587, 659, 784, 880, 1047];
    notes.forEach((freq, i) => {
        playTone(freq, 0.15, 'sine', 0.12, i * 0.1);
        playTone(freq * 1.5, 0.15, 'sine', 0.06, i * 0.1);
    });
}

/** Wave starting warning */
export function playWaveStart() {
    playTone(440, 0.2, 'triangle', 0.1, 0);
    playTone(440, 0.2, 'triangle', 0.1, 0.25);
    playTone(554, 0.3, 'triangle', 0.12, 0.5);
}

/** Game over (gentle) */
export function playGameOver() {
    playTone(392, 0.3, 'sine', 0.1, 0);
    playTone(349, 0.3, 'sine', 0.1, 0.25);
    playTone(330, 0.3, 'sine', 0.1, 0.5);
    playTone(294, 0.5, 'sine', 0.1, 0.75);
}

// ─── Background Music ───────────────────────────────────────────────────────

let bgMusicInterval = null;
let bgMusicPlaying = false;

const MELODY = [
    // Simple cheerful loopable melody
    { freq: 523, dur: 0.2 },  // C
    { freq: 587, dur: 0.2 },  // D
    { freq: 659, dur: 0.2 },  // E
    { freq: 523, dur: 0.2 },  // C
    { freq: 659, dur: 0.2 },  // E
    { freq: 698, dur: 0.2 },  // F
    { freq: 784, dur: 0.4 },  // G
    { freq: 0, dur: 0.2 },    // rest
    { freq: 784, dur: 0.2 },  // G
    { freq: 698, dur: 0.2 },  // F
    { freq: 659, dur: 0.2 },  // E
    { freq: 523, dur: 0.2 },  // C
    { freq: 587, dur: 0.2 },  // D
    { freq: 523, dur: 0.4 },  // C
    { freq: 0, dur: 0.4 },    // rest
];

export function startBgMusic() {
    if (bgMusicPlaying) return;
    bgMusicPlaying = true;

    let noteIndex = 0;
    let nextNoteTime = 0;

    function scheduleNotes() {
        if (!bgMusicPlaying) return;

        const note = MELODY[noteIndex % MELODY.length];
        if (note.freq > 0) {
            playTone(note.freq, note.dur * 0.8, 'sine', 0.04, 0);
            // Harmony
            playTone(note.freq * 0.5, note.dur * 0.8, 'sine', 0.02, 0);
        }

        noteIndex++;
        nextNoteTime = note.dur * 1000;
        bgMusicInterval = setTimeout(scheduleNotes, nextNoteTime);
    }

    scheduleNotes();
}

export function stopBgMusic() {
    bgMusicPlaying = false;
    if (bgMusicInterval) {
        clearTimeout(bgMusicInterval);
        bgMusicInterval = null;
    }
}

// ─── Speech Synthesis (Text-to-Speech) ─────────────────────────────────────

/** Speak a Hebrew text aloud using the Web Speech API */
export function speak(text) {
    if (!text || !window.speechSynthesis) return;

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.rate = 0.85;   // slightly slower for kids
    utterance.pitch = 1.1;   // slightly higher pitch for friendly tone

    // Try to find a Hebrew voice
    const voices = window.speechSynthesis.getVoices();
    const hebrewVoice = voices.find(v => v.lang.startsWith('he'));
    if (hebrewVoice) {
        utterance.voice = hebrewVoice;
    }

    window.speechSynthesis.speak(utterance);
}
