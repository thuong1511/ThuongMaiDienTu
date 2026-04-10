// Authentication Manager
const authManager = {
    // Lưu thông tin người dùng vào localStorage
    saveUser(userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    },

    // Lấy thông tin người dùng hiện tại
    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Kiểm tra đã đăng nhập chưa
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    // Kiểm tra có phải admin không
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.vaiTro === 'Admin';
    },

    // Đăng xuất
    logout() {
        localStorage.removeItem('currentUser');
        // Kiểm tra xem đang ở trang nào để redirect đúng
        const currentPath = window.location.pathname;
        if (currentPath.includes('/pages/')) {
            window.location.href = '../index.html';
        } else {
            window.location.href = 'index.html';
        }
    },

    // Đăng nhập
    async login(tenDangNhap, matKhau) {
        try {
            const response = await api.login(tenDangNhap, matKhau);
            
            if (response.success) {
                this.saveUser(response.data);
                
                // Chuyển hướng dựa trên vai trò
                if (response.data.vaiTro === 'Admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = '../index.html';
                }
                
                return { success: true, message: response.message };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    },

    // Đăng nhập bằng email
    async loginByEmail(email, matKhau) {
        try {
            const response = await api.login(email, matKhau);
            
            if (response.success) {
                this.saveUser(response.data);
                
                // Chuyển hướng dựa trên vai trò
                if (response.data.vaiTro === 'Admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = '../index.html';
                }
                
                return { success: true, message: response.message };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    },

    // Đăng ký
    async register(userData) {
        try {
            const response = await api.register(userData);
            
            if (response.success) {
                this.saveUser(response.data);
                window.location.href = '../index.html';
                return { success: true, message: response.message };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    },

    // Cập nhật thông tin người dùng
    updateUser(userData) {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            // Merge new data with existing data
            const updatedUser = { ...currentUser, ...userData };
            this.saveUser(updatedUser);
        }
    },

    // Cập nhật header UI
    updateHeaderUI() {
        const user = this.getCurrentUser();
        const userBtn = document.querySelector('.user-btn');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        
        if (!userBtn) return;
        
        // Kiểm tra xem đang ở thư mục nào để tạo đường dẫn đúng
        const currentPath = window.location.pathname;
        const isInPagesFolder = currentPath.includes('/pages/');
        const pathPrefix = isInPagesFolder ? '' : 'pages/';
        
        if (user) {
            // Đã đăng nhập - hiển thị icon người dùng trước, tên sau
            userBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span style="font-weight: 600;">${user.tenDangNhap}</span>
                <svg class="arrow-down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 8px;">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            `;
            userBtn.onclick = null; // Remove onclick để dropdown hoạt động
            
            // Cập nhật dropdown menu
            if (dropdownMenu) {
                dropdownMenu.innerHTML = `
                    <div class="dropdown-item user-info">
                        <small>${user.email}</small>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a href="${pathPrefix}profile.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>Hồ sơ cá nhân</span>
                    </a>
                    <a href="${pathPrefix}order-history.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span>Đơn hàng của tôi</span>
                    </a>
                    <a href="${pathPrefix}wallet.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                            <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                        <span>Ví của tôi</span>
                    </a>
                    <a href="${pathPrefix}notifications.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <span>Thông báo</span>
                    </a>
                    ${user.vaiTro === 'Admin' ? `
                    <a href="${pathPrefix}admin-dashboard.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <span>Quản trị</span>
                    </a>
                    ` : ''}
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-item logout" onclick="authManager.logout()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Đăng xuất</span>
                    </div>
                `;
            }
        } else {
            // Chưa đăng nhập - hiển thị icon người dùng và mũi tên
            userBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <svg class="arrow-down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 8px;">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            `;
            userBtn.onclick = null; // Remove onclick để dropdown hoạt động
            
            // Hiển thị dropdown menu với Đăng nhập và Đăng ký
            if (dropdownMenu) {
                dropdownMenu.innerHTML = `
                    <a href="${pathPrefix}login.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                        <span>Đăng nhập</span>
                    </a>
                    <a href="${pathPrefix}signup.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                        <span>Đăng ký</span>
                    </a>
                `;
            }
        }
    }
};

// Export
window.authManager = authManager;
window.AuthManager = authManager; // Alias for compatibility

// Tự động cập nhật UI khi trang load
document.addEventListener('DOMContentLoaded', () => {
    authManager.updateHeaderUI();
});
