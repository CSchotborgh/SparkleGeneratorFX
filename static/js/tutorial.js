// Tutorial pointer element
let tutorialPointer = null;

// Create and animate tutorial pointer
function createTutorialPointer() {
    if (tutorialPointer) {
        tutorialPointer.remove();
    }
    tutorialPointer = document.createElement('div');
    tutorialPointer.className = 'tutorial-pointer';
    document.body.appendChild(tutorialPointer);
}

// Animate pointer to target element
function animatePointerToElement(element) {
    if (!element || !tutorialPointer) return;
    
    const rect = element.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;
    
    tutorialPointer.style.left = `${targetX}px`;
    tutorialPointer.style.top = `${targetY}px`;
}

// Initialize tutorial
function startTutorial() {
    createTutorialPointer();
    const intro = introJs();
    
    // Remove previous highlight classes
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
    });
    
    intro.setOptions({
        steps: [
            {
                title: 'Welcome to SparkleGeneratorFX!',
                intro: 'Let\'s take a quick tour of this interactive particle physics engine. Explore amazing features and create stunning visual effects!'
            },
            {
                element: '#toggleMetricsButton',
                title: 'Performance Metrics',
                intro: 'Toggle performance metrics panels to monitor FPS, particle count, and system resources.',
                position: 'bottom'
            },
            {
                element: '#gameCanvas',
                title: 'Interactive Canvas',
                intro: 'Your creative space! Click and drag to move particles, right-click for burst effects. Watch particles interact with physics in real-time!'
            },
            {
                element: '#basicControls',
                title: 'Basic Controls',
                intro: 'Adjust fundamental particle properties like count, size, and speed. These controls form the foundation of your effects.',
                position: 'right'
            },
            {
                element: '#physicsControls',
                title: 'Advanced Physics',
                intro: 'Fine-tune the physics simulation with comprehensive controls.',
                position: 'right',
                onbeforechange: function() {
                    return new Promise(resolve => {
                        const physicsButton = document.querySelector('button[data-bs-target="#physicsControls"]');
                        const physicsCollapse = document.querySelector('#physicsControls');
                        
                        if (!physicsCollapse.classList.contains('show')) {
                            physicsButton.click();
                            setTimeout(() => {
                                physicsCollapse.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                setTimeout(resolve, 600);
                            }, 400);
                        } else {
                            resolve();
                        }
                    });
                }
            },
            {
                element: '#particleLife',
                title: 'Particle Lifespan',
                intro: 'Control how long particles exist before respawning. Create ephemeral or lasting effects.',
                position: 'right'
            },
            {
                element: '#particleAcceleration',
                title: 'Particle Acceleration',
                intro: 'Adjust how quickly particles respond to forces. Higher values create more dynamic movement.',
                position: 'right'
            },
            {
                element: '#visualEffects',
                title: 'Visual Effects',
                intro: 'Customize appearance with colors and advanced trail effects. Create stunning visual patterns!',
                position: 'right',
                onbeforechange: function() {
                    return new Promise(resolve => {
                        const visualButton = document.querySelector('button[data-bs-target="#visualEffects"]');
                        const visualCollapse = document.querySelector('#visualEffects');
                        
                        if (!visualCollapse.classList.contains('show')) {
                            visualButton.click();
                            setTimeout(() => {
                                visualCollapse.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                setTimeout(resolve, 600);
                            }, 400);
                        } else {
                            resolve();
                        }
                    });
                }
            },
            {
                element: '#reverseTrail',
                title: 'Trail Direction',
                intro: 'Toggle trail direction for unique visual effects. Experiment with different patterns!',
                position: 'right'
            },
            {
                element: '#backgroundControls',
                title: 'Background Settings',
                intro: 'Customize your canvas background with colors or images. Match your particle effects perfectly!',
                position: 'right',
                onbeforechange: function() {
                    return new Promise(resolve => {
                        const bgButton = document.querySelector('button[data-bs-target="#backgroundControls"]');
                        const bgCollapse = document.querySelector('#backgroundControls');
                        
                        if (!bgCollapse.classList.contains('show')) {
                            bgButton.click();
                            setTimeout(() => {
                                bgCollapse.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                setTimeout(resolve, 600);
                            }, 400);
                        } else {
                            resolve();
                        }
                    });
                }
            },
            {
                element: '#videoRecording',
                title: 'Video Recording',
                intro: 'Record your particle animations and export them as video files or PNG sequences!',
                position: 'right',
                onbeforechange: function() {
                    return new Promise(resolve => {
                        const videoButton = document.querySelector('button[data-bs-target="#videoRecording"]');
                        const videoCollapse = document.querySelector('#videoRecording');
                        
                        if (!videoCollapse.classList.contains('show')) {
                            videoButton.click();
                            setTimeout(() => {
                                videoCollapse.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                setTimeout(resolve, 600);
                            }, 400);
                        } else {
                            resolve();
                        }
                    });
                }
            },
            {
                element: '#presetControls',
                title: 'Preset Effects',
                intro: 'Try pre-configured effects like fire, snow, or galaxy patterns. Perfect starting points for your creations!',
                position: 'right',
                onbeforechange: function() {
                    return new Promise(resolve => {
                        const presetButton = document.querySelector('button[data-bs-target="#presetControls"]');
                        const presetCollapse = document.querySelector('#presetControls');
                        
                        if (!presetCollapse.classList.contains('show')) {
                            presetButton.click();
                            setTimeout(() => {
                                presetCollapse.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                setTimeout(resolve, 600);
                            }, 400);
                        } else {
                            resolve();
                        }
                    });
                }
            },
            {
                element: '#sharePreset',
                title: 'Share Your Creations',
                intro: 'Save and share your particle configurations with the community. Browse and try others\' creations!',
                position: 'right',
                onbeforechange: function() {
                    return new Promise(resolve => {
                        const shareButton = document.querySelector('button[data-bs-target="#sharePreset"]');
                        const shareCollapse = document.querySelector('#sharePreset');
                        
                        if (!shareCollapse.classList.contains('show')) {
                            shareButton.click();
                            setTimeout(() => {
                                shareCollapse.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                setTimeout(resolve, 600);
                            }, 400);
                        } else {
                            resolve();
                        }
                    });
                }
            },
            {
                element: '#exportOptions',
                title: 'Export Options',
                intro: 'Save your creation in various formats including PNG, video, and more. Share your work easily!',
                position: 'right',
                onbeforechange: function() {
                    return new Promise(resolve => {
                        const exportButton = document.querySelector('button[data-bs-target="#exportOptions"]');
                        const exportCollapse = document.querySelector('#exportOptions');
                        
                        if (!exportCollapse.classList.contains('show')) {
                            exportButton.click();
                            setTimeout(() => {
                                exportCollapse.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                setTimeout(resolve, 600);
                            }, 400);
                        } else {
                            resolve();
                        }
                    });
                }
            },
            {
                title: 'Ready to Create!',
                intro: 'You\'re all set to create amazing particle effects! Remember to explore the metrics panels and try different combinations of settings. Have fun creating!'
            }
        ],
        showProgress: true,
        showBullets: true,
        exitOnOverlayClick: false,
        overlayOpacity: 0.8,
        scrollToElement: true,
        scrollPadding: 50
    });

    // Add highlight effect to current element
    intro.onbeforechange(function(targetElement) {
        // Remove highlight from previous element
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        
        if (targetElement) {
            // Add highlight to current element
            targetElement.classList.add('tutorial-highlight');
            // Animate pointer to the element
            animatePointerToElement(targetElement);
        }
    });

    // Clean up on tutorial exit
    intro.onexit(function() {
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        if (tutorialPointer) {
            tutorialPointer.remove();
            tutorialPointer = null;
        }
    });

    // Handle tutorial completion
    intro.oncomplete(function() {
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        if (tutorialPointer) {
            tutorialPointer.remove();
            tutorialPointer = null;
        }
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
