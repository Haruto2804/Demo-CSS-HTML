import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account",
});

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const statusEl = document.getElementById("status");

function showDefaultStatus() {
  statusEl.innerHTML = `
    Chưa có tài khoản Google?
    <a
      href="https://accounts.google.com/signup"
      target="_blank"
      rel="noopener noreferrer"
    >
      Đăng kí tại đây
    </a>
  `;
}

loginBtn.addEventListener("click", async () => {
  try {
    loginBtn.disabled = true;
    statusEl.textContent = "Đang mở cửa sổ đăng nhập Google...";

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log("User đăng nhập:", user);
    console.log("UID:", user.uid);
    console.log("Email:", user.email);

    loginBtn.hidden = true;
    logoutBtn.hidden = false;

    statusEl.innerHTML = `
      Đã đăng nhập thành công<br />
      <strong>${user.displayName || "Google User"}</strong><br />
      <small>${user.email || ""}</small>
    `;

    const afterLogin = document.body.dataset.afterLogin || "./index.html";

    setTimeout(() => {
      window.location.href = afterLogin;
    }, 700);
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);

    loginBtn.disabled = false;

    if (error.code === "auth/popup-closed-by-user") {
      statusEl.textContent = "Bạn đã đóng cửa sổ đăng nhập.";
    } else if (error.code === "auth/popup-blocked") {
      statusEl.textContent =
        "Trình duyệt đã chặn popup. Hãy cho phép popup rồi thử lại.";
    } else if (error.code === "auth/unauthorized-domain") {
      statusEl.textContent =
        "Domain hiện tại chưa được thêm vào Firebase Authorized domains.";
    } else {
      statusEl.textContent = "Đăng nhập thất bại. Mở Console để xem lỗi.";
    }
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    logoutBtn.disabled = true;
    statusEl.textContent = "Đang đăng xuất...";

    await signOut(auth);
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
    statusEl.textContent = "Đăng xuất thất bại.";
  } finally {
    logoutBtn.disabled = false;
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.hidden = true;
    logoutBtn.hidden = false;

    statusEl.innerHTML = `
      Đã đăng nhập thành công<br />
      <strong>${user.displayName || "Google User"}</strong><br />
      <small>${user.email || ""}</small>
    `;
  } else {
    loginBtn.hidden = false;
    logoutBtn.hidden = true;
    loginBtn.disabled = false;

    showDefaultStatus();
  }
});
