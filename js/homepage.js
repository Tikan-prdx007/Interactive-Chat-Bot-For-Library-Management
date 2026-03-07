/* ═══════════════════════════════════════════════════════════════════════════
   SHELFBOT — Homepage JavaScript
   Hamburger · Navbar scroll · Counter · Scroll-reveal · Active nav
═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ── Hamburger / Mobile Menu ── */
    const hamburger = document.getElementById('nav-hamburger');
    const mobileMenu = document.getElementById('nav-mobile');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('open', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close on mobile link click
        mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });

        // Close on outside click
        document.addEventListener('click', e => {
            if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    /* ── Navbar Scroll Shrink ── */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        const onScroll = () => {
            navbar.classList.toggle('scrolled', window.scrollY > 60);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // initial check
    }

    /* ── Active Nav Link on Scroll ── */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    const highlightNav = () => {
        let current = '';
        sections.forEach(section => {
            const top = section.getBoundingClientRect().top;
            if (top <= 100) current = section.id;
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });

    /* ── Scroll Reveal (Intersection Observer) ── */
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        const revealObs = new IntersectionObserver(
            entries => {
                entries.forEach((entry, i) => {
                    if (entry.isIntersecting) {
                        // Stagger children within a group
                        const delay = entry.target.dataset.delay || 0;
                        setTimeout(() => entry.target.classList.add('revealed'), Number(delay));
                        revealObs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
        );
        revealEls.forEach(el => revealObs.observe(el));
    }

    /* ── Animated Counters ── */
    const statEls = document.querySelectorAll('.stat-number[data-target]');

    const easeOut = t => 1 - Math.pow(1 - t, 3);

    const animateCounter = el => {
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
        const duration = 1800;
        const start = performance.now();

        const tick = now => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const value = easeOut(progress) * target;
            el.textContent = prefix + value.toFixed(decimals) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    if (statEls.length) {
        const counterObs = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        counterObs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );
        statEls.forEach(el => counterObs.observe(el));
    }

    /* ── Contact Form ── */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const success = document.getElementById('form-success');
            contactForm.style.display = 'none';
            if (success) success.style.display = 'block';
        });
    }

    /* ── Floating emoji parallax on hero ── */
    const floats = document.querySelectorAll('.hero-float');
    window.addEventListener('mousemove', e => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;
        floats.forEach((el, i) => {
            const depth = (i % 3 + 1) * 6;
            el.style.transform = `translate(${dx * depth}px, ${dy * depth}px)`;
        });
    });

})();
