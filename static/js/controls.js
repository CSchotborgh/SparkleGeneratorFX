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
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                // Extract colors from image and apply to particles
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                particles.forEach((particle, i) => {
                    const pixel = i * 4;
                    const color = `rgb(${imageData.data[pixel]}, ${imageData.data[pixel + 1]}, ${imageData.data[pixel + 2]})`;
                    particle.color = color;
                });
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});
