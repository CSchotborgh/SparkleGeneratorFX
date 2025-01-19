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
                position: 'right',
                onbeforechange: () => openAccordionSection('basicControls')
            },
            {
                element: '#physicsControls',
                title: 'Physics Settings',
                intro: 'Let\'s explore the physics parameters that control particle behavior.',
                position: 'right',
                onbeforechange: () => openAccordionSection('physicsControls')
            },
            {
                element: '#advancedControls',
                title: 'Advanced Options',
                intro: 'Fine-tune particle behavior with advanced settings.',
                position: 'right',
                onbeforechange: () => openAccordionSection('advancedControls')
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
                intro: 'Try pre-configured effects like fire, snow, or geometric patterns.',
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
                element: '#videoRecording',
                title: 'Video Recording',
                intro: 'Record and save your particle animations as videos.',
                position: 'right',
                onbeforechange: () => openAccordionSection('videoRecording')
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