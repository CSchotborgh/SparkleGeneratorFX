// Initialize dimensions
const initialWidth = window.innerWidth;
const initialHeight = window.innerHeight;

// Initialize background configuration
const backgroundConfig = {
    scaleMode: 'cover',
    position: 'center',
    opacity: 1.0,
    backgroundColor: "#2ecc71"
};

// Initialize Kaboom.js
const k = kaboom({
    global: false,
    canvas: document.getElementById("gameCanvas"),
    width: initialWidth,
    height: initialHeight,
    background: [46, 204, 113], // Default green background
});

// Default physics parameters
const defaultPhysics = {
    gravity: 0.1,
    wind: 0,
    friction: 0.98,
    bounce: 0.8,
    airResistance: 0.02,
    turbulence: 0.1,
    vortexStrength: 0,
    vortexCenter: { x: initialWidth / 2, y: initialHeight / 2 },
    particleMass: 0.5,
    particleLife: 0.8,
    acceleration: 0.8,
    collisionEnabled: true
};

// Default particle system configuration
const defaultConfig = {
    count: 40,
    size: 4,
    speed: 4,
    color: "#ffffff",
    preset: "sparkle",
    trailLength: 8,
    reverseTrail: false,
    shape: 'circle',
    opacity: 0.8,
    blur: 0,
    enableRotation: true,
    particleSprite: null, // Add particleSprite property
    originalSize: 4 // Add originalSize property
};

// Store initial settings in localStorage
if (!localStorage.getItem('particleSystemDefaults')) {
    localStorage.setItem('particleSystemDefaults', JSON.stringify({
        physics: defaultPhysics,
        config: defaultConfig
    }));
}

// Active physics and config objects
const physics = { ...defaultPhysics };
const config = { ...defaultConfig };

// Particle class with core functionality
class Particle {
    constructor() {
        this.trail = [];
        this.trailLength = config.trailLength || 10;
        this.shape = config.shape;
        this.reset();
    }

    reset() {
        this.x = k.width() / 2;
        this.y = k.height() / 2;
        this.vx = (Math.random() - 0.5) * config.speed;
        this.vy = (Math.random() - 0.5) * config.speed;
        this.ax = 0;
        this.ay = 0;
        this.life = physics.particleLife;
        this.decay = (0.01 + Math.random() * 0.02) / physics.particleLife;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.2;
        this.size = config.size * (0.5 + Math.random() * 0.5);
        this.shape = config.shape;
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

        // Apply air resistance
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0) {
            this.ax -= (this.vx / speed) * physics.airResistance * speed * speed;
            this.ay -= (this.vy / speed) * physics.airResistance * speed * speed;
        }

        // Update velocity and position
        this.vx += (this.ax / physics.particleMass) * physics.acceleration;
        this.vy += (this.ay / physics.particleMass) * physics.acceleration;

        this.vx *= physics.friction;
        this.vy *= physics.friction;

        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
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
        this.trail.pop();
        this.trail.unshift({
            x: this.x,
            y: this.y,
            angle: this.angle
        });

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
            this.drawShape(point.x, point.y, trailSize, opacity, point.angle);
        }

        // Draw current particle
        this.drawShape(this.x, this.y, this.size, this.life, this.angle);
    }

    drawShape(x, y, size, opacity, angle) {
        if (config.shape === 'image' && config.particleSprite) {
            try {
                // Draw sprite-based particle with improved scaling
                const scale = size / (config.originalSize || 32); // Default size if originalSize is not set
                k.drawSprite({
                    sprite: config.particleSprite,
                    pos: k.vec2(x, y),
                    scale: k.vec2(scale, scale),
                    opacity: opacity,
                    angle: config.enableRotation ? angle : 0,
                    anchor: "center",
                });
            } catch (error) {
                console.error('Error drawing sprite:', error);
                // Fallback to circle if sprite drawing fails
                k.drawCircle({
                    pos: k.vec2(x, y),
                    radius: size / 2,
                    color: k.rgb(...hexToRgb(config.color), opacity),
                });
            }
        } else {
            // Default to circle if no sprite or different shape selected
            k.drawCircle({
                pos: k.vec2(x, y),
                radius: size / 2,
                color: k.rgb(...hexToRgb(config.color), opacity),
            });
        }
    }
}

