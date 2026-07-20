const canvas = document.getElementById('gradient-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let time = 0;

function resize() {
    width = canvas.width = window.innerWidth;
    const heroSection = document.querySelector('.hero');
    // Ensure we cover the skewed area
    height = canvas.height = heroSection.offsetHeight * 1.5;
}

window.addEventListener('resize', resize);
resize();

function animate() {
    time += 0.005;
    ctx.clearRect(0, 0, width, height);
    
    // Draw some blurred moving shapes to simulate stripe's mesh gradient
    const gradient1 = ctx.createRadialGradient(
        width * (0.5 + Math.sin(time) * 0.3), height * (0.5 + Math.cos(time * 0.8) * 0.3), 0,
        width * 0.5, height * 0.5, width * 0.8
    );
    gradient1.addColorStop(0, 'rgba(99, 91, 255, 0.15)'); // brand color
    gradient1.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient1;
    ctx.fillRect(0, 0, width, height);

    const gradient2 = ctx.createRadialGradient(
        width * (0.3 + Math.cos(time * 1.2) * 0.2), height * (0.7 + Math.sin(time * 1.1) * 0.2), 0,
        width * 0.3, height * 0.7, width * 0.6
    );
    gradient2.addColorStop(0, 'rgba(0, 212, 255, 0.1)'); // secondary blue/cyan
    gradient2.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient2;
    ctx.fillRect(0, 0, width, height);

    const gradient3 = ctx.createRadialGradient(
        width * (0.8 + Math.sin(time * 0.5) * 0.2), height * (0.2 + Math.cos(time * 1.5) * 0.2), 0,
        width * 0.8, height * 0.2, width * 0.5
    );
    gradient3.addColorStop(0, 'rgba(255, 120, 200, 0.08)'); // pinkish
    gradient3.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient3;
    ctx.fillRect(0, 0, width, height);

    requestAnimationFrame(animate);
}

animate();

// Interactivity: subtle card tilt on mouse move
const cards = document.querySelectorAll('.feature-card');

cards.forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.transition = 'none';
        card.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
        card.style.zIndex = '1';
    });
});
