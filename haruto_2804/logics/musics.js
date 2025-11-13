import { setPlayAudio } from "./play-audio.js";
document.addEventListener('DOMContentLoaded', () => {
  const video = document.querySelector('video');
  if (video) {
    video.muted = true; // Bắt đầu muted
    video.play().then(() => {
      console.log('Video đang chạy');
      
      // Unmute khi user click vào đâu đó
      document.addEventListener('click', () => {
        video.muted = false;
      }, { once: true });
    }).catch(error => {
      console.log('Autoplay bị chặn:', error);
    });
  }
});
// music footer
const audioElement = document.querySelector('.audioElement');
const totalTimeElement = document.querySelector('.total-time');
const progressBarElement = document.querySelector('.progress-bar');
const playBtnElement = document.querySelector('.play-button');
const currentTimeElement = document.querySelector('.current-time'); // <--- Lấy ở đây
setPlayAudio(playBtnElement, audioElement, progressBarElement, currentTimeElement, totalTimeElement);
