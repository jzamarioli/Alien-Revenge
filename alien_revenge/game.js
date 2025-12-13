const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function loadImage(key, src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            images[key] = img;
            resolve(img);
        };
        img.onerror = (e) => reject(`Failed to load ${src}: ${e}`);
        img.src = src;
    });
}

function initGame() {
    gameState.score = 0;
    gameState.round = 3;
    gameState.lives = PLAYER_LIVES;
    updateScore();
    updateLives();

    updateLives();

    // Show Game UI
    document.getElementById('score-display').classList.remove('hidden');
    document.getElementById('lives-display').classList.remove('hidden');

    // Assets are guaranteed loaded now
    player = new Player();
    aliens = [];
    alienBullets = [];
    explosions = [];
    mothership = null;
    gameState.mothershipTimer = 0;
    document.getElementById('high-score-display').classList.add('hidden'); // Hide during game
    // spawnAliens(); // Moving to timeout
    gameState.state = 'ROUND_TRANSITION'; // Wait for banner
    // gameState.lastTime = performance.now(); // Will reset when playing starts

    showMessage(`ROUND ${gameState.round}`, 3000); // 3 seconds banner

    setTimeout(() => {
        spawnAliens();
        gameState.state = 'PLAYING';
        gameState.lastTime = performance.now();
    }, 3000); // Start after banner
}

async function startGame() {
    // Hide Game UI Initially
    document.getElementById('score-display').classList.add('hidden');
    document.getElementById('lives-display').classList.add('hidden');

    const assetsToLoad = [
        { key: 'background', src: 'background.png' },
        { key: 'spaceship', src: 'spaceship.png' },
        { key: 'alien1', src: 'alien1.png' },
        { key: 'alien2', src: 'alien2.png' },
        { key: 'alien3', src: 'alien3.png' },
        { key: 'alien4', src: 'alien4.png' },
        { key: 'alien5', src: 'alien5.png' },
        { key: 'mothership', src: 'mothership.png' }
    ];

    try {
        await Promise.all(assetsToLoad.map(a => loadImage(a.key, a.src)));

        // Global refs update
        window.bgImage = images['background'];
        window.playerImage = images['spaceship'];

        // Update global vars
        bgImage = window.bgImage;
        playerImage = window.playerImage;

        window.alienSprites = {
            1: images['alien1'],
            2: images['alien2'],
            3: images['alien3'],
            4: images['alien4'],
            5: images['alien5']
        };
        alienSprites = window.alienSprites;

        // Assets Loaded: Show Start Button
        document.getElementById('loading-msg').classList.add('hidden');
        document.getElementById('start-btn').classList.remove('hidden');

        // Init High Score Display
        document.getElementById('high-score').innerText = highScore;

        // Start Loop
        requestAnimationFrame(gameLoop);

    } catch (err) {
        console.error("Asset Load Error:", err);
        document.getElementById('loading-msg').innerText = `ERROR: ${err}`;
    }
}

startGame();

function spawnAliens() {
    aliens = [];
    const rows = 3;
    const cols = 5;
    const startX = GAME_WIDTH / 2;
    const startY = 250; // Moved down from 200 as requested

    for (let i = 0; i < 15; i++) {
        // Start center, fan out logic handled in update? 
        // No, let's position them in a grid but they move from center.
        // Actually prompt says "starting at the center of the screen and moving horizontally and vertically"
        // I will initialize them in a grid but visually they might disperse.
        // Let's stick to a grid layout for "home positions" (baseX, baseY)
        let row = Math.floor(i / cols);
        let col = i % cols;
        let x = (GAME_WIDTH / 2 - (cols * 100) / 2) + col * 120;
        let y = 100 + row * 100;
        aliens.push(new Alien(x, y));
    }
}

function updateScore() {
    document.getElementById('score').innerText = gameState.score;
    if (gameState.score > highScore) {
        highScore = gameState.score;
        localStorage.setItem('alienRevengeHighScore', highScore);
        document.getElementById('high-score').innerText = highScore;
    }
}

function updateLives() {
    document.getElementById('lives').innerText = gameState.lives;
}

