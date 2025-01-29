// Function to reset all particle system parameters to their default values
function resetSystem() {
    // Reset basic controls
    document.getElementById('particleCount').value = 50;
    document.getElementById('particleCountValue').value = 50;
    document.getElementById('particleSize').value = 5;
    document.getElementById('particleSizeValue').value = 5;
    document.getElementById('particleSpeed').value = 60;
    document.getElementById('particleSpeedValue').value = 60;

    // Reset physics controls
    document.getElementById('gravity').value = 0.1;
    document.getElementById('gravityValue').value = 20;
    document.getElementById('wind').value = 0;
    document.getElementById('windValue').value = 50;
    document.getElementById('bounce').value = 0.8;
    document.getElementById('bounceValue').value = 80;
    document.getElementById('friction').value = 0.99;
    document.getElementById('frictionValue').value = 90;
    document.getElementById('airResistance').value = 0.02;
    document.getElementById('airResistanceValue').value = 20;
    document.getElementById('turbulence').value = 0.1;
    document.getElementById('turbulenceValue').value = 20;
    document.getElementById('vortexStrength').value = 0;
    document.getElementById('vortexStrengthValue').value = 50;
    document.getElementById('particleMass').value = 1.0;
    document.getElementById('particleMassValue').value = 18;
    document.getElementById('particleLife').value = 1.0;
    document.getElementById('particleLifeValue').value = 20;
    document.getElementById('particleAcceleration').value = 1.0;
    document.getElementById('particleAccelerationValue').value = 50;

    // Reset collision checkbox
    document.getElementById('collisionEnabled').checked = false;

    // Reset advanced options
    document.getElementById('particleShape').value = 'circle';
    document.getElementById('particleRotation').checked = false;

    // Reset visual effects
    document.getElementById('particleOpacity').value = 1;
    document.getElementById('particleOpacityValue').value = 100;
    document.getElementById('particleBlur').value = 0;
    document.getElementById('particleBlurValue').value = 0;
    document.getElementById('particleColor').value = '#ffffff';
    document.getElementById('trailLength').value = 10;
    document.getElementById('trailLengthValue').value = 33;
    document.getElementById('reverseTrail').checked = false;

    // Reset background
    document.getElementById('backgroundColor').value = '#2ecc71';

    // Trigger change events to update the particle system
    const event = new Event('change');
    document.querySelectorAll('input[type="range"]').forEach(input => {
        input.dispatchEvent(event);
    });
}
