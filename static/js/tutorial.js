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
                element: '#turbulence',
                title: 'Physics Parameters',
                intro: 'Experiment with turbulence, air resistance, and vortex effects to create dynamic movement patterns.',
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
                element: '#physicsControls',
                title: 'Advanced Physics',
                intro: 'Welcome to the physics control center! Here you can fine-tune gravity, wind, bounce, friction, and more to create unique particle behaviors.',
                position: 'right'
            },
            {
                element: '#particleLife',
                title: 'Particle Lifespan',
                intro: 'Define how long particles exist before respawning. Short lifespans create quick bursts, while longer ones create persistent effects.',
                position: 'right'
            },
            {
                element: '#particleAcceleration',
                title: 'Particle Acceleration',
                intro: 'Control how quickly particles respond to forces. Higher values create more energetic and responsive movement.',
                position: 'right'
            },
            {
                element: '#collisionEnabled',
                title: 'Collision Detection',
                intro: 'Enable particle collisions for more realistic interactions between particles.',
                position: 'right'
            },
            {
                element: '#particleColor',
                title: 'Color Selection',
                intro: 'Choose the perfect color for your particles to match your creative vision.',
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
                element: '#visualEffects',
                title: 'Visual Effects',
                intro: 'Enter the visual customization zone! Here you can transform the appearance of your particles.',
                position: 'right'
            },
            {
                element: '#trailLength',
                title: 'Trail Effects',
                intro: 'Adjust the length of particle trails to create stunning motion effects.',
                position: 'right'
            },
            {
                element: '#reverseTrail',
                title: 'Trail Direction',
                intro: 'Experiment with forward or reverse trails to create unique visual patterns!',
                position: 'right'
            },
            {
                element: '#backgroundControls',
                title: 'Background Settings',
                intro: 'Make your particle effects stand out! Choose a background color or upload an image to create the perfect backdrop for your particles.',
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
