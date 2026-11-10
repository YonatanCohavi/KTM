// Web Audio API for generating pleasant sounds

const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function isMuted() {
    return localStorage.getItem("soundMuted") === "true";
}

function playTone(frequency: number, duration: number, type: 'sine' | 'triangle' = 'sine', volume: number = 0.3) {
    if (!audioContext || isMuted()) return;
    if (audioContext.state !== 'running') {
        void audioContext.resume().then(() => {
            if (!isMuted()) scheduleTone(frequency, duration, type, volume);
        }).catch(() => undefined);
        return;
    }

    scheduleTone(frequency, duration, type, volume);
}

function scheduleTone(frequency: number, duration: number, type: 'sine' | 'triangle', volume: number) {
    if (!audioContext) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.value = frequency;
    osc.type = type;

    // Fade in
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);

    // Fade out
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + duration);
}

export const soundService = {
    unlock: () => {
        if (audioContext && audioContext.state !== 'running') {
            void audioContext.resume().catch(() => undefined);
        }
    },

    // Gentle descending cue when leaving a game session
    stop: () => {
        playTone(494, 0.12, 'sine', 0.18);
        setTimeout(() => playTone(370, 0.18, 'sine', 0.18), 90);
    },

    // Soft countdown beeps, followed by a brighter two-tone start cue
    countdown: (isFinal = false) => {
        if (isFinal) {
            playTone(1175, 0.24, 'sine', 0.34)
            return;
        }
        playTone(659, 0.11, 'sine', 0.16);
    },

    // Correct answer - pleasant ascending tones
    correct: () => {
        playTone(523, 0.1, 'sine', 0.25);  // C5
        setTimeout(() => playTone(659, 0.15, 'sine', 0.25), 100);  // E5
        setTimeout(() => playTone(784, 0.2, 'sine', 0.25), 150);   // G5
    },

    // Wrong answer - descending tone
    wrong: () => {
        playTone(400, 0.1, 'sine', 0.25);  // G3
        setTimeout(() => playTone(300, 0.2, 'sine', 0.25), 100);   // F3
    },

    // Level up - triumphant burst
    levelup: () => {
        playTone(523, 0.08, 'sine', 0.3);   // C5
        setTimeout(() => playTone(659, 0.08, 'sine', 0.3), 80);    // E5
        setTimeout(() => playTone(784, 0.08, 'sine', 0.3), 160);   // G5
        setTimeout(() => playTone(1047, 0.15, 'sine', 0.3), 240);  // C6
    },

    // Streak milestone - celebratory
    streak: () => {
        playTone(659, 0.1, 'sine', 0.25);  // E5
        setTimeout(() => playTone(784, 0.1, 'sine', 0.25), 80);    // G5
        setTimeout(() => playTone(659, 0.1, 'sine', 0.25), 160);   // E5
        setTimeout(() => playTone(1047, 0.15, 'sine', 0.25), 240); // C6
    },

    // Gentle notification
    notify: () => {
        playTone(587, 0.15, 'triangle', 0.2);  // D5
    },
};
