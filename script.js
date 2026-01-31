const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Resize for mobile
function resize() {
  canvas.width = Math.min(window.innerWidth, 400);
  canvas.height = Math.min(window.innerHeight * 0.8, 600);
}
resize();
window.addEventListener("resize", resize);

// Player car
let player;
let enemies;
let score;
let gameOver;

// Controls
let left = false;
let right = false;

function resetGame() {
  player = {
    x: 180,
    y: 450,
    width: 40,
    height: 70,
    speed: 5
  };

  enemies = [];
  score = 0;
  gameOver = false;
}

resetGame();

// Keyboard
document.addEventListener("keydown", e => {
  if (e.code === "ArrowLeft") left = true;
  if (e.code === "ArrowRight") right = true;
});

document.addEventListener("keyup", e => {
  if (e.code === "ArrowLeft") left = false;
  if (e.code === "ArrowRight") right = false;
});

// Touch controls + Restart
canvas.addEventListener("touchstart", e => {
  if (gameOver) {
    resetGame();
    return;
  }

  let touchX = e.touches[0].clientX;
  if (touchX < window.innerWidth / 2) left = true;
  else right = true;
});

canvas.addEventListener("touchend", () => {
  left = false;
  right = false;
});

// Mouse click restart (for PC)
canvas.addEventListener("mousedown", () => {
  if (gameOver) resetGame();
});

// Enemy cars
function addEnemy() {
  let x = Math.random() * (canvas.width - 40);
  enemies.push({
    x: x,
    y: -80,
    width: 40,
    height: 70,
    speed: 3 + Math.random() * 2
  });
}

setInterval(addEnemy, 1200);

// Game loop
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameOver) {
    // Move player
    if (left) player.x -= player.speed;
    if (right) player.x += player.speed;

    // Keep in bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width)
      player.x = canvas.width - player.width;

    // Draw player
    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Enemies
    for (let e of enemies) {
      e.y += e.speed;

      ctx.fillStyle = "red";
      ctx.fillRect(e.x, e.y, e.width, e.height);

      // Collision
      if (
        player.x < e.x + e.width &&
        player.x + player.width > e.x &&
        player.y < e.y + e.height &&
        player.y + player.height > e.y
      ) {
        gameOver = true;
      }

      // Passed enemy = score
      if (e.y > canvas.height) {
        score++;
        e.y = -100;
        e.x = Math.random() * (canvas.width - 40);
      }
    }
  } else {
    ctx.fillStyle = "yellow";
    ctx.font = "36px Arial";
    ctx.fillText("Game Over", 90, 300);
    ctx.font = "18px Arial";
    ctx.fillText("Tap to Restart", 115, 340);
  }

  // Score
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  requestAnimationFrame(update);
}

update();
