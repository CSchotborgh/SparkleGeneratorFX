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
        // Get the Kaboom canvas
        const canvas = k.canvas;
        if (!canvas) {
            console.error('Canvas not found');
            return;
        }

        // Create a temporary canvas for capturing the frame with alpha channel
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d', { alpha: true });
        
        if (!tempCtx) {
            console.error('Could not get canvas context');
            return;
        }
        
        // Clear with transparent background
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Clear with transparent background
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // If there's a background image, draw it first
        if (backgroundSprite && backgroundImage) {
            const scale = Math.max(tempCanvas.width / backgroundImage.width, tempCanvas.height / backgroundImage.height);
            const width = backgroundImage.width * scale;
            const height = backgroundImage.height * scale;
            const x = (tempCanvas.width - width) / 2;
            const y = (tempCanvas.height - height) / 2;
            tempCtx.drawImage(backgroundImage, x, y, width, height);
        }
        
        // Draw the current frame from Kaboom canvas
        tempCtx.drawImage(canvas, 0, 0);
        
        // Get the image data with alpha channel
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        // Ensure alpha values are preserved
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] === 0) {
                data[i - 1] = data[i - 2] = data[i - 3] = 0;
            }
        }
        
        // Update canvas with preserved alpha
        tempCtx.putImageData(imageData, 0, 0);
        
        // Convert to PNG with transparency
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
    
    // Show export options
    const exportOptions = document.getElementById('exportOptions');
    if (exportOptions) {
        exportOptions.style.display = 'block';
    } else {
        console.error('Export options container not found');
    }
    
    // Hide export options when starting new recording
    document.getElementById('startRecording').addEventListener('click', () => {
        if (exportOptions) {
            exportOptions.style.display = 'none';
        }
    });
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

// Send frames to server for video export
async function exportToVideo(format) {
    if (recordedFrames.length === 0) {
        alert('No frames recorded. Please record some footage first.');
        return;
    }

    // Show loading message
    const loadingMsg = document.createElement('div');
    loadingMsg.id = 'exportLoadingMsg';
    loadingMsg.style.position = 'fixed';
    loadingMsg.style.top = '50%';
    loadingMsg.style.left = '50%';
    loadingMsg.style.transform = 'translate(-50%, -50%)';
    loadingMsg.style.padding = '20px';
    loadingMsg.style.background = 'rgba(0, 0, 0, 0.8)';
    loadingMsg.style.color = 'white';
    loadingMsg.style.borderRadius = '5px';
    loadingMsg.textContent = 'Exporting video... Please wait.';
    document.body.appendChild(loadingMsg);

    try {
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
        alert('Error exporting video. Please try using the WebM format for best compatibility with transparency.');
    }
    } catch (error) {
        console.error('Export error:', error);
        alert('Failed to export video. Please try again with a shorter recording or different format.');
    } finally {
        // Remove loading message
        const loadingMsg = document.getElementById('exportLoadingMsg');
        if (loadingMsg) {
            loadingMsg.remove();
        }
    }
}
