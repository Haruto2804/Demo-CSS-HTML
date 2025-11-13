const volumeControlElement = document.querySelector('.volume-control');
const videoElement = document.querySelector('.myVideo');
const volumeSliderElement = document.querySelector('.volumeSlider');

let isMuted = videoElement.muted;



// --- HÀM CẬP NHẬT BIỂU TƯỢNG (Ổn định) ---
function updateVolumeIcon(volume) {
  const vol = parseFloat(volume);

  if (vol === 0) {
    volumeControlElement.innerHTML = `<i class="fa-solid fa-volume-xmark fa-xl" style="color: #ffffff;"></i>`;
    videoElement.muted = true;
    isMuted = true;
  } else {
    volumeControlElement.innerHTML = ` <i class="fa-solid fa-volume-high fa-xl" style="color: #f8f8f8;"></i>`;
    videoElement.muted = false;
    isMuted = false;
  }
}

function updateProgressBar(volume) {
    const progressPercentage = volume * 100;
    volumeSliderElement.style.setProperty("--progress", `${progressPercentage}%`);
}
// --- KHỞI TẠO ÂM LƯỢNG (Ổn định) ---
function initializeVolume() {
  let savedVolume = parseFloat(localStorage.getItem("volume"));
  if (isNaN(savedVolume) || savedVolume === null) {
    savedVolume = 0.5;
  }

  videoElement.volume = savedVolume;
  volumeSliderElement.value = savedVolume;
  updateProgressBar(savedVolume);
  updateVolumeIcon(savedVolume);
}
initializeVolume();


// --- XỬ LÝ SỰ KIỆN NHẤN NÚT
volumeControlElement.addEventListener('click', () => {

  if (!videoElement.muted) { // Đang Mở tiếng, chuẩn bị Tắt tiếng (Mute)

    // BƯỚC 1: LƯU ÂM LƯỢNG HIỆN TẠI VÀO KEY RIÊNG BIỆT TRƯỚC KHI TẮT
    localStorage.setItem("lastVolumeBeforeMute", videoElement.volume);

    // BƯỚC 2: Tắt tiếng và lưu 0 vào key "volume"
    videoElement.volume = 0;
    volumeSliderElement.value = 0;
    videoElement.muted = true; // Cập nhật thuộc tính muted
    localStorage.setItem("volume", 0);

  } else { // Đang Tắt tiếng, chuẩn bị Mở tiếng (Unmute)

    // BƯỚC 1: LẤY ÂM LƯỢNG ĐÃ LƯU TRƯỚC KHI TẮT
    let volumeToRestore = parseFloat(localStorage.getItem("lastVolumeBeforeMute")) || 0.5;

    // Đảm bảo không khôi phục về 0
    if (volumeToRestore === 0 || isNaN(volumeToRestore)) {
      volumeToRestore = 0.5;
    }

    // BƯỚC 2: Khôi phục âm lượng và bật tiếng
    videoElement.volume = volumeToRestore;
    volumeSliderElement.value = volumeToRestore;
    videoElement.muted = false; // Cập nhật thuộc tính muted

    // BƯỚC 3: Cập nhật key "volume" chính
    localStorage.setItem("volume", volumeToRestore);
  }

  // Cập nhật biểu tượng dựa trên trạng thái volume thực tế của video
  updateVolumeIcon(videoElement.volume);
  updateProgressBar(videoElement.value);
});


// --- XỬ LÝ SỰ KIỆN KÉO THANH TRƯỢT (ĐÃ SỬA LỖI KIỂU DỮ LIỆU) ---
volumeSliderElement.addEventListener('input', () => {
  // Sửa lỗi: Chuyển sang số khi xử lý giá trị từ thanh trượt
  const newVolume = parseFloat(volumeSliderElement.value);

  videoElement.volume = newVolume;
  localStorage.setItem("volume", newVolume);

  // Nếu kéo lên từ 0, cần hủy bỏ thuộc tính muted
  if (newVolume > 0 && videoElement.muted) {
    videoElement.muted = false;
    // Cần lưu lại mức âm lượng này vào "lastVolumeBeforeMute"
    localStorage.setItem("lastVolumeBeforeMute", newVolume);
  }
  const progressPercentage = newVolume * 100;
  updateProgressBar(newVolume);
  updateVolumeIcon(newVolume);
});