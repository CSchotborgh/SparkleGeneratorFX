// Initialize dimensions and state
let k = null;
let canvas = null;
let gameContainer = null;
const dimensions = {
    width: window.innerWidth * 0.75,
    height: window.innerHeight
};

// Global state
const state = {
    background: {
        sprite: null,
        image: null,
        object: null
    },
    initialized: false
};

// Physics parameters
const physics = {
    gravity: 0.1,
    wind: 0,
    friction: 0.99,
    bounce: 0.8,
    airResistance: 0.02,
    turbulence: 0.1,
    vortexStrength: 0,
    vortexCenter: { x: dimensions.width / 2, y: dimensions.height / 2 },
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

// Initialize game
async function initGame() {
    console.log('Starting game initialization...');
    
    try {
        // Create or get game container
        gameContainer = document.querySelector('.game-container');
        if (!gameContainer) {
            gameContainer = document.createElement('div');
            gameContainer.className = 'game-container';
            document.body.appendChild(gameContainer);
        }
        
        // Clean up existing canvas if it exists
        if (canvas) {
            gameContainer.removeChild(canvas);
        }

        // Create new canvas
        canvas = document.createElement('canvas');
        canvas.id = 'gameCanvas';
        canvas.style.background = 'transparent';
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        gameContainer.appendChild(canvas);
        
        console.log('Canvas created with dimensions:', dimensions);

        // Wait for Kaboom to be available
        if (typeof kaboom === 'undefined') {
            throw new Error('Kaboom is not loaded');
        }

        // Initialize Kaboom with canvas and transparency
        k = kaboom({
            canvas: canvas,
            width: dimensions.width,
            height: dimensions.height,
            background: [0, 0, 0, 0],
            scale: 1,
            debug: true,
            clearColor: [0, 0, 0, 0]
        });

        console.log('Kaboom initialized successfully');

        // Create layers
        k.layers([
            "background",  // Background layer
            "game"        // Game layer (particles)
        ], "game");

        // Initialize background layer
        k.use("background");
        k.add([
            k.rect(dimensions.width, dimensions.height),
            k.color(0, 0, 0, 0),
            k.pos(0, 0),
            k.z(-1)
        ]);

        // Switch to game layer
        k.use("game");

        // Initialize particles
        particles = Array(config.count).fill().map(() => new Particle());
        
        // Set up event listeners
        setupEventListeners();
        
        // Mark as initialized
        state.initialized = true;
        console.log('Game initialization complete');
        
        return true;
    } catch (error) {
        console.error('Error initializing game:', error);
        return false;
    }
}

// Particle class definition
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = dimensions.width / 2;
        this.y = dimensions.height / 2;
        this.vx = (Math.random() - 0.5) * config.speed;
        this.vy = (Math.random() - 0.5) * config.speed;
        this.life = 1;
        this.decay = 0.01 + Math.random() * 0.02;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.2;
        this.size = config.size * (0.5 + Math.random() * 0.5);
        this.trail = Array(config.trailLength).fill().map(() => ({
            x: this.x,
            y: this.y,
            angle: this.angle
        }));
    }

    update() {
        // Apply physics
        let ax = physics.wind;
        let ay = physics.gravity;

        // Apply air resistance
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0) {
            ax -= (this.vx / speed) * physics.airResistance * speed * speed;
            ay -= (this.vy / speed) * physics.airResistance * speed * speed;
        }

        // Update velocity and position
        this.vx += ax;
        this.vy += ay;
        this.vx *= physics.friction;
        this.vy *= physics.friction;
        this.x += this.vx;
        this.y += this.vy;

        // Boundary checks
        if (this.x < 0 || this.x > dimensions.width) {
            this.vx *= -physics.bounce;
            this.x = this.x < 0 ? 0 : dimensions.width;
        }
        if (this.y < 0 || this.y > dimensions.height) {
            this.vy *= -physics.bounce;
            this.y = this.y < 0 ? 0 : dimensions.height;
        }

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
        if (!k) return;

        try {
            // Draw trail
            this.trail.forEach((point, i) => {
                const opacity = (1 - i / this.trail.length) * this.life * 0.5;
                k.drawCircle({
                    pos: k.vec2(point.x, point.y),
                    radius: this.size * (1 - i / this.trail.length),
                    color: k.rgba(...hexToRgb(config.color), opacity)
                });
            });

            // Draw particle
            k.drawCircle({
                pos: k.vec2(this.x, this.y),
                radius: this.size,
                color: k.rgba(...hexToRgb(config.color), this.life)
            });
        } catch (error) {
            console.error('Error drawing particle:', error);
        }
    }
}

// Background image handler
async function handleBackgroundImage(file) {
    if (!k || !state.initialized) {
        console.error('Game not initialized');
        return;
    }

    try {
        console.log('Loading background image...');

        // Clear existing background
        k.use("background");
        if (state.background.object) {
            state.background.object.destroy();
        }

        // Create data URL from file
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        // Load image to get dimensions
        const img = await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = dataUrl;
        });

        // Store image reference
        state.background.image = img;

        // Create and load sprite
        const spriteName = `bg_${Date.now()}`;
        await k.loadSprite(spriteName, dataUrl);

        // Calculate scaling to cover canvas while maintaining aspect ratio
        const scale = Math.max(
            dimensions.width / img.width,
            dimensions.height / img.height
        );

        // Create background object
        state.background.object = k.add([
            k.sprite(spriteName),
            k.pos(0, 0),
            k.scale(scale),
            k.layer("background"),
            k.z(-1)
        ]);

        // Store sprite name
        state.background.sprite = spriteName;

        console.log('Background image loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading background:', error);
        return false;
    }
}

// Helper function to convert hex color to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [255, 255, 255];
}

// Game loop
function gameLoop() {
    if (!state.initialized || !k) return;

    try {
        // Clear canvas with transparency
        k.clear();

        // Update background if exists
        k.use("background");
        if (state.background.object) {
            state.background.object.use(k.layer("background"));
        }

        // Update particles
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
}

// Event listeners
function setupEventListeners() {
    if (!k || !canvas) return;

    // Background image upload handler
    const backgroundInput = document.getElementById('backgroundImage');
    if (backgroundInput) {
        backgroundInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await handleBackgroundImage(file);
            }
        });
    }

    // Mouse interaction
    let isDragging = false;
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = canvas.getBoundingClientRect();
        physics.vortexCenter.x = e.clientX - rect.left;
        physics.vortexCenter.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = canvas.getBoundingClientRect();
        physics.vortexCenter.x = e.clientX - rect.left;
        physics.vortexCenter.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseup', () => isDragging = false);
    canvas.addEventListener('mouseleave', () => isDragging = false);

    // Window resize handler
    window.addEventListener('resize', () => {
        dimensions.width = window.innerWidth * 0.75;
        dimensions.height = window.innerHeight;
        
        if (canvas) {
            canvas.width = dimensions.width;
            canvas.height = dimensions.height;
        }
        
        if (k) {
            k.width = dimensions.width;
            k.height = dimensions.height;
            physics.vortexCenter = { x: dimensions.width / 2, y: dimensions.height / 2 };
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing game...');
    if (await initGame()) {
        k.onUpdate(gameLoop);
    }
});

// Export necessary objects for external use
window.particles = particles;
window.config = config;
window.physics = physics;

// Presets
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