// Create particle pool
let particles = Array(config.count).fill().map(() => new Particle());

// Emitter class
class Emitter {
    constructor() {
        this.x = k.width() / 2;
        this.y = k.height() / 2;
        this.isDragging = false;
        this.lastEmitTime = 0;
        this.emitRate = 60;
    }

    update() {
        if (this.isDragging) {
            const currentTime = performance.now();
            if (currentTime - this.lastEmitTime > (1000 / this.emitRate)) {
                const particlesToGenerate = Math.max(1, Math.floor(config.count / 60));
                for (let i = 0; i < particlesToGenerate && particles.length < config.count; i++) {
                    particles.push(this.generateParticle());
                }
                this.lastEmitTime = currentTime;
            }
        }
    }

    generateParticle() {
        const particle = new Particle();
        particle.x = this.x + (Math.random() - 0.5) * 10;
        particle.y = this.y + (Math.random() - 0.5) * 10;
        particle.vx = (Math.random() - 0.5) * config.speed;
        particle.vy = (Math.random() - 0.5) * config.speed;
        return particle;
    }

    updatePosition(clientX, clientY) {
        if (!k.canvas) return;
        const rect = k.canvas.getBoundingClientRect();
        this.x = clientX - rect.left;
        this.y = clientY - rect.top;
    }

    reset() {
        this.x = k.width() / 2;
        this.y = k.height() / 2;
        this.isDragging = false;
        this.lastEmitTime = 0;
    }
}

// Create emitter instance
const emitter = new Emitter();

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const canvas = k.canvas;
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    function handleStart(e) {
        e.preventDefault();
        const event = e.touches ? e.touches[0] : e;
        if (event) {
            emitter.isDragging = true;
            emitter.updatePosition(event.clientX, event.clientY);
        }
    }

    function handleMove(e) {
        e.preventDefault();
        if (emitter.isDragging) {
            const event = e.touches ? e.touches[0] : e;
            if (event) {
                emitter.updatePosition(event.clientX, event.clientY);
            }
        }
    }

    function handleEnd(e) {
        if (e) e.preventDefault();
        emitter.isDragging = false;
    }

    // Mouse events
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);

    // Touch events
    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleEnd, { passive: false });


    // Initialize background control options
    const bgScaleMode = document.getElementById('bgScaleMode');
    if (bgScaleMode) {
        bgScaleMode.addEventListener('change', (e) => {
            const mode = e.target.value;
            backgroundConfig.scaleMode = mode;
            document.querySelector('.background-options').style.display = mode === 'none' ? 'none' : 'block';
        });
    }

    // Particle shape control
    const particleShape = document.getElementById('particleShape');
    if (particleShape) {
        particleShape.addEventListener('change', (e) => {
            config.shape = e.target.value;
            const imageGroup = document.getElementById('imageEmitterGroup');
            if (imageGroup) {
                imageGroup.style.display = e.target.value === 'image' ? 'block' : 'none';
            }
        });
    }

    // Emitter image control
    const emitterImage = document.getElementById('emitterImage');
    if (emitterImage) {
        emitterImage.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                const img = await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = dataUrl;
                });

                // Calculate appropriate size based on image dimensions
                const maxSize = 64; // Maximum size for the sprite
                const scale = Math.min(1, maxSize / Math.max(img.width, img.height));

                // Create a temporary canvas to resize the image if needed
                const canvas = document.createElement('canvas');
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const scaledDataURL = canvas.toDataURL('image/png');
                const spriteName = 'particle_emitter';

                // Load the sprite with the scaled image
                await k.loadSprite(spriteName, scaledDataURL);

                // Update configuration
                config.shape = 'image';
                config.particleSprite = spriteName;
                config.originalSize = Math.max(canvas.width, canvas.height);

                // Reset particles with new sprite
                particles.forEach(particle => {
                    particle.reset();
                });

                // Update UI
                if (particleShape) {
                    particleShape.value = 'image';
                }
                const imageGroup = document.getElementById('imageEmitterGroup');
                if (imageGroup) {
                    imageGroup.style.display = 'block';
                }

                console.log('Emitter image loaded successfully:', spriteName);
            } catch (error) {
                console.error('Error loading emitter image:', error);
                // Reset to circle shape if image loading fails
                config.shape = 'circle';
                if (particleShape) {
                    particleShape.value = 'circle';
                }
                const imageGroup = document.getElementById('imageEmitterGroup');
                if (imageGroup) {
                    imageGroup.style.display = 'none';
                }
            }
        });
    }

    // Background color control
    const backgroundColorInput = document.getElementById('backgroundColor');
    if (backgroundColorInput) {
        backgroundColorInput.addEventListener('input', (e) => {
            backgroundColor = e.target.value;
            backgroundConfig.backgroundColor = e.target.value;
        });
    }

    // Initialize other event listeners
    initializeGraphs();


    const bgPosition = document.getElementById('bgPosition');
    if (bgPosition) {
        bgPosition.addEventListener('change', function(e) {
            backgroundConfig.position = e.target.value;
        });
    }

    const bgOpacity = document.getElementById('bgOpacity');
    if (bgOpacity) {
        bgOpacity.addEventListener('input', function(e) {
            backgroundConfig.opacity = parseFloat(e.target.value);
            document.getElementById('bgOpacityValue').value = Math.round(e.target.value * 100);
        });
    }

    const bgOpacityValue = document.getElementById('bgOpacityValue');
    if (bgOpacityValue) {
        bgOpacityValue.addEventListener('input', function(e) {
            const value = Math.min(100, Math.max(0, parseInt(e.target.value))) / 100;
            document.getElementById('bgOpacity').value = value;
            backgroundConfig.opacity = value;
        });
    }

    const particleSprite = document.getElementById('particleSprite');
    if (particleSprite) {
        particleSprite.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                const spriteName = 'particle';
                await k.loadSprite(spriteName, dataUrl);
                config.particleSprite = spriteName;
                config.originalSize = k.sprites[spriteName].width; //set original size from sprite width

            } catch (error) {
                console.error('Error loading particle sprite:', error);
            }
        });
    }

    const backgroundImageInput = document.getElementById('backgroundImage');
    if (backgroundImageInput) {
        backgroundImageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                backgroundImage = await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = dataUrl;
                });

                const spriteName = 'background';
                await k.loadSprite(spriteName, dataUrl);
                backgroundSprite = spriteName;
            } catch (error) {
                console.error('Error loading background image:', error);
            }
        });
    }
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

