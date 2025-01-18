memory usage (rough approximation)
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
        particleMass: 1.0,
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
        trailLength: 10,        reverseTrail: false
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