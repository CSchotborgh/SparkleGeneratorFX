// Helper function to open accordion section
function openAccordionSection(sectionId) {
    return new Promise(resolve => {
        const accordionButton = document.querySelector(`button[data-bs-target="#${sectionId}"]`);
        const accordionSection = document.querySelector(`#${sectionId}`);

        if (accordionButton && !accordionSection.classList.contains('show')) {
            accordionButton.click();
            setTimeout(() => {
                accordionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(resolve, 600);
            }, 400);
        } else {
            resolve();
        }
    });
}

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
                intro: 'Adjust fundamental particle properties like count, size, and speed.',
                position: 'right'
            },
            {
                element: '#physicsControls',
                title: 'Physics Settings Overview',
                intro: 'Let\'s explore the physics parameters that control particle behavior.',
                position: 'right',
                onbeforechange: () => openAccordionSection('physicsControls')
            },
            {
                element: '#gravity',
                title: 'Gravity Control',
                intro: 'Adjust the gravitational force affecting particles. Higher values make particles fall faster.',
                position: 'right'
            },
            {
                element: '#wind',
                title: 'Wind Control',
                intro: 'Control horizontal force affecting particles. Positive values push right, negative values push left.',
                position: 'right'
            },
            {
                element: '#bounce',
                title: 'Bounce Control',
                intro: 'Set how much particles bounce off surfaces. Higher values create more energetic bounces.',
                position: 'right'
            },
            {
                element: '#friction',
                title: 'Friction Control',
                intro: 'Adjust how quickly particles slow down. Lower values create more drag.',
                position: 'right'
            },
            {
                element: '#airResistance',
                title: 'Air Resistance',
                intro: 'Control how much air affects particle movement. Higher values create more air resistance.',
                position: 'right'
            },
            {
                element: '#turbulence',
                title: 'Turbulence Control',
                intro: 'Add random movement to particles. Higher values create more chaotic motion.',
                position: 'right'
            },
            {
                element: '#vortexStrength',
                title: 'Vortex Strength',
                intro: 'Create spinning effects. Positive values spin clockwise, negative values spin counter-clockwise.',
                position: 'right'
            },
            {
                element: '#particleMass',
                title: 'Particle Mass',
                intro: 'Adjust how heavy particles are. Heavier particles are less affected by forces.',
                position: 'right'
            },
            {
                element: '#particleLife',
                title: 'Particle Life',
                intro: 'Control how long particles exist before respawning.',
                position: 'right'
            },
            {
                element: '#particleAcceleration',
                title: 'Acceleration',
                intro: 'Adjust how quickly particles respond to forces.',
                position: 'right'
            },
            {
                element: '#collisionEnabled',
                title: 'Collision Toggle',
                intro: 'Enable or disable particle collisions with each other.',
                position: 'right'
            },
            {
                element: '#visualEffects',
                title: 'Visual Effects',
                intro: 'Customize particle appearance with colors and trail effects.',
                position: 'right',
                onbeforechange: () => openAccordionSection('visualEffects')
            },
            {
                element: '#presetControls',
                title: 'Preset Effects',
                intro: 'Try pre-configured effects like fire, snow, or galaxy patterns.',
                position: 'right',
                onbeforechange: () => openAccordionSection('presetControls')
            },
            {
                element: '#exportOptions',
                title: 'Export Options',
                intro: 'Save your creation in various formats including PNG and video.',
                position: 'right',
                onbeforechange: () => openAccordionSection('exportOptions')
            },
            {
                element: '#importOptions',
                title: 'Import Options',
                intro: 'Use custom images for particles or add background images.',
                position: 'right',
                onbeforechange: () => openAccordionSection('importOptions')
            },
            {
                element: '#sharePreset',
                title: 'Share Your Creations',
                intro: 'Save and share your particle configurations with others.',
                position: 'right',
                onbeforechange: () => openAccordionSection('sharePreset')
            },
            {
                title: 'Start Creating!',
                intro: 'You\'re ready to create amazing particle effects! Click and drag on the canvas to begin.'
            }
        ],
        showProgress: true,
        showBullets: true,
        exitOnOverlayClick: false,
        overlayOpacity: 0.8,
        scrollToElement: true,
        scrollPadding: 50
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