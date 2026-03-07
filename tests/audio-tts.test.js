import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Mock Web Speech API before importing audio.js ──────────────────────────

const mockCancel = vi.fn();
const mockSpeak = vi.fn();
const mockResume = vi.fn();
const mockGetVoices = vi.fn(() => []);

globalThis.window = globalThis;
globalThis.speechSynthesis = {
    cancel: mockCancel,
    speak: mockSpeak,
    resume: mockResume,
    getVoices: mockGetVoices,
    speaking: false,
    pending: false,
};

globalThis.SpeechSynthesisUtterance = class {
    constructor(text) {
        this.text = text;
        this.lang = '';
        this.rate = 1;
        this.pitch = 1;
        this.volume = 1;
        this.voice = null;
        this.onend = null;
        this.onerror = null;
    }
};

// Stub AudioContext (not used by TTS but required for module import)
globalThis.AudioContext = class {
    constructor() { this.state = 'running'; }
    resume() {}
};

const { speak, setSpeechEnabled, initAudio } = await import('../js/audio.js');

// ── Tests ──────────────────────────────────────────────────────────────────

describe('speak (TTS)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        mockGetVoices.mockReturnValue([]);
        setSpeechEnabled(true);
        speechSynthesis.speaking = false;
        speechSynthesis.pending = false;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('does nothing for empty text', () => {
        speak('');
        vi.advanceTimersByTime(100);
        expect(mockSpeak).not.toHaveBeenCalled();
    });

    it('does nothing for null text', () => {
        speak(null);
        vi.advanceTimersByTime(100);
        expect(mockSpeak).not.toHaveBeenCalled();
    });

    it('does nothing when speech is disabled', () => {
        setSpeechEnabled(false);
        speak('שלום');
        vi.advanceTimersByTime(100);
        expect(mockSpeak).not.toHaveBeenCalled();
    });

    it('speaks immediately when nothing is playing', () => {
        speak('שלום');
        // Should call speak() synchronously (no delay)
        expect(mockSpeak).toHaveBeenCalledTimes(1);
        expect(mockSpeak.mock.calls[0][0].text).toBe('שלום');
    });

    it('delays speak after cancel when speech is ongoing', () => {
        speechSynthesis.speaking = true;
        speak('שלום');
        // Should cancel but not speak yet
        expect(mockCancel).toHaveBeenCalledTimes(1);
        expect(mockSpeak).not.toHaveBeenCalled();
        // After delay, should speak
        vi.advanceTimersByTime(50);
        expect(mockSpeak).toHaveBeenCalledTimes(1);
    });

    it('delays speak after cancel when speech is pending', () => {
        speechSynthesis.pending = true;
        speak('שלום');
        expect(mockCancel).toHaveBeenCalledTimes(1);
        expect(mockSpeak).not.toHaveBeenCalled();
        vi.advanceTimersByTime(50);
        expect(mockSpeak).toHaveBeenCalledTimes(1);
    });

    it('sets Hebrew language, kid-friendly rate and pitch', () => {
        speak('שלום');
        const utterance = mockSpeak.mock.calls[0][0];
        expect(utterance.lang).toBe('he-IL');
        expect(utterance.rate).toBe(0.8);
        expect(utterance.pitch).toBe(1.25);
    });

    it('debounces rapid calls when speech is ongoing — only the last text is spoken', () => {
        speechSynthesis.speaking = true;
        speak('ראשון');
        speak('שני');
        speak('שלישי');
        vi.advanceTimersByTime(50);
        expect(mockSpeak).toHaveBeenCalledTimes(1);
        expect(mockSpeak.mock.calls[0][0].text).toBe('שלישי');
    });

    it('uses a Hebrew voice when available', () => {
        mockGetVoices.mockReturnValue([
            { name: 'English US', lang: 'en-US', localService: true },
            { name: 'Hebrew Voice', lang: 'he-IL', localService: true },
        ]);
        speak('שלום');
        const utterance = mockSpeak.mock.calls[0][0];
        expect(utterance.voice.name).toBe('Hebrew Voice');
    });

    it('sets up resume interval that calls resume() while speaking', () => {
        speak('שלום');
        speechSynthesis.speaking = true;
        vi.advanceTimersByTime(5000);
        expect(mockResume).toHaveBeenCalled();
    });

    it('clears resume interval when utterance ends', () => {
        speak('שלום');
        speechSynthesis.speaking = true;

        const utterance = mockSpeak.mock.calls[0][0];
        speechSynthesis.speaking = false;
        utterance.onend();

        mockResume.mockClear();
        vi.advanceTimersByTime(10000);
        expect(mockResume).not.toHaveBeenCalled();
    });

    it('clears resume interval on utterance error', () => {
        speak('שלום');
        speechSynthesis.speaking = true;

        const utterance = mockSpeak.mock.calls[0][0];
        speechSynthesis.speaking = false;
        utterance.onerror();

        mockResume.mockClear();
        vi.advanceTimersByTime(10000);
        expect(mockResume).not.toHaveBeenCalled();
    });
});

describe('initAudio (iOS speech unlock)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('speaks a silent utterance to unlock speechSynthesis on iOS', () => {
        initAudio();
        const silentCall = mockSpeak.mock.calls.find(
            call => call[0].text === '' && call[0].volume === 0
        );
        expect(silentCall).toBeDefined();
    });
});
