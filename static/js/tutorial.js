// Initialize tutorial
function startTutorial() {
    const intro = introJs();
    
    intro.setOptions({
        steps: [
            {
                title: 'Welcome to SparkleGeneratorFX!',
                intro: 'Let\'s take a quick tour of this interactive particle physics engine.'
            },
            {
                element: '#gameCanvas',
                title: 'Particle Canvas',
                intro: 'This is your creative space! Click and drag to move particles, right-click for burst effects.'
            },
            {
                element: '#basicControls',
                title: 'Basic Controls',
                intro: 'Adjust fundamental particle properties like count, size, and speed.'
            },
            {
                element: '#physicsControls',
                title: 'Physics Settings',
                intro: 'Fine-tune physics parameters including gravity, wind, and particle behavior.',
                position: 'right',
                onbeforechange: function() {
                    return new Promise(resolve => {
                        // Open the physics controls accordion
                        const physicsButton = document.querySelector('button[data-bs-target="#physicsControls"]');
                        const physicsCollapse = document.querySelector('#physicsControls');
                        
                        if (!physicsCollapse.classList.contains('show')) {
                            physicsButton.click();
                            // Wait for the accordion animation to complete
                            setTimeout(() => {
                                // Ensure the element is in view
                                physicsCollapse.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                // Additional delay to ensure everything is ready
                                setTimeout(resolve, 600);
                            }, 400);
                        } else {
                            resolve();
                        }
                    });
                }
            },
            {
                element: '#visualEffects',
                title: 'Visual Effects',
                intro: 'Customize particle appearance with colors and trail effects.'
            },
            {
                element: '#presetControls',
                title: 'Preset Effects',
                intro: 'Try pre-configured effects like fire, snow, or galaxy patterns.'
            },
            {
                element: '#exportOptions',
                title: 'Export Options',
                intro: 'Save your creation in various formats including PNG and video.'
            },
            {
                element: '#importOptions',
                title: 'Import Options',
                intro: 'Use custom images for particles or add background images.'
            },
            {
                element: '#sharePreset',
                title: 'Share Your Creations',
                intro: 'Save and share your particle configurations with others.'
            },
            {
                title: 'Start Creating!',
                intro: 'You\'re ready to create amazing particle effects! Click and drag on the canvas to begin.'
            }
        ],
        showProgress: true,
        showBullets: true,
        exitOnOverlayClick: false,
        overlayOpacity: 0.8
    });

    intro.start();
}

// Add data-intro attributes to elements
document.addEventListener('DOMContentLoaded', () => {
    // Add tooltips for interactive elements
    const gameCanvas = document.getElementById('gameCanvas');
    gameCanvas.setAttribute('data-hint', 'Click and drag to move particles. Right-click for burst effects.');
    gameCanvas.setAttribute('data-hintposition', 'middle-middle');
});
