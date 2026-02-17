const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load progress from browser localStorage
let progress = JSON.parse(localStorage.getItem('zombieGame')) || {
    score: 0,
    wave: 1,
    playerLives: 3
};

// Player setup
let player = { x: 400, y: 500, size: 20, speed: 5 };

// Bullets and Zombies
let bullets = [];
let zombies = [];
let spawnInterval = 2000; // milliseconds

// Key controls
let keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// Spawn zombies
function spawnZombie() {
    let x = Math.random() * (canvas.width - 20);
    zombies.push({ x: x, y: 0, size: 20, speed: 1 + progress.wave * 0.2 });
}

// Shoot bullets
function shoot() {
    bullets.push({ x: player.x + player.size / 2 - 2, y: player.y, size: 4, speed: 7 });
}

// Game loop
function update() {
    // Player movement
    if(keys['ArrowLeft']) player.x -= player.speed;
    if(keys['ArrowRight']) player.x += player.speed;
    if(keys[' ']) shoot();

    // Update bullets
    bullets.forEach((b, i) => {
        b.y -= b.speed;
        // Remove bullets off screen
        if(b.y < 0) bullets.splice(i, 1);
    });

    // Update zombies
    zombies.forEach((z, i) => {
        z.y += z.speed;
        // Collision with player
        if(z.y + z.size > player.y && z.x < player.x + player.size && z.x + z.size > player.x) {
            progress.playerLives -= 1;
            zombies.splice(i,1);
        }
        // Collision with bullets
        bullets.forEach((b,j)=>{
            if(b.x < z.x + z.size && b.x + b.size > z.x && b.y < z.y + z.size && b.y + b.size > z.y){
                zombies.splice(i,1);
                bullets.splice(j,1);
                progress.score += 10;
            }
        });
    });

    // Advance wave
    if(zombies.length === 0) {
        progress.wave += 1;
        for(let i=0;i<progress.wave*3;i++) spawnZombie();
    }

    // Save progress
    localStorage.setItem('zombieGame', JSON.stringify(progress));
}

// Draw everything
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Player
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // Bullets
    ctx.fillStyle = 'yellow';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.size, b.size));

    // Zombies
    ctx.fillStyle = 'red';
    zombies.forEach(z => ctx.fillRect(z.x, z.y, z.size, z.size));

    // HUD
    ctx.fillStyle = 'white';
    ctx.fillText(`Score: ${progress.score}`, 10, 20);
    ctx.fillText(`Wave: ${progress.wave}`, 10, 40);
    ctx.fillText(`Lives: ${progress.playerLives}`, 10, 60);
}

// Game loop
function gameLoop() {
    update();
    draw();
    if(progress.playerLives <= 0){
        alert("Game Over! Your score: " + progress.score);
        progress = { score: 0, wave: 1, playerLives: 3 };
        localStorage.setItem('zombieGame', JSON.stringify(progress));
    }
    requestAnimationFrame(gameLoop);
}

// Start game
for(let i=0;i<progress.wave*3;i++) spawnZombie();
gameLoop();
