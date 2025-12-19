class Bullet {
    constructor(x, y, direction, isEnemy = false) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.direction = direction; // -1 up, 1 down
        this.isEnemy = isEnemy;
        this.markedForDeletion = false;
        this.speed = isEnemy ? ALIEN_BULLET_SPEED : BULLET_SPEED;
    }

    update(deltaTime) {
        const timeScale = deltaTime / 16.66;
        this.y += this.speed * this.direction * timeScale;
        if (this.y < 0 || this.y > GAME_HEIGHT) this.markedForDeletion = true;
    }

    draw(ctx) {
        ctx.save();
        if (this.isEnemy) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#ff00ff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff00ff';
            ctx.fill();
        } else {
            // Player bullet: White Rectangular
            ctx.fillStyle = '#ffffff';
            // ctx.shadowBlur = 0; // Not needed with save/restore
            ctx.fillRect(this.x - 2, this.y - 10, 4, 20);
        }
        ctx.restore();
    }
}
