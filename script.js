const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const gameOverScreen = document.getElementById("gameOver");

let gameRunning = false;

let money = 200;
let life = 10;
let wave = 1;
let score = 0;
let kills = 0;
let nextBoss = 20;

let selectedTower = "normal";

function selectTower(type) {
    selectedTower = type;
}

function startGame() {
    menu.style.display = "none";
    gameOverScreen.style.display = "none";
    gameRunning = true;
}

function restartGame() {
    money = 200;
    life = 10;
    wave = 1;
    score = 0;

    enemies = [];
    towers = [];
    bullets = [];

    spawnTimer = 0;

    gameRunning = true;
    gameOverScreen.style.display = "none";
}

// 🔊 SOM
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freq) {
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();

    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
}

// ================= JOGO =================

let enemies = [];
let towers = [];
let bullets = [];

const path = [
    { x: 0, y: 250 }, { x: 200, y: 250 }, { x: 200, y: 100 },
    { x: 500, y: 100 }, { x: 500, y: 400 }, { x: 900, y: 400 }
];

// TORRES
canvas.addEventListener("click", (e) => {
    if (!gameRunning) return;

    let x = e.offsetX;
    let y = e.offsetY;

    if (money >= 50) {
        towers.push({ x, y, cooldown: 0 });
        money -= 50;
    }
});

// SPAWN NORMAL
function spawnEnemy() {
    enemies.push({ x: 0, y: 250, hp: 100 + wave * 10, pathIndex: 0, type: "normal" });
}

// 😈 BOSS
function spawnBoss() {
    enemies.push({
        x: 0,
        y: 250,
        hp: 500 + wave * 50,
        pathIndex: 0,
        type: "boss"
    });
}

let spawnTimer = 0;

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        let target = path[e.pathIndex + 1];

        if (!target) {
            life--;
            enemies.splice(i, 1);
            continue;
        }

        let dx = target.x - e.x;
        let dy = target.y - e.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        let speed = e.type === "boss" ? 0.6 : 1;

        if (dist < 2) e.pathIndex++;
        else {
            e.x += dx / dist * speed;
            e.y += dy / dist * speed;
        }
    }
}

function updateTowers() {
    towers.forEach(t => {
        t.cooldown--;

        if (t.cooldown <= 0) {
            let target = enemies[0];
            if (target) {
                bullets.push({ x: t.x, y: t.y, target });
                playSound(600);
                t.cooldown = 50;
            }
        }
    });
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];

        if (!enemies.includes(b.target)) {
            bullets.splice(i, 1);
            continue;
        }

        let dx = b.target.x - b.x;
        let dy = b.target.y - b.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        b.x += dx / dist * 5;
        b.y += dy / dist * 5;

        if (dist < 8) {
            b.target.hp -= 40;
            playSound(200);
            bullets.splice(i, 1);
        }
    }

    enemies = enemies.filter(e => {
        if (e.hp <= 0) {
            money += 20;
            if (e.type === "boss") {
                score += 100;
            } else {
                score += 10;
                kills++;
            }
            return false;
        }
        return true;
    });
}

// DESENHO
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    enemies.forEach(e => {
        ctx.fillStyle = e.type === "boss" ? "purple" : "red";
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.type === "boss" ? 15 : 10, 0, Math.PI * 2);
        ctx.fill();
    });

    towers.forEach(t => {
        ctx.fillStyle = "blue";
        ctx.fillRect(t.x - 10, t.y - 10, 20, 20);
    });

    bullets.forEach(b => {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateUI() {
    document.getElementById("money").textContent = money;
    document.getElementById("life").textContent = life;
    document.getElementById("wave").textContent = wave;
}

// 🏆 RANKING
function saveScore() {
    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

    ranking.push(score);
    ranking.sort((a, b) => b - a);
    ranking = ranking.slice(0, 5);

    localStorage.setItem("ranking", JSON.stringify(ranking));
}

function showRanking() {
    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    let list = document.getElementById("ranking");
    list.innerHTML = "";

    ranking.forEach(s => {
        let li = document.createElement("li");
        li.textContent = s;
        list.appendChild(li);
    });
}

// GAME OVER
function checkGameOver() {
    if (life <= 0) {
        gameRunning = false;

        saveScore();

        document.getElementById("score").textContent = score;
        showRanking();

        gameOverScreen.style.display = "flex";
        playSound(100);
    }
}

// LOOP
function loop() {
    if (gameRunning) {
        spawnTimer++;

        if (spawnTimer > 60) {

            if (kills >= nextBoss && enemies.length === 0) {
                spawnBoss();
                nextBoss += 20;
            } else {
                spawnEnemy();
            }

            spawnTimer = 0;
        }

        updateEnemies();
        updateTowers();
        updateBullets();
        updateUI();
        checkGameOver();
    }

    draw();
    requestAnimationFrame(loop);
}

loop();