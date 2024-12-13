// Export functions for different formats
function exportToJSON() {
    const data = {
        config: config,
        particles: particles.map(p => ({
            x: p.x,
            y: p.y,
            vx: p.vx,
            vy: p.vy,
            life: p.life
        }))
    };
    downloadFile(JSON.stringify(data, null, 2), 'particle-system.json', 'application/json');
}

function exportToXML() {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<particleSystem>\n';
    xml += `  <config>\n`;
    Object.entries(config).forEach(([key, value]) => {
        xml += `    <${key}>${value}</${key}>\n`;
    });
    xml += '  </config>\n';
    xml += '  <particles>\n';
    particles.forEach(p => {
        xml += `    <particle>\n`;
        xml += `      <x>${p.x}</x>\n`;
        xml += `      <y>${p.y}</y>\n`;
        xml += `      <vx>${p.vx}</vx>\n`;
        xml += `      <vy>${p.vy}</vy>\n`;
        xml += `      <life>${p.life}</life>\n`;
        xml += '    </particle>\n';
    });
    xml += '  </particles>\n';
    xml += '</particleSystem>';
    downloadFile(xml, 'particle-system.xml', 'application/xml');
}

function exportToCSV() {
    let csv = 'x,y,vx,vy,life\n';
    particles.forEach(p => {
        csv += `${p.x},${p.y},${p.vx},${p.vy},${p.life}\n`;
    });
    downloadFile(csv, 'particle-system.csv', 'text/csv');
}

function exportToJS() {
    const js = `const particleSystem = {
    config: ${JSON.stringify(config, null, 2)},
    particles: ${JSON.stringify(particles.map(p => ({
        x: p.x,
        y: p.y,
        vx: p.vx,
        vy: p.vy,
        life: p.life
    })), null, 2)}
};`;
    downloadFile(js, 'particle-system.js', 'application/javascript');
}

function exportToCSS() {
    const css = `/* Particle System Styles */
.particle {
    width: ${config.size}px;
    height: ${config.size}px;
    background-color: ${config.color};
    border-radius: 50%;
    position: absolute;
    animation: particle-animation ${config.speed}s infinite;
}

@keyframes particle-animation {
    0% {
        transform: translate(0, 0);
        opacity: 1;
    }
    100% {
        transform: translate(var(--x), var(--y));
        opacity: 0;
    }
}`;
    downloadFile(css, 'particle-system.css', 'text/css');
}

function exportToPNG() {
    // Get the Kaboom canvas
    const canvas = k.canvas;
    if (!canvas) {
        console.error('Canvas not found');
        return;
    }

    // Get the canvas context
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }

    // Get the current frame with transparency
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Create a temporary canvas for transparent background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    // Get context with alpha channel enabled
    const tempCtx = tempCanvas.getContext('2d', { alpha: true });
    if (!tempCtx) {
        console.error('Could not get temporary canvas context');
        return;
    }
    
    // Clear with transparent background
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw the current frame
    tempCtx.putImageData(imageData, 0, 0);
    
    // Convert to PNG with transparency
    const dataURL = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'particle-system.png';
    link.href = dataURL;
    link.click();
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}
