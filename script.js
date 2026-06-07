// --- LINKCORE SITE CONTROLLER ---

document.addEventListener("DOMContentLoaded", () => {
    // 1. PAGE LOADER INITIALIZATION
    const loader = document.getElementById("loader-wrapper");
    if (loader) {
        window.addEventListener("load", () => {
            setTimeout(() => {
                loader.style.opacity = "0";
                loader.style.visibility = "hidden";
            }, 600);
        });
        // Fallback in case window load event already fired
        if (document.readyState === "complete") {
            setTimeout(() => {
                loader.style.opacity = "0";
                loader.style.visibility = "hidden";
            }, 600);
        }
    }

    // 2. STICKY NAVBAR & BACK-TO-TOP BUTTON
    const navbar = document.querySelector(".navbar");
    const backToTop = document.querySelector(".back-to-top");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("sticky");
        } else {
            navbar.classList.remove("sticky");
        }

        if (window.scrollY > 500) {
            backToTop.classList.add("show");
        } else {
            backToTop.classList.remove("show");
        }
    });

    // Back to top scroll click
    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // 3. MOBILE MENU TOGGLE
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                hamburger.classList.remove("active");
                navMenu.classList.remove("active");
            });
        });
    }

    // 4. DARK / LIGHT THEME TOGGLE
    const themeBtn = document.getElementById("theme-toggle");
    const body = document.body;

    // Check saved preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        body.classList.add("light-theme");
    }

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            body.classList.toggle("light-theme");
            const currentTheme = body.classList.contains("light-theme") ? "light" : "dark";
            localStorage.setItem("theme", currentTheme);
        });
    }

    // 5. 3D CANVAS NETWORK PARTICLE ANIMATION (HERO SECTION)
    initHeroNetworkCanvas();

    // 6. 3D CARD TILT EFFECT (MOUSEMOVE INTERACTION)
    init3dTiltEffect();

    // 7. SCROLL-BASED IN-VIEW ANIMATIONS
    initScrollAnimations();

    // 8. NUMERICAL INCREMENT COUNTERS
    initNumberCounters();

    // 9. TESTIMONIALS SLIDER
    initTestimonialSlider();

    // 10. PORTFOLIO FILTER & LIGHTBOX GALLERY
    initPortfolioAndLightbox();

    // 11. DYNAMIC AMC CALCULATOR (ON AMC SECTION/PAGE)
    initAmcCalculator();

    // 12. SERVICE REQUEST & JOB APPLICATION MODALS
    initModalsAndForms();

    // 13. FLOATING HERO PARTICLES & 3D ORB
    initFloatingParticles();
    // inject3dOrbs() — handled by Three.js scene now
});

/* ========================================================
   5. THREE.JS WEBGL HERO SCENE — Immersive 3D Network
   ======================================================== */
