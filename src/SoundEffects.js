// Sound effects using Web Audio API
class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.alienSoundEnabled = true; // Can be toggled by player
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
        if (!this.enabled || !this.audioContext) return;

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
        if (!this.enabled || !this.audioContext) return;

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
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Create a longer, more dramatic explosion for player death
        const bufferSize = this.audioContext.sampleRate * 0.8;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Fill with white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        // Lower frequency filter for deeper sound
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.8);

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.6, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        noise.start(now);
        noise.stop(now + 0.8);
    }

    startShieldSound() {
        if (!this.enabled || !this.audioContext) return;
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
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Create a special explosion for mothership (longer and deeper)
        const bufferSize = this.audioContext.sampleRate * 0.6;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Fill with white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        // Lower frequency filter for special sound
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, now);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.6);

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.55, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        noise.start(now);
        noise.stop(now + 0.6);
    }

    toggleAlienSound() {
        this.alienSoundEnabled = !this.alienSoundEnabled;
        return this.alienSoundEnabled;
    }
}

// Create global sound effects instance
const soundEffects = new SoundEffects();
