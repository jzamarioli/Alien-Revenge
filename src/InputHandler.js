class InputHandler {
    constructor() {
        this.keys = {};
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Only toggle if Playing or Paused
            if (gameState.state === 'PLAYING' || gameState.state === 'PAUSED') {
                if (e.code === 'Escape') {
                    togglePause('quit');
                } else if (e.code === 'KeyP') {
                    togglePause('pause');
                } else if (e.code === 'KeyS') {
                    // Toggle alien movement sound
                    if (typeof soundEffects !== 'undefined') {
                        const enabled = soundEffects.toggleAlienSound();
                        const statusDiv = document.getElementById('sound-status');
                        if (statusDiv) {
                            statusDiv.textContent = `Sound: ${enabled ? 'ON' : 'OFF'}`;
                            statusDiv.classList.remove('hidden');
                            // Auto-hide after 2 seconds
                            setTimeout(() => {
                                statusDiv.classList.add('hidden');
                            }, 2000);
                        }
                    }
                }
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    isDown(code) {
        return this.keys[code] === true;
    }
}

// Global instance for easy access, or could be passed to entities
window.input = new InputHandler();
