const cannon = document.getElementById('cannon');
const body = document.body;

const scoreDisplay = document.getElementById('scoreboard');
const abilityStatus = document.getElementById('ability-status');
let mouseX = 0;
let mouseY = 0;
let enemies = [];
let score = 0;
let eCooldown = false;
let eCooldownEnd = 0;
const eCooldownDuration = 2000;
let rCooldown = false;
let rCooldownEnd = 0;
const rCooldownDuration = 5000;

function updateScoreboard() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateAbilityStatus() {
    const now = Date.now();
    const eRemaining = eCooldown ? Math.max(0, eCooldownEnd - now) / 1000 : 0;
    const rRemaining = rCooldown ? Math.max(0, rCooldownEnd - now) / 1000 : 0;
    const eText = eCooldown ? `E Cooldown: ${eRemaining.toFixed(1)}s` : 'E Ready (press E)';
    const rText = rCooldown ? `R Cooldown: ${rRemaining.toFixed(1)}s` : 'R Ready (press R)';
    abilityStatus.textContent = `${eText}\n${rText}`;
}

function refreshCooldown() {
    const now = Date.now();

    if (eCooldown && now >= eCooldownEnd) {
        eCooldown = false;
    }
    if (rCooldown && now >= rCooldownEnd) {
        rCooldown = false;
    }

    updateAbilityStatus();

    if (eCooldown || rCooldown) {
        requestAnimationFrame(refreshCooldown);
    }
}

updateScoreboard();
updateAbilityStatus();

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateCannonRotation();
});

function updateCannonRotation() {
    const cannonRect = cannon.getBoundingClientRect();
    const cannonX = cannonRect.left + cannonRect.width / 2;
    const cannonY = cannonRect.top + cannonRect.height / 2;
    const angle = Math.atan2(mouseY - cannonY, mouseX - cannonX);
    cannon.style.transform = `rotate(${angle}rad)`;
}

document.addEventListener('click', (e) => {
    fireBullet(e.clientX, e.clientY);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'l' || e.key === 'L') {
        score = 0;
        updateScoreboard();
    }
    if (e.key === 'e' || e.key === 'E') {
        triggerSpecial();
    }
    if (e.key === 'r' || e.key === 'R') {
        triggerR();
    }
});

function triggerSpecial() {
    if (eCooldown) return;
    eCooldown = true;
    eCooldownEnd = Date.now() + eCooldownDuration;
    updateAbilityStatus();
    refreshCooldown();

    for (let i = 0; i < 10; i++) {
        const randomOffset = (Math.random() * 30 - 15) * Math.PI / 180;
        setTimeout(() => {
            fireBullet(mouseX, mouseY, randomOffset);
        }, i * 50);
    }
}

function triggerR() {
    if (rCooldown) return;
    rCooldown = true;
    rCooldownEnd = Date.now() + rCooldownDuration;
    updateAbilityStatus();
    refreshCooldown();

    fireBullet(mouseX, mouseY, 0, {
        size: 20,
        color: 'green',
        explodeOnHit: true,
    });
}

function spawnExplosion(x, y) {
    for (let i = 0; i < 25; i++) {
        const randomAngle = Math.random() * Math.PI * 2;
        createBullet(x - 5, y - 5, randomAngle, {
            size: 10,
            color: 'green',
            lifetime: 1000,
        });
    }
}

