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
    const navList = document.getElementById('nav-list');
    const navBackdrop = document.getElementById('nav-backdrop');
    const navbar = document.getElementById('navbar');

    function setMenuState(isOpen) {
        if (!hamburger || !navList) return;
        navList.classList.toggle('active', isOpen);
        navBackdrop?.classList.toggle('active', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
        navbar?.classList.toggle('menu-open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        navList.setAttribute('aria-hidden', String(!isOpen));

        const icon = hamburger.querySelector('i');
        if (!icon) return;
        icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
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

    navBackdrop?.addEventListener('click', () => {
        setMenuState(false);
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
       8. EVENT GALLERY — On-demand image loading
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

    const galleryEvents = [
        { title: 'Sport Day 25-26', folder: 'Sport Day 25-26', media: ['main.jpeg', '1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg', '6.jpeg', '7.jpeg'] },
        { title: 'Deepawali Celebration', folder: 'Deepawali Celebration', media: ['main.jpeg', '1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg', '6.jpeg', '7.jpeg', '8.jpeg', '9.jpeg', '10.jpeg', '11.jpeg', '12.jpeg', '13.jpeg'] },
        { title: 'Ganesh Sthapna', folder: 'Ganesh Sthapna', media: ['main.jpeg', '1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg'] },
        { title: 'Green Day Celebration', folder: 'Green Day Celebration', media: ['main.jpeg', '1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg', '6.jpeg', '7.jpeg'] },
        { title: 'Guru Poornima', folder: 'Guru Poornima', media: ['main.jpeg', '1.jpeg', '2.mp4'] },
        { title: 'Holi Celebration 25-26', folder: 'Holi Celebration 25-26', media: ['main.jpeg', '1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg', '6.jpeg', '7.jpeg'] },
        { title: 'Janmashthmi Celebration', folder: 'Janmashthmi Celebration', media: ['main.jpeg', '1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg', '6.jpeg', '7.jpeg', '8.jpeg', '9.jpeg', '10.jpeg'] },
        { title: 'Navratri Garba Celebration', folder: 'Navratri Garba Celebration', media: ['main.jpeg', '1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg', '6.jpeg', '7.mp4'] },
        { title: 'Republic Day', folder: 'Republic Day', media: ['main.jpeg', '1.jpeg', '2.jpeg', '3.jpeg'] },
        { title: 'Board Result 2025-26', folder: 'Board Result 2025-26', media: ['main.jpeg', '1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg'] }
    ];

    const eventGallery = document.getElementById('event-gallery');
    const eventViewer = document.getElementById('event-viewer');
    const eventViewerOverlay = document.querySelector('.event-viewer-overlay');
    const eventViewerClose = document.querySelector('.event-viewer-close');
    const eventTitle = document.getElementById('event-title');
    const eventMeta = document.getElementById('event-meta');
    const eventLoading = document.getElementById('event-loading');
    const eventImagesGrid = document.getElementById('event-images');
    const staffPhotoImage = document.querySelector('.staff-photo img');
    const lb = buildLightbox();
    const lbImg = lb.querySelector('#lb-img');
    let currentEventImages = [];
    let currentLightboxIndex = 0;

    function imageSrc(folder, file) {
        return `Photo Gallery/${folder}/${file}`;
    }

    function renderEventCovers() {
        if (!eventGallery) return;
        eventGallery.innerHTML = '';

        galleryEvents.forEach((evt, idx) => {
            const card = document.createElement('button');
            card.className = 'event-card';
            card.type = 'button';
            card.setAttribute('aria-label', `Open ${evt.title} gallery`);
            card.dataset.eventIndex = String(idx);
            card.innerHTML = `
                <img src="${imageSrc(evt.folder, 'main.jpeg')}" alt="${evt.title} cover">
                <span class="event-card-overlay">
                    <strong>${evt.title}</strong>
                   
                </span>
            `;
            eventGallery.appendChild(card);
        });
    }

    function openLightbox(index) {
        if (!currentEventImages.length) return;
        currentLightboxIndex = index;
        lbImg.src = currentEventImages[currentLightboxIndex].src;
        lbImg.alt = currentEventImages[currentLightboxIndex].alt;
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lb.classList.remove('open');
        document.body.style.overflow = eventViewer && eventViewer.classList.contains('open') ? 'hidden' : '';
    }

    function closeEventViewer() {
        if (!eventViewer) return;
        eventViewer.classList.remove('open');
        eventViewer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    async function loadEventImages(evt) {
        if (!eventViewer || !eventImagesGrid || !eventLoading) return;

        eventTitle.textContent = evt.title;
        eventMeta.textContent = 'Preparing gallery...';
        eventImagesGrid.innerHTML = '';
        eventLoading.classList.add('show');
        eventViewer.classList.add('open');
        eventViewer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        currentEventImages = [];
        let loadedItems = 0;
        let imageIndex = 0;

        for (let i = 0; i < evt.media.length; i += 1) {
            const file = evt.media[i];
            const isVideo = file.toLowerCase().endsWith('.mp4');
            const mediaPath = imageSrc(evt.folder, file);

            if (isVideo) {
                const videoCard = document.createElement('div');
                videoCard.className = 'event-video';
                const video = document.createElement('video');
                video.controls = true;
                video.preload = 'metadata';
                video.playsInline = true;
                video.src = mediaPath;
                videoCard.appendChild(video);
                eventImagesGrid.appendChild(videoCard);
            } else {
                const card = document.createElement('button');
                card.className = 'event-image';
                card.type = 'button';
                card.setAttribute('aria-label', `Open image ${imageIndex + 1} from ${evt.title}`);

                const img = new Image();
                img.alt = `${evt.title} photo ${imageIndex + 1}`;
                img.src = mediaPath;

                const lightboxIndex = imageIndex;
                card.appendChild(img);
                card.addEventListener('click', () => openLightbox(lightboxIndex));
                eventImagesGrid.appendChild(card);
                currentEventImages.push(img);
                imageIndex += 1;
            }

            loadedItems += 1;
            eventMeta.textContent = `Loaded ${loadedItems} of ${evt.media.length} items`;
        }
        eventLoading.classList.remove('show');
        eventMeta.textContent = `${evt.media.length} items loaded (${currentEventImages.length} photos${evt.media.length > currentEventImages.length ? ', includes video' : ''})`;
    }

    if (staffPhotoImage) {
        staffPhotoImage.style.cursor = 'zoom-in';
        staffPhotoImage.addEventListener('click', () => {
            currentEventImages = [staffPhotoImage];
            openLightbox(0);
        });
    }

    if (eventGallery && eventViewer) {
        renderEventCovers();
        eventGallery.addEventListener('click', (e) => {
            const card = e.target.closest('.event-card');
            if (!card) return;
            const idx = Number(card.dataset.eventIndex);
            const selectedEvent = galleryEvents[idx];
            if (!selectedEvent) return;
            loadEventImages(selectedEvent);
        });

        eventViewerClose.addEventListener('click', closeEventViewer);
        eventViewerOverlay.addEventListener('click', closeEventViewer);

        lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
        lb.querySelector('.lb-overlay').addEventListener('click', closeLightbox);
        lb.querySelector('.lb-prev').addEventListener('click', () => {
            if (!currentEventImages.length) return;
            openLightbox((currentLightboxIndex - 1 + currentEventImages.length) % currentEventImages.length);
        });
        lb.querySelector('.lb-next').addEventListener('click', () => {
            if (!currentEventImages.length) return;
            openLightbox((currentLightboxIndex + 1) % currentEventImages.length);
        });

        document.addEventListener('keydown', (e) => {
            if (lb.classList.contains('open')) {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') lb.querySelector('.lb-prev').click();
                if (e.key === 'ArrowRight') lb.querySelector('.lb-next').click();
                return;
            }
            if (eventViewer.classList.contains('open') && e.key === 'Escape') {
                closeEventViewer();
            }
        });
    }

}); // end DOMContentLoaded
