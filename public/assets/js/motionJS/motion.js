const { animate, inView, stagger } = motion;

const springEasing = [0.16, 1, 0.3, 1]; // Premium smooth ease-out

/* ===========================
   HERO SECTION
=========================== */
inView("#hero-section", () => {
  // Fade in the massive background text slowly
  animate(
    ".hero-bg-text",
    { opacity: [0, 1], scale: [1.1, 1] },
    { duration: 1.5, easing: springEasing }
  );

  // Fade up the portrait
  animate(
    ".hero-center-portrait",
    { opacity: [0, 1], y: [50, 0] },
    { duration: 1, delay: 0.3, easing: springEasing }
  );

  // Stagger left content (status badge, job title, desc, btn)
  animate(
    "#hero-section-left > *",
    { opacity: [0, 1], x: [-30, 0] },
    { duration: 0.8, delay: stagger(0.1, { start: 0.4 }), easing: springEasing }
  );

  // Stagger right content (social links)
  animate(
    ".hero-socials a",
    { opacity: [0, 1], x: [30, 0] },
    { duration: 0.8, delay: stagger(0.1, { start: 0.5 }), easing: springEasing }
  );
}, { once: true });


/* ===========================
   ABOUT / EXPERIENCE SECTION
=========================== */
inView("#about-section", () => {
  // Container fade in
  animate(
    "#about-section",
    { opacity: [0, 1], y: [40, 0] },
    { duration: 1, easing: springEasing }
  );

  // Stagger text and experience cards
  animate(
    ".about-subtitle, .about-title, .about-desc",
    { opacity: [0, 1], y: [20, 0] },
    { duration: 0.8, delay: stagger(0.1, { start: 0.2 }), easing: springEasing }
  );
  
  animate(
    ".about-card",
    { opacity: [0, 1], y: [20, 0] },
    { duration: 0.8, delay: stagger(0.1, { start: 0.5 }), easing: springEasing }
  );
}, { amount: 0.2, once: true });


/* ===========================
   SERVICES SECTION (Accordion)
=========================== */
inView("#services-section", () => {
  animate(
    ".services-title",
    { opacity: [0, 1], x: [-30, 0] },
    { duration: 0.8, easing: springEasing }
  );

  // Stagger accordion items
  animate(
    ".accordion-item",
    { opacity: [0, 1], y: [30, 0] },
    { duration: 0.8, delay: stagger(0.15, { start: 0.2 }), easing: springEasing }
  );
}, { amount: 0.2, once: true });


/* ===========================
   PROJECTS SECTION
=========================== */
inView("#project-section", () => {
  // Fade in massive background text
  animate(
    ".project-bg-text",
    { opacity: [0, 1], scale: [0.95, 1] },
    { duration: 1.5, easing: springEasing }
  );

  animate(
    ".project-title, .project-tabs",
    { opacity: [0, 1], y: [30, 0] },
    { duration: 0.8, delay: stagger(0.1), easing: springEasing }
  );

  // Fade up project cards
  animate(
    ".project-card",
    { opacity: [0, 1], y: [50, 0] },
    { duration: 1, delay: stagger(0.2, { start: 0.4 }), easing: springEasing }
  );
}, { amount: 0.2, once: true });


/* ===========================
   TESTIMONIAL SECTION
=========================== */
inView("#testimonial-section", () => {
  animate(
    ".testimonial-subtitle, .testimonial-title, .testimonial-desc",
    { opacity: [0, 1], y: [30, 0] },
    { duration: 0.8, delay: stagger(0.1), easing: springEasing }
  );
  animate(
    ".testimonial-card",
    { opacity: [0, 1], y: [40, 0] },
    { duration: 0.8, delay: stagger(0.1, { start: 0.3 }), easing: springEasing }
  );
}, { amount: 0.3, once: true });


/* ===========================
   CONTACT SECTION
=========================== */
inView("#contact-section", () => {
  animate(
    ".contact-subtitle, .contact-title, .contact-desc, .contact-links, .contact-actions",
    { opacity: [0, 1], x: [-30, 0] },
    { duration: 0.8, delay: stagger(0.1), easing: springEasing }
  );
  animate(
    ".contact-card",
    { opacity: [0, 1], scale: [0.95, 1] },
    { duration: 1, easing: springEasing }
  );
}, { amount: 0.3, once: true });


/* ===========================
   FOOTER
=========================== */
inView("#footer", () => {
  animate(
    ".footer-container > *, .footer-bottom",
    { opacity: [0, 1], y: [20, 0] },
    { duration: 0.8, delay: stagger(0.1), easing: springEasing }
  );
}, { amount: 0.2, once: true });


/* SCROLL DOWN FLOAT */
animate(
  "#scroll-down",
  { y: [0, 8, 0] },
  { duration: 2, repeat: Infinity, easing: "ease-in-out" }
);
