import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const topbar = document.querySelector("[data-auth-topbar]");
const authToggle = document.querySelector("[data-auth-toggle]");

const loginLinks = document.querySelectorAll("[data-login-link]");
const logoutButtons = document.querySelectorAll("[data-logout-btn]");

const userNameList = document.querySelectorAll("[data-user-name]");
const userEmailList = document.querySelectorAll("[data-user-email]");
const userAvatarList = document.querySelectorAll("[data-user-avatar]");

function setText(elements, text) {
  elements.forEach((el) => {
    el.textContent = text;
  });
}

function closeAuthMenu() {
  if (!topbar || !authToggle) return;

  topbar.classList.remove("is-open");
  authToggle.setAttribute("aria-expanded", "false");
}

function renderUser(user) {
  if (user) {
    setText(userNameList, user.displayName || "Google User");
    setText(userEmailList, user.email || "");

    userAvatarList.forEach((img) => {
      if (user.photoURL) {
        img.src = user.photoURL;
        img.alt = user.displayName || "User avatar";
        img.hidden = false;
      } else {
        img.hidden = true;
      }
    });

    loginLinks.forEach((link) => {
      link.hidden = true;
    });

    logoutButtons.forEach((btn) => {
      btn.hidden = false;
      btn.disabled = false;
      btn.classList.remove("is-disabled");
    });
  } else {
    setText(userNameList, "Guest");
    setText(userEmailList, "Đăng nhập để mở khóa phòng");

    userAvatarList.forEach((img) => {
      img.hidden = true;
      img.removeAttribute("src");
    });

    loginLinks.forEach((link) => {
      link.hidden = false;
    });

    logoutButtons.forEach((btn) => {
      btn.hidden = true;
      btn.disabled = true;
      btn.classList.add("is-disabled");
    });
  }
}

logoutButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    try {
      btn.disabled = true;
      await signOut(auth);
      closeAuthMenu();
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      btn.disabled = false;
    }
  });
});

if (authToggle && topbar) {
  authToggle.addEventListener("click", () => {
    const isOpen = topbar.classList.toggle("is-open");
    authToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!topbar.contains(event.target)) {
      closeAuthMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
      closeAuthMenu();
    }
  });
}

onAuthStateChanged(auth, (user) => {
  renderUser(user);
});
