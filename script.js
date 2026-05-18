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
const eCooldownDuration = 3000;

function updateScoreboard() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateAbilityStatus() {
    if (eCooldown) {
        const remaining = Math.max(0, eCooldownEnd - Date.now()) / 1000;
        abilityStatus.textContent = `E Cooldown: ${remaining.toFixed(1)}s`;
    } else {
        abilityStatus.textContent = 'E Ready (press E)';
    }
}

function refreshCooldown() {
    if (!eCooldown) return;
    if (Date.now() >= eCooldownEnd) {
        eCooldown = false;
        updateAbilityStatus();
        return;
    }
    updateAbilityStatus();
    requestAnimationFrame(refreshCooldown);
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

function fireBullet(targetX, targetY, angleOffset = 0) {
    const cannonRect = cannon.getBoundingClientRect();
    const startX = cannonRect.left + cannonRect.width;
    const startY = cannonRect.top + cannonRect.height / 2;

    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.left = `${startX}px`;
    bullet.style.top = `${startY}px`;
    body.appendChild(bullet);

    const speed = 500; // pixels per second
    let lastTime = Date.now();

    // Calculate direction vector with optional angle offset
    const dirX = targetX - startX;
    const dirY = targetY - startY;
    const dirLength = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
    const angle = Math.atan2(dirY, dirX) + angleOffset;
    const unitDirX = Math.cos(angle);
    const unitDirY = Math.sin(angle);

    function animate() {
        const currentTime = Date.now();
        const deltaTime = (currentTime - lastTime) / 1000; // seconds
        lastTime = currentTime;

        const moveDistance = speed * deltaTime;
        const newX = parseFloat(bullet.style.left) + unitDirX * moveDistance;
        const newY = parseFloat(bullet.style.top) + unitDirY * moveDistance;

        // Check collision with enemies using bullet center
        const bulletCenterX = newX + 5;
        const bulletCenterY = newY + 5;
        let hit = false;
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            const enemyX = parseFloat(enemy.style.left) + 10; // center
            const enemyY = parseFloat(enemy.style.top) + 10;
            const dx = bulletCenterX - enemyX;
            const dy = bulletCenterY - enemyY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 15) { // collision threshold
                if (typeof enemy.destroyEnemy === 'function') {
                    enemy.destroyEnemy();
                } else {
                    enemy.remove();
                    enemies.splice(i, 1);
                }
                score += 1;
                updateScoreboard();
                hit = true;
                break;
            }
        }

        // Check if bullet is out of bounds or hit
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