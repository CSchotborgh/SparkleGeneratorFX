// Initialize Kaboom.js
const k = kaboom({
    global: false,
    canvas: document.getElementById("gameCanvas"),
    width: window.innerWidth * 0.75,
    height: window.innerHeight,
    background: [0, 0, 0],
});

// Particle system configuration
let config = {
    count: 50,
    size: 5,
    speed: 5,
    color: "#ffffff",
    preset: "sparkle"
};

// Physics parameters
const physics = {
    gravity: 0.1,
    wind: 0,
    friction: 0.99,
    bounce: 0.8
};

// Particle class
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = k.mousePos().x;
        this.y = k.mousePos().y;
        this.vx = (Math.random() - 0.5) * config.speed;
        this.vy = (Math.random() - 0.5) * config.speed;
        this.ax = 0;
        this.ay = 0;
        this.life = 1;
        this.decay = 0.01 + Math.random() * 0.02;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.2;
        this.size = config.size * (0.5 + Math.random() * 0.5);
    }

    update() {
        // Apply physics
        this.ax = physics.wind;
        this.ay = physics.gravity;
        
        this.vx += this.ax;
        this.vy += this.ay;
        
        this.vx *= physics.friction;
        this.vy *= physics.friction;
        
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off screen edges
        if (this.x < 0 || this.x > k.width()) {
            this.vx *= -physics.bounce;
            this.x = this.x < 0 ? 0 : k.width();
        }
        if (this.y < 0 || this.y > k.height()) {
            this.vy *= -physics.bounce;
            this.y = this.y < 0 ? 0 : k.height();
        }
        
        // Update sparkle effect
        this.angle += this.spin;
        this.life -= this.decay;

        if (this.life <= 0) {
            this.reset();
        }
    }

    draw() {
        const sparklePoints = 4;
        const innerRadius = this.size * 0.4 * this.life;
        const outerRadius = this.size * this.life;
        
        for (let i = 0; i < sparklePoints; i++) {
            const angle = this.angle + (i * Math.PI * 2 / sparklePoints);
            const startX = this.x + Math.cos(angle) * innerRadius;
            const startY = this.y + Math.sin(angle) * innerRadius;
            const endX = this.x + Math.cos(angle) * outerRadius;
            const endY = this.y + Math.sin(angle) * outerRadius;
            
            k.drawLine({
                p1: k.vec2(startX, startY),
                p2: k.vec2(endX, endY),
                width: 2,
                color: k.rgb(...hexToRgb(config.color), this.life)
            });
        }
    }
}

// Create particle pool
let particles = Array(config.count).fill().map(() => new Particle());

// Main game loop
k.onUpdate(() => {
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
});

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [255, 255, 255];
}

// Preset configurations
const presets = {
    sparkle: {
        count: 50,
        size: 5,
        speed: 5,
        color: "#ffffff"
    },
    fire: {
        count: 70,
        size: 8,
        speed: 7,
        color: "#ff4400"
    },
    snow: {
        count: 30,
        size: 3,
        speed: 2,
        color: "#aaccff"
    }
};

// Window resize handler
window.addEventListener('resize', () => {
    k.setSize(window.innerWidth * 0.75, window.innerHeight);
});
