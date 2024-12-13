// Video recording state
let isRecording = false;
let recordedFrames = [];
let recordingStartTime = null;
const FRAME_RATE = 30;
let recordingInterval = null;

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startRecordingBtn');
    const stopButton = document.getElementById('stopRecordingBtn');
    const exportControls = document.getElementById('exportControls');

    if (startButton && stopButton) {
        startButton.addEventListener('click', startRecording);
        stopButton.addEventListener('click', stopRecording);
    } else {
        console.error('Recording buttons not found in the DOM');
    }
});

// Start recording
function startRecording() {
    if (isRecording) {
        console.error('Already recording');
        return;
    }
    
    // Wait for Kaboom canvas to be ready
    if (!k || !k.canvas) {
        console.error('Kaboom canvas not ready');
        return;
    }
    
    isRecording = true;
    recordedFrames = [];
    recordingStartTime = Date.now();
    
    // Reset frame counter
    const frameCount = document.getElementById('frameCount');
    if (frameCount) {
        frameCount.textContent = '0';
    }
    
    // Update UI
    const startButton = document.getElementById('startRecordingBtn');
    const stopButton = document.getElementById('stopRecordingBtn');
    const exportControls = document.getElementById('exportControls');
    
    if (startButton) startButton.disabled = true;
    if (stopButton) stopButton.disabled = false;
    if (exportControls) exportControls.style.display = 'none';
    
    // Start capturing frames
    recordingInterval = setInterval(captureFrame, 1000 / FRAME_RATE);
}

// Stop recording
function stopRecording() {
    if (!isRecording) return;
    
    isRecording = false;
    if (recordingInterval) {
        clearInterval(recordingInterval);
        recordingInterval = null;
    }
    
    // Update UI
    const startButton = document.getElementById('startRecordingBtn');
    const stopButton = document.getElementById('stopRecordingBtn');
    const exportControls = document.getElementById('exportControls');
    
    if (startButton) startButton.disabled = false;
    if (stopButton) stopButton.disabled = true;
    if (exportControls) exportControls.style.display = 'block';
}

// Capture a single frame
function captureFrame() {
    if (!isRecording || !k || !k.canvas) {
        console.error('Cannot capture frame: recording stopped or canvas not ready');
        stopRecording();
        return;
    }

    try {
        // Create a temporary canvas with alpha channel support
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = k.canvas.width;
        tempCanvas.height = k.canvas.height;
        const tempCtx = tempCanvas.getContext('2d', { alpha: true });

        if (!tempCtx) {
            throw new Error('Could not get temporary canvas context');
        }

        // Clear with transparent background
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw the current frame from Kaboom canvas
        tempCtx.drawImage(k.canvas, 0, 0);

        // Convert to PNG with transparency
        const frame = tempCanvas.toDataURL('image/png');
        recordedFrames.push(frame);

        // Update frame counters
        const frameCount = document.getElementById('frameCount');
        const recordedFrameCount = document.getElementById('recordedFrameCount');
        if (frameCount) {
            frameCount.textContent = FRAME_RATE.toString();
        }
        if (recordedFrameCount) {
            recordedFrameCount.textContent = recordedFrames.length.toString();
        }
    } catch (error) {
        console.error('Error capturing frame:', error);
        stopRecording();
    }
}

// Export as PNG sequence
function exportToPNGSequence() {
    if (recordedFrames.length === 0) {
        alert('No frames recorded. Please record some footage first.');
        return;
    }
    
    recordedFrames.forEach((frame, index) => {
        const link = document.createElement('a');
        link.download = `particle-frame-${String(index).padStart(6, '0')}.png`;
        link.href = frame;
        link.click();
    });
}