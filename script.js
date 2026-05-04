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
    fireBullet();
});

function fireBullet() {
    const cannonRect = cannon.getBoundingClientRect();
    const startX = cannonRect.left + cannonRect.width;
    const startY = cannonRect.top + cannonRect.height / 2;

    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.left = `${startX}px`;
    bullet.style.top = `${startY}px`;
    body.appendChild(bullet);

    const duration = 1000; // 1 second
    const startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        if (progress < 1) {
            const currentX = startX + (mouseX - startX) * progress;
            const currentY = startY + (mouseY - startY) * progress;
            bullet.style.left = `${currentX}px`;
            bullet.style.top = `${currentY}px`;
            requestAnimationFrame(animate);
        } else {
            bullet.remove();
        }
    }
    animate();
}