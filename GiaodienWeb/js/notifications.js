// Notifications Manager
document.addEventListener('DOMContentLoaded', () => {
    // 1. Kiểm tra đăng nhập
    const user = authManager.getCurrentUser();
    if (!user) {
        // Chưa đăng nhập -> Chuyển hướng về login
        window.location.href = 'login.html';
        return;
    }

    let notificationsList = [];
    let currentFilter = 'all';

    const notificationsContainer = document.querySelector('.notifications-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const markAllReadBtn = document.querySelector('.mark-all-read-btn');

    // 2. Định nghĩa hàm format thời gian thân thiện
    function formatTimeAgo(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        
        if (diffMs < 0) return 'Vừa xong'; // Handle future timezone issues
        
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 3. Xác định loại thông báo dạng chuẩn để khớp class CSS phía client
    function mapNotificationType(loaiThongBao) {
        if (!loaiThongBao) return 'campaign';
        const type = loaiThongBao.toLowerCase();
        if (type.includes('chiến dịch') || type.includes('campaign')) return 'campaign';
        if (type.includes('đơn hàng') || type.includes('order')) return 'order';
        if (type.includes('thanh toán') || type.includes('payment') || type.includes('wallet') || type.includes('ví')) return 'payment';
        return 'campaign'; // Default fallback
    }

    // 4. Lấy icon tương ứng với loại thông báo
    function getIconHtml(mappedType) {
        switch (mappedType) {
            case 'campaign':
                return `
                    <div class="notification-icon campaign">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 6v6l4 2"></path>
                        </svg>
                    </div>`;
            case 'order':
                return `
                    <div class="notification-icon info">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="1" y="3" width="15" height="13"></rect>
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                    </div>`;
            case 'payment':
                return `
                    <div class="notification-icon success">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>`;
            default:
                return `
                    <div class="notification-icon warning">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>`;
        }
    }

    // Hỗ trợ hiển thị link markdown dạng [Nhãn](Đường-dẫn) thành liên kết HTML nhấp chuột được
    function parseMarkdownLinks(text) {
        if (!text) return '';
        // Thay thế định dạng [Nhãn](URL) bằng thẻ <a> của HTML
        return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
            let targetUrl = url;
            const hasGiaodienWebInPath = window.location.pathname.toLowerCase().includes('/giaodienweb/');
            if (targetUrl.startsWith('/GiaodienWeb/') && !hasGiaodienWebInPath) {
                targetUrl = targetUrl.substring(12); // Remove "/GiaodienWeb" (length 12), leaving "/pages/review.html..."
            }
            return `<a href="${targetUrl}" class="notification-link" style="color: #FFEEA9; text-decoration: underline; font-weight: 700; transition: color 0.2s;" onclick="event.stopPropagation();">${label}</a>`;
        });
    }

    // 5. Render danh sách thông báo động
    function renderNotifications() {
        if (!notificationsContainer) return;
        notificationsContainer.innerHTML = '';

        // Lọc danh sách theo bộ lọc hiện tại
        const filteredList = notificationsList.filter(item => {
            if (currentFilter === 'all') return true;
            return mapNotificationType(item.loaiThongBao) === currentFilter;
        });

        if (filteredList.length === 0) {
            notificationsContainer.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 50px 20px; color: #777;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 15px; opacity: 0.6;">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <p style="font-size: 16px; font-weight: 500;">Bạn không có thông báo nào trong danh mục này.</p>
                </div>
            `;
            return;
        }

        filteredList.forEach(item => {
            const mappedType = mapNotificationType(item.loaiThongBao);
            const isUnread = !item.daDoc;
            const notificationCard = document.createElement('div');
            
            notificationCard.className = `notification-item ${isUnread ? 'unread' : ''}`;
            notificationCard.setAttribute('data-id', item.maThongBao);
            notificationCard.setAttribute('data-type', mappedType);

            notificationCard.innerHTML = `
                ${getIconHtml(mappedType)}
                <div class="notification-content" style="flex: 1; cursor: pointer;">
                    <h3 style="font-weight: ${isUnread ? '700' : '600'}; color: ${isUnread ? '#fff' : '#ccc'}">${item.tieuDe}</h3>
                    <p style="color: #999; margin: 4px 0 8px 0; font-size: 14px; line-height: 1.4;">${parseMarkdownLinks(item.noiDung)}</p>
                    <span class="notification-time" style="font-size: 12px; color: #666;">${formatTimeAgo(item.ngayTao)}</span>
                </div>
                ${isUnread ? `<div class="notification-badge" style="background-color: #ff5252; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; margin-right: 10px;">Mới</div>` : ''}
                <button class="delete-btn" style="background: none; border: none; color: #555; cursor: pointer; padding: 6px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s;" title="Xóa thông báo">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            `;

            // Hover effect cho delete button
            const deleteBtn = notificationCard.querySelector('.delete-btn');
            deleteBtn.addEventListener('mouseenter', () => deleteBtn.style.color = '#ff5252');
            deleteBtn.addEventListener('mouseleave', () => deleteBtn.style.color = '#555');

            // Event 1: Click vào nội dung để đọc
            notificationCard.querySelector('.notification-content').addEventListener('click', async () => {
                if (isUnread) {
                    try {
                        const response = await api.markNotificationAsRead(item.maThongBao);
                        if (response.success) {
                            item.daDoc = true;
                            renderNotifications();
                            updateGlobalBadge();
                        }
                    } catch (error) {
                        console.error('Không thể đánh dấu đã đọc:', error);
                    }
                }
            });

            // Event 2: Click vào nút xóa
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài thẻ card
                if (confirm('Bạn chắc chắn muốn xóa thông báo này?')) {
                    try {
                        const response = await api.deleteNotification(item.maThongBao);
                        if (response.success) {
                            notificationsList = notificationsList.filter(n => n.maThongBao !== item.maThongBao);
                            renderNotifications();
                            updateGlobalBadge();
                        }
                    } catch (error) {
                        console.error('Không thể xóa thông báo:', error);
                    }
                }
            });

            notificationsContainer.appendChild(notificationCard);
        });
    }

    // 6. Tải dữ liệu thông báo từ API
    async function loadNotifications() {
        try {
            notificationsContainer.innerHTML = `
                <div class="loading-state" style="text-align: center; padding: 40px; color: #999;">
                    <div class="spinner" style="border: 3px solid rgba(255,255,255,0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #fff; animation: spin 1s linear infinite; margin: 0 auto 15px auto;"></div>
                    <p>Đang tải thông báo...</p>
                </div>
                <style>
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                </style>
            `;

            const response = await api.getNotificationsByUserId(user.maNguoiDung);
            if (response.success) {
                notificationsList = response.data || [];
                renderNotifications();
            } else {
                notificationsContainer.innerHTML = `<p style="text-align:center;color:#ff5252;padding:20px;">Lỗi: ${response.message}</p>`;
            }
        } catch (error) {
            console.error('Không thể tải thông báo:', error);
            notificationsContainer.innerHTML = '<p style="text-align:center;color:#ff5252;padding:20px;">Lỗi kết nối máy chủ. Vui lòng thử lại sau.</p>';
        }
    }

    // 7. Cập nhật badge chưa đọc toàn cục (ví dụ trên header) nếu có
    async function updateGlobalBadge() {
        try {
            const response = await api.getUnreadNotificationsCount(user.maNguoiDung);
            if (response.success) {
                const count = response.data;
                // Nếu header có hiển thị số lượng thông báo chưa đọc, cập nhật tại đây
                const globalBadges = document.querySelectorAll('.unread-badge-count');
                globalBadges.forEach(badge => {
                    if (count > 0) {
                        badge.textContent = count;
                        badge.style.display = 'inline-block';
                    } else {
                        badge.style.display = 'none';
                    }
                });
            }
        } catch (error) {
            console.warn('Lỗi đếm số lượng chưa đọc:', error);
        }
    }

    // 8. Đăng ký sự kiện chuyển bộ lọc (Filter)
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderNotifications();
        });
    });

    // 9. Sự kiện đánh dấu tất cả đã đọc
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', async () => {
            const hasUnread = notificationsList.some(n => !n.daDoc);
            if (!hasUnread) return;

            try {
                const response = await api.markAllNotificationsAsRead(user.maNguoiDung);
                if (response.success) {
                    notificationsList.forEach(n => n.daDoc = true);
                    renderNotifications();
                    updateGlobalBadge();
                }
            } catch (error) {
                console.error('Lỗi đánh dấu tất cả đã đọc:', error);
            }
        });
    }

    // Khởi chạy
    loadNotifications();
    updateGlobalBadge();
});
