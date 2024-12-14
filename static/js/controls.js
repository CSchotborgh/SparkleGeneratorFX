// Control panel event listeners
document.getElementById('particleCount').addEventListener('input', (e) => {
    config.count = parseInt(e.target.value);
    particles = Array(config.count).fill().map(() => new Particle());
});

document.getElementById('particleSize').addEventListener('input', (e) => {
    config.size = parseInt(e.target.value);
});

document.getElementById('particleSpeed').addEventListener('input', (e) => {
    config.speed = parseInt(e.target.value);
});

document.getElementById('gravity').addEventListener('input', (e) => {
    physics.gravity = parseFloat(e.target.value);
});

document.getElementById('wind').addEventListener('input', (e) => {
    physics.wind = parseFloat(e.target.value);
});

document.getElementById('bounce').addEventListener('input', (e) => {
    physics.bounce = parseFloat(e.target.value);
});

document.getElementById('friction').addEventListener('input', (e) => {
    physics.friction = parseFloat(e.target.value);
});

document.getElementById('airResistance').addEventListener('input', (e) => {
    physics.airResistance = parseFloat(e.target.value);
});

document.getElementById('turbulence').addEventListener('input', (e) => {
    physics.turbulence = parseFloat(e.target.value);
});

document.getElementById('vortexStrength').addEventListener('input', (e) => {
    physics.vortexStrength = parseFloat(e.target.value);
    physics.vortexCenter = { x: k.width() / 2, y: k.height() / 2 };
});

document.getElementById('particleMass').addEventListener('input', (e) => {
    physics.particleMass = parseFloat(e.target.value);
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
    config = { ...config, ...preset };
    
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