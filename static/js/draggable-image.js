class DraggableImage {
    constructor() {
        this.isDragging = false;
        this.currentX = 0;
        this.currentY = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.xOffset = 0;
        this.yOffset = 0;
        this.imageData = null;
        this.emissionPoints = [];

        this.dragContainer = document.getElementById('dragContainer');
        this.dragImage = document.getElementById('dragImage');

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (!this.dragContainer || !this.dragImage) {
            console.error('Required elements not found');
            return;
        }

        // Mouse events for dragging
        this.dragContainer.addEventListener('mousedown', (e) => this.dragStart(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.dragEnd());

        // Touch events for mobile
        this.dragContainer.addEventListener('touchstart', (e) => this.dragStart(e));
        document.addEventListener('touchmove', (e) => this.drag(e));
        document.addEventListener('touchend', () => this.dragEnd());

        // Image upload
        const imageUpload = document.getElementById('overlayImageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        }
    }

    dragStart(e) {
        if (e.type === "touchstart") {
            this.initialX = e.touches[0].clientX - this.xOffset;
            this.initialY = e.touches[0].clientY - this.yOffset;
        } else {
            this.initialX = e.clientX - this.xOffset;
            this.initialY = e.clientY - this.yOffset;
        }

        if (e.target === this.dragImage) {
            this.isDragging = true;
        }
    }

    drag(e) {
        if (!this.isDragging) return;

        e.preventDefault();

        if (e.type === "touchmove") {
            this.currentX = e.touches[0].clientX - this.initialX;
            this.currentY = e.touches[0].clientY - this.initialY;
        } else {
            this.currentX = e.clientX - this.initialX;
            this.currentY = e.clientY - this.initialY;
        }

        this.xOffset = this.currentX;
        this.yOffset = this.currentY;

        this.setTranslate(this.currentX, this.currentY, this.dragImage);
        this.updateEmissionPoints();
    }

    dragEnd() {
        this.isDragging = false;
    }

    setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    analyzeImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.generateEmissionPoints();
    }

    generateEmissionPoints() {
        const { width, height, data } = this.imageData;
        this.emissionPoints = [];

        // Sample points every 4 pixels
        for (let y = 0; y < height; y += 4) {
            for (let x = 0; x < width; x += 4) {
                const i = (y * width + x) * 4;
                const alpha = data[i + 3];

                // Only consider non-transparent pixels
                if (alpha > 128) {
                    this.emissionPoints.push({
                        x: x,
                        y: y,
                        color: `rgb(${data[i]}, ${data[i + 1]}, ${data[i + 2]})`
                    });
                }
            }
        }
    }

    updateEmissionPoints() {
        if (!this.emissionPoints.length) return;

        // Convert image-space coordinates to world-space
        const rect = this.dragImage.getBoundingClientRect();
        const scale = this.dragImage.width / this.imageData.width;

        window.imageEmissionPoints = this.emissionPoints.map(point => ({
            x: point.x * scale + rect.left,
            y: point.y * scale + rect.top,
            color: point.color
        }));
    }

    async handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (this.dragImage) {
                    const img = new Image();
                    img.onload = () => {
                        this.dragImage.src = event.target.result;
                        this.dragImage.style.display = 'block';
                        this.analyzeImage(img);

                        // Reset position when new image is loaded
                        this.currentX = 0;
                        this.currentY = 0;
                        this.xOffset = 0;
                        this.yOffset = 0;
                        this.setTranslate(0, 0, this.dragImage);
                        this.updateEmissionPoints();
                    };
                    img.src = event.target.result;
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error loading overlay image:', error);
        }
    }
}

// Initialize draggable image system
document.addEventListener('DOMContentLoaded', () => {
    window.draggableImage = new DraggableImage();
});