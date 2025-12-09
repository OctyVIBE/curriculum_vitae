
// ==========================================
// CREATIVE ENHANCEMENTS: TILT & SOUND
// ==========================================

// 1. 3D Tilt Initialization
if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelector(".cv-container"), {
        max: 5,               // Max tilt rotation (degrees) - subtle
        speed: 400,           // Speed of the enter/exit transition
        glare: true,          // Add glare effect
        "max-glare": 0.2,     // Max opacity of glare
        scale: 1.02,          // Slight zoom on hover
        reverse: true         // Reverse tilt for natural feel
    });
}

// 2. Sound Design (Web Audio API)
class SoundManager {
    constructor() {
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

    // High-pitched "Pop" for Hover
    playHover() {
        if (this.muted) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime); // Very quiet
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    // Low-pitched "Blip" for Click
    playClick() {
        if (this.muted) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
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
