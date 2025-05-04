const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

const keys = {};
const shootCooldown = 300;
let gameOver = false, score = 0, lastShotTime = 0;

const player = {
  w: 120,
  h: 120,
  x: width / 2 - 60,
  y: height - 120,
  speed: 7,
  bullets: [],
  health: 100
};

const enemies = [];

const img = new Image(); img.src = 'spaceship.png';
const shootSnd = new Audio('shoot.mp3');
const missSnd = new Audio('hit.mp3');
const jojoSnd = new Audio('jojo.mp3');

const playSound = s => { const a = s.cloneNode(); a.play().catch(() => {}); };

onresize = () => {
  width = canvas.width = innerWidth;
  height = canvas.height = innerHeight;
  player.y = height - player.h;
};

onkeydown = e => keys[e.key] = true;
onkeyup = e => keys[e.key] = false;

const drawText = (text, x, y, size = 20) => {
  ctx.font = `${size}px Arial`;
  ctx.fillStyle = 'white';
  ctx.fillText(text, x, y);
};

const collide = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x &&
  a.y < b.y + b.h && a.y + a.h > b.y;

function gameLoop() {
  ctx.clearRect(0, 0, width, height);

  // Move player
  keys["ArrowLeft"] && player.x > 0 && (player.x -= player.speed);
  keys["ArrowRight"] && player.x + player.w < width && (player.x += player.speed);

  // Shoot
  const now = performance.now();
  if (keys[" "] && player.bullets.length < 5 && now - lastShotTime > shootCooldown) {
    player.bullets.push({ x: player.x + player.w / 2 - 2, y: player.y });
    lastShotTime = now;
  }

  // Draw player
  ctx.drawImage(img, player.x, player.y, player.w, player.h);

  // Bullets
  ctx.fillStyle = 'yellow';
  for (let i = player.bullets.length - 1; i >= 0; i--) {
    const b = player.bullets[i];
    b.y -= 10;
    ctx.fillRect(b.x, b.y, 4, 10);

    let hit = false;
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      if (b.x < e.x + e.w && b.x + 4 > e.x && b.y < e.y + e.h && b.y + 10 > e.y) {
        enemies.splice(j, 1);
        player.bullets.splice(i, 1);
        playSound(shootSnd);
        score++;
        hit = true;
        break;
      }
    }

    if (!hit && b.y < 0) {
      player.bullets.splice(i, 1);
      playSound(missSnd);
    }
  }

  // Spawn enemies
  if (Math.random() < 0.02)
    enemies.push({
      x: Math.random() * (width - 40),
      y: 0,
      w: 40,
      h: 30,
      speed: 2 + Math.random() * 2
    });

  // Enemies
  ctx.fillStyle = 'red';
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.y += e.speed;
    ctx.fillRect(e.x, e.y, e.w, e.h);

    if (collide({ x: player.x, y: player.y, w: player.w, h: player.h }, e)) {
      enemies.splice(i, 1);
      player.health -= 20;
      playSound(jojoSnd);
      if (player.health <= 0) {
        player.health = 0;
        gameOver = true;
      }
    } else if (e.y > height) {
      enemies.splice(i, 1);
    }
  }

  // HUD
  drawText("Score: " + score, 20, 30);
  drawText("Health", 20, 60);

  ctx.fillStyle = "red";
  ctx.fillRect(90, 45, 200, 20);
  ctx.fillStyle = "lime";
  ctx.fillRect(90, 45, 200 * (player.health / 100), 20);
  ctx.strokeStyle = "white";
  ctx.strokeRect(90, 45, 200, 20);

  if (gameOver) {
    ctx.textAlign = "center";
    drawText("Game Over", width / 2, height / 2, 60);
    drawText("Final Score: " + score, width / 2, height / 2 + 50, 30);
  } else {
    requestAnimationFrame(gameLoop);
  }
}

gameLoop();
