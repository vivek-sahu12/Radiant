document.addEventListener('DOMContentLoaded', () => {

    /* ============================================
       1. HERO PARALLAX  (requestAnimationFrame)
       ============================================ */
    const hero = document.querySelector('.hero');
    let rafPending = false;

    function applyHeroParallax() {
        if (hero) {
            const scrollY = window.pageYOffset;
            // Shift background-position for a smooth parallax feel
            hero.style.backgroundPositionY = `calc(50% + ${scrollY * 0.35}px)`;
        }
        rafPending = false;
    }

    window.addEventListener('scroll', () => {
        if (!rafPending) {
            window.requestAnimationFrame(applyHeroParallax);
            rafPending = true;
        }
    }, { passive: true });


    /* ============================================
       2. MOBILE MENU TOGGLE
       ============================================ */
    const hamburger = document.getElementById('hamburger-menu');
    const navList   = document.getElementById('nav-list');

    function setMenuState(isOpen) {
        if (!hamburger || !navList) return;
        navList.classList.toggle('active', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));

        const icon = hamburger.querySelector('i');
        if (!icon) return;
        if (isOpen) {
            icon.classList.replace('fa-bars', 'fa-times');
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    }

    if (hamburger && navList) {
        hamburger.addEventListener('click', () => {
            const isOpen = !navList.classList.contains('active');
            setMenuState(isOpen);
        });
    }

    // Close menu when a link is clicked (mobile)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            setMenuState(false);
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            setMenuState(false);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            setMenuState(false);
        }
    });


    /* ============================================
       3. NAVBAR — transparent → frosted glass
       ============================================ */
    const navbar   = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function onScroll() {
        // --- Navbar state ---
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // --- Active nav-link ---
        let current = 'home';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 160) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active',
                link.getAttribute('href') === `#${current}`);
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load


    /* ============================================
       4. SMOOTH SCROLL with header offset
       ============================================ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();

            const headerH = navbar ? navbar.offsetHeight : 80;
            const top = target.getBoundingClientRect().top + window.pageYOffset - headerH;

            window.scrollTo({ top, behavior: 'smooth' });
        });
    });


    /* ============================================
       5. SCROLL-REVEAL (IntersectionObserver)
       ============================================ */
    const revealEls = document.querySelectorAll('.scroll-reveal');

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            obs.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -55px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));


    /* ============================================
       6. CONTACT FORM — submission feedback
       ============================================ */
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;

            // Show sending state
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>&nbsp; Sending…';
            btn.disabled = true;

            // Simulate API call delay
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check-circle"></i>&nbsp; Message Sent!';
                btn.style.background = 'linear-gradient(135deg, #16a34a, #15803d)';
                contactForm.reset();

                // Revert after 4 seconds
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 4000);
            }, 1800);
        });
    }


    /* ============================================
       7. STATS COUNTER ANIMATION
          Triggers when About section enters view
       ============================================ */
    function animateCounter(el, target, duration = 1600) {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                el.innerHTML = target;
                clearInterval(timer);
            } else {
                el.innerHTML = Math.floor(start);
            }
        }, 16);
    }

    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0) {
        const counterObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-target')) || parseInt(entry.target.innerText) || 10;
                    animateCounter(entry.target, target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });

        statNumbers.forEach(num => counterObserver.observe(num));
    }


    /* ============================================
       8. GALLERY — Lightbox on click
       ============================================ */
    function buildLightbox() {
        const lb = document.createElement('div');
        lb.id = 'lightbox';
        lb.innerHTML = `
            <div class="lb-overlay"></div>
            <div class="lb-content">
                <img src="" alt="Gallery Image" id="lb-img">
                <button class="lb-close" aria-label="Close lightbox"><i class="fas fa-times"></i></button>
                <button class="lb-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>
                <button class="lb-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>
            </div>`;
        document.body.appendChild(lb);
        return lb;
    }

    const galleryItems = Array.from(document.querySelectorAll('.gallery-item img'));
    if (galleryItems.length) {
        const lb     = buildLightbox();
        const lbImg  = lb.querySelector('#lb-img');
        let   current = 0;

        function openLightbox(idx) {
            current = idx;
            lbImg.src = galleryItems[idx].src;
            lbImg.alt = galleryItems[idx].alt;
            lb.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lb.classList.remove('open');
            document.body.style.overflow = '';
        }

        galleryItems.forEach((img, i) => {
            img.parentElement.style.cursor = 'pointer';
            img.parentElement.addEventListener('click', () => openLightbox(i));
        });

        lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
        lb.querySelector('.lb-overlay').addEventListener('click', closeLightbox);
        lb.querySelector('.lb-prev').addEventListener('click', () => {
            openLightbox((current - 1 + galleryItems.length) % galleryItems.length);
        });
        lb.querySelector('.lb-next').addEventListener('click', () => {
            openLightbox((current + 1) % galleryItems.length);
        });

        document.addEventListener('keydown', e => {
            if (!lb.classList.contains('open')) return;
            if (e.key === 'Escape')      closeLightbox();
            if (e.key === 'ArrowLeft')   lb.querySelector('.lb-prev').click();
            if (e.key === 'ArrowRight')  lb.querySelector('.lb-next').click();
        });
    }

}); // end DOMContentLoaded
