// Initialize dimensions
const initialWidth = window.innerWidth * 0.75;
const initialHeight = window.innerHeight;

// Click/touch handling state
let lastClickTime = 0;
const doubleClickDelay = 300; // milliseconds

// Initialize Kaboom.js
const k = kaboom({
    global: false,
    canvas: document.getElementById("gameCanvas"),
    width: initialWidth,
    height: initialHeight,
    background: [0, 0, 0],
});

// Physics parameters
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
    collisionEnabled: false
};

// Configuration object for particle system
const config = {
    count: 50,
    size: 5,
    speed: 5,
    color: "#ffffff",
    preset: "sparkle",
    trailLength: 10,
    reverseTrail: false,
    followMouse: true // Track if particles should follow mouse
};

// Particle class
class Particle {
    constructor() {
        this.reset();
        this.trailLength = config.trailLength;
        this.trail = Array(this.trailLength).fill().map(() => ({
            x: this.x,
            y: this.y,
            angle: 0
        }));
    }

    reset() {
        if (config.followMouse) {
            const mousePos = k.mousePos();
            this.x = mousePos.x;
            this.y = mousePos.y;
        } else {
            // Keep the current position if not following mouse
            this.x = this.x || k.width() / 2;
            this.y = this.y || k.height() / 2;
        }
        this.vx = (Math.random() - 0.5) * config.speed;
        this.vy = (Math.random() - 0.5) * config.speed;
        this.ax = 0;
        this.ay = 0;
        this.life = 1;
        this.sprite = null;
        this.originalSize = 1;
        this.angle = Math.random() * Math.PI * 2;
    }

    update() {
        // Update trail
        if (config.trailLength > 0) {
            // Add current position to trail
            if (config.reverseTrail) {
                this.trail.push({
                    x: this.x,
                    y: this.y,
                    angle: this.angle
                });
                if (this.trail.length > this.trailLength) {
                    this.trail.shift();
                }
            } else {
                this.trail.unshift({
                    x: this.x,
                    y: this.y,
                    angle: this.angle
                });
                if (this.trail.length > this.trailLength) {
                    this.trail.pop();
                }
            }
        }

        // Apply physics
        if (physics.collisionEnabled) {
            // Check collisions with other particles
            particles.forEach(other => {
                if (other !== this) {
                    const dx = other.x - this.x;
                    const dy = other.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = config.size * 2;

                    if (distance < minDistance) {
                        // Calculate collision response
                        const angle = Math.atan2(dy, dx);
                        const targetX = this.x + Math.cos(angle) * minDistance;
                        const targetY = this.y + Math.sin(angle) * minDistance;

                        // Move particles apart
                        const moveX = (targetX - other.x) * 0.05;
                        const moveY = (targetY - other.y) * 0.05;

                        this.vx -= moveX;
                        this.vy -= moveY;
                        other.vx += moveX;
                        other.vy += moveY;
                    }
                }
            });
        }

        // Apply forces
        this.ax = 0;
        this.ay = physics.gravity;

        // Wind force
        this.ax += physics.wind;

        // Air resistance
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const dragForce = speed * speed * physics.airResistance;
        const dragX = -this.vx * dragForce;
        const dragY = -this.vy * dragForce;
        this.ax += dragX;
        this.ay += dragY;

        // Turbulence
        this.ax += (Math.random() - 0.5) * physics.turbulence;
        this.ay += (Math.random() - 0.5) * physics.turbulence;

        // Vortex effect
        if (physics.vortexStrength !== 0) {
            const dx = this.x - physics.vortexCenter.x;
            const dy = this.y - physics.vortexCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const vortexAngle = Math.atan2(dy, dx);
            const vortexForce = physics.vortexStrength * (distance / 100);
            this.ax += -Math.sin(vortexAngle) * vortexForce;
            this.ay += Math.cos(vortexAngle) * vortexForce;
        }

        // Update velocity and position
        this.vx += this.ax / physics.particleMass;
        this.vy += this.ay / physics.particleMass;
        this.vx *= physics.friction;
        this.vy *= physics.friction;
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0) {
            this.x = 0;
            this.vx *= -physics.bounce;
        }
        if (this.x > k.width()) {
            this.x = k.width();
            this.vx *= -physics.bounce;
        }
        if (this.y < 0) {
            this.y = 0;
            this.vy *= -physics.bounce;
        }
        if (this.y > k.height()) {
            this.y = k.height();
            this.vy *= -physics.bounce;
        }

