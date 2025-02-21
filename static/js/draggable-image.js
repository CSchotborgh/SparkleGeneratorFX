class ImageManager {
    constructor() {
        this.images = new Map(); // Store DraggableImage instances
        this.dragContainer = document.getElementById('dragContainer');
        this.currentId = 0;
        this.setupImageUpload();
    }

    setupImageUpload() {
        const imageUpload = document.getElementById('overlayImageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        }
    }

    async handleImageUpload(e) {
        const files = e.target.files;
        if (!files.length) return;

        for (const file of files) {
            try {
                const imageId = `image_${this.currentId++}`;
                const draggableImage = new DraggableImage(imageId, this.dragContainer);
                await draggableImage.loadImage(file);
                this.images.set(imageId, draggableImage);
            } catch (error) {
                console.error('Error loading overlay image:', error);
            }
        }
    }

    removeImage(imageId) {
        const image = this.images.get(imageId);
        if (image) {
            image.destroy();
            this.images.delete(imageId);
        }
    }
}

class DraggableImage {
    constructor(id, container) {
        this.id = id;
        this.isDragging = false;
        this.isResizing = false;
        this.currentX = 0;
        this.currentY = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.xOffset = 0;
        this.yOffset = 0;
        this.currentHandle = null;
        this.initialWidth = 0;
        this.initialHeight = 0;

        // Create container structure
        this.imageContainer = document.createElement('div');
        this.imageContainer.className = 'image-container';
        this.imageContainer.id = `container_${id}`;
        container.appendChild(this.imageContainer);

        // Create close button
        this.closeButton = document.createElement('button');
        this.closeButton.className = 'close-button';
        this.closeButton.innerHTML = '×';
        this.closeButton.onclick = () => {
            window.imageManager.removeImage(this.id);
        };
        this.imageContainer.appendChild(this.closeButton);

        // Create image element
        this.dragImage = document.createElement('img');
        this.dragImage.className = 'drag-image';
        this.dragImage.id = `image_${id}`;
        this.imageContainer.appendChild(this.dragImage);

        this.setupEventListeners();
        this.addResizeHandles();
    }

    addResizeHandles() {
        const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
        handles.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${position}`;
            handle.setAttribute('data-handle', position);
            this.imageContainer.appendChild(handle);
        });
    }

    setupEventListeners() {
        this.imageContainer.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());

        this.imageContainer.addEventListener('touchstart', (e) => this.handleMouseDown(e));
        document.addEventListener('touchmove', (e) => this.handleMouseMove(e));
        document.addEventListener('touchend', () => this.handleMouseUp());
    }

    handleMouseDown(e) {
        if (e.target === this.closeButton) return;

        if (e.target.classList.contains('resize-handle')) {
            this.startResize(e);
        } else if (e.target === this.dragImage) {
            this.startDrag(e);
        }
    }

    startDrag(e) {
        e.preventDefault();
        if (e.type === "touchstart") {
            this.initialX = e.touches[0].clientX - this.xOffset;
            this.initialY = e.touches[0].clientY - this.yOffset;
        } else {
            this.initialX = e.clientX - this.xOffset;
            this.initialY = e.clientY - this.yOffset;
        }
        this.isDragging = true;
    }

    startResize(e) {
        e.preventDefault();
        this.isResizing = true;
        this.currentHandle = e.target.getAttribute('data-handle');

        const rect = this.imageContainer.getBoundingClientRect();
        this.initialWidth = rect.width;
        this.initialHeight = rect.height;

        if (e.type === "touchstart") {
            this.initialX = e.touches[0].clientX;
            this.initialY = e.touches[0].clientY;
        } else {
            this.initialX = e.clientX;
            this.initialY = e.clientY;
        }
    }

    handleMouseMove(e) {
        if (this.isResizing) {
            this.resize(e);
        } else if (this.isDragging) {
            this.drag(e);
        }
    }

    handleMouseUp() {
        this.isDragging = false;
        this.isResizing = false;
        this.currentHandle = null;
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

        this.setTranslate(this.currentX, this.currentY, this.imageContainer);
        this.updateSpritePosition();
    }

    resize(e) {
        if (!this.isResizing) return;

        e.preventDefault();

        const currentX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
        const currentY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

        const deltaX = currentX - this.initialX;
        const deltaY = currentY - this.initialY;

        let newWidth = this.initialWidth;
        let newHeight = this.initialHeight;

        switch (this.currentHandle) {
            case 'e':
                newWidth = this.initialWidth + deltaX;
                break;
            case 'w':
                newWidth = this.initialWidth - deltaX;
                this.currentX = this.xOffset + deltaX;
                break;
            case 's':
                newHeight = this.initialHeight + deltaY;
                break;
            case 'n':
                newHeight = this.initialHeight - deltaY;
                this.currentY = this.yOffset + deltaY;
                break;
            case 'se':
                newWidth = this.initialWidth + deltaX;
                newHeight = this.initialHeight + deltaY;
                break;
            case 'sw':
                newWidth = this.initialWidth - deltaX;
                newHeight = this.initialHeight + deltaY;
                this.currentX = this.xOffset + deltaX;
                break;
            case 'ne':
                newWidth = this.initialWidth + deltaX;
                newHeight = this.initialHeight - deltaY;
                this.currentY = this.yOffset + deltaY;
                break;
            case 'nw':
                newWidth = this.initialWidth - deltaX;
                newHeight = this.initialHeight - deltaY;
                this.currentX = this.xOffset + deltaX;
                this.currentY = this.yOffset + deltaY;
                break;
        }

        // Apply minimum size constraints
        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(50, newHeight);

        this.imageContainer.style.width = `${newWidth}px`;
        this.imageContainer.style.height = `${newHeight}px`;
        this.dragImage.style.width = '100%';
        this.dragImage.style.height = '100%';

        this.setTranslate(this.currentX, this.currentY, this.imageContainer);
        this.updateSpritePosition();
    }

    setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    updateSpritePosition() {
        if (this.dragImage) {
            const rect = this.imageContainer.getBoundingClientRect();
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;

            window.spriteEmitter = {
                id: this.id,
                x: rect.left + scrollX + rect.width / 2,
                y: rect.top + scrollY + rect.height / 2,
                width: rect.width,
                height: rect.height
            };
        }
    }

    async loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (this.dragImage) {
                    this.dragImage.src = event.target.result;
                    this.dragImage.style.display = 'block';
                    this.imageContainer.style.display = 'inline-block';

                    // Reset position and size
                    this.currentX = 0;
                    this.currentY = 0;
                    this.xOffset = 0;
                    this.yOffset = 0;

                    // Set initial size
                    this.imageContainer.style.width = '200px';
                    this.imageContainer.style.height = 'auto';
                    this.dragImage.style.width = '100%';
                    this.dragImage.style.height = '100%';

                    this.setTranslate(0, 0, this.imageContainer);
                    this.updateSpritePosition();
                    resolve();
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    destroy() {
        // Remove event listeners
        this.imageContainer.removeEventListener('mousedown', this.handleMouseDown);
        this.imageContainer.removeEventListener('touchstart', this.handleMouseDown);

        // Remove the container and its contents
        this.imageContainer.remove();
    }
}

// Initialize image manager
document.addEventListener('DOMContentLoaded', () => {
    window.imageManager = new ImageManager();
});