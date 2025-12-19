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
    gameState.round = gameState.round;
    gameState.lives = PLAYER_LIVES;
    updateScore();
    updateLives();

    // Set background for current round
    bgImage = images['background' + gameState.round];
    window.bgImage = bgImage;

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

    showMessage(gameState.round === MAX_ROUNDS ? 'FINAL ROUND' : `ROUND ${gameState.round}`, 3000); // 3 seconds banner

    setTimeout(() => {
        spawnAliens();
        gameState.state = 'PLAYING';
        gameState.lastTime = performance.now();
        // Start alien movement sound (Galaxian-style)
        if (typeof soundEffects !== 'undefined') {
            soundEffects.startAlienMovementSound();
        }
    }, 3000); // Start after banner
}

async function startGame() {
    // Hide Game UI Initially
    document.getElementById('score-display').classList.add('hidden');
    document.getElementById('lives-display').classList.add('hidden');

    const assetsToLoad = [
        { key: 'background1', src: 'background1.png' },
        { key: 'background2', src: 'background2.png' },
        { key: 'background3', src: 'background3.png' },
        { key: 'background4', src: 'background4.png' },
        { key: 'background5', src: 'background5.png' },
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
        window.bgImage = images['background1'];
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
        document.getElementById('high-score-display').classList.remove('hidden'); // Always show high score

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
    const rows = 5;
    const cols = gameState.round === 1 ? 5 : 7;
    const spacingX = 200; // Wider spacing
    const totalWidth = (cols - 1) * spacingX;
    const startX = (GAME_WIDTH - totalWidth) / 2;
    const startY = 250;

    for (let i = 0; i < 32; i++) {
        // Position in grid
        let row = Math.floor(i / cols);
        let col = i % cols;
        let x = startX + col * spacingX;
        let y = 100 + row * 100;

        // Custom formation for Round 4: 'V' shape & Vertical Shift
        if (gameState.round === 4) {
            const centerCol = (cols - 1) / 2;
            const vOffset = Math.abs(col - centerCol) * 80; // Offset increases with distance from center
            y = (y + vOffset) * 0.8; // Move 20% higher (reducing Y by 20%)
        }

        // Custom formation for Round 5: Inverted 'Y' shape
        if (gameState.round === 5) {
            const centerCol = (cols - 1) / 2;
            const centerX = startX + centerCol * spacingX;
            if (i < 10) {
                // Stem (Top portion)
                x = centerX;
                y = (50 + i * 60) * 0.5;
            } else {
                // Branches (Bottom portion)
                const branchIdx = i - 10;
                const side = branchIdx % 2 === 0 ? -1 : 1;
                const depth = Math.floor(branchIdx / 2) + 1;
                x = centerX + side * depth * 80;
                y = ((50 + 9 * 60) + depth * 50) * 0.5;
            }
        }

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
                    // Play explosion sound
                    if (typeof soundEffects !== 'undefined') {
                        soundEffects.playExplosionSound();
                    }
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
                // Play mothership explosion sound (different from regular aliens)
                if (typeof soundEffects !== 'undefined') {
                    soundEffects.playMothershipExplosionSound();
                }
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
            // Play player death sound
            if (typeof soundEffects !== 'undefined') {
                soundEffects.playPlayerDeathSound();
            }
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

        // Tightened Hitbox for Player (paddings)
        if (alien.x < player.x + player.width - 25 &&
            alien.x + alien.width > player.x + 25 &&
            alien.y < player.y + player.height - 20 &&
            alien.y + alien.height > player.y + 20) {
            alien.markedForDeletion = true;
            explosions.push(new Explosion(player.x + player.width / 2, player.y + player.height / 2, 'white'));
            // Play player death sound
            if (typeof soundEffects !== 'undefined') {
                soundEffects.playPlayerDeathSound();
            }
            handlePlayerHit();
        }
    });
}

