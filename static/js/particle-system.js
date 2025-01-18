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

// Make presets globally available
window.particlePresets = {
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

// Initialize global configurations
window.physics = {
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

window.config = {
    count: 50,
    size: 5,
    speed: 5,
    color: "#ffffff",
    preset: "sparkle",
    trailLength: 10,
    reverseTrail: false
};

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [255, 255, 255];
}

// Particle class definition
class Particle {
    constructor() {
        this.trail = [];
        this.trailLength = window.config.trailLength || 10;
        this.reset();
    }

    reset() {
        this.x = k.width() / 2;
        this.y = k.height() / 2;
        this.vx = (Math.random() - 0.5) * window.config.speed;
        this.vy = (Math.random() - 0.5) * window.config.speed;
        this.life = window.physics.particleLife;
        this.decay = (0.01 + Math.random() * 0.02) / window.physics.particleLife;
        this.trail = Array(this.trailLength).fill().map(() => ({
            x: this.x,
            y: this.y
        }));
    }

    update() {
        // Apply physics
        this.vx += window.physics.wind;
        this.vy += window.physics.gravity;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Apply friction
        this.vx *= window.physics.friction;
        this.vy *= window.physics.friction;

        // Update trail
        if (window.config.reverseTrail) {
            this.trail.shift();
            this.trail.push({ x: this.x, y: this.y });
        } else {
            this.trail.pop();
            this.trail.unshift({ x: this.x, y: this.y });
        }

        // Handle boundaries
        if (this.x < 0 || this.x > k.width()) {
            this.vx *= -window.physics.bounce;
            this.x = this.x < 0 ? 0 : k.width();
        }
        if (this.y < 0 || this.y > k.height()) {
            this.vy *= -window.physics.bounce;
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
                radius: window.config.size * (1 - i / this.trail.length),
                color: k.rgb(...hexToRgb(window.config.color), opacity)
            });
        });

        // Draw particle
        k.drawCircle({
            pos: k.vec2(this.x, this.y),
            radius: window.config.size,
            color: k.rgb(...hexToRgb(window.config.color), this.life)
        });
    }
}

// Create particle pool
let particles = Array(window.config.count).fill().map(() => new Particle());

// Reset system function - make it globally available
window.resetSystem = function() {
    // Reset physics parameters to default values
    Object.assign(window.physics, {
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

    // Reset configuration to default
    Object.assign(window.config, {
        count: 50,
        size: 5,
        speed: 5,
        color: "#ffffff",
        preset: "sparkle",
        trailLength: 10,
        reverseTrail: false
    });

    // Reset UI controls
    document.getElementById('particleCount').value = window.config.count;
    document.getElementById('particleSize').value = window.config.size;
    document.getElementById('particleSpeed').value = window.config.speed;
    document.getElementById('particleColor').value = window.config.color;
    document.getElementById('gravity').value = window.physics.gravity;
    document.getElementById('wind').value = window.physics.wind;
    document.getElementById('bounce').value = window.physics.bounce;
    document.getElementById('friction').value = window.physics.friction;
    document.getElementById('airResistance').value = window.physics.airResistance;
    document.getElementById('turbulence').value = window.physics.turbulence;
    document.getElementById('vortexStrength').value = window.physics.vortexStrength;
    document.getElementById('particleMass').value = window.physics.particleMass;
    document.getElementById('particleLife').value = window.physics.particleLife;
    document.getElementById('particleAcceleration').value = window.physics.acceleration;
    document.getElementById('collisionEnabled').checked = window.physics.collisionEnabled;
    document.getElementById('trailLength').value = window.config.trailLength;
    document.getElementById('reverseTrail').checked = window.config.reverseTrail;
    document.getElementById('presets').value = window.config.preset;

    // Reset particles
    particles = Array(window.config.count).fill().map(() => new Particle());
};

// Event listener for preset selection
window.addEventListener('DOMContentLoaded', () => {
    const presetsSelect = document.getElementById('presets');
    if (presetsSelect) {
        presetsSelect.addEventListener('change', function(e) {
            const selectedPreset = window.particlePresets[e.target.value];
            if (selectedPreset) {
                // Update configuration
                Object.assign(window.config, {
                    count: selectedPreset.count,
                    size: selectedPreset.size,
                    speed: selectedPreset.speed,
                    color: selectedPreset.color
                });

                // Update physics
                Object.assign(window.physics, selectedPreset.physics);

                // Update UI controls
                document.getElementById('particleCount').value = window.config.count;
                document.getElementById('particleSize').value = window.config.size;
                document.getElementById('particleSpeed').value = window.config.speed;
                document.getElementById('particleColor').value = window.config.color;
                document.getElementById('gravity').value = window.physics.gravity;
                document.getElementById('wind').value = window.physics.wind;
                document.getElementById('bounce').value = window.physics.bounce;
                document.getElementById('friction').value = window.physics.friction;
                document.getElementById('airResistance').value = window.physics.airResistance;
                document.getElementById('turbulence').value = window.physics.turbulence;
                document.getElementById('vortexStrength').value = window.physics.vortexStrength;
                document.getElementById('particleMass').value = window.physics.particleMass;
                document.getElementById('particleLife').value = window.physics.particleLife;
                document.getElementById('particleAcceleration').value = window.physics.acceleration;
                document.getElementById('collisionEnabled').checked = window.physics.collisionEnabled;

                // Reset particles with new configuration
                particles = Array(window.config.count).fill().map(() => new Particle());
            }
        });
    }
});

// Main game loop
k.onUpdate(() => {
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
});