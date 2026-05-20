import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  collection,
  getDoc,
  setDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const ADMIN_EMAIL = "baokhongwibu2005@gmail.com";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let isAdmin = false;
let currentPhoto = null;
let userLiked = false;

let likeCount = 0;
let commentCount = 0;
let latestComments = [];

let unsubscribeLikes = null;
let unsubscribeComments = null;

const params = new URLSearchParams(window.location.search);
const photoId = params.get("id");

const photoDetail = document.getElementById("photoDetail");
const detailLikeBtn = document.getElementById("detailLikeBtn");
const commentForm = document.getElementById("commentForm");
const commentInput = document.getElementById("commentInput");
const commentList = document.getElementById("commentList");

function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getPhotoImageUrl(photo) {
  return photo.imageUrl || photo.url || photo.src || photo.secureUrl || "";
}

function formatFirestoreTime(value) {
  if (!value) return "";

  let date = null;

  if (typeof value.toDate === "function") {
    date = value.toDate();
  } else if (value instanceof Date) {
    date = value;
  } else {
    date = new Date(value);
  }

  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function updateStatsUI() {
  const likeCountEl = document.getElementById("detailLikeCount");
  const commentCountEl = document.getElementById("detailCommentCount");

  if (likeCountEl) likeCountEl.textContent = likeCount;
  if (commentCountEl) commentCountEl.textContent = commentCount;
}

function renderLikeButton() {
  if (!detailLikeBtn) return;

  detailLikeBtn.innerHTML = userLiked ? "♥ Đã thích" : "♡ Thích";
  detailLikeBtn.classList.toggle("is-liked", userLiked);
}

function renderPhoto(photo) {
  if (!photoDetail) return;

  const tags = Array.isArray(photo.tags) ? photo.tags : [];
  const imageUrl = getPhotoImageUrl(photo);

  photoDetail.innerHTML = `
    <figure class="photo-detail-media detail-image-wrap">
      ${
        imageUrl
          ? `
            <img
              class="photo-detail-image"
              src="${escapeHtml(imageUrl)}"
              alt="${escapeHtml(photo.title || "Harusama memory")}"
            />
          `
          : `<p class="empty-text">Ảnh này chưa có URL hình.</p>`
      }
    </figure>

    <div class="photo-detail-content detail-info">
      <p class="chapter chapter-gold">
        ${escapeHtml(photo.category || "memory")}
      </p>

      <h1>${escapeHtml(photo.title || "Untitled Memory")}</h1>

      ${
        photo.subtitle
          ? `<p class="detail-subtitle">${escapeHtml(photo.subtitle)}</p>`
          : ""
      }

      <div class="detail-meta-grid">
        <span>
          <strong>Ngày:</strong>
          ${escapeHtml(photo.takenAt || "Không rõ")}
        </span>

        <span>
          <strong>Địa điểm:</strong>
          ${escapeHtml(photo.location || "Không rõ")}
        </span>
      </div>

      <p class="detail-description">
        ${escapeHtml(photo.description || "Chưa có mô tả cho tấm ảnh này.")}
      </p>

      ${
        tags.length
          ? `
            <div class="archive-tags">
              ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
            </div>
          `
          : ""
      }

      <div class="detail-stats">
        <span>
          <i class="fa-solid fa-heart"></i>
          <b id="detailLikeCount">${likeCount}</b> lượt thích
        </span>

        <span>
          <i class="fa-regular fa-comment"></i>
          <b id="detailCommentCount">${commentCount}</b> bình luận
        </span>
      </div>

      ${
        isAdmin
          ? `
            <div class="photo-detail-actions">
              <button
                class="archive-btn danger detail-delete-btn"
                type="button"
                data-delete-photo
              >
                <i class="fa-solid fa-trash"></i>
                Xóa ảnh
              </button>
            </div>
          `
          : ""
      }
    </div>
  `;

  updateStatsUI();
}

async function toggleLike() {
  if (!currentUser) {
    window.location.href = "./login.html";
    return;
  }

  if (!photoId) return;

  const likeRef = doc(db, "gallery", photoId, "likes", currentUser.uid);

  try {
    if (userLiked) {
      await deleteDoc(likeRef);
    } else {
      await setDoc(likeRef, {
        uid: currentUser.uid,
        displayName: currentUser.displayName || "Google User",
        email: currentUser.email || "",
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Không thể cập nhật lượt thích:", error);
    alert("Không thể cập nhật lượt thích. Hãy kiểm tra Firestore Rules.");
  }
}

function watchLikes() {
  if (!photoId) return;

  if (unsubscribeLikes) {
    unsubscribeLikes();
  }

  const likesRef = collection(db, "gallery", photoId, "likes");

  unsubscribeLikes = onSnapshot(
    likesRef,
    (snapshot) => {
      likeCount = snapshot.size;

      userLiked = currentUser
        ? snapshot.docs.some((docSnap) => docSnap.id === currentUser.uid)
        : false;

      updateStatsUI();
      renderLikeButton();
    },
    (error) => {
      console.error("Không thể đọc likes:", error);
    },
  );
}

function renderCommentList() {
  if (!commentList) return;

  latestComments = latestComments.filter((comment) => !comment.isDeleted);

  commentCount = latestComments.length;
  updateStatsUI();

  if (!latestComments.length) {
    commentList.innerHTML = `<p class="empty-text">Chưa có bình luận.</p>`;
    return;
  }

  commentList.innerHTML = latestComments
    .map((comment) => {
      const canDelete =
        isAdmin || (currentUser && currentUser.uid === comment.uid);

      const createdTime = formatFirestoreTime(comment.createdAt);

      return `
        <article class="comment-card">
          <div class="comment-content">
            <div class="comment-top">
              <h4>${escapeHtml(comment.displayName || "Google User")}</h4>

              ${
                createdTime
                  ? `<small class="comment-time">${escapeHtml(createdTime)}</small>`
                  : ""
              }
            </div>

            <p>${escapeHtml(comment.text || "")}</p>
          </div>

          ${
            canDelete
              ? `
                <div class="photo-detail-actions comment-actions">
                  <button
                    class="archive-btn danger comment-delete-btn"
                    type="button"
                    data-delete-comment="${escapeHtml(comment.id)}"
                  >
                    <i class="fa-solid fa-trash"></i>
                    
                  </button>
                </div>
              `
              : ""
          }
        </article>
      `;
    })
    .join("");
}

function watchComments() {
  if (!photoId) return;

  if (unsubscribeComments) {
    unsubscribeComments();
  }

  const commentsQuery = query(
    collection(db, "gallery", photoId, "comments"),
    orderBy("createdAt", "desc"),
  );

  unsubscribeComments = onSnapshot(
    commentsQuery,
    (snapshot) => {
      latestComments = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      renderCommentList();
    },
    (error) => {
      console.error("Không thể đọc comments:", error);

      if (commentList) {
        commentList.innerHTML = `
          <p class="empty-text">
            Không thể tải bình luận. Hãy kiểm tra Firestore Rules.
          </p>
        `;
      }
    },
  );
}

async function addComment(event) {
  event.preventDefault();

  if (!currentUser) {
    window.location.href = "./login.html";
    return;
  }

  if (!photoId) return;

  const text = commentInput.value.trim();

  if (!text) return;

  try {
    await addDoc(collection(db, "gallery", photoId, "comments"), {
      uid: currentUser.uid,
      displayName: currentUser.displayName || "Google User",
      email: currentUser.email || "",
      photoId,
      text,
      createdAt: serverTimestamp(),
    });

    commentInput.value = "";
  } catch (error) {
    console.error("Không thể gửi bình luận:", error);
    alert("Không thể gửi bình luận. Hãy kiểm tra Firestore Rules.");
  }
}

async function deleteComment(commentId) {
  if (!currentUser) {
    window.location.href = "./login.html";
    return;
  }

  if (!photoId || !commentId) return;

  const ok = confirm("Xóa bình luận này?");
  if (!ok) return;

  try {
    await deleteDoc(doc(db, "gallery", photoId, "comments", commentId));
  } catch (error) {
    console.error("Không thể xóa bình luận:", error);

    alert(
      "Không thể xóa bình luận. Hãy kiểm tra Firestore Rules: user phải được quyền xóa comment của chính mình.",
    );
  }
}

async function deleteCollectionDocs(collectionRef) {
  const snapshot = await getDocs(collectionRef);

  if (snapshot.empty) return;

  const docs = snapshot.docs;
  const chunkSize = 450;

  for (let i = 0; i < docs.length; i += chunkSize) {
    const batch = writeBatch(db);
    const chunk = docs.slice(i, i + chunkSize);

    chunk.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
  }
}

async function deleteCurrentPhoto() {
  if (!currentUser) {
    window.location.href = "./login.html";
    return;
  }

  if (!isAdmin) {
    alert("Chỉ admin mới có quyền xóa ảnh.");
    return;
  }

  if (!photoId) return;

  const title = currentPhoto?.title || "ảnh này";
  const deleteTime = formatFirestoreTime(new Date());

  const ok = confirm(
    `Xóa "${title}"?\n\nThời gian xóa: ${deleteTime}\n\nẢnh sẽ bị xóa khỏi gallery, kèm theo lượt thích và bình luận.`,
  );

  if (!ok) return;

  const deleteBtn = document.querySelector("[data-delete-photo]");
  const oldText = deleteBtn ? deleteBtn.innerHTML : "";

  try {
    if (deleteBtn) {
      deleteBtn.disabled = true;
      deleteBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang xóa...`;
    }

    if (unsubscribeLikes) unsubscribeLikes();
    if (unsubscribeComments) unsubscribeComments();

    await deleteCollectionDocs(collection(db, "gallery", photoId, "likes"));
    await deleteCollectionDocs(collection(db, "gallery", photoId, "comments"));

    await deleteDoc(doc(db, "gallery", photoId));

    alert(`Đã xóa ảnh lúc ${deleteTime}.`);
    window.location.href = "./gallery.html";
  } catch (error) {
    console.error("Không thể xóa ảnh:", error);
    alert("Không thể xóa ảnh. Hãy kiểm tra Firestore Rules.");

    if (deleteBtn) {
      deleteBtn.disabled = false;
      deleteBtn.innerHTML = oldText;
    }

    watchLikes();
    watchComments();
  }
}

async function init() {
  if (!photoDetail) return;

  if (!photoId) {
    photoDetail.innerHTML = `<p class="empty-text">Thiếu ID ảnh.</p>`;
    return;
  }

  try {
    const photoRef = doc(db, "gallery", photoId);
    const photoSnap = await getDoc(photoRef);

    if (!photoSnap.exists()) {
      photoDetail.innerHTML = `<p class="empty-text">Không tìm thấy ảnh.</p>`;
      return;
    }

    currentPhoto = {
      id: photoSnap.id,
      ...photoSnap.data(),
    };

    document.title = `${currentPhoto.title || "Photo"} | Harusama Archive`;

    renderPhoto(currentPhoto);
    watchLikes();
    watchComments();
  } catch (error) {
    console.error("Không thể tải ảnh:", error);

    photoDetail.innerHTML = `
      <p class="empty-text">
        Không thể tải ảnh. Hãy kiểm tra kết nối hoặc Firestore Rules.
      </p>
    `;
  }
}

if (commentForm) {
  commentForm.addEventListener("submit", addComment);
}

if (detailLikeBtn) {
  detailLikeBtn.addEventListener("click", toggleLike);
}

document.addEventListener("click", async (event) => {
  const deletePhotoBtn = event.target.closest("[data-delete-photo]");
  const deleteCommentBtn = event.target.closest("[data-delete-comment]");

  if (deletePhotoBtn) {
    await deleteCurrentPhoto();
    return;
  }

  if (deleteCommentBtn) {
    await deleteComment(deleteCommentBtn.dataset.deleteComment);
  }
});

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  isAdmin = Boolean(user && user.email === ADMIN_EMAIL);

  if (commentInput) {
    commentInput.placeholder = user
      ? "Viết một bình luận..."
      : "Đăng nhập để bình luận...";
  }

  if (currentPhoto) {
    renderPhoto(currentPhoto);
  }

  renderLikeButton();
  renderCommentList();
});

init();
