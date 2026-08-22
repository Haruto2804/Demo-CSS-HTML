// Đảm bảo thư viện motion đã tải xong
document.addEventListener("DOMContentLoaded", () => {
  const { inView, animate } = motion;

  // 1. Hiệu ứng xuất hiện cho từng Section chính
  inView("section", (element) => {
    animate(
      element,
      { opacity: [0, 1], y: [40, 0] },
      { duration: 0.8, easing: "ease-out" },
    );

    // Trả về một hàm clear nếu chỉ muốn chạy hiệu ứng 1 lần duy nhất khi cuộn xuống
    // (Bỏ comment dòng dưới nếu muốn cuộn lên cuộn xuống hiệu ứng lặp lại)
    return () => {};
  });

  // 2. Hiệu ứng mượt mà (Stagger) cho các thẻ Skill Card trong phần Kỹ năng
  inView(".skills-group", (element) => {
    const cards = element.querySelectorAll(".skill-card");
    animate(
      cards,
      { opacity: [0, 1], scale: [0.9, 1] },
      { delay: motion.stagger(0.1), duration: 0.5 },
    );
  });

  // 3. Hiệu ứng trượt từ trái/phải cho Project Card
  inView(".project-card", (element) => {
    const content = element.querySelector(".project-card__content");
    const image = element.querySelector(".project-card__image");

    if (content) {
      animate(content, { opacity: [0, 1], x: [-50, 0] }, { duration: 0.6 });
    }
    if (image) {
      animate(
        image,
        { opacity: [0, 1], x: [50, 0] },
        { duration: 0.6, delay: 0.2 },
      );
    }
  });

  // 4. Thanh tiến trình cuộn trang (Scroll Progress Bar) ở đầu trang
  const scrollProgress = document.getElementById("scroll-progress");
  if (scrollProgress) {
    window.addEventListener("scroll", () => {
      const totalScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = window.pageYOffset / totalScroll;
        animate(scrollProgress, { scaleX: progress }, { duration: 0 });
      }
    });
  }

  // 5. Floating Dynamic Island Header & Active link highlight (PACKAGE 4 VIP)
  const header = document.getElementById("header");
  const navLinks = document.querySelectorAll("#nav-menu a");
  const sections = document.querySelectorAll("section[id]");

  window.addEventListener("scroll", () => {
    // Dynamic Island scrolled state
    if (header) {
      if (window.scrollY > 40) {
        header.classList.add("header--scrolled");
      } else {
        header.classList.remove("header--scrolled");
      }
    }

    // Active menu link highlight
    let currentSection = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  });

  // 6. Skill Filter Pills (PACKAGE 4 VIP)
  const filterButtons = document.querySelectorAll(".skill-filter-btn");
  const skillGroups = document.querySelectorAll(".skills-group");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");
      skillGroups.forEach((group) => {
        const titleText = group.querySelector(".skills-group__title")?.textContent.toLowerCase() || "";
        if (filter === "all") {
          group.style.display = "block";
          animate(group, { opacity: [0, 1], scale: [0.97, 1] }, { duration: 0.35 });
        } else if (filter === "frontend" && titleText.includes("front-end")) {
          group.style.display = "block";
          animate(group, { opacity: [0, 1], scale: [0.97, 1] }, { duration: 0.35 });
        } else if (filter === "backend" && titleText.includes("back-end")) {
          group.style.display = "block";
          animate(group, { opacity: [0, 1], scale: [0.97, 1] }, { duration: 0.35 });
        } else {
          group.style.display = "none";
        }
      });
    });
  });

  // 7. One-Click Copy Email Button (PACKAGE 4 VIP)
  const copyEmailBtn = document.getElementById("copy-email-btn");
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", () => {
      const email = copyEmailBtn.getAttribute("data-email") || "ngobao.software@gmail.com";
      navigator.clipboard.writeText(email).then(() => {
        const originalHTML = copyEmailBtn.innerHTML;
        copyEmailBtn.classList.add("copied");
        copyEmailBtn.innerHTML = `<i class="fa-solid fa-check"></i> <span>Copied to Clipboard!</span>`;
        setTimeout(() => {
          copyEmailBtn.classList.remove("copied");
          copyEmailBtn.innerHTML = originalHTML;
        }, 2200);
      });
    });
  }
});
