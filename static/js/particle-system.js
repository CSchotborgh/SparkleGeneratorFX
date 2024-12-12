// Initialize dimensions
const initialWidth = window.innerWidth * 0.75;
const initialHeight = window.innerHeight;

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

// Particle system configuration
let config = {
    count: 50,
    size: 5,
    speed: 5,
    color: "#ffffff",
    preset: "sparkle",
    trailLength: 10,
    reverseTrail: false
};

// Emitter class to manage particle generation
class Emitter {
    constructor() {
        this.x = physics.vortexCenter.x;
        this.y = physics.vortexCenter.y;
        this.isDragging = false;
        this.lastX = this.x;
        this.lastY = this.y;
    }

    reset() {
        this.x = physics.vortexCenter.x;
        this.y = physics.vortexCenter.y;
        this.isDragging = false;
    }

    generateParticle() {
        const particle = new Particle();
        particle.reset(this.x, this.y);
        particle.isAttached = this.isDragging;
        return particle;
    }

    update(deltaX = 0, deltaY = 0) {
        if (this.isDragging) {
            this.lastX = this.x;
            this.lastY = this.y;
        }
    }
}

// Create emitter instance before Particle class uses it
const emitter = new Emitter();

// Particle class
class Particle {
    constructor() {
        this.trail = [];
        this.trailLength = config.trailLength || 10;
        this.reset();
    }

    reset(x = null, y = null) {
        this.x = x !== null ? x : emitter.x;
        this.y = y !== null ? y : emitter.y;
        this.vx = (Math.random() - 0.5) * config.speed;
        this.vy = (Math.random() - 0.5) * config.speed;
        this.ax = 0;
        this.ay = 0;
        this.life = 1;
        this.decay = 0.01 + Math.random() * 0.02;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.2;
        this.size = config.size * (0.5 + Math.random() * 0.5);
        this.trail = Array(this.trailLength).fill().map(() => ({
            x: this.x,
            y: this.y,
            angle: this.angle
        }));
        this.isAttached = emitter.isDragging;
    }

    update() {
        if (this.isAttached && emitter.isDragging) {
            // Move with emitter
            const deltaX = emitter.x - emitter.lastX;
            const deltaY = emitter.y - emitter.lastY;
            this.x += deltaX;
            this.y += deltaY;
            
            // Update trail positions
            this.trail = this.trail.map(point => ({
                x: point.x + deltaX,
                y: point.y + deltaY,
                angle: point.angle
            }));
        } else {
            // Apply physics to particle
            this.ax = physics.wind;
            this.ay = physics.gravity;
            
            // Apply air resistance
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > 0) {
                this.ax -= (this.vx / speed) * physics.airResistance * speed * speed;
                this.ay -= (this.vy / speed) * physics.airResistance * speed * speed;
            }
            
            // Apply turbulence
            const time = Date.now() * 0.001;
            this.ax += (Math.sin(time * 2 + this.x * 0.1) * physics.turbulence);
            this.ay += (Math.cos(time * 2 + this.y * 0.1) * physics.turbulence);
            
            // Apply vortex effect
            if (physics.vortexStrength !== 0) {
                const dx = this.x - physics.vortexCenter.x;
                const dy = this.y - physics.vortexCenter.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    const vortexForce = physics.vortexStrength / (distance * physics.particleMass);
                    this.ax += -dy * vortexForce;
                    this.ay += dx * vortexForce;
                }
            }
            
            // Update velocity and position
            this.vx += this.ax / physics.particleMass;
            this.vy += this.ay / physics.particleMass;
            
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
        }
        
        // Update rotation
        this.angle += this.spin;
        
        // Update trail
        if (config.reverseTrail) {
            this.trail.shift();
            this.trail.push({
                x: this.x,
                y: this.y,
                angle: this.angle
            });
        } else {
            this.trail.pop();
            this.trail.unshift({
                x: this.x,
                y: this.y,
                angle: this.angle
            });
        }
        
        this.life -= this.decay;
        if (this.life <= 0) {
            this.reset();
        }
    }

    draw() {
        // Draw trail
        for (let i = this.trail.length - 1; i >= 0; i--) {
            const point = this.trail[i];
            const opacity = (1 - i / this.trail.length) * this.life * 0.5;
            const trailSize = this.size * (1 - i / this.trail.length);
            
            if (this.sprite) {
                const scale = (trailSize / (this.originalSize || 20)) * 2;
                k.drawSprite({
                    sprite: this.sprite,
                    pos: k.vec2(point.x, point.y),
                    scale: k.vec2(scale, scale),
                    angle: point.angle,
                    color: k.rgb(...hexToRgb(config.color), opacity),
                    anchor: "center",
                });
            } else {
                k.drawCircle({
                    pos: k.vec2(point.x, point.y),
                    radius: trailSize,
                    color: k.rgb(...hexToRgb(config.color), opacity),
                });
            }
        }

        // Draw current particle
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

// Event listeners for drag and burst effects
k.canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left click
        emitter.isDragging = true;
        const rect = k.canvas.getBoundingClientRect();
        emitter.x = e.clientX - rect.left;
        emitter.y = e.clientY - rect.top;
    }
});

k.canvas.addEventListener('mousemove', (e) => {
    if (emitter.isDragging) {
        const rect = k.canvas.getBoundingClientRect();
        const newX = e.clientX - rect.left;
        const newY = e.clientY - rect.top;
        emitter.x = newX;
        emitter.y = newY;
    }
});

k.canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
        emitter.isDragging = false;
        emitter.reset();
    }
});

k.canvas.addEventListener('mouseleave', () => {
    if (emitter.isDragging) {
        emitter.isDragging = false;
        emitter.reset();
    }
});

// Touch events
k.canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    emitter.isDragging = true;
    const rect = k.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    emitter.x = touch.clientX - rect.left;
    emitter.y = touch.clientY - rect.top;
}, { passive: false });

k.canvas.addEventListener('touchmove', (e) => {
    if (emitter.isDragging) {
        e.preventDefault();
        const rect = k.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        emitter.x = touch.clientX - rect.left;
        emitter.y = touch.clientY - rect.top;
    }
}, { passive: false });

k.canvas.addEventListener('touchend', () => {
    emitter.isDragging = false;
    emitter.reset();
});

// Main game loop
k.onUpdate(() => {
    // Remove dead particles
    particles = particles.filter(p => p.life > 0);

    // Generate new particles from emitter's current position
    while (particles.length < config.count) {
        particles.push(emitter.generateParticle());
    }

    // Update and draw particles
    particles.forEach(particle => particle.update());
    particles.forEach(particle => particle.draw());
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
    
    // Update canvas size
    k.canvas.width = newWidth;
    k.canvas.height = newHeight;
    
    // Update vortex center
    physics.vortexCenter = { x: newWidth / 2, y: newHeight / 2 };
    
    // Reset emitter if not dragging
    if (!emitter.isDragging) {
        emitter.reset();
    }
    
    // Ensure particles are within bounds
    particles.forEach(particle => {
        if (particle.x > newWidth) particle.x = newWidth;
        if (particle.y > newHeight) particle.y = newHeight;
        
        particle.trail = particle.trail.map(point => ({
            x: Math.min(point.x, newWidth),
            y: Math.min(point.y, newHeight),
            angle: point.angle
        }));
    });
});