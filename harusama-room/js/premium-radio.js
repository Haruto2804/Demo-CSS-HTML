document.addEventListener('DOMContentLoaded', () => {
  const stations = document.querySelectorAll('.station-chip');
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

  const MIN_FREQ = 88.0;
  const MAX_FREQ = 108.0;
  
  let currentFreq = 88.5;
  let isPlaying = false;
  let isDragging = false;
  let masterVolume = 0.5;
  let rotation = 0; // -135 to 135

  // Parse station data
  const stationData = Array.from(stations).map(el => ({
    freq: parseFloat(el.dataset.freq),
    title: el.dataset.title,
    subtitle: el.dataset.subtitle,
    src: el.dataset.src,
    el: el
  }));

  let activeStationIndex = -1; // -1 means no station

  // Audio setup
  const musicAudio = new Audio();
  musicAudio.loop = true;

  // Web Audio API for White Noise
  let audioCtx;
  let noiseSource;
  let noiseGainNode;

  function initAudioContext() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    
    // Create White Noise Buffer
    const bufferSize = audioCtx.sampleRate * 2; // 2 seconds
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    
    // Apply lowpass filter to make the noise sound more like radio static (less harsh)
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3000;
    
    noiseGainNode = audioCtx.createGain();
    noiseGainNode.gain.value = 0; // start muted
    
    noiseSource.connect(filter);
    filter.connect(noiseGainNode);
    noiseGainNode.connect(audioCtx.destination);
    
    noiseSource.start(0);
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

  // Crossfade logic based on frequency
  function applyCrossfade(freq) {
    // Find closest station
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
      // In range of a station
      const fade = minDiff / TUNE_TOLERANCE; // 0 = perfect tune, 1 = edge
      const musicVol = Math.max(0, 1 - fade) * masterVolume;
      const noiseVol = fade * masterVolume * 0.2; // noise is generally louder, scale it down
      
      musicAudio.volume = musicVol;
      if (noiseGainNode) noiseGainNode.gain.value = noiseVol;
      
      // Update UI if we just switched to this station
      if (activeStationIndex !== index) {
        activeStationIndex = index;
        titleDisplay.textContent = closestStation.title;
        subtitleDisplay.textContent = closestStation.subtitle;
        
        // Handle audio source swap
        const wasPlaying = !musicAudio.paused && musicAudio.currentTime > 0;
        musicAudio.src = closestStation.src;
        if (isPlaying) musicAudio.play().catch(e => console.log(e));
        
        stations.forEach(s => s.classList.remove('active'));
        closestStation.el.classList.add('active');
        
        // Auto scroll to make the station chip visible
        closestStation.el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    } else {
      // Out of range (Static only)
      activeStationIndex = -1;
      musicAudio.volume = 0;
      if (noiseGainNode) noiseGainNode.gain.value = masterVolume * 0.2;
      
      titleDisplay.textContent = "Nhiễu sóng...";
      subtitleDisplay.textContent = "Tạp âm";
      timeDisplay.textContent = "--:--";
      
      stations.forEach(s => s.classList.remove('active'));
    }
  }

  function setFrequency(freq) {
    if (freq < MIN_FREQ) freq = MIN_FREQ;
    if (freq > MAX_FREQ) freq = MAX_FREQ;
    
    currentFreq = freq;
    
    // Update displays
    freqDisplay.textContent = currentFreq.toFixed(1);
    
    // Animate needle position
    const percent = ((currentFreq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 80 + 10;
    needle.style.left = `${percent}%`;
    
    applyCrossfade(currentFreq);
  }

  // --- DRAG & DROP LOGIC ---
  function handleDrag(e) {
    if (!isDragging) return;
    const rect = tuningScale.getBoundingClientRect();
    // Assuming 10% padding on each side for the needle travel (total 80% width)
    const padding = rect.width * 0.1;
    const travelWidth = rect.width * 0.8;
    
    let clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (!clientX) return;
    
    let x = clientX - rect.left - padding;
    let p = x / travelWidth;
    if (p < 0) p = 0;
    if (p > 1) p = 1;
    
    const freq = MIN_FREQ + p * (MAX_FREQ - MIN_FREQ);
    setFrequency(freq);
  }

  tuningScale.addEventListener('mousedown', (e) => {
    isDragging = true;
    handleDrag(e);
  });
  window.addEventListener('mousemove', handleDrag);
  window.addEventListener('mouseup', () => { isDragging = false; });

  tuningScale.addEventListener('touchstart', (e) => {
    isDragging = true;
    handleDrag(e);
  }, {passive: true});
  window.addEventListener('touchmove', handleDrag, {passive: true});
  window.addEventListener('touchend', () => { isDragging = false; });

  // --- CONTROLS ---

  // Setup click on stations
  stationData.forEach((station, idx) => {
    station.el.addEventListener('click', () => {
      setFrequency(station.freq);
    });
  });

  // Next / Prev buttons
  prevBtn.addEventListener('click', () => {
    let nextIdx = activeStationIndex - 1;
    if (nextIdx < 0) nextIdx = stationData.length - 1;
    setFrequency(stationData[nextIdx].freq);
  });

  nextBtn.addEventListener('click', () => {
    let nextIdx = (activeStationIndex + 1) % stationData.length;
    setFrequency(stationData[nextIdx].freq);
  });

  // Play / Pause toggle
  playBtn.addEventListener('click', () => {
    if (!audioCtx) initAudioContext();
    
    isPlaying = !isPlaying;
    const icon = playBtn.querySelector('i');
    
    if (isPlaying) {
      icon.classList.remove('fa-play');
      icon.classList.add('fa-pause');
      
      // Resume audio context if suspended
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      if (activeStationIndex !== -1) {
        musicAudio.play().catch(e => console.log('Play prevented:', e));
      }
      applyCrossfade(currentFreq); // Re-apply to set volumes correctly
      
      // Simulate static/connecting
      freqDisplay.parentElement.style.opacity = '0.5';
      setTimeout(() => { freqDisplay.parentElement.style.opacity = '1'; }, 300);
    } else {
      icon.classList.remove('fa-pause');
      icon.classList.add('fa-play');
      musicAudio.pause();
      if (noiseGainNode) noiseGainNode.gain.value = 0; // Mute noise when paused
    }
  });

  // Volume knob rotation on click
  volKnob.addEventListener('click', () => {
    rotation += 45;
    if (rotation > 135) rotation = -135; // cycle back to min
    volKnob.style.transform = `rotate(${rotation}deg)`;
    
    // Map rotation (-135 to 135) to volume (0.0 to 1.0)
    masterVolume = (rotation + 135) / 270;
    
    if (isPlaying) {
      applyCrossfade(currentFreq);
    }
  });

  // --- MOCK BUTTONS LOGIC ---
  starBtn.addEventListener('click', () => {
    starBtn.classList.toggle('star-active');
    // Flash display
    const originalText = titleDisplay.textContent;
    titleDisplay.textContent = starBtn.classList.contains('star-active') ? "ĐÃ LƯU KÊNH" : "ĐÃ BỎ LƯU";
    setTimeout(() => { titleDisplay.textContent = originalText; }, 1000);
  });

  antennaBtn.addEventListener('click', () => {
    antennaBtn.classList.toggle('antenna-active');
    const originalText = subtitleDisplay.textContent;
    subtitleDisplay.textContent = antennaBtn.classList.contains('antenna-active') ? "TĂNG CƯỜNG SÓNG..." : "SÓNG BÌNH THƯỜNG";
    // Reduce noise if boosted
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
      freqDisplay.textContent = (currentFreq * 10).toFixed(0); // Mock AM frequency look
      freqDisplay.nextElementSibling.textContent = "KHz";
    } else {
      bands[1].classList.remove('active');
      bands[0].classList.add('active');
      bandDisplay.textContent = "FM 1";
      freqDisplay.textContent = currentFreq.toFixed(1);
      freqDisplay.nextElementSibling.textContent = "MHz";
    }
  });

  const areas = ["Default", "Global", "Japan", "Vietnam"];
  let currentArea = 0;
  areaBtn.addEventListener('click', () => {
    currentArea = (currentArea + 1) % areas.length;
    areaBtn.querySelector('.area-value').innerHTML = areas[currentArea] + ' <i class="fa-solid fa-chevron-right" style="font-size:12px;margin-left:4px;"></i>';
    // Fake retuning static
    if (isPlaying && activeStationIndex !== -1) {
      musicAudio.volume = 0;
      if (noiseGainNode) noiseGainNode.gain.value = masterVolume * 0.3;
      setTimeout(() => { applyCrossfade(currentFreq); }, 600);
    }
  });

  stereoBtn.addEventListener('click', () => {
    stereoBtn.classList.toggle('active');
    const span = stereoBtn.querySelector('span');
    if (stereoBtn.classList.contains('active')) {
      span.textContent = "STEREO";
    } else {
      span.textContent = "MONO";
    }
  });

  // Initialize display but don't autoplay
  setFrequency(stationData[0].freq);
});