// Optional background configuration
let backgroundColor = "#2ecc71";
let backgroundImage = null;
let backgroundSprite = null;


// Main game loop
k.onUpdate(() => {
    // Update background color
    if (backgroundColor) {
        const [r, g, b] = hexToRgb(backgroundColor);
        k.setBackground(k.rgb(r, g, b));
    }

    // Draw background if available
    if (backgroundSprite && backgroundImage) {
        let width, height, x, y;

        switch (backgroundConfig.scaleMode) {
            case 'cover':
                const scale = Math.max(k.width() / backgroundImage.width, k.height() / backgroundImage.height);
                width = backgroundImage.width * scale;
                height = backgroundImage.height * scale;
                break;
            case 'contain':
                const containScale = Math.min(k.width() / backgroundImage.width, k.height() / backgroundImage.height);
                width = backgroundImage.width * containScale;
                height = backgroundImage.height * containScale;
                break;
            case 'stretch':
                width = k.width();
                height = k.height();
                break;
            case 'tile':
                width = backgroundImage.width;
                height = backgroundImage.height;
                for (let tileX = 0; tileX < k.width(); tileX += width) {
                    for (let tileY = 0; tileY < k.height(); tileY += height) {
                        k.drawSprite({
                            sprite: backgroundSprite,
                            pos: k.vec2(tileX, tileY),
                            opacity: backgroundConfig.opacity,
                            z: -1,
                        });
                    }
                }
                return;
        }

        // Calculate position based on alignment
        switch (backgroundConfig.position) {
            case 'center':
                x = (k.width() - width) / 2;
                y = (k.height() - height) / 2;
                break;
            case 'top':
                x = (k.width() - width) / 2;
                y = 0;
                break;
            case 'bottom':
                x = (k.width() - width) / 2;
                y = k.height() - height;
                break;
            case 'left':
                x = 0;
                y = (k.height() - height) / 2;
                break;
            case 'right':
                x = k.width() - width;
                y = (k.height() - height) / 2;
                break;
        }

        k.drawSprite({
            sprite: backgroundSprite,
            pos: k.vec2(x, y),
            scale: k.vec2(width / backgroundImage.width, height / backgroundImage.height),
            opacity: backgroundConfig.opacity,
            z: -1,
        });
    }

    // Update emitter
    emitter.update();

    // Remove dead particles
    particles = particles.filter(p => p.life > 0);

    // Generate new particles if needed
    while (particles.length < config.count) {
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

// Preset configurations
const presets = {
    polygonWeb: {
        count: 40,
        size: 15,
        speed: 2,
        color: '#4f46e5',
        shape: "polygon",
        physics: {
            gravity: 0,
            wind: 0,
            friction: 0.98,
            bounce: 1.0,
            airResistance: 0.02,
            turbulence: 0.1,
            vortexStrength: 0.05,
            particleMass: 1.0,
            acceleration: 1.2,
            collisionEnabled: true
        },
        polygon: {
            sides: 6,
            rotate: true
        },
        opacity: {
            value: 0.6,
            random: true
        },
        size: {
            value: 12,
            random: true,
            anim: {
                enable: true,
                speed: 2,
                size_min: 6,
                sync: false
            }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#d946ef',
            opacity: 0.3,
            width: 1
        },
        move: {
            enable: true,
            speed: 2.5,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "bounce",
            bounce: true,
            attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200
            }
        }
    },
    heroWeb: {
        count: 40,
        size: 15,
        speed: 2,
        color: '#d946ef',
        shape: ["circle", "triangle", "polygon"],
        physics: {
            gravity: 0,
            wind: 0,
            friction: 0.98,
            bounce: 1.0,
            airResistance: 0.02,
            turbulence: 0.1,
            vortexStrength: 0,
            particleMass: 1.0,
            acceleration: 1.0,
            collisionEnabled: true
        },
        opacity: {
            value: 0.6,
            random: true
        },
        size: {
            value: 15,
            random: true,
            anim: {
                enable: true,
                speed: 2,
                size_min: 8,
                sync: false
            }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#4f46e5',
            opacity: 0.2,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "bounce",
            bounce: false,
            attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200
            }
        }
    },
    geometricWeb: {
        count: 30,
        size: 15,
        speed: 2,
        color: "#00ffaa",
        shape: ["circle", "square", "triangle"].at(Math.floor(Math.random() * 3)),
        physics: {
            gravity: 0,
            wind: 0,
            friction: 0.98,
            bounce: 1.0,
            airResistance: 0.01,
            turbulence: 0.05,
            vortexStrength: 0.1,
            particleMass: 1.2,
            acceleration: 0.8,
            collisionEnabled: true
        }
    },
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

    // Update graph sizes
    Object.values(graphs).forEach(graph => {
        if (graph && graph.resize) {
            graph.resize();
        }
    });
});

