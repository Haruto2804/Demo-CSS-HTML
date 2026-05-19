// ===============================
// MOTION REVEAL ONLY
// Chỉ tạo hiệu ứng xuất hiện khi scroll
// Không đụng tooltip, hover, cursor, volume, TikTok
// ===============================

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) return;

  function initMotionReveal() {
    const style = document.createElement("style");

    style.textContent = `
      html {
        scroll-behavior: smooth;
      }

      .motion-reveal {
        opacity: 0;
        transform: translateY(34px);
        filter: blur(8px);
        transition:
          opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
          transform 0.9s cubic-bezier(0.22, 1, 0.36, 1),
          filter 0.9s cubic-bezier(0.22, 1, 0.36, 1);
        transition-delay: var(--motion-delay, 0ms);
        will-change: opacity, transform, filter;
      }

      .motion-reveal.motion-from-left {
        transform: translateX(-36px);
      }

      .motion-reveal.motion-from-right {
        transform: translateX(36px);
      }

      .motion-reveal.motion-zoom {
        transform: translateY(24px) scale(0.96);
      }

      .motion-reveal.is-visible,
      .motion-reveal.motion-from-left.is-visible,
      .motion-reveal.motion-from-right.is-visible,
      .motion-reveal.motion-zoom.is-visible {
        opacity: 1;
        transform: translate(0, 0) scale(1);
        filter: blur(0);
      }

      @media (max-width: 768px) {
        .motion-reveal {
          transform: translateY(22px);
          filter: blur(5px);
          transition-duration: 0.7s;
        }

        .motion-reveal.motion-from-left,
        .motion-reveal.motion-from-right {
          transform: translateY(22px);
        }
      }
    `;

    document.head.appendChild(style);

    const revealTargets = [
      ".hero .polaroid-card",
      ".hero .hero-text",

      ".playlist-section .section-heading",
      ".playlist-player",
      ".now-playing-card",
      ".mood-track",

      ".tiktok-anime .section-heading",
      ".tiktok-anime .video-card",

      ".tiktok-ai .section-heading",
      ".tiktok-ai .video-card",

      ".memories-section .section-heading",
      ".memory-card",
      ".quote-card",
      ".album-link",

      ".final-message-card",
      ".page-footer",
    ];

    const elements = revealTargets
      .flatMap((selector) => Array.from(document.querySelectorAll(selector)))
      .filter((element) => {
        return (
          !element.closest("#currentTrackDesc-tooltip") &&
          !element.classList.contains("scroll-nav") &&
          !element.classList.contains("volume-widget")
        );
      });

    elements.forEach((element, index) => {
      element.classList.add("motion-reveal");

      const delay = Math.min(index * 60, 360);
      element.style.setProperty("--motion-delay", `${delay}ms`);
    });

    document
      .querySelectorAll(".tiktok-panel-left, .tiktok-anime .section-heading")
      .forEach((element) => {
        element.classList.add("motion-from-left");
      });

    document
      .querySelectorAll(".tiktok-panel-right, .tiktok-ai .section-heading")
      .forEach((element) => {
        element.classList.add("motion-from-right");
      });

    document
      .querySelectorAll(
        ".polaroid-card, .now-playing-card, .video-card, .memory-card, .final-message-card",
      )
      .forEach((element) => {
        element.classList.add("motion-zoom");
      });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMotionReveal);
  } else {
    initMotionReveal();
  }
})();
