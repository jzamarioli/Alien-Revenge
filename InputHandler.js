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
                } else if (e.code === 'KeyM') {
                    // Toggle music (alien movement sound)
                    if (typeof soundEffects !== 'undefined') {
                        const enabled = soundEffects.toggleAlienSound();
                        const statusDiv = document.getElementById('sound-status');
                        if (statusDiv) {
                            statusDiv.textContent = `Music: ${enabled ? 'ON' : 'OFF'}`;
                            statusDiv.classList.remove('hidden');
                            setTimeout(() => {
                                statusDiv.classList.add('hidden');
                            }, 2000);
                        }
                    }
                } else if (e.code === 'KeyE') {
                    // Toggle SFX
                    if (typeof soundEffects !== 'undefined') {
                        const enabled = soundEffects.toggleSfx();
                        const statusDiv = document.getElementById('sound-status');
                        if (statusDiv) {
                            statusDiv.textContent = `Sound effects: ${enabled ? 'ON' : 'OFF'}`;
                            statusDiv.classList.remove('hidden');
                            setTimeout(() => {
                                statusDiv.classList.add('hidden');
                            }, 2000);
                        }
                    }
                } else if (e.code === 'KeyS') {
                    // Toggle All Sound
                    if (typeof soundEffects !== 'undefined') {
                        const enabled = soundEffects.toggleGlobalSound();
                        const statusDiv = document.getElementById('sound-status');
                        if (statusDiv) {
                            statusDiv.textContent = `Master sound: ${enabled ? 'ON' : 'OFF'}`;
                            statusDiv.classList.remove('hidden');
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