// Panel handling
function handleKeyDown(e) {
    const focusedPanel = document.querySelector('.metrics-panel:focus');
    if (!focusedPanel) return;

    const step = 10;
    switch (e.key) {
        case 'Escape':
            focusedPanel.style.display = 'none';
            break;
        case 'ArrowLeft':
            e.preventDefault();
            focusedPanel.style.left = `${parseInt(focusedPanel.style.left || 0) - step}px`;
            break;
        case 'ArrowRight':
            e.preventDefault();
            focusedPanel.style.left = `${parseInt(focusedPanel.style.left || 0) + step}px`;
            break;
        case 'ArrowUp':
            e.preventDefault();
            focusedPanel.style.top = `${parseInt(focusedPanel.style.top || 0) - step}px`;
            break;
        case 'ArrowDown':
            e.preventDefault();
            focusedPanel.style.top = `${parseInt(focusedPanel.style.top || 0) + step}px`;
            break;
    }
}

document.addEventListener('keydown', handleKeyDown);


// Metrics tracking variables
let lastTime = performance.now();
let frames = 0;
let fps = 0;

// Initialize metrics history arrays
const maxDataPoints = 50;
const metricsHistory = {
    fps: Array(maxDataPoints).fill(0),
    particleCount: Array(maxDataPoints).fill(0),
    avgSpeed: Array(maxDataPoints).fill(0),
    memory: Array(maxDataPoints).fill(0)
};