function createBullet(startX, startY, angle, options = {}) {
    const {size = 10, color = 'red', lifetime = null, explodeOnHit = false} = options;
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.width = `${size}px`;
    bullet.style.height = `${size}px`;
    bullet.style.backgroundColor = color;
    bullet.style.left = `${startX}px`;
    bullet.style.top = `${startY}px`;
    body.appendChild(bullet);

    const speed = 500; // pixels per second
    let lastTime = Date.now();
    const spawnTime = Date.now();
    const unitDirX = Math.cos(angle);
    const unitDirY = Math.sin(angle);
    const halfSize = size / 2;

    function animate() {
        const currentTime = Date.now();
        const deltaTime = (currentTime - lastTime) / 1000; // seconds
        lastTime = currentTime;

        if (lifetime && currentTime - spawnTime >= lifetime) {
            bullet.remove();
            return;
        }

        const moveDistance = speed * deltaTime;
        const newX = parseFloat(bullet.style.left) + unitDirX * moveDistance;
        const newY = parseFloat(bullet.style.top) + unitDirY * moveDistance;

        const bulletCenterX = newX + halfSize;
        const bulletCenterY = newY + halfSize;
        let hit = false;
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            const enemyX = parseFloat(enemy.style.left) + 10; // center
            const enemyY = parseFloat(enemy.style.top) + 10;
            const dx = bulletCenterX - enemyX;
            const dy = bulletCenterY - enemyY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 15) {
                if (typeof enemy.destroyEnemy === 'function') {
                    enemy.destroyEnemy();
                } else {
                    enemy.remove();
                    enemies.splice(i, 1);
                }
                score += 1;
                updateScoreboard();
                if (explodeOnHit) {
                    spawnExplosion(bulletCenterX, bulletCenterY);
                }
                hit = true;
                break;
            }
        }

        if (hit || newX < 0 || newX > window.innerWidth || newY < 0 || newY > window.innerHeight) {
            bullet.remove();
        } else {
            bullet.style.left = `${newX}px`;
            bullet.style.top = `${newY}px`;
            requestAnimationFrame(animate);
        }
    }
    animate();
}

function fireBullet(targetX, targetY, angleOffset = 0, options = {}) {
    const cannonRect = cannon.getBoundingClientRect();
    const startX = cannonRect.left + cannonRect.width;
    const startY = cannonRect.top + cannonRect.height / 2;

    const dirX = targetX - startX;
    const dirY = targetY - startY;
    const angle = Math.atan2(dirY, dirX) + angleOffset;
    createBullet(startX, startY, angle, options);
}
function spawnEnemy() {
    const cannonRect = cannon.getBoundingClientRect();
    const targetX = cannonRect.left + cannonRect.width / 2;
    const targetY = cannonRect.top + cannonRect.height / 2;

    let startX, startY;
    if (Math.random() < 0.5) {
        // From top
        startX = Math.random() * window.innerWidth;
        startY = 0;
    } else {
        // From right
        startX = window.innerWidth;
        startY = Math.random() * window.innerHeight;
    }

    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.style.left = `${startX}px`;
    enemy.style.top = `${startY}px`;
    body.appendChild(enemy);
    enemies.push(enemy);

    const speed = 100; // pixels per second
    let lastTime = Date.now();
    let removed = false;

    function destroyEnemy() {
        if (removed) return;
        removed = true;
        enemy.remove();
        const index = enemies.indexOf(enemy);
        if (index !== -1) {
            enemies.splice(index, 1);
        }
    }
    enemy.destroyEnemy = destroyEnemy;

    // Calculate direction vector
    const dirX = targetX - startX;
    const dirY = targetY - startY;
    const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);
    const unitDirX = dirX / dirLength;
    const unitDirY = dirY / dirLength;

    function animate() {
        if (removed) return;

        const currentTime = Date.now();
        const deltaTime = (currentTime - lastTime) / 1000; // seconds
        lastTime = currentTime;

        const moveDistance = speed * deltaTime;
        const newX = parseFloat(enemy.style.left) + unitDirX * moveDistance;
        const newY = parseFloat(enemy.style.top) + unitDirY * moveDistance;

        // Check if enemy reached cannon or out of bounds
        const dx = newX - targetX;
        const dy = newY - targetY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 10 || newX < -20 || newX > window.innerWidth + 20 || newY < -20 || newY > window.innerHeight + 20) {
            destroyEnemy();
        } else {
            enemy.style.left = `${newX}px`;
            enemy.style.top = `${newY}px`;
            requestAnimationFrame(animate);
        }
    }
    animate();
}

setInterval(spawnEnemy, 1000);