function showMessage(text, duration) {
    const overlay = document.getElementById('message-overlay');
    const msgText = document.getElementById('message-text');
    msgText.innerText = text;
    overlay.classList.remove('hidden');

    if (duration > 0) {
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, duration);
    }
}

function checkCollisions() {
    // Player Bullets hitting Aliens
    player.bullets.forEach(bullet => {
        aliens.forEach(alien => {
            if (!bullet.markedForDeletion && !alien.markedForDeletion) {
                if (bullet.x > alien.x && bullet.x < alien.x + alien.width &&
                    bullet.y > alien.y && bullet.y < alien.y + alien.height) {
                    alien.markedForDeletion = true;
                    bullet.markedForDeletion = true;
                    gameState.score += 10;
                    explosions.push(new Explosion(alien.x + alien.width / 2, alien.y + alien.height / 2, 'orange'));
                    updateScore();
                }
            }
        });

        // Check Mothership Collision
        if (mothership && !mothership.markedForDeletion && !bullet.markedForDeletion) {
            if (bullet.x > mothership.x && bullet.x < mothership.x + mothership.width &&
                bullet.y > mothership.y && bullet.y < mothership.y + mothership.height) {
                mothership.markedForDeletion = true;
                bullet.markedForDeletion = true;
                gameState.score += 50;
                explosions.push(new Explosion(mothership.x + mothership.width / 2, mothership.y + mothership.height / 2, 'red'));
                updateScore();
                mothership = null; // Immediate cleanup
            }
        }
    });

    // Alien Bullets hitting Player or Shield
    alienBullets.forEach(bullet => {
        if (bullet.markedForDeletion) return;

        // Shield Collision
        if (player.shieldActive) {
            const dx = bullet.x - (player.x + player.width / 2);
            const dy = bullet.y - (player.y + player.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80 + bullet.radius) { // 80 is shield radius
                bullet.markedForDeletion = true;
                explosions.push(new Explosion(bullet.x, bullet.y, 'white')); // Effect on shield hit
                return;
            }
        }

        // Player Body Collision
        if (bullet.x > player.x + 20 && bullet.x < player.x + player.width - 20 &&
            bullet.y > player.y + 20 && bullet.y < player.y + player.height - 20) {
            // Hit!
            bullet.markedForDeletion = true;
            explosions.push(new Explosion(player.x + player.width / 2, player.y + player.height / 2, 'white'));
            handlePlayerHit();
        }
    });

    // Aliens hitting Shield or Player (Kamikaze)
    aliens.forEach(alien => {
        if (alien.markedForDeletion) return;

        if (player.shieldActive) {
            // Simple box vs circle check approx
            const dx = (alien.x + alien.width / 2) - (player.x + player.width / 2);
            const dy = (alien.y + alien.height / 2) - (player.y + player.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80 + 40) { // Shield radius + approx alien radius
                alien.markedForDeletion = true;
                explosions.push(new Explosion(alien.x + alien.width / 2, alien.y + alien.height / 2, 'orange'));
                // Game Prompt: "If aliens touch the shield, they will be destroyed."
            }
        }

        if (alien.x < player.x + player.width &&
            alien.x + alien.width > player.x &&
            alien.y < player.y + player.height &&
            alien.y + alien.height > player.y) {
            alien.markedForDeletion = true;
            explosions.push(new Explosion(player.x + player.width / 2, player.y + player.height / 2, 'white'));
            handlePlayerHit();
        }
    });
}

function endGame() {
    gameState.state = 'GAME_OVER';

    // Clear all entities to ensure clean background
    aliens = [];
    alienBullets = [];
    player.bullets = [];
    explosions = [];
    mothership = null;

    // UI Updates
    const startScreen = document.getElementById('start-screen');
    startScreen.querySelector('h1').innerText = "GAME OVER";
    startScreen.querySelector('p').classList.add('hidden'); // Hide instructions text
    startScreen.classList.add('no-background'); // Transparent background for Game Over

    document.getElementById('lives-display').classList.add('hidden'); // Hide lives on Game Over

    document.getElementById('start-btn').innerText = "PLAY AGAIN";
    document.getElementById('high-score-display').classList.remove('hidden');

    startScreen.classList.remove('hidden');
    document.getElementById('message-overlay').classList.add('hidden');
}

