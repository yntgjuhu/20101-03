const cannon = document.getElementById('cannon');
const body = document.body;

const scoreDisplay = document.getElementById('scoreboard');
const abilityStatus = document.getElementById('ability-status');
const rCooldownDisplay = document.getElementById('r-cooldown');
const fCooldownDisplay = document.getElementById('f-cooldown');
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
const fCooldownDuration = 8000;

function updateScoreboard() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateAbilityStatus() {
    const now = Date.now();
    const eRemaining = eCooldown ? Math.max(0, eCooldownEnd - now) / 1000 : 0;
    const rRemaining = rCooldown ? Math.max(0, rCooldownEnd - now) / 1000 : 0;
    const fRemaining = fCooldown ? Math.max(0, fCooldownEnd - now) / 1000 : 0;
    const eText = eCooldown ? `E Cooldown: ${eRemaining.toFixed(1)}s` : 'E Ready (press E)';
    const rText = rCooldown ? `R Cooldown: ${rRemaining.toFixed(1)}s` : 'R Ready (press R)';
    abilityStatus.textContent = `${eText}\n${rText}`;
    
    // Update R cooldown display
    if (rCooldown) {
        const rPercent = Math.max(0, (rCooldownDuration - (now - rCooldownEnd + rCooldownDuration)) / rCooldownDuration * 100);
        rCooldownDisplay.textContent = `R: ${rRemaining.toFixed(1)}s`;
        rCooldownDisplay.style.borderColor = `rgb(${Math.floor(255 * (1 - rPercent / 100))}, ${Math.floor(144 + 111 * (rPercent / 100))}, ${Math.floor(144)})`;
    } else {
        rCooldownDisplay.textContent = `R Ready (按 R)`;
        rCooldownDisplay.style.borderColor = '#90EE90';
    }

    // Update F cooldown display
    if (fCooldown) {
        const fPercent = Math.max(0, (fCooldownDuration - (now - fCooldownEnd + fCooldownDuration)) / fCooldownDuration * 100);
        fCooldownDisplay.textContent = `F: ${fRemaining.toFixed(1)}s`;
        fCooldownDisplay.style.borderColor = `rgb(${Math.floor(255 * (1 - fPercent / 100))}, ${Math.floor(165 + 90 * (fPercent / 100))}, ${Math.floor(0)})`;
    } else {
        fCooldownDisplay.textContent = `F Ready (按 F)`;
        fCooldownDisplay.style.borderColor = '#FFA500';
    }
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

    updateAbilityStatus();

    if (eCooldown || rCooldown || fCooldown) {
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
    if (e.key === 'f' || e.key === 'F') {
        triggerF();
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

function triggerF() {
    if (fCooldown) return;
    fCooldown = true;
    fCooldownEnd = Date.now() + fCooldownDuration;
    updateAbilityStatus();
    refreshCooldown();

    const baseSize = 10;
    const fSize = Math.round(baseSize * 1.5);
    for (let i = 0; i < 6; i++) {
        const randomOffset = (Math.random() * 30 - 15) * Math.PI / 180;
        setTimeout(() => {
            fireBullet(mouseX, mouseY, randomOffset, {
                size: fSize,
                color: 'orange',
                persistOnHit: true,
            });
        }, i * 40);
    }
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
    const {size = 10, color = 'red', lifetime = null, explodeOnHit = false, persistOnHit = false} = options;
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
            const collisionThreshold = 10 + halfSize; // enemy radius (10) + bullet radius
            if (distance < collisionThreshold) {
                if (typeof enemy.destroyEnemy === 'function') {
                    enemy.destroyEnemy();
                } else {
                    enemy.remove();
                    enemies.splice(i, 1);
                }
                score += 1;
                updateScoreboard();

                if (persistOnHit) {
                    // transform bullet: enlarge to 10x and fade out over 1s, do not remove immediately
                    if (!bullet._transformed) {
                        bullet._transformed = true;
                        const origSize = size;
                        const newSize = origSize * 10;
                        const centerX = bulletCenterX;
                        const centerY = bulletCenterY;
                        bullet.style.backgroundColor = 'orange';
                        bullet.style.width = `${newSize}px`;
                        bullet.style.height = `${newSize}px`;
                        bullet.style.left = `${centerX - newSize / 2}px`;
                        bullet.style.top = `${centerY - newSize / 2}px`;
                        bullet.style.transition = 'opacity 1s linear, width 0.2s linear, height 0.2s linear, left 0.2s linear, top 0.2s linear';
                        // fade out after a tick so transition can apply
                        setTimeout(() => {
                            bullet.style.opacity = '0';
                        }, 20);
                        setTimeout(() => {
                            bullet.remove();
                        }, 1020);
                    }
                } else {
                    if (explodeOnHit) {
                        spawnExplosion(bulletCenterX, bulletCenterY);
                    }
                    bullet.remove();
                }
                hit = true;
                break;
            }
        }

        // only remove immediately if hit and not persistOnHit
        if (hit) {
            if (!persistOnHit) {
                // already removed above
            }
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