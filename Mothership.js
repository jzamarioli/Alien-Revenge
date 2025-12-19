class Mothership {
    constructor() {
        this.width = 128;
        this.height = 64;
        this.x = GAME_WIDTH; // Start off-screen right
        this.y = 38; // Near the top, moved 2% higher to avoid overlap
        this.image = images['mothership'];
        this.markedForDeletion = false;
        this.speed = MOTHERSHIP_SPEED + (gameState.round);
    }

    update(deltaTime) {
        // Normalize speed based on frame time (60fps baseline)
        const timeScale = deltaTime / 16.66;

        // Move left
        this.x -= this.speed * timeScale;

        // Remove if off-screen left
        if (this.x + this.width < 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        if (this.image) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Fallback
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
