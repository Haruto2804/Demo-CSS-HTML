import {
  initializeApp,
  getApps,
  getApp,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";
import { cloudinaryConfig } from "./cloudinary-config.js";

const ADMIN_EMAIL = "baokhongwibu2005@gmail.com";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let isAdmin = false;
let allPhotos = [];
let metaUnsubs = [];

let selectedImageFile = null;
let selectedThumbFile = null;

const galleryAuthStatus = document.getElementById("galleryAuthStatus");
const adminPanel = document.getElementById("adminPanel");
const featuredGrid = document.getElementById("featuredGrid");
const photoGrid = document.getElementById("photoGrid");

const photoForm = document.getElementById("photoForm");
const photoId = document.getElementById("photoId");

const photoTitle = document.getElementById("photoTitle");
const photoSubtitle = document.getElementById("photoSubtitle");
const photoImageUrl = document.getElementById("photoImageUrl");
const photoThumbUrl = document.getElementById("photoThumbUrl");
const photoImagePublicId = document.getElementById("photoImagePublicId");
const photoThumbPublicId = document.getElementById("photoThumbPublicId");

const photoCategory = document.getElementById("photoCategory");
const photoLocation = document.getElementById("photoLocation");
const photoTakenAt = document.getElementById("photoTakenAt");
const photoTags = document.getElementById("photoTags");
const photoDescription = document.getElementById("photoDescription");
const photoFeatured = document.getElementById("photoFeatured");

const resetPhotoBtn = document.getElementById("resetPhotoBtn");
const seedSampleBtn = document.getElementById("seedSampleBtn");

const imageDropZone = document.getElementById("imageDropZone");
const thumbDropZone = document.getElementById("thumbDropZone");
const photoImageFile = document.getElementById("photoImageFile");
const photoThumbFile = document.getElementById("photoThumbFile");
const imagePreview = document.getElementById("imagePreview");
const thumbPreview = document.getElementById("thumbPreview");
const imageUploadStatus = document.getElementById("imageUploadStatus");
const thumbUploadStatus = document.getElementById("thumbUploadStatus");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

if (adminPanel) {
  adminPanel.hidden = true;
}

function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setStatus(el, text, type = "") {
  if (!el) return;

  el.textContent = text;
  el.classList.remove("is-uploading", "is-done", "is-error");

  if (type) {
    el.classList.add(type);
  }
}

function validateImageFile(file) {
  if (!file) return false;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    alert("Chỉ nhận ảnh JPG, PNG hoặc WEBP.");
    return false;
  }

  const maxSize = 8 * 1024 * 1024;

  if (file.size > maxSize) {
    alert("Ảnh quá nặng. Hãy chọn ảnh dưới 8MB.");
    return false;
  }

  return true;
}

function previewFile(file, previewEl, dropZoneEl) {
  const objectUrl = URL.createObjectURL(file);

  previewEl.src = objectUrl;
  previewEl.hidden = false;
  dropZoneEl.classList.add("has-image");
}

function bindDropZone(dropZone, input, onFileSelected) {
  if (!dropZone || !input) return;

  input.addEventListener("change", () => {
    const file = input.files?.[0];

    if (file) {
      onFileSelected(file);
    }
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add("is-dragover");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove("is-dragover");
    });
  });

  dropZone.addEventListener("drop", (event) => {
    const file = event.dataTransfer.files?.[0];

    if (file) {
      onFileSelected(file);
    }
  });
}

bindDropZone(imageDropZone, photoImageFile, (file) => {
  if (!validateImageFile(file)) return;

  selectedImageFile = file;
  previewFile(file, imagePreview, imageDropZone);
  setStatus(imageUploadStatus, `Đã chọn: ${file.name}`, "is-done");
});

bindDropZone(thumbDropZone, photoThumbFile, (file) => {
  if (!validateImageFile(file)) return;

  selectedThumbFile = file;
  previewFile(file, thumbPreview, thumbDropZone);
  setStatus(thumbUploadStatus, `Đã chọn: ${file.name}`, "is-done");
});

async function uploadToCloudinary(file, typeName = "image") {
  if (!file) return null;

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Cloudinary upload error:", data);
    throw new Error(data?.error?.message || `Upload ${typeName} thất bại.`);
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
    format: data.format,
  };
}

function getThumb(photo) {
  return photo.thumbnailUrl || photo.imageUrl || "./assets/images/avatar.jpeg";
}

function getTags(photo) {
  if (Array.isArray(photo.tags)) return photo.tags;
  return [];
}

function clearMetaListeners() {
  metaUnsubs.forEach((unsub) => unsub());
  metaUnsubs = [];
}