// Initialize Chart.js graphs
let graphs = {
    fps: null,
    particleCount: null,
    speed: null,
    memory: null
};

// Function to initialize graphs
function initializeGraphs() {
    const commonConfig = {
        type: 'line',
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(46, 204, 113, 0.1)'
                    },
                    ticks: {
                        color: '#2ecc71'
                    }
                },
                x: {
                    display: false
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    };

    const createDataset = (label, color) => ({
        label,
        data: [],
        borderColor: color,
        borderWidth: 1,
        fill: false,
        tension: 0.4
    });

    graphs.fps = new Chart(document.getElementById('fpsGraph'), {
        ...commonConfig,
        data: {
            labels: Array(maxDataPoints).fill(''),
            datasets: [createDataset('FPS', '#2ecc71')]
        }
    });

    graphs.particleCount = new Chart(document.getElementById('particleCountGraph'), {
        ...commonConfig,
        data: {
            labels: Array(maxDataPoints).fill(''),
            datasets: [createDataset('Particles', '#2ecc71')]
        }
    });

    graphs.speed = new Chart(document.getElementById('speedGraph'), {
        ...commonConfig,
        data: {
            labels: Array(maxDataPoints).fill(''),
            datasets: [createDataset('Speed', '#2ecc71')]
        }
    });

    graphs.memory = new Chart(document.getElementById('memoryGraph'), {
        ...commonConfig,
        data: {
            labels: Array(maxDataPoints).fill(''),
            datasets: [createDataset('Memory', '#2ecc71')]
        }
    });
}


// Metrics overlay functionality
const metricsOverlay = document.getElementById("metricsOverlay");

// Dragging functionality
let isDragging = false;
let currentPanel = null;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

function dragStart(e, panel) {
    if (e.target.tagName === 'BUTTON') return;

    if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
    } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
    }
    if (e.target.closest('.metrics-panel')) {
        currentPanel = panel;
        isDragging = true;
    }
}

function dragEnd() {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
    currentPanel = null;
}

function drag(e) {
    if (isDragging && currentPanel && !currentPanel.classList.contains('fullscreen')) {
        e.preventDefault();

        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        const maxX = window.innerWidth - currentPanel.offsetWidth;
        const maxY = window.innerHeight - currentPanel.offsetHeight;

        currentX = Math.min(Math.max(currentX, 0), maxX);
        currentY = Math.min(Math.max(currentY, 0), maxY);

        currentPanel.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    }
}

function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel.style.display === "none") {
        panel.style.display = "block";
    } else {
        panel.style.display = "none";
    }
}

function toggleFullscreen(panelId) {
    const panel = document.getElementById(panelId);
    panel.classList.toggle('fullscreen');

    if (panel.classList.contains('fullscreen')) {
        panel.style.transform = 'none';
        xOffset = 0;
        yOffset = 0;
    }

    // Update graph sizes
    Object.values(graphs).forEach(graph => {
        if (graph && graph.resize) {
            graph.resize();
        }
    });
}

