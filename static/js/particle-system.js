// Initialize dimensions
const initialWidth = window.innerWidth * 0.75;
const initialHeight = window.innerHeight;

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

// Initialize Kaboom.js
const k = kaboom({
    global: false,
    canvas: document.getElementById("gameCanvas"),
    width: initialWidth,
    height: initialHeight,
    background: [0, 0, 0],
});

// Particle system configuration
let config = {
    count: 50,
    size: 5,
    speed: 5,
    color: "#ffffff",
    preset: "sparkle",
    trailLength: 10,  // Added trail length configuration
    reverseTrail: false // Trail direction control
};

// Particle class
class Particle {
    constructor() {
        this.trail = [];
        this.trailLength = config.trailLength || 10;
        this.reset();
    }

    reset() {
        this.x = physics.vortexCenter.x;
        this.y = physics.vortexCenter.y;
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
    }

    update() {
        // Apply physics to particle
        this.ax = physics.wind;
        this.ay = physics.gravity;
        
        // Apply air resistance (proportional to velocity squared)
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0) {
            this.ax -= (this.vx / speed) * physics.airResistance * speed * speed;
            this.ay -= (this.vy / speed) * physics.airResistance * speed * speed;
        }
        
        // Apply turbulence using Perlin noise
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
        
        // Particle collisions if enabled
        if (physics.collisionEnabled) {
            for (const other of particles) {
                if (other !== this) {
                    const dx = other.x - this.x;
                    const dy = other.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDist = (this.size + other.size) * 0.5;
                    
                    if (distance < minDist) {
                        const angle = Math.atan2(dy, dx);
                        const targetX = this.x + Math.cos(angle) * minDist;
                        const targetY = this.y + Math.sin(angle) * minDist;
                        
                        const ax = (targetX - other.x) * 0.05;
                        const ay = (targetY - other.y) * 0.05;
                        
                        this.vx -= ax;
                        this.vy -= ay;
                        other.vx += ax;
                        other.vy += ay;
                    }
                }
            }
        }
        
        // Update rotation
        this.angle += this.spin;
        
        // Update trail based on direction
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

// Particle burst function
function createParticleBurst(x, y, count = 20) {
    const burstParticles = Array(count).fill().map(() => {
        const particle = new Particle();
        particle.x = x;
        particle.y = y;
        
        // Create radial burst effect
        const angle = Math.random() * Math.PI * 2;
        const speed = config.speed * (1 + Math.random());
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // Shorter life for burst particles
        particle.decay = 0.02 + Math.random() * 0.03;
        
        // Set sprite if using image-based particles
        if (animationFrames.length > 0) {
            particle.sprite = animationFrames[currentFrame].sprite;
            particle.originalSize = animationFrames[currentFrame].originalSize;
        }
        
        return particle;
    });
    
    particles.push(...burstParticles);
    
    // Trim excess particles
    while (particles.length > config.count * 2) {
        particles.shift();
    }
}

// Emitter class to manage particle generation
class Emitter {
    constructor() {
        this.x = physics.vortexCenter.x;
        this.y = physics.vortexCenter.y;
        this.isDragging = false;
    }

    reset() {
        this.x = physics.vortexCenter.x;
        this.y = physics.vortexCenter.y;
    }

    generateParticle() {
        const particle = new Particle();
        // Set initial position to current emitter position
        particle.x = this.x;
        particle.y = this.y;
        // Set initial velocity with random spread
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * config.speed;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        return particle;
    }

    update() {
        // Update attached particles' positions relative to emitter when dragging
        if (this.isDragging) {
            particles.forEach(particle => {
                if (!particle.isDetached) {
                    const dx = particle.x - this.x;
                    const dy = particle.y - this.y;
                    particle.x = this.x + dx;
                    particle.y = this.y + dy;
                }
            });
        }
    }
}

// Create emitter instance
const emitter = new Emitter();

// Event listeners for drag and burst effects
k.canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left click
        emitter.isDragging = true;
        const rect = k.canvas.getBoundingClientRect();
        emitter.x = e.clientX - rect.left;
        emitter.y = e.clientY - rect.top;
        // Mark existing particles as attached to the emitter
        particles.forEach(particle => {
            particle.isDetached = false;
        });
    }
});

k.canvas.addEventListener('mousemove', (e) => {
    if (emitter.isDragging) {
        const rect = k.canvas.getBoundingClientRect();
        emitter.x = e.clientX - rect.left;
        emitter.y = e.clientY - rect.top;
    }
});

k.canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) { // Left click release
        emitter.isDragging = false;
        // Mark all particles as detached
        particles.forEach(particle => {
            particle.isDetached = true;
        });
        emitter.reset();
    }
});

k.canvas.addEventListener('mouseleave', () => {
    if (emitter.isDragging) {
        emitter.isDragging = false;
        // Mark all particles as detached
        particles.forEach(particle => {
            particle.isDetached = true;
        });
        emitter.reset();
    }
});

// Right click for burst
k.canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const rect = k.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    createParticleBurst(x, y);
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

    // Generate new particles from emitter
    while (particles.length < config.count) {
        const newParticle = emitter.generateParticle();
        newParticle.isDetached = !emitter.isDragging;
        particles.push(newParticle);
    }

    // Update emitter
    emitter.update();

    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Draw emitter position indicator (optional, for debugging)
    k.drawCircle({
        pos: k.vec2(emitter.x, emitter.y),
        radius: 3,
        color: k.rgb(255, 0, 0, 0.5),
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

// Window resize handler
window.addEventListener('resize', () => {
    const canvas = document.getElementById("gameCanvas");
    const newWidth = window.innerWidth * 0.75;
    const newHeight = window.innerHeight;
    
    // Update canvas size
    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    // Update Kaboom instance dimensions
    k.canvas.width = newWidth;
    k.canvas.height = newHeight;
    
    // Update vortex center
    physics.vortexCenter = { x: newWidth / 2, y: newHeight / 2 };
    
    // Ensure particles are within bounds
    particles.forEach(particle => {
        if (particle.x > newWidth) particle.x = newWidth;
        if (particle.y > newHeight) particle.y = newHeight;
        
        // Update trail positions if needed
        particle.trail = particle.trail.map(point => ({
            x: Math.min(point.x, newWidth),
            y: Math.min(point.y, newHeight),
            angle: point.angle
        }));
    });
});
