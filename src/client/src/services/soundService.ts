// Web Audio API for generating pleasant sounds

const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function playTone(frequency: number, duration: number, type: 'sine' | 'triangle' = 'sine', volume: number = 0.3) {
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
