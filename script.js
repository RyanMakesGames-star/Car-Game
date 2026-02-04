const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

window.addEventListener("gamepadconnected", () => {
  console.log("Xbox Controller connected!");
});

// Resize for mobile
function resize() {
  canvas.width = Math.min(window.innerWidth, 400);
  canvas.height = Math.min(window.innerHeight * 0.8, 600);
}
resize();
window.addEventListener("resize", resize);

// Game state
let player;
let enemies;
let score;
let gameOver;
let paused = false;

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
  paused = false;
}

resetGame();

// ==================
// KEYBOARD
// ==================
document.addEventListener("keydown", e => {
  if (e.code === "ArrowLeft") left = true;
  if (e.code === "ArrowRight") right = true;
  if (e.code === "Escape") paused = !paused;
});

document.addEventListener("keyup", e => {
  if (e.code === "ArrowLeft") left = false;
  if (e.code === "ArrowRight") right = false;
});

// ==================
// TOUCH
// ==================
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

// Mouse restart
canvas.addEventListener("mousedown", () => {
  if (gameOver) resetGame();
});

// ==================
// ENEMIES
// ==================
function addEnemy() {
  let x = Math.random() * (canvas.width - 40);
  enemies.push({
    x,
    y: -80,
    width: 40,
    height: 70,
    speed: 3 + Math.random() * 2
  });
}

setInterval(addEnemy, 1200);

// ===========================
// 🎮 XBOX CONTROLLER (FIXED)
// ===========================
let bWasPressed = false;

setInterval(() => {
  const gp = navigator.getGamepads()[0];
  if (!gp) return;

  const stickX = gp.axes[0];

  // Reset
  left = false;
  right = false;

  if (!paused) {
    if (stickX < -0.3) left = true;
    if (stickX > 0.3) right = true;

    // D-Pad
    if (gp.buttons[14]?.pressed) left = true;
    if (gp.buttons[15]?.pressed) right = true;
  }

  // A = Restart
  if (gp.buttons[0]?.pressed && gameOver) {
    resetGame();
  }

  // B = Pause
  const bPressed = gp.buttons[1]?.pressed;
  if (bPressed && !bWasPressed) {
    paused = !paused;
  }
  bWasPressed = bPressed;

}, 100);

// ==================
// GAME LOOP
// ==================
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameOver && !paused) {
    if (left) player.x -= player.speed;
    if (right) player.x += player.speed;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width)
      player.x = canvas.width - player.width;

    // Player
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

      // Score
      if (e.y > canvas.height) {
        score++;
        e.y = -100;
        e.x = Math.random() * (canvas.width - 40);
      }
    }
  }

  // PAUSED
  if (paused && !gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "36px Arial";
    ctx.fillText("PAUSED", 120, 300);
    ctx.font = "18px Arial";
    ctx.fillText("Press B or Esc", 105, 340);
  }

  // GAME OVER
  if (gameOver) {
    ctx.fillStyle = "yellow";
    ctx.font = "36px Arial";
    ctx.fillText("Game Over", 90, 300);
    ctx.font = "18px Arial";
    ctx.fillText("Tap / A to Restart", 90, 340);
  }

  // Score
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  // Controller Debug
  const gp = navigator.getGamepads()[0];
  ctx.fillText(gp ? "Controller: ON" : "Controller: OFF", 10, 60);

  requestAnimationFrame(update);
}

update();
