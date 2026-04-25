const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let money = 100;
let life = 10;
let wave = 1;

const moneyEl = document.getElementById("money");
const lifeEl = document.getElementById("life");
const waveEl = document.getElementById("wave");

// Caminho
const path = [
    { x: 0, y: 250 },
    { x: 200, y: 250 },
    { x: 200, y: 100 },
    { x: 500, y: 100 },
    { x: 500, y: 400 },
    { x: 900, y: 400 }
];

let enemies = [];
let towers = [];
let bullets = [];
let explosions = [];

let spawnCount = 0;

// Desenhar caminho
function drawPath() {
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);

    for (let p of path) {
        ctx.lineTo(p.x, p.y);
    }

    ctx.stroke();
}

// Spawn inimigo
function spawnEnemy() {
    enemies.push({
        x: path[0].x,
        y: path[0].y,
        hp: 100 + wave * 20,
        maxHp: 100 + wave * 20,
        speed: 1 + wave * 0.2,
        pathIndex: 0
    });
}

// Waves
let spawnTimer = 0;

function handleWave() {
    spawnTimer++;

    if (spawnCount < wave * 5) {
        if (spawnTimer > 60) { // controla velocidade (60 frames ≈ 1s)
            spawnEnemy();
            spawnCount++;
            spawnTimer = 0;
        }
    } else if (enemies.length === 0) {
        wave++;
        spawnCount = 0;
    }
}
// Movimento inimigos (corrigido splice)
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        let target = path[enemy.pathIndex + 1];

        if (!target) {
            life--;
            enemies.splice(i, 1);
            continue;
        }

        let dx = target.x - enemy.x;
        let dy = target.y - enemy.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
            enemy.pathIndex++;
        } else {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
        }
    }
}

// Desenhar inimigos
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // barra de vida
        ctx.fillStyle = "green";
        ctx.fillRect(enemy.x - 10, enemy.y - 18, 20 * (enemy.hp / enemy.maxHp), 3);
    });
}

// Criar torre
canvas.addEventListener("click", (e) => {
    if (money >= 50) {
        towers.push({
            x: e.offsetX,
            y: e.offsetY,
            range: 120,
            fireRate: 50,
            cooldown: 0
        });
        money -= 50;
    }
});

// Torres
function updateTowers() {
    towers.forEach(tower => {
        tower.cooldown--;

        if (tower.cooldown <= 0) {
            let target = enemies.find(enemy => {
                let dx = enemy.x - tower.x;
                let dy = enemy.y - tower.y;
                return Math.sqrt(dx * dx + dy * dy) < tower.range;
            });

            if (target) {
                bullets.push({
                    x: tower.x,
                    y: tower.y,
                    target: target,
                    speed: 5
                });
                tower.cooldown = tower.fireRate;
            }
        }
    });
}

// 🔥 CORRIGIDO AQUI
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];

        // Se alvo morreu
        if (!enemies.includes(bullet.target)) {
            bullets.splice(i, 1);
            continue;
        }

        let dx = bullet.target.x - bullet.x;
        let dy = bullet.target.y - bullet.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist === 0) continue;

        bullet.x += (dx / dist) * bullet.speed;
        bullet.y += (dy / dist) * bullet.speed;

        // impacto
        if (dist < 8) {
            bullet.target.hp -= 40;

            explosions.push({ x: bullet.x, y: bullet.y, radius: 10 });

            bullets.splice(i, 1);

            if (bullet.target.hp <= 0) {
                money += 20;
                enemies = enemies.filter(e => e !== bullet.target);
            }
        }
    }
}

// Explosões
function drawExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        let exp = explosions[i];

        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.fill();

        exp.radius += 1;

        if (exp.radius > 15) {
            explosions.splice(i, 1);
        }
    }
}

// Torres
function drawTowers() {
    towers.forEach(t => {
        ctx.fillStyle = "blue";
        ctx.fillRect(t.x - 10, t.y - 10, 20, 20);

        ctx.strokeStyle = "rgba(0,0,255,0.2)";
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.range, 0, Math.PI * 2);
        ctx.stroke();
    });
}

// Tiros
function drawBullets() {
    ctx.fillStyle = "yellow";
    bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

// UI
function updateUI() {
    moneyEl.textContent = money;
    lifeEl.textContent = life;
    waveEl.textContent = wave;
}

// Game Over
function checkGameOver() {
    if (life <= 0) {
        alert("💀 Game Over!");
        location.reload();
    }
}

// Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPath();

    handleWave(); // ← fica só aqui

    updateEnemies();
    updateTowers();
    updateBullets();

    drawEnemies();
    drawTowers();
    drawBullets();
    drawExplosions();

    updateUI();
    checkGameOver();

    requestAnimationFrame(gameLoop);
}

// spawn


gameLoop();