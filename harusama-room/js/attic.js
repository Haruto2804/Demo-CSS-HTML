import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('drafts-container');
  const adminSection = document.getElementById('admin-draft-section');
  const adminForm = document.getElementById('admin-draft-form');
  
  if (!container) return;

  let isExpanded = false;
  const initialCount = 2; // Số lượng hiển thị mặc định
  let draftElements = [];
  let toggleBtn = null;

  // 1. Kiểm tra Admin Auth
  onAuthStateChanged(auth, (user) => {
    if (user && user.email === "baokhongwibu2005@gmail.com") {
      if (adminSection) adminSection.style.display = 'block';
    } else {
      if (adminSection) adminSection.style.display = 'none';
    }
  });

  // 2. Lắng nghe dữ liệu Realtime từ Firestore (sm_drafts)
  const draftsQuery = query(collection(db, 'sm_drafts'), orderBy('timestamp', 'desc'));
  
  onSnapshot(draftsQuery, (snapshot) => {
    // Xóa trắng container trước khi render lại
    container.innerHTML = '';
    draftElements = [];
    isExpanded = false; // Reset trạng thái mở rộng

    const drafts = [];
    snapshot.forEach((doc) => {
      drafts.push({ id: doc.id, ...doc.data() });
    });

    // Render từng bản nháp (mới nhất ở trên cùng)
    drafts.forEach((draft, index) => {
      // Tự động đánh số thứ tự từ cũ (1) tới mới (N)
      const draftNumber = drafts.length - index;
      
      let timeString = '--:--';
      if (draft.timestamp) {
        // Format theo ngày giờ Việt Nam
        timeString = draft.timestamp.toDate().toLocaleString('vi-VN', {
          hour: '2-digit', minute: '2-digit', hour12: true,
          day: '2-digit', month: '2-digit', year: 'numeric'
        });
      }

      let displayTitle = `Draft #${draftNumber} - ${timeString}`;
      if (draft.blur) {
        displayTitle += ' - Deleted';
      }

      const card = document.createElement('div');
      card.className = 'draft-card';
      
      if (draft.blur) {
        card.classList.add('deleted-draft');
      }

      card.innerHTML = `
        <p>${displayTitle}</p>
        <p class="strike">${draft.strikethrough}</p>
        <p>${draft.final}</p>
      `;
      
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      
      if (index >= initialCount) {
        card.style.display = 'none';
        card.style.opacity = '0';
        card.style.transform = 'translateY(15px)';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(15px)';
        card.style.transitionDelay = (index * 0.15) + 's';
        setTimeout(() => {
          card.style.opacity = '';
          card.style.transform = 'translateY(0)';
        }, 50);
      }
      
      container.appendChild(card);
      draftElements.push(card);
    });

    // Render nút Xem thêm
    if (drafts.length > initialCount) {
      toggleBtn = document.createElement('button');
      toggleBtn.innerHTML = 'Mở rộng các nháp cũ <i class="fa-solid fa-chevron-down" style="margin-left:4px;"></i>';
      toggleBtn.style.cssText = 'background: rgba(255,255,255,0.02); border: 1px dashed #3f3f46; color: #a1a1aa; padding: 12px 24px; font-family: var(--serif); font-size: 15px; cursor: pointer; border-radius: 8px; display: block; margin: 30px auto 10px; transition: all 0.3s ease; letter-spacing: 0.5px;';
      
      toggleBtn.onmouseover = () => { toggleBtn.style.color = '#e2e8f0'; toggleBtn.style.borderColor = '#71717a'; toggleBtn.style.background = 'rgba(255,255,255,0.05)'; };
      toggleBtn.onmouseout = () => { toggleBtn.style.color = '#a1a1aa'; toggleBtn.style.borderColor = '#3f3f46'; toggleBtn.style.background = 'rgba(255,255,255,0.02)'; };
      
      toggleBtn.onclick = () => {
        isExpanded = !isExpanded;
        if (isExpanded) {
          toggleBtn.innerHTML = 'Thu gọn <i class="fa-solid fa-chevron-up" style="margin-left:4px;"></i>';
          draftElements.forEach((card, index) => {
            if (index >= initialCount) {
              card.style.display = 'block';
              setTimeout(() => {
                card.style.transitionDelay = ((index - initialCount) * 0.1) + 's';
                card.style.opacity = '';
                card.style.transform = 'translateY(0)';
              }, 20);
            }
          });
        } else {
          toggleBtn.innerHTML = 'Mở rộng các nháp cũ <i class="fa-solid fa-chevron-down" style="margin-left:4px;"></i>';
          draftElements.forEach((card, index) => {
            if (index >= initialCount) {
              card.style.transitionDelay = '0s';
              card.style.opacity = '0';
              card.style.transform = 'translateY(15px)';
              setTimeout(() => {
                if (!isExpanded) card.style.display = 'none';
              }, 600);
            }
          });
        }
      };
      container.appendChild(toggleBtn);
    }
  });

  // 3. Xử lý Form Admin Thêm Nháp
  if (adminForm) {
    adminForm.onsubmit = async (e) => {
      e.preventDefault();
      
      const strikethrough = document.getElementById('draft-strikethrough').value.trim();
      const finalMsg = document.getElementById('draft-final').value.trim();
      const blur = document.getElementById('draft-blur').checked;
      const btn = adminForm.querySelector('button');

      if (!strikethrough || !finalMsg) return;

      btn.disabled = true;
      btn.textContent = 'Đang lưu...';

      try {
        await addDoc(collection(db, 'sm_drafts'), {
          strikethrough: strikethrough,
          final: finalMsg,
          blur: blur,
          timestamp: serverTimestamp()
        });

        // Reset form
        adminForm.reset();
        alert('Đã lưu thành công vào Căn Gác Xép!');
      } catch (error) {
        console.error("Error adding draft: ", error);
        alert('Lỗi: Bạn không có quyền thêm hoặc có sự cố xảy ra.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Lưu vào Căn Gác Xép';
      }
    };
  }
});
