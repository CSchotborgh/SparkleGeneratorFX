class DraggableImage {
    constructor() {
        this.isDragging = false;
        this.currentX = 0;
        this.currentY = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.xOffset = 0;
        this.yOffset = 0;

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
    }

    dragEnd() {
        this.isDragging = false;
    }

    setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    async handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (this.dragImage) {
                    this.dragImage.src = event.target.result;
                    this.dragImage.style.display = 'block';

                    // Reset position when new image is loaded
                    this.currentX = 0;
                    this.currentY = 0;
                    this.xOffset = 0;
                    this.yOffset = 0;
                    this.setTranslate(0, 0, this.dragImage);
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