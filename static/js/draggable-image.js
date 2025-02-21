class DraggableImage {
    constructor() {
        this.isDragging = false;
        this.isResizing = false;
        this.currentX = 0;
        this.currentY = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.xOffset = 0;
        this.yOffset = 0;
        this.sprite = null;
        this.currentHandle = null;
        this.initialWidth = 0;
        this.initialHeight = 0;

        this.dragContainer = document.getElementById('dragContainer');
        this.dragImage = document.getElementById('dragImage');

        this.setupEventListeners();
        this.addResizeHandles();
    }

    addResizeHandles() {
        const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
        handles.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${position}`;
            handle.setAttribute('data-handle', position);
            this.dragContainer.appendChild(handle);
        });
    }

    setupEventListeners() {
        if (!this.dragContainer || !this.dragImage) {
            console.error('Required elements not found');
            return;
        }

        // Mouse events for dragging and resizing
        this.dragContainer.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());

        // Touch events for mobile
        this.dragContainer.addEventListener('touchstart', (e) => this.handleMouseDown(e));
        document.addEventListener('touchmove', (e) => this.handleMouseMove(e));
        document.addEventListener('touchend', () => this.handleMouseUp());

        // Image upload
        const imageUpload = document.getElementById('overlayImageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        }
    }

    handleMouseDown(e) {
        if (e.target.classList.contains('resize-handle')) {
            this.startResize(e);
        } else if (e.target === this.dragImage) {
            this.startDrag(e);
        }
    }

    startDrag(e) {
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

        const rect = this.dragImage.getBoundingClientRect();
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

        this.setTranslate(this.currentX, this.currentY, this.dragImage);
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

        this.dragImage.style.width = `${newWidth}px`;
        this.dragImage.style.height = `${newHeight}px`;
        this.setTranslate(this.currentX, this.currentY, this.dragImage);
        this.updateSpritePosition();
        this.updateHandlePositions();
    }

    updateHandlePositions() {
        const rect = this.dragImage.getBoundingClientRect();
        const handles = document.querySelectorAll('.resize-handle');

        handles.forEach(handle => {
            const position = handle.getAttribute('data-handle');
            let top, left;

            switch (position) {
                case 'n':
                    top = rect.top - 5;
                    left = rect.left + rect.width / 2 - 5;
                    break;
                case 's':
                    top = rect.bottom - 5;
                    left = rect.left + rect.width / 2 - 5;
                    break;
                case 'e':
                    top = rect.top + rect.height / 2 - 5;
                    left = rect.right - 5;
                    break;
                case 'w':
                    top = rect.top + rect.height / 2 - 5;
                    left = rect.left - 5;
                    break;
                case 'nw':
                    top = rect.top - 5;
                    left = rect.left - 5;
                    break;
                case 'ne':
                    top = rect.top - 5;
                    left = rect.right - 5;
                    break;
                case 'se':
                    top = rect.bottom - 5;
                    left = rect.right - 5;
                    break;
                case 'sw':
                    top = rect.bottom - 5;
                    left = rect.left - 5;
                    break;
            }

            handle.style.top = `${top}px`;
            handle.style.left = `${left}px`;
        });
    }

    setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    updateSpritePosition() {
        if (this.dragImage) {
            const rect = this.dragImage.getBoundingClientRect();
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;

            window.spriteEmitter = {
                x: rect.left + scrollX + rect.width / 2,
                y: rect.top + scrollY + rect.height / 2,
                width: rect.width,
                height: rect.height
            };
        }
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

                    // Reset position and size when new image is loaded
                    this.currentX = 0;
                    this.currentY = 0;
                    this.xOffset = 0;
                    this.yOffset = 0;
                    this.dragImage.style.width = '200px';  // Set initial size
                    this.dragImage.style.height = 'auto';
                    this.setTranslate(0, 0, this.dragImage);
                    this.updateSpritePosition();
                    this.updateHandlePositions();
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