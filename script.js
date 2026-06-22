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
let fCooldown = false;
let fCooldownEnd = 0;
const fCooldownDuration = 5000;
let qCooldown = false;
let qCooldownEnd = 0;
const qCooldownDuration = 5000;
let tCooldown = false;
let tCooldownEnd = 0;
const tCooldownDuration = 5000;

let enemySpeedMultiplier = 1;
let spawnIntervalMultiplier = 1;
const difficultyIncreaseInterval = 30000; // 每 30 秒提升一次
const enemySpeedIncreaseFactor = 1.1; // 速度 +10%
const spawnRateIncreaseFactor = 0.8; // 生成間隔降低 20%，敵人數量增加 20%

function updateScoreboard() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateAbilityStatus() {
    const now = Date.now();
    const eRemaining = eCooldown ? Math.max(0, eCooldownEnd - now) / 1000 : 0;
    const rRemaining = rCooldown ? Math.max(0, rCooldownEnd - now) / 1000 : 0;
    const fRemaining = fCooldown ? Math.max(0, fCooldownEnd - now) / 1000 : 0;
    const qRemaining = qCooldown ? Math.max(0, qCooldownEnd - now) / 1000 : 0;
    const tRemaining = tCooldown ? Math.max(0, tCooldownEnd - now) / 1000 : 0;
    const eText = eCooldown ? `E Cooldown: ${eRemaining.toFixed(1)}s` : 'E Ready (press E)';
    const rText = rCooldown ? `R Cooldown: ${rRemaining.toFixed(1)}s` : 'R Ready (press R)';
    const fText = fCooldown ? `F Cooldown: ${fRemaining.toFixed(1)}s` : 'F Ready (press F)';
    const qText = qCooldown ? `Q Cooldown: ${qRemaining.toFixed(1)}s` : 'Q Ready (press Q)';
    const tText = tCooldown ? `T Cooldown: ${tRemaining.toFixed(1)}s` : 'T Ready (press T)';
    abilityStatus.textContent = `${eText}\n${rText}\n${fText}\n${qText}\n${tText}`;
    // debug
    // console.log('abilityStatus updated', {eRemaining, rRemaining, fRemaining, qRemaining});
    
    // R, F, Q cooldowns shown in ability-status; no separate elements.
}

function refreshCooldown() {
    const now = Date.now();

    if (eCooldown && now >= eCooldownEnd) {
        eCooldown = false;
    }
    if (rCooldown && now >= rCooldownEnd) {
        rCooldown = false;
    }
    if (fCooldown && now >= fCooldownEnd) {
        fCooldown = false;
    }
    if (qCooldown && now >= qCooldownEnd) {
        qCooldown = false;
    }
    if (tCooldown && now >= tCooldownEnd) {
        tCooldown = false;
    }

    updateAbilityStatus();

    if (eCooldown || rCooldown || fCooldown || qCooldown || tCooldown) {
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
    console.log('Key pressed:', e.key);
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
    if (e.key === 'f' || e.key === 'F') {
        console.log('F key detected!');
        triggerF();
    }
    if (e.key === 'q' || e.key === 'Q') {
        console.log('Q key detected!');
        triggerQ();
    }
    if (e.key === 't' || e.key === 'T') {
        console.log('T key detected!');
        triggerT();
    }
});

