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
                const canvas = document.createElement('canvas');
                const maxSize = 300; // Limit image size for performance
                const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Extract colors and positions from image
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = [];
                
                // Sample pixels for colors, positions, and calculate size based on brightness
                for (let y = 0; y < canvas.height; y += 2) {
                    for (let x = 0; x < canvas.width; x += 2) {
                        const i = (y * canvas.width + x) * 4;
                        const alpha = imageData.data[i + 3];
                        if (alpha > 128) { // Only use visible pixels
                            // Calculate brightness (0-1) from RGB values
                            const brightness = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / (255 * 3);
                            pixels.push({
                                x: x / canvas.width,
                                y: y / canvas.height,
                                size: 1 + brightness * 2, // Scale size based on brightness
                                color: `#${imageData.data[i].toString(16).padStart(2, '0')}${imageData.data[i + 1].toString(16).padStart(2, '0')}${imageData.data[i + 2].toString(16).padStart(2, '0')}`
                            });
                        }
                    }
                }
                
                // Update particle system
                config.count = Math.min(200, pixels.length);
                particles = Array(config.count).fill().map((_, i) => {
                    const pixel = pixels[i % pixels.length];
                    const particle = new Particle();
                    particle.x = pixel.x * k.width();
                    particle.y = pixel.y * k.height();
                    particle.size = config.size * pixel.size; // Apply size scaling
                    config.color = pixel.color;
                    return particle;
                });
                
                // Update UI
                document.getElementById('particleCount').value = config.count;
                document.getElementById('particleColor').value = pixels[0].color;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});