// Initialize panel dragging
document.addEventListener('DOMContentLoaded', () => {
    const panels = document.querySelectorAll('.metrics-panel');
    panels.forEach(panel => {
        panel.addEventListener("touchstart", e => dragStart(e, panel), false);
        panel.addEventListener("mousedown", e => dragStart(e, panel), false);
        panel.addEventListener("touchend", dragEnd, false);
        panel.addEventListener("mouseup", dragEnd, false);
    });

    document.addEventListener("touchmove", drag, false);
    document.addEventListener("mousemove", drag, false);
});

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // Toggle metrics panels with Alt + M
    if (e.altKey && e.key.toLowerCase() === 'm') {
        document.getElementById('toggleMetricsButton').click();
    }

    // Handle panel navigation and control
    const focusedPanel = document.activeElement.closest('.metrics-panel');
    if (focusedPanel) {
        const step = e.shiftKey ? 10 : 1; // Larger steps with Shift key

        switch (e.key) {
            case 'Escape':
                focusedPanel.style.display = 'none';
                break;
            case 'ArrowLeft':
                e.preventDefault();
                focusedPanel.style.left = `${parseInt(focusedPanel.style.left || 0) - step}px`;
                break;
            case 'ArrowRight':
                e.preventDefault();
                focusedPanel.style.left = `${parseInt(focusedPanel.style.left || 0) + step}px`;
                break;
            case 'ArrowUp':
                e.preventDefault();
                focusedPanel.style.top = `${parseInt(focusedPanel.style.top || 0) - step}px`;
                break;
            case 'ArrowDown':
                e.preventDefault();
                focusedPanel.style.top = `${parseInt(focusedPanel.style.top || 0) + step}px`;
                break;
        }
    }
});

// Make panels focusable
document.querySelectorAll('.metrics-panel').forEach(panel => {
    panel.setAttribute('tabindex', '0');
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', panel.querySelector('.metrics-header h4').textContent);
});
// Toggle all metrics panels
document.getElementById('toggleMetricsButton').addEventListener('click', () => {
    const panels = document.querySelectorAll('.metrics-panel');
    const anyVisible = Array.from(panels).some(panel => panel.style.display !== 'none');

    panels.forEach(panel => {
        panel.style.display = anyVisible ? 'none' : 'block';
    });
});

// Initialize panel visibility
document.addEventListener('DOMContentLoaded', () => {
    const panels = ['fpsPanel', 'particlePanel', 'speedPanel', 'memoryPanel', 'positionPanel'];
    panels.forEach(panelId => {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.style.display = "block";
        }
    });
});

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

// Add reset functionality
function resetSystem() {
    try {
        // Load stored defaults or use initial defaults
        const storedDefaults = JSON.parse(localStorage.getItem('particleSystemDefaults')) || {
            physics: defaultPhysics,
            config: defaultConfig
        };

        // Reset physics and config to stored defaults
        Object.assign(physics, storedDefaults.physics);
        Object.assign(config, storedDefaults.config);

        // Reset all particles
        particles = Array(config.count).fill().map(() => new Particle());

        // Reset emitter
        emitter.reset();

        // Update UI controls to match reset values
        updateControlsToMatch(storedDefaults);
    } catch (error) {
        console.error('Error resetting system:', error);
    }
}

// Update UI controls to match given values
function updateControlsToMatch(values) {
    // Update physics controls
    document.getElementById('gravity').value = values.physics.gravity;
    document.getElementById('wind').value = values.physics.wind;
    document.getElementById('friction').value = values.physics.friction;
    document.getElementById('bounce').value = values.physics.bounce;
    document.getElementById('airResistance').value = values.physics.airResistance;
    document.getElementById('turbulence').value = values.physics.turbulence;
    document.getElementById('vortexStrength').value = values.physics.vortexStrength;
    document.getElementById('particleMass').value = values.physics.particleMass;
    document.getElementById('collisionEnabled').checked = values.physics.collisionEnabled;

    // Update particle controls
    document.getElementById('particleCount').value = values.config.count;
    document.getElementById('particleSize').value = values.config.size;
    document.getElementById('particleSpeed').value = values.config.speed;
    document.getElementById('particleColor').value = values.config.color;

    // Trigger update events
    document.getElementById('particleCount').dispatchEvent(new Event('input'));
    document.getElementById('particleSize').dispatchEvent(new Event('input'));
    document.getElementById('particleSpeed').dispatchEvent(new Event('input'));
}

function calculatePercentage(value, min, max) {
    return Math.round(((value - min) / (max - min)) * 100);
}
// Toggle all metrics panels
document.getElementById('toggleMetricsButton').addEventListener('click', () => {
    const panels = document.querySelectorAll('.metrics-panel');
    const anyVisible = Array.from(panels).some(panel => panel.style.display !== 'none');

    panels.forEach(panel => {
        panel.style.display = anyVisible ? 'none' : 'block';
    });
});