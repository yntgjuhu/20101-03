const cannon = document.getElementById('cannon');
const body = document.body;

let mouseX = 0;
let mouseY = 0;

// 監聽鼠標移動
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateCannonRotation();
});

// 更新火炮旋轉
function updateCannonRotation() {
    const cannonRect = cannon.getBoundingClientRect();
    const centerX = cannonRect.left + 25; // transform-origin x
    const centerY = cannonRect.top + 25; // transform-origin y
    const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
    cannon.style.transform = `rotate(${angle}rad)`;
}

// 監聽點擊發射
document.addEventListener('click', (e) => {
    if (e.button === 0) { // 左鍵
        fireBullet();
    }
});

// 發射子彈
function fireBullet() {
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    
    // 發射點：火炮的槍管末端
    const cannonRect = cannon.getBoundingClientRect();
    const startX = cannonRect.left + 130; // 約槍管末端
    const startY = cannonRect.top + 25;
    
    bullet.style.left = `${startX}px`;
    bullet.style.top = `${startY}px`;
    
    body.appendChild(bullet);
    
    // 動畫子彈
    const targetX = mouseX;
    const targetY = mouseY;
    const distance = Math.sqrt((targetX - startX) ** 2 + (targetY - startY) ** 2);
    const speed = 5; // 像素每幀
    const frames = distance / speed;
    let frame = 0;
    
    function animate() {
        frame++;
        const progress = frame / frames;
        if (progress >= 1) {
            bullet.remove();
            return;
        }
        const currentX = startX + (targetX - startX) * progress;
        const currentY = startY + (targetY - startY) * progress;
        bullet.style.left = `${currentX}px`;
        bullet.style.top = `${currentY}px`;
        requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
}

// 初始化旋轉
updateCannonRotation();