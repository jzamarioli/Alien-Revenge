// Sound effects using Web Audio API
class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
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

        // Create a low hum for the shield
        this.shieldOscillator = this.audioContext.createOscillator();
        this.shieldGain = this.audioContext.createGain();

        this.shieldOscillator.type = 'sine';
        this.shieldOscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);

        this.shieldGain.gain.setValueAtTime(0.15, this.audioContext.currentTime);

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

    startBackgroundMusic() {
        if (!this.enabled || !this.audioContext) return;
        if (this.musicPlaying) return;

        this.musicPlaying = true;
        this.playMusicLoop();
    }

    playMusicLoop() {
        if (!this.musicPlaying || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const notes = [
            { freq: 261.63, time: 0.0, duration: 0.2 },    // C4
            { freq: 329.63, time: 0.2, duration: 0.2 },    // E4
            { freq: 392.00, time: 0.4, duration: 0.2 },    // G4
            { freq: 329.63, time: 0.6, duration: 0.2 },    // E4
            { freq: 261.63, time: 0.8, duration: 0.2 },    // C4
            { freq: 293.66, time: 1.0, duration: 0.2 },    // D4
            { freq: 349.23, time: 1.2, duration: 0.2 },    // F4
            { freq: 293.66, time: 1.4, duration: 0.4 }     // D4
        ];

        notes.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(note.freq, now + note.time);

            gain.gain.setValueAtTime(0.08, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.start(now + note.time);
            osc.stop(now + note.time + note.duration);
        });

        // Loop the music
        setTimeout(() => this.playMusicLoop(), 1800);
    }

    stopBackgroundMusic() {
        this.musicPlaying = false;
    }
}

// Create global sound effects instance
const soundEffects = new SoundEffects();
