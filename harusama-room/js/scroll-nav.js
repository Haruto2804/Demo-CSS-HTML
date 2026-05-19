// ===============================
// RESPONSIVE SCROLL NAVIGATION
// ===============================

(() => {
  function initScrollNav() {
    const shell = document.querySelector(".scroll-nav-shell");
    const toggleBtn = document.getElementById("scrollNavToggle");
    const nav = document.querySelector(".scroll-nav");

    const navItems = document.querySelectorAll(".scroll-nav-item");
    const scrollSections = document.querySelectorAll(
      "#playlist, #tiktok-anime, #tiktok-ai, #memories, #final-message",
    );

    if (!shell || !toggleBtn || !nav || navItems.length === 0) return;

    const isDesktop = () => window.innerWidth >= 1025;

    function setCollapsed(isCollapsed) {
      // Desktop: nav luôn hiện, không cần nút collapse
      if (isDesktop()) {
        shell.classList.remove("is-collapsed");
        toggleBtn.setAttribute("aria-expanded", "true");
        return;
      }

      shell.classList.toggle("is-collapsed", isCollapsed);
      toggleBtn.setAttribute("aria-expanded", String(!isCollapsed));

      toggleBtn.innerHTML = isCollapsed
        ? `<i class="fa-solid fa-bookmark"></i>`
        : `<i class="fa-solid fa-pen-nib"></i>`;

      localStorage.setItem("scrollNavCollapsed", String(isCollapsed));
    }

    const savedState = localStorage.getItem("scrollNavCollapsed") === "true";
    setCollapsed(savedState);

    toggleBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const isCollapsed = shell.classList.contains("is-collapsed");
      setCollapsed(!isCollapsed);
    });

    navItems.forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();

        const targetId = item.getAttribute("href");
        const targetSection = document.querySelector(targetId);

        if (!targetSection) return;

        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });

    function updateActiveDot() {
      let activeId = scrollSections[0]?.id || "";

      scrollSections.forEach((section) => {
        const rect = section.getBoundingClientRect();

        if (rect.top <= window.innerHeight * 0.55) {
          activeId = section.id;
        }
      });

      navItems.forEach((item) => {
        item.classList.toggle("is-active", item.dataset.section === activeId);
      });
    }

    window.addEventListener("scroll", updateActiveDot, { passive: true });

    window.addEventListener("resize", () => {
      setCollapsed(localStorage.getItem("scrollNavCollapsed") === "true");
      updateActiveDot();
    });

    updateActiveDot();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollNav);
  } else {
    initScrollNav();
  }
})();
