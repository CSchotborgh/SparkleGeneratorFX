// Video recording state
let isRecording = false;
let recordedFrames = [];
let recordingStartTime = null;
const FRAME_RATE = 30;
let recordingInterval = null;

// Start recording
function startRecording() {
    if (isRecording) return;
    isRecording = true;
    recordedFrames = [];
    recordingStartTime = Date.now();
    
    // Update UI
    document.getElementById('startRecording').disabled = true;
    document.getElementById('stopRecording').disabled = false;
    
    // Capture frames at specified frame rate
    recordingInterval = setInterval(() => {
        // Create a temporary canvas to capture the frame
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = k.width();
        tempCanvas.height = k.height();
        const ctx = tempCanvas.getContext('2d', { alpha: true });
        
        if (!ctx) {
            console.error('Could not get temporary canvas context');
            return;
        }

        // Clear the temporary canvas with transparency
        ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Draw the current frame from Kaboom's canvas to our temporary canvas
        ctx.drawImage(k.canvas, 0, 0);
        
        // Get the image data with transparency
        const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Convert the frame directly to PNG with transparency
        const frame = tempCanvas.toDataURL('image/png');
        recordedFrames.push(frame);
        
        // Update frame count display
        document.getElementById('frameCount').textContent = recordedFrames.length;
    }, 1000 / FRAME_RATE);
}

// Stop recording
function stopRecording() {
    if (!isRecording) return;
    isRecording = false;
    clearInterval(recordingInterval);
    
    // Update UI
    document.getElementById('startRecording').disabled = false;
    document.getElementById('stopRecording').disabled = true;
    document.getElementById('recordingExportOptions').style.display = 'block';
}

// Export as PNG sequence
function exportToPNGSequence() {
    recordedFrames.forEach((frame, index) => {
        const link = document.createElement('a');
        link.download = `particle-frame-${String(index).padStart(6, '0')}.png`;
        link.href = frame;
        link.click();
    });
}

// Send frames to server for video export
async function exportToVideo(format) {
    const response = await fetch('/export-video', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            frames: recordedFrames,
            format: format,
            frameRate: FRAME_RATE
        })
    });
    
    if (response.ok) {
        try {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `particle-animation.${format}`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error processing video:', error);
            alert(`Error processing video: ${error.message}`);
        }
    } else {
        const errorText = await response.text();
        console.error('Error exporting video:', errorText);
        alert(`Error exporting video: ${errorText}\nPlease try a different format or reduce the recording duration.`);
    }
}
