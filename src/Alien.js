class Alien {
    constructor(x, y) {
        this.width = 80;
        this.height = 80;
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.speedX = 3 + (gameState.round * 0.5);
        this.speedY = 1 + (gameState.round * 0.2);
        this.bullets = [];
        this.angle = 0;
        this.markedForDeletion = false;

        // AI State
        this.state = 'HOVER'; // HOVER, DIVE, RETURN
        this.diveTargetX = 0;
        this.diveTargetY = 0;
        this.diveSpeed = 5 + gameState.round;
    }

    update(deltaTime) {
        // Normalize speed: assume base speeds are pixels per FRAME at 60fps (approx 16ms)
        // New position = old + speed * (deltaTime / 16.66)
        const timeScale = deltaTime / 16.66;

        if (this.state === 'HOVER') {
            // Simple movement pattern: elliptical/bobbing
            this.angle += 0.02 * (gameState.round) * timeScale;
            this.x = this.baseX + Math.sin(this.angle) * 200;
            // In Round 1, aliens move to right and left only (no vertical bobbing)
            const verticalBob = (gameState.round === 1) ? 0 : Math.cos(this.angle * 2) * 50;
            this.y = this.baseY + verticalBob;

            // Chance to dive (Round 3+)
            // Chance is per frame, so we should scale chance by time too? 
            // Better to keep it simple, chance is probabilistic.
            // Only one diver at a time
            if (gameState.round >= 3 && !gameState.activeDiveInProgress && Math.random() < 0.001 * gameState.round * timeScale) {
                this.state = 'DIVE';
                gameState.activeDiveInProgress = true; // Immediately claim it so others don't in the same frame
                this.diveTargetX = player.x; // Aim at player's current spot
                this.diveTargetY = GAME_HEIGHT + 100; // Fly off screen
            }
        } else if (this.state === 'DIVE') {
            const dx = this.diveTargetX - this.x;
            const dy = this.diveTargetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 10 || this.y > GAME_HEIGHT) {
                // Reset to top
                this.y = -100;
                this.x = this.baseX; // Teleport back to X lane roughly
                this.state = 'RETURN';
            } else {
                this.x += (dx / dist) * this.diveSpeed * timeScale;
                this.y += (dy / dist) * this.diveSpeed * timeScale;
            }
        } else if (this.state === 'RETURN') {
            // Fly back to formation
            const dx = this.baseX - this.x;
            const dy = this.baseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 10) {
                this.state = 'HOVER';
            } else {
                this.x += (dx / dist) * this.speedX * timeScale;
                this.y += (dy / dist) * this.speedX * timeScale;
            }
        }

        // Shoot randomly (Higher chance if diving) - But only if player is active
        if (!player.isRespawning && !player.isReappearing) {
            let shootChance = (this.state === 'DIVE' ? 0.02 : 0.002 * gameState.round) * timeScale;
            if (Math.random() < shootChance) {
                this.bullets.push(new Bullet(this.x + this.width / 2, this.y + this.height, 1, true));
            }
        }

    }

    draw(ctx) {
        let sprite = alienSprites[gameState.round] || alienSprites[1]; // Faillback
        if (sprite) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        }
    }
}
