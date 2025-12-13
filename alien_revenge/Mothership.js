class Mothership {
    constructor() {
        this.width = 128;
        this.height = 64;
        this.x = GAME_WIDTH; // Start off-screen right
        this.y = 60; // Near the top
        this.image = images['mothership'];
        this.markedForDeletion = false;
        this.speed = MOTHERSHIP_SPEED * (1 + (gameState.round - 1) * 0.1);
    }

    update(deltaTime) {
        // Move left
        this.x -= this.speed;

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
