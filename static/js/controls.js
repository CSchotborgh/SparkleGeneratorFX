
// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});



// Control panel toggle
document.getElementById('toggleControlPanel').addEventListener('click', () => {
    document.querySelector('.control-panel-overlay').classList.toggle('active');
});


// Control panel event listeners
function calculatePercentage(value, min, max) {
    return Math.round(((value - min) / (max - min)) * 100);
}

document.getElementById('particleCount').addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    config.count = value;
    document.getElementById('particleCountValue').value = calculatePercentage(value, 1, 100);
    particles = Array(config.count).fill().map(() => new Particle());
});

document.getElementById('particleCountValue').addEventListener('input', (e) => {
    const percentage = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
    const value = Math.round((percentage / 100) * (100 - 1) + 1);
    config.count = value;
    document.getElementById('particleCount').value = value;
    particles = Array(config.count).fill().map(() => new Particle());
    e.target.value = percentage;
});

document.getElementById('particleSize').addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    config.size = value;
    document.getElementById('particleSizeValue').value = value;
});

document.getElementById('particleSizeValue').addEventListener('input', (e) => {
    const value = Math.min(1000, Math.max(1, parseInt(e.target.value) || 1));
    config.size = value;
    document.getElementById('particleSize').value = value;
    e.target.value = value;
});

document.getElementById('particleSpeed').addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    config.speed = value;
    document.getElementById('particleSpeedValue').value = value;
});

document.getElementById('particleSpeedValue').addEventListener('input', (e) => {
    const value = Math.min(160, Math.max(0, parseInt(e.target.value) || 60));
    config.speed = value;
    document.getElementById('particleSpeed').value = value;
    e.target.value = value;
});

document.getElementById('gravity').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    physics.gravity = value;
    document.getElementById('gravityValue').value = calculatePercentage(value, 0, 0.5);
});

document.getElementById('gravityValue').addEventListener('input', (e) => {
    const percentage = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
    const value = (percentage / 100) * 0.5;
    physics.gravity = value;
    document.getElementById('gravity').value = value;
    e.target.value = percentage;
});

document.getElementById('wind').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    physics.wind = value;
    document.getElementById('windValue').value = calculatePercentage(value, -0.2, 0.2);
});

document.getElementById('windValue').addEventListener('input', (e) => {
    const percentage = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
    const value = ((percentage / 100) * 0.4) - 0.2;
    physics.wind = value;
    document.getElementById('wind').value = value;
    e.target.value = percentage;
});

document.getElementById('bounce').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    physics.bounce = value;
    document.getElementById('bounceValue').textContent = calculatePercentage(value, 0, 1);
});

document.getElementById('friction').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    physics.friction = value;
    document.getElementById('frictionValue').textContent = calculatePercentage(value, 0.9, 1);
});

document.getElementById('airResistance').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    physics.airResistance = value;
    document.getElementById('airResistanceValue').textContent = calculatePercentage(value, 0, 0.1);
});

document.getElementById('turbulence').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    physics.turbulence = value;
    document.getElementById('turbulenceValue').textContent = calculatePercentage(value, 0, 0.5);
});

document.getElementById('vortexStrength').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    physics.vortexStrength = value;
    document.getElementById('vortexStrengthValue').textContent = calculatePercentage(value, -1, 1);
    physics.vortexCenter = { x: k.width() / 2, y: k.height() / 2 };
});

document.getElementById('particleMass').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    physics.particleMass = value;
    document.getElementById('particleMassValue').textContent = calculatePercentage(value, 0.1, 5);
});

document.getElementById('particleLife').addEventListener('input', (e) => {
    physics.particleLife = parseFloat(e.target.value);
    // Update existing particles' life value
    particles.forEach(particle => {
        if (particle.life > physics.particleLife) {
            particle.life = physics.particleLife;
        }
    });
});

document.getElementById('particleAcceleration').addEventListener('input', (e) => {
    physics.acceleration = parseFloat(e.target.value);
});

document.getElementById('collisionEnabled').addEventListener('change', (e) => {
    physics.collisionEnabled = e.target.checked;
});

document.getElementById('particleColor').addEventListener('input', (e) => {
    config.color = e.target.value;
});

// Advanced particle options
document.getElementById('particleOpacity').addEventListener('input', (e) => {
    config.opacity = parseFloat(e.target.value);
});

