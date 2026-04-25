const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let money = 100;
let life = 10;

const moneyEl = document.getElementById("money");
const lifeEl = document.getElementById("life");

const path = [
    { x: 0, y: 250 },
    { x: 800, y: 250 }
];

let enemies = [];
let towers = [];
let bullets = [];

// Criar inimigos
function spawnEnemy() {
    enemies.push({
        x: path[0].x,
        y: path[0].y,
        hp: 100,
        speed: 1,
        pathIndex: 0
    });
}

// Movimento dos inimigos
function updateEnemies() {
    enemies.forEach((enemy, i) => {
        let target = path[enemy.pathIndex + 1];

        if (!target) {
            life--;
            enemies.splice(i, 1);
            return;
        }

        let dx = target.x - enemy.x;
        let dy = target.y - enemy.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 1) {
            enemy.pathIndex++;
        } else {
            enemy.x += dx / dist * enemy.speed;
            enemy.y += dy / dist * enemy.speed;
        }
    });
}

// Desenhar inimigos
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, 10, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Criar torre ao clicar
canvas.addEventListener("click", (e) => {
    if (money >= 50) {
        towers.push({
            x: e.offsetX,
            y: e.offsetY,
            range: 100,
            fireRate: 60,
            cooldown: 0
        });
        money -= 50;
    }
});

// Torres atacam
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
                    speed: 4
                });
                tower.cooldown = tower.fireRate;
            }
        }
    });
}

// Atualizar tiros
function updateBullets() {
    bullets.forEach((bullet, i) => {
        let dx = bullet.target.x - bullet.x;
        let dy = bullet.target.y - bullet.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        bullet.x += dx / dist * bullet.speed;
        bullet.y += dy / dist * bullet.speed;

        if (dist < 5) {
            bullet.target.hp -= 50;
            bullets.splice(i, 1);

            if (bullet.target.hp <= 0) {
                money += 20;
                enemies = enemies.filter(e => e !== bullet.target);
            }
        }
    });
}

// Desenhar torres
function drawTowers() {
    towers.forEach(t => {
        ctx.fillStyle = "blue";
        ctx.fillRect(t.x - 10, t.y - 10, 20, 20);
    });
}

// Desenhar tiros
function drawBullets() {
    ctx.fillStyle = "yellow";
    bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Atualizar HUD
function updateUI() {
    moneyEl.textContent = money;
    lifeEl.textContent = life;
}

// Loop principal
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateEnemies();
    updateTowers();
    updateBullets();

    drawEnemies();
    drawTowers();
    drawBullets();

    updateUI();

    requestAnimationFrame(gameLoop);
}

// Spawn automático
setInterval(spawnEnemy, 2000);

gameLoop();