function endGame() {
    gameState.state = 'GAME_OVER';

    // Stop alien movement sound
    if (typeof soundEffects !== 'undefined') {
        soundEffects.stopAlienMovementSound();
    }

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

    // Update game objects only when playing
    if (gameState.state === 'PLAYING') {
        player.update(deltaTime);

        // Manage Alien Bullets independently
        alienBullets.forEach(b => {
            b.update(deltaTime);
        });
        alienBullets = alienBullets.filter(b => !b.markedForDeletion);

        // Explosions
        explosions.forEach(exp => {
            exp.update();
        });
        explosions = explosions.filter(exp => !exp.markedForDeletion);

        gameState.activeDiveInProgress = aliens.some(a => a.state === 'DIVE' || a.state === 'RETURN');

        aliens.forEach(alien => {
            alien.update(deltaTime);
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
            if (gameState.mothershipTimer > 15000) {
                mothership = new Mothership();
                gameState.mothershipTimer = 0;
            }
        } else {
            mothership.update(deltaTime);
            if (mothership.markedForDeletion) {
                mothership = null;
            }
        }

        // Round Logic
        if (aliens.length === 0 && gameState.state === 'PLAYING') {
            nextRound();
        }
    }

    // Draw game objects when playing OR paused
    if (gameState.state === 'PLAYING' || gameState.state === 'PAUSED') {
        player.draw(ctx);

        // Draw bullets
        alienBullets.forEach(b => {
            b.draw(ctx);
        });

        // Draw explosions
        explosions.forEach(exp => {
            exp.draw(ctx);
        });

        // Draw aliens
        aliens.forEach(alien => {
            alien.draw(ctx);
        });

        // Draw mothership
        if (mothership) {
            mothership.draw(ctx);
        }
    }

    if (gameState.state === 'PLAYING' || gameState.state === 'ROUND_TRANSITION' || gameState.state === 'GAME_OVER' || gameState.state === 'PAUSED') {
        requestAnimationFrame(gameLoop);
    }
}

function togglePause(mode) {
    const pauseModal = document.getElementById('pause-modal');
    const quitModal = document.getElementById('quit-modal');

    if (gameState.state === 'PLAYING') {
        gameState.state = 'PAUSED';
        // Stop all sounds when paused
        if (typeof soundEffects !== 'undefined') {
            soundEffects.stopAllSounds();
        }
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
        // Restart sounds when unpaused
        if (typeof soundEffects !== 'undefined') {
            soundEffects.startAlienMovementSound();
            if (player && player.shieldActive) {
                soundEffects.startShieldSound();
            }
        }
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

    // Reset shield and stop its sound
    if (player) {
        player.resetShield();
    }

    // Stop alien movement sound during transition
    if (typeof soundEffects !== 'undefined') {
        soundEffects.stopAlienMovementSound();
    }
    if (gameState.round === MAX_ROUNDS) {
        // Victory immediately
        gameState.state = 'GAME_OVER';
        showMessage("MISSION ACCOMPLISHED!", 0);
        setTimeout(() => {
            // Go to start screen (Victory state)
            const startScreen = document.getElementById('start-screen');
            startScreen.classList.remove('hidden');
            startScreen.classList.add('no-background');
            startScreen.querySelector('h1').innerText = "VICTORY";
            startScreen.querySelector('p').classList.add('hidden');
            document.getElementById('start-btn').innerText = "PLAY AGAIN";
            document.getElementById('high-score-display').classList.remove('hidden'); // Show High Score on Victory
            document.getElementById('message-overlay').classList.add('hidden');
        }, 4000);
    } else {
        // Normal round transition
        showMessage(`ROUND ${gameState.round} COMPLETED`, 4000);

        setTimeout(() => {
            gameState.round++;
            // Update background for new round
            bgImage = images['background' + gameState.round] || images['background1'];
            window.bgImage = bgImage;
            showMessage(gameState.round === MAX_ROUNDS ? 'FINAL ROUND' : `ROUND ${gameState.round}`, 3000);
            setTimeout(() => {
                spawnAliens();
                gameState.state = 'PLAYING';
                requestAnimationFrame(gameLoop);
            }, 3000);
        }, 4000);
    }

    requestAnimationFrame(gameLoop);
}

// Start Button
document.getElementById('start-btn').addEventListener('click', () => {
    const startScreen = document.getElementById('start-screen');
    startScreen.classList.add('hidden');
    // Reset Game Over styles so next time main menu (if we used it) would be normal, 
    // although strictly speaking we only show Start Screen either as Main or Game Over.
    // But good to clean up.
    startScreen.classList.remove('no-background');
    startScreen.querySelector('p').classList.remove('hidden'); // Show instructions again if needed for next time? 
    // Wait, if it's "Play Again", we go straight to game. 
    // If we reload or go back to menu?
    // The requirement says "Play Again" button.

    initGame();
    requestAnimationFrame(gameLoop);
});

document.getElementById('quit-btn').addEventListener('click', () => {
    alert("Thanks for playing!");
    window.close(); // May not work in all browsers but standard for quit buttons web-games
});

// Init
// requestAnimationFrame(gameLoop); // Don't start loop immediately, wait for start
