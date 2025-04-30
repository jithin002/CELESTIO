const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load spaceship images
const playerShip = new Image();
playerShip.src = 'https://cdn.pixabay.com/photo/2014/04/03/11/53/rocket-312455_640.png';  // Player spaceship image

const aiShip = new Image();
aiShip.src = 'https://cdn.pixabay.com/photo/2014/04/03/11/53/rocket-312455_640.png';  // AI spaceship image

// Game settings
let playerX = 50, playerY = canvas.height / 2 - 25;
let playerSpeed = 4;
let playerHealth = 100;
let aiX = canvas.width - 100, aiY = canvas.height / 2 - 25;
let aiHealth = 100;  // Keep AI health at a manageable level for the player
let aiSpeed = 3.567;  // Slow down AI to make it winnable
let gameOver = false;
let explosionOccurred = false;  // Flag to check if explosion should be shown
let gameResult = '';  // Variable to store win/lose message
let difficulty = 'easy';  // Default difficulty

// Bullet arrays for both spaceships
const playerBullets = [];
const aiBullets = [];

// Bullet object for player and AI
function createBullet(x, y, direction) {
    return { x, y, speed: 5, direction };
}

// Handle player spaceship movement and firing bullets
let firing = false;

document.addEventListener('keydown', function (e) {
    // Only allow vertical movement (up/down)
    if (e.key === 'ArrowUp') {
        playerY -= playerSpeed;
    }
    if (e.key === 'ArrowDown') {
        playerY += playerSpeed;
    }
    // Fire bullets with spacebar
    if (e.key === ' ') {
        firing = true;
    }
    // Restart the game with Enter key
    if (e.key === 'Enter' && gameOver) {
        resetGame();  // Reset the game when Enter is pressed
        updateGame();  // Start a new game
    }
});

document.addEventListener('keyup', function (e) {
    if (e.key === ' ') {
        firing = false;
    }
});

// AI Spaceship logic
function aiLogic() {
    // Randomly decide whether to move up or down
    if (Math.random() < 0.489) { // Adjust the probability for more or less movement
        if (aiY > playerY) {
            aiY -= aiSpeed; // Move up
        } else {
            aiY += aiSpeed; // Move down
        }
    }

    // Prevent AI from moving off-screen
    if (aiY < 0) aiY = 0;
    if (aiY + 50 > canvas.height) aiY = canvas.height - 50;

    // Fire bullets when aligned with the player spaceship
    if (Math.abs(playerY - aiY) < 30 && Math.random() < 0.05) {
        aiBullets.push(createBullet(aiX, aiY + 25, -1)); // Fire bullet to the left
    }

    // Implement dodging logic
    playerBullets.forEach(bullet => {
        if (bullet.x > aiX && bullet.x < aiX + 50 && bullet.y > aiY && bullet.y < aiY + 50) {
            // If the bullet is heading towards the AI, move it away
            if (bullet.y < aiY + 25) {
                aiY += aiSpeed; // Move down
            } else {
                aiY -= aiSpeed; // Move up
            }
        }
    });
}

// Explosion graphics when spaceships are hit
function renderExplosion(x, y) {
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);  // Draw explosion as a circle
    ctx.fill();  // Fill the explosion
}

// Collision detection with explosions
function checkCollisions() {
    playerBullets.forEach((bullet, bulletIndex) => {
        if (bullet.x < aiX + 50 && bullet.x > aiX && bullet.y > aiY && bullet.y < aiY + 50) {
            aiHealth -= 10;  // Reduce AI health
            playerBullets.splice(bulletIndex, 1);  // Remove the bullet

            // Show explosion only when AI health is zero
            if (aiHealth <= 0 && !explosionOccurred) {
                explosionOccurred = true;  // Prevent multiple explosions
                renderExplosion(aiX + 25, aiY + 25);  // Show explosion when AI is hit
            }
        }
    });

    aiBullets.forEach((bullet, bulletIndex) => {
        if (bullet.x < playerX + 50 && bullet.x > playerX && bullet.y > playerY && bullet.y < playerY + 50) {
            renderExplosion(playerX + 25, playerY + 25);  // Show explosion when player is hit
            aiBullets.splice(bulletIndex, 1);  // Remove the bullet
            playerHealth -= 10;  // Reduce player health
        }
    });

    // Check for win/loss conditions
    if (aiHealth <= 0) {
        gameResult = "You Win!";  // Store win message
        gameOver = true;  // Stop the game
    }
    if (playerHealth <= 0) {
        gameResult = "You Lose!";  // Store lose message
        gameOver = true;  // Stop the game
    }
}

// Reset the game after win/loss
function resetGame() {
    playerHealth = 100;  // Reset player health
    aiHealth = difficulty === 'easy' ? 100 : 200;  // Reset AI health based on difficulty
    explosionOccurred = false;  // Reset explosion flag
    playerBullets.length = 0;  // Clear bullets
    aiBullets.length = 0;  // Clear bullets
    gameResult = '';  // Reset game result message
    gameOver = false;

    // Adjust speeds based on difficulty
    if (difficulty === 'easy') {
        aiSpeed = 3.567;  // Easy speed
    } else {
        aiSpeed = 5;  // Harder speed
    }
}

// Bullet movement and collision detection
function updateBullets() {
    // Player bullets
    playerBullets.forEach((bullet, index) => {
        bullet.x += bullet.speed * bullet.direction;
        // Remove bullets if off-screen
        if (bullet.x > canvas.width) {
            playerBullets.splice(index, 1);
        }
    });

    // AI bullets
    aiBullets.forEach((bullet, index) => {
        bullet.x += bullet.speed * bullet.direction;
        // Remove bullets if off-screen
        if (bullet.x < 0) {
            aiBullets.splice(index, 1);
        }
    });
}

// Main game loop
function updateGame() {
    if (gameOver) {
        // Display game result (win/lose) in the center of the screen
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '48px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.fillText(gameResult, canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText("Press Enter to Restart", canvas.width / 2, canvas.height / 2 + 40);
        return;  // Stop the game loop
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update positions and bullets
    aiLogic();
    updateBullets();

    // Draw player spaceship
    ctx.drawImage(playerShip, playerX, playerY, 50, 50);

    // Draw AI spaceship flipped horizontally
    ctx.save();
    ctx.scale(-1, 1);  // Flip horizontally
    ctx.drawImage(aiShip, -aiX - 50, aiY, 50, 50);  // Negative x for flipped image
    ctx.restore();

    // Draw player bullets
    playerBullets.forEach(bullet => {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bullet.x, bullet.y, 10, 5);
    });

    // Draw AI bullets
    aiBullets.forEach(bullet => {
        ctx.fillStyle = 'red';
        ctx.fillRect(bullet.x, bullet.y, 10, 5);
    });

    // Draw health bars
    ctx.fillStyle = 'green';
    ctx.fillRect(10, 10, playerHealth, 10);  // Player health bar
    ctx.fillStyle = 'blue';
    ctx.fillRect(canvas.width - 110, 10, aiHealth, 10);  // AI health bar

    // Check for game over
    checkCollisions();

    // Fire bullets continuously if firing
    if (firing) {
        playerBullets.push(createBullet(playerX + 50, playerY + 25, 1)); // Bullet moves to the right
    }

    // Prevent player from moving out of the screen
    if (playerY < 0) playerY = 0;
    if (playerY + 50 > canvas.height) playerY = canvas.height - 50;

    // Request next animation frame
    requestAnimationFrame(updateGame);
}

// Initialize the game
resetGame();  // Initial game reset for the default difficulty
updateGame();  // Start the game loop
