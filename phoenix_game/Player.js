class Player {
    constructor() {
        this.width = 100;
        this.height = 100;
        this.x = GAME_WIDTH / 2 - this.width / 2;
        this.y = GAME_HEIGHT - this.height - 50;
        this.bullets = [];
        this.shieldActive = false;
        this.shieldTimer = 0;
        this.shieldCooldownTimer = 0;
        this.shotTimer = 1000; // Ready to shoot immediately
    }

    update(deltaTime) {
        const timeScale = deltaTime / 16.66;

        // Movement
        if (input.isDown('ArrowLeft') && this.x > 0) this.x -= PLAYER_SPEED * timeScale;
        if (input.isDown('ArrowRight') && this.x < GAME_WIDTH - this.width) this.x += PLAYER_SPEED * timeScale;

        // Shooting
        if (this.shotTimer < 1000) {
            this.shotTimer += deltaTime;
        }

        if (input.isDown('Space') && this.shotTimer >= 1000) {
            this.bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y, -1)); // Up, centered-ish
            this.shotTimer = 0;
        }

        // Shield
        if (input.isDown('ControlLeft') || input.isDown('ControlRight')) {
            if (this.shieldCooldownTimer <= 0 && !this.shieldActive) {
                this.shieldActive = true;
                this.shieldTimer = SHIELD_DURATION;
                this.shieldCooldownTimer = SHIELD_COOLDOWN;
            }
        }

        if (this.shieldActive) {
            this.shieldTimer -= deltaTime;
            if (this.shieldTimer <= 0) {
                this.shieldActive = false;
            }
        }

        if (this.shieldCooldownTimer > 0) {
            this.shieldCooldownTimer -= deltaTime;
        }

        // Bullets
        this.bullets.forEach(b => b.update(deltaTime));
        this.bullets = this.bullets.filter(b => !b.markedForDeletion);
    }

    draw(ctx) {
        // Draw Shield
        if (this.shieldActive) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 80, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffff';
            ctx.fill();
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
        }

        ctx.drawImage(playerImage, this.x, this.y, this.width, this.height);

        this.bullets.forEach(b => b.draw(ctx));
    }
}
