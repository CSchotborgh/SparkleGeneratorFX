// Preset sharing functionality
async function loadSharedPresets() {
    try {
        const response = await fetch('/api/presets');
        const presets = await response.json();
        const container = document.getElementById('sharedPresets');
        container.innerHTML = '';
        
        presets.forEach(preset => {
            const presetElement = document.createElement('div');
            presetElement.className = 'shared-preset';
            presetElement.innerHTML = `
                <div class="preset-header">
                    <h5>${preset.name}</h5>
                    <span class="likes">${preset.likes} ❤️</span>
                </div>
                <p class="preset-description">${preset.description || ''}</p>
                <div class="preset-actions">
                    <button class="btn btn-sm btn-outline-light" onclick="loadPreset(${preset.id})">Load</button>
                    <button class="btn btn-sm btn-outline-light" onclick="likePreset(${preset.id})">Like</button>
                </div>
            `;
            container.appendChild(presetElement);
        });
    } catch (error) {
        console.error('Error loading shared presets:', error);
    }
}

async function saveCurrentPreset() {
    const name = document.getElementById('presetName').value.trim();
    const description = document.getElementById('presetDescription').value.trim();
    
    if (!name) {
        alert('Please enter a name for your preset');
        return;
    }
    
    const currentConfig = {
        count: config.count,
        size: config.size,
        speed: config.speed,
        color: config.color,
        trailLength: config.trailLength,
        physics: { ...physics }
    };
    
    try {
        const response = await fetch('/api/presets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                description,
                config: currentConfig
            })
        });
        
        if (response.ok) {
            document.getElementById('presetName').value = '';
            document.getElementById('presetDescription').value = '';
            loadSharedPresets();
        } else {
            alert('Failed to save preset');
        }
    } catch (error) {
        console.error('Error saving preset:', error);
        alert('Failed to save preset');
    }
}

async function loadPreset(presetId) {
    try {
        const response = await fetch('/api/presets');
        const presets = await response.json();
        const preset = presets.find(p => p.id === presetId);
        
        if (preset && preset.config) {
            // Update configuration
            Object.assign(config, preset.config);
            
            // Update physics if present
            if (preset.config.physics) {
                Object.assign(physics, preset.config.physics);
            }
            
            // Update UI controls
            updateControlsFromConfig();
            
            // Reset particles with new configuration
            particles = Array(config.count).fill().map(() => new Particle());
        }
    } catch (error) {
        console.error('Error loading preset:', error);
    }
}

async function likePreset(presetId) {
    try {
        await fetch(`/api/presets/${presetId}/like`, { method: 'POST' });
        loadSharedPresets();
    } catch (error) {
        console.error('Error liking preset:', error);
    }
}

// Update controls UI from config
function updateControlsFromConfig() {
    document.getElementById('particleCount').value = config.count;
    document.getElementById('particleSize').value = config.size;
    document.getElementById('particleSpeed').value = config.speed;
    document.getElementById('particleColor').value = config.color;
    document.getElementById('trailLength').value = config.trailLength;
    
    if (physics) {
        document.getElementById('gravity').value = physics.gravity;
        document.getElementById('wind').value = physics.wind;
        document.getElementById('friction').value = physics.friction;
        document.getElementById('bounce').value = physics.bounce;
        document.getElementById('airResistance').value = physics.airResistance;
        document.getElementById('turbulence').value = physics.turbulence;
        document.getElementById('vortexStrength').value = physics.vortexStrength;
        document.getElementById('particleMass').value = physics.particleMass;
        document.getElementById('collisionEnabled').checked = physics.collisionEnabled;
    }
}

// Load shared presets on page load
document.addEventListener('DOMContentLoaded', loadSharedPresets);
