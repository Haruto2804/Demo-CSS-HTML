import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, query, orderBy, limit, getDocs, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const smBackMsg = document.getElementById('sm-back-msg');
const smForm = document.getElementById('sm-form');
const inputName = document.getElementById('sm-input-name');
const inputMessage = document.getElementById('sm-input-message');
const btnSubmit = smForm.querySelector('.sm-action-btn');

const smNameEl = document.getElementById('sm-name');
const smDateEl = document.getElementById('sm-date');
const smIdEl = document.getElementById('sm-id');

// Cập nhật mặt trước của thẻ
function updateFrontCard(name, dateStr, memberId) {
    if (smNameEl) smNameEl.textContent = name;
    if (smDateEl) smDateEl.textContent = dateStr;
    if (smIdEl) smIdEl.textContent = memberId;
}

// Tạo mã số ID ngẫu nhiên cho thành viên (VD: #4092)
function generateMemberId() {
    return '#' + Math.floor(1000 + Math.random() * 9000);
}

let messagesPool = [];
let currentBatchTimeout = null;
let unsubscribeSnapshot = null;
let isFirstLoad = true;

function spawnBatch(isInitial = false) {
    const floatingContainer = document.getElementById('floating-messages-container');
    if (!floatingContainer || messagesPool.length === 0) return;

    // Chọn 5-8 tin nhắn ngẫu nhiên cho một đợt (lượt)
    const batchSize = Math.min(messagesPool.length, Math.floor(Math.random() * 4) + 5);
    let batchMessages = [];
    for (let i = 0; i < batchSize; i++) {
        batchMessages.push(messagesPool[Math.floor(Math.random() * messagesPool.length)]);
    }

    let maxTimeLeft = 0;

    batchMessages.forEach((data) => {
        const msgEl = document.createElement('div');
        msgEl.className = 'floating-msg';

        const adminBadge = data.isAdmin ? ' <i class="fa-solid fa-crown" style="color: #c5a059; text-shadow: 0 0 8px #c5a059;" title="Chủ Nhân Căn Gác"></i>' : '';
        msgEl.innerHTML = `"${data.message}" — ${data.fullName}${adminBadge}`;

        // Randomize position (top 10% to 90%)
        msgEl.style.top = Math.random() * 80 + 10 + '%';

        // Randomize duration (25s to 45s)
        const duration = Math.random() * 20 + 25;
        msgEl.style.animationDuration = duration + 's';

        let delay = 0;
        if (isInitial) {
            // Cho tin nhắn xuất hiện ngay trên màn hình ở các vị trí khác nhau
            delay = -(Math.random() * duration * 0.8);
        } else {
            // Xuất phát từ bên ngoài màn hình, lệch nhau 0-5s để không ra cùng lúc
            delay = Math.random() * 5;
        }
        msgEl.style.animationDelay = delay + 's';

        const timeLeft = duration + delay; // Thời gian còn lại để bay hết khỏi màn hình
        if (timeLeft > maxTimeLeft) {
            maxTimeLeft = timeLeft;
        }

        msgEl.style.fontSize = (Math.random() * 8 + 14) + 'px';

        floatingContainer.appendChild(msgEl);

        // Xóa khi bay xong
        msgEl.addEventListener('animationend', () => {
            msgEl.remove();
        });
    });

    // Chờ tất cả bay hết (maxTimeLeft) + 1.5 giây nghỉ tĩnh lặng -> Bắt đầu đợt mới
    if (currentBatchTimeout) clearTimeout(currentBatchTimeout);
    currentBatchTimeout = setTimeout(() => {
        spawnBatch(false);
    }, (maxTimeLeft * 1000) + 300);
}

// Tải các lời nhắn từ Firestore (Realtime)
function loadAllMessages() {
    const floatingContainer = document.getElementById('floating-messages-container');
    if (!floatingContainer) return;

    if (unsubscribeSnapshot) return; // Đã init rồi

    try {
        const q = query(collection(db, 'sm_messages'), orderBy('timestamp', 'desc'), limit(30));

        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            messagesPool = [];
            snapshot.forEach((docSnap) => {
                messagesPool.push(docSnap.data());
            });

            if (isFirstLoad && messagesPool.length > 0) {
                isFirstLoad = false;
                // Bắt đầu đợt đầu tiên (có tin nhắn đã xuất hiện sẵn trên màn hình)
                spawnBatch(true);
            }
        }, (error) => {
            console.error("Lỗi lắng nghe tin nhắn:", error);
        });

    } catch (error) {
        console.error("Lỗi khởi tạo tin nhắn:", error);
    }
}

