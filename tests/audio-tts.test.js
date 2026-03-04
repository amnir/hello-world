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
};

globalThis.SpeechSynthesisUtterance = class {
    constructor(text) {
        this.text = text;
        this.lang = '';
        this.rate = 1;
        this.pitch = 1;
        this.voice = null;
        this.onend = null;
        this.onerror = null;
    }
};

// Stub AudioContext (not used by TTS but required for module import)
globalThis.AudioContext = class {};

const { speak, setSpeechEnabled } = await import('../js/audio.js');

// ── Tests ──────────────────────────────────────────────────────────────────

describe('speak (TTS)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        mockGetVoices.mockReturnValue([]);
        setSpeechEnabled(true);
        speechSynthesis.speaking = false;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('does nothing for empty text', () => {
        speak('');
        vi.advanceTimersByTime(100);
        expect(mockCancel).not.toHaveBeenCalled();
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

    it('calls cancel() immediately', () => {
        speak('שלום');
        expect(mockCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call speechSynthesis.speak() synchronously (delay after cancel)', () => {
        speak('שלום');
        expect(mockSpeak).not.toHaveBeenCalled();
    });

    it('calls speechSynthesis.speak() after the delay', () => {
        speak('שלום');
        vi.advanceTimersByTime(50);
        expect(mockSpeak).toHaveBeenCalledTimes(1);
    });

    it('sets Hebrew language, kid-friendly rate and pitch', () => {
        speak('שלום');
        vi.advanceTimersByTime(50);
        const utterance = mockSpeak.mock.calls[0][0];
        expect(utterance.lang).toBe('he-IL');
        expect(utterance.rate).toBe(0.8);
        expect(utterance.pitch).toBe(1.25);
    });

    it('debounces rapid calls — only the last text is spoken', () => {
        speak('ראשון');
        speak('שני');
        speak('שלישי');
        vi.advanceTimersByTime(50);
        expect(mockSpeak).toHaveBeenCalledTimes(1);
        expect(mockSpeak.mock.calls[0][0].text).toBe('שלישי');
    });

    it('calls cancel() for every rapid call', () => {
        speak('ראשון');
        speak('שני');
        speak('שלישי');
        expect(mockCancel).toHaveBeenCalledTimes(3);
    });

    it('uses a Hebrew voice when available', () => {
        mockGetVoices.mockReturnValue([
            { name: 'English US', lang: 'en-US', localService: true },
            { name: 'Hebrew Voice', lang: 'he-IL', localService: true },
        ]);
        speak('שלום');
        vi.advanceTimersByTime(50);
        const utterance = mockSpeak.mock.calls[0][0];
        expect(utterance.voice.name).toBe('Hebrew Voice');
    });

    it('sets up resume interval that calls resume() while speaking', () => {
        speechSynthesis.speaking = true;
        speak('שלום');
        vi.advanceTimersByTime(50);   // trigger speak
        vi.advanceTimersByTime(5000); // trigger first resume interval
        expect(mockResume).toHaveBeenCalled();
    });

    it('clears resume interval when utterance ends', () => {
        speechSynthesis.speaking = true;
        speak('שלום');
        vi.advanceTimersByTime(50);

        // Simulate utterance finishing
        const utterance = mockSpeak.mock.calls[0][0];
        speechSynthesis.speaking = false;
        utterance.onend();

        mockResume.mockClear();
        vi.advanceTimersByTime(10000);
        expect(mockResume).not.toHaveBeenCalled();
    });

    it('clears resume interval on utterance error', () => {
        speechSynthesis.speaking = true;
        speak('שלום');
        vi.advanceTimersByTime(50);

        const utterance = mockSpeak.mock.calls[0][0];
        speechSynthesis.speaking = false;
        utterance.onerror();

        mockResume.mockClear();
        vi.advanceTimersByTime(10000);
        expect(mockResume).not.toHaveBeenCalled();
    });
});
