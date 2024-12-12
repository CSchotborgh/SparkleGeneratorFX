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
        
        // Update rotation
        this.angle += this.spin;
        this.life -= this.decay;

        if (this.life <= 0) {
            this.reset();
        }
    }

    draw() {
        if (this.sprite) {
            k.drawSprite({
                sprite: this.sprite,
                pos: k.vec2(this.x, this.y),
                scale: k.vec2(this.size / 20),
                angle: this.angle,
                color: k.rgb(...hexToRgb(config.color), this.life),
                anchor: "center",
            });
        } else {
            // Fallback to basic particle if no sprite is loaded
            k.drawCircle({
                pos: k.vec2(this.x, this.y),
                radius: this.size,
                color: k.rgb(...hexToRgb(config.color), this.life),
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