function watchMeta(photoIdValue) {
  const likesRef = collection(db, "gallery", photoIdValue, "likes");
  const commentsRef = collection(db, "gallery", photoIdValue, "comments");

  const unsubLikes = onSnapshot(likesRef, (snapshot) => {
    document
      .querySelectorAll(`[data-like-count="${photoIdValue}"]`)
      .forEach((el) => {
        el.textContent = snapshot.size;
      });

    let liked = false;

    if (currentUser) {
      liked = snapshot.docs.some((docSnap) => docSnap.id === currentUser.uid);
    }

    document
      .querySelectorAll(`[data-like-photo="${photoIdValue}"]`)
      .forEach((btn) => {
        btn.dataset.liked = String(liked);
        btn.classList.toggle("is-liked", liked);
        btn.innerHTML = liked
          ? `<i class="fa-solid fa-heart"></i><span>Đã thích</span>`
          : `<i class="fa-regular fa-heart"></i><span>Thích</span>`;
      });
  });

  const unsubComments = onSnapshot(commentsRef, (snapshot) => {
    document
      .querySelectorAll(`[data-comment-count="${photoIdValue}"]`)
      .forEach((el) => {
        el.textContent = snapshot.size;
      });
  });

  metaUnsubs.push(unsubLikes, unsubComments);
}

function photoCard(photo, index, mode = "grid") {
  const title = escapeHtml(photo.title || "Untitled Memory");
  const subtitle = escapeHtml(photo.subtitle || photo.category || "archive");
  const image = escapeHtml(getThumb(photo));
  const href = `./photo-detail.html?id=${encodeURIComponent(photo.id)}`;
  const tags = getTags(photo).slice(0, 3);

  if (mode === "bento") {
    const sizeClass =
      index === 0 ? "bento-wide" : index === 1 ? "bento-tall" : "bento-small";

    return `
      <article class="bento-item ${sizeClass}">
        <a href="${href}" class="photo-link">
          <img src="${image}" alt="${title}" loading="lazy" />

          <div class="bento-caption">
            <span>memory ${String(index + 1).padStart(2, "0")}</span>
            <h3>${title}</h3>
            <p>${subtitle}</p>
          </div>
        </a>

        <div class="photo-mini-actions">
          <button class="mini-action" type="button" data-like-photo="${photo.id}">
            <i class="fa-regular fa-heart"></i><span>Thích</span>
          </button>

          <span><i class="fa-solid fa-heart"></i> <b data-like-count="${photo.id}">0</b></span>
          <span><i class="fa-regular fa-comment"></i> <b data-comment-count="${photo.id}">0</b></span>
        </div>
      </article>
    `;
  }

  return `
    <article class="archive-card">
      <a href="${href}" class="archive-image">
        <img src="${image}" alt="${title}" loading="lazy" />
      </a>

      <div class="archive-body">
        <div>
          <p class="archive-kicker">${escapeHtml(photo.category || "memory")}</p>
          <h3>${title}</h3>
          <p>${subtitle}</p>
        </div>

        <div class="archive-tags">
          ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
        </div>

        <div class="archive-meta">
          <button class="mini-action" type="button" data-like-photo="${photo.id}">
            <i class="fa-regular fa-heart"></i><span>Thích</span>
          </button>

          <span><i class="fa-solid fa-heart"></i> <b data-like-count="${photo.id}">0</b></span>
          <span><i class="fa-regular fa-comment"></i> <b data-comment-count="${photo.id}">0</b></span>
        </div>

        <div class="admin-card-actions" ${isAdmin ? "" : "hidden"}>
          <button class="archive-btn small" type="button" data-edit-photo="${photo.id}">
            Sửa
          </button>

          <button class="archive-btn small danger" type="button" data-delete-photo="${photo.id}">
            Xóa
          </button>
        </div>
      </div>
    </article>
  `;
}

