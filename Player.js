class Player {
    constructor() {
        this.width = 100;
        this.height = 100;
        this.x = GAME_WIDTH / 2 - this.width / 2;
        this.y = GAME_HEIGHT - this.height + 4;
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
                this.y = GAME_HEIGHT - this.height + 4;
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

    static initShields() {
        if (Player.shieldNormalCanvas) return;

        const size = 200; // Large enough for radius 80 + shadow
        const center = size / 2;

        // Normal Shield
        Player.shieldNormalCanvas = document.createElement('canvas');
        Player.shieldNormalCanvas.width = size;
        Player.shieldNormalCanvas.height = size;
        const ctxN = Player.shieldNormalCanvas.getContext('2d');
        ctxN.beginPath();
        ctxN.arc(center, center, 80, 0, Math.PI * 2);
        ctxN.fillStyle = 'rgba(0, 255, 255, 0.3)';
        ctxN.strokeStyle = '#00ffff';
        ctxN.shadowBlur = 20;
        ctxN.shadowColor = ctxN.strokeStyle;
        ctxN.fill();
        ctxN.lineWidth = 3;
        ctxN.stroke();

        // Warning Shield
        Player.shieldWarningCanvas = document.createElement('canvas');
        Player.shieldWarningCanvas.width = size;
        Player.shieldWarningCanvas.height = size;
        const ctxW = Player.shieldWarningCanvas.getContext('2d');
        ctxW.beginPath();
        ctxW.arc(center, center, 80, 0, Math.PI * 2);
        ctxW.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctxW.strokeStyle = '#ff00bf';
        ctxW.shadowBlur = 20;
        ctxW.shadowColor = ctxW.strokeStyle;
        ctxW.fill();
        ctxW.lineWidth = 3;
        ctxW.stroke();

        // Cooldown Shield (Outline Only)
        Player.shieldCooldownCanvas = document.createElement('canvas');
        Player.shieldCooldownCanvas.width = size;
        Player.shieldCooldownCanvas.height = size;
        const ctxC = Player.shieldCooldownCanvas.getContext('2d');
        ctxC.beginPath();
        ctxC.arc(center, center, 80, 0, Math.PI * 2);
        ctxC.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctxC.lineWidth = 1;
        ctxC.stroke();
    }

    draw(ctx) {
        if (this.isRespawning) return; // Don't draw if waiting to respawn

        // Fade in effect
        if (this.isReappearing) {
            ctx.save();
            ctx.globalAlpha = 1 - (this.reappearTimer / 1000);
        }

        // Draw Shield
        if (this.shieldActive || this.cooldownFeedbackTimer > 0) {
            Player.initShields(); // Ensure canvases are ready
        }

        if (this.shieldActive) {
            const shieldImg = (this.shieldTimer < 2000 && Math.floor(Date.now() / 100) % 2 === 0)
                ? Player.shieldWarningCanvas
                : Player.shieldNormalCanvas;

            ctx.drawImage(
                shieldImg,
                this.x + this.width / 2 - 100,
                this.y + this.height / 2 - 100
            );
        }

        // Cooldown Indicator (Rapid white circle) - Only if feedback active
        if (this.cooldownFeedbackTimer > 0) {
            if (Math.floor(Date.now() / 50) % 2 === 0) { // Fast blink (50ms)
                ctx.drawImage(
                    Player.shieldCooldownCanvas,
                    this.x + this.width / 2 - 100,
                    this.y + this.height / 2 - 100
                );
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
