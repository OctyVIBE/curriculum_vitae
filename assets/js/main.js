// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, Draggable);

// Force scroll to top on reload to prevent layout glitches
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {

    let entranceTimeline;
    let draggableInstances = [];
    let pageDraggable;

    function initAnimations() {
        // Kill existing ScrollTriggers to prevent duplicates on restart
        ScrollTrigger.getAll().forEach(st => st.kill());

        // Initial Entrance Animation
        entranceTimeline = gsap.timeline();

        entranceTimeline
            .from('.cv-container', {
                y: 100,
                opacity: 0,
                duration: 1.5,
                ease: 'elastic.out(1, 0.75)'
            })
            .from('.skill-bar', {
                width: 0,
                duration: 1.5,
                stagger: 0.1,
                ease: 'power2.out'
            }, '-=0.5');

        // Skills Animation
        gsap.utils.toArray('.skill-bar').forEach(bar => {
            gsap.to(bar, {
                scrollTrigger: {
                    trigger: bar,
                    start: 'top 90%',
                    once: true // Run only once
                },
                width: bar.getAttribute('data-width'),
                duration: 1.5,
                ease: 'power2.out'
            });
        });

        // Main Content Reveal - SIMPLIFIED
        // Only animate opacity and slight Y to avoid heavy transform conflicts
        const sections = gsap.utils.toArray('section');
        sections.forEach(section => {
            const elements = section.querySelectorAll('.profile-text, .experience-item, .figma-selection');

            if (elements.length > 0) {
                gsap.from(elements, {
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 85%',
                        once: true // Important: Run once then release control
                    },
                    y: 30,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power2.out',
                    clearProps: 'all' // Clean up inline styles after animation so Draggable works freely
                });
            }
        });

        // Refresh ScrollTrigger to calculate positions
        ScrollTrigger.refresh();
    }

    // Initialize animations only after everything (images, styles) is fully loaded
    window.addEventListener('load', () => {
        // Double check scroll position
        window.scrollTo(0, 0);
        setTimeout(() => {
            initAnimations();
        }, 100); // Small delay to ensure browser rendering is complete
    });

    try {
        // initAnimations(); // Removed immediate call, waiting for load

        // Looping Animations (Run once, don't need restart logic usually, or can be separate)
        gsap.to('aside .rounded-full.border-4', {
            y: 10,
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut'
        });

        gsap.to('aside .rounded-full.bg-white\\/10', {
            scale: 1.1,
            duration: 1.5,
            yoyo: true,
            repeat: -1,
            stagger: 0.2,
            ease: 'sine.inOut'
        });

        // 3D Tilt Effect
        const cards = document.querySelectorAll('#portfolio .group');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;

                gsap.to(card, {
                    rotationX: rotateX,
                    rotationY: rotateY,
                    scale: 1.05,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotationX: 0,
                    rotationY: 0,
                    scale: 1,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            });
        });

        // Hover effect for list items
        const listItems = document.querySelectorAll('li');
        listItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                gsap.to(item, { x: 5, color: '#9b59b6', duration: 0.3 });
                gsap.to(item.querySelector('span.bg-brand-purple, span.bg-gray-400'), { scale: 1.5, duration: 0.3 });
            });
            item.addEventListener('mouseleave', () => {
                gsap.to(item, { x: 0, color: 'inherit', duration: 0.3 });
                gsap.to(item.querySelector('span.bg-brand-purple, span.bg-gray-400'), { scale: 1, duration: 0.3 });
            });
        });

        // --- INTERACTIVE FEATURES ---

        // 1. Draggable Elements
        draggableInstances = Draggable.create('.figma-selection', {
            type: 'x,y',
            edgeResistance: 0.65,
            // bounds: 'body', // Removed to fix "Jump" bug
            snap: {
                x: function (endValue) { return Math.round(endValue / 20) * 20; },
                y: function (endValue) { return Math.round(endValue / 20) * 20; }
            },
            onDragStart: function () {
                this.target.style.zIndex = 100;
                this.target.classList.add('cursor-grabbing');
            },
            onDragEnd: function () {
                this.target.style.zIndex = '';
                this.target.classList.remove('cursor-grabbing');
            }
        });

        // 2. Hand Tool Logic
        const handToolBtn = document.getElementById('toolbar-hand');
        const moveToolBtn = document.getElementById('toolbar-move');
        const shareBtn = document.getElementById('toolbar-share');
        const pdfBtn = document.getElementById('toolbar-pdf');
        const body = document.body;

        // Create a transparent overlay for the Hand tool to capture drags
        const dragOverlay = document.createElement('div');
        dragOverlay.style.position = 'fixed';
        dragOverlay.style.top = '0';
        dragOverlay.style.left = '0';
        dragOverlay.style.width = '100%';
        dragOverlay.style.height = '100%';
        dragOverlay.style.zIndex = '9998'; // Below toolbar (z-50) but above content
        dragOverlay.style.cursor = 'grab';
        dragOverlay.style.display = 'none'; // Hidden by default
        document.body.appendChild(dragOverlay);

        // Create a proxy element for Draggable
        const proxy = document.createElement("div");

        pageDraggable = Draggable.create(proxy, {
            trigger: dragOverlay, // Trigger on the overlay
            type: "x,y", // Track x and y movement
            inertia: true,
            onPress: function () {
                this.startX = this.x;
                this.startY = this.y;
                this.scrollStartX = window.scrollX;
                this.scrollStartY = window.scrollY;
                dragOverlay.style.cursor = 'grabbing';
                body.style.cursor = 'grabbing';
            },
            onDrag: function () {
                const diffX = this.x - this.startX;
                const diffY = this.y - this.startY;
                window.scrollTo(this.scrollStartX - diffX, this.scrollStartY - diffY);
            },
            onRelease: function () {
                dragOverlay.style.cursor = 'grab';
                body.style.cursor = 'grab';
            }
        })[0];

        pageDraggable.disable();

        if (handToolBtn && moveToolBtn) {
            handToolBtn.addEventListener('click', () => {
                body.style.cursor = 'grab';
                body.style.userSelect = 'none'; // Prevent text selection
                dragOverlay.style.display = 'block'; // Show overlay

                draggableInstances.forEach(d => d.disable());
                pageDraggable.enable();

                handToolBtn.classList.add('text-brand-purple', 'bg-white/10');
                handToolBtn.classList.remove('text-gray-400');
                moveToolBtn.classList.remove('text-brand-purple', 'bg-white/10');
                moveToolBtn.classList.add('text-gray-400');
            });

            moveToolBtn.addEventListener('click', () => {
                body.style.cursor = 'default';
                body.style.userSelect = ''; // Re-enable text selection
                dragOverlay.style.display = 'none'; // Hide overlay

                draggableInstances.forEach(d => d.enable());
                pageDraggable.disable();

                moveToolBtn.classList.add('text-brand-purple', 'bg-white/10');
                moveToolBtn.classList.remove('text-gray-400');
                handToolBtn.classList.remove('text-brand-purple', 'bg-white/10');
                handToolBtn.classList.add('text-gray-400');
            });
        }

        // Share Button Logic
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                const email = prompt("Entrez l'adresse email du destinataire :");
                if (email && email.includes('@')) {
                    const subject = encodeURIComponent("CV de Sandro Raitano");
                    const body = encodeURIComponent("Bonjour,\n\nVoici le lien vers le CV interactif de Sandro Raitano : " + window.location.href + "\n\nCordialement.");
                    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                } else if (email) {
                    alert("Veuillez entrer une adresse email valide.");
                }
            });
        }

        // PDF Button Logic
        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => {
                window.print();
            });
        }

        // 3. Restart Button Logic
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // Reset Draggable positions
                gsap.to('.figma-selection', {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: 'power2.inOut',
                    clearProps: 'transform,zIndex',
                    onComplete: () => {
                        // Re-initialize animations after reset is done
                        initAnimations();
                    }
                });
            });
        }

    } catch (error) {
        console.error("GSAP Animation Error:", error);
        document.querySelectorAll('.opacity-0').forEach(el => el.classList.remove('opacity-0'));
    }

});