function initHeroNetworkCanvas() {
    const canvas = document.getElementById("threejs-canvas");
    if (!canvas || typeof THREE === 'undefined') return;

    // --- Scene setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 28);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- Color palette ---
    const PALETTE = [0x7c3aed, 0xa78bfa, 0x38bdf8, 0xe879f9, 0x6366f1];

    // --- Floating 3D nodes ---
    const NODE_COUNT = window.innerWidth < 768 ? 30 : 60;
    const nodes = [];
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const geoms = [
        new THREE.IcosahedronGeometry(0.18, 0),
        new THREE.OctahedronGeometry(0.22, 0),
        new THREE.TetrahedronGeometry(0.2, 0),
        new THREE.SphereGeometry(0.14, 8, 8),
    ];

    for (let i = 0; i < NODE_COUNT; i++) {
        const geom = geoms[Math.floor(Math.random() * geoms.length)];
        const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        const mat = new THREE.MeshPhongMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.75 + Math.random() * 0.25,
            wireframe: Math.random() < 0.35,
        });
        const mesh = new THREE.Mesh(geom, mat);

        const spread = 22;
        mesh.position.set(
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread * 0.7,
            (Math.random() - 0.5) * spread * 0.5
        );
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

        const speed = {
            x: (Math.random() - 0.5) * 0.004,
            y: (Math.random() - 0.5) * 0.004,
            z: (Math.random() - 0.5) * 0.003,
            rx: (Math.random() - 0.5) * 0.012,
            ry: (Math.random() - 0.5) * 0.012,
        };
        nodes.push({ mesh, speed, basePos: mesh.position.clone(), phase: Math.random() * Math.PI * 2 });
        nodeGroup.add(mesh);
    }

    // --- Connection lines between nearby nodes ---
    const linesMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.25 });
    let linesGeom = new THREE.BufferGeometry();
    const linesObj = new THREE.LineSegments(linesGeom, linesMat);
    scene.add(linesObj);

    function updateLines() {
        const positions = [];
        const colors = [];
        const CONNECT_DIST = 7;

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const d = nodes[i].mesh.position.distanceTo(nodes[j].mesh.position);
                if (d < CONNECT_DIST) {
                    const alpha = 1 - d / CONNECT_DIST;
                    const c1 = new THREE.Color(nodes[i].mesh.material.color);
                    const c2 = new THREE.Color(nodes[j].mesh.material.color);
                    positions.push(...nodes[i].mesh.position.toArray(), ...nodes[j].mesh.position.toArray());
                    colors.push(c1.r * alpha, c1.g * alpha, c1.b * alpha, c2.r * alpha, c2.g * alpha, c2.b * alpha);
                }
            }
        }

        linesGeom.dispose();
        linesGeom = new THREE.BufferGeometry();
        linesGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        linesGeom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        linesObj.geometry = linesGeom;
    }

    // --- Large background wireframe sphere ---
    const bgSphere = new THREE.Mesh(
        new THREE.IcosahedronGeometry(18, 2),
        new THREE.MeshBasicMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.04 })
    );
    scene.add(bgSphere);

    // --- Central glowing core ---
    const coreMat = new THREE.MeshPhongMaterial({
        color: 0xa78bfa, emissive: 0x7c3aed, emissiveIntensity: 1,
        transparent: true, opacity: 0.9, wireframe: false
    });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), coreMat);
    scene.add(core);

    // Core glow rings
    const ringColors = [0x7c3aed, 0x38bdf8, 0xe879f9];
    const rings = ringColors.map((c, i) => {
        const r = new THREE.Mesh(
            new THREE.TorusGeometry(2.2 + i * 0.9, 0.025, 8, 80),
            new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.5 - i * 0.1 })
        );
        r.rotation.x = Math.PI / 2 + i * 0.5;
        scene.add(r);
        return r;
    });

    // --- Lights ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const pLight1 = new THREE.PointLight(0x7c3aed, 2, 40);
    pLight1.position.set(5, 5, 5);
    scene.add(pLight1);
    const pLight2 = new THREE.PointLight(0x38bdf8, 1.5, 40);
    pLight2.position.set(-5, -5, 5);
    scene.add(pLight2);
    const pLight3 = new THREE.PointLight(0xe879f9, 1, 30);
    pLight3.position.set(0, 8, -5);
    scene.add(pLight3);

    // --- Mouse parallax ---
    const mouse = { x: 0, y: 0 };
    const targetRot = { x: 0, y: 0 };
    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // --- Scroll-based camera zoom ---
    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; });

    // --- Animation loop ---
    let frame = 0;
    function animate() {
        requestAnimationFrame(animate);
        frame++;

        const t = frame * 0.01;

        // Smooth mouse parallax on scene
        targetRot.x += (mouse.y * 0.15 - targetRot.x) * 0.05;
        targetRot.y += (mouse.x * 0.25 - targetRot.y) * 0.05;
        nodeGroup.rotation.x = targetRot.x;
        nodeGroup.rotation.y = targetRot.y;

        // Camera scroll parallax
        camera.position.z = 28 + scrollY * 0.015;
        camera.position.y = -scrollY * 0.005;

        // Animate nodes
        nodes.forEach((n, i) => {
            n.mesh.rotation.x += n.speed.rx;
            n.mesh.rotation.y += n.speed.ry;
            n.mesh.position.x = n.basePos.x + Math.sin(t + n.phase) * 0.8;
            n.mesh.position.y = n.basePos.y + Math.cos(t * 0.7 + n.phase) * 0.6;
            n.mesh.position.z = n.basePos.z + Math.sin(t * 0.5 + n.phase) * 0.4;
        });

        // Update connection lines every 3 frames for perf
        if (frame % 3 === 0) updateLines();

        // Rotate background sphere slowly
        bgSphere.rotation.y += 0.0008;
        bgSphere.rotation.x += 0.0003;

        // Pulse core
        const pulse = 1 + Math.sin(t * 2) * 0.08;
        core.scale.setScalar(pulse);
        core.rotation.y += 0.008;
        core.rotation.x += 0.005;
        coreMat.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.4;

        // Spin rings
        rings[0].rotation.z += 0.006;
        rings[1].rotation.x += 0.004;
        rings[2].rotation.y += 0.005;

        // Pulse lights
        pLight1.intensity = 2 + Math.sin(t * 2.5) * 0.8;
        pLight2.intensity = 1.5 + Math.cos(t * 2) * 0.6;

        renderer.render(scene, camera);
    }
    animate();
}

