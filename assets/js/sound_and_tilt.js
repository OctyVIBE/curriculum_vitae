
// ==========================================
// CREATIVE ENHANCEMENTS: TILT & SOUND
// ==========================================
console.log('TILT CONFIG V2 LOADED');

// 1. 3D Tilt Initialization
if (typeof VanillaTilt !== 'undefined' && window.innerWidth > 1024) {
    VanillaTilt.init(document.querySelector(".cv-container"), {
        max: 2,               // REDUCED: Max tilt rotation (degrees) - much subtler
        speed: 800,           // SLOWER: Smoother transition
        glare: true,          // Add glare effect
        "max-glare": 0.1,     // REDUCED: Less aggressive glare
        scale: 1.005,         // REDUCED: Almost no zoom to prevent layout shifts
        reverse: true,        // Reverse tilt for natural feel
        gyroscope: false,     // Disable gyro (mobile) to prevent shaking
        "mouse-event-element": document.body // FIX: Track mouse on body to prevent edge flickering
    });
}

// 2. Sound Design (Web Audio API)
class SoundManager {
    constructor() {
        // Disable on mobile/tablet
        if (window.innerWidth <= 1024) return;

        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.muted = localStorage.getItem('cv_muted') === 'true';
        this.initUI();
        this.attachListeners();
    }

    initUI() {
        const btn = document.getElementById('toolbar-sound');
        const iconOn = document.getElementById('sound-icon-on');
        const iconOff = document.getElementById('sound-icon-off');

        if (btn && iconOn && iconOff) {
            this.updateIcons(); // Set initial state

            btn.addEventListener('click', () => {
                this.toggleMute();
            });
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('cv_muted', this.muted);
        this.updateIcons();
        if (!this.muted) this.playClick(); // Feedback sound
    }

    updateIcons() {
        const iconOn = document.getElementById('sound-icon-on');
        const iconOff = document.getElementById('sound-icon-off');
        if (this.muted) {
            iconOn.classList.add('hidden');
            iconOff.classList.remove('hidden');
        } else {
            iconOn.classList.remove('hidden');
            iconOff.classList.add('hidden');
        }
    }

    // High-pitched "Pop" for Hover -> Now LOWER PITCHED ("Grave")
    playHover() {
        if (this.muted) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        // Lower frequency for "grave" sound (200Hz -> 300Hz)
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime); // Keep volume low
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    // Low-pitched "Blip" for Click -> Now Crisp Mouse Click
    playClick() {
        if (this.muted) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Square wave or Sine wave at high frequency simulates a mechanical "tick"
        osc.type = 'sine';

        // Start high, very short drop
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.05);

        // Very short crisp envelope
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    attachListeners() {
        // Hovers: Figma selections, buttons, experience items
        const hoverTargets = document.querySelectorAll('.figma-selection, button, a, .experience-item');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => this.playHover());
            el.addEventListener('click', () => this.playClick());
        });
    }
}

// Initialize Sound Manager
const soundManager = new SoundManager();
