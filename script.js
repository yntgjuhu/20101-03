const cannon = document.getElementById('cannon');
const body = document.body;

let mouseX = 0;
let mouseY = 0;

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

function fireBullet(targetX, targetY) {
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

    function animate() {
        const currentTime = Date.now();
        const deltaTime = (currentTime - lastTime) / 1000; // seconds
        lastTime = currentTime;

        const dx = targetX - parseFloat(bullet.style.left);
        const dy = targetY - parseFloat(bullet.style.top);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 1) { // threshold to stop
            const moveDistance = speed * deltaTime;
            const ratio = moveDistance / distance;
            const newX = parseFloat(bullet.style.left) + dx * ratio;
            const newY = parseFloat(bullet.style.top) + dy * ratio;
            bullet.style.left = `${newX}px`;
            bullet.style.top = `${newY}px`;
            requestAnimationFrame(animate);
        } else {
            bullet.remove();
        }
    }
    animate();
}