/* ========================================================
   6. 3D CARD TILT EFFECT — HOLOGRAPHIC SPECULAR GLOW
   ======================================================== */
function init3dTiltEffect() {
    const cards = document.querySelectorAll(".glass-card");

    cards.forEach(card => {
        // Shimmer overlay
        const shimmer = document.createElement("div");
        shimmer.style.cssText = `
            position:absolute; inset:0; border-radius:inherit;
            pointer-events:none; opacity:0; transition:opacity 0.3s ease;
            z-index:1;
        `;
        card.style.position = "relative";
        card.appendChild(shimmer);

        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;

            const maxTilt = 14;
            const rotateX = ((cy - y) / cy) * maxTilt;
            const rotateY = ((x - cx) / cx) * maxTilt;

            card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`;

            const gx = (x / rect.width) * 100;
            const gy = (y / rect.height) * 100;
            shimmer.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(167,139,250,0.22) 0%, rgba(56,189,248,0.1) 40%, transparent 70%)`;
            shimmer.style.opacity = "1";

            card.style.borderColor = `rgba(167,139,250,0.6)`;
            card.style.boxShadow = `
                0 20px 60px rgba(0,0,0,0.6),
                0 0 30px rgba(124,58,237,0.4),
                0 0 60px rgba(56,189,248,0.15),
                inset 0 1px 0 rgba(167,139,250,0.3)
            `;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
            card.style.transition = "all 0.5s cubic-bezier(0.25,0.8,0.25,1)";
            card.style.borderColor = "";
            card.style.boxShadow = "";
            shimmer.style.opacity = "0";
        });

        card.addEventListener("mouseenter", () => {
            card.style.transition = "transform 0.08s ease, box-shadow 0.2s ease, border-color 0.2s ease";
        });
    });
}

/* ========================================================
   7. GSAP SCROLL ANIMATIONS + HERO ENTRANCE
   ======================================================== */
