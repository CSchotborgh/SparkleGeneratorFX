// Initialize dimensions
const initialWidth = window.innerWidth * 0.75;
const initialHeight = window.innerHeight;

// Initialize Kaboom.js
let k;
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    
    try {
        k = kaboom({
            global: false,
            canvas: canvas,
            width: initialWidth,
            height: initialHeight,
            background: [0, 0, 0, 0],
            debug: true,
        });
        console.log("Kaboom initialized successfully");
        initializeParticleSystem();
    } catch (error) {
        console.error("Error initializing Kaboom:", error);
    }
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

// Initialize variables for background
let backgroundImage = null;
let backgroundSprite = null;

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

// Create particle pool
let particles = [];

// Particle class
class Particle {
    constructor() {
        this.trail = [];
        this.trailLength = config.trailLength || 10;
        this.reset();
    }

    reset() {
        // Initialize at center
        this.x = k.width() / 2;
        this.y = k.height() / 2;
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
        // Apply physics
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

        // Apply attraction to emitter position
        const dx = emitter.x - this.x;
        const dy = emitter.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
            const attractionStrength = 0.3; // Adjust this value to control attraction force
            const attractionForce = attractionStrength / (distance * physics.particleMass);
            this.ax += dx * attractionForce;
            this.ay += dy * attractionForce;
        }

        // Apply vortex effect
        if (physics.vortexStrength !== 0) {
            const vx = this.x - physics.vortexCenter.x;
            const vy = this.y - physics.vortexCenter.y;
            const vortexDist = Math.sqrt(vx * vx + vy * vy);
            if (vortexDist > 0) {
                const vortexForce = physics.vortexStrength / (vortexDist * physics.particleMass);
                this.ax += -vy * vortexForce;
                this.ay += vx * vortexForce;
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

        // Update trail
        if (config.reverseTrail) {
            this.trail.shift();
            this.trail.push({ x: this.x, y: this.y, angle: this.angle });
        } else {
            this.trail.pop();
            this.trail.unshift({ x: this.x, y: this.y, angle: this.angle });
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
                radius: this.size * (1 - i / this.trail.length),
                color: k.rgb(...hexToRgb(config.color), opacity)
            });
        });

        // Draw particle
        k.drawCircle({
            pos: k.vec2(this.x, this.y),
            radius: this.size,
            color: k.rgb(...hexToRgb(config.color), this.life)
        });
    }
}

// Initialize particles
function initializeParticles() {
    particles = Array(config.count).fill().map(() => new Particle());
}

// FPS tracking
let frameCount = 0;
let lastTime = performance.now();
let fps = 0;

// Update FPS counter
function updateFPS() {
    const now = performance.now();
    const delta = now - lastTime;
    frameCount++;

    if (delta >= 1000) {
        fps = Math.round((frameCount * 1000) / delta);
        frameCount = 0;
        lastTime = now;

        // Update FPS display
        const fpsCounter = document.getElementById('frameCount');
        if (fpsCounter) {
            fpsCounter.textContent = fps;
        }
    }

    requestAnimationFrame(updateFPS);
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [255, 255, 255];
}

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
        this.vx = 0;
        this.vy = 0;
        this.lastX = this.x;
        this.lastY = this.y;
        this.isDragging = false;
    }

    reset() {
        this.x = physics.vortexCenter.x;
        this.y = physics.vortexCenter.y;
        this.vx = 0;
        this.vy = 0;
        this.lastX = this.x;
        this.lastY = this.y;
    }

    update() {
        // Calculate emitter velocity based on position change
        this.vx = this.x - this.lastX;
        this.vy = this.y - this.lastY;
        this.lastX = this.x;
        this.lastY = this.y;
    }

    generateParticle() {
        const particle = new Particle();
        particle.x = this.x + (Math.random() - 0.5) * 10;
        particle.y = this.y + (Math.random() - 0.5) * 10;
        // Add emitter velocity to particle initial velocity for smoother motion
        particle.vx = (Math.random() - 0.5) * config.speed + this.vx * 0.5;
        particle.vy = (Math.random() - 0.5) * config.speed + this.vy * 0.5;
        return particle;
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
    }
});

k.canvas.addEventListener('mouseleave', () => {
    if (emitter.isDragging) {
        emitter.isDragging = false;
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
});

// Background image handler
document.getElementById('backgroundImage').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        // Load the background image
        backgroundImage = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = dataUrl;
        });

        // Create a sprite from the background image
        const spriteName = 'background';
        await k.loadSprite(spriteName, dataUrl);
        backgroundSprite = spriteName;
    } catch (error) {
        console.error('Error loading background image:', error);
    }
});


// Initialize the particle system
function initializeParticleSystem() {
    if (!k) {
        console.error("Kaboom not initialized!");
        return;
    }

    // Initialize particles array if not already done
    if (!particles) {
        particles = [];
    }

    // Start FPS counter
    updateFPS();

    // Initialize particles
    initializeParticles();

    // Start game loop
    k.onUpdate(() => {
        try {
            // Clear background
            k.setBackground(k.rgb(0, 0, 0, 0));

            // Draw background if available
            if (backgroundSprite && backgroundImage) {
                const scale = Math.max(k.width() / backgroundImage.width, k.height() / backgroundImage.height);
                const width = backgroundImage.width * scale;
                const height = backgroundImage.height * scale;
                const x = (k.width() - width) / 2;
                const y = (k.height() - height) / 2;

                k.drawSprite({
                    sprite: backgroundSprite,
                    pos: k.vec2(x, y),
                    scale: k.vec2(width / backgroundImage.width, height / backgroundImage.height),
                });
            }

            // Update emitter
            emitter.update();

            // Remove dead particles
            particles = particles.filter(p => p.life > 0);

            // Generate new particles from emitter
            const particlesToGenerate = Math.max(1, Math.floor(config.count / 60));
            for (let i = 0; i < particlesToGenerate && particles.length < config.count; i++) {
                particles.push(emitter.generateParticle());
            }

            // Update and draw particles
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Update FPS display
            frameCount++;
            if (performance.now() - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (performance.now() - lastTime));
                const fpsDisplay = document.getElementById('frameCount');
                if (fpsDisplay) {
                    fpsDisplay.textContent = fps.toString();
                }
                frameCount = 0;
                lastTime = performance.now();
            }

            // Draw emitter position indicator (optional, for debugging)
            k.drawCircle({
                pos: k.vec2(emitter.x, emitter.y),
                radius: 3,
                color: k.rgb(255, 0, 0, 0.5),
            });
        } catch (error) {
            console.error('Error in game loop:', error);
            // Attempt to recover by reinitializing if necessary
            if (!particles || !emitter) {
                console.log('Attempting to recover by reinitializing...');
                initializeParticles();
            }
        }
    });
});

// Window resize handler
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth * 0.75;
    const newHeight = window.innerHeight;

    k.setBackground(k.rgb(0, 0, 0, 0));
    physics.vortexCenter = { x: newWidth / 2, y: newHeight / 2 };

    // Update canvas size
    k.canvas.width = newWidth;
    k.canvas.height = newHeight;
});

// Preset configurations (restored from original)
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