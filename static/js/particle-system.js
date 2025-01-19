// Initialize dimensions
const initialWidth = window.innerWidth;
const initialHeight = window.innerHeight;

// Background configuration
let backgroundColor = "#2ecc71"; // Default green background matching UI theme

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
    particleMass: 0.59, // Approximately 10% on the 0.1-5 scale
    particleLife: 1.0,
    acceleration: 1.0,
    collisionEnabled: false
};

// Initialize variables for background
let backgroundImage = null;
let backgroundSprite = null;

// Initialize Kaboom.js
const k = kaboom({
    global: false,
    canvas: document.getElementById("gameCanvas"),
    width: initialWidth,
    height: initialHeight,
    background: hexToRgb(backgroundColor),
});

// Particle system configuration
const config = {
    count: 50,
    size: 5,
    speed: 5,
    color: "#ffffff",
    preset: "sparkle",
    trailLength: 10,  // Added trail length configuration
    reverseTrail: false, // Trail direction control
    shape: 'circle' // Default shape
};

// Particle class
class Particle {
    constructor() {
        this.trail = [];
        this.trailLength = config.trailLength || 10;
        this.shape = config.shape; // Store the shape configuration
        this.reset();
    }

    reset() {
        // Always initialize at the center of the screen
        this.x = k.width() / 2;
        this.y = k.height() / 2;
        // Initialize with random velocities
        this.vx = (Math.random() - 0.5) * config.speed;
        this.vy = (Math.random() - 0.5) * config.speed;
        this.ax = 0;
        this.ay = 0;
        this.life = physics.particleLife;
        this.decay = (0.01 + Math.random() * 0.02) / physics.particleLife;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.2;
        this.size = config.size * (0.5 + Math.random() * 0.5);
        this.shape = config.shape; // Update shape when resetting
        // Initialize trail from the center position
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

        // Update velocity and position with acceleration
        this.vx += (this.ax / physics.particleMass) * physics.acceleration;
        this.vy += (this.ay / physics.particleMass) * physics.acceleration;

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

            this.drawShape(point.x, point.y, trailSize, opacity, point.angle);
        }

        // Draw current particle
        const opacity = this.life;
        const shouldRotate = config.enableRotation;
        this.drawShape(this.x, this.y, this.size, opacity, shouldRotate ? this.angle : 0);
    }

    drawShape(x, y, size, opacity, angle) {
        if (this.shape === 'image' && config.particleSprite) {
            const scale = size / config.originalSize;
            k.drawSprite({
                sprite: config.particleSprite,
                pos: k.vec2(x - size/2, y - size/2),
                scale: k.vec2(scale, scale),
                angle: angle,
                opacity: opacity,
            });
            return;
        }
        
        switch (this.shape) {
            case 'square':
                k.drawRect({
                    pos: k.vec2(x - size / 2, y - size / 2),
                    width: size,
                    height: size,
                    angle: angle,
                    color: k.rgb(...hexToRgb(config.color), opacity),
                });
                break;
            case 'triangle':
                const points = [];
                for (let i = 0; i < 3; i++) {
                    const pointAngle = (i * 2 * Math.PI / 3) + angle;
                    points.push(k.vec2(
                        x + Math.cos(pointAngle) * size,
                        y + Math.sin(pointAngle) * size
                    ));
                }
                k.drawPolygon({
                    pts: points,
                    color: k.rgb(...hexToRgb(config.color), opacity),
                });
                break;
            case 'star':
                const starPoints = [];
                for (let i = 0; i < 5; i++) {
                    const starAngle = (i * 4 * Math.PI / 5) + angle;
                    starPoints.push(k.vec2(
                        x + Math.cos(starAngle) * size,
                        y + Math.sin(starAngle) * size * 0.5
                    ));
                }
                k.drawPolygon({
                    pts: starPoints,
                    color: k.rgb(...hexToRgb(config.color), opacity),
                });
                break;
            default: // circle
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
        // Apply current shape configuration
        particle.shape = config.shape;
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

// Add event listener for background color changes
document.getElementById('backgroundColor').addEventListener('input', function (e) {
    const selectedColor = e.target.value;
    // Update the background color in real-time when color picker changes
    const [r, g, b] = hexToRgb(selectedColor);
    k.setBackground(k.rgb(r, g, b, 0.3)); // Keeping the same transparency for consistency
});


// Add event listener for shape changes
document.getElementById('particleShape').addEventListener('change', function (e) {
    config.shape = e.target.value;
});

// Main game loop
k.onUpdate(() => {
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

// Initialize graphs when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeGraphs);

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

        let mouseX, mouseY;
        if (e.type === "touchmove") {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
        } else {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }

        // Calculate panel center offset
        const panelWidth = currentPanel.offsetWidth;
        const panelHeight = currentPanel.offsetHeight;
        
        // Position panel with center at cursor
        currentX = mouseX - (panelWidth / 2);
        currentY = mouseY - (panelHeight / 2);

        // Keep panel within viewport bounds
        currentX = Math.min(Math.max(currentX, 0), window.innerWidth - panelWidth);
        currentY = Math.min(Math.max(currentY, 0), window.innerHeight - panelHeight);

        currentPanel.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        
        xOffset = currentX;
        yOffset = currentY;
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
    // Reset physics parameters to default values
    Object.assign(physics, {
        gravity: 0.1,
        wind: 0,
        friction: 0.99,
        bounce: 0.8,
        airResistance: 0.02,
        turbulence: 0.1,
        vortexStrength: 0,
        vortexCenter: { x: k.width() / 2, y: k.height() / 2 },
        particleMass: 0.59, // Approximately 10% on the 0.1-5 scale
        particleLife: 1.0,
        acceleration: 1.0,
        collisionEnabled: false
    });

    // Reset configuration to default
    Object.assign(config, {
        count: 50,
        size: 5,
        speed: 5,
        color: "#ffffff",
        preset: "sparkle",
        trailLength: 10,
        reverseTrail: false,
        shape: 'circle' // Default shape
    });

    // Reset background
    const [r, g, b] = hexToRgb('#2ecc71');
    k.setBackground(k.rgb(r, g, b, 0.3));
    document.getElementById('backgroundColor').value = '#2ecc71';

    // Clear background image if any
    backgroundImage = null;
    backgroundSprite = null;

    // Reset emitter position
    emitter.reset();

    // Clear all particles and create new ones
    particles = Array(config.count).fill().map(() => new Particle());

    // Reset all UI controls to match default values
    document.getElementById('particleCount').value = config.count;
    document.getElementById('particleSize').value = config.size;
    document.getElementById('particleSpeed').value = config.speed;
    document.getElementById('particleColor').value = config.color;
    document.getElementById('gravity').value = physics.gravity;
    document.getElementById('wind').value = physics.wind;
    document.getElementById('bounce').value = physics.bounce;
    document.getElementById('friction').value = physics.friction;
    document.getElementById('airResistance').value = physics.airResistance;
    document.getElementById('turbulence').value = physics.turbulence;
    document.getElementById('vortexStrength').value = physics.vortexStrength;
    document.getElementById('particleMass').value = physics.particleMass;
    document.getElementById('particleLife').value = physics.particleLife;
    document.getElementById('particleAcceleration').value = physics.acceleration;
    document.getElementById('collisionEnabled').checked = physics.collisionEnabled;
    document.getElementById('trailLength').value = config.trailLength;
    document.getElementById('reverseTrail').checked = config.reverseTrail;
    document.getElementById('presets').value = config.preset;

    // Clear any file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.value = '';
    });
}