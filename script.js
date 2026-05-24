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
});

/* ========================================================
   5. 3D CANVAS NETWORK PARTICLE ANIMATION
   ======================================================== */
function initHeroNetworkCanvas() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles = [];
    const maxParticles = window.innerWidth < 768 ? 40 : 80;
    const connectionDist = 120;
    const mouse = { x: null, y: null, radius: 150 };

    // Handle window resize
    window.addEventListener("resize", () => {
        if (!canvas) return;
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    });

    window.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    window.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle constructor with 3D depth variables
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Simulated Z-axis for 3D depth perspective
            this.z = Math.random() * 200 + 50; 
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.vz = (Math.random() - 0.5) * 0.3;
            this.baseSize = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.z += this.vz;

            // Constrain nodes in simulated 3D bounds
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
            if (this.z < 10 || this.z > 300) this.vz *= -1;

            // Interactive mouse repelling
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x += (dx / distance) * force * 3;
                    this.y += (dy / distance) * force * 3;
                }
            }
        }

        draw() {
            // Perspective projection calculations
            const perspective = 250 / (250 + this.z);
            const drawX = width / 2 + (this.x - width / 2) * perspective;
            const drawY = height / 2 + (this.y - height / 2) * perspective;
            const size = this.baseSize * perspective * 2.5;

            // Node coloring with depth opacity
            const alpha = (300 - this.z) / 300;
            const isLightTheme = document.body.classList.contains("light-theme");
            ctx.fillStyle = isLightTheme 
                ? `rgba(37, 99, 235, ${alpha * 0.7})` 
                : `rgba(6, 182, 212, ${alpha * 0.75})`;

            ctx.beginPath();
            ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Initialize particles array
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    function animate() {
        const isLightTheme = document.body.classList.contains("light-theme");
        ctx.clearRect(0, 0, width, height);

        // Update and draw nodes
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections linking nearby nodes
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            const p1ProjX = width / 2 + (p1.x - width / 2) * (250 / (250 + p1.z));
            const p1ProjY = height / 2 + (p1.y - height / 2) * (250 / (250 + p1.z));

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const p2ProjX = width / 2 + (p2.x - width / 2) * (250 / (250 + p2.z));
                const p2ProjY = height / 2 + (p2.y - height / 2) * (250 / (250 + p2.z));

                const dx = p1ProjX - p2ProjX;
                const dy = p1ProjY - p2ProjY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDist) {
                    const avgZ = (p1.z + p2.z) / 2;
                    const alpha = (1 - dist / connectionDist) * ((300 - avgZ) / 300) * 0.35;
                    ctx.strokeStyle = isLightTheme 
                        ? `rgba(37, 99, 235, ${alpha})` 
                        : `rgba(6, 182, 212, ${alpha})`;
                    ctx.lineWidth = 0.5 * (250 / (250 + avgZ));
                    
                    ctx.beginPath();
                    ctx.moveTo(p1ProjX, p1ProjY);
                    ctx.lineTo(p2ProjX, p2ProjY);
                    ctx.stroke();
                }
            }
        }
        animationId = requestAnimationFrame(animate);
    }
    animate();
}

/* ========================================================
   6. 3D CARD TILT EFFECT (SPECULAR LIGHT GLOW ON CARD HOVER)
   ======================================================== */
function init3dTiltEffect() {
    const cards = document.querySelectorAll(".glass-card");

    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // Mouse relative X inside card
            const y = e.clientY - rect.top;  // Mouse relative Y inside card
            
            const cardWidth = rect.width;
            const cardHeight = rect.height;
            const centerX = cardWidth / 2;
            const centerY = cardHeight / 2;
            
            // Tilt strength (angles of rotation)
            const maxTilt = 12; 
            const rotateX = ((centerY - y) / centerY) * maxTilt;
            const rotateY = ((x - centerX) / centerX) * maxTilt;
            
            // Render 3D tilt transform
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            // Add custom gradient lighting center for glass glare styling
            const glowX = (x / cardWidth) * 100;
            const glowY = (y / cardHeight) * 100;
            card.style.backgroundImage = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(6, 182, 212, 0.12) 0%, transparent 60%), var(--bg-surface-glass)`;
        });

        card.addEventListener("mouseleave", () => {
            // Restore cards layout to initial coordinates
            card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
            card.style.backgroundImage = "";
            card.style.transition = "transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)";
        });

        card.addEventListener("mouseenter", () => {
            card.style.transition = "transform 0.1s ease"; // Quick feedback on hover enter
        });
    });
}

/* ========================================================
   7. SCROLL-BASED IN-VIEW ANIMATIONS
   ======================================================== */
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll(".fade-in");
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("appear");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => scrollObserver.observe(el));
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
                    alert(`AMC request submitted successfully! Customized estimate rate calculated: $${data.estimatedCost}/month. We will send the comprehensive SLA draft to your email.`);
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
