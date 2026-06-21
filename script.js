const bird = document.getElementById('bird');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const dieSound = document.getElementById('die-sound');
const jumpSound = document.getElementById('jump-sound');

// Game Variables
let birdTop = 250;
let gravity = 0.35;
let velocity = 0;
let jumpPower = -6.5;
let isGameOver = true;
let score = 0;
let pipes = [];
let gameLoopId, pipeLoopId;

// Start Game
function startGame() {
    isGameOver = false;
    score = 0;
    birdTop = 250;
    velocity = 0;
    scoreDisplay.innerText = '0';
    startScreen.style.display = 'none';
    
    // Clear any existing pipes
    pipes.forEach(pipe => pipe.remove());
    pipes = [];

    // Start loops
    gameLoopId = requestAnimationFrame(updateGame);
    pipeLoopId = setInterval(createPipe, 2500);
}

// Make Character Jump
function jump() {
    if (isGameOver) {
        startGame();
    } else {
        velocity = jumpPower;
        bird.style.transform = "rotate(-20deg)";

        // Play the tap sound
        jumpSound.currentTime = 0; // Rewinds the sound to the start so it can play rapidly on fast taps
        jumpSound.play().catch(e => console.log("Audio waiting for user gesture"));
    }
}

// Listen for both mobile touch and desktop clicks
gameContainer.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents double-triggering or zooming
    jump();
}, { passive: false });

gameContainer.addEventListener('mousedown', jump);

// Main Game Update Loop
function updateGame() {
    if (isGameOver) return;

    // Apply Gravity
    velocity += gravity;
    birdTop += velocity;
    bird.style.top = birdTop + 'px';

    // Softly tilt down as falling
    if (velocity > 2) {
        bird.style.transform = "rotate(20deg)";
    }

    // Check Floor/Ceiling Collisions
    const containerHeight = gameContainer.clientHeight;
    if (birdTop < 0 || birdTop + bird.clientHeight > containerHeight) {
        gameOver();
        return;
    }

    // Move and Check Pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        let pipe = pipes[i];
        let pipeLeft = parseFloat(pipe.style.left);
        pipeLeft -= 3; // Game Speed
        pipe.style.left = pipeLeft + 'px';

        // Collision Check
        if (checkCollision(bird, pipe)) {
            gameOver();
            return;
        }

        // Score tracking & removing old pipes
        if (pipeLeft < -60) {
            if (pipe.dataset.type === 'top') { 
                score++;
                scoreDisplay.innerText = score;
            }
            pipe.remove();
            pipes.splice(i, 1);
        }
    }

    gameLoopId = requestAnimationFrame(updateGame);
}

// Create Obstacles with a Gap
function createPipe() {
    if (isGameOver) return;

    const containerHeight = gameContainer.clientHeight;
    const gap = 300; // The spacing to fly through (Adjust to make it harder/easier)
    const minHeight = 50;
    const maxHeight = containerHeight - gap - minHeight;
    const topPipeHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    const bottomPipeHeight = containerHeight - topPipeHeight - gap;

    // Top Pipe
    const topPipe = document.createElement('div');
    topPipe.classList.add('pipe');
    topPipe.style.height = topPipeHeight + 'px';
    topPipe.style.top = '0px';
    topPipe.style.left = '400px';
    topPipe.dataset.type = 'top';
    gameContainer.appendChild(topPipe);
    pipes.push(topPipe);

    // Bottom Pipe
    const bottomPipe = document.createElement('div');
    bottomPipe.classList.add('pipe');
    bottomPipe.style.height = bottomPipeHeight + 'px';
    bottomPipe.style.bottom = '0px';
    bottomPipe.style.left = '400px';
    bottomPipe.dataset.type = 'bottom';
    gameContainer.appendChild(bottomPipe);
    pipes.push(bottomPipe);
}

// Precise AABB Collision Box Checking
function checkCollision(el1, el2) {
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();

    // Define a buffer in pixels to ignore the invisible transparent margins
    const buffer = 16; // Adjust this number (higher = smaller collision box)

    return !(
        (rect1.top + buffer) > rect2.bottom ||
        (rect1.bottom - buffer) < rect2.top ||
        (rect1.right - buffer) < rect2.left ||
        (rect1.left + buffer) > rect2.right
    );
}

// Handle Death
function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(gameLoopId);
    clearInterval(pipeLoopId);
    
    // Play your custom death audio
    dieSound.currentTime = 0;
    dieSound.play().catch(e => console.log("Audio play blocked until user interaction"));

    startScreen.innerHTML = `Game Over<br>Score: ${score}<br><span style="font-size:1.2rem;">Tap to Try Again</span>`;
    startScreen.style.display = 'flex';
}