function handlePlayerHit() {
    gameState.lives--;
    updateLives();

    if (gameState.lives <= 0) {
        endGame();
    } else {
        player.startRespawn();
        // showMessage("HIT! RESPAWNING...", 1000); // Optional
        // Clear all alien bullets to prevent spawn kill
        alienBullets = [];
    }
}

function gameLoop(timestamp) {
    let deltaTime = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw Background
    ctx.drawImage(bgImage, 0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (gameState.state === 'PLAYING') {
        player.update(deltaTime);
        player.draw(ctx);

        // Manage Alien Bullets independently
        alienBullets.forEach(b => {
            b.update(deltaTime);
            b.draw(ctx);
        });
        alienBullets = alienBullets.filter(b => !b.markedForDeletion);

        // Explosions
        explosions.forEach(exp => {
            exp.update();
            exp.draw(ctx);
        });
        explosions = explosions.filter(exp => !exp.markedForDeletion);

        gameState.activeDiveInProgress = aliens.some(a => a.state === 'DIVE' || a.state === 'RETURN');

        aliens.forEach(alien => {
            alien.update(deltaTime);
            alien.draw(ctx);
            // Collect bullets
            while (alien.bullets.length > 0) {
                alienBullets.push(alien.bullets.pop());
            }
        });

        // Remove dead aliens
        aliens = aliens.filter(a => !a.markedForDeletion);

        checkCollisions();

        // Mothership Logic
        if (!mothership) {
            gameState.mothershipTimer += deltaTime;
            // Spawn every 10-20 seconds (random)
            // Just doing fixed 15s for now or small random
            if (gameState.mothershipTimer > 15000) {
                mothership = new Mothership();
                gameState.mothershipTimer = 0;
            }
        } else {
            mothership.update(deltaTime);
            mothership.draw(ctx);
            if (mothership.markedForDeletion) {
                mothership = null;
            }
        }

        // Round Logic
        if (aliens.length === 0 && gameState.state === 'PLAYING') {
            nextRound();
        }
    }

    if (gameState.state === 'PLAYING' || gameState.state === 'ROUND_TRANSITION' || gameState.state === 'GAME_OVER') {
        requestAnimationFrame(gameLoop);
    }
}

function togglePause(mode) {
    const pauseModal = document.getElementById('pause-modal');
    const quitModal = document.getElementById('quit-modal');

    if (gameState.state === 'PLAYING') {
        gameState.state = 'PAUSED';
        if (mode === 'quit') {
            quitModal.classList.remove('hidden');
        } else {
            pauseModal.classList.remove('hidden');
        }
    } else if (gameState.state === 'PAUSED') {
        gameState.state = 'PLAYING';
        quitModal.classList.add('hidden');
        pauseModal.classList.add('hidden');
        gameState.lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
}

document.getElementById('confirm-quit-btn').addEventListener('click', () => {
    window.location.reload();
});

document.getElementById('cancel-quit-btn').addEventListener('click', () => {
    togglePause();
});

function nextRound() {
    gameState.state = 'ROUND_TRANSITION';
    showMessage(`ROUND ${gameState.round} COMPLETED`, 4000);

    setTimeout(() => {
        gameState.round++;
        if (gameState.round > MAX_ROUNDS) {
            // Victory
            gameState.state = 'GAME_OVER';
            showMessage("MISSION ACCOMPLISHED!", 0);
            setTimeout(() => {
                document.getElementById('start-screen').classList.remove('hidden');
                document.getElementById('message-overlay').classList.add('hidden');
            }, 3000);
        } else {
            showMessage(`ROUND ${gameState.round}`, 3000);
            setTimeout(() => {
                spawnAliens();
                gameState.state = 'PLAYING';
                requestAnimationFrame(gameLoop); // Restart loop if it stopped
            }, 3000);
        }
    }, 4000);

    requestAnimationFrame(gameLoop); // Keep loop running for transition (maybe showing particles or just waiting)
}

// Start Button
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    initGame();
    requestAnimationFrame(gameLoop);
});

document.getElementById('quit-btn').addEventListener('click', () => {
    alert("Thanks for playing!");
    window.close(); // May not work in all browsers but standard for quit buttons web-games
});

// Init
// requestAnimationFrame(gameLoop); // Don't start loop immediately, wait for start
