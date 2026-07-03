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

    // 6.5. 3D IMAGE SHOWCASE INTERACTION
    init3dImageGallery();

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

    // 14. PRODUCT CARD 3D TILT
    initProductCardTilt();
});

/* ========================================================
   5. THREE.JS CINEMATIC CCTV CAMERA HERO SCENE
   Cameras fly in from deep space, orbit, shoot scan beams,
   tunnel through lens, and perform dramatic flybys.
   ======================================================== */
function initHeroNetworkCanvas() {
    const canvas = document.getElementById("threejs-canvas");
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camFOV = 65;
    const threeCamera = new THREE.PerspectiveCamera(camFOV, window.innerWidth / window.innerHeight, 0.1, 2000);
    threeCamera.position.set(0, 0, 22);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;

    window.addEventListener('resize', () => {
        threeCamera.aspect = window.innerWidth / window.innerHeight;
        threeCamera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ── LIGHTS ──────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x001a00, 1.2));
    const keyLight = new THREE.PointLight(0x00ff41, 4, 60);
    keyLight.position.set(8, 8, 10);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0x39ff14, 2, 50);
    fillLight.position.set(-8, -5, 8);
    scene.add(fillLight);
    const rimLight = new THREE.SpotLight(0x00cc33, 5, 80, Math.PI / 6);
    rimLight.position.set(0, 15, -10);
    scene.add(rimLight);

    // ── BACKGROUND GRID (ground plane extending into depth) ─
    const gridHelper = new THREE.GridHelper(200, 40, 0x00ff41, 0x003311);
    gridHelper.position.y = -12;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.25;
    scene.add(gridHelper);

    // ── BACKGROUND WIREFRAME DOME ────────────────────────────
    const dome = new THREE.Mesh(
        new THREE.IcosahedronGeometry(30, 2),
        new THREE.MeshBasicMaterial({ color: 0x00ff41, wireframe: true, transparent: true, opacity: 0.025 })
    );
    scene.add(dome);

    // ── FLOATING PARTICLE STARS ──────────────────────────────
    const starGeo = new THREE.BufferGeometry();
    const starCount = 800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 200;
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x00ff41, size: 0.08, transparent: true, opacity: 0.5 }));
    scene.add(stars);

    // ── BUILD A 3D CCTV BULLET CAMERA ────────────────────────
    function buildBulletCamera(scale = 1, color = 0x1a1a1a) {
        const group = new THREE.Group();

        // Main body
        const bodyGeo = new THREE.CylinderGeometry(0.35 * scale, 0.28 * scale, 1.4 * scale, 16);
        const bodyMat = new THREE.MeshPhongMaterial({ color, specular: 0x00ff41, shininess: 80 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.z = Math.PI / 2;
        group.add(body);

        // Lens housing
        const houseGeo = new THREE.CylinderGeometry(0.28 * scale, 0.32 * scale, 0.4 * scale, 16);
        const house = new THREE.Mesh(houseGeo, new THREE.MeshPhongMaterial({ color: 0x111111, specular: 0x00ff41, shininess: 120 }));
        house.rotation.z = Math.PI / 2;
        house.position.x = 0.9 * scale;
        group.add(house);

        // Lens glass — glowing green circle
        const lensGeo = new THREE.CircleGeometry(0.22 * scale, 32);
        const lensMat = new THREE.MeshBasicMaterial({ color: 0x00ff41, transparent: true, opacity: 0.9 });
        const lens = new THREE.Mesh(lensGeo, lensMat);
        lens.position.x = 1.12 * scale;
        lens.rotation.y = -Math.PI / 2;
        group.add(lens);

        // Lens inner dark
        const innerGeo = new THREE.CircleGeometry(0.12 * scale, 32);
        const inner = new THREE.Mesh(innerGeo, new THREE.MeshBasicMaterial({ color: 0x001100 }));
        inner.position.x = 1.13 * scale;
        inner.rotation.y = -Math.PI / 2;
        group.add(inner);

        // IR LED ring dots
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const led = new THREE.Mesh(
                new THREE.SphereGeometry(0.04 * scale, 6, 6),
                new THREE.MeshBasicMaterial({ color: 0x00ff41 })
            );
            led.position.set(1.1 * scale, Math.sin(angle) * 0.2 * scale, Math.cos(angle) * 0.2 * scale);
            group.add(led);
        }

        // Mount bracket
        const mountGeo = new THREE.BoxGeometry(0.15 * scale, 0.6 * scale, 0.5 * scale);
        const mount = new THREE.Mesh(mountGeo, new THREE.MeshPhongMaterial({ color: 0x222222 }));
        mount.position.set(0, -0.55 * scale, 0);
        group.add(mount);

        return group;
    }

    // ── BUILD A 3D DOME CAMERA ────────────────────────────────
    function buildDomeCamera(scale = 1) {
        const group = new THREE.Group();

        // Dome shell
        const domeGeo = new THREE.SphereGeometry(0.55 * scale, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshPhongMaterial({ color: 0x0d0d0d, specular: 0x00ff41, shininess: 100, side: THREE.DoubleSide });
        group.add(new THREE.Mesh(domeGeo, domeMat));

        // Base plate
        const baseGeo = new THREE.CylinderGeometry(0.58 * scale, 0.6 * scale, 0.1 * scale, 24);
        group.add(new THREE.Mesh(baseGeo, new THREE.MeshPhongMaterial({ color: 0x1a1a1a })));

        // Inner lens glow
        const lg = new THREE.Mesh(new THREE.SphereGeometry(0.2 * scale, 16, 16), new THREE.MeshBasicMaterial({ color: 0x00ff41, transparent: true, opacity: 0.8 }));
        lg.position.y = -0.15 * scale;
        group.add(lg);

        return group;
    }

    // ── SCAN BEAM (sweeping laser line from lens) ─────────────
    function createScanBeam() {
        const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(18, 0, 0)];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color: 0x00ff41, transparent: true, opacity: 0.6 });
        return new THREE.Line(geo, mat);
    }

    // ── LENS TUNNEL RINGS (fly-through effect) ────────────────
    function createTunnelRings(count = 30) {
        const group = new THREE.Group();
        for (let i = 0; i < count; i++) {
            const r = new THREE.Mesh(
                new THREE.TorusGeometry(0.8 + i * 0.25, 0.018, 8, 60),
                new THREE.MeshBasicMaterial({ color: 0x00ff41, transparent: true, opacity: Math.max(0.02, 0.35 - i * 0.012) })
            );
            r.position.z = -i * 1.2;
            group.add(r);
        }
        return group;
    }

    // ── SPAWN CAMERAS ─────────────────────────────────────────
    const NUM_CAMS = window.innerWidth < 768 ? 3 : 6;
    const camObjects = [];

    for (let i = 0; i < NUM_CAMS; i++) {
        const isDome = i % 2 === 0;
        const scale = 0.8 + Math.random() * 0.6;
        const mesh = isDome ? buildDomeCamera(scale) : buildBulletCamera(scale);

        // Each camera gets a scan beam
        const beam = createScanBeam();
        beam.visible = false;
        mesh.add(beam);

        // Random orbit parameters
        const orbitR   = 5 + Math.random() * 9;
        const orbitSpeed = 0.003 + Math.random() * 0.004;
        const orbitTilt = (Math.random() - 0.5) * 1.2;
        const phaseOff  = (i / NUM_CAMS) * Math.PI * 2;
        const flyDepth  = -60 - Math.random() * 80; // start far back

        // State machine: 'flying-in' | 'orbiting' | 'flying-out' | 'tunnel'
        const obj = {
            mesh, beam, isDome, scale,
            orbitR, orbitSpeed, orbitTilt, phaseOff,
            state: 'flying-in',
            stateTimer: 0,
            flyDepth,
            flyTarget: new THREE.Vector3(
                (Math.random() - 0.5) * 16,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 4
            ),
            flyDelay: i * 90,  // stagger entry
            orbitAngle: phaseOff,
            beamPulse: 0,
        };

        mesh.position.set(0, 0, flyDepth);
        scene.add(mesh);
        camObjects.push(obj);
    }

    // ── LENS TUNNEL (triggered periodically) ─────────────────
    const tunnel = createTunnelRings(30);
    tunnel.visible = false;
    tunnel.position.set(0, 0, 0);
    scene.add(tunnel);
    let tunnelActive = false;
    let tunnelTimer = 0;
    const TUNNEL_INTERVAL = 380; // frames between tunnel events

    // ── GLITCH FLASH PLANE ────────────────────────────────────
    const flashPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 40),
        new THREE.MeshBasicMaterial({ color: 0x00ff41, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    flashPlane.position.z = 5;
    scene.add(flashPlane);

    // ── MOUSE PARALLAX ────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', e => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; });

    // ── ANIMATION LOOP ────────────────────────────────────────
    let frame = 0;
    const targetCamRot = { x: 0, y: 0 };

    function animate() {
        requestAnimationFrame(animate);
        frame++;
        const t = frame * 0.01;

        // Slow camera parallax from mouse
        targetCamRot.x += (mouse.y * 0.08 - targetCamRot.x) * 0.04;
        targetCamRot.y += (mouse.x * 0.12 - targetCamRot.y) * 0.04;
        threeCamera.rotation.x = targetCamRot.x;
        threeCamera.rotation.y = targetCamRot.y;
        threeCamera.position.z = 22 + scrollY * 0.01;

        // Rotate background
        dome.rotation.y += 0.0005;
        stars.rotation.y += 0.0003;
        keyLight.intensity = 3.5 + Math.sin(t * 2) * 0.8;

        // Grid drift
        gridHelper.position.z = (frame * 0.04) % 5;

        // ── Per-camera logic ──────────────────────────────────
        camObjects.forEach(obj => {
            const { mesh, beam } = obj;

            if (frame < obj.flyDelay) return; // stagger

            obj.stateTimer++;

            if (obj.state === 'flying-in') {
                // Rush toward scene from far z
                mesh.position.z += (obj.flyTarget.z - mesh.position.z) * 0.025;
                mesh.position.x += (obj.flyTarget.x - mesh.position.x) * 0.025;
                mesh.position.y += (obj.flyTarget.y - mesh.position.y) * 0.025;
                mesh.rotation.y += 0.06;

                if (obj.stateTimer > 140) {
                    obj.state = 'orbiting';
                    obj.stateTimer = 0;
                    beam.visible = true;
                }
            }

            else if (obj.state === 'orbiting') {
                obj.orbitAngle += obj.orbitSpeed;
                mesh.position.x = Math.cos(obj.orbitAngle) * obj.orbitR;
                mesh.position.y = Math.sin(obj.orbitAngle * 0.7) * obj.orbitR * 0.4 + obj.orbitTilt * 2;
                mesh.position.z = Math.sin(obj.orbitAngle) * obj.orbitR * 0.5;

                // Always face orbit center (look at origin)
                mesh.lookAt(0, 0, 0);

                // Scan beam pulse
                obj.beamPulse += 0.05;
                beam.material.opacity = 0.3 + Math.sin(obj.beamPulse) * 0.3;
                beam.rotation.z += 0.02;

                // Fly out after a while
                const orbitDuration = 320 + Math.random() * 200;
                if (obj.stateTimer > orbitDuration) {
                    obj.state = 'flying-out';
                    obj.stateTimer = 0;
                    beam.visible = false;
                    // Pick new exit direction — sometimes fly INTO camera (tunnel trigger)
                    if (Math.random() < 0.3) {
                        obj.exitTarget = new THREE.Vector3(0, 0, 80); // fly toward viewer
                        obj.triggerTunnel = true;
                    } else {
                        obj.exitTarget = new THREE.Vector3(
                            (Math.random() - 0.5) * 60,
                            (Math.random() - 0.5) * 40,
                            -100
                        );
                        obj.triggerTunnel = false;
                    }
                }
            }

            else if (obj.state === 'flying-out') {
                mesh.position.x += (obj.exitTarget.x - mesh.position.x) * 0.04;
                mesh.position.y += (obj.exitTarget.y - mesh.position.y) * 0.04;
                mesh.position.z += (obj.exitTarget.z - mesh.position.z) * 0.04;
                mesh.rotation.y += 0.08;

                // Trigger lens tunnel when flying at viewer
                if (obj.triggerTunnel && !tunnelActive && mesh.position.z > 15) {
                    tunnelActive = true;
                    tunnelTimer = 0;
                    tunnel.visible = true;
                    tunnel.position.set(0, 0, 12);
                    obj.triggerTunnel = false;
                }

                if (obj.stateTimer > 100) {
                    // Reset — fly in again from far
                    obj.state = 'flying-in';
                    obj.stateTimer = 0;
                    mesh.position.set(
                        (Math.random() - 0.5) * 40,
                        (Math.random() - 0.5) * 20,
                        -80 - Math.random() * 60
                    );
                    obj.flyTarget = new THREE.Vector3(
                        (Math.random() - 0.5) * 14,
                        (Math.random() - 0.5) * 7,
                        (Math.random() - 0.5) * 4
                    );
                }
            }

            // Body spin while flying
            if (obj.state !== 'orbiting') {
                mesh.rotation.x += 0.03;
            }
        });

        // ── Lens tunnel animation ─────────────────────────────
        if (tunnelActive) {
            tunnelTimer++;
            tunnel.children.forEach((ring, i) => {
                ring.position.z += 0.8 + i * 0.03; // rush toward viewer
                ring.material.opacity = Math.max(0, ring.material.opacity - 0.004);
                if (ring.position.z > 20) ring.position.z = -36 + i * -1.2;
            });

            // Green flash at peak
            if (tunnelTimer === 18) {
                flashPlane.material.opacity = 0.15;
            }
            flashPlane.material.opacity *= 0.85;

            if (tunnelTimer > 80) {
                tunnelActive = false;
                tunnel.visible = false;
                // reset rings
                tunnel.children.forEach((ring, i) => {
                    ring.position.z = -i * 1.2;
                    ring.material.opacity = Math.max(0.02, 0.35 - i * 0.012);
                });
            }
        }

        renderer.render(scene, threeCamera);
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
            shimmer.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(0,255,65,0.15) 0%, rgba(57,255,20,0.06) 40%, transparent 70%)`;
            shimmer.style.opacity = "1";

            card.style.borderColor = `rgba(0,255,65,0.5)`;
            card.style.boxShadow = `
                0 20px 60px rgba(0,0,0,0.8),
                0 0 25px rgba(0,255,65,0.35),
                0 0 50px rgba(57,255,20,0.1),
                inset 0 1px 0 rgba(0,255,65,0.2)
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

function init3dImageGallery() {
    const stage = document.getElementById("image-3d-stage");
    if (!stage) return;

    stage.addEventListener("mousemove", (event) => {
        const rect = stage.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * -12;
        stage.style.transform = `rotateX(${y}deg) rotateY(${x}deg)`;
    });

    stage.addEventListener("mouseleave", () => {
        stage.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
}

/* ========================================================
   7. GSAP SCROLL ANIMATIONS + HERO ENTRANCE
   ======================================================== */
function initScrollAnimations() {
    // Hero entrance is now pure CSS — no GSAP needed for visibility

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Section headers — slide up (additive only, elements already visible)
        document.querySelectorAll(".section-header").forEach(el => {
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
                y: 30, duration: 0.7, ease: "power3.out"
            });
        });

        // Service cards stagger
        gsap.from(".service-card", {
            scrollTrigger: { trigger: ".services-grid", start: "top 82%", once: true },
            y: 40, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power3.out"
        });

        // Counter boxes scale in
        document.querySelectorAll(".counter-box").forEach((el, i) => {
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
                scale: 0.85, opacity: 0, duration: 0.5, delay: i * 0.08, ease: "back.out(1.4)"
            });
        });

        // Portfolio items
        gsap.from(".portfolio-item", {
            scrollTrigger: { trigger: ".portfolio-grid", start: "top 82%", once: true },
            y: 30, opacity: 0, duration: 0.5, stagger: 0.1, ease: "power2.out"
        });

        // Industry cards
        gsap.from(".industry-card", {
            scrollTrigger: { trigger: ".industries-grid", start: "top 85%", once: true },
            y: 20, opacity: 0, duration: 0.4, stagger: 0.06, ease: "power2.out"
        });

        // About grid split
        const aboutLeft = document.querySelector(".about-grid > *:first-child");
        const aboutRight = document.querySelector(".about-grid > *:last-child");
        if (aboutLeft) gsap.from(aboutLeft, { scrollTrigger: { trigger: aboutLeft, start: "top 82%", once: true }, x: -40, opacity: 0, duration: 0.8, ease: "power3.out" });
        if (aboutRight) gsap.from(aboutRight, { scrollTrigger: { trigger: aboutRight, start: "top 82%", once: true }, x: 40, opacity: 0, duration: 0.8, ease: "power3.out" });

    } else {
        // GSAP not available — everything is already visible via CSS, nothing to do
        console.log("GSAP not loaded — static display active");
    }

    // Always run IntersectionObserver for .appear class (used by counters etc.)
    const obs = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("appear");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".fade-in").forEach(el => obs.observe(el));
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
            const phoneNumber = "918105051643";
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

/* ========================================================
   14. PRODUCT CARD 3D TILT — Green neon specular
   ======================================================== */
function initProductCardTilt() {
    const cards = document.querySelectorAll(".product-3d-card");

    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rotX = ((cy - y) / cy) * 16;
            const rotY = ((x - cx) / cx) * 16;
            card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04,1.04,1.04)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transition = "transform 0.5s cubic-bezier(0.25,0.8,0.25,1)";
            card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
        });

        card.addEventListener("mouseenter", () => {
            card.style.transition = "transform 0.08s ease";
        });
    });
}
