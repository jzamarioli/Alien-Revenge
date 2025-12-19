// Sound effects using Web Audio API
class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.alienSoundEnabled = true;
        this.sfxEnabled = true;
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported', e);
            this.enabled = false;
        }
    }

    playLaserSound() {
        if (!this.enabled || !this.sfxEnabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Create oscillator for the laser sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Configure laser sound (descending frequency)
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1);

        // Volume envelope (quick fade out)
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        // Play the sound
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }

    playExplosionSound() {
        if (!this.enabled || !this.sfxEnabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Create noise for explosion
        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Fill with white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        noise.start(now);
        noise.stop(now + 0.3);
    }

    playPlayerDeathSound() {
        if (!this.enabled || !this.sfxEnabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const duration = 2.8; // Dramatic duration

        // 1. Noise Component (The Explosion)
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1500, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(30, now + duration);
        noiseFilter.Q.setValueAtTime(5, now); // Higher resonance for character

        // 2. Rumble Component (The Mechanical Failure)
        const rumble = this.audioContext.createOscillator();
        rumble.type = 'sawtooth';
        rumble.frequency.setValueAtTime(60, now);
        rumble.frequency.exponentialRampToValueAtTime(20, now + duration);

        const rumbleFilter = this.audioContext.createBiquadFilter();
        rumbleFilter.type = 'lowpass';
        rumbleFilter.frequency.setValueAtTime(100, now);

        // 3. Crackle/Amplitude Modulation
        const modulator = this.audioContext.createGain();
        // Fast oscillation for crackle
        for (let i = 0; i < duration * 20; i++) {
            const t = now + (i / 20);
            const val = Math.random() * 0.5 + 0.5; // Modulate between 0.5 and 1.0
            modulator.gain.setValueAtTime(val, t);
        }

        const mainGain = this.audioContext.createGain();
        mainGain.gain.setValueAtTime(0.7, now);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // Connections
        noise.connect(noiseFilter);
        noiseFilter.connect(modulator);

        rumble.connect(rumbleFilter);
        rumbleFilter.connect(modulator);

        modulator.connect(mainGain);
        mainGain.connect(this.audioContext.destination);

        noise.start(now);
        noise.stop(now + duration);
        rumble.start(now);
        rumble.stop(now + duration);
    }

    startShieldSound() {
        if (!this.enabled || !this.sfxEnabled || !this.audioContext) return;
        if (this.shieldOscillator) return; // Already playing

        // Create a higher frequency hum for the shield
        this.shieldOscillator = this.audioContext.createOscillator();
        this.shieldGain = this.audioContext.createGain();

        this.shieldOscillator.type = 'triangle';
        this.shieldOscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);

        this.shieldGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);

        this.shieldOscillator.connect(this.shieldGain);
        this.shieldGain.connect(this.audioContext.destination);

        this.shieldOscillator.start();
    }

    stopShieldSound() {
        if (this.shieldOscillator) {
            this.shieldOscillator.stop();
            this.shieldOscillator = null;
            this.shieldGain = null;
        }
    }

    playAlienMoveSound() {
        if (!this.enabled || !this.audioContext || !this.alienSoundEnabled) return;

        const now = this.audioContext.currentTime;

        // Galaxian-style descending 4-note pattern
        const notes = [
            { freq: 392.00, time: 0.0, duration: 0.08 },   // G4
            { freq: 349.23, time: 0.08, duration: 0.08 },  // F4
            { freq: 329.63, time: 0.16, duration: 0.08 },  // E4
            { freq: 293.66, time: 0.24, duration: 0.18 }   // D4
        ];

        notes.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(note.freq, now + note.time);

            gain.gain.setValueAtTime(0.028, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.start(now + note.time);
            osc.stop(now + note.time + note.duration);
        });
    }

    startAlienMovementSound() {
        if (!this.enabled || !this.audioContext) return;
        if (this.alienSoundInterval) return;

        // Play the alien movement sound every 0.8 seconds
        this.alienSoundInterval = setInterval(() => {
            this.playAlienMoveSound();
        }, 800);
    }

    stopAlienMovementSound() {
        if (this.alienSoundInterval) {
            clearInterval(this.alienSoundInterval);
            this.alienSoundInterval = null;
        }
    }

    playMothershipExplosionSound() {
        if (!this.enabled || !this.sfxEnabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const duration = 1.5; // Longer duration

        // Create a special explosion for mothership (longer and higher pitched)
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Fill with white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        // Higher frequency filter for "higher" sound
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + duration);

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.55, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        noise.start(now);
        noise.stop(now + duration);
    }

    toggleAlienSound() {
        this.alienSoundEnabled = !this.alienSoundEnabled;
        if (!this.alienSoundEnabled) {
            this.stopAlienMovementSound();
        } else {
            this.startAlienMovementSound();
        }
        return this.alienSoundEnabled;
    }

    toggleSfx() {
        this.sfxEnabled = !this.sfxEnabled;
        if (!this.sfxEnabled) {
            this.stopShieldSound();
        }
        return this.sfxEnabled;
    }

    toggleGlobalSound() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopAllSounds();
        } else {
            if (this.alienSoundEnabled) {
                this.startAlienMovementSound();
            }
        }
        return this.enabled;
    }

    stopAllSounds() {
        this.stopAlienMovementSound();
        this.stopShieldSound();
    }

    playShieldCooldownSound() {
        if (!this.enabled || !this.sfxEnabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Play two rapid, high-pitched pulses
        for (let i = 0; i < 2; i++) {
            const startTime = now + (i * 0.1);
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(1200, startTime);

            gainNode.gain.setValueAtTime(0.02, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.05);
        }
    }
}

// Create global sound effects instance
const soundEffects = new SoundEffects();
