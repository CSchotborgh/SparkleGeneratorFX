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

document.getElementById('particleColor').addEventListener('input', (e) => {
    config.color = e.target.value;
});

document.getElementById('presets').addEventListener('change', (e) => {
    const preset = presets[e.target.value];
    config = { ...config, ...preset };
    
    // Update UI controls
    document.getElementById('particleCount').value = config.count;
    document.getElementById('particleSize').value = config.size;
    document.getElementById('particleSpeed').value = config.speed;
    document.getElementById('particleColor').value = config.color;
    
    // Reset particles
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
                const maxSize = 100; // Maximum size for the particle image
                const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Create a data URL from the scaled image
                const scaledDataURL = canvas.toDataURL('image/png');
                
                // Create and load the sprite
                k.loadSprite("particle", scaledDataURL).then(() => {
                    // Update all particles to use the new sprite
                    particles.forEach(particle => {
                        particle.sprite = "particle";
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