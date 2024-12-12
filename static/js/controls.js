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
document.getElementById('imageImport').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // Create a sprite from the loaded image
                const canvas = document.createElement('canvas');
                const maxSize = 64; // Smaller max size for better performance
                const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Create a data URL from the scaled image
                const scaledDataURL = canvas.toDataURL('image/png');
                
                // Create and load the sprite
                k.loadSprite("particle", scaledDataURL).then(() => {
                    // Update all particles to use the new sprite and reset them
                    particles.forEach(particle => {
                        particle.sprite = "particle";
                        particle.originalSize = Math.max(canvas.width, canvas.height);
                        particle.reset(); // Reset to apply new sprite settings
                    });
                });
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
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
        
        animationInterval = setInterval(() => {
            // Update particles with next frame data
            const frame = animationFrames[currentFrame];
            particles.forEach((particle, i) => {
                const frameParticle = frame.particles[i];
                particle.x = frameParticle.x;
                particle.y = frameParticle.y;
                particle.size = frameParticle.size;
                config.color = frameParticle.color;
            });

            // Advance to next frame
            currentFrame = (currentFrame + 1) % animationFrames.length;
        }, 1000 / frameRate);
    }
}

function stopAnimation() {
    isAnimating = false;
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
}