// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    
    // Hero Animation
    const heroTimeline = gsap.timeline();
    
    heroTimeline
        .to('.hero-title', {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power4.out'
        })
        .to('.hero-subtitle', {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out'
        }, '-=0.5')
        .to('.hero-contact', {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out'
        }, '-=0.5');

    // Section Headers Reveal
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.to(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out'
        });
    });

    // Profile Text Reveal
    gsap.to('.profile-text', {
        scrollTrigger: {
            trigger: '#profile',
            start: 'top 70%',
        },
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: 'power3.out'
    });

    // Experience Items Stagger
    gsap.to('.experience-item', {
        scrollTrigger: {
            trigger: '#experience',
            start: 'top 75%',
        },
        x: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
    });

    // Skills Animation
    gsap.utils.toArray('.skill-category').forEach(category => {
        gsap.to(category, {
            scrollTrigger: {
                trigger: category,
                start: 'top 85%',
            },
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out'
        });
    });

    // Skill Bars Fill
    gsap.utils.toArray('.skill-bar').forEach(bar => {
        const width = bar.getAttribute('data-width');
        gsap.to(bar, {
            scrollTrigger: {
                trigger: bar,
                start: 'top 90%',
            },
            width: width,
            duration: 1.5,
            ease: 'power2.out'
        });
    });

});
