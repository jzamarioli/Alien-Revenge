class Explosion {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.particles = [];
        this.markedForDeletion = false;

        // Create particles
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: 0,
                y: 0,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 5 + 2,
                life: 1.0,
                decay: Math.random() * 0.05 + 0.02
            });
        }
    }

    update() {
        // Update particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
        });

        // Filter dead particles
        this.particles = this.particles.filter(p => p.life > 0);

        if (this.particles.length === 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
}
