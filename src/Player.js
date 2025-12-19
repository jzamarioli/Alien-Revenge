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
        this.isRespawning = false;
        this.respawnTimer = 0;
        this.isReappearing = false;
        this.reappearTimer = 0;
        this.cooldownFeedbackTimer = 0;
    }

    update(deltaTime) {
        if (this.isRespawning) {
            this.respawnTimer -= deltaTime;
            if (this.respawnTimer <= 0) {
                this.isRespawning = false;
                this.isReappearing = true;
                this.reappearTimer = 1000; // 1 second fade in
                this.x = GAME_WIDTH / 2 - this.width / 2;
                this.y = GAME_HEIGHT - this.height - 50;
            } else {
                return; // Don't allow movement or shooting while completely invisible (waiting)
            }
        }

        if (this.isReappearing) {
            this.reappearTimer -= deltaTime;
            if (this.reappearTimer <= 0) {
                this.isReappearing = false;
            }
        }

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
            // Play laser sound effect
            if (typeof soundEffects !== 'undefined') {
                soundEffects.playLaserSound();
            }
        }

        if (input.isDown('ControlLeft') || input.isDown('ControlRight')) {
            if (this.shieldCooldownTimer <= 0 && !this.shieldActive) {
                this.shieldActive = true;
                this.shieldTimer = SHIELD_DURATION;
                this.shieldCooldownTimer = SHIELD_COOLDOWN;
                // Start shield sound
                if (typeof soundEffects !== 'undefined') {
                    soundEffects.startShieldSound();
                }
            } else if (this.shieldCooldownTimer > 0 && !this.shieldActive) {
                // Feedback for trying to use shield during cooldown
                this.cooldownFeedbackTimer = 100;
                if (typeof soundEffects !== 'undefined') {
                    soundEffects.playShieldCooldownSound();
                }
            }
        }

        if (this.cooldownFeedbackTimer > 0) {
            this.cooldownFeedbackTimer -= deltaTime;
        }

        if (this.shieldActive) {
            this.shieldTimer -= deltaTime;
            if (this.shieldTimer <= 0) {
                this.shieldActive = false;
                // Stop shield sound
                if (typeof soundEffects !== 'undefined') {
                    soundEffects.stopShieldSound();
                }
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
        if (this.isRespawning) return; // Don't draw if waiting to respawn

        // Fade in effect
        if (this.isReappearing) {
            ctx.save();
            ctx.globalAlpha = 1 - (this.reappearTimer / 1000);
        }

        // Draw Shield
        if (this.shieldActive) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 80, 0, Math.PI * 2);

            // Warning Effect: Blink/Flicker when < 2 seconds
            if (this.shieldTimer < 2000 && Math.floor(Date.now() / 100) % 2 === 0) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'; // Reddish warning
                ctx.strokeStyle = '#ff00bf'; // Purpleish blink
            } else {
                ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
                ctx.strokeStyle = '#00ffff';
            }

            ctx.shadowBlur = 20;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
        }

        // Cooldown Indicator (Rapid white circle) - Only if feedback active
        if (this.cooldownFeedbackTimer > 0) {
            if (Math.floor(Date.now() / 50) % 2 === 0) { // Fast blink (50ms)
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 80, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
            }
        }

        ctx.drawImage(playerImage, this.x, this.y, this.width, this.height);

        // Restore alpha if needed
        if (this.isReappearing) {
            ctx.restore();
        }

        this.bullets.forEach(b => b.draw(ctx));
    }
    startRespawn() {
        this.isRespawning = true;
        this.respawnTimer = 3000; // 3 seconds
        this.shieldActive = false;
        this.isReappearing = false;
        this.x = -1000; // Move away to be safe
    }

    resetShield() {
        this.shieldActive = false;
        this.shieldTimer = 0;
        this.shieldCooldownTimer = 0;
        if (typeof soundEffects !== 'undefined') {
            soundEffects.stopShieldSound();
        }
    }
}
