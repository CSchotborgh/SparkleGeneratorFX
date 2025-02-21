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

        vectorPathToggle.addEventListener('change', (e) => {
            this.isEnabled = e.target.checked;
            controls.style.display = this.isEnabled ? 'block' : 'none';
            if (!this.isEnabled) {
                this.resetEmitterToDefault();
            }
        });

        pathSpeedSlider.addEventListener('input', (e) => {
            this.speed = e.target.value * 0.001;
        });

        clearPathBtn.addEventListener('click', () => {
            this.points = [];
            this.currentPosition = 0;
        });

        // Mouse click event
        canvas.addEventListener('click', (e) => {
            if (!this.isEnabled) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.points.push({ x, y });
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
        }, { passive: false });
    }

    resetEmitterToDefault() {
        const canvas = document.getElementById('gameCanvas');
        if (window.particleSystem) {
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

    drawPath(ctx) {
        if (!this.isEnabled || this.points.length < 2) return;

        ctx.save();

        // Draw the path
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }

        // Close the path if we have more than 2 points
        if (this.points.length > 2) {
            ctx.lineTo(this.points[0].x, this.points[0].y);
        }

        ctx.stroke();

        // Draw points/nodes
        this.points.forEach(point => {
            ctx.beginPath();
            ctx.fillStyle = 'rgba(46, 204, 113, 0.8)';
            ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }
}

// Initialize vector path system
window.vectorPath = new VectorPath();