function initScrollAnimations() {
    // --- Hero entrance (GSAP timeline) ---
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const heroTl = gsap.timeline({ delay: 0.4 });
        heroTl
            .to("#hero-eyebrow",    { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" })
            .to("#htl-1",           { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.3")
            .to("#htl-2",           { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.4")
            .to("#htl-3",           { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.4")
            .to("#hero-desc",       { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3")
            .to("#hero-btns",       { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3");

        // --- Section scroll reveals ---
        // Batch fade-in for cards/grid items
        ScrollTrigger.batch(".fade-in:not(.appear)", {
            onEnter: batch => gsap.to(batch, {
                opacity: 1, y: 0, scale: 1,
                duration: 0.7, stagger: 0.1, ease: "power3.out",
                onComplete: () => batch.forEach(el => el.classList.add("appear"))
            }),
            start: "top 88%",
        });

        // Section headers — slide up
        document.querySelectorAll(".section-header").forEach(el => {
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: "top 85%", once: true },
                opacity: 0, y: 40, duration: 0.8, ease: "power3.out"
            });
        });

        // About grid — split left/right
        const aboutLeft = document.querySelector(".about-grid > *:first-child");
        const aboutRight = document.querySelector(".about-grid > *:last-child");
        if (aboutLeft) gsap.from(aboutLeft, { scrollTrigger: { trigger: aboutLeft, start: "top 80%", once: true }, opacity: 0, x: -60, duration: 0.9, ease: "power3.out" });
        if (aboutRight) gsap.from(aboutRight, { scrollTrigger: { trigger: aboutRight, start: "top 80%", once: true }, opacity: 0, x: 60, duration: 0.9, ease: "power3.out" });

        // Counter boxes — scale in
        document.querySelectorAll(".counter-box").forEach((el, i) => {
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: "top 85%", once: true },
                opacity: 0, scale: 0.8, y: 30,
                duration: 0.6, delay: i * 0.1, ease: "back.out(1.4)"
            });
        });

        // Service cards — stagger up
        gsap.from(".service-card", {
            scrollTrigger: { trigger: ".services-grid", start: "top 80%", once: true },
            opacity: 0, y: 50, duration: 0.6, stagger: 0.1, ease: "power3.out"
        });

        // Portfolio items — stagger scale
        gsap.from(".portfolio-item", {
            scrollTrigger: { trigger: ".portfolio-grid", start: "top 80%", once: true },
            opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.12, ease: "power2.out"
        });

        // Industry cards — stagger
        gsap.from(".industry-card", {
            scrollTrigger: { trigger: ".industries-grid", start: "top 80%", once: true },
            opacity: 0, y: 30, duration: 0.5, stagger: 0.08, ease: "power2.out"
        });

        // Navbar parallax tint on scroll
        ScrollTrigger.create({
            start: "top -80",
            onUpdate: self => {
                const nav = document.querySelector(".navbar");
                if (nav) nav.classList.toggle("sticky", self.progress > 0);
            }
        });

    } else {
        // Fallback: IntersectionObserver if GSAP not loaded
        const obs = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("appear");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
        document.querySelectorAll(".fade-in").forEach(el => obs.observe(el));
    }
}

/* ========================================================
   8. NUMERICAL INCREMENT COUNTERS
   ======================================================== */
function initNumberCounters() {
    const counterVals = document.querySelectorAll(".counter-val");
    if (counterVals.length === 0) return;

    const observerOptions = {
        threshold: 0.5
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetVal = parseInt(entry.target.getAttribute("data-target"));
                let currentVal = 0;
                const duration = 2000; // 2 seconds animation time
                const increment = targetVal / (duration / 16); // ~60fps
                
                const updateCounter = () => {
                    currentVal += increment;
                    if (currentVal >= targetVal) {
                        entry.target.textContent = targetVal + (entry.target.getAttribute("data-suffix") || "");
                    } else {
                        entry.target.textContent = Math.floor(currentVal) + (entry.target.getAttribute("data-suffix") || "");
                        requestAnimationFrame(updateCounter);
                    }
                };
                
                requestAnimationFrame(updateCounter);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counterVals.forEach(val => counterObserver.observe(val));
}

/* ========================================================
   9. TESTIMONIALS SLIDER
   ======================================================== */
function initTestimonialSlider() {
    const slider = document.querySelector(".testimonials-slider");
    const slides = document.querySelectorAll(".testimonial-slide");
    const dotsContainer = document.querySelector(".slider-dots");
    
    if (!slider || slides.length === 0) return;

    let currentIndex = 0;
    let slideInterval;

    // Generate pagination dots dynamically
    slides.forEach((_, idx) => {
        const dot = document.createElement("div");
        dot.classList.add("slider-dot");
        if (idx === 0) dot.classList.add("active");
        dot.addEventListener("click", () => goToSlide(idx));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll(".slider-dot");

    function updateDots() {
        dots.forEach((dot, idx) => {
            if (idx === currentIndex) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }

    function goToSlide(idx) {
        currentIndex = idx;
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        updateDots();
        resetTimer();
    }

    function autoPlay() {
        currentIndex = (currentIndex + 1) % slides.length;
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        updateDots();
    }

    function resetTimer() {
        clearInterval(slideInterval);
        slideInterval = setInterval(autoPlay, 5000);
    }

    resetTimer();
}

/* ========================================================
   10. PORTFOLIO FILTER & LIGHTBOX GALLERY
   ======================================================== */
function initPortfolioAndLightbox() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const portfolioItems = document.querySelectorAll(".portfolio-item");
    const lightbox = document.getElementById("portfolio-lightbox");
    
    if (portfolioItems.length === 0) return;

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Toggle active class
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filterValue = btn.getAttribute("data-filter");

            portfolioItems.forEach(item => {
                if (filterValue === "all" || item.getAttribute("data-category") === filterValue) {
                    item.style.display = "block";
                    setTimeout(() => item.style.opacity = "1", 50);
                } else {
                    item.style.opacity = "0";
                    setTimeout(() => item.style.display = "none", 300);
                }
            });
        });
    });

    // Lightbox Functionality
    const zoomBtns = document.querySelectorAll(".portfolio-zoom-btn");
    const closeBtn = document.querySelector(".lightbox-close");
    const lightboxImage = document.querySelector(".lightbox-img-area");
    const lightboxCat = document.querySelector(".lightbox-info-cat");
    const lightboxTitle = document.querySelector(".lightbox-info-title");
    const lightboxDesc = document.querySelector(".lightbox-info-desc");
    const lightboxTags = document.querySelector(".lightbox-info-tags");

    if (lightbox) {
        zoomBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation(); // Avoid triggering card events
                const item = btn.closest(".portfolio-item");
                const cat = item.querySelector(".portfolio-cat").textContent;
                const title = item.querySelector(".portfolio-title").textContent;
                const desc = item.getAttribute("data-full-desc") || item.querySelector(".portfolio-desc").textContent;
                const tagsStr = item.getAttribute("data-tags") || "";
                const svgContent = item.querySelector(".portfolio-svg-placeholder").outerHTML;

                // Load content
                lightboxCat.textContent = cat;
                lightboxTitle.textContent = title;
                lightboxDesc.textContent = desc;
                lightboxImage.innerHTML = svgContent;
                
                // Add tag labels
                lightboxTags.innerHTML = "";
                if (tagsStr) {
                    tagsStr.split(",").forEach(tag => {
                        const span = document.createElement("span");
                        span.classList.add("lightbox-tag");
                        span.textContent = tag.trim();
                        lightboxTags.appendChild(span);
                    });
                }

                // Show Lightbox
                lightbox.style.display = "flex";
                document.body.style.overflow = "hidden"; // Lock scroll
            });
        });

        const closeLightbox = () => {
            lightbox.style.display = "none";
            document.body.style.overflow = ""; // Re-enable scroll
        };

        if (closeBtn) {
            closeBtn.addEventListener("click", closeLightbox);
        }

        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
}

/* ========================================================
   11. DYNAMIC AMC CALCULATOR (ESTIMATOR)
   ======================================================== */
function initAmcCalculator() {
    const pcSlider = document.getElementById("calc-pc");
    const serverSlider = document.getElementById("calc-server");
    const cctvSlider = document.getElementById("calc-cctv");

    if (!pcSlider || !serverSlider || !cctvSlider) return;

    const pcVal = document.getElementById("calc-pc-val");
    const serverVal = document.getElementById("calc-server-val");
    const cctvVal = document.getElementById("calc-cctv-val");
    const totalPrice = document.getElementById("calc-total-price");

    // Dynamic cost parameters
    const PC_PRICE = 15;
    const SERVER_PRICE = 75;
    const CCTV_PRICE = 10;

    function calculateEstimate() {
        const pcCount = parseInt(pcSlider.value);
        const serverCount = parseInt(serverSlider.value);
        const cctvCount = parseInt(cctvSlider.value);

        pcVal.textContent = pcCount;
        serverVal.textContent = serverCount;
        cctvVal.textContent = cctvCount;

        // Base total
        let subtotal = (pcCount * PC_PRICE) + (serverCount * SERVER_PRICE) + (cctvCount * CCTV_PRICE);

        // Volumetric discounts
        let discount = 0;
        const totalNodes = pcCount + serverCount + cctvCount;
        if (totalNodes > 50) discount = 0.20; // 20% off large assets
        else if (totalNodes > 20) discount = 0.10; // 10% off mid assets

        const total = Math.round(subtotal * (1 - discount));
        totalPrice.textContent = total;
    }

    pcSlider.addEventListener("input", calculateEstimate);
    serverSlider.addEventListener("input", calculateEstimate);
    cctvSlider.addEventListener("input", calculateEstimate);

    // Initial run
    calculateEstimate();
}

/* ========================================================
   12. SERVICE REQUEST & JOB APPLICATION MODALS (API CONNECTED)
   ======================================================== */
function initModalsAndForms() {
    // Service Request Modal & Applied Openings Trigger
    const modalOverlay = document.getElementById("career-modal");
    const careerForm = document.getElementById("career-application-form");
    const applyBtns = document.querySelectorAll(".apply-btn");
    const modalClose = document.querySelector(".modal-close");
    const jobTitleInput = document.getElementById("applied-job-title");

    if (modalOverlay) {
        applyBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const card = btn.closest(".job-card");
                const jobTitle = card.querySelector("h3").textContent;
                if (jobTitleInput) {
                    jobTitleInput.value = jobTitle;
                }
                modalOverlay.style.display = "flex";
                document.body.style.overflow = "hidden";
            });
        });

        const closeModal = () => {
            modalOverlay.style.display = "none";
            document.body.style.overflow = "";
            if (careerForm) careerForm.reset();
        };

        if (modalClose) {
            modalClose.addEventListener("click", closeModal);
        }

        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        // Careers application submit with resume upload (FormData payload)
        if (careerForm) {
            careerForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const submitBtn = careerForm.querySelector('button[type="submit"]');
                const origText = submitBtn.textContent;
                
                submitBtn.disabled = true;
                submitBtn.textContent = "Uploading Profile & Resume...";

                const formData = new FormData();
                formData.append("jobTitle", jobTitleInput ? jobTitleInput.value : "Unknown Position");
                formData.append("name", document.getElementById("apply-name").value);
                formData.append("email", document.getElementById("apply-email").value);
                formData.append("phone", document.getElementById("apply-phone").value);
                formData.append("certifications", document.getElementById("apply-certifications").value);
                formData.append("summary", document.getElementById("apply-message").value);
                
                const fileInput = document.getElementById("apply-resume");
                if (fileInput && fileInput.files[0]) {
                    formData.append("resume", fileInput.files[0]);
                }

                fetch('/api/careers/apply', {
                    method: 'POST',
                    body: formData
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert("Thank you! Your profile and resume have been successfully uploaded to the Linkcore database. Our HR team will review details shortly.");
                        closeModal();
                    } else {
                        alert("Application error: " + data.error);
                    }
                })
                .catch(err => {
                    console.error("Career post error:", err);
                    alert("A network connection error occurred while submitting your resume.");
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = origText;
                });
            });
        }
    }

    // Direct WhatsApp Floating Redirection Builder
    const waBtn = document.querySelector(".whatsapp-btn");
    if (waBtn) {
        waBtn.addEventListener("click", () => {
            const phoneNumber = "919999999999"; 
            const message = encodeURIComponent("Hello Linkcore! I visited your website and would like to get a quote/consultation on IT Services & Security Setup.");
            window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
        });
    }

    // Contact Form submission (JSON payload)
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const origText = submitBtn.textContent;
            
            submitBtn.disabled = true;
            submitBtn.textContent = "Sending Message...";

            const payload = {
                name: document.getElementById("contact-name").value,
                email: document.getElementById("contact-email").value,
                phone: document.getElementById("contact-phone").value,
                interest: document.getElementById("contact-interest").value,
                message: document.getElementById("contact-message").value
            };

            fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("Thank you for contacting Linkcore! We have received your inquiry and a systems specialist will email or call you within 2 business hours.");
                    contactForm.reset();
                } else {
                    alert("Submission error: " + data.error);
                }
            })
            .catch(err => {
                console.error("Contact post error:", err);
                alert("Network error: Failed to submit inquiry.");
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = origText;
            });
        });
    }

    // AMC Request Proposal Form submission (JSON payload)
    const proposalForm = document.getElementById("amc-proposal-form");
    if (proposalForm) {
        proposalForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const submitBtn = proposalForm.querySelector('button[type="submit"]');
            const origText = submitBtn.textContent;
            
            submitBtn.disabled = true;
            submitBtn.textContent = "Submitting AMC Request...";

            // Retrieve current nodes slider values if present
            const pcSlider = document.getElementById("calc-pc");
            const serverSlider = document.getElementById("calc-server");
            const cctvSlider = document.getElementById("calc-cctv");

            const payload = {
                name: document.getElementById("amc-name").value,
                email: document.getElementById("amc-email").value,
                phone: document.getElementById("amc-phone").value,
                plan: document.getElementById("amc-target-plan").value,
                pcs: pcSlider ? pcSlider.value : 0,
                servers: serverSlider ? serverSlider.value : 0,
                cctvs: cctvSlider ? cctvSlider.value : 0,
                details: document.getElementById("amc-message").value
            };

            fetch('/api/amc-proposal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert(`AMC request submitted successfully! Customized estimate rate calculated: ₹${data.estimatedCost}/month. We will send the comprehensive SLA draft to your email.`);
                    proposalForm.reset();
                } else {
                    alert("AMC request error: " + data.error);
                }
            })
            .catch(err => {
                console.error("AMC post error:", err);
                alert("A network connection error occurred while submitting the AMC request.");
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = origText;
            });
        });
    }

    // Services Catalog Consultation Form (JSON payload)
    const servicesForm = document.getElementById("services-request-form");
    if (servicesForm) {
        servicesForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const submitBtn = servicesForm.querySelector('button[type="submit"]');
            const origText = submitBtn.textContent;

            submitBtn.disabled = true;
            submitBtn.textContent = "Calculating Estimate...";

            const payload = {
                name: document.getElementById("srv-req-name").value,
                email: document.getElementById("srv-req-email").value,
                phone: document.getElementById("srv-req-phone").value,
                service: document.getElementById("srv-req-select").value,
                details: document.getElementById("srv-req-message").value
            };

            fetch('/api/service-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("Thank you! Your custom services request has been recorded. A solutions architect will reach out with details.");
                    servicesForm.reset();
                } else {
                    alert("Service request error: " + data.error);
                }
            })
            .catch(err => {
                console.error("Service request post error:", err);
                alert("Network error: Failed to submit services booking.");
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = origText;
            });
        });
    }

    // Footer Newsletter Form submission (JSON payload)
    const newsForm = document.getElementById("newsletter-form");
    if (newsForm) {
        newsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const input = newsForm.querySelector('input[type="email"]');
            
            fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: input.value })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("Thank you for subscribing to Linkcore CyberNews!");
                    newsForm.reset();
                } else {
                    alert("Newsletter error: " + data.error);
                }
            })
            .catch(err => console.error("Newsletter post error:", err));
        });
    }
}

