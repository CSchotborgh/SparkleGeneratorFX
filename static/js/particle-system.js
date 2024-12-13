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
        try {
            // Apply physics
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

            // Apply attraction to emitter position
            if (emitter) {
                const dx = emitter.x - this.x;
                const dy = emitter.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    const attractionStrength = 0.3;
                    const attractionForce = attractionStrength / (distance * physics.particleMass);
                    this.ax += dx * attractionForce;
                    this.ay += dy * attractionForce;
                }
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
        } catch (error) {
            console.error('Error updating particle:', error);
            this.reset();
        }
    }

    draw() {
        try {
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
        } catch (error) {
            console.error('Error drawing particle:', error);
        }
    }
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

// Emitter class
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
        this.vx = this.x - this.lastX;
        this.vy = this.y - this.lastY;
        this.lastX = this.x;
        this.lastY = this.y;
    }
}

// Create emitter instance
const emitter = new Emitter();

// Initialize particle system
function initializeParticleSystem() {
    try {
        if (!k) {
            console.error("Kaboom not initialized!");
            return;
        }

        // Initialize particles
        particles = Array(config.count).fill().map(() => new Particle());

        // Start game loop
        k.onUpdate(() => {
            try {
                // Clear background
                k.setBackground(k.rgb(0, 0, 0, 0));

                // Update emitter
                emitter.update();

                // Update and draw particles
                particles.forEach(particle => {
                    particle.update();
                    particle.draw();
                });

                // Generate new particles if needed
                while (particles.length < config.count) {
                    particles.push(new Particle());
                }
            } catch (error) {
                console.error('Error in game loop:', error);
            }
        });

        // Add event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing particle system:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    try {
        k.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
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
            if (e.button === 0) {
                emitter.isDragging = false;
            }
        });

        k.canvas.addEventListener('mouseleave', () => {
            emitter.isDragging = false;
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            const newWidth = window.innerWidth * 0.75;
            const newHeight = window.innerHeight;

            if (k) {
                k.setBackground(k.rgb(0, 0, 0, 0));
                physics.vortexCenter = { x: newWidth / 2, y: newHeight / 2 };
                k.canvas.width = newWidth;
                k.canvas.height = newHeight;
            }
        });
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

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