function getFilteredPhotos() {
  const keyword = searchInput.value.trim().toLowerCase();

  let photos = [...allPhotos];

  if (keyword) {
    photos = photos.filter((photo) => {
      const text = [
        photo.title,
        photo.subtitle,
        photo.description,
        photo.category,
        photo.location,
        ...(photo.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    });
  }

  if (sortSelect.value === "oldest") {
    photos.reverse();
  }

  if (sortSelect.value === "title") {
    photos.sort((a, b) =>
      String(a.title || "").localeCompare(String(b.title || "")),
    );
  }

  return photos;
}

function renderGallery() {
  clearMetaListeners();

  const filtered = getFilteredPhotos();
  const featured = filtered.filter((photo) => photo.featured).slice(0, 6);
  const bentoPhotos = featured.length ? featured : filtered.slice(0, 6);

  featuredGrid.innerHTML = bentoPhotos.length
    ? bentoPhotos
        .map((photo, index) => photoCard(photo, index, "bento"))
        .join("")
    : `<p class="empty-text">Chưa có ảnh nổi bật.</p>`;

  photoGrid.innerHTML = filtered.length
    ? filtered.map((photo, index) => photoCard(photo, index, "grid")).join("")
    : `<p class="empty-text">Chưa có ảnh trong archive.</p>`;

  filtered.forEach((photo) => watchMeta(photo.id));
}

function resetUploadPreview() {
  selectedImageFile = null;
  selectedThumbFile = null;

  photoImageFile.value = "";
  photoThumbFile.value = "";

  imagePreview.hidden = true;
  thumbPreview.hidden = true;
  imagePreview.removeAttribute("src");
  thumbPreview.removeAttribute("src");

  imageDropZone.classList.remove("has-image");
  thumbDropZone.classList.remove("has-image");

  setStatus(imageUploadStatus, "Chưa chọn ảnh.");
  setStatus(thumbUploadStatus, "Chưa chọn thumbnail.");
}

function resetForm() {
  photoForm.reset();

  photoId.value = "";
  photoImageUrl.value = "";
  photoThumbUrl.value = "";
  photoImagePublicId.value = "";
  photoThumbPublicId.value = "";

  resetUploadPreview();

  document.getElementById("savePhotoBtn").textContent = "Lưu ảnh";
}

function fillForm(photo) {
  photoId.value = photo.id;
  photoTitle.value = photo.title || "";
  photoSubtitle.value = photo.subtitle || "";

  photoImageUrl.value = photo.imageUrl || "";
  photoThumbUrl.value = photo.thumbnailUrl || "";
  photoImagePublicId.value = photo.imagePublicId || "";
  photoThumbPublicId.value = photo.thumbnailPublicId || "";

  photoCategory.value = photo.category || "";
  photoLocation.value = photo.location || "";
  photoTakenAt.value = photo.takenAt || "";
  photoTags.value = Array.isArray(photo.tags) ? photo.tags.join(", ") : "";
  photoDescription.value = photo.description || "";
  photoFeatured.checked = Boolean(photo.featured);

  selectedImageFile = null;
  selectedThumbFile = null;
  photoImageFile.value = "";
  photoThumbFile.value = "";

  if (photo.imageUrl) {
    imagePreview.src = photo.imageUrl;
    imagePreview.hidden = false;
    imageDropZone.classList.add("has-image");
    setStatus(
      imageUploadStatus,
      "Đang dùng ảnh đã lưu trên Cloudinary.",
      "is-done",
    );
  }

  if (photo.thumbnailUrl) {
    thumbPreview.src = photo.thumbnailUrl;
    thumbPreview.hidden = false;
    thumbDropZone.classList.add("has-image");
    setStatus(
      thumbUploadStatus,
      "Đang dùng thumbnail đã lưu trên Cloudinary.",
      "is-done",
    );
  }

  document.getElementById("savePhotoBtn").textContent = "Cập nhật ảnh";
  adminPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteSubcollection(photoIdValue, name) {
  const snapshot = await getDocs(collection(db, "gallery", photoIdValue, name));
  const tasks = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
  await Promise.all(tasks);
}

async function deletePhoto(photoIdValue) {
  const ok = confirm("Xóa ảnh này? Like và comment của ảnh cũng sẽ bị xóa.");
  if (!ok) return;

  await deleteSubcollection(photoIdValue, "likes");
  await deleteSubcollection(photoIdValue, "comments");
  await deleteDoc(doc(db, "gallery", photoIdValue));
}

async function toggleLike(photoIdValue, button) {
  if (!currentUser) {
    window.location.href = "./login.html?redirect=gallery.html";
    return;
  }

  const likeRef = doc(db, "gallery", photoIdValue, "likes", currentUser.uid);
  const liked = button.dataset.liked === "true";

  if (liked) {
    await deleteDoc(likeRef);
  } else {
    await setDoc(likeRef, {
      uid: currentUser.uid,
      displayName: currentUser.displayName || "Google User",
      email: currentUser.email || "",
      createdAt: serverTimestamp(),
    });
  }
}

photoForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!isAdmin) {
    alert("Chỉ admin mới được thêm / sửa / xóa ảnh.");
    return;
  }

  const isEditing = Boolean(photoId.value);

  if (!isEditing && !selectedImageFile) {
    alert("Hãy chọn ảnh chính trước khi lưu.");
    return;
  }

  try {
    document.getElementById("savePhotoBtn").disabled = true;

    let imageData = null;
    let thumbData = null;

    if (selectedImageFile) {
      setStatus(
        imageUploadStatus,
        "Đang upload ảnh chính lên Cloudinary...",
        "is-uploading",
      );
      imageData = await uploadToCloudinary(selectedImageFile, "ảnh chính");
      setStatus(imageUploadStatus, "Upload ảnh chính thành công.", "is-done");
    }

    if (selectedThumbFile) {
      setStatus(
        thumbUploadStatus,
        "Đang upload thumbnail lên Cloudinary...",
        "is-uploading",
      );
      thumbData = await uploadToCloudinary(selectedThumbFile, "thumbnail");
      setStatus(thumbUploadStatus, "Upload thumbnail thành công.", "is-done");
    }

    const finalImageUrl = imageData?.url || photoImageUrl.value;
    const finalThumbUrl =
      thumbData?.url || photoThumbUrl.value || finalImageUrl;

    const finalImagePublicId = imageData?.publicId || photoImagePublicId.value;
    const finalThumbPublicId =
      thumbData?.publicId || photoThumbPublicId.value || finalImagePublicId;

    const tags = photoTags.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const data = {
      title: photoTitle.value.trim(),
      subtitle: photoSubtitle.value.trim(),
      imageUrl: finalImageUrl,
      thumbnailUrl: finalThumbUrl,
      imagePublicId: finalImagePublicId,
      thumbnailPublicId: finalThumbPublicId,
      category: photoCategory.value.trim(),
      location: photoLocation.value.trim(),
      takenAt: photoTakenAt.value,
      tags,
      description: photoDescription.value.trim(),
      featured: photoFeatured.checked,
      updatedAt: serverTimestamp(),
    };

    if (photoId.value) {
      await updateDoc(doc(db, "gallery", photoId.value), data);
    } else {
      await addDoc(collection(db, "gallery"), {
        ...data,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
      });
    }

    resetForm();
  } catch (error) {
    console.error(error);
    alert(error.message || "Upload ảnh thất bại.");
    setStatus(
      imageUploadStatus,
      "Upload thất bại. Mở Console để xem lỗi.",
      "is-error",
    );
  } finally {
    document.getElementById("savePhotoBtn").disabled = false;
  }
});

