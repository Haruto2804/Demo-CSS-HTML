const { animate, inView, stagger } = Motion;

/* HERO */
animate(
  "#hero-section-left > *",
  { opacity: [0, 1], y: [40, 0] },
  {
    duration: 0.7,
    delay: stagger(0.12),
    easing: "ease-out",
  },
);

/* ABOUT */
inView(
  "#about-section",
  () => {
    animate(
      ".about-subtitle, .about-title, .about-desc",
      { opacity: [0, 1], y: [35, 0] },
      {
        duration: 0.7,
        delay: stagger(0.12),
        easing: "ease-out",
      },
    );

    animate(
      ".about-card",
      { opacity: [0, 1], y: [40, 0] },
      {
        duration: 0.7,
        delay: stagger(0.12),
        easing: "ease-out",
      },
    );
  },
  { amount: 0.3, once: true },
);

/* SKILLS */
inView(
  "#skill-section",
  () => {
    animate(
      ".skill-section__left > *",
      { opacity: [0, 1], x: [-35, 0] },
      {
        duration: 0.7,
        delay: stagger(0.12),
        easing: "ease-out",
      },
    );

    animate(
      ".skills-group",
      { opacity: [0, 1], y: [40, 0] },
      {
        duration: 0.7,
        delay: stagger(0.15),
        easing: "ease-out",
      },
    );

    animate(
      ".skill-card",
      { opacity: [0, 1], y: [25, 0] },
      {
        duration: 0.5,
        delay: stagger(0.06),
        easing: "ease-out",
      },
    );

    animate(
      ".skill-card__progress-fill",
      { scaleX: [0, 1] },
      {
        duration: 0.9,
        delay: stagger(0.06),
        easing: "ease-out",
      },
    );
  },
  { amount: 0.25, once: true },
);

/* PROJECT */
inView(
  "#project-section",
  () => {
    animate(
      "#project-section .section-title",
      { opacity: [0, 1], y: [35, 0] },
      {
        duration: 0.7,
        easing: "ease-out",
      },
    );

    animate(
      ".project-card",
      { opacity: [0, 1], y: [50, 0] },
      {
        duration: 0.8,
        easing: "ease-out",
      },
    );
  },
  { amount: 0.3, once: true },
);

/* TESTIMONIAL */
inView(
  "#testimonial-section",
  () => {
    animate(
      ".testimonial-subtitle, .testimonial-title, .testimonial-desc",
      { opacity: [0, 1], y: [35, 0] },
      {
        duration: 0.7,
        delay: stagger(0.12),
        easing: "ease-out",
      },
    );

    animate(
      ".testimonial-card",
      { opacity: [0, 1], y: [40, 0] },
      {
        duration: 0.7,
        delay: stagger(0.12),
        easing: "ease-out",
      },
    );
  },
  { amount: 0.3, once: true },
);

/* CONTACT */
inView(
  "#contact-section",
  () => {
    animate(
      ".contact-content > *",
      { opacity: [0, 1], x: [-35, 0] },
      {
        duration: 0.7,
        delay: stagger(0.1),
        easing: "ease-out",
      },
    );

    animate(
      ".contact-card",
      { opacity: [0, 1], x: [35, 0] },
      {
        duration: 0.7,
        easing: "ease-out",
      },
    );
  },
  { amount: 0.3, once: true },
);

/* FOOTER */
inView(
  "#footer",
  () => {
    animate(
      ".footer-container > *, .footer-bottom",
      { opacity: [0, 1], y: [25, 0] },
      {
        duration: 0.6,
        delay: stagger(0.1),
        easing: "ease-out",
      },
    );
  },
  { amount: 0.2, once: true },
);

/* SCROLL DOWN FLOAT */
animate(
  "#scroll-down",
  { y: [0, 8, 0] },
  {
    duration: 1.8,
    repeat: Infinity,
    easing: "ease-in-out",
  },
);
