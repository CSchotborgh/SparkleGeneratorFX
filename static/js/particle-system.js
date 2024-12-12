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
        this.life = 1;
        this.decay = 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;

        if (this.life <= 0) {
            this.reset();
        }
    }

    draw() {
        k.drawCircle({
            pos: k.vec2(this.x, this.y),
            radius: config.size * this.life,
            color: k.rgb(...hexToRgb(config.color), this.life)
        });
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
