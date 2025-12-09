// Register GSAP plugins
console.log('%c SCRIPT LOADED - VERSION PURPLE ', 'background: #222; color: #bada55');
// alert('Mise à jour chargée !'); // Commented out to be less intrusive but can be enabled if needed
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

        const cvContainer = document.querySelector('.cv-container');
        if (cvContainer) {
            entranceTimeline.from(cvContainer, {
                y: 100,
                opacity: 0,
                duration: 1.5,
                ease: 'elastic.out(1, 0.75)'
            });
        }

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

        // Main Content Reveal
        const sections = gsap.utils.toArray('section');
        sections.forEach(section => {
            // We animate the section itself to avoid complex selector issues
            gsap.from(section, {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 85%',
                    once: true
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out',
                clearProps: 'all'
            });
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

        // Sidebar Drag & Drop Sorting (Sortable.js)
        const sidebarSectionsContainer = document.getElementById('sidebar-sections');
        if (sidebarSectionsContainer) {
            Sortable.create(sidebarSectionsContainer, {
                animation: 150,
                handle: '.sidebar-section', // Make the whole section the handle
                ghostClass: 'sortable-ghost-sidebar', // Dark grey for sidebar placeholder
                onStart: function () {
                    document.body.style.cursor = 'grabbing';
                },
                onEnd: function () {
                    document.body.style.cursor = 'default';
                }
            });
        }

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
        // 1. Sortable Elements (Main Content) - Initialize on LOAD to avoid conflicts
        window.addEventListener('load', () => {
            const commonSortableOptions = {
                animation: 150,
                ghostClass: 'sortable-ghost-main',
                onStart: () => {
                    document.body.style.cursor = 'grabbing';
                },
                onEnd: () => {
                    document.body.style.cursor = 'default';
                }
            };

            // Main Sections Reordering
            const mainSections = document.getElementById('main-sections');
            if (mainSections) {
                Sortable.create(mainSections, {
                    ...commonSortableOptions,
                    forceFallback: true, // Force JS fallback
                    onStart: () => {
                        document.body.style.cursor = 'grabbing';
                        console.log('Drag started on mainSections');
                        mainSections.style.border = '2px solid #9b59b6'; // Visual debug (purple)
                    },
                    onEnd: () => {
                        document.body.style.cursor = 'default';
                        mainSections.style.border = '';
                    }
                });
            }

            // Experience Items Reordering
            const experienceList = document.getElementById('experience-list');
            console.log('Experience List found: ' + (!!experienceList));
            if (experienceList) {
                try {
                    window.expSortable = Sortable.create(experienceList, {
                        ...commonSortableOptions,
                        onStart: () => console.log('Drag started on Experience'),
                        onEnd: () => console.log('Drag ended on Experience')
                    });
                    console.log('Sortable created for Experience List');
                } catch (e) {
                    console.log('Error creating Sortable: ' + e.message);
                }
            }

            // Tools Grid Reordering
            const toolsGrid = document.getElementById('tools-grid');
            if (toolsGrid) {
                Sortable.create(toolsGrid, {
                    ...commonSortableOptions,
                    onStart: () => console.log('Drag started on Tools'),
                    onEnd: () => console.log('Drag ended on Tools')
                });
            }

            // Portfolio Grid Reordering
            const portfolioGrid = document.getElementById('portfolio-grid');
            if (portfolioGrid) {
                Sortable.create(portfolioGrid, {
                    ...commonSortableOptions,
                    onStart: () => console.log('Drag started on Portfolio'),
                    onEnd: () => console.log('Drag ended on Portfolio')
                });
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
        dragOverlay.style.zIndex = '40'; // Below toolbar (z-50) but above content
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

        // --- MODAL & ACTION LOGIC ---
        const modal = document.getElementById('email-modal');
        const modalCloseBtn = document.getElementById('close-modal-btn'); // Changed selector to ID
        const emailForm = document.getElementById('email-form');
        const modalActionText = document.getElementById('modal-action-text');
        let currentAction = null;

        function openModal(action) {
            currentAction = action;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            modal.setAttribute('aria-hidden', 'false'); // Fix ARIA
            modal.setAttribute('aria-modal', 'true');   // Fix ARIA
            document.body.style.overflow = 'hidden'; // Prevent background scrolling

            if (action === 'share') {
                modalActionText.textContent = " pour partager ce CV.";
            } else {
                modalActionText.textContent = " pour télécharger le PDF complet (avec coordonnées).";
            }

            // Reset ReCaptcha if it exists
            if (window.grecaptcha) {
                try {
                    grecaptcha.reset();
                } catch (e) { }
            }
        }

        function closeModal() {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            modal.setAttribute('aria-hidden', 'true'); // Fix ARIA
            modal.removeAttribute('aria-modal');       // Fix ARIA
            document.body.style.overflow = '';
            emailForm.reset();
            currentAction = null;
        }

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', closeModal);
        }

        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        if (shareBtn) {
            shareBtn.addEventListener('click', () => openModal('share'));
        }

        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => openModal('pdf'));
        }

        if (emailForm) {
            emailForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;

                // Get ReCaptcha Token
                const captchaResponse = grecaptcha.getResponse();

                if (!captchaResponse) {
                    alert("Veuillez valider le Captcha.");
                    return;
                }

                // Show loading state
                const submitBtn = emailForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.textContent = "Traitement...";
                submitBtn.disabled = true;

                // Send to Backend
                fetch('send_mail.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        action: currentAction,
                        token: captchaResponse
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // EXECUTE ACTION ON SUCCESS
                            if (currentAction === 'share') {
                                const subject = encodeURIComponent("CV de Sandro Raitano");
                                const body = encodeURIComponent("Bonjour,\n\nVoici le lien vers le CV interactif de Sandro Raitano : https://www.octyvibe.be/curriculum_vitae\n\nCordialement.");
                                window.location.href = `mailto:?subject=${subject}&body=${body}`;
                            } else if (currentAction === 'pdf') {
                                // Native Browser Print
                                closeModal();
                                // Small delay to ensure modal is gone
                                setTimeout(() => {
                                    window.print();
                                }, 300);
                            }

                            closeModal();
                            alert("Merci ! Votre demande a été traitée. Le téléchargement va démarrer.");
                        } else {
                            alert("Erreur : " + (data.message || "Une erreur est survenue."));
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert("Erreur de connexion au serveur.");
                    })
                    .finally(() => {
                        submitBtn.textContent = originalBtnText;
                        submitBtn.disabled = false;
                    });
            });
        }

        // 3. Restart Button Logic
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // Reset Draggable positions
                const draggableElements = document.querySelectorAll('.figma-selection');
                if (draggableElements.length > 0) {
                    gsap.to(draggableElements, {
                        x: 0,
                        y: 0,
                        duration: 0.5,
                        ease: 'power2.inOut',
                        clearProps: 'transform,zIndex',
                        onComplete: () => {
                            // Re-initialize animations after reset is done
                            if (typeof initAnimations === 'function') {
                                initAnimations();
                            }
                        }
                    });
                }
            });
        }

    } catch (error) {
        console.error("GSAP Animation Error:", error);
        document.querySelectorAll('.opacity-0').forEach(el => el.classList.remove('opacity-0'));
    }

});
