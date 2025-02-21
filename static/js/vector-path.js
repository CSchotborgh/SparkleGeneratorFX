class VectorPath {
    constructor() {
        this.points = [];
        this.isEnabled = false;
        this.currentPosition = 0;
        this.speed = 0.005;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const canvas = document.getElementById('gameCanvas');
        const vectorPathToggle = document.getElementById('vectorPathEnabled');
        const pathSpeedSlider = document.getElementById('pathSpeed');
        const clearPathBtn = document.getElementById('clearPath');
        const controls = document.getElementById('vectorPathControls');

        if (vectorPathToggle) {
            vectorPathToggle.addEventListener('change', (e) => {
                this.isEnabled = e.target.checked;
                if (controls) {
                    controls.style.display = this.isEnabled ? 'block' : 'none';
                }
                if (!this.isEnabled) {
                    this.resetEmitterToDefault();
                }
            });
        }

        if (pathSpeedSlider) {
            pathSpeedSlider.addEventListener('input', (e) => {
                this.speed = parseFloat(e.target.value) * 0.001;
                console.log('Path speed updated:', this.speed);
            });
        }

        if (clearPathBtn) {
            clearPathBtn.addEventListener('click', () => {
                this.points = [];
                this.currentPosition = 0;
                this.resetEmitterToDefault();
                console.log('Path cleared');
            });
        }

        // Mouse click event
        if (canvas) {
            canvas.addEventListener('click', (e) => {
                if (!this.isEnabled) return;

                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                this.points.push({ x, y });
                console.log('Added point:', { x, y }, 'Total points:', this.points.length);
            });

            // Touch event support
            canvas.addEventListener('touchend', (e) => {
                if (!this.isEnabled) return;
                e.preventDefault(); // Prevent default touch behavior

                const rect = canvas.getBoundingClientRect();
                const touch = e.changedTouches[0];
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;

                this.points.push({ x, y });
                console.log('Added touch point:', { x, y }, 'Total points:', this.points.length);
            }, { passive: false });
        }
    }

    resetEmitterToDefault() {
        const canvas = document.getElementById('gameCanvas');
        if (window.particleSystem && canvas) {
            window.particleSystem.emitterX = canvas.width / 2;
            window.particleSystem.emitterY = canvas.height / 2;
        }
    }

    updateEmitterPosition() {
        if (!this.isEnabled || this.points.length < 2) return;

        const currentPoint = Math.floor(this.currentPosition);
        const nextPoint = (currentPoint + 1) % this.points.length;

        const current = this.points[currentPoint];
        const next = this.points[nextPoint];

        const t = this.currentPosition - Math.floor(this.currentPosition);

        if (window.particleSystem) {
            // Linear interpolation between points
            window.particleSystem.emitterX = current.x + (next.x - current.x) * t;
            window.particleSystem.emitterY = current.y + (next.y - current.y) * t;
        }

        this.currentPosition = (this.currentPosition + this.speed) % this.points.length;
    }

    drawPath(k) {
        if (!this.isEnabled || this.points.length < 2) return;

        // Draw intermediate path segments
        for (let i = 1; i < this.points.length; i++) {
            k.drawLine({
                p1: this.points[i - 1],
                p2: this.points[i],
                width: 2,
                color: k.rgb(255, 255, 255, 0.5)
            });
        }

        // Draw points/nodes
        this.points.forEach(point => {
            k.drawCircle({
                pos: point,
                radius: 5,
                color: k.rgb(46, 204, 113, 0.8)
            });
        });
    }
}

// Initialize vector path system
window.vectorPath = new VectorPath();