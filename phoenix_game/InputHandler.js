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
