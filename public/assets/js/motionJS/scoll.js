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
    // Cấu hình CSS cơ bản cho thanh progress nếu chưa có trong file CSS
    scrollProgress.style.position = "fixed";
    scrollProgress.style.top = "0";
    scrollProgress.style.left = "0";
    scrollProgress.style.height = "4px";
    scrollProgress.style.backgroundColor = "#3b82f6"; // Màu xanh hoặc tùy chọn
    scrollProgress.style.transformOrigin = "0%";
    scrollProgress.style.zIndex = "9999";

    window.addEventListener("scroll", () => {
      const totalScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = window.pageYOffset / totalScroll;
        animate(scrollProgress, { scaleX: progress }, { duration: 0 });
      }
    });
  }
});
