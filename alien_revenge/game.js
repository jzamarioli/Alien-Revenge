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
    gameState.round = 1;
    updateScore();
    // Assets are guaranteed loaded now
    player = new Player();
    aliens = [];
    alienBullets = [];
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
    const assetsToLoad = [
        { key: 'background', src: 'background.png' },
        { key: 'spaceship', src: 'spaceship.png' },
        { key: 'alien1', src: 'alien1.png' },
        { key: 'alien2', src: 'alien2.png' },
        { key: 'alien3', src: 'alien3.png' },
        { key: 'alien4', src: 'alien4.png' },
        { key: 'alien5', src: 'alien5.png' }
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
    const startY = 200;

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
                    updateScore();
                }
            }
        });
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
                return;
            }
        }

        // Player Body Collision
        if (bullet.x > player.x + 20 && bullet.x < player.x + player.width - 20 &&
            bullet.y > player.y + 20 && bullet.y < player.y + player.height - 20) {
            // Hit!
            endGame();
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
                // Game Prompt: "If aliens touch the shield, they will be destroyed."
            }
        }

        if (alien.x < player.x + player.width &&
            alien.x + alien.width > player.x &&
            alien.y < player.y + player.height &&
            alien.y + alien.height > player.y) {
            endGame();
        }
    });
}

function endGame() {
    gameState.state = 'GAME_OVER';
    showMessage("GAME OVER", 0);
    document.getElementById('start-screen').parentElement.querySelector('#start-btn').innerText = "PLAY AGAIN";
    document.getElementById('high-score-display').classList.remove('hidden'); // Show again
    setTimeout(() => {
        document.getElementById('start-screen').classList.remove('hidden');
        document.getElementById('message-overlay').classList.add('hidden');
    }, 3000);
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

        // Round Logic
        if (aliens.length === 0) {
            nextRound();
        }
    }

    if (gameState.state === 'PLAYING' || gameState.state === 'ROUND_TRANSITION') {
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