        // Update angle based on velocity
        this.angle = Math.atan2(this.vy, this.vx);
    }

    draw() {
        const size = this.sprite ? config.size * (this.originalSize / 64) : config.size;

        // Draw trail
        if (config.trailLength > 0) {
            this.trail.forEach((point, i) => {
                const alpha = 1 - (i / this.trail.length);
                if (this.sprite) {
                    k.drawSprite({
                        sprite: this.sprite,
                        pos: k.vec2(point.x, point.y),
                        angle: point.angle,
                        color: k.rgb(1, 1, 1),
                        opacity: alpha * 0.5,
                        scale: size / this.originalSize
                    });
                } else {
                    k.drawCircle({
                        pos: k.vec2(point.x, point.y),
                        radius: size,
                        color: k.rgb(...hexToRgb(config.color).map(c => c / 255)),
                        opacity: alpha * 0.5
                    });
                }
            });
        }

        // Draw particle
        if (this.sprite) {
            k.drawSprite({
                sprite: this.sprite,
                pos: k.vec2(this.x, this.y),
                angle: this.angle,
                scale: size / this.originalSize
            });
        } else {
            k.drawCircle({
                pos: k.vec2(this.x, this.y),
                radius: size,
                color: k.rgb(...hexToRgb(config.color).map(c => c / 255))
            });
        }
    }
}

// Create particle pool
let particles = Array(config.count).fill().map(() => new Particle());

// Handle mouse clicks
k.canvas.addEventListener('click', (e) => {
    const currentTime = Date.now();
    if (currentTime - lastClickTime < doubleClickDelay) {
        // Double click - resume following
        config.followMouse = true;
        lastClickTime = 0;
    } else {
        // Single click - stop following
        config.followMouse = false;
        lastClickTime = currentTime;
    }
});

// Handle touch events for mobile
k.canvas.addEventListener('touchstart', (e) => {
    const currentTime = Date.now();
    if (currentTime - lastClickTime < doubleClickDelay) {
        // Double tap - resume following
        config.followMouse = true;
        lastClickTime = 0;
    } else {
        // Single tap - stop following
        config.followMouse = false;
        lastClickTime = currentTime;
    }
    e.preventDefault(); // Prevent scrolling
});

// Update mouse position for touch events
k.canvas.addEventListener('touchmove', (e) => {
    if (config.followMouse) {
        const touch = e.touches[0];
        const rect = k.canvas.getBoundingClientRect();
        const mousePos = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
        k.mousePos = () => mousePos;
    }
    e.preventDefault(); // Prevent scrolling
});

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

// Window resize handler
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth * 0.75;
    const newHeight = window.innerHeight;
    
    k.canvas.width = newWidth;
    k.canvas.height = newHeight;
    
    // Update particle positions to stay within new bounds
    particles.forEach(particle => {
        particle.x = Math.min(particle.x, newWidth);
        particle.y = Math.min(particle.y, newHeight);
        
        // Update trail positions
        particle.trail = particle.trail.map(point => ({
            x: Math.min(point.x, newWidth),
            y: Math.min(point.y, newHeight),
            angle: point.angle
        }));
    });
});

// Export presets
const presets = {
    sparkle: {
        count: 50,
        size: 5,
        speed: 5,
        color: "#ffffff",
        physics: {
            gravity: 0.1,
            wind: 0,
            friction: 0.99,
            bounce: 0.8,
            airResistance: 0.02,
            turbulence: 0.1,
            vortexStrength: 0,
            particleMass: 1.0,
            collisionEnabled: false
        }
    },
    fire: {
        count: 70,
        size: 8,
        speed: 7,
        color: "#ff4400",
        physics: {
            gravity: -0.1,
            wind: 0,
            friction: 0.96,
            bounce: 0.3,
            airResistance: 0.01,
            turbulence: 0.2,
            vortexStrength: 0.2,
            particleMass: 0.5,
            collisionEnabled: false
        }
    },
    snow: {
        count: 100,
        size: 3,
        speed: 2,
        color: "#aaccff",
        physics: {
            gravity: 0.05,
            wind: 0.1,
            friction: 0.98,
            bounce: 0.1,
            airResistance: 0.04,
            turbulence: 0.05,
            vortexStrength: 0,
            particleMass: 0.8,
            collisionEnabled: true
        }
    },
    galaxy: {
        count: 200,
        size: 2,
        speed: 3,
        color: "#9966ff",
        physics: {
            gravity: 0,
            wind: 0,
            friction: 0.99,
            bounce: 1.0,
            airResistance: 0,
            turbulence: 0.02,
            vortexStrength: 0.5,
            particleMass: 1.2,
            collisionEnabled: false
        }
    },
    explosion: {
        count: 150,
        size: 4,
        speed: 10,
        color: "#ffaa00",
        physics: {
            gravity: 0.2,
            wind: 0,
            friction: 0.95,
            bounce: 0.6,
            airResistance: 0.03,
            turbulence: 0.3,
            vortexStrength: -0.1,
            particleMass: 0.7,
            collisionEnabled: true
        }
    }
};
