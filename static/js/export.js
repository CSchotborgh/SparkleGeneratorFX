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
    const canvas = document.getElementById('gameCanvas');
    const dataURL = canvas.toDataURL('image/png');
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
