// Initialize dimensions and configurations
const initialWidth = window.innerWidth * 0.75;
const initialHeight = window.innerHeight;

// Initialize Kaboom.js
const k = kaboom({
    global: false,
    canvas: document.getElementById("gameCanvas"),
    width: initialWidth,
    height: initialHeight,
    background: [46, 204, 113]
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
            acceleration: 1.0,
            collisionEnabled: false
        }
    },
    magic: {
        count: 80,
        size: 6,
        speed: 4,
        color: "#ff00ff",
        physics: {
            gravity: -0.05,
            wind: 0.02,
            friction: 0.97,
            bounce: 0.9,
            airResistance: 0.01,
            turbulence: 0.15,
            vortexStrength: 0.3,
            particleMass: 0.6,
            acceleration: 1.3,
            collisionEnabled: false
        }
    },
    rain: {
        count: 150,
        size: 2,
        speed: 8,
        color: "#4499ff",
        physics: {
            gravity: 0.3,
            wind: 0.05,
            friction: 0.99,
            bounce: 0.3,
            airResistance: 0.01,
            turbulence: 0.02,
            vortexStrength: 0,
            particleMass: 0.4,
            acceleration: 1.1,
            collisionEnabled: false
        }
    },
    bubbles: {
        count: 60,
        size: 8,
        speed: 2,
        color: "#00ffff",
        physics: {
            gravity: -0.08,
            wind: 0,
            friction: 0.98,
            bounce: 1.0,
            airResistance: 0.03,
            turbulence: 0.08,
            vortexStrength: 0.1,
            particleMass: 0.3,
            acceleration: 0.7,
            collisionEnabled: true
        }
    },
    laser: {
        count: 100,
        size: 3,
        speed: 12,
        color: "#ff0000",
        physics: {
            gravity: 0,
            wind: 0.2,
            friction: 0.95,
            bounce: 1.0,
            airResistance: 0,
            turbulence: 0,
            vortexStrength: -0.2,
            particleMass: 0.2,
            acceleration: 2.0,
            collisionEnabled: false
        }
    },
    smoke: {
        count: 90,
        size: 10,
        speed: 3,
        color: "#666666",
        physics: {
            gravity: -0.02,
            wind: 0.03,
            friction: 0.96,
            bounce: 0.1,
            airResistance: 0.04,
            turbulence: 0.2,
            vortexStrength: 0.1,
            particleMass: 0.5,
            acceleration: 0.8,
            collisionEnabled: false
        }
    }
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
    vortexCenter: { x: initialWidth / 2, y: initialHeight / 2 },
    particleMass: 1.0,
    particleLife: 1.0,
    acceleration: 1.0,
    collisionEnabled: false
};

// Initial configuration
let config = {
    count: 50,
    size: 5,
    speed: 5,
    color: "#ffffff",
    preset: "sparkle",
    trailLength: 10,
    reverseTrail: false
};

// Particle class definition
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
        this.life = physics.particleLife;
        this.decay = (0.01 + Math.random() * 0.02) / physics.particleLife;
        this.trail = Array(this.trailLength).fill().map(() => ({
            x: this.x,
            y: this.y
        }));
    }

    update() {
        // Apply physics
        this.vx += physics.wind;
        this.vy += physics.gravity;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Apply friction
        this.vx *= physics.friction;
        this.vy *= physics.friction;

        // Update trail
        if (config.reverseTrail) {
            this.trail.shift();
            this.trail.push({ x: this.x, y: this.y });
        } else {
            this.trail.pop();
            this.trail.unshift({ x: this.x, y: this.y });
        }

        // Handle boundaries
        if (this.x < 0 || this.x > k.width()) {
            this.vx *= -physics.bounce;
            this.x = this.x < 0 ? 0 : k.width();
        }
        if (this.y < 0 || this.y > k.height()) {
            this.vy *= -physics.bounce;
            this.y = this.y < 0 ? 0 : k.height();
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
            radius: config.size,
            color: k.rgb(...hexToRgb(config.color), this.life)
        });
    }
}

// Create particle pool
let particles = Array(config.count).fill().map(() => new Particle());

// Utility function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [255, 255, 255];
}

// Reset system function
window.resetSystem = function() {
    Object.assign(physics, {
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
    });

    Object.assign(config, {
        count: 50,
        size: 5,
        speed: 5,
        color: "#ffffff",
        preset: "sparkle",
        trailLength: 10,
        reverseTrail: false
    });

    // Reset UI controls
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

    // Reset particles
    particles = Array(config.count).fill().map(() => new Particle());
};

// Event listener for preset selection
document.getElementById('presets').addEventListener('change', function(e) {
    const selectedPreset = presets[e.target.value];
    if (selectedPreset) {
        Object.assign(config, {
            count: selectedPreset.count,
            size: selectedPreset.size,
            speed: selectedPreset.speed,
            color: selectedPreset.color
        });
        Object.assign(physics, selectedPreset.physics);

        // Update UI controls
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

        // Reset particles with new configuration
        particles = Array(config.count).fill().map(() => new Particle());
    }
});

// Main game loop
k.onUpdate(() => {
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
});

// Metrics tracking
let metricsHistory = {
    fps: Array(60).fill(0),
    particleCount: Array(60).fill(0),
    avgSpeed: Array(60).fill(0),
    memory: Array(60).fill(0)
};

let graphs = {}; // Placeholder for chart.js instances

k.onDraw(() => {
    // Calculate FPS
    const now = performance.now();
    const dt = now - (k.lastDrawTime || now);
    const fps = Math.round(1000 / dt);
    k.lastDrawTime = now;

    // Calculate average speed
    let totalSpeed = 0;
    particles.forEach(particle => {
        totalSpeed += Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
    });
    const avgSpeed = totalSpeed / particles.length;

    // Estimate memory usage (rough approximation)
    const memoryUsage = (particles.length * 200) / (1024 * 1024); // Rough estimate in MB

    // Update text metrics
    document.getElementById('fpsMetric').textContent = fps;
    document.getElementById('particleCountMetric').textContent = particles.length;
    document.getElementById('avgSpeedMetric').textContent = avgSpeed.toFixed(2);
    document.getElementById('memoryMetric').textContent = `${memoryUsage.toFixed(2)} MB`;
    document.getElementById('emitterPosMetric').textContent =
        `x: ${Math.round(k.width()/2)}, y: ${Math.round(k.height()/2)}`;

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
});