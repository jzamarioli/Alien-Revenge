class FloatingText {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.life = 1.5;
        this.decay = 0.015;
        this.speedY = 1.5;
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        const timeScale = deltaTime / 16.66;
        this.y -= this.speedY * timeScale;
        this.life -= this.decay * timeScale;
        if (this.life <= 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 36px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}
