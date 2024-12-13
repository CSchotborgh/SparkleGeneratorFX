// Initialize dimensions
const initialWidth = window.innerWidth * 0.75;
const initialHeight = window.innerHeight;

// Initialize dimensions and state
let k = null;
let canvas = null;
const initialWidth = window.innerWidth * 0.75;
const initialHeight = window.innerHeight;

// Global state
const state = {
    background: {
        sprite: null,
        image: null,
        object: null,
        scale: 1,
        position: { x: 0, y: 0 }
    },
    initialized: false
};

// Initialize game
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get or create game container
        let container = document.querySelector('.game-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'game-container';
            document.body.appendChild(container);
        }

        // Create canvas if it doesn't exist
        canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'gameCanvas';
            container.appendChild(canvas);
        }

        // Set initial canvas properties
        canvas.style.background = 'transparent';
        canvas.width = initialWidth;
        canvas.height = initialHeight;

        // Initialize Kaboom
        k = kaboom({
            global: false,
            canvas: canvas,
            width: initialWidth,
            height: initialHeight,
            background: [0, 0, 0, 0],
            scale: 1,
            debug: true
        });

        console.log('Canvas created:', canvas);
        console.log('Kaboom initialized:', k);

        // Create layers
        k.layers(['bg', 'game', 'ui'], 'game');

        // Set up initial background
        k.use('bg');
        k.drawRect({
            width: k.width(),
            height: k.height(),
            color: k.rgb(0, 0, 0, 0)
        });

        // Switch to game layer
        k.use('game');

        // Mark as initialized and start particle system
        state.initialized = true;
        await initializeParticleSystem();

    } catch (error) {
        console.error('Error initializing game:', error);
        console.error('Error details:', {
            canvasExists: !!canvas,
            kaboomExists: !!k,
            containerExists: !!document.querySelector('.game-container')
        });
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

// Particle class definition (same as before)
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
        // Update logic (same as before)
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

            // Update velocity and position
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

// Background image upload handler
document.getElementById('backgroundImage').addEventListener('change', async (e) => {
    console.log('Background image upload started');
    
    const file = e.target.files[0];
    if (!file) {
        console.error('No file selected');
        return;
    }

    if (!k || !state.initialized) {
        console.error('Kaboom not initialized', { k, initialized: state.initialized });
        return;
    }

    try {
        // Clear existing background
        if (state.background.object) {
            console.log('Removing existing background');
            state.background.object.destroy();
            state.background.object = null;
        }

        // Read file
        console.log('Reading file');
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        // Load image
        console.log('Loading image');
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = dataUrl;
        });

        // Update state
        console.log('Updating state');
        state.background.image = img;
        state.background.sprite = `bg_${Date.now()}`;

        // Load sprite
        console.log('Loading sprite into Kaboom');
        await k.loadSprite(state.background.sprite, dataUrl);

        // Calculate dimensions
        const scale = Math.max(
            k.width() / img.width,
            k.height() / img.height
        );
        const x = (k.width() - (img.width * scale)) / 2;
        const y = (k.height() - (img.height * scale)) / 2;

        // Switch to background layer
        console.log('Switching to background layer');
        k.use("bg");
        
        // Clear existing objects
        k.destroyAll("background");

        // Add new background
        console.log('Adding background object');
        state.background.object = k.add([
            k.sprite(state.background.sprite),
            k.pos(x, y),
            k.scale(scale),
            k.z(-1),
            k.layer("bg"),
            "background"
        ]);

        // Save state
        state.background.scale = scale;
        state.background.position = { x, y };

        // Switch back to game layer
        console.log('Switching back to game layer');
        k.use("game");

        // Update preview
        const previewImg = document.getElementById('backgroundPreviewImage');
        const previewDiv = document.getElementById('backgroundPreview');
        if (previewImg && previewDiv) {
            previewImg.src = dataUrl;
            previewDiv.style.display = 'block';
        }

        console.log('Background image loaded successfully');
    } catch (error) {
        console.error('Error loading background image:', error);
        console.error('Error details:', {
            fileExists: !!file,
            kaboomExists: !!k,
            initialized: state.initialized,
            error: error.message
        });
        alert('Error loading background image: ' + error.message);
    }
});

// Initialize particle system
async function initializeParticleSystem() {
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
                // Clear background layer
                k.use("bg");
                k.drawRect({
                    width: k.width(),
                    height: k.height(),
                    color: k.rgb(0, 0, 0, 0)
                });

                // Update particles on game layer
                k.use("game");
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

        // Add event listeners for mouse interaction
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing particle system:', error);
    }
}

// Helper functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [255, 255, 255];
}

// Setup event listeners for mouse interaction
function setupEventListeners() {
    if (!k || !k.canvas) return;

    const canvas = k.canvas;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = canvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update vortex center
        physics.vortexCenter.x = x;
        physics.vortexCenter.y = y;
        
        lastX = x;
        lastY = y;
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });
}

// Window resize handler
window.addEventListener('resize', () => {
    if (k && state.initialized) {
        const newWidth = window.innerWidth * 0.75;
        const newHeight = window.innerHeight;

        // Update canvas size
        k.canvas.width = newWidth;
        k.canvas.height = newHeight;

        // Update vortex center
        physics.vortexCenter.x = newWidth / 2;
        physics.vortexCenter.y = newHeight / 2;

        // Update background if exists
        if (state.background.image && state.background.object) {
            // Recalculate scale and position
            state.background.scale = Math.max(
                k.width() / state.background.image.width,
                k.height() / state.background.image.height
            );
            
            state.background.position = {
                x: (k.width() - (state.background.image.width * state.background.scale)) / 2,
                y: (k.height() - (state.background.image.height * state.background.scale)) / 2
            };

            // Update background object
            k.use("bg");
            state.background.object.scale = state.background.scale;
            state.background.object.pos = state.background.position;
            k.use("game");
        }

        // Reset particles
        particles.forEach(particle => particle.reset());
    }
});

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