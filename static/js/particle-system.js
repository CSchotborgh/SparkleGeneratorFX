// Initialize Kaboom.js
const k = kaboom({
    global: false,
    canvas: document.getElementById("gameCanvas"),
    background: [46, 204, 113], // Initial green theme color
    width: window.innerWidth * 0.75,
    height: window.innerHeight,
});

// Emitter class definition
class Emitter {
    constructor() {
        this.x = k.width() / 2;
        this.y = k.height() / 2;
        this.targetX = this.x;
        this.targetY = this.y;
    }

    update() {
        // Smoothly move emitter towards target position
        this.x += (this.targetX - this.x) * 0.1;
        this.y += (this.targetY - this.y) * 0.1;
    }

    generateParticle() {
        return new Particle(this.x, this.y);
    }
}

// Particle class definition
class Particle {
    constructor(x, y) {
        this.x = x || k.width() / 2;
        this.y = y || k.height() / 2;
        this.vx = (Math.random() - 0.5) * config.speed;
        this.vy = (Math.random() - 0.5) * config.speed;
        this.life = physics.particleLife;
        this.sprite = null;
        this.originalSize = null;
        this.angle = Math.random() * Math.PI * 2;
        this.trailLength = config.trailLength;
        this.trail = Array(this.trailLength).fill().map(() => ({
            x: this.x,
            y: this.y,
            angle: this.angle
        }));
    }

    update() {
        // Update trail first
        if (config.reverseTrail) {
            this.trail.unshift({
                x: this.x,
                y: this.y,
                angle: this.angle
            });
            this.trail.pop();
        } else {
            this.trail.push({
                x: this.x,
                y: this.y,
                angle: this.angle
            });
            this.trail.shift();
        }

        // Apply physics
        this.vx += physics.wind;
        this.vy += physics.gravity;
        
        // Apply vortex effect
        if (physics.vortexStrength !== 0) {
            const dx = this.x - physics.vortexCenter.x;
            const dy = this.y - physics.vortexCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            this.vx += physics.vortexStrength * Math.sin(angle) / (distance || 1);
            this.vy -= physics.vortexStrength * Math.cos(angle) / (distance || 1);
        }

        // Apply turbulence
        this.vx += (Math.random() - 0.5) * physics.turbulence;
        this.vy += (Math.random() - 0.5) * physics.turbulence;

        // Apply air resistance
        this.vx *= (1 - physics.airResistance);
        this.vy *= (1 - physics.airResistance);

        // Apply friction
        this.vx *= physics.friction;
        this.vy *= physics.friction;

        // Apply acceleration
        this.vx *= physics.acceleration;
        this.vy *= physics.acceleration;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Handle collisions with boundaries
        if (physics.collisionEnabled) {
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
        }

        // Update life
        this.life -= 0.016; // Roughly 60 FPS
    }

    draw() {
        // Draw trail
        this.trail.forEach((point, i) => {
            const opacity = i / this.trail.length;
            if (this.sprite) {
                k.drawSprite({
                    sprite: this.sprite,
                    pos: k.vec2(point.x, point.y),
                    opacity: opacity,
                    angle: point.angle,
                    scale: k.vec2(
                        (config.size / this.originalSize) * (0.5 + opacity * 0.5),
                        (config.size / this.originalSize) * (0.5 + opacity * 0.5)
                    ),
                });
            } else {
                k.drawCircle({
                    pos: k.vec2(point.x, point.y),
                    radius: config.size * (0.5 + opacity * 0.5),
                    color: k.rgba(...hexToRgb(config.color), opacity),
                });
            }
        });

        // Draw particle
        if (this.sprite) {
            k.drawSprite({
                sprite: this.sprite,
                pos: k.vec2(this.x, this.y),
                angle: this.angle,
                scale: k.vec2(config.size / this.originalSize, config.size / this.originalSize),
            });
        } else {
            k.drawCircle({
                pos: k.vec2(this.x, this.y),
                radius: config.size,
                color: config.color,
            });
        }
    }

    reset() {
        this.x = emitter.x;
        this.y = emitter.y;
        this.vx = (Math.random() - 0.5) * config.speed;
        this.vy = (Math.random() - 0.5) * config.speed;
        this.life = physics.particleLife;
        this.trail = Array(this.trailLength).fill().map(() => ({
            x: this.x,
            y: this.y,
            angle: this.angle
        }));
    }
}

// Initialize variables
let particles = [];
let fps = 0;
let frames = 0;
let lastTime = performance.now();
let backgroundSprite = null;
let backgroundImage = null;

// Create emitter instance
const emitter = new Emitter();