// Xử lý logic khi trạng thái đăng nhập thay đổi
async function handleUser(user) {
    if (!user) {
        // Chưa đăng nhập
        if (smBackMsg) smBackMsg.innerHTML = 'Nếu bạn đã đi đến đây, có lẽ cũng có điều gì đó muốn gửi lại. <br><br><b>Vui lòng đăng nhập để gửi thư vào Hộp thư tĩnh lặng.</b>';
        if (smForm) smForm.style.display = 'none';
        updateFrontCard('CHƯA ĐĂNG NHẬP', '---', '---');
        return;
    }

    try {
        const profileRef = doc(db, 'sm_profiles', user.uid);
        const profileSnap = await getDoc(profileRef);

        let isFirstTime = true;
        let userProfile = null;

        if (profileSnap.exists()) {
            isFirstTime = false;
            userProfile = profileSnap.data();

            let dateStr = '---';
            if (userProfile.joinDate && userProfile.joinDate.toDate) {
                dateStr = userProfile.joinDate.toDate().toLocaleDateString('vi-VN');
            } else if (userProfile.joinDateStr) {
                dateStr = userProfile.joinDateStr;
            }

            updateFrontCard(userProfile.fullName, dateStr, userProfile.memberId);
        } else {
            updateFrontCard('CHƯA GHI NHẬN', '---', '---');
        }

        // Luôn hiển thị Form và thông báo
        if (smBackMsg) {
            smBackMsg.innerHTML = isFirstTime ? 'Một câu ngắn, một cảm xúc nhỏ, hoặc chỉ đơn giản là vài dòng bạn muốn để trong khoảng lặng này.' : 'Những lời nhắn tĩnh lặng đang trôi bồng bềnh xung quanh hộp thư...';
            smBackMsg.style.opacity = '0.7';
            smBackMsg.style.fontSize = '13px';
            smBackMsg.style.marginBottom = '8px';
        }

        if (smForm) {
            smForm.style.display = 'flex';
            if (isFirstTime) {
                inputName.value = user.displayName || '';
                inputName.disabled = false;
            } else {
                inputName.value = userProfile.fullName;
                inputName.disabled = true; // Khóa tên nếu đã có profile
            }

            // Xử lý khi nhấn Gửi lời nhắn
            smForm.onsubmit = async (e) => {
                e.preventDefault();

                const fullName = inputName.value.trim();
                const message = inputMessage.value.trim();

                if (!fullName || !message) return;

                if (message.length > 200) {
                    alert("Lời nhắn quá dài. Xin vui lòng giữ dưới 200 ký tự.");
                    return;
                }

                btnSubmit.disabled = true;
                btnSubmit.innerHTML = '<span>Đang gửi...</span><i class="fa-solid fa-spinner fa-spin"></i>';

                const memberId = isFirstTime ? generateMemberId() : userProfile.memberId;
                const todayStr = new Date().toLocaleDateString('vi-VN');

                try {
                    // 1. Lưu Profile nếu là lần đầu
                    if (isFirstTime) {
                        await setDoc(profileRef, {
                            uid: user.uid,
                            fullName: fullName,
                            memberId: memberId,
                            joinDate: serverTimestamp(),
                            joinDateStr: todayStr
                        });
                        isFirstTime = false;
                        userProfile = { fullName, memberId, joinDateStr: todayStr };
                        inputName.disabled = true;
                        updateFrontCard(fullName, todayStr, memberId);
                    }

                    // 2. Ghi đè lời nhắn vào sm_messages (Sử dụng UID làm khóa)
                    const isAdminUser = user.email === "baokhongwibu2005@gmail.com";

                    const payload = {
                        uid: user.uid,
                        fullName: fullName,
                        message: message,
                        timestamp: serverTimestamp()
                    };

                    if (isAdminUser) {
                        payload.isAdmin = true;
                    }

                    const messageRef = doc(db, 'sm_messages', user.uid);
                    await setDoc(messageRef, payload);

                    // 3. Cập nhật UI
                    inputMessage.value = '';
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = '<span>Gửi thêm lời nhắn</span><i class="fa-solid fa-feather-pointed"></i>';

                    if (smBackMsg) smBackMsg.innerHTML = '<b>Đã gửi thành công!</b><br>Những lời nhắn tĩnh lặng đang trôi bồng bềnh xung quanh hộp thư...';

                    // Tải lại tin nhắn mới nhất (Đã tự động xử lý qua onSnapshot)
                    // loadAllMessages();

                } catch (error) {
                    console.error("Lỗi khi lưu thư: ", error);
                    alert("Có lỗi xảy ra khi gửi thư. Vui lòng thử lại.");
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = '<span>Gửi lời nhắn</span><i class="fa-solid fa-feather-pointed"></i>';
                }
            };
        }

        // Tải danh sách lời nhắn
        loadAllMessages();

    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu hộp thư:", error);
        if (smBackMsg) {
            smBackMsg.innerHTML = `<span style="color:red">Lỗi kết nối: ${error.message}</span><br>Vui lòng kiểm tra Firestore trong Firebase Console (đã bật Database chưa, Rules đã cho phép chưa).`;
        }
    }
}

// Bắt đầu lắng nghe trạng thái đăng nhập
onAuthStateChanged(auth, (user) => {
    handleUser(user);
});