function triggerSpecial() {
    if (eCooldown) return;
    eCooldown = true;
    eCooldownEnd = Date.now() + eCooldownDuration;
    updateAbilityStatus();
    refreshCooldown();

    for (let i = 0; i < 15; i++) {
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

function triggerF() {
    console.log('triggerF called, fCooldown:', fCooldown);
    if (fCooldown) return;
    fCooldown = true;
    fCooldownEnd = Date.now() + fCooldownDuration;
    updateAbilityStatus();
    refreshCooldown();
    console.log('F skill triggered, firing 10 bullets');

    const baseSize = 10;
    const fSize = Math.round(baseSize * 1.5);
    for (let i = 0; i < 10; i++) {
        const randomOffset = (Math.random() * 30 - 15) * Math.PI / 180;
        setTimeout(() => {
            console.log('Firing F bullet', i, 'at', mouseX, mouseY);
            fireBullet(mouseX, mouseY, randomOffset, {
                size: fSize,
                color: 'orange',
                persistOnHit: true,
                maxCollisions: 5,
                damage: 10,
            });
        }, i * 40);
    }
}

function triggerQ() {
    if (qCooldown) return;
    qCooldown = true;
    qCooldownEnd = Date.now() + qCooldownDuration;
    updateAbilityStatus();
    refreshCooldown();

    for (let i = 0; i < 5; i++) {
        const offsetAngle = (i - 2) * 0.15;
        fireBullet(mouseX, mouseY, offsetAngle, {
            color: 'purple',
            homing: true,
            size: 12,
        });
    }
}

function triggerT() {
    if (tCooldown) return;
    tCooldown = true;
    tCooldownEnd = Date.now() + tCooldownDuration;
    updateAbilityStatus();
    refreshCooldown();

    fireBullet(mouseX, mouseY, 0, {
        size: 30,
        color: 'black',
        shatterOnHit: true,
        shatterCount: 25,
        shatterSpread: 45 * Math.PI / 180,
        shatterBulletOptions: {
            size: 10,
            color: 'red',
            damage: 1,
        },
    });
}

function spawnExplosion(x, y) {
    for (let i = 0; i < 50; i++) {
        const randomAngle = Math.random() * Math.PI * 2;
        createBullet(x - 5, y - 5, randomAngle, {
            size: 10,
            color: 'green',
            lifetime: 1000,
        });
    }
}

function spawnShatterBullets(centerX, centerY, baseAngle, count, spread, options = {}) {
    const bulletSize = options.size || 10;
    const startX = centerX - bulletSize / 2;
    const startY = centerY - bulletSize / 2;
    for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0.5 : i / (count - 1);
        const angle = baseAngle - spread / 2 + t * spread;
        createBullet(startX, startY, angle, options);
    }
}

function createBullet(startX, startY, angle, options = {}) {
    const {size = 10, color = 'red', lifetime = null, explodeOnHit = false, persistOnHit = false, homing = false, damage = 1, maxCollisions = null, shatterOnHit = false, shatterCount = 0, shatterSpread = 0, shatterBulletOptions = {}} = options;
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.width = `${size}px`;
    bullet.style.height = `${size}px`;
    bullet.style.backgroundColor = color;
    bullet.style.left = `${startX}px`;
    bullet.style.top = `${startY}px`;
    body.appendChild(bullet);
    bullet.remainingHits = maxCollisions;

    const speed = 500; // pixels per second
    let lastTime = Date.now();
    const spawnTime = Date.now();
    const unitDirX = Math.cos(angle);
    const unitDirY = Math.sin(angle);

    function animate() {
        const currentTime = Date.now();
        const deltaTime = (currentTime - lastTime) / 1000; // seconds
        lastTime = currentTime;

        if (lifetime && currentTime - spawnTime >= lifetime) {
            bullet.remove();
            return;
        }

        const moveDistance = speed * deltaTime;
        const bulletX = parseFloat(bullet.style.left);
        const bulletY = parseFloat(bullet.style.top);
        let currentDirX = unitDirX;
        let currentDirY = unitDirY;
        const currentBulletWidth = parseFloat(bullet.style.width);
        const currentBulletHeight = parseFloat(bullet.style.height);
        const halfSizeX = currentBulletWidth / 2;
        const halfSizeY = currentBulletHeight / 2;
        const bulletCenterX = bulletX + halfSizeX;
        const bulletCenterY = bulletY + halfSizeY;

        if (homing && enemies.length > 0) {
            const cannonRect = cannon.getBoundingClientRect();
            const cannonCenterX = cannonRect.left + cannonRect.width / 2;
            const cannonCenterY = cannonRect.top + cannonRect.height / 2;
            let nearest = null;
            let nearestDist = Infinity;
            for (const enemy of enemies) {
                const enemySize = parseFloat(enemy.style.width) || 20;
                const enemyX = parseFloat(enemy.style.left) + enemySize / 2;
                const enemyY = parseFloat(enemy.style.top) + enemySize / 2;
                const dx = enemyX - cannonCenterX;
                const dy = enemyY - cannonCenterY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearest = enemy;
                }
            }
            if (nearest) {
                const nearestSize = parseFloat(nearest.style.width) || 20;
                const targetX = parseFloat(nearest.style.left) + nearestSize / 2;
                const targetY = parseFloat(nearest.style.top) + nearestSize / 2;
                const dx = targetX - bulletCenterX;
                const dy = targetY - bulletCenterY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    currentDirX = dx / dist;
                    currentDirY = dy / dist;
                }
            }
        }

        const newX = bulletX + currentDirX * moveDistance;
        const newY = bulletY + currentDirY * moveDistance;

        const bulletCenterX2 = newX + halfSizeX;
        const bulletCenterY2 = newY + halfSizeY;
        let hit = false;
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            const enemySize = parseFloat(enemy.style.width) || 20;
            const enemyX = parseFloat(enemy.style.left) + enemySize / 2;
            const enemyY = parseFloat(enemy.style.top) + enemySize / 2;
            const dx = bulletCenterX2 - enemyX;
            const dy = bulletCenterY2 - enemyY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const collisionThreshold = enemySize / 2 + Math.max(halfSizeX, halfSizeY);
            if (distance < collisionThreshold) {
                if (enemy.hp > damage) {
                    enemy.hp -= damage;
                    if (explodeOnHit) {
                        spawnExplosion(bulletCenterX, bulletCenterY);
                    }
                    if (shatterOnHit) {
                        const baseAngle = Math.atan2(currentDirY, currentDirX);
                        spawnShatterBullets(bulletCenterX, bulletCenterY, baseAngle, shatterCount, shatterSpread, shatterBulletOptions);
                    }
                    if (!persistOnHit) {
                        bullet.remove();
                    } else if (bullet.remainingHits !== null) {
                        bullet.remainingHits -= 1;
                        if (bullet.remainingHits <= 0) {
                            bullet.remove();
                            return;
                        }
                    }
                    hit = true;
                    break;
                }
                if (typeof enemy.destroyEnemy === 'function') {
                    enemy.destroyEnemy();
                } else {
                    enemy.remove();
                    enemies.splice(i, 1);
                }
                score += enemy.scoreValue || 1;
                updateScoreboard();

                if (explodeOnHit) {
                    spawnExplosion(bulletCenterX, bulletCenterY);
                }
                if (shatterOnHit) {
                    const baseAngle = Math.atan2(currentDirY, currentDirX);
                    spawnShatterBullets(bulletCenterX, bulletCenterY, baseAngle, shatterCount, shatterSpread, shatterBulletOptions);
                }
                if (!persistOnHit) {
                    bullet.remove();
                    return;
                }

                if (bullet.remainingHits !== null) {
                    bullet.remainingHits -= 1;
                    if (bullet.remainingHits <= 0) {
                        bullet.remove();
                        hit = true;
                        break;
                    }
                }
                hit = true;
                break;
            }
        }

        // continue animating for persistOnHit bullets after first hit
        if (hit) {
            if (!persistOnHit) {
                // already removed above
                return;
            }
            requestAnimationFrame(animate);
        } else if (newX < 0 || newX > window.innerWidth || newY < 0 || newY > window.innerHeight) {
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
        // From top-right half of the screen
        startX = window.innerWidth / 2 + Math.random() * (window.innerWidth / 2);
        startY = 0;
    } else {
        // From right side, upper half
        startX = window.innerWidth;
        startY = Math.random() * (window.innerHeight / 2);
    }

    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.style.left = `${startX}px`;
    enemy.style.top = `${startY}px`;
    body.appendChild(enemy);
    enemies.push(enemy);
    enemy.hp = 1;
    enemy.speed = 100 * enemySpeedMultiplier;
    enemy.scoreValue = 1;

    const speed = enemy.speed; // pixels per second
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