// Initialize metrics history
const metricsHistory = {
    fps: Array(100).fill(0),
    particleCount: Array(100).fill(0),
    avgSpeed: Array(100).fill(0),
    memory: Array(100).fill(0)
};

// Initialize graphs object
const graphs = {};

// Configuration object
let config = {
    count: 50,
    size: 5,
    speed: 5,
    color: "#ffffff",
    trailLength: 10,
    reverseTrail: false
};

// Physics configuration
const physics = {
    gravity: 0.1,
    wind: 0,
    friction: 0.99,
    bounce: 0.8,
    airResistance: 0.02,
    turbulence: 0.1,
    vortexStrength: 0,
    vortexCenter: { x: k.width() / 2, y: k.height() / 2 },
    particleMass: 1.0,
    particleLife: 1.0,
    acceleration: 1.0,
    collisionEnabled: false
};

// Mouse and touch event handling
k.canvas.addEventListener('mousemove', (e) => {
    const rect = k.canvas.getBoundingClientRect();
    emitter.targetX = e.clientX - rect.left;
    emitter.targetY = e.clientY - rect.top;
});

k.canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = k.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    emitter.targetX = touch.clientX - rect.left;
    emitter.targetY = touch.clientY - rect.top;
}, { passive: false });

// Update metrics display
function updateMetrics() {
    // Calculate FPS
    const currentTime = performance.now();
    frames++;
    if (currentTime >= lastTime + 1000) {
        fps = Math.round((frames * 1000) / (currentTime - lastTime));
        frames = 0;
        lastTime = currentTime;
    }

    // Calculate average particle speed
    const avgSpeed = particles.reduce((sum, p) => {
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        return sum + speed;
    }, 0) / particles.length;

    // Estimate memory usage (rough approximation)
    const memoryUsage = (particles.length * 200) / (1024 * 1024); // Rough estimate in MB

    // Update text metrics
    document.getElementById('fpsMetric').textContent = fps;
    document.getElementById('particleCountMetric').textContent = particles.length;
    document.getElementById('avgSpeedMetric').textContent = avgSpeed.toFixed(2);
    document.getElementById('memoryMetric').textContent = `${memoryUsage.toFixed(2)} MB`;
    document.getElementById('emitterPosMetric').textContent = 
        `x: ${Math.round(emitter.x)}, y: ${Math.round(emitter.y)}`;

    // Update metrics history
    metricsHistory.fps.push(fps);
    metricsHistory.fps.shift();
    metricsHistory.particleCount.push(particles.length);
    metricsHistory.particleCount.shift();
    metricsHistory.avgSpeed.push(avgSpeed);
    metricsHistory.avgSpeed.shift();
    metricsHistory.memory.push(memoryUsage);
    metricsHistory.memory.shift();

    // Update graphs if they are initialized
    try {
        if (graphs.fps && graphs.fps.data) {
            graphs.fps.data.datasets[0].data = metricsHistory.fps;
            graphs.fps.update('none'); // Use 'none' mode for better performance
        }
        if (graphs.particleCount && graphs.particleCount.data) {
            graphs.particleCount.data.datasets[0].data = metricsHistory.particleCount;
            graphs.particleCount.update('none');
        }
        if (graphs.speed && graphs.speed.data) {
            graphs.speed.data.datasets[0].data = metricsHistory.avgSpeed;
            graphs.speed.update('none');
        }
        if (graphs.memory && graphs.memory.data) {
            graphs.memory.data.datasets[0].data = metricsHistory.memory;
            graphs.memory.update('none');
        }
    } catch (error) {
        console.warn('Error updating metrics graphs:', error);
    }
}

// Main game loop
k.onUpdate(() => {
    // Get the current theme and set background accordingly
    const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    const themeColor = '#2ecc71'; // Set fixed green theme color
    const [r, g, b] = hexToRgb(themeColor);
    k.setBackground(k.rgb(r, g, b));

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
            opacity: 1,
            z: -1, // Set z-index to -1 to ensure background is behind particles
        });
    }

    // Update emitter
    emitter.update();

    // Remove dead particles
    particles = particles.filter(p => p.life > 0);

    // Generate new particles from emitter
    const particlesToGenerate = Math.max(1, Math.floor(config.count / 60)); // Distribute particle generation over time
    for (let i = 0; i < particlesToGenerate && particles.length < config.count; i++) {
        particles.push(emitter.generateParticle());
    }

    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Update metrics display
    updateMetrics();
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
            acceleration: 1.0,
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
            acceleration: 1.5,
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
            acceleration: 0.8,
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
            acceleration: 1.2,
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
            acceleration: 2.0,
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
