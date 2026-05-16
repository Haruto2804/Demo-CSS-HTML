const { animate, inView, stagger } = Motion;

/* HERO */
animate(
  "#hero-section-left > *",
  { opacity: [0, 1], x: [-60, 0] },
  {
    duration: 0.8,
    delay: stagger(0.15),
    easing: "ease-out",
  },
);

/* SKILLS SECTION */
inView(
  "#skill-section",
  () => {
    animate(
      ".skill-section__left > *",
      { opacity: [0, 1], x: [-50, 0] },
      {
        duration: 0.8,
        delay: stagger(0.15),
        easing: "ease-out",
      },
    );

    animate(
      ".skills-group",
      { opacity: [0, 1], y: [50, 0] },
      {
        duration: 0.8,
        delay: stagger(0.2),
        easing: "ease-out",
      },
    );

    animate(
      ".skill-card",
      { opacity: [0, 1], y: [40, 0], scale: [0.95, 1] },
      {
        duration: 0.6,
        delay: stagger(0.08),
        easing: "ease-out",
      },
    );

    animate(
      ".skill-card__progress-fill",
      { scaleX: [0, 1] },
      {
        duration: 1,
        delay: stagger(0.08),
        easing: "ease-out",
      },
    );

    return () => {};
  },
  {
    amount: 0.3,
    once: true,
  },
);