function spawnHeavyEnemy() {
    const cannonRect = cannon.getBoundingClientRect();
    const targetX = cannonRect.left + cannonRect.width / 2;
    const targetY = cannonRect.top + cannonRect.height / 2;

    let startX, startY;
    if (Math.random() < 0.5) {
        startX = window.innerWidth / 2 + Math.random() * (window.innerWidth / 2);
        startY = 0;
    } else {
        startX = window.innerWidth;
        startY = Math.random() * (window.innerHeight / 2);
    }

    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.style.left = `${startX}px`;
    enemy.style.top = `${startY}px`;
    enemy.style.width = `40px`;
    enemy.style.height = `40px`;
    enemy.style.backgroundColor = 'red';
    body.appendChild(enemy);
    enemies.push(enemy);
    enemy.hp = 5;
    enemy.speed = 100 * 0.5 * enemySpeedMultiplier;
    enemy.scoreValue = 10;

    const speed = enemy.speed; // pixels per second
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

function spawnFastEnemy() {
    const cannonRect = cannon.getBoundingClientRect();
    const targetX = cannonRect.left + cannonRect.width / 2;
    const targetY = cannonRect.top + cannonRect.height / 2;

    let startX, startY;
    if (Math.random() < 0.5) {
        startX = window.innerWidth / 2 + Math.random() * (window.innerWidth / 2);
        startY = 0;
    } else {
        startX = window.innerWidth;
        startY = Math.random() * (window.innerHeight / 2);
    }

    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.style.left = `${startX}px`;
    enemy.style.top = `${startY}px`;
    enemy.style.width = `20px`;
    enemy.style.height = `20px`;
    enemy.style.backgroundColor = 'blue';
    enemy.style.borderRadius = '50%';
    body.appendChild(enemy);
    enemies.push(enemy);
    enemy.hp = 1;
    enemy.speed = 100 * 1.25 * enemySpeedMultiplier;
    enemy.scoreValue = 3;

    const speed = enemy.speed; // pixels per second
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

function getSpawnInterval() {
    return Math.max(100, (1000 - Math.floor(score / 10) * 1) * spawnIntervalMultiplier);
}

function increaseDifficulty() {
    enemySpeedMultiplier *= enemySpeedIncreaseFactor;
    spawnIntervalMultiplier *= spawnRateIncreaseFactor;
}

function scheduleDifficultyIncrease() {
    setInterval(() => {
        increaseDifficulty();
    }, difficultyIncreaseInterval);
}

function scheduleHeavyEnemySpawn() {
    setInterval(() => {
        spawnHeavyEnemy();
    }, 10000);
}

function scheduleFastEnemySpawn() {
    setInterval(() => {
        spawnFastEnemy();
    }, 5000);
}

function spawnBoss() {
    const cannonRect = cannon.getBoundingClientRect();
    const targetX = cannonRect.left + cannonRect.width / 2;
    const targetY = cannonRect.top + cannonRect.height / 2;

    let startX, startY;
    if (Math.random() < 0.5) {
        startX = window.innerWidth / 2 + Math.random() * (window.innerWidth / 2);
        startY = 0;
    } else {
        startX = window.innerWidth;
        startY = Math.random() * (window.innerHeight / 2);
    }

    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.style.left = `${startX}px`;
    enemy.style.top = `${startY}px`;
    enemy.style.width = `150px`;
    enemy.style.height = `150px`;
    enemy.style.backgroundColor = 'gold';
    enemy.style.borderRadius = '10px';
    body.appendChild(enemy);
    enemies.push(enemy);
    enemy.hp = 50;
    enemy.speed = 100 * 0.2 * enemySpeedMultiplier;
    enemy.scoreValue = 50;

    const speed = enemy.speed; // pixels per second
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

        const dx = newX - targetX;
        const dy = newY - targetY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 10 || newX < -200 || newX > window.innerWidth + 200 || newY < -200 || newY > window.innerHeight + 200) {
            destroyEnemy();
        } else {
            enemy.style.left = `${newX}px`;
            enemy.style.top = `${newY}px`;
            requestAnimationFrame(animate);
        }
    }
    animate();
}

function scheduleBossSpawn() {
    setInterval(() => {
        spawnBoss();
    }, 30000);
}

function scheduleNextSpawn() {
    setTimeout(() => {
        spawnEnemy();
        scheduleNextSpawn();
    }, getSpawnInterval());
}

scheduleNextSpawn();
scheduleDifficultyIncrease();
scheduleHeavyEnemySpawn();
scheduleFastEnemySpawn();
scheduleBossSpawn();
// NOTE: removed duplicate calls to avoid double-spawning enemies