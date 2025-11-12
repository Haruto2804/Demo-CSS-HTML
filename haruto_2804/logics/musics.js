import { setPlayAudio } from "./play-audio.js";
// music footer
const audioElement = document.querySelector('.audioElement');
const totalTimeElement = document.querySelector('.total-time');
const progressBarElement = document.querySelector('.progress-bar');
const playBtnElement = document.querySelector('.play-button');
const currentTimeElement = document.querySelector('.current-time'); // <--- Lấy ở đây
setPlayAudio(playBtnElement, audioElement, progressBarElement, currentTimeElement, totalTimeElement);
