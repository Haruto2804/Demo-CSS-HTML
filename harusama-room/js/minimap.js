// ===============================
// MINIMAP NAVIGATION SYSTEM
// ===============================

(() => {
  // Inject the Minimap CSS if not already present
  if (!document.querySelector('link[href*="minimap.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './css/minimap.css';
    document.head.appendChild(link);
  }

  // Define the map structure and routes
  const rooms = {
    rooftop: { id: "mm-rooftop", icon: "📻", title: "Ban Công", url: "rooftop.html" },
    attic: { id: "mm-attic", icon: "🕰️", title: "Gác Xép", url: "attic.html" },
    main: { id: "mm-main", icon: "🛋️", title: "Phòng Chính", url: "index.html" },
    gallery: { id: "mm-gallery", icon: "🖼️", title: "Ký Ức", url: "gallery.html" },
    cinema: { id: "mm-cinema", icon: "🎞️", title: "Chiếu Phim", url: "tiktok-room.html" },
    message: { id: "mm-message", icon: "💌", title: "Hộp Thư", url: "message.html" },
    reading: { id: "mm-reading", icon: "📖", title: "Đọc Sách", url: "reading-room.html" }
  };

  // Determine current room based on URL
  const path = window.location.pathname;
  let currentRoomKey = "main"; // default
  
  // Find which room matches the current URL
  for (const key in rooms) {
    if (path.endsWith(rooms[key].url)) {
      currentRoomKey = key;
      break;
    }
  }

  // If we are at the root (e.g. / or localhost:3000/), default to main
  if (path.endsWith("/") || path.endsWith("\\")) {
    currentRoomKey = "main";
  }

  // Generate HTML for the minimap
  let minimapHTML = `
    <div class="minimap-container" id="globalMinimap">
      <div class="minimap-title">Map</div>
      <div class="minimap-grid">
        <!-- Connecting Paths -->
        <div class="minimap-path path-vertical mm-conn-attic-rooftop"></div>
        <div class="minimap-path path-vertical mm-conn-main-attic"></div>
        <div class="minimap-path path-horizontal mm-conn-cinema-main"></div>
        <div class="minimap-path path-horizontal mm-conn-main-gallery"></div>
        <div class="minimap-path path-vertical mm-conn-cinema-message"></div>
        <div class="minimap-path path-vertical mm-conn-message-reading"></div>
  `;

  // Generate Room Nodes
  for (const key in rooms) {
    const room = rooms[key];
    const isActive = key === currentRoomKey ? "is-active" : "";
    minimapHTML += `
      <div id="${room.id}" class="minimap-room ${isActive}" data-title="${room.title}" data-url="${room.url}">
        ${room.icon}
      </div>
    `;
  }

  minimapHTML += `
      </div>
    </div>
  `;

  // Inject into DOM
  document.body.insertAdjacentHTML('beforeend', minimapHTML);

  // --- IMMERSIVE ROOM TRANSITION ---
  
  // Function to trigger walk-through animation
  function triggerWalkThrough(targetUrl) {
    // Prevent double clicking
    document.body.style.pointerEvents = "none";
    
    // Trigger CSS exit animations (fades to black via body::after)
    document.body.classList.add('is-exiting');
    
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 550);
  }

  // Add click events to Minimap to navigate
  document.querySelectorAll('.minimap-room').forEach(roomEl => {
    roomEl.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent the container click handler from triggering

      // Don't navigate if already on the active room
      if (roomEl.classList.contains('is-active')) return;

      const targetUrl = roomEl.dataset.url;
      triggerWalkThrough(targetUrl);
    });
  });

  // Add click events to physical doors in the rooms
  document.querySelectorAll('.door-card').forEach(door => {
    door.addEventListener('click', (e) => {
      const targetUrl = door.getAttribute('href');
      // Only apply if it's an internal link
      if (targetUrl && !targetUrl.startsWith('http') && !targetUrl.startsWith('#')) {
        e.preventDefault();
        triggerWalkThrough(targetUrl);
      }
    });
  });

  // Mobile/Click toggle logic for expansion
  const minimapContainer = document.getElementById('globalMinimap');
  if (minimapContainer) {
    minimapContainer.addEventListener('click', () => {
      minimapContainer.classList.add('is-expanded');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (minimapContainer.classList.contains('is-expanded') && !minimapContainer.contains(e.target)) {
        minimapContainer.classList.remove('is-expanded');
      }
    });
  }

})();
