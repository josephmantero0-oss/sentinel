// Joseph's Sentinel — Scroll-Driven 3D Interactive Engine

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // ── 1. Cursor Follower ───────────────────────────────────────
    const cursorDot  = document.createElement('div'); cursorDot.id  = 'cursor-dot';
    const cursorRing = document.createElement('div'); cursorRing.id = 'cursor-ring';
    cursorDot.style.opacity  = '0';
    cursorRing.style.opacity = '0';
    document.body.append(cursorDot, cursorRing);

    let cursorX = -200, cursorY = -200, ringX = -200, ringY = -200;
    let cursorVisible = false;

    document.addEventListener('mousemove', e => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        cursorDot.style.left = cursorX + 'px';
        cursorDot.style.top  = cursorY + 'px';
        if (!cursorVisible) {
            cursorDot.style.opacity  = '1';
            cursorRing.style.opacity = '1';
            cursorVisible = true;
        }
    });

    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity  = '0';
        cursorRing.style.opacity = '0';
        cursorVisible = false;
    });

    (function animRing() {
        ringX += (cursorX - ringX) * 0.12;
        ringY += (cursorY - ringY) * 0.12;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top  = ringY + 'px';
        requestAnimationFrame(animRing);
    })();

    document.querySelectorAll('a, button, .card-3d-wrap, .faq-q, .grid-card-3d, .step-box-3d').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorRing.style.width       = '54px';
            cursorRing.style.height      = '54px';
            cursorRing.style.borderColor = 'rgba(255,255,255,0.7)';
        });
        el.addEventListener('mouseleave', () => {
            cursorRing.style.width       = '36px';
            cursorRing.style.height      = '36px';
            cursorRing.style.borderColor = 'rgba(255,255,255,0.35)';
        });
    });

    // ── 2. Scroll Progress Bar ───────────────────────────────────
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        ScrollTrigger.create({
            start: 0,
            end: 'max',
            onUpdate: self => { progressBar.style.width = (self.progress * 100) + '%'; }
        });
    }

    // ── 3. 3D Particle Canvas Background ─────────────────────────
    const canvas = document.getElementById('bg-canvas-3d');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });
        const particles = Array.from({ length: 70 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            z: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            size: Math.random() * 1.5 + 0.5
        }));
        let mx = width / 2, my = height / 2;
        window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
        (function animateCanvas() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx + (mx - width / 2) * 0.00003 * p.z;
                p.y += p.vy + (my - height / 2) * 0.00003 * p.z;
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.z, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${0.1 * p.z})`;
                ctx.fill();
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 120) {
                        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(255,255,255,${0.03 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5; ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateCanvas);
        })();
    }

    // ── 4. Hero Section Animations ───────────────────────────────
    gsap.fromTo('.hero-tag', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 }
    );

    const headline = document.querySelector('.hero-headline');
    if (headline) {
        const walk = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const words = node.textContent.split(/(\s+)/);
                if (words.length <= 1) return;
                const frag = document.createDocumentFragment();
                words.forEach(w => {
                    if (/^\s+$/.test(w) || w === '') {
                        frag.appendChild(document.createTextNode(w));
                    } else {
                        const outer = document.createElement('span');
                        outer.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;line-height:1.15';
                        const inner = document.createElement('span');
                        inner.className = 'hw';
                        inner.style.display = 'inline-block';
                        inner.textContent = w;
                        outer.appendChild(inner);
                        frag.appendChild(outer);
                    }
                });
                node.parentNode.replaceChild(frag, node);
            } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'BR') {
                Array.from(node.childNodes).forEach(walk);
            }
        };
        Array.from(headline.childNodes).forEach(walk);

        gsap.fromTo('.hw', 
            { y: '105%', opacity: 0 }, 
            { y: '0%', opacity: 1, duration: 0.65, stagger: 0.04, ease: 'power3.out', delay: 0.3 }
        );
    }

    gsap.fromTo('.hero-description', 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.7 }
    );
    gsap.fromTo('.hero-cta-group .btn', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.2)', delay: 0.9 }
    );
    gsap.fromTo('.stats-grid', 
        { opacity: 0, y: 25 }, 
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 1.1 }
    );

    // Hero parallax drift on scroll
    gsap.to('.hero .container', {
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
        y: -60, opacity: 0.2, ease: 'none'
    });

    // Stats counter-up
    document.querySelectorAll('.stat-val').forEach(el => {
        const raw = el.textContent.trim();
        const m = raw.match(/^([<>\s]*)([\d,]+)(.*)$/);
        if (!m) return;
        const prefix   = m[1];
        const finalNum = parseInt(m[2].replace(/,/g, ''), 10);
        const suffix   = m[3];
        ScrollTrigger.create({
            trigger: el, start: 'top 95%', once: true,
            onEnter: () => {
                const obj = { val: 0 };
                gsap.to(obj, {
                    val: finalNum, 
                    duration: 3.5, 
                    delay: 0.3,
                    ease: 'power2.out',
                    onUpdate: () => {
                        const v = Math.round(obj.val);
                        el.textContent = prefix + (v >= 1000 ? v.toLocaleString() : v) + suffix;
                    }
                });
            }
        });
    });

    // ── 5. Capabilities Section (Horizontal Scroll Pin) ──────────
    const track = document.getElementById('track-wrapper');
    const capabilitiesSection = document.getElementById('capabilities');

    if (track && capabilitiesSection) {
        gsap.to(track, {
            x: () => -(track.scrollWidth - track.parentElement.clientWidth + 40),
            ease: "none",
            scrollTrigger: {
                trigger: capabilitiesSection,
                start: "top 12%",
                end: () => `+=${track.scrollWidth}`,
                pin: true,
                scrub: 0.8,
                invalidateOnRefresh: true
            }
        });
    }

    // ── 6. Section Reveals (Top to bottom, robust and always visible) ─
    const setupSectionReveal = (sectionId, childrenSelector) => {
        const section = document.querySelector(sectionId);
        if (!section) return;

        // Animate section meta
        const meta = section.querySelector('.section-meta');
        if (meta) {
            gsap.fromTo(meta, 
                { opacity: 0, y: 35 },
                { 
                    opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
                    scrollTrigger: { trigger: section, start: 'top 85%', once: true }
                }
            );
        }

        // Animate cards/items within section
        if (childrenSelector) {
            const items = section.querySelectorAll(childrenSelector);
            if (items.length > 0) {
                gsap.fromTo(items, 
                    { opacity: 0, y: 40 },
                    { 
                        opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: 'power2.out',
                        scrollTrigger: { trigger: section, start: 'top 80%', once: true }
                    }
                );
            }
        }
    };

    // Setup each section in natural DOM order
    setupSectionReveal('#simulator', '.sim-box-3d');
    setupSectionReveal('#architecture', '.grid-card-3d');
    setupSectionReveal('#install-guide', '.step-box-3d');
    setupSectionReveal('#faq', '.faq-card');
    setupSectionReveal('footer', '.footer-main > *');

    // ── 7. Section Line Wipes ────────────────────────────────────
    document.querySelectorAll('.section-meta').forEach(meta => {
        if (meta.querySelector('.section-line')) return;
        const line = document.createElement('div');
        line.className = 'section-line';
        meta.insertBefore(line, meta.firstChild);
        gsap.fromTo(line, 
            { scaleX: 0 },
            { 
                scaleX: 1, duration: 0.8, ease: 'power3.out', transformOrigin: 'left center',
                scrollTrigger: { trigger: meta, start: 'top 90%', once: true }
            }
        );
    });

    // ── 8. 3D Interactivity & Hover Effects ──────────────────────
    document.querySelectorAll('.card-3d-inner').forEach(card => {
        card.addEventListener('click', () => card.classList.toggle('flipped'));
    });

    document.querySelectorAll('.grid-card-3d, .step-box-3d').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const rotX = ((e.clientY - r.top  - r.height / 2) / r.height) * -8;
            const rotY = ((e.clientX - r.left - r.width  / 2) / r.width)  *  8;
            card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
        });
    });

    const simBox = document.querySelector('.sim-box-3d');
    if (simBox) {
        simBox.addEventListener('mousemove', e => {
            const r = simBox.getBoundingClientRect();
            const rotX = ((e.clientY - r.top  - r.height / 2) / r.height) * -4;
            const rotY = ((e.clientX - r.left - r.width  / 2) / r.width)  *  4;
            simBox.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        });
        simBox.addEventListener('mouseleave', () => {
            simBox.style.transform = 'perspective(1200px) rotateX(0) rotateY(0)';
        });
    }

    // ── 9. Simulator Engine ──────────────────────────────────────
    const simUrlInput  = document.getElementById('sim-url-input');
    const simTestBtn   = document.getElementById('sim-test-btn');
    const simResultBox = document.getElementById('sim-result-box');
    const simIcon      = document.getElementById('sim-icon');
    const simTitle     = document.getElementById('sim-title');
    const simDesc      = document.getElementById('sim-desc');
    const simReason    = document.getElementById('sim-reason');
    const simLock      = document.getElementById('sim-lock');

    function analyzeSimulatedUrl(urlStr) {
        let inputUrl = (urlStr || '').trim();
        if (!inputUrl) return;
        if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://'))
            inputUrl = 'https://' + inputUrl;
        try {
            const urlObj   = new URL(inputUrl);
            const hostname = urlObj.hostname.toLowerCase();
            const fullUrl  = (hostname + urlObj.pathname + urlObj.search).toLowerCase();
            let isBlocked = false, title = '', desc = '', reason = '';

            if (urlObj.protocol === 'http:') {
                isBlocked = true; title = 'Blocked — Unencrypted HTTP Protocol';
                desc   = 'HTTP cleartext exposes passwords and sessions to sniffing attacks.';
                reason = 'insecure_connection (Forced HTTPS Guard)';
            } else if (hostname.includes('micr0soft') || hostname.includes('paypa1')) {
                isBlocked = true; title = 'Blocked — Phishing & Typosquatting';
                desc   = 'Domain impersonates a trusted brand via character substitution.';
                reason = 'heuristics_typo (Brand Spoofing Engine)';
            } else if (['nsfw','adult','porn','xxx','gambling','casino'].some(kw => fullUrl.includes(kw))) {
                isBlocked = true; title = 'Blocked — Explicit / Vulgar Link';
                desc   = 'URL matched adult, vulgar, or gambling category signatures.';
                reason = 'vulgar_link (Keyword Classifier)';
            } else if (hostname.includes('youtube.com') && fullUrl.includes('bad-vulgar')) {
                isBlocked = true; title = 'Blocked — Inappropriate YouTube Video';
                desc   = 'MutationObserver detected explicit video metadata.';
                reason = 'youtube_content_filter (Shadow DOM Obscurer)';
            } else if (hostname.endsWith('.xyz') || hostname.includes('phishing')) {
                isBlocked = true; title = 'Blocked — High Risk Domain';
                desc   = 'Heuristics flagged suspicious TLD and harvesting signature.';
                reason = 'heuristics_TLD (Suspicious TLD Engine)';
            }

            gsap.to(simResultBox, {
                opacity: 0, scale: 0.95, duration: 0.16, ease: 'power2.in',
                onComplete: () => {
                    if (isBlocked) {
                        if (simLock)  simLock.textContent = '🔓';
                        simResultBox.className = 'sim-output-card blocked';
                        simIcon.textContent = '🚨'; simTitle.textContent = title;
                        simDesc.textContent = desc;
                        simReason.innerHTML = `LOG: <strong>${reason}</strong>`;
                    } else {
                        if (simLock)  simLock.textContent = '🔒';
                        simResultBox.className = 'sim-output-card safe';
                        simIcon.textContent = '🛡️';
                        simTitle.textContent = 'Clean — Site Verified Safe';
                        simDesc.textContent  = `${hostname} passed all 5 security modules.`;
                        simReason.innerHTML  = `LOG: <strong>PASSED (0ms · 100% Private)</strong>`;
                    }
                    gsap.to(simResultBox, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.4)' });
                }
            });
        } catch {
            if (!simResultBox) return;
            simResultBox.className = 'sim-output-card blocked';
            simIcon.textContent = '⚠️'; simTitle.textContent = 'Malformed URL';
            simDesc.textContent  = 'Enter a valid URL.';
            simReason.innerHTML  = `LOG: <strong>Invalid Format</strong>`;
        }
    }

    if (simTestBtn)  simTestBtn.addEventListener('click',  () => analyzeSimulatedUrl(simUrlInput?.value));
    if (simUrlInput) simUrlInput.addEventListener('keyup', e => { if (e.key === 'Enter') analyzeSimulatedUrl(simUrlInput.value); });
    document.querySelectorAll('.sim-preset-tag').forEach(btn => {
        btn.addEventListener('click', () => {
            if (simUrlInput) simUrlInput.value = btn.getAttribute('data-url');
            analyzeSimulatedUrl(btn.getAttribute('data-url'));
        });
    });
    if (simUrlInput?.value) analyzeSimulatedUrl(simUrlInput.value);

    // ── 10. FAQ Accordion ────────────────────────────────────────
    document.querySelectorAll('.faq-card').forEach(card => {
        card.querySelector('.faq-q')?.addEventListener('click', () => {
            const isActive = card.classList.contains('active');
            document.querySelectorAll('.faq-card').forEach(c => c.classList.remove('active'));
            if (!isActive) card.classList.add('active');
        });
    });

    // ── 11. Smooth Anchor Scroll ─────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    // ── 12. Refresh all triggers after DOM setup ─────────────────
    ScrollTrigger.refresh();
});
