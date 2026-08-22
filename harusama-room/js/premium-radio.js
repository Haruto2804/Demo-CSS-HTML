document.addEventListener('DOMContentLoaded', () => {
  const stationsContainer = document.getElementById('pr-stations');
  const stationsCount = document.getElementById('pr-count');
  const freqDisplay = document.getElementById('pr-freq');
  const titleDisplay = document.getElementById('pr-title');
  const subtitleDisplay = document.getElementById('pr-subtitle');
  const timeDisplay = document.getElementById('pr-time');
  const needle = document.getElementById('pr-needle');
  const prevBtn = document.getElementById('pr-prev');
  const nextBtn = document.getElementById('pr-next');
  const playBtn = document.getElementById('pr-play');
  const volKnob = document.getElementById('pr-vol-knob');
  const tuningScale = document.querySelector('.tuning-scale');

  // Extra Mock Buttons
  const starBtn = document.querySelectorAll('.left-actions .action-btn')[0];
  const antennaBtn = document.querySelectorAll('.left-actions .action-btn')[1];
  const bandToggle = document.querySelector('.band-toggle');
  const areaBtn = document.querySelector('.radio-area-btn');
  const stereoBtn = document.querySelector('.stereo-btn');
  const bandDisplay = document.getElementById('pr-band');

  const MIN_FREQ = 80.0;
  const MAX_FREQ = 110.0;

  let currentFreq = 88.5;
  let isPlaying = false;
  let isDragging = false;
  let masterVolume = 0.5;
  let rotation = 0; // -135 to 135

  // --- RADIO DATABASE ---
  const radioDatabase = {
    "Vietnam": [
      { freq: 88.5, title: "Là Chính Mình", subtitle: "Không cần trở thành ai khác", src: "./assets/music/radio/la_chinh_minh.mp3" },
      { freq: 99.9, title: "Phương Hằng", subtitle: "Kênh hóng Drama", src: "./assets/music/radio/phuong_hang.mp3" },
      { freq: 104.2, title: "Lofi Nights", subtitle: "Nhạc nền cho những đêm không muốn ngủ", src: "./assets/music/radio/lofi_music.mp3" }
    ],
    "Global": [
      { freq: 91.2, title: "Beat It", subtitle: "Turn it up and let the rhythm take over", src: "./assets/music/radio/global/beat_it.mp3" },
      { freq: 95.5, title: "Daily Life", subtitle: "Những câu chuyện nhỏ của một ngày bình thường", src: "./assets/music/radio/global/daily_life_podcast.mp3" },
      { freq: 101.5, title: "Lofi List", subtitle: "Chill nhẹ, làm việc sâu, để thời gian trôi", src: "./assets/music/radio/global/lofi_list.mp3" }
    ],
    "Japan": [
      { freq: 81.3, title: "Lemon", subtitle: "Một chút dịu dàng giữa những ngày cô đơn", src: "./assets/music/radio/japan/lemon.mp3" },
      { freq: 89.7, title: "Japanese Moments", subtitle: "Một góc Nhật Bản qua những câu chuyện đời thường", src: "./assets/music/radio/japan/japanese_podcast.mp3" },
      { freq: 107.0, title: "Dancer Night", subtitle: "Ánh đèn đêm và những bước nhảy không ngủ", src: "./assets/music/radio/japan/dancer_night.mp3" }
    ],
    "China": [
      { freq: 88.8, title: "Chinese Chill", subtitle: "Giai điệu Trung Hoa cho những phút thư giãn", src: "./assets/music/radio/china/cool_music.mp3" },
      { freq: 96.0, title: "Du Kính", subtitle: "Cổ phong, huyền ảo và một chút hoài niệm", src: "./assets/music/radio/china/du_kinh.mp3" },
      { freq: 103.5, title: "Phá Kén", subtitle: "Phá vỡ giới hạn, bước vào một thế giới mới", src: "./assets/music/radio/china/pha_ken.mp3" }
    ],
    "Music": [
      { freq: 90.0, title: "Bao Tiền Một Mơ", subtitle: "Một chút bình yên giữa những ngày vội vã", src: "./assets/music/BaoTienMotMoBinhYen.mp3" },
      { freq: 92.5, title: "Giờ Thì", subtitle: "Có những chuyện chỉ hiểu khi đã đi qua", src: "./assets/music/GioThi.mp3" },
      { freq: 95.0, title: "Một Đêm Say", subtitle: "Đêm nay, cứ để cảm xúc lên tiếng", src: "./assets/music/MotDemSay.mp3" },
      { freq: 97.5, title: "Một Đời", subtitle: "Những điều ta giữ lại sau một đời", src: "./assets/music/MotDoi.mp3" },
      { freq: 100.0, title: "Qua Khung Cửa Sổ", subtitle: "Nhìn thế giới trôi qua thật chậm", src: "./assets/music/QuaKhungCuaSo.mp3" },
      { freq: 102.5, title: "Vì Anh Đâu Có Biết", subtitle: "Có những điều chẳng thể nói thành lời", src: "./assets/music/ViAnhDauCoBiet.mp3" }
    ]
  };

  const areas = Object.keys(radioDatabase);
  let currentAreaIndex = 0;
  let stationData = []; // Will be populated based on selected area
  let activeStationIndex = -1; // -1 means no station

  // Audio setup
  const musicAudio = new Audio();
  musicAudio.crossOrigin = "anonymous"; // Needed for Web Audio API
  musicAudio.loop = true;

  // Web Audio API for White Noise and Music Routing
  let audioCtx;
  let noiseSource;
  let noiseGainNode;
  let musicSourceNode;
  let monoNode;
  let musicGainNode;

  function initAudioContext() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    
    // --- White Noise Setup ---
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3000;
    
    noiseGainNode = audioCtx.createGain();
    noiseGainNode.gain.value = 0;
    
    noiseSource.connect(filter);
    filter.connect(noiseGainNode);
    noiseGainNode.connect(audioCtx.destination);
    
    noiseSource.start(0);

    // --- Music Routing Setup (For Mono/Stereo) ---
    musicSourceNode = audioCtx.createMediaElementSource(musicAudio);
    
    // Create a node that forces Mono downmixing
    monoNode = audioCtx.createGain();
    monoNode.channelCount = 1;
    monoNode.channelCountMode = 'explicit';
    
    // Create a Gain node to control music volume (since Web Audio bypasses audio.volume)
    musicGainNode = audioCtx.createGain();
    musicGainNode.gain.value = 1;
    
    // Default Routing: Source -> musicGainNode -> Destination (Stereo)
    musicSourceNode.connect(musicGainNode);
    musicGainNode.connect(audioCtx.destination);
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  musicAudio.addEventListener('timeupdate', () => {
    timeDisplay.textContent = formatTime(musicAudio.currentTime);
  });

  // Render stations based on area
  function renderStations(areaKey) {
    const data = radioDatabase[areaKey];
    stationsContainer.innerHTML = ''; // Clear existing
    stationData = [];

    stationsCount.textContent = data.length;
    areaBtn.querySelector('.area-value').innerHTML = areaKey + ' <i class="fa-solid fa-chevron-right" style="font-size:12px;margin-left:4px;"></i>';

    data.forEach((s, idx) => {
      const btn = document.createElement('button');
      btn.className = 'station-chip';
      btn.dataset.freq = s.freq;
      btn.dataset.title = s.title;
      btn.dataset.subtitle = s.subtitle;
      btn.dataset.src = s.src;

      btn.innerHTML = `${idx + 1}. ${s.title.split(' ')[0]}... <span class="chip-freq">${s.freq}</span>`;

      btn.addEventListener('click', () => {
        tuneToStation(s.freq);
      });

      stationsContainer.appendChild(btn);

      stationData.push({
        freq: s.freq,
        title: s.title,
        subtitle: s.subtitle,
        src: s.src,
        el: btn
      });
    });
  }

  // Crossfade logic based on frequency
  function applyCrossfade(freq) {
    let closestStation = null;
    let minDiff = 100;
    let index = -1;

    stationData.forEach((s, i) => {
      const diff = Math.abs(freq - s.freq);
      if (diff < minDiff) {
        minDiff = diff;
        closestStation = s;
        index = i;
      }
    });

    const TUNE_TOLERANCE = 0.5; // KHz

    if (minDiff <= TUNE_TOLERANCE) {
      const fade = minDiff / TUNE_TOLERANCE;
      const musicVol = Math.max(0, 1 - fade) * masterVolume;
      const noiseVol = fade * masterVolume * 0.2;
      
      musicAudio.volume = musicVol;
      if (musicGainNode) musicGainNode.gain.value = musicVol;
      if (noiseGainNode) noiseGainNode.gain.value = noiseVol;

      if (activeStationIndex !== index) {
        activeStationIndex = index;
        titleDisplay.textContent = closestStation.title;
        subtitleDisplay.textContent = closestStation.subtitle;

        const wasPlaying = !musicAudio.paused && musicAudio.currentTime > 0;
        musicAudio.src = closestStation.src;
        if (isPlaying) musicAudio.play().catch(e => console.log(e));

        stationData.forEach(s => s.el.classList.remove('active'));
        closestStation.el.classList.add('active');

        // Auto scroll to make the station chip visible
        closestStation.el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    } else {
      activeStationIndex = -1;
      musicAudio.volume = 0;
      if (musicGainNode) musicGainNode.gain.value = 0;
      if (noiseGainNode) noiseGainNode.gain.value = masterVolume * 0.2;

      titleDisplay.textContent = "Nhiễu sóng...";
      subtitleDisplay.textContent = "Tạp âm";
      timeDisplay.textContent = "--:--";

      stationData.forEach(s => s.el.classList.remove('active'));
    }
  }

  function setFrequency(freq) {
    if (freq < MIN_FREQ) freq = MIN_FREQ;
    if (freq > MAX_FREQ) freq = MAX_FREQ;

    currentFreq = freq;
    freqDisplay.textContent = currentFreq.toFixed(1);

    const percent = ((currentFreq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 80 + 10;
    needle.style.left = `${percent}%`;

    applyCrossfade(currentFreq);
  }

  function tuneToStation(freq) {
    if (freq === currentFreq) return;
    
    // Fake retuning static effect
    if (isPlaying) {
      musicAudio.volume = 0;
      if (musicGainNode) musicGainNode.gain.value = 0;
      if (noiseGainNode) noiseGainNode.gain.value = masterVolume * 0.3;
    }
    
    // Move needle instantly but don't play yet
    currentFreq = freq;
    freqDisplay.textContent = currentFreq.toFixed(1);
    const percent = ((currentFreq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 80 + 10;
    needle.style.left = `${percent}%`;
    
    titleDisplay.textContent = "Đang dò sóng...";
    subtitleDisplay.textContent = "Tạp âm";
    timeDisplay.textContent = "--:--";
    stationData.forEach(s => s.el.classList.remove('active'));
    
    // Wait 600ms before locking in the station
    clearTimeout(window.tuneTimeout);
    window.tuneTimeout = setTimeout(() => {
      applyCrossfade(currentFreq);
    }, 600);
  }

  // --- DRAG & DROP LOGIC ---
  function handleDrag(e) {
    if (!isDragging) return;
    const rect = tuningScale.getBoundingClientRect();
    const padding = rect.width * 0.1;
    const travelWidth = rect.width * 0.8;

    let clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (!clientX) return;

    let x = clientX - rect.left - padding;
    let p = x / travelWidth;
    if (p < 0) p = 0;
    if (p > 1) p = 1;

    const freq = MIN_FREQ + p * (MAX_FREQ - MIN_FREQ);
    
    // Clear any pending button tune
    clearTimeout(window.tuneTimeout);
    setFrequency(freq);
  }

  tuningScale.addEventListener('mousedown', (e) => { isDragging = true; handleDrag(e); });
  window.addEventListener('mousemove', handleDrag);
  window.addEventListener('mouseup', () => { isDragging = false; });
  tuningScale.addEventListener('touchstart', (e) => { isDragging = true; handleDrag(e); }, { passive: true });
  window.addEventListener('touchmove', handleDrag, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });

  // --- CONTROLS ---
  prevBtn.addEventListener('click', () => {
    let nextIdx = activeStationIndex - 1;
    if (nextIdx < 0) nextIdx = stationData.length - 1;
    tuneToStation(stationData[nextIdx].freq);
  });

  nextBtn.addEventListener('click', () => {
    let nextIdx = (activeStationIndex + 1) % stationData.length;
    tuneToStation(stationData[nextIdx].freq);
  });

  playBtn.addEventListener('click', () => {
    if (!audioCtx) initAudioContext();

    isPlaying = !isPlaying;
    const icon = playBtn.querySelector('i');

    if (isPlaying) {
      icon.classList.remove('fa-play');
      icon.classList.add('fa-pause');
      if (audioCtx.state === 'suspended') audioCtx.resume();

      if (activeStationIndex !== -1) {
        musicAudio.play().catch(e => console.log('Play prevented:', e));
      }
      applyCrossfade(currentFreq);

      freqDisplay.parentElement.style.opacity = '0.5';
      setTimeout(() => { freqDisplay.parentElement.style.opacity = '1'; }, 300);
    } else {
      icon.classList.remove('fa-pause');
      icon.classList.add('fa-play');
      musicAudio.pause();
      if (noiseGainNode) noiseGainNode.gain.value = 0;
    }
  });

  volKnob.addEventListener('click', () => {
    rotation += 45;
    if (rotation > 135) rotation = -135;
    volKnob.style.transform = `rotate(${rotation}deg)`;
    masterVolume = (rotation + 135) / 270;
    if (isPlaying) applyCrossfade(currentFreq);
  });

  // --- MOCK BUTTONS LOGIC ---
  starBtn.addEventListener('click', () => {
    starBtn.classList.toggle('star-active');
    const originalText = titleDisplay.textContent;
    titleDisplay.textContent = starBtn.classList.contains('star-active') ? "ĐÃ LƯU KÊNH" : "ĐÃ BỎ LƯU";
    setTimeout(() => { titleDisplay.textContent = originalText; }, 1000);
  });

  antennaBtn.addEventListener('click', () => {
    antennaBtn.classList.toggle('antenna-active');
    const originalText = subtitleDisplay.textContent;
    subtitleDisplay.textContent = antennaBtn.classList.contains('antenna-active') ? "TĂNG CƯỜNG SÓNG..." : "SÓNG BÌNH THƯỜNG";
    if (antennaBtn.classList.contains('antenna-active') && noiseGainNode) {
      noiseGainNode.gain.value = noiseGainNode.gain.value * 0.5;
    }
    setTimeout(() => { subtitleDisplay.textContent = originalText; }, 1500);
  });

  bandToggle.addEventListener('click', () => {
    const bands = bandToggle.querySelectorAll('.band');
    if (bands[0].classList.contains('active')) {
      bands[0].classList.remove('active');
      bands[1].classList.add('active');
      bandDisplay.textContent = "AM 7";
      freqDisplay.textContent = (currentFreq * 10).toFixed(0);
      freqDisplay.nextElementSibling.textContent = "KHz";
    } else {
      bands[1].classList.remove('active');
      bands[0].classList.add('active');
      bandDisplay.textContent = "FM 1";
      freqDisplay.textContent = currentFreq.toFixed(1);
      freqDisplay.nextElementSibling.textContent = "MHz";
    }
  });

  areaBtn.addEventListener('click', () => {
    currentAreaIndex = (currentAreaIndex + 1) % areas.length;
    const newArea = areas[currentAreaIndex];

    // Fake retuning static
    if (isPlaying) {
      musicAudio.volume = 0;
      if (musicGainNode) musicGainNode.gain.value = 0;
      if (noiseGainNode) noiseGainNode.gain.value = masterVolume * 0.3;
    }

    // Switch area and render new stations
    renderStations(newArea);

    // Retune to the first station of the new area automatically
    if (stationData.length > 0) {
      setTimeout(() => {
        setFrequency(stationData[0].freq);
      }, 600);
    }
  });

  stereoBtn.addEventListener('click', () => {
    stereoBtn.classList.toggle('active');
    const span = stereoBtn.querySelector('span');
    const isMono = !stereoBtn.classList.contains('active');
    
    if (audioCtx && musicSourceNode && musicGainNode) {
      // Disconnect all current routing for music
      musicSourceNode.disconnect();
      monoNode.disconnect();
      
      if (isMono) {
        span.textContent = "MONO";
        // Route through Mono downmixer then to Gain
        musicSourceNode.connect(monoNode);
        monoNode.connect(musicGainNode);
      } else {
        span.textContent = "STEREO";
        // Route directly to Gain (Stereo)
        musicSourceNode.connect(musicGainNode);
      }
    } else {
      // If audio context not yet initialized, just update UI
      span.textContent = isMono ? "MONO" : "STEREO";
    }
  });

  // Initial render
  renderStations(areas[0]);
  if (stationData.length > 0) {
    setFrequency(stationData[0].freq);
  }
});
