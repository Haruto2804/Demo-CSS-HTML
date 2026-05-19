// ===============================
// GLOBAL VOLUME CONTROL
// ===============================

(() => {
  const volumeAudio = document.getElementById("playlistAudio");
  const volumeToggle = document.getElementById("volumeToggle");
  const volumeIcon = document.getElementById("volumeIcon");
  const volumePanel = document.getElementById("volumePanel");
  const volumeSlider = document.getElementById("globalVolumeSlider");
  const volumePercent = document.getElementById("volumePercent");

  if (
    !volumeAudio ||
    !volumeToggle ||
    !volumeIcon ||
    !volumePanel ||
    !volumeSlider
  ) {
    return;
  }

  const savedVolume = Number(localStorage.getItem("archiveVolume"));
  const savedMuted = localStorage.getItem("archiveMuted") === "true";
  const savedLastVolume = Number(localStorage.getItem("archiveLastVolume"));

  let lastNonZeroVolume =
    !Number.isNaN(savedLastVolume) && savedLastVolume > 0
      ? savedLastVolume
      : 0.75;

  volumeAudio.volume =
    !Number.isNaN(savedVolume) && savedVolume >= 0 ? savedVolume : 0.75;

  volumeAudio.muted = savedMuted || volumeAudio.volume === 0;

  function hasSound() {
    return !volumeAudio.muted && volumeAudio.volume > 0;
  }

  function saveVolumeState() {
    localStorage.setItem("archiveVolume", volumeAudio.volume);
    localStorage.setItem("archiveMuted", volumeAudio.muted);

    if (volumeAudio.volume > 0) {
      localStorage.setItem("archiveLastVolume", volumeAudio.volume);
    }
  }

  function updateVolumeUI() {
    const percent = Math.round(volumeAudio.volume * 100);

    volumeSlider.value = volumeAudio.volume;
    volumePercent.textContent = `${percent}%`;

    if (hasSound()) {
      volumeIcon.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
      volumeToggle.classList.remove("is-muted");
    } else {
      volumeIcon.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
      volumeToggle.classList.add("is-muted");
      volumePanel.classList.remove("is-open");
    }

    saveVolumeState();
  }

  volumeToggle.addEventListener("click", () => {
    if (!hasSound()) {
      volumeAudio.muted = false;

      if (volumeAudio.volume === 0) {
        volumeAudio.volume = lastNonZeroVolume;
      }

      volumePanel.classList.add("is-open");
      updateVolumeUI();
      return;
    }

    volumePanel.classList.toggle("is-open");
  });

  volumeSlider.addEventListener("input", () => {
    const newVolume = Number(volumeSlider.value);

    volumeAudio.volume = newVolume;
    volumeAudio.muted = newVolume === 0;

    if (newVolume > 0) {
      lastNonZeroVolume = newVolume;
    }

    updateVolumeUI();
  });

  document.addEventListener("click", (event) => {
    const isClickInsideVolume = event.target.closest(".volume-widget");

    if (!isClickInsideVolume) {
      volumePanel.classList.remove("is-open");
    }
  });

  updateVolumeUI();
})();
