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
  updateDoc,
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

const photoDetailMedia = document.getElementById("photoDetailMedia");
const photoDetailContent = document.getElementById("photoDetailContent");
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
  const commentCountBadge = document.getElementById("detailCommentCountBadge");

  if (likeCountEl) likeCountEl.textContent = likeCount;
  if (commentCountEl) commentCountEl.textContent = commentCount;
  if (commentCountBadge) commentCountBadge.textContent = commentCount;
}

function renderLikeButton() {
  if (!detailLikeBtn) return;

  if (userLiked) {
    detailLikeBtn.innerHTML = `<i class="fa-solid fa-heart" style="color: #ef4444;"></i> <span id="detailLikeCount" class="action-count">${likeCount}</span>`;
    detailLikeBtn.classList.add("is-liked");
  } else {
    detailLikeBtn.innerHTML = `<i class="fa-regular fa-heart"></i> <span id="detailLikeCount" class="action-count">${likeCount}</span>`;
    detailLikeBtn.classList.remove("is-liked");
  }
}

function renderPhoto(photo) {
  const photoDetailMedia = document.getElementById("photoDetailMedia");
  const photoDetailContent = document.getElementById("photoDetailContent");
  
  if (!photoDetailMedia || !photoDetailContent) return;

  const tags = Array.isArray(photo.tags) ? photo.tags : [];
  const imageUrl = getPhotoImageUrl(photo);

  photoDetailMedia.innerHTML = `
    ${
      imageUrl
        ? `<img class="photo-detail-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(photo.title || "Harusama memory")}"/>`
        : `<p class="empty-text">Ảnh này chưa có URL hình.</p>`
    }
  `;

  photoDetailContent.innerHTML = `
    <div class="split-info-header">
      <p class="chapter chapter-gold">${escapeHtml(photo.category || "memory")}</p>
      <h1>${escapeHtml(photo.title || "Untitled Memory")}</h1>
      ${photo.subtitle ? `<p class="detail-subtitle">${escapeHtml(photo.subtitle)}</p>` : ""}
    </div>

    <div class="detail-description-box">
      <p>${escapeHtml(photo.description || "Chưa có mô tả cho tấm ảnh này.")}</p>
    </div>

    <div class="exif-bar">
      <div class="exif-item">
        <i class="fa-solid fa-camera"></i>
        <span>Unknown Camera</span>
      </div>
      <div class="exif-item">
        <i class="fa-solid fa-location-dot"></i>
        <span>${escapeHtml(photo.location || "Không rõ")}</span>
      </div>
      <div class="exif-item">
        <i class="fa-regular fa-calendar"></i>
        <span>${escapeHtml(photo.takenAt || "Không rõ")}</span>
      </div>
    </div>

    ${
      tags.length
        ? `
          <div class="archive-tags split-tags">
            ${tags.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("")}
          </div>
        `
        : ""
    }

    ${
      isAdmin
        ? `
          <div class="photo-detail-actions" style="margin-top: 24px;">
            <button class="archive-btn" type="button" data-edit-photo>
              <i class="fa-solid fa-pen"></i> Chỉnh sửa
            </button>
            <button class="archive-btn danger detail-delete-btn" type="button" data-delete-photo>
              <i class="fa-solid fa-trash"></i> Xóa ảnh
            </button>
          </div>
        `
        : ""
    }
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
  if (!photoDetailMedia || !photoDetailContent) return;

  if (!photoId) {
    photoDetailMedia.innerHTML = `<p class="empty-text">Thiếu ID ảnh.</p>`;
    photoDetailContent.innerHTML = ``;
    return;
  }

  try {
    const photoRef = doc(db, "gallery", photoId);
    const photoSnap = await getDoc(photoRef);

    if (!photoSnap.exists()) {
      photoDetailMedia.innerHTML = `<p class="empty-text">Không tìm thấy ảnh.</p>`;
      photoDetailContent.innerHTML = ``;
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

    photoDetailMedia.innerHTML = `
      <p class="empty-text">
        Không thể tải ảnh. Hãy kiểm tra kết nối hoặc Firestore Rules.
      </p>
    `;
    photoDetailContent.innerHTML = ``;
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
  const editPhotoBtn = event.target.closest("[data-edit-photo]");

  if (editPhotoBtn) {
    openEditModal();
    return;
  }

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

// --- EDIT PHOTO MODAL LOGIC ---
const editModal = document.getElementById("editPhotoModal");
const editForm = document.getElementById("editPhotoForm");

function openEditModal() {
  if (!currentPhoto) return;
  
  document.getElementById("editTitle").value = currentPhoto.title || "";
  document.getElementById("editCategory").value = currentPhoto.category || "memory";
  document.getElementById("editSubtitle").value = currentPhoto.subtitle || "";
  document.getElementById("editTakenAt").value = currentPhoto.takenAt || "";
  document.getElementById("editLocation").value = currentPhoto.location || "";
  document.getElementById("editTags").value = Array.isArray(currentPhoto.tags) ? currentPhoto.tags.join(", ") : "";
  document.getElementById("editDescription").value = currentPhoto.description || "";
  
  editModal.classList.add("is-active");
}

function closeEditModal() {
  editModal.classList.remove("is-active");
}

document.getElementById("closeEditModalBtn")?.addEventListener("click", closeEditModal);
document.getElementById("cancelEditBtn")?.addEventListener("click", closeEditModal);

if (editForm) {
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!isAdmin || !photoId) return;

    const title = document.getElementById("editTitle").value.trim();
    const category = document.getElementById("editCategory").value;
    const subtitle = document.getElementById("editSubtitle").value.trim();
    const takenAt = document.getElementById("editTakenAt").value.trim();
    const location = document.getElementById("editLocation").value.trim();
    const description = document.getElementById("editDescription").value.trim();
    
    const tagsRaw = document.getElementById("editTags").value;
    const tags = tagsRaw.split(",").map(t => t.trim().toLowerCase()).filter(t => t);

    const submitBtn = editForm.querySelector('button[type="submit"]');
    const oldText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...`;
    submitBtn.disabled = true;

    try {
      const photoRef = doc(db, "gallery", photoId);
      const updateData = {
        title,
        category,
        subtitle,
        takenAt,
        location,
        description,
        tags
      };
      
      await updateDoc(photoRef, updateData);
      
      currentPhoto = { ...currentPhoto, ...updateData };
      renderPhoto(currentPhoto);
      closeEditModal();
      
      document.title = `${currentPhoto.title || "Photo"} | Harusama Archive`;
      
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Lỗi khi lưu thay đổi. Vui lòng thử lại.");
    } finally {
      submitBtn.innerHTML = oldText;
      submitBtn.disabled = false;
    }
  });
}

init();