resetPhotoBtn.addEventListener("click", resetForm);

seedSampleBtn.addEventListener("click", async () => {
  if (!isAdmin) return;

  const samples = [
    {
      title: "Ngày Ấy Chúng Mình Cùng Mặc Quân Phục",
      subtitle: "QPAN classroom • archived moment",
      description: "Một khoảnh khắc cũ được giữ lại trong Harusama Room.",
      imageUrl: "./assets/images/memory/QPAN_classroom.jpg",
      thumbnailUrl: "./assets/images/memory/QPAN_classroom.jpg",
      imagePublicId: "",
      thumbnailPublicId: "",
      category: "qpan",
      location: "Classroom",
      takenAt: "2026-05-20",
      tags: ["qpan", "classroom", "memory"],
      featured: true,
    },
    {
      title: "Một Ký Ức Đáng Nhớ",
      subtitle: "group frame • quiet nostalgia",
      description: "Một tấm ảnh tập thể, yên lặng nhưng nhiều cảm xúc.",
      imageUrl: "./assets/images/memory/QPAN_tapthelop.jpg",
      thumbnailUrl: "./assets/images/memory/QPAN_tapthelop.jpg",
      imagePublicId: "",
      thumbnailPublicId: "",
      category: "memory",
      location: "School",
      takenAt: "2026-05-20",
      tags: ["group", "school", "archive"],
      featured: true,
    },
  ];

  for (const sample of samples) {
    await addDoc(collection(db, "gallery"), {
      ...sample,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
});

document.addEventListener("click", async (event) => {
  const likeBtn = event.target.closest("[data-like-photo]");
  const editBtn = event.target.closest("[data-edit-photo]");
  const deleteBtn = event.target.closest("[data-delete-photo]");

  if (likeBtn) {
    event.preventDefault();
    await toggleLike(likeBtn.dataset.likePhoto, likeBtn);
  }

  if (editBtn) {
    const photo = allPhotos.find(
      (item) => item.id === editBtn.dataset.editPhoto,
    );
    if (photo) fillForm(photo);
  }

  if (deleteBtn) {
    await deletePhoto(deleteBtn.dataset.deletePhoto);
  }
});

searchInput.addEventListener("input", renderGallery);
sortSelect.addEventListener("change", renderGallery);

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  isAdmin = Boolean(user && user.email === ADMIN_EMAIL);

  if (adminPanel) {
    adminPanel.hidden = !isAdmin;
  }

  if (galleryAuthStatus) {
    galleryAuthStatus.textContent = user
      ? isAdmin
        ? `Admin mode: ${user.email}`
        : `Đã đăng nhập: ${user.email}`
      : "Guest mode: đăng nhập để like và bình luận";
  }

  renderGallery();
});

const photosQuery = query(
  collection(db, "gallery"),
  orderBy("createdAt", "desc"),
);

onSnapshot(photosQuery, (snapshot) => {
  allPhotos = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  renderGallery();
});
