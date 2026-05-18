// ===============================
// PLAYLIST TÂM TRẠNG PLAYER
// ===============================

const audio = document.getElementById("playlistAudio");
const trackButtons = document.querySelectorAll(".mood-track");

const currentTrackTitle = document.getElementById("currentTrackTitle");
const currentTrackDesc = document.getElementById("currentTrackDesc");
const playerCurrentTime = document.getElementById("playerCurrentTime");
const playerDuration = document.getElementById("playerDuration");
const playlistSeek = document.getElementById("playlistSeek");

const vinylDisc = document.querySelector(".vinyl-disc");
const vinylWrap = document.querySelector(".vinyl-wrap");
const nowPlayingCard = document.querySelector(".now-playing-card");

let currentTrackIndex = 0;
let isSeeking = false;

function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function setPlayingUI(isPlaying) {
  if (vinylDisc) {
    vinylDisc.style.animationPlayState = isPlaying ? "running" : "paused";
  }

  if (nowPlayingCard) {
    nowPlayingCard.classList.toggle("is-playing", isPlaying);
  }

  trackButtons.forEach((button, index) => {
    button.classList.toggle(
      "is-playing",
      isPlaying && index === currentTrackIndex,
    );
  });
}

function loadTrack(index, shouldPlay = false) {
  const track = trackButtons[index];

  if (!track || !audio) return;

  currentTrackIndex = index;

  audio.src = track.dataset.src;

  currentTrackTitle.textContent = track.dataset.title;
  currentTrackDesc.textContent = track.dataset.desc;

  playerCurrentTime.textContent = "00:00";
  playerDuration.textContent = "00:00";
  playlistSeek.value = 0;

  trackButtons.forEach((button) => {
    button.classList.remove("is-active", "is-playing");
  });

  track.classList.add("is-active");

  if (shouldPlay) {
    playAudio();
  } else {
    pauseAudio();
  }
}

function playAudio() {
  if (!audio.src) {
    loadTrack(currentTrackIndex, true);
    return;
  }

  audio
    .play()
    .then(() => {
      setPlayingUI(true);
    })
    .catch((error) => {
      console.log("Trình duyệt chặn phát nhạc:", error);
      setPlayingUI(false);
    });
}

function pauseAudio() {
  audio.pause();
  setPlayingUI(false);
}

function toggleAudio() {
  if (!audio.src) {
    loadTrack(currentTrackIndex, true);
    return;
  }

  if (audio.paused) {
    playAudio();
  } else {
    pauseAudio();
  }
}

trackButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    const isSameTrack = index === currentTrackIndex;

    if (isSameTrack && !audio.paused) {
      pauseAudio();
      return;
    }

    loadTrack(index, true);
  });
});

audio.addEventListener("loadedmetadata", () => {
  playerDuration.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (isSeeking) return;

  const current = audio.currentTime;
  const duration = audio.duration;

  playerCurrentTime.textContent = formatTime(current);

  if (!isNaN(duration)) {
    playlistSeek.value = (current / duration) * 100;
  }
});

playlistSeek.addEventListener("input", () => {
  isSeeking = true;

  const duration = audio.duration;

  if (!isNaN(duration)) {
    const seekTime = (playlistSeek.value / 100) * duration;
    playerCurrentTime.textContent = formatTime(seekTime);
  }
});

playlistSeek.addEventListener("change", () => {
  const duration = audio.duration;

  if (!isNaN(duration)) {
    audio.currentTime = (playlistSeek.value / 100) * duration;
  }

  isSeeking = false;
});

audio.addEventListener("ended", () => {
  const nextTrackIndex = currentTrackIndex + 1;

  if (nextTrackIndex < trackButtons.length) {
    loadTrack(nextTrackIndex, true);
  } else {
    loadTrack(0, false);
  }
});

if (vinylWrap) {
  vinylWrap.addEventListener("click", toggleAudio);
}

if (nowPlayingCard) {
  nowPlayingCard.addEventListener("dblclick", toggleAudio);
}

// Load sẵn bài đầu tiên nhưng chưa tự phát
loadTrack(0, false);
