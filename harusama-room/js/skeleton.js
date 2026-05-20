const MIN_LOADING_TIME = 550;
const startTime = Date.now();

function createSkeleton() {
  if (document.querySelector(".page-skeleton")) return;

  const skeleton = document.createElement("div");
  skeleton.className = "page-skeleton";
  skeleton.setAttribute("aria-hidden", "true");

  skeleton.innerHTML = `
    <div class="skeleton-box">
      <div class="skeleton-brand">
        <div class="skeleton-logo"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
        <div class="skeleton-loading-text">Loading archive...</div>
      </div>

      <div class="skeleton-layout">
        <div class="skeleton-hero">
          <div class="skeleton-photo"></div>
        </div>

        <div class="skeleton-panel">
          <div class="skeleton-line big"></div>
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line small"></div>

          <div class="skeleton-row">
            <div class="skeleton-chip"></div>
            <div class="skeleton-chip"></div>
            <div class="skeleton-chip"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.prepend(skeleton);
}

function hideSkeleton() {
  const elapsed = Date.now() - startTime;
  const delay = Math.max(0, MIN_LOADING_TIME - elapsed);

  window.setTimeout(() => {
    document.documentElement.classList.add("is-loaded");

    window.setTimeout(() => {
      const skeleton = document.querySelector(".page-skeleton");
      if (skeleton) skeleton.remove();

      document.documentElement.classList.remove("is-preloading");
    }, 700);
  }, delay);
}

document.documentElement.classList.add("is-preloading");

if (document.body) {
  createSkeleton();
} else {
  document.addEventListener("DOMContentLoaded", createSkeleton);
}

window.addEventListener("load", hideSkeleton);

/* Chống trường hợp mạng lỗi khiến skeleton bị treo mãi */
window.setTimeout(hideSkeleton, 4500);
