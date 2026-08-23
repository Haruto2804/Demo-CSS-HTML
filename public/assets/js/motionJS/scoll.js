// Đảm bảo thư viện motion đã tải xong
document.addEventListener("DOMContentLoaded", () => {
  const { inView, animate } = motion;

  // Removed generic section animations and old skill animations to avoid conflicts with motion.js
  // Removed conflicting project card animations (moved to motion.js)

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

  // 6. Services Accordion Logic
  const accordionItems = document.querySelectorAll(".accordion-item");
  accordionItems.forEach((item) => {
    const header = item.querySelector(".accordion-header");
    header.addEventListener("click", () => {
      // Toggle current item
      const isActive = item.classList.contains("active");
      
      // Close all items
      accordionItems.forEach((i) => i.classList.remove("active"));

      // If it wasn't active, open it
      if (!isActive) {
        item.classList.add("active");
        const content = item.querySelector(".accordion-content");
        if (content) {
          animate(content, { opacity: [0, 1], y: [10, 0] }, { duration: 0.4 });
        }
      }
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
