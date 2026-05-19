const cursorGlow = document.querySelector(".vintage-cursor-glow");

document.addEventListener("mousemove", (e) => {
  cursorGlow.style.left = e.clientX + "px";
  cursorGlow.style.top = e.clientY + "px";
});
const moodTracks = document.querySelectorAll(".mood-track");

moodTracks.forEach((track) => {
  track.addEventListener("mouseenter", () => {
    cursorGlow.classList.add("is-hovering-track");
  });

  track.addEventListener("mouseleave", () => {
    cursorGlow.classList.remove("is-hovering-track");
  });
});
