

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

        switch(e.key) {
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
// Main game loop
k.onUpdate(() => {
    // Get the current theme and set background accordingly
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