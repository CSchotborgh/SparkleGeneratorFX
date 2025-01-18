// Initialize dimensions and configurations
const initialWidth = window.innerWidth * 0.75;
const initialHeight = window.innerHeight;

// Initialize Kaboom.js
const k = kaboom({
    global: false,
    canvas: document.getElementById("gameCanvas"),
    width: initialWidth,
    height: initialHeight,
    background: [46, 204, 113]
});

// Physics configuration
const physics = {
    gravity: 0.1,
    wind: 0,
    friction: 0.99,
    bounce: 0.8,
    airResistance: 0.02,
    turbulence: 0.1,
    vortexStrength: 0,
    vortexCenter: { x: initialWidth / 2, y: initialHeight / 2 },
    particleMass: 1.0,
    particleLife: 1.0,
    acceleration: 1.0,
    collisionEnabled: false
};

// Initial configuration
let config = {
    count: 50,
    size: 5,
    speed: 5,
    color: "#ffffff",
    preset: "sparkle",
    trailLength: 10,
    reverseTrail: false
};

// Particle class definition
class Particle {
    constructor() {
        this.trail = [];
        this.trailLength = config.trailLength || 10;
        this.reset();
    }

    reset() {
        this.x = k.width() / 2;
        this.y = k.height() / 2;
        this.vx = (Math.random() - 0.5) * config.speed;
        this.vy = (Math.random() - 0.5) * config.speed;
        this.life = physics.particleLife;
        this.decay = (0.01 + Math.random() * 0.02) / physics.particleLife;
        this.trail = Array(this.trailLength).fill().map(() => ({
            x: this.x,
            y: this.y
        }));
    }

    update() {
        // Apply physics
        this.vx += physics.wind;
        this.vy += physics.gravity;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Apply friction
        this.vx *= physics.friction;
        this.vy *= physics.friction;

        // Update trail
        if (config.reverseTrail) {
            this.trail.shift();
            this.trail.push({ x: this.x, y: this.y });
        } else {
            this.trail.pop();
            this.trail.unshift({ x: this.x, y: this.y });
        }

        // Handle boundaries
        if (this.x < 0 || this.x > k.width()) {
            this.vx *= -physics.bounce;
            this.x = this.x < 0 ? 0 : k.width();
        }
        if (this.y < 0 || this.y > k.height()) {
            this.vy *= -physics.bounce;
            this.y = this.y < 0 ? 0 : k.height();
        }

        // Update life
        this.life -= this.decay;
        if (this.life <= 0) this.reset();
    }

    draw() {
        // Draw trail
        this.trail.forEach((point, i) => {
            const opacity = (1 - i / this.trail.length) * this.life * 0.5;
            k.drawCircle({
                pos: k.vec2(point.x, point.y),
                radius: config.size * (1 - i / this.trail.length),
                color: k.rgb(...hexToRgb(config.color), opacity)
            });
        });

        // Draw particle
        k.drawCircle({
            pos: k.vec2(this.x, this.y),
            radius: config.size,
            color: k.rgb(...hexToRgb(config.color), this.life)
        });
    }
}

// Create particle pool
let particles = Array(config.count).fill().map(() => new Particle());

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [255, 255, 255];
}

// Main game loop
k.onUpdate(() => {
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
});