/* ========================================================
   13. FLOATING HERO PARTICLES (CSS-driven, JS-spawned)
   ======================================================== */
function initFloatingParticles() {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const COLORS = ["rgba(124,58,237,", "rgba(167,139,250,", "rgba(56,189,248,", "rgba(232,121,249,"];
    const COUNT = window.innerWidth < 768 ? 10 : 20;

    for (let i = 0; i < COUNT; i++) {
        const p = document.createElement("div");
        p.className = "hero-particle";
        const size = Math.random() * 4 + 2;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const left = Math.random() * 100;
        const duration = 8 + Math.random() * 12;
        const delay = Math.random() * 10;
        const opacity = 0.3 + Math.random() * 0.5;

        p.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            bottom: -10px;
            background: ${color}${opacity});
            box-shadow: 0 0 ${size * 3}px ${color}0.6);
            animation-duration: ${duration}s;
            animation-delay: -${delay}s;
        `;
        hero.appendChild(p);
    }
}

/* ========================================================
   14. INJECT 3D NETWORK ORBS INTO SECTIONS
   ======================================================== */
function inject3dOrbs() {
    // Add a 3D orb to the about preview section
    const aboutSection = document.getElementById("about-preview");
    if (aboutSection) {
        aboutSection.style.position = "relative";
        aboutSection.style.overflow = "hidden";
        const orb = buildOrb();
        orb.style.cssText += "right:-60px; top:50%; transform:translateY(-50%); opacity:0.6;";
        aboutSection.appendChild(orb);
    }

    // Add a smaller orb to the industries section
    const indSection = document.getElementById("industries-section");
    if (indSection) {
        indSection.style.position = "relative";
        indSection.style.overflow = "hidden";
        const orb2 = buildOrb("180px");
        orb2.style.cssText += "left:-40px; top:20%; opacity:0.4;";
        indSection.appendChild(orb2);
    }
}

function buildOrb(size = "260px") {
    const wrapper = document.createElement("div");
    wrapper.className = "net-orb-wrapper";
    wrapper.style.width = size;
    wrapper.style.height = size;
    wrapper.style.position = "absolute";
    wrapper.style.pointerEvents = "none";
    wrapper.style.zIndex = "0";

    wrapper.innerHTML = `
        <div class="net-orb">
            <div class="orb-ring orb-ring-1"></div>
            <div class="orb-ring orb-ring-2"></div>
            <div class="orb-ring orb-ring-3"></div>
            <div class="orb-core"></div>
        </div>
    `;
    return wrapper;
}