document.getElementById('particleBlur').addEventListener('input', (e) => {
    config.blur = parseInt(e.target.value);
});

document.getElementById('particleShape').addEventListener('change', (e) => {
    config.shape = e.target.value;
    const imageGroup = document.getElementById('imageEmitterGroup');
    imageGroup.style.display = e.target.value === 'image' ? 'block' : 'none';
});

document.getElementById('emitterImage').addEventListener('change', async (e) => {
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

        // Load the sprite for particles
        const spriteName = 'particle_emitter';
        await k.loadSprite(spriteName, dataUrl);
        config.particleSprite = spriteName;
        config.originalSize = Math.max(img.width, img.height);
    } catch (error) {
        console.error('Error loading emitter image:', error);
    }
});

document.getElementById('particleRotation').addEventListener('change', (e) => {
    config.enableRotation = e.target.checked;
});
document.getElementById('trailLength').addEventListener('input', (e) => {
    config.trailLength = parseInt(e.target.value);
    particles.forEach(particle => {
        particle.trailLength = config.trailLength;
    });
});

document.getElementById('reverseTrail').addEventListener('change', (e) => {
    config.reverseTrail = e.target.checked;
    // Reset trails when direction changes to avoid visual artifacts
    particles.forEach(particle => {
        particle.trail = Array(particle.trailLength).fill().map(() => ({
            x: particle.x,
            y: particle.y,
            angle: particle.angle
        }));
    });
});


document.getElementById('presets').addEventListener('change', (e) => {
    const preset = presets[e.target.value];
    Object.assign(config, preset);
    
    // Update physics parameters
    if (preset.physics) {
        Object.assign(physics, preset.physics);
        
        // Update physics control UI
        document.getElementById('gravity').value = physics.gravity;
        document.getElementById('wind').value = physics.wind;
        document.getElementById('friction').value = physics.friction;
        document.getElementById('bounce').value = physics.bounce;
        document.getElementById('airResistance').value = physics.airResistance;
        document.getElementById('turbulence').value = physics.turbulence;
        document.getElementById('vortexStrength').value = physics.vortexStrength;
        document.getElementById('particleMass').value = physics.particleMass;
        document.getElementById('collisionEnabled').checked = physics.collisionEnabled;
    }
    
    // Update visual control UI
    document.getElementById('particleCount').value = config.count;
    document.getElementById('particleSize').value = config.size;
    document.getElementById('particleSpeed').value = config.speed;
    document.getElementById('particleColor').value = config.color;
    
    // Reset particles with new configuration
    particles = Array(config.count).fill().map(() => new Particle());
});

// Image import handler
document.getElementById('imageImport').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    animationFrames = [];
    
    try {
        for (const file of files) {
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

            const canvas = document.createElement('canvas');
            const maxSize = 64;
            const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
            
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const scaledDataURL = canvas.toDataURL('image/png');
            const spriteName = `particle_${animationFrames.length}`;
            
            await k.loadSprite(spriteName, scaledDataURL);
            
            animationFrames.push({
                sprite: spriteName,
                originalSize: Math.max(canvas.width, canvas.height)
            });
        }

        if (animationFrames.length > 0) {
            particles.forEach(particle => {
                particle.sprite = animationFrames[0].sprite;
                particle.originalSize = animationFrames[0].originalSize;
                particle.reset();
            });
        }
    } catch (error) {
        console.error('Error loading images:', error);
    }
});

// Animation state
let animationFrames = [];
let currentFrame = 0;
let isAnimating = false;
let animationInterval = null;
const frameRate = 24; // frames per second

function startAnimation() {
    if (animationFrames.length > 0) {
        isAnimating = true;
        if (animationInterval) {
            clearInterval(animationInterval);
        }
        
        try {
            animationInterval = setInterval(() => {
                if (!isAnimating) return;
                
                // Update particles with next frame data
                const frame = animationFrames[currentFrame];
                if (frame && frame.sprite) {
                    particles.forEach(particle => {
                        particle.sprite = frame.sprite;
                        particle.originalSize = frame.originalSize;
                    });
                }

                // Advance to next frame
                currentFrame = (currentFrame + 1) % animationFrames.length;
            }, 1000 / frameRate);
        } catch (error) {
            console.error('Animation error:', error);
            stopAnimation();
        }
    }
}

function stopAnimation() {
    isAnimating = false;
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
}