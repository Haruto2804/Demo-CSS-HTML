

export function setPlayAudio(playBtnElement, audioElement, progressBarElement, currentTimeElement, totalTimeElement) {
  playBtnElement.addEventListener('click', () => {
    if (audioElement.paused) {
      audioElement.play();
      playBtnElement.innerHTML = '<i class="fa-solid fa-pause" style="color: #ffffff;"></i>';
    }
    else {
      audioElement.pause();
      playBtnElement.innerHTML = ' <i class = "fa-solid fa-play play-button" style="color: #ffffff;"></i>';
    }
  })

  audioElement.addEventListener('loadedmetadata', () => {
    progressBarElement.max = audioElement.duration;
    totalTimeElement.textContent = formatTime(audioElement.duration);


    audioElement.addEventListener('timeupdate', () => {
      progressBarElement.value = audioElement.currentTime;
      currentTimeElement.textContent = `${formatTime(audioElement.currentTime)}`;
      const progressPercent = (progressBarElement.value / audioElement.duration) * 100;
      progressBarElement.style.setProperty('--progress', `${progressPercent}%`);
    })
  })

  progressBarElement.addEventListener('input', () => {
  // 1. Tua nhạc đến vị trí người dùng kéo
  audioElement.currentTime = progressBarElement.value;

  // 2. Cập nhật ngay biến CSS (để màu sắc thay đổi khi đang kéo)
  const progressPercent = (progressBarElement.value / audioElement.duration) * 100;
  progressBarElement.style.setProperty('--progress', `${progressPercent}%`);
});
}





