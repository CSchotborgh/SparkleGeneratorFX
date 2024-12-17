// Initialize preview canvas and context
let previewCanvas;
let previewCtx;
let previewParticles = [];
let previewAnimationId = null;
let tempImageData = null;

// Preview particle class
class PreviewParticle {
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.image = image;
        this.speed = 2;
        this.angle = Math.random() * Math.PI * 2;
        this.size = 20;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.rotation += this.rotationSpeed;

        // Bounce off walls
        if (this.x < 0 || this.x > previewCanvas.width) {
            this.angle = Math.PI - this.angle;
        }
        if (this.y < 0 || this.y > previewCanvas.height) {
            this.angle = -this.angle;
        }
    }

    draw() {
        previewCtx.save();
        previewCtx.translate(this.x, this.y);
        previewCtx.rotate(this.rotation);
        previewCtx.drawImage(
            this.image,
            -this.size / 2,
            -this.size / 2,
            this.size,
            this.size
        );
        previewCtx.restore();
    }
}

// Initialize preview when modal is shown
document.getElementById('particlePreviewModal').addEventListener('show.bs.modal', () => {
    previewCanvas = document.getElementById('previewCanvas');
    previewCtx = previewCanvas.getContext('2d');
    
    if (tempImageData) {
        startPreviewAnimation();
    }
});

// Clean up when modal is hidden
document.getElementById('particlePreviewModal').addEventListener('hide.bs.modal', () => {
    stopPreviewAnimation();
    if (!document.getElementById('confirmParticleUpload').dataset.confirmed) {
        tempImageData = null;
    }
});

// Preview animation functions
function startPreviewAnimation() {
    if (!tempImageData) return;

    const img = new Image();
    img.onload = () => {
        const particleCount = document.getElementById('previewParticleCount').value;
        previewParticles = [];

        // Create preview particles
        for (let i = 0; i < particleCount; i++) {
            previewParticles.push(new PreviewParticle(
                Math.random() * previewCanvas.width,
                Math.random() * previewCanvas.height,
                img
            ));
        }

        // Start animation loop
        animatePreview();
    };
    img.src = tempImageData;
}

function animatePreview() {
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    
    previewParticles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    previewAnimationId = requestAnimationFrame(animatePreview);
}

function stopPreviewAnimation() {
    if (previewAnimationId) {
        cancelAnimationFrame(previewAnimationId);
        previewAnimationId = null;
    }
}

// Update particle count during preview
document.getElementById('previewParticleCount').addEventListener('input', () => {
    stopPreviewAnimation();
    startPreviewAnimation();
});

// Handle particle image upload
document.getElementById('particleImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'image/png') {
        const reader = new FileReader();
        reader.onload = (event) => {
            tempImageData = event.target.result;
            const previewModal = new bootstrap.Modal(document.getElementById('particlePreviewModal'));
            previewModal.show();
        };
        reader.readAsDataURL(file);
    }
});

// Handle confirmation of particle upload
document.getElementById('confirmParticleUpload').addEventListener('click', function() {
    this.dataset.confirmed = 'true';
    if (tempImageData) {
        const img = new Image();
        img.onload = () => {
            try {
                k.loadSprite('particle', tempImageData).then(() => {
                    console.log('Particle sprite loaded successfully');
                    particleSprite = k.sprite('particle');
                    particles.forEach(particle => {
                        particle.hasCustomImage = true;
                    });
                });
            } catch (error) {
                console.error('Error loading particle sprite:', error);
            }
        };
        img.src = tempImageData;
    }
    bootstrap.Modal.getInstance(document.getElementById('particlePreviewModal')).hide();
});
