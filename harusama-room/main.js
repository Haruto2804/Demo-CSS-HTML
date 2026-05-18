// ===============================
// TIKTOK LAZY PLAYER
// Chỉ cho phép 1 video TikTok hoạt động tại 1 thời điểm
// ===============================

const tiktokLazyFrames = document.querySelectorAll(".tiktok-lazy");
const pauseAllTikTokButtons = document.querySelectorAll(".pause-all-tiktok");

function getTikTokPlaceholderHTML() {
  return `
    <button class="tiktok-load-btn" type="button">
      <span>▶</span>
      <strong>Bấm để tải video</strong>
      <small>Video đang tạm dừng</small>
    </button>
  `;
}

function resetTikTokFrame(frame) {
  const iframe = frame.querySelector(".tiktok-player");

  if (iframe) {
    iframe.contentWindow?.postMessage(
      {
        type: "pause",
        "x-tiktok-player": true,
      },
      "*",
    );
  }

  frame.classList.remove("is-loaded");
  frame.innerHTML = getTikTokPlaceholderHTML();

  const newButton = frame.querySelector(".tiktok-load-btn");

  newButton.addEventListener("click", () => {
    activateTikTokFrame(frame);
  });
}

function stopOtherTikTokVideos(activeFrame) {
  tiktokLazyFrames.forEach((frame) => {
    if (frame !== activeFrame) {
      resetTikTokFrame(frame);
    }
  });
}

function activateTikTokFrame(frame) {
  const videoId = frame.dataset.videoId;

  if (!videoId) {
    console.warn("Thiếu data-video-id cho TikTok frame:", frame);
    return;
  }

  // Khi mở video này, dừng và reset toàn bộ video khác
  stopOtherTikTokVideos(frame);

  // Nếu video này đã load rồi thì không tạo lại
  if (frame.querySelector(".tiktok-player")) {
    return;
  }

  const iframe = document.createElement("iframe");

  iframe.className = "tiktok-player";

  // autoplay=1: sau khi bấm nút, video có thể tự chạy nếu trình duyệt/TikTok cho phép
  // Nếu không muốn tự chạy sau khi bấm, xóa &autoplay=1
  iframe.src = `https://www.tiktok.com/player/v1/${videoId}?controls=1&autoplay=1&description=0&music_info=0`;

  iframe.loading = "lazy";
  iframe.allow = "autoplay; fullscreen; encrypted-media; picture-in-picture";
  iframe.allowFullscreen = true;
  iframe.title = "TikTok video player";

  frame.classList.add("is-loaded");
  frame.innerHTML = "";
  frame.appendChild(iframe);
}

function pauseAllTikTokVideos() {
  tiktokLazyFrames.forEach((frame) => {
    const iframe = frame.querySelector(".tiktok-player");

    if (iframe) {
      iframe.contentWindow?.postMessage(
        {
          type: "pause",
          "x-tiktok-player": true,
        },
        "*",
      );
    }
  });
}

tiktokLazyFrames.forEach((frame) => {
  const loadButton = frame.querySelector(".tiktok-load-btn");

  if (!loadButton) return;

  loadButton.addEventListener("click", () => {
    activateTikTokFrame(frame);
  });
});

pauseAllTikTokButtons.forEach((button) => {
  button.addEventListener("click", pauseAllTikTokVideos);
});
